import React from 'react';
import { motion } from 'framer-motion';
import {
  useReducedMotion,
  useTheme,
  defineSlide,
  SlideContainer,
  SlideTitle,
  Reveal,
  RevealSequence,
  CodeBlock,
  BeforeAfterSplit,
  typography,
  layouts,
  fadeUp,
  Checkmark,
} from '@framework';

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
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={950}>
      <Reveal from={0}>
        <SlideTitle reduced={reduced} subtitle="Six Sections at a Glance">
          V2 Prompt Overview
        </SlideTitle>
      </Reveal>

      <Reveal from={1} animation={fadeUp} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.75rem',
        marginTop: '0.5rem'
      }}>
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
      </Reveal>

      <Reveal from={2} animation={fadeUp} style={{
        marginTop: '1.25rem',
        padding: '0.85rem 1.25rem',
        borderRadius: 10,
        background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.secondary}15)`,
        borderLeft: `3px solid ${theme.colors.primary}`,
      }}>
        <p style={{
          ...typography.body,
          fontSize: 14,
          color: theme.colors.textPrimary,
          margin: 0,
          fontStyle: 'italic'
        }}>
          Rules & constraints up front, then a precise algorithm, then quality & safety guidelines, and finally self-validation — all processed in a single pass.
        </p>
      </Reveal>
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

    return MeetingHighlightsOutput(topics, topic_order, selected, ranking, final_narrative, self_checks)`;

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
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={1000} textAlign="left">
      <Reveal from={0} style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
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
          "GPT-4o is built for code — so we wrote the prompt as code."
        </motion.p>
      </Reveal>

      <Reveal from={1}>
        <CodeBlock
          code={PSEUDOCODE}
          language="python"
          title="prompt.md  --  generate_highlights()"
          fontSize={11}
          highlightLines={[1, 7, 16, 21, 22, 24]}
        />
      </Reveal>

      <Reveal from={2} animation={fadeUp} style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '1rem',
        justifyContent: 'center'
      }}>
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
      </Reveal>
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
  'Plays to GPT-4o\'s strengths',
  'Single source of truth'
];

const Ch6_S3_ProseVsPseudocodeComponent: React.FC = () => {
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={1050} textAlign="left">
      <Reveal from={0}>
        <BeforeAfterSplit
          beforeTitle="V1: Prose Instructions"
          afterTitle="V2: Pseudocode"
          beforeContent={<CodeBlock code={V1_PROSE} language="markdown" fontSize={12} />}
          afterContent={<CodeBlock code={V2_PSEUDO} language="python" fontSize={12} />}
        />
      </Reveal>

      <Reveal from={1} animation={fadeUp} style={{
        ...layouts.grid2Col('1rem'),
        gridTemplateColumns: 'repeat(4, 1fr)',
        marginTop: '1.5rem'
      }}>
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
      </Reveal>
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
  { name: 'abstractive_topics', desc: '1–7 topics with narration',  call: 'Call 1', category: 'cot' as const },
  { name: 'topic_order',        desc: 'Chronological sequence',     call: 'Call 4', category: 'cot' as const },
  { name: 'extractive_ranges',  desc: 'Selected verbatim clips',    call: 'Call 2', category: 'cot' as const },
  { name: 'ranking',            desc: 'Quality scores & ordering',  call: 'Call 3', category: 'cot' as const },
  { name: 'final_narrative',    desc: 'Playback coordinates + narration text', call: 'Call 4', category: 'deliverable' as const },
  { name: 'self_checks',        desc: '10 boolean validators',      call: null,     category: 'validation' as const },
];

const FINAL_NARRATIVE_SAMPLE = `[{
  "topic_id": "SPR",
  "topic_title": "Sprint Metrics",
  "narration_for_final_output": "The team reviewed sprint velocity...",
  "playback_start": {
    "turn_id": 5,
    "utterance_id": 2
  },
  "extractive": {
    "turn_id": 5,
    "start_utterance_id": 2,
    "end_utterance_id": 4,
    "transition_sentence": "Here's what Sarah said..."
  }
}]`;

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
  'Chain-of-thought → deliverable',
];

const COT_FIELDS = SCHEMA_FIELDS.filter(f => f.category === 'cot');
const DELIVERABLE_FIELD = SCHEMA_FIELDS.find(f => f.category === 'deliverable')!;
const VALIDATION_FIELD = SCHEMA_FIELDS.find(f => f.category === 'validation')!;

const CATEGORY_STYLES = {
  cot:         { accent: '#fbbf24', label: 'Chain-of-Thought Scaffolding', bg: 'rgba(251, 191, 36, 0.08)' },
  deliverable: { accent: '#00B7C3', label: 'Deliverable',                 bg: 'rgba(0, 183, 195, 0.08)' },
  validation:  { accent: '#10b981', label: 'Validation',                  bg: 'rgba(16, 185, 129, 0.08)' },
} as const;

const Ch6_S4_OutputSchemaComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();

  const renderFieldCard = (
    field: typeof SCHEMA_FIELDS[number],
    index: number,
    accent: string,
    bg: string,
    compact = false,
  ) => (
    <motion.div
      key={field.name}
      initial={{ opacity: 0, y: reduced ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduced ? 0.1 : 0.3,
        delay: reduced ? 0 : index * 0.06,
      }}
      style={{
        background: bg,
        border: `1px solid ${theme.colors.bgBorder}`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: 10,
        padding: compact ? '0.45rem 0.65rem' : '0.55rem 0.75rem',
        textAlign: 'left',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.2rem',
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: compact ? 10.5 : 11,
          fontWeight: 600,
          color: accent,
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
        fontSize: compact ? 10.5 : 11,
        color: theme.colors.textSecondary,
        lineHeight: 1.3,
      }}>
        {field.desc}
      </div>
    </motion.div>
  );

  return (
    <SlideContainer maxWidth={1000}>
      {/* Title persists across all segments */}
      <Reveal from={0}>
        <div style={{ textAlign: 'center' }}>
          <SlideTitle reduced={reduced} subtitle="Six Fields, Two Purposes">
            Output Schema
          </SlideTitle>
        </div>
      </Reveal>

      <RevealSequence delay={300}>
        {/* Segment 0: Grouped six-field overview — exits when code block enters */}
        <Reveal from={0} until={0}>
          {/* Row 1: CoT scaffolding label + 4 compact cards */}
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
          >
            <div style={{
              ...typography.body,
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              color: CATEGORY_STYLES.cot.accent,
              marginBottom: '0.35rem',
              marginTop: '0.15rem',
            }}>
              {CATEGORY_STYLES.cot.label}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem',
            }}>
              {COT_FIELDS.map((field, i) =>
                renderFieldCard(field, i, CATEGORY_STYLES.cot.accent, CATEGORY_STYLES.cot.bg, true)
              )}
            </div>
          </motion.div>

          {/* Row 2: Deliverable + Validation */}
          <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.1 : 0.3, delay: reduced ? 0 : 0.3 }}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '0.5rem',
              marginTop: '0.6rem',
            }}
          >
            <div>
              <div style={{
                ...typography.body,
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
                color: CATEGORY_STYLES.deliverable.accent,
                marginBottom: '0.35rem',
              }}>
                {CATEGORY_STYLES.deliverable.label}
              </div>
              {renderFieldCard(DELIVERABLE_FIELD, 4, CATEGORY_STYLES.deliverable.accent, CATEGORY_STYLES.deliverable.bg)}
            </div>
            <div>
              <div style={{
                ...typography.body,
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
                color: CATEGORY_STYLES.validation.accent,
                marginBottom: '0.35rem',
              }}>
                {CATEGORY_STYLES.validation.label}
              </div>
              {renderFieldCard(VALIDATION_FIELD, 5, CATEGORY_STYLES.validation.accent, CATEGORY_STYLES.validation.bg)}
            </div>
          </motion.div>
        </Reveal>

        {/* Segment 1: final_narrative zoom — exits when extractive enters */}
        <Reveal from={1} until={1} animation={fadeUp} style={{ marginTop: '1rem' }}>
          <CodeBlock
            code={FINAL_NARRATIVE_SAMPLE}
            language="json"
            title="final_narrative[0]  —  the product deliverable"
            fontSize={11}
            highlightLines={[6, 7, 8, 10, 11, 12]}
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
                background: 'rgba(0, 183, 195, 0.35)',
                border: '2px solid #00B7C3',
              }} />
              <span style={{ ...typography.body, fontSize: 10, color: theme.colors.textSecondary }}>
                Playback coordinates (video seeking)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{
                width: 10, height: 10, borderRadius: 2,
                background: 'rgba(0, 183, 195, 0.35)',
                border: '2px solid #00B7C3',
              }} />
              <span style={{ ...typography.body, fontSize: 10, color: theme.colors.textSecondary }}>
                Extractive clip boundaries
              </span>
            </div>
          </div>
          <div style={{
            marginTop: '0.5rem',
            padding: '0.5rem 0.85rem',
            borderRadius: 8,
            background: `${CATEGORY_STYLES.deliverable.accent}10`,
            borderLeft: `3px solid ${CATEGORY_STYLES.deliverable.accent}`,
            textAlign: 'center',
          }}>
            <span style={{
              ...typography.body,
              fontSize: 11.5,
              color: theme.colors.textPrimary,
              fontStyle: 'italic',
            }}>
              This is what the video player actually uses. Everything else in the schema is reasoning scaffolding.
            </span>
          </div>
        </Reveal>

        {/* Segment 2: extractive_ranges zoom — exits when insight enters */}
        <Reveal from={2} until={2} animation={fadeUp} style={{ marginTop: '1rem' }}>
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
        </Reveal>

        {/* Segment 3: Insight callout + pills */}
        <Reveal from={3} animation={fadeUp} style={{ marginTop: '0.75rem' }}>
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
              The output schema isn't just a data format — it's a chain-of-thought scaffold.
              Five fields guide the model's reasoning, one field captures the deliverable.
              Field names become execution steps, and self_checks closes the validation loop.
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
        </Reveal>
      </RevealSequence>
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
      { id: 'deliverable_zoom' },
      { id: 'extractive_zoom' },
      { id: 'insight' }
    ]
  },
  component: Ch6_S4_OutputSchemaComponent
});
