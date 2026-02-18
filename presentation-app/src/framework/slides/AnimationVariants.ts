/**
 * Shared Framer Motion Animation Variants
 * Extracted from AnimatedSlides.tsx to reduce duplication
 */

import { Variants } from 'framer-motion';

/**
 * Standard fade in animation
 * Used in: Multiple slides
 */
export const fadeIn = (reduced: boolean): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: reduced ? 0.2 : 0.5 }
  }
});

/**
 * Fade in with upward motion
 * Used in: ~15 slides
 */
export const fadeUp = (reduced: boolean, delay: number = 0): Variants => ({
  hidden: { opacity: 0, y: reduced ? 0 : 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: reduced ? 0.2 : 0.5, delay }
  }
});

/**
 * Fade in with downward motion
 * Used in: Ch1_S1, Ch3_S1
 */
export const fadeDown = (reduced: boolean, delay: number = 0): Variants => ({
  hidden: { opacity: 0, y: reduced ? 0 : -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: reduced ? 0.2 : 0.5, delay }
  }
});

/**
 * Fade in with left slide motion
 * Used in: Ch5_S2, Ch3_S1, Ch4_S1
 */
export const fadeLeft = (reduced: boolean, distance: number = 20): Variants => ({
  hidden: { opacity: 0, x: reduced ? 0 : -distance },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: reduced ? 0.2 : 0.5 }
  }
});

/**
 * Fade in with right slide motion
 * Used in: Ch1_S2, Ch4_S1
 */
export const fadeRight = (reduced: boolean, distance: number = 20): Variants => ({
  hidden: { opacity: 0, x: reduced ? 0 : distance },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: reduced ? 0.2 : 0.5 }
  }
});

/**
 * Scale in animation
 * Used in: ~10 slides
 */
export const scaleIn = (reduced: boolean, delay: number = 0, from: number = 0.8): Variants => ({
  hidden: { scale: reduced ? 1 : from, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: reduced ? 0.2 : 0.6, delay, type: 'spring' }
  }
});

/**
 * Scale in with stronger spring
 * Used in: Ch6_S1, Ch7_S5
 */
export const scaleInSpring = (reduced: boolean, delay: number = 0): Variants => ({
  hidden: { scale: reduced ? 1 : 0.5, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: reduced ? 0.3 : 0.8, delay, type: 'spring' }
  }
});

/**
 * Stagger container for child animations
 * Used in: ~12 slides
 */
export const staggerContainer = (reduced: boolean, staggerDelay: number = 0.15, childDelay: number = 0.2): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: reduced ? 0 : staggerDelay,
      delayChildren: reduced ? 0 : childDelay
    }
  }
});

/**
 * Tile/card animation for stagger children
 * Used in: Ch5_S1, Ch6_S1
 */
export const tileVariants = (reduced: boolean): Variants => ({
  hidden: { opacity: 0, y: reduced ? 0 : -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: reduced ? 0.2 : 0.4 }
  }
});

/**
 * Arrow animation
 * Used in: Ch5_S1, Ch7_S5
 */
export const arrowVariants = (reduced: boolean, delay: number = 0.6): Variants => ({
  hidden: { scaleY: 0, opacity: 0 },
  visible: {
    scaleY: 1,
    opacity: 1,
    transition: { duration: reduced ? 0.2 : 0.5, delay: reduced ? 0 : delay }
  }
});

/**
 * Target/goal animation
 * Used in: Ch5_S1
 */
export const targetVariants = (reduced: boolean, delay: number = 1): Variants => ({
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: reduced ? 0.2 : 0.6, delay: reduced ? 0 : delay }
  }
});

/**
 * Prompt chain animation for Ch5_S2
 * Used in: Ch5_S2
 */
export const promptVariants = (reduced: boolean): Variants => ({
  hidden: { opacity: 0, x: reduced ? 0 : -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: reduced ? 0.2 : 0.4 }
  }
});

/**
 * Pulsing glow animation
 * Used in: Ch6_S1, Ch7_S4
 */
export const pulseGlow = (reduced: boolean, color: string = '0, 183, 195'): Record<string, any> => {
  if (reduced) return {};

  return {
    boxShadow: [
      `0 0 60px rgba(${color}, 0.6)`,
      `0 0 80px rgba(${color}, 0.8)`,
      `0 0 60px rgba(${color}, 0.6)`
    ]
  };
};

/**
 * Repeating pulse animation for emphasis
 * Used in: Ch7_S4
 */
export const emphasisPulse = (reduced: boolean) => {
  if (reduced) return {};
  
  return {
    scale: [1, 1.12, 1],
    opacity: [1, 1, 1]
  };
};

/**
 * Rotation animation (for needles, indicators)
 * Used in: Ch7_S1
 */
export const rotateFromTo = (reduced: boolean, from: number, to: number, duration: number = 1.5): Record<string, any> => ({
  initial: { rotate: reduced ? to : from },
  animate: { rotate: to },
  transition: { duration: reduced ? 0.3 : duration, type: 'spring' }
});

/**
 * Width expansion animation (for bars)
 * Used in: Ch7_S1
 */
export const expandWidth = (reduced: boolean, targetWidth: number, delay: number = 0): Record<string, any> => ({
  initial: { width: 0 },
  animate: { width: targetWidth },
  transition: { duration: reduced ? 0.3 : 1, delay: reduced ? 0 : delay }
});

/**
 * Height expansion animation (for stacked bars)
 * Used in: Ch7_S3
 */
export const expandHeight = (reduced: boolean, targetHeight: number, delay: number = 0): Record<string, any> => ({
  initial: { height: 0 },
  animate: { height: targetHeight },
  transition: { duration: reduced ? 0.2 : 0.4, delay, ease: 'easeOut' }
});