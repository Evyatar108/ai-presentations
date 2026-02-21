import React from 'react';
import {
  useReducedMotion,
  useSegmentedAnimation,
  defineSlide,
  SlideContainer,
  SlideTitle,
  Reveal,
} from '@framework';
import PipelineDiagram from '../components/PipelineDiagram';

/**
 * Chapter 2: V1 Pipeline Architecture (1 slide)
 */

// ---------- Slide 1: Four Calls ----------

const Ch2_S1_FourCallsComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible, currentSegmentIndex } = useSegmentedAnimation();

  // Segments 0=title, 1-4=each pipeline step
  const visibleSteps = Math.max(0, currentSegmentIndex);

  return (
    <SlideContainer maxWidth={900}>
      <Reveal from={0}>
        <SlideTitle reduced={reduced}>
          The Four-Call Pipeline
        </SlideTitle>
      </Reveal>

      {isSegmentVisible(1) && (
        <PipelineDiagram visibleSteps={visibleSteps} />
      )}
    </SlideContainer>
  );
};

export const Ch2_S1_FourCalls = defineSlide({
  metadata: {
    chapter: 2,
    slide: 1,
    title: 'Four-Call Pipeline',
    audioSegments: [
      { id: 'title' },
      { id: 'call1' },
      { id: 'call2' },
      { id: 'call3' },
      { id: 'call4' }
    ]
  },
  component: Ch2_S1_FourCallsComponent
});
