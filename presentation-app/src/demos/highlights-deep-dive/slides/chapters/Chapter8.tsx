import React from 'react';
import {
  useReducedMotion,
  useTheme,
  defineSlide,
  SlideContainer,
  SlideTitle,
  Reveal,
  Callout,
  MarkerDim,
  GradientHighlightBox,
  cardStyle,
  typography,
  fadeUp,
  ArrowRight,
} from '@framework';

/**
 * Chapter 8: Evaluation & Iteration (2 slides)
 */

// ---------- Slide 1: Validation Challenges ----------

const CHECKS = [
  {
    title: 'Output Range Validation',
    desc: 'Every turn + utterance ID in the output must exist in the input transcript',
    icon: '\u2714',
    marker: 'range-check'
  },
  {
    title: 'Max Utterance Threshold',
    desc: 'Beginning utterance of a clip must not exceed max_end_utterance_id from the transcript table',
    icon: '\u2714',
    marker: 'threshold-check'
  }
];

const CheckCard: React.FC<{
  check: typeof CHECKS[number];
  theme: ReturnType<typeof useTheme>;
}> = ({ check, theme }) => {
  return (
    <MarkerDim at={check.marker}>
      <div style={{
        ...cardStyle(),
        padding: '1.25rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '0.5rem'
        }}>
          <div style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: `linear-gradient(135deg, ${theme.colors.success}, #059669)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            color: '#fff',
            fontWeight: 700,
            flexShrink: 0
          }}>
            {check.icon}
          </div>
          <div style={{
            ...typography.body,
            fontSize: 15,
            fontWeight: 600,
            color: theme.colors.textPrimary
          }}>
            {check.title}
          </div>
        </div>
        <div style={{ ...typography.caption, fontSize: 13, lineHeight: 1.5 }}>
          {check.desc}
        </div>
      </div>
    </MarkerDim>
  );
};

const Ch8_S1_ValidationChallengesComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={950}>
      <Reveal from={0}>
        <SlideTitle reduced={reduced}>
          Validating Turn-Utterance Output
        </SlideTitle>
      </Reveal>

      <Reveal from={1} animation={fadeUp} style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {CHECKS.map((check) => (
          <CheckCard key={check.title} check={check} theme={theme} />
        ))}
      </Reveal>

      <Reveal from={2} animation={fadeUp}>
        <Callout variant="info" icon="" style={{ textAlign: 'center' }}>
          <div style={{
            ...typography.body,
            fontSize: 15,
            fontWeight: 600,
            color: theme.colors.primary,
            marginBottom: '0.4rem'
          }}>
            Copy-then-Parse Was the Key Mitigation
          </div>
          <div style={{ ...typography.caption, fontSize: 13, lineHeight: 1.5 }}>
            Error rate of invalid turn-utterance combinations dropped dramatically
            once the model was forced to copy raw strings before parsing IDs.
          </div>
        </Callout>
      </Reveal>
    </SlideContainer>
  );
};

export const Ch8_S1_ValidationChallenges = defineSlide({
  metadata: {
    chapter: 8,
    slide: 1,
    title: 'Validation Challenges',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 }
    ]
  },
  component: Ch8_S1_ValidationChallengesComponent
});

// ---------- Slide 2: Eval Tool ----------

const PIPELINE_STEPS = [
  { label: 'Transcript + Recording', color: 'warning' as const, marker: 'input' },
  { label: 'Local Runner', color: 'primary' as const, marker: 'runner' },
  { label: 'JSON + Video', color: 'success' as const, marker: 'json-output' },
];

const EvalPipelineStep: React.FC<{
  step: typeof PIPELINE_STEPS[number];
  theme: ReturnType<typeof useTheme>;
  colorMap: Record<string, string>;
}> = ({ step, theme, colorMap }) => {
  return (
    <MarkerDim at={step.marker}>
      <div style={{
        padding: '0.8rem 1.5rem',
        borderRadius: 10,
        background: theme.colors.bgSurface,
        border: `2px solid ${colorMap[step.color]}`,
        fontSize: 14,
        fontWeight: 600,
        color: theme.colors.textPrimary,
        textAlign: 'center',
      }}>
        {step.label}
      </div>
    </MarkerDim>
  );
};

const EvalPipelineArrow: React.FC<{
  marker: string;
  theme: ReturnType<typeof useTheme>;
}> = ({ marker, theme }) => {
  return (
    <MarkerDim at={marker}>
      <span style={{ color: theme.colors.primary }}>
        <ArrowRight />
      </span>
    </MarkerDim>
  );
};

const Ch8_S2_EvalToolComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();

  const colorMap = {
    warning: theme.colors.warning,
    primary: theme.colors.primary,
    success: theme.colors.success
  };

  return (
    <SlideContainer maxWidth={950}>
      <Reveal from={0}>
        <SlideTitle reduced={reduced}>
          Local Evaluation Tool
        </SlideTitle>
      </Reveal>

      <Reveal from={1} animation={fadeUp} style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {PIPELINE_STEPS.map((step, i) => (
          <React.Fragment key={step.label}>
            {i > 0 && <EvalPipelineArrow marker={step.marker} theme={theme} />}
            <EvalPipelineStep step={step} theme={theme} colorMap={colorMap} />
          </React.Fragment>
        ))}
      </Reveal>

      <Reveal from={1} animation={fadeUp} style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <MarkerDim at="json-output">
          <div style={{
            ...cardStyle(),
            borderRadius: 10,
          }}>
            <div style={{
              ...typography.caption,
              fontSize: 11,
              color: theme.colors.primary,
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: '0.4rem'
            }}>
              Automated Validation
            </div>
            <div style={{ ...typography.body, fontSize: 13 }}>
              Highlights JSON checked for structural correctness and turn-utterance accuracy
            </div>
          </div>
        </MarkerDim>
        <MarkerDim at="video-output">
          <div style={{
            ...cardStyle(),
            borderRadius: 10,
          }}>
            <div style={{
              ...typography.caption,
              fontSize: 11,
              color: theme.colors.success,
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: '0.4rem'
            }}>
              Subjective Review
            </div>
            <div style={{ ...typography.body, fontSize: 13 }}>
              Highlights video lets you see and hear exactly what the model selected
            </div>
          </div>
        </MarkerDim>
      </Reveal>

      <Reveal from={2} animation={fadeUp}>
        <GradientHighlightBox reduced={reduced}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              ...typography.body,
              fontSize: 14,
              fontWeight: 600,
              color: theme.colors.primary,
              marginBottom: '0.3rem'
            }}>
              Rapid Iteration Through Dual Feedback
            </div>
            <div style={{ ...typography.caption, fontSize: 13, lineHeight: 1.5 }}>
              Change a prompt, run locally, check both signals in minutes — not hours.
              This tight feedback loop made it practical to test dozens of prompt revisions per day.
            </div>
          </div>
        </GradientHighlightBox>
      </Reveal>
    </SlideContainer>
  );
};

export const Ch8_S2_EvalTool = defineSlide({
  metadata: {
    chapter: 8,
    slide: 2,
    title: 'Eval Tool',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 }
    ]
  },
  component: Ch8_S2_EvalToolComponent
});
