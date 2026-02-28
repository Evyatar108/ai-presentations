import React, { useMemo } from 'react';
import { useReducedMotion } from '@framework';

interface TelemetryWallProps {
  speed?: number;
  rowCount?: number;
  paused?: boolean;
}

interface TelemetryRow {
  index: number;
  name: string;
  detail?: string;
  status?: 'Fail' | 'Cancelled' | 'Unknown';
}

/** Telemetry entries modelled after real DevUI output. Status is inline per entry. */
const ENTRIES: { name: string; detail?: string; status?: TelemetryRow['status'] }[] = [
  { name: 'SubstrateSearchInitRequest' },
  { name: '3SClientDecorator.GetQueryString' },
  { name: 'SubstrateFlights' },
  { name: '3SClientDecorator.WrapHttpContentAsync' },
  { name: 'SubstrateSearchServiceWithAutoDecompression', detail: 'https://substrate.office.com/searchservice/api/v2/init', status: 'Fail' },
  { name: '3SClientDecorator.AddHeadersAsync' },
  { name: 'SubstrateSearchServiceWithAutoDecompression_GenerateAuthToken' },
  { name: 'AadMsAuthProvider', detail: 'CreateMSAuthPopHeader' },
  { name: 'GetAgentInfo', status: 'Fail' },
  { name: 'TryGetAgentInfoFromRequestContext', status: 'Fail' },
  { name: 'ServiceClient.SendHttpRequest', detail: 'SubstrateSearchServiceWithAutoDecompression', status: 'Cancelled' },
  { name: 'EntityServeServiceAttempt', detail: 'SkillDiscovery_Search_Sydney https://substrate.office.com/entityserve/api/prime', status: 'Fail' },
  { name: 'ServiceClient.ReadHttpResponseStream', detail: 'EntityServeService', status: 'Cancelled' },
  { name: 'ChatHub', detail: 'Chat', status: 'Unknown' },
  { name: 'MessageStream', detail: 'InternalSearchResult' },
  { name: 'DeepLeo.Reasoning', detail: 'Iteration 1' },
  { name: 'DeepLeo.Responding', detail: 'StreamChunks=14' },
  { name: 'ChatHub.ProcessRequest' },
  { name: 'ConnectionToChatReq', detail: 'SignalR' },
  { name: 'TuringBotOrchestrator.Execute' },
  { name: 'PluginExecutionHost.RunAsync' },
  { name: 'NluDirectResponse', detail: 'IntentClassification' },
  { name: 'ContentProviderFactory.CreateProvider' },
  { name: 'RuntimeConfigProvider.GetFlights' },
  { name: 'WorkGroundingEngine.Ground' },
  { name: 'EntityServeServiceAttempt', detail: 'SkillDiscovery_Search_Sydney https://substrate.office.com/entityserve/api/prime', status: 'Fail' },
  { name: 'ServiceClient.ReadHttpResponseStream', detail: 'EntityServeService', status: 'Cancelled' },
  { name: 'AgentRuntimeService.InvokeAsync' },
  { name: 'TelemetryFlushService.Flush' },
  { name: 'SafetyClassifier.Evaluate' },
  { name: 'TokenBudgetManager.Allocate' },
  { name: 'ContextWindowBuilder.Build' },
  { name: 'ResponseFormatter.Format' },
  { name: 'SearchResultsAggregator.Merge' },
  { name: 'AnswerGeneratorService.Generate' },
  { name: 'DeepLeo.Reasoning', detail: 'Iteration 2' },
  { name: 'DeepLeo.Responding', detail: 'StreamChunks=8' },
  { name: 'PromptConstructor.BuildSystemMessage' },
  { name: 'GroundingQueryRewriter.Rewrite' },
  { name: 'SubstrateSearchServiceWithAutoDecompression', detail: 'https://substrate.office.com/searchservice/api/v2/query', status: 'Fail' },
  { name: 'SevalScoreProvider.GetScores' },
  { name: 'FlightEvaluator.CheckActive', detail: 'prg-s-rr3-catsv2' },
  { name: 'MessageStream', detail: 'FinalSearchResult' },
  { name: 'ServiceClient.SendHttpRequest', detail: 'TuringBotOrchestrator' },
  { name: 'ChatHub', detail: 'Disconnect', status: 'Unknown' },
  { name: 'PluginExecutionHost.RunAsync', detail: 'CodeInterpreter' },
  { name: 'NluDirectResponse', detail: 'EntityExtraction' },
  { name: 'ContentProviderFactory.CreateProvider', detail: 'WebSearch' },
  { name: 'RuntimeConfigProvider.GetFlights', detail: 'Refresh' },
  { name: 'WorkGroundingEngine.Ground', detail: 'Pass2' },
];

function generateRows(count: number): TelemetryRow[] {
  return ENTRIES.slice(0, count).map((entry, i) => ({
    index: i,
    name: entry.name,
    detail: entry.detail,
    status: entry.status,
  }));
}

const keyframesName = 'telemetry-scroll';
const keyframesCSS = `
@keyframes ${keyframesName} {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
`;

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  Fail: {
    background: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: 4,
    padding: '1px 8px',
    fontSize: 11,
    fontWeight: 600,
  },
  Cancelled: {
    background: '#fff7ed',
    color: '#ea580c',
    border: '1px solid #fdba74',
    borderRadius: 4,
    padding: '1px 8px',
    fontSize: 11,
    fontWeight: 600,
  },
  Unknown: {
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: 4,
    padding: '1px 8px',
    fontSize: 11,
    fontWeight: 600,
  },
};

export const TelemetryWall: React.FC<TelemetryWallProps> = ({
  speed = 20,
  rowCount = 40,
  paused = false,
}) => {
  const { reduced } = useReducedMotion();
  const rows = useMemo(() => generateRows(rowCount), [rowCount]);
  const displayRows = useMemo(() => [...rows, ...rows], [rows]);

  const shouldAnimate = !reduced && !paused;

  const bgColor = '#ffffff';
  const altBgColor = '#f0f7ff';
  const borderColor = '#e2e8f0';

  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        overflow: 'hidden',
        height: 360,
        position: 'relative',
        fontFamily: "'Segoe UI', -apple-system, sans-serif",
        fontSize: 13,
        lineHeight: '32px',
      }}
    >
      {!reduced && <style>{keyframesCSS}</style>}
      <div
        style={{
          animation: shouldAnimate ? `${keyframesName} ${speed}s linear infinite` : 'none',
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {(reduced ? rows : displayRows).map((row, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              background: i % 2 === 0 ? altBgColor : bgColor,
              borderBottom: `1px solid ${borderColor}`,
              whiteSpace: 'nowrap',
              gap: 8,
            }}
          >
            {/* Chevron */}
            <span style={{ color: '#94a3b8', fontSize: 10, flexShrink: 0, width: 14, textAlign: 'center' }}>
              ›
            </span>
            {/* Service name */}
            <span style={{ color: '#1e293b', fontWeight: 500, flexShrink: 0 }}>
              {row.name}
            </span>
            {/* Detail text */}
            {row.detail && (
              <span style={{ color: '#94a3b8', fontSize: 12 }}>
                {row.detail}
              </span>
            )}
            {/* Spacer */}
            <span style={{ flex: 1 }} />
            {/* Status badge */}
            {row.status && (
              <span style={STATUS_STYLES[row.status]}>
                {row.status}
              </span>
            )}
          </div>
        ))}
      </div>
      {/* Top/bottom gradient fade */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 40,
          background: `linear-gradient(to bottom, ${bgColor}, transparent)`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 40,
          background: `linear-gradient(to top, ${bgColor}, transparent)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
