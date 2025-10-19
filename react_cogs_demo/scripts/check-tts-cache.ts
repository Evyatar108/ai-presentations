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
    newSegments: 0
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
    console.log('\n🔊 Starting TTS generation...\n');
    try {
      // Run TTS generation script
      execSync('npm run tts:generate', {
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