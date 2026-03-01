import React from 'react';
import {
  defineSlide,
  useTheme,
  useSegmentedAnimation,
  SlideContainer,
  Reveal,
  Callout,
  fadeUp,
} from '@framework';
import { WorkspaceBridgeDiagram } from '../../components/WorkspaceBridgeDiagram';
import { ConversationTriagePipeline } from '../../components/ConversationTriagePipeline';

/**
 * Chapter 4: "Going Further" (2 slides)
 * Ch4_S1 — Agent Meets Source Code
 * Ch4_S2 — SEVAL at Scale
 */

// ─── Ch4_S1: Agent Meets Source Code ──────────────────────────────────

const PHASE_MAP_SOURCE: Record<number, number> = {
  0: 1,  // both panels visible
  1: 2,  // arrows animate
  2: 3,  // full glow
};

const AgentMeetsSourceComponent: React.FC = () => {
  const theme = useTheme();
  const { currentSegmentIndex } = useSegmentedAnimation();
  const phase = PHASE_MAP_SOURCE[currentSegmentIndex] ?? 0;

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
            Agent Meets Source Code
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: 15,
            color: theme.colors.textSecondary,
            margin: '6px 0 0',
          }}>
            DevUI MCP + workspace source code = closed-loop debugging
          </p>
        </Reveal>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', minHeight: 0 }}>
          <WorkspaceBridgeDiagram activePhase={phase} />
        </div>

        <Reveal from={2} animation={fadeUp}>
          <Callout variant="tip" style={{ color: theme.colors.textPrimary }}>
            <strong>From symptom report to source code fix</strong> &mdash; in one conversation.
          </Callout>
        </Reveal>
      </div>
    </SlideContainer>
  );
};

export const Ch4_S1_AgentMeetsSource = defineSlide({
  metadata: {
    chapter: 4,
    slide: 1,
    title: 'Agent Meets Source Code',
    audioSegments: [
      {
        id: 0,
        narrationText:
          "What if the agent could read both telemetry and source code? Add the Sydney repo to the workspace alongside Dev-UI MCP, and the agent has access to both diagnostic data and the actual implementation.",
      },
      {
        id: 1,
        narrationText:
          "Closed-loop debugging: the agent finds a bug via the symptom report, traces the service call, opens the source file, and identifies the root cause — all in one conversation.",
      },
      {
        id: 2,
        narrationText:
          "From symptom report to source code fix — in one conversation. And once the fix is in, the agent can rerun the service, query it again, and debug the new response to verify. No context switching, no copy-pasting between tools.",
      },
    ],
  },
  component: AgentMeetsSourceComponent,
});

// ─── Ch4_S2: SEVAL at Scale ───────────────────────────────────────────

const PHASE_MAP_SEVAL: Record<number, number> = {
  0: 0,  // prompt only
  1: 1,  // cards stagger in
  2: 2,  // sort + highlight worst
};

const SevalAtScaleComponent: React.FC = () => {
  const theme = useTheme();
  const { currentSegmentIndex } = useSegmentedAnimation();
  const phase = PHASE_MAP_SEVAL[currentSegmentIndex] ?? 0;

  return (
    <SlideContainer maxWidth={700}>
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
            SEVAL at Scale
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: 15,
            color: theme.colors.textSecondary,
            margin: '6px 0 0',
          }}>
            SEVAL MCP + DevUI MCP = automated triage
          </p>
        </Reveal>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', minHeight: 0 }}>
          <ConversationTriagePipeline activePhase={phase} />
        </div>

        <Reveal from={2} animation={fadeUp}>
          <Callout variant="info" style={{ color: theme.colors.textPrimary }}>
            <strong>Two MCP servers, one conversation</strong> &mdash; from SEVAL job to root cause diagnosis.
          </Callout>
        </Reveal>
      </div>
    </SlideContainer>
  );
};

export const Ch4_S2_SevalAtScale = defineSlide({
  metadata: {
    chapter: 4,
    slide: 2,
    title: 'SEVAL at Scale',
    audioSegments: [
      {
        id: 0,
        narrationText:
          "SEVAL scrapes produce hundreds of conversations. Instead of triaging manually, just ask: get the worst conversation from my latest SEVAL and debug what went wrong.",
      },
      {
        id: 1,
        narrationText:
          "SEVAL produces metrics — both aggregated and per query — plus LM Checklist results: code-based and LLM-based assertions that check each query for regressions. Through the SEVAL MCP, the agent can access all of that, identify the worst-performing conversations, and start debugging them with the Dev-UI MCP.",
      },
      {
        id: 2,
        narrationText:
          "Two MCP servers, one conversation. The SEVAL MCP gives the agent access to metrics and checklist results, the Dev-UI MCP lets it load and debug those conversations — from regression detection to root cause diagnosis, all in one session.",
      },
    ],
  },
  component: SevalAtScaleComponent,
});
