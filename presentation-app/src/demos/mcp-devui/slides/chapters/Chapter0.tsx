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
  AnnotateAtMarker,
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
            An MCP Server with 22 Debugging Tools for AI Agents
          </p>
          <p
            style={{
              color: theme.colors.textSecondary,
              fontSize: 16,
              marginTop: 16,
              fontWeight: 400,
              opacity: 0.7,
              textAlign: 'center',
            }}
          >
            By Evyatar Mitrani
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
      { id: 0 },
      { id: 1 },
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
          gap: 8,
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
                <AnnotateAtMarker at="bad-answer" type="underline" color="rgba(239, 68, 68, 0.7)" strokeWidth={2}>
                  "I'm sorry, I wasn't able to find that information..."
                </AnnotateAtMarker>
              </div>
            </div>

            {/* Right: Telemetry wall */}
            <Reveal from={1} animation={fadeIn}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <TelemetryWall speed={25} rowCount={35} />
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <PulsingBadge
                    icon="⚠️"
                    floatingIcons={['😵', '🔥']}
                    colors={['#dc2626', '#991b1b']}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px' }}>
                      <span
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: '#fff',
                        }}
                      >
                        <AnimatedCounter
                          from={0}
                          to={1247}
                          duration={reduced ? 0.1 : 2}
                        />
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
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
                Manual DevUI
              </h3>
              {['Search hundreds of entries for root causes', 'Browser freezes searching telemetry', 'Read raw JSON payloads and stack traces'].map(item => (
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
                <AnnotateAtMarker at="agent-reads" type="box" color={theme.colors.primary} strokeWidth={2}>
                  With MCP DevUI
                </AnnotateAtMarker>
              </h3>
              {['AI agent reads and interprets the data', 'Chains multiple tools in one conversation', 'Root cause in seconds, not minutes'].map(item => (
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
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ],
  },
  component: DebuggingProblemComponent,
});
