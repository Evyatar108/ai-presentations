import { TimingConfig } from '../demos/timing/types';

/**
 * Represents a single audio segment within a multi-segment slide
 */
export interface AudioSegment {
  /** Unique identifier (e.g., "intro", "team_odsp") */
  id: string;
  /** Path to audio file for this segment */
  audioFilePath: string;
  /** Optional pre-computed duration in seconds (for scrubbing) */
  duration?: number;
  /** Animation key to trigger when this segment starts */
  animationTrigger?: string;
  /** Reference to segment number in SRT file (e.g., 1 for "1 - Intro") */
  srtSegmentNumber?: number;
  /** Description of what appears visually (from SRT file) */
  visualDescription?: string;
  /** Actual narration text to be spoken (for TTS generation) */
  narrationText?: string;

  /**
   * Optional TTS style/tone instruction for this specific segment.
   * Overrides slide and demo instruct for this segment only.
   * Passed to the TTS server as the `instruct` parameter (e.g. Qwen3-TTS).
   *
   * @example
   * instruct: "speak slowly and clearly with a warm tone"
   */
  instruct?: string;

  /**
   * Optional timing configuration for this specific segment.
   * Overrides slide and demo timing for this segment only.
   *
   * @example
   * timing: { betweenSegments: 1000 } // 1 second delay after this segment
   */
  timing?: TimingConfig;
}

/**
 * Metadata interface that all narrated slide components must implement
 */
export interface SlideMetadata {
  /** Chapter number */
  chapter: number;
  /** Slide number within the chapter */
  slide: number;
  /** Display title for the slide */
  title: string;

  /** Path to slide's SRT file (e.g., "highlights_demo/chapters/c2/s1_team_collaboration.srt") */
  srtFilePath?: string;

  /** Array of audio segments for this slide */
  audioSegments: AudioSegment[];
  
  /**
   * Optional timing configuration for this slide.
   * Overrides demo timing for all segments in this slide.
   * Individual segments can further override with their own timing.
   *
   * @example
   * timing: { betweenSegments: 750, betweenSlides: 1500 }
   */
  timing?: TimingConfig;

  /**
   * Optional TTS style/tone instruction for all segments in this slide.
   * Overrides demo-level instruct. Individual segments can further override.
   *
   * @example
   * instruct: "speak with excitement and energy"
   */
  instruct?: string;
}
 
 /**
  * Type for a slide component with metadata
  */
 export interface SlideComponentWithMetadata extends React.FC {
   metadata: SlideMetadata;
 }
 
 /**
  * Helper to check if slide has audio segments
  */
 export function hasAudioSegments(metadata: SlideMetadata): boolean {
   return Array.isArray(metadata.audioSegments) && metadata.audioSegments.length > 0;
 }
 
 /**
  * Helper to get total duration of all segments (if durations are specified)
  */
 export function getTotalDuration(metadata: SlideMetadata): number | undefined {
   if (!hasAudioSegments(metadata)) return undefined;
   
   const durations = metadata.audioSegments
     .map(seg => seg.duration)
     .filter((d): d is number => d !== undefined);
   
   if (durations.length !== metadata.audioSegments.length) return undefined;
   
   return durations.reduce((sum, d) => sum + d, 0);
 }