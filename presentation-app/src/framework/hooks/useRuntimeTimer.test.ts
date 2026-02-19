// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRuntimeTimer } from './useRuntimeTimer';

describe('useRuntimeTimer', () => {
  beforeEach(() => {
    vi.spyOn(performance, 'now').mockReturnValue(1000);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with defaults', () => {
    const { result } = renderHook(() => useRuntimeTimer({ isPlaying: false, enabled: false }));
    expect(result.current.elapsedMs).toBe(0);
    expect(result.current.finalElapsedSeconds).toBeNull();
    expect(result.current.showRuntimeTimerOption).toBe(false);
    expect(result.current.runtimeStart).toBeNull();
  });

  it('sets runtimeStart when isPlaying becomes true', () => {
    const { result, rerender } = renderHook(
      ({ isPlaying }) => useRuntimeTimer({ isPlaying, enabled: true }),
      { initialProps: { isPlaying: false } }
    );
    expect(result.current.runtimeStart).toBeNull();

    rerender({ isPlaying: true });
    expect(result.current.runtimeStart).toBe(1000);
    expect(result.current.elapsedMs).toBe(0);
  });

  it('resets runtimeStart when isPlaying becomes false', () => {
    const { result, rerender } = renderHook(
      ({ isPlaying }) => useRuntimeTimer({ isPlaying, enabled: true }),
      { initialProps: { isPlaying: true } }
    );
    expect(result.current.runtimeStart).toBe(1000);

    rerender({ isPlaying: false });
    expect(result.current.runtimeStart).toBeNull();
  });

  it('allows toggling showRuntimeTimerOption', () => {
    const { result } = renderHook(() => useRuntimeTimer({ isPlaying: false, enabled: false }));
    expect(result.current.showRuntimeTimerOption).toBe(false);

    act(() => result.current.setShowRuntimeTimerOption(true));
    expect(result.current.showRuntimeTimerOption).toBe(true);
  });

  it('allows setting finalElapsedSeconds', () => {
    const { result } = renderHook(() => useRuntimeTimer({ isPlaying: false, enabled: false }));
    act(() => result.current.setFinalElapsedSeconds(42.5));
    expect(result.current.finalElapsedSeconds).toBe(42.5);
  });
});
