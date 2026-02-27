import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../accessibility/ReducedMotion';
import { useTheme } from '../theme/ThemeContext';

export interface AnimatedCheckmarkProps {
  /** Diameter in pixels (default 60) */
  size?: number;
  /** Checkmark stroke color (overrides theme.colors.success) */
  color?: string;
  /** Stroke width in pixels (default 3) */
  strokeWidth?: number;
  /** Animation delay in seconds (default 0) */
  delay?: number;
  /** Show a circular background behind the checkmark (default false) */
  withCircle?: boolean;
  /** Circle fill color when withCircle is true (overrides theme.colors.success at 15% opacity) */
  circleFill?: string;
  /** Circle stroke color when withCircle is true (overrides theme.colors.success) */
  circleStroke?: string;
}

/**
 * Animated SVG checkmark with path-draw entrance.
 *
 * Uses Framer Motion `pathLength` to draw the checkmark stroke from start to end.
 * Optionally renders a circular background that scales in before the checkmark draws.
 * In reduced-motion mode, shows the final state immediately.
 *
 * @example
 * ```tsx
 * <AnimatedCheckmark />
 * <AnimatedCheckmark size={80} color="#22c55e" withCircle />
 * <AnimatedCheckmark size={40} strokeWidth={4} delay={0.3} />
 * ```
 */
export const AnimatedCheckmark: React.FC<AnimatedCheckmarkProps> = ({
  size = 60,
  color,
  strokeWidth = 3,
  delay = 0,
  withCircle = false,
  circleFill,
  circleStroke,
}) => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();

  const checkColor = color ?? theme.colors.success;
  const skipAnimation = reduced;

  // Checkmark path scaled to a 24x24 viewBox
  const checkPath = 'M 6 12 L 10.5 16.5 L 18 8';

  // Circle animation (scales in before the check draws)
  const circleDelay = delay;
  const checkDelay = withCircle ? delay + (skipAnimation ? 0 : 0.25) : delay;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Checkmark"
      role="img"
    >
      {withCircle && (
        <motion.circle
          cx={12}
          cy={12}
          r={11}
          fill={circleFill ?? `${checkColor}26`}
          stroke={circleStroke ?? checkColor}
          strokeWidth={1}
          initial={skipAnimation ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={
            skipAnimation
              ? { duration: 0 }
              : { type: 'spring', duration: 0.5, bounce: 0.2, delay: circleDelay }
          }
          style={{ transformOrigin: 'center' }}
        />
      )}
      <motion.path
        d={checkPath}
        stroke={checkColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: skipAnimation ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={
          skipAnimation
            ? { duration: 0 }
            : { type: 'spring', duration: 0.6, bounce: 0.15, delay: checkDelay }
        }
      />
    </svg>
  );
};
