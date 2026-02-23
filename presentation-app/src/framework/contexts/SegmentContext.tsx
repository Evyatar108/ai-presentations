import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AudioSegment } from '../slides/SlideMetadata';
import { debug } from '../utils/debug';

/**
 * Segment state for the current slide
 */
export interface SegmentState {
  currentSegmentIndex: number;
  currentSegment: AudioSegment | null;
  totalSegments: number;
  isSegmentActive: boolean;
  slideKey: string; // Format: "Ch{chapter}:U{utterance}"
  segments: AudioSegment[];
}

/**
 * Segment control functions
 */
export interface SegmentControls {
  setCurrentSegment: (index: number) => void;
  nextSegment: () => void;
  previousSegment: () => void;
  resetSegments: () => void;
  initializeSegments: (slideKey: string, segments: AudioSegment[]) => void;
}

/**
 * Combined segment context value
 */
export interface SegmentContextValue extends SegmentState, SegmentControls {}

const SegmentContext = createContext<SegmentContextValue | null>(null);

/**
 * Provider component for segment state management
 */
export const SegmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SegmentState>({
    currentSegmentIndex: 0,
    currentSegment: null,
    totalSegments: 0,
    isSegmentActive: false,
    slideKey: '',
    segments: []
  });

  const initializeSegments = useCallback((slideKey: string, newSegments: AudioSegment[]) => {
    debug.log(`[SegmentContext] Initializing segments for ${slideKey}, count: ${newSegments.length}`);

    setState({
      currentSegmentIndex: 0,
      currentSegment: newSegments[0] || null,
      totalSegments: newSegments.length,
      isSegmentActive: newSegments.length > 0,
      slideKey,
      segments: newSegments
    });

    return newSegments;
  }, []);

  const setCurrentSegment = useCallback((index: number) => {
    setState(prev => {
      if (index < 0 || index >= prev.segments.length) {
        debug.warn(`[SegmentContext] Invalid segment index: ${index}, segments length: ${prev.segments.length}`);
        return prev;
      }

      debug.log(`[SegmentContext] Setting segment index to ${index} (${prev.segments[index]?.id})`);
      return {
        ...prev,
        currentSegmentIndex: index,
        currentSegment: prev.segments[index]
      };
    });
  }, []);

  const nextSegment = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentSegmentIndex + 1;
      if (nextIndex >= prev.segments.length) {
        debug.log('[SegmentContext] Already at last segment');
        return prev;
      }

      debug.log(`[SegmentContext] Moving to next segment: ${nextIndex} (${prev.segments[nextIndex]?.id})`);
      return {
        ...prev,
        currentSegmentIndex: nextIndex,
        currentSegment: prev.segments[nextIndex]
      };
    });
  }, []);

  const previousSegment = useCallback(() => {
    setState(prev => {
      const prevIndex = prev.currentSegmentIndex - 1;
      if (prevIndex < 0) {
        debug.log('[SegmentContext] Already at first segment');
        return prev;
      }

      debug.log(`[SegmentContext] Moving to previous segment: ${prevIndex} (${prev.segments[prevIndex]?.id})`);
      return {
        ...prev,
        currentSegmentIndex: prevIndex,
        currentSegment: prev.segments[prevIndex]
      };
    });
  }, []);

  const resetSegments = useCallback(() => {
    setState(prev => {
      debug.log('[SegmentContext] Resetting segments to index 0');
      return {
        ...prev,
        currentSegmentIndex: 0,
        currentSegment: prev.segments[0] || null
      };
    });
  }, []);

  const contextValue: SegmentContextValue = {
    ...state,
    setCurrentSegment,
    nextSegment,
    previousSegment,
    resetSegments,
    initializeSegments
  };

  return (
    <SegmentContext.Provider value={contextValue}>
      {children}
    </SegmentContext.Provider>
  );
};

/**
 * Hook to access segment context
 * Throws error if used outside SegmentProvider
 */
export function useSegmentContext(): SegmentContextValue {
  const context = useContext(SegmentContext);
  if (!context) {
    throw new Error('useSegmentContext must be used within a SegmentProvider');
  }
  return context;
}

/**
 * Return type of `useSegmentedAnimation()`.
 * Provides a simplified API for slides that use segmented progressive reveals.
 */
export interface SegmentedAnimationAPI {
  currentSegmentIndex: number;
  currentSegment: AudioSegment | null;
  totalSegments: number;
  isSegmentActive: boolean;
  /** True if `segmentIndex <= currentSegmentIndex` (progressive reveal). */
  isSegmentVisible: (segmentIndex: number) => boolean;
  /** True if `segmentIndex === currentSegmentIndex` (exact match). */
  isOnSegment: (segmentIndex: number) => boolean;
  /** True if the segment with the given `id` is visible (progressive reveal). */
  isSegmentVisibleById: (id: number) => boolean;
  nextSegment: () => void;
  previousSegment: () => void;
  resetSegments: () => void;
}

/**
 * Hook for slides that use segmented animations.
 * Provides simplified API for common patterns.
 */
export function useSegmentedAnimation(): SegmentedAnimationAPI {
  const context = useSegmentContext();

  // Helper: check if a specific segment is active or past
  const isSegmentVisible = useCallback((segmentIndex: number): boolean => {
    return context.currentSegmentIndex >= segmentIndex;
  }, [context.currentSegmentIndex]);

  // Helper: check if currently on a specific segment
  const isOnSegment = useCallback((segmentIndex: number): boolean => {
    return context.currentSegmentIndex === segmentIndex;
  }, [context.currentSegmentIndex]);

  // Helper: check if a segment with the given id is visible
  const isSegmentVisibleById = useCallback((id: number): boolean => {
    const idx = context.segments.findIndex(seg => seg.id === id);
    if (idx === -1) {
      if (import.meta.env.DEV) {
        debug.warn(`[SegmentContext] isSegmentVisibleById: unknown segment id "${id}"`);
      }
      return false;
    }
    return context.currentSegmentIndex >= idx;
  }, [context.currentSegmentIndex, context.segments]);

  return {
    currentSegmentIndex: context.currentSegmentIndex,
    currentSegment: context.currentSegment,
    totalSegments: context.totalSegments,
    isSegmentActive: context.isSegmentActive,
    isSegmentVisible,
    isOnSegment,
    isSegmentVisibleById,
    nextSegment: context.nextSegment,
    previousSegment: context.previousSegment,
    resetSegments: context.resetSegments
  };
}
