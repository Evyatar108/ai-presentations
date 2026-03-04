import React from 'react';
import { motion } from 'framer-motion';
import {
  useTheme,
  useReducedMotion,
  useSegmentedAnimation,
  defineSlide,
  SlideContainer,
  SlideTitle,
  Reveal,
  ShikiCodeBlock,
  FloatingParticles,
  GradientText,
  GlowBorder,
  AnimatedCheckmark,
  useMarker,
  fadeUp,
  fadeIn,
} from '@framework';
import { DismissedMetrics } from '../../components/DismissedMetrics';

/**
 * Chapter 4: "Get Started"
 * Ch4_S1 — Two Minutes to Start Evaluating
 * Ch4_S2 — Closing
 */

const MARKETPLACE_CODE = `/plugin marketplace add gim-home/ai-developer-toolkit`;
const SEVAL_INSTALL = `/plugin install seval-tools@ai-developer-toolkit`;

/** Numbered step header with optional active highlight. */
const StepHeader: React.FC<{
  number: number;
  title: string;
  isActive: boolean;
}> = ({ number, title, isActive }) => {
  const theme = useTheme();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
    }}>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: isActive ? theme.colors.primary : theme.colors.bgSurface,
        border: `1.5px solid ${isActive ? theme.colors.primary : theme.colors.bgBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 700,
        color: isActive ? '#fff' : theme.colors.textSecondary,
        flexShrink: 0,
        transition: 'background 0.3s, border-color 0.3s, color 0.3s',
      }}>
        {number}
      </div>
      <span style={{
        fontSize: 16,
        fontWeight: 600,
        color: theme.colors.textPrimary,
      }}>
        {title}
      </span>
    </div>
  );
};

// ─── Ch4_S1: Get Started ────────────────────────────────────────────

const GetStartedComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const { currentSegmentIndex } = useSegmentedAnimation();

  return (
    <SlideContainer maxWidth={850}>
      <Reveal from={0}>
        <SlideTitle reduced={reduced}>
          Two Minutes to Start Evaluating
        </SlideTitle>
      </Reveal>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
        {/* Step 1: Register marketplace */}
        <Reveal from={0} animation={fadeUp}>
          <StepHeader number={1} title="Register the marketplace" isActive={currentSegmentIndex === 0} />
          <div style={{
            fontSize: 13,
            color: theme.colors.textSecondary,
            marginBottom: 8,
            paddingLeft: 38,
          }}>
            One-time setup &mdash; ai-developer-toolkit hosts all the MCP plugins.
          </div>
          <div style={{ paddingLeft: 38 }}>
            <ShikiCodeBlock
              code={MARKETPLACE_CODE}
              language="bash"
              colorTheme="framework"
              fontSize={13}
              showLineNumbers={false}
            />
          </div>
        </Reveal>

        {/* Step 2: Install SEVAL plugin */}
        <Reveal from={1} animation={fadeUp}>
          <StepHeader number={2} title="Install the SEVAL plugin" isActive={currentSegmentIndex === 1} />
          <div style={{
            fontSize: 13,
            color: theme.colors.textSecondary,
            marginBottom: 8,
            paddingLeft: 38,
          }}>
            All sixteen tools are immediately available.
          </div>
          <div style={{ paddingLeft: 38 }}>
            <ShikiCodeBlock
              code={SEVAL_INSTALL}
              language="bash"
              colorTheme="framework"
              fontSize={13}
              showLineNumbers={false}
            />
          </div>
        </Reveal>

        {/* Step 3: Start evaluating */}
        <Reveal from={2} animation={fadeUp}>
          <StepHeader number={3} title="Start evaluating" isActive={currentSegmentIndex === 2} />
          <div style={{
            fontSize: 13,
            color: theme.colors.textSecondary,
            paddingLeft: 38,
          }}>
            Ask your agent to create a SEVAL job, analyze results, or diagnose regressions. No config files needed.
          </div>
        </Reveal>
      </div>
    </SlideContainer>
  );
};

export const Ch4_S1_GetStarted = defineSlide({
  metadata: {
    chapter: 4,
    slide: 1,
    title: 'Two Minutes to Start Evaluating',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ],
  },
  component: GetStartedComponent,
});

// ─── Ch4_S2: Closing ──────────────────────────────────────────────

const CLOSING_CAPABILITIES = [
  { icon: '\u{1F4DD}', label: 'Create', description: 'Build and submit evaluation jobs' },
  { icon: '\u{1F4C8}', label: 'Monitor', description: 'Track job progress and status' },
  { icon: '\u{1F4CA}', label: 'Analyze', description: 'Read scorecards and spot tradeoffs' },
  { icon: '\u{1F50D}', label: 'Diagnose', description: 'Drill into per-utterance regressions' },
] as const;

const ClosingCapabilityCard: React.FC<{
  icon: string;
  label: string;
  description: string;
}> = ({ icon, label, description }) => {
  const theme = useTheme();

  return (
    <div style={{
      flex: 1,
      background: theme.colors.bgSurface,
      border: `1px solid ${theme.colors.bgBorder}`,
      borderRadius: 10,
      padding: '16px 14px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      textAlign: 'center',
      minWidth: 0,
    }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{
        fontWeight: 700,
        fontSize: 16,
        color: theme.colors.textPrimary,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 12.5,
        color: theme.colors.textSecondary,
        lineHeight: 1.4,
      }}>
        {description}
      </span>
    </div>
  );
};

const ClosingComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const { reached: dismissed } = useMarker('dismiss');

  return (
    <SlideContainer>
      <FloatingParticles
        count={30}
        colors={['#22c55e', '#14b8a6', '#8b5cf6']}
        speed={0.3}
      />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        position: 'relative',
        zIndex: 1,
        gap: 32,
      }}>
        {/* Segment 0: Dismissed metrics wall */}
        <Reveal from={0} animation={fadeIn}>
          <DismissedMetrics dismissed={dismissed} />
        </Reveal>

        {/* Segment 1: Capability cards */}
        <Reveal from={1} animation={fadeUp}>
          <GlowBorder borderRadius={14} style={{ width: '100%', maxWidth: 700 }}>
            <div style={{
              background: theme.colors.bgSurface,
              borderRadius: 14,
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
              <div style={{
                display: 'flex',
                gap: 12,
              }}>
                {CLOSING_CAPABILITIES.map((cap, i) => (
                  <motion.div
                    key={cap.label}
                    initial={reduced ? undefined : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduced ? undefined : { delay: i * 0.12, duration: 0.4 }}
                    style={{ flex: 1, display: 'flex' }}
                  >
                    <ClosingCapabilityCard {...cap} />
                  </motion.div>
                ))}
              </div>
            </div>
          </GlowBorder>
        </Reveal>

        {/* Segment 2: Tagline */}
        <Reveal from={2} animation={fadeIn}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}>
            <GradientText
              as="h2"
              style={{
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
                textAlign: 'center',
                margin: 0,
              }}
            >
              Not just metrics &mdash; a quality engineer.
            </GradientText>
            <AnimatedCheckmark size={52} withCircle delay={0.3} />
          </div>
        </Reveal>
      </div>
    </SlideContainer>
  );
};

export const Ch4_S2_Closing = defineSlide({
  metadata: {
    chapter: 4,
    slide: 2,
    title: 'Closing',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ],
  },
  component: ClosingComponent,
});
