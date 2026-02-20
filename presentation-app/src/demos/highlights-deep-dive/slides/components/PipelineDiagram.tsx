import React from 'react';
import { motion } from 'framer-motion';
import { useTheme, useReducedMotion, ArrowDown } from '@framework';

interface PipelineDiagramProps {
  visibleSteps: number;
  steps?: { name: string; purpose: string }[];
}

const DEFAULT_STEPS = [
  { name: 'highlights_abstractives', purpose: 'Identify topics, write narration' },
  { name: 'highlights_extractives', purpose: 'Select clips from pre-enumerated candidates' },
  { name: 'highlights_extractive_ranking', purpose: 'Rank clips by quality' },
  { name: 'highlights_final', purpose: 'Merge into unified narrative' }
];

const PipelineDiagram: React.FC<PipelineDiagramProps> = ({
  visibleSteps,
  steps = DEFAULT_STEPS
}) => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0,
      width: '100%',
      maxWidth: 500,
      margin: '0 auto'
    }}>
      {steps.map((step, i) => {
        const isVisible = i < visibleSteps;
        const isActive = i === visibleSteps - 1;
        const isPast = i < visibleSteps - 1;

        return (
          <React.Fragment key={i}>
            <motion.div
              initial={{ opacity: 0, scale: reduced ? 1 : 0.9 }}
              animate={{
                opacity: isVisible ? (isPast ? 0.5 : 1) : 0,
                scale: isVisible ? 1 : (reduced ? 1 : 0.9)
              }}
              transition={{ duration: reduced ? 0.2 : 0.5, delay: reduced ? 0 : i * 0.15 }}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                borderRadius: 12,
                background: isActive
                  ? `linear-gradient(135deg, rgba(0, 183, 195, 0.15), rgba(0, 120, 212, 0.15))`
                  : theme.colors.bgSurface,
                border: isActive
                  ? `2px solid ${theme.colors.primary}`
                  : `1px solid ${theme.colors.bgBorder}`,
                boxShadow: isActive && !reduced
                  ? `0 0 20px rgba(0, 183, 195, 0.2)`
                  : 'none',
                textAlign: 'left'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: isActive
                    ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                    : theme.colors.bgBorder,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#fff',
                  flexShrink: 0
                }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontSize: 14,
                    color: isActive ? theme.colors.primary : theme.colors.textPrimary,
                    fontWeight: 600
                  }}>
                    {step.name}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    marginTop: 2
                  }}>
                    {step.purpose}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Arrow between steps */}
            {i < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible && i < visibleSteps - 1 ? 0.5 : 0 }}
                transition={{ duration: 0.3, delay: reduced ? 0 : (i + 1) * 0.15 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '4px 0',
                  color: theme.colors.textMuted
                }}
              >
                <ArrowDown />
                <span style={{ fontSize: 10, marginTop: 2, color: theme.colors.textMuted }}>
                  markdown table
                </span>
              </motion.div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default PipelineDiagram;
