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
  gradientBadge,
  monoText,
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
  { name: 'debug-conversation', desc: 'Load a conversation and diagnose issues end-to-end', markerId: 'sk-debug' },
  { name: 'send-and-debug', desc: 'Send a live request and debug the response', markerId: 'sk-send' },
  { name: 'setup-config', desc: 'Create and manage chat configs and flights', markerId: 'sk-config' },
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

/** "3 Guided Skills" header — always in DOM, fades in at marker. */
const MarkerHeader: React.FC<{ markerId: string; reduced: boolean }> = ({ markerId, reduced }) => {
  const { reached } = useMarker(markerId);

  return (
    <motion.div
      animate={{ opacity: reached ? 1 : 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.4 }}
      style={{
        opacity: 0,
        fontSize: 14,
        fontWeight: 600,
        color: 'rgba(148,163,184,0.8)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        textAlign: 'center',
        marginTop: '1rem',
        marginBottom: '0.5rem',
      }}
    >
      3 Guided Skills
    </motion.div>
  );
};

/** Skill card — always in DOM, fades in at marker. */
const MarkerSkillCard: React.FC<{
  skill: typeof SKILLS[number];
  theme: ReturnType<typeof useTheme>;
  reduced: boolean;
}> = ({ skill, theme, reduced }) => {
  const { reached } = useMarker(skill.markerId);

  return (
    <motion.div
      animate={{ opacity: reached ? 1 : 0, y: reached ? 0 : 12 }}
      transition={reduced ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }}
      style={{ opacity: 0 }}
    >
      <div style={{
        padding: '0.75rem 1rem',
        borderRadius: 10,
        background: theme.colors.bgSurface,
        border: `1px solid ${theme.colors.bgBorder}`,
        minWidth: 200,
        textAlign: 'left',
      }}>
        <div style={{
          ...monoText(13),
          color: theme.colors.primary,
          fontWeight: 600,
          marginBottom: 4,
        }}>
          {skill.name}
        </div>
        <div style={{
          fontSize: 12,
          color: theme.colors.textSecondary,
          lineHeight: 1.4,
        }}>
          {skill.desc}
        </div>
      </div>
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

      {/* Agent + Skills section — keepInDOM avoids layout shift */}
      <Reveal from={2} keepInDOM>
        {/* Agent card */}
        <div style={{
          marginTop: '1.5rem',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '0.75rem 1.25rem',
            borderRadius: 10,
            background: 'rgba(139, 92, 246, 0.06)',
            border: '1.5px solid rgba(139, 92, 246, 0.3)',
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
              border: '1.5px solid rgba(139, 92, 246, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              flexShrink: 0,
            }}>
              {'\u{1F916}'}
            </div>
            <div>
              <div style={{
                ...monoText(14),
                color: '#a78bfa',
                fontWeight: 700,
              }}>
                devui-debugger
              </div>
              <div style={{
                fontSize: 12,
                color: theme.colors.textSecondary,
                lineHeight: 1.4,
              }}>
                Optional sub-agent — bundles all tools and skills into a dedicated debugging workflow
              </div>
            </div>
          </div>
        </div>

        {/* Skills — always in DOM, opacity driven by markers */}
        <MarkerHeader markerId="sk-debug" reduced={reduced} />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.75rem',
        }}>
          {SKILLS.map((skill) => (
            <MarkerSkillCard key={skill.markerId} skill={skill} theme={theme} reduced={reduced} />
          ))}
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
