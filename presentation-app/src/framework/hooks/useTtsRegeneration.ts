/**
 * Hook for TTS audio regeneration in SlidePlayer.
 * Encapsulates regeneration state, status messages, and the ttsClient interaction.
 */

import { useState, useCallback } from 'react';
import type { SlideMetadata } from '../slides/SlideMetadata';
import { regenerateSegment } from '../utils/ttsClient';

export interface RegenerationStatus {
  type: 'success' | 'error';
  message: string;
}

export interface UseTtsRegenerationOptions {
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
  currentSlideMetadata,
  currentSegmentIndex,
  onSegmentRefresh,
  preCheck,
  postProcess,
}: UseTtsRegenerationOptions): UseTtsRegenerationResult {
  const [regeneratingSegment, setRegeneratingSegment] = useState(false);
  const [regenerationStatus, setRegenerationStatus] = useState<RegenerationStatus | null>(null);

  const handleRegenerateSegment = useCallback(async (addPauses: boolean = true) => {
    const segment = currentSlideMetadata?.audioSegments[currentSegmentIndex];

    if (!segment?.narrationText || !currentSlideMetadata) {
      setRegenerationStatus({
        type: 'error',
        message: 'No narration text available',
      });
      setTimeout(() => setRegenerationStatus(null), 5000);
      return;
    }

    setRegeneratingSegment(true);
    setRegenerationStatus(null);

    try {
      // Run optional pre-check (e.g. TTS health check); throw to abort
      if (preCheck) {
        await preCheck();
      }

      console.log('[SlidePlayer] Starting regeneration for:', segment.id);
      console.log('[SlidePlayer] Add pauses:', addPauses);

      const result = await regenerateSegment({
        chapter: currentSlideMetadata.chapter,
        slide: currentSlideMetadata.slide,
        segmentIndex: currentSegmentIndex,
        segmentId: segment.id,
        narrationText: segment.narrationText,
        addPauses,
      });

      if (result.success) {
        console.log('[SlidePlayer] Regeneration successful:', result.filePath);

        setRegenerationStatus({
          type: 'success',
          message: `✓ Regenerated ${segment.id}`,
        });

        // Update audio path with cache-busting timestamp
        const basePath = segment.audioFilePath.split('?')[0];
        const newAudioPath = `${basePath}?t=${result.timestamp}`;
        segment.audioFilePath = newAudioPath;

        // Run optional post-processing (e.g. reload audio in narration editor)
        if (postProcess) {
          await postProcess(newAudioPath);
        }

        // Play the newly generated audio immediately
        console.log('[SlidePlayer] Playing regenerated audio:', newAudioPath);
        const audio = new Audio(newAudioPath);
        audio.onended = () => {
          console.log('[SlidePlayer] Regenerated audio playback completed');
        };
        audio.onerror = (e) => {
          console.error('[SlidePlayer] Failed to play regenerated audio:', e);
          setRegenerationStatus({
            type: 'error',
            message: 'Audio playback failed',
          });
        };
        audio.play().catch((err) => {
          console.error('[SlidePlayer] Audio play() rejected:', err);
        });

        // Trigger segment context refresh
        onSegmentRefresh();

        // Auto-clear success message after 3s
        setTimeout(() => setRegenerationStatus(null), 3000);
      } else {
        console.error('[SlidePlayer] Regeneration failed:', result.error);

        setRegenerationStatus({
          type: 'error',
          message: result.error || 'Generation failed',
        });

        // Clear error after 5s
        setTimeout(() => setRegenerationStatus(null), 5000);
      }
    } catch (error: unknown) {
      console.error('[SlidePlayer] Regeneration exception:', error);

      setRegenerationStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Network error',
      });

      setTimeout(() => setRegenerationStatus(null), 5000);
    } finally {
      setRegeneratingSegment(false);
    }
  }, [currentSlideMetadata, currentSegmentIndex, onSegmentRefresh, preCheck, postProcess]);

  return {
    regeneratingSegment,
    regenerationStatus,
    handleRegenerateSegment,
  };
}
