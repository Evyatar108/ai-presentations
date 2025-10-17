import React, { useState } from 'react';
import { ReducedMotionToggle } from './accessibility/ReducedMotion';
import { SlidePlayer, Slide } from './components/SlidePlayer';
import { NarratedController } from './components/NarratedController';
import {
  Slide18Blank,
  Slide19Challenge,
  Slide20FourPrompts,
  Slide21TopicAbstraction,
  Slide22ExtractiveSelection,
  Slide23QualityRanking,
  Slide24NarrativeSynthesis,
  Slide25Convergence,
  Slide26UnifiedFlow,
  Slide27TokenOptimization,
  Slide28CallReduction,
  Slide29GPUReduction,
  Slide32PathToGA
} from './slides/AnimatedSlides';
import { CostCurve, QualityComparison } from './components/ImpactComponents';

const slides: Slide[] = [
  { id: 18, title: 'Intro', Component: Slide18Blank },
  { id: 19, title: 'Challenge Framing', Component: Slide19Challenge },
  { id: 20, title: 'Four-Prompt Pipeline', Component: Slide20FourPrompts },
  { id: 21, title: 'Prompt 1: Topic Abstraction', Component: Slide21TopicAbstraction },
  { id: 22, title: 'Prompt 2: Extractive Selection', Component: Slide22ExtractiveSelection },
  { id: 23, title: 'Prompt 3: Quality Ranking', Component: Slide23QualityRanking },
  { id: 24, title: 'Prompt 4: Narrative Synthesis', Component: Slide24NarrativeSynthesis },
  { id: 25, title: 'Unified Convergence', Component: Slide25Convergence },
  { id: 26, title: 'Unified Flow Details', Component: Slide26UnifiedFlow },
  { id: 27, title: 'Token Optimization', Component: Slide27TokenOptimization },
  { id: 28, title: 'Call Reduction', Component: Slide28CallReduction },
  { id: 29, title: 'GPU Optimization', Component: Slide29GPUReduction },
  { id: 30, title: 'Cost Savings', Component: CostCurve },
  { id: 31, title: 'Quality Improvement', Component: QualityComparison },
  { id: 32, title: 'Path to GA', Component: Slide32PathToGA }
];

export const App: React.FC = () => {
  const [currentSlideId, setCurrentSlideId] = useState<number | undefined>(undefined);
  const [isNarratedMode, setIsNarratedMode] = useState(false);

  const handleSlideChange = (slideId: number) => {
    setCurrentSlideId(slideId);
  };

  const handlePlaybackStart = () => {
    setIsNarratedMode(true);
  };

  const handlePlaybackEnd = () => {
    setIsNarratedMode(false);
    setCurrentSlideId(undefined);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Narrated Controller (manages audio and slide progression) */}
      <NarratedController
        onSlideChange={handleSlideChange}
        onPlaybackStart={handlePlaybackStart}
        onPlaybackEnd={handlePlaybackEnd}
      />

      {/* Slide presentation */}
      <SlidePlayer
        slides={slides}
        autoAdvance={false}
        externalSlideId={currentSlideId}
        disableManualNav={isNarratedMode}
      />
    </div>
  );
};

export default App;