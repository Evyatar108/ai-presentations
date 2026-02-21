import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSegmentedAnimation } from '../../contexts/SegmentContext';

export interface RevealSequenceContextValue {
  /** When true, newly-entering Reveals should suppress their mount. */
  holdEntrance: boolean;
  /** Called by a Reveal when it detects an exit (visible → invisible). */
  onExitStart: () => void;
  /** Called by a Reveal's onAnimationComplete when its exit (hidden) animation finishes. */
  onExitComplete: () => void;
}

const RevealSequenceContext = createContext<RevealSequenceContextValue | null>(null);

/**
 * Internal hook — reads the nearest RevealSequence context (or null).
 */
export function useRevealSequence(): RevealSequenceContextValue | null {
  return useContext(RevealSequenceContext);
}

interface RevealSequenceProps {
  /** Delay in milliseconds between all exits completing and entrances starting. Default: `500`. */
  delay?: number;
  children: React.ReactNode;
}

/**
 * Coordinates exit-before-enter sequencing for child `<Reveal>` and `<RevealGroup>` components.
 *
 * When the segment changes, exiting elements animate to their `hidden` variant but **stay
 * mounted** (preserving layout space). Only after all exit animations complete (plus an
 * optional `delay`) are exiting elements unmounted and entering elements mounted in a
 * **single React render** — preventing double layout shifts in flex-centered containers.
 *
 * Inside a RevealSequence, child Reveals do NOT use AnimatePresence. They control
 * enter/exit via the `animate` prop ('visible' / 'hidden') and report animation
 * completion via `onAnimationComplete`.
 *
 * @example
 * ```tsx
 * <RevealSequence delay={200}>
 *   <Reveal from={0} until={1}>Exits first</Reveal>
 *   <Reveal from={2}>Enters 200ms after exit completes</Reveal>
 * </RevealSequence>
 * ```
 */
export const RevealSequence: React.FC<RevealSequenceProps> = ({ delay = 500, children }) => {
  const { currentSegmentIndex } = useSegmentedAnimation();
  const prevIndexRef = useRef(currentSegmentIndex);
  const pendingExitsRef = useRef(0);
  const holdingRef = useRef(false);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [releaseCounter, setReleaseCounter] = useState(0);

  // Detect segment change synchronously during render so children
  // see holdEntrance=true in the SAME render cycle.
  if (currentSegmentIndex !== prevIndexRef.current) {
    prevIndexRef.current = currentSegmentIndex;
    pendingExitsRef.current = 0;
    holdingRef.current = true;
    // Clear any pending delay timer from a previous transition
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = undefined;
    }
  }

  const release = useCallback(() => {
    holdingRef.current = false;
    setReleaseCounter(c => c + 1);
  }, []);

  const releaseWithDelay = useCallback(() => {
    if (delay > 0) {
      delayTimerRef.current = setTimeout(release, delay);
    } else {
      release();
    }
  }, [delay, release]);

  // Safety: if no exits registered after all children's effects have run, release immediately.
  // Parent effects fire after child effects, so pendingExitsRef reflects all child registrations.
  useEffect(() => {
    if (holdingRef.current && pendingExitsRef.current === 0) {
      releaseWithDelay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires on segment change
  }, [currentSegmentIndex]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    };
  }, []);

  const onExitStart = useCallback(() => {
    pendingExitsRef.current++;
  }, []);

  const onExitComplete = useCallback(() => {
    pendingExitsRef.current--;
    if (pendingExitsRef.current <= 0) {
      pendingExitsRef.current = 0;
      releaseWithDelay();
    }
  }, [releaseWithDelay]);

  // Recompute context value when segment changes (holdEntrance=true) or
  // when exits complete (releaseCounter increments, holdEntrance=false).
  const value = useMemo<RevealSequenceContextValue>(() => ({
    holdEntrance: holdingRef.current,
    onExitStart,
    onExitComplete,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- releaseCounter tracks holdingRef changes
  }), [currentSegmentIndex, releaseCounter, onExitStart, onExitComplete]);

  return (
    <RevealSequenceContext.Provider value={value}>
      {children}
    </RevealSequenceContext.Provider>
  );
};
