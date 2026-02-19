import { useState, useCallback } from 'react';
import type { SlideComponentWithMetadata, SlideMetadata } from '../slides/SlideMetadata';
import { hasAudioSegments } from '../slides/SlideMetadata';
import type { DemoMetadata } from '../demos/types';
import { regenerateSegment, checkTTSServerHealth } from '../utils/ttsClient';
import {
  saveNarrationToFile,
  updateNarrationCache,
  hashText,
} from '../utils/narrationApiClient';
import { NarrationData, NarrationSlide } from '../utils/narrationLoader';

interface NarrationEdit {
  slideKey: string;
  segmentIndex: number;
  originalText: string;
  editedText: string;
  timestamp: number;
}

interface EditingSegment {
  slideKey: string;
  segmentId: string;
  currentText: string;
}

export interface UseNarrationEditorOptions {
  demoMetadata: DemoMetadata;
  allSlides: SlideComponentWithMetadata[];
  currentIndex: number;
  currentSegmentIndex: number;
  audioEnabled: boolean;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  apiAvailable: boolean | null;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  showWarning: (msg: string) => void;
  loadAudioWithFallback: (path: string, id: string) => Promise<HTMLAudioElement>;
}

export interface UseNarrationEditorResult {
  showEditModal: boolean;
  editingSegment: EditingSegment | null;
  isRegeneratingAudio: boolean;
  regenerationError: string | null;
  handleEditNarration: () => void;
  handleSaveNarration: (newText: string, regenerateAudio: boolean) => Promise<void>;
  handleCancelEdit: () => void;
}

export function useNarrationEditor({
  demoMetadata,
  allSlides,
  currentIndex,
  currentSegmentIndex,
  audioEnabled,
  audioRef,
  apiAvailable,
  showSuccess,
  showError,
  showWarning,
  loadAudioWithFallback,
}: UseNarrationEditorOptions): UseNarrationEditorResult {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState<EditingSegment | null>(null);
  const [isRegeneratingAudio, setIsRegeneratingAudio] = useState(false);
  const [regenerationError, setRegenerationError] = useState<string | null>(null);
  const [_isSaving, setIsSaving] = useState(false);
  const [narrationEdits, setNarrationEdits] = useState<Map<string, NarrationEdit>>(new Map());

  // Build NarrationData from in-memory edits
  const buildNarrationDataFromEdits = useCallback((): NarrationData => {
    const data: NarrationData = {
      demoId: demoMetadata.id,
      version: '1.0',
      lastModified: new Date().toISOString(),
      slides: [],
    };
    for (const slideComponent of allSlides) {
      const slide = slideComponent.metadata;
      const slideKey = `Ch${slide.chapter}:S${slide.slide}`;
      const slideData: NarrationSlide = {
        chapter: slide.chapter,
        slide: slide.slide,
        title: slide.title,
        segments: [],
      };
      for (let idx = 0; idx < slide.audioSegments.length; idx++) {
        const segment = slide.audioSegments[idx];
        const editKey = `${slideKey}:${idx}`;
        const edit = narrationEdits.get(editKey);
        slideData.segments.push({
          id: segment.id,
          narrationText: edit?.editedText || segment.narrationText || '',
          visualDescription: segment.visualDescription || '',
          notes: '',
        });
      }
      data.slides.push(slideData);
    }
    return data;
  }, [demoMetadata.id, allSlides, narrationEdits]);

  // Regenerate TTS audio for a segment
  const regenerateSegmentAudio = useCallback(async (
    slide: SlideMetadata,
    segmentIndex: number,
    newText: string,
  ): Promise<boolean> => {
    setIsRegeneratingAudio(true);
    setRegenerationError(null);

    try {
      const health = await checkTTSServerHealth();
      if (!health.available) {
        throw new Error(health.error || 'TTS server is not available');
      }

      const segment = slide.audioSegments[segmentIndex];
      const result = await regenerateSegment({
        chapter: slide.chapter,
        slide: slide.slide,
        segmentIndex,
        segmentId: segment.id,
        narrationText: newText,
        addPauses: true,
      });

      if (!result.success) {
        throw new Error(result.error || 'Audio regeneration failed');
      }

      // Update audio path with cache-busting timestamp
      const timestamp = result.timestamp || Date.now();
      const basePath = segment.audioFilePath.split('?')[0];
      segment.audioFilePath = `${basePath}?t=${timestamp}`;

      // If audio is playing this segment, reload it
      if (audioEnabled && currentSegmentIndex === segmentIndex) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        const audio = await loadAudioWithFallback(segment.audioFilePath, segment.id);
        audioRef.current = audio;
        if (audioEnabled) {
          await audio.play();
        }
      }

      setIsRegeneratingAudio(false);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to regenerate audio';
      setRegenerationError(errorMessage);
      setIsRegeneratingAudio(false);
      return false;
    }
  }, [audioEnabled, audioRef, currentSegmentIndex, loadAudioWithFallback]);

  // Open the edit modal
  const handleEditNarration = useCallback(() => {
    if (currentIndex >= allSlides.length) return;
    const slide = allSlides[currentIndex].metadata;
    const slideKey = `Ch${slide.chapter}:S${slide.slide}`;

    if (!hasAudioSegments(slide) || slide.audioSegments.length === 0) return;

    const segment = slide.audioSegments[currentSegmentIndex];
    if (!segment) return;

    const editKey = `${slideKey}:${currentSegmentIndex}`;
    const existingEdit = narrationEdits.get(editKey);

    setEditingSegment({
      slideKey,
      segmentId: segment.id,
      currentText: existingEdit?.editedText || segment.narrationText || '',
    });
    setShowEditModal(true);
  }, [currentIndex, currentSegmentIndex, allSlides, narrationEdits]);

  // Save edited narration
  const handleSaveNarration = useCallback(async (newText: string, regenerateAudioFlag: boolean) => {
    if (!editingSegment) return;

    const slide = allSlides[currentIndex].metadata;
    const segment = slide.audioSegments[currentSegmentIndex];
    if (!segment) {
      showError('Cannot save: invalid segment');
      return;
    }

    setIsSaving(true);

    try {
      const editKey = `${editingSegment.slideKey}:${currentSegmentIndex}`;
      const edit: NarrationEdit = {
        slideKey: editingSegment.slideKey,
        segmentIndex: currentSegmentIndex,
        originalText: segment.narrationText || '',
        editedText: newText,
        timestamp: Date.now(),
      };

      setNarrationEdits(prev => {
        const updated = new Map(prev);
        updated.set(editKey, edit);
        return updated;
      });

      segment.narrationText = newText;

      // Persist via API if available
      if (apiAvailable) {
        try {
          const narrationData = buildNarrationDataFromEdits();
          const result = await saveNarrationToFile({ demoId: demoMetadata.id, narrationData });
          if (result.success) {
            showSuccess('Narration saved to file!');
          }
        } catch {
          showError('Failed to save to file (in-memory edit still applied)');
        }
      } else {
        showWarning('Edit saved in memory only (backend API unavailable)');
      }

      // Regenerate audio if requested
      if (regenerateAudioFlag) {
        const success = await regenerateSegmentAudio(slide, currentSegmentIndex, newText);
        if (!success) {
          setIsSaving(false);
          return;
        }

        // Update narration cache after regeneration
        if (apiAvailable) {
          try {
            const hash = await hashText(newText);
            await updateNarrationCache({
              demoId: demoMetadata.id,
              segment: { key: editKey, hash, timestamp: new Date().toISOString() },
            });
          } catch {
            // Non-fatal
          }
        }
      }

      setShowEditModal(false);
      setEditingSegment(null);
      setRegenerationError(null);
    } catch {
      showError('Save failed unexpectedly');
    } finally {
      setIsSaving(false);
    }
  }, [editingSegment, allSlides, currentIndex, currentSegmentIndex, apiAvailable, demoMetadata.id, buildNarrationDataFromEdits, showSuccess, showError, showWarning, regenerateSegmentAudio]);

  const handleCancelEdit = useCallback(() => {
    setShowEditModal(false);
    setEditingSegment(null);
  }, []);

  return {
    showEditModal,
    editingSegment,
    isRegeneratingAudio,
    regenerationError,
    handleEditNarration,
    handleSaveNarration,
    handleCancelEdit,
  };
}
