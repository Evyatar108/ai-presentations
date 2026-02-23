import React from 'react';
import {
  useReducedMotion,
  useTheme,
  useMarker,
  defineSlide,
  SlideContainer,
  SlideTitle,
  MetricDisplay,
  Callout,
  Reveal,
  typography,
  layouts,
  fadeUp,
  ArrowRight,
} from '@framework';

/**
 * Chapter 9: Results (2 slides)
 */

// ---------- Slide 1: Metrics ----------

const METRICS = [
  { value: '75%', label: 'LLM Call Reduction', detail: '4 calls \u2192 1 call', emphasis: true },
  { value: '60%', label: 'Token Reduction', detail: 'Compact table + unified prompt' },
  { value: '~70%', label: 'GPU Reduction', detail: '~600 \u2192 ~180 A100s' }
];

const Ch9_S1_MetricsComponent: React.FC = () => {
  const { reduced } = useReducedMotion();

  return (
    <SlideContainer maxWidth={1000}>
      <Reveal from={0}>
        <SlideTitle reduced={reduced}>
          Results
        </SlideTitle>
      </Reveal>

      <div style={{ ...layouts.grid3Col('2rem') }}>
        {METRICS.map((metric, i) => (
          <Reveal key={metric.label} from={i + 1}>
            <MetricDisplay
              value={metric.value}
              label={metric.label}
              reduced={reduced}
              emphasis={metric.emphasis}
              delay={reduced ? 0 : 0.1}
            />
          </Reveal>
        ))}
      </div>
    </SlideContainer>
  );
};

export const Ch9_S1_Metrics = defineSlide({
  metadata: {
    chapter: 9,
    slide: 1,
    title: 'Results Metrics',
    audioSegments: [
      { id: 'title' },
      { id: 'calls' },
      { id: 'tokens' },
      { id: 'gpus' }
    ]
  },
  component: Ch9_S1_MetricsComponent
});

// ---------- Slide 2: Quality & Impact ----------

const QUALITY_TILES = [
  { label: 'Grounding', value: 'No regression', colorKey: 'success' as const, marker: 'grounding' },
  { label: 'Coverage', value: '~75-80%', colorKey: 'primary' as const, marker: 'coverage' },
  { label: 'Reviewers', value: 'Prefer V2', colorKey: 'success' as const, marker: 'reviewers' },
];

const QualityTile: React.FC<{
  tile: typeof QUALITY_TILES[number];
  theme: ReturnType<typeof useTheme>;
}> = ({ tile, theme }) => {
  const { reached } = useMarker(tile.marker);
  return (
    <div style={{
      background: theme.colors.bgSurface,
      border: `1px solid ${theme.colors.bgBorder}`,
      borderRadius: 12,
      padding: '1rem',
      textAlign: 'center',
      opacity: reached ? 1 : 0.15,
      transition: 'opacity 0.4s ease',
    }}>
      <div style={{ ...typography.caption, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
        {tile.label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: theme.colors[tile.colorKey] }}>
        {tile.value}
      </div>
    </div>
  );
};

const ROADMAP_STEPS = [
  { label: 'Cost Reduction', marker: 'cost-step' },
  { label: 'Private Preview', marker: 'preview-step' },
  { label: 'GA Rollout', marker: 'ga-step' },
];

const RoadmapStep: React.FC<{
  step: typeof ROADMAP_STEPS[number];
  index: number;
  theme: ReturnType<typeof useTheme>;
}> = ({ step, index, theme }) => {
  const { reached } = useMarker(step.marker);
  return (
    <div style={{
      padding: '0.6rem 1.25rem',
      borderRadius: 8,
      background: index === 2
        ? `linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))`
        : theme.colors.bgSurface,
      border: index === 2
        ? `2px solid ${theme.colors.primary}`
        : `1px solid ${theme.colors.bgBorder}`,
      fontSize: 14,
      fontWeight: 600,
      color: theme.colors.textPrimary,
      opacity: reached ? 1 : 0.15,
      transition: 'opacity 0.4s ease',
    }}>
      {step.label}
    </div>
  );
};

const RoadmapArrow: React.FC<{
  marker: string;
  theme: ReturnType<typeof useTheme>;
}> = ({ marker, theme }) => {
  const { reached } = useMarker(marker);
  return (
    <span style={{
      color: theme.colors.primary,
      opacity: reached ? 1 : 0.15,
      transition: 'opacity 0.4s ease',
    }}>
      <ArrowRight />
    </span>
  );
};

const Ch9_S2_QualityAndImpactComponent: React.FC = () => {
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={950}>
      <Reveal from={0} animation={fadeUp} style={{
        ...layouts.grid3Col('1.5rem'),
        marginBottom: '2rem'
      }}>
        {QUALITY_TILES.map((tile) => (
          <QualityTile key={tile.label} tile={tile} theme={theme} />
        ))}
      </Reveal>

      <Reveal from={1} animation={fadeUp} style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {ROADMAP_STEPS.map((step, i) => (
          <React.Fragment key={step.label}>
            {i > 0 && <RoadmapArrow marker={step.marker} theme={theme} />}
            <RoadmapStep step={step} index={i} theme={theme} />
          </React.Fragment>
        ))}
      </Reveal>

      <Reveal from={2} animation={fadeUp}>
        <Callout variant="success" icon="" style={{ textAlign: 'center' }}>
          <div style={{
            ...typography.body,
            fontSize: 15,
            fontWeight: 600,
            color: theme.colors.success,
            marginBottom: '0.4rem'
          }}>
            Shipped to GA
          </div>
          <div style={{ ...typography.caption, fontSize: 13, lineHeight: 1.5 }}>
            Quality held steady while cost dropped enough to clear the capacity gate —
            Meeting Highlights shipped to general availability.
          </div>
        </Callout>
      </Reveal>
    </SlideContainer>
  );
};

export const Ch9_S2_QualityAndImpact = defineSlide({
  metadata: {
    chapter: 9,
    slide: 2,
    title: 'Quality and Impact',
    audioSegments: [
      { id: 'quality' },
      { id: 'roadmap' },
      { id: 'quote' }
    ]
  },
  component: Ch9_S2_QualityAndImpactComponent
});
