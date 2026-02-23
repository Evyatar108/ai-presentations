import React from 'react';
import {
  useReducedMotion,
  useTheme,
  useMarker,
  defineSlide,
  SlideContainer,
  SlideTitle,
  Reveal,
  CodeBlock,
  typography,
  fadeUp,
  ArrowDown,
} from '@framework';

/**
 * Chapter 7: Copy-then-Parse + Self-Checks (2 slides)
 */

const COPY_CODE = `selected_turn_opening_tag_raw_copy: "<t5 Sarah>"
raw_pipe_delimited_table_row:       "u2|Across all key engagement metrics|u4"`;

const PARSE_CODE = `speaker_name:    "Sarah"      # from "<t5 Sarah>"
turn_id:         5             # strip 't' from "t5"
start_utt_id:   2             # strip 'u' from "u2"
max_end_utt_id: 4             # strip 'u' from "u4"`;

const SELF_CHECKS: { name: string; marker: string }[] = [
  { name: 'topic_non_overlap', marker: 'topic-checks' },
  { name: 'unique_topic_ids', marker: 'id-checks' },
  { name: 'extractive_non_overlap', marker: 'extractive-checks' },
  { name: 'extractive_within_topic_bounds', marker: 'extractive-checks' },
  { name: 'max_two_extractives_per_topic', marker: 'extractive-checks' },
  { name: 'all_extractives_ranked', marker: 'extractive-checks' },
  { name: 'final_narrative_alignment', marker: 'narrative-checks' },
  { name: 'narrative_completeness', marker: 'narrative-checks' },
  { name: 'turn_boundary_compliance', marker: 'narrative-checks' },
  { name: 'topic_order_compliance', marker: 'topic-checks' }
];

// ---------- Slide 1: Copy-then-Parse ----------

const CopyCodeBlock: React.FC = () => {
  const { reached: turnTag } = useMarker('turn-tag');
  const { reached: pipeRow } = useMarker('pipe-row');
  const lines: number[] = [];
  if (turnTag) lines.push(1);
  if (pipeRow) lines.push(2);

  return (
    <CodeBlock
      code={COPY_CODE}
      language="python"
      title="Step 1: Copy raw strings verbatim"
      highlightLines={lines.length > 0 ? lines : undefined}
      fontSize={13}
    />
  );
};

const ParseCodeBlock: React.FC = () => {
  const { reached: speaker } = useMarker('speaker');
  const { reached: turnId } = useMarker('turn-id');
  const { reached: uttId } = useMarker('utt-id');
  const lines: number[] = [];
  if (speaker) lines.push(1);
  if (turnId) lines.push(2);
  if (uttId) lines.push(3, 4);

  return (
    <CodeBlock
      code={PARSE_CODE}
      language="python"
      title="Step 2: Parse structured values from copied text"
      highlightLines={lines.length > 0 ? lines : undefined}
      fontSize={13}
    />
  );
};

const Ch7_S1_CopyThenParseComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={900} textAlign="left">
      <Reveal from={0} style={{ textAlign: 'center' }}>
        <SlideTitle reduced={reduced} subtitle="Chain-of-Thought Grounding">
          Copy-then-Parse
        </SlideTitle>
      </Reveal>

      <Reveal from={1} animation={fadeUp} style={{ marginBottom: '0.75rem' }}>
        <CopyCodeBlock />
      </Reveal>

      {/* Arrow connector */}
      <Reveal from={2} style={{ textAlign: 'center', margin: '0.5rem 0', color: theme.colors.primary }}>
        <ArrowDown />
        <span style={{ ...typography.caption, fontSize: 12, display: 'block' }}>
          parse from copies
        </span>
      </Reveal>

      <Reveal from={2} animation={fadeUp}>
        <ParseCodeBlock />
      </Reveal>
    </SlideContainer>
  );
};

export const Ch7_S1_CopyThenParse = defineSlide({
  metadata: {
    chapter: 7,
    slide: 1,
    title: 'Copy-then-Parse',
    audioSegments: [
      { id: 'title' },
      { id: 'copy' },
      { id: 'parse' }
    ]
  },
  component: Ch7_S1_CopyThenParseComponent
});

// ---------- Slide 2: Self-Checks ----------

const SelfCheckCard: React.FC<{
  name: string;
  marker: string;
  dimmed: boolean;
  theme: ReturnType<typeof useTheme>;
}> = ({ name, marker, dimmed, theme }) => {
  const { reached } = useMarker(marker);
  const lit = !dimmed || reached;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      background: theme.colors.bgSurface,
      border: `1px solid ${theme.colors.bgBorder}`,
      borderRadius: 8,
      padding: '0.6rem 0.85rem',
      opacity: lit ? 1 : 0.15,
      transition: 'opacity 0.4s ease'
    }}>
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
        {name}
      </span>
    </div>
  );
};

const Ch7_S2_SelfChecksComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();
  const { reached: dimmed } = useMarker('topic-checks');

  return (
    <SlideContainer maxWidth={900}>
      <Reveal from={0}>
        <SlideTitle reduced={reduced} subtitle="Specification + Validation">
          Self-Checks
        </SlideTitle>
      </Reveal>

      <Reveal from={1} animation={fadeUp} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.6rem'
      }}>
        {SELF_CHECKS.map((check) => (
          <SelfCheckCard
            key={check.name}
            name={check.name}
            marker={check.marker}
            dimmed={dimmed}
            theme={theme}
          />
        ))}
      </Reveal>
    </SlideContainer>
  );
};

export const Ch7_S2_SelfChecks = defineSlide({
  metadata: {
    chapter: 7,
    slide: 2,
    title: 'Self-Checks',
    audioSegments: [
      { id: 'title' },
      { id: 'grid' }
    ]
  },
  component: Ch7_S2_SelfChecksComponent
});
