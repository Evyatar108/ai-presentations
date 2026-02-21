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
import CodeBlock from '../components/CodeBlock';
import BeforeAfterSplit from '../components/BeforeAfterSplit';

/**
 * Chapter 5: Compact Transcript Table (3 slides)
 */

const V1_JSON_SAMPLE = `{"Index":0,"Speaker":"Alice","Start":0.0,"End":3.2,
 "Utterance":"Welcome everyone to today's meeting"}
{"Index":1,"Speaker":"Alice","Start":3.2,"End":7.5,
 "Utterance":"Let's look at the latest metrics"}
{"Index":2,"Speaker":"Bob","Start":7.5,"End":12.1,
 "Utterance":"Across all key engagement metrics"}`;

const V2_TABLE_SAMPLE = `utterance_id|utterance_text|max_end_utterance_id
---|---|---
<t5 Sarah>
u0|Welcome everyone to today's meeting|u4
u1|Let's look at the latest metrics|u4
</t5>
<t6 Bob>
u0|Across all key engagement metrics|u2
</t6>`;

// ---------- Slide 1: Format Comparison ----------

const Ch5_S1_FormatComparisonComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={1100} textAlign="left">
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <SlideTitle reduced={reduced}>
            V2 Innovation: Compact Transcript Table
          </SlideTitle>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(1) && (
          <BeforeAfterSplit
            beforeTitle="V1 Call 1 (Abstractives): JSON"
            afterTitle="V2: Compact Table"
            beforeContent={<CodeBlock code={V1_JSON_SAMPLE} language="json" fontSize={11} />}
            afterContent={<CodeBlock code={V2_TABLE_SAMPLE} language="markdown" fontSize={11} />}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(2) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{ marginTop: '1.5rem' }}
          >
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
            }}>
              <thead>
                <tr>
                  {['Aspect', 'V1', 'V2'].map(h => (
                    <th key={h} style={{
                      padding: '0.5rem 1rem',
                      borderBottom: `1px solid ${theme.colors.bgBorder}`,
                      color: theme.colors.textSecondary,
                      fontWeight: 600,
                      textAlign: 'left'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Speaker', 'Per-utterance key', 'Turn tag header'],
                  ['Timestamps', 'Start + End per row', 'Omitted (pre-computed)'],
                  ['Keys', '5 keys x N rows', '3 columns, once'],
                  ['IDs', 'Global sequential', 'Local per-turn (u0, u1...)'],
                  ['Boundaries', 'Not encoded', 'max_end_utterance_id column']
                ].map(([aspect, v1, v2]) => (
                  <tr key={aspect}>
                    <td style={{ padding: '0.4rem 1rem', color: theme.colors.textPrimary }}>{aspect}</td>
                    <td style={{ padding: '0.4rem 1rem', color: theme.colors.warning }}>{v1}</td>
                    <td style={{ padding: '0.4rem 1rem', color: theme.colors.primary }}>{v2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch5_S1_FormatComparison = defineSlide({
  metadata: {
    chapter: 5,
    slide: 1,
    title: 'Format Comparison',
    audioSegments: [
      { id: 'title', audioFilePath: '/audio/highlights-deep-dive/c5/s1_segment_01_title.wav' },
      { id: 'split', audioFilePath: '/audio/highlights-deep-dive/c5/s1_segment_02_split.wav' },
      { id: 'table', audioFilePath: '/audio/highlights-deep-dive/c5/s1_segment_03_table.wav' }
    ]
  },
  component: Ch5_S1_FormatComparisonComponent
});

// ---------- Slide 2: max_end_utterance_id ----------

const Ch5_S2_MaxEndIdComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={1000}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{
              background: theme.colors.bgSurface,
              border: `2px solid ${theme.colors.primary}`,
              borderRadius: 12,
              padding: '1.25rem 2rem',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: 18,
              color: theme.colors.textPrimary,
              textAlign: 'center',
              marginBottom: '2rem',
              position: 'relative'
            }}
          >
            <span style={{ color: theme.colors.primary }}>u2</span>
            <span style={{ color: theme.colors.textMuted }}> | </span>
            <span>Across all key engagement metrics</span>
            <span style={{ color: theme.colors.textMuted }}> | </span>
            <span style={{ color: theme.colors.warning, fontWeight: 700 }}>u4</span>

            {/* Annotation arrows */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '1rem',
              fontSize: 12,
              color: theme.colors.textSecondary
            }}>
              <span style={{ color: theme.colors.primary }}>&#8593; utterance_id (start)</span>
              <span>&#8593; verbatim text</span>
              <span style={{ color: theme.colors.warning }}>&#8593; max_end_utterance_id (ceiling)</span>
            </div>
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
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{
              background: 'rgba(251, 191, 36, 0.06)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: 12,
              padding: '1.25rem',
              textAlign: 'center'
            }}>
              <div style={{ ...typography.caption, fontSize: 11, color: theme.colors.warning, marginBottom: '0.5rem' }}>V1: MANY CANDIDATE ROWS</div>
              <div style={{ fontSize: 32, lineHeight: 1 }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{
                    height: 8,
                    background: `rgba(251, 191, 36, ${0.2 + i * 0.15})`,
                    borderRadius: 4,
                    marginBottom: 4,
                    width: `${60 + i * 8}%`,
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }} />
                ))}
              </div>
              <div style={{ ...typography.caption, fontSize: 12, marginTop: '0.5rem' }}>Fanning out from each start</div>
            </div>
            <div style={{
              background: 'rgba(0, 183, 195, 0.06)',
              border: '1px solid rgba(0, 183, 195, 0.3)',
              borderRadius: 12,
              padding: '1.25rem',
              textAlign: 'center'
            }}>
              <div style={{ ...typography.caption, fontSize: 11, color: theme.colors.primary, marginBottom: '0.5rem' }}>V2: SINGLE ROW + BOUNDARY</div>
              <div style={{ padding: '0.75rem 0' }}>
                <div style={{
                  height: 8,
                  background: theme.colors.primary,
                  borderRadius: 4,
                  width: '70%',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }} />
              </div>
              <div style={{ ...typography.caption, fontSize: 12, marginTop: '0.5rem' }}>One row with max constraint</div>
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
          >
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 14,
              textAlign: 'center'
            }}>
              <thead>
                <tr>
                  {['', 'V1', 'V2'].map(h => (
                    <th key={h} style={{
                      padding: '0.5rem 1rem',
                      borderBottom: `1px solid ${theme.colors.bgBorder}`,
                      color: theme.colors.textSecondary,
                      fontWeight: 600
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Representation', 'O(n\u00B2) candidate rows', 'O(n) rows + max_end_id'],
                  ['Token budget', 'Fills 128K context', '~5-10K tokens'],
                  ['Complexity', 'Quadratic', 'Linear']
                ].map(([label, v1, v2]) => (
                  <tr key={label}>
                    <td style={{ padding: '0.5rem 1rem', color: theme.colors.textPrimary, fontWeight: 600 }}>{label}</td>
                    <td style={{ padding: '0.5rem 1rem', color: theme.colors.warning }}>{v1}</td>
                    <td style={{ padding: '0.5rem 1rem', color: theme.colors.primary }}>{v2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch5_S2_MaxEndId = defineSlide({
  metadata: {
    chapter: 5,
    slide: 2,
    title: 'max_end_utterance_id',
    audioSegments: [
      { id: 'row', audioFilePath: '/audio/highlights-deep-dive/c5/s2_segment_01_row.wav' },
      { id: 'visual', audioFilePath: '/audio/highlights-deep-dive/c5/s2_segment_02_visual.wav' },
      { id: 'comparison', audioFilePath: '/audio/highlights-deep-dive/c5/s2_segment_03_comparison.wav' }
    ]
  },
  component: Ch5_S2_MaxEndIdComponent
});

// ---------- Slide 3: Turn/Utterance Concept ----------

const V1_FLAT = [
  { speaker: 'Alice', text: 'Welcome everyone' },
  { speaker: 'Alice', text: 'Let\'s look at metrics' },
  { speaker: 'Alice', text: 'Starting with engagement' },
  { speaker: 'Bob', text: 'Across all key metrics' },
  { speaker: 'Bob', text: 'We saw growth' },
];

const V2_GROUPED = [
  { turn: 't5', speaker: 'Alice', utterances: ['u0 Welcome everyone', 'u1 Let\'s look at metrics', 'u2 Starting with engagement'] },
  { turn: 't6', speaker: 'Bob', utterances: ['u0 Across all key metrics', 'u1 We saw growth'] },
];

const Ch5_S3_TurnUtteranceConceptComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={1050}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <SlideTitle reduced={reduced}>
            Turns and Utterances
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
              gap: '1.5rem',
              marginBottom: '2rem'
            }}
          >
            {/* V1 flat list */}
            <div style={{
              background: 'rgba(251, 191, 36, 0.06)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: 12,
              padding: '1rem 1.25rem'
            }}>
              <div style={{ ...typography.caption, fontSize: 11, color: theme.colors.warning, letterSpacing: 1, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                V1: Flat List
              </div>
              {V1_FLAT.map((row, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '0.5rem',
                  padding: '0.3rem 0.5rem',
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  borderBottom: i < V1_FLAT.length - 1 ? `1px solid rgba(251, 191, 36, 0.15)` : 'none'
                }}>
                  <span style={{ color: theme.colors.warning, fontWeight: 600, minWidth: 40 }}>{row.speaker}</span>
                  <span style={{ color: theme.colors.textSecondary }}>{row.text}</span>
                </div>
              ))}
            </div>

            {/* V2 turn-grouped */}
            <div style={{
              background: 'rgba(0, 183, 195, 0.06)',
              border: '1px solid rgba(0, 183, 195, 0.3)',
              borderRadius: 12,
              padding: '1rem 1.25rem'
            }}>
              <div style={{ ...typography.caption, fontSize: 11, color: theme.colors.primary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                V2: Turn-Grouped
              </div>
              {V2_GROUPED.map((turn) => (
                <div key={turn.turn} style={{ marginBottom: '0.5rem' }}>
                  <div style={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    color: theme.colors.primary,
                    fontWeight: 600,
                    padding: '0.2rem 0.5rem'
                  }}>
                    &lt;{turn.turn} {turn.speaker}&gt;
                  </div>
                  {turn.utterances.map((utt, j) => (
                    <div key={j} style={{
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      color: theme.colors.textSecondary,
                      padding: '0.15rem 0.5rem 0.15rem 1.5rem'
                    }}>
                      {utt}
                    </div>
                  ))}
                  <div style={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    color: theme.colors.primary,
                    fontWeight: 600,
                    padding: '0.2rem 0.5rem'
                  }}>
                    &lt;/{turn.turn}&gt;
                  </div>
                </div>
              ))}
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
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}
          >
            <div style={{
              background: 'rgba(16, 185, 129, 0.06)',
              border: `1px solid ${theme.colors.success}`,
              borderRadius: 10,
              padding: '0.85rem 1.25rem',
              textAlign: 'center'
            }}>
              <div style={{ ...typography.caption, fontSize: 11, color: theme.colors.success, letterSpacing: 1, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                Valid
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: 13,
                color: theme.colors.textPrimary
              }}>
                t5: u0 &ndash; u2
              </div>
              <div style={{ ...typography.caption, fontSize: 12, marginTop: '0.25rem' }}>
                Same turn, same speaker
              </div>
            </div>
            <div style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: `1px solid ${theme.colors.error}`,
              borderRadius: 10,
              padding: '0.85rem 1.25rem',
              textAlign: 'center'
            }}>
              <div style={{ ...typography.caption, fontSize: 11, color: theme.colors.error, letterSpacing: 1, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                Invalid
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: 13,
                color: theme.colors.textPrimary,
                textDecoration: 'line-through'
              }}>
                t5: u2 &ndash; t6: u0
              </div>
              <div style={{ ...typography.caption, fontSize: 12, marginTop: '0.25rem' }}>
                Crosses turn boundary
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch5_S3_TurnUtteranceConcept = defineSlide({
  metadata: {
    chapter: 5,
    slide: 3,
    title: 'Turn/Utterance Concept',
    audioSegments: [
      { id: 'title', audioFilePath: '/audio/highlights-deep-dive/c5/s3_segment_01_title.wav' },
      { id: 'concept', audioFilePath: '/audio/highlights-deep-dive/c5/s3_segment_02_concept.wav' },
      { id: 'constraint', audioFilePath: '/audio/highlights-deep-dive/c5/s3_segment_03_constraint.wav' }
    ]
  },
  component: Ch5_S3_TurnUtteranceConceptComponent
});
