import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DemoRegistry } from '../demos/DemoRegistry';
import type { DemoConfig } from '../demos/types';
import type { SlideComponentWithMetadata } from '../slides/SlideMetadata';
import { validateDemoSlides } from '../slides/validateSlideMetadata';
import { NarratedController } from './NarratedController';
import { SlidePlayer, Slide } from './SlidePlayer';
import { SegmentProvider } from '../contexts/SegmentContext';
import { AudioTimeProvider } from '../contexts/AudioTimeContext';
import { HideInterfaceProvider } from '../contexts/HideInterfaceContext';
import { loadNarration, getNarrationSegment, type NarrationData } from '../utils/narrationLoader';
import { loadAlignment } from '../utils/alignmentLoader';
import { resolveAudioFilePath } from '../utils/audioPath';
import { useTheme } from '../theme/ThemeContext';
import { DemoPlayerBoundary } from './DemoPlayerBoundary';
import { StalenessWarning } from './StalenessWarning';
import type { DemoAlignment } from '../alignment/types';

export interface AutoplayConfig {
  mode: 'narrated';
  hideInterface: boolean;
  zoom: boolean;
  signalPort?: number;
}

export interface DemoPlayerProps {
  demoId: string;
  onBack: () => void;
  onHideInterfaceChange?: (hidden: boolean) => void;
  autoplay?: AutoplayConfig;
}

export const DemoPlayer: React.FC<DemoPlayerProps> = ({ demoId, onBack, onHideInterfaceChange, autoplay }) => {
  const theme = useTheme();
  const [demoConfig, setDemoConfig] = useState<DemoConfig | null>(null);
  const [loadedSlides, setLoadedSlides] = useState<SlideComponentWithMetadata[]>([]);
  const [narrationData, setNarrationData] = useState<NarrationData | null>(null);
  const [alignmentData, setAlignmentData] = useState<DemoAlignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState<{ chapter: number; slide: number } | undefined>(undefined);
  const [isNarratedMode, setIsNarratedMode] = useState(false);
  const [manualSlideChange, setManualSlideChange] = useState<{ chapter: number; slide: number } | null>(null);
  const [hideInterface, setHideInterface] = useState(autoplay?.hideInterface ?? false);
  const [zoomEnabled, setZoomEnabled] = useState(autoplay?.zoom ?? false);
  const [chapterModeEnabled, setChapterModeEnabled] = useState(false);

  const handleHideInterfaceChange = useCallback((hidden: boolean) => {
    setHideInterface(hidden);
    onHideInterfaceChange?.(hidden);
  }, [onHideInterfaceChange]);

  // ESC key navigates back to demos list
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  // Load demo configuration and slides
  useEffect(() => {
    let mounted = true;

    const loadDemo = async () => {
      try {
        setLoading(true);
        setError(null);
        const config = await DemoRegistry.loadDemoConfig(demoId);
        
        if (!mounted) return;
        
        // Load slides
        const slides = await config.getSlides();
        
        if (!mounted) return;
        
        // Always try to load narration.json (silent for inline demos)
        const narration = await loadNarration(
          config.metadata.id,
          config.metadata.useExternalNarration ? undefined : { silent: true }
        );
        if (!mounted) return;
        setNarrationData(narration);

        // Load alignment data (for marker-based sub-segment reveals)
        const alignment = await loadAlignment(demoId);
        if (!mounted) return;
        setAlignmentData(alignment);

        // Dev-only validation of slide metadata
        if (import.meta.env.DEV) {
          validateDemoSlides(slides);
        }

        setDemoConfig(config);
        setLoadedSlides(slides);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load demo');
        setLoading(false);
      }
    };

    loadDemo();

    return () => {
      mounted = false;
    };
  }, [demoId]);

  // Build slides with narration merged from JSON (if enabled)
  const slidesWithNarration = useMemo((): SlideComponentWithMetadata[] => {
    if (!loadedSlides || loadedSlides.length === 0) return [];
    if (!narrationData) return loadedSlides;
    
    // Merge external narration into slide metadata
    return loadedSlides.map(slideComponent => {
      const fallbackMode = demoConfig?.metadata.narrationFallback || 'inline';
      
      const chapter = slideComponent.metadata.chapter;
      const slide = slideComponent.metadata.slide;

      // Update each segment with narration fields from JSON
      const updatedSegments = slideComponent.metadata.audioSegments.map(segment => {
        const narrationSeg = getNarrationSegment(narrationData, chapter, slide, segment.id);

        // Hybrid fallback: JSON → inline → error/silent
        if (narrationSeg) {
          // Spread all narration fields (narrationText, instruct, visualDescription, etc.)
          const { id: _, ...narrationOverrides } = narrationSeg;
          return { ...segment, ...narrationOverrides };
        } else if (segment.narrationText) {
          // Fall back to inline narration
          if (fallbackMode === 'inline') {
            console.warn(
              `[DemoPlayer] Using inline narration for ch${chapter}:s${slide}:${segment.id} ` +
              `(not found in narration.json)`
            );
          } else if (fallbackMode === 'error') {
            console.error(
              `[DemoPlayer] Missing narration in JSON for ch${chapter}:s${slide}:${segment.id}, ` +
              `falling back to inline`
            );
          }
          // 'silent' mode: no console output
          return segment;
        } else {
          // No narration available at all
          if (fallbackMode !== 'silent') {
            console.error(
              `[DemoPlayer] No narration available for ch${chapter}:s${slide}:${segment.id} ` +
              `(missing in both JSON and inline)`
            );
          }
          return segment;
        }
      });
      
      // Also merge slide-level instruct from narration.json
      const narrationSlide = narrationData.slides.find(
        s => s.chapter === chapter && s.slide === slide
      );

      // Create a new component wrapper with updated metadata (avoids mutating the original)
      const updatedComponent: SlideComponentWithMetadata = Object.assign(
        (props: Record<string, never>) => slideComponent(props),
        {
          metadata: {
            ...slideComponent.metadata,
            audioSegments: updatedSegments,
            ...(narrationSlide?.instruct !== undefined ? { instruct: narrationSlide.instruct } : {}),
          }
        }
      );

      return updatedComponent;
    });
  }, [loadedSlides, narrationData, demoConfig]);
  
  // Resolve auto-derived audioFilePaths for segments that omit it
  const slidesWithResolvedPaths = useMemo((): SlideComponentWithMetadata[] => {
    if (!slidesWithNarration || slidesWithNarration.length === 0) return [];

    // Fast path: if every segment already has audioFilePath, skip mapping
    const allResolved = slidesWithNarration.every(sc =>
      sc.metadata.audioSegments.every(seg => !!seg.audioFilePath)
    );
    if (allResolved) return slidesWithNarration;

    return slidesWithNarration.map(slideComponent => {
      const { chapter, slide, audioSegments } = slideComponent.metadata;
      const hasUnresolved = audioSegments.some(seg => !seg.audioFilePath);
      if (!hasUnresolved) return slideComponent;

      const resolvedSegments = audioSegments.map((segment, i) =>
        segment.audioFilePath
          ? segment
          : { ...segment, audioFilePath: resolveAudioFilePath(segment, demoId, chapter, slide, i) }
      );

      return Object.assign(
        (props: Record<string, never>) => slideComponent(props),
        {
          metadata: {
            ...slideComponent.metadata,
            audioSegments: resolvedSegments,
          }
        }
      ) as SlideComponentWithMetadata;
    });
  }, [slidesWithNarration, demoId]);

  // Build slides for SlidePlayer from slides with resolved paths
  const slides = useMemo((): Slide[] => {
    if (!slidesWithResolvedPaths || slidesWithResolvedPaths.length === 0) return [];

    return slidesWithResolvedPaths.map(slideComponent => ({
      chapter: slideComponent.metadata.chapter,
      slide: slideComponent.metadata.slide,
      title: slideComponent.metadata.title,
      Component: slideComponent
    }));
  }, [slidesWithResolvedPaths]);

  const handleSlideChange = (chapter: number, slide: number) => {
    setCurrentSlide({ chapter, slide });
  };

  const handleManualSlideChange = (chapter: number, slide: number) => {
    setManualSlideChange({ chapter, slide });
    setCurrentSlide({ chapter, slide });
  };

  const handlePlaybackStart = () => {
    setIsNarratedMode(true);
  };

  const handlePlaybackEnd = () => {
    setIsNarratedMode(false);
    setCurrentSlide(undefined);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.colors.bgDeep} 0%, ${theme.colors.bgSurface} 100%)`,
        fontFamily: theme.fontFamily,
        color: theme.colors.textPrimary
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{
            width: 48,
            height: 48,
            border: '4px solid rgba(0, 183, 195, 0.2)',
            borderTop: `4px solid ${theme.colors.primary}`,
            borderRadius: '50%',
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ fontSize: 18, color: theme.colors.textSecondary }}>Loading demo...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @media (prefers-reduced-motion: reduce) {
              * { animation: none !important; }
            }
          `}</style>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !demoConfig) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.colors.bgDeep} 0%, ${theme.colors.bgSurface} 100%)`,
        fontFamily: theme.fontFamily,
        color: theme.colors.textPrimary
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: 'center',
            maxWidth: 500,
            padding: '2rem'
          }}
        >
          <div style={{
            fontSize: 48,
            marginBottom: '1rem'
          }}>⚠️</div>
          <h2 style={{
            fontSize: 24,
            fontWeight: 600,
            color: theme.colors.error,
            marginBottom: '1rem'
          }}>
            Failed to Load Demo
          </h2>
          <p style={{
            fontSize: 16,
            color: theme.colors.textSecondary,
            marginBottom: '2rem'
          }}>
            {error || 'Demo configuration could not be loaded'}
          </p>
          <button
            onClick={onBack}
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '0.75rem 1.5rem',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ← Back to Demos
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <DemoPlayerBoundary onBack={onBack}>
    <HideInterfaceProvider value={hideInterface}>
    <SegmentProvider>
    <AudioTimeProvider alignment={alignmentData}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Dev-mode staleness warning */}
        {import.meta.env.DEV && (
          <StalenessWarning
            demoId={demoId}
            isNarratedMode={isNarratedMode}
            allSlides={slidesWithResolvedPaths}
            demoInstruct={demoConfig?.instruct ?? narrationData?.instruct}
            onAlignmentFixed={(newAlignment) => {
              setAlignmentData(newAlignment);
            }}
          />
        )}

        {/* Floating Back Button */}
        {!hideInterface && (
          <motion.button
            data-testid="back-button"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            style={{
              position: 'fixed',
              top: 20,
              left: 20,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(10px)',
              color: theme.colors.textPrimary,
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: 12,
              padding: '0.75rem 1.25rem',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: theme.fontFamily,
              transition: 'all 0.2s ease'
            }}
            whileHover={{
              background: 'rgba(0, 183, 195, 0.2)',
              borderColor: '#00B7C3'
            }}
          >
            <span>←</span>
            <span>Back to Demos</span>
          </motion.button>
        )}

        {/* Narrated Controller */}
        <NarratedController
          demoMetadata={demoConfig.metadata}
          demoTiming={demoConfig.timing}
          demoInstruct={demoConfig.instruct ?? narrationData?.instruct}
          startTransition={demoConfig.startTransition}
          slides={slidesWithResolvedPaths}
          alignmentData={alignmentData}
          chapters={demoConfig.chapters}
          chapterModeEnabled={chapterModeEnabled}
          onChapterModeToggle={setChapterModeEnabled}
          onSlideChange={handleSlideChange}
          onPlaybackStart={handlePlaybackStart}
          onPlaybackEnd={handlePlaybackEnd}
          manualSlideChange={manualSlideChange}
          hideInterface={hideInterface}
          onHideInterfaceChange={handleHideInterfaceChange}
          zoomEnabled={zoomEnabled}
          onZoomEnabledChange={setZoomEnabled}
          autoplay={autoplay}
        />
        {/* Slide Player */}
        <div
          style={{
            transform: zoomEnabled ? 'scale(1.8)' : undefined,
            transformOrigin: 'center center',
            width: '100%',
            height: '100%',
          }}
        >
          <SlidePlayer
            demoId={demoId}
            slides={slides}
            slidesWithMetadata={slidesWithResolvedPaths}
            autoAdvance={false}
            externalSlide={currentSlide}
            onSlideChange={handleManualSlideChange}
            disableManualNav={isNarratedMode}
            chaptersConfig={demoConfig.chapters}
            chapterModeEnabled={chapterModeEnabled}
          />
        </div>
      </div>
    </AudioTimeProvider>
    </SegmentProvider>
    </HideInterfaceProvider>
    </DemoPlayerBoundary>
  );
};