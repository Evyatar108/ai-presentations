import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import {
  defineSlide,
  useReducedMotion,
  useTheme,
  useSegmentedAnimation,
  fadeIn,
  fadeUp,
  scaleIn,
  staggerContainer,
  SlideContainer,
  ContentCard,
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
  cardStyle,
  monoText,
  gradientBadge,
} from '@framework';

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
