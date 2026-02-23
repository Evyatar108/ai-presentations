import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

/** Convert #rrggbb to "r, g, b" for rgba() usage */
function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const num = parseInt(h, 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}
import { SearchBar } from './SearchBar';
import { TagFilter } from './TagFilter';
import { SortControls } from './SortControls';
import { ViewToggle } from './ViewToggle';
import type { SortMode, SortDirection, ViewMode } from './types';

interface ToolbarRowProps {
  search: string;
  selectedTags: string[];
  allTags: string[];
  sort: SortMode;
  sortDirection: SortDirection;
  view: ViewMode;
  onSearchChange: (value: string) => void;
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
  onSetSort: (sort: SortMode) => void;
  onSetView: (view: ViewMode) => void;
  resultCount: number;
  totalCount: number;
}

export const ToolbarRow: React.FC<ToolbarRowProps> = ({
  search,
  selectedTags,
  allTags,
  sort,
  sortDirection,
  view,
  onSearchChange,
  onToggleTag,
  onClearTags,
  onSetSort,
  onSetView,
  resultCount,
  totalCount,
}) => {
  const theme = useTheme();
  const hasFilters = search.trim() !== '' || selectedTags.length > 0;

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      background: `rgba(${hexToRgb(theme.colors.bgDeep)}, 0.85)`,
      margin: '0 -2rem',
      padding: '0.75rem 2rem 0.75rem',
      borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
    }}>
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      {/* Top row: search + sort + view toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <SearchBar value={search} onChange={onSearchChange} />
        <SortControls sort={sort} sortDirection={sortDirection} onSetSort={onSetSort} />
        <ViewToggle view={view} onSetView={onSetView} />
      </div>

      {/* Tag row */}
      {allTags.length > 0 && (
        <TagFilter
          allTags={allTags}
          selectedTags={selectedTags}
          onToggleTag={onToggleTag}
          onClearTags={onClearTags}
        />
      )}

      {/* Result count when filtering */}
      {hasFilters && (
        <div style={{
          fontSize: 12,
          color: theme.colors.textMuted,
        }}>
          Showing {resultCount} of {totalCount} demo{totalCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
    </div>
  );
};
