# TTS Generation & Duration Calculation Plan

## Overview

Create two new npm scripts for the React project:
1. **`npm run tts:generate`** - Generate TTS audio files for all slide segments
2. **`npm run tts:duration`** - Calculate and report durations for all slides and segments

## Architecture

### Existing TTS Infrastructure
The project already has a **Python TTS client/server** system:
- **[`tts/server.py`](../tts/server.py)** - Flask server running VibeVoice model on GPU
  - `/health` - Health check endpoint
  - `/generate` - Generate single audio from text (returns base64-encoded WAV)
  - `/generate_batch` - Generate multiple audios in one batch request
- **[`tts/client.py`](../tts/client.py)** - Python client that communicates with server
  - Supports individual, batch, and concatenated generation modes
  - Parses SRT-format transcript files

### Technology Stack
- **TypeScript** - For type safety and integration with existing codebase
- **Node.js** - Runtime for scripts
- **HTTP Client (axios)** - To communicate with existing Python TTS server
- **Audio Processing (get-audio-duration)** - To calculate WAV durations

### File Structure

```
react_cogs_demo/
├── scripts/
│   ├── generate-tts.ts          # Main TTS generation script
│   ├── calculate-durations.ts   # Duration calculation script
│   └── tts-config.ts            # Shared configuration
├── public/audio/
│   ├── c1/                      # Chapter 1 audio files
│   ├── c2/                      # Chapter 2 audio files
│   └── ...
└── package.json                 # Updated with new scripts
```

## Component 1: TTS Generation Script

### Purpose
Generate audio files for all slide segments by:
1. Reading slide metadata from [`SlidesRegistry.ts`](src/slides/SlidesRegistry.ts)
2. Extracting `narrationText` from each `audioSegment`
3. Sending text to Python TTS server
4. Saving audio files in organized directory structure

### Implementation: `scripts/generate-tts.ts`

```typescript
// Imports
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { allSlides } from '../src/slides/SlidesRegistry';
import { AudioSegment } from '../src/slides/SlideMetadata';

// Configuration
interface TTSConfig {
  serverUrl: string;          // Python TTS server URL
  outputDir: string;          // public/audio
  skipExisting: boolean;      // Skip files that already exist
  batchSize: number;          // Number of segments per batch request
}

interface SegmentToGenerate {
  chapter: number;
  slide: number;
  segmentIndex: number;
  segment: AudioSegment;
  filename: string;
  filepath: string;
}

// Main function with batch processing
async function generateTTS(config: TTSConfig) {
  console.log('🎙️  Starting TTS Batch Generation...\n');
  
  // Check server health
  console.log(`Connecting to TTS server at ${config.serverUrl}...`);
  try {
    const healthResponse = await axios.get(`${config.serverUrl}/health`, { timeout: 5000 });
    const health = healthResponse.data;
    console.log(`✅ Server is healthy`);
    console.log(`   Model loaded: ${health.model_loaded}`);
    console.log(`   GPU: ${health.gpu_name || 'Unknown'}\n`);
  } catch (error) {
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
      
      // Skip if file exists
      if (config.skipExisting && fs.existsSync(filepath)) {
        skippedCount++;
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
        }
        
      } else {
        console.error(`❌ Server error: ${response.data.error || 'Unknown error'}`);
        errorCount += batch.length;
      }
      
    } catch (error) {
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
}

// Utility function to split array into chunks
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// CLI execution
const config: TTSConfig = {
  serverUrl: process.env.TTS_SERVER_URL || 'http://localhost:5000',
  outputDir: path.join(__dirname, '../public/audio'),
  skipExisting: process.argv.includes('--skip-existing'),
  batchSize: parseInt(process.env.BATCH_SIZE || '10', 10) // 10 segments per batch
};

generateTTS(config).catch(console.error);
```

### Batch Processing Strategy

**Why Batch?**
- **Efficiency**: Server processes multiple segments in one request
- **Speed**: GPU can parallelize generation across batch
- **Network**: Fewer HTTP requests = less overhead
- **Progress**: Clear visibility into batch-by-batch progress

**Batch Size:**
- Default: **10 segments per batch**
- Configurable via `BATCH_SIZE` environment variable
- Trade-off: Larger batches = faster but longer timeout risk

**Error Handling:**
- If batch fails, all segments in that batch are marked as errors
- Can re-run with `--skip-existing` to retry failed batches only

### Features
- **Batch processing** - Generates 10 segments per batch for efficiency
- **Progress tracking** - Shows batch-by-batch progress with percentages
- **Error handling** - Continues on batch errors, reports at end
- **Skip existing** - Optional flag to avoid regenerating existing files
- **Organized output** - Files saved as `public/audio/cX/sY_segment_ZZ_id.wav`
- **Summary report** - Total generated, skipped, errors, batches processed

### Usage
```bash
# 1. Start Python TTS server (in separate terminal)
cd tts
python server.py --voice-sample path/to/voice.wav

# 2. Generate all audio files using batch processing
cd react_cogs_demo
npm run tts:generate

# Example output:
# 🎙️  Starting TTS Batch Generation...
# Connecting to TTS server at http://localhost:5000...
# ✅ Server is healthy
#    Model loaded: true
#    GPU: NVIDIA GeForce RTX 4090
#
# Scanning slides for segments to generate...
# Found 160 segments to generate (0 skipped)
#
# Processing 16 batches (10 segments per batch)...
#
# ============================================================
# 📦 Batch 1/16 (10 segments)
# ============================================================
#   1. Ch1/S1 (intro): "Meeting Highlights is a new..."
#   2. Ch1/S1 (ai_generation): "It uses AI to automatically..."
#   ...
#   10. Ch1/S2 (player): "BizChat will return a reply..."
#
# 🔊 Sending batch request to server...
# ✅ Received 10 audio files from server
#    Sample rate: 24000 Hz
#
#   ✅ [1/10] Saved: s1_segment_01_intro.wav
#   ✅ [2/10] Saved: s1_segment_02_ai_generation.wav
#   ...
# 📊 Progress: 10/160 segments (6.2%)

# 3. Skip existing files (useful for retrying failures)
npm run tts:generate -- --skip-existing

# 4. Use custom batch size (default: 10)
BATCH_SIZE=20 npm run tts:generate

# 5. Use remote TTS server
TTS_SERVER_URL=http://192.168.1.100:5000 npm run tts:generate
```

## Component 2: Duration Calculation Script

### Purpose
Calculate and display:
1. Duration of each segment
2. Total duration of each slide
3. Total duration of presentation
4. Update metadata with calculated durations

### Implementation: `scripts/calculate-durations.ts`

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { getAudioDurationInSeconds } from 'get-audio-duration';
import { allSlides } from '../src/slides/SlidesRegistry';

interface DurationReport {
  totalDuration: number;
  slides: SlideReport[];
}

interface SlideReport {
  chapter: number;
  slide: number;
  title: string;
  duration: number;
  segments: SegmentReport[];
}

interface SegmentReport {
  id: string;
  filepath: string;
  duration: number;
  narrationText?: string;
}

async function calculateDurations(audioDir: string): Promise<DurationReport> {
  console.log('⏱️  Calculating audio durations...\n');
  
  const report: DurationReport = {
    totalDuration: 0,
    slides: []
  };
  
  // Process each slide
  for (const slide of allSlides) {
    const { chapter, slide: slideNum, title, audioSegments } = slide.metadata;
    
    if (!audioSegments || audioSegments.length === 0) continue;
    
    console.log(`\n📄 Chapter ${chapter}, Slide ${slideNum}: ${title}`);
    
    const slideReport: SlideReport = {
      chapter,
      slide: slideNum,
      title,
      duration: 0,
      segments: []
    };
    
    // Calculate duration for each segment
    for (let i = 0; i < audioSegments.length; i++) {
      const segment = audioSegments[i];
      
      // Construct expected filepath
      const filename = `s${slideNum}_segment_${String(i + 1).padStart(2, '0')}_${segment.id}.mp3`;
      const filepath = path.join(audioDir, `c${chapter}`, filename);
      
      if (!fs.existsSync(filepath)) {
        console.log(`  ⚠️  Segment ${i + 1} (${segment.id}): File not found`);
        continue;
      }
      
      try {
        const duration = await getAudioDurationInSeconds(filepath);
        
        slideReport.segments.push({
          id: segment.id,
          filepath: filename,
          duration,
          narrationText: segment.narrationText
        });
        
        slideReport.duration += duration;
        
        console.log(`  ✅ Segment ${i + 1} (${segment.id}): ${duration.toFixed(2)}s`);
        
      } catch (error) {
        console.error(`  ❌ Error reading ${filename}:`, error.message);
      }
    }
    
    console.log(`  📊 Slide total: ${slideReport.duration.toFixed(2)}s (${formatTime(slideReport.duration)})`);
    
    report.slides.push(slideReport);
    report.totalDuration += slideReport.duration;
  }
  
  return report;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function printReport(report: DurationReport) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 DURATION REPORT');
  console.log('='.repeat(80));
  
  // Slide-by-slide breakdown
  for (const slide of report.slides) {
    console.log(`\nChapter ${slide.chapter}, Slide ${slide.slide}: ${slide.title}`);
    console.log(`  Duration: ${slide.duration.toFixed(2)}s (${formatTime(slide.duration)})`);
    console.log(`  Segments: ${slide.segments.length}`);
    
    for (const segment of slide.segments) {
      console.log(`    - ${segment.id}: ${segment.duration.toFixed(2)}s`);
    }
  }
  
  // Summary
  console.log('\n' + '-'.repeat(80));
  console.log(`Total Presentation Duration: ${report.totalDuration.toFixed(2)}s (${formatTime(report.totalDuration)})`);
  console.log(`Total Slides: ${report.slides.length}`);
  console.log(`Average Slide Duration: ${(report.totalDuration / report.slides.length).toFixed(2)}s`);
  console.log('='.repeat(80) + '\n');
}

async function saveReportJSON(report: DurationReport, outputPath: string) {
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`💾 Report saved to: ${outputPath}\n`);
}

// CLI execution
const audioDir = path.join(__dirname, '../public/audio');
const reportPath = path.join(__dirname, '../duration-report.json');

calculateDurations(audioDir)
  .then(report => {
    printReport(report);
    return saveReportJSON(report, reportPath);
  })
  .catch(console.error);
```

### Features
- **Per-segment durations** - Shows exact duration of each audio file
- **Per-slide totals** - Sums all segments for each slide
- **Presentation total** - Overall presentation length
- **JSON export** - Saves detailed report for programmatic use
- **Missing file detection** - Warns about files that don't exist

### Usage
```bash
# Calculate and display durations
npm run tts:duration

# Output will show:
# - Each segment duration
# - Each slide total
# - Overall presentation time
# - Saves duration-report.json
```

## Package.json Updates

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint --ext .ts,.tsx src",
    "tts:generate": "tsx scripts/generate-tts.ts",
    "tts:duration": "tsx scripts/calculate-durations.ts"
  },
  "devDependencies": {
    "axios": "^1.6.0",
    "get-audio-duration": "^4.0.0",
    "tsx": "^4.7.0",
    "@types/node": "^20.0.0"
  }
}
```

## Workflow

### Initial Setup
```bash
# 1. Start Python TTS server (in tts/ directory)
cd tts
python server.py --voice-sample path/to/voice.wav --host 0.0.0.0 --port 5000

# 2. Install new dependencies (in react_cogs_demo/)
cd react_cogs_demo
npm install
```

### Generate Audio Files
```bash
# Generate all audio files
npm run tts:generate

# Progress output:
# 🎙️  Starting TTS generation...
# 
# 📄 Processing Chapter 1, Slide 1
#   🔊 Segment 1: Generating "Meeting Highlights is a new..."
#   ✅ Saved: s1_segment_01_intro.mp3
#   🔊 Segment 2: Generating "It uses AI to automatically..."
#   ✅ Saved: s1_segment_02_ai_generation.mp3
# ...
```

### Calculate Durations
```bash
# After audio generation, calculate durations
npm run tts:duration

# Output:
# ⏱️  Calculating audio durations...
# 
# 📄 Chapter 1, Slide 1: What is Meeting Highlights
#   ✅ Segment 1 (intro): 8.42s
#   ✅ Segment 2 (ai_generation): 6.15s
#   ...
#   📊 Slide total: 42.18s (0:42)
# 
# 📊 DURATION REPORT
# Total Presentation Duration: 487.32s (8:07)
# Total Slides: 20
```

## Directory Structure After Generation

```
react_cogs_demo/public/audio/
├── c1/
│   ├── s1_segment_01_intro.mp3
│   ├── s1_segment_02_ai_generation.mp3
│   ├── s1_segment_03_combination.mp3
│   ├── s1_segment_04_preservation.mp3
│   ├── s1_segment_05_problem.mp3
│   ├── s2_segment_01_intro.mp3
│   ├── s2_segment_02_bizchat.mp3
│   └── ...
├── c2/
│   ├── s1_segment_01_intro.mp3
│   ├── s1_segment_02_odsp.mp3
│   └── ...
├── c3/
├── c4/
├── c5/
├── c6/
├── c7/
├── c8/
└── c9/
```

## Error Handling

### TTS Generation Errors
- **Server unreachable** - Clear error message with server URL
- **Timeout** - 2-minute timeout with retry suggestion
- **Invalid response** - Log error, continue with next segment
- **File write error** - Permission or disk space issues

### Duration Calculation Errors
- **Missing files** - Warning, skip and continue
- **Corrupt audio** - Error logged, skip file
- **Permission errors** - Clear message about file access

## Future Enhancements

### Phase 2 (Optional)
1. **Batch processing** - Parallel TTS requests for faster generation
2. **Resume capability** - Save progress, resume from last successful segment
3. **Quality validation** - Check audio quality, re-generate if needed
4. **Metadata sync** - Auto-update AudioSegment.duration in code
5. **Preview mode** - Generate only first N segments for testing
6. **Voice selection** - Support multiple voice samples

### Phase 3 (Advanced)
1. **Web UI** - Browser-based TTS generation interface
2. **Real-time preview** - Play generated audio immediately
3. **Batch editing** - Edit multiple narration texts at once
4. **A/B testing** - Generate with different voice samples
5. **Cloud storage** - Upload audio to CDN automatically

## Success Criteria

### TTS Generation
- ✅ Generates audio for all slides with `narrationText`
- ✅ Files organized by chapter in correct directory structure
- ✅ Skips existing files when `--skip-existing` flag used
- ✅ Clear progress output and error reporting
- ✅ Summary shows total generated/skipped/errors

### Duration Calculation
- ✅ Accurately calculates duration of each audio file
- ✅ Sums segment durations for slide totals
- ✅ Reports overall presentation duration
- ✅ Exports JSON report for programmatic use
- ✅ Handles missing files gracefully

## Timeline Estimate

- **Script Development**: 3-4 hours
  - TTS generation script: 2 hours
  - Duration calculation script: 1.5 hours
  - Testing and refinement: 0.5 hours

- **Audio Generation**: 2-3 hours
  - ~160 total segments across all slides
  - ~1 minute per segment (TTS + network)
  - Faster with local server or GPU

- **Total**: 5-7 hours from start to complete audio library

## Next Steps

1. Review and approve this plan
2. Install dependencies (`axios`, `get-audio-duration`, `tsx`, `@types/node`)
3. Implement `scripts/generate-tts.ts`
4. Implement `scripts/calculate-durations.ts`
5. Update `package.json` with new scripts
6. Test with small subset of slides
7. Generate full audio library
8. Calculate and verify durations
9. Update slide metadata with calculated durations (optional)