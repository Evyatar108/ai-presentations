import React from 'react';
import {
  useReducedMotion,
  useSegmentedAnimation,
  defineSlide,
  SlideContainer,
  SlideTitle,
  Reveal,
  NumberedStepCard,
  ShikiCodeBlock,
  Callout,
  fadeUp,
} from '@framework';

/**
 * Chapter 4: "Get Started"
 * Ch4_S1 — Two Minutes to Start Debugging
 */

const INSTALL_CODE = `/plugin install devui-agent@ai-developer-toolkit`;

const GetStartedComponent: React.FC = () => {
  const { reduced } = useReducedMotion();
  const { currentSegmentIndex } = useSegmentedAnimation();

  return (
    <SlideContainer maxWidth={850}>
      <Reveal from={0}>
        <SlideTitle reduced={reduced}>
          Two Minutes to Start Debugging
        </SlideTitle>
      </Reveal>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
        <Reveal from={0} animation={fadeUp}>
          <NumberedStepCard
            number={1}
            title="Install the plugin"
            description="Sparse clone + dotnet publish on first use (~30s), then instant on every subsequent call."
            isActive={currentSegmentIndex === 0}
          />
          <div style={{ marginTop: '0.5rem' }}>
            <ShikiCodeBlock
              code={INSTALL_CODE}
              language="bash"
              colorTheme="framework"
              fontSize={13}
            />
          </div>
        </Reveal>

        <Reveal from={1} animation={fadeUp}>
          <NumberedStepCard
            number={2}
            title="Authenticate once"
            description="First tool call opens a WebView2 window for Azure AD login. Tokens are cached locally — you only authenticate once."
            isActive={currentSegmentIndex === 1}
          />
        </Reveal>

        <Reveal from={2} animation={fadeUp}>
          <NumberedStepCard
            number={3}
            title="Start debugging"
            description="Just ask Claude to debug a conversation. The devui-debugger agent is automatically available — no config files, no environment variables."
            isActive={currentSegmentIndex === 2}
          />
        </Reveal>
      </div>

      <Reveal from={0} animation={fadeUp}>
        <div style={{ marginTop: '1rem' }}>
          <Callout variant="tip">
            The server binary auto-builds from source on first use. Every subsequent call starts instantly.
          </Callout>
        </div>
      </Reveal>
    </SlideContainer>
  );
};

export const Ch4_S1_GetStarted = defineSlide({
  metadata: {
    chapter: 4,
    slide: 1,
    title: 'Two Minutes to Start Debugging',
    audioSegments: [
      {
        id: 0,
        narrationText:
          "Getting started takes about two minutes. Step one: install the plugin. Run slash plugin install devui-agent at ai-developer-toolkit. The server auto-builds on first use — about thirty seconds, then instant.",
      },
      {
        id: 1,
        narrationText:
          "Step two: authentication. On your first tool call, a WebView2 window opens for Azure AD login. Tokens are cached, so you authenticate once.",
      },
      {
        id: 2,
        narrationText:
          "That's it. You're ready. Just ask your agent to debug a conversation and the Dev-UI debugger agent handles the rest. No config files, no environment variables.",
      },
    ],
  },
  component: GetStartedComponent,
});
