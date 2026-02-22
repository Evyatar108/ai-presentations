import React from 'react';
import { motion } from 'framer-motion';
import { useMarker, useTheme, typography } from '@framework';

export interface PromptSection {
  num: number;
  name: string;
  desc: string;
  marker: string;
}

export const PromptSectionCard: React.FC<{
  section: PromptSection;
  index: number;
  dimmed: boolean;
  theme: ReturnType<typeof useTheme>;
  reduced: boolean;
}> = ({ section, index, dimmed, theme, reduced }) => {
  const { reached: highlighted } = useMarker(section.marker);
  const lit = !dimmed || highlighted;
  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 15 }}
      animate={{ opacity: lit ? 1 : 0.15, y: 0 }}
      transition={{
        duration: reduced ? 0.1 : 0.3,
        delay: reduced ? 0 : index * 0.08
      }}
      style={{
        background: theme.colors.bgSurface,
        border: `1px solid ${theme.colors.bgBorder}`,
        borderRadius: 12,
        padding: '1rem 1.1rem',
        textAlign: 'left'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.4rem'
      }}>
        <div style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          color: '#fff',
          fontWeight: 700,
          flexShrink: 0
        }}>
          {section.num}
        </div>
        <span style={{
          ...typography.body,
          fontSize: 14,
          fontWeight: 700,
          color: theme.colors.textPrimary
        }}>
          {section.name}
        </span>
      </div>
      <div style={{
        ...typography.body,
        fontSize: 12,
        color: theme.colors.textSecondary,
        lineHeight: 1.4
      }}>
        {section.desc}
      </div>
    </motion.div>
  );
};
