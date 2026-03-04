import React from 'react';
import { motion } from 'framer-motion';
import { useTheme, useReducedMotion } from '@framework';

interface ScorecardTableProps {
  activePhase: number; // 0=skeleton, 1=data, 2=tradeoff highlight
}

interface MetricData {
  name: string;
  control: number;
  experiment: number;
  delta: string;
  pValue: number;
  direction: 'up' | 'down' | 'neutral';
  key?: 'quality' | 'grounding';
}

const METRICS: MetricData[] = [
  { name: 'SbSLeov3', control: 0, experiment: 2.1, delta: '+2.10', pValue: 0.03, direction: 'up', key: 'quality' },
  { name: 'GroundLeo', control: 82.4, experiment: 80.9, delta: '-1.50', pValue: 0.04, direction: 'down', key: 'grounding' },
  { name: 'WholePage', control: 71.2, experiment: 72.8, delta: '+1.60', pValue: 0.12, direction: 'neutral' },
  { name: 'CitationLeo', control: 0.84, experiment: 0.86, delta: '+0.02', pValue: 0.21, direction: 'neutral' },
  { name: 'RuleLeo', control: 0.91, experiment: 0.90, delta: '-0.01', pValue: 0.48, direction: 'neutral' },
  { name: 'Latency P95', control: 3200, experiment: 3150, delta: '-50ms', pValue: 0.35, direction: 'neutral' },
];

const HEADER_COLS = ['Metric', 'Control', 'Experiment', 'Delta', 'P-value'];

const SkeletonRow: React.FC<{ index: number }> = ({ index }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '130px 90px 90px 80px 80px',
      gap: 8,
      padding: '10px 16px',
      background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
    }}
  >
    {[130, 60, 60, 50, 50].map((w, i) => (
      <div
        key={i}
        style={{
          height: 14,
          borderRadius: 4,
          background: 'rgba(148,163,184,0.12)',
          width: w,
          marginLeft: i > 0 ? 'auto' : 0,
        }}
      />
    ))}
  </div>
);

export const ScorecardTable: React.FC<ScorecardTableProps> = ({ activePhase }) => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const showData = activePhase >= 1;
  const showTradeoff = activePhase >= 2;

  const getRowHighlight = (metric: MetricData): React.CSSProperties => {
    if (!showTradeoff) return {};
    if (metric.key === 'quality') {
      return {
        background: 'rgba(34, 197, 94, 0.08)',
        borderLeft: '3px solid #22c55e',
      };
    }
    if (metric.key === 'grounding') {
      return {
        background: 'rgba(239, 68, 68, 0.08)',
        borderLeft: '3px solid #ef4444',
      };
    }
    return { opacity: 0.45 };
  };

  const getDeltaColor = (metric: MetricData): string => {
    if (metric.direction === 'up') return '#22c55e';
    if (metric.direction === 'down') return '#ef4444';
    return theme.colors.textSecondary;
  };

  const getPBadge = (p: number): React.CSSProperties => {
    if (p <= 0.05) {
      return {
        background: 'rgba(251, 191, 36, 0.15)',
        color: '#fbbf24',
        padding: '1px 6px',
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 600,
      };
    }
    return { color: theme.colors.textSecondary, fontSize: 12 };
  };

  return (
    <div
      style={{
        background: theme.colors.bgSurface,
        border: `1px solid ${theme.colors.bgBorder}`,
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '130px 90px 90px 80px 80px',
          gap: 8,
          padding: '10px 16px',
          background: 'rgba(255,255,255,0.03)',
          borderBottom: `1px solid ${theme.colors.bgBorder}`,
        }}
      >
        {HEADER_COLS.map((col, i) => (
          <span
            key={col}
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: theme.colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              textAlign: i > 0 ? 'right' : 'left',
            }}
          >
            {col}
          </span>
        ))}
      </div>

      {/* Rows */}
      {!showData
        ? METRICS.map((_, i) => <SkeletonRow key={i} index={i} />)
        : METRICS.map((metric, i) => (
            <motion.div
              key={metric.name}
              initial={reduced ? undefined : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={reduced ? undefined : { delay: i * 0.08, duration: 0.3 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '130px 90px 90px 80px 80px',
                gap: 8,
                padding: '10px 16px',
                transition: 'background 0.4s, opacity 0.4s, border-left 0.4s',
                ...getRowHighlight(metric),
              }}
            >
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: theme.colors.textPrimary,
                fontFamily: "'Cascadia Code', 'Fira Code', monospace",
              }}>
                {metric.name}
              </span>
              <span style={{ textAlign: 'right', fontSize: 13, color: theme.colors.textSecondary }}>
                {metric.control}
              </span>
              <span style={{ textAlign: 'right', fontSize: 13, color: theme.colors.textSecondary }}>
                {metric.experiment}
              </span>
              <span style={{
                textAlign: 'right',
                fontSize: 13,
                fontWeight: 700,
                color: getDeltaColor(metric),
              }}>
                {metric.delta}
              </span>
              <span style={{ textAlign: 'right', ...getPBadge(metric.pValue) }}>
                {metric.pValue}
              </span>
            </motion.div>
          ))}
    </div>
  );
};
