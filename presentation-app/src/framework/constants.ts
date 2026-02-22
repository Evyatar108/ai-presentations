/**
 * Framework-wide named constants.
 *
 * Centralizes magic numbers that appear in multiple files so they stay
 * consistent and are easy to find.
 */

/** Epsilon (seconds) for marker time comparisons — accounts for rAF timing jitter. */
export const MARKER_TIME_EPSILON = 0.02;

/** Delay (ms) before probing autoplay capability in NarratedController. */
export const AUTOPLAY_PROBE_DELAY_MS = 100;

/** Delay (ms) before advancing when a slide has no audio segments. */
export const NO_AUDIO_ADVANCE_DELAY_MS = 100;

/** Delay (ms) before advancing past a playback error. */
export const PLAYBACK_ERROR_ADVANCE_DELAY_MS = 1000;
