import React, { useState, useMemo } from 'react';
import { ReducedMotionToggle } from './accessibility/ReducedMotion';
import { SlidePlayer, Slide } from './components/SlidePlayer';
import { NarratedController } from './components/NarratedController';
import { allSlides } from './slides/SlidesRegistry';

export const App: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<{ chapter: number; utterance: number } | undefined>(undefined);
  const [isNarratedMode, setIsNarratedMode] = useState(false);
  const [manualSlideChange, setManualSlideChange] = useState<{ chapter: number; utterance: number } | null>(null);

  // Build slides from component metadata
  const slides = useMemo((): Slide[] => {
    const builtSlides = allSlides.map(slideComponent => ({
      chapter: slideComponent.metadata.chapter,
      utterance: slideComponent.metadata.utterance,
      title: slideComponent.metadata.title,
      Component: slideComponent
    }));
    console.log('[App] Built slides from metadata:', builtSlides.map(s => `Ch${s.chapter}:U${s.utterance}`));
    return builtSlides;
  }, []);

  const handleSlideChange = (chapter: number, utterance: number) => {
    setCurrentSlide({ chapter, utterance });
  };

  const handleManualSlideChange = (chapter: number, utterance: number) => {
    // This is called by SlidePlayer when user manually navigates
    setManualSlideChange({ chapter, utterance });
    setCurrentSlide({ chapter, utterance });
  };

  const handlePlaybackStart = () => {
    setIsNarratedMode(true);
  };

  const handlePlaybackEnd = () => {
    setIsNarratedMode(false);
    setCurrentSlide(undefined);
  };

  return (
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
  );
};

export default App;