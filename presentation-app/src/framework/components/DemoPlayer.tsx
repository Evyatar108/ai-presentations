import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DemoRegistry } from '../demos/DemoRegistry';
import type { DemoConfig } from '../demos/types';
import type { SlideComponentWithMetadata } from '../slides/SlideMetadata';
import { validateDemoSlides } from '../slides/validateSlideMetadata';
import { NarratedController } from './NarratedController';
import { SlidePlayer, Slide } from './SlidePlayer';
import { SegmentProvider } from '../contexts/SegmentContext';
import { loadNarration, getNarrationText, type NarrationData } from '../utils/narrationLoader';
import { resolveAudioFilePath } from '../utils/audioPath';
import { useTheme } from '../theme/ThemeContext';
import { DemoPlayerBoundary } from './DemoPlayerBoundary';

export interface DemoPlayerProps {
  demoId: string;
  onBack: () => void;
}

export const DemoPlayer: React.FC<DemoPlayerProps> = ({ demoId, onBack }) => {
  const theme = useTheme();
  const [demoConfig, setDemoConfig] = useState<DemoConfig | null>(null);
  const [loadedSlides, setLoadedSlides] = useState<SlideComponentWithMetadata[]>([]);
  const [narrationData, setNarrationData] = useState<NarrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState<{ chapter: number; slide: number } | undefined>(undefined);
  const [isNarratedMode, setIsNarratedMode] = useState(false);
  const [manualSlideChange, setManualSlideChange] = useState<{ chapter: number; slide: number } | null>(null);

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
        
        // Load external narration if enabled
        let narration: NarrationData | null = null;
        if (config.metadata.useExternalNarration) {
          narration = await loadNarration(config.metadata.id);
          if (!mounted) return;
          setNarrationData(narration);
        }
        
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
    if (!demoConfig?.metadata.useExternalNarration) return loadedSlides;
    
    // Merge external narration into slide metadata
    return loadedSlides.map(slideComponent => {
      const fallbackMode = demoConfig.metadata.narrationFallback || 'inline';
      
      // Update each segment's narration text
      const updatedSegments = slideComponent.metadata.audioSegments.map(segment => {
        const externalNarration = getNarrationText(
          narrationData,
          slideComponent.metadata.chapter,
          slideComponent.metadata.slide,
          segment.id
        );
        
        // Hybrid fallback: JSON → inline → error/silent
        if (externalNarration !== null) {
          // Use external narration from JSON
          return { ...segment, narrationText: externalNarration };
        } else if (segment.narrationText) {
          // Fall back to inline narration
          if (fallbackMode === 'inline') {
            console.warn(
              `[DemoPlayer] Using inline narration for ch${slideComponent.metadata.chapter}:s${slideComponent.metadata.slide}:${segment.id} ` +
              `(not found in narration.json)`
            );
          } else if (fallbackMode === 'error') {
            console.error(
              `[DemoPlayer] Missing narration in JSON for ch${slideComponent.metadata.chapter}:s${slideComponent.metadata.slide}:${segment.id}, ` +
              `falling back to inline`
            );
          }
          // 'silent' mode: no console output
          return segment;
        } else {
          // No narration available at all
          if (fallbackMode !== 'silent') {
            console.error(
              `[DemoPlayer] No narration available for ch${slideComponent.metadata.chapter}:s${slideComponent.metadata.slide}:${segment.id} ` +
              `(missing in both JSON and inline)`
            );
          }
          return segment;
        }
      });
      
      // Create a new component wrapper with updated metadata (avoids mutating the original)
      const updatedComponent: SlideComponentWithMetadata = Object.assign(
        (props: Record<string, never>) => slideComponent(props),
        {
          metadata: {
            ...slideComponent.metadata,
            audioSegments: updatedSegments
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
    <SegmentProvider>
      <div style={{ position: 'relative' }}>
        {/* Floating Back Button */}
        <motion.button
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

        {/* Narrated Controller */}
        {/* Narrated Controller */}
        <NarratedController
          demoMetadata={demoConfig.metadata}
          demoTiming={demoConfig.timing}
          startTransition={demoConfig.startTransition}
          slides={slidesWithResolvedPaths}
          onSlideChange={handleSlideChange}
          onPlaybackStart={handlePlaybackStart}
          onPlaybackEnd={handlePlaybackEnd}
          manualSlideChange={manualSlideChange}
        />
        {/* Slide Player */}
        <SlidePlayer
          slides={slides}
          slidesWithMetadata={slidesWithResolvedPaths}
          autoAdvance={false}
          externalSlide={currentSlide}
          onSlideChange={handleManualSlideChange}
          disableManualNav={isNarratedMode}
        />
      </div>
    </SegmentProvider>
    </DemoPlayerBoundary>
  );
};