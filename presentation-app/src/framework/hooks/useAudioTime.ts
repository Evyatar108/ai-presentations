import { useAudioTimeContextOptional } from '../contexts/AudioTimeContext';

export interface AudioTimeState {
  /** Seconds within current segment's audio (0 if no context) */
  currentTime: number;
  /** Duration of current segment's audio (0 if no context) */
  duration: number;
}

/**
 * Raw audio time hook for fully custom logic (e.g., scrub bars, time-based interpolation).
 * Degrades gracefully: returns zeros when no AudioTimeProvider is present.
 */
export function useAudioTime(): AudioTimeState {
  const ctx = useAudioTimeContextOptional();

  return {
    currentTime: ctx?.currentTime ?? 0,
    duration: ctx?.duration ?? 0,
  };
}
