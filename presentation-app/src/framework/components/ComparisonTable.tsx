import React from 'react';
import type { CSSProperties } from 'react';
import { useTheme } from '../theme/ThemeContext';

export interface ComparisonColumn {
  header: string;
  color?: string;
}

export interface ComparisonTableProps {
  columns: ComparisonColumn[];
  rows: string[][];
  fontSize?: number;
  style?: CSSProperties;
}

/**
 * Comparison table — theme-aware table with styled headers and color-coded columns.
 *
 * The first column is treated as the label column (uses textPrimary regardless of color).
 * Remaining columns use their respective `color` from the column definition.
 *
 * @example
 * ```tsx
 * <ComparisonTable
 *   columns={[
 *     { header: 'Aspect' },
 *     { header: 'V1', color: theme.colors.warning },
 *     { header: 'V2', color: theme.colors.primary },
 *   ]}
 *   rows={[
 *     ['Speaker', 'Per-utterance key', 'Once per turn'],
 *     ['Timestamps', 'Start + End', 'Omitted'],
 *   ]}
 * />
 * ```
 */
export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  columns,
  rows,
  fontSize = 13,
  style,
}) => {
  const theme = useTheme();

  return (
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      fontSize,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      ...style,
    }}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.header} style={{
              padding: '0.5rem 1rem',
              borderBottom: `1px solid ${theme.colors.bgBorder}`,
              color: theme.colors.textSecondary,
              fontWeight: 600,
              textAlign: 'left',
            }}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {row.map((cell, colIdx) => (
              <td key={colIdx} style={{
                padding: '0.4rem 1rem',
                color: colIdx === 0
                  ? theme.colors.textPrimary
                  : columns[colIdx]?.color ?? theme.colors.textPrimary,
                fontWeight: colIdx === 0 ? 600 : undefined,
              }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
