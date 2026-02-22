import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion, useTheme, useMarker, typography } from '@framework';

export interface SchemaField {
  name: string;
  desc: string;
  marker: string;
  call?: string | null;
  category: string;
}

export const MarkerFieldCard: React.FC<{
  field: SchemaField;
  index: number;
  accent: string;
  bg: string;
  compact?: boolean;
}> = ({ field, index, accent, bg, compact }) => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();
  const { reached: dimmed } = useMarker('dim-all');
  const { reached: highlighted } = useMarker(field.marker);
  const reached = !dimmed || highlighted;

  return (
    <motion.div
      key={field.name}
      initial={{ opacity: 0, y: reduced ? 0 : 12 }}
      animate={{ opacity: reached ? 1 : 0.15, y: 0 }}
      transition={{
        duration: reduced ? 0.1 : 0.3,
        delay: reduced ? 0 : index * 0.06,
      }}
      style={{
        background: bg,
        border: `1px solid ${theme.colors.bgBorder}`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: 10,
        padding: compact ? '0.45rem 0.65rem' : '0.55rem 0.75rem',
        textAlign: 'left',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.2rem',
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: compact ? 10.5 : 11,
          fontWeight: 600,
          color: accent,
        }}>
          {field.name}
        </span>
        <span style={{
          fontSize: 9,
          fontWeight: 700,
          color: field.call ? '#fbbf24' : theme.colors.success,
          background: field.call
            ? 'rgba(251, 191, 36, 0.15)'
            : `${theme.colors.success}20`,
          borderRadius: 5,
          padding: '0.15rem 0.4rem',
          whiteSpace: 'nowrap',
        }}>
          {field.call ? `V1: ${field.call}` : 'New'}
        </span>
      </div>
      <div style={{
        ...typography.body,
        fontSize: compact ? 10.5 : 11,
        color: theme.colors.textSecondary,
        lineHeight: 1.3,
      }}>
        {field.desc}
      </div>
    </motion.div>
  );
};
