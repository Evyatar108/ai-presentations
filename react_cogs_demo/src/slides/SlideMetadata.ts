/**
 * Represents a single audio segment within a multi-segment slide
 */
export interface AudioSegment {
  id: string;                    // Unique identifier (e.g., "intro", "team_odsp")
  audioFilePath: string;         // Path to audio file for this segment
  duration?: number;             // Optional pre-computed duration (for scrubbing)
  animationTrigger?: string;     // Animation key to trigger when this segment starts
  srtSegmentNumber?: number;     // Reference to segment number in SRT file (e.g., 1 for "1 - Intro")
  visualDescription?: string;    // Description of what appears visually (from SRT file)
}

/**
 /**
  * Metadata interface that all narrated slide components must implement
  */
 export interface SlideMetadata {
   chapter: number;
   slide: number;
   title: string;
   
   // Reference to slide definition SRT file
   srtFilePath?: string;              // Path to slide's SRT file (e.g., "highlights_demo/chapters/c2/s1_team_collaboration.srt")
   
   // Multi-segment audio support (all slides use segments)
   audioSegments: AudioSegment[];     // Array of audio segments for this slide
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