import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
import * as crypto from 'crypto';
import { SlideComponentWithMetadata } from '@framework/slides/SlideMetadata';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Types ──────────────────────────────────────────────────────────

interface VerifyConfig {
  whisperUrl: string;
  audioDir: string;         // public/audio
  demoFilter: string;       // required: which demo to verify
  segmentFilter?: string[]; // optional: verify only these segments
  force: boolean;           // skip cache checks
  batchSize: number;
  cacheFile: string;        // .tts-verification-cache.json
}

interface VerificationCache {
  [demoId: string]: {
    [filepath: string]: {
      audioHash: string;
      narrationText: string;
      transcribedText: string;
      verifiedAt: string;
    };
  };
}

interface VerificationReportSegment {
  chapter: number;
  slide: number;
  segmentId: string;
  filepath: string;
  original: string;
  transcribed: string;
}

interface VerificationReport {
  demoId: string;
  verifiedAt: string;
  segments: VerificationReportSegment[];
}

// Narration JSON structure (same as generate-tts.ts)
interface NarrationSegment {
  id: string;
  narrationText: string;
  instruct?: string;
}

interface NarrationSlide {
  chapter: number;
  slide: number;
  title: string;
  segments: NarrationSegment[];
  instruct?: string;
}

interface NarrationData {
  demoId: string;
  version: string;
  lastModified: string;
  slides: NarrationSlide[];
  instruct?: string;
}

interface SegmentToVerify {
  chapter: number;
  slide: number;
  segmentIndex: number;
  segmentId: string;
  narrationText: string;
  filepath: string;       // relative to demo audio dir, e.g. "c1/s2_segment_01_intro.wav"
  fullPath: string;       // absolute path to WAV file
}

// ── Helpers (reused patterns from generate-tts.ts) ─────────────────

function buildSegmentKey(chapter: number, slide: number, segmentId: string): string {
  return `ch${chapter}:s${slide}:${segmentId}`;
}

function parseSegmentFilter(raw: string): string[] {
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

function loadCache(cacheFile: string): VerificationCache {
  if (fs.existsSync(cacheFile)) {
    try {
      const content = fs.readFileSync(cacheFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }
  return {};
}

function saveCache(cacheFile: string, cache: VerificationCache) {
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
}

async function loadDemoSlides(demoId: string): Promise<SlideComponentWithMetadata[]> {
  try {
    const slidesRegistryPath = `../src/demos/${demoId}/slides/SlidesRegistry.js`;
    const module = await import(slidesRegistryPath);
    return module.allSlides || [];
  } catch (error: any) {
    console.warn(`\u26a0\ufe0f  Could not load slides for demo '${demoId}': ${error.message}`);
    return [];
  }
}

function loadNarrationJson(demoId: string): NarrationData | null {
  const narrationFile = path.join(__dirname, `../public/narration/${demoId}/narration.json`);
  if (!fs.existsSync(narrationFile)) return null;
  try {
    const content = fs.readFileSync(narrationFile, 'utf-8');
    const data = JSON.parse(content) as NarrationData;
    if (!data.demoId || !Array.isArray(data.slides)) return null;
    return data;
  } catch {
    return null;
  }
}

function getNarrationText(
  narrationData: NarrationData | null,
  chapter: number,
  slide: number,
  segmentId: string
): string | null {
  if (!narrationData) return null;
  const slideData = narrationData.slides.find(s => s.chapter === chapter && s.slide === slide);
  if (!slideData) return null;
  const segment = slideData.segments.find(seg => seg.id === segmentId);
  return segment?.narrationText ?? null;
}

function hashFile(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen - 3) + '...';
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Load whisper server URL from server_config.json
function loadWhisperUrl(): string {
  const configPath = path.join(__dirname, '../../tts/server_config.json');
  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(configData);
      if (config.whisper_url) {
        return config.whisper_url;
      }
    }
  } catch (error: any) {
    console.warn(`Warning: Could not load server config: ${error.message}`);
  }
  return 'http://localhost:5001';
}

// ── Main ───────────────────────────────────────────────────────────

async function verifyTTS(config: VerifyConfig) {
  console.log('\ud83d\udd0d  Starting TTS Verification via Whisper...\n');

  // Health check
  console.log(`Connecting to Whisper server at ${config.whisperUrl}...`);
  try {
    const healthResponse = await axios.get(`${config.whisperUrl}/health`, { timeout: 5000 });
    const health = healthResponse.data;
    console.log(`\u2705 Server is healthy`);
    console.log(`   Engine: ${health.engine}`);
    console.log(`   Model: ${health.model_size}`);
    console.log(`   GPU: ${health.gpu_name || 'Unknown'}\n`);
  } catch (error: any) {
    console.error(`\u274c Cannot connect to WhisperX server at ${config.whisperUrl}`);
    console.error(`   Please ensure the WhisperX server is running:`);
    console.error(`   cd tts && python server_whisperx.py --model large-v3 --port 5001\n`);
    return;
  }

  // Load demo slides
  console.log(`\ud83d\udce5 Loading demo '${config.demoFilter}'...`);
  const allSlides = await loadDemoSlides(config.demoFilter);
  if (allSlides.length === 0) {
    console.error(`\u274c No slides found for demo '${config.demoFilter}'\n`);
    return;
  }
  console.log(`   Found ${allSlides.length} slides`);

  // Load and merge narration JSON
  const narrationData = loadNarrationJson(config.demoFilter);
  if (narrationData) {
    console.log(`   Loaded external narration (version ${narrationData.version})`);
    for (const slide of allSlides) {
      for (const segment of slide.metadata.audioSegments) {
        const jsonText = getNarrationText(
          narrationData,
          slide.metadata.chapter,
          slide.metadata.slide,
          segment.id
        );
        if (jsonText) {
          segment.narrationText = jsonText;
        }
      }
    }
  }
  console.log();

  // Load verification cache
  const cache = loadCache(config.cacheFile);
  if (!cache[config.demoFilter]) {
    cache[config.demoFilter] = {};
  }
  const demoCache = cache[config.demoFilter];

  // Collect segments to verify
  const segmentsToVerify: SegmentToVerify[] = [];
  let skippedCount = 0;
  let missingAudioCount = 0;
  const demoAudioDir = path.join(config.audioDir, config.demoFilter);

  for (const slide of allSlides) {
    const { chapter, slide: slideNum, audioSegments } = slide.metadata;
    if (!audioSegments || audioSegments.length === 0) continue;

    for (let i = 0; i < audioSegments.length; i++) {
      const segment = audioSegments[i];
      if (!segment.narrationText) continue;

      // Segment filter
      const segmentKey = buildSegmentKey(chapter, slideNum, segment.id);
      if (config.segmentFilter && !config.segmentFilter.includes(segmentKey)) {
        continue;
      }

      // Build file paths
      const filename = `s${slideNum}_segment_${String(i + 1).padStart(2, '0')}_${segment.id}.wav`;
      const filepath = `c${chapter}/${filename}`;
      const fullPath = path.join(demoAudioDir, filepath);

      // Check audio file exists
      if (!fs.existsSync(fullPath)) {
        console.warn(`\u26a0\ufe0f  Missing audio: ${filepath}`);
        missingAudioCount++;
        continue;
      }

      // Check cache (skip if audio hash unchanged, unless --force)
      if (!config.force) {
        const audioHash = hashFile(fullPath);
        const cached = demoCache[filepath];
        if (cached && cached.audioHash === audioHash) {
          skippedCount++;
          continue;
        }
      }

      segmentsToVerify.push({
        chapter,
        slide: slideNum,
        segmentIndex: i,
        segmentId: segment.id,
        narrationText: segment.narrationText,
        filepath,
        fullPath,
      });
    }
  }

  if (missingAudioCount > 0) {
    console.log(`\u26a0\ufe0f  ${missingAudioCount} segments missing audio files\n`);
  }

  console.log(`Found ${segmentsToVerify.length} segments to verify (${skippedCount} cached)\n`);

  if (segmentsToVerify.length === 0 && skippedCount > 0) {
    console.log('\u2705 All segments already verified (use --force to re-verify)\n');

    // Still build report from cache
    buildReportFromCache(config.demoFilter, cache, allSlides, config.segmentFilter);
    return;
  }

  if (segmentsToVerify.length === 0) {
    console.log('\u2705 No segments to verify.\n');
    return;
  }

  // Process in batches
  const batches = chunkArray(segmentsToVerify, config.batchSize);
  console.log(`Processing ${batches.length} batch(es) (${config.batchSize} segments per batch)...\n`);

  const results: VerificationReportSegment[] = [];
  let processedCount = 0;

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    console.log(`\ud83d\udce6 Batch ${batchIdx + 1}/${batches.length} (${batch.length} segments)`);

    // Read and base64-encode audio files
    const audios: string[] = [];
    for (const seg of batch) {
      const audioBytes = fs.readFileSync(seg.fullPath);
      audios.push(audioBytes.toString('base64'));
    }

    try {
      const response = await axios.post(`${config.whisperUrl}/transcribe_batch`, {
        audios,
        language: 'en',
      }, {
        timeout: 600000, // 10 minute timeout for batch
      });

      if (response.data.success) {
        const transcriptions = response.data.transcriptions;

        for (let i = 0; i < batch.length; i++) {
          const seg = batch[i];
          const transcribed = transcriptions[i].text;

          results.push({
            chapter: seg.chapter,
            slide: seg.slide,
            segmentId: seg.segmentId,
            filepath: seg.filepath,
            original: seg.narrationText,
            transcribed,
          });

          // Update cache
          const audioHash = hashFile(seg.fullPath);
          demoCache[seg.filepath] = {
            audioHash,
            narrationText: seg.narrationText,
            transcribedText: transcribed,
            verifiedAt: new Date().toISOString(),
          };

          processedCount++;
        }

        console.log(`   \u2705 Transcribed ${batch.length} segments`);
      } else {
        console.error(`   \u274c Server error: ${response.data.error || 'Unknown'}`);
      }
    } catch (error: any) {
      console.error(`   \u274c Error: ${error.message}`);
    }

    const pct = (((batchIdx + 1) / batches.length) * 100).toFixed(1);
    console.log(`   Progress: ${processedCount}/${segmentsToVerify.length} (${pct}%)\n`);
  }

  // Include cached results in the report
  for (const slide of allSlides) {
    const { chapter, slide: slideNum, audioSegments } = slide.metadata;
    if (!audioSegments) continue;

    for (let i = 0; i < audioSegments.length; i++) {
      const segment = audioSegments[i];
      if (!segment.narrationText) continue;

      const segmentKey = buildSegmentKey(chapter, slideNum, segment.id);
      if (config.segmentFilter && !config.segmentFilter.includes(segmentKey)) {
        continue;
      }

      const filename = `s${slideNum}_segment_${String(i + 1).padStart(2, '0')}_${segment.id}.wav`;
      const filepath = `c${chapter}/${filename}`;

      // Skip if already in results (just verified)
      if (results.some(r => r.filepath === filepath)) continue;

      // Include from cache
      const cached = demoCache[filepath];
      if (cached?.transcribedText) {
        results.push({
          chapter,
          slide: slideNum,
          segmentId: segment.id,
          filepath,
          original: cached.narrationText,
          transcribed: cached.transcribedText,
        });
      }
    }
  }

  // Sort results by chapter, slide, segment
  results.sort((a, b) =>
    a.chapter - b.chapter || a.slide - b.slide || a.segmentId.localeCompare(b.segmentId)
  );

  // Save report
  const report: VerificationReport = {
    demoId: config.demoFilter,
    verifiedAt: new Date().toISOString(),
    segments: results,
  };

  const reportPath = path.join(__dirname, `../verification-report-${config.demoFilter}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\ud83d\udcbe Report saved: ${path.relative(path.join(__dirname, '..'), reportPath)}`);

  // Save cache
  saveCache(config.cacheFile, cache);
  console.log(`\ud83d\udcbe Verification cache updated\n`);

  // Print summary table
  printSummaryTable(results);
}

function buildReportFromCache(
  demoId: string,
  cache: VerificationCache,
  allSlides: SlideComponentWithMetadata[],
  segmentFilter?: string[]
) {
  const demoCache = cache[demoId] || {};
  const results: VerificationReportSegment[] = [];

  for (const slide of allSlides) {
    const { chapter, slide: slideNum, audioSegments } = slide.metadata;
    if (!audioSegments) continue;

    for (let i = 0; i < audioSegments.length; i++) {
      const segment = audioSegments[i];
      if (!segment.narrationText) continue;

      const segmentKey = buildSegmentKey(chapter, slideNum, segment.id);
      if (segmentFilter && !segmentFilter.includes(segmentKey)) continue;

      const filename = `s${slideNum}_segment_${String(i + 1).padStart(2, '0')}_${segment.id}.wav`;
      const filepath = `c${chapter}/${filename}`;

      const cached = demoCache[filepath];
      if (cached?.transcribedText) {
        results.push({
          chapter,
          slide: slideNum,
          segmentId: segment.id,
          filepath,
          original: cached.narrationText,
          transcribed: cached.transcribedText,
        });
      }
    }
  }

  results.sort((a, b) =>
    a.chapter - b.chapter || a.slide - b.slide || a.segmentId.localeCompare(b.segmentId)
  );

  const report: VerificationReport = {
    demoId,
    verifiedAt: new Date().toISOString(),
    segments: results,
  };

  const reportPath = path.join(__dirname, `../verification-report-${demoId}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\ud83d\udcbe Report saved: ${path.relative(path.join(__dirname, '..'), reportPath)}`);

  printSummaryTable(results);
}

function printSummaryTable(results: VerificationReportSegment[]) {
  console.log('\n' + '\u2550'.repeat(100));
  console.log('\ud83d\udcca Verification Summary');
  console.log('\u2550'.repeat(100));

  // Header
  const keyCol = 18;
  const textCol = 38;
  console.log(
    'Segment'.padEnd(keyCol) +
    'Original'.padEnd(textCol) +
    'Transcribed'.padEnd(textCol)
  );
  console.log('\u2500'.repeat(keyCol) + '\u2500'.repeat(textCol) + '\u2500'.repeat(textCol));

  for (const seg of results) {
    const key = `ch${seg.chapter}:s${seg.slide}:${seg.segmentId}`;
    const orig = truncate(seg.original, textCol - 2);
    const trans = truncate(seg.transcribed, textCol - 2);

    console.log(
      key.padEnd(keyCol) +
      orig.padEnd(textCol) +
      trans.padEnd(textCol)
    );
  }

  console.log('\u2550'.repeat(100));
  console.log(`Total segments: ${results.length}\n`);
}

// ── CLI ────────────────────────────────────────────────────────────

function parseCLIArgs(): { demoFilter?: string; segmentFilter?: string[]; force: boolean } {
  const args = process.argv.slice(2);
  const result: { demoFilter?: string; segmentFilter?: string[]; force: boolean } = {
    force: args.includes('--force'),
  };

  const demoIndex = args.indexOf('--demo');
  if (demoIndex !== -1 && args[demoIndex + 1]) {
    result.demoFilter = args[demoIndex + 1];
  }

  const segmentsIndex = args.indexOf('--segments');
  if (segmentsIndex !== -1 && args[segmentsIndex + 1]) {
    if (!result.demoFilter) {
      console.error('\u274c --segments requires --demo to be specified');
      process.exit(1);
    }
    result.segmentFilter = parseSegmentFilter(args[segmentsIndex + 1]);
  }

  return result;
}

const cliArgs = parseCLIArgs();

if (!cliArgs.demoFilter) {
  console.error('\u274c --demo is required');
  console.error('Usage: npm run tts:verify -- --demo {id} [--segments ch1:s2:intro,...] [--force]');
  process.exit(1);
}

const config: VerifyConfig = {
  whisperUrl: process.env.WHISPER_URL || loadWhisperUrl(),
  audioDir: path.join(__dirname, '../public/audio'),
  demoFilter: cliArgs.demoFilter,
  segmentFilter: cliArgs.segmentFilter,
  force: cliArgs.force,
  batchSize: parseInt(process.env.BATCH_SIZE || '10', 10),
  cacheFile: path.join(__dirname, '../.tts-verification-cache.json'),
};

verifyTTS(config).catch(console.error);
