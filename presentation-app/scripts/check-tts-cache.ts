// Pre-run TTS cache validation script with multi-demo support
// Integrates with narration JSON change detection
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as readline from 'readline';
import { execSync } from 'child_process';
import * as crypto from 'crypto';
import { SlideComponentWithMetadata } from '@framework/slides/SlideMetadata';
import { stripMarkers } from './utils/marker-parser';
import { loadTtsCache, type TtsCache } from './utils/tts-cache';

// Narration JSON structure
interface NarrationData {
  demoId: string;
  version: string;
  lastModified: string;
  instruct?: string;
  slides: Array<{
    chapter: number;
    slide: number;
    title: string;
    instruct?: string;
    segments: Array<{
      id: string;
      narrationText: string;
      visualDescription?: string;
      notes?: string;
      instruct?: string;
    }>;
  }>;
}

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type TTSNarrationCache = TtsCache;

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

// Narration JSON cache structure (different from TTS cache)
interface NarrationCacheSegment {
  hash: string;
  lastChecked: string;
}

interface NarrationJsonCache {
  version: string;
  generatedAt: string;
  segments: Record<string, NarrationCacheSegment>;
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
        // Strip markers before hashing — markers don't affect TTS audio
        const resolvedInstruct = segment.instruct ?? slide.instruct ?? narrationData.instruct ?? '';
        const currentHash = crypto.createHash('sha256')
          .update(stripMarkers(segment.narrationText).trim() + '\0' + resolvedInstruct)
          .digest('hex');
        
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

// Get all demo IDs by scanning the demos directory
async function getAllDemoIds(): Promise<string[]> {
  const demosDir = path.join(__dirname, '../src/demos');
  const entries = fs.readdirSync(demosDir, { withFileTypes: true });
  
  return entries
    .filter((entry: any) => entry.isDirectory() && entry.name !== 'types.ts')
    .map((entry: any) => entry.name)
    .filter((name: string) => {
      // Verify it has an index.ts file
      const indexPath = path.join(demosDir, name, 'index.ts');
      return fs.existsSync(indexPath);
    });
}

// Load narration JSON for a demo (Node.js version - no fetch API)
function loadNarrationJson(demoId: string): NarrationData | null {
  const narrationFile = path.join(__dirname, `../public/narration/${demoId}/narration.json`);
  
  if (!fs.existsSync(narrationFile)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(narrationFile, 'utf-8');
    return JSON.parse(content) as NarrationData;
  } catch (error: any) {
    console.warn(`⚠️  Failed to parse narration.json for '${demoId}': ${error.message}`);
    return null;
  }
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
async function loadDemoSlides(demoId: string): Promise<SlideComponentWithMetadata[]> {
  try {
    const slidesRegistryPath = `../src/demos/${demoId}/slides/SlidesRegistry.js`;
    const module = await import(slidesRegistryPath);
    const slides = module.allSlides || [];
    
    // Load and merge narration from JSON if available
    const narrationData = loadNarrationJson(demoId);
    
    if (narrationData) {
      console.log(`   📝 Loaded narration.json with ${narrationData.slides.length} slides`);
      return mergeNarrationIntoSlides(slides, narrationData);
    }
    
    return slides;
  } catch (error: any) {
    console.warn(`⚠️  Could not load slides for demo '${demoId}': ${error.message}`);
    return [];
  }
}

const loadCache = loadTtsCache;

// Scan for orphaned audio files and cache entries for a specific demo
function detectOrphanedAudio(
  demoId: string,
  outputDir: string,
  cacheFile: string,
  allSlides: SlideComponentWithMetadata[]
): {
  orphanedFiles: Array<{ filepath: string }>;
  orphanedCacheKeys: string[];
} {
  const cache = loadCache(cacheFile);
  const demoCache = cache[demoId] || {};
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

      const filename = `s${slideNum}_segment_${String(i + 1).padStart(2, '0')}_${segment.id}.wav`;
      const chapterDir = path.join(demoOutputDir, `c${chapter}`);
      const filepath = path.join(chapterDir, filename);
      const relativeFilepath = path.relative(demoOutputDir, filepath).replace(/\\/g, '/');
      expectedFiles.add(relativeFilepath);
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
        const relativeFilepath = path.relative(demoOutputDir, filepath).replace(/\\/g, '/');
        
        if (!expectedFiles.has(relativeFilepath)) {
          result.orphanedFiles.push({ filepath: relativeFilepath });
        }
      }
    }
  }

  // Check cache for orphaned entries
  for (const cacheKey of Object.keys(demoCache)) {
    const normalizedKey = cacheKey.replace(/\\/g, '/');
    if (!expectedFiles.has(normalizedKey)) {
      result.orphanedCacheKeys.push(cacheKey);
    }
  }

  return result;
}

// Check if narration has changed or file is missing for a specific demo
function detectChanges(
  demoId: string,
  outputDir: string,
  cacheFile: string,
  allSlides: SlideComponentWithMetadata[]
): {
  changedSegments: any[];
  missingFiles: any[];
  newSegments: number;
} {
  const cache = loadCache(cacheFile);
  const demoCache = cache[demoId] || {};
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
      const filename = `s${slideNum}_segment_${String(i + 1).padStart(2, '0')}_${segment.id}.wav`;
      const filepath = path.join(chapterDir, filename);
      const relativeFilepath = path.relative(demoOutputDir, filepath);
      
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
      if (!demoCache[relativeFilepath]) {
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
      if (stripMarkers(demoCache[relativeFilepath].narrationText) !== stripMarkers(segment.narrationText)) {
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
  outputDir: string,
  cacheFile: string,
  orphanedFiles: Array<{ filepath: string }>,
  missingFiles: Array<{ chapter: number; slide: number; segmentId: string; filepath: string }>,
  allSlides: SlideComponentWithMetadata[]
): Array<{ from: string; to: string }> {
  if (orphanedFiles.length === 0 || missingFiles.length === 0) return [];

  const cache = loadCache(cacheFile);
  const demoCache = cache[demoId] || {};
  const demoOutputDir = path.join(outputDir, demoId);

  // Build lookup: hash(narrationText + instruct) → orphan filepath
  const orphansByHash = new Map<string, string>();
  for (const orphan of orphanedFiles) {
    const normalizedPath = orphan.filepath.replace(/\\/g, '/');
    const cacheEntry = demoCache[normalizedPath] || demoCache[orphan.filepath];
    if (cacheEntry?.narrationText) {
      const instruct = (cacheEntry as any).instruct ?? '';
      const hash = crypto.createHash('sha256')
        .update(stripMarkers(cacheEntry.narrationText).trim() + '\0' + instruct)
        .digest('hex');
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
    const hash = crypto.createHash('sha256')
      .update(stripMarkers(segment.narrationText).trim() + '\0' + resolvedInstruct)
      .digest('hex');

    const orphanPath = orphansByHash.get(hash);
    if (orphanPath && !matchedOrphans.has(orphanPath)) {
      renameables.push({ from: orphanPath, to: missing.filepath.replace(/\\/g, '/') });
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
  const alignmentFile = path.join(__dirname, `../public/audio/${demoId}/alignment.json`);

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
  if (!fs.existsSync(alignmentFile)) {
    result.noAlignmentFile = true;
    result.missingMarkers = expectedMarkers.map(m => ({
      segment: `${m.slideKey}:${m.segmentId}`,
      markerId: m.markerId,
    }));
    return result;
  }

  const alignment: AlignmentData = JSON.parse(fs.readFileSync(alignmentFile, 'utf-8'));

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
  const cacheFile = path.join(__dirname, '../.tts-narration-cache.json');
  
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
    
    const allSlides = await loadDemoSlides(demoId);
    
    if (allSlides.length === 0) {
      console.log(`⚠️  No slides found for demo '${demoId}', skipping...\n`);
      continue;
    }
    
    // Check for orphaned files
    const orphaned = detectOrphanedAudio(demoId, outputDir, cacheFile, allSlides);
    
    // Check for changes
    const changes = detectChanges(demoId, outputDir, cacheFile, allSlides);
    
    const demoHasChanges = 
      orphaned.orphanedFiles.length > 0 ||
      orphaned.orphanedCacheKeys.length > 0 ||
      changes.changedSegments.length > 0 ||
      changes.missingFiles.length > 0;
    
    // Detect renameable files (orphans that match missing segments by content hash)
    const renameables = detectRenameableFiles(
      demoId, outputDir, cacheFile,
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
      const trueOrphans = orphaned.orphanedFiles.filter(f => !renameableFromPaths.has(f.filepath.replace(/\\/g, '/')));
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
      const trueMissing = changes.missingFiles.filter(f => !renameableToPaths.has(f.filepath.replace(/\\/g, '/')));
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