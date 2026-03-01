import React from 'react';
import {
  useTheme,
  useReducedMotion,
  useSegmentedAnimation,
  defineSlide,
  SlideContainer,
  SlideTitle,
  Reveal,
  NumberedStepCard,
  ShikiCodeBlock,
  fadeUp,
} from '@framework';

/**
 * Chapter 5: "Get Started"
 * Ch5_S1 — Two Minutes to Start Debugging
 *
 * 4 segments: marketplace registration, plugin flavors, authenticate, start debugging.
 */

const MARKETPLACE_CODE = `/plugin marketplace add gim-home/ai-developer-toolkit`;
const AGENT_INSTALL = `/plugin install devui-agent@ai-developer-toolkit`;
const TOOLS_INSTALL = `/plugin install devui-tools@ai-developer-toolkit`;

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
        {/* Step 1: Register marketplace */}
        <Reveal from={0} animation={fadeUp}>
          <NumberedStepCard
            number={1}
            title="Register the marketplace"
            description="One-time setup — adds the AI Developer Toolkit marketplace to your plugin registry."
            isActive={currentSegmentIndex === 0}
          />
          <div style={{ marginTop: '0.5rem' }}>
            <ShikiCodeBlock
              code={MARKETPLACE_CODE}
              language="bash"
              colorTheme="framework"
              fontSize={13}
            />
          </div>
        </Reveal>

        {/* Step 2: Choose your plugin */}
        <Reveal from={1} animation={fadeUp}>
          <NumberedStepCard
            number={2}
            title="Choose your plugin"
            description=""
            isActive={currentSegmentIndex === 1}
          />
          <div style={{
            display: 'flex',
            gap: 12,
            marginTop: '0.5rem',
          }}>
            <PluginFlavorCard
              title="devui-agent"
              badge="Recommended"
              badgeColor="#4ade80"
              description="Tools scoped to a specialized debugger agent. Best for structured workflows."
              installCmd={AGENT_INSTALL}
              isActive={currentSegmentIndex === 1}
            />
            <PluginFlavorCard
              title="devui-tools"
              badge="Power users"
              badgeColor={theme.colors.primary}
              description="All tools exposed directly to your main agent. Best for ad-hoc exploration."
              installCmd={TOOLS_INSTALL}
              isActive={currentSegmentIndex === 1}
            />
          </div>
        </Reveal>

        {/* Step 3: Authenticate */}
        <Reveal from={2} animation={fadeUp}>
          <NumberedStepCard
            number={3}
            title="Authenticate once"
            description="First tool call opens a WebView2 window for Azure AD login. Tokens are cached locally — you only authenticate once."
            isActive={currentSegmentIndex === 2}
          />
        </Reveal>

        {/* Step 4: Start debugging */}
        <Reveal from={3} animation={fadeUp}>
          <NumberedStepCard
            number={4}
            title="Start debugging"
            description="Just ask your agent to debug a conversation. No config files, no environment variables — just ask."
            isActive={currentSegmentIndex === 3}
          />
        </Reveal>
      </div>
    </SlideContainer>
  );
};

export const Ch5_S1_GetStarted = defineSlide({
  metadata: {
    chapter: 5,
    slide: 1,
    title: 'Two Minutes to Start Debugging',
    audioSegments: [
      {
        id: 0,
        narrationText:
          "Getting started takes two minutes. Step one: register the marketplace. Run slash plugin marketplace add gim-home slash ai-developer-toolkit. This is a one-time setup.",
      },
      {
        id: 1,
        narrationText:
          "Step two: choose your plugin. devui-agent scopes all tools to a specialized debugger agent — best for structured workflows. devui-tools exposes everything directly to your main agent — best for power users who want full control.",
      },
      {
        id: 2,
        narrationText:
          "Step three: authenticate. On your first tool call, a WebView2 window opens for Azure AD login. Tokens are cached, so you only authenticate once.",
      },
      {
        id: 3,
        narrationText:
          "That's it — you're ready. Just ask your agent to debug a conversation and start working. No config files, no environment variables.",
      },
    ],
  },
  component: GetStartedComponent,
});
