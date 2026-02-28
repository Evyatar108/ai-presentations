import React from 'react';
import { motion } from 'framer-motion';
import {
  defineSlide,
  useTheme,
  useReducedMotion,
  SlideContainer,
  GradientText,
  FloatingParticles,
  Reveal,
  PulsingBadge,
  AnimatedCounter,
  fadeIn,
  fadeUp,
} from '@framework';
import { TypeAnimation } from 'react-type-animation';
import { TelemetryWall } from '../../components/TelemetryWall';

/**
 * Chapter 0: "The Black Box"
 * Ch0_S1 — Title Slide
 * Ch0_S2 — The Debugging Problem
 */

// ─── Ch0_S1: Title ────────────────────────────────────────────────

const TitleComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();

  return (
    <SlideContainer>
      <FloatingParticles
        count={30}
        colors={['#3b82f6', '#06b6d4', '#8b5cf6']}
        speed={0.3}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div
          initial={reduced ? undefined : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center' }}
        >
          <GradientText
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {reduced ? (
              'MCP DevUI'
            ) : (
              <TypeAnimation
                sequence={['MCP DevUI', 1000]}
                speed={40}
                cursor={false}
              />
            )}
          </GradientText>
        </motion.div>

        <Reveal from={1} animation={fadeUp}>
          <p
            style={{
              color: theme.colors.textSecondary,
              fontSize: 24,
              marginTop: 24,
              fontWeight: 400,
              letterSpacing: '0.01em',
            }}
          >
            23 AI-Powered Debugging Tools for Copilot Conversations
          </p>
        </Reveal>
      </div>
    </SlideContainer>
  );
};

export const Ch0_S1_Title = defineSlide({
  metadata: {
    chapter: 0,
    slide: 1,
    title: 'MCP DevUI',
    audioSegments: [
      {
        id: 0,
        narrationText:
          'MCP DevUI.',
      },
      {
        id: 1,
        narrationText:
          'Twenty-three AI-powered debugging tools for Copilot conversations.',
      },
    ],
  },
  component: TitleComponent,
});

// ─── Ch0_S2: The Debugging Problem ────────────────────────────────

const DebuggingProblemComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();

  return (
    <SlideContainer>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          height: '100%',
        }}
      >
        {/* Segment 0: Problem framing */}
        <Reveal from={0} animation={fadeUp}>
          <h2
            style={{
              color: theme.colors.textPrimary,
              fontSize: 32,
              fontWeight: 700,
              textAlign: 'center',
              margin: 0,
            }}
          >
            The Debugging Problem
          </h2>
        </Reveal>

        <Reveal from={0} animation={fadeIn}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 24,
              flex: 1,
            }}
          >
            {/* Left: bad prompt/response */}
            <div
              style={{
                background: theme.colors.bgSurface,
                borderRadius: 12,
                border: `1px solid ${theme.colors.bgBorder}`,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div
                style={{
                  color: theme.colors.primary,
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                User Prompt
              </div>
              <div
                style={{
                  color: theme.colors.textPrimary,
                  fontSize: 16,
                  fontStyle: 'italic',
                  padding: 16,
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: 8,
                  borderLeft: `3px solid ${theme.colors.primary}`,
                }}
              >
                "What files were shared with me in yesterday's meeting?"
              </div>
              <div
                style={{
                  color: theme.colors.error,
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginTop: 8,
                }}
              >
                Bot Response
              </div>
              <div
                style={{
                  color: theme.colors.textSecondary,
                  fontSize: 14,
                  padding: 16,
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: 8,
                  borderLeft: '3px solid rgba(239, 68, 68, 0.6)',
                }}
              >
                "I'm sorry, I wasn't able to find that information..."
              </div>
            </div>

            {/* Right: Telemetry wall */}
            <Reveal from={1} animation={fadeIn}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <TelemetryWall speed={25} rowCount={35} />
                <div style={{ textAlign: 'center' }}>
                  <PulsingBadge>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px' }}>
                      <span
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: theme.colors.primary,
                        }}
                      >
                        <AnimatedCounter
                          from={0}
                          to={1247}
                          duration={reduced ? 0.1 : 2}
                        />
                      </span>
                      <span style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
                        telemetry entries
                      </span>
                    </span>
                  </PulsingBadge>
                </div>
              </div>
            </Reveal>
          </div>
        </Reveal>

        {/* Segment 2: Before/After */}
        <Reveal from={2} animation={fadeUp}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div
              style={{
                background: theme.colors.bgSurface,
                borderRadius: 12,
                border: `1px solid ${theme.colors.bgBorder}`,
                padding: 20,
              }}
            >
              <h3 style={{ color: theme.colors.error, fontSize: 16, fontWeight: 600, margin: '0 0 12px 0' }}>
                Without DevUI
              </h3>
              {['Raw JSON in browser DevTools', 'Manually count 1,247 entries', 'Copy-paste between portal tabs'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', color: theme.colors.textSecondary, fontSize: 14 }}>
                  <span style={{ color: theme.colors.error }}>✕</span> {item}
                </div>
              ))}
            </div>
            <div
              style={{
                background: theme.colors.bgSurface,
                borderRadius: 12,
                border: `1px solid ${theme.colors.primary}`,
                padding: 20,
              }}
            >
              <h3 style={{ color: theme.colors.primary, fontSize: 16, fontWeight: 600, margin: '0 0 12px 0' }}>
                With DevUI
              </h3>
              {['Structured symptom report', '9 categorized sections', 'One-click drill-down to any metric'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', color: theme.colors.textPrimary, fontSize: 14 }}>
                  <span style={{ color: theme.colors.primary }}>✓</span> {item}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </SlideContainer>
  );
};

export const Ch0_S2_DebuggingProblem = defineSlide({
  metadata: {
    chapter: 0,
    slide: 2,
    title: 'The Debugging Problem',
    audioSegments: [
      {
        id: 0,
        narrationText:
          "You ask Copilot a question, and it gives you a bad answer. Why? What went wrong behind the scenes? To find out, you'd open the DevUI portal and face a wall of raw telemetry.",
      },
      {
        id: 1,
        narrationText:
          'Twelve hundred and forty-seven telemetry entries for a single turn. Service calls, latencies, payloads — all in raw JSON with no structure, no triage, no guidance on where to look first.',
      },
      {
        id: 2,
        narrationText:
          "That's the problem MCP DevUI solves. Instead of raw JSON chaos, you get structured, categorized reports with instant drill-down. Let me show you how.",
      },
    ],
  },
  component: DebuggingProblemComponent,
});
