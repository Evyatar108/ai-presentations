import React from 'react';
import { motion } from 'framer-motion';
import {
  defineSlide,
  useReducedMotion,
  useTheme,
  useSegmentedAnimation,
  fadeDown,
  fadeRight,
  staggerContainer,
  tileVariants,
  SlideContainer,
  SlideTitle,
  BenefitCard,
  MetricDisplay,
} from '@framework';

/**
 * Example Demo 2 - Chapter 0
 * Showcases layout components (SlideTitle, BenefitCard, MetricDisplay),
 * named segment lookups (isSegmentVisibleById), fadeDown/fadeRight variants,
 * tileVariants for staggered reveals, and demo-level timing overrides.
 */

// ─── Slide 1: Title ─────────────────────────────────────────────────────────
// Demonstrates: SlideContainer, SlideTitle (with subtitle), fadeDown variant

const TitleComponent: React.FC = () => {
  const { reduced } = useReducedMotion();

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
        }}
      >
        <SlideTitle reduced={reduced} subtitle="Layout Components, Named Segments & Timing">
          Example Demo 2
        </SlideTitle>
      </motion.div>
    </SlideContainer>
  );
};

export const Ex2_S1_Title = defineSlide({
  metadata: {
    chapter: 0,
    slide: 1,
    title: 'Title Slide',
    audioSegments: [
      {
        id: 0,
      }
    ]
  },
  component: TitleComponent,
});

// ─── Slide 2: Benefits (Named Segment Progressive Reveal) ───────────────────
// Demonstrates: BenefitCard, isSegmentVisibleById(), isOnSegment(),
//               tileVariants + staggerContainer for staggered card animation

const benefits = [
  { id: 'flexible', icon: '🎨', title: 'Flexible', desc: 'Customize each demo independently', detail: 'Theme overrides, layout components, and animation variants' },
  { id: 'scalable', icon: '📈', title: 'Scalable', desc: 'Add unlimited demos', detail: 'Auto-discovery via import.meta.glob — no manual registration' },
  { id: 'organized', icon: '📁', title: 'Organized', desc: 'Clear file structure', detail: 'Framework / demo separation with barrel imports' },
];

const BenefitsComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const { isSegmentVisibleById, isOnSegment } = useSegmentedAnimation();

  return (
    <SlideContainer>
      <motion.h2
        initial="hidden"
        animate="visible"
        variants={fadeDown(reduced)}
        style={{
          fontSize: '3rem',
          marginBottom: '2.5rem',
          color: theme.colors.textPrimary,
          fontFamily: theme.fontFamily,
          textAlign: 'center',
        }}
      >
        System Benefits
      </motion.h2>

      <motion.div
        variants={staggerContainer(reduced)}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem',
          maxWidth: '1200px',
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
    </SlideContainer>
  );
};

export const Ex2_S2_Benefits = defineSlide({
  metadata: {
    chapter: 0,
    slide: 2,
    title: 'System Benefits',
    audioSegments: [
      {
        id: 0,
      },
      {
        id: 1,
      },
      {
        id: 2,
      },
    ]
  },
  component: BenefitsComponent,
});

// ─── Slide 3: Impact Metrics ─────────────────────────────────────────────────
// Demonstrates: MetricDisplay, fadeRight variant, named segments for progressive reveal

const ImpactComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const { isSegmentVisibleById } = useSegmentedAnimation();

  return (
    <SlideContainer>
      <motion.h2
        initial="hidden"
        animate="visible"
        variants={fadeDown(reduced)}
        style={{
          fontSize: '3rem',
          marginBottom: '3rem',
          color: theme.colors.textPrimary,
          fontFamily: theme.fontFamily,
          textAlign: 'center',
        }}
      >
        Framework Impact
      </motion.h2>

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
        {isSegmentVisibleById(0) && (
          <motion.div variants={fadeRight(reduced)}>
            <MetricDisplay value="3x" label="Faster Development" reduced={reduced} emphasis />
          </motion.div>
        )}
        {isSegmentVisibleById(1) && (
          <motion.div variants={fadeRight(reduced, 0.2)}>
            <MetricDisplay value="100%" label="Type-Safe" reduced={reduced} />
          </motion.div>
        )}
      </motion.div>
    </SlideContainer>
  );
};

export const Ex2_S3_Impact = defineSlide({
  metadata: {
    chapter: 0,
    slide: 3,
    title: 'Framework Impact',
    audioSegments: [
      {
        id: 0,
      },
      {
        id: 1,
      },
    ]
  },
  component: ImpactComponent,
});
