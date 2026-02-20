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
  expandWidth,
} from '@framework';
import CodeBlock from '../components/CodeBlock';
import CandidateGrid from '../components/CandidateGrid';

/**
 * Chapter 4: The O(n^2) Problem (2 slides)
 */

const NESTED_LOOP_CODE = `def extract_highlights_candidates_from_transcript(
    contexts_blocks, topic_ranges,
    duration_thresh_low, duration_thresh_high
):
    data = contexts_blocks[0]
    result = []
    ranges = [[int(x) for x in s.split("-")] for s in topic_ranges]
    utterances = list(zip(
        data["uttrances_start_times"],
        data["uttrances_end_times"],
        data["uttrances_texts"],
        data["uttrances_ids"],
        speaker_list
    ))

    for i in range(1, len(ranges) - 1):
        start_ind = ranges[i][0]
        end_ind = ranges[i][1]
        topic_blocks = []
        for j in range(start_ind, end_ind + 1):      # O(n) starts
            for k in range(j + 1, end_ind + 1):       # O(n) ends
                start_time = utterances[j][0]
                end_time = utterances[k][1]
                duration = end_time - start_time
                if duration_thresh_low <= duration <= duration_thresh_high:
                    utt = [ut[2] for ut in utterances[j:k+1]]
                    subset = {
                        "utterance_range": [j, k],
                        "uttrances_texts": utt,
                    }
                    topic_blocks.append(subset)
        result.append(topic_blocks)
    return result`;

// ---------- Slide 1: Nested Loop ----------

const Ch4_S1_NestedLoopComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={1000} textAlign="left">
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <SlideTitle reduced={reduced} subtitle="highlights_utils.py : extract_highlights_candidates_from_transcript()">
            Combinatorial Candidate Explosion
          </SlideTitle>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(1) && (
          <CodeBlock
            code={NESTED_LOOP_CODE}
            language="python"
            title="highlights_utils.py  --  lines 199-234"
            highlightLines={[20, 21]}
            fontSize={12}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(2) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1rem',
              justifyContent: 'center'
            }}
          >
            <div style={{
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: 10,
              padding: '0.75rem 1.25rem',
              flex: 1,
              textAlign: 'center'
            }}>
              <p style={{ ...typography.body, fontSize: 14, margin: 0 }}>
                <span style={{ color: theme.colors.warning, fontWeight: 700 }}>O(n) starts</span>
                {' \u00D7 '}
                <span style={{ color: theme.colors.warning, fontWeight: 700 }}>O(n) ends</span>
                {' = '}
                <span style={{ color: theme.colors.error, fontWeight: 700 }}>O(n\u00B2) candidates</span>
              </p>
            </div>
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 10,
              padding: '0.75rem 1.25rem',
              flex: 1,
              textAlign: 'center'
            }}>
              <p style={{ ...typography.body, fontSize: 14, margin: 0, color: theme.colors.error }}>
                Full text duplicated per candidate
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch4_S1_NestedLoop = defineSlide({
  metadata: {
    chapter: 4,
    slide: 1,
    title: 'Nested Loop',
    audioSegments: [
      { id: 'title', audioFilePath: '/audio/highlights-deep-dive/c4/s1_segment_01_title.wav' },
      { id: 'code', audioFilePath: '/audio/highlights-deep-dive/c4/s1_segment_02_code.wav' },
      { id: 'annotation', audioFilePath: '/audio/highlights-deep-dive/c4/s1_segment_03_annotation.wav' }
    ]
  },
  component: Ch4_S1_NestedLoopComponent
});

// ---------- Slide 2: Visualized ----------

const Ch4_S2_VisualizedComponent: React.FC = () => {
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
            style={{ marginBottom: '2rem' }}
          >
            <CandidateGrid n={6} animate />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(1) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{ textAlign: 'center', marginBottom: '1.5rem' }}
          >
            <p style={{ ...typography.body, fontSize: 18, margin: 0 }}>
              30 utterances/topic {'  '}<span style={{ color: theme.colors.warning }}>&#8594;</span>{'  '}
              <span style={{ color: theme.colors.warning, fontWeight: 700 }}>435 candidates</span>
            </p>
            <p style={{ ...typography.body, fontSize: 18, margin: '0.25rem 0 0' }}>
              5 topics {'  '}<span style={{ color: theme.colors.error }}>&#8594;</span>{'  '}
              <span style={{ color: theme.colors.error, fontWeight: 700 }}>~2,000+ rows</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(2) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{ textAlign: 'center' }}
          >
            <div style={{
              background: theme.colors.bgSurface,
              borderRadius: 12,
              padding: '1rem 1.5rem',
              border: `1px solid ${theme.colors.bgBorder}`,
              display: 'inline-block',
              width: '80%'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <span style={{ ...typography.caption, fontSize: 12 }}>0K</span>
                <div style={{
                  flex: 1,
                  height: 24,
                  background: theme.colors.bgBorder,
                  borderRadius: 6,
                  overflow: 'hidden'
                }}>
                  <motion.div
                    {...expandWidth(reduced, 2000, 0.3)}
                    style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${theme.colors.warning}, ${theme.colors.error})`,
                      borderRadius: 6,
                      maxWidth: '93%'
                    }}
                  />
                </div>
                <span style={{ ...typography.caption, fontSize: 12 }}>128K</span>
              </div>
              <p style={{ ...typography.caption, fontSize: 13, margin: 0 }}>
                Greedily fills the entire <span style={{ color: theme.colors.error, fontWeight: 600 }}>128K context window</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch4_S2_Visualized = defineSlide({
  metadata: {
    chapter: 4,
    slide: 2,
    title: 'O(n^2) Visualized',
    audioSegments: [
      { id: 'grid', audioFilePath: '/audio/highlights-deep-dive/c4/s2_segment_01_grid.wav' },
      { id: 'math', audioFilePath: '/audio/highlights-deep-dive/c4/s2_segment_02_math.wav' },
      { id: 'context_window', audioFilePath: '/audio/highlights-deep-dive/c4/s2_segment_03_context_window.wav' }
    ]
  },
  component: Ch4_S2_VisualizedComponent
});
