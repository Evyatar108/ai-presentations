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
 * Chapter 6: Pseudocode Algorithm (2 slides)
 */

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

// ---------- Slide 1: Pseudocode ----------

const Ch6_S1_PseudocodeComponent: React.FC = () => {
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
            highlightLines={[1, 7, 15, 20, 22, 24]}
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

export const Ch6_S1_Pseudocode = defineSlide({
  metadata: {
    chapter: 6,
    slide: 1,
    title: 'Pseudocode Algorithm',
    audioSegments: [
      { id: 'title', audioFilePath: '/audio/highlights-deep-dive/c6/s1_segment_01_title.wav' },
      { id: 'code', audioFilePath: '/audio/highlights-deep-dive/c6/s1_segment_02_code.wav' },
      { id: 'outputs', audioFilePath: '/audio/highlights-deep-dive/c6/s1_segment_03_outputs.wav' }
    ]
  },
  component: Ch6_S1_PseudocodeComponent
});

// ---------- Slide 2: Prose vs Pseudocode ----------

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
  'Code-execution mode in LLM',
  'Single source of truth'
];

const Ch6_S2_ProseVsPseudocodeComponent: React.FC = () => {
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

export const Ch6_S2_ProseVsPseudocode = defineSlide({
  metadata: {
    chapter: 6,
    slide: 2,
    title: 'Prose vs Pseudocode',
    audioSegments: [
      { id: 'comparison', audioFilePath: '/audio/highlights-deep-dive/c6/s2_segment_01_comparison.wav' },
      { id: 'benefits', audioFilePath: '/audio/highlights-deep-dive/c6/s2_segment_02_benefits.wav' }
    ]
  },
  component: Ch6_S2_ProseVsPseudocodeComponent
});
