import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { hasAudioSegments, SlideComponentWithMetadata } from '../slides/SlideMetadata';
import { useSegmentContext } from '../contexts/SegmentContext';
import { useAudioTimeContextOptional } from '../contexts/AudioTimeContext';
import type { DemoMetadata } from '../demos/types';
import type { DemoAlignment } from '../alignment/types';
import { resolveTimingConfig, TimingConfig, DEFAULT_START_TRANSITION } from '../demos/timing/types';
import type { StartTransition } from '../demos/timing/types';
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
import { useTtsRegeneration } from '../hooks/useTtsRegeneration';
import { useTheme } from '../theme/ThemeContext';

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

export interface AutoplayConfig {
  mode: 'narrated';
  hideInterface: boolean;
  zoom: boolean;
}

export interface NarratedControllerProps {
  demoMetadata: DemoMetadata;
  demoTiming?: TimingConfig;
  demoInstruct?: string;
  startTransition?: StartTransition;
  slides: SlideComponentWithMetadata[];
  alignmentData?: DemoAlignment | null;
  chapters?: Record<number, { title: string }>;
  chapterModeEnabled: boolean;
  onChapterModeToggle: (value: boolean) => void;
  onSlideChange: (chapter: number, slide: number) => void;
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
  manualSlideChange?: { chapter: number; slide: number } | null;
  hideInterface: boolean;
  onHideInterfaceChange: (hidden: boolean) => void;
  zoomEnabled: boolean;
  onZoomEnabledChange: (enabled: boolean) => void;
  autoplay?: AutoplayConfig;
}

export const NarratedController: React.FC<NarratedControllerProps> = ({
  demoMetadata,
  demoTiming,
  demoInstruct,
  startTransition,
  slides,
  alignmentData,
  chapters: _chaptersConfig,
  chapterModeEnabled,
  onChapterModeToggle: setChapterModeEnabled,
  onSlideChange,
  onPlaybackStart,
  onPlaybackEnd,
  manualSlideChange,
  hideInterface,
  onHideInterfaceChange,
  zoomEnabled,
  onZoomEnabledChange,
  autoplay
}) => {
  // Use provided slides or empty array if not loaded yet
  const allSlides = slides || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Derive whether there are multiple chapters
  const hasMultipleChapters = useMemo(() => {
    const chapterNums = new Set(allSlides.map(s => s.metadata.chapter));
    return chapterNums.size > 1;
  }, [allSlides]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [_isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStartOverlay, setShowStartOverlay] = useState(true);
  const setHideInterface = onHideInterfaceChange;
  const [isManualMode, setIsManualMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [autoAdvanceOnAudioEnd, setAutoAdvanceOnAudioEnd] = useState(false);
  const [startSilenceActive, setStartSilenceActive] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentIndexRef = useRef(currentIndex);

  // Ref so the manual-mode audio effect can read the latest value without
  // re-running (which would stop and replay the audio from scratch).
  const autoAdvanceRef = useRef(autoAdvanceOnAudioEnd);
  useEffect(() => { autoAdvanceRef.current = autoAdvanceOnAudioEnd; }, [autoAdvanceOnAudioEnd]);

  // Segment context for multi-segment slides
  const segmentContext = useSegmentContext();

  // Audio time context for sub-segment marker tracking
  const audioTimeCtx = useAudioTimeContextOptional();

  // Theme for overlay
  const theme = useTheme();

  // Extracted hooks
  const { notifications, showSuccess, showError: _showError, showWarning: _showWarning } = useNotifications();
  const timer = useRuntimeTimer({ isPlaying, enabled: true });
  const { showRuntimeTimerOption, setShowRuntimeTimerOption, elapsedMs, finalElapsedSeconds, setFinalElapsedSeconds, runtimeStart } = timer;
  const { apiAvailable } = useApiHealth();
  const editor = useNarrationEditor({
    allSlides,
    currentIndex,
    currentSegmentIndex: segmentContext.currentSegmentIndex,
  });

  // TTS regeneration (for top bar button)
  const currentSlideMetadata = currentIndex < allSlides.length ? allSlides[currentIndex].metadata : undefined;
  const { regeneratingSegment, handleRegenerateSegment } = useTtsRegeneration({
    demoId: demoMetadata.id,
    currentSlideMetadata,
    currentSegmentIndex: segmentContext.currentSegmentIndex,
    onSegmentRefresh: () => segmentContext.setCurrentSegment(segmentContext.currentSegmentIndex),
  });

  // Keep ref in sync with state
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Register audio seek handler so AudioTimeContext.seekToTime() can control the <audio> element
  useEffect(() => {
    if (!audioTimeCtx) return;
    return audioTimeCtx.registerSeekHandler((time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        // When paused/ended, rAF polling isn't updating — push the time manually
        if (audioRef.current.paused || audioRef.current.ended) {
          audioTimeCtx.setCurrentTime(time);
        }
      }
    });
  }, [audioTimeCtx]);

  // Expose __seekToTime on window for Playwright tests (dev only)
  useEffect(() => {
    if (!import.meta.env.DEV || !audioTimeCtx) return;
    (window as any).__seekToTime = (time: number) => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = time;
      }
      audioTimeCtx.setCurrentTime(time);
    };
    return () => { delete (window as any).__seekToTime; };
  }, [audioTimeCtx]);

  // Capture-phase keyboard handler for marker navigation in manual mode.
  // Fires before SlidePlayer's bubble-phase listener so markers are stepped
  // through first; if no more markers in that direction, the event propagates
  // to SlidePlayer for segment/slide navigation.
  useEffect(() => {
    if (!isManualMode || !audioTimeCtx) return;

    // Use refs to avoid stale closures — the handler stays stable while
    // markers and currentTime change on every frame.
    const markersRef = { current: audioTimeCtx.markers };
    const timeRef = { current: audioTimeCtx.currentTime };
    // Keep refs fresh via the closure (they update every render)
    markersRef.current = audioTimeCtx.markers;
    timeRef.current = audioTimeCtx.currentTime;

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const markers = markersRef.current;
      if (!markers || markers.length === 0) return;

      const t = timeRef.current;
      const EPS = 0.02;

      // Compute current marker index (last marker at or before current time)
      let currentIdx = -1;
      for (let i = 0; i < markers.length; i++) {
        if (markers[i].time <= t + EPS) currentIdx = i;
      }

      if (e.key === 'ArrowRight') {
        const nextIdx = currentIdx + 1;
        if (nextIdx < markers.length) {
          e.preventDefault();
          e.stopPropagation();
          audioTimeCtx.seekToTime(markers[nextIdx].time);
        }
        // else: let the event propagate to SlidePlayer for segment/slide nav
      } else {
        // ArrowLeft — go to previous marker by index, or to segment start (time 0)
        if (currentIdx >= 0) {
          e.preventDefault();
          e.stopPropagation();
          audioTimeCtx.seekToTime(currentIdx > 0 ? markers[currentIdx - 1].time : 0);
        }
        // else: before any marker, let event propagate
      }
    };

    window.addEventListener('keydown', handler, true); // capture phase
    return () => window.removeEventListener('keydown', handler, true);
  }, [isManualMode, audioTimeCtx, audioTimeCtx?.markers, audioTimeCtx?.currentTime]);

  // Initialize markers in muted manual mode (audio effect skips when !audioEnabled,
  // but we still want marker dots and keyboard nav to work)
  useEffect(() => {
    if (!isManualMode || audioEnabled || !audioTimeCtx) return;
    if (currentIndex >= allSlides.length) return;
    const slide = allSlides[currentIndex].metadata;
    const segments = slide.audioSegments;
    if (!segments || segments.length === 0) return;
    const segment = segments[segmentContext.currentSegmentIndex];
    if (!segment) return;

    audioTimeCtx.reset();
    const coordKey = `c${slide.chapter}_s${slide.slide}`;
    const segAlignment = alignmentData?.slides[coordKey]
      ?.segments.find(s => s.segmentId === segment.id);
    audioTimeCtx.initializeSegmentAlignment(
      segAlignment?.markers ?? [],
      segAlignment?.words ?? []
    );
  }, [isManualMode, audioEnabled, currentIndex, segmentContext.currentSegmentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Autoplay: auto-start narrated playback once slides are loaded.
  // Browsers block audio.play() without a user gesture; OBS Browser source allows it.
  // If autoplay is blocked, show a minimal click-to-start overlay.
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const autoplayFiredRef = useRef(false);
  useEffect(() => {
    if (!autoplay || autoplay.mode !== 'narrated') return;
    if (allSlides.length === 0) return;
    if (autoplayFiredRef.current) return;

    const timer = setTimeout(async () => {
      // Probe whether audio autoplay is allowed
      try {
        const probe = new Audio(getFallbackAudio());
        await probe.play();
        probe.pause();
        // Autoplay allowed (OBS Browser source, or user already interacted)
        autoplayFiredRef.current = true;
        handleStart();
      } catch {
        // Browser blocked autoplay — show click-to-start overlay
        setAutoplayBlocked(true);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [allSlides.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAutoplayClick = () => {
    setAutoplayBlocked(false);
    autoplayFiredRef.current = true;
    handleStart();
  };

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
        document.title = `[COMPLETE] ${demoMetadata.title}`;
        onPlaybackEnd?.();
      }, timing.afterFinalSlide);
      return;
    }

    setCurrentIndex(nextIndex);
  }, [onPlaybackEnd, demoMetadata.durationInfo?.total, demoMetadata.title, showRuntimeTimerOption, runtimeStart, demoTiming, allSlides, demoMetadata.id, setFinalElapsedSeconds]);

  // Play audio for current slide in narrated mode
  useEffect(() => {
    if (!isPlaying || currentIndex >= allSlides.length || isManualMode) return;

    // Start silence: delay before the first slide appears
    if (currentIndex === 0 && startSilenceActive) {
      const timing = resolveTimingConfig(demoTiming);
      if (timing.beforeFirstSlide > 0) {
        const timer = setTimeout(() => setStartSilenceActive(false), timing.beforeFirstSlide);
        return () => clearTimeout(timer);
      }
      // beforeFirstSlide is 0, proceed immediately
      setStartSilenceActive(false);
      return;
    }

    const currentSlide = allSlides[currentIndex].metadata;
    const slideKey = `Ch${currentSlide.chapter}:U${currentSlide.slide}`;

    console.log(`[NarratedController] Playing slide: ${slideKey} with ${currentSlide.audioSegments.length} segment(s)`);
    playSlideSegments(currentSlide, slideKey);

    onSlideChange(currentSlide.chapter, currentSlide.slide);

    return () => {
      if (audioRef.current) {
        (audioRef.current as any)._stopRaf?.();
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.onplay = null;
        audioRef.current.oncanplaythrough = null;
        audioRef.current.ontimeupdate = null;
        audioRef.current.onloadedmetadata = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentIndex, isManualMode, startSilenceActive]);

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

      // Initialize audio time context with markers and words for this segment
      if (audioTimeCtx) {
        audioTimeCtx.reset();
        const coordKey = `c${slideMetadata.chapter}_s${slideMetadata.slide}`;
        const segAlignment = alignmentData?.slides[coordKey]
          ?.segments.find(s => s.segmentId === segment.id);
        if (import.meta.env.DEV && segAlignment?.markers.length) {
          console.log(`[AudioTime] Loaded ${segAlignment.markers.length} markers for ${coordKey}:${segment.id}`,
            segAlignment.markers.map(m => `${m.id}@${m.time.toFixed(2)}s`));
        }
        audioTimeCtx.initializeSegmentAlignment(
          segAlignment?.markers ?? [],
          segAlignment?.words ?? []
        );
      }

      setIsLoading(true);
      loadAudioWithFallback(segment.audioFilePath ?? '', segment.id).then(audio => {
        audioRef.current = audio;

        // Poll audio.currentTime via rAF for sub-frame marker responsiveness
        // (ontimeupdate only fires ~4Hz; rAF gives ~60Hz)
        if (audioTimeCtx) {
          let rafId: number;
          const pollTime = () => {
            if (audioRef.current === audio && !audio.paused) {
              audioTimeCtx.setCurrentTime(audio.currentTime);
            }
            rafId = requestAnimationFrame(pollTime);
          };
          rafId = requestAnimationFrame(pollTime);
          audio.onloadedmetadata = () => audioTimeCtx.setDuration(audio.duration);
          // Store cleanup on the audio element for the effect teardown
          (audio as any)._stopRaf = () => cancelAnimationFrame(rafId);
        }

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
  }, [advanceSlide, segmentContext, demoTiming, audioTimeCtx, alignmentData]);

  // Start narrated playback
  const handleStart = () => {
    if (allSlides.length === 0) { setError('No slides to play'); return; }
    setFinalElapsedSeconds(null);
    setShowStartOverlay(false);
    setStartSilenceActive(true);
    setIsPlaying(true);
    setIsManualMode(false);
    setCurrentIndex(0);
    document.title = `[PLAYING] ${demoMetadata.title}`;
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

  // Initialize segments when slide changes in manual mode (audio or muted).
  // totalSegments in deps ensures re-init after HMR resets the context.
  useEffect(() => {
    if (!isManualMode || currentIndex >= allSlides.length) return;
    const slide = allSlides[currentIndex].metadata;
    const slideKey = `Ch${slide.chapter}:S${slide.slide}`;
    if (!hasAudioSegments(slide) || slide.audioSegments.length === 0) return;
    segmentContext.initializeSegments(slideKey, slide.audioSegments);
  }, [currentIndex, isManualMode, segmentContext.totalSegments]); // eslint-disable-line react-hooks/exhaustive-deps

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

    // Initialize audio time context for manual+audio mode
    if (audioTimeCtx) {
      audioTimeCtx.reset();
      const coordKey = `c${slide.chapter}_s${slide.slide}`;
      const segAlignment = alignmentData?.slides[coordKey]
        ?.segments.find(s => s.segmentId === segment.id);
      audioTimeCtx.initializeSegmentAlignment(
        segAlignment?.markers ?? [],
        segAlignment?.words ?? []
      );
    }

    loadAudioWithFallback(segment.audioFilePath ?? '', segment.id).then(audio => {
      if (!isActive) return;
      audioRef.current = audio;

      // Poll audio.currentTime via rAF for sub-frame marker responsiveness
      if (audioTimeCtx) {
        let rafId: number;
        const pollTime = () => {
          if (audioRef.current === audio && !audio.paused) {
            audioTimeCtx.setCurrentTime(audio.currentTime);
          }
          rafId = requestAnimationFrame(pollTime);
        };
        rafId = requestAnimationFrame(pollTime);
        audio.onloadedmetadata = () => audioTimeCtx.setDuration(audio.duration);
        (audio as any)._stopRaf = () => cancelAnimationFrame(rafId);
      }

      audio.onended = () => {
        setError(null);
        // Read from ref so toggling the checkbox doesn't restart the effect
        if (autoAdvanceRef.current) {
          const timing = resolveTimingConfig(demoTiming, slide.timing, segment.timing);
          if (currentSegmentIdx < segments.length - 1) {
            setTimeout(() => segmentContext.nextSegment(), timing.betweenSegments);
          } else {
            const nextIndex = currentIndexRef.current + 1;
            if (nextIndex < allSlides.length) {
              setTimeout(() => {
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
        (audioRef.current as any)._stopRaf?.();
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.onplay = null;
        audioRef.current.ontimeupdate = null;
        audioRef.current.onloadedmetadata = null;
        audioRef.current = null;
      }
    };
    // autoAdvanceOnAudioEnd intentionally omitted — read via autoAdvanceRef
    // to avoid restarting audio when the checkbox is toggled mid-playback.
  }, [currentIndex, isManualMode, audioEnabled, onSlideChange, segmentContext.currentSegmentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Consume external manual slide changes
  // Only react to actual manualSlideChange events (from user navigation in SlidePlayer),
  // NOT to currentIndex changes (from auto-advance). This prevents stale manualSlideChange
  // values from being re-consumed on every auto-advance and jumping back to old slides.
  useEffect(() => {
    if (!isManualMode || manualSlideChange == null) return;
    const slideIndex = allSlides.findIndex(s =>
      s.metadata.chapter === manualSlideChange.chapter && s.metadata.slide === manualSlideChange.slide
    );
    if (slideIndex === -1) return;
    if (slideIndex !== currentIndexRef.current) {
      setCurrentIndex(slideIndex);
    }
  }, [manualSlideChange, isManualMode]); // eslint-disable-line react-hooks/exhaustive-deps

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
    document.title = demoMetadata.title;
    onPlaybackEnd?.();
  };

  return (
    <>
      {/* Autoplay blocked by browser — minimal click-to-start overlay */}
      {autoplayBlocked && (
        <div
          onClick={handleAutoplayClick}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.bgDeep,
            cursor: 'pointer',
            fontFamily: theme.fontFamily,
          }}
        >
          <div style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
            <div style={{ fontSize: 48, marginBottom: '1rem' }}>Click anywhere to start</div>
            <div style={{ fontSize: 18 }}>{demoMetadata.title}</div>
          </div>
        </div>
      )}

      <StartOverlay
        demoMetadata={demoMetadata}
        slideCount={allSlides.length}
        error={error}
        hideInterface={hideInterface}
        onHideInterfaceChange={setHideInterface}
        showRuntimeTimerOption={showRuntimeTimerOption}
        onShowRuntimeTimerOptionChange={setShowRuntimeTimerOption}
        finalElapsedSeconds={finalElapsedSeconds}
        visible={showStartOverlay && !autoplayBlocked}
        onStartNarrated={handleStart}
        onStartManual={handleManualMode}
        zoomEnabled={zoomEnabled}
        onZoomEnabledChange={onZoomEnabledChange}
      />

      <AnimatePresence>
        {startSilenceActive && !showStartOverlay && (
          <motion.div
            key="start-silence"
            initial={{ opacity: 1 }}
            exit={{ ...DEFAULT_START_TRANSITION.exit, ...startTransition?.exit }}
            transition={{ ...DEFAULT_START_TRANSITION.transition, ...startTransition?.transition }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: theme.colors.bgDeep,
              zIndex: 50,
            }}
          />
        )}
      </AnimatePresence>

      {(isPlaying || isManualMode) && !hideInterface && currentIndex < allSlides.length && (
        <ProgressBar
          demoMetadata={demoMetadata}
          isPlaying={isPlaying}
          isManualMode={isManualMode}
          showRuntimeTimer={showRuntimeTimerOption}
          elapsedMs={elapsedMs}
          audioEnabled={audioEnabled}
          onAudioToggle={() => setAudioEnabled(!audioEnabled)}
          autoAdvanceOnAudioEnd={autoAdvanceOnAudioEnd}
          onAutoAdvanceToggle={setAutoAdvanceOnAudioEnd}
          chapterModeEnabled={chapterModeEnabled}
          onChapterModeToggle={setChapterModeEnabled}
          hasMultipleChapters={hasMultipleChapters}
          showEditButton={isManualMode && currentIndex < allSlides.length && hasAudioSegments(allSlides[currentIndex].metadata)}
          onEdit={editor.handleEditNarration}
          showRegenerateButton={isManualMode && currentIndex < allSlides.length && hasAudioSegments(allSlides[currentIndex].metadata)}
          regenerating={regeneratingSegment}
          onRegenerate={() => {
            if (window.confirm('Regenerate TTS audio for the current segment?')) {
              handleRegenerateSegment(false);
            }
          }}
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
            apiAvailable={apiAvailable}
            demoId={demoMetadata.id}
            chapter={editor.editingSegment.chapter}
            slide={editor.editingSegment.slide}
            segmentIndex={editor.editingSegment.segmentIndex}
            instruct={
              currentSlideMetadata?.audioSegments[segmentContext.currentSegmentIndex]?.instruct ??
              currentSlideMetadata?.instruct ??
              demoInstruct
            }
            allSlides={allSlides}
            onAcceptAudio={(filePath, timestamp) => {
              editor.handleAcceptAudio(filePath, timestamp);
              // Reload audio if currently playing
              if (audioEnabled && audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
              }
            }}
            onTextSaved={() => {
              const seg = currentSlideMetadata?.audioSegments[segmentContext.currentSegmentIndex];
              if (seg) {
                // The modal saved the narration text — just notify
                showSuccess('Narration saved');
              }
            }}
            onCancel={editor.handleCancelEdit}
          />
        )}
      </AnimatePresence>

      <NotificationStack notifications={notifications} />
    </>
  );
};
