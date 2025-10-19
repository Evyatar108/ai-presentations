import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { allSlides } from '../slides/SlidesRegistry';
import { hasAudioSegments } from '../slides/SlideMetadata';
import { useSegmentContext } from '../contexts/SegmentContext';

// Fallback audio file for missing segments
const FALLBACK_AUDIO = '/audio/silence-1s.mp3';

// Helper to load audio with fallback
const loadAudioWithFallback = async (primaryPath: string, segmentId: string): Promise<HTMLAudioElement> => {
  const audio = new Audio(primaryPath);
  
  return new Promise((resolve) => {
    const handleError = () => {
      console.warn(`[Audio] File not found: ${primaryPath}, using fallback silence for segment: ${segmentId}`);
      // Create fallback audio
      const fallbackAudio = new Audio(FALLBACK_AUDIO);
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

interface NarratedControllerProps {
  onSlideChange: (chapter: number, slide: number) => void;
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
  manualSlideChange?: { chapter: number; slide: number } | null;
}

export const NarratedController: React.FC<NarratedControllerProps> = ({
  onSlideChange,
  onPlaybackStart,
  onPlaybackEnd,
  manualSlideChange
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStartOverlay, setShowStartOverlay] = useState(true);
  const [hideInterface, setHideInterface] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [isManualWithAudio, setIsManualWithAudio] = useState(false);
  const [autoAdvanceOnAudioEnd, setAutoAdvanceOnAudioEnd] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentIndexRef = useRef(currentIndex);
  const lastAutoAdvanceFromIndexRef = useRef<number | null>(null);
  
  // Segment context for multi-segment slides
  const segmentContext = useSegmentContext();

  // Keep ref in sync with state
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Advance to next slide (narrated mode)
  const advanceSlide = useCallback(() => {
    const currentIdx = currentIndexRef.current;
    const nextIndex = currentIdx + 1;
    
    if (nextIndex >= allSlides.length) {
      // End of presentation - add delay before showing overlay
      setIsPlaying(false);
      setTimeout(() => {
        setShowStartOverlay(true);
        onPlaybackEnd?.();
      }, 2000); // 2 second delay after final slide
      return;
    }
    
    setCurrentIndex(nextIndex);
  }, [onPlaybackEnd]);
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
        console.log(`[NarratedController] All segments complete for ${slideKey}, advancing to next slide`);
        advanceSlide();
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
          // Small delay between segments for smoother transitions
          setTimeout(() => playSegment(currentSegmentIndex), 100);
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
    
    setShowStartOverlay(false);
    setIsPlaying(true);
    setIsManualMode(false);
    setCurrentIndex(0);
    onPlaybackStart?.();
  };

  // Start manual mode without audio
  const handleManualMode = () => {
    if (allSlides.length === 0) {
      setError('No slides to play');
      return;
    }
    
    setShowStartOverlay(false);
    setIsPlaying(false);
    setIsManualMode(true);
    setIsManualWithAudio(false);
    setCurrentIndex(0);
    onSlideChange(allSlides[0].metadata.chapter, allSlides[0].metadata.slide);
  };

  // Start manual mode with audio
  const handleManualWithAudio = () => {
    if (allSlides.length === 0) {
      setError('No slides to play');
      return;
    }
    
    setShowStartOverlay(false);
    setIsPlaying(false);
    setIsManualMode(true);
    setIsManualWithAudio(true);
    setCurrentIndex(0);
    onSlideChange(allSlides[0].metadata.chapter, allSlides[0].metadata.slide);
  };

  // Play audio for current slide in manual+audio mode
  useEffect(() => {
    if (!isManualMode || !isManualWithAudio || currentIndex >= allSlides.length) return;
    
    const slide = allSlides[currentIndex].metadata;
    
    // Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onplay = null;
    }
    
    // Play first segment (simplified for manual mode)
    if (!hasAudioSegments(slide) || slide.audioSegments.length === 0) {
      console.warn('[Manual+Audio] No audio segments for slide');
      return;
    }
    
    // Load audio with fallback support
    const firstSegment = slide.audioSegments[0];
    loadAudioWithFallback(firstSegment.audioFilePath, firstSegment.id).then(audio => {
      audioRef.current = audio;

      // Setup event handlers - use ref to get current index at time of onended
      audio.onended = () => {
        const indexAtEnd = currentIndexRef.current;
        console.log(`[Manual+Audio] onended chapter=${slide.chapter} slide=${slide.slide} indexAtEnd=${indexAtEnd}`);
        
        // Auto-advance if enabled
        if (autoAdvanceOnAudioEnd) {
          const nextIndex = indexAtEnd + 1;
          if (nextIndex < allSlides.length) {
            console.log('[Manual+Audio] auto-advancing from', indexAtEnd, 'to', nextIndex);
            lastAutoAdvanceFromIndexRef.current = indexAtEnd;
            setCurrentIndex(nextIndex);
            const nextSlide = allSlides[nextIndex].metadata;
            onSlideChange(nextSlide.chapter, nextSlide.slide);
          } else {
            console.log('[Manual+Audio] reached end, not advancing');
          }
        }
      };

      audio.onerror = (e: any) => {
        console.error(`[Manual+Audio] Playback error for chapter ${slide.chapter}, slide ${slide.slide}:`, e);
        setError(`Playback error for slide ${slide.slide}`);
      };

      audio.onplay = () => {
        console.log(`[Manual+Audio] playing chapter=${slide.chapter} slide=${slide.slide} index=${currentIndex}`);
        setError(null);
      };

      audio.play().catch(err => {
        console.error('[Manual+Audio] Audio playback failed:', err);
        setError('Audio playback failed');
      });
    });

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.onplay = null;
      }
    };
  }, [currentIndex, isManualMode, isManualWithAudio, autoAdvanceOnAudioEnd, onSlideChange]);

  // Consume external manual slide changes (manual+audio mode)
  useEffect(() => {
    if (!isManualMode || !isManualWithAudio || manualSlideChange == null) return;
    const slideIndex = allSlides.findIndex(s =>
      s.metadata.chapter === manualSlideChange.chapter && s.metadata.slide === manualSlideChange.slide
    );
    if (slideIndex === -1) return;

    // Ignore only if this is the specific stale value from just before an auto-advance
    if (lastAutoAdvanceFromIndexRef.current !== null && slideIndex === lastAutoAdvanceFromIndexRef.current) {
      console.log(`[Manual+Audio] ignoring stale manualSlideChange=${slideIndex} (pre-auto-advance value)`);
      lastAutoAdvanceFromIndexRef.current = null; // Clear so user can navigate back later
      return;
    }

    if (slideIndex !== currentIndex) {
      console.log('[Manual+Audio] applying user navigation to index', slideIndex);
      setCurrentIndex(slideIndex);
      lastAutoAdvanceFromIndexRef.current = null; // Clear flag on manual navigation
    }
  }, [manualSlideChange, isManualMode, isManualWithAudio, currentIndex]);

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
    setIsManualWithAudio(false);
    setAutoAdvanceOnAudioEnd(false);
    setError(null);
    setShowStartOverlay(true);
    onPlaybackEnd?.();
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
              fontFamily: 'Inter, system-ui, sans-serif'
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
              <h1 style={{ color: '#f1f5f9', marginBottom: '1rem', fontSize: 32 }}>
                Meeting Highlights COGS Reduction
              </h1>
              <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: 16 }}>
                This presentation will auto-advance through {allSlides.length} slides with narration.
                <br />
                Duration: ~4 minutes
              </p>
              
              {error && (
                <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: 14 }}>
                  {error}
                </p>
              )}
              
              {/* Hide Interface Option */}
              <div style={{
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <input
                  type="checkbox"
                  id="hideInterface"
                  checked={hideInterface}
                  onChange={(e) => setHideInterface(e.target.checked)}
                  style={{
                    width: 18,
                    height: 18,
                    cursor: 'pointer'
                  }}
                />
                <label
                  htmlFor="hideInterface"
                  style={{
                    color: '#94a3b8',
                    fontSize: 14,
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  Hide interface (for recording)
                </label>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  onClick={handleStart}
                  style={{
                    background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
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
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={handleManualMode}
                    style={{
                      background: 'transparent',
                      color: '#94a3b8',
                      border: '2px solid #475569',
                      borderRadius: 12,
                      padding: '1rem 1.5rem',
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ⌨ Manual (Silent)
                  </button>
                  
                  <button
                    onClick={handleManualWithAudio}
                    style={{
                      background: 'transparent',
                      color: '#00B7C3',
                      border: '2px solid #00B7C3',
                      borderRadius: 12,
                      padding: '1rem 1.5rem',
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ⌨ Manual + Audio
                  </button>
                </div>
              </div>
              
              <p style={{ color: '#64748b', marginTop: '1.5rem', fontSize: 12 }}>
                Narrated: Auto-advance | Manual: Arrow keys | Manual + Audio: Arrow keys + narration
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      <AnimatePresence>
        {isLoading && isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: 'fixed',
              bottom: 100,
              right: 20,
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#f1f5f9',
              padding: '0.75rem 1rem',
              borderRadius: 8,
              fontSize: 14,
              zIndex: 1000
            }}
          >
            Loading narration...
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
            color: '#f1f5f9',
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
          
          {/* Auto-advance toggle (only in manual+audio mode) */}
          {isManualMode && isManualWithAudio && (
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: 11,
                color: '#94a3b8'
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
          
          <button
            onClick={handleRestart}
            style={{
              background: 'transparent',
              border: '1px solid #475569',
              color: '#f1f5f9',
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
    </>
  );
};