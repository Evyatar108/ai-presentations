import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import type { SortMode } from './types';

interface SortControlsProps {
  sort: SortMode;
  onSetSort: (sort: SortMode) => void;
}

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'alpha', label: 'A\u2013Z' },
  { value: 'duration', label: 'Duration' },
  { value: 'category', label: 'Category' },
];

export const SortControls: React.FC<SortControlsProps> = ({ sort, onSetSort }) => {
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
        return (
          <button
            key={opt.value}
            onClick={() => onSetSort(opt.value)}
            aria-pressed={active}
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
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
