/**
 * Generate TTS audio for a single segment
 * Used by backend API for on-demand regeneration
 * 
 * Usage:
 *   tsx scripts/generate-single-tts.ts --demo <demo-id> --chapter <num> --slide <num> --segment-index <0-based> --segment <id> --text "<narration>"
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { TtsCacheStore } from './utils/tts-cache';
import axios from 'axios';
import { loadTtsServerUrl } from './utils/server-config';
import { stripMarkers } from './utils/marker-parser';
import {
  loadNarrationCache,
  saveNarrationCache,
  createEmptyCache,
  hashNarrationSegment,
  buildNarrationCacheKey,
  updateSegmentEntry,
} from './utils/narration-cache';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface SingleSegmentConfig {
  demoId: string;
  chapter: number;
  slide: number;
  segmentIndex: number;
  narrationText: string;
  serverUrl: string;
  instruct?: string;
}

// Generate TTS for a single segment
async function generateSingleSegment(config: SingleSegmentConfig): Promise<void> {
  console.log('🎙️  Single Segment TTS Generation');
  console.log('═'.repeat(50));
  console.log(`Demo:         ${config.demoId}`);
  console.log(`Location:     Ch${config.chapter}/S${config.slide}/Seg${config.segmentIndex}`);
  console.log(`Text:         "${config.narrationText.substring(0, 50)}..."`);
  if (config.instruct) {
    console.log(`Instruct:     "${config.instruct}"`);
  }
  console.log(`Server:       ${config.serverUrl}`);
  console.log('═'.repeat(50));
  console.log();

  // Check server health
  try {
    console.log('🔍 Checking TTS server...');
    const healthResponse = await axios.get(`${config.serverUrl}/health`, { timeout: 5000 });
    const health = healthResponse.data;
    console.log(`✅ Server is healthy (GPU: ${health.gpu_name || 'Unknown'})\n`);
  } catch (error: any) {
    console.error(`❌ Cannot connect to TTS server at ${config.serverUrl}`);
    console.error(`   Please ensure Python TTS server is running:`);
    console.error(`   cd tts && python server.py --voice-sample path/to/voice.wav\n`);
    process.exit(1);
  }

  // Construct output path
  const outputDir = path.join(__dirname, '../public/audio', config.demoId, `c${config.chapter}`);
  fs.mkdirSync(outputDir, { recursive: true });

  const cacheRelPath = TtsCacheStore.buildKey(config.chapter, config.slide, config.segmentIndex);
  const filename = path.basename(cacheRelPath);
  const filepath = path.join(outputDir, filename);

  try {
    console.log('🔊 Generating audio...');

    // Call TTS API
    const response = await axios.post(
      `${config.serverUrl}/generate`,
      {
        text: `Speaker 0: ${stripMarkers(config.narrationText)}`,
        ...(config.instruct ? { instruct: config.instruct } : {})
      },
      {
        timeout: 60000 // 1 minute timeout
      }
    );

    if (response.data.success) {
      const audioBase64 = response.data.audio;
      const audioBuffer = Buffer.from(audioBase64, 'base64');

      // Write audio file
      fs.writeFileSync(filepath, audioBuffer);
      console.log(`✅ Saved audio: ${path.relative(path.join(__dirname, '..'), filepath)}`);

      // Update TTS cache
      const store = TtsCacheStore.fromProjectRoot(path.join(__dirname, '..'));
      store.setEntry(config.demoId, cacheRelPath, config.narrationText, config.instruct);
      store.save();
      console.log('✅ Updated TTS cache');

      // Update narration cache
      let narrationCache = loadNarrationCache(config.demoId);
      if (!narrationCache) {
        narrationCache = createEmptyCache();
      }

      const key = buildNarrationCacheKey(config.chapter, config.slide, config.segmentIndex);
      const hash = hashNarrationSegment(config.narrationText, config.instruct);
      updateSegmentEntry(narrationCache, key, hash);
      saveNarrationCache(config.demoId, narrationCache);
      console.log('✅ Updated narration cache');

      console.log('\n✅ Single segment TTS generation complete!\n');
    } else {
      console.error(`❌ Server error: ${response.data.error || 'Unknown error'}`);
      process.exit(1);
    }
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Parse CLI arguments
function parseCLIArgs(): Partial<SingleSegmentConfig> {
  const args = process.argv.slice(2);
  const config: Partial<SingleSegmentConfig> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const value = args[i + 1];

    switch (arg) {
      case '--demo':
        config.demoId = value;
        i++;
        break;
      case '--chapter':
        config.chapter = parseInt(value, 10);
        i++;
        break;
      case '--slide':
        config.slide = parseInt(value, 10);
        i++;
        break;
      case '--segment-index':
        config.segmentIndex = parseInt(value, 10);
        i++;
        break;
      case '--text':
        config.narrationText = value;
        i++;
        break;
      case '--instruct':
        config.instruct = value;
        i++;
        break;
    }
  }

  return config;
}

// Main execution
const cliArgs = parseCLIArgs();

// Validate required arguments
if (
  !cliArgs.demoId ||
  cliArgs.chapter === undefined ||
  cliArgs.slide === undefined ||
  cliArgs.segmentIndex === undefined ||
  !cliArgs.narrationText
) {
  console.error('❌ Missing required arguments\n');
  console.log('Usage:');
  console.log('  tsx scripts/generate-single-tts.ts \\');
  console.log('    --demo <demo-id> \\');
  console.log('    --chapter <number> \\');
  console.log('    --slide <number> \\');
  console.log('    --segment-index <0-based index> \\');
  console.log('    --text "<narration text>" \\');
  console.log('    [--instruct "<style instruction>"]\n');
  console.log('Example:');
  console.log('  tsx scripts/generate-single-tts.ts \\');
  console.log('    --demo meeting-highlights \\');
  console.log('    --chapter 1 \\');
  console.log('    --slide 1 \\');
  console.log('    --segment-index 0 \\');
  console.log('    --text "Welcome to the presentation" \\');
  console.log('    --instruct "speak slowly and clearly"\n');
  process.exit(1);
}

const config: SingleSegmentConfig = {
  demoId: cliArgs.demoId!,
  chapter: cliArgs.chapter!,
  slide: cliArgs.slide!,
  segmentIndex: cliArgs.segmentIndex!,
  narrationText: cliArgs.narrationText!,
  serverUrl: process.env.TTS_SERVER_URL || loadTtsServerUrl(),
  instruct: cliArgs.instruct
};

generateSingleSegment(config).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});