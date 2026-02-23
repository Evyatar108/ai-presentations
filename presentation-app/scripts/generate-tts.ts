import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
import * as crypto from 'crypto';
import { AudioSegment, SlideComponentWithMetadata } from '@framework/slides/SlideMetadata';
import { runDurationCalculation } from './calculate-durations';
import { generateAlignment } from './generate-alignment';
import { loadTtsServerUrl, loadWhisperUrl } from './utils/server-config';
import { stripMarkers } from './utils/marker-parser';
import { TtsCacheStore, normalizeCachePath } from './utils/tts-cache';
import {
  loadNarrationCache,
  saveNarrationCache,
  createEmptyCache,
  hashNarrationSegment,
  buildNarrationCacheKey,
  updateSegmentEntry,
} from './utils/narration-cache';
import { getArg, hasFlag, parseSegmentFilter, buildSegmentKey, chunkArray } from './utils/cli-parser';
import { getAllDemoIds, loadDemoSlides } from './utils/demo-discovery';
import { loadNarrationJson, getNarrationText, getNarrationInstruct } from './utils/narration-loader';
import type { NarrationData } from './utils/narration-loader';

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


// Update narration cache after successful TTS generation
function updateNarrationCacheForDemo(
  demoId: string,
  slides: SlideComponentWithMetadata[]
): void {
  let cache = loadNarrationCache(demoId);
  if (!cache) {
    cache = createEmptyCache();
  }

  for (const slide of slides) {
    for (const segment of slide.metadata.audioSegments) {
      if (!segment.narrationText) continue;

      const key = buildNarrationCacheKey(slide.metadata.chapter, slide.metadata.slide, segment.id);
      const resolvedInstruct = segment.instruct ?? slide.metadata.instruct ?? '';
      const hash = hashNarrationSegment(segment.narrationText, resolvedInstruct);
      updateSegmentEntry(cache, key, hash);
    }
  }

  saveNarrationCache(demoId, cache);
  console.log(`✅ Updated narration cache: public/narration/${demoId}/narration-cache.json`);
}

// Scan for orphaned audio files and cache entries for a specific demo
function cleanupUnusedAudio(
  demoId: string,
  outputDir: string,
  store: TtsCacheStore,
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

      expectedFiles.add(TtsCacheStore.buildKey(chapter, slideNum, i, segment.id));
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
      const relativeFilepath = normalizeCachePath(path.relative(demoOutputDir, filepath));

      if (!expectedFiles.has(relativeFilepath)) {
        result.orphanedFiles.push(relativeFilepath);
      }
    }
  }

  // Check cache for orphaned entries
  for (const cacheKey of store.getKeys(demoId)) {
    if (!expectedFiles.has(cacheKey)) {
      result.orphanedCacheKeys.push(cacheKey);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Sub-functions extracted from generateTTS for readability
// ---------------------------------------------------------------------------

/** Result of loading slides and merging external narration for a single demo. */
interface LoadAndMergeResult {
  allSlides: SlideComponentWithMetadata[];
}

/**
 * Load slides for a demo, optionally load external narration JSON, and merge
 * narration text / instruct overrides into slide metadata.
 *
 * Returns the merged slides, or `null` if the demo should be skipped.
 */
async function loadAndMergeNarration(
  demoId: string,
  config: TTSConfig
): Promise<LoadAndMergeResult | null> {
  // Load narration from JSON
  console.log(`📥 Loading narration data...`);
  const narrationData = loadNarrationJson(demoId);

  if (narrationData) {
    console.log(`✅ Loaded external narration (version ${narrationData.version}, ${narrationData.slides.length} slides)`);
  } else if (config.fromJson) {
    console.error(`❌ --from-json specified but narration.json not found for '${demoId}'`);
    console.error(`   Expected: public/narration/${demoId}/narration.json\n`);
    return null;
  } else {
    console.log(`📝 No external narration found, using inline narration`);
  }
  console.log();

  // Load slides for this demo
  const allSlides = await loadDemoSlides(demoId);

  if (allSlides.length === 0) {
    console.log(`⚠️  No slides found for demo '${demoId}', skipping...\n`);
    return null;
  }

  console.log(`   Found ${allSlides.length} slides\n`);

  // Merge narration from JSON into slide metadata
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
      return null;
    }
    console.log();
  }

  return { allSlides };
}

/** Result of orphan detection, smart renaming, and deletion. */
interface OrphanResult {
  /** Number of orphaned files that were renamed to match new segment paths. */
  renamedCount: number;
  /** Number of orphaned files that were deleted. */
  deletedFileCount: number;
  /** Number of orphaned cache entries that were removed. */
  deletedCacheKeyCount: number;
}

/**
 * Detect orphaned audio files and cache entries for a demo, attempt to rename
 * orphans whose content matches a segment that needs generation, and delete
 * any remaining unmatched orphans.
 *
 * NOTE: This mutates `segmentsToGenerate` — segments satisfied by a rename
 * are removed from the array. It also mutates `cache` when renaming or
 * deleting cache entries.
 */
function handleOrphanedFiles(
  demoId: string,
  allSlides: SlideComponentWithMetadata[],
  config: TTSConfig,
  store: TtsCacheStore,
  segmentsToGenerate: SegmentToGenerate[]
): OrphanResult {
  const result: OrphanResult = { renamedCount: 0, deletedFileCount: 0, deletedCacheKeyCount: 0 };
  const demoOutputDir = path.join(config.outputDir, demoId);

  // Skip orphan cleanup when targeting specific segments
  if (config.segmentFilter) {
    return result;
  }

  // Step 1: Detect orphaned audio files (don't delete yet — we may rename them)
  console.log('🔍 Scanning for unused audio files...\n');
  const cleanup = cleanupUnusedAudio(demoId, config.outputDir, store, allSlides);

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
    return result;
  }

  // Step 2: Smart rename — match orphans to missing segments by content hash
  if (cleanup.orphanedFiles.length > 0 && segmentsToGenerate.length > 0) {
    console.log('🔄 Checking for renameable orphans (same content, different slide number)...\n');

    // Build lookup: hash(narrationText + instruct) → orphan relative path
    const orphansByHash = new Map<string, { relativePath: string; cacheKey: string | undefined }>();
    for (const orphanRelPath of cleanup.orphanedFiles) {
      // Find matching cache entry for this orphan
      const normalizedPath = normalizeCachePath(orphanRelPath);
      const cacheEntry = store.getEntry(demoId, normalizedPath) || store.getEntry(demoId, orphanRelPath);
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

          const newRelativePath = normalizeCachePath(path.relative(demoOutputDir, seg.filepath));

          // Update cache: rename key from old path to new path
          if (orphan.cacheKey) {
            store.renameKey(demoId, orphan.cacheKey, newRelativePath);
          }

          console.log(`  🔄 Renamed: ${orphan.relativePath} → ${newRelativePath}`);
          matchedOrphans.add(orphan.relativePath);
          result.renamedCount++;

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

    if (result.renamedCount > 0) {
      console.log(`\n  ✅ Renamed ${result.renamedCount} files (avoided regeneration)\n`);
      store.save();
    } else {
      console.log('  No renameable matches found\n');
    }
  }

  // Step 3: Delete remaining unmatched orphaned files and cache entries
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
      store.removeEntry(demoId, key);
    }

    if (cleanup.orphanedFiles.length > 0 || cleanup.orphanedCacheKeys.length > 0) {
      console.log(`\n💾 Cleaned up ${cleanup.orphanedFiles.length} files and ${cleanup.orphanedCacheKeys.length} cache entries\n`);
      store.save();
    }
  }

  result.deletedFileCount = cleanup.orphanedFiles.length;
  result.deletedCacheKeyCount = cleanup.orphanedCacheKeys.length;
  return result;
}

/** Counters returned by a single batch-generation run. */
interface BatchResult {
  generatedCount: number;
  errorCount: number;
}

/**
 * Send segments to the TTS server in batches, grouped by resolved instruct,
 * write the resulting audio files to disk, and update the cache in-place.
 */
async function generateBatches(
  segmentsToGenerate: SegmentToGenerate[],
  config: TTSConfig,
  store: TtsCacheStore
): Promise<BatchResult> {
  let generatedCount = 0;
  let errorCount = 0;

  // Group segments by resolved instruct, then process in batches
  // (each batch call sends a single instruct to the server)
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
          const relativeFilepath = normalizeCachePath(path.relative(path.join(config.outputDir, item.demoId), item.filepath));
          store.setEntry(item.demoId, relativeFilepath, item.segment.narrationText!, item.instruct);
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

  return { generatedCount, errorCount };
}

/**
 * Save the TTS cache, update per-demo narration caches, and auto-run
 * duration calculation + alignment when audio files have changed.
 */
async function saveResults(
  config: TTSConfig,
  store: TtsCacheStore,
  demosToProcess: string[],
  totals: { totalGenerated: number; totalDeleted: number; totalRenamed: number }
): Promise<void> {
  // Save updated cache
  if (totals.totalGenerated > 0) {
    store.save();
    console.log(`💾 TTS cache updated with ${totals.totalGenerated} new entries`);

    // Update narration cache for all processed demos
    for (const demoId of demosToProcess) {
      const allSlides = await loadDemoSlides(demoId);
      if (allSlides.length > 0) {
        updateNarrationCacheForDemo(demoId, allSlides);
      }
    }
    console.log();
  }

  // Auto-run duration calculation and alignment if any audio files changed
  const audioChanged = totals.totalGenerated > 0 || totals.totalDeleted > 0 || totals.totalRenamed > 0;
  if (audioChanged) {
    console.log('⏱️  Audio files changed — recalculating durations...\n');
    await runDurationCalculation({
      audioDir: config.outputDir,
      demoFilter: config.demoFilter,
      reportPath: path.join(__dirname, '../duration-report.json'),
    });

    if (config.demoFilter) {
      console.log('\n🔗  Audio files changed — regenerating alignment...\n');
      await generateAlignment({
        whisperUrl: process.env.WHISPER_URL || loadWhisperUrl(),
        audioDir: config.outputDir,
        demoFilter: config.demoFilter,
        segmentFilter: config.segmentFilter,
        force: false,
        batchSize: 10,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------

// Main function with batch processing
async function generateTTS(config: TTSConfig) {
  console.log('🎙️  Starting TTS Batch Generation (Multi-Demo Support)...\n');

  // Load cache
  const store = new TtsCacheStore(config.cacheFile);

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

    // Step 1: Load slides and merge external narration
    const loadResult = await loadAndMergeNarration(demoId, config);
    if (!loadResult) continue;
    const { allSlides } = loadResult;

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
        const relativeFilepath = TtsCacheStore.buildKey(chapter, slideNum, i, segment.id);
        const filename = path.basename(relativeFilepath);
        const filepath = path.join(chapterDir, filename);

        // Resolve instruct: segment → slide → narrationJSON → CLI
        const resolvedInstruct =
          segment.instruct ??
          slide.metadata.instruct ??
          config.instruct;

        // Check if we should skip this segment (bypass cache when --segments targets it)
        let shouldSkip = false;

        if (!config.segmentFilter && config.skipExisting && fs.existsSync(filepath)) {
          // File exists - check if narration or instruct has changed
          const cachedEntry = store.getEntry(demoId, relativeFilepath);
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

    // Step 3: Handle orphaned files (detect, smart-rename, delete remaining)
    const orphanResult = handleOrphanedFiles(demoId, allSlides, config, store, segmentsToGenerate);

    // Step 4: Generate remaining unmatched segments
    console.log(`Found ${segmentsToGenerate.length} segments to generate (${skippedCount} skipped, ${orphanResult.renamedCount} renamed)\n`);

    totalRenamed += orphanResult.renamedCount;
    totalDeleted += orphanResult.deletedFileCount;

    if (segmentsToGenerate.length === 0) {
      console.log('✅ No segments need generation for this demo.\n');
      totalSkipped += skippedCount;
      continue;
    }

    const { generatedCount, errorCount } = await generateBatches(segmentsToGenerate, config, store);

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

  // Save cache, update narration caches, and auto-chain downstream tools
  await saveResults(config, store, demosToProcess, { totalGenerated, totalDeleted, totalRenamed });
}

// CLI execution
const cliArgs = (() => {
  const demoFilter = getArg('demo');
  const segmentsRaw = getArg('segments');
  let segmentFilter: string[] | undefined;
  if (segmentsRaw) {
    if (!demoFilter) {
      console.error('❌ --segments requires --demo to be specified (segments are demo-scoped)');
      process.exit(1);
    }
    segmentFilter = parseSegmentFilter(segmentsRaw);
    if (segmentFilter.length === 0) {
      console.error('❌ --segments value is empty or invalid');
      process.exit(1);
    }
  }
  return {
    demoFilter,
    segmentFilter,
    skipExisting: !hasFlag('force'),
    fromJson: hasFlag('from-json'),
    instruct: getArg('instruct'),
  };
})();
const config: TTSConfig = {
  serverUrl: process.env.TTS_SERVER_URL || loadTtsServerUrl(),
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