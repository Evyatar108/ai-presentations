/**
 * Generate TTS audio for a single segment
 * Used by backend API for on-demand regeneration
 * 
 * Usage:
 *   tsx scripts/generate-single-tts.ts --demo <demo-id> --chapter <num> --slide <num> --segment <id> --text "<narration>"
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { loadTtsCache, saveTtsCache, normalizeCachePath } from './utils/tts-cache';
import axios from 'axios';
import * as crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface SingleSegmentConfig {
  demoId: string;
  chapter: number;
  slide: number;
  segmentId: string;
  narrationText: string;
  serverUrl: string;
  instruct?: string;
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

// Generate TTS for a single segment
async function generateSingleSegment(config: SingleSegmentConfig): Promise<void> {
  console.log('🎙️  Single Segment TTS Generation');
  console.log('═'.repeat(50));
  console.log(`Demo:         ${config.demoId}`);
  console.log(`Location:     Ch${config.chapter}/S${config.slide}/${config.segmentId}`);
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

  const filename = `s${config.slide}_segment_${config.segmentId}.wav`;
  const filepath = path.join(outputDir, filename);

  try {
    console.log('🔊 Generating audio...');

    // Call TTS API
    const response = await axios.post(
      `${config.serverUrl}/generate`,
      {
        text: `Speaker 0: ${config.narrationText}`,
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
      const cacheFile = path.join(__dirname, '../.tts-narration-cache.json');
      const cache = loadTtsCache(cacheFile);

      if (!cache[config.demoId]) {
        cache[config.demoId] = {};
      }

      const relativeFilepath = normalizeCachePath(path.relative(
        path.join(__dirname, '../public/audio', config.demoId),
        filepath
      ));

      cache[config.demoId][relativeFilepath] = {
        narrationText: config.narrationText,
        generatedAt: new Date().toISOString()
      };

      saveTtsCache(cacheFile, cache);
      console.log('✅ Updated TTS cache');

      // Update narration cache
      const narrationCacheFile = path.join(
        __dirname,
        '../public/narration',
        config.demoId,
        'narration-cache.json'
      );

      if (fs.existsSync(path.dirname(narrationCacheFile))) {
        let narrationCache: any = {
          version: '1.0',
          generatedAt: new Date().toISOString(),
          segments: {}
        };

        if (fs.existsSync(narrationCacheFile)) {
          try {
            narrationCache = JSON.parse(fs.readFileSync(narrationCacheFile, 'utf-8'));
          } catch (error) {
            console.warn('⚠️  Could not load narration cache, creating new entry');
          }
        }

        const key = `ch${config.chapter}:s${config.slide}:${config.segmentId}`;
        const hash = crypto.createHash('sha256').update(config.narrationText.trim()).digest('hex');

        narrationCache.segments[key] = {
          hash,
          lastChecked: new Date().toISOString()
        };
        narrationCache.generatedAt = new Date().toISOString();

        fs.writeFileSync(narrationCacheFile, JSON.stringify(narrationCache, null, 2));
        console.log('✅ Updated narration cache');
      }

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
      case '--segment':
        config.segmentId = value;
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
  !cliArgs.segmentId ||
  !cliArgs.narrationText
) {
  console.error('❌ Missing required arguments\n');
  console.log('Usage:');
  console.log('  tsx scripts/generate-single-tts.ts \\');
  console.log('    --demo <demo-id> \\');
  console.log('    --chapter <number> \\');
  console.log('    --slide <number> \\');
  console.log('    --segment <segment-id> \\');
  console.log('    --text "<narration text>" \\');
  console.log('    [--instruct "<style instruction>"]\n');
  console.log('Example:');
  console.log('  tsx scripts/generate-single-tts.ts \\');
  console.log('    --demo meeting-highlights \\');
  console.log('    --chapter 1 \\');
  console.log('    --slide 2 \\');
  console.log('    --segment intro \\');
  console.log('    --text "Welcome to the presentation" \\');
  console.log('    --instruct "speak slowly and clearly"\n');
  process.exit(1);
}

const config: SingleSegmentConfig = {
  demoId: cliArgs.demoId!,
  chapter: cliArgs.chapter!,
  slide: cliArgs.slide!,
  segmentId: cliArgs.segmentId!,
  narrationText: cliArgs.narrationText!,
  serverUrl: process.env.TTS_SERVER_URL || loadServerConfig(),
  instruct: cliArgs.instruct
};

generateSingleSegment(config).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});