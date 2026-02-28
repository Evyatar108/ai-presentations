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
 * Ch1_S1 — 23 Tools, 5 Skills, 1 Agent
 */

// ---------- Data ----------

const CATEGORIES = [
  { name: 'Conversation Loading', icon: '\u{1F4E5}', count: 3, markerId: 'nav' },
  { name: 'Turn Inspection', icon: '\u{1F50D}', count: 2, markerId: 'turn' },
  { name: 'Telemetry & Diagnostics', icon: '\u{1F4CA}', count: 10, markerId: 'tel' },
  { name: 'Chat Execution', icon: '\u{26A1}', count: 1, markerId: 'chat' },
  { name: 'Config Management', icon: '\u{2699}\u{FE0F}', count: 5, markerId: 'config' },
];

const SKILLS = [
  { name: 'debug-conversation', markerId: 'sk-debug' },
  { name: 'send-and-debug', markerId: 'sk-send' },
  { name: 'setup-config', markerId: 'sk-config' },
  { name: 'check-flight', markerId: 'sk-flight' },
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
          21 Tools, 4 Skills, 1 Agent
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
            {'\u{1F916}'} devui-debugger agent — 4 guided skills:
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
    title: '21 Tools, 4 Skills, 1 Agent',
    audioSegments: [
      {
        id: 0,
        narrationText:
          'Twenty-one tools across five categories. Every Dev-UI surface you already use — now accessible to your AI agent. Let me walk you through each one.',
      },
      {
        id: 1,
        narrationText:
          '{#nav}Conversation Loading — three tools for loading conversations by ID, shared session link, or exported JSON file. {#turn}Turn Inspection — two tools for viewing turn details and raw message content. {#tel}Telemetry and Diagnostics — the largest group with ten tools covering symptom reports, execution flow, search, and drill-down. {#chat}Chat Execution — one tool for sending live requests with automatic telemetry loading. And {#config}Config Management — five tools for creating, updating, and listing configs plus runtime settings and test accounts.',
      },
      {
        id: 2,
        narrationText:
          'Wrapping all of this is the Dev-UI debugger agent with four guided skills: {#sk-debug}\'debug conversation\', {#sk-send}\'send and debug\', {#sk-config}\'setup config\', and {#sk-flight}\'check flight\'. Each skill chains multiple tools into a complete workflow.',
      },
    ],
  },
  component: SolutionOverviewComponent,
});
