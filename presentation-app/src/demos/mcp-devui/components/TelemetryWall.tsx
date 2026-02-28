import React, { useMemo } from 'react';
import { useReducedMotion } from '@framework';

interface TelemetryWallProps {
  speed?: number;
  rowCount?: number;
  paused?: boolean;
}

interface TelemetryRow {
  index: number;
  service: string;
  latency: number;
  status: 'OK' | 'WARN' | 'ERR';
}

const SERVICE_NAMES = [
  'SubstrateSearchService',
  'DeepLeoService',
  'ContentProviderFactory',
  'RuntimeConfigProvider',
  'WorkGroundingEngine',
  'AgentRuntimeService',
  'NluDirectResponse',
  'TelemetryFlushService',
  'ChatHub.ProcessRequest',
  'ConnectionToChatReq',
  'DeepLeo-Reasoning',
  'DeepLeo-Responding',
  'TuringBotOrchestrator',
  'PluginExecutionHost',
  'SearchResultsAggregator',
  'AnswerGeneratorService',
  'ContextWindowBuilder',
  'TokenBudgetManager',
  'SafetyClassifier',
  'ResponseFormatter',
];

const STATUS_COLORS: Record<string, string> = {
  OK: '#34d399',
  WARN: '#fbbf24',
  ERR: '#f87171',
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function generateRows(count: number): TelemetryRow[] {
  const rows: TelemetryRow[] = [];
  for (let i = 0; i < count; i++) {
    const service = SERVICE_NAMES[Math.floor(seededRandom(i + 100) * SERVICE_NAMES.length)];
    const latency = Math.floor(seededRandom(i + 200) * 2800) + 12;
    const statusRoll = seededRandom(i + 300);
    const status: TelemetryRow['status'] = statusRoll > 0.92 ? 'ERR' : statusRoll > 0.8 ? 'WARN' : 'OK';
    rows.push({ index: i, service, latency, status });
  }
  return rows;
}

const keyframesName = 'telemetry-scroll';
const keyframesCSS = `
@keyframes ${keyframesName} {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
`;

export const TelemetryWall: React.FC<TelemetryWallProps> = ({
  speed = 20,
  rowCount = 40,
  paused = false,
}) => {
  const { reduced } = useReducedMotion();
  const rows = useMemo(() => generateRows(rowCount), [rowCount]);
  // Duplicate rows for seamless loop
  const displayRows = useMemo(() => [...rows, ...rows], [rows]);

  const shouldAnimate = !reduced && !paused;

  return (
    <div
      style={{
        background: '#0a0e17',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        overflow: 'hidden',
        height: 360,
        position: 'relative',
        fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
        fontSize: 12,
        lineHeight: '22px',
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
              gap: 12,
              padding: '0 12px',
              background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.25)', minWidth: 32, textAlign: 'right' }}>
              [{String(row.index).padStart(3, '0')}]
            </span>
            <span style={{ color: 'rgba(148,163,184,0.9)', minWidth: 220 }}>
              {row.service}
            </span>
            <span style={{ color: 'rgba(148,163,184,0.6)', minWidth: 60, textAlign: 'right' }}>
              {row.latency}ms
            </span>
            <span style={{ color: STATUS_COLORS[row.status], fontWeight: 600 }}>
              {row.status}
            </span>
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
          background: 'linear-gradient(to bottom, #0a0e17, transparent)',
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
          background: 'linear-gradient(to top, #0a0e17, transparent)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
