import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { useTheme } from '../../theme/ThemeContext';

export interface GlowBorderProps {
  children: React.ReactNode;
  /** Gradient colors for the glow (default: theme primary/secondary/#8B5CF6) */
  colors?: string[];
  /** Blur radius in pixels (default 10) */
  blur?: number;
  /** Border radius in pixels (default 18) */
  borderRadius?: number;
  /** Additional styles for the outer wrapper */
  style?: React.CSSProperties;
}

/**
 * Wrapper that renders a pulsing gradient halo behind its children.
 *
 * The glow animates opacity between 0.2 and 0.5. When reduced motion is active, the glow is
 * visible but static at 0.35 opacity. Uses `display: grid` so children stretch to fill the
 * wrapper (important when GlowBorder is a flex child).
 *
 * @example
 * ```tsx
 * <GlowBorder>
 *   <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)' }}>
 *     Card content
 *   </div>
 * </GlowBorder>
 * ```
 */
export const GlowBorder: React.FC<GlowBorderProps> = ({
  children,
  colors,
  blur = 10,
  borderRadius = 18,
  style,
}) => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();

  const palette = colors ?? [theme.colors.primary, theme.colors.secondary, '#8B5CF6'];
  const gradient = `linear-gradient(135deg, ${palette.join(', ')})`;

  return (
    <div style={{ position: 'relative', isolation: 'isolate', display: 'grid', ...style }}>
      <motion.div
        animate={reduced ? {} : { opacity: [0.2, 0.5, 0.2] }}
        transition={reduced ? undefined : { duration: 3, repeat: Infinity }}
        style={{
          position: 'absolute',
          inset: -2,
          background: gradient,
          borderRadius,
          filter: `blur(${blur}px)`,
          zIndex: -1,
          pointerEvents: 'none',
          opacity: reduced ? 0.35 : undefined,
        }}
      />
      {children}
    </div>
  );
};
