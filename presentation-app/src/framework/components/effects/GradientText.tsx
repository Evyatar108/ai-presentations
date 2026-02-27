import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { useTheme } from '../../theme/ThemeContext';

export interface GradientTextProps {
  children: React.ReactNode;
  /** Gradient colors (default: theme primary/secondary/#8B5CF6) — the first color is repeated at the end for seamless looping */
  colors?: string[];
  /** Animation cycle duration in seconds (default 5) */
  duration?: number;
  /** HTML element to render (default 'h2') */
  as?: 'h1' | 'h2' | 'h3' | 'span';
  /** Additional styles applied to the element */
  style?: React.CSSProperties;
}

/**
 * Text with an animated cycling background gradient.
 *
 * Animates `backgroundPosition` for a smooth color-shifting effect.
 * In reduced-motion mode, renders a static gradient without animation.
 *
 * @example
 * ```tsx
 * <GradientText>Hello World</GradientText>
 * <GradientText as="h1" colors={['#ff0000', '#00ff00']} duration={3}>
 *   Custom Gradient
 * </GradientText>
 * ```
 */
export const GradientText: React.FC<GradientTextProps> = ({
  children,
  colors,
  duration = 5,
  as: Tag = 'h2',
  style,
}) => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();

  const palette = colors ?? [theme.colors.primary, theme.colors.secondary, '#8B5CF6'];
  const gradientColors = [...palette, palette[0]].join(', ');

  const MotionTag = motion[Tag];

  return (
    <MotionTag
      animate={reduced ? {} : { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
      transition={reduced ? undefined : { duration, repeat: Infinity, ease: 'linear' }}
      style={{
        background: `linear-gradient(90deg, ${gradientColors})`,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        ...style,
      }}
    >
      {children}
    </MotionTag>
  );
};
