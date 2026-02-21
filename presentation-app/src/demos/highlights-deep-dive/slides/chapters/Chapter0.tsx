import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion, useTheme, defineSlide, SlideContainer } from '@framework';

/**
 * Chapter 0: Introduction (1 slide)
 * Title slide with presentation name and subtitle
 */

const Ch0_S1_TitleComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();

  return (
    <SlideContainer>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0.3 : 1 }}
        style={{ textAlign: 'center' }}
      >
        <motion.h1
          initial={{ opacity: 0, y: reduced ? 0 : -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.3 : 0.8, delay: reduced ? 0 : 0.3 }}
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: theme.colors.textPrimary,
            marginBottom: '1.5rem',
            lineHeight: 1.2
          }}
        >
          From 4 Calls to 1
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0.2 : 0.6, delay: reduced ? 0 : 0.8 }}
          style={{
            fontSize: 20,
            color: theme.colors.primary,
            fontWeight: 500,
            marginBottom: '0.5rem'
          }}
        >
          Redesigning the Meeting Highlights Prompt
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0.2 : 0.6, delay: reduced ? 0 : 1.2 }}
          style={{
            fontSize: 16,
            color: theme.colors.textSecondary
          }}
        >
          A Prompt Engineering Deep-Dive
        </motion.p>
      </motion.div>
    </SlideContainer>
  );
};

export const Ch0_S1_Title = defineSlide({
  metadata: {
    chapter: 0,
    slide: 1,
    title: 'Title',
    audioSegments: [{ id: 'main' }]
  },
  component: Ch0_S1_TitleComponent
});
