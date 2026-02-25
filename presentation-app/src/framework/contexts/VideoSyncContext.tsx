import React, { createContext, useContext, useRef, useCallback, ReactNode } from 'react';
import type { VideoSeekTrigger, VideoWaitTrigger } from '../slides/SlideMetadata';
import type { VideoBookmarksFile } from '../types/videoBookmarks';

/**
 * VideoSyncContext routes RAF-integrated seek commands to registered video elements.
 *
 * Design: all 60fps-critical methods read only from refs — no React state reads,
 * no renders triggered. Registration and segment updates use normal hooks.
 *
 * Three video sync patterns supported:
 *   Pattern 1 — pauseNarration: true  → TTS pauses at marker, clip plays, TTS resumes
 *   Pattern 2 — pauseNarration: false → clip overlays TTS concurrently
 *   Pattern 3 — videoWaits            → TTS leads then waits at a later marker if clip still active
 */

/** seekFn type registered by VideoPlayer — supports optional clip end + done callback */
type VideoSeekFn = (time: number, autoPlay: boolean, endTime?: number, playbackRate?: number, onDone?: () => void) => void;

/** Pending resume for Pattern 3: waiting for a specific clip to finish */
interface PendingResume {
  clipKey: string; // `${videoId}:${bookmarkId}`
}

export interface VideoSyncContextValue {
  /**
   * Register a video element's seek function by videoId.
   * Returns an unsubscribe function to call on unmount.
   */
  registerVideo(videoId: string, seekFn: VideoSeekFn): () => void;

  /**
   * Register narration pause/resume callbacks so VideoSyncContext can control TTS.
   * Returns an unsubscribe function to call on unmount.
   */
  registerNarrationControl(pauseFn: () => void, resumeFn: () => void): () => void;

  /**
   * Called by NarratedController when a new segment starts.
   * Stores triggers + waits + bookmarks in refs; clears the fired-sets and clip state.
   */
  setActiveSeeks(
    triggers: VideoSeekTrigger[] | undefined,
    waits: VideoWaitTrigger[] | undefined,
    bookmarks: VideoBookmarksFile | null,
  ): void;

  /**
   * Called inside the RAF loop (60fps) by useAudioPlayback.
   * Pure ref-based — reads activeSeeksRef, bookmarksRef, firedRef.
   * Fires pending seeks whose marker time has been reached.
   */
  checkAndFireSeeks(currentTime: number, getMarkerTime: (id: string) => number | null): void;

  /**
   * Called inside the RAF loop (60fps) alongside checkAndFireSeeks.
   * Checks wait triggers — if the TTS marker is reached and the clip is still active,
   * pauses narration until the clip finishes (Pattern 3).
   */
  checkAndWaitForClips(currentTime: number, getMarkerTime: (id: string) => number | null): void;
}

const VideoSyncContext = createContext<VideoSyncContextValue | null>(null);

interface VideoSyncProviderProps {
  children: ReactNode;
}

export const VideoSyncProvider: React.FC<VideoSyncProviderProps> = ({ children }) => {
  const videoRegistryRef = useRef<Map<string, VideoSeekFn>>(new Map());
  const activeSeeksRef = useRef<VideoSeekTrigger[]>([]);
  const activeWaitsRef = useRef<VideoWaitTrigger[]>([]);
  const activeBookmarksRef = useRef<VideoBookmarksFile | null>(null);
  const firedRef = useRef<Set<string>>(new Set());
  const firedWaitsRef = useRef<Set<string>>(new Set());

  // Narration pause/resume callbacks (registered by useAudioPlayback)
  const pauseNarrationRef = useRef<(() => void) | null>(null);
  const resumeNarrationRef = useRef<(() => void) | null>(null);

  // Generation counter: incremented on segment change and on pauseNarration seeks.
  // Used to invalidate stale onDone callbacks when the segment has already moved on.
  const clipGenerationRef = useRef(0);

  // Active clips (Pattern 2 / 3): tracks fireKeys of currently-playing clips
  const activeClipsRef = useRef<Set<string>>(new Set());

  // Pattern 3: pending resume waiting for a specific clip to finish
  const pendingResumeRef = useRef<PendingResume | null>(null);

  const registerVideo = useCallback(
    (videoId: string, seekFn: VideoSeekFn): (() => void) => {
      videoRegistryRef.current.set(videoId, seekFn);
      return () => {
        videoRegistryRef.current.delete(videoId);
      };
    },
    []
  );

  const registerNarrationControl = useCallback(
    (pauseFn: () => void, resumeFn: () => void): (() => void) => {
      pauseNarrationRef.current = pauseFn;
      resumeNarrationRef.current = resumeFn;
      return () => {
        pauseNarrationRef.current = null;
        resumeNarrationRef.current = null;
      };
    },
    []
  );

  const setActiveSeeks = useCallback(
    (
      triggers: VideoSeekTrigger[] | undefined,
      waits: VideoWaitTrigger[] | undefined,
      bookmarks: VideoBookmarksFile | null,
    ) => {
      activeSeeksRef.current = triggers ?? [];
      activeWaitsRef.current = waits ?? [];
      activeBookmarksRef.current = bookmarks;
      firedRef.current = new Set();
      firedWaitsRef.current = new Set();
      activeClipsRef.current = new Set();
      pendingResumeRef.current = null;
      clipGenerationRef.current++; // invalidate any in-flight clip callbacks
    },
    []
  );

  const checkAndFireSeeks = useCallback(
    (currentTime: number, getMarkerTime: (id: string) => number | null) => {
      const triggers = activeSeeksRef.current;
      if (triggers.length === 0) return;

      const bookmarks = activeBookmarksRef.current;
      const fired = firedRef.current;

      for (const trigger of triggers) {
        const fireKey = `${trigger.videoId}:${trigger.bookmarkId}:${trigger.atMarker}`;
        if (fired.has(fireKey)) continue;

        const markerTime = getMarkerTime(trigger.atMarker);
        if (markerTime === null || currentTime < markerTime) continue;

        // Marker reached — look up bookmark
        const videoSet = bookmarks?.videos[trigger.videoId];
        const bookmark = videoSet?.bookmarks.find(b => b.id === trigger.bookmarkId);
        if (!bookmark) continue;

        const seekFn = videoRegistryRef.current.get(trigger.videoId);
        if (!seekFn) continue;

        fired.add(fireKey);

        const clipKey = `${trigger.videoId}:${trigger.bookmarkId}`;

        // Resolve endBookmarkId → endTime
        const endBookmark = trigger.endBookmarkId
          ? videoSet?.bookmarks.find(b => b.id === trigger.endBookmarkId)
          : undefined;
        const endTime = endBookmark?.time;
        const rate = trigger.playbackRate ?? 1;

        if (trigger.pauseNarration) {
          // Pattern 1: pause TTS, play clip, resume when clip ends
          const gen = ++clipGenerationRef.current;
          pauseNarrationRef.current?.();
          seekFn(bookmark.time, trigger.autoPlay ?? true, endTime, rate, () => {
            if (clipGenerationRef.current === gen) {
              resumeNarrationRef.current?.();
            }
          });
        } else {
          // Pattern 2 (and Pattern 3 start): clip overlays TTS concurrently.
          // Track the clip so checkAndWaitForClips knows it's active.
          activeClipsRef.current.add(clipKey);
          seekFn(bookmark.time, trigger.autoPlay ?? true, endTime, rate, () => {
            activeClipsRef.current.delete(clipKey);
            // Pattern 3: if narration is waiting for this clip, resume it now
            const pending = pendingResumeRef.current;
            if (pending?.clipKey === clipKey) {
              pendingResumeRef.current = null;
              resumeNarrationRef.current?.();
            }
          });
        }
      }
    },
    []
  );

  const checkAndWaitForClips = useCallback(
    (currentTime: number, getMarkerTime: (id: string) => number | null) => {
      const waits = activeWaitsRef.current;
      if (waits.length === 0) return;

      const firedWaits = firedWaitsRef.current;

      for (const wait of waits) {
        const waitKey = `wait:${wait.videoId}:${wait.bookmarkId}:${wait.atMarker}`;
        if (firedWaits.has(waitKey)) continue;

        const markerTime = getMarkerTime(wait.atMarker);
        if (markerTime === null || currentTime < markerTime) continue;

        firedWaits.add(waitKey);

        const clipKey = `${wait.videoId}:${wait.bookmarkId}`;
        if (activeClipsRef.current.has(clipKey)) {
          // Clip still playing — pause narration and register a pending resume
          pauseNarrationRef.current?.();
          pendingResumeRef.current = { clipKey };
        }
        // else: clip already done, no-op — TTS continues uninterrupted
      }
    },
    []
  );

  const value: VideoSyncContextValue = {
    registerVideo,
    registerNarrationControl,
    setActiveSeeks,
    checkAndFireSeeks,
    checkAndWaitForClips,
  };

  return (
    <VideoSyncContext.Provider value={value}>
      {children}
    </VideoSyncContext.Provider>
  );
};

/**
 * Hook to access VideoSyncContext. Throws if used outside provider.
 */
export function useVideoSyncContext(): VideoSyncContextValue {
  const ctx = useContext(VideoSyncContext);
  if (!ctx) {
    throw new Error('useVideoSyncContext must be used within a VideoSyncProvider');
  }
  return ctx;
}

/**
 * Hook to access VideoSyncContext, returning null if outside provider.
 * Used by components that should degrade gracefully without the context.
 */
export function useVideoSyncContextOptional(): VideoSyncContextValue | null {
  return useContext(VideoSyncContext);
}
