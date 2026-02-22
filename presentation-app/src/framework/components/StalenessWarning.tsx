import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { useStalenessCheck } from '../hooks/useStalenessCheck';
import type { ChangedSegmentDetail } from '../hooks/useStalenessCheck';
import { clearAlignmentCache, loadAlignment } from '../utils/alignmentLoader';
import { useApiHealth } from '../hooks/useApiHealth';
import { regenerateSegment, generateTtsBatch, saveGeneratedAudio } from '../utils/ttsClient';
import { realignSegment, realignSegments } from '../utils/narrationApiClient';
import { NarrationEditModal } from './NarrationEditModal';
import type { DemoAlignment } from '../alignment/types';
import type { SlideComponentWithMetadata } from '../slides/SlideMetadata';

interface StalenessWarningProps {
  demoId: string;
  isNarratedMode: boolean;
  allSlides: SlideComponentWithMetadata[];
  demoInstruct?: string;
  onAlignmentFixed?: (alignment: DemoAlignment | null) => void;
}

/** Resolve the effective instruct for a segment from the three-level hierarchy. */
function resolveInstruct(
  allSlides: SlideComponentWithMetadata[],
  chapter: number,
  slide: number,
  segmentId: string,
  demoInstruct?: string,
): string | undefined {
  const slideComp = allSlides.find(
    s => s.metadata.chapter === chapter && s.metadata.slide === slide,
  );
  if (!slideComp) return demoInstruct;
  const seg = slideComp.metadata.audioSegments.find(s => s.id === segmentId);
  return seg?.instruct ?? slideComp.metadata.instruct ?? demoInstruct;
}

export const StalenessWarning: React.FC<StalenessWarningProps> = ({
  demoId,
  isNarratedMode,
  allSlides,
  demoInstruct,
  onAlignmentFixed,
}) => {
  const { staleness, fixing, dismissed, regenerate, dismiss, refetch } = useStalenessCheck(demoId);
  const { apiAvailable } = useApiHealth();

  // Per-segment state
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);
  const [segmentErrors, setSegmentErrors] = useState<Record<string, string>>({});
  const [editingSegment, setEditingSegment] = useState<ChangedSegmentDetail | null>(null);
  const [hiddenForEdit, setHiddenForEdit] = useState(false);

  // Regenerate-all progress state
  type SegmentStatus = 'pending' | 'generating' | 'saved' | 'aligning' | 'done' | 'error';
  const [bulkProgress, setBulkProgress] = useState<Record<string, SegmentStatus> | null>(null);
  const [bulkPhase, setBulkPhase] = useState<string | null>(null);
  const bulkAbortRef = useRef(false);
  const isBulkRunning = bulkProgress !== null;
  const [batchMode, setBatchMode] = useState(true);

  // Hidden during narrated playback or when dismissed or not stale
  if (isNarratedMode || dismissed || !staleness?.stale) {
    return null;
  }

  const summaryParts: string[] = [];
  if (staleness.missingMarkers.length > 0) {
    summaryParts.push(`${staleness.missingMarkers.length} marker${staleness.missingMarkers.length !== 1 ? 's' : ''} unresolved`);
  }
  if (staleness.changedSegments.length > 0) {
    summaryParts.push(`${staleness.changedSegments.length} segment${staleness.changedSegments.length !== 1 ? 's' : ''} changed`);
  }
  if (staleness.alignmentMissing) {
    summaryParts.push('alignment.json missing');
  }

  const handleRegenerateAll = async () => {
    const segments = staleness.changedSegments;
    if (segments.length === 0) {
      // No changed segments — fall back to bulk (handles markers/alignment only)
      await regenerate();
      clearAlignmentCache(demoId);
      const newAlignment = await loadAlignment(demoId);
      onAlignmentFixed?.(newAlignment);
      return;
    }

    bulkAbortRef.current = false;
    stopPlayback();

    // Initialize progress for all segments
    const initial: Record<string, SegmentStatus> = {};
    for (const seg of segments) initial[seg.key] = 'pending';
    setBulkProgress(initial);

    if (batchMode) {
      await handleRegenerateAllBatch(segments);
    } else {
      await handleRegenerateAllSequential(segments);
    }

    // Finalize: refresh alignment + staleness
    setBulkPhase('Finalizing...');
    clearAlignmentCache(demoId);
    const newAlignment = await loadAlignment(demoId);
    onAlignmentFixed?.(newAlignment);
    await refetch();

    setBulkProgress(null);
    setBulkPhase(null);
  };

  /** Batch mode: generate all TTS audio in one call, save sequentially, then align all at once. */
  const handleRegenerateAllBatch = async (segments: ChangedSegmentDetail[]) => {
    // Phase 1: batch TTS generation
    setBulkPhase(`Generating TTS for ${segments.length} segments (batch)...`);
    for (const seg of segments) {
      setBulkProgress(prev => prev ? { ...prev, [seg.key]: 'generating' } : prev);
    }

    const batchItems = segments.map(seg => ({
      narrationText: seg.currentText,
      addPauses: true,
      instruct: resolveInstruct(allSlides, seg.chapter, seg.slide, seg.segmentId, demoInstruct),
    }));

    let audios: string[];
    try {
      audios = await generateTtsBatch(batchItems);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Batch generation failed';
      for (const seg of segments) {
        setBulkProgress(prev => prev ? { ...prev, [seg.key]: 'error' } : prev);
        setSegmentErrors(prev => ({ ...prev, [seg.key]: msg }));
      }
      return;
    }

    // Phase 2: save each audio to disk
    const savedSegments: ChangedSegmentDetail[] = [];
    for (let i = 0; i < segments.length; i++) {
      if (bulkAbortRef.current) break;
      const seg = segments[i];

      setBulkPhase(`Saving ${i + 1}/${segments.length}: ${seg.key}`);
      setBulkProgress(prev => prev ? { ...prev, [seg.key]: 'saved' } : prev);
      try {
        const saved = await saveGeneratedAudio({
          demoId,
          chapter: seg.chapter,
          slide: seg.slide,
          segmentIndex: seg.segmentIndex,
          segmentId: seg.segmentId,
          narrationText: seg.currentText,
          audioBase64: audios[i],
          instruct: batchItems[i].instruct,
        });

        // Update in-memory audioFilePath
        const slideComp = allSlides.find(
          s => s.metadata.chapter === seg.chapter && s.metadata.slide === seg.slide,
        );
        if (slideComp) {
          const segMeta = slideComp.metadata.audioSegments[seg.segmentIndex];
          if (segMeta) {
            const basePath = (segMeta.audioFilePath ?? '').split('?')[0];
            segMeta.audioFilePath = `${basePath}?t=${saved.timestamp}`;
          }
        }
        savedSegments.push(seg);
      } catch (err: unknown) {
        setBulkProgress(prev => prev ? { ...prev, [seg.key]: 'error' } : prev);
        setSegmentErrors(prev => ({ ...prev, [seg.key]: err instanceof Error ? err.message : 'Error' }));
      }
    }

    // Phase 3: batch alignment for all saved segments
    if (savedSegments.length > 0) {
      setBulkPhase(`Aligning ${savedSegments.length} segments (batch)...`);
      for (const seg of savedSegments) {
        setBulkProgress(prev => prev ? { ...prev, [seg.key]: 'aligning' } : prev);
      }

      const alignResult = await realignSegments({
        demoId,
        segments: savedSegments.map(s => ({ chapter: s.chapter, slide: s.slide, segmentId: s.segmentId })),
      });

      for (const seg of savedSegments) {
        if (alignResult.success) {
          setBulkProgress(prev => prev ? { ...prev, [seg.key]: 'done' } : prev);
        } else {
          setBulkProgress(prev => prev ? { ...prev, [seg.key]: 'error' } : prev);
          setSegmentErrors(prev => ({ ...prev, [seg.key]: alignResult.error || 'Alignment failed' }));
        }
      }
    }
  };

  /** Sequential mode: generate + save + align one segment at a time. */
  const handleRegenerateAllSequential = async (segments: ChangedSegmentDetail[]) => {
    let completedCount = 0;

    for (const seg of segments) {
      if (bulkAbortRef.current) break;

      setBulkPhase(`Generating TTS ${completedCount + 1}/${segments.length}: ${seg.key}`);
      setBulkProgress(prev => prev ? { ...prev, [seg.key]: 'generating' } : prev);

      const resolvedInstr = resolveInstruct(allSlides, seg.chapter, seg.slide, seg.segmentId, demoInstruct);

      try {
        const result = await regenerateSegment({
          demoId,
          chapter: seg.chapter,
          slide: seg.slide,
          segmentIndex: seg.segmentIndex,
          segmentId: seg.segmentId,
          narrationText: seg.currentText,
          instruct: resolvedInstr,
        });

        if (!result.success) {
          setBulkProgress(prev => prev ? { ...prev, [seg.key]: 'error' } : prev);
          setSegmentErrors(prev => ({ ...prev, [seg.key]: result.error || 'Failed' }));
          continue;
        }

        // Update in-memory audioFilePath
        const slideComp = allSlides.find(
          s => s.metadata.chapter === seg.chapter && s.metadata.slide === seg.slide,
        );
        if (slideComp) {
          const segMeta = slideComp.metadata.audioSegments[seg.segmentIndex];
          if (segMeta) {
            const basePath = (segMeta.audioFilePath ?? '').split('?')[0];
            segMeta.audioFilePath = `${basePath}?t=${result.timestamp}`;
          }
        }

        setBulkPhase(`Aligning ${completedCount + 1}/${segments.length}: ${seg.key}`);
        setBulkProgress(prev => prev ? { ...prev, [seg.key]: 'aligning' } : prev);

        await realignSegment({ demoId, chapter: seg.chapter, slide: seg.slide, segmentId: seg.segmentId });

        setBulkProgress(prev => prev ? { ...prev, [seg.key]: 'done' } : prev);
        completedCount++;
      } catch (err: unknown) {
        setBulkProgress(prev => prev ? { ...prev, [seg.key]: 'error' } : prev);
        setSegmentErrors(prev => ({ ...prev, [seg.key]: err instanceof Error ? err.message : 'Error' }));
      }
    }
  };

  // ── Per-segment actions ──────────────────────────────────────────

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingKey(null);
  };

  const handlePlay = (seg: ChangedSegmentDetail) => {
    if (playingKey === seg.key) {
      stopPlayback();
      return;
    }
    stopPlayback();
    const url = `/audio/${demoId}/${seg.audioRelPath}?t=${Date.now()}`;
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingKey(seg.key);
    audio.onended = () => setPlayingKey(null);
    audio.onerror = () => {
      setPlayingKey(null);
      setSegmentErrors(prev => ({ ...prev, [seg.key]: 'Playback failed' }));
    };
    audio.play().catch(() => setPlayingKey(null));
  };

  const handleRegenSingle = async (seg: ChangedSegmentDetail) => {
    setRegeneratingKey(seg.key);
    setSegmentErrors(prev => { const n = { ...prev }; delete n[seg.key]; return n; });

    try {
      const resolvedInstruct = resolveInstruct(allSlides, seg.chapter, seg.slide, seg.segmentId, demoInstruct);

      const result = await regenerateSegment({
        demoId,
        chapter: seg.chapter,
        slide: seg.slide,
        segmentIndex: seg.segmentIndex,
        segmentId: seg.segmentId,
        narrationText: seg.currentText,
        instruct: resolvedInstruct,
      });

      if (!result.success) {
        setSegmentErrors(prev => ({ ...prev, [seg.key]: result.error || 'Regeneration failed' }));
        return;
      }

      // Update in-memory audioFilePath
      const slideComp = allSlides.find(
        s => s.metadata.chapter === seg.chapter && s.metadata.slide === seg.slide,
      );
      if (slideComp) {
        const segMeta = slideComp.metadata.audioSegments[seg.segmentIndex];
        if (segMeta) {
          const basePath = (segMeta.audioFilePath ?? '').split('?')[0];
          segMeta.audioFilePath = `${basePath}?t=${result.timestamp}`;
        }
      }

      // Re-align
      await realignSegment({ demoId, chapter: seg.chapter, slide: seg.slide, segmentId: seg.segmentId });
      clearAlignmentCache(demoId);
      const newAlignment = await loadAlignment(demoId);
      onAlignmentFixed?.(newAlignment);

      // Refetch staleness to remove the resolved segment
      await refetch();

      // Play the new audio
      stopPlayback();
      const url = `/audio/${demoId}/${seg.audioRelPath}?t=${Date.now()}`;
      const audio = new Audio(url);
      audioRef.current = audio;
      setPlayingKey(seg.key);
      audio.onended = () => setPlayingKey(null);
      audio.onerror = () => setPlayingKey(null);
      audio.play().catch(() => setPlayingKey(null));

    } catch (err: unknown) {
      setSegmentErrors(prev => ({ ...prev, [seg.key]: err instanceof Error ? err.message : 'Error' }));
    } finally {
      setRegeneratingKey(null);
    }
  };

  const handleEditSingle = (seg: ChangedSegmentDetail) => {
    stopPlayback();
    setEditingSegment(seg);
    setHiddenForEdit(true);
  };

  const handleEditClose = async () => {
    setEditingSegment(null);
    setHiddenForEdit(false);
    await refetch();
    // Refresh alignment data
    clearAlignmentCache(demoId);
    const newAlignment = await loadAlignment(demoId);
    onAlignmentFixed?.(newAlignment);
  };

  // ── Render ───────────────────────────────────────────────────────

  // Render the NarrationEditModal when editing from staleness panel
  const editModal = editingSegment && (
    <AnimatePresence>
      <NarrationEditModal
        slideKey={`Ch${editingSegment.chapter}:S${editingSegment.slide}`}
        segmentId={editingSegment.segmentId}
        currentText={editingSegment.currentText}
        apiAvailable={apiAvailable}
        demoId={demoId}
        chapter={editingSegment.chapter}
        slide={editingSegment.slide}
        segmentIndex={editingSegment.segmentIndex}
        instruct={resolveInstruct(allSlides, editingSegment.chapter, editingSegment.slide, editingSegment.segmentId, demoInstruct)}
        allSlides={allSlides}
        onAcceptAudio={(filePath, timestamp) => {
          const slideComp = allSlides.find(
            s => s.metadata.chapter === editingSegment.chapter && s.metadata.slide === editingSegment.slide,
          );
          if (slideComp) {
            const segMeta = slideComp.metadata.audioSegments[editingSegment.segmentIndex];
            if (segMeta) {
              const basePath = (segMeta.audioFilePath ?? '').split('?')[0];
              segMeta.audioFilePath = `${basePath}?t=${timestamp}`;
            }
          }
        }}
        onTextSaved={() => {
          // Text saved to narration.json — will be picked up on refetch
        }}
        onInstructChanged={(newInstruct) => {
          const slideComp = allSlides.find(
            s => s.metadata.chapter === editingSegment.chapter && s.metadata.slide === editingSegment.slide,
          );
          if (slideComp) {
            const segMeta = slideComp.metadata.audioSegments[editingSegment.segmentIndex];
            if (segMeta) {
              segMeta.instruct = newInstruct;
            }
          }
        }}
        onCancel={handleEditClose}
      />
    </AnimatePresence>
  );

  // When hidden for edit, only render the modal
  if (hiddenForEdit) {
    return createPortal(<>{editModal}</>, document.body);
  }

  const truncate = (text: string, max: number) =>
    text.length > max ? text.substring(0, max) + '...' : text;

  return createPortal(
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10001,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{
          background: '#1e1e1e',
          border: '2px solid #e6a700',
          borderRadius: 12,
          padding: '24px 32px',
          maxWidth: 640,
          width: '90%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '16px', flexShrink: 0 }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>
              <span aria-hidden="true">&#9888;</span>
            </div>
            <h3 style={{
              color: '#f0d060',
              fontSize: '18px',
              fontWeight: 700,
              margin: '0 0 6px',
            }}>
              Stale Narration Data
            </h3>
            <p style={{
              color: '#bbb',
              fontSize: '13px',
              margin: 0,
              lineHeight: 1.4,
            }}>
              {summaryParts.join(', ')}
            </p>
          </div>

          {/* Scrollable segment list */}
          {staleness.changedSegments.length > 0 && (
            <div style={{
              flex: 1,
              overflowY: 'auto',
              marginBottom: '16px',
              borderTop: '1px solid #333',
              paddingTop: '12px',
            }}>
              <div style={{
                color: '#999',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
              }}>
                Changed Segments ({staleness.changedSegments.length})
              </div>

              {staleness.changedSegments.map(seg => {
                const isNew = !seg.cachedText;
                const isPlaying = playingKey === seg.key;
                const isRegenerating = regeneratingKey === seg.key;
                const errMsg = segmentErrors[seg.key];
                const bulkStatus = bulkProgress?.[seg.key];
                const isBusy = fixing || !!regeneratingKey || isBulkRunning;

                // During bulk regen, show progress badge instead of NEW/CHANGED
                const statusBadge = bulkStatus === 'generating' ? (
                  <span style={{
                    background: 'rgba(251, 191, 36, 0.2)',
                    color: '#fbbf24',
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 4,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      border: '1.5px solid rgba(251, 191, 36, 0.3)',
                      borderTop: '1.5px solid #fbbf24',
                      borderRadius: '50%',
                      animation: 'staleness-spin 0.8s linear infinite',
                    }} />
                    TTS
                  </span>
                ) : bulkStatus === 'saved' ? (
                  <span style={{
                    background: 'rgba(148, 163, 184, 0.15)',
                    color: '#94a3b8',
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 4,
                    flexShrink: 0,
                  }}>
                    SAVED
                  </span>
                ) : bulkStatus === 'aligning' ? (
                  <span style={{
                    background: 'rgba(0, 183, 195, 0.15)',
                    color: '#00b7c3',
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 4,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      border: '1.5px solid rgba(0, 183, 195, 0.3)',
                      borderTop: '1.5px solid #00b7c3',
                      borderRadius: '50%',
                      animation: 'staleness-spin 0.8s linear infinite',
                    }} />
                    ALIGN
                  </span>
                ) : bulkStatus === 'done' ? (
                  <span style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#22c55e',
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 4,
                    flexShrink: 0,
                  }}>
                    DONE
                  </span>
                ) : bulkStatus === 'error' ? (
                  <span style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 4,
                    flexShrink: 0,
                  }}>
                    ERROR
                  </span>
                ) : isNew ? (
                  <span style={{
                    background: 'rgba(96, 165, 250, 0.15)',
                    color: '#60a5fa',
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 4,
                    flexShrink: 0,
                  }}>
                    NEW
                  </span>
                ) : (
                  <span style={{
                    background: 'rgba(251, 191, 36, 0.15)',
                    color: '#fbbf24',
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 4,
                    flexShrink: 0,
                  }}>
                    CHANGED
                  </span>
                );

                return (
                  <div key={seg.key} style={{
                    background: bulkStatus === 'done' ? '#1a2e1a' : '#262626',
                    borderRadius: 8,
                    padding: '10px 12px',
                    marginBottom: '6px',
                    border: `1px solid ${bulkStatus === 'done' ? '#2d4a2d' : '#333'}`,
                    opacity: bulkStatus === 'done' ? 0.7 : 1,
                  }}>
                    {/* Segment header row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: errMsg ? '4px' : '0',
                    }}>
                      {/* Label */}
                      <span style={{
                        color: '#e0e0e0',
                        fontSize: '13px',
                        fontWeight: 600,
                        fontFamily: 'monospace',
                        flex: 1,
                        minWidth: 0,
                      }}>
                        {seg.key}
                      </span>

                      {/* Status badge */}
                      {statusBadge}

                      {/* Play button — hidden during bulk */}
                      {seg.audioExists && !isBulkRunning && (
                        <button
                          onClick={() => handlePlay(seg)}
                          disabled={isRegenerating}
                          title={isPlaying ? 'Stop' : 'Play current audio'}
                          style={{
                            background: isPlaying ? 'rgba(0, 183, 195, 0.2)' : 'transparent',
                            border: `1px solid ${isPlaying ? '#00b7c3' : '#555'}`,
                            color: isPlaying ? '#00b7c3' : '#aaa',
                            borderRadius: 6,
                            padding: '3px 8px',
                            fontSize: '13px',
                            cursor: isRegenerating ? 'not-allowed' : 'pointer',
                            opacity: isRegenerating ? 0.4 : 1,
                            flexShrink: 0,
                          }}
                        >
                          {isPlaying ? '\u23F9' : '\u25B6'}
                        </button>
                      )}

                      {/* Regen button — hidden during bulk */}
                      {!isBulkRunning && (
                        <button
                          onClick={() => handleRegenSingle(seg)}
                          disabled={isBusy}
                          title="Regenerate this segment"
                          style={{
                            background: isRegenerating ? '#444' : 'transparent',
                            border: `1px solid ${isRegenerating ? '#555' : '#e6a700'}`,
                            color: isRegenerating ? '#999' : '#e6a700',
                            borderRadius: 6,
                            padding: '3px 8px',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: isBusy ? 'wait' : 'pointer',
                            opacity: isBusy ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            flexShrink: 0,
                          }}
                        >
                          {isRegenerating && (
                            <span style={{
                              display: 'inline-block',
                              width: 10,
                              height: 10,
                              border: '2px solid rgba(150, 150, 150, 0.3)',
                              borderTop: '2px solid #999',
                              borderRadius: '50%',
                              animation: 'staleness-spin 0.8s linear infinite',
                            }} />
                          )}
                          {isRegenerating ? 'Regen...' : 'Regen'}
                        </button>
                      )}

                      {/* Edit button — hidden during bulk */}
                      {!isBulkRunning && (
                        <button
                          onClick={() => handleEditSingle(seg)}
                          disabled={isBusy}
                          title="Open edit modal for this segment"
                          style={{
                            background: 'transparent',
                            border: '1px solid #555',
                            color: '#aaa',
                            borderRadius: 6,
                            padding: '3px 8px',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: isBusy ? 'not-allowed' : 'pointer',
                            opacity: isBusy ? 0.5 : 1,
                            flexShrink: 0,
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {/* Text preview — hide when done during bulk to reduce noise */}
                    {bulkStatus !== 'done' && (
                      <div style={{
                        color: '#888',
                        fontSize: '11px',
                        lineHeight: 1.4,
                        marginTop: '4px',
                      }}>
                        {truncate(seg.currentText, 120)}
                      </div>
                    )}

                    {/* Error message */}
                    {errMsg && (
                      <div style={{
                        color: '#ef4444',
                        fontSize: '11px',
                        marginTop: '4px',
                      }}>
                        {errMsg}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Batch mode checkbox */}
          {!isBulkRunning && staleness.changedSegments.length > 1 && (
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#999',
              fontSize: '12px',
              cursor: 'pointer',
              justifyContent: 'center',
              marginBottom: '10px',
              flexShrink: 0,
            }}>
              <input
                type="checkbox"
                checked={batchMode}
                onChange={e => setBatchMode(e.target.checked)}
                style={{ accentColor: '#e6a700', cursor: 'pointer' }}
              />
              Batch TTS (all segments in one GPU call)
            </label>
          )}

          {/* Progress phase indicator during bulk regen */}
          {bulkPhase && (
            <div style={{
              textAlign: 'center',
              color: '#bbb',
              fontSize: '12px',
              marginBottom: '10px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              <span style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                border: '2px solid rgba(230, 167, 0, 0.3)',
                borderTop: '2px solid #e6a700',
                borderRadius: '50%',
                animation: 'staleness-spin 0.8s linear infinite',
              }} />
              {bulkPhase}
            </div>
          )}

          {/* Bottom action buttons */}
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <button
              onClick={handleRegenerateAll}
              disabled={isBulkRunning || fixing || !!regeneratingKey}
              style={{
                background: (isBulkRunning || fixing) ? '#444' : '#e6a700',
                color: (isBulkRunning || fixing) ? '#999' : '#111',
                border: 'none',
                borderRadius: 8,
                padding: '8px 20px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: (isBulkRunning || fixing) ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {isBulkRunning ? 'Regenerating...' : 'Regenerate All'}
            </button>

            <button
              onClick={dismiss}
              disabled={isBulkRunning}
              style={{
                background: 'transparent',
                color: '#999',
                border: '1px solid #555',
                borderRadius: 8,
                padding: '8px 20px',
                fontSize: '14px',
                cursor: isBulkRunning ? 'not-allowed' : 'pointer',
                opacity: isBulkRunning ? 0.5 : 1,
              }}
            >
              Dismiss
            </button>
          </div>
        </div>

        <style>{`
          @keyframes staleness-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>

      {editModal}
    </>,
    document.body
  );
};
