import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { hasAudioSegments, SlideComponentWithMetadata } from '../slides/SlideMetadata';
import { useSegmentContext } from '../contexts/SegmentContext';
import { useAudioTimeContextOptional } from '../contexts/AudioTimeContext';
import { useVideoSyncContextOptional } from '../contexts/VideoSyncContext';
import type { DemoMetadata } from '../demos/types';
import type { DemoAlignment } from '../alignment/types';
import type { VideoBookmarksFile } from '../types/videoBookmarks';
import { TimingConfig, DEFAULT_START_TRANSITION } from '../demos/timing/types';
import type { StartTransition } from '../demos/timing/types';
import { NarrationEditModal } from './NarrationEditModal';
import { VideoBookmarkEditorModal } from './VideoBookmarkEditorModal';
import { getConfig } from '../config';
import { MARKER_TIME_EPSILON, AUTOPLAY_PROBE_DELAY_MS } from '../constants';
import { StartOverlay } from './narrated/StartOverlay';
import { ProgressBar } from './narrated/ProgressBar';
import { ErrorToast } from './narrated/ErrorToast';
import { NotificationStack } from './narrated/NotificationStack';
import { useNotifications } from '../hooks/useNotifications';
import { useRuntimeTimer } from '../hooks/useRuntimeTimer';
import { useApiHealth } from '../hooks/useApiHealth';
import { useNarrationEditor } from '../hooks/useNarrationEditor';
import { useTtsRegeneration } from '../hooks/useTtsRegeneration';
import { useAudioPlayback } from '../hooks/useAudioPlayback';
import { useTheme } from '../theme/ThemeContext';

// Fallback audio file for missing segments
const getFallbackAudio = () => getConfig().fallbackAudioPath;

export interface AutoplayConfig {
  mode: 'narrated';
  hideInterface: boolean;
  zoom: boolean;
  signalPort?: number;
}

export interface NarratedControllerProps {
  bookmarksData?: VideoBookmarksFile | null;
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
  bookmarksData,
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
  const [, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStartOverlay, setShowStartOverlay] = useState(true);
  const setHideInterface = onHideInterfaceChange;
  const [isManualMode, setIsManualMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [autoAdvanceOnAudioEnd, setAutoAdvanceOnAudioEnd] = useState(false);
  const [startSilenceActive, setStartSilenceActive] = useState(false);

  // Segment context for multi-segment slides
  const segmentContext = useSegmentContext();

  // Audio time context for sub-segment marker tracking
  const audioTimeCtx = useAudioTimeContextOptional();

  // Video sync context for marker-driven video seeks
  const videoSyncCtx = useVideoSyncContextOptional();

  // Theme for overlay
  const theme = useTheme();

  // Extracted hooks
  const [showVideoBookmarkEditor, setShowVideoBookmarkEditor] = useState(false);

  const { notifications, showSuccess } = useNotifications();
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

  // Audio playback orchestration (narrated + manual modes)
  const { audioRef, currentIndexRef } = useAudioPlayback({
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
    autoplaySignalPort: autoplay?.signalPort,
    setError,
    setIsLoading,
    onSlideChange,
    onPlaybackEnd,
    onNarratedComplete: () => {
      let finalElapsedSec: number | null = null;
      if (runtimeStart != null) {
        finalElapsedSec = (performance.now() - runtimeStart) / 1000;
        setFinalElapsedSeconds(finalElapsedSec);
      }

      const plannedTotal = demoMetadata.durationInfo?.total ?? null;
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
    },
    demoId: demoMetadata.id,
    demoTitle: demoMetadata.title,
  });

  // Notify VideoSyncContext when segment changes so it can arm the seek + wait triggers
  useEffect(() => {
    if (!videoSyncCtx) return;
    const slide = currentIndex < allSlides.length ? allSlides[currentIndex].metadata : undefined;
    const segment = slide?.audioSegments[segmentContext.currentSegmentIndex];
    videoSyncCtx.setActiveSeeks(segment?.videoSeeks, segment?.videoWaits, bookmarksData ?? null);
  }, [currentIndex, segmentContext.currentSegmentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stable refs for marker keyboard handler — avoids re-registering
  // the capture-phase listener on every frame when currentTime changes.
  const markerNavMarkersRef = useRef(audioTimeCtx?.markers);
  const markerNavTimeRef = useRef(audioTimeCtx?.currentTime ?? 0);
  const markerNavSeekRef = useRef(audioTimeCtx?.seekToTime);
  markerNavMarkersRef.current = audioTimeCtx?.markers;
  markerNavTimeRef.current = audioTimeCtx?.currentTime ?? 0;
  markerNavSeekRef.current = audioTimeCtx?.seekToTime;

  // Capture-phase keyboard handler for marker navigation in manual mode.
  // Fires before SlidePlayer's bubble-phase listener so markers are stepped
  // through first; if no more markers in that direction, the event propagates
  // to SlidePlayer for segment/slide navigation.
  useEffect(() => {
    if (!isManualMode || !audioTimeCtx) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const markers = markerNavMarkersRef.current;
      const seekToTime = markerNavSeekRef.current;
      if (!markers || markers.length === 0 || !seekToTime) return;

      const t = markerNavTimeRef.current;
      const EPS = MARKER_TIME_EPSILON;

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
          seekToTime(markers[nextIdx].time);
        }
        // else: let the event propagate to SlidePlayer for segment/slide nav
      } else {
        // ArrowLeft — go to previous marker by index, or to segment start (time 0)
        if (currentIdx >= 0) {
          e.preventDefault();
          e.stopPropagation();
          seekToTime(currentIdx > 0 ? markers[currentIdx - 1].time : 0);
        }
        // else: before any marker, let event propagate
      }
    };

    window.addEventListener('keydown', handler, true); // capture phase
    return () => window.removeEventListener('keydown', handler, true);
  }, [isManualMode, audioTimeCtx]); // stable deps — no per-frame values

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
    }, AUTOPLAY_PROBE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [allSlides.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAutoplayClick = () => {
    setAutoplayBlocked(false);
    autoplayFiredRef.current = true;
    handleStart();
  };

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

  // Consume external manual slide changes
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
          showVideosButton={import.meta.env.DEV}
          onVideos={() => setShowVideoBookmarkEditor(true)}
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
            onInstructChanged={(newInstruct) => {
              const seg = currentSlideMetadata?.audioSegments[segmentContext.currentSegmentIndex];
              if (seg) {
                seg.instruct = newInstruct;
              }
            }}
            onCancel={editor.handleCancelEdit}
          />
        )}
      </AnimatePresence>

      <NotificationStack notifications={notifications} />

      <AnimatePresence>
        {showVideoBookmarkEditor && (
          <VideoBookmarkEditorModal
            demoId={demoMetadata.id}
            initialData={bookmarksData}
            onClose={() => setShowVideoBookmarkEditor(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
