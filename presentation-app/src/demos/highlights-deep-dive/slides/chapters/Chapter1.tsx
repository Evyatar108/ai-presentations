import React from 'react';
import {
  useReducedMotion,
  useTheme,
  useMarker,
  defineSlide,
  SlideContainer,
  SlideTitle,
  MetricTile,
  TestimonialCard,
  Reveal,
  typography,
  layouts,
  cardStyle,
  fadeUp,
} from '@framework';

/**
 * Chapter 1: Problem Context (2 slides)
 */

// ---------- Slide 1: Product Context ----------

const PIPELINE_ITEMS = [
  { label: 'Transcript', marker: 'transcript' },
  { label: 'LLM', marker: 'llm' },
  { label: 'Metadata + TTS', marker: 'tts' },
  { label: 'On-Demand Streaming', marker: 'streaming' },
];

const PipelineBox: React.FC<{
  label: string; marker: string; index: number;
  dimmed: boolean; theme: ReturnType<typeof useTheme>;
}> = ({ label, marker, index, dimmed, theme }) => {
  const { reached } = useMarker(marker);
  const lit = !dimmed || reached;
  return (
    <div style={{
      padding: '0.75rem 1.25rem',
      borderRadius: 12,
      background: index === 1
        ? `linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))`
        : theme.colors.bgSurface,
      border: index === 1
        ? `2px solid ${theme.colors.primary}`
        : `1px solid ${theme.colors.bgBorder}`,
      color: theme.colors.textPrimary,
      fontWeight: 600,
      fontSize: 14,
      opacity: lit ? 1 : 0.15,
      transition: 'opacity 0.4s ease',
    }}>
      {label}
    </div>
  );
};

const PipelineArrow: React.FC<{
  prevMarker: string; marker: string; dimmed: boolean;
  theme: ReturnType<typeof useTheme>;
}> = ({ prevMarker, marker, dimmed, theme }) => {
  const { reached: prevReached } = useMarker(prevMarker);
  const { reached: curReached } = useMarker(marker);
  const lit = !dimmed || (prevReached && curReached);
  return (
    <span style={{
      fontSize: 20,
      color: theme.colors.primary,
      opacity: lit ? 1 : 0.15,
      transition: 'opacity 0.4s ease',
    }}>&#8594;</span>
  );
};

const TypeCard: React.FC<{
  marker: string; emoji: string; title: string; desc: string;
  theme: ReturnType<typeof useTheme>;
}> = ({ marker, emoji, title, desc, theme }) => {
  const { reached } = useMarker(marker);
  return (
    <div style={{
      background: theme.colors.bgSurface,
      borderRadius: 16,
      padding: '1.5rem',
      border: `1px solid ${theme.colors.bgBorder}`,
      textAlign: 'center',
      opacity: reached ? 1 : 0.15,
      transition: 'opacity 0.4s ease',
    }}>
      <div style={{ fontSize: 36, marginBottom: '0.75rem' }}>{emoji}</div>
      <h3 style={{ ...typography.h2 }}>{title}</h3>
      <p style={{ ...typography.caption, fontSize: 14 }}>{desc}</p>
    </div>
  );
};

const Ch1_S1_ProductContextComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();
  const { reached: dimmed } = useMarker('dim-pipeline');

  return (
    <SlideContainer maxWidth={1000}>
      <Reveal from={0}>
        <SlideTitle reduced={reduced}>
          Meeting Highlights: AI Video Recaps
        </SlideTitle>
      </Reveal>

      <Reveal from={1} animation={fadeUp} style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {PIPELINE_ITEMS.map((item, i) => (
          <React.Fragment key={item.label}>
            {i > 0 && (
              <PipelineArrow
                prevMarker={PIPELINE_ITEMS[i - 1].marker}
                marker={item.marker}
                dimmed={dimmed}
                theme={theme}
              />
            )}
            <PipelineBox
              label={item.label}
              marker={item.marker}
              index={i}
              dimmed={dimmed}
              theme={theme}
            />
          </React.Fragment>
        ))}
      </Reveal>

      <Reveal from={2} animation={fadeUp} style={{ ...layouts.grid2Col('2rem') }}>
        <TypeCard
          marker="abstractive-card"
          emoji="&#x1F4DD;"
          title="Abstractive Narration"
          desc="AI-generated topic summaries spoken over video"
          theme={theme}
        />
        <TypeCard
          marker="extractive-card"
          emoji="&#x1F3AC;"
          title="Extractive Clips"
          desc="Key meeting moments with original audio"
          theme={theme}
        />
      </Reveal>
    </SlideContainer>
  );
};

export const Ch1_S1_ProductContext = defineSlide({
  metadata: {
    chapter: 1,
    slide: 1,
    title: 'Product Context',
    audioSegments: [
      { id: 'title' },
      { id: 'pipeline' },
      { id: 'types' }
    ]
  },
  component: Ch1_S1_ProductContextComponent
});

// ---------- Slide 2: COGS Problem ----------

const Ch1_S2_COGSProblemComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={900}>
      <Reveal from={0} animation={fadeUp} style={{ ...layouts.flexRow('1.5rem'), marginBottom: '2rem' }}>
        <MetricTile label="LLM Calls" after="4" note="Sequential pipeline" />
        <MetricTile label="Projected GPUs" after="~600" note="A100 GPUs" />
        <MetricTile label="Status" after="Capacity Blocker" note="Blocking GA rollout" />
      </Reveal>

      <Reveal from={1} animation={fadeUp} style={{ marginBottom: '1.5rem' }}>
        <TestimonialCard
          quote="The current approach was consuming too many GPUs. We needed a fundamentally different strategy to make GA viable."
          author="Eli Lekhtser, Engineering Manager"
          reduced={reduced}
        />
      </Reveal>

      <Reveal from={2} animation={fadeUp}>
        <div style={{
          ...cardStyle('error'),
          textAlign: 'center'
        }}>
          <p style={{ ...typography.body, margin: 0, fontWeight: 600, color: theme.colors.error }}>
            The fix had to come from prompt engineering
          </p>
        </div>
      </Reveal>
    </SlideContainer>
  );
};

export const Ch1_S2_COGSProblem = defineSlide({
  metadata: {
    chapter: 1,
    slide: 2,
    title: 'COGS Problem',
    audioSegments: [
      { id: 'metrics' },
      { id: 'quote' },
      { id: 'emphasis' }
    ]
  },
  component: Ch1_S2_COGSProblemComponent
});
