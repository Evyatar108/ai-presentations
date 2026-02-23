import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import type { ViewMode } from './types';

interface ViewToggleProps {
  view: ViewMode;
  onSetView: (view: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onSetView }) => {
  const theme = useTheme();

  const btnStyle = (active: boolean): React.CSSProperties => ({
    background: active ? 'rgba(148, 163, 184, 0.15)' : 'none',
    border: 'none',
    color: active ? theme.colors.textPrimary : theme.colors.textMuted,
    cursor: 'pointer',
    padding: '0.35rem 0.5rem',
    borderRadius: 6,
    fontSize: 14,
    lineHeight: 1,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  return (
    <div style={{
      display: 'flex',
      gap: '0.15rem',
      alignItems: 'center',
      background: 'rgba(15, 23, 42, 0.4)',
      borderRadius: 8,
      padding: '0.15rem',
      border: '1px solid rgba(148, 163, 184, 0.15)',
    }}>
      <button
        onClick={() => onSetView('grid')}
        aria-pressed={view === 'grid'}
        aria-label="Grid view"
        title="Grid view — show demo cards in a grid"
        style={btnStyle(view === 'grid')}
      >
        {/* Grid icon - 4 squares */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="9" width="6" height="6" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      </button>
      <button
        onClick={() => onSetView('list')}
        aria-pressed={view === 'list'}
        aria-label="List view"
        title="List view — show demos as compact rows"
        style={btnStyle(view === 'list')}
      >
        {/* List icon - 3 horizontal bars */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="2" width="14" height="2.5" rx="1" />
          <rect x="1" y="6.75" width="14" height="2.5" rx="1" />
          <rect x="1" y="11.5" width="14" height="2.5" rx="1" />
        </svg>
      </button>
    </div>
  );
};
