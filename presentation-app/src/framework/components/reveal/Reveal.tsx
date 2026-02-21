import React from 'react';
import { AnimatePresence, motion, type TargetAndTransition } from 'framer-motion';
import type { RevealProps } from './types';
import { useRevealVisibility } from './useRevealVisibility';

// Map of element types to their motion counterparts
const motionElements = {
  div: motion.div,
  span: motion.span,
  li: motion.li,
  section: motion.section,
  article: motion.article,
  p: motion.p,
} as const;

/**
 * Declarative segment-based show/hide with Framer Motion animation.
 *
 * Replaces the verbose `AnimatePresence + isSegmentVisible + motion.div` boilerplate.
 *
 * @example
 * ```tsx
 * // Progressive reveal (visible from segment 1 onwards)
 * <Reveal from={1}>Content</Reveal>
 *
 * // Exact segment (visible only on segment 2)
 * <Reveal on={2}>Temporary content</Reveal>
 *
 * // Range (visible from segment 1 through 3)
 * <Reveal from={1} until={3}>Limited content</Reveal>
 *
 * // By segment ID
 * <Reveal id="summary">Summary content</Reveal>
 *
 * // Custom animation and element type
 * <Reveal from={0} animation={scaleIn} as="section" style={{ padding: '1rem' }}>
 *   Scaled content
 * </Reveal>
 * ```
 */
export const Reveal: React.FC<RevealProps> = ({
  animation,
  as = 'div',
  className,
  style,
  children,
  ...visibilityProps
}) => {
  const { visible, variants } = useRevealVisibility(visibilityProps, animation);
  const MotionElement = motionElements[as];

  // Derive exit from variants: prefer explicit exit, fall back to hidden, then opacity: 0
  const exitVariant = (variants.exit ?? variants.hidden ?? { opacity: 0 }) as TargetAndTransition;

  return (
    <AnimatePresence>
      {visible && (
        <MotionElement
          variants={variants}
          initial="hidden"
          animate="visible"
          exit={exitVariant}
          className={className}
          style={style}
        >
          {children}
        </MotionElement>
      )}
    </AnimatePresence>
  );
};
