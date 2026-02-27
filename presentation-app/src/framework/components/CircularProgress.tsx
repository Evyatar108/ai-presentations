import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion } from '../accessibility/ReducedMotion';
import { useTheme } from '../theme/ThemeContext';

export interface CircularProgressProps {
  /** Current value */
  value: number;
  /** Maximum value (default 100) */
  max?: number;
  /** Diameter in pixels (default 120) */
  size?: number;
  /** Override theme primary color for the progress arc */
  color?: string;
  /** Override theme bgBorder color for the background track */
  trackColor?: string;
  /** Stroke width in pixels (default 8) */
  thickness?: number;
  /** Content rendered centered over the ring */
  label?: React.ReactNode;
  /** Whether to animate the arc on mount (default true) */
  animate?: boolean;
  /** Animation delay in seconds (default 0) */
  delay?: number;
}

/**
 * Animated SVG ring progress indicator.
 *
 * Animates the arc from 0 to the target fraction using a spring-driven
 * `pathLength` motion value. In reduced-motion mode, shows the final state immediately.
 *
 * @example
 * ```tsx
 * <CircularProgress value={75} label={<span>75%</span>} />
 * <CircularProgress value={42} max={50} size={80} thickness={6} color="#22c55e" />
 * ```
 */
export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  color,
  trackColor,
  thickness = 8,
  label,
  animate: shouldAnimate = true,
  delay = 0,
}) => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();

  const fraction = Math.min(Math.max(value / max, 0), 1);
  const radius = (size - thickness) / 2;
  const center = size / 2;
  const skipAnimation = reduced || !shouldAnimate;

  // Drive pathLength imperatively so parent variant state can't interfere
  const raw = useMotionValue(skipAnimation ? fraction : 0);
  const springValue = useSpring(raw, {
    stiffness: 60,
    damping: 15,
    restDelta: 0.001,
  });
  const pathLength = skipAnimation ? raw : springValue;

  useEffect(() => {
    if (skipAnimation) {
      raw.set(fraction);
      return;
    }
    const timeout = setTimeout(() => raw.set(fraction), delay * 1000);
    return () => clearTimeout(timeout);
  }, [fraction, delay, skipAnimation, raw]);

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      style={{ position: 'relative', width: size, height: size, display: 'inline-flex' }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor ?? theme.colors.bgBorder}
          strokeWidth={thickness}
        />
        {/* Animated progress arc */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color ?? theme.colors.primary}
          strokeWidth={thickness}
          strokeLinecap="round"
          style={{ pathLength }}
        />
      </svg>
      {label != null && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
