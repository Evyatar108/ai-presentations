import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useReducedMotion,
  useSegmentedAnimation,
  useTheme,
  defineSlide,
  SlideContainer,
  SlideTitle,
  MetricDisplay,
  TestimonialCard,
  typography,
  layouts,
  fadeUp,
  ArrowRight,
} from '@framework';

/**
 * Chapter 8: Results (2 slides)
 */

// ---------- Slide 1: Metrics ----------

const METRICS = [
  { value: '75%', label: 'LLM Call Reduction', detail: '4 calls \u2192 1 call', emphasis: true },
  { value: '60%', label: 'Token Reduction', detail: 'Compact table + unified prompt' },
  { value: '~70%', label: 'GPU Reduction', detail: '~600 \u2192 ~180 A100s' }
];

const Ch8_S1_MetricsComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <SlideContainer maxWidth={1000}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <SlideTitle reduced={reduced}>
            Results
          </SlideTitle>
        )}
      </AnimatePresence>

      <div style={{ ...layouts.grid3Col('2rem') }}>
        {METRICS.map((metric, i) => (
          <AnimatePresence key={metric.label}>
            {isSegmentVisible(i + 1) && (
              <MetricDisplay
                value={metric.value}
                label={metric.label}
                reduced={reduced}
                emphasis={metric.emphasis}
                delay={reduced ? 0 : 0.1}
              />
            )}
          </AnimatePresence>
        ))}
      </div>
    </SlideContainer>
  );
};

export const Ch8_S1_Metrics = defineSlide({
  metadata: {
    chapter: 8,
    slide: 1,
    title: 'Results Metrics',
    audioSegments: [
      { id: 'title', audioFilePath: '/audio/highlights-deep-dive/c8/s1_segment_01_title.wav' },
      { id: 'calls', audioFilePath: '/audio/highlights-deep-dive/c8/s1_segment_02_calls.wav' },
      { id: 'tokens', audioFilePath: '/audio/highlights-deep-dive/c8/s1_segment_03_tokens.wav' },
      { id: 'gpus', audioFilePath: '/audio/highlights-deep-dive/c8/s1_segment_04_gpus.wav' }
    ]
  },
  component: Ch8_S1_MetricsComponent
});

// ---------- Slide 2: Quality & Impact ----------

const Ch8_S2_QualityAndImpactComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={950}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{
              ...layouts.grid3Col('1.5rem'),
              marginBottom: '2rem'
            }}
          >
            {[
              { label: 'Grounding', value: 'No regression', color: theme.colors.success },
              { label: 'Coverage', value: '~75-80%', color: theme.colors.primary },
              { label: 'Reviewers', value: 'Prefer V2', color: theme.colors.success }
            ].map((tile) => (
              <div key={tile.label} style={{
                background: theme.colors.bgSurface,
                border: `1px solid ${theme.colors.bgBorder}`,
                borderRadius: 12,
                padding: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ ...typography.caption, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  {tile.label}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: tile.color }}>
                  {tile.value}
                </div>
              </div>
            ))}
          </motion.div>
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
              gap: '1rem',
              marginBottom: '2rem'
            }}
          >
            {['Cost Reduction', 'Private Preview (Oct 2025)', 'GA Rollout'].map((step, i) => (
              <React.Fragment key={step}>
                {i > 0 && <span style={{ color: theme.colors.primary }}><ArrowRight /></span>}
                <div style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: 8,
                  background: i === 2
                    ? `linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))`
                    : theme.colors.bgSurface,
                  border: i === 2
                    ? `2px solid ${theme.colors.primary}`
                    : `1px solid ${theme.colors.bgBorder}`,
                  fontSize: 14,
                  fontWeight: 600,
                  color: theme.colors.textPrimary
                }}>
                  {step}
                </div>
              </React.Fragment>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(2) && (
          <TestimonialCard
            quote="V2 is a compact prompt with only one LLM request that combines abstractive and extractive highlights generation into a single unified pipeline."
            author="Eli Lekhtser, Principal PM"
            reduced={reduced}
          />
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch8_S2_QualityAndImpact = defineSlide({
  metadata: {
    chapter: 8,
    slide: 2,
    title: 'Quality and Impact',
    audioSegments: [
      { id: 'quality', audioFilePath: '/audio/highlights-deep-dive/c8/s2_segment_01_quality.wav' },
      { id: 'roadmap', audioFilePath: '/audio/highlights-deep-dive/c8/s2_segment_02_roadmap.wav' },
      { id: 'quote', audioFilePath: '/audio/highlights-deep-dive/c8/s2_segment_03_quote.wav' }
    ]
  },
  component: Ch8_S2_QualityAndImpactComponent
});
