/**
 * VideoBookmarkEditorModal — interactive 3-panel editor for video timestamp bookmarks.
 *
 * Left:   Video list (auto-populated from filesystem)
 * Center: Native <video> with play/pause, nudge, scrubber, "📌 Add Bookmark"
 * Right:  Bookmark list for selected video (editable id/label/time, delete; start/end are readonly)
 * Footer: Save (POST /api/video-bookmarks/{demoId}) + Close
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useTheme } from '../theme/ThemeContext';
import type { VideoBookmark, VideoBookmarkSet, VideoBookmarksFile } from '../types/videoBookmarks';

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

function deriveVideoId(filePath: string, existing: Record<string, unknown>): string {
  const basename = filePath.split('/').pop()?.replace(/\.(mp4|webm)$/i, '') ?? 'video';
  let id = basename.replace(/_/g, '-');
  if (!existing[id]) return id;
  let n = 2;
  while (existing[`${id}-${n}`]) n++;
  return `${id}-${n}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface VideoBookmarkEditorModalProps {
  demoId: string;
  initialData?: VideoBookmarksFile | null;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const VideoBookmarkEditorModal: React.FC<VideoBookmarkEditorModalProps> = ({
  demoId,
  initialData,
  onClose,
}) => {
  const theme = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, true);

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

  const videoRef = useRef<HTMLVideoElement>(null);

  // ── Auto-populate videos from filesystem ──────────────────────────────
  useEffect(() => {
    fetch(`/api/video-bookmarks/${demoId}/list`)
      .then(r => r.ok ? r.json() : { files: [] })
      .then(data => {
        const files: string[] = data.files ?? [];
        setVideos(prev => {
          // Build a map of all filesystem videos, preserving existing bookmarks
          const srcToExisting = new Map<string, [string, VideoBookmarkSet]>();
          for (const [id, set] of Object.entries(prev)) {
            srcToExisting.set(set.src, [id, set]);
          }

          const next: Record<string, VideoBookmarkSet> = {};
          for (const filePath of files) {
            const existing = srcToExisting.get(filePath);
            if (existing) {
              // Preserve existing entry (ID + bookmarks)
              next[existing[0]] = existing[1];
            } else {
              // New file — derive videoId from filename
              const videoId = deriveVideoId(filePath, next);
              next[videoId] = {
                src: filePath,
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
            {Object.keys(videos).map(id => (
              <button
                key={id}
                onClick={() => setSelectedVideoId(id)}
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
                {id}
              </button>
            ))}
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
                <video
                  ref={videoRef}
                  src={selectedVideo.src}
                  style={{ width: '100%', borderRadius: 8, background: '#000', maxHeight: 320 }}
                  preload="auto"
                  playsInline
                />
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
              Bookmarks {selectedVideoId ? `— ${selectedVideoId}` : ''}
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
                    {/* Delete (hidden for start/end) */}
                    {bm.id !== 'start' && bm.id !== 'end' && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <button
                          style={s.btn(false, true)}
                          onClick={() => deleteBookmark(i)}
                          title="Delete bookmark"
                        >
                          🗑
                        </button>
                      </div>
                    )}
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
