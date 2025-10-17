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
}

export const NarratedController: React.FC<NarratedControllerProps> = ({
  onSlideChange,
  onPlaybackStart,
  onPlaybackEnd
}) => {
  const [manifest, setManifest] = useState<NarrationManifest | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStartOverlay, setShowStartOverlay] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);

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
  
  // Play audio for current slide
  useEffect(() => {
    if (!manifest || !isPlaying || currentIndex >= manifest.slides.length) return;
    
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

  // Start playback
  const handleStart = () => {
    if (!manifest || manifest.slides.length === 0) {
      setError('No slides to play');
      return;
    }
    
    setShowStartOverlay(false);
    setIsPlaying(true);
    setCurrentIndex(0);
    onPlaybackStart?.();
  };

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
                This presentation will auto-advance through 14 slides with narration.
                <br />
                Duration: ~4 minutes
              </p>
              
              {error && (
                <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: 14 }}>
                  {error}
                </p>
              )}
              
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
                {manifest ? '▶ Start Narrated Playback' : 'Loading...'}
              </button>
              
              <p style={{ color: '#64748b', marginTop: '1.5rem', fontSize: 12 }}>
                Note: Audio will play automatically after clicking start
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
      {isPlaying && manifest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed',
            bottom: 20,
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