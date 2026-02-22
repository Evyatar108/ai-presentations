/**
 * Hook for TTS audio regeneration in SlidePlayer.
 * Encapsulates regeneration state, status messages, and the ttsClient interaction.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { SlideMetadata } from '../slides/SlideMetadata';
import { regenerateSegment } from '../utils/ttsClient';

export interface RegenerationStatus {
  type: 'success' | 'error';
  message: string;
}

export interface UseTtsRegenerationOptions {
  /** Demo ID used to build the correct audio output path */
  demoId: string;
  /** Current slide metadata (may be undefined if no metadata is loaded) */
  currentSlideMetadata: SlideMetadata | undefined;
  /** Current segment index within the slide */
  currentSegmentIndex: number;
  /** Callback invoked after successful regeneration to refresh the segment context */
  onSegmentRefresh: () => void;
  /** Called before regeneration starts. Throw to abort. */
  preCheck?: () => Promise<void>;
  /** Called after successful regeneration with the updated audio path. */
  postProcess?: (updatedAudioPath: string) => Promise<void>;
  /** Demo-level instruct (lowest priority fallback) */
  demoInstruct?: string;
}

export interface UseTtsRegenerationResult {
  /** Whether a regeneration request is in flight */
  regeneratingSegment: boolean;
  /** Status message from the last regeneration attempt, or null */
  regenerationStatus: RegenerationStatus | null;
  /** Trigger regeneration for the current segment */
  handleRegenerateSegment: (addPauses?: boolean) => Promise<void>;
}

export function useTtsRegeneration({
  demoId,
  currentSlideMetadata,
  currentSegmentIndex,
  onSegmentRefresh,
  preCheck,
  postProcess,
  demoInstruct,
}: UseTtsRegenerationOptions): UseTtsRegenerationResult {
  const [regeneratingSegment, setRegeneratingSegment] = useState(false);
  const [regenerationStatus, setRegenerationStatus] = useState<RegenerationStatus | null>(null);

  // Track timeouts and audio elements for cleanup on unmount
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount: clear all pending timeouts and stop preview audio
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const id of timers) clearTimeout(id);
      timers.clear();
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.onended = null;
        previewAudioRef.current.onerror = null;
        previewAudioRef.current = null;
      }
    };
  }, []);

  /** Schedule a timeout and track it for cleanup */
  const safeTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timersRef.current.delete(id);
      fn();
    }, ms);
    timersRef.current.add(id);
    return id;
  }, []);

  const handleRegenerateSegment = useCallback(async (addPauses: boolean = true) => {
    const segment = currentSlideMetadata?.audioSegments[currentSegmentIndex];

    if (!segment?.narrationText || !currentSlideMetadata) {
      setRegenerationStatus({
        type: 'error',
        message: 'No narration text available',
      });
      safeTimeout(() => setRegenerationStatus(null), 5000);
      return;
    }

    setRegeneratingSegment(true);
    setRegenerationStatus(null);

    try {
      // Run optional pre-check (e.g. TTS health check); throw to abort
      if (preCheck) {
        await preCheck();
      }

      // Resolve instruct: segment → slide → demo
      const resolvedInstruct =
        segment.instruct ??
        currentSlideMetadata.instruct ??
        demoInstruct;

      console.log('[SlidePlayer] Starting regeneration for:', segment.id);
      console.log('[SlidePlayer] Add pauses:', addPauses);
      if (resolvedInstruct) {
        console.log('[SlidePlayer] Instruct:', resolvedInstruct);
      }

      const result = await regenerateSegment({
        demoId,
        chapter: currentSlideMetadata.chapter,
        slide: currentSlideMetadata.slide,
        segmentIndex: currentSegmentIndex,
        segmentId: segment.id,
        narrationText: segment.narrationText,
        addPauses,
        instruct: resolvedInstruct,
      });

      if (result.success) {
        console.log('[SlidePlayer] Regeneration successful:', result.filePath);

        setRegenerationStatus({
          type: 'success',
          message: `✓ Regenerated ${segment.id}`,
        });

        // Update audio path with cache-busting timestamp
        const basePath = (segment.audioFilePath ?? '').split('?')[0];
        const newAudioPath = `${basePath}?t=${result.timestamp}`;
        segment.audioFilePath = newAudioPath;

        // Run optional post-processing (e.g. reload audio in narration editor)
        if (postProcess) {
          await postProcess(newAudioPath);
        }

        // Stop any previous preview before playing the new one
        if (previewAudioRef.current) {
          previewAudioRef.current.pause();
          previewAudioRef.current.onended = null;
          previewAudioRef.current.onerror = null;
        }

        // Play the newly generated audio immediately
        console.log('[SlidePlayer] Playing regenerated audio:', newAudioPath);
        const audio = new Audio(newAudioPath);
        previewAudioRef.current = audio;
        audio.onended = () => {
          console.log('[SlidePlayer] Regenerated audio playback completed');
          if (previewAudioRef.current === audio) previewAudioRef.current = null;
        };
        audio.onerror = (e) => {
          console.error('[SlidePlayer] Failed to play regenerated audio:', e);
          setRegenerationStatus({
            type: 'error',
            message: 'Audio playback failed',
          });
          if (previewAudioRef.current === audio) previewAudioRef.current = null;
        };
        audio.play().catch((err) => {
          console.error('[SlidePlayer] Audio play() rejected:', err);
        });

        // Trigger segment context refresh
        onSegmentRefresh();

        // Auto-clear success message after 3s
        safeTimeout(() => setRegenerationStatus(null), 3000);
      } else {
        console.error('[SlidePlayer] Regeneration failed:', result.error);

        setRegenerationStatus({
          type: 'error',
          message: result.error || 'Generation failed',
        });

        // Clear error after 5s
        safeTimeout(() => setRegenerationStatus(null), 5000);
      }
    } catch (error: unknown) {
      console.error('[SlidePlayer] Regeneration exception:', error);

      setRegenerationStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Network error',
      });

      safeTimeout(() => setRegenerationStatus(null), 5000);
    } finally {
      setRegeneratingSegment(false);
    }
  }, [demoId, currentSlideMetadata, currentSegmentIndex, onSegmentRefresh, preCheck, postProcess, demoInstruct, safeTimeout]);

  return {
    regeneratingSegment,
    regenerationStatus,
    handleRegenerateSegment,
  };
}
