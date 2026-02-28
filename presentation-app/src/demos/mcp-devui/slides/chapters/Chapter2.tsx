import React from 'react';
import { motion } from 'framer-motion';
import {
  defineSlide,
  useTheme,
  useReducedMotion,
  useSegmentedAnimation,
  SlideContainer,
  Reveal,
  Callout,
  ContentCard,
  AnimatedCheckmark,
  PulsingBadge,
  fadeIn,
  fadeUp,
} from '@framework';
import { LiveTerminalSimulation } from '../../components/LiveTerminalSimulation';
import { ExecutionFlowDiagram } from '../../components/ExecutionFlowDiagram';

/**
 * Chapter 2: "What You Can Do" (5 slides)
 * Ch2_S1 — Debug a Conversation (NEW)
 * Ch2_S2 — See the Execution Flow (from old Ch4_S1, compressed)
 * Ch2_S3 — Compare Control vs Experiment (from old Ch5_S1, compressed)
 * Ch2_S4 — Send and Debug Live (from old Ch5_S2, renumbered)
 * Ch2_S5 — Config, Flights & More (NEW)
 */

// ─── Ch2_S1: Debug a Conversation ──────────────────────────────────

const debugPhases = [
  {
    type: 'input' as const,
    text: 'debug-conversation(conversationId="abc-123-def-456")',
  },
  {
    type: 'output' as const,
    text: 'Loading conversation abc-123-def-456...',
    prefix: '[Info]',
    color: '#60a5fa',
  },
  {
    type: 'output' as const,
    text: 'Conversation loaded: 1,247 telemetry entries cached',
    prefix: '[Success]',
    color: '#34d399',
  },
  {
    type: 'output' as const,
    text: 'Running symptom report...',
    prefix: '[Info]',
    color: '#60a5fa',
  },
  {
    type: 'output' as const,
    text: 'Symptom Report \u2014 9 sections analyzed',
    prefix: '[Report]',
    color: '#a78bfa',
  },
  {
    type: 'output' as const,
    text: '\u26A0 Reasonings: DeepLeo-Reasoning-1 latency 1,200ms (high)',
    prefix: '[Flag]',
    color: '#fbbf24',
  },
  {
    type: 'output' as const,
    text: '\u26A0 Retrievals: SubstrateSearch returned 0 results',
    prefix: '[Flag]',
    color: '#fbbf24',
  },
  {
    type: 'output' as const,
    text: 'Drilling into reasoning call at telemetryIndex 600...',
    prefix: '[Info]',
    color: '#60a5fa',
  },
  {
    type: 'output' as const,
    text: 'Full prompt: 42,381 bytes \u2014 request context, grounding docs, system instructions',
    prefix: '[Detail]',
    color: '#a78bfa',
  },
  {
    type: 'output' as const,
    text: 'Root cause: Search grounding failed \u2192 reasoning operated with empty context \u2192 high latency',
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
            Debug a Conversation
          </h2>
        </Reveal>

        <div style={{ flex: 1, minHeight: 0 }}>
          <LiveTerminalSimulation
            phases={debugPhases}
            activePhase={
              currentSegmentIndex === 0 ? 2 :
              currentSegmentIndex === 1 ? 6 :
              currentSegmentIndex === 2 ? 8 :
              currentSegmentIndex >= 3 ? 9 :
              0
            }
          />
        </div>

        <Reveal from={3} animation={fadeUp}>
          <Callout variant="info">
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
      {
        id: 0,
        narrationText:
          "Here's the core workflow. Give the agent a conversation ID and it loads the conversation — twelve hundred telemetry entries cached and ready.",
      },
      {
        id: 1,
        narrationText:
          'The agent runs a symptom report and triages the results. It flags a reasoning call at twelve hundred milliseconds and a search that returned zero results.',
      },
      {
        id: 2,
        narrationText:
          'It drills into that reasoning call, pulling the full forty-two-kilobyte prompt. Request context, grounding docs, system instructions — all visible.',
      },
      {
        id: 3,
        narrationText:
          "Conversation ID to root cause in one request. The search grounding failed, reasoning worked with empty context, and that's why the latency spiked.",
      },
    ],
  },
  component: DebugConversationComponent,
});

// ─── Ch2_S2: See the Execution Flow ────────────────────────────────

const ACTIVE_NODE_SEQUENCE: Array<string | undefined> = [
  undefined,
  'chat-hub',
  'deepleo-r1',
];

const ExecutionFlowComponent: React.FC = () => {
  const { currentSegmentIndex, isSegmentVisible } = useSegmentedAnimation();
  const theme = useTheme();
  const activeNode = ACTIVE_NODE_SEQUENCE[currentSegmentIndex];

  return (
    <SlideContainer>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Reveal from={0} animation={fadeUp}>
          <h2
            style={{
              color: theme.colors.textPrimary,
              fontSize: 28,
              fontWeight: 700,
              textAlign: 'center',
              margin: '0 0 12px 0',
            }}
          >
            See the Execution Flow
          </h2>
        </Reveal>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ExecutionFlowDiagram
            activeNode={activeNode}
            showLatency={isSegmentVisible(2)}
          />
        </div>
      </div>
    </SlideContainer>
  );
};

export const Ch2_S2_ExecutionFlow = defineSlide({
  metadata: {
    chapter: 2,
    slide: 2,
    title: 'See the Execution Flow',
    audioSegments: [
      {
        id: 0,
        narrationText:
          'The agent shows you the execution flow — the actual service call tree for any turn. TuringBot at the root, with ChatHub, connection setup, and telemetry flush.',
      },
      {
        id: 1,
        narrationText:
          'ChatHub is where the real work happens — NLU, config, DeepLeo reasoning iterations, SubstrateSearch, and the final synthesis. All with individual latency tracking.',
      },
      {
        id: 2,
        narrationText:
          "DeepLeo Reasoning iteration one at twelve hundred milliseconds. That's your investigation target. The agent highlights where time is spent so you know exactly where to look.",
      },
    ],
  },
  component: ExecutionFlowComponent,
});

// ─── Ch2_S3: Compare Control vs Experiment ─────────────────────────

const comparisonRows = [
  { metric: 'Service Calls', slotA: '47', slotB: '52', delta: '+5', severity: 'warn' },
  { metric: 'Failed Calls', slotA: '0', slotB: '2', delta: '+2', severity: 'error' },
  { metric: 'Total Latency', slotA: '2,847ms', slotB: '3,412ms', delta: '+565ms', severity: 'warn' },
  { metric: 'Reasoning Iters', slotA: '2', slotB: '3', delta: '+1', severity: 'neutral' },
  { metric: 'Search Results', slotA: '12', slotB: '8', delta: '-4', severity: 'warn' },
];

const CompareConversationsComponent: React.FC = () => {
  const theme = useTheme();

  const slotStyle: React.CSSProperties = {
    background: theme.colors.bgSurface,
    borderRadius: 12,
    border: `1px solid ${theme.colors.bgBorder}`,
    padding: 20,
  };

  return (
    <SlideContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
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
            Compare Control vs Experiment
          </h2>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Slot A */}
          <Reveal from={0} animation={fadeIn}>
            <div style={slotStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'rgba(59, 130, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#3b82f6',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  A
                </div>
                <span style={{ color: theme.colors.textPrimary, fontWeight: 600 }}>Control</span>
              </div>
              <div style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                Baseline without the new flight variant.
              </div>
            </div>
          </Reveal>

          {/* Slot B */}
          <Reveal from={0} animation={fadeIn}>
            <div style={slotStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  B
                </div>
                <span style={{ color: theme.colors.textPrimary, fontWeight: 600 }}>Experiment</span>
              </div>
              <div style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                Same query, with the new flight enabled.
              </div>
            </div>
          </Reveal>
        </div>

        {/* Comparison Table */}
        <Reveal from={1} animation={fadeUp}>
          <div
            style={{
              background: theme.colors.bgSurface,
              borderRadius: 12,
              border: `1px solid ${theme.colors.bgBorder}`,
              padding: 16,
              overflow: 'auto',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  {['Metric', 'Control', 'Experiment', 'Delta'].map((col) => (
                    <th
                      key={col}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        color: theme.colors.textMuted,
                        fontWeight: 600,
                        fontSize: 12,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: `1px solid ${theme.colors.bgBorder}`,
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.metric}>
                    <td style={{ padding: '8px 12px', color: theme.colors.textPrimary, fontWeight: 500 }}>
                      {row.metric}
                    </td>
                    <td style={{ padding: '8px 12px', color: theme.colors.textSecondary, fontFamily: 'monospace' }}>
                      {row.slotA}
                    </td>
                    <td style={{ padding: '8px 12px', color: theme.colors.textSecondary, fontFamily: 'monospace' }}>
                      {row.slotB}
                    </td>
                    <td
                      style={{
                        padding: '8px 12px',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: row.severity === 'error' ? '#ef4444'
                          : row.severity === 'warn' ? '#f59e0b'
                          : theme.colors.textSecondary,
                      }}
                    >
                      {row.delta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* Delta summary */}
        <Reveal from={2} animation={fadeUp}>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            {[
              { label: 'New Failures', value: '2', color: '#ef4444' },
              { label: 'Latency Increase', value: '+565ms', color: '#f59e0b' },
              { label: 'Extra Reasoning', value: '+1 iter', color: theme.colors.textSecondary },
            ].map(item => (
              <div
                key={item.label}
                style={{
                  background: theme.colors.bgSurface,
                  borderRadius: 10,
                  border: `1px solid ${theme.colors.bgBorder}`,
                  padding: '12px 20px',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: item.color, fontSize: 22, fontWeight: 700 }}>{item.value}</div>
                <div style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </SlideContainer>
  );
};

export const Ch2_S3_CompareConversations = defineSlide({
  metadata: {
    chapter: 2,
    slide: 3,
    title: 'Compare Control vs Experiment',
    audioSegments: [
      {
        id: 0,
        narrationText:
          'SEVAL scores dropped? Load control and experiment into separate slots. Slot A is the baseline, Slot B has the new flight.',
      },
      {
        id: 1,
        narrationText:
          'The comparison tool produces a structured diff. The experiment added five service calls, introduced two failures, and increased total latency by five sixty-five milliseconds. An extra reasoning iteration and fewer search results.',
      },
      {
        id: 2,
        narrationText:
          "The extra reasoning iteration is the likely culprit. From here, drill into each slot's symptom report for the full picture.",
      },
    ],
  },
  component: CompareConversationsComponent,
});

// ─── Ch2_S4: Send and Debug Live ───────────────────────────────────

const sendDebugPhases = [
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
    text: 'SearchQuery: files shared meeting recent',
    prefix: '[Progress]',
    color: '#fbbf24',
  },
  {
    type: 'output' as const,
    text: 'LoaderMessage: Searching your meetings...',
    prefix: '[Progress]',
    color: '#fbbf24',
  },
  {
    type: 'output' as const,
    text: 'DeepLeo: Reasoning iteration 1 (1,200ms)',
    prefix: '[Progress]',
    color: '#fbbf24',
  },
  {
    type: 'output' as const,
    text: 'DeepLeo: Responding (600ms)',
    prefix: '[Progress]',
    color: '#fbbf24',
  },
  {
    type: 'output' as const,
    text: 'Bot: "Here are the files shared in your last meeting:\\n- Q3 Report.xlsx\\n- Design Review.pptx"',
    prefix: '[Response]',
    color: '#34d399',
  },
  {
    type: 'output' as const,
    text: 'telemetryAutoLoaded: true \u2014 47 entries cached, drill-down tools ready',
    prefix: '[Success]',
    color: '#34d399',
  },
];

const drillDownTools = [
  { name: 'get_symptom_report', icon: '\u{1F4CB}' },
  { name: 'get_execution_flow', icon: '\u{1F333}' },
  { name: 'search_telemetry', icon: '\u{1F50D}' },
  { name: 'get_telemetry_detail', icon: '\u{1F4C4}' },
];

const SendAndDebugComponent: React.FC = () => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
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
            Send and Debug Live
          </h2>
        </Reveal>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
          <LiveTerminalSimulation
            phases={sendDebugPhases}
            activePhase={
              currentSegmentIndex === 0 ? 0 :
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
              {drillDownTools.map((tool, i) => (
                <motion.div
                  key={tool.name}
                  initial={reduced ? undefined : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduced ? 0 : i * 0.15 }}
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
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </SlideContainer>
  );
};

export const Ch2_S4_SendAndDebug = defineSlide({
  metadata: {
    chapter: 2,
    slide: 4,
    title: 'Send and Debug Live',
    audioSegments: [
      {
        id: 0,
        narrationText:
          'The send-and-debug workflow combines chat execution with automatic telemetry loading. You send a message, and the tool does the rest.',
      },
      {
        id: 1,
        narrationText:
          "The request flows through SignalR ChatHub. You see progress messages in real-time — search queries, loader messages, reasoning iterations, and the final response. It's like watching the pipeline execute.",
      },
      {
        id: 2,
        narrationText:
          'The bot responds with the answer. But here is the key difference from using Copilot normally — the telemetry is already loaded.',
      },
      {
        id: 3,
        narrationText:
          'Telemetry auto-loaded: true. Forty-seven entries are cached and ready. No separate load conversation call needed.',
      },
      {
        id: 4,
        narrationText:
          'All four drill-down tools are immediately available. Get the symptom report, inspect the execution flow tree, search telemetry by any criteria, or drill into the full detail of any specific entry. Zero extra setup.',
      },
    ],
  },
  component: SendAndDebugComponent,
});

// ─── Ch2_S5: Config, Flights & More ────────────────────────────────

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
      { cmd: 'load_conversation', desc: 'By conversation ID' },
      { cmd: 'load_shared_session', desc: 'By shared session link' },
      { cmd: 'load_conversation_file', desc: 'From a local JSON file' },
    ],
  },
  {
    title: 'Quick Checks',
    items: [
      { cmd: 'get_turn_variants', desc: 'Is my flight active?' },
      { cmd: 'search_telemetry', desc: 'Find all SubstrateSearch calls' },
    ],
  },
];

const ConfigFlightsMoreComponent: React.FC = () => {
  const theme = useTheme();

  return (
    <SlideContainer maxWidth={900}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
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
            Config, Flights &amp; More
          </h2>
        </Reveal>

        {USE_CASES.map((useCase, ucIndex) => (
          <Reveal key={useCase.title} from={ucIndex} animation={fadeUp}>
            <ContentCard>
              <div style={{
                fontWeight: 600,
                color: theme.colors.primary,
                fontSize: 16,
                marginBottom: 12,
              }}>
                {useCase.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {useCase.items.map((item) => (
                  <div
                    key={item.cmd}
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
                ))}
              </div>
            </ContentCard>
          </Reveal>
        ))}
      </div>
    </SlideContainer>
  );
};

export const Ch2_S5_ConfigFlightsMore = defineSlide({
  metadata: {
    chapter: 2,
    slide: 5,
    title: 'Config, Flights & More',
    audioSegments: [
      {
        id: 0,
        narrationText:
          'Beyond debugging, the agent handles config management. Fork the SDF config, add your flight, point it at your local endpoint — all via natural language with create and update chat config.',
      },
      {
        id: 1,
        narrationText:
          'Conversations load three ways: by conversation ID, by shared session link, or from a local JSON file. Whichever fits your workflow.',
      },
      {
        id: 2,
        narrationText:
          'Quick checks are just as easy. Is my flight active? Get turn variants. Find all SubstrateSearch calls? Search telemetry. The full breadth of DevUI, accessible in one conversation.',
      },
    ],
  },
  component: ConfigFlightsMoreComponent,
});
