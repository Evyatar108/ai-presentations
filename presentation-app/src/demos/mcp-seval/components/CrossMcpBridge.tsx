import React from 'react';
import { motion } from 'framer-motion';
import { useTheme, useReducedMotion } from '@framework';

interface CrossMcpBridgeProps {
  activePhase: number; // 0=left only, 1=both panels+arrows, 2=full glow
}

const sevalLines = [
  { prefix: 'Metric', text: 'GroundLeo: -0.42 (p=0.04)', color: '#ef4444' },
  { prefix: 'Worst', text: '"What files were shared..."', color: '#fbbf24' },
  { prefix: 'Link', text: 'conversation ID extracted', color: '#34d399' },
];

const devuiLines = [
  { prefix: 'Tool', text: 'load_conversation(...)', color: '#60a5fa' },
  { prefix: 'Tool', text: 'get_symptom_report()', color: '#60a5fa' },
  { prefix: 'Result', text: 'Grounding failure in SubstrateSearch', color: '#34d399' },
];

export const CrossMcpBridge: React.FC<CrossMcpBridgeProps> = ({ activePhase }) => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const showRight = activePhase >= 1;
  const showArrows = activePhase >= 1;
  const fullGlow = activePhase >= 2;

  const panelBase: React.CSSProperties = {
    flex: 1,
    borderRadius: 12,
    padding: '16px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minWidth: 0,
  };

  const renderLines = (lines: typeof sevalLines) =>
    lines.map((line, i) => (
      <div
        key={i}
        style={{
          fontFamily: "'Cascadia Code', 'Fira Code', monospace",
          fontSize: 12,
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
          lineHeight: 1.4,
        }}
      >
        <span style={{
          color: line.color,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          minWidth: 52,
        }}>
          [{line.prefix}]
        </span>
        <span style={{ color: theme.colors.textSecondary }}>
          {line.text}
        </span>
      </div>
    ));

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, width: '100%' }}>
      {/* Left panel — SEVAL MCP */}
      <motion.div
        initial={reduced ? undefined : { opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          ...panelBase,
          background: 'rgba(34, 197, 94, 0.06)',
          border: `1.5px solid ${fullGlow ? '#22c55e' : 'rgba(34, 197, 94, 0.3)'}`,
          boxShadow: fullGlow ? '0 0 20px rgba(34, 197, 94, 0.15)' : 'none',
          transition: 'border-color 0.6s, box-shadow 0.6s',
        }}
      >
        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#4ade80',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 4,
        }}>
          SEVAL MCP
        </div>
        {renderLines(sevalLines)}
      </motion.div>

      {/* Center — AI Agent hub + arrows */}
      <div style={{
        width: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        flexShrink: 0,
      }}>
        {/* Top arrows */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showArrows ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            fontSize: 18,
          }}
        >
          <span style={{ color: '#4ade80' }}>{'\u25C0'}</span>
          <span style={{ width: 28, height: 2, background: '#4ade80', borderRadius: 1 }} />
          <span style={{ width: 28, height: 2, background: '#60a5fa', borderRadius: 1 }} />
          <span style={{ color: '#60a5fa' }}>{'\u25B6'}</span>
        </motion.div>

        {/* Agent circle */}
        <motion.div
          animate={fullGlow && !reduced ? {
            boxShadow: [
              '0 0 12px rgba(139, 92, 246, 0.3)',
              '0 0 24px rgba(139, 92, 246, 0.5)',
              '0 0 12px rgba(139, 92, 246, 0.3)',
            ],
          } : {
            boxShadow: '0 0 12px rgba(139, 92, 246, 0.3)',
          }}
          transition={fullGlow && !reduced ? { duration: 2, repeat: Infinity } : undefined}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))',
            border: '2px solid rgba(139, 92, 246, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: '#a78bfa',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          AI<br />Agent
        </motion.div>

        {/* Bottom arrows */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showArrows ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            fontSize: 18,
          }}
        >
          <span style={{ color: '#4ade80' }}>{'\u25C0'}</span>
          <span style={{ width: 28, height: 2, background: '#4ade80', borderRadius: 1 }} />
          <span style={{ width: 28, height: 2, background: '#60a5fa', borderRadius: 1 }} />
          <span style={{ color: '#60a5fa' }}>{'\u25B6'}</span>
        </motion.div>
      </div>

      {/* Right panel — DevUI MCP */}
      <motion.div
        initial={reduced ? { opacity: showRight ? 1 : 0 } : { opacity: 0, x: 20 }}
        animate={{ opacity: showRight ? 1 : 0.15, x: showRight ? 0 : 20 }}
        transition={{ duration: 0.5 }}
        style={{
          ...panelBase,
          background: 'rgba(59, 130, 246, 0.06)',
          border: `1.5px solid ${fullGlow ? '#3b82f6' : 'rgba(59, 130, 246, 0.3)'}`,
          boxShadow: fullGlow ? '0 0 20px rgba(59, 130, 246, 0.15)' : 'none',
          transition: 'border-color 0.6s, box-shadow 0.6s',
        }}
      >
        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#60a5fa',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 4,
        }}>
          DevUI MCP
        </div>
        {renderLines(devuiLines)}
      </motion.div>
    </div>
  );
};
