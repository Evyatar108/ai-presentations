import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import type { SortMode, SortDirection } from './types';

interface SortControlsProps {
  sort: SortMode;
  sortDirection: SortDirection;
  onSetSort: (sort: SortMode) => void;
}

const SORT_OPTIONS: { value: SortMode; label: string; hint: string; reversible: boolean }[] = [
  { value: 'default', label: 'Default', hint: 'Original registration order', reversible: false },
  { value: 'alpha', label: 'A\u2013Z', hint: 'Sort alphabetically by title', reversible: true },
  { value: 'duration', label: 'Duration', hint: 'Sort by presentation length', reversible: true },
  { value: 'category', label: 'Category', hint: 'Group by first tag', reversible: false },
];

export const SortControls: React.FC<SortControlsProps> = ({ sort, sortDirection, onSetSort }) => {
  const theme = useTheme();

  return (
    <div style={{
      display: 'flex',
      gap: '0.25rem',
      alignItems: 'center',
    }}>
      <span style={{
        fontSize: 11,
        color: theme.colors.textMuted,
        marginRight: '0.3rem',
        whiteSpace: 'nowrap',
      }}>
        Sort:
      </span>
      {SORT_OPTIONS.map(opt => {
        const active = sort === opt.value;
        const arrow = active && opt.reversible
          ? (sortDirection === 'asc' ? ' \u25B2' : ' \u25BC')
          : '';
        return (
          <button
            key={opt.value}
            onClick={() => onSetSort(opt.value)}
            aria-pressed={active}
            title={active && opt.reversible
              ? `Click to reverse (currently ${sortDirection === 'asc' ? 'ascending' : 'descending'})`
              : active ? opt.hint : `${opt.hint} — click to activate`}
            style={{
              fontSize: 11,
              fontWeight: active ? 600 : 400,
              color: active ? theme.colors.textPrimary : theme.colors.textMuted,
              background: active ? 'rgba(148, 163, 184, 0.15)' : 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.3rem 0.6rem',
              borderRadius: 6,
              transition: 'all 0.2s ease',
            }}
          >
            {opt.label}{arrow}
          </button>
        );
      })}
    </div>
  );
};
