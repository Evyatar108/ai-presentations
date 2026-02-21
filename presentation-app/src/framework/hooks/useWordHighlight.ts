import { useMemo } from 'react';
import { useAudioTimeContextOptional } from '../contexts/AudioTimeContext';
import type { AlignedWord } from '../alignment/types';

export interface WordHighlightState {
  /** Full word list for current segment (empty if no alignment) */
  words: AlignedWord[];
  /** Index of the currently active word (-1 if no word active) */
  currentWordIndex: number;
  /** The currently active word (null if none) */
  currentWord: AlignedWord | null;
}

/**
 * Hook for karaoke-style word highlighting.
 * Returns the full word list and which word is currently being spoken.
 *
 * Degrades gracefully: returns empty words array when no alignment data.
 */
export function useWordHighlight(): WordHighlightState {
  const ctx = useAudioTimeContextOptional();
  const currentTime = ctx?.currentTime ?? 0;
  const words = useMemo(() => ctx?.words ?? [], [ctx?.words]);

  return useMemo(() => {
    if (!ctx) {
      return { words: [] as AlignedWord[], currentWordIndex: -1, currentWord: null };
    }

    // Find current word by checking time ranges
    let currentWordIndex = -1;
    for (let i = 0; i < words.length; i++) {
      if (currentTime >= words[i].start && currentTime < words[i].end) {
        currentWordIndex = i;
        break;
      }
    }

    return {
      words,
      currentWordIndex,
      currentWord: currentWordIndex >= 0 ? words[currentWordIndex] : null,
    };
  }, [ctx, currentTime, words]);
}
