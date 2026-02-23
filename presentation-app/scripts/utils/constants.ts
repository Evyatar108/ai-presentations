/**
 * Shared constants for build scripts and CLI tools.
 *
 * Centralizes magic numbers and regex patterns that were scattered
 * across multiple scripts.
 */

/** Default batch size for parallel processing (TTS generation, alignment, verification). */
export const DEFAULT_BATCH_SIZE = 10;

/** Health-check timeout (ms) for TTS / WhisperX servers. */
export const SERVER_HEALTH_TIMEOUT_MS = 5000;

/** Default TTS server port. */
export const DEFAULT_TTS_PORT = 5050;

/** Default WhisperX server port. */
export const DEFAULT_WHISPERX_PORT = 5060;

/** Timeout (ms) for individual batch requests (alignment, verification). */
export const BATCH_REQUEST_TIMEOUT_MS = 600_000; // 10 minutes

/** Timeout (ms) for TTS generation batch requests (can be slow). */
export const TTS_BATCH_REQUEST_TIMEOUT_MS = 10_800_000; // 3 hours

/** Dev server port for Playwright tests. */
export const DEV_SERVER_PORT = 5173;

/** Regex pattern for inline markers in narration text. */
export const MARKER_REGEX = /\{#(\w+)\}|\{(\w+)#\}/g;

/** Build the expected audio filename for a segment. */
export function buildAudioFilename(slideNum: number, segmentIndex: number): string {
  return `s${slideNum}_segment_${String(segmentIndex).padStart(2, '0')}.wav`;
}
