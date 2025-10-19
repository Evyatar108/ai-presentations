import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getAudioDurationInSeconds } from 'get-audio-duration';
import { allSlides } from '../src/slides/SlidesRegistry';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
      const filename = `s${slideNum}_segment_${String(i + 1).padStart(2, '0')}_${segment.id}.wav`;
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
        
      } catch (error: any) {
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