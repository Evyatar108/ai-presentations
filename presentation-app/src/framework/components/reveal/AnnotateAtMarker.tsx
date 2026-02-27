import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { RoughNotation } from 'react-rough-notation';
import { useMarker, useMarkerRange } from '../../hooks/useMarker';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { useTheme } from '../../theme/ThemeContext';

type AnnotationType = 'underline' | 'box' | 'circle' | 'highlight' | 'strike-through' | 'crossed-off' | 'bracket';
type BracketPosition = 'left' | 'right' | 'top' | 'bottom';

/**
 * Visibility props: either a point trigger (at) or a bounded range (from/until).
 */
type AnnotateVisibilityProps =
  | { at: string; from?: never; until?: never }
  | { from: string; until: string; at?: never };

interface AnnotateAtMarkerBaseProps {
  /** Annotation style */
  type: AnnotationType;
  /** Stroke/highlight color (default: theme.colors.primary) */
  color?: string;
  /** Animation duration in ms (default: 600; 0 when reduced motion) */
  animationDuration?: number;
  /** Stroke width in px (default: 2) */
  strokeWidth?: number;
  /** Padding around the annotated element (default: 5) */
  padding?: number | [number, number] | [number, number, number, number];
  /** Number of draw iterations (default: 2) */
  iterations?: number;
  /** Support multiline text (default: true) */
  multiline?: boolean;
  /** Bracket positions — only used when type="bracket" */
  brackets?: BracketPosition | BracketPosition[];

  children: ReactNode;
  /** Inline styles on the wrapper span */
  style?: CSSProperties;
}

export type AnnotateAtMarkerProps = AnnotateAtMarkerBaseProps & AnnotateVisibilityProps;

// Stable default values to avoid re-creating objects on every render
const DEFAULT_PADDING = 5;
const DEFAULT_ITERATIONS = 2;
const DEFAULT_STROKE_WIDTH = 2;
const DEFAULT_ANIMATION_DURATION = 600;

/**
 * Marker-driven hand-drawn annotation wrapper using rough-notation.
 *
 * Two modes:
 *   - `at="X"` — Progressive: annotation shows once audio reaches marker X (stays shown)
 *   - `from="X" until="Y"` — Bounded: annotation visible while audio is between X and Y
 *
 * Graceful degradation: when alignment data is missing, annotation shows immediately.
 *
 * @example
 * ```tsx
 * // Circle a key number when narrator mentions it
 * <AnnotateAtMarker at="cost" type="circle" color="#ff6b6b">
 *   $2.4M
 * </AnnotateAtMarker>
 *
 * // Highlight text during a bounded range
 * <AnnotateAtMarker from="start" until="end" type="highlight" color="rgba(255,220,100,0.4)">
 *   important phrase
 * </AnnotateAtMarker>
 *
 * // Bracket annotation
 * <AnnotateAtMarker at="section" type="bracket" brackets={['left', 'right']}>
 *   <SectionContent />
 * </AnnotateAtMarker>
 * ```
 */
export const AnnotateAtMarker: React.FC<AnnotateAtMarkerProps> = (props) => {
  const {
    type,
    color,
    animationDuration = DEFAULT_ANIMATION_DURATION,
    strokeWidth = DEFAULT_STROKE_WIDTH,
    padding = DEFAULT_PADDING,
    iterations = DEFAULT_ITERATIONS,
    multiline = true,
    brackets,
    children,
    style,
  } = props;

  const { reduced } = useReducedMotion();
  const theme = useTheme();
  const visible = useAnnotateVisibility(props);

  const resolvedColor = color ?? theme.colors.primary;
  const resolvedDuration = reduced ? 0 : animationDuration;

  // Memoize brackets array to keep a stable reference
  const resolvedBrackets = useMemo(() => brackets, [
    // For primitive string, just use the value directly
    // For arrays, join to create a stable comparison key
    Array.isArray(brackets) ? brackets.join(',') : brackets,
  ]);

  const wrapperRef = useRef<HTMLSpanElement>(null);

  // Detect ancestor CSS transform scale and apply a counter-scale to
  // rough-notation's SVG so annotations position correctly under zoom.
  // rough-notation uses getBoundingClientRect() (which returns scaled coords)
  // for SVG path coordinates, but the SVG is also visually scaled by the
  // ancestor transform — causing double-scaling. Counter-scaling the SVG fixes this.
  const fixAnnotationScale = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const svg = el.querySelector<SVGSVGElement>('svg.rough-annotation');
    if (!svg) return;

    // Detect effective visual scale by comparing layout size vs BCR size
    const scaleX = el.offsetWidth > 0 ? el.getBoundingClientRect().width / el.offsetWidth : 1;

    if (Math.abs(scaleX - 1) > 0.01) {
      svg.style.transform = `scale(${1 / scaleX})`;
      svg.style.transformOrigin = '0 0';
    } else {
      svg.style.transform = '';
    }
  }, []);

  useEffect(() => {
    if (!visible || !wrapperRef.current) return;

    // rough-notation creates the SVG asynchronously after show=true.
    // Use a MutationObserver to catch SVG insertion and apply the fix.
    const observer = new MutationObserver(() => fixAnnotationScale());
    observer.observe(wrapperRef.current, { childList: true, subtree: true });

    // Also run immediately in case SVG already exists
    fixAnnotationScale();

    return () => observer.disconnect();
  }, [visible, fixAnnotationScale]);

  return (
    <span ref={wrapperRef} style={style}>
      <RoughNotation
        type={type}
        show={visible}
        color={resolvedColor}
        animate={!reduced}
        animationDuration={resolvedDuration}
        strokeWidth={strokeWidth}
        padding={padding}
        iterations={iterations}
        multiline={multiline}
        brackets={resolvedBrackets}
      >
        {children}
      </RoughNotation>
    </span>
  );
};

/**
 * Internal hook to resolve visibility from marker props.
 * Same pattern as RevealAtMarker's useMarkerVisibility.
 */
function useAnnotateVisibility(props: AnnotateAtMarkerProps): boolean {
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
