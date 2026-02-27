import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import {
  defineSlide,
  useReducedMotion,
  useTheme,
  useSegmentedAnimation,
  fadeIn,
  fadeUp,
  fadeDown,
  fadeRight,
  scaleIn,
  staggerContainer,
  tileVariants,
  SlideContainer,
  ContentCard,
  GradientHighlightBox,
  SlideTitle,
  BenefitCard,
  MetricDisplay,
  MetricTile,
  CircularProgress,
  AnimatedCounter,
  AnimatedHeading,
  AnimatedCheckmark,
  AnimatedArrow,
  MarkerCard,
  RevealCarousel,
  Reveal,
  AnnotateAtMarker,
  RevealSequence,
  CodeBlock,
  ShikiCodeBlock,
  Callout,
  NumberedStepCard,
  ProgressSteps,
  BeforeAfterSplit,
  ComparisonTable,
  TestimonialCard,
  PipelineDiagram,
  CandidateGrid,
  FloatingParticles,
  FloatingEmojis,
  ShimmerOverlay,
  GlowBorder,
  GradientText,
  PulsingBadge,
  cardStyle,
  monoText,
  gradientBadge,
} from '@framework';
import { TypeAnimation } from 'react-type-animation';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import Lottie from 'lottie-react';

/**
 * Component Showcase - Chapter 0
 * Previews reusable visual components (implemented and upcoming).
 */

// ─── Slide 1: Title ─────────────────────────────────────────────────────────

const TitleComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn(reduced)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
        color: theme.colors.textPrimary,
        fontFamily: theme.fontFamily,
      }}
    >
      <motion.h1
        variants={fadeUp(reduced)}
        style={{ fontSize: '3.5rem', marginBottom: '1rem' }}
      >
        Visual Components Showcase
      </motion.h1>
      <motion.p
        variants={fadeUp(reduced, 0.2)}
        style={{ fontSize: '1.8rem', opacity: 0.85 }}
      >
        Reusable animated building blocks for presentations
      </motion.p>
    </motion.div>
  );
};

export const CS_S1_Title = defineSlide({
  metadata: {
    chapter: 0,
    slide: 1,
    title: 'Visual Components Showcase',
    audioSegments: [{ id: 0 }],
  },
  component: TitleComponent,
});

// ─── Slide 2: CircularProgress ──────────────────────────────────────────────

const rings = [
  { label: 'Revenue', value: 75, size: 120, colorKey: 'primary' as const },
  { label: 'Performance', value: 92, size: 140, colorKey: 'success' as const },
  { label: 'Satisfaction', value: 64, size: 100, colorKey: 'warning' as const },
];

const CircularProgressComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <SlideContainer>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn(reduced)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2.5rem',
          maxWidth: 900,
        }}
      >
        <h2 style={{
          fontSize: '2.8rem',
          margin: 0,
          color: theme.colors.textPrimary,
          fontFamily: theme.fontFamily,
        }}>
          CircularProgress
        </h2>

        <motion.div
          variants={staggerContainer(reduced)}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}
        >
          {rings.map((ring, i) => (
            isSegmentVisible(i + 1) && (
              <motion.div
                key={ring.label}
                variants={scaleIn(reduced)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <CircularProgress
                  value={ring.value}
                  size={ring.size}
                  color={theme.colors[ring.colorKey]}
                  thickness={ring.colorKey === 'success' ? 10 : 8}
                  label={
                    <span style={{
                      fontSize: ring.size * 0.22,
                      fontWeight: 700,
                      color: theme.colors.textPrimary,
                      fontFamily: theme.fontFamily,
                    }}>
                      <AnimatedCounter to={ring.value} suffix="%" />
                    </span>
                  }
                />
                <span style={{
                  fontSize: '1.2rem',
                  color: theme.colors.textSecondary,
                  fontFamily: theme.fontFamily,
                }}>
                  {ring.label}
                </span>
              </motion.div>
            )
          ))}
        </motion.div>

        <ContentCard>
          <code style={{
            fontSize: '1rem',
            color: theme.colors.textSecondary,
            fontFamily: 'monospace',
          }}>
            {'<CircularProgress value={75} label={<AnimatedCounter to={75} suffix="%" />} />'}
          </code>
        </ContentCard>
      </motion.div>
    </SlideContainer>
  );
};

export const CS_S2_CircularProgress = defineSlide({
  metadata: {
    chapter: 0,
    slide: 2,
    title: 'CircularProgress',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ],
  },
  component: CircularProgressComponent,
});

// ─── Slide 3: AnimatedHeading ────────────────────────────────────────────────

const AnimatedHeadingComponent: React.FC = () => {
  const theme = useTheme();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <SlideContainer>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2.5rem',
        maxWidth: 900,
      }}>
        <AnimatedHeading text="AnimatedHeading" as="h2" style={{ fontSize: '2.8rem' }} />

        {isSegmentVisible(1) && (
          <div style={{
            padding: '2rem 3rem',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${theme.colors.bgBorder}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
          }}>
            <AnimatedHeading
              text="Spring Physics"
              as="h3"
              style={{ fontSize: '2.2rem' }}
              color={theme.colors.primary}
            />
          </div>
        )}

        {isSegmentVisible(2) && (
          <div style={{
            padding: '2rem 3rem',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${theme.colors.bgBorder}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
          }}>
            <AnimatedHeading
              text="Slow & Bouncy"
              as="h3"
              stagger={0.08}
              stiffness={80}
              damping={8}
              style={{ fontSize: '2.2rem' }}
              color={theme.colors.success}
            />
          </div>
        )}

        <ContentCard>
          <code style={{
            fontSize: '1rem',
            color: theme.colors.textSecondary,
            fontFamily: 'monospace',
          }}>
            {'<AnimatedHeading text="Hello" as="h1" stagger={0.04} />'}
          </code>
        </ContentCard>
      </div>
    </SlideContainer>
  );
};

export const CS_S3_AnimatedHeading = defineSlide({
  metadata: {
    chapter: 0,
    slide: 3,
    title: 'AnimatedHeading',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ],
  },
  component: AnimatedHeadingComponent,
});

// ─── Slide 4: AnimatedCheckmark ──────────────────────────────────────────────

const checkVariants = [
  { label: 'Default', size: 50, withCircle: false, colorKey: 'success' as const },
  { label: 'With Circle', size: 70, withCircle: true, colorKey: 'success' as const },
  { label: 'Custom Color', size: 60, withCircle: true, colorKey: 'primary' as const },
];

const AnimatedCheckmarkComponent: React.FC = () => {
  const theme = useTheme();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <SlideContainer>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2.5rem',
        maxWidth: 900,
      }}>
        <AnimatedHeading text="AnimatedCheckmark" as="h2" style={{ fontSize: '2.8rem' }} />

        <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
          {checkVariants.map((v, i) => (
            isSegmentVisible(i + 1) && (
              <motion.div
                key={v.label}
                variants={scaleIn(false)}
                initial="hidden"
                animate="visible"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.5rem 2rem',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${theme.colors.bgBorder}`,
                }}
              >
                <AnimatedCheckmark
                  size={v.size}
                  withCircle={v.withCircle}
                  color={theme.colors[v.colorKey]}
                  strokeWidth={v.withCircle ? 2.5 : 3}
                />
                <span style={{
                  fontSize: '1rem',
                  color: theme.colors.textSecondary,
                  fontFamily: theme.fontFamily,
                }}>
                  {v.label}
                </span>
              </motion.div>
            )
          ))}
        </div>

        <ContentCard>
          <code style={{
            fontSize: '1rem',
            color: theme.colors.textSecondary,
            fontFamily: 'monospace',
          }}>
            {'<AnimatedCheckmark size={70} withCircle color="#22c55e" />'}
          </code>
        </ContentCard>
      </div>
    </SlideContainer>
  );
};

export const CS_S4_AnimatedCheckmark = defineSlide({
  metadata: {
    chapter: 0,
    slide: 4,
    title: 'AnimatedCheckmark',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ],
  },
  component: AnimatedCheckmarkComponent,
});

// ─── Slide 5: AnimatedArrow ──────────────────────────────────────────────────

const AnimatedArrowComponent: React.FC = () => {
  const theme = useTheme();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <SlideContainer>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2.5rem',
        maxWidth: 900,
      }}>
        <AnimatedHeading text="AnimatedArrow" as="h2" style={{ fontSize: '2.8rem' }} />

        {isSegmentVisible(1) && (
          <motion.div
            variants={scaleIn(false)}
            initial="hidden"
            animate="visible"
            style={{
              display: 'flex',
              gap: '2.5rem',
              alignItems: 'center',
              padding: '1.5rem 2rem',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${theme.colors.bgBorder}`,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <AnimatedArrow direction="right" length={140} color={theme.colors.primary} />
              <span style={{ fontSize: '0.9rem', color: theme.colors.textSecondary }}>Right</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <AnimatedArrow direction="down" length={80} color={theme.colors.success} delay={0.2} />
              <span style={{ fontSize: '0.9rem', color: theme.colors.textSecondary }}>Down</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <AnimatedArrow direction="left" length={140} color={theme.colors.warning} delay={0.4} />
              <span style={{ fontSize: '0.9rem', color: theme.colors.textSecondary }}>Left</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <AnimatedArrow direction="up" length={80} color={theme.colors.accent} delay={0.6} />
              <span style={{ fontSize: '0.9rem', color: theme.colors.textSecondary }}>Up</span>
            </div>
          </motion.div>
        )}

        {isSegmentVisible(2) && (
          <motion.div
            variants={scaleIn(false)}
            initial="hidden"
            animate="visible"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.5rem 2rem',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${theme.colors.bgBorder}`,
            }}
          >
            <span style={{ fontSize: '1rem', color: theme.colors.textSecondary, fontFamily: theme.fontFamily }}>
              Custom Bezier Path
            </span>
            <AnimatedArrow
              path="M 10 70 C 60 10, 140 10, 190 70"
              viewBoxWidth={200}
              viewBoxHeight={80}
              color={theme.colors.secondary}
              strokeWidth={3}
            />
          </motion.div>
        )}

        <ContentCard>
          <code style={{
            fontSize: '1rem',
            color: theme.colors.textSecondary,
            fontFamily: 'monospace',
          }}>
            {'<AnimatedArrow direction="right" length={150} />'}
          </code>
        </ContentCard>
      </div>
    </SlideContainer>
  );
};

export const CS_S5_AnimatedArrow = defineSlide({
  metadata: {
    chapter: 0,
    slide: 5,
    title: 'AnimatedArrow',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ],
  },
  component: AnimatedArrowComponent,
});

// ─── Slide 6: Graduated Gauge ───────────────────────────────────────────────

const GAUGE_STOPS = [
  { offset: '0%', color: '#22c55e' },   // green
  { offset: '50%', color: '#eab308' },  // yellow
  { offset: '100%', color: '#ef4444' }, // red
];

const GaugeBar: React.FC<{
  value: number;
  max: number;
  label: string;
  height?: number;
  delay?: number;
  gradientId: string;
}> = ({ value, max, label, height = 28, delay = 0, gradientId }) => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();
  const fraction = Math.min(Math.max(value / max, 0), 1);

  const raw = useMotionValue(reduced ? fraction : 0);
  const spring = useSpring(raw, { stiffness: 50, damping: 15, restDelta: 0.001 });
  const scaleX = reduced ? raw : spring;

  useEffect(() => {
    if (reduced) {
      raw.set(fraction);
      return;
    }
    const timeout = setTimeout(() => raw.set(fraction), delay * 1000);
    return () => clearTimeout(timeout);
  }, [fraction, delay, reduced, raw]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <span style={{
        fontSize: '0.9rem',
        color: theme.colors.textSecondary,
        fontFamily: theme.fontFamily,
        minWidth: 100,
        textAlign: 'right',
      }}>
        {label}
      </span>
      <div style={{
        flex: 1,
        height,
        background: theme.colors.bgBorder,
        borderRadius: height / 2,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <svg width="100%" height={height} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id={gradientId}>
              {GAUGE_STOPS.map((s) => (
                <stop key={s.offset} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>
          </defs>
        </svg>
        <motion.div
          style={{
            height: '100%',
            borderRadius: height / 2,
            background: `linear-gradient(90deg, #22c55e, #eab308, #ef4444)`,
            transformOrigin: 'left',
            scaleX,
          }}
        />
      </div>
      <span style={{
        fontSize: '1rem',
        fontWeight: 700,
        color: theme.colors.textPrimary,
        fontFamily: theme.fontFamily,
        minWidth: 50,
      }}>
        {value}%
      </span>
    </div>
  );
};

const GraduatedGaugeComponent: React.FC = () => {
  const theme = useTheme();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <SlideContainer>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2.5rem',
        maxWidth: 700,
      }}>
        <AnimatedHeading text="Graduated Gauge" as="h2" style={{ fontSize: '2.8rem' }} />

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {isSegmentVisible(1) && (
            <motion.div variants={scaleIn(false)} initial="hidden" animate="visible">
              <GaugeBar value={35} max={100} label="CPU Load" gradientId="gauge-cpu" />
            </motion.div>
          )}
          {isSegmentVisible(2) && (
            <motion.div variants={scaleIn(false)} initial="hidden" animate="visible">
              <GaugeBar value={72} max={100} label="Memory" delay={0.15} gradientId="gauge-mem" />
            </motion.div>
          )}
          {isSegmentVisible(3) && (
            <motion.div variants={scaleIn(false)} initial="hidden" animate="visible">
              <GaugeBar value={93} max={100} label="Disk I/O" delay={0.3} gradientId="gauge-disk" />
            </motion.div>
          )}
        </div>

        <ContentCard>
          <code style={{
            fontSize: '0.9rem',
            color: theme.colors.textSecondary,
            fontFamily: 'monospace',
          }}>
            SVG linearGradient (green→yellow→red) + useSpring scaleX
          </code>
        </ContentCard>
      </div>
    </SlideContainer>
  );
};

export const CS_S6_GraduatedGauge = defineSlide({
  metadata: {
    chapter: 0,
    slide: 6,
    title: 'Graduated Gauge',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ],
  },
  component: GraduatedGaugeComponent,
});

// ─── Slide 7: Animated Bar Chart ────────────────────────────────────────────

const BAR_DATA = [
  { label: 'Grounding', value: 95, colorKey: 'success' as const },
  { label: 'Coverage', value: 78, colorKey: 'primary' as const },
  { label: 'Fluency', value: 88, colorKey: 'accent' as const },
  { label: 'Relevance', value: 82, colorKey: 'secondary' as const },
];

const AnimatedBar: React.FC<{
  value: number;
  max: number;
  color: string;
  delay?: number;
  height?: number;
}> = ({ value, max, color, delay = 0, height = 32 }) => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();
  const fraction = Math.min(Math.max(value / max, 0), 1);

  const raw = useMotionValue(reduced ? fraction : 0);
  const spring = useSpring(raw, { stiffness: 50, damping: 15, restDelta: 0.001 });
  const scaleX = reduced ? raw : spring;

  useEffect(() => {
    if (reduced) {
      raw.set(fraction);
      return;
    }
    const timeout = setTimeout(() => raw.set(fraction), delay * 1000);
    return () => clearTimeout(timeout);
  }, [fraction, delay, reduced, raw]);

  return (
    <div style={{
      height,
      background: theme.colors.bgBorder,
      borderRadius: height / 2,
      overflow: 'hidden',
    }}>
      <motion.div
        style={{
          height: '100%',
          background: color,
          borderRadius: height / 2,
          transformOrigin: 'left',
          scaleX,
        }}
      />
    </div>
  );
};

const AnimatedBarChartComponent: React.FC = () => {
  const theme = useTheme();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <SlideContainer>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2.5rem',
        maxWidth: 700,
      }}>
        <AnimatedHeading text="Animated Bar Chart" as="h2" style={{ fontSize: '2.8rem' }} />

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {BAR_DATA.map((bar, i) => (
            isSegmentVisible(i + 1) && (
              <motion.div
                key={bar.label}
                variants={scaleIn(false)}
                initial="hidden"
                animate="visible"
                style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <span style={{
                  fontSize: '1rem',
                  color: theme.colors.textSecondary,
                  fontFamily: theme.fontFamily,
                  minWidth: 90,
                  textAlign: 'right',
                }}>
                  {bar.label}
                </span>
                <div style={{ flex: 1 }}>
                  <AnimatedBar
                    value={bar.value}
                    max={100}
                    color={theme.colors[bar.colorKey]}
                    delay={0.1 * i}
                  />
                </div>
                <span style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: theme.colors[bar.colorKey],
                  fontFamily: theme.fontFamily,
                  minWidth: 40,
                }}>
                  {bar.value}%
                </span>
              </motion.div>
            )
          ))}
        </div>

        <ContentCard>
          <code style={{
            fontSize: '0.9rem',
            color: theme.colors.textSecondary,
            fontFamily: 'monospace',
          }}>
            useSpring scaleX with staggered delays per bar
          </code>
        </ContentCard>
      </div>
    </SlideContainer>
  );
};

export const CS_S7_AnimatedBarChart = defineSlide({
  metadata: {
    chapter: 0,
    slide: 7,
    title: 'Animated Bar Chart',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
    ],
  },
  component: AnimatedBarChartComponent,
});

// ─── Slide 8: Style Utilities ────────────────────────────────────────────────

const StyleUtilitiesComponent: React.FC = () => {
  const theme = useTheme();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <SlideContainer>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        maxWidth: 900,
      }}>
        <AnimatedHeading text="Style Utilities" as="h2" style={{ fontSize: '2.8rem' }} />

        {isSegmentVisible(1) && (
          <motion.div
            variants={fadeUp(false)}
            initial="hidden"
            animate="visible"
            style={{ width: '100%' }}
          >
            <h3 style={{ color: theme.colors.textSecondary, fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              cardStyle() with overrides
            </h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={cardStyle('primary', { padding: '1.5rem', flex: 1, textAlign: 'center' })}>
                <span style={{ color: theme.colors.textPrimary }}>Primary + padding override</span>
              </div>
              <div style={cardStyle('success', { borderRadius: 20, flex: 1, textAlign: 'center' })}>
                <span style={{ color: theme.colors.textPrimary }}>Success + rounded</span>
              </div>
            </div>
          </motion.div>
        )}

        {isSegmentVisible(2) && (
          <motion.div
            variants={fadeUp(false)}
            initial="hidden"
            animate="visible"
            style={{ width: '100%' }}
          >
            <h3 style={{ color: theme.colors.textSecondary, fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              monoText()
            </h3>
            <div style={cardStyle('default', { display: 'flex', flexDirection: 'column', gap: '0.5rem' })}>
              <span style={{ ...monoText(), color: theme.colors.primary }}>monoText() — 13px / 600</span>
              <span style={{ ...monoText(16, 400), color: theme.colors.textSecondary }}>monoText(16, 400)</span>
              <span style={{ ...monoText(11, 700), color: theme.colors.success }}>monoText(11, 700)</span>
            </div>
          </motion.div>
        )}

        {isSegmentVisible(3) && (
          <motion.div
            variants={fadeUp(false)}
            initial="hidden"
            animate="visible"
            style={{ width: '100%' }}
          >
            <h3 style={{ color: theme.colors.textSecondary, fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              gradientBadge()
            </h3>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={gradientBadge()}>✓</div>
                <span style={{ color: theme.colors.textSecondary, fontSize: '0.9rem' }}>Default (22px)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={gradientBadge(32, '#3b82f6', '#1d4ed8')}>★</div>
                <span style={{ color: theme.colors.textSecondary, fontSize: '0.9rem' }}>Blue (32px)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={gradientBadge(28, '#f59e0b', '#d97706')}>!</div>
                <span style={{ color: theme.colors.textSecondary, fontSize: '0.9rem' }}>Amber (28px)</span>
              </div>
            </div>
          </motion.div>
        )}

        <ContentCard>
          <code style={{
            fontSize: '0.9rem',
            color: theme.colors.textSecondary,
            fontFamily: 'monospace',
          }}>
            {"cardStyle('primary', { padding: '2rem' })  |  monoText(14)  |  gradientBadge(28)"}
          </code>
        </ContentCard>
      </div>
    </SlideContainer>
  );
};

export const CS_S8_StyleUtilities = defineSlide({
  metadata: {
    chapter: 0,
    slide: 8,
    title: 'Style Utilities',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ],
  },
  component: StyleUtilitiesComponent,
});

// ─── Slide 9: MarkerCard ─────────────────────────────────────────────────────

const MarkerCardComponent: React.FC = () => {
  const theme = useTheme();

  return (
    <SlideContainer>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        maxWidth: 900,
      }}>
        <AnimatedHeading text="MarkerCard" as="h2" style={{ fontSize: '2.8rem' }} />

        <p style={{
          color: theme.colors.textSecondary,
          fontSize: '1.1rem',
          textAlign: 'center',
          maxWidth: 600,
          lineHeight: 1.6,
        }}>
          Combines MarkerDim + themed card in one component.
          In narrated mode, cards dim until their marker is reached.
          In manual mode (no markers), all cards show at full opacity.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', width: '100%' }}>
          <MarkerCard marker="extract" icon="🔍" title="Extraction" variant="primary">
            <span style={{ color: theme.colors.textSecondary, fontSize: '0.95rem' }}>
              Extracts entities from transcript
            </span>
          </MarkerCard>
          <MarkerCard marker="transform" icon="⚙️" title="Transform" variant="success">
            <span style={{ color: theme.colors.textSecondary, fontSize: '0.95rem' }}>
              Maps raw data to structured output
            </span>
          </MarkerCard>
          <MarkerCard marker="validate" icon="✅" title="Validate" variant="warning">
            <span style={{ color: theme.colors.textSecondary, fontSize: '0.95rem' }}>
              Runs quality checks on results
            </span>
          </MarkerCard>
          <MarkerCard marker="output" icon="📤" title="Output" variant="default">
            <span style={{ color: theme.colors.textSecondary, fontSize: '0.95rem' }}>
              Delivers final structured JSON
            </span>
          </MarkerCard>
        </div>

        <ContentCard>
          <code style={{
            fontSize: '0.9rem',
            color: theme.colors.textSecondary,
            fontFamily: 'monospace',
          }}>
            {'<MarkerCard marker="id" icon="🔍" title="Step" variant="primary">...</MarkerCard>'}
          </code>
        </ContentCard>
      </div>
    </SlideContainer>
  );
};

export const CS_S9_MarkerCard = defineSlide({
  metadata: {
    chapter: 0,
    slide: 9,
    title: 'MarkerCard',
    audioSegments: [{ id: 0 }],
  },
  component: MarkerCardComponent,
});

// ─── Slide 10: RevealCarousel ────────────────────────────────────────────────

const CAROUSEL_ITEMS = [
  { title: 'Step 1: Extract', body: 'Parse the raw transcript and identify key entities.', color: '#3b82f6' },
  { title: 'Step 2: Classify', body: 'Categorize entities by type — action items, decisions, topics.', color: '#8b5cf6' },
  { title: 'Step 3: Summarize', body: 'Generate concise summaries for each category.', color: '#10b981' },
  { title: 'Step 4: Deliver', body: 'Format and deliver the structured output.', color: '#f59e0b' },
];

const RevealCarouselComponent: React.FC = () => {
  const theme = useTheme();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <SlideContainer>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        maxWidth: 700,
      }}>
        <AnimatedHeading text="RevealCarousel" as="h2" style={{ fontSize: '2.8rem' }} />

        <Reveal from={0}>
          <p style={{
            color: theme.colors.textSecondary,
            fontSize: '1.1rem',
            textAlign: 'center',
            lineHeight: 1.6,
          }}>
            Auto-wires from/until indices — one child visible at a time.
            Step through with arrow keys.
          </p>
        </Reveal>

        {isSegmentVisible(1) && (
          <div style={{ width: '100%' }}>
            <RevealCarousel startFrom={1} animation={fadeUp}>
              {CAROUSEL_ITEMS.map((item) => (
                <div
                  key={item.title}
                  style={{
                    ...cardStyle('default', {
                      padding: '2rem',
                      borderLeft: `4px solid ${item.color}`,
                      textAlign: 'center',
                    }),
                  }}
                >
                  <h3 style={{ color: item.color, fontSize: '1.5rem', margin: '0 0 0.75rem' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: theme.colors.textSecondary, fontSize: '1.1rem', margin: 0, lineHeight: 1.6 }}>
                    {item.body}
                  </p>
                </div>
              ))}
            </RevealCarousel>
          </div>
        )}

        <ContentCard>
          <code style={{
            fontSize: '0.9rem',
            color: theme.colors.textSecondary,
            fontFamily: 'monospace',
          }}>
            {'<RevealCarousel startFrom={1} animation={fadeUp}>{items}</RevealCarousel>'}
          </code>
        </ContentCard>
      </div>
    </SlideContainer>
  );
};

export const CS_S10_RevealCarousel = defineSlide({
  metadata: {
    chapter: 0,
    slide: 10,
    title: 'RevealCarousel',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
    ],
  },
  component: RevealCarouselComponent,
});

// ─── Slide 11: AnnotateAtMarker ────────────────────────────────────────────

const ANNOTATION_DEMOS = [
  { type: 'circle' as const, label: 'Circle', text: '$2.4M', desc: 'Draw attention to key numbers' },
  { type: 'underline' as const, label: 'Underline', text: 'critical insight', desc: 'Emphasize important phrases' },
  { type: 'highlight' as const, label: 'Highlight', text: 'highlighted text', desc: 'Marker-pen style background' },
  { type: 'box' as const, label: 'Box', text: 'boxed element', desc: 'Frame content with a border' },
] as const;

const AnnotateAtMarkerComponent: React.FC = () => {
  const theme = useTheme();
  const { isSegmentVisible } = useSegmentedAnimation();

  const annotationColors = [
    theme.colors.error,
    theme.colors.primary,
    'rgba(255, 220, 100, 0.4)',
    theme.colors.success,
  ];

  return (
    <SlideContainer>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        width: '100%',
        maxWidth: 900,
        margin: '0 auto',
      }}>
        <Reveal from={0}>
          <h2 style={{
            fontSize: '2rem',
            color: theme.colors.textPrimary,
            fontFamily: theme.fontFamily,
            margin: 0,
          }}>
            AnnotateAtMarker
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: theme.colors.textSecondary,
            fontFamily: theme.fontFamily,
            textAlign: 'center',
            margin: '0.5rem 0 0',
          }}>
            Hand-drawn annotations synced to narration markers
          </p>
        </Reveal>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.5rem',
          width: '100%',
        }}>
          {ANNOTATION_DEMOS.map((demo, i) => (
            <Reveal key={demo.type} from={i + 1}>
              <div style={{
                ...cardStyle('default', {
                  padding: '1.5rem',
                  textAlign: 'center',
                  minHeight: 140,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                }),
              }}>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: theme.colors.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {demo.label}
                </span>
                <span style={{ fontSize: demo.type === 'circle' ? '2rem' : '1.4rem', fontWeight: 700, color: theme.colors.textPrimary }}>
                  <AnnotateAtMarker
                    at={demo.type}
                    type={demo.type}
                    color={annotationColors[i]}
                    strokeWidth={demo.type === 'highlight' ? 1 : 2}
                    animationDuration={800}
                  >
                    {demo.text}
                  </AnnotateAtMarker>
                </span>
                <span style={{
                  fontSize: '0.9rem',
                  color: theme.colors.textSecondary,
                }}>
                  {demo.desc}
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        {isSegmentVisible(5) && (
          <ContentCard>
            <code style={{
              fontSize: '0.9rem',
              color: theme.colors.textSecondary,
              fontFamily: 'monospace',
            }}>
              {'<AnnotateAtMarker at="cost" type="circle" color="#ff6b6b">$2.4M</AnnotateAtMarker>'}
            </code>
          </ContentCard>
        )}
      </div>
    </SlideContainer>
  );
};

export const CS_S11_AnnotateAtMarker = defineSlide({
  metadata: {
    chapter: 0,
    slide: 11,
    title: 'AnnotateAtMarker',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
    ],
  },
  component: AnnotateAtMarkerComponent,
});

// ─── Slide 12: ShikiCodeBlock ───────────────────────────────────────────────

const SHIKI_SAMPLE = `def generate_highlights(transcript):
    """Main pipeline: segment → narrate → extract."""
    topics = segment_into_topics(transcript, min=1, max=7)
    for topic in topics:
        topic.narration = write_narration(topic)
    return build_narrative(topics)`;

const THEME_LABEL_STYLE: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.4rem',
  textAlign: 'center',
};

const DARK_THEMES = [
  // Popular classics
  'dracula', 'monokai', 'nord', 'night-owl', 'tokyo-night', 'synthwave-84',
  // GitHub family
  'github-dark', 'github-dark-default', 'github-dark-dimmed', 'github-dark-high-contrast', 'dark-plus', 'slack-dark',
  // Catppuccin & Rose Pine
  'catppuccin-mocha', 'catppuccin-macchiato', 'catppuccin-frappe', 'rose-pine', 'rose-pine-moon', 'everforest-dark',
  // Material & Ayu
  'material-theme', 'material-theme-darker', 'material-theme-ocean', 'material-theme-palenight', 'ayu-dark', 'ayu-mirage',
  // Gruvbox & Solarized
  'gruvbox-dark-hard', 'gruvbox-dark-medium', 'gruvbox-dark-soft', 'solarized-dark', 'vitesse-dark', 'vitesse-black',
  // Kanagawa & Retro
  'kanagawa-dragon', 'kanagawa-wave', 'horizon', 'laserwave', 'dracula-soft', 'houston',
  // Unique
  'andromeeda', 'aurora-x', 'poimandres', 'plastic', 'min-dark', 'red',
  // Last
  'vesper',
];

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

const THEME_CHUNKS = chunk(DARK_THEMES, 6);

const ThemeGrid: React.FC<{ themes: string[] }> = ({ themes }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    width: '100%',
  }}>
    {themes.map((t) => (
      <div key={t}>
        <div style={{ ...THEME_LABEL_STYLE, color: '#94a3b8' }}>{t}</div>
        <ShikiCodeBlock
          code={SHIKI_SAMPLE}
          language="python"
          fontSize={10}
          colorTheme={t}
        />
      </div>
    ))}
  </div>
);

const ShikiCodeBlockComponent: React.FC = () => {
  const theme = useTheme();

  return (
    <SlideContainer>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        maxWidth: 1100,
      }}>
        <AnimatedHeading text="ShikiCodeBlock" as="h2" style={{ fontSize: '2.8rem' }} />

        <RevealSequence>
          <Reveal from={0} until={0}>
            <p style={{
              color: theme.colors.textSecondary,
              fontSize: '1rem',
              textAlign: 'center',
              maxWidth: 700,
              lineHeight: 1.6,
              margin: '0 auto 0.25rem',
            }}>
              Three rendering modes: regex tokenizer, shiki One Dark Pro, and shiki with framework theme colors
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '0.75rem',
              width: '100%',
            }}>
              <div>
                <div style={{ ...THEME_LABEL_STYLE, color: theme.colors.textMuted }}>
                  CodeBlock (regex)
                </div>
                <CodeBlock
                  code={SHIKI_SAMPLE}
                  language="python"
                  title="pipeline.py"
                  fontSize={10}
                  highlightLines={[3]}
                />
              </div>
              <div>
                <div style={{ ...THEME_LABEL_STYLE, color: theme.colors.textMuted }}>
                  Shiki (one-dark-pro)
                </div>
                <ShikiCodeBlock
                  code={SHIKI_SAMPLE}
                  language="python"
                  title="pipeline.py"
                  fontSize={10}
                  highlightLines={[3]}
                />
              </div>
              <div>
                <div style={{ ...THEME_LABEL_STYLE, color: theme.colors.primary }}>
                  Shiki (framework)
                </div>
                <ShikiCodeBlock
                  code={SHIKI_SAMPLE}
                  language="python"
                  title="pipeline.py"
                  fontSize={10}
                  highlightLines={[3]}
                  colorTheme="framework"
                />
              </div>
            </div>
          </Reveal>

          {THEME_CHUNKS.map((themes, i) => (
            <Reveal key={i} from={i + 1} until={i + 1}>
              <p style={{
                color: theme.colors.textSecondary,
                fontSize: '1rem',
                textAlign: 'center',
                margin: '0 0 0.25rem',
              }}>
                {i === 0
                  ? <>65+ bundled themes — any can be used via <code style={{ color: theme.colors.primary }}>colorTheme</code></>
                  : `Dark themes (${i + 1}/${THEME_CHUNKS.length})`}
              </p>
              <ThemeGrid themes={themes} />
            </Reveal>
          ))}

          <Reveal from={THEME_CHUNKS.length + 1}>
            <ContentCard>
              <code style={{
                fontSize: '0.9rem',
                color: theme.colors.textSecondary,
                fontFamily: 'monospace',
              }}>
                {'<ShikiCodeBlock code={code} language="python" colorTheme="dracula" />'}
              </code>
            </ContentCard>
          </Reveal>
        </RevealSequence>
      </div>
    </SlideContainer>
  );
};

export const CS_S12_ShikiCodeBlock = defineSlide({
  metadata: {
    chapter: 0,
    slide: 12,
    title: 'ShikiCodeBlock',
    // segment 0: comparison, segments 1-N: theme galleries, segment N+1: usage
    audioSegments: Array.from({ length: THEME_CHUNKS.length + 2 }, (_, i) => ({ id: i })),
  },
  component: ShikiCodeBlockComponent,
});

// ─── Slide 13: Layout Components ────────────────────────────────────────────
// Demonstrates: SlideTitle, ContentCard, GradientHighlightBox

const LayoutComponentsComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <SlideContainer>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn(reduced)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
          maxWidth: 800,
        }}
      >
        <Reveal from={0}>
          <SlideTitle reduced={reduced} subtitle="Ready-made layout primitives">
            Layout Components
          </SlideTitle>
        </Reveal>

        {isSegmentVisible(1) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{ width: '100%' }}
          >
            <h3 style={{ color: theme.colors.textMuted, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              ContentCard
            </h3>
            <ContentCard>
              <p style={{
                fontSize: '1.2rem',
                lineHeight: 1.6,
                color: theme.colors.textSecondary,
                margin: 0,
              }}>
                A themed card with subtle background, padding, and rounded corners.
                Use it for explanatory text, summaries, or code usage examples.
              </p>
            </ContentCard>
          </motion.div>
        )}

        {isSegmentVisible(2) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{ width: '100%' }}
          >
            <h3 style={{ color: theme.colors.textMuted, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              GradientHighlightBox
            </h3>
            <GradientHighlightBox reduced={reduced}>
              <p style={{
                fontSize: '1.1rem',
                margin: 0,
                color: theme.colors.textPrimary,
              }}>
                An animated gradient border box for emphasizing key takeaways or calls to action.
              </p>
            </GradientHighlightBox>
          </motion.div>
        )}
      </motion.div>
    </SlideContainer>
  );
};

export const CS_S13_LayoutComponents = defineSlide({
  metadata: {
    chapter: 0,
    slide: 13,
    title: 'Layout Components',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ],
  },
  component: LayoutComponentsComponent,
});

// ─── Slide 14: Data Cards ───────────────────────────────────────────────────
// Demonstrates: BenefitCard with tileVariants + staggerContainer, MetricDisplay

const benefits = [
  { id: 'fast', icon: '⚡', title: 'Fast', desc: 'Instant hot-reload development', detail: 'Vite + React + HMR for sub-second feedback' },
  { id: 'typed', icon: '🔒', title: 'Type-Safe', desc: 'End-to-end TypeScript', detail: 'Strict types from slides to TTS scripts' },
  { id: 'modular', icon: '🧩', title: 'Modular', desc: 'Composable building blocks', detail: 'Mix and match components per demo' },
];

const DataCardsComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisibleById, isOnSegment, isSegmentVisible } = useSegmentedAnimation();

  return (
    <SlideContainer>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeDown(reduced)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
          maxWidth: 1100,
          width: '100%',
        }}
      >
        <AnimatedHeading text="Data Cards" as="h2" style={{ fontSize: '2.8rem' }} />

        <motion.div
          variants={staggerContainer(reduced)}
          initial="hidden"
          animate="visible"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
            width: '100%',
          }}
        >
          {benefits.map((b, i) => (
            <motion.div key={b.id} variants={tileVariants(reduced)}>
              <BenefitCard
                icon={b.icon}
                title={b.title}
                description={b.desc}
                detail={b.detail}
                isVisible={isSegmentVisibleById(i)}
                isHighlighted={isOnSegment(i)}
                reduced={reduced}
              />
            </motion.div>
          ))}
        </motion.div>

        {isSegmentVisible(3) && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer(reduced)}
            style={{
              display: 'flex',
              gap: '4rem',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <motion.div variants={fadeRight(reduced)}>
              <MetricDisplay value="12" label="Components" reduced={reduced} emphasis />
            </motion.div>
            <motion.div variants={fadeRight(reduced, 0.2)}>
              <MetricDisplay value="3x" label="Faster Setup" reduced={reduced} />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </SlideContainer>
  );
};

export const CS_S14_DataCards = defineSlide({
  metadata: {
    chapter: 0,
    slide: 14,
    title: 'Data Cards',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ],
  },
  component: DataCardsComponent,
});

// ─── Slide 15: TypeAnimation ────────────────────────────────────────────────
// Demonstrates: react-type-animation typewriter effect

const TypeAnimationComponent: React.FC = () => {
  const theme = useTheme();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <SlideContainer>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        maxWidth: 800,
      }}>
        <AnimatedHeading text="TypeAnimation" as="h2" style={{ fontSize: '2.8rem' }} />

        <Reveal from={0}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: 12,
            padding: '1.5rem',
            width: '100%',
            fontFamily: 'monospace',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
            </div>
            <div style={{ color: '#8be9fd', fontSize: '1rem' }}>
              <span style={{ color: '#50fa7b' }}>$ </span>
              <TypeAnimation
                sequence={[
                  'npm run build',
                  800,
                  'npm run build\n✓ TypeScript compiled',
                  600,
                  'npm run build\n✓ TypeScript compiled\n✓ Bundle optimized (142 KB)',
                  600,
                  'npm run build\n✓ TypeScript compiled\n✓ Bundle optimized (142 KB)\n✓ Assets copied',
                  500,
                  'npm run build\n✓ TypeScript compiled\n✓ Bundle optimized (142 KB)\n✓ Assets copied\n\nBuild complete in 2.1s',
                  2000,
                ]}
                speed={60}
                style={{ whiteSpace: 'pre-wrap' }}
                cursor={true}
              />
            </div>
          </div>
        </Reveal>

        {isSegmentVisible(1) && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 12,
            padding: '1.5rem',
            width: '100%',
            border: `1px solid ${theme.colors.primary}33`,
          }}>
            <p style={{
              color: theme.colors.textMuted,
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 0 0.75rem',
            }}>
              AI Streaming Simulation
            </p>
            <div style={{ color: theme.colors.textSecondary, fontSize: '1.05rem', lineHeight: 1.6 }}>
              <TypeAnimation
                sequence={[
                  'The presentation framework uses a modular architecture with auto-discovery, theme-aware components, and progressive segment reveals for narrated storytelling.',
                  3000,
                ]}
                speed={70}
                cursor={true}
              />
            </div>
          </div>
        )}

        <ContentCard>
          <code style={{
            fontSize: '0.9rem',
            color: theme.colors.textSecondary,
            fontFamily: 'monospace',
          }}>
            {'<TypeAnimation sequence={["text", 1000]} speed={60} cursor={true} />'}
          </code>
        </ContentCard>
      </div>
    </SlideContainer>
  );
};

export const CS_S15_TypeAnimation = defineSlide({
  metadata: {
    chapter: 0,
    slide: 15,
    title: 'TypeAnimation',
    audioSegments: [
      { id: 0 },
      { id: 1 },
    ],
  },
  component: TypeAnimationComponent,
});

// ─── Slide 16: Visx Chart ───────────────────────────────────────────────────
// Demonstrates: @visx/shape Bar, @visx/scale, @visx/axis, @visx/group

const CHART_DATA = [
  { label: 'Accuracy', score: 94 },
  { label: 'Fluency', score: 88 },
  { label: 'Relevance', score: 91 },
  { label: 'Coherence', score: 85 },
  { label: 'Coverage', score: 78 },
];

const CHART_WIDTH = 600;
const CHART_HEIGHT = 320;
const CHART_MARGIN = { top: 20, right: 30, bottom: 50, left: 70 };

const VisxChartComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), reduced ? 0 : 300);
    return () => clearTimeout(timer);
  }, [reduced]);

  const xMax = CHART_WIDTH - CHART_MARGIN.left - CHART_MARGIN.right;
  const yMax = CHART_HEIGHT - CHART_MARGIN.top - CHART_MARGIN.bottom;

  const xScale = scaleBand<string>({
    domain: CHART_DATA.map(d => d.label),
    range: [0, xMax],
    padding: 0.35,
  });

  const yScale = scaleLinear<number>({
    domain: [0, 100],
    range: [yMax, 0],
  });

  const showAxes = isSegmentVisible(1);

  return (
    <SlideContainer>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        maxWidth: 800,
      }}>
        <AnimatedHeading text="Visx Chart" as="h2" style={{ fontSize: '2.8rem' }} />

        <Reveal from={0}>
          <p style={{
            color: theme.colors.textSecondary,
            fontSize: '1.05rem',
            textAlign: 'center',
            maxWidth: 600,
            lineHeight: 1.6,
          }}>
            Composable React + D3 charts via <code style={{ color: theme.colors.primary }}>@visx/*</code> — SVG output works with Framer Motion
          </p>
        </Reveal>

        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 12,
          padding: '1rem',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <svg width={CHART_WIDTH} height={CHART_HEIGHT}>
            <Group left={CHART_MARGIN.left} top={CHART_MARGIN.top}>
              {CHART_DATA.map((d) => {
                const barWidth = xScale.bandwidth();
                const barHeight = yMax - (yScale(d.score) ?? 0);
                const barX = xScale(d.label) ?? 0;
                const barY = yMax - barHeight;
                return (
                  <motion.rect
                    key={d.label}
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={theme.colors.primary}
                    rx={4}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: animated ? 1 : 0 }}
                    transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : CHART_DATA.indexOf(d) * 0.1 }}
                    style={{ originY: 1, originX: 0.5, transformBox: 'fill-box' }}
                  />
                );
              })}
              {showAxes && (
                <>
                  <AxisBottom
                    top={yMax}
                    scale={xScale}
                    tickStroke={theme.colors.textMuted}
                    stroke={theme.colors.textMuted}
                    tickLabelProps={() => ({
                      fill: theme.colors.textSecondary,
                      fontSize: 12,
                      textAnchor: 'middle' as const,
                      fontFamily: theme.fontFamily,
                    })}
                  />
                  <AxisLeft
                    scale={yScale}
                    tickStroke={theme.colors.textMuted}
                    stroke={theme.colors.textMuted}
                    tickLabelProps={() => ({
                      fill: theme.colors.textSecondary,
                      fontSize: 12,
                      textAnchor: 'end' as const,
                      fontFamily: theme.fontFamily,
                      dx: -4,
                      dy: 4,
                    })}
                    label="Score"
                    labelProps={{
                      fill: theme.colors.textSecondary,
                      fontSize: 13,
                      fontFamily: theme.fontFamily,
                      textAnchor: 'middle',
                    }}
                  />
                </>
              )}
            </Group>
          </svg>
        </div>

        <ContentCard>
          <code style={{
            fontSize: '0.9rem',
            color: theme.colors.textSecondary,
            fontFamily: 'monospace',
          }}>
            {'<Bar x={xScale(d)} y={yScale(d)} width={bandwidth} height={barHeight} />'}
          </code>
        </ContentCard>
      </div>
    </SlideContainer>
  );
};

export const CS_S16_VisxChart = defineSlide({
  metadata: {
    chapter: 0,
    slide: 16,
    title: 'Visx Chart',
    audioSegments: [
      { id: 0 },
      { id: 1 },
    ],
  },
  component: VisxChartComponent,
});

// ─── Slide 17: Lottie Animation ─────────────────────────────────────────────
// Demonstrates: lottie-react with Lottie JSON files

const LottieAnimationComponent: React.FC = () => {
  const theme = useTheme();
  const { isSegmentVisible } = useSegmentedAnimation();
  const [confettiData, setConfettiData] = useState<object | null>(null);
  const [checkmarkData, setCheckmarkData] = useState<object | null>(null);

  useEffect(() => {
    fetch('/animations/confetti.json').then(r => r.json()).then(setConfettiData);
    fetch('/animations/checkmark.json').then(r => r.json()).then(setCheckmarkData);
  }, []);

  return (
    <SlideContainer>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        maxWidth: 800,
      }}>
        <AnimatedHeading text="Lottie Animation" as="h2" style={{ fontSize: '2.8rem' }} />

        <p style={{
          color: theme.colors.textSecondary,
          fontSize: '1.05rem',
          textAlign: 'center',
          maxWidth: 600,
          lineHeight: 1.6,
        }}>
          Pre-made vector animations from LottieFiles — confetti, checkmarks, spinners.
          Frame-level control via ref.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          width: '100%',
        }}>
          <Reveal from={0}>
            <div style={{
              ...cardStyle('default', {
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                minHeight: 220,
              }),
            }}>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: theme.colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Confetti Burst
              </span>
              {confettiData && (
                <Lottie
                  animationData={confettiData}
                  loop={true}
                  style={{ width: 150, height: 150 }}
                />
              )}
            </div>
          </Reveal>

          {isSegmentVisible(1) && (
            <div style={{
              ...cardStyle('success', {
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                minHeight: 220,
              }),
            }}>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: theme.colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Success Check
              </span>
              {checkmarkData && (
                <Lottie
                  animationData={checkmarkData}
                  loop={false}
                  style={{ width: 150, height: 150 }}
                />
              )}
            </div>
          )}
        </div>

        <ContentCard>
          <code style={{
            fontSize: '0.9rem',
            color: theme.colors.textSecondary,
            fontFamily: 'monospace',
          }}>
            {'<Lottie animationData={data} loop={true} style={{ width: 150 }} />'}
          </code>
        </ContentCard>
      </div>
    </SlideContainer>
  );
};

export const CS_S17_LottieAnimation = defineSlide({
  metadata: {
    chapter: 0,
    slide: 17,
    title: 'Lottie Animation',
    audioSegments: [
      { id: 0 },
      { id: 1 },
    ],
  },
  component: LottieAnimationComponent,
});

// ─── Slide 18: Info Components ──────────────────────────────────────────────
// Demonstrates: Callout, NumberedStepCard, ProgressSteps

const STEP_CARDS = [
  { num: 1, title: 'Extract', desc: 'Parse raw transcript into structured segments' },
  { num: 2, title: 'Classify', desc: 'Categorize by topic, speaker, and intent' },
  { num: 3, title: 'Summarize', desc: 'Generate concise narrative highlights' },
];

const InfoComponentsComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <SlideContainer>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        maxWidth: 900,
        width: '100%',
      }}>
        <AnimatedHeading text="Info Components" as="h2" style={{ fontSize: '2.8rem' }} />

        <Reveal from={0}>
          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <Callout variant="info" icon="💡" style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: theme.colors.primary, marginBottom: '0.3rem', fontSize: '0.95rem' }}>
                Callout — Info Variant
              </div>
              <div style={{ color: theme.colors.textSecondary, fontSize: '0.9rem', lineHeight: 1.5 }}>
                Use callouts to highlight tips, warnings, or important context.
              </div>
            </Callout>
            <Callout variant="warning" icon="⚠️" style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: theme.colors.warning, marginBottom: '0.3rem', fontSize: '0.95rem' }}>
                Warning Variant
              </div>
              <div style={{ color: theme.colors.textSecondary, fontSize: '0.9rem', lineHeight: 1.5 }}>
                Draws attention to potential pitfalls or caveats.
              </div>
            </Callout>
          </div>
        </Reveal>

        {isSegmentVisible(1) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '100%' }}
          >
            {STEP_CARDS.map((s, i) => (
              <NumberedStepCard
                key={s.num}
                number={s.num}
                title={s.title}
                description={s.desc}
                isActive={i === 1}
                variant={i === 2 ? 'error' : 'default'}
              />
            ))}
          </motion.div>
        )}

        {isSegmentVisible(2) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{ width: '100%' }}
          >
            <ProgressSteps
              steps={[
                { label: 'Extract', status: 'completed' as const },
                { label: 'Classify', status: 'completed' as const },
                { label: 'Summarize', status: 'active' as const },
              ]}
              connectorStyle="arrow"
            />
          </motion.div>
        )}
      </div>
    </SlideContainer>
  );
};

export const CS_S18_InfoComponents = defineSlide({
  metadata: {
    chapter: 0,
    slide: 18,
    title: 'Info Components',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ],
  },
  component: InfoComponentsComponent,
});

// ─── Slide 19: Comparison Components ────────────────────────────────────────
// Demonstrates: BeforeAfterSplit, ComparisonTable

const ComparisonComponentsComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <SlideContainer>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        maxWidth: 950,
        width: '100%',
      }}>
        <AnimatedHeading text="Comparison Components" as="h2" style={{ fontSize: '2.8rem' }} />

        <Reveal from={0}>
          <BeforeAfterSplit
            beforeTitle="Before (4 LLM Calls)"
            afterTitle="After (1 Unified Call)"
            beforeContent={
              <div style={{ padding: '1rem', color: theme.colors.textSecondary, fontSize: '0.95rem', lineHeight: 1.6 }}>
                <div>1. Extract abstractives</div>
                <div>2. Extract clips</div>
                <div>3. Rank clips</div>
                <div>4. Merge narrative</div>
              </div>
            }
            afterContent={
              <div style={{ padding: '1rem', color: theme.colors.success, fontSize: '0.95rem', lineHeight: 1.6 }}>
                <div>1. Single unified prompt</div>
                <div style={{ color: theme.colors.textMuted, marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  75% fewer tokens, 3x faster
                </div>
              </div>
            }
          />
        </Reveal>

        {isSegmentVisible(1) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{ width: '100%' }}
          >
            <ComparisonTable
              columns={[
                { header: 'Metric' },
                { header: 'Before', color: theme.colors.warning },
                { header: 'After', color: theme.colors.success },
              ]}
              rows={[
                ['LLM Calls', '4', '1'],
                ['Latency', '12s', '4s'],
                ['Token Cost', '$0.08', '$0.02'],
                ['GPU Hours', '600/day', '200/day'],
              ]}
            />
          </motion.div>
        )}
      </div>
    </SlideContainer>
  );
};

export const CS_S19_ComparisonComponents = defineSlide({
  metadata: {
    chapter: 0,
    slide: 19,
    title: 'Comparison Components',
    audioSegments: [
      { id: 0 },
      { id: 1 },
    ],
  },
  component: ComparisonComponentsComponent,
});

// ─── Slide 20: Data Components ──────────────────────────────────────────────
// Demonstrates: MetricTile, CandidateGrid, TestimonialCard

const DataComponentsComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <SlideContainer>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        maxWidth: 950,
        width: '100%',
      }}>
        <AnimatedHeading text="Data Components" as="h2" style={{ fontSize: '2.8rem' }} />

        <Reveal from={0}>
          <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
            <MetricTile label="LLM Calls" after="4 → 1" note="75% reduction" />
            <MetricTile label="Latency" after="3x faster" note="Batch processing" />
            <MetricTile label="Cost" after="$0.02" note="Per request" />
          </div>
        </Reveal>

        {isSegmentVisible(1) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{ width: '100%' }}
          >
            <h3 style={{ color: theme.colors.textMuted, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              CandidateGrid (30 candidates, 3 topic ranges)
            </h3>
            <CandidateGrid n={30} animate topicRanges={[[0, 9], [10, 19], [20, 29]]} />
          </motion.div>
        )}

        {isSegmentVisible(2) && (
          <motion.div
            variants={fadeUp(reduced)}
            initial="hidden"
            animate="visible"
            style={{ width: '100%' }}
          >
            <TestimonialCard
              quote="The framework made it possible to build narrated presentations in a fraction of the time."
              author="Demo Author"
              reduced={reduced}
            />
          </motion.div>
        )}
      </div>
    </SlideContainer>
  );
};

export const CS_S20_DataComponents = defineSlide({
  metadata: {
    chapter: 0,
    slide: 20,
    title: 'Data Components',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ],
  },
  component: DataComponentsComponent,
});

// ─── Slide 21: PipelineDiagram ───────────────────────────────────────────────
// Demonstrates: PipelineDiagram with progressive step reveal

const PipelineDiagramComponent: React.FC = () => {
  const theme = useTheme();
  const { isSegmentVisible } = useSegmentedAnimation();

  const visibleSteps = isSegmentVisible(1) ? 4 : isSegmentVisible(0) ? 2 : 0;

  return (
    <SlideContainer>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        maxWidth: 900,
        width: '100%',
      }}>
        <AnimatedHeading text="PipelineDiagram" as="h2" style={{ fontSize: '2.8rem' }} />

        <Reveal from={0}>
          <p style={{
            color: theme.colors.textSecondary,
            fontSize: '1.05rem',
            textAlign: 'center',
            maxWidth: 600,
            lineHeight: 1.6,
          }}>
            Horizontal step pipeline with arrow connectors.
            Control <code style={{ color: theme.colors.primary }}>visibleSteps</code> to progressively reveal stages.
          </p>
        </Reveal>

        <div style={{ width: '100%' }}>
          <PipelineDiagram
            visibleSteps={visibleSteps}
            steps={[
              { name: 'Extract', purpose: 'Parse raw transcript' },
              { name: 'Classify', purpose: 'Categorize segments' },
              { name: 'Rank', purpose: 'Score by quality' },
              { name: 'Narrate', purpose: 'Generate highlights' },
            ]}
            arrowLabel="JSON"
          />
        </div>

        <ContentCard>
          <code style={{
            fontSize: '0.9rem',
            color: theme.colors.textSecondary,
            fontFamily: 'monospace',
          }}>
            {'<PipelineDiagram steps={[...]} visibleSteps={segment} arrowLabel="JSON" />'}
          </code>
        </ContentCard>
      </div>
    </SlideContainer>
  );
};

export const CS_S21_PipelineDiagram = defineSlide({
  metadata: {
    chapter: 0,
    slide: 21,
    title: 'PipelineDiagram',
    audioSegments: [
      { id: 0 },
      { id: 1 },
    ],
  },
  component: PipelineDiagramComponent,
});

// ─── Slide 22: Background Effects ───────────────────────────────────────────
// Demonstrates: Floating particles, shimmer, animated gradient text, glow border

const BackgroundEffectsComponent: React.FC = () => {
  const theme = useTheme();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: `linear-gradient(135deg, ${theme.colors.bgDeep}, ${theme.colors.bgSurface})`,
      fontFamily: theme.fontFamily,
    }}>
      <FloatingParticles />
      <FloatingEmojis />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <GradientText style={{ fontSize: '2.8rem', fontWeight: 700, marginBottom: '1rem' }}>
          Background Effects
        </GradientText>

        <Reveal from={0}>
          <p style={{
            color: theme.colors.textSecondary,
            fontSize: '1rem',
            maxWidth: 550,
            margin: '0 auto 1.5rem',
            lineHeight: 1.6,
          }}>
            Floating particles, rising emojis, pulsing glow, gradient text, shimmer sweeps, glowing borders, and animated CTA badges.
          </p>
        </Reveal>

        {isSegmentVisible(1) && (
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Card with shimmer */}
            <div style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 16,
              padding: '1.25rem 1.75rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              minWidth: 180,
            }}>
              <ShimmerOverlay />
              <div style={{ position: 'relative', zIndex: 1, color: theme.colors.textPrimary, fontSize: '0.95rem', fontWeight: 600 }}>
                Shimmer Sweep
              </div>
              <div style={{ position: 'relative', zIndex: 1, color: theme.colors.textMuted, fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Skewed gradient slides across
              </div>
            </div>

            {/* Card with glow border */}
            <GlowBorder>
              <div style={{
                borderRadius: 16,
                padding: '1.25rem 1.75rem',
                background: 'rgba(255,255,255,0.05)',
                minWidth: 180,
              }}>
                <div style={{ color: theme.colors.textPrimary, fontSize: '0.95rem', fontWeight: 600 }}>
                  Glow Border
                </div>
                <div style={{ color: theme.colors.textMuted, fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Pulsing gradient halo
                </div>
              </div>
            </GlowBorder>

            {/* CTA badge with shine + bouncing emoji + floating icons */}
            <PulsingBadge style={{ minWidth: 180 }}>
              <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700 }}>
                CTA Badge
              </div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                Shine + floating icons
              </div>
            </PulsingBadge>
          </div>
        )}

        {isSegmentVisible(2) && (
          <div style={{ marginTop: '1.5rem' }}>
            <ContentCard>
              <code style={{
                fontSize: '0.85rem',
                color: theme.colors.textSecondary,
                fontFamily: 'monospace',
              }}>
                {'All effects respect useReducedMotion() — disabled when prefers-reduced-motion is set.'}
              </code>
            </ContentCard>
          </div>
        )}
      </div>
    </div>
  );
};

export const CS_S22_BackgroundEffects = defineSlide({
  metadata: {
    chapter: 0,
    slide: 22,
    title: 'Background Effects',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ],
  },
  component: BackgroundEffectsComponent,
});
