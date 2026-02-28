import React from 'react';
import {
  useReducedMotion,
  useTheme,
  defineSlide,
  SlideContainer,
  SlideTitle,
  Reveal,
  BeforeAfterSplit,
  AnimatedCheckmark,
  CircularProgress,
  ImprovementCard,
  GradientText,
  typography,
  fadeUp,
} from '@framework';

/**
 * Chapter 5: "Impact & What's Next"
 * Ch5_S1 — Impact & What's Next (merged from old Ch7_S1 + Ch7_S2)
 */

// ---------- Data ----------

const BEFORE_ITEMS = [
  'Manual DevUI portal browsing',
  'Copy-paste IDs between browser tabs',
  'Count telemetry entries by hand',
];

const AFTER_ITEMS = [
  'Automatic triage via symptom report',
  'Side-by-side conversation comparison',
  'Live chat with auto-loaded telemetry',
];

const FUTURE_ITEMS = [
  {
    icon: '\u{1F50D}',
    title: 'Prompt Explain',
    description: 'AI-powered annotations for understanding 40KB+ prompts',
  },
  {
    icon: '\u{23F1}\u{FE0F}',
    title: 'Latency Waterfall',
    description: 'Visual latency breakdown across the service call tree',
  },
];

// ---------- Slide 1: Impact & What's Next ----------

const ImpactAndNextComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();

  return (
    <SlideContainer maxWidth={950}>
      <Reveal from={0}>
        <SlideTitle reduced={reduced}>Impact &amp; What&apos;s Next</SlideTitle>
      </Reveal>

      {/* Before / After */}
      <Reveal from={0}>
        <BeforeAfterSplit
          beforeTitle="Before"
          afterTitle="With MCP DevUI"
          beforeContent={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {BEFORE_ITEMS.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    ...typography.body,
                    color: theme.colors.textSecondary,
                  }}
                >
                  <span style={{ color: theme.colors.error, fontWeight: 700, fontSize: '1rem' }}>{'\u2715'}</span>
                  {item}
                </div>
              ))}
            </div>
          }
          afterContent={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {AFTER_ITEMS.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    ...typography.body,
                    color: theme.colors.textPrimary,
                  }}
                >
                  <AnimatedCheckmark size={22} delay={reduced ? 0 : i * 0.15} />
                  {item}
                </div>
              ))}
            </div>
          }
        />
      </Reveal>

      {/* Time savings */}
      <Reveal from={1} animation={fadeUp}>
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.08))',
            borderRadius: 12,
            border: `1px solid ${theme.colors.borderSubtle}`,
            textAlign: 'center',
          }}
        >
          <p style={{ ...typography.body, color: theme.colors.textPrimary, margin: 0 }}>
            <span style={{ fontWeight: 700 }}>15–20 minutes</span> of manual navigation {'\u2192'}{' '}
            <span style={{ color: theme.colors.success, fontWeight: 700 }}>one natural-language request</span>
          </p>
        </div>
      </Reveal>

      {/* Roadmap + Coverage */}
      <Reveal from={2} animation={fadeUp}>
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          marginTop: '1.25rem',
          alignItems: 'center',
        }}>
          <CircularProgress
            value={12}
            max={17}
            size={90}
            label={
              <div style={{ textAlign: 'center' }}>
                <div style={{ ...typography.h2, fontSize: '1.1rem', color: theme.colors.textPrimary }}>
                  12/17
                </div>
                <div style={{ ...typography.caption, color: theme.colors.textMuted, fontSize: '0.6rem' }}>
                  tabs
                </div>
              </div>
            }
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {FUTURE_ITEMS.map((item) => (
              <ImprovementCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                isVisible={true}
                reduced={reduced}
              />
            ))}
          </div>
        </div>
      </Reveal>

      {/* Closing tagline */}
      <Reveal from={3} animation={fadeUp}>
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <GradientText
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            23 tools. 5 skills. 1 agent.
          </GradientText>
        </div>
      </Reveal>
    </SlideContainer>
  );
};

export const Ch5_S1_ImpactAndNext = defineSlide({
  metadata: {
    chapter: 5,
    slide: 1,
    title: "Impact & What's Next",
    audioSegments: [
      {
        id: 0,
        narrationText:
          "Let's look at the impact. Before: manual DevUI portal browsing, copy-pasting IDs between tabs, counting telemetry by hand. After: automatic triage via symptom report, side-by-side comparison, live chat with auto-loaded telemetry.",
      },
      {
        id: 1,
        narrationText:
          'What used to take fifteen to twenty minutes of manual navigation now takes a single natural-language request. The agent chains operations that would take multiple manual steps.',
      },
      {
        id: 2,
        narrationText:
          "We cover twelve of seventeen DevUI tabs today. Coming next: Prompt Explain for AI-powered annotations on forty-kilobyte prompts, and a Latency Waterfall for visual analysis across the service call tree.",
      },
      {
        id: 3,
        narrationText: 'Twenty-three tools. Five skills. One agent.',
      },
    ],
  },
  component: ImpactAndNextComponent,
});
