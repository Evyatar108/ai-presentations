import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, useReducedMotion } from '@framework';

interface UtteranceDrilldownProps {
  visible: boolean;
  queryText?: string;
  controlScore?: number;
  experimentScore?: number;
  delta?: number;
  devuiLink?: string;
}

export const UtteranceDrilldown: React.FC<UtteranceDrilldownProps> = ({
  visible,
  queryText = 'What files were shared in yesterday\u2019s meeting?',
  controlScore = 0.89,
  experimentScore = 0.47,
  delta = -0.42,
  devuiLink = 'https://devui.microsoft.com/sbs/debug/...',
}) => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.4 }}
          style={{
            background: theme.colors.bgSurface,
            border: `1.5px solid ${theme.colors.bgBorder}`,
            borderRadius: 12,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* Query text */}
          <div style={{
            fontSize: 15,
            fontStyle: 'italic',
            color: theme.colors.textPrimary,
            padding: '10px 14px',
            background: 'rgba(59, 130, 246, 0.06)',
            borderRadius: 8,
            borderLeft: `3px solid ${theme.colors.primary}`,
            lineHeight: 1.5,
          }}>
            &ldquo;{queryText}&rdquo;
          </div>

          {/* Score comparison */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flex: 1,
            }}>
              <span style={{ fontSize: 12, color: theme.colors.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Control
              </span>
              <span style={{
                fontSize: 22,
                fontWeight: 700,
                color: theme.colors.textPrimary,
                fontFamily: "'Cascadia Code', 'Fira Code', monospace",
              }}>
                {controlScore.toFixed(2)}
              </span>
            </div>

            <span style={{ fontSize: 20, color: theme.colors.textSecondary }}>
              {'\u2192'}
            </span>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flex: 1,
            }}>
              <span style={{ fontSize: 12, color: theme.colors.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Experiment
              </span>
              <span style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#ef4444',
                fontFamily: "'Cascadia Code', 'Fira Code', monospace",
              }}>
                {experimentScore.toFixed(2)}
              </span>
            </div>

            {/* Delta badge */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 8,
              padding: '6px 14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Delta
              </span>
              <span style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#ef4444',
                fontFamily: "'Cascadia Code', 'Fira Code', monospace",
              }}>
                {delta.toFixed(2)}
              </span>
            </div>
          </div>

          {/* DevUI link */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            background: 'rgba(59, 130, 246, 0.06)',
            borderRadius: 8,
            border: '1px solid rgba(59, 130, 246, 0.15)',
          }}>
            <span style={{ fontSize: 14 }}>{'\u{1F517}'}</span>
            <span style={{ fontSize: 12, color: theme.colors.textSecondary, fontWeight: 600 }}>
              DevUI SBS:
            </span>
            <span style={{
              fontSize: 12,
              color: theme.colors.primary,
              fontFamily: "'Cascadia Code', 'Fira Code', monospace",
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {devuiLink}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
