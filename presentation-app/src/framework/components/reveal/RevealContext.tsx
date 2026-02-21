import { createContext, useContext } from 'react';
import type { RevealAnimation, RevealContextProps } from './types';

const RevealAnimationContext = createContext<RevealAnimation | null>(null);

/**
 * Provides a default animation for all descendant `<Reveal>` and `<RevealGroup>` components.
 *
 * ```tsx
 * <RevealContext animation={scaleIn}>
 *   <Reveal from={0}>Uses scaleIn</Reveal>
 *   <Reveal from={1} animation={fadeLeft}>Overrides to fadeLeft</Reveal>
 * </RevealContext>
 * ```
 */
export const RevealContext: React.FC<RevealContextProps> = ({ animation, children }) => (
  <RevealAnimationContext.Provider value={animation}>
    {children}
  </RevealAnimationContext.Provider>
);

/**
 * Internal hook — reads the nearest RevealContext animation (or null).
 */
export function useRevealAnimation(): RevealAnimation | null {
  return useContext(RevealAnimationContext);
}
