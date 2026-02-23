import React from 'react';
import { CodeBlock } from './CodeBlock';
import type { CodeBlockProps } from './CodeBlock';
import { useMarker } from '../hooks/useMarker';

export interface MarkerCodeBlockProps extends Omit<CodeBlockProps, 'highlightLines'> {
  /** Map of marker IDs to line numbers that should highlight when that marker is reached */
  markerLines: Record<string, number[]>;
}

/**
 * Internal component to read a single marker's reached state.
 * Extracted so hooks are called unconditionally at the top level.
 */
const useMarkerReachedLines = (markerLines: Record<string, number[]>): number[] => {
  // Build a stable list of entries to iterate — order is deterministic
  // because we derive it from Object.entries at render time.
  const entries = Object.entries(markerLines);

  // We call useMarker for each entry. The number of entries must be stable
  // across renders (same as number of hooks). This is safe when markerLines
  // is a constant object (the expected usage pattern).
  const results = entries.map(([markerId]) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { reached } = useMarker(markerId);
    return reached;
  });

  const lines: number[] = [];
  entries.forEach(([, lineNums], i) => {
    if (results[i]) {
      lines.push(...lineNums);
    }
  });

  return lines;
};

/**
 * CodeBlock wrapper with built-in marker-driven line highlighting.
 *
 * Instead of manually wiring `useMarker()` hooks and building `highlightLines`,
 * pass a `markerLines` mapping and the component handles the rest.
 *
 * @example
 * ```tsx
 * <MarkerCodeBlock
 *   code={PYTHON_CODE}
 *   language="python"
 *   title="utils.py"
 *   fontSize={12}
 *   markerLines={{
 *     'outer-loop': [11],
 *     'inner-loop': [12],
 *     'return': [15, 16],
 *   }}
 * />
 * ```
 */
export const MarkerCodeBlock: React.FC<MarkerCodeBlockProps> = ({
  markerLines,
  ...codeBlockProps
}) => {
  const lines = useMarkerReachedLines(markerLines);

  return (
    <CodeBlock
      {...codeBlockProps}
      highlightLines={lines.length > 0 ? lines : undefined}
    />
  );
};
