import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../theme/ThemeContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { HoverButton } from './HoverButton';
import { generateTtsPreview } from '../utils/ttsClient';
import {
  saveNarrationToFile,
  realignSegment,
} from '../utils/narrationApiClient';
import { clearAlignmentCache } from '../utils/alignmentLoader';
import type { NarrationData, NarrationSlide } from '../utils/narrationLoader';
import type { SlideComponentWithMetadata } from '../slides/SlideMetadata';

interface AudioPreview {
  id: string;        // "take-1", "take-2", ...
  takeNumber: number;
  servePath: string;  // URL served by Vite (for playback)
  narrationText: string; // text this take was generated from
}

export interface NarrationEditModalProps {
  slideKey: string;
  segmentId: string;
  currentText: string;
  apiAvailable: boolean | null;
  demoId: string;
  chapter: number;
  slide: number;
  segmentIndex: number;
  instruct?: string;
  allSlides: SlideComponentWithMetadata[];
  onAcceptAudio: (filePath: string, timestamp: number) => void;
  onTextSaved: () => void;
  onCancel: () => void;
}

/** Extract marker IDs from narration text */
function extractMarkerIds(text: string): Set<string> {
  const ids = new Set<string>();
  const re = /\{#?([a-zA-Z0-9_-]+)#?\}/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    ids.add(match[1]);
  }
  return ids;
}

export const NarrationEditModal: React.FC<NarrationEditModalProps> = ({
  slideKey,
  segmentId,
  currentText,
  apiAvailable,
  demoId,
  chapter,
  slide,
  segmentIndex,
  instruct,
  allSlides,
  onAcceptAudio,
  onTextSaved,
  onCancel
}) => {
  const theme = useTheme();
  const [text, setText] = useState(currentText);
  const [previews, setPreviews] = useState<AudioPreview[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [savingText, setSavingText] = useState(false);
  const [realigning, setRealigning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, true);

  // Marker validation
  const originalMarkers = useRef(extractMarkerIds(currentText));
  const currentMarkers = extractMarkerIds(text);
  const missingMarkers: string[] = [];
  for (const id of originalMarkers.current) {
    if (!currentMarkers.has(id)) missingMarkers.push(id);
  }

  const isBusy = generatingPreview || accepting || savingText || realigning;
  const hasMarkerError = missingMarkers.length > 0;
  const canGenerate = apiAvailable && !hasMarkerError && !isBusy;
  const canSaveText = apiAvailable && !hasMarkerError && !isBusy;

  // Handle ESC key to close modal, and suppress navigation keys so
  // SlidePlayer / marker nav don't react while the modal is open.
  useEffect(() => {
    const suppressedKeys = new Set([
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      ' ', 'PageUp', 'PageDown',
    ]);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isBusy) {
        onCancel();
        e.stopPropagation();
        return;
      }
      // Block navigation keys from reaching SlidePlayer / marker handlers
      if (suppressedKeys.has(e.key)) {
        e.stopPropagation();
      }
    };
    // Capture phase so we intercept before bubble-phase listeners
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onCancel, isBusy]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current = null;
      }
    };
  }, []);

  // Load existing previews from disk on mount
  useEffect(() => {
    if (!apiAvailable) return;

    const url = `/api/narration/list-previews?demoId=${encodeURIComponent(demoId)}&chapter=${chapter}&slide=${slide}&segmentId=${encodeURIComponent(segmentId)}`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!data.previews || data.previews.length === 0) return;

        const restored: AudioPreview[] = data.previews.map((p: any) => ({
          id: `take-${p.takeNumber}`,
          takeNumber: p.takeNumber,
          servePath: p.servePath,
          narrationText: p.narrationText ?? '',
        }));
        setPreviews(restored);
      })
      .catch(() => { /* ignore */ });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop playback
  const stopPlayback = useCallback(() => {
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current = null;
    }
    setPlayingId(null);
  }, []);

  // Play a preview
  const handlePlay = useCallback((preview: AudioPreview) => {
    stopPlayback();
    const audio = new Audio(preview.servePath + '?t=' + Date.now());
    audioElRef.current = audio;
    setPlayingId(preview.id);
    audio.onended = () => setPlayingId(null);
    audio.onerror = () => setPlayingId(null);
    audio.play().catch(() => setPlayingId(null));
  }, [stopPlayback]);

  // Generate a TTS preview
  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;
    setGeneratingPreview(true);
    setStatusMessage(null);

    try {
      // Step 1: Call TTS server to generate audio
      const result = await generateTtsPreview({
        narrationText: text,
        addPauses: true,
        instruct,
      });

      // Step 2: Save preview to disk
      const saveResp = await fetch('/api/narration/save-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoId, chapter, slide, segmentId,
          audioBase64: result.base64,
          narrationText: text,
        })
      });
      const saveData = await saveResp.json();
      if (!saveData.success) throw new Error(saveData.error || 'Failed to save preview');

      const newPreview: AudioPreview = {
        id: `take-${saveData.takeNumber}`,
        takeNumber: saveData.takeNumber,
        servePath: saveData.servePath,
        narrationText: text,
      };

      setPreviews(prev => [...prev, newPreview]);

    } catch (error: any) {
      setStatusMessage(`Generation failed: ${error.message}`);
    } finally {
      setGeneratingPreview(false);
    }
  }, [canGenerate, text, instruct, demoId, chapter, slide, segmentId]);

  // Build NarrationData from current slides + the edited text
  const buildNarrationData = useCallback((): NarrationData => {
    const data: NarrationData = {
      demoId,
      version: '1.0',
      lastModified: new Date().toISOString(),
      slides: [],
    };
    for (const slideComponent of allSlides) {
      const slideMeta = slideComponent.metadata;
      const slideData: NarrationSlide = {
        chapter: slideMeta.chapter,
        slide: slideMeta.slide,
        title: slideMeta.title,
        segments: [],
      };
      for (const seg of slideMeta.audioSegments) {
        // Use edited text for the current segment
        const isCurrentSegment =
          slideMeta.chapter === chapter &&
          slideMeta.slide === slide &&
          seg.id === segmentId;
        slideData.segments.push({
          id: seg.id,
          narrationText: isCurrentSegment ? text : (seg.narrationText || ''),
          visualDescription: seg.visualDescription || '',
          notes: '',
        });
      }
      data.slides.push(slideData);
    }
    return data;
  }, [demoId, allSlides, chapter, slide, segmentId, text]);

  // Save text only (no audio regeneration)
  const handleSaveTextOnly = useCallback(async () => {
    if (!canSaveText) return;
    setSavingText(true);
    setStatusMessage(null);

    try {
      const narrationData = buildNarrationData();
      await saveNarrationToFile({ demoId, narrationData });
      setStatusMessage('Text saved to narration.json');
      onTextSaved();
    } catch (error: any) {
      setStatusMessage(`Save failed: ${error.message}`);
    } finally {
      setSavingText(false);
    }
  }, [canSaveText, buildNarrationData, demoId, onTextSaved]);

  // Accept a preview take
  const handleAccept = useCallback(async (preview: AudioPreview) => {
    setAccepting(true);
    setStatusMessage(null);
    stopPlayback();

    try {
      // Step 1: Accept the preview (copy to real audio path, delete preview dir)
      const acceptResp = await fetch('/api/narration/accept-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoId, chapter, slide, segmentId, segmentIndex,
          takeNumber: preview.takeNumber,
        })
      });
      const acceptData = await acceptResp.json();
      if (!acceptData.success) throw new Error(acceptData.error || 'Accept failed');

      // Step 2: Save narration text
      const narrationData = buildNarrationData();
      await saveNarrationToFile({ demoId, narrationData });

      // Step 3: Trigger re-alignment
      setRealigning(true);
      setStatusMessage('Realigning markers...');
      const alignResult = await realignSegment({ demoId, chapter, slide, segmentId });
      if (!alignResult.success) {
        console.warn('[NarrationEditModal] Realignment failed:', alignResult.error);
        setStatusMessage('Audio accepted. Warning: marker realignment failed.');
      }

      // Step 4: Clear alignment cache so next load fetches fresh data
      clearAlignmentCache(demoId);

      // Notify parent
      onAcceptAudio(acceptData.filePath, acceptData.timestamp);
      onTextSaved();
      onCancel(); // Close modal

    } catch (error: any) {
      setStatusMessage(`Accept failed: ${error.message}`);
    } finally {
      setAccepting(false);
      setRealigning(false);
    }
  }, [demoId, chapter, slide, segmentId, segmentIndex, stopPlayback, buildNarrationData, onAcceptAudio, onTextSaved, onCancel]);

  // Spinner keyframes
  const spinnerCSS = `
    @keyframes narration-modal-spin {
      to { transform: rotate(360deg); }
    }
    @media (prefers-reduced-motion: reduce) {
      * { animation: none !important; }
    }
  `;

  const Spinner: React.FC<{ size?: number }> = ({ size = 14 }) => (
    <span style={{
      display: 'inline-block',
      width: size,
      height: size,
      border: '2px solid transparent',
      borderTopColor: 'currentColor',
      borderRadius: '50%',
      animation: 'narration-modal-spin 0.8s linear infinite',
      verticalAlign: 'middle',
    }} />
  );

  return (
    <motion.div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="narration-edit-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        fontFamily: theme.fontFamily
      }}
      onClick={!isBusy ? onCancel : undefined}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.colors.bgSurface,
          borderRadius: 12,
          padding: '2rem',
          width: '90%',
          maxWidth: 650,
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}
      >
        <h2 id="narration-edit-title" style={{
          color: theme.colors.textPrimary,
          marginBottom: '1rem',
          fontSize: 20,
          fontWeight: 600
        }}>
          Edit Narration - {slideKey}:{segmentId}
        </h2>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isBusy}
          autoFocus
          style={{
            width: '100%',
            minHeight: 150,
            padding: '1rem',
            background: theme.colors.bgDeep,
            color: theme.colors.textPrimary,
            border: `1px solid ${hasMarkerError ? 'rgba(239, 68, 68, 0.6)' : 'rgba(148, 163, 184, 0.3)'}`,
            borderRadius: 8,
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: theme.fontFamily,
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            opacity: isBusy ? 0.6 : 1
          }}
        />

        <div style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: '0.5rem' }}>
          Character count: {text.length}
        </div>

        {/* API warning banner (only shown when unavailable) */}
        {!apiAvailable && (
          <div style={{
            background: 'rgba(251, 146, 60, 0.1)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            borderRadius: 6,
            padding: '0.5rem 0.75rem',
            marginTop: '0.75rem',
            color: theme.colors.warning,
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>{'\u26A0'}</span>
            <span>API unavailable {'\u2014'} edits are session-only</span>
          </div>
        )}

        {/* Marker validation error */}
        {hasMarkerError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 6,
            padding: '0.75rem',
            marginTop: '0.75rem',
            color: theme.colors.error,
            fontSize: 13,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <span style={{ flexShrink: 0, marginTop: 1 }}>&#x26D4;</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                Missing markers
              </div>
              <div style={{ fontSize: 12 }}>
                {missingMarkers.map(id => `{#${id}}`).join(', ')}
              </div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: '0.25rem' }}>
                Restore the missing marker tokens or undo (Ctrl+Z) to re-enable actions.
              </div>
            </div>
          </div>
        )}

        {/* Status message */}
        {statusMessage && (
          <div style={{
            background: 'rgba(148, 163, 184, 0.1)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: 6,
            padding: '0.5rem 0.75rem',
            marginTop: '0.75rem',
            color: theme.colors.textSecondary,
            fontSize: 12,
          }}>
            {statusMessage}
          </div>
        )}

        {/* Previews list */}
        {previews.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ color: theme.colors.textSecondary, fontSize: 13, fontWeight: 600, marginBottom: '0.5rem' }}>
              Audio Previews
            </div>
            {previews.map(preview => {
              const isStale = preview.narrationText !== text;
              return (
                <div
                  key={preview.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    marginBottom: '0.25rem',
                    background: playingId === preview.id ? 'rgba(0, 183, 195, 0.1)' : 'rgba(148, 163, 184, 0.05)',
                    borderRadius: 6,
                    border: `1px solid ${playingId === preview.id ? 'rgba(0, 183, 195, 0.3)' : 'rgba(148, 163, 184, 0.1)'}`,
                  }}
                >
                  {/* Play/Stop toggle */}
                  <HoverButton
                    onClick={() => playingId === preview.id ? stopPlayback() : handlePlay(preview)}
                    disabled={isBusy}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: theme.colors.primary,
                      cursor: 'pointer',
                      padding: '0.25rem 0.5rem',
                      fontSize: 16,
                      borderRadius: 4,
                      flexShrink: 0,
                    }}
                    hoverStyle={{ background: 'rgba(0, 183, 195, 0.15)' }}
                  >
                    {playingId === preview.id ? '\u23F9' : '\u25B6'}
                  </HoverButton>

                  {/* Label */}
                  <span style={{ color: theme.colors.textPrimary, fontSize: 13, flex: 1 }}>
                    Take {preview.takeNumber}
                    {isStale && (
                      <span style={{ color: theme.colors.warning, fontSize: 11, marginLeft: '0.5rem' }}>
                        (different text)
                      </span>
                    )}
                  </span>

                  {/* Load text button — restores the text this take was generated from */}
                  {isStale && (
                    <HoverButton
                      onClick={() => setText(preview.narrationText)}
                      disabled={isBusy}
                      title="Load the narration text this take was generated from"
                      style={{
                        background: 'transparent',
                        border: `1px solid ${theme.colors.warning}`,
                        color: theme.colors.warning,
                        padding: '0.25rem 0.6rem',
                        borderRadius: 5,
                        fontSize: 11,
                        fontWeight: 500,
                        cursor: isBusy ? 'not-allowed' : 'pointer',
                        opacity: isBusy ? 0.5 : 1,
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                      }}
                      hoverStyle={{ background: 'rgba(251, 146, 60, 0.1)' }}
                    >
                      Load text
                    </HoverButton>
                  )}

                  {/* Accept button */}
                  <HoverButton
                    onClick={() => handleAccept(preview)}
                    disabled={isBusy || isStale}
                    style={{
                      background: isStale ? 'rgba(148, 163, 184, 0.2)' : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                      color: isStale ? theme.colors.textMuted : '#fff',
                      border: 'none',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: (isBusy || isStale) ? 'not-allowed' : 'pointer',
                      opacity: (isBusy || isStale) ? 0.5 : 1,
                      flexShrink: 0,
                    }}
                    hoverStyle={{ opacity: 0.9 }}
                  >
                    {accepting ? <><Spinner size={12} /> Accepting...</> : 'Accept'}
                  </HoverButton>
                </div>
              );
            })}
          </div>
        )}

        {/* Realigning indicator */}
        {realigning && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.75rem',
            color: theme.colors.primary,
            fontSize: 13,
          }}>
            <Spinner size={14} />
            <span>Realigning markers...</span>
          </div>
        )}

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginTop: '1.5rem',
          justifyContent: 'flex-end',
          flexWrap: 'wrap'
        }}>
          {/* Cancel */}
          <HoverButton
            onClick={onCancel}
            disabled={isBusy}
            style={{
              background: 'transparent',
              border: `1px solid ${theme.colors.borderSubtle}`,
              color: theme.colors.textSecondary,
              padding: '0.75rem 1.25rem',
              borderRadius: 8,
              cursor: isBusy ? 'not-allowed' : 'pointer',
              opacity: isBusy ? 0.5 : 1,
              fontSize: 14,
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
            hoverStyle={{
              borderColor: theme.colors.textMuted,
              color: theme.colors.textPrimary,
            }}
          >
            Cancel
          </HoverButton>

          {/* Save Text Only */}
          <HoverButton
            onClick={handleSaveTextOnly}
            disabled={!canSaveText}
            style={{
              background: 'transparent',
              border: `1px solid ${theme.colors.primary}`,
              color: theme.colors.primary,
              padding: '0.75rem 1.25rem',
              borderRadius: 8,
              cursor: !canSaveText ? 'not-allowed' : 'pointer',
              opacity: !canSaveText ? 0.5 : 1,
              fontSize: 14,
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
            hoverStyle={{ background: 'rgba(0, 183, 195, 0.1)' }}
          >
            {savingText ? <><Spinner /> Saving...</> : 'Save Text Only'}
          </HoverButton>

          {/* Generate TTS */}
          <HoverButton
            onClick={handleGenerate}
            disabled={!canGenerate}
            style={{
              background: !canGenerate
                ? 'rgba(148, 163, 184, 0.2)'
                : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              color: !canGenerate ? theme.colors.textMuted : '#fff',
              border: 'none',
              padding: '0.75rem 1.25rem',
              borderRadius: 8,
              cursor: !canGenerate ? 'not-allowed' : 'pointer',
              opacity: !canGenerate ? 0.6 : 1,
              fontSize: 14,
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
            hoverStyle={{ opacity: 0.9 }}
          >
            {generatingPreview ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Spinner />
                Generating...
              </span>
            ) : (
              'Generate TTS'
            )}
          </HoverButton>
        </div>

        <style>{spinnerCSS}</style>
      </motion.div>
    </motion.div>
  );
};
