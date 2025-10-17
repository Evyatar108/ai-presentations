import React from 'react';
import { ReducedMotionToggle } from './accessibility/ReducedMotion';
import { SlidePlayer, Slide } from './components/SlidePlayer';
import {
  Slide19Challenge,
  Slide20FourPrompts,
  Slide25Convergence,
  Slide28CallReduction,
  Slide29GPUReduction
} from './slides/AnimatedSlides';
import { GPUReduction, CostCurve, QualityComparison, RoadmapSlide } from './components/ImpactComponents';

const slides: Slide[] = [
  { id: 19, title: 'Challenge Framing', Component: Slide19Challenge },
  { id: 20, title: 'Four-Prompt Pipeline', Component: Slide20FourPrompts },
  { id: 25, title: 'Unified Convergence', Component: Slide25Convergence },
  { id: 28, title: 'Call Reduction', Component: Slide28CallReduction },
  { id: 29, title: 'GPU Optimization', Component: Slide29GPUReduction },
  { id: 30, title: 'Cost Savings', Component: CostCurve },
  { id: 31, title: 'Quality Improvement', Component: QualityComparison },
  { id: 32, title: 'Roadmap', Component: RoadmapSlide }
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