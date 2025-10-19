import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
import { allSlides } from '../src/slides/SlidesRegistry';
import { AudioSegment } from '../src/slides/SlideMetadata';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
interface TTSConfig {
  serverUrl: string;          // Python TTS server URL
  outputDir: string;          // public/audio
  skipExisting: boolean;      // Skip files that already exist
  batchSize: number;          // Number of segments per batch request
  cacheFile: string;          // Path to narration cache file
}

interface NarrationCache {
  [filepath: string]: {
    narrationText: string;
    generatedAt: string;
  };
}

interface SegmentToGenerate {
  chapter: number;
  slide: number;
  segmentIndex: number;
  segment: AudioSegment;
  filename: string;
  filepath: string;
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

// Main function with batch processing
async function generateTTS(config: TTSConfig) {
  console.log('🎙️  Starting TTS Batch Generation...\n');
  
  // Load cache
  const cache = loadCache(config.cacheFile);
  
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
  
  // Collect all segments that need generation
  const segmentsToGenerate: SegmentToGenerate[] = [];
  let totalSegments = 0;
  let skippedCount = 0;
  
  console.log('Scanning slides for segments to generate...\n');
  
  for (const slide of allSlides) {
    const { chapter, slide: slideNum, title, audioSegments } = slide.metadata;
    
    if (!audioSegments || audioSegments.length === 0) continue;
    
    // Create chapter directory
    const chapterDir = path.join(config.outputDir, `c${chapter}`);
    fs.mkdirSync(chapterDir, { recursive: true });
    
    // Check each segment
    for (let i = 0; i < audioSegments.length; i++) {
      const segment = audioSegments[i];
      totalSegments++;
      
      // Skip if no narration text
      if (!segment.narrationText) {
        console.log(`⚠️  Ch${chapter}/S${slideNum} Segment ${i + 1}: No narration text`);
        skippedCount++;
        continue;
      }
      
      // Generate filename
      const filename = `s${slideNum}_segment_${String(i + 1).padStart(2, '0')}_${segment.id}.wav`;
      const filepath = path.join(chapterDir, filename);
      const relativeFilepath = path.relative(config.outputDir, filepath);
      
      // Check if we should skip this segment
      let shouldSkip = false;
      
      if (config.skipExisting && fs.existsSync(filepath)) {
        // File exists - check if narration has changed
        const cachedEntry = cache[relativeFilepath];
        if (cachedEntry && cachedEntry.narrationText === segment.narrationText) {
          // Narration hasn't changed - skip
          shouldSkip = true;
          skippedCount++;
        }
        // If narration changed or not in cache, regenerate
      }
      
      if (shouldSkip) {
        continue;
      }
      
      // Add to generation queue
      segmentsToGenerate.push({
        chapter,
        slide: slideNum,
        segmentIndex: i,
        segment,
        filename,
        filepath
      });
    }
  }
  
  console.log(`Found ${segmentsToGenerate.length} segments to generate (${skippedCount} skipped)\n`);
  
  if (segmentsToGenerate.length === 0) {
    console.log('✅ No segments need generation. All done!\n');
    return;
  }
  
  // Process in batches
  let generatedCount = 0;
  let errorCount = 0;
  const batches = chunkArray(segmentsToGenerate, config.batchSize);
  
  console.log(`Processing ${batches.length} batches (${config.batchSize} segments per batch)...\n`);
  
  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    const batchNum = batchIdx + 1;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 Batch ${batchNum}/${batches.length} (${batch.length} segments)`);
    console.log('='.repeat(60));
    
    // Show what's in this batch
    batch.forEach((item, idx) => {
      const preview = item.segment.narrationText!.substring(0, 50);
      console.log(`  ${idx + 1}. Ch${item.chapter}/S${item.slide} (${item.segment.id}): "${preview}..."`);
    });
    
    try {
      console.log(`\n🔊 Sending batch request to server...`);
      
      // Prepare texts for batch request (matches Python client format)
      const texts = batch.map(item => `Speaker 0: ${item.segment.narrationText}`);
      
      // Call batch endpoint
      const response = await axios.post(`${config.serverUrl}/generate_batch`, {
        texts
      }, {
        timeout: 900000 // 15 minute timeout for batch
      });
      
      if (response.data.success) {
        const audios = response.data.audios; // Array of base64-encoded WAV files
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
          const relativeFilepath = path.relative(config.outputDir, item.filepath);
          cache[relativeFilepath] = {
            narrationText: item.segment.narrationText!,
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
    const progressPct = ((batchNum / batches.length) * 100).toFixed(1);
    console.log(`\n📊 Progress: ${generatedCount}/${segmentsToGenerate.length} segments (${progressPct}%)`);
  }
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TTS Batch Generation Summary');
  console.log('='.repeat(60));
  console.log(`Total segments scanned: ${totalSegments}`);
  console.log(`⏭️  Skipped (already exist): ${skippedCount}`);
  console.log(`✅ Generated: ${generatedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📦 Batches processed: ${batches.length}`);
  console.log('='.repeat(60) + '\n');
  
  // Save updated cache
  if (generatedCount > 0) {
    saveCache(config.cacheFile, cache);
    console.log(`💾 Cache updated with ${generatedCount} new entries\n`);
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

// CLI execution
const config: TTSConfig = {
  serverUrl: process.env.TTS_SERVER_URL || loadServerConfig(),
  outputDir: path.join(__dirname, '../public/audio'),
  skipExisting: process.argv.includes('--skip-existing'),
  batchSize: parseInt(process.env.BATCH_SIZE || '10', 10), // 10 segments per batch
  cacheFile: path.join(__dirname, '../.tts-narration-cache.json')
};

generateTTS(config).catch(console.error);