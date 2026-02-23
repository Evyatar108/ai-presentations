import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion, useMarker, useTheme, FieldCard } from '@framework';

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

  const badge = field.call
    ? { text: `V1: ${field.call}`, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' }
    : { text: 'New', color: theme.colors.success, bg: `${theme.colors.success}20` };

  return (
    <motion.div
      key={field.name}
      initial={{ opacity: 0, y: reduced ? 0 : 12 }}
      animate={{ opacity: reached ? 1 : 0.15, y: 0 }}
      transition={{
        duration: reduced ? 0.1 : 0.3,
        delay: reduced ? 0 : index * 0.06,
      }}
    >
      <FieldCard
        name={field.name}
        description={field.desc}
        badge={badge}
        accentColor={accent}
        compact={compact}
        style={{ background: bg }}
      />
    </motion.div>
  );
};
