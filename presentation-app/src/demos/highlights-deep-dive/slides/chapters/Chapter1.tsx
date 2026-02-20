import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useReducedMotion,
  useSegmentedAnimation,
  useTheme,
  defineSlide,
  SlideContainer,
  SlideTitle,
  MetricTile,
  TestimonialCard,
  typography,
  layouts,
  fadeUp,
} from '@framework';

/**
 * Chapter 1: Problem Context (2 slides)
 */

// ---------- Slide 1: Product Context ----------

const Ch1_S1_ProductContextComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={1000}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <SlideTitle reduced={reduced}>
            Meeting Highlights: AI Video Recaps
          </SlideTitle>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(1) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}
          >
            {['Transcript', 'LLM', 'Video Assembly'].map((label, i) => (
              <React.Fragment key={label}>
                {i > 0 && (
                  <span style={{ fontSize: 24, color: theme.colors.primary }}>&#8594;</span>
                )}
                <div style={{
                  padding: '1rem 2rem',
                  borderRadius: 12,
                  background: i === 1
                    ? `linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))`
                    : theme.colors.bgSurface,
                  border: i === 1
                    ? `2px solid ${theme.colors.primary}`
                    : `1px solid ${theme.colors.bgBorder}`,
                  color: theme.colors.textPrimary,
                  fontWeight: 600,
                  fontSize: 16
                }}>
                  {label}
                </div>
              </React.Fragment>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(2) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{ ...layouts.grid2Col('2rem') }}
          >
            <div style={{
              background: theme.colors.bgSurface,
              borderRadius: 16,
              padding: '1.5rem',
              border: `1px solid ${theme.colors.bgBorder}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 36, marginBottom: '0.75rem' }}>&#x1F4DD;</div>
              <h3 style={{ ...typography.h2 }}>Abstractive Narration</h3>
              <p style={{ ...typography.caption, fontSize: 14 }}>
                AI-generated topic summaries spoken over video
              </p>
            </div>
            <div style={{
              background: theme.colors.bgSurface,
              borderRadius: 16,
              padding: '1.5rem',
              border: `1px solid ${theme.colors.bgBorder}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 36, marginBottom: '0.75rem' }}>&#x1F3AC;</div>
              <h3 style={{ ...typography.h2 }}>Extractive Clips</h3>
              <p style={{ ...typography.caption, fontSize: 14 }}>
                Key meeting moments with original audio
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch1_S1_ProductContext = defineSlide({
  metadata: {
    chapter: 1,
    slide: 1,
    title: 'Product Context',
    audioSegments: [
      { id: 'title', audioFilePath: '/audio/highlights-deep-dive/c1/s1_segment_01_title.wav' },
      { id: 'pipeline', audioFilePath: '/audio/highlights-deep-dive/c1/s1_segment_02_pipeline.wav' },
      { id: 'types', audioFilePath: '/audio/highlights-deep-dive/c1/s1_segment_03_types.wav' }
    ]
  },
  component: Ch1_S1_ProductContextComponent
});

// ---------- Slide 2: COGS Problem ----------

const Ch1_S2_COGSProblemComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={900}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{ ...layouts.flexRow('1.5rem'), marginBottom: '2rem' }}
          >
            <MetricTile label="LLM Calls" after="4" note="Sequential pipeline" />
            <MetricTile label="Projected GPUs" after="~600" note="A100 GPUs" />
            <MetricTile label="Status" after="Capacity Blocker" note="Blocking GA rollout" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(1) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{ marginBottom: '1.5rem' }}
          >
            <TestimonialCard
              quote="The current approach was consuming too many GPUs. We needed a fundamentally different strategy to make GA viable."
              author="Eli Lekhtser, Engineering Manager"
              reduced={reduced}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(2) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
          >
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 12,
              padding: '1.25rem',
              textAlign: 'center'
            }}>
              <p style={{ ...typography.body, margin: 0, fontWeight: 600, color: theme.colors.error }}>
                The fix had to come from prompt engineering
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch1_S2_COGSProblem = defineSlide({
  metadata: {
    chapter: 1,
    slide: 2,
    title: 'COGS Problem',
    audioSegments: [
      { id: 'metrics', audioFilePath: '/audio/highlights-deep-dive/c1/s2_segment_01_metrics.wav' },
      { id: 'quote', audioFilePath: '/audio/highlights-deep-dive/c1/s2_segment_02_quote.wav' },
      { id: 'emphasis', audioFilePath: '/audio/highlights-deep-dive/c1/s2_segment_03_emphasis.wav' }
    ]
  },
  component: Ch1_S2_COGSProblemComponent
});
