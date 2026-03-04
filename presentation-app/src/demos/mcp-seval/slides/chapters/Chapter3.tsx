import React from 'react';
import { motion } from 'framer-motion';
import {
  defineSlide,
  useTheme,
  useReducedMotion,
  useSegmentedAnimation,
  SlideContainer,
  Reveal,
  Callout,
  GlowBorder,
  GradientText,
  AnimatedCheckmark,
  fadeUp,
  fadeIn,
} from '@framework';
import { CrossMcpBridge } from '../../components/CrossMcpBridge';

/**
 * Chapter 3: "Going Further" (2 slides)
 * Ch3_S1 — SEVAL + DevUI Bridge
 * Ch3_S2 — The Quality Loop
 */

// ─── Ch3_S1: Cross-MCP Bridge ──────────────────────────────────────

const PHASE_MAP_BRIDGE: Record<number, number> = {
  0: 0,  // left panel only
  1: 1,  // both panels + arrows
  2: 2,  // full glow
};

const CrossMcpComponent: React.FC = () => {
  const theme = useTheme();
  const { currentSegmentIndex } = useSegmentedAnimation();
  const phase = PHASE_MAP_BRIDGE[currentSegmentIndex] ?? 0;

  return (
    <SlideContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
        <Reveal from={0} animation={fadeUp}>
          <h2
            style={{
              color: theme.colors.textPrimary,
              fontSize: 28,
              fontWeight: 700,
              textAlign: 'center',
              margin: 0,
            }}
          >
            SEVAL + DevUI Bridge
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: 15,
            color: theme.colors.textSecondary,
            margin: '6px 0 0',
          }}>
            Two MCP servers, one conversation
          </p>
        </Reveal>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', minHeight: 0 }}>
          <CrossMcpBridge activePhase={phase} />
        </div>

        <Reveal from={2} animation={fadeUp}>
          <Callout variant="tip" style={{ color: theme.colors.textPrimary }}>
            <strong>From regression detection to root cause diagnosis</strong> &mdash; without switching tools.
          </Callout>
        </Reveal>
      </div>
    </SlideContainer>
  );
};

export const Ch3_S1_CrossMcp = defineSlide({
  metadata: {
    chapter: 3,
    slide: 1,
    title: 'SEVAL + DevUI Bridge',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ],
  },
  component: CrossMcpComponent,
});

// ─── Ch3_S2: The Quality Loop ──────────────────────────────────────

const LOOP_CAPABILITIES = [
  { icon: '\u{1F4CA}', label: 'Evaluate', description: 'Run a SEVAL job and read the scorecard' },
  { icon: '\u{1F50D}', label: 'Diagnose', description: 'Find regressed utterances and debug them' },
  { icon: '\u{1F6E0}\uFE0F', label: 'Fix', description: 'Identify and resolve the root cause' },
  { icon: '\u2705', label: 'Verify', description: 'Rerun the job and confirm the improvement' },
] as const;

const CapabilityCard: React.FC<{
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

const QualityLoopComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();

  return (
    <SlideContainer maxWidth={800}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 32,
      }}>
        {/* Segment 0: Concept framing */}
        <Reveal from={0} animation={fadeIn}>
          <div style={{
            textAlign: 'center',
            maxWidth: 600,
          }}>
            <h2 style={{
              color: theme.colors.textPrimary,
              fontSize: 28,
              fontWeight: 700,
              margin: '0 0 12px 0',
            }}>
              The Quality Loop
            </h2>
            <p style={{
              color: theme.colors.textSecondary,
              fontSize: 16,
              lineHeight: 1.6,
              margin: 0,
            }}>
              A closed-loop quality workflow. Run a SEVAL job, find regressions,
              debug them, fix the code, rerun to verify.
            </p>
          </div>
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
                {LOOP_CAPABILITIES.map((cap, i) => (
                  <motion.div
                    key={cap.label}
                    initial={reduced ? undefined : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduced ? undefined : { delay: i * 0.12, duration: 0.4 }}
                    style={{ flex: 1, display: 'flex' }}
                  >
                    <CapabilityCard {...cap} />
                  </motion.div>
                ))}
              </div>
              <p style={{
                textAlign: 'center',
                fontSize: 14,
                color: theme.colors.textSecondary,
                margin: 0,
                fontStyle: 'italic',
              }}>
                Each step delegated to the agent &mdash; you describe the goal.
              </p>
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

export const Ch3_S2_QualityLoop = defineSlide({
  metadata: {
    chapter: 3,
    slide: 2,
    title: 'The Quality Loop',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ],
  },
  component: QualityLoopComponent,
});
