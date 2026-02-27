import React from 'react';
import { motion } from 'framer-motion';
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
