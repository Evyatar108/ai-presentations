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
  ArrowDown,
} from '@framework';
import CodeBlock from '../components/CodeBlock';

/**
 * Chapter 7: Copy-then-Parse + Self-Checks (2 slides)
 */

const COPY_CODE = `# Step 1: Copy raw strings from input
selected_turn_opening_tag_raw_copy: "<t5 Sarah>"
raw_pipe_delimited_table_row:       "u2|Across all key engagement metrics|u4"`;

const PARSE_CODE = `# Step 2: Parse from the copied strings
speaker_name:    "Sarah"      # from "<t5 Sarah>"
turn_id:         5             # strip 't' from "t5"
start_utt_id:   2             # strip 'u' from "u2"
max_end_utt_id: 4             # strip 'u' from "u4"`;

const SELF_CHECKS = [
  'topic_non_overlap',
  'unique_topic_ids',
  'extractive_non_overlap',
  'extractive_within_topic_bounds',
  'max_two_extractives_per_topic',
  'all_extractives_ranked',
  'final_narrative_alignment',
  'narrative_completeness',
  'turn_boundary_compliance',
  'topic_order_compliance'
];

// ---------- Slide 1: Copy-then-Parse ----------

const Ch7_S1_CopyThenParseComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={900} textAlign="left">
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <div style={{ textAlign: 'center' }}>
            <SlideTitle reduced={reduced} subtitle="Chain-of-Thought Grounding">
              Copy-then-Parse
            </SlideTitle>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(1) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{ marginBottom: '0.75rem' }}
          >
            <CodeBlock
              code={COPY_CODE}
              language="python"
              title="Step 1: Copy raw strings verbatim"
              highlightLines={[2, 3]}
              fontSize={13}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Arrow connector */}
      {isSegmentVisible(2) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ textAlign: 'center', margin: '0.5rem 0', color: theme.colors.primary }}
        >
          <ArrowDown />
          <span style={{ ...typography.caption, fontSize: 12, display: 'block' }}>
            parse from copies
          </span>
        </motion.div>
      )}

      <AnimatePresence>
        {isSegmentVisible(2) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
          >
            <CodeBlock
              code={PARSE_CODE}
              language="python"
              title="Step 2: Parse structured values from copied text"
              highlightLines={[2, 3, 4, 5]}
              fontSize={13}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch7_S1_CopyThenParse = defineSlide({
  metadata: {
    chapter: 7,
    slide: 1,
    title: 'Copy-then-Parse',
    audioSegments: [
      { id: 'title', audioFilePath: '/audio/highlights-deep-dive/c7/s1_segment_01_title.wav' },
      { id: 'copy', audioFilePath: '/audio/highlights-deep-dive/c7/s1_segment_02_copy.wav' },
      { id: 'parse', audioFilePath: '/audio/highlights-deep-dive/c7/s1_segment_03_parse.wav' }
    ]
  },
  component: Ch7_S1_CopyThenParseComponent
});

// ---------- Slide 2: Self-Checks ----------

const Ch7_S2_SelfChecksComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={900}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <SlideTitle reduced={reduced}>
            Self-Checks: Model Validates Its Own Output
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
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.6rem'
            }}
          >
            {SELF_CHECKS.map((check, i) => (
              <motion.div
                key={check}
                initial={{ opacity: 0, x: reduced ? 0 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: reduced ? 0.1 : 0.2,
                  delay: reduced ? 0 : i * 0.06
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: theme.colors.bgSurface,
                  border: `1px solid ${theme.colors.bgBorder}`,
                  borderRadius: 8,
                  padding: '0.6rem 0.85rem'
                }}
              >
                <div style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: `linear-gradient(135deg, ${theme.colors.success}, #059669)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  color: '#fff',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  &#10003;
                </div>
                <span style={{
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: 12,
                  color: theme.colors.textPrimary
                }}>
                  {check}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch7_S2_SelfChecks = defineSlide({
  metadata: {
    chapter: 7,
    slide: 2,
    title: 'Self-Checks',
    audioSegments: [
      { id: 'title', audioFilePath: '/audio/highlights-deep-dive/c7/s2_segment_01_title.wav' },
      { id: 'grid', audioFilePath: '/audio/highlights-deep-dive/c7/s2_segment_02_grid.wav' }
    ]
  },
  component: Ch7_S2_SelfChecksComponent
});
