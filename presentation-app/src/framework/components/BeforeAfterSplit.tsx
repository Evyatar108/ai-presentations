import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../theme/ThemeContext';
import { useReducedMotion } from '../accessibility/ReducedMotion';
import { fadeLeft, fadeRight } from '../slides/AnimationVariants';
import { ArrowRight } from '../slides/SlideIcons';

export interface BeforeAfterSplitProps {
  beforeTitle: string;
  afterTitle: string;
  beforeContent: React.ReactNode;
  afterContent: React.ReactNode;
}

export const BeforeAfterSplit: React.FC<BeforeAfterSplitProps> = ({
  beforeTitle,
  afterTitle,
  beforeContent,
  afterContent
}) => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      gap: '1rem',
      alignItems: 'stretch',
      width: '100%'
    }}>
      {/* V1 / Before panel */}
      <motion.div
        variants={fadeLeft(reduced)}
        initial="hidden"
        animate="visible"
        style={{
          background: 'rgba(251, 191, 36, 0.06)',
          border: `1px solid rgba(251, 191, 36, 0.3)`,
          borderRadius: 12,
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: theme.colors.warning,
          marginBottom: '0.75rem'
        }}>
          {beforeTitle}
        </div>
        <div style={{ flex: 1 }}>{beforeContent}</div>
      </motion.div>

      {/* Arrow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0.1 : 0.4, duration: 0.3 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.colors.textMuted
        }}
      >
        <ArrowRight />
      </motion.div>

      {/* V2 / After panel */}
      <motion.div
        variants={fadeRight(reduced)}
        initial="hidden"
        animate="visible"
        style={{
          background: 'rgba(0, 183, 195, 0.06)',
          border: `1px solid rgba(0, 183, 195, 0.3)`,
          borderRadius: 12,
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: theme.colors.primary,
          marginBottom: '0.75rem'
        }}>
          {afterTitle}
        </div>
        <div style={{ flex: 1 }}>{afterContent}</div>
      </motion.div>
    </div>
  );
};
