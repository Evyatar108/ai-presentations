import { useMemo } from 'react';
import { useAudioTimeContextOptional } from '../contexts/AudioTimeContext';

export interface MarkerState {
  /** Resolved timestamp in seconds (null if marker not found) */
  time: number | null;
  /** True if currentTime >= marker.time (progressive — stays true once reached) */
  reached: boolean;
}

export interface UseMarkerOptions {
  /**
   * Value for `reached` when AudioTimeContext exists but the marker is not
   * found in alignment data (e.g., alignment not loaded yet, between segment
   * transitions). Default: `false`.
   *
   * Set to `true` for in-DOM components (opacity/dimming) where you want
   * content visible while alignment loads. Leave as `false` for mount/unmount
   * components (RevealAtMarker) to avoid flash-of-content.
   */
  defaultReached?: boolean;
}

/**
 * Hook to check whether a single marker has been reached during audio playback.
 * Progressive: once reached, stays true for the remainder of the segment.
 *
 * Graceful degradation:
 * - No AudioTimeContext (manual mode, no narration): `reached` defaults to `true`
 *   so content is immediately visible.
 * - Context exists but marker not found (alignment not loaded, between segment
 *   transitions): `reached` defaults to `options.defaultReached` (default `false`) —
 *   content stays hidden until alignment confirms the marker timestamp.
 */
export function useMarker(id: string, options?: UseMarkerOptions): MarkerState {
  const ctx = useAudioTimeContextOptional();
  const defaultReached = options?.defaultReached ?? false;

  const currentTime = ctx?.currentTime ?? 0;

  return useMemo(() => {
    // No AudioTimeContext at all → manual mode / no narration → show content
    if (!ctx) {
      return { time: null, reached: true };
    }

    const time = ctx.getMarkerTime(id);
    if (time === null) {
      // Context exists but marker not resolved yet
      return { time: null, reached: defaultReached };
    }

    return {
      time,
      reached: currentTime >= time,
    };
  }, [ctx, id, currentTime, defaultReached]);
}

export interface MarkerRangeState {
  /** True if currentTime is within [fromTime, untilTime) */
  within: boolean;
  /** 0→1 progress through the range */
  progress: number;
  fromTime: number | null;
  untilTime: number | null;
}

export interface UseMarkerRangeOptions {
  /**
   * Value for `within` when AudioTimeContext exists but markers are not found
   * in alignment data. Default: `false`.
   */
  defaultWithin?: boolean;
}

/**
 * Hook to check whether the current audio time is within a range
 * defined by two markers.
 *
 * Graceful degradation:
 * - No AudioTimeContext (manual mode): `within` defaults to `true`.
 * - Context exists but markers not found: `within` defaults to
 *   `options.defaultWithin` (default `false`) — content stays hidden
 *   until alignment loads.
 */
export function useMarkerRange(fromId: string, untilId: string, options?: UseMarkerRangeOptions): MarkerRangeState {
  const ctx = useAudioTimeContextOptional();
  const defaultWithin = options?.defaultWithin ?? false;
  const currentTime = ctx?.currentTime ?? 0;

  return useMemo(() => {
    // No AudioTimeContext at all → manual mode / no narration → show content
    if (!ctx) {
      return { within: true, progress: 0, fromTime: null, untilTime: null };
    }

    const fromTime = ctx.getMarkerTime(fromId);
    const untilTime = ctx.getMarkerTime(untilId);

    if (fromTime === null || untilTime === null) {
      // Context exists but markers not resolved yet
      return { within: defaultWithin, progress: 0, fromTime, untilTime };
    }

    const within = currentTime >= fromTime && currentTime < untilTime;
    const range = untilTime - fromTime;
    const progress = range > 0
      ? Math.max(0, Math.min(1, (currentTime - fromTime) / range))
      : 0;

    return { within, progress, fromTime, untilTime };
  }, [ctx, fromId, untilId, currentTime, defaultWithin]);
}
