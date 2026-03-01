import React from 'react';
import { motion } from 'framer-motion';
import { useTheme, useReducedMotion } from '@framework';

interface WorkspaceBridgeDiagramProps {
  activePhase: number;
}

const diagnosticLines = [
  { prefix: 'Flag', text: 'SubstrateSearch returned 0 results', color: '#fbbf24' },
  { prefix: 'Flag', text: 'Reasoning operated on empty context', color: '#fbbf24' },
  { prefix: 'Summary', text: 'Grounding failure identified', color: '#34d399' },
];

const fileTree = [
  { name: 'src/orchestrator/', indent: 0, highlight: false },
  { name: 'GroundingEngine.cs', indent: 1, highlight: true },
  { name: 'SearchProvider.cs', indent: 1, highlight: false },
  { name: 'ReasoningPipeline.cs', indent: 1, highlight: false },
];

const codeSnippet = `public async Task<GroundingResult> ExecuteAsync(
    SearchContext ctx)
{
    var results = await _search.QueryAsync(ctx);
    if (results.Count == 0)       // ← bug
        return GroundingResult.Empty;
}`;

/**
 * Three-column diagram showing DevUI diagnostics + AI Agent + source code workspace.
 * Phases: 0=left only, 1=both panels, 2=arrows animate, 3=full glow
 */
export const WorkspaceBridgeDiagram: React.FC<WorkspaceBridgeDiagramProps> = ({ activePhase }) => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const showRight = activePhase >= 1;
  const showArrows = activePhase >= 2;
  const fullGlow = activePhase >= 3;

  const panelBase: React.CSSProperties = {
    flex: 1,
    borderRadius: 12,
    padding: '16px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minWidth: 0,
  };

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, width: '100%' }}>
      {/* Left panel — DevUI Debugging */}
      <motion.div
        initial={reduced ? undefined : { opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
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
          DevUI Debugging
        </div>
        {diagnosticLines.map((line, i) => (
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
              minWidth: 62,
            }}>
              [{line.prefix}]
            </span>
            <span style={{ color: theme.colors.textSecondary }}>
              {line.text}
            </span>
          </div>
        ))}
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
        {/* Left arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showArrows ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            color: '#60a5fa',
            fontSize: 18,
          }}
        >
          <span>{'◀'}</span>
          <span style={{ width: 28, height: 2, background: '#60a5fa', borderRadius: 1 }} />
          <span style={{ width: 28, height: 2, background: '#34d399', borderRadius: 1 }} />
          <span style={{ color: '#34d399' }}>{'▶'}</span>
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

        {/* Repeat arrows below */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showArrows ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            color: '#60a5fa',
            fontSize: 18,
          }}
        >
          <span>{'◀'}</span>
          <span style={{ width: 28, height: 2, background: '#60a5fa', borderRadius: 1 }} />
          <span style={{ width: 28, height: 2, background: '#34d399', borderRadius: 1 }} />
          <span style={{ color: '#34d399' }}>{'▶'}</span>
        </motion.div>
      </div>

      {/* Right panel — Sydney Source Code */}
      <motion.div
        initial={reduced ? { opacity: showRight ? 1 : 0 } : { opacity: 0, x: 20 }}
        animate={{ opacity: showRight ? 1 : 0.15, x: showRight ? 0 : 20 }}
        transition={{ duration: 0.5 }}
        style={{
          ...panelBase,
          textAlign: 'left',
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
          Sydney Source Code
        </div>

        {/* Mini file tree */}
        <div style={{
          fontFamily: "'Cascadia Code', 'Fira Code', monospace",
          fontSize: 11.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          {fileTree.map((f, i) => (
            <div key={i} style={{
              paddingLeft: f.indent * 16,
              color: f.highlight ? '#4ade80' : theme.colors.textSecondary,
              fontWeight: f.highlight ? 600 : 400,
              background: f.highlight ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
              borderRadius: 3,
              padding: `1px 4px 1px ${f.indent * 16 + 4}px`,
            }}>
              {f.indent > 0 ? '├─ ' : ''}{f.name}
            </div>
          ))}
        </div>

        {/* Code snippet */}
        <div style={{
          fontFamily: "'Cascadia Code', 'Fira Code', monospace",
          fontSize: 10.5,
          lineHeight: 1.5,
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 6,
          padding: '8px 10px',
          color: theme.colors.textSecondary,
          whiteSpace: 'pre',
          overflow: 'hidden',
          marginTop: 4,
        }}>
          {codeSnippet}
        </div>
      </motion.div>
    </div>
  );
};
