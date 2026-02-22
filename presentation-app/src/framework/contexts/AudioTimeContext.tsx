import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import type { AlignedWord, ResolvedMarker, DemoAlignment } from '../alignment/types';

/**
 * AudioTimeContext tracks continuous audio playback time within the
 * active segment and provides resolved marker data for that segment.
 *
 * Separate from SegmentContext because segments are discrete (integer index)
 * while audio time is continuous (fractional seconds).
 */

export interface AudioTimeContextValue {
  /** Seconds within current segment's audio */
  currentTime: number;
  /** Current audio segment duration */
  duration: number;
  /** Resolved markers for the current segment */
  markers: ResolvedMarker[];
  /** Word-level alignment for the current segment (for karaoke highlighting) */
  words: AlignedWord[];

  /** Get a specific marker's timestamp by ID, or null if not found */
  getMarkerTime(id: string): number | null;

  /** Called by NarratedController on audio timeupdate */
  setCurrentTime(t: number): void;
  /** Called by NarratedController on audio loadedmetadata */
  setDuration(d: number): void;
  /** Called on segment start to load that segment's markers and words */
  initializeSegmentAlignment(markers: ResolvedMarker[], words: AlignedWord[]): void;
  /** Called on segment/slide change to reset time */
  reset(): void;

  /** Seek to a specific time within the current segment (updates UI + audio) */
  seekToTime(t: number): void;
  /** NarratedController registers its audio-seeking callback; returns unsubscribe */
  registerSeekHandler(fn: (t: number) => void): () => void;
}

const AudioTimeContext = createContext<AudioTimeContextValue | null>(null);

interface AudioTimeProviderProps {
  alignment: DemoAlignment | null;
  children: ReactNode;
}

export const AudioTimeProvider: React.FC<AudioTimeProviderProps> = ({ children }) => {
  const [currentTime, setCurrentTimeState] = useState(0);
  const [duration, setDurationState] = useState(0);
  const [markers, setMarkers] = useState<ResolvedMarker[]>([]);
  const [words, setWords] = useState<AlignedWord[]>([]);

  // Use ref for marker lookup to avoid re-render dependency
  const markersRef = useRef<ResolvedMarker[]>([]);
  markersRef.current = markers;

  const getMarkerTime = useCallback((id: string): number | null => {
    const marker = markersRef.current.find(m => m.id === id);
    return marker ? marker.time : null;
  }, []);

  const setCurrentTime = useCallback((t: number) => {
    setCurrentTimeState(t);
  }, []);

  const setDuration = useCallback((d: number) => {
    setDurationState(d);
  }, []);

  const initializeSegmentAlignment = useCallback((newMarkers: ResolvedMarker[], newWords: AlignedWord[]) => {
    setMarkers(newMarkers);
    setWords(newWords);
  }, []);

  const reset = useCallback(() => {
    setCurrentTimeState(0);
    setDurationState(0);
    setMarkers([]);
    setWords([]);
  }, []);

  // Seek support: NarratedController registers a handler that seeks the <audio> element
  const seekHandlerRef = useRef<((t: number) => void) | null>(null);

  const seekToTime = useCallback((t: number) => {
    setCurrentTimeState(t);
    seekHandlerRef.current?.(t);
  }, []);

  const registerSeekHandler = useCallback((fn: (t: number) => void) => {
    seekHandlerRef.current = fn;
    return () => {
      if (seekHandlerRef.current === fn) seekHandlerRef.current = null;
    };
  }, []);

  const value: AudioTimeContextValue = {
    currentTime,
    duration,
    markers,
    words,
    getMarkerTime,
    setCurrentTime,
    setDuration,
    initializeSegmentAlignment,
    reset,
    seekToTime,
    registerSeekHandler,
  };

  return (
    <AudioTimeContext.Provider value={value}>
      {children}
    </AudioTimeContext.Provider>
  );
};

/**
 * Hook to access audio time context.
 * Throws if used outside AudioTimeProvider.
 */
export function useAudioTimeContext(): AudioTimeContextValue {
  const context = useContext(AudioTimeContext);
  if (!context) {
    throw new Error('useAudioTimeContext must be used within an AudioTimeProvider');
  }
  return context;
}

/**
 * Hook to access audio time context, returning null if outside provider.
 * Used by components that should degrade gracefully without alignment data.
 */
export function useAudioTimeContextOptional(): AudioTimeContextValue | null {
  return useContext(AudioTimeContext);
}
