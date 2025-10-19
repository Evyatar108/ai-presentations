import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { useSegmentedAnimation } from '../../contexts/SegmentContext';
import { SlideComponentWithMetadata } from '../SlideMetadata';
import { SlideContainer, ContentCard, SlideTitle } from '../SlideLayouts';
import { typography, gradientBox, successGradientBox } from '../SlideStyles';
import { scaleIn, fadeUp } from '../AnimationVariants';

/**
 * Chapter 8: User Reception
 * Single slide showing user satisfaction metrics
 */

/**
 * Chapter 8, Slide 1 - User Satisfaction
 */
export const Ch8_S1_UserSatisfaction: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <SlideContainer maxWidth={900}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <SlideTitle reduced={reduced} subtitle="MS Elite Survey Results">
            User Reception
          </SlideTitle>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
        <AnimatePresence>
          {isSegmentVisible(1) && (
            <motion.div
              variants={scaleIn(reduced)}
              initial="hidden"
              animate="visible"
              style={{
                ...gradientBox,
                padding: '3rem 2rem',
                boxShadow: !reduced ? '0 0 40px rgba(0, 183, 195, 0.3)' : 'none'
              }}
            >
              <div style={{ fontSize: 72, fontWeight: 'bold', color: '#00B7C3', marginBottom: '1rem' }}>
                80%
              </div>
              <div style={{ ...typography.h2, fontSize: 18, marginBottom: '0.5rem' }}>
                Extremely/Very Useful
              </div>
              <div style={{ ...typography.caption, fontSize: 14 }}>
                ⭐⭐⭐⭐⭐
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSegmentVisible(2) && (
            <motion.div
              variants={scaleIn(reduced)}
              initial="hidden"
              animate="visible"
              style={{
                ...successGradientBox,
                padding: '3rem 2rem',
                boxShadow: !reduced ? '0 0 40px rgba(16, 185, 129, 0.3)' : 'none'
              }}
            >
              <div style={{ fontSize: 72, fontWeight: 'bold', color: '#10b981', marginBottom: '1rem' }}>
                96%
              </div>
              <div style={{ ...typography.h2, fontSize: 18, marginBottom: '0.5rem' }}>
                Likely to Use Again
              </div>
              <div style={{ ...typography.caption, fontSize: 14 }}>
                👍👍👍
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isSegmentVisible(3) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
          >
            <ContentCard>
              <p style={{ ...typography.body, fontSize: 20, fontWeight: 600, margin: 0 }}>
                Strong product-market fit and daily habit formation
              </p>
            </ContentCard>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

Ch8_S1_UserSatisfaction.metadata = {
  chapter: 8,
  slide: 1,
  title: "User Satisfaction",
  audioSegments: [
    {
      id: "intro",
      audioFilePath: "/audio/c8/s1_segment_01_intro.wav",
      narrationText: "Meeting Highlights has received overwhelmingly positive feedback in recent MS Elite surveys."
    },
    {
      id: "useful",
      audioFilePath: "/audio/c8/s1_segment_02_useful.wav",
      narrationText: "More than 80 percent of users rated Meeting Highlights as extremely useful or very useful."
    },
    {
      id: "likely",
      audioFilePath: "/audio/c8/s1_segment_03_likely.wav",
      narrationText: "96 percent shared that they are very likely or likely to use the feature again."
    },
    {
      id: "fit",
      audioFilePath: "/audio/c8/s1_segment_04_fit.wav",
      narrationText: "This points to strong product-market fit and daily habit formation among our users."
    }
  ]
};