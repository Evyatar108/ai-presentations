// Pre-run TTS cache validation script
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as readline from 'readline';
import { execSync } from 'child_process';
import { allSlides } from '../src/slides/SlidesRegistry';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface NarrationCache {
  [filepath: string]: {
    narrationText: string;
    generatedAt: string;
  };
}

interface ChangeDetectionResult {
  hasChanges: boolean;
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
}

// Scan for orphaned audio files and cache entries
function detectOrphanedAudio(outputDir: string, cacheFile: string): {
  orphanedFiles: Array<{ filepath: string }>;
  orphanedCacheKeys: string[];
} {
  const cache = loadCache(cacheFile);
  const result = {
    orphanedFiles: [] as Array<{ filepath: string }>,
    orphanedCacheKeys: [] as string[]
  };

  // Build set of expected filepaths from all slides
  const expectedFiles = new Set<string>();
  for (const slide of allSlides) {
    const { chapter, slide: slideNum, audioSegments } = slide.metadata;
    if (!audioSegments || audioSegments.length === 0) continue;

    for (let i = 0; i < audioSegments.length; i++) {
      const segment = audioSegments[i];
      if (!segment.narrationText) continue;

      const filename = `s${slideNum}_segment_${String(i + 1).padStart(2, '0')}_${segment.id}.wav`;
      const chapterDir = path.join(outputDir, `c${chapter}`);
      const filepath = path.join(chapterDir, filename);
      const relativeFilepath = path.relative(outputDir, filepath).replace(/\\/g, '/');
      expectedFiles.add(relativeFilepath);
    }
  }

  // Scan audio directories for actual files
  if (fs.existsSync(outputDir)) {
    const chapterDirs = fs.readdirSync(outputDir).filter((name: string) =>
      name.startsWith('c') && fs.statSync(path.join(outputDir, name)).isDirectory()
    );

    for (const chapterDir of chapterDirs) {
      const chapterPath = path.join(outputDir, chapterDir);
      if (!fs.existsSync(chapterPath)) continue;
      
      const files = fs.readdirSync(chapterPath);
      
      for (const file of files) {
        if (!file.endsWith('.wav')) continue;
        
        const filepath = path.join(chapterPath, file);
        const relativeFilepath = path.relative(outputDir, filepath).replace(/\\/g, '/');
        
        if (!expectedFiles.has(relativeFilepath)) {
          result.orphanedFiles.push({ filepath: relativeFilepath });
        }
      }
    }
  }

  // Check cache for orphaned entries
  for (const cacheKey of Object.keys(cache)) {
    const normalizedKey = cacheKey.replace(/\\/g, '/');
    if (!expectedFiles.has(normalizedKey)) {
      result.orphanedCacheKeys.push(cacheKey);
    }
  }

  return result;
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

// Check if narration has changed or file is missing
function detectChanges(outputDir: string, cacheFile: string): ChangeDetectionResult {
  const cache = loadCache(cacheFile);
  const result: ChangeDetectionResult = {
    hasChanges: false,
    changedSegments: [],
    missingFiles: [],
    newSegments: 0,
    orphanedFiles: [],
    orphanedCacheKeys: []
  };

  for (const slide of allSlides) {
    const { chapter, slide: slideNum, audioSegments } = slide.metadata;
    
    if (!audioSegments || audioSegments.length === 0) continue;
    
    const chapterDir = path.join(outputDir, `c${chapter}`);
    
    for (let i = 0; i < audioSegments.length; i++) {
      const segment = audioSegments[i];
      
      // Skip if no narration text
      if (!segment.narrationText) continue;
      
      // Generate expected filepath
      const filename = `s${slideNum}_segment_${String(i + 1).padStart(2, '0')}_${segment.id}.wav`;
      const filepath = path.join(chapterDir, filename);
      const relativeFilepath = path.relative(outputDir, filepath);
      
      // Check if file exists
      if (!fs.existsSync(filepath)) {
        result.hasChanges = true;
        result.missingFiles.push({
          chapter,
          slide: slideNum,
          segmentId: segment.id,
          filepath: relativeFilepath
        });
        continue;
      }
      
      // Check if this segment is in cache
      if (!cache[relativeFilepath]) {
        result.hasChanges = true;
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
      if (cache[relativeFilepath].narrationText !== segment.narrationText) {
        result.hasChanges = true;
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
  
  console.log('🔍 Checking TTS cache for changes...\n');
  
  // Check for orphaned files first
  const orphaned = detectOrphanedAudio(outputDir, cacheFile);
  if (orphaned.orphanedFiles.length > 0 || orphaned.orphanedCacheKeys.length > 0) {
    console.log('⚠️  Found unused audio files and/or cache entries:\n');
    
    if (orphaned.orphanedFiles.length > 0) {
      console.log(`📁 Orphaned audio files: ${orphaned.orphanedFiles.length}`);
      orphaned.orphanedFiles.slice(0, 5).forEach(item => {
        console.log(`   - ${item.filepath}`);
      });
      if (orphaned.orphanedFiles.length > 5) {
        console.log(`   ... and ${orphaned.orphanedFiles.length - 5} more`);
      }
      console.log();
    }
    
    if (orphaned.orphanedCacheKeys.length > 0) {
      console.log(`🗑️  Orphaned cache entries: ${orphaned.orphanedCacheKeys.length}`);
      orphaned.orphanedCacheKeys.slice(0, 5).forEach(key => {
        console.log(`   - ${key}`);
      });
      if (orphaned.orphanedCacheKeys.length > 5) {
        console.log(`   ... and ${orphaned.orphanedCacheKeys.length - 5} more`);
      }
      console.log();
    }
    
    const shouldCleanup = await promptUser('Do you want to remove these unused files? (y/n): ');
    
    if (shouldCleanup) {
      console.log('\n🗑️  Cleaning up unused files...\n');
      const cache = loadCache(cacheFile);
      
      // Delete orphaned files
      for (const item of orphaned.orphanedFiles) {
        const fullPath = path.join(outputDir, item.filepath);
        try {
          fs.unlinkSync(fullPath);
          console.log(`✅ Deleted: ${item.filepath}`);
        } catch (error: any) {
          console.error(`❌ Failed to delete ${item.filepath}: ${error.message}`);
        }
      }
      
      // Remove orphaned cache entries
      for (const key of orphaned.orphanedCacheKeys) {
        delete cache[key];
      }
      
      // Save updated cache
      if (orphaned.orphanedFiles.length > 0 || orphaned.orphanedCacheKeys.length > 0) {
        fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
        console.log(`\n💾 Cleaned up ${orphaned.orphanedFiles.length} files and ${orphaned.orphanedCacheKeys.length} cache entries\n`);
      }
    } else {
      console.log('\n⏭️  Skipping cleanup of unused files...\n');
    }
  }
  
  // Now check for changes in existing slides
  const result = detectChanges(outputDir, cacheFile);
  
  if (!result.hasChanges) {
    console.log('✅ All audio files are up-to-date!\n');
    console.log('   Cache matches current narration text.');
    console.log('   Starting React application...\n');
    process.exit(0); // Success - continue to run app
  }
  
  // Changes detected - show details
  console.log('⚠️  Audio regeneration needed!\n');
  
  if (result.missingFiles.length > 0) {
    console.log(`📁 Missing audio files: ${result.missingFiles.length}`);
    result.missingFiles.slice(0, 5).forEach(item => {
      console.log(`   - Ch${item.chapter}/S${item.slide} (${item.segmentId})`);
    });
    if (result.missingFiles.length > 5) {
      console.log(`   ... and ${result.missingFiles.length - 5} more`);
    }
    console.log();
  }
  
  if (result.changedSegments.length > 0) {
    console.log(`🔄 Changed narrations: ${result.changedSegments.length}`);
    result.changedSegments.slice(0, 5).forEach(item => {
      console.log(`   - Ch${item.chapter}/S${item.slide} (${item.segmentId}): ${item.reason}`);
    });
    if (result.changedSegments.length > 5) {
      console.log(`   ... and ${result.changedSegments.length - 5} more`);
    }
    console.log();
  }
  
  if (result.newSegments > 0) {
    console.log(`✨ New segments to generate: ${result.newSegments}\n`);
  }
  
  // Prompt user
  const shouldRegenerate = await promptUser('Do you want to regenerate? (y/n): ');
  
  if (shouldRegenerate) {
    console.log('\n🔊 Starting TTS generation (smart cache - only changed segments)...\n');
    try {
      // Run TTS generation script with --skip-existing flag for smart caching
      execSync('npm run tts:generate -- --skip-existing', {
        stdio: 'inherit', // Show output in real-time
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