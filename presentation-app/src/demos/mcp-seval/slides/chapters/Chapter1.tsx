import React from 'react';
import { motion } from 'framer-motion';
import {
  useReducedMotion,
  useTheme,
  defineSlide,
  SlideContainer,
  SlideTitle,
  Reveal,
  GlowBorder,
  Callout,
  gradientBadge,
  cardStyle,
  useMarker,
  fadeUp,
} from '@framework';

/**
 * Chapter 1: "The Toolkit" (1 slide)
 * Ch1_S1 — 16 Tools, 4 Categories
 */

// ---------- Data ----------

const CATEGORIES = [
  {
    name: 'Connectivity',
    icon: '\u{1F50C}',
    count: 2,
    markerId: 'conn',
    tools: ['check_health', 'list_job_templates'],
  },
  {
    name: 'Job Lifecycle',
    icon: '\u{1F504}',
    count: 6,
    markerId: 'lifecycle',
    tools: ['list_jobs', 'get_job', 'create_job', 'cancel_job', 'rerun_job', 'rename_job'],
  },
  {
    name: 'Results & Metrics',
    icon: '\u{1F4CA}',
    count: 7,
    markerId: 'results',
    tools: ['get_job_metrics', 'query_utterance_metrics', 'query_utterance_detail', 'query_utterance_conversation', 'query_svalue', 'get_job_output', 'download_job_file'],
  },
  {
    name: 'Templates',
    icon: '\u{1F4CB}',
    count: 1,
    markerId: 'templates',
    tools: ['get_template_versions'],
  },
];

// ---------- Subcomponents ----------

const CategoryBadge: React.FC<{
  cat: typeof CATEGORIES[number];
  theme: ReturnType<typeof useTheme>;
}> = ({ cat, theme }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.6rem 1rem',
      borderRadius: 10,
      background: theme.colors.bgSurface,
      border: `1px solid ${theme.colors.bgBorder}`,
    }}
  >
    <div style={gradientBadge(28, theme.colors.primary, theme.colors.secondary)}>
      <span style={{ fontSize: 14 }}>{cat.icon}</span>
    </div>
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.textPrimary }}>
        {cat.name}
      </div>
      <div style={{ fontSize: 12, color: theme.colors.textSecondary }}>
        {cat.count} {cat.count === 1 ? 'tool' : 'tools'}
      </div>
    </div>
  </div>
);

/** Badge that fades in when its marker is reached. */
const MarkerBadge: React.FC<{
  markerId: string;
  cat: typeof CATEGORIES[number];
  theme: ReturnType<typeof useTheme>;
  reduced: boolean;
}> = ({ markerId, cat, theme, reduced }) => {
  const { reached } = useMarker(markerId);

  return (
    <motion.div
      animate={{ opacity: reached ? 1 : 0, y: reached ? 0 : 12 }}
      transition={reduced ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }}
      style={{ opacity: 0 }}
    >
      <CategoryBadge cat={cat} theme={theme} />
    </motion.div>
  );
};

// ---------- Slide 1: Tool Overview ----------

const ToolOverviewComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();

  return (
    <SlideContainer maxWidth={900}>
      <Reveal from={0}>
        <SlideTitle reduced={reduced}>
          16 Tools, 4 Categories
        </SlideTitle>
      </Reveal>

      <Reveal from={0}>
        <GlowBorder style={{ marginTop: '1.5rem' }}>
          <div style={{
            ...cardStyle('primary'),
            textAlign: 'center',
            padding: '1.25rem 2rem',
          }}>
            <div style={{
              fontSize: 16,
              color: theme.colors.textSecondary,
            }}>
              The full SEVAL lifecycle — from job creation to per-utterance diagnosis — now accessible to your AI agent.
            </div>
          </div>
        </GlowBorder>
      </Reveal>

      {/* Category badges — each revealed by an inline marker */}
      <Reveal from={1}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: theme.colors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          textAlign: 'center',
          marginTop: '2rem',
          marginBottom: '0.5rem',
        }}>
          4 Tool Categories
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.75rem',
        }}>
          {CATEGORIES.map((cat) => (
            <MarkerBadge key={cat.markerId} markerId={cat.markerId} cat={cat} theme={theme} reduced={reduced} />
          ))}
        </div>
      </Reveal>

      {/* Chaining concept */}
      <Reveal from={2} animation={fadeUp}>
        <Callout variant="tip" style={{ marginTop: '2rem', color: theme.colors.textPrimary }}>
          <strong>Tool chaining:</strong> Create a job, pull the scorecard, find regressions,
          drill into the utterance, get a DevUI debug link &mdash; all in one conversation.
        </Callout>
      </Reveal>
    </SlideContainer>
  );
};

export const Ch1_S1_ToolOverview = defineSlide({
  metadata: {
    chapter: 1,
    slide: 1,
    title: '16 Tools, 4 Categories',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ],
  },
  component: ToolOverviewComponent,
});
