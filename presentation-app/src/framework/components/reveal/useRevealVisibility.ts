import { useMemo } from 'react';
import type { Variants } from 'framer-motion';
import { useSegmentedAnimation } from '../../contexts/SegmentContext';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { fadeIn } from '../../slides/AnimationVariants';
import { debug } from '../../utils/debug';
import { useRevealAnimation } from './RevealContext';
import type { RevealAnimation, RevealVisibilityProps } from './types';

interface RevealVisibilityResult {
  /** Whether the element should be rendered. */
  visible: boolean;
  /** Resolved Framer Motion variants (hidden/visible). */
  variants: Variants;
  /** Whether reduced motion is active. */
  reduced: boolean;
}

/**
 * Internal shared hook used by `<Reveal>` and `<RevealGroup>`.
 * Resolves visibility from segment state and animation from the priority chain.
 */
export function useRevealVisibility(
  visibilityProps: RevealVisibilityProps,
  animationProp?: RevealAnimation,
): RevealVisibilityResult {
  const { currentSegmentIndex, isSegmentVisible, isSegmentVisibleById } = useSegmentedAnimation();
  const { reduced } = useReducedMotion();
  const contextAnimation = useRevealAnimation();

  // Visibility
  const visible = useMemo(() => {
    if ('on' in visibilityProps && visibilityProps.on !== undefined) {
      return currentSegmentIndex === visibilityProps.on;
    }

    if ('id' in visibilityProps && visibilityProps.id !== undefined) {
      return isSegmentVisibleById(visibilityProps.id);
    }

    // from (with optional until)
    if ('from' in visibilityProps && visibilityProps.from !== undefined) {
      const fromVisible = isSegmentVisible(visibilityProps.from);

      if (visibilityProps.until !== undefined) {
        if (import.meta.env.DEV && visibilityProps.from > visibilityProps.until) {
          debug.warn(
            `[Reveal] from (${visibilityProps.from}) > until (${visibilityProps.until}) — element will never be visible`,
          );
        }
        return fromVisible && currentSegmentIndex <= visibilityProps.until;
      }

      return fromVisible;
    }

    return false;
  }, [visibilityProps, currentSegmentIndex, isSegmentVisible, isSegmentVisibleById]);

  // Animation resolution: prop > context > default (fadeIn)
  const variants = useMemo(() => {
    const raw = animationProp ?? contextAnimation ?? fadeIn;
    return typeof raw === 'function' ? raw(reduced) : raw;
  }, [animationProp, contextAnimation, reduced]);

  return { visible, variants, reduced };
}
