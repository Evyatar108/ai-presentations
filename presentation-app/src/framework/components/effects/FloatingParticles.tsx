import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { useTheme } from '../../theme/ThemeContext';

export interface FloatingParticlesProps {
  /** Number of particles (default 15) */
  count?: number;
  /** Particle colors — cycles through the array (default: theme primary/secondary/#8B5CF6) */
  colors?: string[];
  /** Particle diameter in pixels (default 4) */
  size?: number;
  /** Base animation duration in seconds (default 5) — each particle gets a random offset */
  speed?: number;
}

/**
 * Colored dots that drift across the parent container with random positions, fading in/out infinitely.
 *
 * The parent element must have `position: relative; overflow: hidden` for particles to be contained.
 * Renders nothing when `prefers-reduced-motion` is active.
 *
 * @example
 * ```tsx
 * <div style={{ position: 'relative', overflow: 'hidden', height: '100vh' }}>
 *   <FloatingParticles />
 *   <FloatingParticles count={25} size={6} speed={3} />
 * </div>
 * ```
 */
export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 15,
  colors,
  size = 4,
  speed = 5,
}) => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();

  if (reduced) return null;

  const palette = colors ?? [theme.colors.primary, theme.colors.secondary, '#8B5CF6'];

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: `${(((i * 37 + 13) % 100))}%`,
            y: `${(((i * 53 + 7) % 100))}%`,
            opacity: 0,
          }}
          animate={{
            y: [`${(((i * 53 + 7) % 100))}%`, `${(((i * 71 + 29) % 100))}%`],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: speed - 1 + ((i * 17) % 30) / 10,
            repeat: Infinity,
            delay: i * (speed / count),
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            background: palette[i % palette.length],
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
};
