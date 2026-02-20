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
  ArrowRight,
} from '@framework';

/**
 * Chapter 8: Evaluation & Iteration (2 slides)
 */

// ---------- Slide 1: Validation Challenges ----------

const CHECKS = [
  {
    title: 'Output Range Validation',
    desc: 'Every turn + utterance ID in the output must exist in the input transcript',
    icon: '\u2714'
  },
  {
    title: 'Max Utterance Threshold',
    desc: 'Beginning utterance of a clip must not exceed max_end_utterance_id from the transcript table',
    icon: '\u2714'
  }
];

const Ch8_S1_ValidationChallengesComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={950}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <SlideTitle reduced={reduced}>
            Validating Turn-Utterance Output
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
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.25rem',
              marginBottom: '2rem'
            }}
          >
            {CHECKS.map((check) => (
              <div key={check.title} style={{
                background: theme.colors.bgSurface,
                border: `1px solid ${theme.colors.bgBorder}`,
                borderRadius: 12,
                padding: '1.25rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: `linear-gradient(135deg, ${theme.colors.success}, #059669)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    color: '#fff',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {check.icon}
                  </div>
                  <div style={{
                    ...typography.body,
                    fontSize: 15,
                    fontWeight: 600,
                    color: theme.colors.textPrimary
                  }}>
                    {check.title}
                  </div>
                </div>
                <div style={{ ...typography.caption, fontSize: 13, lineHeight: 1.5 }}>
                  {check.desc}
                </div>
              </div>
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
            style={{
              background: `linear-gradient(135deg, rgba(0, 183, 195, 0.08), rgba(0, 120, 212, 0.08))`,
              border: `2px solid ${theme.colors.primary}`,
              borderRadius: 12,
              padding: '1.25rem 1.5rem',
              textAlign: 'center'
            }}
          >
            <div style={{
              ...typography.body,
              fontSize: 15,
              fontWeight: 600,
              color: theme.colors.primary,
              marginBottom: '0.4rem'
            }}>
              Copy-then-Parse Was the Key Mitigation
            </div>
            <div style={{ ...typography.caption, fontSize: 13, lineHeight: 1.5 }}>
              Error rate of invalid turn-utterance combinations dropped dramatically
              once the model was forced to copy raw strings before parsing IDs.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch8_S1_ValidationChallenges = defineSlide({
  metadata: {
    chapter: 8,
    slide: 1,
    title: 'Validation Challenges',
    audioSegments: [
      { id: 'title', audioFilePath: '/audio/highlights-deep-dive/c8/s1_segment_01_title.wav' },
      { id: 'checks', audioFilePath: '/audio/highlights-deep-dive/c8/s1_segment_02_checks.wav' },
      { id: 'challenge', audioFilePath: '/audio/highlights-deep-dive/c8/s1_segment_03_challenge.wav' }
    ]
  },
  component: Ch8_S1_ValidationChallengesComponent
});

// ---------- Slide 2: Eval Tool ----------

const PIPELINE_STEPS = [
  { label: 'Transcript + Recording', color: 'warning' as const },
  { label: 'Local Runner', color: 'primary' as const },
  { label: 'JSON + Video', color: 'success' as const }
];

const Ch8_S2_EvalToolComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();

  const colorMap = {
    warning: theme.colors.warning,
    primary: theme.colors.primary,
    success: theme.colors.success
  };

  return (
    <SlideContainer maxWidth={950}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <SlideTitle reduced={reduced}>
            Local Evaluation Tool
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
              gap: '1rem',
              marginBottom: '2rem'
            }}
          >
            {PIPELINE_STEPS.map((step, i) => (
              <React.Fragment key={step.label}>
                {i > 0 && <span style={{ color: theme.colors.primary }}><ArrowRight /></span>}
                <div style={{
                  padding: '0.8rem 1.5rem',
                  borderRadius: 10,
                  background: theme.colors.bgSurface,
                  border: `2px solid ${colorMap[step.color]}`,
                  fontSize: 14,
                  fontWeight: 600,
                  color: theme.colors.textPrimary,
                  textAlign: 'center'
                }}>
                  {step.label}
                </div>
              </React.Fragment>
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
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '2rem'
            }}
          >
            <div style={{
              background: theme.colors.bgSurface,
              border: `1px solid ${theme.colors.bgBorder}`,
              borderRadius: 10,
              padding: '1rem 1.25rem'
            }}>
              <div style={{
                ...typography.caption,
                fontSize: 11,
                color: theme.colors.primary,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: '0.4rem'
              }}>
                Automated Validation
              </div>
              <div style={{ ...typography.body, fontSize: 13 }}>
                Highlights JSON checked for structural correctness and turn-utterance accuracy
              </div>
            </div>
            <div style={{
              background: theme.colors.bgSurface,
              border: `1px solid ${theme.colors.bgBorder}`,
              borderRadius: 10,
              padding: '1rem 1.25rem'
            }}>
              <div style={{
                ...typography.caption,
                fontSize: 11,
                color: theme.colors.success,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: '0.4rem'
              }}>
                Subjective Review
              </div>
              <div style={{ ...typography.body, fontSize: 13 }}>
                Highlights video lets you see and hear exactly what the model selected
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(2) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{
              background: `linear-gradient(135deg, rgba(0, 183, 195, 0.08), rgba(0, 120, 212, 0.08))`,
              border: `1px solid ${theme.colors.primary}`,
              borderRadius: 10,
              padding: '1rem 1.5rem',
              textAlign: 'center'
            }}
          >
            <div style={{
              ...typography.body,
              fontSize: 14,
              fontWeight: 600,
              color: theme.colors.primary,
              marginBottom: '0.3rem'
            }}>
              Error Statistics as Primary Metric
            </div>
            <div style={{ ...typography.caption, fontSize: 13, lineHeight: 1.5 }}>
              Each prompt revision was run across test transcripts. Invalid turn-utterance
              combination rate tracked per iteration — quantitative signal complementing
              qualitative video review.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch8_S2_EvalTool = defineSlide({
  metadata: {
    chapter: 8,
    slide: 2,
    title: 'Eval Tool',
    audioSegments: [
      { id: 'title', audioFilePath: '/audio/highlights-deep-dive/c8/s2_segment_01_title.wav' },
      { id: 'pipeline', audioFilePath: '/audio/highlights-deep-dive/c8/s2_segment_02_pipeline.wav' },
      { id: 'metrics', audioFilePath: '/audio/highlights-deep-dive/c8/s2_segment_03_metrics.wav' }
    ]
  },
  component: Ch8_S2_EvalToolComponent
});
