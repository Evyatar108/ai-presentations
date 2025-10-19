import React, { useState, useMemo } from 'react';
import { ReducedMotionToggle } from './accessibility/ReducedMotion';
import { SlidePlayer, Slide } from './components/SlidePlayer';
import { NarratedController } from './components/NarratedController';
import { allSlides } from './slides/SlidesRegistry';
import { SegmentProvider } from './contexts/SegmentContext';
import 'reactflow/dist/style.css';

export const App: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<{ chapter: number; slide: number } | undefined>(undefined);
  const [isNarratedMode, setIsNarratedMode] = useState(false);
  const [manualSlideChange, setManualSlideChange] = useState<{ chapter: number; slide: number } | null>(null);

  // Build slides from component metadata
  // Build slides from component metadata
  const slides = useMemo((): Slide[] => {
    const builtSlides = allSlides.map(slideComponent => ({
      chapter: slideComponent.metadata.chapter,
      slide: slideComponent.metadata.slide,
      title: slideComponent.metadata.title,
      Component: slideComponent
    }));
    console.log('[App] Built slides from metadata:', builtSlides.map(s => `Ch${s.chapter}:S${s.slide}`));
    return builtSlides;
  }, []);
  const handleSlideChange = (chapter: number, slide: number) => {
    setCurrentSlide({ chapter, slide });
  };

  const handleManualSlideChange = (chapter: number, slide: number) => {
    // This is called by SlidePlayer when user manually navigates
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

  return (
    <SegmentProvider>
      <div style={{ position: 'relative' }}>
        {/* Narrated Controller (manages audio and slide progression) */}
        <NarratedController
          onSlideChange={handleSlideChange}
          onPlaybackStart={handlePlaybackStart}
          onPlaybackEnd={handlePlaybackEnd}
          manualSlideChange={manualSlideChange}
        />

        {/* Slide presentation */}
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

export default App;