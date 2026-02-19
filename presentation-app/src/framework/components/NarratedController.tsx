import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { hasAudioSegments, SlideComponentWithMetadata } from '../slides/SlideMetadata';
import { useSegmentContext } from '../contexts/SegmentContext';
import type { DemoMetadata } from '../demos/types';
import { resolveTimingConfig, TimingConfig } from '../demos/timing/types';
import { NarrationEditModal } from './NarrationEditModal';
import { getConfig } from '../config';
import { StartOverlay } from './narrated/StartOverlay';
import { ProgressBar } from './narrated/ProgressBar';
import { ErrorToast } from './narrated/ErrorToast';
import { NotificationStack } from './narrated/NotificationStack';
import { useNotifications } from '../hooks/useNotifications';
import { useRuntimeTimer } from '../hooks/useRuntimeTimer';
import { useApiHealth } from '../hooks/useApiHealth';
import { useNarrationEditor } from '../hooks/useNarrationEditor';

// Fallback audio file for missing segments
const getFallbackAudio = () => getConfig().fallbackAudioPath;

// Helper to load audio with fallback
const loadAudioWithFallback = async (primaryPath: string, segmentId: string): Promise<HTMLAudioElement> => {
  const audio = new Audio(primaryPath);

  return new Promise((resolve) => {
    const handleError = () => {
      console.warn(`[Audio] File not found: ${primaryPath}, using fallback silence for segment: ${segmentId}`);
      const fallbackAudio = new Audio(getFallbackAudio());
      resolve(fallbackAudio);
    };

    const handleSuccess = () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplaythrough', handleSuccess);
      resolve(audio);
    };

    audio.addEventListener('error', handleError);
    audio.addEventListener('canplaythrough', handleSuccess);
  });
};

export interface NarratedControllerProps {
  demoMetadata: DemoMetadata;
  demoTiming?: TimingConfig;
  slides: SlideComponentWithMetadata[];
  onSlideChange: (chapter: number, slide: number) => void;
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
  manualSlideChange?: { chapter: number; slide: number } | null;
}

export const NarratedController: React.FC<NarratedControllerProps> = ({
  demoMetadata,
  demoTiming,
  slides,
  onSlideChange,
  onPlaybackStart,
  onPlaybackEnd,
  manualSlideChange
}) => {
  // Use provided slides or empty array if not loaded yet
  const allSlides = slides || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [_isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStartOverlay, setShowStartOverlay] = useState(true);
  const [hideInterface, setHideInterface] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [autoAdvanceOnAudioEnd, setAutoAdvanceOnAudioEnd] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentIndexRef = useRef(currentIndex);
  const lastAutoAdvanceFromIndexRef = useRef<number | null>(null);

  // Segment context for multi-segment slides
  const segmentContext = useSegmentContext();

  // Extracted hooks
  const { notifications, showSuccess, showError, showWarning } = useNotifications();
  const timer = useRuntimeTimer({ isPlaying, enabled: true });
  const { showRuntimeTimerOption, setShowRuntimeTimerOption, elapsedMs, finalElapsedSeconds, setFinalElapsedSeconds, runtimeStart } = timer;
  const { apiAvailable } = useApiHealth();
  const editor = useNarrationEditor({
    demoMetadata,
    allSlides,
    currentIndex,
    currentSegmentIndex: segmentContext.currentSegmentIndex,
    audioEnabled,
    audioRef,
    apiAvailable,
    showSuccess,
    showError,
    showWarning,
    loadAudioWithFallback,
  });

  // Keep ref in sync with state
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Advance to next slide (narrated mode)
  const advanceSlide = useCallback(() => {
    const currentIdx = currentIndexRef.current;
    const nextIndex = currentIdx + 1;

    if (nextIndex >= allSlides.length) {
      const lastSlide = allSlides[allSlides.length - 1].metadata;
      const timing = resolveTimingConfig(demoTiming, lastSlide.timing);
      const plannedTotal = demoMetadata.durationInfo?.total ?? null;

      setTimeout(() => {
        let finalElapsedSec: number | null = null;
        if (runtimeStart != null) {
          finalElapsedSec = (performance.now() - runtimeStart) / 1000;
          setFinalElapsedSeconds(finalElapsedSec);
        }
        setIsPlaying(false);

        if (showRuntimeTimerOption && plannedTotal != null && finalElapsedSec != null) {
          const delta = finalElapsedSec - plannedTotal;
          console.log(`[RuntimeTimer] Completed. Elapsed=${finalElapsedSec.toFixed(2)}s Planned=${plannedTotal.toFixed(2)}s Δ=${delta.toFixed(2)}s`);
        } else if (showRuntimeTimerOption && finalElapsedSec != null) {
          console.log(`[RuntimeTimer] Completed. Elapsed=${finalElapsedSec.toFixed(2)}s (no planned total)`);
        }

        if (finalElapsedSec != null) {
          try {
            localStorage.setItem(`demoRuntime:${demoMetadata.id}`, JSON.stringify({
              elapsed: finalElapsedSec,
              plannedTotal: plannedTotal ?? finalElapsedSec,
            }));
          } catch (e) {
            console.warn('[RuntimeTimer] Persist failed', e);
          }
        }

        setShowStartOverlay(true);
        onPlaybackEnd?.();
      }, timing.afterFinalSlide);
      return;
    }

    setCurrentIndex(nextIndex);
  }, [onPlaybackEnd, demoMetadata.durationInfo?.total, showRuntimeTimerOption, runtimeStart, demoTiming, allSlides, demoMetadata.id, setFinalElapsedSeconds]);

  // Play audio for current slide in narrated mode
  useEffect(() => {
    if (!isPlaying || currentIndex >= allSlides.length || isManualMode) return;

    const currentSlide = allSlides[currentIndex].metadata;
    const slideKey = `Ch${currentSlide.chapter}:U${currentSlide.slide}`;

    console.log(`[NarratedController] Playing slide: ${slideKey} with ${currentSlide.audioSegments.length} segment(s)`);
    playSlideSegments(currentSlide, slideKey);

    onSlideChange(currentSlide.chapter, currentSlide.slide);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.onplay = null;
        audioRef.current.oncanplaythrough = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentIndex, isManualMode]);

  // Play slide segments
  const playSlideSegments = useCallback((slideMetadata: typeof allSlides[0]['metadata'], slideKey: string) => {
    const segments = slideMetadata.audioSegments;

    if (!segments || segments.length === 0) {
      console.warn(`[NarratedController] No audio segments for ${slideKey}, advancing immediately`);
      setTimeout(advanceSlide, 100);
      return;
    }

    segmentContext.initializeSegments(slideKey, segments);

    let currentSegmentIndex = 0;

    const playSegment = (segmentIndex: number) => {
      if (segmentIndex >= segments.length) {
        const timing = resolveTimingConfig(demoTiming, slideMetadata.timing);
        setTimeout(advanceSlide, timing.betweenSlides);
        return;
      }

      const segment = segments[segmentIndex];
      segmentContext.setCurrentSegment(segmentIndex);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.onplay = null;
      }

      setIsLoading(true);
      loadAudioWithFallback(segment.audioFilePath, segment.id).then(audio => {
        audioRef.current = audio;

        audio.onended = () => {
          setError(null);
          currentSegmentIndex++;
          const timing = resolveTimingConfig(demoTiming, slideMetadata.timing, segment.timing);
          setTimeout(() => playSegment(currentSegmentIndex), timing.betweenSegments);
        };

        audio.onerror = (e) => {
          console.error(`[NarratedController] Playback error for ${segment.id}:`, e);
          setError(`Playback error: ${segment.id}`);
          setIsLoading(false);
          setTimeout(() => {
            setError(null);
            currentSegmentIndex++;
            playSegment(currentSegmentIndex);
          }, 1000);
        };

        audio.onplay = () => {
          setError(null);
          setIsLoading(false);
        };

        audio.oncanplaythrough = () => setIsLoading(false);

        audio.play().catch(err => {
          console.error(`[NarratedController] Playback failed for ${segment.id}:`, err);
          setError(`Playback failed: ${segment.id}`);
          setIsLoading(false);
        });
      });
    };

    playSegment(0);
  }, [advanceSlide, segmentContext, demoTiming]);

  // Start narrated playback
  const handleStart = () => {
    if (allSlides.length === 0) { setError('No slides to play'); return; }
    setFinalElapsedSeconds(null);
    setShowStartOverlay(false);
    setIsPlaying(true);
    setIsManualMode(false);
    setCurrentIndex(0);
    onPlaybackStart?.();
  };

  // Start manual mode
  const handleManualMode = () => {
    if (allSlides.length === 0) { setError('No slides to play'); return; }
    setFinalElapsedSeconds(null);
    setShowStartOverlay(false);
    setIsPlaying(false);
    setIsManualMode(true);
    setAudioEnabled(true);
    setCurrentIndex(0);
    onSlideChange(allSlides[0].metadata.chapter, allSlides[0].metadata.slide);
  };

  // Initialize segments when slide changes in manual mode with audio
  useEffect(() => {
    if (!isManualMode || !audioEnabled || currentIndex >= allSlides.length) return;
    const slide = allSlides[currentIndex].metadata;
    const slideKey = `Ch${slide.chapter}:S${slide.slide}`;
    if (!hasAudioSegments(slide) || slide.audioSegments.length === 0) return;
    segmentContext.initializeSegments(slideKey, slide.audioSegments);
  }, [currentIndex, isManualMode, audioEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Play audio for current segment in manual mode
  useEffect(() => {
    if (!isManualMode || !audioEnabled || currentIndex >= allSlides.length) return;
    const slide = allSlides[currentIndex].metadata;
    const currentSegmentIdx = segmentContext.currentSegmentIndex;
    if (!hasAudioSegments(slide) || slide.audioSegments.length === 0) return;
    const segments = slide.audioSegments;
    const segment = segments[currentSegmentIdx];
    if (!segment) return;

    let isActive = true;

    loadAudioWithFallback(segment.audioFilePath, segment.id).then(audio => {
      if (!isActive) return;
      audioRef.current = audio;
      audio.onended = () => {
        setError(null);
        if (autoAdvanceOnAudioEnd) {
          const timing = resolveTimingConfig(demoTiming, slide.timing, segment.timing);
          if (currentSegmentIdx < segments.length - 1) {
            setTimeout(() => segmentContext.nextSegment(), timing.betweenSegments);
          } else {
            const nextIndex = currentIndexRef.current + 1;
            if (nextIndex < allSlides.length) {
              setTimeout(() => {
                lastAutoAdvanceFromIndexRef.current = currentIndexRef.current;
                setCurrentIndex(nextIndex);
                onSlideChange(allSlides[nextIndex].metadata.chapter, allSlides[nextIndex].metadata.slide);
              }, timing.betweenSlides);
            }
          }
        }
      };
      audio.onerror = () => setError(`Playback error: ${segment.id}`);
      audio.onplay = () => setError(null);
      audio.play().catch(() => setError(`Playback failed: ${segment.id}`));
    });

    return () => {
      isActive = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.onplay = null;
        audioRef.current = null;
      }
    };
  }, [currentIndex, isManualMode, audioEnabled, autoAdvanceOnAudioEnd, onSlideChange, segmentContext.currentSegmentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Consume external manual slide changes
  useEffect(() => {
    if (!isManualMode || manualSlideChange == null) return;
    const slideIndex = allSlides.findIndex(s =>
      s.metadata.chapter === manualSlideChange.chapter && s.metadata.slide === manualSlideChange.slide
    );
    if (slideIndex === -1) return;
    if (lastAutoAdvanceFromIndexRef.current !== null && slideIndex === lastAutoAdvanceFromIndexRef.current) {
      lastAutoAdvanceFromIndexRef.current = null;
      return;
    }
    if (slideIndex !== currentIndex) {
      setCurrentIndex(slideIndex);
      lastAutoAdvanceFromIndexRef.current = null;
    }
  }, [manualSlideChange, isManualMode, currentIndex]);

  // Restart from beginning
  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.onplay = null;
    }
    setCurrentIndex(0);
    setIsPlaying(false);
    setIsManualMode(false);
    setAudioEnabled(true);
    setAutoAdvanceOnAudioEnd(false);
    setError(null);
    setFinalElapsedSeconds(null);
    setShowStartOverlay(true);
    onPlaybackEnd?.();
  };

  return (
    <>
      <StartOverlay
        demoMetadata={demoMetadata}
        slideCount={allSlides.length}
        error={error}
        hideInterface={hideInterface}
        onHideInterfaceChange={setHideInterface}
        showRuntimeTimerOption={showRuntimeTimerOption}
        onShowRuntimeTimerOptionChange={setShowRuntimeTimerOption}
        finalElapsedSeconds={finalElapsedSeconds}
        visible={showStartOverlay}
        onStartNarrated={handleStart}
        onStartManual={handleManualMode}
      />

      {(isPlaying || isManualMode) && !hideInterface && currentIndex < allSlides.length && (
        <ProgressBar
          currentIndex={currentIndex}
          totalSlides={allSlides.length}
          currentSlideMetadata={allSlides[currentIndex].metadata}
          demoMetadata={demoMetadata}
          isPlaying={isPlaying}
          isManualMode={isManualMode}
          showRuntimeTimer={showRuntimeTimerOption}
          elapsedMs={elapsedMs}
          audioEnabled={audioEnabled}
          onAudioToggle={() => setAudioEnabled(!audioEnabled)}
          autoAdvanceOnAudioEnd={autoAdvanceOnAudioEnd}
          onAutoAdvanceToggle={setAutoAdvanceOnAudioEnd}
          showEditButton={isManualMode && currentIndex < allSlides.length && hasAudioSegments(allSlides[currentIndex].metadata)}
          onEdit={editor.handleEditNarration}
          onRestart={handleRestart}
        />
      )}

      <ErrorToast error={error} visible={isPlaying} />

      <AnimatePresence>
        {editor.showEditModal && editor.editingSegment && (
          <NarrationEditModal
            slideKey={editor.editingSegment.slideKey}
            segmentId={editor.editingSegment.segmentId}
            currentText={editor.editingSegment.currentText}
            isRegenerating={editor.isRegeneratingAudio}
            regenerationError={editor.regenerationError}
            onSave={editor.handleSaveNarration}
            onCancel={editor.handleCancelEdit}
          />
        )}
      </AnimatePresence>

      <NotificationStack notifications={notifications} />
    </>
  );
};
