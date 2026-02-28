import React from 'react';
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
} from '@framework';

/**
 * Chapter 1: "The Toolkit" (1 slide)
 * Ch1_S1 — 23 Tools, 5 Skills, 1 Agent
 */

// ---------- Data ----------

const CATEGORIES = [
  { name: 'Navigation', icon: '\u{1F9ED}', count: 5, markerId: 'nav' },
  { name: 'Telemetry', icon: '\u{1F4CA}', count: 10, markerId: 'tel' },
  { name: 'Comparison', icon: '\u{2696}\u{FE0F}', count: 1, markerId: 'comp' },
  { name: 'Chat Execution', icon: '\u{26A1}', count: 4, markerId: 'chat' },
  { name: 'Configuration', icon: '\u{2699}\u{FE0F}', count: 3, markerId: 'config' },
];

const SKILLS = [
  { name: 'debug-conversation', markerId: 'sk-debug' },
  { name: 'compare-conversations', markerId: 'sk-compare' },
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

// ---------- Slide 1: Solution Overview ----------

const SolutionOverviewComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();

  return (
    <SlideContainer maxWidth={900}>
      <Reveal from={0}>
        <SlideTitle reduced={reduced}>
          23 Tools, 5 Skills, 1 Agent
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
              You know these tools. Now an AI agent has structured access to all of them.
            </div>
          </div>
        </GlowBorder>
      </Reveal>

      {/* Category badges — each revealed by an inline marker */}
      <Reveal from={1}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.75rem',
          marginTop: '2rem',
        }}>
          {CATEGORIES.map((cat) => (
            <RevealAtMarker key={cat.markerId} at={cat.markerId} animation={fadeUp}>
              <CategoryBadge cat={cat} theme={theme} />
            </RevealAtMarker>
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
            {'\u{1F916}'} devui-debugger agent — 5 guided skills:
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
    title: '23 Tools, 5 Skills, 1 Agent',
    audioSegments: [
      {
        id: 0,
        narrationText:
          'Twenty-three tools across five categories — symptom reports, telemetry detail, execution flow, search, config management. You know these surfaces. Now an AI agent has structured access to all of them.',
      },
      {
        id: 1,
        narrationText:
          '{#nav}Navigation for loading conversations. {#tel}Telemetry — the largest group with ten tools for reports, search, and drill-down. {#comp}Comparison for side-by-side analysis. {#chat}Chat Execution for live requests. And {#config}Configuration for runtime config and test accounts.',
      },
      {
        id: 2,
        narrationText:
          'Wrapping all of this is the devui-debugger agent with five guided skills: {#sk-debug}debug-conversation, {#sk-compare}compare-conversations, {#sk-send}send-and-debug, {#sk-config}setup-config, and {#sk-flight}check-flight. Each skill chains multiple tools into a complete workflow.',
      },
    ],
  },
  component: SolutionOverviewComponent,
});
