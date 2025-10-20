import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../../../accessibility/ReducedMotion';
import { SlideComponentWithMetadata } from '../../../../slides/SlideMetadata';
import { SlideContainer } from '../../../../slides/SlideLayouts';

/**
 * Chapter 0: Introduction
 * Single blank intro slide to start narration cleanly
 */

/**
 * Blank Intro Slide - Simple dark screen to start narration cleanly
 */
export const BlankIntro: SlideComponentWithMetadata = () => {
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

BlankIntro.metadata = {
  chapter: 0,
  slide: 0,
  title: "Intro",
  audioSegments: [{ id: "main", audioFilePath: "/audio/meeting-highlights/c0/s0_segment_01_main.wav" }]
};