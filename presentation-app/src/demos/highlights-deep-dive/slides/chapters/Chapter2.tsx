import React from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  useReducedMotion,
  useSegmentedAnimation,
  defineSlide,
  SlideContainer,
  SlideTitle,
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
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <SlideTitle reduced={reduced}>
            The Four-Call Pipeline
          </SlideTitle>
        )}
      </AnimatePresence>

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
      { id: 'title', audioFilePath: '/audio/highlights-deep-dive/c2/s1_segment_01_title.wav' },
      { id: 'call1', audioFilePath: '/audio/highlights-deep-dive/c2/s1_segment_02_call1.wav' },
      { id: 'call2', audioFilePath: '/audio/highlights-deep-dive/c2/s1_segment_03_call2.wav' },
      { id: 'call3', audioFilePath: '/audio/highlights-deep-dive/c2/s1_segment_04_call3.wav' },
      { id: 'call4', audioFilePath: '/audio/highlights-deep-dive/c2/s1_segment_05_call4.wav' }
    ]
  },
  component: Ch2_S1_FourCallsComponent
});

