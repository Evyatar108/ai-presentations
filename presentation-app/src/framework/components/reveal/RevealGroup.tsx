import React, { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, type TargetAndTransition, type Variants } from 'framer-motion';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { fadeUp } from '../../slides/AnimationVariants';
import type { RevealGroupProps, RevealAnimation } from './types';
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

function resolveAnimation(anim: RevealAnimation, reduced: boolean): Variants {
  return typeof anim === 'function' ? anim(reduced) : anim;
}

/**
 * Staggered group reveal for lists and grids.
 *
 * When `stagger` is enabled, the container uses a stagger transition
 * and each direct child is wrapped in a motion element with `childAnimation`.
 *
 * Without `stagger`, behaves like `<Reveal>` but for a group wrapper.
 *
 * @example
 * ```tsx
 * // Staggered list
 * <RevealGroup from={1} stagger as="div">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </RevealGroup>
 *
 * // Custom stagger timing and child animation
 * <RevealGroup from={2} stagger staggerDelay={0.2} childAnimation={scaleIn}>
 *   <Card>A</Card>
 *   <Card>B</Card>
 * </RevealGroup>
 * ```
 */
export const RevealGroup: React.FC<RevealGroupProps> = ({
  animation,
  exitAnimation,
  as = 'div',
  className,
  style,
  children,
  stagger = false,
  staggerDelay = 0.15,
  childDelay = 0.2,
  childAnimation = fadeUp,
  ...visibilityProps
}) => {
  const { visible, variants, exit: resolvedExit } = useRevealVisibility(visibilityProps, animation, exitAnimation);
  const { reduced } = useReducedMotion();
  const MotionElement = motionElements[as];
  const sequence = useRevealSequence();

  // Track whether this group was actually rendered (mounted in AnimatePresence).
  const wasRenderedRef = useRef(false);

  // Suppress entrance when inside a RevealSequence that is processing exits.
  const isNewEntrance = visible && !wasRenderedRef.current;
  const effectiveVisible = (sequence?.holdEntrance && isNewEntrance) ? false : visible;

  // Register exits with the RevealSequence.
  useEffect(() => {
    if (wasRenderedRef.current && !effectiveVisible && sequence) {
      sequence.onExitStart();
    }
    wasRenderedRef.current = effectiveVisible;
  }, [effectiveVisible, sequence]);

  // Build stagger container variants when stagger is enabled
  const containerVariants = useMemo<Variants>(() => {
    if (!stagger) return variants;

    return {
      hidden: variants.hidden ?? { opacity: 0 },
      visible: {
        ...(typeof variants.visible === 'object' ? variants.visible : {}),
        opacity: 1,
        transition: {
          staggerChildren: reduced ? 0 : staggerDelay,
          delayChildren: reduced ? 0 : childDelay,
        },
      },
    };
  }, [stagger, variants, reduced, staggerDelay, childDelay]);

  // Resolve child animation variants
  const childVariants = useMemo<Variants>(
    () => resolveAnimation(childAnimation, reduced),
    [childAnimation, reduced],
  );

  // If exitAnimation prop was provided, use the resolved exit from the hook.
  // Otherwise derive from the container variants (which may differ from entrance variants when stagger is on).
  const exitVariant = exitAnimation
    ? resolvedExit
    : (containerVariants.exit ?? containerVariants.hidden ?? { opacity: 0 }) as TargetAndTransition;

  return (
    <AnimatePresence onExitComplete={sequence ? sequence.onExitComplete : undefined}>
      {effectiveVisible && (
        <MotionElement
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={exitVariant}
          className={className}
          style={style}
        >
          {stagger
            ? React.Children.map(children, (child) =>
                child != null ? (
                  <motion.div variants={childVariants}>{child}</motion.div>
                ) : null,
              )
            : children}
        </MotionElement>
      )}
    </AnimatePresence>
  );
};
