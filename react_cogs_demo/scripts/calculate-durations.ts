import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getAudioDurationInSeconds } from 'get-audio-duration';
import { SlideComponentWithMetadata } from '../src/slides/SlideMetadata';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface DurationReport {
  [demoId: string]: {
    totalDuration: number;
    slides: SlideReport[];
  };
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

async function calculateDurations(audioDir: string, demoFilter?: string): Promise<DurationReport> {
  console.log('⏱️  Calculating audio durations (Multi-Demo)...\n');
  
  const report: DurationReport = {};
  
  // Get demos to process
  const allDemoIds = await getAllDemoIds();
  const demosToProcess = demoFilter
    ? allDemoIds.filter(id => id === demoFilter)
    : allDemoIds;
  
  if (demosToProcess.length === 0) {
    if (demoFilter) {
      console.error(`❌ Demo '${demoFilter}' not found.`);
      console.log(`\nAvailable demos: ${allDemoIds.join(', ')}\n`);
    } else {
      console.error('❌ No demos found in src/demos/\n');
    }
    return report;
  }
  
  console.log(`📦 Processing ${demosToProcess.length} demo(s): ${demosToProcess.join(', ')}\n`);
  
  // Process each demo
  for (const demoId of demosToProcess) {
    console.log('\n' + '═'.repeat(70));
    console.log(`📁 Demo: ${demoId}`);
    console.log('═'.repeat(70));
    
    const allSlides = await loadDemoSlides(demoId);
    
    if (allSlides.length === 0) {
      console.log(`⚠️  No slides found for demo '${demoId}', skipping...\n`);
      continue;
    }
    
    const demoAudioDir = path.join(audioDir, demoId);
    
    report[demoId] = {
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
        const filepath = path.join(demoAudioDir, `c${chapter}`, filename);
        
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
      
      report[demoId].slides.push(slideReport);
      report[demoId].totalDuration += slideReport.duration;
    }
    
    // Demo summary
    console.log('\n' + '-'.repeat(60));
    console.log(`📊 Demo '${demoId}' Summary`);
    console.log('-'.repeat(60));
    console.log(`Total slides: ${report[demoId].slides.length}`);
    console.log(`Total duration: ${report[demoId].totalDuration.toFixed(2)}s (${formatTime(report[demoId].totalDuration)})`);
    if (report[demoId].slides.length > 0) {
      console.log(`Average slide: ${(report[demoId].totalDuration / report[demoId].slides.length).toFixed(2)}s`);
    }
    console.log('-'.repeat(60));
  }
  
  return report;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function printReport(report: DurationReport) {
  console.log('\n' + '═'.repeat(80));
  console.log('📊 MULTI-DEMO DURATION REPORT');
  console.log('═'.repeat(80));
  
  let grandTotalDuration = 0;
  let grandTotalSlides = 0;
  
  // Report for each demo
  for (const [demoId, demoReport] of Object.entries(report)) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📁 Demo: ${demoId}`);
    console.log('─'.repeat(80));
    
    if (demoReport.slides.length === 0) {
      console.log('  No slides processed');
      continue;
    }
    
    // Slide-by-slide breakdown
    for (const slide of demoReport.slides) {
      console.log(`\nChapter ${slide.chapter}, Slide ${slide.slide}: ${slide.title}`);
      console.log(`  Duration: ${slide.duration.toFixed(2)}s (${formatTime(slide.duration)})`);
      console.log(`  Segments: ${slide.segments.length}`);
      
      for (const segment of slide.segments) {
        console.log(`    - ${segment.id}: ${segment.duration.toFixed(2)}s`);
      }
    }
    
    console.log(`\n  Total: ${demoReport.totalDuration.toFixed(2)}s (${formatTime(demoReport.totalDuration)})`);
    console.log(`  Slides: ${demoReport.slides.length}`);
    console.log(`  Average: ${(demoReport.totalDuration / demoReport.slides.length).toFixed(2)}s`);
    
    grandTotalDuration += demoReport.totalDuration;
    grandTotalSlides += demoReport.slides.length;
  }
  
  // Grand summary
  if (Object.keys(report).length > 1) {
    console.log('\n' + '═'.repeat(80));
    console.log('📊 GRAND TOTALS (All Demos)');
    console.log('═'.repeat(80));
    console.log(`Total Demos: ${Object.keys(report).length}`);
    console.log(`Total Duration: ${grandTotalDuration.toFixed(2)}s (${formatTime(grandTotalDuration)})`);
    console.log(`Total Slides: ${grandTotalSlides}`);
    if (grandTotalSlides > 0) {
      console.log(`Average per Slide: ${(grandTotalDuration / grandTotalSlides).toFixed(2)}s`);
    }
  }
  
  console.log('═'.repeat(80) + '\n');
}

async function saveReportJSON(report: DurationReport, outputPath: string, demoFilter?: string) {
  const filename = demoFilter 
    ? `duration-report-${demoFilter}.json`
    : 'duration-report.json';
  const fullPath = path.join(path.dirname(outputPath), filename);
  
  fs.writeFileSync(fullPath, JSON.stringify(report, null, 2));
  console.log(`💾 Report saved to: ${fullPath}\n`);
}

// Parse CLI arguments
function parseCLIArgs(): { demoFilter?: string } {
  const args = process.argv.slice(2);
  const result: { demoFilter?: string } = {};
  
  // Check for --demo parameter
  const demoIndex = args.indexOf('--demo');
  if (demoIndex !== -1 && args[demoIndex + 1]) {
    result.demoFilter = args[demoIndex + 1];
  }
  
  return result;
}

// CLI execution
const cliArgs = parseCLIArgs();
const audioDir = path.join(__dirname, '../public/audio');
const reportPath = path.join(__dirname, '../duration-report.json');

calculateDurations(audioDir, cliArgs.demoFilter)
  .then(report => {
    printReport(report);
    return saveReportJSON(report, reportPath, cliArgs.demoFilter);
  })
  .catch(console.error);