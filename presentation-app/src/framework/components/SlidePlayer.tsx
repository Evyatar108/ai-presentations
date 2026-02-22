import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSegmentContext } from '../contexts/SegmentContext';
import { useAudioTimeContextOptional } from '../contexts/AudioTimeContext';
import type { SlideComponentWithMetadata } from '../slides/SlideMetadata';
import { useTheme } from '../theme/ThemeContext';
import { SlideErrorBoundary } from './SlideErrorBoundary';

export interface Slide {
  chapter: number;
  slide: number;
  title: string;
  Component: React.FC;
}

export interface SlidePlayerProps {
  demoId: string;
  slides: Slide[];
  slidesWithMetadata?: SlideComponentWithMetadata[];
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
  externalSlide?: { chapter: number; slide: number };
  onSlideChange?: (chapter: number, slide: number) => void
  disableManualNav?: boolean;
}

export const SlidePlayer: React.FC<SlidePlayerProps> = ({
  demoId,
  slides,
  slidesWithMetadata,
  autoAdvance = false,
  autoAdvanceDelay = 8000,
  externalSlide,
  onSlideChange,
  disableManualNav = false
}) => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Get segment context for segment navigation (needs to be declared early for use in callbacks)
  const segmentContext = useSegmentContext();

  // Handle external slide control
  useEffect(() => {
    if (externalSlide !== undefined) {
      const index = slides.findIndex(s => s.chapter === externalSlide.chapter && s.slide === externalSlide.slide);
      if (index !== -1 && index !== currentIndex) {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
        
        // Initialize segments for the new slide in manual mode
        const slideMetadata = slidesWithMetadata?.[index]?.metadata;
        if (slideMetadata?.audioSegments) {
          const slideKey = `Ch${slideMetadata.chapter}:S${slideMetadata.slide}`;
          segmentContext.initializeSegments(slideKey, slideMetadata.audioSegments);
        }
      }
    }
  }, [externalSlide, slides, currentIndex, segmentContext]);

  const goToNext = useCallback(() => {
    if (disableManualNav) return;
    if (currentIndex < slides.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
      const nextSlide = slides[currentIndex + 1];
      onSlideChange?.(nextSlide.chapter, nextSlide.slide);
      
      // Initialize segments for the new slide
      const slideMetadata = slidesWithMetadata?.[currentIndex + 1]?.metadata;
      if (slideMetadata?.audioSegments) {
        const slideKey = `Ch${slideMetadata.chapter}:S${slideMetadata.slide}`;
        segmentContext.initializeSegments(slideKey, slideMetadata.audioSegments);
      }
    }
  }, [currentIndex, slides, disableManualNav, onSlideChange, segmentContext]);

  const goToPrev = useCallback(() => {
    if (disableManualNav) return;
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
      const prevSlide = slides[currentIndex - 1];
      onSlideChange?.(prevSlide.chapter, prevSlide.slide);
      
      // Initialize segments for the new slide
      const slideMetadata = slidesWithMetadata?.[currentIndex - 1]?.metadata;
      if (slideMetadata?.audioSegments) {
        const slideKey = `Ch${slideMetadata.chapter}:S${slideMetadata.slide}`;
        segmentContext.initializeSegments(slideKey, slideMetadata.audioSegments);
      }
    }
  }, [currentIndex, slides, disableManualNav, onSlideChange, segmentContext]);

  const goToSlide = useCallback((index: number) => {
    if (disableManualNav) return;
    if (index >= 0 && index < slides.length) {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
      const slide = slides[index];
      onSlideChange?.(slide.chapter, slide.slide);
      
      // Initialize segments for the new slide
      const slideMetadata = slidesWithMetadata?.[index]?.metadata;
      if (slideMetadata?.audioSegments) {
        const slideKey = `Ch${slideMetadata.chapter}:S${slideMetadata.slide}`;
        segmentContext.initializeSegments(slideKey, slideMetadata.audioSegments);
      }
    }
  }, [currentIndex, slides, disableManualNav, onSlideChange, segmentContext]);

  // Initialize segments for the first slide on mount (for manual mode)
  useEffect(() => {
    const initialSlideMetadata = slidesWithMetadata?.[0]?.metadata;
    if (initialSlideMetadata?.audioSegments) {
      const slideKey = `Ch${initialSlideMetadata.chapter}:S${initialSlideMetadata.slide}`;
      segmentContext.initializeSegments(slideKey, initialSlideMetadata.audioSegments);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
  
  // Get metadata for current slide to check segments
  const currentSlideMetadata = slidesWithMetadata?.[currentIndex]?.metadata;
  const segments = currentSlideMetadata?.audioSegments || [];
  const hasSegments = segments.length > 0;
  const hasMultipleSegments = segments.length > 1;
  
  // Segment navigation handlers
  const goToSegment = useCallback((segmentIndex: number) => {
    if (disableManualNav || !hasMultipleSegments) return;
    segmentContext.setCurrentSegment(segmentIndex);
  }, [disableManualNav, hasMultipleSegments, segmentContext]);
  
  const goToNextSegment = useCallback(() => {
    if (disableManualNav || !hasMultipleSegments) return;
    segmentContext.nextSegment();
  }, [disableManualNav, hasMultipleSegments, segmentContext]);
  
  const goToPrevSegment = useCallback(() => {
    if (disableManualNav || !hasMultipleSegments) return;
    segmentContext.previousSegment();
  }, [disableManualNav, hasMultipleSegments, segmentContext]);

  // Marker navigation via AudioTimeContext
  const audioTimeCtx = useAudioTimeContextOptional();
  const markers = useMemo(() => audioTimeCtx?.markers ?? [], [audioTimeCtx?.markers]);
  const currentTime = audioTimeCtx?.currentTime ?? 0;
  const currentMarkerIndex = useMemo(() => {
    if (markers.length === 0) return -1;
    let last = -1;
    for (let i = 0; i < markers.length; i++) {
      if (markers[i].time <= currentTime + 0.02) last = i;
    }
    return last;
  }, [markers, currentTime]);

  // Keyboard navigation — ArrowRight/Space advances segment first, then slide
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (hasMultipleSegments && segmentContext.currentSegmentIndex < segments.length - 1) {
          goToNextSegment();
        } else {
          goToNext();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (hasMultipleSegments && segmentContext.currentSegmentIndex > 0) {
          goToPrevSegment();
        } else {
          goToPrev();
        }
      } else if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        if (idx < slides.length) {
          goToSlide(idx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, goToNextSegment, goToPrevSegment, goToSlide, slides.length, hasMultipleSegments, segments.length, segmentContext.currentSegmentIndex]);

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
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: theme.colors.bgDeep }}>
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
          <SlideErrorBoundary
            slideKey={String(currentIndex)}
            slideTitle={currentSlide.title}
            onSkipForward={currentIndex < slides.length - 1 ? goToNext : undefined}
            onSkipBackward={currentIndex > 0 ? goToPrev : undefined}
          >
            <CurrentComponent />
          </SlideErrorBoundary>
        </motion.div>
      </AnimatePresence>

      {/* Combined Navigation Container (Slide nav on top, Segment nav below) */}
      {!disableManualNav && (
        <nav
          data-testid="slide-nav"
          aria-label="Slide navigation"
          style={{
            position: 'fixed',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column-reverse',
            alignItems: 'center',
            gap: hasMultipleSegments ? '2px' : '0px',
            zIndex: 1000
          }}
        >
          {/* Slide navigation (always present) — three-column layout centers dots */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: `${theme.colors.bgDeep}e6`,
              padding: '0rem 1rem',
              borderRadius: 50,
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Left wing */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.3rem' }}>
              <button
                onClick={goToPrev}
                disabled={currentIndex === 0}
                aria-label="Previous slide"
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentIndex === 0 ? theme.colors.textMuted : theme.colors.textPrimary,
                  cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                  fontSize: 20,
                  padding: '0.25rem 0.4rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                ←
              </button>
              <div
                style={{
                  color: theme.colors.textSecondary,
                  fontSize: 11,
                  fontFamily: theme.fontFamily,
                }}
              >
                Slide:
              </div>
            </div>

            {/* Center: dots */}
            <div style={{ display: 'flex', gap: '0.4rem', margin: '0 0.6rem' }}>
              {slides.map((slide, idx) => (
                <button
                  key={`${slide.chapter}-${slide.slide}`}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                  aria-current={idx === currentIndex ? 'true' : 'false'}
                  style={{
                    width: idx === currentIndex ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: idx === currentIndex ? theme.colors.primary : theme.colors.textMuted,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0
                  }}
                />
              ))}
            </div>

            {/* Right wing */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '0.3rem' }}>
              <button
                onClick={goToNext}
                disabled={currentIndex === slides.length - 1}
                aria-label="Next slide"
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentIndex === slides.length - 1 ? theme.colors.textMuted : theme.colors.textPrimary,
                  cursor: currentIndex === slides.length - 1 ? 'not-allowed' : 'pointer',
                  fontSize: 20,
                  padding: '0.25rem 0.4rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                →
              </button>
              <div
                style={{
                  color: theme.colors.textSecondary,
                  fontSize: 12,
                  fontFamily: theme.fontFamily,
                  whiteSpace: 'nowrap',
                }}
              >
                {currentIndex} / {slides.length - 1}
              </div>
            </div>
          </div>

          {/* Segment + marker navigation (shown when multiple segments or markers exist) */}
          {(hasMultipleSegments || markers.length > 0) && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column-reverse',
                alignItems: 'center',
                alignSelf: 'stretch',
                background: `${theme.colors.bgDeep}e6`,
                borderRadius: 50,
                backdropFilter: 'blur(10px)',
                marginBottom: '-12px'
              }}
            >
              {/* Segment dots row — three-column layout keeps dots centered */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '0rem 1rem',
                }}
              >
                {hasMultipleSegments ? (
                  <>
                    {/* Left wing: ◀ + label — hugs the dots from the left */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.3rem' }}>
                      <button
                        onClick={goToPrevSegment}
                        disabled={segmentContext.currentSegmentIndex === 0}
                        aria-label="Previous segment"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: segmentContext.currentSegmentIndex === 0 ? theme.colors.textMuted : theme.colors.textPrimary,
                          cursor: segmentContext.currentSegmentIndex === 0 ? 'not-allowed' : 'pointer',
                          fontSize: 20,
                          padding: '0.25rem 0.4rem',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        ◀
                      </button>
                      <div
                        style={{
                          color: theme.colors.textSecondary,
                          fontSize: 11,
                          fontFamily: theme.fontFamily,
                        }}
                      >
                        Segment:
                      </div>
                    </div>

                    {/* Center: dots — true center anchor */}
                    <div style={{ display: 'flex', gap: '0.4rem', margin: '0 0.6rem' }}>
                      {segments.map((segment, idx) => (
                        <button
                          key={segment.id}
                          onClick={() => goToSegment(idx)}
                          aria-label={`Go to segment ${idx}: ${segment.id}`}
                          aria-current={idx === segmentContext.currentSegmentIndex ? 'true' : 'false'}
                          title={segment.id}
                          style={{
                            width: idx === segmentContext.currentSegmentIndex ? 20 : 8,
                            height: 8,
                            borderRadius: 4,
                            background: idx === segmentContext.currentSegmentIndex ? theme.colors.primary : theme.colors.textMuted,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            padding: 0
                          }}
                        />
                      ))}
                    </div>

                    {/* Right wing: ▶ + counter — hugs dots from right */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '0.3rem' }}>
                      <button
                        onClick={goToNextSegment}
                        disabled={segmentContext.currentSegmentIndex === segments.length - 1}
                        aria-label="Next segment"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: segmentContext.currentSegmentIndex === segments.length - 1 ? theme.colors.textMuted : theme.colors.textPrimary,
                          cursor: segmentContext.currentSegmentIndex === segments.length - 1 ? 'not-allowed' : 'pointer',
                          fontSize: 20,
                          padding: '0.25rem 0.4rem',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        ▶
                      </button>
                      <div
                        style={{
                          color: theme.colors.textSecondary,
                          fontSize: 12,
                          fontFamily: theme.fontFamily,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {segmentContext.currentSegmentIndex} / {segments.length - 1}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              {/* Marker dots row (inside segment pill, centered) */}
              {markers.length > 0 && (
                <div
                  data-testid="marker-nav"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '0.15rem 1rem 0',
                  }}
                >
                  {/* Left wing */}
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.3rem' }}>
                    <button
                      onClick={() => {
                        const prev = [...markers].reverse().find(m => m.time < currentTime - 0.05);
                        if (prev) audioTimeCtx?.seekToTime(prev.time);
                      }}
                      disabled={currentMarkerIndex <= 0}
                      aria-label="Previous marker"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: currentMarkerIndex <= 0 ? theme.colors.textMuted : theme.colors.textPrimary,
                        cursor: currentMarkerIndex <= 0 ? 'not-allowed' : 'pointer',
                        fontSize: 16,
                        padding: '0.15rem 0.3rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      ◀
                    </button>
                    <div
                      style={{
                        color: theme.colors.textSecondary,
                        fontSize: 11,
                        fontFamily: theme.fontFamily,
                      }}
                    >
                      Markers:
                    </div>
                  </div>

                  {/* Center: dots */}
                  <div style={{ display: 'flex', gap: '0.4rem', margin: '0 0.6rem' }}>
                    {markers.map((marker, idx) => (
                      <button
                        key={marker.id}
                        onClick={() => audioTimeCtx?.seekToTime(marker.time)}
                        aria-label={`Go to marker ${idx}: ${marker.id}`}
                        title={marker.id}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 1,
                          transform: 'rotate(45deg)',
                          background: idx === currentMarkerIndex
                            ? theme.colors.primary
                            : idx < currentMarkerIndex
                            ? `${theme.colors.primary}80`
                            : theme.colors.textMuted,
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          padding: 0
                        }}
                      />
                    ))}
                  </div>

                  {/* Right wing */}
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '0.3rem' }}>
                    <button
                      onClick={() => {
                        const next = markers.find(m => m.time > currentTime + 0.05);
                        if (next) audioTimeCtx?.seekToTime(next.time);
                      }}
                      disabled={currentMarkerIndex >= markers.length - 1}
                      aria-label="Next marker"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: currentMarkerIndex >= markers.length - 1 ? theme.colors.textMuted : theme.colors.textPrimary,
                        cursor: currentMarkerIndex >= markers.length - 1 ? 'not-allowed' : 'pointer',
                        fontSize: 16,
                        padding: '0.15rem 0.3rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      ▶
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>
      )}


      {/* Keyboard hint (hidden when manual nav disabled) */}
      {!disableManualNav && (
        <div data-testid="keyboard-hint" style={{
        position: 'fixed',
        top: 20,
        right: 20,
        color: theme.colors.textMuted,
        fontSize: 12,
        fontFamily: theme.fontFamily,
        background: `${theme.colors.bgDeep}cc`,
        padding: '0.5rem 1rem',
        borderRadius: 8,
        backdropFilter: 'blur(10px)'
        }}>
          Use ← → or Space to navigate
        </div>
      )}
    </div>
  );
};