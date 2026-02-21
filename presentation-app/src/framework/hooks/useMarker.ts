import { useMemo } from 'react';
import { useAudioTimeContextOptional } from '../contexts/AudioTimeContext';

export interface MarkerState {
  /** Resolved timestamp in seconds (null if marker not found) */
  time: number | null;
  /** True if currentTime >= marker.time (progressive — stays true once reached) */
  reached: boolean;
}

/**
 * Hook to check whether a single marker has been reached during audio playback.
 * Progressive: once reached, stays true for the remainder of the segment.
 *
 * Degrades gracefully: when no alignment data exists, `reached` defaults to true
 * (content is immediately visible without sync).
 */
export function useMarker(id: string): MarkerState {
  const ctx = useAudioTimeContextOptional();

  const currentTime = ctx?.currentTime ?? 0;

  return useMemo(() => {
    if (!ctx) {
      return { time: null, reached: true };
    }

    const time = ctx.getMarkerTime(id);
    if (time === null) {
      // Marker not found in alignment data — degrade gracefully
      return { time: null, reached: true };
    }

    return {
      time,
      reached: currentTime >= time,
    };
  }, [ctx, id, currentTime]);
}

export interface MarkerRangeState {
  /** True if currentTime is within [fromTime, untilTime) */
  within: boolean;
  /** 0→1 progress through the range */
  progress: number;
  fromTime: number | null;
  untilTime: number | null;
}

/**
 * Hook to check whether the current audio time is within a range
 * defined by two markers.
 *
 * Degrades gracefully: when markers are missing, `within` defaults to true
 * and `progress` is 0.
 */
export function useMarkerRange(fromId: string, untilId: string): MarkerRangeState {
  const ctx = useAudioTimeContextOptional();
  const currentTime = ctx?.currentTime ?? 0;

  return useMemo(() => {
    if (!ctx) {
      return { within: true, progress: 0, fromTime: null, untilTime: null };
    }

    const fromTime = ctx.getMarkerTime(fromId);
    const untilTime = ctx.getMarkerTime(untilId);

    if (fromTime === null || untilTime === null) {
      return { within: true, progress: 0, fromTime, untilTime };
    }

    const within = currentTime >= fromTime && currentTime < untilTime;
    const range = untilTime - fromTime;
    const progress = range > 0
      ? Math.max(0, Math.min(1, (currentTime - fromTime) / range))
      : 0;

    return { within, progress, fromTime, untilTime };
  }, [ctx, fromId, untilId, currentTime]);
}
