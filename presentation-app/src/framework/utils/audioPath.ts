import type { AudioSegment } from '../slides/SlideMetadata';

/**
 * Build the filename portion of an audio segment path.
 * @example buildAudioFileName(0, 0) → "s0_segment_00.wav"
 */
export function buildAudioFileName(
  slide: number,
  segmentIndex: number,
): string {
  const paddedIndex = String(segmentIndex).padStart(2, '0');
  return `s${slide}_segment_${paddedIndex}.wav`;
}

/**
 * Build the chapter-relative output path (used by TTS scripts and save endpoint).
 * @example buildAudioOutputPath(0, 0, 0) → "c0/s0_segment_00.wav"
 */
export function buildAudioOutputPath(
  chapter: number,
  slide: number,
  segmentIndex: number,
): string {
  return `c${chapter}/${buildAudioFileName(slide, segmentIndex)}`;
}

/**
 * Build the full public-relative audio file path served by the dev server.
 * @example buildAudioFilePath('my-demo', 0, 0, 0) → "/audio/my-demo/c0/s0_segment_00.wav"
 */
export function buildAudioFilePath(
  demoId: string,
  chapter: number,
  slide: number,
  segmentIndex: number,
): string {
  return `/audio/${demoId}/${buildAudioOutputPath(chapter, slide, segmentIndex)}`;
}

/**
 * Resolve the audio file path for a segment: use the explicit override if
 * present, otherwise auto-derive from slide coordinates.
 */
export function resolveAudioFilePath(
  segment: AudioSegment,
  demoId: string,
  chapter: number,
  slide: number,
  segmentIndex: number
): string {
  if (segment.audioFilePath) {
    return segment.audioFilePath;
  }
  return buildAudioFilePath(demoId, chapter, slide, segmentIndex);
}
