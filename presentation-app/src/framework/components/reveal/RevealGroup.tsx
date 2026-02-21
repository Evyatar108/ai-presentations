import React, { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, type TargetAndTransition, type Variants } from 'framer-motion';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { fadeUp } from '../../slides/AnimationVariants';
import type { RevealGroupProps, RevealAnimation } from './types';
import { useRevealVisibility } from './useRevealVisibility';
import { useRevealSequence } from './RevealSequence';

const COLLAPSE_EASE = [0.4, 0, 0.2, 1] as const;

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

  const isExiting = !effectiveVisible && wasRenderedRef.current;
  const holdingExitRef = useRef(false);
  const effectiveVisibleRef = useRef(effectiveVisible);
  effectiveVisibleRef.current = effectiveVisible;

  // Register exits with the RevealSequence.
  useEffect(() => {
    if (wasRenderedRef.current && !effectiveVisible && sequence) {
      holdingExitRef.current = true;
      sequence.onExitStart();
    }
    if (effectiveVisible) {
      holdingExitRef.current = false;
    }
    wasRenderedRef.current = effectiveVisible;
  }, [effectiveVisible, sequence]);

  if (sequence && !sequence.holdEntrance && holdingExitRef.current) {
    holdingExitRef.current = false;
  }

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

  // Smooth height-collapsing exit for RevealSequence.
  const sequenceExitTarget = useMemo<TargetAndTransition | undefined>(() => {
    if (!sequence) return undefined;
    const hidden = (typeof containerVariants.hidden === 'object' ? containerVariants.hidden : { opacity: 0 }) as Record<string, unknown>;
    return {
      ...hidden,
      height: 0,
      overflow: 'hidden',
      marginTop: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
      transition: {
        opacity: { duration: 0.3 },
        y: { duration: 0.3 },
        x: { duration: 0.3 },
        scale: { duration: 0.3 },
        height: { duration: 0.4, ease: COLLAPSE_EASE },
        overflow: { duration: 0 },
        marginTop: { duration: 0.4, ease: COLLAPSE_EASE },
        marginBottom: { duration: 0.4, ease: COLLAPSE_EASE },
        paddingTop: { duration: 0.4, ease: COLLAPSE_EASE },
        paddingBottom: { duration: 0.4, ease: COLLAPSE_EASE },
      },
    };
  }, [sequence, containerVariants]);

  const childContent = stagger
    ? React.Children.map(children, (child) =>
        child != null ? (
          <motion.div variants={childVariants}>{child}</motion.div>
        ) : null,
      )
    : children;

  // ---------------------------------------------------------------------------
  // Inside a RevealSequence: keep exiting elements mounted until release.
  // layout="position" ensures visible elements smoothly reposition when
  // siblings collapse or enter.
  // ---------------------------------------------------------------------------
  if (sequence) {
    const shouldRender = effectiveVisible || isExiting || holdingExitRef.current;

    if (!shouldRender) return null;

    return (
      <MotionElement
        layout="position"
        variants={containerVariants}
        initial="hidden"
        animate={effectiveVisible ? 'visible' : sequenceExitTarget}
        onAnimationComplete={() => {
          if (!effectiveVisibleRef.current && sequence) {
            sequence.onExitComplete();
          }
        }}
        className={className}
        style={style}
      >
        {childContent}
      </MotionElement>
    );
  }

  // ---------------------------------------------------------------------------
  // Outside a RevealSequence: standard AnimatePresence enter/exit.
  // ---------------------------------------------------------------------------
  return (
    <AnimatePresence>
      {effectiveVisible && (
        <MotionElement
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={exitVariant}
          className={className}
          style={style}
        >
          {childContent}
        </MotionElement>
      )}
    </AnimatePresence>
  );
};
