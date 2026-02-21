import type { Variants } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

/**
 * Animation value for Reveal components.
 *
 * - A raw Framer Motion `Variants` object with `hidden` / `visible` keys.
 * - A factory `(reduced: boolean) => Variants` (matches all AnimationVariants factories).
 */
export type RevealAnimation =
  | Variants
  | ((reduced: boolean) => Variants);

/**
 * Discriminated union for visibility props.
 * Only one mode can be used at a time — mixing `from` with `on` is a compile error.
 */
export type RevealVisibilityProps =
  | { from: number; until?: number; on?: never; id?: never }
  | { on: number; from?: never; until?: never; id?: never }
  | { id: string; from?: never; until?: never; on?: never };

/**
 * Common props shared by Reveal and RevealGroup.
 */
interface RevealBaseProps {
  /** Override animation (beats RevealContext default). */
  animation?: RevealAnimation;
  /** Wrapper element type. Default: `'div'`. */
  as?: 'div' | 'span' | 'li' | 'section' | 'article' | 'p';
  /** CSS class on wrapper element. */
  className?: string;
  /** Inline styles on wrapper element. */
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Props for the `<Reveal>` component.
 */
export type RevealProps = RevealBaseProps & RevealVisibilityProps;

/**
 * Props for the `<RevealGroup>` component.
 */
export type RevealGroupProps = RevealBaseProps & RevealVisibilityProps & {
  /** Enable staggered child entrance animation. */
  stagger?: boolean;
  /** Seconds between each child's entrance. Default: `0.15`. */
  staggerDelay?: number;
  /** Seconds before the first child animates in. Default: `0.2`. */
  childDelay?: number;
  /** Animation applied to each child element. Default: `fadeUp`. */
  childAnimation?: RevealAnimation;
};

/**
 * Props for the `<RevealContext>` component.
 */
export interface RevealContextProps {
  /** Default animation for all descendant `<Reveal>` components. */
  animation: RevealAnimation;
  children: ReactNode;
}
