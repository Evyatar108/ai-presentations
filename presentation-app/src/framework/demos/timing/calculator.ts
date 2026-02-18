/**
 * Duration Calculator for Narrated Presentations
 * 
 * Calculates accurate presentation durations including all timing delays:
 * - Audio segment durations
 * - Delays between segments within slides
 * - Delays between slides
 * - Delay after final slide
 * 
 * Respects the three-level timing hierarchy:
 * Segment → Slide → Demo → Global Defaults
 */

import type { SlideMetadata } from '../../slides/SlideMetadata';
import { resolveTimingConfig, type TimingConfig } from './types';

/**
 * Detailed duration information for a single segment.
 */
export interface SegmentDurationInfo {
  /** Index of this segment within the slide */
  segmentIndex: number;
  
  /** Audio duration in seconds (from audio file) */
  audioDuration: number;
  
  /** Delay after this segment in seconds (resolved from timing config) */
  delayAfter: number;
}

/**
 * Complete duration breakdown for a single slide.
 * Includes total duration and per-segment details.
 */
export interface SlideDurationBreakdown {
  /** Slide index within presentation */
  slideIndex: number;
  
  /** Slide title for display */
  slideTitle: string;
  
  /** Chapter number */
  chapterIndex: number;
  
  /** Total slide duration in seconds (audio + all delays) */
  totalDuration: number;
  
  /** Total audio duration in seconds (sum of all segments) */
  audioDuration: number;
  
  /** Total delays duration in seconds (all segment and slide delays) */
  delaysDuration: number;
  
  /** Per-segment breakdown */
  segments: SegmentDurationInfo[];
}

/**
 * Complete presentation duration report with full breakdown.
 * Categorizes delays by type for detailed analysis.
 */
export interface PresentationDurationReport {
  /** Total presentation duration in seconds (audio + all delays) */
  totalDuration: number;
  
  /** Audio-only duration in seconds (sum of all segment audio) */
  audioOnlyDuration: number;
  
  /** Total delays between segments in seconds */
  segmentDelaysDuration: number;
  
  /** Total delays between slides in seconds */
  slideDelaysDuration: number;
  
  /** Delay after final slide in seconds */
  finalDelayDuration: number;
  
  /** Per-slide breakdown with detailed segment info */
  slideBreakdowns: SlideDurationBreakdown[];
}

/**
 * Calculate duration for a single slide including all delays.
 * 
 * Processes each segment's audio duration and applies appropriate delays:
 * - Between segments: uses `betweenSegments` timing
 * - After last segment of non-final slide: uses `betweenSlides` timing
 * - After last segment of final slide: uses `afterFinalSlide` timing
 * 
 * Timing is resolved using the three-level hierarchy:
 * Segment timing → Slide timing → Demo timing → Global defaults
 * 
 * @param slide - Slide metadata with audio segments
 * @param isLastSlide - Whether this is the last slide in presentation
 * @param demoTiming - Optional demo-level timing configuration
 * @returns Detailed breakdown of slide duration with per-segment info
 * 
 * @example
 * ```typescript
 * const breakdown = calculateSlideDuration(slideMetadata, false, demoTiming);
 * console.log(`Slide duration: ${breakdown.totalDuration}s`);
 * console.log(`Audio: ${breakdown.audioDuration}s, Delays: ${breakdown.delaysDuration}s`);
 * ```
 */
export function calculateSlideDuration(
  slide: SlideMetadata,
  isLastSlide: boolean,
  demoTiming?: TimingConfig
): SlideDurationBreakdown {
  const segments = slide.audioSegments;
  
  // Handle empty segments array
  if (!segments || segments.length === 0) {
    return {
      slideIndex: slide.slide,
      slideTitle: slide.title,
      chapterIndex: slide.chapter,
      totalDuration: 0,
      audioDuration: 0,
      delaysDuration: 0,
      segments: []
    };
  }
  
  let totalAudioDuration = 0;
  let totalDelaysDuration = 0;
  const segmentInfos: SegmentDurationInfo[] = [];
  
  segments.forEach((segment, index) => {
    // Get audio duration (treat missing/undefined as 0)
    const audioDuration = segment.duration || 0;
    totalAudioDuration += audioDuration;
    
    // Resolve timing for this specific segment (respects hierarchy)
    // Note: slide.timing and segment.timing will be added in Phase 3
    // Using type assertion to handle properties that don't exist yet
    const resolvedTiming = resolveTimingConfig(
      demoTiming,
      (slide as any).timing as TimingConfig | undefined,
      (segment as any).timing as TimingConfig | undefined
    );
    
    // Determine appropriate delay after this segment
    let delayAfter = 0;
    
    if (index < segments.length - 1) {
      // Between segments within the slide
      delayAfter = resolvedTiming.betweenSegments / 1000; // Convert ms to seconds
    } else {
      // After last segment of slide
      if (isLastSlide) {
        // Special delay after final slide
        delayAfter = resolvedTiming.afterFinalSlide / 1000;
      } else {
        // Normal delay between slides
        delayAfter = resolvedTiming.betweenSlides / 1000;
      }
    }
    
    totalDelaysDuration += delayAfter;
    
    segmentInfos.push({
      segmentIndex: index,
      audioDuration,
      delayAfter
    });
  });
  
  return {
    slideIndex: slide.slide,
    slideTitle: slide.title,
    chapterIndex: slide.chapter,
    totalDuration: totalAudioDuration + totalDelaysDuration,
    audioDuration: totalAudioDuration,
    delaysDuration: totalDelaysDuration,
    segments: segmentInfos
  };
}

/**
 * Calculate total presentation duration with comprehensive breakdown.
 * 
 * Processes all slides in sequence, applying appropriate delays between
 * segments, between slides, and after the final slide. Categorizes delays
 * by type for detailed analysis.
 * 
 * The calculation respects the three-level timing hierarchy for each segment,
 * ensuring accurate delay resolution throughout the presentation.
 * 
 * @param slides - Array of all slide metadata in presentation order
 * @param demoTiming - Optional demo-level timing configuration
 * @returns Complete duration report with categorized delays and per-slide breakdowns
 * 
 * @example
 * ```typescript
 * const report = calculatePresentationDuration(allSlides, demoConfig.timing);
 * console.log(`Total: ${report.totalDuration}s`);
 * console.log(`Audio: ${report.audioOnlyDuration}s`);
 * console.log(`Segment delays: ${report.segmentDelaysDuration}s`);
 * console.log(`Slide delays: ${report.slideDelaysDuration}s`);
 * console.log(`Final delay: ${report.finalDelayDuration}s`);
 * ```
 */
export function calculatePresentationDuration(
  slides: SlideMetadata[],
  demoTiming?: TimingConfig
): PresentationDurationReport {
  // Handle empty slides array
  if (!slides || slides.length === 0) {
    return {
      totalDuration: 0,
      audioOnlyDuration: 0,
      segmentDelaysDuration: 0,
      slideDelaysDuration: 0,
      finalDelayDuration: 0,
      slideBreakdowns: []
    };
  }
  
  let totalAudioOnlyDuration = 0;
  let totalSegmentDelays = 0;
  let totalSlideDelays = 0;
  let finalSlideDelay = 0;
  const slideBreakdowns: SlideDurationBreakdown[] = [];
  
  slides.forEach((slide, slideIndex) => {
    const isLastSlide = slideIndex === slides.length - 1;
    const breakdown = calculateSlideDuration(slide, isLastSlide, demoTiming);
    
    // Accumulate audio duration
    totalAudioOnlyDuration += breakdown.audioDuration;
    
    // Categorize delays by type
    breakdown.segments.forEach((segment, segmentIndex) => {
      const isLastSegmentInSlide = segmentIndex === breakdown.segments.length - 1;
      
      if (!isLastSegmentInSlide) {
        // Delay between segments within slide
        totalSegmentDelays += segment.delayAfter;
      } else if (isLastSlide) {
        // Delay after final slide
        finalSlideDelay = segment.delayAfter;
      } else {
        // Delay between slides
        totalSlideDelays += segment.delayAfter;
      }
    });
    
    slideBreakdowns.push(breakdown);
  });
  
  const totalDuration = totalAudioOnlyDuration + totalSegmentDelays + totalSlideDelays + finalSlideDelay;
  
  return {
    totalDuration,
    audioOnlyDuration: totalAudioOnlyDuration,
    segmentDelaysDuration: totalSegmentDelays,
    slideDelaysDuration: totalSlideDelays,
    finalDelayDuration: finalSlideDelay,
    slideBreakdowns
  };
}