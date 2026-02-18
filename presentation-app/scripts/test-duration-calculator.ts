import { calculateSlideDuration, calculatePresentationDuration } from '@framework/demos/timing/calculator';
import { resolveTimingConfig, TimingConfig } from '@framework/demos/timing/types';
import type { SlideMetadata, AudioSegment } from '@framework/slides/SlideMetadata';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(name: string, condition: boolean, details?: string) {
  results.push({ name, passed: condition, details: condition ? undefined : details });
}

function makeSegment(id: string, duration?: number, timing?: TimingConfig): AudioSegment {
  return {
    id,
    audioFilePath: `/dev/null/${id}.wav`,
    duration,
    timing
  };
}

function makeSlide(chapter: number, slideIndex: number, title: string, segments: AudioSegment[], timing?: TimingConfig): SlideMetadata {
  return {
    chapter,
    slide: slideIndex,
    title,
    audioSegments: segments,
    timing
  };
}

function nearlyEqual(a: number, b: number, epsilon = 1e-6) {
  return Math.abs(a - b) <= epsilon;
}

//
// Test 1: Empty slides array
//
{
  const report = calculatePresentationDuration([]);
  assert('Empty slides → totalDuration==0', report.totalDuration === 0);
  assert('Empty slides → audioOnlyDuration==0', report.audioOnlyDuration === 0);
  assert('Empty slides → no slideBreakdowns', report.slideBreakdowns.length === 0);
}

//
// Test 2: Slide with no segments
//
{
  const slide = makeSlide(0, 0, 'Empty Slide', []);
  const breakdown = calculateSlideDuration(slide, false);
  assert('No segments → totalDuration 0', breakdown.totalDuration === 0);
  assert('No segments → audioDuration 0', breakdown.audioDuration === 0);
  assert('No segments → delaysDuration 0', breakdown.delaysDuration === 0);
  assert('No segments → segments array empty', breakdown.segments.length === 0);
}

//
// Test 3: Missing audio durations (undefined) treated as 0
//
{
  const slide = makeSlide(0, 1, 'Undefined Durations', [
    makeSegment('a'),      // undefined duration
    makeSegment('b')       // undefined duration
  ]);
  const breakdown = calculateSlideDuration(slide, false);
  // Expected: audio 0, delays: 0.5 (between segments) + 1 (between slides) = 1.5
  assert('Undefined durations → audio 0', breakdown.audioDuration === 0);
  assert('Undefined durations → delays 1.5', nearlyEqual(breakdown.delaysDuration, 1.5), `Got ${breakdown.delaysDuration}`);
  assert('Undefined durations → total 1.5', nearlyEqual(breakdown.totalDuration, 1.5));
}

//
// Test 4: Timing hierarchy precedence (segment > slide > demo > default)
//
{
  const demoTiming: TimingConfig = { betweenSegments: 1000, betweenSlides: 1000, afterFinalSlide: 3000 };
  const slideTiming: TimingConfig = { betweenSegments: 600 }; // overrides demo betweenSegments
  // Segment-level override (first segment)
  const seg0 = makeSegment('seg0', 2, { betweenSegments: 400 });
  const seg1 = makeSegment('seg1', 2); // inherits slide timing for betweenSegments not used (last segment uses betweenSlides)
  const slide = makeSlide(0, 2, 'Hierarchy Slide', [seg0, seg1], slideTiming);
  const breakdown = calculateSlideDuration(slide, false, demoTiming);
  // Expected delays: after seg0 = 0.4s (segment-level), after seg1 (between slides) = 1s (demo-level betweenSlides)
  const delay0 = breakdown.segments[0].delayAfter;
  const delay1 = breakdown.segments[1].delayAfter;
  assert('Hierarchy seg0 delay 0.4', nearlyEqual(delay0, 0.4), `Got ${delay0}`);
  assert('Hierarchy seg1 delay 1 (between slides)', nearlyEqual(delay1, 1), `Got ${delay1}`);
}

//
// Test 5: Presentation report categorization
//
{
  // Slide A: 2 segments (1s + 1s) -> segment delay 0.5s, slide delay 1s
  const slideA = makeSlide(1, 0, 'Slide A', [makeSegment('a1', 1), makeSegment('a2', 1)]);
  // Slide B: 1 segment (2s) -> final delay 2s
  const slideB = makeSlide(1, 1, 'Slide B', [makeSegment('b1', 2)]);
  const report = calculatePresentationDuration([slideA, slideB]);
  // Expected audio: 4s
  // Segment delays: 0.5
  // Slide delays: 1
  // Final delay: 2
  // Total: 7.5
  assert('Report audioOnly 4s', nearlyEqual(report.audioOnlyDuration, 4), `Got ${report.audioOnlyDuration}`);
  assert('Report segmentDelays 0.5', nearlyEqual(report.segmentDelaysDuration, 0.5), `Got ${report.segmentDelaysDuration}`);
  assert('Report slideDelays 1', nearlyEqual(report.slideDelaysDuration, 1), `Got ${report.slideDelaysDuration}`);
  assert('Report finalDelay 2', nearlyEqual(report.finalDelayDuration, 2), `Got ${report.finalDelayDuration}`);
  assert('Report total 7.5', nearlyEqual(report.totalDuration, 7.5), `Got ${report.totalDuration}`);
}

//
// Test 6: Final slide with multi segments uses afterFinalSlide
//
{
  const finalDemoTiming: TimingConfig = { afterFinalSlide: 5000 }; // 5s
  const finalSlide = makeSlide(2, 0, 'Final Multi', [makeSegment('f1', 1), makeSegment('f2', 1)]);
  const breakdown = calculateSlideDuration(finalSlide, true, finalDemoTiming);
  // Expected delays: between segments 0.5, after final segment 5
  const seg0Delay = breakdown.segments[0].delayAfter;
  const seg1Delay = breakdown.segments[1].delayAfter;
  assert('Final slide seg0 delay 0.5', nearlyEqual(seg0Delay, 0.5), `Got ${seg0Delay}`);
  assert('Final slide last segment afterFinalSlide 5', nearlyEqual(seg1Delay, 5), `Got ${seg1Delay}`);
  assert('Final slide totalDuration 1+1+0.5+5=7.5', nearlyEqual(breakdown.totalDuration, 7.5), `Got ${breakdown.totalDuration}`);
}

//
// Test 7: Slide-level override for betweenSlides applied to non-final slide
//
{
  const demoTiming: TimingConfig = { betweenSlides: 1000, betweenSegments: 500, afterFinalSlide: 2000 };
  const slideTiming: TimingConfig = { betweenSlides: 1500 }; // override only betweenSlides
  const slide = makeSlide(3, 0, 'Slide Override', [makeSegment('a', 1), makeSegment('b', 1)], slideTiming);
  const breakdown = calculateSlideDuration(slide, false, demoTiming);
  const lastDelay = breakdown.segments[1].delayAfter;
  assert('Slide-level betweenSlides override (1.5s)', nearlyEqual(lastDelay, 1.5), `Got ${lastDelay}`);
}

//
// Test 8: Segment-level override for afterFinalSlide on final slide
//
{
  const demoTiming: TimingConfig = { betweenSegments: 500, betweenSlides: 1000, afterFinalSlide: 4000 };
  // Last segment overrides afterFinalSlide via its own timing config
  const seg0 = makeSegment('first', 1); // normal betweenSegments 0.5
  const seg1 = makeSegment('last', 2, { afterFinalSlide: 6000 }); // override final delay to 6s
  const slide = makeSlide(4, 0, 'Final Override', [seg0, seg1]);
  const breakdown = calculateSlideDuration(slide, true, demoTiming);
  const firstDelay = breakdown.segments[0].delayAfter;
  const finalDelay = breakdown.segments[1].delayAfter;
  assert('Segment-level final override keeps first segment delay 0.5', nearlyEqual(firstDelay, 0.5), `Got ${firstDelay}`);
  assert('Segment-level afterFinalSlide override 6s', nearlyEqual(finalDelay, 6), `Got ${finalDelay}`);
  const expectedTotal = 1 + 2 + 0.5 + 6;
  assert('Total with overridden final delay', nearlyEqual(breakdown.totalDuration, expectedTotal), `Got ${breakdown.totalDuration} expected ${expectedTotal}`);
}

//
// Summary
//
let passed = 0;
for (const r of results) {
  if (r.passed) passed++;
}

console.log('--------------------------------------------------');
console.log('Timing Calculator Test Results');
console.log('--------------------------------------------------');
results.forEach(r => {
  if (r.passed) {
    console.log(`✅ ${r.name}`);
  } else {
    console.log(`❌ ${r.name} :: ${r.details || ''}`);
  }
});
console.log('--------------------------------------------------');
console.log(`Passed ${passed}/${results.length} tests`);
console.log('--------------------------------------------------');

if (passed !== results.length) {
  process.exit(1);
}