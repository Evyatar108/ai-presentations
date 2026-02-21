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
  staggerContainer,
  tileVariants,
} from '@framework';
import CodeBlock from '../components/CodeBlock';
import CandidateGrid from '../components/CandidateGrid';

/**
 * Chapter 4: The O(n^2) Problem (3 slides)
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
      { id: 'title' },
      { id: 'code' },
      { id: 'annotation' }
    ]
  },
  component: Ch4_S1_NestedLoopComponent
});

// ---------- Slide 2: Candidate Rows ----------

const UTTERANCE_COLORS = ['#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa'];

const UTTERANCE_LABELS = [
  { id: 'u0', text: 'Welcome everyone' },
  { id: 'u1', text: 'Sprint metrics look good' },
  { id: 'u2', text: 'Velocity is up 12%' },
  { id: 'u3', text: 'Bug count dropped' },
  { id: 'u4', text: 'Overall a strong sprint' },
];

const CANDIDATES = [
  { label: 'u0\u2013u1', start: 0, end: 1 },
  { label: 'u0\u2013u2', start: 0, end: 2 },
  { label: 'u1\u2013u2', start: 1, end: 2 },
  { label: 'u1\u2013u3', start: 1, end: 3 },
  { label: 'u2\u2013u3', start: 2, end: 3 },
  { label: 'u2\u2013u4', start: 2, end: 4 },
];

const GRID_COLS = '80px repeat(5, 1fr)';

const Ch4_S2_CandidateRowsComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={950}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <SlideTitle reduced={reduced} subtitle="V1 Call 2 (Extractives): Input">
            Candidate Rows
          </SlideTitle>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(1) && (
          <motion.div
            variants={staggerContainer(reduced, 0.1)}
            initial="hidden"
            animate="visible"
          >
            {/* Reference utterance labels */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: GRID_COLS,
              gap: 6,
              marginBottom: 16,
            }}>
              <div style={{
                fontSize: 11,
                color: theme.colors.textSecondary,
                alignSelf: 'end',
                paddingBottom: 4,
              }}>
                Source
              </div>
              {UTTERANCE_LABELS.map((u, i) => (
                <motion.div
                  key={u.id}
                  variants={tileVariants(reduced)}
                  style={{
                    background: `${UTTERANCE_COLORS[i]}20`,
                    border: `1px solid ${UTTERANCE_COLORS[i]}66`,
                    borderRadius: 8,
                    padding: '6px 8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{
                    fontSize: 12,
                    color: UTTERANCE_COLORS[i],
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}>
                    {u.id}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: theme.colors.textSecondary,
                    marginTop: 2,
                    lineHeight: 1.2,
                  }}>
                    {u.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: theme.colors.bgBorder, marginBottom: 12 }} />

            {/* Candidate rows */}
            {CANDIDATES.map((c, rowIdx) => (
              <motion.div
                key={rowIdx}
                variants={tileVariants(reduced)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: GRID_COLS,
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  fontFamily: 'monospace',
                }}>
                  [{c.label}]
                </div>
                {UTTERANCE_LABELS.map((u, colIdx) => {
                  const included = colIdx >= c.start && colIdx <= c.end;
                  const color = UTTERANCE_COLORS[colIdx];
                  return (
                    <div
                      key={u.id}
                      style={{
                        height: 38,
                        borderRadius: 6,
                        background: included ? `${color}30` : 'transparent',
                        border: included ? `1px solid ${color}66` : '1px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        color: included ? color : 'transparent',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                      }}
                    >
                      {included ? u.id : ''}
                    </div>
                  );
                })}
              </motion.div>
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
            style={{ marginTop: '1.25rem', textAlign: 'center' }}
          >
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 10,
              padding: '0.75rem 1.5rem',
              display: 'inline-block',
            }}>
              <p style={{ ...typography.body, fontSize: 15, margin: 0 }}>
                <span style={{ color: UTTERANCE_COLORS[2], fontWeight: 700 }}>u2</span>
                <span style={{ color: theme.colors.textSecondary }}>{' appears in '}</span>
                <span style={{ color: theme.colors.error, fontWeight: 700 }}>5 of 6</span>
                <span style={{ color: theme.colors.textSecondary }}>{' candidates \u2014 same text, sent 5\u00D7'}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch4_S2_CandidateRows = defineSlide({
  metadata: {
    chapter: 4,
    slide: 2,
    title: 'Candidate Rows',
    audioSegments: [
      { id: 'title' },
      { id: 'rows' },
      { id: 'waste' },
    ]
  },
  component: Ch4_S2_CandidateRowsComponent
});

// ---------- Slide 3: Visualized ----------

const Ch4_S3_VisualizedComponent: React.FC = () => {
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

export const Ch4_S3_Visualized = defineSlide({
  metadata: {
    chapter: 4,
    slide: 3,
    title: 'O(n^2) Visualized',
    audioSegments: [
      { id: 'grid' },
      { id: 'math' },
      { id: 'context_window' }
    ]
  },
  component: Ch4_S3_VisualizedComponent
});
