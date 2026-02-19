import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion, defineSlide, SlideContainer } from '@framework';

/**
 * Chapter 0: Introduction
 * Single blank intro slide to start narration cleanly
 */

const BlankIntroComponent: React.FC = () => {
  const { reduced } = useReducedMotion();

  return (
    <SlideContainer>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0.3 : 0.8 }}
      />
    </SlideContainer>
  );
};

/**
 * Blank Intro Slide - Simple dark screen to start narration cleanly
 */
export const BlankIntro = defineSlide({
  metadata: {
    chapter: 0,
    slide: 0,
    title: "Intro",
    audioSegments: [{ id: "main", audioFilePath: "/audio/meeting-highlights/c0/s0_segment_01_main.wav" }]
  },
  component: BlankIntroComponent
});
