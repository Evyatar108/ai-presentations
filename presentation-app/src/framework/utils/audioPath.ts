import type { AudioSegment } from '../slides/SlideMetadata';

/**
 * Build the filename portion of an audio segment path.
 * @example buildAudioFileName(1, 0, 'intro') → "s1_segment_01_intro.wav"
 */
export function buildAudioFileName(
  slide: number,
  segmentIndex: number,
  segmentId: string
): string {
  const paddedIndex = String(segmentIndex + 1).padStart(2, '0');
  return `s${slide}_segment_${paddedIndex}_${segmentId}.wav`;
}

/**
 * Build the chapter-relative output path (used by TTS scripts and save endpoint).
 * @example buildAudioOutputPath(1, 1, 0, 'intro') → "c1/s1_segment_01_intro.wav"
 */
export function buildAudioOutputPath(
  chapter: number,
  slide: number,
  segmentIndex: number,
  segmentId: string
): string {
  return `c${chapter}/${buildAudioFileName(slide, segmentIndex, segmentId)}`;
}

/**
 * Build the full public-relative audio file path served by the dev server.
 * @example buildAudioFilePath('my-demo', 1, 1, 0, 'intro') → "/audio/my-demo/c1/s1_segment_01_intro.wav"
 */
export function buildAudioFilePath(
  demoId: string,
  chapter: number,
  slide: number,
  segmentIndex: number,
  segmentId: string
): string {
  return `/audio/${demoId}/${buildAudioOutputPath(chapter, slide, segmentIndex, segmentId)}`;
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
  return buildAudioFilePath(demoId, chapter, slide, segmentIndex, segment.id);
}
