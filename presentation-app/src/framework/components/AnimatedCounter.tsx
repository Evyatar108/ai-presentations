import React, { useEffect, useRef } from 'react';
import { useMotionValue, useTransform, animate } from 'framer-motion';
import { useReducedMotion } from '../accessibility/ReducedMotion';

export interface AnimatedCounterProps {
  /** Start value (default 0) */
  from?: number;
  /** Target value */
  to: number;
  /** Optional suffix (e.g. "%") */
  suffix?: string;
  /** Optional prefix (e.g. "~") */
  prefix?: string;
  /** Animation duration in seconds (default 1.5) */
  duration?: number;
  /** Decimal places (default 0) */
  decimals?: number;
}

/**
 * Animated counting-up number display.
 *
 * In reduced-motion mode, shows the final value immediately.
 *
 * @example
 * ```tsx
 * <AnimatedCounter to={75} suffix="%" duration={1.5} />
 * <AnimatedCounter from={0} to={600} prefix="~" />
 * ```
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from = 0,
  to,
  suffix = '',
  prefix = '',
  duration = 1.5,
  decimals = 0,
}) => {
  const { reduced } = useReducedMotion();
  const motionValue = useMotionValue(from);
  const rounded = useTransform(motionValue, (v) => v.toFixed(decimals));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduced) {
      motionValue.set(to);
      return;
    }

    motionValue.set(from);
    const controls = animate(motionValue, to, {
      duration,
      ease: 'easeOut',
    });

    return () => controls.stop();
  }, [from, to, duration, reduced, motionValue]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${v}${suffix}`;
      }
    });
    return unsubscribe;
  }, [rounded, prefix, suffix]);

  return <span ref={ref}>{`${prefix}${reduced ? to.toFixed(decimals) : from.toFixed(decimals)}${suffix}`}</span>;
};
