import { TimingConfig } from '../demos/timing/types';

/**
 * Defines a video seek to fire when a TTS marker is reached.
 */
export interface VideoSeekTrigger {
  videoId: string;          // Key in bookmarks.json videos map
  bookmarkId: string;       // ID of the bookmark to seek to
  atMarker: string;         // TTS marker ID ({#id} system) that fires the seek
  pauseNarration?: boolean; // If true: pause TTS, play clip start→end, resume when clip ends
}

/**
 * Defines a point at which TTS should wait for a video clip to finish before continuing.
 * Used for Pattern 3 (TTS leads, then waits): TTS narrates alongside the clip, but at a
 * later marker it pauses and waits for the clip to finish — only if still playing.
 */
export interface VideoWaitTrigger {
  videoId: string;    // Key in bookmarks.json videos map
  bookmarkId: string; // Which clip (bookmark) to wait for
  atMarker: string;   // TTS marker at which to check / wait
}

/**
 * Represents a single audio segment within a multi-segment slide
 */
export interface AudioSegment {
  /** 0-based segment index (must match position in audioSegments array) */
  id: number;
  /** Path to audio file for this segment (auto-derived from slide coordinates if omitted) */
  audioFilePath?: string;
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

  /**
   * Video seeks to fire when TTS markers are reached during narrated playback.
   * Each trigger maps a marker ID to a bookmarked timestamp in a video.
   * Set pauseNarration: true to pause TTS, play the clip, then resume.
   *
   * @example
   * videoSeeks: [{ videoId: 'my-vid', bookmarkId: 'clip1', atMarker: 'clip1', pauseNarration: true }]
   */
  videoSeeks?: VideoSeekTrigger[];

  /**
   * Wait points where TTS checks if a previously-started video clip is still playing.
   * If the clip is still active at the marker, TTS pauses until the clip finishes.
   * If the clip already finished, TTS continues uninterrupted.
   *
   * Used for Pattern 3 (TTS leads, then waits): start a clip without pauseNarration,
   * narrate alongside it, and then wait for it at a specific later word.
   *
   * @example
   * videoWaits: [{ videoId: 'demo-vid', bookmarkId: 'clip1', atMarker: 'after-clip' }]
   */
  videoWaits?: VideoWaitTrigger[];
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