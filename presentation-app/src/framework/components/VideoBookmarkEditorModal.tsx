/**
 * VideoBookmarkEditorModal — interactive 3-panel editor for video timestamp bookmarks.
 *
 * Left:   Video list (auto-populated from filesystem)
 * Center: Native <video> with play/pause, nudge, scrubber, "📌 Add Bookmark"
 * Right:  Bookmark list for selected video (editable id/label/time, delete; start/end are readonly)
 * Footer: Save (POST /api/video-bookmarks/{demoId}) + Close
 */
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useTheme } from '../theme/ThemeContext';
import type { VideoBookmark, VideoBookmarkSet, VideoBookmarksFile, VideoZoomRegion } from '../types/videoBookmarks';
import type { SlideComponentWithMetadata } from '../slides/SlideMetadata';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`;
}

function cloneBookmarks(data: VideoBookmarksFile | null | undefined): Record<string, VideoBookmarkSet> {
  if (!data?.videos) return {};
  return JSON.parse(JSON.stringify(data.videos));
}

/** Clamp zoom center so the zoom box stays within [0,1]² bounds */
function clampZoomCenter(cx: number, cy: number, scale: number): { cx: number; cy: number } {
  const half = 0.5 / scale;
  return {
    cx: Math.max(half, Math.min(1 - half, cx)),
    cy: Math.max(half, Math.min(1 - half, cy)),
  };
}

/** Compute CSS transform values for a zoom region */
function computeZoomTransform(zoom: VideoZoomRegion): { x: string; y: string; scale: number } {
  return {
    x: `${(0.5 - zoom.scale * zoom.cx) * 100}%`,
    y: `${(0.5 - zoom.scale * zoom.cy) * 100}%`,
    scale: zoom.scale,
  };
}

/** Convert zoom center+scale to a bounding rect in normalized coords */
function zoomToRect(zoom: VideoZoomRegion): { left: number; top: number; width: number; height: number } {
  const size = 1 / zoom.scale;
  return { left: zoom.cx - size / 2, top: zoom.cy - size / 2, width: size, height: size };
}

/** Convert a drawn rectangle (normalized) back to zoom center+scale */
function rectToZoom(left: number, top: number, size: number): VideoZoomRegion {
  const scale = 1 / Math.max(size, 0.05);
  const cx = left + size / 2;
  const cy = top + size / 2;
  const clamped = clampZoomCenter(cx, cy, scale);
  return { cx: clamped.cx, cy: clamped.cy, scale };
}

type CornerID = 'tl' | 'tr' | 'bl' | 'br';

/** Hit-test corner handles, returns corner id or null */
function hitTestCorner(normX: number, normY: number, zoom: VideoZoomRegion, threshold: number): CornerID | null {
  const r = zoomToRect(zoom);
  const corners: Array<[CornerID, number, number]> = [
    ['tl', r.left, r.top],
    ['tr', r.left + r.width, r.top],
    ['bl', r.left, r.top + r.height],
    ['br', r.left + r.width, r.top + r.height],
  ];
  for (const [id, cx, cy] of corners) {
    if (Math.abs(normX - cx) < threshold && Math.abs(normY - cy) < threshold) return id;
  }
  return null;
}

/** Hit-test whether point is inside the zoom box */
function hitTestBox(normX: number, normY: number, zoom: VideoZoomRegion): boolean {
  const r = zoomToRect(zoom);
  return normX >= r.left && normX <= r.left + r.width && normY >= r.top && normY <= r.top + r.height;
}

interface DragState {
  mode: 'draw' | 'move' | 'resize';
  startNorm: { x: number; y: number };
  startZoom: VideoZoomRegion | null;
  anchorCorner?: { x: number; y: number };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TriggerRef {
  bookmarkId: string;
  atMarker: string;
  pattern: 'pause' | 'concurrent' | 'wait';
}

interface VideoUsage {
  chapter: number;
  slide: number;
  slideTitle: string;
  segmentIndex: number;
  triggers: TriggerRef[];
}

interface VideoBookmarkEditorModalProps {
  demoId: string;
  initialData?: VideoBookmarksFile | null;
  slides?: SlideComponentWithMetadata[];
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const VideoBookmarkEditorModal: React.FC<VideoBookmarkEditorModalProps> = ({
  demoId,
  initialData,
  slides,
  onClose,
}) => {
  const theme = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, true);

  // ── Source-scanned video usage (fetched from server, scans slide .tsx files) ──
  const [sourceUsage, setSourceUsage] = useState<Record<string, { chapter: number; slide: number; title: string }[]>>({});
  useEffect(() => {
    fetch(`/api/video-bookmarks/${demoId}/source-usage`)
      .then(r => r.ok ? r.json() : { usage: {} })
      .then(data => setSourceUsage(data.usage ?? {}))
      .catch(() => {});
  }, [demoId]);

  // ── Video usage map (videoPath → where it's referenced in slides) ───
  const videoUsageMap = useMemo(() => {
    const map = new Map<string, VideoUsage[]>();
    if (!slides) return map;
    // 1. Trigger-based usage (videoSeeks / videoWaits in segment metadata)
    for (const slide of slides) {
      const { chapter, slide: slideNum, title, audioSegments } = slide.metadata;
      for (const seg of audioSegments) {
        const triggersByPath = new Map<string, TriggerRef[]>();
        for (const vs of seg.videoSeeks ?? []) {
          let arr = triggersByPath.get(vs.videoPath);
          if (!arr) { arr = []; triggersByPath.set(vs.videoPath, arr); }
          arr.push({
            bookmarkId: vs.bookmarkId,
            atMarker: vs.atMarker,
            pattern: vs.pauseNarration ? 'pause' : 'concurrent',
          });
        }
        for (const vw of seg.videoWaits ?? []) {
          let arr = triggersByPath.get(vw.videoPath);
          if (!arr) { arr = []; triggersByPath.set(vw.videoPath, arr); }
          arr.push({
            bookmarkId: vw.bookmarkId,
            atMarker: vw.atMarker,
            pattern: 'wait',
          });
        }
        for (const [path, triggers] of triggersByPath) {
          let usages = map.get(path);
          if (!usages) { usages = []; map.set(path, usages); }
          usages.push({ chapter, slide: slideNum, slideTitle: title, segmentIndex: seg.id, triggers });
        }
      }
    }
    // 2. Source-scanned usage (videoPath references found in slide .tsx source)
    for (const [videoPath, locations] of Object.entries(sourceUsage)) {
      if (map.has(videoPath)) continue; // trigger data takes precedence
      const usages: VideoUsage[] = locations.map(loc => ({
        chapter: loc.chapter,
        slide: loc.slide,
        slideTitle: loc.title,
        segmentIndex: -1,
        triggers: [],
      }));
      if (usages.length > 0) map.set(videoPath, usages);
    }
    return map;
  }, [slides, sourceUsage]);

  // ── State ──────────────────────────────────────────────────────────
  const [videos, setVideos] = useState<Record<string, VideoBookmarkSet>>(() => cloneBookmarks(initialData));
  const [selectedVideoId, setSelectedVideoId] = useState<string>(() => {
    const ids = Object.keys(cloneBookmarks(initialData));
    return ids[0] ?? '';
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');
  const [editingZoomIndex, setEditingZoomIndex] = useState<number | null>(null);
  const [zoomPreview, setZoomPreview] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // ── Auto-populate videos from filesystem ──────────────────────────────
  useEffect(() => {
    fetch(`/api/video-bookmarks/${demoId}/list`)
      .then(r => r.ok ? r.json() : { files: [] })
      .then(data => {
        const files: string[] = data.files ?? [];
        setVideos(prev => {
          const next: Record<string, VideoBookmarkSet> = {};
          for (const filePath of files) {
            if (prev[filePath]) {
              // Preserve existing bookmarks
              next[filePath] = prev[filePath];
            } else {
              // New file
              next[filePath] = {
                bookmarks: [{ id: 'start', time: 0, label: 'Start' }],
              };
            }
          }
          return next;
        });
      })
      .catch(() => {});
  }, [demoId]);

  // ── Auto-select first video when none selected ────────────────────────
  useEffect(() => {
    const ids = Object.keys(videos);
    if (!selectedVideoId && ids.length > 0) {
      setSelectedVideoId(ids[0]);
    }
  }, [videos, selectedVideoId]);

  // ── Video playback sync (rAF for smooth timestamp updates) ──────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset to the new video's current state
    setCurrentTime(video.currentTime);
    setDuration(video.duration || 0);
    setIsPlaying(!video.paused);

    let rafId = 0;
    const tick = () => {
      setCurrentTime(video.currentTime);
      rafId = requestAnimationFrame(tick);
    };

    const handleDurationChange = () => {
      const dur = video.duration || 0;
      setDuration(dur);
      // Auto-add "end" bookmark if none exists yet
      if (dur > 0 && selectedVideoId) {
        setVideos(prev => {
          const entry = prev[selectedVideoId];
          if (!entry || entry.bookmarks.some(bm => bm.id === 'end')) return prev;
          return {
            ...prev,
            [selectedVideoId]: {
              ...entry,
              bookmarks: [...entry.bookmarks, { id: 'end', time: dur, label: 'End' }],
            },
          };
        });
      }
    };
    const handlePlay = () => { setIsPlaying(true); rafId = requestAnimationFrame(tick); };
    const handlePause = () => { setIsPlaying(false); cancelAnimationFrame(rafId); };
    const handleEnded = () => { setIsPlaying(false); cancelAnimationFrame(rafId); };
    const handleSeeked = () => setCurrentTime(video.currentTime);

    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('seeked', handleSeeked);

    // If duration is already known (durationchange fired before listener attached), handle it now
    if (video.duration && video.duration > 0 && isFinite(video.duration)) {
      handleDurationChange();
    }

    // If already playing when effect mounts, start the loop
    if (!video.paused) {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [selectedVideoId]);

  // ── Keyboard: Escape closes ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── Helpers ─────────────────────────────────────────────────────────
  const selectedVideo = videos[selectedVideoId];

  // ── Bookmark cross-reference map (bookmarkId → triggers that reference it) ──
  const bookmarkRefMap = useMemo(() => {
    const map = new Map<string, Array<TriggerRef & { chapter: number; slide: number }>>();
    const usages = videoUsageMap.get(selectedVideoId);
    if (!usages) return map;
    for (const usage of usages) {
      for (const trigger of usage.triggers) {
        let arr = map.get(trigger.bookmarkId);
        if (!arr) { arr = []; map.set(trigger.bookmarkId, arr); }
        arr.push({ ...trigger, chapter: usage.chapter, slide: usage.slide });
      }
    }
    return map;
  }, [videoUsageMap, selectedVideoId]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const nudge = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + delta, video.duration || 0));
    setCurrentTime(video.currentTime);
  }, []);

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
  }, []);

  const addBookmarkAtCurrentTime = useCallback(() => {
    if (!selectedVideoId) return;
    const id = `bm${Date.now()}`;
    const newBm: VideoBookmark = { id, time: currentTime, label: '' };
    setVideos(prev => {
      const next = { ...prev };
      next[selectedVideoId] = {
        ...next[selectedVideoId],
        bookmarks: [...(next[selectedVideoId]?.bookmarks ?? []), newBm],
      };
      return next;
    });
  }, [selectedVideoId, currentTime]);

  const updateBookmark = useCallback((index: number, patch: Partial<VideoBookmark>) => {
    if (!selectedVideoId) return;
    setVideos(prev => {
      const next = { ...prev };
      const bms = [...(next[selectedVideoId]?.bookmarks ?? [])];
      bms[index] = { ...bms[index], ...patch };
      next[selectedVideoId] = { ...next[selectedVideoId], bookmarks: bms };
      return next;
    });
  }, [selectedVideoId]);

  const deleteBookmark = useCallback((index: number) => {
    if (!selectedVideoId) return;
    setEditingZoomIndex(prev => {
      if (prev === null) return null;
      if (prev === index) return null;
      if (prev > index) return prev - 1;
      return prev;
    });
    setVideos(prev => {
      const next = { ...prev };
      const bms = [...(next[selectedVideoId]?.bookmarks ?? [])];
      bms.splice(index, 1);
      next[selectedVideoId] = { ...next[selectedVideoId], bookmarks: bms };
      return next;
    });
  }, [selectedVideoId]);

  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    setSaveError('');
    try {
      const payload: VideoBookmarksFile = { demoId, videos };
      const resp = await fetch(`/api/video-bookmarks/${demoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e: any) {
      setSaveStatus('error');
      setSaveError(e.message || 'Save failed');
    }
  }, [demoId, videos]);

  // ── Zoom editing ──────────────────────────────────────────────────────
  // Reset zoom editing state when video changes
  useEffect(() => {
    setEditingZoomIndex(null);
    setDragState(null);
    setZoomPreview(false);
  }, [selectedVideoId]);

  const editingZoom = editingZoomIndex !== null ? (selectedVideo?.bookmarks[editingZoomIndex]?.zoom ?? null) : null;

  const setEditingZoom = useCallback((zoom: VideoZoomRegion | undefined) => {
    if (editingZoomIndex === null || !selectedVideoId) return;
    updateBookmark(editingZoomIndex, { zoom });
  }, [editingZoomIndex, selectedVideoId, updateBookmark]);

  /** Normalize mouse coords relative to overlay element */
  const getNormCoords = useCallback((e: MouseEvent): { x: number; y: number } | null => {
    const el = overlayRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
  }, []);

  const handleOverlayMouseDown = useCallback((e: React.MouseEvent) => {
    if (editingZoomIndex === null) return;
    e.preventDefault();
    const el = overlayRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const norm = {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
    const threshold = 0.03;

    if (editingZoom) {
      const corner = hitTestCorner(norm.x, norm.y, editingZoom, threshold);
      if (corner) {
        // Resize mode: anchor at opposite corner
        const r = zoomToRect(editingZoom);
        const opposites: Record<CornerID, { x: number; y: number }> = {
          tl: { x: r.left + r.width, y: r.top + r.height },
          tr: { x: r.left, y: r.top + r.height },
          bl: { x: r.left + r.width, y: r.top },
          br: { x: r.left, y: r.top },
        };
        setDragState({ mode: 'resize', startNorm: norm, startZoom: editingZoom, anchorCorner: opposites[corner] });
        return;
      }
      if (hitTestBox(norm.x, norm.y, editingZoom)) {
        setDragState({ mode: 'move', startNorm: norm, startZoom: editingZoom });
        return;
      }
    }
    // Draw mode
    setDragState({ mode: 'draw', startNorm: norm, startZoom: editingZoom });
  }, [editingZoomIndex, editingZoom]);

  // Document-level mousemove/mouseup for drag operations
  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const norm = getNormCoords(e);
      if (!norm) return;

      if (dragState.mode === 'draw') {
        const dx = Math.abs(norm.x - dragState.startNorm.x);
        const dy = Math.abs(norm.y - dragState.startNorm.y);
        const size = Math.max(dx, dy, 0.05);
        const left = norm.x > dragState.startNorm.x
          ? dragState.startNorm.x
          : Math.max(0, dragState.startNorm.x - size);
        const top = norm.y > dragState.startNorm.y
          ? dragState.startNorm.y
          : Math.max(0, dragState.startNorm.y - size);
        const clampedSize = Math.min(size, 1 - left, 1 - top);
        setEditingZoom(rectToZoom(left, top, clampedSize));
      } else if (dragState.mode === 'move' && dragState.startZoom) {
        const dx = norm.x - dragState.startNorm.x;
        const dy = norm.y - dragState.startNorm.y;
        const newCx = dragState.startZoom.cx + dx;
        const newCy = dragState.startZoom.cy + dy;
        const clamped = clampZoomCenter(newCx, newCy, dragState.startZoom.scale);
        setEditingZoom({ ...dragState.startZoom, cx: clamped.cx, cy: clamped.cy });
      } else if (dragState.mode === 'resize' && dragState.anchorCorner) {
        const anchor = dragState.anchorCorner;
        const dx = Math.abs(norm.x - anchor.x);
        const dy = Math.abs(norm.y - anchor.y);
        const size = Math.max(dx, dy, 0.05);
        const left = Math.min(anchor.x, norm.x > anchor.x ? anchor.x : anchor.x - size);
        const top = Math.min(anchor.y, norm.y > anchor.y ? anchor.y : anchor.y - size);
        const clampedLeft = Math.max(0, left);
        const clampedTop = Math.max(0, top);
        const clampedSize = Math.min(size, 1 - clampedLeft, 1 - clampedTop);
        setEditingZoom(rectToZoom(clampedLeft, clampedTop, clampedSize));
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, getNormCoords, setEditingZoom]);

  /** Get cursor style for overlay based on hover position */
  const getOverlayCursor = useCallback((e: React.MouseEvent): string => {
    if (editingZoomIndex === null) return 'default';
    if (!editingZoom) return 'crosshair';
    const el = overlayRef.current;
    if (!el) return 'crosshair';
    const rect = el.getBoundingClientRect();
    const norm = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
    const corner = hitTestCorner(norm.x, norm.y, editingZoom, 0.03);
    if (corner === 'tl' || corner === 'br') return 'nwse-resize';
    if (corner === 'tr' || corner === 'bl') return 'nesw-resize';
    if (hitTestBox(norm.x, norm.y, editingZoom)) return 'move';
    return 'crosshair';
  }, [editingZoomIndex, editingZoom]);

  const [overlayCursor, setOverlayCursor] = useState('crosshair');

  // ── Styles ──────────────────────────────────────────────────────────
  const s = {
    backdrop: {
      position: 'fixed' as const,
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      zIndex: 10500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modal: {
      background: theme.colors.bgSurface,
      border: `1px solid ${theme.colors.borderSubtle}`,
      borderRadius: 16,
      width: 'min(1100px, 95vw)',
      height: 'min(680px, 90vh)',
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
      fontFamily: theme.fontFamily,
      color: theme.colors.textPrimary,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1.25rem',
      borderBottom: `1px solid ${theme.colors.borderSubtle}`,
      fontSize: 14,
      fontWeight: 600,
    },
    body: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    },
    panel: {
      padding: '0.75rem',
      overflowY: 'auto' as const,
    },
    leftPanel: {
      width: 180,
      borderRight: `1px solid ${theme.colors.borderSubtle}`,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.25rem',
    },
    centerPanel: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
      borderRight: `1px solid ${theme.colors.borderSubtle}`,
    },
    rightPanel: {
      width: 340,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '0.75rem',
      padding: '0.75rem 1.25rem',
      borderTop: `1px solid ${theme.colors.borderSubtle}`,
    },
    btn: (primary?: boolean, danger?: boolean) => ({
      background: primary ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` : 'transparent',
      border: `1px solid ${danger ? theme.colors.error : primary ? 'transparent' : theme.colors.borderSubtle}`,
      color: primary ? '#fff' : danger ? theme.colors.error : theme.colors.textPrimary,
      borderRadius: 6,
      padding: '0.3rem 0.8rem',
      fontSize: 11,
      cursor: 'pointer',
      fontWeight: primary ? 600 : 400,
    }),
    input: {
      background: theme.colors.bgDeep,
      border: `1px solid ${theme.colors.borderSubtle}`,
      borderRadius: 6,
      padding: '0.25rem 0.5rem',
      fontSize: 11,
      color: theme.colors.textPrimary,
      width: '100%',
    },
  };

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={s.backdrop}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={modalRef} style={s.modal} role="dialog" aria-modal="true" aria-label="Video Bookmark Editor">
        {/* Header */}
        <div style={s.header}>
          <span>📹 Video Bookmark Editor — <code style={{ fontFamily: 'monospace', opacity: 0.7 }}>{demoId}</code></span>
          <button style={s.btn()} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div style={s.body}>
          {/* ── Left: Video list ── */}
          <div style={{ ...s.panel, ...s.leftPanel }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: '0.25rem' }}>Videos</div>
            {Object.keys(videos)
              .sort((a, b) => {
                const ua = videoUsageMap.get(a);
                const ub = videoUsageMap.get(b);
                if (!ua?.length && !ub?.length) return 0;
                if (!ua?.length) return 1;
                if (!ub?.length) return -1;
                const fa = ua[0], fb = ub[0];
                return fa.chapter - fb.chapter || fa.slide - fb.slide || fa.segmentIndex - fb.segmentIndex;
              })
              .map(id => {
              const usages = videoUsageMap.get(id);
              const basename = id.split('/').pop() ?? id;
              return (
              <div key={id} style={{ display: 'flex', flexDirection: 'column' }}>
                <button
                  onClick={() => setSelectedVideoId(id)}
                  title={id}
                  style={{
                    background: id === selectedVideoId ? theme.colors.bgBorder : 'transparent',
                    border: `1px solid ${id === selectedVideoId ? theme.colors.primary : theme.colors.borderSubtle}`,
                    borderRadius: 6,
                    padding: '0.3rem 0.5rem',
                    fontSize: 11,
                    cursor: 'pointer',
                    color: id === selectedVideoId ? theme.colors.primary : theme.colors.textPrimary,
                    textAlign: 'left',
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {basename}
                </button>
                {usages && usages.length > 0 && (
                  <div style={{ fontSize: 10, color: theme.colors.textMuted, padding: '1px 0.5rem 0' }}>
                    {usages.map((u, ui) => (
                      <div key={ui} style={{ marginBottom: 2 }}>
                        <div>
                          Ch{u.chapter} S{u.slide}
                          {u.segmentIndex >= 0 ? ` seg${u.segmentIndex}` : ''}
                          {u.slideTitle ? ` — "${u.slideTitle}"` : ''}
                        </div>
                        {u.triggers.map((t, ti) => (
                          <div key={ti} style={{ paddingLeft: '0.5rem', fontSize: 9, opacity: 0.8 }}>
                            → {t.bookmarkId} at {'{#'}{t.atMarker}{'}'} ({t.pattern})
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              );
            })}
            {Object.keys(videos).length === 0 && (
              <div style={{ color: theme.colors.textMuted, fontSize: 11, marginTop: '0.5rem' }}>
                No video files found.
              </div>
            )}
          </div>

          {/* ── Center: Video player ── */}
          <div style={{ ...s.panel, ...s.centerPanel }}>
            {selectedVideo ? (
              <>
                {/* Video + zoom overlay container */}
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 8, background: '#000' }}>
                  {/* Inner wrapper for zoom preview transform */}
                  <div style={
                    zoomPreview && editingZoom
                      ? {
                          transformOrigin: '0% 0%',
                          width: '100%',
                          transform: (() => {
                            const t = computeZoomTransform(editingZoom);
                            return `translate(${t.x}, ${t.y}) scale(${t.scale})`;
                          })(),
                          transition: 'transform 0.3s ease-in-out',
                        }
                      : { width: '100%' }
                  }>
                    <video
                      ref={videoRef}
                      src={selectedVideoId}
                      style={{ width: '100%', display: 'block', maxHeight: 320 }}
                      preload="auto"
                      playsInline
                    />
                  </div>
                  {/* Zoom crop overlay — visible when editing zoom and not previewing */}
                  {editingZoomIndex !== null && !zoomPreview && (
                    <div
                      ref={overlayRef}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        cursor: overlayCursor,
                      }}
                      onMouseDown={handleOverlayMouseDown}
                      onMouseMove={(e) => setOverlayCursor(getOverlayCursor(e))}
                    >
                      {editingZoom && (() => {
                        const r = zoomToRect(editingZoom);
                        const pct = (v: number) => `${v * 100}%`;
                        return (
                          <>
                            {/* Zoom rectangle with dimmed exterior */}
                            <div style={{
                              position: 'absolute',
                              left: pct(r.left),
                              top: pct(r.top),
                              width: pct(r.width),
                              height: pct(r.height),
                              border: '2px dashed cyan',
                              boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)',
                              pointerEvents: 'none',
                            }} />
                            {/* Corner handles */}
                            {([
                              ['tl', r.left, r.top, 'nwse-resize'],
                              ['tr', r.left + r.width, r.top, 'nesw-resize'],
                              ['bl', r.left, r.top + r.height, 'nesw-resize'],
                              ['br', r.left + r.width, r.top + r.height, 'nwse-resize'],
                            ] as const).map(([id, cx, cy, cursor]) => (
                              <div key={id} style={{
                                position: 'absolute',
                                left: `calc(${pct(cx)} - 4px)`,
                                top: `calc(${pct(cy)} - 4px)`,
                                width: 8,
                                height: 8,
                                background: 'rgba(0,255,255,0.3)',
                                border: '1px solid white',
                                cursor,
                                pointerEvents: 'none',
                              }} />
                            ))}
                            {/* Center dot */}
                            <div style={{
                              position: 'absolute',
                              left: `calc(${pct(editingZoom.cx)} - 3px)`,
                              top: `calc(${pct(editingZoom.cy)} - 3px)`,
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: 'cyan',
                              pointerEvents: 'none',
                            }} />
                            {/* Scale label */}
                            <div style={{
                              position: 'absolute',
                              left: pct(r.left),
                              top: `calc(${pct(r.top)} - 16px)`,
                              fontSize: 10,
                              color: 'cyan',
                              fontFamily: 'monospace',
                              pointerEvents: 'none',
                              textShadow: '0 0 3px black',
                            }}>
                              {editingZoom.scale.toFixed(1)}x
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
                {/* Zoom controls panel (visible when editing zoom) */}
                {editingZoomIndex !== null && (
                  <div style={{
                    background: theme.colors.bgDeep,
                    borderRadius: 6,
                    padding: '0.4rem 0.6rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                    fontSize: 11,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ color: theme.colors.textMuted, fontSize: 10 }}>Scale</span>
                      <input
                        type="range"
                        min={1}
                        max={8}
                        step={0.1}
                        value={editingZoom?.scale ?? 2}
                        onChange={e => {
                          const newScale = Number(e.target.value);
                          const current = editingZoom ?? { cx: 0.5, cy: 0.5, scale: 2 };
                          const clamped = clampZoomCenter(current.cx, current.cy, newScale);
                          setEditingZoom({ cx: clamped.cx, cy: clamped.cy, scale: newScale });
                        }}
                        style={{ flex: 1, minWidth: 60, cursor: 'pointer' }}
                      />
                      <span style={{ fontFamily: 'monospace', color: theme.colors.textSecondary, minWidth: 36 }}>
                        {(editingZoom?.scale ?? 2).toFixed(1)}x
                      </span>
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: theme.colors.textMuted }}>
                      center: ({(editingZoom?.cx ?? 0.5).toFixed(3)}, {(editingZoom?.cy ?? 0.5).toFixed(3)}) scale: {(editingZoom?.scale ?? 1).toFixed(1)}x
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: 10, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={zoomPreview}
                          onChange={e => setZoomPreview(e.target.checked)}
                        />
                        Preview zoom
                      </label>
                      <button
                        style={s.btn(false, true)}
                        onClick={() => setEditingZoom(undefined)}
                      >
                        Clear Zoom
                      </button>
                      <button
                        style={s.btn()}
                        onClick={() => { setEditingZoomIndex(null); setZoomPreview(false); }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
                {/* Usage summary */}
                {(() => {
                  const usages = videoUsageMap.get(selectedVideoId);
                  return (
                    <div style={{
                      fontSize: 10,
                      color: theme.colors.textMuted,
                      background: theme.colors.bgDeep,
                      borderRadius: 6,
                      padding: '0.35rem 0.5rem',
                    }}>
                      {usages && usages.length > 0 ? (
                        <>
                          <div style={{ fontWeight: 600, marginBottom: 2 }}>Used in:</div>
                          {usages.map((u, i) => (
                            <div key={i} style={{ marginBottom: 2 }}>
                              <span>
                                Ch{u.chapter} S{u.slide}
                                {u.slideTitle ? ` "${u.slideTitle}"` : ''}
                                {u.segmentIndex >= 0 ? ` seg${u.segmentIndex}` : ''}
                              </span>
                              {u.triggers.map((t, ti) => (
                                <span key={ti} style={{ marginLeft: 6, opacity: 0.8 }}>
                                  [{t.bookmarkId} @ {'{#'}{t.atMarker}{'}'} ({t.pattern})]
                                </span>
                              ))}
                            </div>
                          ))}
                        </>
                      ) : (
                        <span>No slide references found</span>
                      )}
                    </div>
                  );
                })()}
                {/* Scrubber */}
                <input
                  type="range"
                  min={0}
                  max={duration || 1}
                  step={0.001}
                  value={currentTime}
                  onChange={e => seekTo(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                {/* Time display */}
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' }}>
                  {fmtTime(currentTime)} / {fmtTime(duration)}
                </div>
                {/* Controls */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button style={s.btn()} onClick={() => nudge(-1)} title="−1s">−1s</button>
                  <button style={s.btn()} onClick={() => nudge(-0.1)} title="−0.1s">−0.1s</button>
                  <button style={{ ...s.btn(true), minWidth: 64 }} onClick={togglePlay}>
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                  </button>
                  <button style={s.btn()} onClick={() => nudge(0.1)} title="+0.1s">+0.1s</button>
                  <button style={s.btn()} onClick={() => nudge(1)} title="+1s">+1s</button>
                </div>
                <button
                  style={{ ...s.btn(true), margin: '0.25rem auto', display: 'block' }}
                  onClick={addBookmarkAtCurrentTime}
                >
                  📌 Add Bookmark at {fmtTime(currentTime)}
                </button>
              </>
            ) : (
              <div style={{ color: theme.colors.textMuted, fontSize: 12, padding: '1rem', textAlign: 'center' }}>
                Select or add a video on the left.
              </div>
            )}
          </div>

          {/* ── Right: Bookmark list ── */}
          <div style={{ ...s.panel, ...s.rightPanel }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: '0.5rem' }}>
              Bookmarks {selectedVideoId ? `— ${selectedVideoId.split('/').pop() ?? selectedVideoId}` : ''}
            </div>
            {(selectedVideo?.bookmarks ?? []).length === 0 ? (
              <div style={{ color: theme.colors.textMuted, fontSize: 11 }}>
                No bookmarks yet. Scrub the video and click "Add Bookmark".
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(selectedVideo?.bookmarks ?? []).map((bm, i) => (
                  <div
                    key={i}
                    style={{
                      background: theme.colors.bgDeep,
                      border: `1px solid ${theme.colors.borderSubtle}`,
                      borderRadius: 8,
                      padding: '0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                    }}
                  >
                    {/* ID */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: 10, color: theme.colors.textMuted, minWidth: 28 }}>ID</span>
                      <input
                        value={bm.id}
                        onChange={e => updateBookmark(i, { id: e.target.value })}
                        disabled={bm.id === 'start' || bm.id === 'end'}
                        style={{ ...s.input, fontFamily: 'monospace', ...(bm.id === 'start' || bm.id === 'end' ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}
                        placeholder="bookmark-id"
                      />
                    </div>
                    {/* Label */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: 10, color: theme.colors.textMuted, minWidth: 28 }}>Label</span>
                      <input
                        value={bm.label ?? ''}
                        onChange={e => updateBookmark(i, { label: e.target.value })}
                        style={s.input}
                        placeholder="Optional description"
                      />
                    </div>
                    {/* Time + seek */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: 10, color: theme.colors.textMuted, minWidth: 28 }}>Time</span>
                      <button
                        style={{ ...s.btn(), fontFamily: 'monospace', fontSize: 11, flex: 1, textAlign: 'left' }}
                        onClick={() => seekTo(bm.time)}
                        title="Click to seek to this time"
                      >
                        {fmtTime(bm.time)}
                      </button>
                      <button
                        style={{ ...s.btn(), fontSize: 10 }}
                        onClick={() => updateBookmark(i, { time: currentTime })}
                        title="Set to current time"
                      >
                        📌
                      </button>
                    </div>
                    {/* Zoom badge */}
                    {bm.zoom && (
                      <div style={{ fontSize: 9, color: 'cyan', padding: '0 0.25rem', fontFamily: 'monospace' }}>
                        🔍 {bm.zoom.scale.toFixed(1)}x
                      </div>
                    )}
                    {/* Cross-references */}
                    {(() => {
                      const refs = bookmarkRefMap.get(bm.id);
                      if (!refs || refs.length === 0) return null;
                      return (
                        <div style={{ fontSize: 9, color: theme.colors.textMuted, padding: '0 0.25rem' }}>
                          {refs.map((r, ri) => (
                            <div key={ri}>
                              → at {'{#'}{r.atMarker}{'}'} ({r.pattern}) — Ch{r.chapter} S{r.slide}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                    {/* Actions row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                      <button
                        style={{
                          ...s.btn(),
                          fontSize: 10,
                          background: editingZoomIndex === i ? theme.colors.bgBorder : undefined,
                        }}
                        onClick={() => {
                          seekTo(bm.time);
                          if (editingZoomIndex === i) {
                            setEditingZoomIndex(null);
                            setZoomPreview(false);
                          } else {
                            setEditingZoomIndex(i);
                            setZoomPreview(false);
                            if (!bm.zoom) {
                              updateBookmark(i, { zoom: { cx: 0.5, cy: 0.5, scale: 2 } });
                            }
                          }
                        }}
                        title={editingZoomIndex === i ? 'Stop editing zoom' : 'Edit zoom region'}
                      >
                        🔍 Zoom
                      </button>
                      {bm.id !== 'start' && bm.id !== 'end' && (
                        <button
                          style={s.btn(false, true)}
                          onClick={() => deleteBookmark(i)}
                          title="Delete bookmark"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={s.footer}>
          {saveStatus === 'error' && (
            <span style={{ fontSize: 11, color: theme.colors.error }}>{saveError}</span>
          )}
          {saveStatus === 'saved' && (
            <span style={{ fontSize: 11, color: theme.colors.success ?? '#4CAF50' }}>Saved!</span>
          )}
          <button style={s.btn()} onClick={onClose}>Close</button>
          <button
            style={s.btn(true)}
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? 'Saving…' : '💾 Save'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
