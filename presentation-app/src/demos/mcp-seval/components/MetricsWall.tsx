import React, { useMemo } from 'react';
import { useReducedMotion } from '@framework';

interface MetricsWallProps {
  speed?: number;
  rowCount?: number;
  paused?: boolean;
}

interface MetricRow {
  metric: string;
  control: string;
  experiment: string;
  delta: string;
  pValue: string;
  direction: 'up' | 'down' | 'neutral';
}

const ENTRIES: MetricRow[] = [
  { metric: 'SbSLeov3', control: '0.00', experiment: '+2.10', delta: '+2.10', pValue: '0.03', direction: 'up' },
  { metric: 'GroundLeo', control: '82.4', experiment: '80.9', delta: '-1.50', pValue: '0.04', direction: 'down' },
  { metric: 'WholePage', control: '71.2', experiment: '72.8', delta: '+1.60', pValue: '0.12', direction: 'neutral' },
  { metric: 'CitationLeo', control: '0.84', experiment: '0.86', delta: '+0.02', pValue: '0.21', direction: 'neutral' },
  { metric: 'RuleLeo', control: '0.91', experiment: '0.90', delta: '-0.01', pValue: '0.48', direction: 'neutral' },
  { metric: 'Latency P95', control: '3200', experiment: '3150', delta: '-50', pValue: '0.35', direction: 'neutral' },
  { metric: 'ChecklistLeo', control: '0.88', experiment: '0.87', delta: '-0.01', pValue: '0.55', direction: 'neutral' },
  { metric: 'GuardLeo', control: '0.95', experiment: '0.94', delta: '-0.01', pValue: '0.62', direction: 'neutral' },
  { metric: 'PiLeo', control: '0.72', experiment: '0.74', delta: '+0.02', pValue: '0.18', direction: 'neutral' },
  { metric: 'ReasoningLeo', control: '0.81', experiment: '0.83', delta: '+0.02', pValue: '0.24', direction: 'neutral' },
  { metric: 'RAI Safety', control: '0.99', experiment: '0.99', delta: '0.00', pValue: '0.91', direction: 'neutral' },
  { metric: 'NDCG@10', control: '0.67', experiment: '0.69', delta: '+0.02', pValue: '0.31', direction: 'neutral' },
  { metric: 'Reliability', control: '99.2', experiment: '99.1', delta: '-0.10', pValue: '0.72', direction: 'neutral' },
  { metric: 'CacheHitRate', control: '0.34', experiment: '0.36', delta: '+0.02', pValue: '0.44', direction: 'neutral' },
  { metric: 'LLM Cost', control: '0.082', experiment: '0.079', delta: '-0.003', pValue: '0.38', direction: 'neutral' },
];

function generateRows(count: number): MetricRow[] {
  const rows: MetricRow[] = [];
  for (let i = 0; i < count; i++) {
    rows.push(ENTRIES[i % ENTRIES.length]);
  }
  return rows;
}

const keyframesName = 'metrics-scroll';
const keyframesCSS = `
@keyframes ${keyframesName} {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
`;

const DELTA_COLORS: Record<string, string> = {
  up: '#16a34a',
  down: '#dc2626',
  neutral: '#475569',
};

export const MetricsWall: React.FC<MetricsWallProps> = ({
  speed = 20,
  rowCount = 30,
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
        fontSize: 12,
        lineHeight: '30px',
      }}
    >
      {!reduced && <style>{keyframesCSS}</style>}
      {/* Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '120px 70px 70px 70px 60px',
          gap: 4,
          padding: '0 12px',
          background: '#f8fafc',
          borderBottom: `2px solid ${borderColor}`,
          fontSize: 10,
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          lineHeight: '28px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span>Metric</span>
        <span style={{ textAlign: 'right' }}>Control</span>
        <span style={{ textAlign: 'right' }}>Experiment</span>
        <span style={{ textAlign: 'right' }}>Delta</span>
        <span style={{ textAlign: 'right' }}>P-value</span>
      </div>
      <div
        style={{
          height: 332,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
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
                display: 'grid',
                gridTemplateColumns: '120px 70px 70px 70px 60px',
                gap: 4,
                padding: '0 12px',
                background: i % 2 === 0 ? altBgColor : bgColor,
                borderBottom: `1px solid ${borderColor}`,
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: '#1e293b', fontWeight: 500 }}>{row.metric}</span>
              <span style={{ textAlign: 'right', color: '#475569' }}>{row.control}</span>
              <span style={{ textAlign: 'right', color: '#475569' }}>{row.experiment}</span>
              <span style={{ textAlign: 'right', color: DELTA_COLORS[row.direction], fontWeight: 600 }}>
                {row.delta}
              </span>
              <span style={{ textAlign: 'right', color: '#94a3b8' }}>{row.pValue}</span>
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
            height: 30,
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
            height: 30,
            background: `linear-gradient(to top, ${bgColor}, transparent)`,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};
