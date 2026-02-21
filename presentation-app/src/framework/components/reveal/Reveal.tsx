import React, { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, type TargetAndTransition } from 'framer-motion';
import type { RevealProps } from './types';
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

  // Detect exit synchronously during render (wasRenderedRef still holds previous value).
  const isExiting = !effectiveVisible && wasRenderedRef.current;

  // Persists the "holding exit in DOM" state across renders (survives wasRenderedRef being cleared).
  const holdingExitRef = useRef(false);

  // Ref-tracked effectiveVisible for async callbacks (onAnimationComplete).
  const effectiveVisibleRef = useRef(effectiveVisible);
  effectiveVisibleRef.current = effectiveVisible;

  // Register exits with the RevealSequence so it knows when to release held entrances.
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

  // Clear holdingExitRef synchronously when the sequence releases.
  if (sequence && !sequence.holdEntrance && holdingExitRef.current) {
    holdingExitRef.current = false;
  }

  // Build an exit target that fades out AND smoothly collapses layout space.
  // The element stays mounted (at height 0) until the sequence releases, so
  // the collapse is the ONLY layout shift — no snap when unmounted.
  const sequenceExitTarget = useMemo<TargetAndTransition | undefined>(() => {
    if (!sequence) return undefined;
    const hidden = (typeof variants.hidden === 'object' ? variants.hidden : { opacity: 0 }) as Record<string, unknown>;
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
  }, [sequence, variants]);

  // ---------------------------------------------------------------------------
  // Inside a RevealSequence: don't use AnimatePresence.
  //
  // Exiting elements stay mounted (preserving layout space) and smoothly
  // collapse their height. At release, both exit-unmount and entrance-mount
  // happen in the SAME React render — so flex-centered containers re-center once.
  // ---------------------------------------------------------------------------
  if (sequence) {
    const shouldRender = effectiveVisible || isExiting || holdingExitRef.current;

    if (!shouldRender) return null;

    return (
      <MotionElement
        layout="position"
        variants={variants}
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
        {children}
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
