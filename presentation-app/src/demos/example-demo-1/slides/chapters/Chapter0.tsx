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
  GradientHighlightBox,
} from '@framework';

/**
 * Example Demo 1 - Chapter 0
 * Showcases key framework features: themes, animations, reduced motion,
 * progressive segment reveals, and theme-aware layout components.
 */

// ─── Slide 1: Title ─────────────────────────────────────────────────────────
// Demonstrates: useReducedMotion(), useTheme(), Framer Motion fadeIn

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
        style={{ fontSize: '4rem', marginBottom: '1rem' }}
      >
        Example Demo 1
      </motion.h1>
      <motion.p
        variants={fadeUp(reduced, 0.2)}
        style={{ fontSize: '2rem', opacity: 0.9 }}
      >
        Framework Feature Showcase
      </motion.p>
    </motion.div>
  );
};

export const Ex1_S1_Title = defineSlide({
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

// ─── Slide 2: Features (Multi-Segment Progressive Reveal) ───────────────────
// Demonstrates: useSegmentedAnimation(), isSegmentVisible(), staggerContainer

const features = [
  { icon: '🎨', label: 'Theme-aware components via useTheme()' },
  { icon: '♿', label: 'Reduced-motion support via useReducedMotion()' },
  { icon: '📊', label: 'Progressive reveals with segment contexts' },
  { icon: '🧱', label: 'Layout primitives: SlideContainer, ContentCard' },
];

const FeaturesComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      padding: '80px',
      background: `linear-gradient(135deg, ${theme.colors.primary}22, ${theme.colors.secondary}22)`,
      fontFamily: theme.fontFamily,
    }}>
      <motion.h2
        initial="hidden"
        animate="visible"
        variants={fadeUp(reduced)}
        style={{
          fontSize: '3rem',
          marginBottom: '2.5rem',
          color: theme.colors.textPrimary,
        }}
      >
        Key Features
      </motion.h2>

      <motion.div
        variants={staggerContainer(reduced)}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        {features.map((feat, i) => (
          isSegmentVisible(i) && (
            <motion.div
              key={feat.label}
              variants={scaleIn(reduced)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '1.8rem',
                padding: '1rem 1.5rem',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.08)',
                color: theme.colors.textPrimary,
              }}
            >
              <span style={{ fontSize: '2.2rem' }}>{feat.icon}</span>
              {feat.label}
            </motion.div>
          )
        ))}
      </motion.div>
    </div>
  );
};

export const Ex1_S2_Content1 = defineSlide({
  metadata: {
    chapter: 0,
    slide: 2,
    title: 'Key Features',
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
      {
        id: 3,
      },
    ]
  },
  component: FeaturesComponent,
});

// ─── Slide 3: Conclusion (Theme-Aware Layout Components) ─────────────────────
// Demonstrates: SlideContainer, ContentCard, GradientHighlightBox

const ConclusionComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();

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
        <h2 style={{
          fontSize: '3rem',
          marginBottom: '0.5rem',
          color: theme.colors.textPrimary,
          fontFamily: theme.fontFamily,
        }}>
          Conclusion
        </h2>

        <ContentCard>
          <p style={{
            fontSize: '1.4rem',
            lineHeight: 1.6,
            color: theme.colors.textSecondary,
            margin: 0,
          }}>
            This demo showcases the most important framework APIs so you can
            see how themes, animations, segments, and layout components work
            together in practice.
          </p>
        </ContentCard>

        <GradientHighlightBox reduced={reduced}>
          <p style={{
            fontSize: '1.2rem',
            margin: 0,
            color: theme.colors.textPrimary,
          }}>
            Get started: run <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>.\scripts\new-demo.ps1 -DemoId "my-demo"</code> to scaffold your own demo.
          </p>
        </GradientHighlightBox>
      </motion.div>
    </SlideContainer>
  );
};

export const Ex1_S3_Conclusion = defineSlide({
  metadata: {
    chapter: 0,
    slide: 3,
    title: 'Conclusion',
    audioSegments: [
      {
        id: 0,
      }
    ]
  },
  component: ConclusionComponent,
});
