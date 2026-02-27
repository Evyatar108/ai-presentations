import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../accessibility/ReducedMotion';
import { useTheme } from '../theme/ThemeContext';

export interface AnimatedHeadingProps {
  /** Text to animate character-by-character */
  text: string;
  /** HTML heading level (default 'h2') */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Delay between characters in seconds (default 0.04) */
  stagger?: number;
  /** Spring stiffness (default 120) */
  stiffness?: number;
  /** Spring damping (default 14) */
  damping?: number;
  /** Inline style for the heading element */
  style?: React.CSSProperties;
  /** Text color (overrides theme.colors.textPrimary) */
  color?: string;
  /** Animation delay in seconds before the first character (default 0) */
  delay?: number;
}

/**
 * Heading with per-character spring entrance animation.
 *
 * Each character is wrapped in a `motion.span` and staggered via
 * `staggerChildren`. In reduced-motion mode, the full text appears instantly.
 *
 * @example
 * ```tsx
 * <AnimatedHeading text="Hello World" as="h1" />
 * <AnimatedHeading text="Subtitle" stagger={0.06} stiffness={80} style={{ fontSize: '2rem' }} />
 * ```
 */
export const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({
  text,
  as: Tag = 'h2',
  stagger = 0.04,
  stiffness = 120,
  damping = 14,
  style,
  color,
  delay = 0,
}) => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();

  const textColor = color ?? theme.colors.textPrimary;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : stagger,
        delayChildren: reduced ? 0 : delay,
      },
    },
  };

  const charVariants = {
    hidden: reduced
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 20 },
    visible: reduced
      ? { opacity: 1, y: 0, transition: { duration: 0 } }
      : {
          opacity: 1,
          y: 0,
          transition: {
            type: 'spring',
            stiffness,
            damping,
          },
        },
  };

  // Split into characters, preserving spaces as non-breaking for layout
  const chars = text.split('');

  return (
    <Tag
      style={{
        margin: 0,
        color: textColor,
        fontFamily: theme.fontFamily,
        ...style,
      }}
    >
      <motion.span
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-label={text}
        style={{ display: 'inline-flex', flexWrap: 'wrap' }}
      >
        {chars.map((char, i) => (
          <motion.span
            key={`${i}-${char}`}
            variants={charVariants}
            aria-hidden="true"
            style={{
              display: 'inline-block',
              whiteSpace: char === ' ' ? 'pre' : undefined,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
};
