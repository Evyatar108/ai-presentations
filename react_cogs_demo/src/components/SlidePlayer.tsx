import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Slide {
  id: number;
  title: string;
  Component: React.FC;
}

interface SlidePlayerProps {
  slides: Slide[];
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
}

export const SlidePlayer: React.FC<SlidePlayerProps> = ({
  slides,
  autoAdvance = false,
  autoAdvanceDelay = 8000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const goToNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, slides.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    }
  }, [currentIndex, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        if (idx < slides.length) {
          goToSlide(idx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, goToSlide, slides.length]);

  // Auto-advance
  useEffect(() => {
    if (!autoAdvance) return;

    const timer = setTimeout(() => {
      goToNext();
    }, autoAdvanceDelay);

    return () => clearTimeout(timer);
  }, [autoAdvance, autoAdvanceDelay, currentIndex, goToNext]);

  const currentSlide = slides[currentIndex];
  const CurrentComponent = currentSlide.Component;

  const variants = {
    enter: {
      opacity: 0,
      scale: 0.95
    },
    center: {
      opacity: 1,
      scale: 1
    },
    exit: {
      opacity: 0,
      scale: 1.05
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#0f172a' }}>
      {/* Slide content */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0
          }}
        >
          <CurrentComponent />
        </motion.div>
      </AnimatePresence>

      {/* Navigation controls */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.9)',
        padding: '0.75rem 1.5rem',
        borderRadius: 50,
        backdropFilter: 'blur(10px)',
        zIndex: 1000
      }}>
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          aria-label="Previous slide"
          style={{
            background: 'none',
            border: 'none',
            color: currentIndex === 0 ? '#475569' : '#f1f5f9',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            fontSize: 24,
            padding: '0.25rem 0.5rem',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          ←
        </button>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
              aria-current={idx === currentIndex ? 'true' : 'false'}
              style={{
                width: idx === currentIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: idx === currentIndex ? '#00B7C3' : '#475569',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0
              }}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          disabled={currentIndex === slides.length - 1}
          aria-label="Next slide"
          style={{
            background: 'none',
            border: 'none',
            color: currentIndex === slides.length - 1 ? '#475569' : '#f1f5f9',
            cursor: currentIndex === slides.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: 24,
            padding: '0.25rem 0.5rem',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          →
        </button>

        {/* Slide counter */}
        <div style={{
          color: '#94a3b8',
          fontSize: 14,
          marginLeft: '0.5rem',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          {currentIndex + 1} / {slides.length}
        </div>
      </div>

      {/* Keyboard hint */}
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        color: '#64748b',
        fontSize: 12,
        fontFamily: 'Inter, system-ui, sans-serif',
        background: 'rgba(15, 23, 42, 0.8)',
        padding: '0.5rem 1rem',
        borderRadius: 8,
        backdropFilter: 'blur(10px)'
      }}>
        Use ← → or Space to navigate
      </div>
    </div>
  );
};