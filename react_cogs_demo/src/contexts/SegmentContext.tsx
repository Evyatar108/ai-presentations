import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AudioSegment } from '../slides/SlideMetadata';

/**
 * Segment state for the current slide
 */
export interface SegmentState {
  currentSegmentIndex: number;
  currentSegment: AudioSegment | null;
  totalSegments: number;
  isSegmentActive: boolean;
  slideKey: string; // Format: "Ch{chapter}:U{utterance}"
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
  const [state, setState] = useState<SegmentState & { segments: AudioSegment[] }>({
    currentSegmentIndex: 0,
    currentSegment: null,
    totalSegments: 0,
    isSegmentActive: false,
    slideKey: '',
    segments: []
  });

  const initializeSegments = useCallback((slideKey: string, newSegments: AudioSegment[]) => {
    console.log(`[SegmentContext] Initializing segments for ${slideKey}, count: ${newSegments.length}`);
    
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
        console.warn(`[SegmentContext] Invalid segment index: ${index}, segments length: ${prev.segments.length}`);
        return prev;
      }
      
      console.log(`[SegmentContext] Setting segment index to ${index} (${prev.segments[index]?.id})`);
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
        console.log('[SegmentContext] Already at last segment');
        return prev;
      }
      
      console.log(`[SegmentContext] Moving to next segment: ${nextIndex} (${prev.segments[nextIndex]?.id})`);
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
        console.log('[SegmentContext] Already at first segment');
        return prev;
      }
      
      console.log(`[SegmentContext] Moving to previous segment: ${prevIndex} (${prev.segments[prevIndex]?.id})`);
      return {
        ...prev,
        currentSegmentIndex: prevIndex,
        currentSegment: prev.segments[prevIndex]
      };
    });
  }, []);

  const resetSegments = useCallback(() => {
    setState(prev => {
      console.log('[SegmentContext] Resetting segments to index 0');
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
 * Hook for slides that use segmented animations
 * Provides simplified API for common patterns
 */
export function useSegmentedAnimation() {
  const context = useSegmentContext();
  
  // Helper: check if a specific segment is active or past
  const isSegmentVisible = useCallback((segmentIndex: number): boolean => {
    return context.currentSegmentIndex >= segmentIndex;
  }, [context.currentSegmentIndex]);
  
  // Helper: check if currently on a specific segment
  const isOnSegment = useCallback((segmentIndex: number): boolean => {
    return context.currentSegmentIndex === segmentIndex;
  }, [context.currentSegmentIndex]);

  return {
    currentSegmentIndex: context.currentSegmentIndex,
    currentSegment: context.currentSegment,
    totalSegments: context.totalSegments,
    isSegmentActive: context.isSegmentActive,
    isSegmentVisible,
    isOnSegment,
    nextSegment: context.nextSegment,
    previousSegment: context.previousSegment,
    resetSegments: context.resetSegments
  };
}