import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
import * as crypto from 'crypto';
import { AudioSegment, SlideComponentWithMetadata } from '@framework/slides/SlideMetadata';
import { runDurationCalculation } from './calculate-durations';
import { stripMarkers } from './utils/marker-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
interface TTSConfig {
  serverUrl: string;          // Python TTS server URL
  outputDir: string;          // public/audio
  skipExisting: boolean;      // Skip files that already exist
  batchSize: number;          // Number of segments per batch request
  cacheFile: string;          // Path to narration cache file
  demoFilter?: string;        // Optional: generate only for specific demo
  segmentFilter?: string[];   // Optional: regenerate only these segments (e.g. ["ch1:s2:intro", "ch3:s1:summary"])
  fromJson?: boolean;         // NEW: Use JSON exclusively
  instruct?: string;          // CLI-level default instruct (lowest priority)
}

interface NarrationCache {
  [demoId: string]: {
    [filepath: string]: {
      narrationText: string;
      instruct?: string;
      generatedAt: string;
    };
  };
}

// Narration JSON structure (from narrationLoader.ts)
interface NarrationSegment {
  id: string;
  narrationText: string;
  visualDescription?: string;
  notes?: string;
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

interface SegmentToGenerate {
  demoId: string;
  chapter: number;
  slide: number;
  segmentIndex: number;
  segment: AudioSegment;
  filename: string;
  filepath: string;
  /** Resolved instruct for this segment (segment → slide → narrationJSON → CLI) */
  instruct?: string;
}

function buildSegmentKey(chapter: number, slide: number, segmentId: string): string {
  return `ch${chapter}:s${slide}:${segmentId}`;
}

function parseSegmentFilter(raw: string): string[] {
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

// Get all demo IDs by scanning the demos directory
async function getAllDemoIds(): Promise<string[]> {
  const demosDir = path.join(__dirname, '../src/demos');
  const entries = fs.readdirSync(demosDir, { withFileTypes: true });
  
  return entries
    .filter(entry => entry.isDirectory() && entry.name !== 'types.ts')
    .map(entry => entry.name)
    .filter(name => {
      // Verify it has an index.ts file
      const indexPath = path.join(demosDir, name, 'index.ts');
      return fs.existsSync(indexPath);
    });
}

// Load slides for a specific demo
async function loadDemoSlides(demoId: string): Promise<SlideComponentWithMetadata[]> {
  try {
    const slidesRegistryPath = `../src/demos/${demoId}/slides/SlidesRegistry.js`;
    const module = await import(slidesRegistryPath);
    return module.allSlides || [];
  } catch (error: any) {
    console.warn(`⚠️  Could not load slides for demo '${demoId}': ${error.message}`);
    return [];
  }
}

// Load narration JSON for a demo
function loadNarrationJson(demoId: string): NarrationData | null {
  const narrationFile = path.join(__dirname, `../public/narration/${demoId}/narration.json`);
  
  if (!fs.existsSync(narrationFile)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(narrationFile, 'utf-8');
    const data = JSON.parse(content) as NarrationData;
    
    // Validate basic structure
    if (!data.demoId || !data.version || !Array.isArray(data.slides)) {
      console.warn(`⚠️  Invalid narration.json structure for '${demoId}'`);
      return null;
    }
    
    return data;
  } catch (error: any) {
    console.warn(`⚠️  Failed to parse narration.json for '${demoId}': ${error.message}`);
    return null;
  }
}

// Get narration text from JSON data
function getNarrationText(
  narrationData: NarrationData | null,
  chapter: number,
  slide: number,
  segmentId: string
): string | null {
  if (!narrationData) {
    return null;
  }
  
  const slideData = narrationData.slides.find(
    s => s.chapter === chapter && s.slide === slide
  );
  
  if (!slideData) {
    return null;
  }
  
  const segment = slideData.segments.find(seg => seg.id === segmentId);
  return segment?.narrationText ?? null;
}

// Get resolved instruct from narration JSON (segment → slide → data-level)
function getNarrationInstruct(
  narrationData: NarrationData | null,
  chapter: number,
  slide: number,
  segmentId: string
): string | undefined {
  if (!narrationData) {
    return undefined;
  }

  const slideData = narrationData.slides.find(
    s => s.chapter === chapter && s.slide === slide
  );

  if (slideData) {
    const segment = slideData.segments.find(seg => seg.id === segmentId);
    if (segment?.instruct) {
      return segment.instruct;
    }
    if (slideData.instruct) {
      return slideData.instruct;
    }
  }

  return narrationData.instruct;
}

// Update narration cache after successful TTS generation
function updateNarrationCache(
  demoId: string,
  slides: SlideComponentWithMetadata[]
): void {
  const cacheFile = path.join(__dirname, `../public/narration/${demoId}/narration-cache.json`);
  const cacheDir = path.dirname(cacheFile);
  
  // Ensure directory exists
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  
  let cache = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    segments: {} as Record<string, { hash: string; lastChecked: string }>
  };
  
  // Load existing cache if present
  if (fs.existsSync(cacheFile)) {
    try {
      const content = fs.readFileSync(cacheFile, 'utf-8');
      cache = JSON.parse(content);
    } catch (error) {
      console.warn(`⚠️  Could not parse existing narration cache, creating new one`);
    }
  }
  
  // Update with new hashes from slides (include instruct in hash)
  // Strip markers before hashing — markers don't affect TTS audio
  for (const slide of slides) {
    for (const segment of slide.metadata.audioSegments) {
      if (!segment.narrationText) continue;

      const key = `ch${slide.metadata.chapter}:s${slide.metadata.slide}:${segment.id}`;
      const resolvedInstruct = segment.instruct ?? slide.metadata.instruct ?? '';
      const hash = crypto.createHash('sha256')
        .update(stripMarkers(segment.narrationText).trim() + '\0' + resolvedInstruct)
        .digest('hex');

      cache.segments[key] = {
        hash,
        lastChecked: new Date().toISOString()
      };
    }
  }
  
  cache.generatedAt = new Date().toISOString();
  
  // Write to file
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2), 'utf-8');
  console.log(`✅ Updated narration cache: ${path.relative(path.join(__dirname, '..'), cacheFile)}`);
}

// Load cache
function loadCache(cacheFile: string): NarrationCache {
  if (fs.existsSync(cacheFile)) {
    try {
      const content = fs.readFileSync(cacheFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return {};
    }
  }
  return {};
}

// Save cache
function saveCache(cacheFile: string, cache: NarrationCache) {
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
}

// Scan for orphaned audio files and cache entries for a specific demo
function cleanupUnusedAudio(
  demoId: string,
  outputDir: string,
  cache: NarrationCache,
  allSlides: SlideComponentWithMetadata[]
): {
  orphanedFiles: string[];
  orphanedCacheKeys: string[];
} {
  const result = {
    orphanedFiles: [] as string[],
    orphanedCacheKeys: [] as string[]
  };

  const demoOutputDir = path.join(outputDir, demoId);
  if (!fs.existsSync(demoOutputDir)) {
    return result;
  }

  // Build set of expected filepaths from all slides
  const expectedFiles = new Set<string>();
  for (const slide of allSlides) {
    const { chapter, slide: slideNum, audioSegments } = slide.metadata;
    if (!audioSegments || audioSegments.length === 0) continue;

    for (let i = 0; i < audioSegments.length; i++) {
      const segment = audioSegments[i];
      if (!segment.narrationText) continue;

      const filename = `s${slideNum}_segment_${String(i + 1).padStart(2, '0')}_${segment.id}.wav`;
      const chapterDir = path.join(demoOutputDir, `c${chapter}`);
      const filepath = path.join(chapterDir, filename);
      const relativeFilepath = path.relative(demoOutputDir, filepath);
      expectedFiles.add(relativeFilepath.replace(/\\/g, '/'));
    }
  }

  // Scan audio directories for actual files
  const chapterDirs = fs.readdirSync(demoOutputDir).filter(name =>
    name.startsWith('c') && fs.statSync(path.join(demoOutputDir, name)).isDirectory()
  );

  for (const chapterDir of chapterDirs) {
    const chapterPath = path.join(demoOutputDir, chapterDir);
    const files = fs.readdirSync(chapterPath);
    
    for (const file of files) {
      if (!file.endsWith('.wav')) continue;
      
      const filepath = path.join(chapterPath, file);
      const relativeFilepath = path.relative(demoOutputDir, filepath).replace(/\\/g, '/');
      
      if (!expectedFiles.has(relativeFilepath)) {
        result.orphanedFiles.push(relativeFilepath);
      }
    }
  }

  // Check cache for orphaned entries
  const demoCache = cache[demoId] || {};
  for (const cacheKey of Object.keys(demoCache)) {
    const normalizedKey = cacheKey.replace(/\\/g, '/');
    if (!expectedFiles.has(normalizedKey)) {
      result.orphanedCacheKeys.push(cacheKey);
    }
  }

  return result;
}

// Main function with batch processing
async function generateTTS(config: TTSConfig) {
  console.log('🎙️  Starting TTS Batch Generation (Multi-Demo Support)...\n');
  
  // Load cache
  const cache = loadCache(config.cacheFile);
  
  // Get demos to process
  const allDemoIds = await getAllDemoIds();
  const demosToProcess = config.demoFilter
    ? allDemoIds.filter(id => id === config.demoFilter)
    : allDemoIds;
  
  if (demosToProcess.length === 0) {
    if (config.demoFilter) {
      console.error(`❌ Demo '${config.demoFilter}' not found.`);
      console.log(`\nAvailable demos: ${allDemoIds.join(', ')}\n`);
    } else {
      console.error('❌ No demos found in src/demos/\n');
    }
    return;
  }
  
  console.log(`📦 Processing ${demosToProcess.length} demo(s): ${demosToProcess.join(', ')}\n`);
  
  // Check server health
  console.log(`Connecting to TTS server at ${config.serverUrl}...`);
  try {
    const healthResponse = await axios.get(`${config.serverUrl}/health`, { timeout: 5000 });
    const health = healthResponse.data;
    console.log(`✅ Server is healthy`);
    console.log(`   Model loaded: ${health.model_loaded}`);
    console.log(`   GPU: ${health.gpu_name || 'Unknown'}\n`);
  } catch (error: any) {
    console.error(`❌ Cannot connect to TTS server at ${config.serverUrl}`);
    console.error(`   Please ensure Python TTS server is running:`);
    console.error(`   cd tts && python server.py --voice-sample path/to/voice.wav\n`);
    return;
  }
  
  // Process each demo
  let totalGenerated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  let totalDeleted = 0;
  let totalRenamed = 0;
  
  for (const demoId of demosToProcess) {
    console.log('\n' + '═'.repeat(70));
    console.log(`📁 Demo: ${demoId}`);
    console.log('═'.repeat(70) + '\n');
    
    // NEW: Load narration from JSON
    console.log(`📥 Loading narration data...`);
    const narrationData = loadNarrationJson(demoId);
    
    if (narrationData) {
      console.log(`✅ Loaded external narration (version ${narrationData.version}, ${narrationData.slides.length} slides)`);
    } else if (config.fromJson) {
      console.error(`❌ --from-json specified but narration.json not found for '${demoId}'`);
      console.error(`   Expected: public/narration/${demoId}/narration.json\n`);
      continue;
    } else {
      console.log(`📝 No external narration found, using inline narration`);
    }
    console.log();
    
    // Load slides for this demo
    const allSlides = await loadDemoSlides(demoId);
    
    if (allSlides.length === 0) {
      console.log(`⚠️  No slides found for demo '${demoId}', skipping...\n`);
      continue;
    }
    
    console.log(`   Found ${allSlides.length} slides\n`);
    
    // NEW: Merge narration from JSON into slide metadata
    if (narrationData) {
      console.log('🔄 Merging JSON narration into slides...');
      let mergedCount = 0;
      let missingCount = 0;
      
      for (const slide of allSlides) {
        for (let i = 0; i < slide.metadata.audioSegments.length; i++) {
          const segment = slide.metadata.audioSegments[i];
          
          const jsonNarration = getNarrationText(
            narrationData,
            slide.metadata.chapter,
            slide.metadata.slide,
            segment.id
          );
          
          if (jsonNarration) {
            // Use JSON narration (overrides inline)
            segment.narrationText = jsonNarration;
            mergedCount++;
          }

          // Merge instruct from JSON (segment → slide → data-level)
          const jsonInstruct = getNarrationInstruct(
            narrationData,
            slide.metadata.chapter,
            slide.metadata.slide,
            segment.id
          );
          if (jsonInstruct) {
            segment.instruct = jsonInstruct;
          }

          if (!segment.narrationText && config.fromJson) {
            // Error if --from-json but missing in JSON
            console.error(
              `❌ Missing JSON narration for ch${slide.metadata.chapter}:s${slide.metadata.slide}:${segment.id}`
            );
            missingCount++;
          } else if (!segment.narrationText) {
            console.warn(
              `⚠️  No narration for ch${slide.metadata.chapter}:s${slide.metadata.slide}:${segment.id} (not in JSON or inline)`
            );
            missingCount++;
          }
        }
      }
      
      console.log(`   ✓ Merged ${mergedCount} segments from JSON`);
      if (missingCount > 0) {
        console.log(`   ⚠️  ${missingCount} segments missing narration`);
      }
      
      if (config.fromJson && missingCount > 0) {
        console.error(`\n❌ Cannot proceed with --from-json: ${missingCount} segments missing in JSON\n`);
        continue;
      }
      console.log();
    }
    
    // Ensure demo cache exists
    if (!cache[demoId]) {
      cache[demoId] = {};
    }
    
    // Step 1: Detect orphaned audio files (don't delete yet — we may rename them)
    // Skip orphan cleanup when targeting specific segments
    const cleanup = config.segmentFilter
      ? { orphanedFiles: [], orphanedCacheKeys: [] }
      : (() => {
          console.log('🔍 Scanning for unused audio files...\n');
          return cleanupUnusedAudio(demoId, config.outputDir, cache, allSlides);
        })();

    if (cleanup.orphanedFiles.length > 0) {
      console.log(`📁 Orphaned audio files: ${cleanup.orphanedFiles.length}`);
      cleanup.orphanedFiles.forEach(file => {
        console.log(`   - ${file}`);
      });
      console.log();
    }

    if (cleanup.orphanedCacheKeys.length > 0) {
      console.log(`🗑️  Orphaned cache entries: ${cleanup.orphanedCacheKeys.length}`);
      cleanup.orphanedCacheKeys.forEach(key => {
        console.log(`   - ${key}`);
      });
      console.log();
    }

    if (cleanup.orphanedFiles.length === 0 && cleanup.orphanedCacheKeys.length === 0) {
      console.log('✅ No unused audio files found\n');
    }

    // Step 2: Collect all segments that need generation
    const segmentsToGenerate: SegmentToGenerate[] = [];
    let totalSegments = 0;
    let skippedCount = 0;
    const matchedFilterKeys = new Set<string>();

    console.log('Scanning slides for segments to generate...\n');

    const demoOutputDir = path.join(config.outputDir, demoId);

    for (const slide of allSlides) {
      const { chapter, slide: slideNum, title, audioSegments } = slide.metadata;

      if (!audioSegments || audioSegments.length === 0) continue;

      // Create chapter directory
      const chapterDir = path.join(demoOutputDir, `c${chapter}`);
      fs.mkdirSync(chapterDir, { recursive: true });

      // Check each segment
      for (let i = 0; i < audioSegments.length; i++) {
        const segment = audioSegments[i];
        totalSegments++;

        // Skip if no narration text
        if (!segment.narrationText) {
          console.log(`⚠️  ${demoId} Ch${chapter}/S${slideNum} Segment ${i + 1}: No narration text`);
          skippedCount++;
          continue;
        }

        // If --segments filter is active, only process matching segments
        const segmentKey = buildSegmentKey(chapter, slideNum, segment.id);
        if (config.segmentFilter && !config.segmentFilter.includes(segmentKey)) {
          skippedCount++;
          continue;
        }

        // Generate filename
        const filename = `s${slideNum}_segment_${String(i + 1).padStart(2, '0')}_${segment.id}.wav`;
        const filepath = path.join(chapterDir, filename);
        const relativeFilepath = path.relative(demoOutputDir, filepath);

        // Resolve instruct: segment → slide → narrationJSON → CLI
        const resolvedInstruct =
          segment.instruct ??
          slide.metadata.instruct ??
          config.instruct;

        // Check if we should skip this segment (bypass cache when --segments targets it)
        let shouldSkip = false;

        if (!config.segmentFilter && config.skipExisting && fs.existsSync(filepath)) {
          // File exists - check if narration or instruct has changed
          const cachedEntry = cache[demoId][relativeFilepath];
          if (
            cachedEntry &&
            stripMarkers(cachedEntry.narrationText) === stripMarkers(segment.narrationText) &&
            (cachedEntry.instruct ?? undefined) === resolvedInstruct
          ) {
            // Narration and instruct haven't changed - skip
            shouldSkip = true;
            skippedCount++;
          }
          // If narration or instruct changed or not in cache, regenerate
        }

        if (shouldSkip) {
          continue;
        }

        // Track matched filter keys
        if (config.segmentFilter) {
          matchedFilterKeys.add(segmentKey);
        }

        // Add to generation queue
        segmentsToGenerate.push({
          demoId,
          chapter,
          slide: slideNum,
          segmentIndex: i,
          segment,
          filename,
          filepath,
          instruct: resolvedInstruct
        });
      }
    }

    // Report any --segments keys that didn't match a real segment
    if (config.segmentFilter) {
      const unmatched = config.segmentFilter.filter(key => !matchedFilterKeys.has(key));
      if (unmatched.length > 0) {
        console.log(`⚠️  No matching segments found for ${unmatched.length} filter(s):`);
        unmatched.forEach(key => console.log(`   - ${key}`));
        console.log();
      }
    }

    // Step 3: Smart rename — match orphans to missing segments by content hash
    let renamedCount = 0;
    if (cleanup.orphanedFiles.length > 0 && segmentsToGenerate.length > 0) {
      console.log('🔄 Checking for renameable orphans (same content, different slide number)...\n');

      // Build lookup: hash(narrationText + instruct) → orphan relative path
      const orphansByHash = new Map<string, { relativePath: string; cacheKey: string | undefined }>();
      for (const orphanRelPath of cleanup.orphanedFiles) {
        // Find matching cache entry for this orphan
        const normalizedPath = orphanRelPath.replace(/\\/g, '/');
        const cacheEntry = cache[demoId][normalizedPath] || cache[demoId][orphanRelPath];
        if (cacheEntry?.narrationText) {
          const hash = crypto.createHash('sha256')
            .update(stripMarkers(cacheEntry.narrationText).trim() + '\0' + (cacheEntry.instruct ?? ''))
            .digest('hex');
          // Only keep first match per hash (prefer the first orphan found)
          if (!orphansByHash.has(hash)) {
            orphansByHash.set(hash, {
              relativePath: normalizedPath,
              cacheKey: normalizedPath
            });
          }
        }
      }

      // Try to match each segment-to-generate against orphans
      const remainingSegments: SegmentToGenerate[] = [];
      const matchedOrphans = new Set<string>();

      for (const seg of segmentsToGenerate) {
        if (!seg.segment.narrationText) {
          remainingSegments.push(seg);
          continue;
        }

        const hash = crypto.createHash('sha256')
          .update(stripMarkers(seg.segment.narrationText).trim() + '\0' + (seg.instruct ?? ''))
          .digest('hex');

        const orphan = orphansByHash.get(hash);
        if (orphan && !matchedOrphans.has(orphan.relativePath) && !fs.existsSync(seg.filepath)) {
          // Match found — rename the file
          const oldFullPath = path.join(demoOutputDir, orphan.relativePath);
          try {
            // Ensure target directory exists
            fs.mkdirSync(path.dirname(seg.filepath), { recursive: true });
            fs.renameSync(oldFullPath, seg.filepath);

            const newRelativePath = path.relative(demoOutputDir, seg.filepath).replace(/\\/g, '/');

            // Update cache: copy entry under new key, remove old key
            if (orphan.cacheKey && cache[demoId][orphan.cacheKey]) {
              cache[demoId][newRelativePath] = {
                ...cache[demoId][orphan.cacheKey],
                generatedAt: new Date().toISOString()
              };
              delete cache[demoId][orphan.cacheKey];
            }

            console.log(`  🔄 Renamed: ${orphan.relativePath} → ${newRelativePath}`);
            matchedOrphans.add(orphan.relativePath);
            renamedCount++;

            // Remove from orphan lists so it won't be deleted later
            const orphanIdx = cleanup.orphanedFiles.indexOf(orphan.relativePath);
            if (orphanIdx !== -1) cleanup.orphanedFiles.splice(orphanIdx, 1);
            const cacheIdx = cleanup.orphanedCacheKeys.indexOf(orphan.cacheKey!);
            if (cacheIdx !== -1) cleanup.orphanedCacheKeys.splice(cacheIdx, 1);
          } catch (error: any) {
            console.error(`  ❌ Failed to rename ${orphan.relativePath}: ${error.message}`);
            remainingSegments.push(seg);
          }
        } else {
          remainingSegments.push(seg);
        }
      }

      // Replace generation queue with only unmatched segments
      segmentsToGenerate.length = 0;
      segmentsToGenerate.push(...remainingSegments);

      if (renamedCount > 0) {
        console.log(`\n  ✅ Renamed ${renamedCount} files (avoided regeneration)\n`);
        saveCache(config.cacheFile, cache);
      } else {
        console.log('  No renameable matches found\n');
      }
    }

    // Step 4: Delete remaining unmatched orphaned files and cache entries
    if (cleanup.orphanedFiles.length > 0 || cleanup.orphanedCacheKeys.length > 0) {
      for (const relativeFile of cleanup.orphanedFiles) {
        const fullPath = path.join(demoOutputDir, relativeFile);
        try {
          fs.unlinkSync(fullPath);
          console.log(`✅ Deleted: ${relativeFile}`);
        } catch (error: any) {
          console.error(`❌ Failed to delete ${relativeFile}: ${error.message}`);
        }
      }

      for (const key of cleanup.orphanedCacheKeys) {
        delete cache[demoId][key];
      }

      if (cleanup.orphanedFiles.length > 0 || cleanup.orphanedCacheKeys.length > 0) {
        console.log(`\n💾 Cleaned up ${cleanup.orphanedFiles.length} files and ${cleanup.orphanedCacheKeys.length} cache entries\n`);
        saveCache(config.cacheFile, cache);
      }
    }

    // Step 5: Generate remaining unmatched segments
    console.log(`Found ${segmentsToGenerate.length} segments to generate (${skippedCount} skipped, ${renamedCount} renamed)\n`);

    totalRenamed += renamedCount;
    totalDeleted += cleanup.orphanedFiles.length;

    if (segmentsToGenerate.length === 0) {
      console.log('✅ No segments need generation for this demo.\n');
      totalSkipped += skippedCount;
      continue;
    }
    
    // Group segments by resolved instruct, then process in batches
    // (each batch call sends a single instruct to the server)
    let generatedCount = 0;
    let errorCount = 0;

    const byInstruct = new Map<string | undefined, SegmentToGenerate[]>();
    for (const seg of segmentsToGenerate) {
      const key = seg.instruct;
      if (!byInstruct.has(key)) {
        byInstruct.set(key, []);
      }
      byInstruct.get(key)!.push(seg);
    }

    const allBatches: { batch: SegmentToGenerate[]; instruct?: string }[] = [];
    for (const [instruct, segments] of byInstruct) {
      const chunks = chunkArray(segments, config.batchSize);
      for (const chunk of chunks) {
        allBatches.push({ batch: chunk, instruct });
      }
    }

    console.log(`Processing ${allBatches.length} batches (${config.batchSize} segments per batch)...\n`);

    for (let batchIdx = 0; batchIdx < allBatches.length; batchIdx++) {
      const { batch, instruct } = allBatches[batchIdx];
      const batchNum = batchIdx + 1;

      console.log(`\n${'='.repeat(60)}`);
      console.log(`📦 Batch ${batchNum}/${allBatches.length} (${batch.length} segments${instruct ? `, instruct: "${instruct.substring(0, 40)}..."` : ''})`);
      console.log('='.repeat(60));

      // Show what's in this batch
      batch.forEach((item, idx) => {
        const preview = item.segment.narrationText!.substring(0, 50);
        console.log(`  ${idx + 1}. Ch${item.chapter}/S${item.slide} (${item.segment.id}): "${preview}..."`);
      });

      try {
        console.log(`\n🔊 Sending batch request to server...`);

        // Prepare texts for batch request (strip {#markers} before TTS)
        const texts = batch.map(item => `Speaker 0: ${stripMarkers(item.segment.narrationText!)}`);

        // Call batch endpoint
        const response = await axios.post(`${config.serverUrl}/generate_batch`, {
          texts,
          ...(instruct ? { instruct } : {})
        }, {
          timeout: 10800000 // 3 hour timeout for batch
        });
        
        if (response.data.success) {
          const audios = response.data.audios;
          const sampleRate = response.data.sample_rate;
          
          console.log(`✅ Received ${audios.length} audio files from server`);
          console.log(`   Sample rate: ${sampleRate} Hz\n`);
          
          // Save each audio file
          for (let i = 0; i < batch.length; i++) {
            const item = batch[i];
            const audioBase64 = audios[i];
            const audioBuffer = Buffer.from(audioBase64, 'base64');
            
            fs.writeFileSync(item.filepath, audioBuffer);
            console.log(`  ✅ [${i + 1}/${batch.length}] Saved: ${item.filename}`);
            generatedCount++;
            
            // Update cache
            const relativeFilepath = path.relative(path.join(config.outputDir, item.demoId), item.filepath);
            cache[item.demoId][relativeFilepath] = {
              narrationText: stripMarkers(item.segment.narrationText!),
              ...(item.instruct ? { instruct: item.instruct } : {}),
              generatedAt: new Date().toISOString()
            };
          }
          
        } else {
          console.error(`❌ Server error: ${response.data.error || 'Unknown error'}`);
          errorCount += batch.length;
        }
        
      } catch (error: any) {
        if (error.code === 'ECONNABORTED') {
          console.error(`❌ Batch timeout (took > 15 minutes)`);
        } else {
          console.error(`❌ Error: ${error.message}`);
        }
        errorCount += batch.length;
      }
      
      // Show progress
      const progressPct = ((batchNum / allBatches.length) * 100).toFixed(1);
      console.log(`\n📊 Progress: ${generatedCount}/${segmentsToGenerate.length} segments (${progressPct}%)`);
    }
    
    // Demo summary
    console.log('\n' + '-'.repeat(60));
    console.log(`📊 Demo '${demoId}' Summary`);
    console.log('-'.repeat(60));
    console.log(`Total segments scanned: ${totalSegments}`);
    console.log(`⏭️  Skipped (already exist): ${skippedCount}`);
    console.log(`✅ Generated: ${generatedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('-'.repeat(60) + '\n');
    
    totalGenerated += generatedCount;
    totalSkipped += skippedCount;
    totalErrors += errorCount;
  }
  
  // Final summary
  console.log('\n' + '═'.repeat(70));
  console.log('📊 TTS Multi-Demo Generation Summary');
  console.log('═'.repeat(70));
  console.log(`Demos processed: ${demosToProcess.length}`);
  console.log(`⏭️  Total skipped: ${totalSkipped}`);
  console.log(`✅ Total generated: ${totalGenerated}`);
  console.log(`❌ Total errors: ${totalErrors}`);
  console.log('═'.repeat(70) + '\n');
  
  // Save updated cache
  if (totalGenerated > 0) {
    saveCache(config.cacheFile, cache);
    console.log(`💾 TTS cache updated with ${totalGenerated} new entries`);
    
    // NEW: Update narration cache for all processed demos
    for (const demoId of demosToProcess) {
      const allSlides = await loadDemoSlides(demoId);
      if (allSlides.length > 0) {
        updateNarrationCache(demoId, allSlides);
      }
    }
    console.log();
  }

  // Auto-run duration calculation if any audio files changed
  const audioChanged = totalGenerated > 0 || totalDeleted > 0 || totalRenamed > 0;
  if (audioChanged) {
    console.log('⏱️  Audio files changed — recalculating durations...\n');
    await runDurationCalculation({
      audioDir: config.outputDir,
      demoFilter: config.demoFilter,
      reportPath: path.join(__dirname, '../duration-report.json'),
    });
  }
}

// Utility function to split array into chunks
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Load server config from JSON file
function loadServerConfig(): string {
  const configPath = path.join(__dirname, '../../tts/server_config.json');
  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(configData);
      if (config.server_url) {
        return config.server_url;
      }
    }
  } catch (error: any) {
    console.warn(`Warning: Could not load server config: ${error.message}`);
  }
  return 'http://localhost:5000';
}

// Parse CLI arguments
function parseCLIArgs(): { demoFilter?: string; segmentFilter?: string[]; skipExisting: boolean; fromJson: boolean; instruct?: string } {
  const args = process.argv.slice(2);
  const result: { demoFilter?: string; segmentFilter?: string[]; skipExisting: boolean; fromJson: boolean; instruct?: string } = {
    skipExisting: !args.includes('--force'),
    fromJson: args.includes('--from-json')
  };

  // Check for --demo parameter
  const demoIndex = args.indexOf('--demo');
  if (demoIndex !== -1 && args[demoIndex + 1]) {
    result.demoFilter = args[demoIndex + 1];
  }

  // Check for --segments parameter
  const segmentsIndex = args.indexOf('--segments');
  if (segmentsIndex !== -1 && args[segmentsIndex + 1]) {
    if (!result.demoFilter) {
      console.error('❌ --segments requires --demo to be specified (segments are demo-scoped)');
      process.exit(1);
    }
    result.segmentFilter = parseSegmentFilter(args[segmentsIndex + 1]);
    if (result.segmentFilter.length === 0) {
      console.error('❌ --segments value is empty or invalid');
      process.exit(1);
    }
  }

  // Check for --instruct parameter
  const instructIndex = args.indexOf('--instruct');
  if (instructIndex !== -1 && args[instructIndex + 1]) {
    result.instruct = args[instructIndex + 1];
  }

  return result;
}

// CLI execution
const cliArgs = parseCLIArgs();
const config: TTSConfig = {
  serverUrl: process.env.TTS_SERVER_URL || loadServerConfig(),
  outputDir: path.join(__dirname, '../public/audio'),
  skipExisting: cliArgs.skipExisting,
  batchSize: parseInt(process.env.BATCH_SIZE || '10', 10),
  cacheFile: path.join(__dirname, '../.tts-narration-cache.json'),
  demoFilter: cliArgs.demoFilter,
  segmentFilter: cliArgs.segmentFilter,
  fromJson: cliArgs.fromJson,
  instruct: cliArgs.instruct
};

generateTTS(config).catch(console.error);