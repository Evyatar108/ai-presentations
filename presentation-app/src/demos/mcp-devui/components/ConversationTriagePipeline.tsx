import React from 'react';
import { motion } from 'framer-motion';
import { useTheme, useReducedMotion } from '@framework';

interface ConversationTriagePipelineProps {
  activePhase: number;
}

const conversations = [
  { id: 'a3f1...c8d2', score: 0.91, severity: 'green' as const },
  { id: 'b7e4...1a9f', score: 0.78, severity: 'green' as const },
  { id: 'c2d8...5e3b', score: 0.54, severity: 'yellow' as const },
  { id: 'e9a1...7c4d', score: 0.45, severity: 'yellow' as const },
  { id: 'f6b3...2d8e', score: 0.32, severity: 'red' as const },
  { id: 'd4c7...9f1a', score: 0.12, severity: 'red' as const },
];

const severityColors = {
  green: { bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.4)', text: '#4ade80' },
  yellow: { bg: 'rgba(251, 191, 36, 0.12)', border: 'rgba(251, 191, 36, 0.4)', text: '#fbbf24' },
  red: { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.4)', text: '#f87171' },
};

/**
 * Vertical pipeline: user prompt → conversation grid → triage highlight.
 * Phases: 0=prompt only, 1=cards stagger in, 2=sort + highlight worst
 */
export const ConversationTriagePipeline: React.FC<ConversationTriagePipelineProps> = ({ activePhase }) => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const showCards = activePhase >= 1;
  const showTriage = activePhase >= 2;

  const worstIndex = conversations.length - 1; // d4c7 @ 0.12

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', width: '100%' }}>
      {/* Prompt bubble */}
      <motion.div
        initial={reduced ? undefined : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'rgba(139, 92, 246, 0.08)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: 16,
          padding: '12px 20px',
          maxWidth: 620,
          width: '100%',
        }}
      >
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#a78bfa',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 6,
        }}>
          Prompt
        </div>
        <div style={{
          fontSize: 14,
          color: theme.colors.textPrimary,
          fontStyle: 'italic',
          lineHeight: 1.5,
        }}>
          "Get the worst conversation from my latest SEVAL and debug what went wrong"
        </div>
      </motion.div>

      {/* Conversation grid */}
      {showCards && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          maxWidth: 620,
          width: '100%',
        }}>
          {conversations.map((conv, i) => {
            const isWorst = i === worstIndex;
            const colors = severityColors[conv.severity];
            const dimmed = showTriage && !isWorst;
            const highlighted = showTriage && isWorst;

            return (
              <motion.div
                key={conv.id}
                initial={reduced ? undefined : { opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: dimmed ? 0.3 : 1,
                  scale: highlighted ? 1.08 : 1,
                }}
                transition={{
                  duration: reduced ? 0 : 0.35,
                  delay: reduced ? 0 : i * 0.08,
                }}
                style={{
                  background: colors.bg,
                  border: `1.5px solid ${highlighted ? colors.text : colors.border}`,
                  borderRadius: 10,
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  boxShadow: highlighted ? `0 0 16px ${colors.bg}` : 'none',
                  transition: 'box-shadow 0.4s, border-color 0.4s',
                }}
              >
                <div style={{
                  fontFamily: "'Cascadia Code', 'Fira Code', monospace",
                  fontSize: 11.5,
                  color: theme.colors.textSecondary,
                }}>
                  {conv.id}
                </div>
                <div style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: colors.text,
                }}>
                  {conv.score.toFixed(2)}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Diagnosis label */}
      {showTriage && (
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: reduced ? 0 : 0.3 }}
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 10,
            padding: '10px 20px',
            maxWidth: 620,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <span style={{
            fontFamily: "'Cascadia Code', 'Fira Code', monospace",
            fontSize: 13,
            color: '#f87171',
            fontWeight: 600,
          }}>
            Grounding failure in Turn 2 — SubstrateSearch timeout
          </span>
        </motion.div>
      )}
    </div>
  );
};
