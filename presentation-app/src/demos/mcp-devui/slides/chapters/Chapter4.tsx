import React from 'react';
import {
  useTheme,
  useReducedMotion,
  useSegmentedAnimation,
  defineSlide,
  SlideContainer,
  SlideTitle,
  Reveal,
  ShikiCodeBlock,
  fadeUp,
} from '@framework';

/**
 * Chapter 4: "Get Started"
 * Ch4_S1 — Two Minutes to Start Debugging
 *
 * 3 segments: marketplace registration, choose plugin flavor, start debugging.
 */

const MARKETPLACE_CODE = `/plugin marketplace add gim-home/ai-developer-toolkit`;
const AGENT_INSTALL = `/plugin install devui-agent@ai-developer-toolkit`;
const TOOLS_INSTALL = `/plugin install devui-tools@ai-developer-toolkit`;

/** Numbered step header with optional active highlight. */
const StepHeader: React.FC<{
  number: number;
  title: string;
  isActive: boolean;
}> = ({ number, title, isActive }) => {
  const theme = useTheme();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
    }}>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: isActive ? theme.colors.primary : theme.colors.bgSurface,
        border: `1.5px solid ${isActive ? theme.colors.primary : theme.colors.bgBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 700,
        color: isActive ? '#fff' : theme.colors.textSecondary,
        flexShrink: 0,
        transition: 'background 0.3s, border-color 0.3s, color 0.3s',
      }}>
        {number}
      </div>
      <span style={{
        fontSize: 16,
        fontWeight: 600,
        color: theme.colors.textPrimary,
      }}>
        {title}
      </span>
    </div>
  );
};

/** Side-by-side plugin flavor card. */
const PluginFlavorCard: React.FC<{
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  installCmd: string;
  isActive: boolean;
}> = ({ title, badge, badgeColor, description, installCmd, isActive }) => {
  const theme = useTheme();

  return (
    <div style={{
      flex: 1,
      background: isActive ? 'rgba(0, 183, 195, 0.06)' : theme.colors.bgSurface,
      border: `1.5px solid ${isActive ? theme.colors.primary : theme.colors.bgBorder}`,
      borderRadius: 10,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      transition: 'border-color 0.3s, background 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontWeight: 700,
          fontSize: 15,
          color: theme.colors.textPrimary,
        }}>
          {title}
        </span>
        <span style={{
          fontSize: 10.5,
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: 4,
          background: `${badgeColor}18`,
          color: badgeColor,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {badge}
        </span>
      </div>
      <div style={{
        fontSize: 13,
        color: theme.colors.textSecondary,
        lineHeight: 1.45,
      }}>
        {description}
      </div>
      <div style={{ marginTop: 'auto' }}>
        <ShikiCodeBlock
          code={installCmd}
          language="bash"
          colorTheme="framework"
          fontSize={12}
          showLineNumbers={false}
        />
      </div>
    </div>
  );
};

const GetStartedComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const { currentSegmentIndex } = useSegmentedAnimation();

  return (
    <SlideContainer maxWidth={850}>
      <Reveal from={0}>
        <SlideTitle reduced={reduced}>
          Two Minutes to Start Debugging
        </SlideTitle>
      </Reveal>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
        {/* Step 1: Register marketplace */}
        <Reveal from={0} animation={fadeUp}>
          <StepHeader number={1} title="Register the marketplace" isActive={currentSegmentIndex === 0} />
          <div style={{
            fontSize: 13,
            color: theme.colors.textSecondary,
            marginBottom: 8,
            paddingLeft: 38,
          }}>
            One-time setup — ai-developer-toolkit is an internal repo I maintain with all the MCP plugins.
          </div>
          <div style={{ paddingLeft: 38 }}>
            <ShikiCodeBlock
              code={MARKETPLACE_CODE}
              language="bash"
              colorTheme="framework"
              fontSize={13}
              showLineNumbers={false}
            />
          </div>
        </Reveal>

        {/* Step 2: Choose your plugin */}
        <Reveal from={1} animation={fadeUp}>
          <StepHeader number={2} title="Choose your plugin" isActive={currentSegmentIndex === 1} />
          <div style={{
            display: 'flex',
            gap: 12,
            paddingLeft: 38,
          }}>
            <PluginFlavorCard
              title="devui-agent"
              badge="Recommended"
              badgeColor="#4ade80"
              description="Specialized debugger sub-agent with 3 guided skills and all tools scoped to it."
              installCmd={AGENT_INSTALL}
              isActive={currentSegmentIndex === 1}
            />
            <PluginFlavorCard
              title="devui-tools"
              badge="Power users"
              badgeColor={theme.colors.primary}
              description="All tools and skills exposed directly to any agent you're using."
              installCmd={TOOLS_INSTALL}
              isActive={currentSegmentIndex === 1}
            />
          </div>
        </Reveal>

        {/* Step 3: Start debugging */}
        <Reveal from={2} animation={fadeUp}>
          <StepHeader number={3} title="Start debugging" isActive={currentSegmentIndex === 2} />
          <div style={{
            fontSize: 13,
            color: theme.colors.textSecondary,
            paddingLeft: 38,
          }}>
            Just ask your agent to debug a conversation. No config files, no environment variables — just ask.
          </div>
        </Reveal>
      </div>
    </SlideContainer>
  );
};

export const Ch4_S1_GetStarted = defineSlide({
  metadata: {
    chapter: 4,
    slide: 1,
    title: 'Two Minutes to Start Debugging',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ],
  },
  component: GetStartedComponent,
});
