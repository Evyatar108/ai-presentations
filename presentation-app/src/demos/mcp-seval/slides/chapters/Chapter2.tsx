import React from 'react';
import {
  defineSlide,
  useTheme,
  useSegmentedAnimation,
  SlideContainer,
  Reveal,
  Callout,
  ContentCard,
  fadeUp,
} from '@framework';
import { LiveTerminalSimulation } from '../../components/LiveTerminalSimulation';
import { ScorecardTable } from '../../components/ScorecardTable';
import { UtteranceDrilldown } from '../../components/UtteranceDrilldown';

/** Small pill row showing which MCP tools a workflow uses. */
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
 * Chapter 2: "Key Workflows" (4 slides)
 * Ch2_S1 — Create a Job
 * Ch2_S2 — Analyze Results
 * Ch2_S3 — Diagnose Utterances
 * Ch2_S4 — Download and Manage
 */

// ─── Ch2_S1: Create a Job ──────────────────────────────────────────

const createJobPhases = [
  {
    type: 'user' as const,
    text: 'Create a SEVAL job using the BizChat template to test my new flight',
  },
  {
    type: 'input' as const,
    text: 'list_job_templates()',
    prefix: '[Tool]',
  },
  {
    type: 'output' as const,
    text: 'UnifiedBizChat (envId: 7), MChat-SDF (envId: 3), RSP (envId: 1) ...',
    prefix: '[Result]',
    color: '#60a5fa',
  },
  {
    type: 'input' as const,
    text: 'get_template_versions(name="UnifiedBizChat", environmentId=7)',
    prefix: '[Tool]',
  },
  {
    type: 'output' as const,
    text: 'v2.4.1 (2026-02-28) \u2014 SSR: 98.2% | v2.3.9 (2026-02-15) \u2014 SSR: 97.8%',
    prefix: '[Result]',
    color: '#60a5fa',
  },
  {
    type: 'input' as const,
    text: 'create_job(jobName="my-flight-eval", settings="{...}", ...)',
    prefix: '[Tool]',
  },
  {
    type: 'output' as const,
    text: '{ "InsertedID": 381294 } \u2014 Status: Queued',
    prefix: '[Success]',
    color: '#34d399',
  },
];

const CreateJobComponent: React.FC = () => {
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
            Create a Job
          </h2>
          <ToolsUsed theme={theme} tools={['list_job_templates', 'get_template_versions', 'create_job']} />
        </Reveal>

        <div style={{ flex: 1, minHeight: 0, textAlign: 'left' }}>
          <LiveTerminalSimulation
            phases={createJobPhases}
            activePhase={
              currentSegmentIndex === 0 ? 4 :
              currentSegmentIndex === 1 ? 6 :
              currentSegmentIndex >= 2 ? 6 :
              0
            }
          />
        </div>

        <Reveal from={2} animation={fadeUp}>
          <Callout variant="info" style={{ color: theme.colors.textPrimary }}>
            <strong>Template to running job</strong> &mdash; the agent handles template lookup,
            version selection, and configuration. You just describe what to evaluate.
          </Callout>
        </Reveal>
      </div>
    </SlideContainer>
  );
};

export const Ch2_S1_CreateJob = defineSlide({
  metadata: {
    chapter: 2,
    slide: 1,
    title: 'Create a Job',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ],
  },
  component: CreateJobComponent,
});

// ─── Ch2_S2: Analyze Results ────────────────────────────────────────

const PHASE_MAP_SCORECARD: Record<number, number> = {
  0: 0,  // skeleton
  1: 1,  // data populated
  2: 2,  // tradeoff highlight
  3: 2,  // keep tradeoff, show callout
};

const AnalyzeResultsComponent: React.FC = () => {
  const theme = useTheme();
  const { currentSegmentIndex } = useSegmentedAnimation();
  const phase = PHASE_MAP_SCORECARD[currentSegmentIndex] ?? 0;

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
            Analyze Results
          </h2>
          <ToolsUsed theme={theme} tools={['get_job_metrics']} />
        </Reveal>

        <div style={{ flex: 1, minHeight: 0 }}>
          <ScorecardTable activePhase={phase} />
        </div>

        {/* Tradeoff explanation cards */}
        <Reveal from={2} animation={fadeUp}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: 'rgba(34, 197, 94, 0.06)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>
                {'\u2191'} Quality Up
              </div>
              <div style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                SbSLeov3 +2.10 (p=0.03)
              </div>
            </div>
            <div style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>
                {'\u2193'} Grounding Down
              </div>
              <div style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                GroundLeo -1.50 (p=0.04)
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal from={3} animation={fadeUp}>
          <Callout variant="info" style={{ color: theme.colors.textPrimary }}>
            <strong>Scorecard to actionable insight</strong> &mdash; the agent reads the metrics,
            spots the quality-vs-grounding tradeoff, and explains it.
          </Callout>
        </Reveal>
      </div>
    </SlideContainer>
  );
};

export const Ch2_S2_AnalyzeResults = defineSlide({
  metadata: {
    chapter: 2,
    slide: 2,
    title: 'Analyze Results',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ],
  },
  component: AnalyzeResultsComponent,
});

// ─── Ch2_S3: Diagnose Utterances ────────────────────────────────────

const diagnosePhases = [
  {
    type: 'user' as const,
    text: 'Which utterances regressed on GroundLeo in job 381294?',
  },
  {
    type: 'input' as const,
    text: 'query_utterance_metrics(jobId=381294, metricKeys=["groundedness_score"])',
    prefix: '[Tool]',
  },
  {
    type: 'output' as const,
    text: '14 utterances regressed. Worst: delta -0.42',
    prefix: '[Result]',
    color: '#60a5fa',
  },
  {
    type: 'output' as const,
    text: '#1: "What files were shared in yesterday\u2019s meeting?" \u2014 delta: -0.42',
    prefix: '',
    color: '#fbbf24',
  },
  {
    type: 'output' as const,
    text: '#2: "Summarize the Q3 budget review" \u2014 delta: -0.31',
    prefix: '',
    color: '#fbbf24',
  },
  {
    type: 'input' as const,
    text: 'query_utterance_detail(jobId=381294, queryHash="a3f1c2d...")',
    prefix: '[Tool]',
  },
  {
    type: 'output' as const,
    text: 'Control: 0.89 \u2192 Experiment: 0.47 | GroundLeo delta: -0.42',
    prefix: '[Result]',
    color: '#60a5fa',
  },
  {
    type: 'input' as const,
    text: 'query_utterance_conversation(jobId=381294, queryHash="a3f1c2d...")',
    prefix: '[Tool]',
  },
  {
    type: 'output' as const,
    text: 'DevUI SBS: https://devui.microsoft.com/sbs/debug/...',
    prefix: '[Link]',
    color: '#34d399',
  },
];

const DiagnoseUtterancesComponent: React.FC = () => {
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
            Diagnose Utterances
          </h2>
          <ToolsUsed theme={theme} tools={['query_utterance_metrics', 'query_utterance_detail', 'query_utterance_conversation']} />
        </Reveal>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, textAlign: 'left' }}>
          <LiveTerminalSimulation
            phases={diagnosePhases}
            activePhase={
              currentSegmentIndex === 0 ? 4 :
              currentSegmentIndex === 1 ? 6 :
              currentSegmentIndex === 2 ? 8 :
              currentSegmentIndex >= 3 ? 8 :
              0
            }
          />

          {/* Utterance drilldown card */}
          <UtteranceDrilldown visible={currentSegmentIndex >= 2} />
        </div>

        <Reveal from={3} animation={fadeUp}>
          <Callout variant="info" style={{ color: theme.colors.textPrimary }}>
            <strong>From scorecard to root cause</strong> &mdash; the agent finds the worst utterance,
            surfaces the detail, and gives you the tools to act on it.
          </Callout>
        </Reveal>
      </div>
    </SlideContainer>
  );
};

export const Ch2_S3_DiagnoseUtterances = defineSlide({
  metadata: {
    chapter: 2,
    slide: 3,
    title: 'Diagnose Utterances',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ],
  },
  component: DiagnoseUtterancesComponent,
});

// ─── Ch2_S4: Download and Manage ────────────────────────────────────

const LIFECYCLE_SECTIONS = [
  {
    title: 'Download',
    items: [
      { cmd: 'get_job_output', desc: 'List available output files' },
      { cmd: 'download_job_file', desc: 'Download with auto blob backend detection' },
    ],
  },
  {
    title: 'Lifecycle',
    items: [
      { cmd: 'rerun_job', desc: 'Retry with the same configuration' },
      { cmd: 'cancel_job', desc: 'Stop a stuck or in-progress run' },
      { cmd: 'rename_job', desc: 'Label experiments for tracking' },
    ],
  },
  {
    title: 'Full Access',
    items: [
      { cmd: 'list_jobs', desc: 'Browse recent jobs with filtering' },
      { cmd: 'get_job', desc: 'Get full job details and config' },
    ],
  },
];

const DownloadAndManageComponent: React.FC = () => {
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
            Download and Manage
          </h2>
        </Reveal>

        {LIFECYCLE_SECTIONS.map((section, sectionIndex) => (
          <Reveal key={section.title} from={sectionIndex} animation={fadeUp}>
            <ContentCard style={{ padding: '1rem 1.5rem' }}>
              <div style={{
                fontWeight: 600,
                color: theme.colors.primary,
                fontSize: 16,
                marginBottom: 8,
              }}>
                {section.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {section.items.map((item) => (
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
                        fontFamily: "'Cascadia Code', 'Fira Code', monospace",
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

export const Ch2_S4_DownloadAndManage = defineSlide({
  metadata: {
    chapter: 2,
    slide: 4,
    title: 'Download and Manage',
    audioSegments: [
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ],
  },
  component: DownloadAndManageComponent,
});
