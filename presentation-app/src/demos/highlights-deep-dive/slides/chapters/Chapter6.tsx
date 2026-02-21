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
  layouts,
  fadeUp,
  Checkmark,
} from '@framework';
import CodeBlock from '../components/CodeBlock';
import BeforeAfterSplit from '../components/BeforeAfterSplit';

/**
 * Chapter 6: Prompt Overview + Pseudocode Algorithm (4 slides)
 */

// ---------- Slide 1: Prompt Overview ----------

const PROMPT_SECTIONS = [
  { num: 1, name: 'Critical Rules', desc: 'Copy-then-parse pattern + core constraints' },
  { num: 2, name: 'Algorithm', desc: 'Pseudocode generate_highlights() function' },
  { num: 3, name: 'Content Priorities', desc: 'Topic guidance, speaker references, style rules' },
  { num: 4, name: 'Transition Sentences', desc: 'Bridging narration to extractive audio' },
  { num: 5, name: 'Safety (RAI)', desc: 'Gender/role/emotion guardrails (compressed)' },
  { num: 6, name: 'Self-Checks', desc: '10 boolean validators on model output' },
];

const Ch6_S1_PromptOverviewComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={950}>
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <SlideTitle reduced={reduced} subtitle="Six Sections at a Glance">
            V2 Prompt Overview
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
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              marginTop: '0.5rem'
            }}
          >
            {PROMPT_SECTIONS.map((section, i) => (
              <motion.div
                key={section.num}
                initial={{ opacity: 0, y: reduced ? 0 : 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduced ? 0.1 : 0.3,
                  delay: reduced ? 0 : i * 0.08
                }}
                style={{
                  background: theme.colors.bgSurface,
                  border: `1px solid ${theme.colors.bgBorder}`,
                  borderRadius: 12,
                  padding: '1rem 1.1rem',
                  textAlign: 'left'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.4rem'
                }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    color: '#fff',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {section.num}
                  </div>
                  <span style={{
                    ...typography.body,
                    fontSize: 14,
                    fontWeight: 700,
                    color: theme.colors.textPrimary
                  }}>
                    {section.name}
                  </span>
                </div>
                <div style={{
                  ...typography.body,
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  lineHeight: 1.4
                }}>
                  {section.desc}
                </div>
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
            style={{
              marginTop: '1.25rem',
              padding: '0.85rem 1.25rem',
              borderRadius: 10,
              background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.secondary}15)`,
              borderLeft: `3px solid ${theme.colors.primary}`,
            }}
          >
            <p style={{
              ...typography.body,
              fontSize: 14,
              color: theme.colors.textPrimary,
              margin: 0,
              fontStyle: 'italic'
            }}>
              Rules & constraints up front, then a precise algorithm, then quality & safety guidelines, and finally self-validation — all processed in a single pass.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch6_S1_PromptOverview = defineSlide({
  metadata: {
    chapter: 6,
    slide: 1,
    title: 'Prompt Overview',
    audioSegments: [
      { id: 'title' },
      { id: 'sections' },
      { id: 'insight' }
    ]
  },
  component: Ch6_S1_PromptOverviewComponent
});

const PSEUDOCODE = `def generate_highlights(transcript_markdown):
    """Main pipeline: segment -> narrate -> extract -> rank -> build narrative."""
    turns = parse_turn_markers(transcript_markdown)

    substantive_start = skip_intro_content(turns)
    substantive_end = skip_closing_content(turns)
    topics = segment_into_topics(turns, substantive_start, substantive_end, min=1, max=7)
    for topic in topics:
        topic.narration = write_narration(topic)
        topic.playback_anchor = choose_playback_anchor(topic)
        topic.topic_id = generate_topic_id()
    topics[-1].narration = add_natural_closure(topics[-1].narration)

    topic_order = create_chronological_topic_order(topics)

    candidates = enumerate_valid_extractive_candidates(turns)
    candidates = filter_by_content_quality(candidates)
    selected = select_best_extractives_within_topic_bounds(
        candidates, topics, max_total=10, max_per_topic=2)
    selected = remove_overlaps(selected)
    ranking = rank_extractives(selected, by=["interest_level", "clarity", "self_containment"])
    final_narrative = build_narrative_rows(topics, selected, topic_order)

    self_checks = validate_all_constraints(topics, selected, ranking, final_narrative, topic_order)

    return MeetingHighlightsOutput(
        abstractive_topics=topics,
        topic_order=topic_order,
        extractive_ranges=selected,
        ranking=ranking,
        final_narrative=final_narrative,
        self_checks=self_checks
    )`;

const OUTPUT_FIELDS = [
  'abstractive_topics',
  'topic_order',
  'extractive_ranges',
  'ranking',
  'final_narrative',
  'self_checks'
];

// ---------- Slide 2: Pseudocode ----------

const Ch6_S2_PseudocodeComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={1000} textAlign="left">
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <SlideTitle reduced={reduced}>
              Pseudocode Algorithm
            </SlideTitle>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduced ? 0 : 0.3, duration: 0.4 }}
              style={{
                ...typography.body,
                fontSize: 16,
                fontStyle: 'italic',
                color: theme.colors.textSecondary,
                marginTop: '-1rem'
              }}
            >
              "Prose = creative interpretation. Pseudocode = systematic execution."
            </motion.p>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(1) && (
          <CodeBlock
            code={PSEUDOCODE}
            language="python"
            title="prompt.md  --  generate_highlights()"
            fontSize={11}
            highlightLines={[1, 7, 16, 21, 22, 24]}
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
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '1rem',
              justifyContent: 'center'
            }}
          >
            {OUTPUT_FIELDS.map((field) => (
              <div key={field} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: theme.colors.bgSurface,
                border: `1px solid ${theme.colors.bgBorder}`,
                borderRadius: 8,
                padding: '0.35rem 0.75rem',
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
              }}>
                <span style={{ color: theme.colors.success }}><Checkmark /></span>
                <span style={{ color: theme.colors.textPrimary }}>{field}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch6_S2_Pseudocode = defineSlide({
  metadata: {
    chapter: 6,
    slide: 2,
    title: 'Pseudocode Algorithm',
    audioSegments: [
      { id: 'title' },
      { id: 'code' },
      { id: 'outputs' }
    ]
  },
  component: Ch6_S2_PseudocodeComponent
});

// ---------- Slide 3: Prose vs Pseudocode ----------

const V1_PROSE = `Please identify those key topics and write a short
summary of each topic. These topics will be the
abstractive sections of the highlights video, and
the summaries will be the voice-overs for these
sections.

Make sure that all the main topics of the meeting
are covered, each topic as a different abstractive
section. Ensure each topic is distinct and
non-overlapping.`;

const V2_PSEUDO = `topics = segment_into_topics(
    turns, substantive_start, substantive_end,
    min=1, max=7
)
for topic in topics:
    topic.narration = write_narration(topic)
    topic.topic_id = generate_topic_id()`;

const BENEFITS = [
  'Unambiguous execution order',
  'Named variables = shared state',
  'More precise than prose',
  'Single source of truth'
];

const Ch6_S3_ProseVsPseudocodeComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={1050} textAlign="left">
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <BeforeAfterSplit
            beforeTitle="V1: Prose Instructions"
            afterTitle="V2: Pseudocode"
            beforeContent={<CodeBlock code={V1_PROSE} language="markdown" fontSize={12} />}
            afterContent={<CodeBlock code={V2_PSEUDO} language="python" fontSize={12} />}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSegmentVisible(1) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{
              ...layouts.grid2Col('1rem'),
              gridTemplateColumns: 'repeat(4, 1fr)',
              marginTop: '1.5rem'
            }}
          >
            {BENEFITS.map((benefit) => (
              <div key={benefit} style={{
                background: theme.colors.bgSurface,
                border: `1px solid ${theme.colors.bgBorder}`,
                borderRadius: 10,
                padding: '0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ color: theme.colors.success, fontSize: 20, marginBottom: '0.3rem' }}>
                  <Checkmark />
                </div>
                <div style={{ ...typography.body, fontSize: 13, fontWeight: 600 }}>
                  {benefit}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch6_S3_ProseVsPseudocode = defineSlide({
  metadata: {
    chapter: 6,
    slide: 3,
    title: 'Prose vs Pseudocode',
    audioSegments: [
      { id: 'comparison' },
      { id: 'benefits' }
    ]
  },
  component: Ch6_S3_ProseVsPseudocodeComponent
});

// ---------- Slide 4: Output Schema ----------

const SCHEMA_FIELDS = [
  { name: 'abstractive_topics', desc: '1–7 topics with narration', call: 'Call 1' },
  { name: 'topic_order', desc: 'Chronological sequence', call: 'Call 4' },
  { name: 'extractive_ranges', desc: 'Selected verbatim clips', call: 'Call 2' },
  { name: 'ranking', desc: 'Quality scores & ordering', call: 'Call 3' },
  { name: 'final_narrative', desc: 'Unified topic + clip rows', call: 'Call 4' },
  { name: 'self_checks', desc: '10 boolean validators', call: null },
];

const EXTRACTIVE_SAMPLE = `{
  "selected_turn_opening_tag_raw_copy_from_input": "<t5 Sarah>",
  "speaker_name": "Sarah",
  "turn_id": 5,
  "selected_start_position": {
    "raw_pipe_delimited_table_row_copied_from_input":
        "u2|Sprint metrics look good|u4",
    "start_utterance_id_parsed_from_first_column": "u2",
    "max_end_utterance_id_parsed_from_third_column": "u4"
  },
  "candidate_end_utterance_ids_within_max_boundary": ["u2","u3","u4"],
  "final_chosen_end_utterance_id_from_candidates": "u3"
}`;

const SCHEMA_INSIGHT_PILLS = [
  'Field names = instructions',
  'Structure = constraints',
  'self_checks = validation',
];

const Ch6_S4_OutputSchemaComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={1000}>
      {/* Segment 0: Six-field overview */}
      <AnimatePresence>
        {isSegmentVisible(0) && (
          <div>
            <div style={{ textAlign: 'center' }}>
              <SlideTitle reduced={reduced} subtitle="Six Fields, One JSON Response">
                Output Schema
              </SlideTitle>
            </div>
            <motion.div
              variants={fadeUp(reduced)}
              initial="hidden"
              animate="visible"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.6rem',
                marginTop: '0.25rem',
              }}
            >
              {SCHEMA_FIELDS.map((field, i) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduced ? 0.1 : 0.3,
                    delay: reduced ? 0 : i * 0.06,
                  }}
                  style={{
                    background: theme.colors.bgSurface,
                    border: `1px solid ${theme.colors.bgBorder}`,
                    borderRadius: 10,
                    padding: '0.55rem 0.75rem',
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.25rem',
                  }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      fontSize: 11,
                      fontWeight: 600,
                      color: theme.colors.primary,
                    }}>
                      {field.name}
                    </span>
                    <span style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: field.call ? '#fbbf24' : theme.colors.success,
                      background: field.call
                        ? 'rgba(251, 191, 36, 0.15)'
                        : `${theme.colors.success}20`,
                      borderRadius: 5,
                      padding: '0.15rem 0.4rem',
                      whiteSpace: 'nowrap',
                    }}>
                      {field.call ? `V1: ${field.call}` : 'New'}
                    </span>
                  </div>
                  <div style={{
                    ...typography.body,
                    fontSize: 11,
                    color: theme.colors.textSecondary,
                    lineHeight: 1.3,
                  }}>
                    {field.desc}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Segment 1: extractive_ranges zoom */}
      <AnimatePresence>
        {isSegmentVisible(1) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{ marginTop: '1rem' }}
          >
            <CodeBlock
              code={EXTRACTIVE_SAMPLE}
              language="json"
              title="extractive_ranges[0]  —  field names as instructions"
              fontSize={11}
              highlightLines={[2, 6, 7]}
            />
            <div style={{
              display: 'flex',
              gap: '1.5rem',
              marginTop: '0.4rem',
              justifyContent: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{
                  width: 10, height: 10, borderRadius: 2,
                  background: 'rgba(251, 191, 36, 0.35)',
                  border: '2px solid #fbbf24',
                }} />
                <span style={{ ...typography.body, fontSize: 10, color: theme.colors.textSecondary }}>
                  Step 1: Copy from input
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{
                  width: 10, height: 10, borderRadius: 2,
                  background: 'transparent',
                  border: `2px solid ${theme.colors.primary}`,
                }} />
                <span style={{ ...typography.body, fontSize: 10, color: theme.colors.textSecondary }}>
                  Step 2: Parse from copy
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Segment 2: Insight callout + pills */}
      <AnimatePresence>
        {isSegmentVisible(2) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{ marginTop: '0.75rem' }}
          >
            <div style={{
              padding: '0.7rem 1.1rem',
              borderRadius: 10,
              background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.secondary}15)`,
              borderLeft: `3px solid ${theme.colors.primary}`,
            }}>
              <p style={{
                ...typography.body,
                fontSize: 13,
                color: theme.colors.textPrimary,
                margin: 0,
                fontStyle: 'italic',
              }}>
                The output schema isn't just a data format — it's a prompt engineering tool.
                Field names guide execution order, nested structure enforces constraints,
                and self_checks close the validation loop.
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.6rem',
              marginTop: '0.6rem',
              justifyContent: 'center',
            }}>
              {SCHEMA_INSIGHT_PILLS.map((pill) => (
                <div key={pill} style={{
                  background: theme.colors.bgSurface,
                  border: `1px solid ${theme.colors.bgBorder}`,
                  borderRadius: 8,
                  padding: '0.3rem 0.7rem',
                  fontSize: 12,
                  fontWeight: 600,
                  color: theme.colors.primary,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                }}>
                  {pill}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SlideContainer>
  );
};

export const Ch6_S4_OutputSchema = defineSlide({
  metadata: {
    chapter: 6,
    slide: 4,
    title: 'Output Schema',
    audioSegments: [
      { id: 'skeleton' },
      { id: 'extractive_zoom' },
      { id: 'insight' }
    ]
  },
  component: Ch6_S4_OutputSchemaComponent
});
