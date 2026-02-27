import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../accessibility/ReducedMotion';
import { useTheme } from '../theme/ThemeContext';

export type ArrowDirection = 'right' | 'down' | 'left' | 'up';

export interface AnimatedArrowProps {
  /** Preset direction (default 'right'). Ignored when `path` is provided. */
  direction?: ArrowDirection;
  /** Arrow length in pixels (default 120). Ignored when `path` is provided. */
  length?: number;
  /** Stroke color (overrides theme.colors.primary) */
  color?: string;
  /** Stroke width in pixels (default 3) */
  strokeWidth?: number;
  /** Animation delay in seconds (default 0) */
  delay?: number;
  /**
   * Custom SVG path data. When provided, `direction` and `length` are ignored.
   * The component uses the path's bounding box to size the SVG.
   * Must include the arrowhead tip as the final point.
   */
  path?: string;
  /** viewBox width when using custom path (default 200) */
  viewBoxWidth?: number;
  /** viewBox height when using custom path (default 100) */
  viewBoxHeight?: number;
  /** Arrowhead size in pixels (default 10) */
  headSize?: number;
  /** Inline style for the outer svg element */
  style?: React.CSSProperties;
}

/**
 * Self-drawing SVG arrow with an arrowhead marker.
 *
 * Uses Framer Motion `pathLength` to animate the stroke from start to tip.
 * Supports four preset directions or a fully custom SVG path for bezier curves.
 * In reduced-motion mode, shows the final state immediately.
 *
 * @example
 * ```tsx
 * <AnimatedArrow direction="right" length={150} />
 * <AnimatedArrow direction="down" length={80} color="#22c55e" />
 * <AnimatedArrow path="M 10 50 C 40 10, 160 10, 190 50" viewBoxWidth={200} viewBoxHeight={60} />
 * ```
 */
export const AnimatedArrow: React.FC<AnimatedArrowProps> = ({
  direction = 'right',
  length = 120,
  color,
  strokeWidth = 3,
  delay = 0,
  path,
  viewBoxWidth = 200,
  viewBoxHeight = 100,
  headSize = 10,
  style,
}) => {
  const { reduced } = useReducedMotion();
  const theme = useTheme();
  const markerId = useId();

  const arrowColor = color ?? theme.colors.primary;
  const skipAnimation = reduced;

  // Padding so the arrowhead doesn't clip
  const pad = headSize;

  // Build SVG dimensions and path for preset directions
  let svgWidth: number;
  let svgHeight: number;
  let pathData: string;

  if (path) {
    // Custom path mode
    svgWidth = viewBoxWidth;
    svgHeight = viewBoxHeight;
    pathData = path;
  } else {
    switch (direction) {
      case 'right':
        svgWidth = length + pad;
        svgHeight = pad * 2 + strokeWidth;
        pathData = `M ${pad} ${svgHeight / 2} L ${length} ${svgHeight / 2}`;
        break;
      case 'left':
        svgWidth = length + pad;
        svgHeight = pad * 2 + strokeWidth;
        pathData = `M ${length} ${svgHeight / 2} L ${pad} ${svgHeight / 2}`;
        break;
      case 'down':
        svgWidth = pad * 2 + strokeWidth;
        svgHeight = length + pad;
        pathData = `M ${svgWidth / 2} ${pad} L ${svgWidth / 2} ${length}`;
        break;
      case 'up':
        svgWidth = pad * 2 + strokeWidth;
        svgHeight = length + pad;
        pathData = `M ${svgWidth / 2} ${length} L ${svgWidth / 2} ${pad}`;
        break;
    }
  }

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      fill="none"
      aria-label={path ? 'Arrow' : `Arrow ${direction}`}
      role="img"
      style={style}
    >
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={headSize}
          markerHeight={headSize}
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 8 5 L 0 9 Z" fill={arrowColor} />
        </marker>
      </defs>
      <motion.path
        d={pathData}
        stroke={arrowColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        markerEnd={`url(#${markerId})`}
        initial={{ pathLength: skipAnimation ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={
          skipAnimation
            ? { duration: 0 }
            : { type: 'spring', duration: 0.8, bounce: 0.1, delay }
        }
      />
    </svg>
  );
};
