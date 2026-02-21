import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { RevealProps } from './types';
import { useRevealVisibility } from './useRevealVisibility';
import { useRevealSequence } from './RevealSequence';

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
 *
 * // Sequenced exit-before-enter (wrap group in RevealSequence)
 * <RevealSequence>
 *   <Reveal from={0} until={1}>Exits first</Reveal>
 *   <Reveal from={2}>Enters after exit completes</Reveal>
 * </RevealSequence>
 * ```
 */
export const Reveal: React.FC<RevealProps> = ({
  animation,
  exitAnimation,
  as = 'div',
  className,
  style,
  children,
  ...visibilityProps
}) => {
  const { visible, variants, exit } = useRevealVisibility(visibilityProps, animation, exitAnimation);
  const MotionElement = motionElements[as];
  const sequence = useRevealSequence();

  // Track whether this element was actually rendered (mounted in AnimatePresence).
  // Used to correctly detect exits and avoid false positives for suppressed entrances.
  const wasRenderedRef = useRef(false);

  // Suppress entrance when inside a RevealSequence that is processing exits.
  // An element is "newly visible" if the underlying visibility is true but it
  // wasn't rendered in the previous commit.
  const isNewEntrance = visible && !wasRenderedRef.current;
  const effectiveVisible = (sequence?.holdEntrance && isNewEntrance) ? false : visible;

  // Register exits with the RevealSequence so it knows when to release held entrances.
  useEffect(() => {
    if (wasRenderedRef.current && !effectiveVisible && sequence) {
      sequence.onExitStart();
    }
    wasRenderedRef.current = effectiveVisible;
  }, [effectiveVisible, sequence]);

  return (
    <AnimatePresence onExitComplete={sequence ? sequence.onExitComplete : undefined}>
      {effectiveVisible && (
        <MotionElement
          variants={variants}
          initial="hidden"
          animate="visible"
          exit={exit}
          className={className}
          style={style}
        >
          {children}
        </MotionElement>
      )}
    </AnimatePresence>
  );
};
