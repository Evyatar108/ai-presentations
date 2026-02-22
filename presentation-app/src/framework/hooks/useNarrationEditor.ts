import { useState, useCallback } from 'react';
import type { SlideComponentWithMetadata } from '../slides/SlideMetadata';
import { hasAudioSegments } from '../slides/SlideMetadata';
interface EditingSegment {
  slideKey: string;
  segmentId: string;
  segmentIndex: number;
  chapter: number;
  slide: number;
  currentText: string;
}

export interface UseNarrationEditorOptions {
  allSlides: SlideComponentWithMetadata[];
  currentIndex: number;
  currentSegmentIndex: number;
}

export interface UseNarrationEditorResult {
  showEditModal: boolean;
  editingSegment: EditingSegment | null;
  handleEditNarration: () => void;
  handleCancelEdit: () => void;
  /** Called after the modal saves text or accepts audio — updates in-memory narration */
  handleTextSaved: (newText: string) => void;
  /** Called after the modal accepts audio — updates the audioFilePath in-memory */
  handleAcceptAudio: (filePath: string, timestamp: number) => void;
}

export function useNarrationEditor({
  allSlides,
  currentIndex,
  currentSegmentIndex,
}: UseNarrationEditorOptions): UseNarrationEditorResult {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState<EditingSegment | null>(null);

  // Open the edit modal
  const handleEditNarration = useCallback(() => {
    if (currentIndex >= allSlides.length) return;
    const slideMeta = allSlides[currentIndex].metadata;
    const slideKey = `Ch${slideMeta.chapter}:S${slideMeta.slide}`;

    if (!hasAudioSegments(slideMeta) || slideMeta.audioSegments.length === 0) return;

    const segment = slideMeta.audioSegments[currentSegmentIndex];
    if (!segment) return;

    setEditingSegment({
      slideKey,
      segmentId: segment.id,
      segmentIndex: currentSegmentIndex,
      chapter: slideMeta.chapter,
      slide: slideMeta.slide,
      currentText: segment.narrationText || '',
    });
    setShowEditModal(true);
  }, [currentIndex, currentSegmentIndex, allSlides]);

  // After text is saved in the modal, update in-memory segment text.
  // NOTE: This intentionally mutates the shared metadata singleton.
  // Slide metadata objects are module-level globals (loaded once from SlidesRegistry)
  // and persist across re-renders. Mutation is the correct pattern here — it ensures
  // subsequent reads (e.g., re-opening the modal) see the updated text without
  // requiring a full state management system for dev-mode editing.
  const handleTextSaved = useCallback((newText: string) => {
    if (!editingSegment) return;
    if (currentIndex >= allSlides.length) return;
    const slideMeta = allSlides[currentIndex].metadata;
    const segment = slideMeta.audioSegments[editingSegment.segmentIndex];
    if (segment) {
      segment.narrationText = newText;
    }
  }, [editingSegment, currentIndex, allSlides]);

  // After audio is accepted, update the audioFilePath with cache-busting timestamp.
  // See handleTextSaved for rationale on intentional metadata mutation.
  const handleAcceptAudio = useCallback((filePath: string, timestamp: number) => {
    if (!editingSegment) return;
    if (currentIndex >= allSlides.length) return;
    const slideMeta = allSlides[currentIndex].metadata;
    const segment = slideMeta.audioSegments[editingSegment.segmentIndex];
    if (segment) {
      const basePath = (segment.audioFilePath ?? '').split('?')[0];
      segment.audioFilePath = `${basePath}?t=${timestamp}`;
    }
  }, [editingSegment, currentIndex, allSlides]);

  const handleCancelEdit = useCallback(() => {
    setShowEditModal(false);
    setEditingSegment(null);
  }, []);

  return {
    showEditModal,
    editingSegment,
    handleEditNarration,
    handleCancelEdit,
    handleTextSaved,
    handleAcceptAudio,
  };
}
