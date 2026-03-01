import React from 'react';
import {
  defineSlide,
  useTheme,
  useSegmentedAnimation,
  SlideContainer,
  Reveal,
  Callout,
  ContentCard,
  AnimatedCheckmark,
  PulsingBadge,
  MarkerDim,
  fadeUp,
} from '@framework';
import { LiveTerminalSimulation } from '../../components/LiveTerminalSimulation';

/** Small pill row showing which MCP tools a skill uses. */
const ToolsUsed: React.FC<{ tools: string[]; theme: ReturnType<typeof useTheme> }> = ({ tools, theme }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6 }}>
    <span style={{ fontSize: 11, fontWeight: 600, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', alignSelf: 'center', marginRight: 4 }}>
      Tools:
    </span>
    {tools.map(t => (
      <span key={t} style={{
        fontSize: 11,
        fontFamily: "'Cascadia Code', 'Fira Code', monospace",
        padding: '2px 8px',
        borderRadius: 4,
        background: theme.colors.bgSurface,
        border: `1px solid ${theme.colors.bgBorder}`,
        color: theme.colors.primary,
      }}>
        {t}
      </span>
    ))}
  </div>
);

/**
 * Chapter 2: "What You Can Do" (3 slides)
 * Ch2_S1 — Debug a Conversation
 * Ch2_S2 — Send and Debug Live
 * Ch2_S3 — Setup Config
 */

// ─── Ch2_S1: Debug a Conversation ──────────────────────────────────

const debugPhases = [
  {
    type: 'user' as const,
    text: 'Debug this conversation: a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  },
  {
    type: 'input' as const,
    text: 'debug-conversation(conversationId="a1b2c3d4-e5f6-7890-abcd-ef1234567890")',
  },
  {
    type: 'output' as const,
    text: 'load_conversation → ConversationOverview: 2 turns, entryPoint: BizChat',
    prefix: '[Tool]',
    color: '#60a5fa',
  },
  {
    type: 'output' as const,
    text: 'get_turn(0) → 1,030 telemetry entries, 2 failed calls',
    prefix: '[Tool]',
    color: '#60a5fa',
  },
  {
    type: 'output' as const,
    text: 'get_symptom_report(0) → 9 sections analyzed',
    prefix: '[Tool]',
    color: '#a78bfa',
  },
  {
    type: 'output' as const,
    text: '\u26A0 Retrievals: SubstrateSearch returned 0 results (grounding failed)',
    prefix: '[Flag]',
    color: '#fbbf24',
  },
  {
    type: 'output' as const,
    text: '\u26A0 Reasonings: DeepLeo-Reasoning-1 operated with empty context',
    prefix: '[Flag]',
    color: '#fbbf24',
  },
  {
    type: 'output' as const,
    text: 'get_telemetry_detail(0, 600) → full prompt: 42,381 bytes',
    prefix: '[Tool]',
    color: '#60a5fa',
  },
  {
    type: 'output' as const,
    text: 'Request context, grounding docs, system instructions \u2014 all visible',
    prefix: '[Detail]',
    color: '#a78bfa',
  },
  {
    type: 'output' as const,
    text: 'Root cause: Search grounding failed \u2192 reasoning operated with empty context \u2192 wrong answer',
    prefix: '[Summary]',
    color: '#34d399',
  },
];

const DebugConversationComponent: React.FC = () => {
  const theme = useTheme();
  const { currentSegmentIndex } = useSegmentedAnimation();

  return (
    <SlideContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
        <Reveal from={0} animation={fadeUp}>
          <h2
            style={{
              color: theme.colors.textPrimary,
              fontSize: 28,
              fontWeight: 700,
              textAlign: 'center',
              margin: 0,
            }}
          >
            Debug a Conversation <span style={{ fontWeight: 400, fontSize: 18, color: theme.colors.textSecondary }}>(Skill)</span>
          </h2>
          <ToolsUsed theme={theme} tools={['load_conversation', 'get_symptom_report', 'get_telemetry_detail', 'get_execution_flow']} />
        </Reveal>

        <div style={{ flex: 1, minHeight: 0, textAlign: 'left' }}>
          <LiveTerminalSimulation
            phases={debugPhases}
            activePhase={
              currentSegmentIndex === 0 ? 3 :
              currentSegmentIndex === 1 ? 6 :
              currentSegmentIndex === 2 ? 8 :
              currentSegmentIndex >= 3 ? 9 :
              0
            }
          />
        </div>

        <Reveal from={3} animation={fadeUp}>
          <Callout variant="info" style={{ color: theme.colors.textPrimary }}>
            <strong>Conversation ID to root cause</strong> &mdash; the agent reads the symptom report,
            spots the anomaly, and drills into the 40KB prompt. All from one request.
          </Callout>
        </Reveal>
      </div>
    </SlideContainer>
  );
};

export const Ch2_S1_DebugConversation = defineSlide({
  metadata: {
    chapter: 2,
    slide: 1,
    title: 'Debug a Conversation',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ],
  },
  component: DebugConversationComponent,
});

// ─── Ch2_S2: Send and Debug ─────────────────────────────────────

const sendDebugPhases = [
  {
    type: 'user' as const,
    text: 'Send "What files were shared in my last meeting?" to the sdf-debug config and debug the response',
  },
  {
    type: 'input' as const,
    text: 'send_chat_request(configId="sdf-debug", message="What files were shared in my last meeting?")',
  },
  {
    type: 'output' as const,
    text: 'Connecting to ChatHub via SignalR...',
    prefix: '[Info]',
    color: '#60a5fa',
  },
  {
    type: 'output' as const,
    text: 'files shared with me last week',
    prefix: '[SearchQuery]',
    color: '#fbbf24',
  },
  {
    type: 'output' as const,
    text: 'Searching your files...',
    prefix: '[LoaderMessage]',
    color: '#fbbf24',
  },
  {
    type: 'output' as const,
    text: 'Analyzing results...',
    prefix: '[LoaderMessage]',
    color: '#fbbf24',
  },
  {
    type: 'output' as const,
    text: '"Here are the files shared in your last meeting:\\n- Q3 Report.xlsx\\n- Design Review.pptx"',
    prefix: '[Response]',
    color: '#34d399',
  },
  {
    type: 'output' as const,
    text: 'telemetryAutoLoaded: true \u2014 1,030 entries loaded, drill-down tools ready',
    prefix: '[Success]',
    color: '#34d399',
  },
];

const drillDownTools = [
  { name: 'get_symptom_report', icon: '\u{1F4CB}', markerId: 'symptom' },
  { name: 'get_execution_flow', icon: '\u{1F333}', markerId: 'exec-flow' },
  { name: 'search_telemetry', icon: '\u{1F50D}', markerId: 'search-tel' },
  { name: 'get_telemetry_detail', icon: '\u{1F4C4}', markerId: 'drill-detail' },
];

const SendAndDebugComponent: React.FC = () => {
  const theme = useTheme();
  const { currentSegmentIndex } = useSegmentedAnimation();

  return (
    <SlideContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
        <Reveal from={0} animation={fadeUp}>
          <h2
            style={{
              color: theme.colors.textPrimary,
              fontSize: 28,
              fontWeight: 700,
              textAlign: 'center',
              margin: 0,
            }}
          >
            Send and Debug Live <span style={{ fontWeight: 400, fontSize: 18, color: theme.colors.textSecondary }}>(Skill)</span>
          </h2>
          <ToolsUsed theme={theme} tools={['send_chat_request', 'get_symptom_report', 'search_telemetry', 'get_telemetry_detail']} />
        </Reveal>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0, textAlign: 'left' }}>
          <LiveTerminalSimulation
            phases={sendDebugPhases}
            activePhase={
              currentSegmentIndex === 0 ? 1 :
              currentSegmentIndex === 1 ? 5 :
              currentSegmentIndex === 2 ? 6 :
              currentSegmentIndex >= 3 ? 7 :
              0
            }
          />

          {/* Auto-loaded badge */}
          <Reveal from={3} animation={fadeUp}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <PulsingBadge>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px' }}>
                  <AnimatedCheckmark size={18} />
                  <span style={{ color: theme.colors.textPrimary, fontSize: 14, fontWeight: 600 }}>
                    telemetryAutoLoaded: true
                  </span>
                </span>
              </PulsingBadge>
            </div>
          </Reveal>

          {/* Drill-down tools */}
          <Reveal from={4} animation={fadeUp}>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {drillDownTools.map((tool) => (
                <MarkerDim
                  key={tool.name}
                  at={tool.markerId}
                  dimOpacity={0.2}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    background: theme.colors.bgSurface,
                    borderRadius: 8,
                    border: `1px solid ${theme.colors.bgBorder}`,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{tool.icon}</span>
                  <span
                    style={{
                      color: theme.colors.textPrimary,
                      fontSize: 13,
                      fontFamily: 'monospace',
                    }}
                  >
                    {tool.name}
                  </span>
                </MarkerDim>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </SlideContainer>
  );
};

export const Ch2_S2_SendAndDebug = defineSlide({
  metadata: {
    chapter: 2,
    slide: 2,
    title: 'Send and Debug Live',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
    ],
  },
  component: SendAndDebugComponent,
});

// ─── Ch2_S3: Setup Config ──────────────────────────────────────────

const USE_CASES = [
  {
    title: 'Config Management',
    items: [
      { cmd: 'create_chat_config', desc: 'Fork the SDF config' },
      { cmd: 'update_chat_config', desc: 'Add your flight, set your endpoint' },
    ],
  },
  {
    title: 'Load Conversations',
    items: [
      { cmd: 'load_conversation', desc: 'By conversation ID', markerId: 'by-id' },
      { cmd: 'load_shared_session', desc: 'By shared session link', markerId: 'by-link' },
      { cmd: 'load_conversation_file', desc: 'From a local JSON file', markerId: 'by-file' },
    ],
  },
  {
    title: 'Quick Checks',
    items: [
      { cmd: 'get_turn_variants', desc: 'Check which flights are active', markerId: 'variants' },
      { cmd: 'search_telemetry', desc: 'Find all SubstrateSearch calls', markerId: 'search-quick' },
    ],
  },
];

const ConfigFlightsMoreComponent: React.FC = () => {
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={900}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
        <Reveal from={0} animation={fadeUp}>
          <h2
            style={{
              color: theme.colors.textPrimary,
              fontSize: 28,
              fontWeight: 700,
              textAlign: 'center',
              margin: 0,
            }}
          >
            Setup Config <span style={{ fontWeight: 400, fontSize: 18, color: theme.colors.textSecondary }}>(Skill)</span>
          </h2>
          <ToolsUsed theme={theme} tools={['create_chat_config', 'update_chat_config', 'load_conversation', 'get_turn_variants', 'search_telemetry']} />
        </Reveal>

        {USE_CASES.map((useCase, ucIndex) => (
          <Reveal key={useCase.title} from={ucIndex} animation={fadeUp}>
            <ContentCard style={{ padding: '1rem 1.5rem' }}>
              <div style={{
                fontWeight: 600,
                color: theme.colors.primary,
                fontSize: 16,
                marginBottom: 8,
              }}>
                {useCase.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {useCase.items.map((item) => {
                  const content = (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '6px 0',
                      }}
                    >
                      <code
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 13,
                          color: theme.colors.primary,
                          background: 'rgba(0, 183, 195, 0.1)',
                          padding: '2px 8px',
                          borderRadius: 4,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.cmd}
                      </code>
                      <span style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
                        {item.desc}
                      </span>
                    </div>
                  );
                  return 'markerId' in item && item.markerId ? (
                    <MarkerDim key={item.cmd} at={item.markerId} dimOpacity={0.2}>
                      {content}
                    </MarkerDim>
                  ) : (
                    <React.Fragment key={item.cmd}>{content}</React.Fragment>
                  );
                })}
              </div>
            </ContentCard>
          </Reveal>
        ))}
      </div>
    </SlideContainer>
  );
};

export const Ch2_S3_SetupConfig = defineSlide({
  metadata: {
    chapter: 2,
    slide: 3,
    title: 'Setup Config',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ],
  },
  component: ConfigFlightsMoreComponent,
});
