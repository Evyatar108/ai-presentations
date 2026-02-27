import React from 'react';
import type { ReactNode } from 'react';
import { Reveal } from './reveal/Reveal';
import { RevealSequence } from './reveal/RevealSequence';
import type { RevealAnimation } from './reveal/types';

export interface RevealCarouselProps {
  /** Items to cycle through — each child gets its own segment. */
  children: ReactNode[];
  /** Segment offset for the first child. Default: `0`. */
  startFrom?: number;
  /** Entrance animation applied to each child. */
  animation?: RevealAnimation;
  /** Exit animation applied to each child. */
  exitAnimation?: RevealAnimation;
  /** Delay (ms) between exit completing and entrance starting. Default: `500`. */
  delay?: number;
}

/**
 * RevealCarousel — auto-wires `<Reveal from={i} until={i}>` for each child
 * inside a `<RevealSequence>`, creating a one-at-a-time carousel.
 *
 * Eliminates manual `from`/`until` index arithmetic and off-by-one bugs.
 *
 * @example
 * ```tsx
 * <RevealCarousel startFrom={2} animation={fadeUp}>
 *   <div>Shown on segment 2</div>
 *   <div>Shown on segment 3</div>
 *   <div>Shown on segment 4</div>
 * </RevealCarousel>
 * ```
 */
export const RevealCarousel: React.FC<RevealCarouselProps> = ({
  children,
  startFrom = 0,
  animation,
  exitAnimation,
  delay,
}) => {
  return (
    <RevealSequence delay={delay}>
      {React.Children.map(children, (child, i) => {
        const segment = startFrom + i;
        return (
          <Reveal
            from={segment}
            until={segment}
            animation={animation}
            exitAnimation={exitAnimation}
          >
            {child}
          </Reveal>
        );
      })}
    </RevealSequence>
  );
};
