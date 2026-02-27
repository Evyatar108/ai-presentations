import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { useTheme } from '../../theme/ThemeContext';

export interface PulsingBadgeProps {
  children: React.ReactNode;
  /** Bouncing emoji above content (default '🚀') */
  icon?: string;
  /** Floating icons around the badge edges (default ['✨', '💡']) */
  floatingIcons?: string[];
  /** Gradient from/to colors (default: [theme.primary, theme.secondary]) */
  colors?: [string, string];
  /** Additional styles for the outer wrapper */
  style?: React.CSSProperties;
}

/**
 * Gradient badge with scale + boxShadow pulse, shine sweep overlay,
 * a bouncing icon above content, and floating icons around the edges.
 *
 * All animations are disabled when reduced motion is active.
 * The badge itself still renders with a static gradient.
 *
 * @example
 * ```tsx
 * <PulsingBadge>
 *   <div style={{ color: '#fff', fontWeight: 700 }}>Try It Now</div>
 *   <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>Available today</div>
 * </PulsingBadge>
 * ```
 */
export const PulsingBadge: React.FC<PulsingBadgeProps> = ({
  children,
  icon = '🚀',
  floatingIcons = ['✨', '💡'],
  colors,
  style,
}) => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();

  const [colorFrom, colorTo] = colors ?? [theme.colors.primary, theme.colors.secondary];

  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }}>
      {/* Floating icons around the badge */}
      {!reduced && floatingIcons.map((fi, idx) => (
        <motion.div
          key={idx}
          animate={{
            y: [-8, 8, -8],
            rotate: [0, idx % 2 === 0 ? 10 : -10, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.5 }}
          style={{
            position: 'absolute',
            top: -10,
            ...(idx % 2 === 0 ? { left: -10 } : { right: -10 }),
            fontSize: 22,
            zIndex: 3,
          }}
        >
          {fi}
        </motion.div>
      ))}

      {/* Main badge */}
      <motion.div
        animate={reduced ? {} : {
          scale: [1, 1.05, 1],
          boxShadow: [
            `0 8px 30px ${colorFrom}44`,
            `0 12px 50px ${colorFrom}88`,
            `0 8px 30px ${colorFrom}44`,
          ],
        }}
        transition={reduced ? undefined : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'relative',
          background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})`,
          borderRadius: 16,
          padding: '1.25rem 1.75rem',
          overflow: 'hidden',
          boxShadow: `0 8px 30px ${colorFrom}55`,
        }}
      >
        {/* Shine sweep */}
        {!reduced && (
          <motion.div
            animate={{ x: ['-200%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              transform: 'skewX(-20deg)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        )}

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          {/* Bouncing icon */}
          <motion.div
            animate={reduced ? {} : { rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
            transition={reduced ? undefined : { duration: 2, repeat: Infinity, repeatDelay: 1 }}
            style={{ fontSize: 24, marginBottom: '0.3rem' }}
          >
            {icon}
          </motion.div>
          {children}
        </div>
      </motion.div>
    </div>
  );
};
