import React from 'react';
import { ReducedMotionToggle } from './accessibility/ReducedMotion';
import { SlidePlayer, Slide } from './components/SlidePlayer';
import {
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
  Slide29GPUReduction
} from './slides/AnimatedSlides';
import { CostCurve, QualityComparison } from './components/ImpactComponents';

const slides: Slide[] = [
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
  { id: 31, title: 'Quality Improvement', Component: QualityComparison }
];

export const App: React.FC = () => {
  return (
    <div style={{ position: 'relative' }}>
      {/* Reduced motion toggle overlay */}
      <div style={{
        position: 'fixed',
        top: 20,
        left: 20,
        zIndex: 2000
      }}>
        <ReducedMotionToggle />
      </div>

      {/* Slide presentation */}
      <SlidePlayer slides={slides} autoAdvance={false} />
    </div>
  );
};

export default App;