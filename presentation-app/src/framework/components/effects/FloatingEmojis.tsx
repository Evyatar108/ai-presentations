import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../accessibility/ReducedMotion';

export interface FloatingEmojisProps {
  /** Emojis to float (default ['⭐', '👍', '🎉', '💯', '✨']) */
  emojis?: string[];
  /** Font size in pixels (default 26) */
  size?: number;
  /** Base animation duration in seconds (default 5) — each emoji gets a random offset */
  speed?: number;
  /** Delay between each emoji's start in seconds (default 1.5) */
  staggerDelay?: number;
}

/**
 * Emojis that rise from bottom to top with rotation and fade.
 *
 * The parent element must have `position: relative; overflow: hidden` for emojis to be contained.
 * Renders nothing when `prefers-reduced-motion` is active.
 *
 * @example
 * ```tsx
 * <div style={{ position: 'relative', overflow: 'hidden', height: '100vh' }}>
 *   <FloatingEmojis />
 *   <FloatingEmojis emojis={['🔥', '💪']} speed={3} />
 * </div>
 * ```
 */
export const FloatingEmojis: React.FC<FloatingEmojisProps> = ({
  emojis = ['⭐', '👍', '🎉', '💯', '✨'],
  size = 26,
  speed = 5,
  staggerDelay = 1.5,
}) => {
  const { reduced } = useReducedMotion();

  if (reduced) return null;

  return (
    <>
      {emojis.map((emoji, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            rotate: 0,
          }}
          animate={{
            y: [0, -900],
            opacity: [0, 0.6, 0],
            rotate: 360,
          }}
          transition={{
            duration: speed + ((i * 13) % 20) / 10,
            repeat: Infinity,
            delay: i * staggerDelay,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            left: `${10 + (i * (80 / Math.max(emojis.length - 1, 1)))}%`,
            bottom: -50,
            fontSize: size,
            pointerEvents: 'none',
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </>
  );
};
