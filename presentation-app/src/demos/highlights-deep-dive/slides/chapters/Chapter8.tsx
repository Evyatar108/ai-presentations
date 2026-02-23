import React from 'react';
import {
  useReducedMotion,
  useTheme,
  useMarker,
  defineSlide,
  SlideContainer,
  SlideTitle,
  Reveal,
  Callout,
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
  const { reached } = useMarker(check.marker);
  return (
    <div style={{
      ...cardStyle(),
      padding: '1.25rem',
      opacity: reached ? 1 : 0.15,
      transition: 'opacity 0.4s ease',
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
      { id: 'title' },
      { id: 'checks' },
      { id: 'challenge' }
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
  const { reached } = useMarker(step.marker);
  return (
    <div style={{
      padding: '0.8rem 1.5rem',
      borderRadius: 10,
      background: theme.colors.bgSurface,
      border: `2px solid ${colorMap[step.color]}`,
      fontSize: 14,
      fontWeight: 600,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      opacity: reached ? 1 : 0.15,
      transition: 'opacity 0.4s ease',
    }}>
      {step.label}
    </div>
  );
};

const EvalPipelineArrow: React.FC<{
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

const Ch8_S2_EvalToolComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();
  const { reached: jsonReached } = useMarker('json-output');
  const { reached: videoReached } = useMarker('video-output');

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
        <div style={{
          ...cardStyle(),
          borderRadius: 10,
          opacity: jsonReached ? 1 : 0.15,
          transition: 'opacity 0.4s ease',
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
        <div style={{
          ...cardStyle(),
          borderRadius: 10,
          opacity: videoReached ? 1 : 0.15,
          transition: 'opacity 0.4s ease',
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
      </Reveal>

      <Reveal from={2} animation={fadeUp}>
        <Callout variant="info" icon="" style={{ textAlign: 'center' }}>
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
        </Callout>
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
      { id: 'title' },
      { id: 'pipeline' },
      { id: 'metrics' }
    ]
  },
  component: Ch8_S2_EvalToolComponent
});
