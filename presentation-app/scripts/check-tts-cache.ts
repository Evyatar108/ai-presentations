// Pre-run TTS cache validation script with multi-demo support
// Integrates with narration JSON change detection
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as readline from 'readline';
import { execSync } from 'child_process';
import { SlideComponentWithMetadata } from '@framework/slides/SlideMetadata';
import { stripMarkers } from './utils/marker-parser';
import { TtsCacheStore, normalizeCachePath } from './utils/tts-cache';
import { getAllDemoIds, loadDemoSlides } from './utils/demo-discovery';
import { loadNarrationJson, type NarrationData } from './utils/narration-loader';
import { hashNarrationSegment, type NarrationCache as NarrationJsonCache, type NarrationCacheEntry as NarrationCacheSegment } from './utils/narration-cache';
import { loadAlignmentData } from './utils/alignment-io';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ChangeDetectionResult {
  hasChanges: boolean;
  demos: {
    [demoId: string]: {
      changedSegments: Array<{
        chapter: number;
        slide: number;
        segmentId: string;
        reason: string;
      }>;
      missingFiles: Array<{
        chapter: number;
        slide: number;
        segmentId: string;
        filepath: string;
      }>;
      newSegments: number;
      orphanedFiles: Array<{
        filepath: string;
      }>;
      orphanedCacheKeys: string[];
      renameableFiles: Array<{
        from: string;
        to: string;
      }>;
    };
  };
}

// Check narration JSON changes for a demo
function checkNarrationChanges(demoId: string): {
  hasChanges: boolean;
  changedCount: number;
  missingCount: number;
  details: string[];
} {
  const result = {
    hasChanges: false,
    changedCount: 0,
    missingCount: 0,
    details: [] as string[]
  };
  
  const narrationFile = path.join(__dirname, `../public/narration/${demoId}/narration.json`);
  const cacheFile = path.join(__dirname, `../public/narration/${demoId}/narration-cache.json`);
  
  // If no narration.json, skip check
  if (!fs.existsSync(narrationFile)) {
    return result;
  }
  
  try {
    const narrationData = JSON.parse(fs.readFileSync(narrationFile, 'utf-8'));
    
    // Load cache if exists
    let cache: NarrationJsonCache | null = null;
    if (fs.existsSync(cacheFile)) {
      try {
        cache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8')) as NarrationJsonCache;
      } catch (error) {
        result.details.push('⚠️  Narration cache corrupted or invalid');
      }
    }
    
    // Check each slide's segments
    for (const slide of narrationData.slides) {
      for (const segment of slide.segments) {
        const key = `ch${slide.chapter}:s${slide.slide}:${segment.id}`;
        // Include resolved instruct in hash so instruct changes trigger regeneration
        const resolvedInstruct = segment.instruct ?? slide.instruct ?? narrationData.instruct ?? '';
        const currentHash = hashNarrationSegment(segment.narrationText, resolvedInstruct);
        
        if (!cache || !cache.segments[key]) {
          result.hasChanges = true;
          result.missingCount++;
          result.details.push(`📝 New: ${key}`);
        } else if (cache.segments[key].hash !== currentHash) {
          result.hasChanges = true;
          result.changedCount++;
          result.details.push(`🔄 Changed: ${key}`);
        }
      }
    }
  } catch (error: any) {
    result.details.push(`❌ Error checking narration: ${error.message}`);
  }
  
  return result;
}

// Merge narration from JSON into slide metadata
function mergeNarrationIntoSlides(
  slides: SlideComponentWithMetadata[],
  narrationData: NarrationData | null
): SlideComponentWithMetadata[] {
  if (!narrationData) {
    return slides;
  }
  
  return slides.map(slide => {
    const { chapter, slide: slideNum, audioSegments } = slide.metadata;
    
    // Find matching slide in narration JSON
    const narrationSlide = narrationData.slides.find(
      s => s.chapter === chapter && s.slide === slideNum
    );
    
    if (!narrationSlide || !audioSegments) {
      return slide;
    }
    
    // Merge narration text and instruct into segments
    const updatedSegments = audioSegments.map(segment => {
      const narrationSegment = narrationSlide.segments.find(ns => ns.id === segment.id);

      if (narrationSegment) {
        // Resolve instruct: segment → slide → data-level
        const resolvedInstruct =
          narrationSegment.instruct ??
          narrationSlide.instruct ??
          narrationData.instruct;

        return {
          ...segment,
          narrationText: narrationSegment.narrationText,
          ...(resolvedInstruct ? { instruct: resolvedInstruct } : {})
        };
      }

      return segment;
    });
    
    return {
      ...slide,
      metadata: {
        ...slide.metadata,
        audioSegments: updatedSegments
      }
    } as SlideComponentWithMetadata;
  });
}

// Load slides for a specific demo (with narration JSON merging)
async function loadDemoSlidesWithNarration(demoId: string): Promise<SlideComponentWithMetadata[]> {
  const slides = await loadDemoSlides(demoId) as SlideComponentWithMetadata[];
  if (slides.length === 0) return slides;

  // Load and merge narration from JSON if available
  const narrationData = loadNarrationJson(demoId);

  if (narrationData) {
    console.log(`   📝 Loaded narration.json with ${narrationData.slides.length} slides`);
    return mergeNarrationIntoSlides(slides, narrationData);
  }

  return slides;
}

// Scan for orphaned audio files and cache entries for a specific demo
function detectOrphanedAudio(
  demoId: string,
  outputDir: string,
  store: TtsCacheStore,
  allSlides: SlideComponentWithMetadata[]
): {
  orphanedFiles: Array<{ filepath: string }>;
  orphanedCacheKeys: string[];
} {
  const result = {
    orphanedFiles: [] as Array<{ filepath: string }>,
    orphanedCacheKeys: [] as string[]
  };

  const demoOutputDir = path.join(outputDir, demoId);

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
  if (fs.existsSync(demoOutputDir)) {
    const chapterDirs = fs.readdirSync(demoOutputDir).filter((name: string) =>
      name.startsWith('c') && fs.statSync(path.join(demoOutputDir, name)).isDirectory()
    );

    for (const chapterDir of chapterDirs) {
      const chapterPath = path.join(demoOutputDir, chapterDir);
      if (!fs.existsSync(chapterPath)) continue;

      const files = fs.readdirSync(chapterPath);

      for (const file of files) {
        if (!file.endsWith('.wav')) continue;

        const filepath = path.join(chapterPath, file);
        const relativeFilepath = normalizeCachePath(path.relative(demoOutputDir, filepath));

        if (!expectedFiles.has(relativeFilepath)) {
          result.orphanedFiles.push({ filepath: relativeFilepath });
        }
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

// Check if narration has changed or file is missing for a specific demo
function detectChanges(
  demoId: string,
  outputDir: string,
  store: TtsCacheStore,
  allSlides: SlideComponentWithMetadata[]
): {
  changedSegments: any[];
  missingFiles: any[];
  newSegments: number;
} {
  const result = {
    changedSegments: [] as any[],
    missingFiles: [] as any[],
    newSegments: 0
  };

  const demoOutputDir = path.join(outputDir, demoId);

  for (const slide of allSlides) {
    const { chapter, slide: slideNum, audioSegments } = slide.metadata;

    if (!audioSegments || audioSegments.length === 0) continue;

    const chapterDir = path.join(demoOutputDir, `c${chapter}`);

    for (let i = 0; i < audioSegments.length; i++) {
      const segment = audioSegments[i];

      // Skip if no narration text
      if (!segment.narrationText) continue;

      // Generate expected filepath
      const relativeFilepath = TtsCacheStore.buildKey(chapter, slideNum, i, segment.id);
      const filepath = path.join(chapterDir, path.basename(relativeFilepath));

      // Check if file exists
      if (!fs.existsSync(filepath)) {
        result.missingFiles.push({
          chapter,
          slide: slideNum,
          segmentId: segment.id,
          filepath: relativeFilepath
        });
        continue;
      }

      // Check if this segment is in cache
      const cached = store.getEntry(demoId, relativeFilepath);
      if (!cached) {
        result.newSegments++;
        result.changedSegments.push({
          chapter,
          slide: slideNum,
          segmentId: segment.id,
          reason: 'New segment (not in cache)'
        });
        continue;
      }

      // Check if narration changed (strip markers — they don't affect TTS audio)
      if (stripMarkers(cached.narrationText) !== stripMarkers(segment.narrationText)) {
        result.changedSegments.push({
          chapter,
          slide: slideNum,
          segmentId: segment.id,
          reason: 'Narration text changed'
        });
      }
    }
  }

  return result;
}

// Detect renameable orphans: orphaned files whose cached content matches a missing segment
function detectRenameableFiles(
  demoId: string,
  store: TtsCacheStore,
  orphanedFiles: Array<{ filepath: string }>,
  missingFiles: Array<{ chapter: number; slide: number; segmentId: string; filepath: string }>,
  allSlides: SlideComponentWithMetadata[]
): Array<{ from: string; to: string }> {
  if (orphanedFiles.length === 0 || missingFiles.length === 0) return [];

  // Build lookup: hash(narrationText + instruct) → orphan filepath
  const orphansByHash = new Map<string, string>();
  for (const orphan of orphanedFiles) {
    const normalizedPath = normalizeCachePath(orphan.filepath);
    const cacheEntry = store.getEntry(demoId, normalizedPath) || store.getEntry(demoId, orphan.filepath);
    if (cacheEntry?.narrationText) {
      const hash = hashNarrationSegment(cacheEntry.narrationText, cacheEntry.instruct ?? '');
      if (!orphansByHash.has(hash)) {
        orphansByHash.set(hash, normalizedPath);
      }
    }
  }

  // For each missing file, compute expected content hash and check for a match
  const renameables: Array<{ from: string; to: string }> = [];
  const matchedOrphans = new Set<string>();

  for (const missing of missingFiles) {
    // Find the slide to get narration text
    const slide = allSlides.find(
      s => s.metadata.chapter === missing.chapter && s.metadata.slide === missing.slide
    );
    if (!slide) continue;

    const segment = slide.metadata.audioSegments.find(seg => seg.id === missing.segmentId);
    if (!segment?.narrationText) continue;

    const resolvedInstruct = segment.instruct ?? slide.metadata.instruct ?? '';
    const hash = hashNarrationSegment(segment.narrationText, resolvedInstruct);

    const orphanPath = orphansByHash.get(hash);
    if (orphanPath && !matchedOrphans.has(orphanPath)) {
      renameables.push({ from: orphanPath, to: normalizeCachePath(missing.filepath) });
      matchedOrphans.add(orphanPath);
    }
  }

  return renameables;
}

// Prompt user for confirmation
function promptUser(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === 'y' || normalized === 'yes');
    });
  });
}

// Marker regex (same as marker-parser.ts but kept local to avoid import issues)
const MARKER_RE = /\{#?([a-zA-Z0-9_-]+)#?\}/g;

/** Extract all marker IDs from narration text */
function extractMarkerIds(text: string): string[] {
  const ids: string[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(MARKER_RE.source, 'g');
  while ((m = re.exec(text)) !== null) {
    ids.push(m[1]);
  }
  return ids;
}

interface AlignmentData {
  demoId: string;
  slides: Record<string, {
    chapter: number;
    slide: number;
    segments: Array<{
      segmentId: string;
      markers: Array<{ id: string; time: number }>;
    }>;
  }>;
}

/**
 * Check that every {#marker} in narration text has a resolved timestamp
 * in alignment.json. Returns missing markers grouped by segment.
 */
function checkMarkerAlignment(demoId: string): {
  totalMarkers: number;
  missingMarkers: Array<{ segment: string; markerId: string }>;
  noAlignmentFile: boolean;
} {
  const result = {
    totalMarkers: 0,
    missingMarkers: [] as Array<{ segment: string; markerId: string }>,
    noAlignmentFile: false,
  };

  const narrationFile = path.join(__dirname, `../public/narration/${demoId}/narration.json`);

  if (!fs.existsSync(narrationFile)) return result;

  // Collect all expected markers from narration text
  const narration: NarrationData = JSON.parse(fs.readFileSync(narrationFile, 'utf-8'));
  const expectedMarkers: Array<{ slideKey: string; segmentId: string; markerId: string }> = [];

  for (const slide of narration.slides) {
    const slideKey = `c${slide.chapter}_s${slide.slide}`;
    for (const segment of slide.segments) {
      const markerIds = extractMarkerIds(segment.narrationText);
      for (const id of markerIds) {
        expectedMarkers.push({ slideKey, segmentId: segment.id, markerId: id });
      }
    }
  }

  result.totalMarkers = expectedMarkers.length;
  if (expectedMarkers.length === 0) return result;

  // Load alignment data
  const alignment = loadAlignmentData(demoId) as AlignmentData | null;
  if (!alignment) {
    result.noAlignmentFile = true;
    result.missingMarkers = expectedMarkers.map(m => ({
      segment: `${m.slideKey}:${m.segmentId}`,
      markerId: m.markerId,
    }));
    return result;
  }

  // Build a set of resolved marker IDs per segment
  const resolvedMarkers = new Map<string, Set<string>>();
  for (const [slideKey, slideData] of Object.entries(alignment.slides)) {
    for (const seg of slideData.segments) {
      const key = `${slideKey}:${seg.segmentId}`;
      const ids = new Set(seg.markers.map(m => m.id));
      resolvedMarkers.set(key, ids);
    }
  }

  // Check each expected marker
  for (const expected of expectedMarkers) {
    const key = `${expected.slideKey}:${expected.segmentId}`;
    const resolved = resolvedMarkers.get(key);
    if (!resolved || !resolved.has(expected.markerId)) {
      result.missingMarkers.push({
        segment: key,
        markerId: expected.markerId,
      });
    }
  }

  return result;
}

// Main check function
async function checkTTSCache(): Promise<void> {
  const outputDir = path.join(__dirname, '../public/audio');
  const store = TtsCacheStore.fromProjectRoot(path.join(__dirname, '..'));
  
  console.log('═'.repeat(70));
  console.log('🔍 TTS Cache & Narration Validation (Multi-Demo)');
  console.log('═'.repeat(70));
  console.log();
  
  // STEP 1: Check narration JSON changes first
  console.log('📋 Step 1: Checking narration JSON files...\n');
  
  // Get all demos
  const demoIds = await getAllDemoIds();
  
  if (demoIds.length === 0) {
    console.log('⚠️  No demos found. Continuing...\n');
    process.exit(0);
  }
  
  console.log(`📦 Found ${demoIds.length} demo(s): ${demoIds.join(', ')}\n`);
  
  const result: ChangeDetectionResult = {
    hasChanges: false,
    demos: {}
  };
  
  // Check narration changes for all demos
  const narrationChanges: Record<string, ReturnType<typeof checkNarrationChanges>> = {};
  let totalNarrationChanges = 0;
  
  for (const demoId of demoIds) {
    const changes = checkNarrationChanges(demoId);
    if (changes.hasChanges) {
      narrationChanges[demoId] = changes;
      totalNarrationChanges += changes.changedCount + changes.missingCount;
    }
  }
  
  if (totalNarrationChanges > 0) {
    console.log('⚠️  Narration JSON changes detected!\n');
    for (const [demoId, changes] of Object.entries(narrationChanges)) {
      console.log(`   📁 ${demoId}:`);
      console.log(`      - Changed: ${changes.changedCount}`);
      console.log(`      - New: ${changes.missingCount}`);
      if (changes.details.length > 0 && changes.details.length <= 5) {
        changes.details.forEach(detail => console.log(`        ${detail}`));
      } else if (changes.details.length > 5) {
        changes.details.slice(0, 3).forEach(detail => console.log(`        ${detail}`));
        console.log(`        ... and ${changes.details.length - 3} more`);
      }
    }
    console.log('\n   💡 TTS regeneration recommended for these changes.\n');
  } else {
    console.log('✅ All narration JSON files match cache\n');
  }
  
  // STEP 2: Check TTS cache (audio files)
  console.log('─'.repeat(70));
  console.log('📋 Step 2: Checking TTS audio cache...\n');
  
  // Check each demo
  for (const demoId of demoIds) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📁 Checking demo: ${demoId}`);
    console.log('─'.repeat(60));
    
    const allSlides = await loadDemoSlidesWithNarration(demoId);
    
    if (allSlides.length === 0) {
      console.log(`⚠️  No slides found for demo '${demoId}', skipping...\n`);
      continue;
    }
    
    // Check for orphaned files
    const orphaned = detectOrphanedAudio(demoId, outputDir, store, allSlides);

    // Check for changes
    const changes = detectChanges(demoId, outputDir, store, allSlides);
    
    const demoHasChanges = 
      orphaned.orphanedFiles.length > 0 ||
      orphaned.orphanedCacheKeys.length > 0 ||
      changes.changedSegments.length > 0 ||
      changes.missingFiles.length > 0;
    
    // Detect renameable files (orphans that match missing segments by content hash)
    const renameables = detectRenameableFiles(
      demoId, store,
      orphaned.orphanedFiles, changes.missingFiles, allSlides
    );

    if (demoHasChanges) {
      result.hasChanges = true;
      result.demos[demoId] = {
        changedSegments: changes.changedSegments,
        missingFiles: changes.missingFiles,
        newSegments: changes.newSegments,
        orphanedFiles: orphaned.orphanedFiles,
        orphanedCacheKeys: orphaned.orphanedCacheKeys,
        renameableFiles: renameables
      };

      // Report renameable files first (most actionable)
      if (renameables.length > 0) {
        console.log(`\n🔄 Renameable files: ${renameables.length} (same content, slide renumbered — fixed by tts:generate without TTS server)`);
        renameables.slice(0, 3).forEach(item => {
          console.log(`   - ${item.from} → ${item.to}`);
        });
        if (renameables.length > 3) {
          console.log(`   ... and ${renameables.length - 3} more`);
        }
      }

      // Report remaining orphans (excluding those that are renameable)
      const renameableFromPaths = new Set(renameables.map(r => r.from));
      const trueOrphans = orphaned.orphanedFiles.filter(f => !renameableFromPaths.has(normalizeCachePath(f.filepath)));
      if (trueOrphans.length > 0) {
        console.log(`\n⚠️  Orphaned audio files: ${trueOrphans.length}`);
        trueOrphans.slice(0, 3).forEach(item => {
          console.log(`   - ${item.filepath}`);
        });
        if (trueOrphans.length > 3) {
          console.log(`   ... and ${trueOrphans.length - 3} more`);
        }
      }

      // Report missing files (excluding those that are renameable)
      const renameableToPaths = new Set(renameables.map(r => r.to));
      const trueMissing = changes.missingFiles.filter(f => !renameableToPaths.has(normalizeCachePath(f.filepath)));
      if (trueMissing.length > 0) {
        console.log(`\n📁 Missing audio files: ${trueMissing.length}`);
        trueMissing.slice(0, 3).forEach(item => {
          console.log(`   - Ch${item.chapter}/S${item.slide} (${item.segmentId})`);
        });
        if (trueMissing.length > 3) {
          console.log(`   ... and ${trueMissing.length - 3} more`);
        }
      }

      if (changes.changedSegments.length > 0) {
        console.log(`\n🔄 Changed narrations: ${changes.changedSegments.length}`);
        changes.changedSegments.slice(0, 3).forEach(item => {
          console.log(`   - Ch${item.chapter}/S${item.slide} (${item.segmentId}): ${item.reason}`);
        });
        if (changes.changedSegments.length > 3) {
          console.log(`   ... and ${changes.changedSegments.length - 3} more`);
        }
      }
    } else {
      console.log('✅ All audio files are up-to-date for this demo');
    }
  }
  // STEP 3: Check marker alignment
  console.log('\n' + '─'.repeat(70));
  console.log('📋 Step 3: Checking marker alignment...\n');

  let totalMissingMarkers = 0;
  const demosNeedingAlignment = new Set<string>();

  for (const demoId of demoIds) {
    const markerCheck = checkMarkerAlignment(demoId);
    if (markerCheck.totalMarkers === 0) continue;

    if (markerCheck.noAlignmentFile) {
      console.log(`   ❌ ${demoId}: alignment.json missing — ${markerCheck.totalMarkers} markers unresolved`);
      console.log(`      Run: npm run tts:align -- --demo ${demoId}`);
      totalMissingMarkers += markerCheck.missingMarkers.length;
      demosNeedingAlignment.add(demoId);
    } else if (markerCheck.missingMarkers.length > 0) {
      console.log(`   ⚠️  ${demoId}: ${markerCheck.missingMarkers.length} of ${markerCheck.totalMarkers} markers missing from alignment`);
      for (const m of markerCheck.missingMarkers.slice(0, 5)) {
        console.log(`      - ${m.segment} → {#${m.markerId}}`);
      }
      if (markerCheck.missingMarkers.length > 5) {
        console.log(`      ... and ${markerCheck.missingMarkers.length - 5} more`);
      }
      console.log(`      Run: npm run tts:align -- --demo ${demoId} --force`);
      totalMissingMarkers += markerCheck.missingMarkers.length;
      demosNeedingAlignment.add(demoId);
    } else {
      console.log(`   ✅ ${demoId}: all ${markerCheck.totalMarkers} markers resolved`);
    }
  }

  if (totalMissingMarkers === 0) {
    console.log('   ✅ All markers resolved in alignment data\n');
  } else {
    console.log();
  }

  // Final summary
  const hasAnyChanges = result.hasChanges || totalNarrationChanges > 0 || totalMissingMarkers > 0;

  if (!hasAnyChanges) {
    console.log('═'.repeat(70));
    console.log('✅ All systems up-to-date!');
    console.log('═'.repeat(70));
    console.log('\n   ✓ Narration JSON matches cache');
    console.log('   ✓ TTS audio matches narration text');
    console.log('   ✓ No missing or orphaned files');
    console.log('   ✓ All markers resolved in alignment\n');
    console.log('Starting React application...\n');
    process.exit(0);
  }
  
  // Changes detected - show summary
  console.log('\n' + '═'.repeat(70));
  console.log('⚠️  Changes Detected - TTS Regeneration Recommended');
  console.log('═'.repeat(70));
  
  const allAffectedDemos = new Set([
    ...Object.keys(result.demos),
    ...Object.keys(narrationChanges)
  ]);
  
  console.log(`\nDemos affected: ${Array.from(allAffectedDemos).join(', ')}`);
  
  if (totalNarrationChanges > 0) {
    console.log(`   📝 Narration JSON changes: ${totalNarrationChanges}`);
  }

  if (totalMissingMarkers > 0) {
    console.log(`   🎯 Missing markers: ${totalMissingMarkers} (run tts:align --force)`);
  }

  if (result.hasChanges) {
    const totalTTSChanges = Object.values(result.demos).reduce(
      (sum, demo) => sum + demo.changedSegments.length + demo.missingFiles.length,
      0
    );
    console.log(`   🔊 TTS audio changes: ${totalTTSChanges}`);
  }
  console.log();
  
  const shouldRegenerate = await promptUser('Do you want to regenerate? (y/n): ');
  
  if (shouldRegenerate) {
    // Demos with TTS/narration changes also need alignment (new audio invalidates alignment hashes)
    const demosWithTtsChanges = new Set([
      ...Object.keys(result.demos),
      ...Object.keys(narrationChanges)
    ]);
    for (const id of demosWithTtsChanges) {
      demosNeedingAlignment.add(id);
    }

    const hasTtsChanges = result.hasChanges || totalNarrationChanges > 0;

    if (hasTtsChanges) {
      console.log('\n🔊 Starting TTS generation (smart cache - only changed segments)...\n');
      try {
        execSync('npm run tts:generate', {
          stdio: 'inherit',
          cwd: path.join(__dirname, '..')
        });
        console.log('\n✅ Audio regeneration complete!');
      } catch (error) {
        console.error('\n❌ TTS generation failed. Please check the error above.\n');
        process.exit(1);
      }
    }

    // Chain tts:align for demos that need alignment
    if (demosNeedingAlignment.size > 0) {
      console.log(`\n🎯 Running alignment for ${demosNeedingAlignment.size} demo(s)...\n`);
      for (const id of demosNeedingAlignment) {
        try {
          console.log(`   Running alignment for ${id}...`);
          execSync(`npx tsx scripts/generate-alignment.ts --demo ${id} --force`, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
          });
        } catch (error) {
          console.error(`   ❌ Alignment failed for ${id}. Please check the error above.`);
        }
      }
      console.log('\n✅ Alignment complete!');
    }

    console.log('\nStarting app...\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Skipping regeneration. Starting app with current audio files...\n');
    process.exit(0);
  }
}

// Run check
checkTTSCache().catch((error) => {
  console.error('Error checking TTS cache:', error);
  process.exit(1);
});