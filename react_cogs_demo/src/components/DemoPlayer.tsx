import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DemoRegistry } from '../demos/DemoRegistry';
import type { DemoConfig } from '../demos/types';
import type { SlideComponentWithMetadata } from '../slides/SlideMetadata';
import { NarratedController } from './NarratedController';
import { SlidePlayer, Slide } from './SlidePlayer';
import { SegmentProvider } from '../contexts/SegmentContext';

interface DemoPlayerProps {
  demoId: string;
  onBack: () => void;
}

export const DemoPlayer: React.FC<DemoPlayerProps> = ({ demoId, onBack }) => {
  const [demoConfig, setDemoConfig] = useState<DemoConfig | null>(null);
  const [loadedSlides, setLoadedSlides] = useState<SlideComponentWithMetadata[]>([]);
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

  // Build slides from loaded demo config
  const slides = useMemo((): Slide[] => {
    if (!loadedSlides || loadedSlides.length === 0) return [];
    
    return loadedSlides.map(slideComponent => ({
      chapter: slideComponent.metadata.chapter,
      slide: slideComponent.metadata.slide,
      title: slideComponent.metadata.title,
      Component: slideComponent
    }));
  }, [loadedSlides]);

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
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#f1f5f9'
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
            borderTop: '4px solid #00B7C3',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ fontSize: 18, color: '#94a3b8' }}>Loading demo...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
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
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#f1f5f9'
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
            color: '#ef4444',
            marginBottom: '1rem'
          }}>
            Failed to Load Demo
          </h2>
          <p style={{
            fontSize: 16,
            color: '#94a3b8',
            marginBottom: '2rem'
          }}>
            {error || 'Demo configuration could not be loaded'}
          </p>
          <button
            onClick={onBack}
            style={{
              background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
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
            color: '#f1f5f9',
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
            fontFamily: 'Inter, system-ui, sans-serif',
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
        <NarratedController
          demoMetadata={demoConfig.metadata}
          demoTiming={demoConfig.timing}
          slides={loadedSlides}
          onSlideChange={handleSlideChange}
          onPlaybackStart={handlePlaybackStart}
          onPlaybackEnd={handlePlaybackEnd}
          manualSlideChange={manualSlideChange}
          onBack={onBack}
        />

        {/* Slide Player */}
        <SlidePlayer
          slides={slides}
          autoAdvance={false}
          externalSlide={currentSlide}
          onSlideChange={handleManualSlideChange}
          disableManualNav={isNarratedMode}
        />
      </div>
    </SegmentProvider>
  );
};