import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { RevealAnimation } from './types';
import { useRevealAnimation } from './RevealContext';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { useMarker, useMarkerRange } from '../../hooks/useMarker';
import { fadeIn } from '../../slides/AnimationVariants';
import type { CSSProperties, ReactNode } from 'react';
import type { TargetAndTransition } from 'framer-motion';

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
 * Visibility props: either a point trigger (at) or a bounded range (from/until).
 */
type RevealAtMarkerVisibilityProps =
  | { at: string; from?: never; until?: never }
  | { from: string; until: string; at?: never };

interface RevealAtMarkerBaseProps {
  animation?: RevealAnimation;
  exitAnimation?: RevealAnimation;
  as?: 'div' | 'span' | 'li' | 'section' | 'article' | 'p';
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

type RevealAtMarkerProps = RevealAtMarkerBaseProps & RevealAtMarkerVisibilityProps;

/**
 * Time-based reveal component driven by inline markers in narration text.
 *
 * Two modes:
 *   - `at="X"` — Progressive: visible once audio reaches marker X (stays visible)
 *   - `from="X" until="Y"` — Bounded: visible while audio is between markers X and Y
 *
 * Graceful degradation: when alignment data is missing, children are immediately visible.
 *
 * @example
 * ```tsx
 * // Progressive: appears when narrator reaches {#pipeline}
 * <RevealAtMarker at="pipeline" animation={fadeUp}>
 *   <PipelineDiagram />
 * </RevealAtMarker>
 *
 * // Bounded: visible only between {#llm} and {#topics}
 * <RevealAtMarker from="llm" until="topics">
 *   <LLMHighlight />
 * </RevealAtMarker>
 * ```
 */
export const RevealAtMarker: React.FC<RevealAtMarkerProps> = (props) => {
  const { animation, exitAnimation, as = 'div', className, style, children } = props;
  const { reduced } = useReducedMotion();
  const contextAnimation = useRevealAnimation();
  const MotionElement = motionElements[as];

  // Resolve visibility from marker state
  const visible = useMarkerVisibility(props);

  // Animation resolution: prop > context > default (fadeIn)
  const variants = useMemo(() => {
    const raw = animation ?? contextAnimation ?? fadeIn;
    return typeof raw === 'function' ? raw(reduced) : raw;
  }, [animation, contextAnimation, reduced]);

  // Exit resolution
  const exit = useMemo<TargetAndTransition>(() => {
    if (exitAnimation) {
      const resolved = typeof exitAnimation === 'function' ? exitAnimation(reduced) : exitAnimation;
      return (resolved.hidden ?? resolved.exit ?? { opacity: 0 }) as TargetAndTransition;
    }
    return (variants.exit ?? variants.hidden ?? { opacity: 0 }) as TargetAndTransition;
  }, [exitAnimation, variants, reduced]);

  return (
    <AnimatePresence>
      {visible && (
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

/**
 * Internal hook to resolve visibility from marker props.
 */
function useMarkerVisibility(
  props: RevealAtMarkerProps,
): boolean {
  // Point trigger mode
  const atId = 'at' in props ? (props.at ?? '') : '';
  const atMarker = useMarker(atId);

  // Range mode
  const fromId = 'from' in props ? (props.from ?? '') : '';
  const untilId = 'until' in props ? (props.until ?? '') : '';
  const rangeState = useMarkerRange(fromId, untilId);

  if ('at' in props && props.at !== undefined) {
    return atMarker.reached;
  }

  if ('from' in props && props.from !== undefined) {
    return rangeState.within;
  }

  return false;
}
