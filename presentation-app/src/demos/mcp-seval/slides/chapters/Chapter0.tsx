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
import { MetricsWall } from '../../components/MetricsWall';

/**
 * Chapter 0: "The Challenge"
 * Ch0_S1 — Title Slide
 * Ch0_S2 — The Evaluation Problem
 */

// ─── Ch0_S1: Title ────────────────────────────────────────────────

const TitleComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();

  return (
    <SlideContainer>
      <FloatingParticles
        count={30}
        colors={['#22c55e', '#14b8a6', '#8b5cf6']}
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
              'MCP SEVAL'
            ) : (
              <TypeAnimation
                sequence={['MCP SEVAL', 1000]}
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
            An MCP Server with 16 Evaluation Tools for AI Agents
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
    title: 'MCP SEVAL',
    audioSegments: [
      { id: 0 },
      { id: 1 },
    ],
  },
  component: TitleComponent,
});

// ─── Ch0_S2: The Evaluation Problem ──────────────────────────────

const EvalProblemComponent: React.FC = () => {
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
            The Evaluation Problem
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
            {/* Left: SEVAL job card */}
            <div
              style={{
                background: theme.colors.bgSurface,
                borderRadius: 12,
                border: `1px solid ${theme.colors.bgBorder}`,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
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
                SEVAL Job
              </div>
              <div style={{
                padding: 14,
                background: 'rgba(34, 197, 94, 0.06)',
                borderRadius: 8,
                borderLeft: '3px solid #22c55e',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                <div style={{ fontSize: 14, color: theme.colors.textPrimary, fontWeight: 600 }}>
                  my-search-grounding-eval
                </div>
                <div style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                  Template: UnifiedBizChat v2.4.1
                </div>
                <div style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                  200 utterances &bull; Status: <span style={{ color: '#22c55e', fontWeight: 600 }}>Completed</span>
                </div>
              </div>
              <div style={{
                fontSize: 13,
                color: theme.colors.textSecondary,
                lineHeight: 1.5,
                marginTop: 4,
              }}>
                Multiple dashboard tabs. Aggregate metrics. Per-utterance breakdowns. P-values across dozens of columns.
              </div>
            </div>

            {/* Right: MetricsWall */}
            <Reveal from={1} animation={fadeIn}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <MetricsWall speed={25} rowCount={30} />
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <PulsingBadge
                    icon={'\u26A0\uFE0F'}
                    floatingIcons={['\u{1F635}', '\u{1F525}']}
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
                          to={47}
                          duration={reduced ? 0.1 : 2}
                        />
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
                        scorecard metrics
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
                Manual SEVAL
              </h3>
              {['Click through multiple dashboard tabs', 'Cross-reference p-values in spreadsheets', 'Manually find regressed utterances'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', color: theme.colors.textSecondary, fontSize: 14 }}>
                  <span style={{ color: theme.colors.error }}>{'\u2715'}</span> {item}
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
                With MCP SEVAL
              </h3>
              {['Agent reads scorecards and interprets metrics', 'Finds regressions and explains tradeoffs', 'Drills into per-utterance detail in one conversation'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', color: theme.colors.textPrimary, fontSize: 14 }}>
                  <span style={{ color: theme.colors.primary }}>{'\u2713'}</span> {item}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </SlideContainer>
  );
};

export const Ch0_S2_EvalProblem = defineSlide({
  metadata: {
    chapter: 0,
    slide: 2,
    title: 'The Evaluation Problem',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ],
  },
  component: EvalProblemComponent,
});
