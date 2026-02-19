import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hasAudioSegments, SlideComponentWithMetadata } from '../slides/SlideMetadata';
import { useSegmentContext } from '../contexts/SegmentContext';
import type { DemoMetadata } from '../demos/types';
import { resolveTimingConfig, TimingConfig } from '../demos/timing/types';
import { NarrationEditModal } from './NarrationEditModal';
import { regenerateSegment, checkTTSServerHealth } from '../utils/ttsClient';
import {
  checkApiHealth,
  saveNarrationToFile,
  updateNarrationCache,
  hashText
} from '../utils/narrationApiClient';
import { NarrationData, NarrationSlide } from '../utils/narrationLoader';
import { getConfig } from '../config';
import { useTheme } from '../theme/ThemeContext';

// Fallback audio file for missing segments
const getFallbackAudio = () => getConfig().fallbackAudioPath;

// Helper to load audio with fallback
const loadAudioWithFallback = async (primaryPath: string, segmentId: string): Promise<HTMLAudioElement> => {
  const audio = new Audio(primaryPath);
  
  return new Promise((resolve) => {
    const handleError = () => {
      console.warn(`[Audio] File not found: ${primaryPath}, using fallback silence for segment: ${segmentId}`);
      // Create fallback audio
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

export interface NarratedControllerProps {
  demoMetadata: DemoMetadata;
  demoTiming?: TimingConfig;
  slides: SlideComponentWithMetadata[];
  onSlideChange: (chapter: number, slide: number) => void;
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
  manualSlideChange?: { chapter: number; slide: number } | null;
}

export const NarratedController: React.FC<NarratedControllerProps> = ({
  demoMetadata,
  demoTiming,
  slides,
  onSlideChange,
  onPlaybackStart,
  onPlaybackEnd,
  manualSlideChange
}) => {
  const theme = useTheme();
  // Use provided slides or empty array if not loaded yet
  const allSlides = slides || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [_isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStartOverlay, setShowStartOverlay] = useState(true);
  const [hideInterface, setHideInterface] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true); // Audio toggle for manual mode
  const [autoAdvanceOnAudioEnd, setAutoAdvanceOnAudioEnd] = useState(false);
  // Narration editor state (manual mode only)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState<{
    slideKey: string;
    segmentId: string;
    currentText: string;
  } | null>(null);
  const [isRegeneratingAudio, setIsRegeneratingAudio] = useState(false);
  const [regenerationError, setRegenerationError] = useState<string | null>(null);

  // Phase 5: API integration state
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [_isSaving, setIsSaving] = useState(false);
  
  // Notification system (toast messages)
  interface Notification {
    id: number;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationIdRef = useRef(0);

  // Narration edits storage (in-memory, session-only)
  interface NarrationEdit {
    slideKey: string;
    segmentIndex: number;
    originalText: string;
    editedText: string;
    timestamp: number;
  }
  const [narrationEdits, setNarrationEdits] = useState<Map<string, NarrationEdit>>(new Map());

  // Runtime timer (for validating timing calculations)
  const [showRuntimeTimerOption, setShowRuntimeTimerOption] = useState(false);
  const [runtimeStart, setRuntimeStart] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  // Persist final elapsed after presentation completes (so overlay can display it)
  const [finalElapsedSeconds, setFinalElapsedSeconds] = useState<number | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentIndexRef = useRef(currentIndex);
  const lastAutoAdvanceFromIndexRef = useRef<number | null>(null);
  
  // Segment context for multi-segment slides
  const segmentContext = useSegmentContext();

  // Keep ref in sync with state
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Check API health on mount
  useEffect(() => {
    checkApiHealth().then(available => {
      setApiAvailable(available);
      if (available) {
        console.log('[NarratedController] Backend API is available');
      } else {
        console.warn('[NarratedController] Backend API is not available - edits will be session-only');
      }
    });
  }, []);

  // Notification helpers
  const showNotification = useCallback((type: Notification['type'], message: string, duration = 3000) => {
    const id = ++notificationIdRef.current;
    const notification: Notification = { id, type, message };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
  }, []);

  const showSuccessMessage = useCallback((message: string) => showNotification('success', message), [showNotification]);
  const showErrorMessage = useCallback((message: string) => showNotification('error', message, 5000), [showNotification]);
  const showWarningMessage = useCallback((message: string) => showNotification('warning', message, 4000), [showNotification]);
  const showInfoMessage = useCallback((message: string) => showNotification('info', message), [showNotification]);

 // Start / reset runtime timing baseline when narrated playback begins (always, independent of UI option)
 useEffect(() => {
   if (isPlaying) {
     setRuntimeStart(performance.now());
     setElapsedMs(0);
   }
   if (!isPlaying) {
     setRuntimeStart(null);
   }
 }, [isPlaying]);

 // Tick elapsed while narrated playback running
 useEffect(() => {
   if (!isPlaying || !showRuntimeTimerOption || runtimeStart == null) return;
   let rafId: number;
   const tick = () => {
     setElapsedMs(performance.now() - runtimeStart);
     rafId = requestAnimationFrame(tick);
   };
   rafId = requestAnimationFrame(tick);
   return () => cancelAnimationFrame(rafId);
 }, [isPlaying, showRuntimeTimerOption, runtimeStart]);

 // Format seconds -> mm:ss
 const formatMMSS = (totalSeconds: number) => {
   const mins = Math.floor(totalSeconds / 60);
   const secs = Math.floor(totalSeconds % 60);
   return `${mins}:${secs.toString().padStart(2, '0')}`;
 };

 // Color coding for delta vs planned (tolerance bands)
 const deltaColor = (deltaSeconds: number) => {
   const abs = Math.abs(deltaSeconds);
   if (abs <= 2) return '#22c55e';       // ±2s green
   if (abs <= 5) return '#f59e0b';       // ±5s amber
   return '#ef4444';                     // >5s red
 };

  // Advance to next slide (narrated mode)
  const advanceSlide = useCallback(() => {
    const currentIdx = currentIndexRef.current;
    const nextIndex = currentIdx + 1;
    
    if (nextIndex >= allSlides.length) {
      // Use timing system for afterFinalSlide delay (keep isPlaying TRUE so timer includes final delay)
      const lastSlide = allSlides[allSlides.length - 1].metadata;
      const timing = resolveTimingConfig(
        demoTiming,
        lastSlide.timing
      );

      const plannedTotal = demoMetadata.durationInfo?.total ?? null;

      setTimeout(() => {
        // Compute final elapsed (includes final delay)
        let finalElapsedSec: number | null = null;
        if (runtimeStart != null) {
          finalElapsedSec = (performance.now() - runtimeStart) / 1000;
          setFinalElapsedSeconds(finalElapsedSec);
        }
        // Stop timer now
        setIsPlaying(false);
        // Log final runtime stats
        if (showRuntimeTimerOption && plannedTotal != null && finalElapsedSec != null) {
          const delta = finalElapsedSec - plannedTotal;
          console.log(
            `[RuntimeTimer] Completed presentation. Elapsed=${finalElapsedSec.toFixed(2)}s Planned=${plannedTotal.toFixed(2)}s Δ=${delta.toFixed(2)}s`
          );
        } else if (showRuntimeTimerOption && finalElapsedSec != null) {
          console.log(`[RuntimeTimer] Completed presentation. Elapsed=${finalElapsedSec.toFixed(2)}s (no planned total provided)`);
        }

        // Persist actual runtime for WelcomeScreen & details modal (purge if planned changes later)
        if (finalElapsedSec != null) {
          try {
            const toStore = {
              elapsed: finalElapsedSec,
              plannedTotal: plannedTotal != null ? plannedTotal : finalElapsedSec
            };
            localStorage.setItem(`demoRuntime:${demoMetadata.id}`, JSON.stringify(toStore));
          } catch (e) {
            console.warn('[RuntimeTimer] Persist failed', e);
          }
        }

        setShowStartOverlay(true);
        onPlaybackEnd?.();
      }, timing.afterFinalSlide);
      return;
    }
    
    setCurrentIndex(nextIndex);
  }, [onPlaybackEnd, demoMetadata.durationInfo?.total, showRuntimeTimerOption, runtimeStart, demoTiming, allSlides, demoMetadata.id]);
  // Play audio for current slide in narrated mode (all slides use segments now)
  useEffect(() => {
    if (!isPlaying || currentIndex >= allSlides.length || isManualMode) return;
    
    const currentSlide = allSlides[currentIndex].metadata;
    const slideKey = `Ch${currentSlide.chapter}:U${currentSlide.slide}`;
    
    console.log(`[NarratedController] Playing slide: ${slideKey} with ${currentSlide.audioSegments.length} segment(s)`);
    playSlideSegments(currentSlide, slideKey);
    
    // Update slide display
    onSlideChange(currentSlide.chapter, currentSlide.slide);
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.onplay = null;
        audioRef.current.oncanplaythrough = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentIndex, isManualMode]);
  
  // Play slide segments (all slides use this now)
  const playSlideSegments = useCallback((slideMetadata: typeof allSlides[0]['metadata'], slideKey: string) => {
    const segments = slideMetadata.audioSegments;
    
    if (!segments || segments.length === 0) {
      console.warn(`[NarratedController] No audio segments for ${slideKey}, advancing immediately`);
      setTimeout(advanceSlide, 100);
      return;
    }
    
    // Initialize segment context
    segmentContext.initializeSegments(slideKey, segments);
    
    let currentSegmentIndex = 0;
    
    const playSegment = (segmentIndex: number) => {
      if (segmentIndex >= segments.length) {
        console.log(`[NarratedController] All segments complete for ${slideKey}, advancing to next slide after delay`);
        
        // Use timing system for betweenSlides delay
        const timing = resolveTimingConfig(
          demoTiming,
          slideMetadata.timing
        );
        
        setTimeout(advanceSlide, timing.betweenSlides);
        return;
      }
      
      const segment = segments[segmentIndex];
      console.log(`[NarratedController] Playing segment ${segmentIndex}/${segments.length - 1}: ${segment.id}`);
      
      // Update segment context
      segmentContext.setCurrentSegment(segmentIndex);
      
      // Stop any existing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.onplay = null;
      }
      // Load audio with fallback support
      setIsLoading(true);
      loadAudioWithFallback(segment.audioFilePath, segment.id).then(audio => {
        audioRef.current = audio;
        
        // Setup event handlers
        audio.onended = () => {
          console.log(`[NarratedController] Segment ${segmentIndex} (${segment.id}) ended`);
          setError(null);
          currentSegmentIndex++;
          
          // Use timing system for betweenSegments delay
          const timing = resolveTimingConfig(
            demoTiming,
            slideMetadata.timing,
            segment.timing
          );
          
          setTimeout(() => playSegment(currentSegmentIndex), timing.betweenSegments);
        };
        
        audio.onerror = (e) => {
          console.error(`[NarratedController] Playback error for segment ${segmentIndex} (${segment.id}):`, e);
          setError(`Playback error: ${segment.id}`);
          setIsLoading(false);
          // Skip to next segment after brief delay
          setTimeout(() => {
            setError(null);
            currentSegmentIndex++;
            playSegment(currentSegmentIndex);
          }, 1000);
        };
        
        audio.onplay = () => {
          console.log(`[NarratedController] Segment ${segmentIndex} (${segment.id}) playing`);
          setError(null);
          setIsLoading(false);
        };
        
        audio.oncanplaythrough = () => {
          setIsLoading(false);
        };
        
        // Start playing
        audio.play().catch(err => {
          console.error(`[NarratedController] Segment playback failed for ${segment.id}:`, err);
          setError(`Playback failed: ${segment.id}`);
          setIsLoading(false);
        });
      });
    };
    
    // Start with first segment
    playSegment(0);
  }, [advanceSlide, segmentContext]);

  // Start narrated playback
  const handleStart = () => {
    if (allSlides.length === 0) {
      setError('No slides to play');
      return;
    }
    
    setFinalElapsedSeconds(null);
    setShowStartOverlay(false);
    setIsPlaying(true);
    setIsManualMode(false);
    setCurrentIndex(0);
    onPlaybackStart?.();
  };

  // Start unified manual mode (with audio enabled by default)
  const handleManualMode = () => {
    if (allSlides.length === 0) {
      setError('No slides to play');
      return;
    }
    
    setFinalElapsedSeconds(null);
    setShowStartOverlay(false);
    setIsPlaying(false);
    setIsManualMode(true);
    setAudioEnabled(true); // Start with audio enabled by default
    setCurrentIndex(0);
    onSlideChange(allSlides[0].metadata.chapter, allSlides[0].metadata.slide);
  };

  // Initialize segments when slide changes in manual mode with audio
  useEffect(() => {
    if (!isManualMode || !audioEnabled || currentIndex >= allSlides.length) return;
    
    const slide = allSlides[currentIndex].metadata;
    const slideKey = `Ch${slide.chapter}:S${slide.slide}`;
    
    if (!hasAudioSegments(slide) || slide.audioSegments.length === 0) return;
    
    // Initialize segment context (resets to segment 0) - only when slide changes
    console.log(`[Manual] Initializing segments for ${slideKey}`);
    segmentContext.initializeSegments(slideKey, slide.audioSegments);
  }, [currentIndex, isManualMode, audioEnabled]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Play audio for current segment in manual mode (when audio enabled)
  useEffect(() => {
    if (!isManualMode || !audioEnabled || currentIndex >= allSlides.length) return;
    
    const slide = allSlides[currentIndex].metadata;
    const currentSegmentIdx = segmentContext.currentSegmentIndex;
    
    if (!hasAudioSegments(slide) || slide.audioSegments.length === 0) return;
    
    const segments = slide.audioSegments;
    const segment = segments[currentSegmentIdx];
    
    if (!segment) {
      console.warn(`[Manual+Audio] Invalid segment index ${currentSegmentIdx}`);
      return;
    }
    
    // Track if this effect is still active
    let isActive = true;
    
    // Load and play segment audio
    loadAudioWithFallback(segment.audioFilePath, segment.id).then(audio => {
      if (!isActive) return; // Effect was cleaned up
      
      audioRef.current = audio;
      audio.onended = () => {
        setError(null);
        
        // Auto-advance logic when enabled
        if (autoAdvanceOnAudioEnd) {
          // Resolve timing configuration for auto-advance delays
          const timing = resolveTimingConfig(
            demoTiming,
            slide.timing,
            segment.timing
          );
          
          // If not on last segment, advance to next segment with betweenSegments delay
          if (currentSegmentIdx < segments.length - 1) {
            console.log(`[Manual+Audio] Auto-advancing to segment ${currentSegmentIdx + 1}`);
            setTimeout(() => {
              segmentContext.nextSegment();
            }, timing.betweenSegments);
          }
          // If on last segment, advance to next slide with betweenSlides delay
          else {
            const nextIndex = currentIndexRef.current + 1;
            if (nextIndex < allSlides.length) {
              console.log(`[Manual] Auto-advancing to next slide ${nextIndex}`);
              setTimeout(() => {
                lastAutoAdvanceFromIndexRef.current = currentIndexRef.current;
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

    // Cleanup when slide or segment changes
    return () => {
      isActive = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.onplay = null;
        audioRef.current = null;
      }
    };
  }, [currentIndex, isManualMode, audioEnabled, autoAdvanceOnAudioEnd, onSlideChange, segmentContext.currentSegmentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Consume external manual slide changes (manual mode)
  useEffect(() => {
    if (!isManualMode || manualSlideChange == null) return;
    const slideIndex = allSlides.findIndex(s =>
      s.metadata.chapter === manualSlideChange.chapter && s.metadata.slide === manualSlideChange.slide
    );
    if (slideIndex === -1) return;

    // Ignore only if this is the specific stale value from just before an auto-advance
    if (lastAutoAdvanceFromIndexRef.current !== null && slideIndex === lastAutoAdvanceFromIndexRef.current) {
      console.log(`[Manual] ignoring stale manualSlideChange=${slideIndex} (pre-auto-advance value)`);
      lastAutoAdvanceFromIndexRef.current = null; // Clear so user can navigate back later
      return;
    }

    if (slideIndex !== currentIndex) {
      console.log('[Manual] applying user navigation to index', slideIndex);
      setCurrentIndex(slideIndex);
      lastAutoAdvanceFromIndexRef.current = null; // Clear flag on manual navigation
    }
  }, [manualSlideChange, isManualMode, currentIndex]);
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
  onPlaybackEnd?.();
};

// Open narration edit modal (manual mode only)
const handleEditNarration = () => {
  if (!isManualMode || currentIndex >= allSlides.length) return;
  
  const slide = allSlides[currentIndex].metadata;
  const slideKey = `Ch${slide.chapter}:S${slide.slide}`;
  
  if (!hasAudioSegments(slide) || slide.audioSegments.length === 0) {
    console.warn('[Edit] No audio segments available for this slide');
    return;
  }
  
  const currentSegmentIdx = segmentContext.currentSegmentIndex;
  const segment = slide.audioSegments[currentSegmentIdx];
  
  if (!segment) {
    console.warn(`[Edit] Invalid segment index ${currentSegmentIdx}`);
    return;
  }
  
  // Check if this segment has been edited before
  const editKey = `${slideKey}:${currentSegmentIdx}`;
  const existingEdit = narrationEdits.get(editKey);
  
  setEditingSegment({
    slideKey,
    segmentId: segment.id,
    currentText: existingEdit?.editedText || segment.narrationText || ''
  });
  setShowEditModal(true);
};

// Export narration edits (Phase 5: enhanced with save-to-file option)
const _handleExportNarration = async () => {
  const narrationData = buildNarrationDataFromEdits();
  
  // Show simple prompt for export action
  const action = window.confirm(
    'Export Options:\n\n' +
    'OK = Save to file system (requires API)\n' +
    'Cancel = Download JSON file'
  );
  
  if (action) {
    // Save to file system
    if (apiAvailable) {
      setIsSaving(true);
      try {
        const result = await saveNarrationToFile({
          demoId: demoMetadata.id,
          narrationData
        });
        
        if (result.success) {
          showSuccessMessage(`Saved to ${result.filePath}`);
          console.log('[Export] Saved to file system:', result.filePath);
        }
      } catch (error) {
        showErrorMessage('Failed to save to file');
        console.error('[Export] Save to file failed:', error);
      } finally {
        setIsSaving(false);
      }
    } else {
      showErrorMessage('Backend API not available');
    }
  } else {
    // Download JSON
    const blob = new Blob([JSON.stringify(narrationData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `narration-export-${demoMetadata.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showInfoMessage('Narration exported to download');
    console.log('[Export] Downloaded narration JSON:', {
      demoId: demoMetadata.id,
      totalSlides: narrationData.slides.length
    });
  }
};

// Regenerate audio for a segment using TTS (Phase 4)
const regenerateSegmentAudio = async (
  slide: typeof allSlides[0]['metadata'],
  segmentIndex: number,
  newText: string
): Promise<boolean> => {
  setIsRegeneratingAudio(true);
  setRegenerationError(null);
  
  try {
    console.log('[TTS] Starting audio regeneration...');
    console.log(`[TTS] Demo: ${demoMetadata.id}, Chapter: ${slide.chapter}, Slide: ${slide.slide}, Segment: ${segmentIndex}`);
    
    // Check TTS server health first
    const health = await checkTTSServerHealth();
    if (!health.available) {
      throw new Error(health.error || 'TTS server is not available');
    }
    
    console.log('[TTS] Server health check passed');
    
    const segment = slide.audioSegments[segmentIndex];
    
    // Call TTS regeneration
    const result = await regenerateSegment({
      chapter: slide.chapter,
      slide: slide.slide,
      segmentIndex: segmentIndex,
      segmentId: segment.id,
      narrationText: newText,
      addPauses: true
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Audio regeneration failed');
    }
    
    console.log('[TTS] Audio regenerated successfully');
    console.log(`[TTS] File path: ${result.filePath}`);
    
    // Update audio file path with cache-busting timestamp
    const timestamp = result.timestamp || Date.now();
    const basePath = segment.audioFilePath.split('?')[0]; // Remove existing query params
    segment.audioFilePath = `${basePath}?t=${timestamp}`;
    
    console.log(`[TTS] Updated audio path: ${segment.audioFilePath}`);
    
    // If audio is currently playing this segment, reload it
    if (audioEnabled && segmentContext.currentSegmentIndex === segmentIndex) {
      console.log('[TTS] Reloading audio for current segment...');
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      // Load new audio
      const audio = await loadAudioWithFallback(segment.audioFilePath, segment.id);
      audioRef.current = audio;
      // Auto-play if in manual+audio mode
      if (audioEnabled) {
        await audio.play();
      }
    }
    
    setIsRegeneratingAudio(false);
    return true;
    
  } catch (error: unknown) {
    console.error('[TTS] Regeneration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to regenerate audio';
    setRegenerationError(errorMessage);
    setIsRegeneratingAudio(false);
    return false;
  }
};

// Helper function: Build complete NarrationData structure from current in-memory edits
const buildNarrationDataFromEdits = useCallback((): NarrationData => {
  const narrationData: NarrationData = {
    demoId: demoMetadata.id,
    version: '1.0',
    lastModified: new Date().toISOString(),
    slides: []
  };
  
  // Iterate through all slides and build structure
  for (const slideComponent of allSlides) {
    const slide = slideComponent.metadata;
    const slideKey = `Ch${slide.chapter}:S${slide.slide}`;
    
    const slideData: NarrationSlide = {
      chapter: slide.chapter,
      slide: slide.slide,
      title: slide.title,
      segments: []
    };
    
    for (let idx = 0; idx < slide.audioSegments.length; idx++) {
      const segment = slide.audioSegments[idx];
      const editKey = `${slideKey}:${idx}`;
      const edit = narrationEdits.get(editKey);
      
      slideData.segments.push({
        id: segment.id,
        narrationText: edit?.editedText || segment.narrationText || '',
        visualDescription: segment.visualDescription || '',
        notes: ''
      });
    }
    
    narrationData.slides.push(slideData);
  }
  
  return narrationData;
}, [demoMetadata.id, allSlides, narrationEdits]);

// Save edited narration (Phase 5: API integration with persistence)
const handleSaveNarration = async (newText: string, regenerateAudio: boolean) => {
  if (!editingSegment) return;
  
  const slide = allSlides[currentIndex].metadata;
  const currentSegmentIdx = segmentContext.currentSegmentIndex;
  const segment = slide.audioSegments[currentSegmentIdx];
  
  if (!segment) {
    console.error('[Edit] Cannot save: invalid segment');
    showErrorMessage('Cannot save: invalid segment');
    return;
  }
  
  setIsSaving(true);
  
  try {
    // Create edit key
    const editKey = `${editingSegment.slideKey}:${currentSegmentIdx}`;
    
    // Create edit object
    const edit: NarrationEdit = {
      slideKey: editingSegment.slideKey,
      segmentIndex: currentSegmentIdx,
      originalText: segment.narrationText || '',
      editedText: newText,
      timestamp: Date.now()
    };
    
    // 1. Store edit in narrationEdits Map (immutable update)
    setNarrationEdits(prev => {
      const updated = new Map(prev);
      updated.set(editKey, edit);
      return updated;
    });
    
    // 2. Update segment's narrationText in-memory (direct mutation is OK here)
    segment.narrationText = newText;
    
    console.log('[Edit] Saved narration in memory:', {
      key: editKey,
      originalText: edit.originalText,
      editedText: newText,
      timestamp: new Date(edit.timestamp).toISOString()
    });
    
    // 3. Phase 5: Persist to file via backend API (if available)
    if (apiAvailable) {
      try {
        const narrationData = buildNarrationDataFromEdits();
        
        const result = await saveNarrationToFile({
          demoId: demoMetadata.id,
          narrationData
        });
        
        if (result.success) {
          console.log(`[Save] Persisted to ${result.filePath}`);
          showSuccessMessage('Narration saved to file!');
        }
      } catch (apiError) {
        console.error('[Save] API call failed:', apiError);
        showErrorMessage('Failed to save to file (in-memory edit still applied)');
      }
    } else {
      console.warn('[Save] Backend API not available - edit is session-only');
      showWarningMessage('Edit saved in memory only (backend API unavailable)');
    }
    
    // 4. Regenerate audio if requested (Phase 4)
    if (regenerateAudio) {
      console.log('[Edit] TTS regeneration requested');
      const success = await regenerateSegmentAudio(slide, currentSegmentIdx, newText);
      
      if (!success) {
        // Don't close modal on error - let user retry or cancel
        console.log('[Edit] Audio regeneration failed, modal remains open');
        setIsSaving(false);
        return;
      }
      
      console.log('[Edit] Audio regeneration completed successfully');
      
      // 5. Phase 5: Update narration cache after TTS regeneration
      if (apiAvailable) {
        try {
          const hash = await hashText(newText);
          await updateNarrationCache({
            demoId: demoMetadata.id,
            segment: {
              key: editKey,
              hash,
              timestamp: new Date().toISOString()
            }
          });
          console.log('[Cache] Updated cache for segment:', editKey);
        } catch (cacheError) {
          console.error('[Cache] Failed to update cache:', cacheError);
          // Non-fatal error - don't show to user
        }
      }
    }
    
    // Close modal only on success (or if no regeneration requested)
    setShowEditModal(false);
    setEditingSegment(null);
    setRegenerationError(null);
    
  } catch (error) {
    console.error('[Save] Unexpected error:', error);
    showErrorMessage('Save failed unexpectedly');
  } finally {
    setIsSaving(false);
  }
};

// Cancel narration edit
const handleCancelEdit = () => {
  setShowEditModal(false);
  setEditingSegment(null);
};

  return (
    <>
      {/* Start Overlay */}
      <AnimatePresence>
        {showStartOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              fontFamily: theme.fontFamily
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                textAlign: 'center',
                maxWidth: 500,
                padding: '2rem'
              }}
            >
              <h1 style={{ color: theme.colors.textPrimary, marginBottom: '1rem', fontSize: 32 }}>
                {demoMetadata.title}
              </h1>
              <p style={{ color: theme.colors.textSecondary, marginBottom: '2rem', fontSize: 16 }}>
                This presentation will auto-advance through {allSlides.length} slides with narration.
                {demoMetadata.description && (
                  <>
                    <br />
                    {demoMetadata.description}
                  </>
                )}
              </p>
              
              {error && (
                <p style={{ color: theme.colors.error, marginBottom: '1rem', fontSize: 14 }}>
                  {error}
                </p>
              )}

              {/* Final elapsed summary if available (from previous run) */}
              {showRuntimeTimerOption && finalElapsedSeconds != null && (
                <div style={{
                  marginBottom: '1rem',
                  fontSize: 13,
                  color: theme.colors.textSecondary,
                  background: 'rgba(255,255,255,0.05)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 8,
                  fontFamily: theme.fontFamily
                }}>
                  <strong style={{ color: theme.colors.textPrimary }}>Last Run Timing:</strong>{' '}
                  Elapsed {formatMMSS(finalElapsedSeconds)}
                  {demoMetadata.durationInfo?.total && (
                    <>
                      {' / '}Planned {formatMMSS(demoMetadata.durationInfo.total)}{' '}
                      ({(finalElapsedSeconds - demoMetadata.durationInfo.total).toFixed(1)}s Δ)
                    </>
                  )}
                </div>
              )}
              
              {/* Options */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
               {/* Row 1 */}
               <div style={{
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 gap: '1.25rem',
                 flexWrap: 'wrap'
               }}>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 14, color: theme.colors.textSecondary }}>
                   <input
                     type="checkbox"
                     checked={hideInterface}
                     onChange={(e) => setHideInterface(e.target.checked)}
                     style={{ width: 18, height: 18, cursor: 'pointer' }}
                   />
                   <span>Hide interface (recording)</span>
                 </label>

                 <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 14, color: theme.colors.textSecondary }}>
                   <input
                     type="checkbox"
                     checked={showRuntimeTimerOption}
                     onChange={(e) => setShowRuntimeTimerOption(e.target.checked)}
                     style={{ width: 18, height: 18, cursor: 'pointer' }}
                   />
                   <span>Show runtime timer (narrated)</span>
                 </label>
               </div>
               {showRuntimeTimerOption && demoMetadata.durationInfo?.total && (
                 <div style={{
                   fontSize: 12,
                   color: theme.colors.textMuted,
                   textAlign: 'center',
                   maxWidth: 480,
                   margin: '0 auto',
                   lineHeight: 1.4
                 }}>
                   Timer will display actual elapsed vs expected total {formatMMSS(demoMetadata.durationInfo.total)} to validate calculated timing.
                 </div>
               )}
             </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  onClick={handleStart}
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '1rem 2rem',
                    fontSize: 18,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0, 183, 195, 0.3)'
                  }}
                >
                  ▶ Narrated
                </button>
                
                <button
                  onClick={handleManualMode}
                  style={{
                    background: 'transparent',
                    color: theme.colors.primary,
                    border: `2px solid ${theme.colors.primary}`,
                    borderRadius: 12,
                    padding: '1rem 1.5rem',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ⌨ Manual
                </button>
              </div>
              
              <p style={{ color: theme.colors.textMuted, marginTop: '1.5rem', fontSize: 12 }}>
                Narrated: Auto-advance | Manual: Arrow keys with audio toggle
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
     {(isPlaying || isManualMode) && !hideInterface && (
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         style={{
           position: 'fixed',
           top: 80,
           left: '50%',
           transform: 'translateX(-50%)',
           background: 'rgba(0, 0, 0, 0.8)',
           color: theme.colors.textPrimary,
           padding: '0.5rem 1rem',
           borderRadius: 8,
           fontSize: 12,
           zIndex: 1000,
           display: 'flex',
           gap: '1rem',
           alignItems: 'center'
         }}
       >
         <span>
           Slide {currentIndex + 1} of {allSlides.length} (Ch{allSlides[currentIndex].metadata.chapter}:S{allSlides[currentIndex].metadata.slide})
         </span>

         {/* Runtime timer (only in narrated mode & enabled) */}
        {isPlaying && showRuntimeTimerOption && (
          <span style={{ fontFamily: 'monospace', fontSize: 12, background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>{formatMMSS(elapsedMs / 1000)} elapsed</span>
            {demoMetadata.durationInfo?.total && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ opacity: 0.5 }}>/</span>
                <span>{formatMMSS(demoMetadata.durationInfo.total)} planned</span>
                <span style={{ opacity: 0.5 }}>|</span>
                {(() => {
                  const delta = (elapsedMs / 1000) - demoMetadata.durationInfo.total;
                  return (
                    <span style={{ color: deltaColor(delta) }}>
                      {delta >= 0 ? '+' : ''}{delta.toFixed(1)}s Δ
                    </span>
                  );
                })()}
              </span>
            )}
          </span>
        )}
         
         {/* Audio toggle button (only in manual mode) */}
         {isManualMode && (
           <button
             onClick={() => setAudioEnabled(!audioEnabled)}
             style={{
               background: 'transparent',
               border: '1px solid #475569',
               color: audioEnabled ? theme.colors.primary : theme.colors.textMuted,
               borderRadius: 6,
               padding: '0.25rem 0.75rem',
               fontSize: 11,
               cursor: 'pointer',
               fontWeight: 600,
               transition: 'all 0.2s ease'
             }}
           >
             {audioEnabled ? '🔊 Audio' : '🔇 Muted'}
           </button>
         )}
         
         {/* Auto-advance toggle (only in manual mode with audio enabled) */}
         {isManualMode && audioEnabled && (
           <label
             style={{
               display: 'flex',
               alignItems: 'center',
               gap: '0.5rem',
               cursor: 'pointer',
               fontSize: 11,
               color: theme.colors.textSecondary
             }}
           >
             <input
               type="checkbox"
               checked={autoAdvanceOnAudioEnd}
               onChange={(e) => setAutoAdvanceOnAudioEnd(e.target.checked)}
               style={{
                 width: 14,
                 height: 14,
                 cursor: 'pointer'
               }}
             />
             Auto-advance
           </label>
         )}
         
         {/* Edit button (only in manual mode with segments) */}
         {isManualMode && currentIndex < allSlides.length && hasAudioSegments(allSlides[currentIndex].metadata) && (
           <button
             onClick={handleEditNarration}
             style={{
               background: 'transparent',
               border: '1px solid #475569',
               color: theme.colors.textPrimary,
               borderRadius: 6,
               padding: '0.25rem 0.75rem',
               fontSize: 11,
               cursor: 'pointer',
               transition: 'all 0.2s ease'
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.borderColor = '#00B7C3';
               e.currentTarget.style.color = '#00B7C3';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.borderColor = '#475569';
               e.currentTarget.style.color = '#f1f5f9';
             }}
           >
             ✏️ Edit
           </button>
         )}
         
         <button
           onClick={handleRestart}
           style={{
             background: 'transparent',
             border: '1px solid #475569',
             color: theme.colors.textPrimary,
             borderRadius: 6,
             padding: '0.25rem 0.75rem',
             fontSize: 11,
             cursor: 'pointer'
           }}
         >
           ↻ Restart
         </button>
       </motion.div>
     )}

      {/* Error toast */}
      <AnimatePresence>
        {error && isPlaying && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{
              position: 'fixed',
              top: 80,
              right: 20,
              background: 'rgba(239, 68, 68, 0.9)',
              color: '#fff',
              padding: '0.75rem 1rem',
              borderRadius: 8,
              fontSize: 14,
              maxWidth: 300,
              zIndex: 1000
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Narration Edit Modal */}
      <AnimatePresence>
        {showEditModal && editingSegment && (
          <NarrationEditModal
            slideKey={editingSegment.slideKey}
            segmentId={editingSegment.segmentId}
            currentText={editingSegment.currentText}
            isRegenerating={isRegeneratingAudio}
            regenerationError={regenerationError}
            onSave={handleSaveNarration}
            onCancel={handleCancelEdit}
          />
        )}
      </AnimatePresence>

      {/* Notification Toasts */}
      <AnimatePresence>
        {notifications.map((notification) => {
          const colors = {
            success: { bg: 'rgba(34, 197, 94, 0.9)', icon: '✓' },
            error: { bg: 'rgba(239, 68, 68, 0.9)', icon: '✕' },
            warning: { bg: 'rgba(245, 158, 11, 0.9)', icon: '⚠' },
            info: { bg: 'rgba(59, 130, 246, 0.9)', icon: 'ℹ' }
          };
          const style = colors[notification.type];
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 50, y: 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 50, y: 0 }}
              style={{
                position: 'fixed',
                top: 20 + (notifications.indexOf(notification) * 70),
                right: 20,
                background: style.bg,
                color: '#fff',
                padding: '0.75rem 1rem',
                borderRadius: 8,
                fontSize: 14,
                maxWidth: 350,
                zIndex: 10000,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: theme.fontFamily
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 'bold' }}>{style.icon}</span>
              <span style={{ flex: 1 }}>{notification.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </>
  );
};