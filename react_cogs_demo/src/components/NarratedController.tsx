import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NarrationSlide {
  id: number;
  src: string;
  autoAdvance: boolean;
}

interface NarrationManifest {
  slides: NarrationSlide[];
}

interface NarratedControllerProps {
  onSlideChange: (slideId: number) => void;
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
  manualSlideChange?: number | null;
}

export const NarratedController: React.FC<NarratedControllerProps> = ({
  onSlideChange,
  onPlaybackStart,
  onPlaybackEnd,
  manualSlideChange
}) => {
  const [manifest, setManifest] = useState<NarrationManifest | null>(null);
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
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const forceAudioPlayRef = useRef(0);

  // Load manifest on mount
  useEffect(() => {
    fetch('/narrationManifest.json')
      .then(res => res.json())
      .then(data => setManifest(data))
      .catch(err => {
        console.error('Failed to load narration manifest:', err);
        setError('Failed to load narration manifest');
      });
  }, []);

  // Advance to next slide
  const advanceSlide = useCallback(() => {
    if (!manifest) return;
    
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= manifest.slides.length) {
      // End of presentation
      setIsPlaying(false);
      setShowStartOverlay(true);
      onPlaybackEnd?.();
      return;
    }
    
    setCurrentIndex(nextIndex);
  }, [manifest, currentIndex, onPlaybackEnd]);
  
  // Play audio for current slide (only in non-manual mode or when manually triggered in manual+audio mode)
  useEffect(() => {
    if (!manifest || !isPlaying || currentIndex >= manifest.slides.length || isManualMode) return;
    
    const currentSlide = manifest.slides[currentIndex];
    
    // Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onplay = null;
    }
    
    // Create new audio element for this slide
    const audio = new Audio(currentSlide.src);
    audioRef.current = audio;
    
    // Setup event handlers
    audio.onended = () => {
      console.log(`Audio ended for slide ${currentSlide.id}`);
      if (currentSlide.autoAdvance) {
        setError(null);
        advanceSlide();
      }
    };
    
    audio.onerror = (e) => {
      console.error(`Failed to load audio for slide ${currentSlide.id}:`, e);
      setError(`Failed to load audio for slide ${currentSlide.id}`);
      setIsLoading(false);
      // Fallback: advance after 10 seconds
      setTimeout(() => {
        setError(null);
        advanceSlide();
      }, 10000);
    };
    
    audio.onplay = () => {
      console.log(`Audio playing for slide ${currentSlide.id}`);
      setError(null);
      setIsLoading(false);
    };
    
    audio.oncanplaythrough = () => {
      setIsLoading(false);
    };
    
    // Update slide display
    onSlideChange(currentSlide.id);
    
    // Start playing
    setIsLoading(true);
    audio.play().catch(err => {
      console.error('Audio playback failed:', err);
      setError('Audio playback failed');
      setIsLoading(false);
    });
    
    // Cleanup on unmount or when dependencies change
    return () => {
      audio.pause();
      audio.onended = null;
      audio.onerror = null;
      audio.onplay = null;
      audio.oncanplaythrough = null;
    };
  }, [manifest, isPlaying, currentIndex, onSlideChange, advanceSlide]);

  // Start narrated playback
  const handleStart = () => {
    if (!manifest || manifest.slides.length === 0) {
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
    if (!manifest || manifest.slides.length === 0) {
      setError('No slides to play');
      return;
    }
    
    setShowStartOverlay(false);
    setIsPlaying(false);
    setIsManualMode(true);
    setIsManualWithAudio(false);
    setCurrentIndex(0);
    onSlideChange(manifest.slides[0].id);
    // Don't call onPlaybackStart to keep manual navigation enabled
  };

  // Start manual mode with audio
  const handleManualWithAudio = () => {
    if (!manifest || manifest.slides.length === 0) {
      setError('No slides to play');
      return;
    }
    
    setShowStartOverlay(false);
    setIsPlaying(false); // Don't auto-play, let manual navigation trigger audio
    setIsManualMode(true);
    setIsManualWithAudio(true);
    setCurrentIndex(0);
    onSlideChange(manifest.slides[0].id);
    // Play audio for first slide
    playAudioForSlide(0);
    // Don't call onPlaybackStart to keep manual navigation enabled
  };

  // Play audio for a specific slide (used in manual+audio mode)
  const playAudioForSlide = useCallback((index: number) => {
    if (!manifest || index >= manifest.slides.length) return;
    
    const slide = manifest.slides[index];
    
    // Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onplay = null;
    }
    
    // Create new audio element
    const audio = new Audio(slide.src);
    audioRef.current = audio;
    
    // Setup event handlers
    audio.onended = () => {
      console.log(`Audio ended for slide ${slide.id}`);
      // Auto-advance if enabled
      if (autoAdvanceOnAudioEnd && slide.autoAdvance) {
        const nextIndex = index + 1;
        if (nextIndex < manifest.slides.length) {
          setCurrentIndex(nextIndex);
          onSlideChange(manifest.slides[nextIndex].id);
          // Force audio to play for the next slide
          forceAudioPlayRef.current += 1;
        }
      }
    };
    
    audio.onerror = (e) => {
      console.error(`Failed to load audio for slide ${slide.id}:`, e);
      setError(`Failed to load audio for slide ${slide.id}`);
    };
    
    audio.onplay = () => {
      console.log(`Audio playing for slide ${slide.id}`);
      setError(null);
    };
    
    // Start playing
    audio.play().catch(err => {
      console.error('Audio playback failed:', err);
      setError('Audio playback failed');
    });
  }, [manifest, autoAdvanceOnAudioEnd, onSlideChange]);

  // Listen for external slide changes (from SlidePlayer keyboard navigation in manual+audio mode)
  useEffect(() => {
    if (!isManualMode || !manifest || manualSlideChange === null) return;
    
    // Find the index for the manually changed slide ID
    const slideIndex = manifest.slides.findIndex(s => s.id === manualSlideChange);
    
    if (slideIndex !== -1 && slideIndex !== currentIndex) {
      setCurrentIndex(slideIndex);
    }
  }, [manualSlideChange, isManualMode, manifest, currentIndex]);

  // Play audio whenever currentIndex changes in manual+audio mode only
  useEffect(() => {
    if (!isManualMode || !isManualWithAudio || !manifest) return;
    
    playAudioForSlide(currentIndex);
  }, [currentIndex, isManualMode, isManualWithAudio, manifest, playAudioForSlide, forceAudioPlayRef.current]);

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
                This presentation will auto-advance through 15 slides with narration.
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
                  disabled={!manifest}
                  style={{
                    background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '1rem 2rem',
                    fontSize: 18,
                    fontWeight: 600,
                    cursor: manifest ? 'pointer' : 'not-allowed',
                    opacity: manifest ? 1 : 0.5,
                    boxShadow: '0 4px 12px rgba(0, 183, 195, 0.3)'
                  }}
                >
                  {manifest ? '▶ Narrated' : 'Loading...'}
                </button>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={handleManualMode}
                    disabled={!manifest}
                    style={{
                      background: 'transparent',
                      color: '#94a3b8',
                      border: '2px solid #475569',
                      borderRadius: 12,
                      padding: '1rem 1.5rem',
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: manifest ? 'pointer' : 'not-allowed',
                      opacity: manifest ? 1 : 0.5
                    }}
                  >
                    {manifest ? '⌨ Manual (Silent)' : 'Loading...'}
                  </button>
                  
                  <button
                    onClick={handleManualWithAudio}
                    disabled={!manifest}
                    style={{
                      background: 'transparent',
                      color: '#00B7C3',
                      border: '2px solid #00B7C3',
                      borderRadius: 12,
                      padding: '1rem 1.5rem',
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: manifest ? 'pointer' : 'not-allowed',
                      opacity: manifest ? 1 : 0.5
                    }}
                  >
                    {manifest ? '⌨ Manual + Audio' : 'Loading...'}
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
      {(isPlaying || isManualMode) && manifest && !hideInterface && (
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
            Slide {currentIndex + 1} of {manifest.slides.length}
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