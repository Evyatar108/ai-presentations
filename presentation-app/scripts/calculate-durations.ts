import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getAudioDurationInSeconds } from 'get-audio-duration';
import { SlideComponentWithMetadata, SlideMetadata } from '@framework/slides/SlideMetadata';
import { calculatePresentationDuration, PresentationDurationReport } from '@framework/demos/timing/calculator';
import { TimingConfig } from '@framework/demos/timing/types';
import { getArg, hasFlag } from './utils/cli-parser.js';
import { getAllDemoIds, loadDemoConfig } from './utils/demo-discovery.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Enhanced duration report that includes timing breakdown.
 */
interface DurationReport {
  [demoId: string]: EnhancedDemoReport;
}

/**
 * Complete duration information for a single demo.
 */
interface EnhancedDemoReport {
  /** Demo identifier */
  demoId: string;
  
  /** Audio-only duration in seconds (sum of all audio files) */
  audioOnlyDuration: number;
  
  /** Total segment delays in seconds (between segments within slides) */
  segmentDelays: number;
  
  /** Total slide delays in seconds (between slides) */
  slideDelays: number;
  
  /** Final delay in seconds (after last slide) */
  finalDelay: number;

  /** Start silence in seconds (before first slide) */
  startSilence: number;

  /** Total presentation duration in seconds (audio + all delays) */
  totalDuration: number;
  
  /** Detailed per-slide breakdowns from timing calculator */
  slideBreakdowns: PresentationDurationReport['slideBreakdowns'];
  
  /** Formatted duration strings for display */
  formattedDurations: {
    audioOnly: string;
    total: string;
  };
}

/**
 * Populate audio durations in slide metadata from actual audio files.
 * This updates the slide metadata with actual file durations.
 */
async function populateAudioDurations(
  slides: SlideComponentWithMetadata[],
  demoId: string,
  audioDir: string
): Promise<void> {
  const demoAudioDir = path.join(audioDir, demoId);
  
  for (const slide of slides) {
    const { chapter, slide: slideNum, audioSegments } = slide.metadata;
    
    if (!audioSegments || audioSegments.length === 0) continue;
    
    for (let i = 0; i < audioSegments.length; i++) {
      const segment = audioSegments[i];
      
      // Construct expected filepath
      const filename = `s${slideNum}_segment_${String(i).padStart(2, '0')}.wav`;
      const filepath = path.join(demoAudioDir, `c${chapter}`, filename);
      
      if (fs.existsSync(filepath)) {
        try {
          const duration = await getAudioDurationInSeconds(filepath);
          // Update the segment's duration in place
          segment.duration = duration;
        } catch (error: any) {
          console.warn(`  ⚠️  Could not read duration for ${filename}: ${error.message}`);
          segment.duration = 0;
        }
      } else {
        // File doesn't exist - set duration to 0
        segment.duration = 0;
      }
    }
  }
}

/**
 * Calculate comprehensive durations including timing delays for all demos.
 */
async function calculateDurations(audioDir: string, demoFilter?: string): Promise<DurationReport> {
  console.log('⏱️  Calculating presentation durations with timing delays...\n');
  
  const report: DurationReport = {};
  
  // Get demos to process
  const allDemoIds = getAllDemoIds();
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
    console.log('═'.repeat(70));
    console.log(`📁 Calculating durations for: ${demoId}`);
    console.log('═'.repeat(70) + '\n');
    
    // Load demo config and slides
    const { config, slides } = await loadDemoConfig(demoId);
    
    if (slides.length === 0) {
      console.log(`⚠️  No slides found for demo '${demoId}', skipping...\n`);
      continue;
    }
    
    // Populate audio durations from actual files
    console.log('📂 Loading audio file durations...');
    await populateAudioDurations(slides, demoId, audioDir);
    
    // Extract slide metadata for calculator
    const slideMetadata: SlideMetadata[] = slides.map(s => s.metadata);
    
    // Get demo timing config (if available)
    const demoTiming: TimingConfig | undefined = config?.timing;
    
    // Calculate comprehensive duration using timing calculator
    const durationReport = calculatePresentationDuration(slideMetadata, demoTiming);
    
    // Create enhanced report
    const enhancedReport: EnhancedDemoReport = {
      demoId,
      audioOnlyDuration: durationReport.audioOnlyDuration,
      segmentDelays: durationReport.segmentDelaysDuration,
      slideDelays: durationReport.slideDelaysDuration,
      finalDelay: durationReport.finalDelayDuration,
      startSilence: durationReport.startSilenceDuration,
      totalDuration: durationReport.totalDuration,
      slideBreakdowns: durationReport.slideBreakdowns,
      formattedDurations: {
        audioOnly: formatTime(durationReport.audioOnlyDuration),
        total: formatTime(durationReport.totalDuration)
      }
    };
    
    report[demoId] = enhancedReport;
    
    // Print summary
    console.log('\n' + '-'.repeat(70));
    console.log('📊 Duration Summary');
    console.log('-'.repeat(70));
    console.log(`Audio Only:      ${enhancedReport.formattedDurations.audioOnly} (${enhancedReport.audioOnlyDuration.toFixed(1)}s)`);
    console.log(`Total Duration:  ${enhancedReport.formattedDurations.total} (${enhancedReport.totalDuration.toFixed(1)}s)`);
    console.log(`\nDelay Breakdown:`);
    console.log(`  Start silence:  ${enhancedReport.startSilence.toFixed(1)}s`);
    console.log(`  Segment delays: ${enhancedReport.segmentDelays.toFixed(1)}s`);
    console.log(`  Slide delays:   ${enhancedReport.slideDelays.toFixed(1)}s`);
    console.log(`  Final delay:    ${enhancedReport.finalDelay.toFixed(1)}s`);
    console.log(`  Total delays:   ${(enhancedReport.startSilence + enhancedReport.segmentDelays + enhancedReport.slideDelays + enhancedReport.finalDelay).toFixed(1)}s`);
    console.log('-'.repeat(70) + '\n');
  }
  
  return report;
}

/**
 * Format seconds as MM:SS string.
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Print comprehensive duration report with timing breakdown.
 */
function printReport(report: DurationReport, verbose: boolean = false) {
  console.log('═'.repeat(80));
  console.log('📊 MULTI-DEMO DURATION REPORT');
  console.log('═'.repeat(80));
  
  let grandTotalAudio = 0;
  let grandTotalDuration = 0;
  let grandTotalSlides = 0;
  
  // Report for each demo
  for (const [demoId, demoReport] of Object.entries(report)) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📁 Demo: ${demoId}`);
    console.log('─'.repeat(80));
    
    if (demoReport.slideBreakdowns.length === 0) {
      console.log('  No slides processed');
      continue;
    }
    
    // Duration summary
    console.log(`\nAudio Only:      ${demoReport.formattedDurations.audioOnly} (${demoReport.audioOnlyDuration.toFixed(1)}s)`);
    console.log(`Total Duration:  ${demoReport.formattedDurations.total} (${demoReport.totalDuration.toFixed(1)}s)`);
    console.log(`\nDelay Breakdown:`);
    console.log(`  Start silence:  ${demoReport.startSilence.toFixed(1)}s`);
    console.log(`  Segment delays: ${demoReport.segmentDelays.toFixed(1)}s`);
    console.log(`  Slide delays:   ${demoReport.slideDelays.toFixed(1)}s`);
    console.log(`  Final delay:    ${demoReport.finalDelay.toFixed(1)}s`);
    
    // Verbose mode: show per-slide breakdown
    if (verbose) {
      console.log(`\nPer-Slide Breakdown:`);
      for (const slide of demoReport.slideBreakdowns) {
        console.log(`\n  Ch${slide.chapterIndex}:S${slide.slideIndex} - ${slide.slideTitle}`);
        console.log(`    Audio: ${slide.audioDuration.toFixed(1)}s | Delays: ${slide.delaysDuration.toFixed(1)}s | Total: ${slide.totalDuration.toFixed(1)}s`);
        console.log(`    Segments: ${slide.segments.length}`);
      }
    }
    
    console.log(`\nSlides: ${demoReport.slideBreakdowns.length}`);
    console.log(`Average per Slide: ${(demoReport.totalDuration / demoReport.slideBreakdowns.length).toFixed(1)}s`);
    
    grandTotalAudio += demoReport.audioOnlyDuration;
    grandTotalDuration += demoReport.totalDuration;
    grandTotalSlides += demoReport.slideBreakdowns.length;
  }
  
  // Grand summary (only if multiple demos)
  if (Object.keys(report).length > 1) {
    console.log('\n' + '═'.repeat(80));
    console.log('📊 GRAND TOTALS (All Demos)');
    console.log('═'.repeat(80));
    console.log(`Demos:          ${Object.keys(report).length}`);
    console.log(`Audio Only:     ${formatTime(grandTotalAudio)} (${grandTotalAudio.toFixed(1)}s)`);
    console.log(`Total Duration: ${formatTime(grandTotalDuration)} (${grandTotalDuration.toFixed(1)}s)`);
    console.log(`Total Slides:   ${grandTotalSlides}`);
    if (grandTotalSlides > 0) {
      console.log(`Avg per Slide:  ${(grandTotalDuration / grandTotalSlides).toFixed(1)}s`);
    }
  }
  
  console.log('═'.repeat(80) + '\n');
}

/**
 * Save comprehensive duration report to JSON file.
 */
async function saveReportJSON(report: DurationReport, outputPath: string, demoFilter?: string) {
  const filename = demoFilter
    ? `duration-report-${demoFilter}.json`
    : 'duration-report.json';
  const fullPath = path.join(path.dirname(outputPath), filename);

  // Pretty-print JSON for readability
  fs.writeFileSync(fullPath, JSON.stringify(report, null, 2));
  console.log(`💾 Duration report saved: ${filename}`);
}

/**
 * Generate the durationInfo object literal string for embedding in metadata.ts.
 */
function generateDurationInfoLiteral(demoReport: EnhancedDemoReport): string {
  const indent = '    ';
  const lines: string[] = [];

  lines.push('  durationInfo: {');
  lines.push(`${indent}audioOnly: ${round2(demoReport.audioOnlyDuration)},`);
  lines.push(`${indent}segmentDelays: ${round2(demoReport.segmentDelays)},`);
  lines.push(`${indent}slideDelays: ${round2(demoReport.slideDelays)},`);
  lines.push(`${indent}finalDelay: ${round2(demoReport.finalDelay)},`);
  lines.push(`${indent}startSilence: ${round2(demoReport.startSilence)},`);
  lines.push(`${indent}total: ${round2(demoReport.totalDuration)},`);
  lines.push(`${indent}slideBreakdown: [`);

  for (const slide of demoReport.slideBreakdowns) {
    const segs = slide.segments
      .map(s => `{ segmentIndex: ${s.segmentIndex}, audioDuration: ${round2(s.audioDuration)}, delayAfter: ${round2(s.delayAfter)} }`)
      .join(', ');
    lines.push(`${indent}  { slideIndex: ${slide.slideIndex}, slideTitle: '${slide.slideTitle.replace(/'/g, "\\'")}', chapterIndex: ${slide.chapterIndex}, totalDuration: ${round2(slide.totalDuration)}, audioDuration: ${round2(slide.audioDuration)}, delaysDuration: ${round2(slide.delaysDuration)}, segments: [${segs}] },`);
  }

  lines.push(`${indent}]`);
  lines.push('  }');

  return lines.join('\n');
}

/**
 * Round a number to 2 decimal places, removing trailing zeros.
 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Update the durationInfo field in a demo's metadata.ts file.
 * Replaces the existing durationInfo block (or inserts one if missing).
 */
function updateMetadataFile(demoId: string, demoReport: EnhancedDemoReport): boolean {
  const metadataPath = path.join(__dirname, `../src/demos/${demoId}/metadata.ts`);

  if (!fs.existsSync(metadataPath)) {
    console.warn(`  ⚠️  metadata.ts not found for '${demoId}', skipping metadata update`);
    return false;
  }

  const content = fs.readFileSync(metadataPath, 'utf-8');
  const newDurationInfo = generateDurationInfoLiteral(demoReport);

  // Match existing durationInfo block (handles nested braces via greedy match up to closing })
  const durationInfoRegex = /  durationInfo:\s*\{[\s\S]*?\n  \}/;

  if (durationInfoRegex.test(content)) {
    const updated = content.replace(durationInfoRegex, newDurationInfo);
    fs.writeFileSync(metadataPath, updated, 'utf-8');
    console.log(`✅ Updated durationInfo in src/demos/${demoId}/metadata.ts`);
    return true;
  }

  // No existing durationInfo — try to insert before the closing of the metadata object
  const closingBraceRegex = /\n\};\s*$/;
  if (closingBraceRegex.test(content)) {
    const updated = content.replace(closingBraceRegex, `,\n\n${newDurationInfo}\n};\n`);
    fs.writeFileSync(metadataPath, updated, 'utf-8');
    console.log(`✅ Inserted durationInfo in src/demos/${demoId}/metadata.ts`);
    return true;
  }

  console.warn(`  ⚠️  Could not locate insertion point in metadata.ts for '${demoId}'`);
  return false;
}

/**
 * Run the full duration calculation pipeline: calculate → print → save JSON → update metadata.ts.
 * Exported so other scripts (e.g. generate-tts) can call it in-process.
 */
export async function runDurationCalculation(options: {
  audioDir: string;
  demoFilter?: string;
  reportPath: string;
  verbose?: boolean;
}): Promise<void> {
  const report = await calculateDurations(options.audioDir, options.demoFilter);
  printReport(report, options.verbose);
  await saveReportJSON(report, options.reportPath, options.demoFilter);
  let updatedCount = 0;
  for (const [demoId, demoReport] of Object.entries(report)) {
    if (updateMetadataFile(demoId, demoReport)) {
      updatedCount++;
    }
  }
  if (updatedCount > 0) {
    console.log(`\n📝 Updated ${updatedCount} metadata.ts file(s) with durationInfo\n`);
  }
}

// CLI execution — only when run directly
if (path.resolve(process.argv[1]) === path.resolve(__filename)) {
  runDurationCalculation({
    audioDir: path.join(__dirname, '../public/audio'),
    demoFilter: getArg('demo'),
    reportPath: path.join(__dirname, '../duration-report.json'),
    verbose: hasFlag('verbose'),
  }).catch(console.error);
}