/**
 * Hook for audio playback orchestration in narrated and manual modes.
 *
 * Extracted from NarratedController to encapsulate:
 * - Audio loading with fallback
 * - Segment sequencing and advancement
 * - rAF-based time polling for marker responsiveness
 * - Alignment initialization for sub-segment markers
 */

import { useRef, useEffect, useCallback } from 'react';
import { hasAudioSegments, type SlideComponentWithMetadata, type SlideMetadata } from '../slides/SlideMetadata';
import type { DemoAlignment } from '../alignment/types';
import { resolveTimingConfig, type TimingConfig } from '../demos/timing/types';
import type { SegmentContextValue } from '../contexts/SegmentContext';
import type { AudioTimeContextValue } from '../contexts/AudioTimeContext';
import type { VideoSyncContextValue } from '../contexts/VideoSyncContext';
import { getConfig } from '../config';
import { NO_AUDIO_ADVANCE_DELAY_MS, PLAYBACK_ERROR_ADVANCE_DELAY_MS } from '../constants';

// Fallback audio file for missing segments
const getFallbackAudio = () => getConfig().fallbackAudioPath;

// Helper to load audio with fallback
const loadAudioWithFallback = async (primaryPath: string, segmentId: number): Promise<HTMLAudioElement> => {
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

/** Attach rAF-based time polling to an audio element for sub-frame marker updates. */
function attachRafPolling(
  audio: HTMLAudioElement,
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  audioTimeCtx: AudioTimeContextValue,
  videoSyncCtx?: VideoSyncContextValue | null,
) {
  let rafId: number;
  const pollTime = () => {
    if (audioRef.current === audio && !audio.paused) {
      const t = audio.currentTime;
      audioTimeCtx.setCurrentTime(t);
      videoSyncCtx?.checkAndFireSeeks(t, audioTimeCtx.getMarkerTime);
      videoSyncCtx?.checkAndWaitForClips(t, audioTimeCtx.getMarkerTime);
    }
    rafId = requestAnimationFrame(pollTime);
  };
  rafId = requestAnimationFrame(pollTime);
  audio.onloadedmetadata = () => audioTimeCtx.setDuration(audio.duration);
  // Store cleanup on the audio element for teardown
  (audio as any)._stopRaf = () => cancelAnimationFrame(rafId);
}

/** Initialize alignment data (markers + words) for a segment in AudioTimeContext. */
function initAlignmentForSegment(
  audioTimeCtx: AudioTimeContextValue,
  alignmentData: DemoAlignment | null | undefined,
  chapter: number,
  slide: number,
  segmentId: number,
  logMarkers?: boolean,
) {
  audioTimeCtx.reset();
  const coordKey = `c${chapter}_s${slide}`;
  const segAlignment = alignmentData?.slides[coordKey]
    ?.segments.find(s => s.segmentId === segmentId);
  if (logMarkers && segAlignment?.markers.length) {
    console.log(`[AudioTime] Loaded ${segAlignment.markers.length} markers for ${coordKey}:${segmentId}`,
      segAlignment.markers.map(m => `${m.id}@${m.time.toFixed(2)}s`));
  }
  audioTimeCtx.initializeSegmentAlignment(
    segAlignment?.markers ?? [],
    segAlignment?.words ?? []
  );
}

export interface UseAudioPlaybackOptions {
  allSlides: SlideComponentWithMetadata[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  isManualMode: boolean;
  audioEnabled: boolean;
  startSilenceActive: boolean;
  setStartSilenceActive: (active: boolean) => void;
  autoAdvanceOnAudioEnd: boolean;
  demoTiming?: TimingConfig;
  alignmentData?: DemoAlignment | null;
  segmentContext: SegmentContextValue;
  audioTimeCtx: AudioTimeContextValue | null;
  videoSyncCtx?: VideoSyncContextValue | null;
  autoplaySignalPort?: number;
  setError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  onSlideChange: (chapter: number, slide: number) => void;
  onPlaybackEnd?: () => void;
  /** Called when narrated mode finishes the last slide — provides elapsed seconds. */
  onNarratedComplete: (config: {
    plannedTotal: number | null;
    showRuntimeTimerOption: boolean;
    runtimeStart: number | null;
  }) => void;
  demoId: string;
  demoTitle: string;
}

export interface UseAudioPlaybackResult {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  currentIndexRef: React.MutableRefObject<number>;
}

export function useAudioPlayback({
  allSlides,
  currentIndex,
  setCurrentIndex,
  isPlaying,
  setIsPlaying,
  isManualMode,
  audioEnabled,
  startSilenceActive,
  setStartSilenceActive,
  autoAdvanceOnAudioEnd,
  demoTiming,
  alignmentData,
  segmentContext,
  audioTimeCtx,
  videoSyncCtx,
  autoplaySignalPort,
  setError,
  setIsLoading,
  onSlideChange,
  onPlaybackEnd,
  onNarratedComplete,
  demoId,
  demoTitle,
}: UseAudioPlaybackOptions): UseAudioPlaybackResult {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentIndexRef = useRef(currentIndex);

  // Stable refs to avoid stale closures without adding deps that trigger re-runs
  const autoAdvanceRef = useRef(autoAdvanceOnAudioEnd);
  useEffect(() => { autoAdvanceRef.current = autoAdvanceOnAudioEnd; }, [autoAdvanceOnAudioEnd]);

  const autoplaySignalPortRef = useRef(autoplaySignalPort);
  useEffect(() => { autoplaySignalPortRef.current = autoplaySignalPort; }, [autoplaySignalPort]);

  // Keep ref in sync with state
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  // Register audio seek handler so AudioTimeContext.seekToTime() can control the <audio> element
  useEffect(() => {
    if (!audioTimeCtx) return;
    return audioTimeCtx.registerSeekHandler((time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        if (audioRef.current.paused || audioRef.current.ended) {
          audioTimeCtx.setCurrentTime(time);
        }
      }
    });
  }, [audioTimeCtx]);

  // Register narration pause/resume callbacks with VideoSyncContext so
  // marker-driven video clips can pause/resume TTS (Patterns 1 & 3).
  useEffect(() => {
    if (!videoSyncCtx) return;
    return videoSyncCtx.registerNarrationControl(
      () => audioRef.current?.pause(),
      () => { if (audioRef.current?.paused) audioRef.current.play().catch(() => {}); },
    );
  }, [videoSyncCtx]);

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

  // Advance to next slide (narrated mode)
  const advanceSlide = useCallback(() => {
    const currentIdx = currentIndexRef.current;
    const nextIndex = currentIdx + 1;

    if (nextIndex >= allSlides.length) {
      const lastSlide = allSlides[allSlides.length - 1].metadata;
      const timing = resolveTimingConfig(demoTiming, lastSlide.timing);

      setTimeout(() => {
        setIsPlaying(false);
        onNarratedComplete({
          plannedTotal: null, // caller reads from demoMetadata.durationInfo
          showRuntimeTimerOption: false,
          runtimeStart: null,
        });
        // Signal the recording script that playback is done
        const port = autoplaySignalPortRef.current;
        if (port) {
          fetch(`http://localhost:${port}/complete`, { mode: 'no-cors' }).catch(() => {});
        }
        onPlaybackEnd?.();
      }, timing.afterFinalSlide);
      return;
    }

    const currentSlide = allSlides[currentIdx].metadata;
    const timing = resolveTimingConfig(demoTiming, currentSlide.timing);
    setTimeout(() => {
      setCurrentIndex(nextIndex);
    }, timing.betweenSlides);
  }, [onPlaybackEnd, demoTiming, allSlides, setCurrentIndex, setIsPlaying, onNarratedComplete]);

  // Play slide segments (narrated mode)
  const playSlideSegments = useCallback((slideMetadata: SlideMetadata, slideKey: string) => {
    const segments = slideMetadata.audioSegments;

    if (!segments || segments.length === 0) {
      console.warn(`[NarratedController] No audio segments for ${slideKey}, advancing immediately`);
      setTimeout(advanceSlide, NO_AUDIO_ADVANCE_DELAY_MS);
      return;
    }

    segmentContext.initializeSegments(slideKey, segments);

    let currentSegmentIndex = 0;

    const playSegment = (segmentIndex: number) => {
      if (segmentIndex >= segments.length) {
        advanceSlide();
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

      // Initialize alignment data for this segment
      if (audioTimeCtx) {
        initAlignmentForSegment(audioTimeCtx, alignmentData, slideMetadata.chapter, slideMetadata.slide, segment.id, import.meta.env.DEV);
      }

      setIsLoading(true);
      loadAudioWithFallback(segment.audioFilePath ?? '', segment.id).then(audio => {
        audioRef.current = audio;

        if (audioTimeCtx) {
          attachRafPolling(audio, audioRef, audioTimeCtx, videoSyncCtx);
        }

        audio.onended = () => {
          setError(null);
          currentSegmentIndex++;
          if (currentSegmentIndex < segments.length) {
            const timing = resolveTimingConfig(demoTiming, slideMetadata.timing, segment.timing);
            setTimeout(() => playSegment(currentSegmentIndex), timing.betweenSegments);
          } else {
            playSegment(currentSegmentIndex);
          }
        };

        audio.onerror = (e) => {
          console.error(`[NarratedController] Playback error for ${segment.id}:`, e);
          setError(`Playback error: ${segment.id}`);
          setIsLoading(false);
          setTimeout(() => {
            setError(null);
            currentSegmentIndex++;
            playSegment(currentSegmentIndex);
          }, PLAYBACK_ERROR_ADVANCE_DELAY_MS);
        };

        audio.onplay = () => {
          setError(null);
          setIsLoading(false);
          // Signal segment start to the recording script for VTT subtitle generation
          const port = autoplaySignalPortRef.current;
          if (port) {
            const params = new URLSearchParams({
              chapter: String(slideMetadata.chapter),
              slide: String(slideMetadata.slide),
              segmentIndex: String(segmentIndex),
              segmentId: String(segment.id),
            });
            fetch(`http://localhost:${port}/segment-start?${params}`, { mode: 'no-cors' }).catch(() => {});
          }
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
  }, [advanceSlide, segmentContext, demoTiming, audioTimeCtx, videoSyncCtx, alignmentData, setError, setIsLoading]);

  // --- Narrated mode: play audio for current slide ---
  useEffect(() => {
    if (!isPlaying || currentIndex >= allSlides.length || isManualMode) return;

    // Start silence: delay before the first slide appears
    if (currentIndex === 0 && startSilenceActive) {
      const timing = resolveTimingConfig(demoTiming);
      if (timing.beforeFirstSlide > 0) {
        const timer = setTimeout(() => setStartSilenceActive(false), timing.beforeFirstSlide);
        return () => clearTimeout(timer);
      }
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

  // --- Manual mode: initialize segments on slide change ---
  useEffect(() => {
    if (!isManualMode || currentIndex >= allSlides.length) return;
    const slide = allSlides[currentIndex].metadata;
    const slideKey = `Ch${slide.chapter}:S${slide.slide}`;
    if (!hasAudioSegments(slide) || slide.audioSegments.length === 0) return;
    segmentContext.initializeSegments(slideKey, slide.audioSegments);
  }, [currentIndex, isManualMode, segmentContext.totalSegments]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Manual mode: initialize markers when audio is muted ---
  useEffect(() => {
    if (!isManualMode || audioEnabled || !audioTimeCtx) return;
    if (currentIndex >= allSlides.length) return;
    const slide = allSlides[currentIndex].metadata;
    const segments = slide.audioSegments;
    if (!segments || segments.length === 0) return;
    const segment = segments[segmentContext.currentSegmentIndex];
    if (!segment) return;

    initAlignmentForSegment(audioTimeCtx, alignmentData, slide.chapter, slide.slide, segment.id);
  }, [isManualMode, audioEnabled, currentIndex, segmentContext.currentSegmentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Manual mode: play audio for current segment ---
  useEffect(() => {
    if (!isManualMode || !audioEnabled || currentIndex >= allSlides.length) return;
    const slide = allSlides[currentIndex].metadata;
    const currentSegmentIdx = segmentContext.currentSegmentIndex;
    if (!hasAudioSegments(slide) || slide.audioSegments.length === 0) return;
    const segments = slide.audioSegments;
    const segment = segments[currentSegmentIdx];
    if (!segment) return;

    let isActive = true;

    // Initialize alignment for manual+audio mode
    if (audioTimeCtx) {
      initAlignmentForSegment(audioTimeCtx, alignmentData, slide.chapter, slide.slide, segment.id);
    }

    loadAudioWithFallback(segment.audioFilePath ?? '', segment.id).then(audio => {
      if (!isActive) return;
      audioRef.current = audio;

      if (audioTimeCtx) {
        attachRafPolling(audio, audioRef, audioTimeCtx);
      }

      audio.onended = () => {
        setError(null);
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

  // --- Manual mode: retroactive auto-advance when toggled ON after audio ended ---
  useEffect(() => {
    if (!isManualMode || !audioEnabled || !autoAdvanceOnAudioEnd) return;
    if (currentIndex >= allSlides.length) return;
    const audio = audioRef.current;
    if (!audio || !audio.ended) return;

    // Audio already finished — trigger the same advance logic as onended
    const slide = allSlides[currentIndex].metadata;
    const currentSegmentIdx = segmentContext.currentSegmentIndex;
    const segments = slide.audioSegments;
    if (!segments || segments.length === 0) return;
    const segment = segments[currentSegmentIdx];
    if (!segment) return;

    const timing = resolveTimingConfig(demoTiming, slide.timing, segment.timing);
    if (currentSegmentIdx < segments.length - 1) {
      setTimeout(() => segmentContext.nextSegment(), timing.betweenSegments);
    } else {
      const nextIndex = currentIndex + 1;
      if (nextIndex < allSlides.length) {
        setTimeout(() => {
          setCurrentIndex(nextIndex);
          onSlideChange(allSlides[nextIndex].metadata.chapter, allSlides[nextIndex].metadata.slide);
        }, timing.betweenSlides);
      }
    }
  }, [autoAdvanceOnAudioEnd, isManualMode, audioEnabled, currentIndex, segmentContext.currentSegmentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  return { audioRef, currentIndexRef };
}
