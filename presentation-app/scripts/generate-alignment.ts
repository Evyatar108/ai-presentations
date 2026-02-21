/**
 * Alignment Generation Script
 *
 * Sends audio + reference text to WhisperX for forced alignment,
 * resolves {#markers} to word-level timestamps, and writes alignment.json.
 *
 * Usage:
 *   npm run tts:align -- --demo {id} [--segments ch1:s1:pipeline] [--force]
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
import * as crypto from 'crypto';
import { SlideComponentWithMetadata } from '@framework/slides/SlideMetadata';
import { parseMarkers, stripMarkers } from './utils/marker-parser';
import type { AlignedWord, ResolvedMarker, SegmentAlignment, DemoAlignment } from '../src/framework/alignment/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Types ──────────────────────────────────────────────────────────

interface AlignConfig {
  whisperUrl: string;
  audioDir: string;
  demoFilter: string;
  segmentFilter?: string[];
  force: boolean;
  batchSize: number;
}

// Narration JSON structure
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

interface SegmentToAlign {
  chapter: number;
  slide: number;
  segmentIndex: number;
  segmentId: string;
  narrationText: string;     // original text with markers
  cleanText: string;         // stripped text for alignment
  markers: ReturnType<typeof parseMarkers>['markers'];
  filepath: string;          // relative to demo audio dir
  fullPath: string;          // absolute
  audioHash: string;
}

// ── Helpers ────────────────────────────────────────────────────────

function buildSegmentKey(chapter: number, slide: number, segmentId: string): string {
  return `ch${chapter}:s${slide}:${segmentId}`;
}

function parseSegmentFilter(raw: string): string[] {
  return raw.split(',').map(s => s.trim()).filter(Boolean);
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

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function loadWhisperUrl(): string {
  const configPath = path.join(__dirname, '../../tts/server_config.json');
  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(configData);
      if (config.whisper_url) return config.whisper_url;
    }
  } catch (error: any) {
    console.warn(`Warning: Could not load server config: ${error.message}`);
  }
  return 'http://localhost:5001';
}

function buildSlideKey(chapter: number, slide: number): string {
  return `c${chapter}_s${slide}`;
}

/**
 * Resolve marker timestamps from word-level alignment data.
 * Forward markers ({#id}) → start time of the word at wordIndex
 * Backward markers ({id#}) → end time of the word at wordIndex
 */
function resolveMarkers(
  markers: ReturnType<typeof parseMarkers>['markers'],
  words: AlignedWord[]
): ResolvedMarker[] {
  const resolved: ResolvedMarker[] = [];

  for (const marker of markers) {
    if (marker.wordIndex < 0 || marker.wordIndex >= words.length) {
      console.warn(`\u26a0\ufe0f  Marker "${marker.id}" has out-of-bounds wordIndex ${marker.wordIndex} (${words.length} words). Skipping.`);
      continue;
    }

    const word = words[marker.wordIndex];
    const time = marker.anchor === 'start' ? word.start : word.end;

    resolved.push({
      id: marker.id,
      time,
      anchor: marker.anchor,
      wordIndex: marker.wordIndex,
    });
  }

  return resolved;
}

// ── Main ───────────────────────────────────────────────────────────

async function generateAlignment(config: AlignConfig) {
  console.log('\ud83d\udd17  Starting Alignment Generation via WhisperX...\n');

  // Health check
  console.log(`Connecting to WhisperX server at ${config.whisperUrl}...`);
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

  // Load existing alignment data (for cache checking)
  const alignmentPath = path.join(config.audioDir, config.demoFilter, 'alignment.json');
  let existingAlignment: DemoAlignment | null = null;
  if (fs.existsSync(alignmentPath) && !config.force) {
    try {
      existingAlignment = JSON.parse(fs.readFileSync(alignmentPath, 'utf-8'));
    } catch {
      existingAlignment = null;
    }
  }

  // Collect segments to align
  const segmentsToAlign: SegmentToAlign[] = [];
  let skippedCount = 0;
  let missingAudioCount = 0;
  const demoAudioDir = path.join(config.audioDir, config.demoFilter);

  // Also build the full alignment structure (preserving cached data)
  const alignment: DemoAlignment = {
    demoId: config.demoFilter,
    generatedAt: new Date().toISOString(),
    slides: {},
  };

  for (const slide of allSlides) {
    const { chapter, slide: slideNum, audioSegments } = slide.metadata;
    if (!audioSegments || audioSegments.length === 0) continue;

    const slideKey = buildSlideKey(chapter, slideNum);

    // Initialize slide entry
    if (!alignment.slides[slideKey]) {
      alignment.slides[slideKey] = {
        chapter,
        slide: slideNum,
        segments: [],
      };
    }

    for (let i = 0; i < audioSegments.length; i++) {
      const segment = audioSegments[i];
      if (!segment.narrationText) continue;

      // Segment filter
      const segKey = buildSegmentKey(chapter, slideNum, segment.id);
      if (config.segmentFilter && !config.segmentFilter.includes(segKey)) {
        // Still preserve existing alignment for this segment if available
        const existingSlide = existingAlignment?.slides[slideKey];
        const existingSeg = existingSlide?.segments.find(s => s.segmentId === segment.id);
        if (existingSeg) {
          alignment.slides[slideKey].segments.push(existingSeg);
        }
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

      const audioHash = hashFile(fullPath);

      // Parse markers from narration text
      const { cleanText, markers } = parseMarkers(segment.narrationText);

      // Check cache: skip if audio hash unchanged and alignment exists
      if (!config.force) {
        const existingSlide = existingAlignment?.slides[slideKey];
        const existingSeg = existingSlide?.segments.find(s => s.segmentId === segment.id);
        if (existingSeg && existingSeg.audioHash === audioHash) {
          alignment.slides[slideKey].segments.push(existingSeg);
          skippedCount++;
          continue;
        }
      }

      segmentsToAlign.push({
        chapter,
        slide: slideNum,
        segmentIndex: i,
        segmentId: segment.id,
        narrationText: segment.narrationText,
        cleanText,
        markers,
        filepath,
        fullPath,
        audioHash,
      });
    }
  }

  if (missingAudioCount > 0) {
    console.log(`\u26a0\ufe0f  ${missingAudioCount} segments missing audio files\n`);
  }

  console.log(`Found ${segmentsToAlign.length} segments to align (${skippedCount} cached)\n`);

  if (segmentsToAlign.length === 0 && skippedCount > 0) {
    // Write alignment file (preserves cached data)
    fs.writeFileSync(alignmentPath, JSON.stringify(alignment, null, 2));
    console.log(`\u2705 All segments already aligned (use --force to re-align)\n`);
    console.log(`\ud83d\udcbe Alignment saved: ${path.relative(path.join(__dirname, '..'), alignmentPath)}`);
    return;
  }

  if (segmentsToAlign.length === 0) {
    console.log('\u2705 No segments to align.\n');
    return;
  }

  // Process in batches
  const batches = chunkArray(segmentsToAlign, config.batchSize);
  console.log(`Processing ${batches.length} batch(es) (${config.batchSize} segments per batch)...\n`);

  let processedCount = 0;
  let errorCount = 0;

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    console.log(`\ud83d\udce6 Batch ${batchIdx + 1}/${batches.length} (${batch.length} segments)`);

    // Prepare batch items
    const items = batch.map(seg => ({
      audio: fs.readFileSync(seg.fullPath).toString('base64'),
      text: seg.cleanText,
    }));

    try {
      const response = await axios.post(`${config.whisperUrl}/align_batch`, {
        items,
        language: 'en',
      }, {
        timeout: 600000,
      });

      if (response.data.success) {
        const alignments = response.data.alignments;

        for (let i = 0; i < batch.length; i++) {
          const seg = batch[i];
          const alignResult = alignments[i];

          if (alignResult.error) {
            console.error(`   \u274c Error for ${seg.segmentId}: ${alignResult.error}`);
            errorCount++;
            continue;
          }

          const words: AlignedWord[] = alignResult.words;

          // Resolve markers to timestamps
          const resolvedMarkers = resolveMarkers(seg.markers, words);

          // Build segment alignment
          const segAlignment: SegmentAlignment = {
            segmentId: seg.segmentId,
            audioHash: seg.audioHash,
            words,
            markers: resolvedMarkers,
          };

          // Add to alignment data
          const slideKey = buildSlideKey(seg.chapter, seg.slide);
          if (!alignment.slides[slideKey]) {
            alignment.slides[slideKey] = {
              chapter: seg.chapter,
              slide: seg.slide,
              segments: [],
            };
          }
          alignment.slides[slideKey].segments.push(segAlignment);

          processedCount++;

          // Log marker resolution
          if (resolvedMarkers.length > 0) {
            console.log(`   \u2705 ${seg.segmentId}: ${words.length} words, ${resolvedMarkers.length} markers`);
            for (const m of resolvedMarkers) {
              console.log(`      {${m.anchor === 'start' ? '#' : ''}${m.id}${m.anchor === 'end' ? '#' : ''}} → ${m.time.toFixed(3)}s (word[${m.wordIndex}])`);
            }
          } else {
            console.log(`   \u2705 ${seg.segmentId}: ${words.length} words (no markers)`);
          }
        }
      } else {
        console.error(`   \u274c Server error: ${response.data.error || 'Unknown'}`);
        errorCount += batch.length;
      }
    } catch (error: any) {
      console.error(`   \u274c Error: ${error.message}`);
      errorCount += batch.length;
    }

    const pct = (((batchIdx + 1) / batches.length) * 100).toFixed(1);
    console.log(`   Progress: ${processedCount}/${segmentsToAlign.length} (${pct}%)\n`);
  }

  // Write alignment file
  const alignDir = path.dirname(alignmentPath);
  fs.mkdirSync(alignDir, { recursive: true });
  fs.writeFileSync(alignmentPath, JSON.stringify(alignment, null, 2));

  console.log('\n' + '\u2550'.repeat(60));
  console.log('\ud83d\udcca Alignment Summary');
  console.log('\u2550'.repeat(60));
  console.log(`Segments aligned: ${processedCount}`);
  console.log(`Segments cached: ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`\ud83d\udcbe Alignment saved: ${path.relative(path.join(__dirname, '..'), alignmentPath)}`);
  console.log('\u2550'.repeat(60) + '\n');
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
  console.error('Usage: npm run tts:align -- --demo {id} [--segments ch1:s1:intro,...] [--force]');
  process.exit(1);
}

const config: AlignConfig = {
  whisperUrl: process.env.WHISPER_URL || loadWhisperUrl(),
  audioDir: path.join(__dirname, '../public/audio'),
  demoFilter: cliArgs.demoFilter,
  segmentFilter: cliArgs.segmentFilter,
  force: cliArgs.force,
  batchSize: parseInt(process.env.BATCH_SIZE || '10', 10),
};

generateAlignment(config).catch(console.error);
