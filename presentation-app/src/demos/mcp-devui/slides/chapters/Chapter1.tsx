import React from 'react';
import { motion } from 'framer-motion';
import {
  useReducedMotion,
  useTheme,
  defineSlide,
  SlideContainer,
  SlideTitle,
  Reveal,
  RevealAtMarker,
  GlowBorder,
  gradientBadge,
  monoText,
  fadeUp,
  cardStyle,
  useMarker,
} from '@framework';

/**
 * Chapter 1: "The Toolkit" (1 slide)
 * Ch1_S1 — 22 Tools, 3 Skills, 1 Agent
 */

// ---------- Data ----------

const CATEGORIES = [
  { name: 'Conversation Loading', icon: '\u{1F4E5}', count: 4, markerId: 'nav' },
  { name: 'Turn Inspection', icon: '\u{1F50D}', count: 2, markerId: 'turn' },
  { name: 'Telemetry & Execution', icon: '\u{1F4CA}', count: 10, markerId: 'tel' },
  { name: 'Chat Execution', icon: '\u{26A1}', count: 1, markerId: 'chat' },
  { name: 'Config Management', icon: '\u{2699}\u{FE0F}', count: 5, markerId: 'config' },
];

const SKILLS = [
  { name: 'debug-conversation', markerId: 'sk-debug' },
  { name: 'send-and-debug', markerId: 'sk-send' },
  { name: 'setup-config', markerId: 'sk-config' },
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

/** Badge that always occupies space but fades in when its marker is reached. */
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

// ---------- Slide 1: Solution Overview ----------

const SolutionOverviewComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();

  return (
    <SlideContainer maxWidth={900}>
      <Reveal from={0}>
        <SlideTitle reduced={reduced}>
          22 Tools, 3 Skills, 1 Agent
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
              Every DevUI surface you already use — now accessible to your AI agent.
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
          5 Tool Categories
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

      {/* Agent + Skills section */}
      <Reveal from={2}>
        <div style={{
          marginTop: '2rem',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 15,
            fontWeight: 600,
            color: theme.colors.textPrimary,
            marginBottom: '0.75rem',
          }}>
            {'\u{1F916}'} devui-debugger agent — 3 guided skills:
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.5rem',
          }}>
            {SKILLS.map((skill) => (
              <RevealAtMarker key={skill.markerId} at={skill.markerId} animation={fadeUp}>
                <div style={{
                  ...monoText(12),
                  padding: '0.4rem 0.75rem',
                  borderRadius: 8,
                  background: theme.colors.bgSurface,
                  border: `1px solid ${theme.colors.bgBorder}`,
                  color: theme.colors.primary,
                  fontWeight: 600,
                }}>
                  {skill.name}
                </div>
              </RevealAtMarker>
            ))}
          </div>
        </div>
      </Reveal>
    </SlideContainer>
  );
};

export const Ch1_S1_SolutionOverview = defineSlide({
  metadata: {
    chapter: 1,
    slide: 1,
    title: '22 Tools, 3 Skills, 1 Agent',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ],
  },
  component: SolutionOverviewComponent,
});
