/**
 * Narration Change Detection Script
 * 
 * Detects changes in narration.json files by comparing current content with cached hashes.
 * Prompts for TTS regeneration when changes are detected.
 * 
 * Usage:
 *   npm run check-narration              # Check all demos
 *   npm run check-narration -- --demo meeting-highlights  # Check specific demo
 *   npm run check-narration -- --verbose  # Verbose output
 *   npm run check-narration -- --auto-regenerate  # Auto-regenerate without prompt
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as readline from 'readline';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Narration JSON structure (from narrationLoader.ts)
interface NarrationSegment {
  id: string;
  narrationText: string;
  visualDescription?: string;
  notes?: string;
}

interface NarrationSlide {
  chapter: number;
  slide: number;
  title: string;
  segments: NarrationSegment[];
}

interface NarrationData {
  demoId: string;
  version: string;
  lastModified: string;
  slides: NarrationSlide[];
}

// Cache structure
interface NarrationCacheEntry {
  hash: string;
  lastChecked: string;
}

interface NarrationCache {
  version: string;
  generatedAt: string;
  segments: {
    [key: string]: NarrationCacheEntry;
  };
}

// Change detection types
interface NarrationChange {
  demoId: string;
  chapter: number;
  slide: number;
  segmentId: string;
  key: string; // "ch{chapter}:s{slide}:{segmentId}"
  changeType: 'modified' | 'new' | 'deleted';
  currentHash?: string;
  cachedHash?: string;
  narrationText?: string;
}

interface ChangeDetectionResult {
  hasChanges: boolean;
  demos: {
    [demoId: string]: {
      changes: NarrationChange[];
      unchangedCount: number;
    };
  };
}

/**
 * Generate SHA-256 hash for narration text
 */
function hashNarrationText(text: string): string {
  return crypto.createHash('sha256').update(text.trim()).digest('hex');
}

/**
 * Get all demo IDs by scanning the public/narration directory
 */
function getAllDemoIds(narrationDir: string): string[] {
  if (!fs.existsSync(narrationDir)) {
    return [];
  }

  const entries = fs.readdirSync(narrationDir, { withFileTypes: true });
  
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => {
      // Verify it has a narration.json file
      const narrationPath = path.join(narrationDir, name, 'narration.json');
      return fs.existsSync(narrationPath);
    });
}

/**
 * Load narration.json for a demo
 */
function loadNarrationJSON(demoId: string, narrationDir: string): NarrationData | null {
  const narrationPath = path.join(narrationDir, demoId, 'narration.json');
  
  if (!fs.existsSync(narrationPath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(narrationPath, 'utf-8');
    return JSON.parse(content) as NarrationData;
  } catch (error: any) {
    console.error(`  ❌ Failed to parse narration.json for "${demoId}": ${error.message}`);
    return null;
  }
}

/**
 * Load narration-cache.json for a demo
 */
function loadNarrationCache(demoId: string, narrationDir: string): NarrationCache | null {
  const cachePath = path.join(narrationDir, demoId, 'narration-cache.json');
  
  if (!fs.existsSync(cachePath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(cachePath, 'utf-8');
    return JSON.parse(content) as NarrationCache;
  } catch (error: any) {
    console.error(`  ⚠️  Failed to parse cache for "${demoId}": ${error.message}`);
    return null;
  }
}

/**
 * Compare narration.json with cache and detect changes
 */
function detectChanges(
  demoId: string,
  narrationData: NarrationData,
  cache: NarrationCache | null,
  verbose: boolean = false
): {
  changes: NarrationChange[];
  unchangedCount: number;
} {
  const changes: NarrationChange[] = [];
  const processedKeys = new Set<string>();
  let unchangedCount = 0;
  
  // If no cache exists, all segments are new
  if (!cache) {
    for (const slide of narrationData.slides) {
      for (const segment of slide.segments) {
        const key = `ch${slide.chapter}:s${slide.slide}:${segment.id}`;
        changes.push({
          demoId,
          chapter: slide.chapter,
          slide: slide.slide,
          segmentId: segment.id,
          key,
          changeType: 'new',
          currentHash: hashNarrationText(segment.narrationText),
          narrationText: segment.narrationText
        });
        processedKeys.add(key);
      }
    }
    return { changes, unchangedCount: 0 };
  }
  
  // Check each segment in narration.json
  for (const slide of narrationData.slides) {
    for (const segment of slide.segments) {
      const key = `ch${slide.chapter}:s${slide.slide}:${segment.id}`;
      const currentHash = hashNarrationText(segment.narrationText);
      const cachedEntry = cache.segments[key];
      
      processedKeys.add(key);
      
      if (!cachedEntry) {
        // NEW: Segment exists in JSON but not in cache
        changes.push({
          demoId,
          chapter: slide.chapter,
          slide: slide.slide,
          segmentId: segment.id,
          key,
          changeType: 'new',
          currentHash,
          narrationText: segment.narrationText
        });
        if (verbose) {
          console.log(`    ➕ NEW: ${key}`);
        }
      } else if (currentHash !== cachedEntry.hash) {
        // MODIFIED: Hash mismatch
        changes.push({
          demoId,
          chapter: slide.chapter,
          slide: slide.slide,
          segmentId: segment.id,
          key,
          changeType: 'modified',
          currentHash,
          cachedHash: cachedEntry.hash,
          narrationText: segment.narrationText
        });
        if (verbose) {
          console.log(`    🔄 MODIFIED: ${key}`);
        }
      } else {
        // Unchanged
        unchangedCount++;
        if (verbose) {
          console.log(`    ✅ UNCHANGED: ${key}`);
        }
      }
    }
  }
  
  // Check for deleted segments (in cache but not in JSON)
  for (const cacheKey of Object.keys(cache.segments)) {
    if (!processedKeys.has(cacheKey)) {
      // Parse the key to extract chapter/slide/segmentId
      const match = cacheKey.match(/^ch(\d+):s(\d+):(.+)$/);
      if (match) {
        changes.push({
          demoId,
          chapter: parseInt(match[1]),
          slide: parseInt(match[2]),
          segmentId: match[3],
          key: cacheKey,
          changeType: 'deleted',
          cachedHash: cache.segments[cacheKey].hash
        });
        if (verbose) {
          console.log(`    ❌ DELETED: ${cacheKey}`);
        }
      }
    }
  }
  
  return { changes, unchangedCount };
}

/**
 * Generate detailed change report for a demo
 */
function reportDemoChanges(demoId: string, changes: NarrationChange[], unchangedCount: number): void {
  const modifiedChanges = changes.filter(c => c.changeType === 'modified');
  const newChanges = changes.filter(c => c.changeType === 'new');
  const deletedChanges = changes.filter(c => c.changeType === 'deleted');
  
  console.log(`\n📊 Results for "${demoId}":`);
  
  if (changes.length === 0) {
    console.log(`   ✅ All ${unchangedCount} segments unchanged`);
    return;
  }
  
  if (unchangedCount > 0) {
    console.log(`   ✅ ${unchangedCount} segments unchanged`);
  }
  
  if (modifiedChanges.length > 0) {
    console.log(`   ⚠️  ${modifiedChanges.length} segment(s) modified:`);
    modifiedChanges.slice(0, 5).forEach(change => {
      console.log(`      - ${change.key} (text changed)`);
    });
    if (modifiedChanges.length > 5) {
      console.log(`      ... and ${modifiedChanges.length - 5} more`);
    }
  }
  
  if (newChanges.length > 0) {
    console.log(`   ➕ ${newChanges.length} new segment(s):`);
    newChanges.slice(0, 5).forEach(change => {
      console.log(`      - ${change.key} (not in cache)`);
    });
    if (newChanges.length > 5) {
      console.log(`      ... and ${newChanges.length - 5} more`);
    }
  }
  
  if (deletedChanges.length > 0) {
    console.log(`   ❌ ${deletedChanges.length} deleted segment(s):`);
    deletedChanges.slice(0, 5).forEach(change => {
      console.log(`      - ${change.key} (removed from narration.json)`);
    });
    if (deletedChanges.length > 5) {
      console.log(`      ... and ${deletedChanges.length - 5} more`);
    }
  }
}

/**
 * Prompt user for confirmation
 */
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

/**
 * Main check function
 */
async function checkNarration(): Promise<void> {
  const args = process.argv.slice(2);
  const demoIndex = args.indexOf('--demo');
  const demoFilter = demoIndex !== -1 && args[demoIndex + 1] ? args[demoIndex + 1] : undefined;
  const verbose = args.includes('--verbose');
  const autoRegenerate = args.includes('--auto-regenerate');
  
  const narrationDir = path.join(__dirname, '../public/narration');
  
  console.log('🔍 Checking narration changes...\n');
  
  // Get all demos
  const allDemoIds = getAllDemoIds(narrationDir);
  const demosToCheck = demoFilter
    ? allDemoIds.filter(id => id === demoFilter)
    : allDemoIds;
  
  if (demosToCheck.length === 0) {
    if (demoFilter) {
      console.error(`❌ Demo '${demoFilter}' not found.`);
      console.log(`\nAvailable demos: ${allDemoIds.join(', ')}\n`);
    } else {
      console.log('⚠️  No demos with narration.json found in public/narration/\n');
    }
    process.exit(0);
  }
  
  console.log(`✅ Scanning demos:`);
  demosToCheck.forEach(id => console.log(`   - ${id}`));
  
  const result: ChangeDetectionResult = {
    hasChanges: false,
    demos: {}
  };
  
  // Check each demo
  for (const demoId of demosToCheck) {
    if (verbose) {
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`📁 Checking demo: ${demoId}`);
      console.log('─'.repeat(60));
    }
    
    const narrationData = loadNarrationJSON(demoId, narrationDir);
    
    if (!narrationData) {
      console.log(`\n⚠️  No narration.json found for demo '${demoId}', skipping...`);
      continue;
    }
    
    const cache = loadNarrationCache(demoId, narrationDir);
    
    if (!cache && verbose) {
      console.log(`  ℹ️  No cache found for "${demoId}" - all segments will be marked as new`);
    }
    
    const { changes, unchangedCount } = detectChanges(demoId, narrationData, cache, verbose);
    
    if (changes.length > 0) {
      result.hasChanges = true;
      result.demos[demoId] = { changes, unchangedCount };
      
      if (!verbose) {
        reportDemoChanges(demoId, changes, unchangedCount);
      }
    } else {
      if (!verbose) {
        console.log(`\n📊 Results for "${demoId}":`);
        console.log(`   ✅ All ${unchangedCount} segments unchanged`);
      }
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(60));
  
  if (!result.hasChanges) {
    console.log('✅ All narration content is up-to-date!');
    console.log('═'.repeat(60));
    console.log('\n   No changes detected in any demo.\n');
    process.exit(0);
  }
  
  // Changes detected
  console.log('⚠️  Narration changes detected!');
  console.log('═'.repeat(60));
  
  const demosWithChanges = Object.keys(result.demos);
  const totalChanges = Object.values(result.demos).reduce((sum, demo) => sum + demo.changes.length, 0);
  
  console.log(`\n   Demos affected: ${demosWithChanges.join(', ')}`);
  console.log(`   Total changes: ${totalChanges} segments\n`);
  
  // Prompt for TTS regeneration
  const shouldRegenerate = autoRegenerate || await promptUser('Would you like to regenerate TTS audio for changed segments? (y/n): ');
  
  if (shouldRegenerate) {
    console.log('\n⚠️  TTS regeneration integration coming in Phase 6.');
    console.log('   For now, please run: npm run tts:generate\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Skipping TTS regeneration.');
    console.log('   Note: Audio files may be out of sync with narration text.\n');
    process.exit(0);
  }
}

// Run check
checkNarration().catch((error) => {
  console.error('Error checking narration:', error);
  process.exit(1);
});