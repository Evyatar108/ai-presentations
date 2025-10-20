// Pre-run TTS cache validation script with multi-demo support
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as readline from 'readline';
import { execSync } from 'child_process';
import { SlideComponentWithMetadata } from '../src/slides/SlideMetadata';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface NarrationCache {
  [demoId: string]: {
    [filepath: string]: {
      narrationText: string;
      generatedAt: string;
    };
  };
}

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
    };
  };
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
      
      // Check if narration changed
      if (demoCache[relativeFilepath].narrationText !== segment.narrationText) {
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

// Main check function
async function checkTTSCache(): Promise<void> {
  const outputDir = path.join(__dirname, '../public/audio');
  const cacheFile = path.join(__dirname, '../.tts-narration-cache.json');
  
  console.log('🔍 Checking TTS cache for changes (Multi-Demo)...\n');
  
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
    
    if (demoHasChanges) {
      result.hasChanges = true;
      result.demos[demoId] = {
        changedSegments: changes.changedSegments,
        missingFiles: changes.missingFiles,
        newSegments: changes.newSegments,
        orphanedFiles: orphaned.orphanedFiles,
        orphanedCacheKeys: orphaned.orphanedCacheKeys
      };
      
      // Report issues
      if (orphaned.orphanedFiles.length > 0) {
        console.log(`\n⚠️  Orphaned audio files: ${orphaned.orphanedFiles.length}`);
        orphaned.orphanedFiles.slice(0, 3).forEach(item => {
          console.log(`   - ${item.filepath}`);
        });
        if (orphaned.orphanedFiles.length > 3) {
          console.log(`   ... and ${orphaned.orphanedFiles.length - 3} more`);
        }
      }
      
      if (changes.missingFiles.length > 0) {
        console.log(`\n📁 Missing audio files: ${changes.missingFiles.length}`);
        changes.missingFiles.slice(0, 3).forEach(item => {
          console.log(`   - Ch${item.chapter}/S${item.slide} (${item.segmentId})`);
        });
        if (changes.missingFiles.length > 3) {
          console.log(`   ... and ${changes.missingFiles.length - 3} more`);
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
  
  if (!result.hasChanges) {
    console.log('\n' + '═'.repeat(60));
    console.log('✅ All demos are up-to-date!');
    console.log('═'.repeat(60));
    console.log('\n   Cache matches current narration text.');
    console.log('   Starting React application...\n');
    process.exit(0);
  }
  
  // Changes detected - prompt user
  console.log('\n' + '═'.repeat(60));
  console.log('⚠️  Audio regeneration needed!');
  console.log('═'.repeat(60));
  
  const demosWithChanges = Object.keys(result.demos);
  console.log(`\nDemos affected: ${demosWithChanges.join(', ')}\n`);
  
  const shouldRegenerate = await promptUser('Do you want to regenerate? (y/n): ');
  
  if (shouldRegenerate) {
    console.log('\n🔊 Starting TTS generation (smart cache - only changed segments)...\n');
    try {
      // Run TTS generation script with --skip-existing flag for smart caching
      execSync('npm run tts:generate -- --skip-existing', {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      console.log('\n✅ Audio regeneration complete! Starting app...\n');
      process.exit(0);
    } catch (error) {
      console.error('\n❌ TTS generation failed. Please check the error above.\n');
      process.exit(1);
    }
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