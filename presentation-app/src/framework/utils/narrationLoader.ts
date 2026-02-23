/**
 * Narration Loader Utility
 * 
 * Provides functions to load and access externalized narration data from JSON files.
 * Supports hybrid fallback mode: JSON → inline → error/silent
 */

/**
 * Represents a single narration segment within a slide
 */
export interface NarrationSegment {
  id: number;
  narrationText: string;
  visualDescription?: string;
  notes?: string;
  /** Optional TTS style/tone instruction for this segment */
  instruct?: string;
}

/**
 * Represents all segments for a single slide
 */
export interface NarrationSlide {
  chapter: number;
  slide: number;
  title: string;
  segments: NarrationSegment[];
  /** Optional TTS style/tone instruction for all segments in this slide */
  instruct?: string;
}

/**
 * Complete narration data structure for a demo
 */
export interface NarrationData {
  demoId: string;
  version: string;
  lastModified: string;
  slides: NarrationSlide[];
  /** Optional TTS style/tone instruction for the entire demo */
  instruct?: string;
}

/**
 * Load narration JSON for a specific demo.
 * Returns null if file not found (allows fallback to inline narration).
 * 
 * @param demoId - The unique identifier for the demo
 * @returns Promise resolving to NarrationData or null if not found
 * 
 * @example
 * const narration = await loadNarration('meeting-highlights');
 * if (narration) {
 *   console.log(`Loaded ${narration.slides.length} slides`);
 * }
 */
export async function loadNarration(
  demoId: string,
  options?: { silent?: boolean }
): Promise<NarrationData | null> {
  try {
    const response = await fetch(`/narration/${demoId}/narration.json`);

    if (!response.ok) {
      if (response.status === 404) {
        if (!options?.silent) {
          console.info(`[NarrationLoader] No external narration found for demo "${demoId}" (404)`);
        }
        return null;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json() as NarrationData;
    
    // Validate basic structure
    if (!data.demoId || !data.version || !Array.isArray(data.slides)) {
      throw new Error('Invalid narration.json structure: missing required fields');
    }
    
    if (data.demoId !== demoId) {
      console.warn(
        `[NarrationLoader] Demo ID mismatch: expected "${demoId}", got "${data.demoId}"`
      );
    }
    
    console.info(
      `[NarrationLoader] Loaded external narration for "${demoId}" ` +
      `(version ${data.version}, ${data.slides.length} slides, ` +
      `last modified: ${new Date(data.lastModified).toLocaleString()})`
    );
    
    return data;
  } catch (error) {
    console.error(
      `[NarrationLoader] Failed to load narration for demo "${demoId}":`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

/**
 * Get complete segment data (including visual description and notes).
 * Returns null if not found.
 * 
 * @param narrationData - The loaded narration data (or null)
 * @param chapter - Chapter number
 * @param slide - Slide number within chapter
 * @param segmentId - 0-based segment index
 * @returns The complete segment data or null if not found
 */
export function getNarrationSegment(
  narrationData: NarrationData | null,
  chapter: number,
  slide: number,
  segmentId: number
): NarrationSegment | null {
  if (!narrationData) {
    return null;
  }
  
  const slideData = narrationData.slides.find(
    s => s.chapter === chapter && s.slide === slide
  );
  
  if (!slideData) {
    return null;
  }
  
  const segment = slideData.segments.find(seg => seg.id === segmentId);
  
  return segment ?? null;
}

/**
 * Get all segments for a specific slide.
 * Returns empty array if slide not found.
 * 
 * @param narrationData - The loaded narration data (or null)
 * @param chapter - Chapter number
 * @param slide - Slide number within chapter
 * @returns Array of segments for the slide
 */
export function getSlideSegments(
  narrationData: NarrationData | null,
  chapter: number,
  slide: number
): NarrationSegment[] {
  if (!narrationData) {
    return [];
  }
  
  const slideData = narrationData.slides.find(
    s => s.chapter === chapter && s.slide === slide
  );
  
  return slideData?.segments ?? [];
}

/**
 * Get statistics about loaded narration data.
 * Useful for debugging and validation.
 * 
 * @param narrationData - The loaded narration data (or null)
 * @returns Statistics object or null
 */
export function getNarrationStats(narrationData: NarrationData | null): {
  totalSlides: number;
  totalSegments: number;
  slidesByChapter: Record<number, number>;
  segmentsByChapter: Record<number, number>;
} | null {
  if (!narrationData) {
    return null;
  }
  
  const slidesByChapter: Record<number, number> = {};
  const segmentsByChapter: Record<number, number> = {};
  let totalSegments = 0;
  
  narrationData.slides.forEach(slide => {
    slidesByChapter[slide.chapter] = (slidesByChapter[slide.chapter] || 0) + 1;
    segmentsByChapter[slide.chapter] = (segmentsByChapter[slide.chapter] || 0) + slide.segments.length;
    totalSegments += slide.segments.length;
  });
  
  return {
    totalSlides: narrationData.slides.length,
    totalSegments,
    slidesByChapter,
    segmentsByChapter
  };
}