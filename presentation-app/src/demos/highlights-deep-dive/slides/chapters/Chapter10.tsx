import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useReducedMotion,
  useSegmentedAnimation,
  useTheme,
  defineSlide,
  SlideContainer,
  SlideTitle,
  typography,
  fadeUp,
} from '@framework';

/**
 * Chapter 10: Lessons + Closing (2 slides)
 */

const LESSONS = [
  { num: 1, title: 'Challenge the multi-call assumption', desc: 'A single well-structured prompt can replace an entire pipeline' },
  { num: 2, title: 'Input format is a cost lever', desc: 'Compact representation (turn tags, pipe-delimited) slashes tokens' },
  { num: 3, title: 'Pseudocode beats prose', desc: 'Executable instructions reduce ambiguity and improve consistency' },
  { num: 4, title: 'Force the model to ground itself', desc: 'Copy-then-parse prevents hallucination of IDs and references' },
  { num: 5, title: 'Self-checks enable automation', desc: 'Boolean validators let you detect and retry failures automatically' },
  { num: 6, title: 'Build a local evaluation loop', desc: 'Quantitative error stats + qualitative video review accelerate prompt iteration' }
];

// ---------- Slide 1: Lessons ----------

const Ch10_S1_LessonsComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible, currentSegmentIndex } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={800}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <SlideTitle reduced={reduced}>
            Six Lessons for Your Next LLM Pipeline
          </SlideTitle>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {LESSONS.map((lesson, i) => {
          const segIdx = i + 1;
          const isActive = currentSegmentIndex === segIdx;

          return (
            <AnimatePresence key={lesson.num}>
              {isSegmentVisible(segIdx) && (
                <motion.div
                  variants={fadeUp(reduced)}
                  initial="hidden"
                  animate="visible"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '0.85rem 1.25rem',
                    borderRadius: 12,
                    background: isActive
                      ? `linear-gradient(135deg, rgba(0, 183, 195, 0.1), rgba(0, 120, 212, 0.1))`
                      : theme.colors.bgSurface,
                    border: isActive
                      ? `2px solid ${theme.colors.primary}`
                      : `1px solid ${theme.colors.bgBorder}`,
                    boxShadow: isActive && !reduced
                      ? `0 0 15px rgba(0, 183, 195, 0.15)`
                      : 'none',
                    transition: 'all 0.3s ease',
                    opacity: isSegmentVisible(segIdx) ? 1 : 0
                  }}
                >
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: isActive
                      ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                      : theme.colors.bgBorder,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#fff',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    {lesson.num}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{
                      ...typography.body,
                      fontSize: 16,
                      fontWeight: 600,
                      color: isActive ? theme.colors.primary : theme.colors.textPrimary
                    }}>
                      {lesson.title}
                    </div>
                    <div style={{ ...typography.caption, fontSize: 13, marginTop: 2 }}>
                      {lesson.desc}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </div>
    </SlideContainer>
  );
};

export const Ch10_S1_Lessons = defineSlide({
  metadata: {
    chapter: 10,
    slide: 1,
    title: 'Six Lessons',
    audioSegments: [
      { id: 'title', audioFilePath: '/audio/highlights-deep-dive/c10/s1_segment_01_title.wav' },
      { id: 'lesson1', audioFilePath: '/audio/highlights-deep-dive/c10/s1_segment_02_lesson1.wav' },
      { id: 'lesson2', audioFilePath: '/audio/highlights-deep-dive/c10/s1_segment_03_lesson2.wav' },
      { id: 'lesson3', audioFilePath: '/audio/highlights-deep-dive/c10/s1_segment_04_lesson3.wav' },
      { id: 'lesson4', audioFilePath: '/audio/highlights-deep-dive/c10/s1_segment_05_lesson4.wav' },
      { id: 'lesson5', audioFilePath: '/audio/highlights-deep-dive/c10/s1_segment_06_lesson5.wav' },
      { id: 'lesson6', audioFilePath: '/audio/highlights-deep-dive/c10/s1_segment_07_lesson6.wav' }
    ]
  },
  component: Ch10_S1_LessonsComponent
});

// ---------- Slide 2: Closing ----------

const Ch10_S2_ClosingComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <motion.div
            initial={{ opacity: 0, scale: reduced ? 1 : 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduced ? 0.3 : 0.8, type: 'spring' }}
            style={{ textAlign: 'center', marginBottom: '2rem' }}
          >
            <h1 style={{
              fontSize: 56,
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem'
            }}>
              Thank You
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(1) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{ textAlign: 'center' }}
          >
            <div style={{
              display: 'inline-block',
              background: `linear-gradient(135deg, rgba(0, 183, 195, 0.15), rgba(0, 120, 212, 0.15))`,
              border: `1px solid ${theme.colors.primary}`,
              borderRadius: 10,
              padding: '0.75rem 2rem',
              fontSize: 16,
              color: theme.colors.primary,
              fontWeight: 600
            }}>
              Try the techniques — prompt engineering scales
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch10_S2_Closing = defineSlide({
  metadata: {
    chapter: 10,
    slide: 2,
    title: 'Closing',
    audioSegments: [
      { id: 'thankyou', audioFilePath: '/audio/highlights-deep-dive/c10/s2_segment_01_thankyou.wav' },
      { id: 'cta', audioFilePath: '/audio/highlights-deep-dive/c10/s2_segment_02_cta.wav' }
    ]
  },
  component: Ch10_S2_ClosingComponent
});
