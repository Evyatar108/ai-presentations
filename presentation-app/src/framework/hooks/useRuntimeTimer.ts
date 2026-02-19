import { useState, useEffect } from 'react';

export interface UseRuntimeTimerOptions {
  isPlaying: boolean;
  enabled: boolean;
}

export interface UseRuntimeTimerResult {
  elapsedMs: number;
  finalElapsedSeconds: number | null;
  showRuntimeTimerOption: boolean;
  setShowRuntimeTimerOption: (value: boolean) => void;
  setFinalElapsedSeconds: (value: number | null) => void;
  runtimeStart: number | null;
}

export function useRuntimeTimer({ isPlaying, enabled }: UseRuntimeTimerOptions): UseRuntimeTimerResult {
  const [showRuntimeTimerOption, setShowRuntimeTimerOption] = useState(false);
  const [runtimeStart, setRuntimeStart] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finalElapsedSeconds, setFinalElapsedSeconds] = useState<number | null>(null);

  // Start / reset timing baseline when playback begins
  useEffect(() => {
    if (isPlaying) {
      setRuntimeStart(performance.now());
      setElapsedMs(0);
    } else {
      setRuntimeStart(null);
    }
  }, [isPlaying]);

  // Tick elapsed while playing and timer option is visible
  useEffect(() => {
    if (!isPlaying || !enabled || runtimeStart == null) return;
    let rafId: number;
    const tick = () => {
      setElapsedMs(performance.now() - runtimeStart);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, enabled, runtimeStart]);

  return {
    elapsedMs,
    finalElapsedSeconds,
    showRuntimeTimerOption,
    setShowRuntimeTimerOption,
    setFinalElapsedSeconds,
    runtimeStart,
  };
}
