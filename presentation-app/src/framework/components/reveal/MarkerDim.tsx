import React from 'react';
import type { ElementType, ReactNode, CSSProperties } from 'react';
import { useMarker } from '../../hooks/useMarker';

export interface MarkerDimProps {
  /** Marker ID; content is dimmed until this marker is reached */
  at?: string;
  /** Marker ID; content dims after this marker is reached */
  until?: string;
  /** Inverse of `at`; content dims when this marker IS reached */
  notAt?: string;
  /** Opacity when dimmed (default: 0.15) */
  dimOpacity?: number;
  /** Transition duration in seconds (default: 0.4) */
  duration?: number;
  /** HTML element type (default: 'div') */
  as?: ElementType;
  /** Additional inline styles */
  style?: CSSProperties;
  /** Additional CSS class */
  className?: string;
  children: ReactNode;
}

/**
 * Declarative marker-driven dimming wrapper.
 *
 * Unlike `RevealAtMarker` (binary show/hide), `MarkerDim` keeps content
 * always visible but toggles between full and dimmed opacity.
 *
 * Three modes:
 *   - `at="id"` — dimmed until marker reached, then full opacity (progressive)
 *   - `until="id"` — full opacity until marker reached, then dims
 *   - `notAt="id"` — full opacity until marker reached, then dims (alias for until)
 *
 * @example
 * ```tsx
 * // Progressive: dims until marker reached
 * <MarkerDim at="pipeline">
 *   <PipelineBox />
 * </MarkerDim>
 *
 * // Inverse: full opacity until marker, then dims
 * <MarkerDim until="next-section">
 *   <PreviousContent />
 * </MarkerDim>
 * ```
 */
export const MarkerDim: React.FC<MarkerDimProps> = ({
  at,
  until,
  notAt,
  dimOpacity = 0.15,
  duration = 0.4,
  as: Component = 'div',
  style,
  className,
  children,
}) => {
  // Resolve which marker ID to track
  const markerId = at ?? until ?? notAt ?? '';
  const { reached } = useMarker(markerId);

  // Determine if content should be at full opacity
  let fullOpacity: boolean;
  if (at) {
    // Progressive: dimmed until reached
    fullOpacity = reached;
  } else if (until || notAt) {
    // Inverse: full until reached, then dims
    fullOpacity = !reached;
  } else {
    // No marker specified — always full
    fullOpacity = true;
  }

  return (
    <Component
      className={className}
      style={{
        ...style,
        opacity: fullOpacity ? 1 : dimOpacity,
        transition: `opacity ${duration}s ease`,
      }}
    >
      {children}
    </Component>
  );
};
