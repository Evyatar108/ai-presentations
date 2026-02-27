import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../accessibility/ReducedMotion';

export interface ShimmerOverlayProps {
  /** Shimmer highlight color (default 'rgba(255,255,255,0.1)') */
  color?: string;
  /** Sweep duration in seconds (default 3) */
  duration?: number;
  /** Pause between sweeps in seconds (default 2) */
  repeatDelay?: number;
}

/**
 * Skewed gradient that sweeps left-to-right across the parent.
 *
 * The parent element **must** have `position: relative; overflow: hidden` for the shimmer to be contained.
 * Renders nothing when `prefers-reduced-motion` is active. Always sets `pointerEvents: 'none'`.
 *
 * @example
 * ```tsx
 * <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
 *   <ShimmerOverlay />
 *   <div style={{ position: 'relative', zIndex: 1 }}>Card content</div>
 * </div>
 * ```
 */
export const ShimmerOverlay: React.FC<ShimmerOverlayProps> = ({
  color = 'rgba(255,255,255,0.1)',
  duration = 3,
  repeatDelay = 2,
}) => {
  const { reduced } = useReducedMotion();

  if (reduced) return null;

  return (
    <motion.div
      animate={{ x: ['-100%', '200%'] }}
      transition={{ duration, repeat: Infinity, repeatDelay, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        transform: 'skewX(-20deg)',
        pointerEvents: 'none',
      }}
    />
  );
};
