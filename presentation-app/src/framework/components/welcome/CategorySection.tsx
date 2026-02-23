import React from 'react';
import type { DemoMetadata } from '../../demos/types';
import { useTheme } from '../../theme/ThemeContext';
import { DemoCard } from './DemoCard';
import { DemoListItem } from './DemoListItem';
import type { ViewMode } from './types';

interface CategorySectionProps {
  category: string;
  demos: DemoMetadata[];
  viewMode: ViewMode;
  hoveredId: string | null;
  actualRuntime: Record<string, { elapsed: number; plannedTotal: number }>;
  favorites: ReadonlySet<string>;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onShowBreakdown: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  demos,
  viewMode,
  hoveredId,
  actualRuntime,
  favorites,
  onHover,
  onSelect,
  onShowBreakdown,
  onToggleFavorite,
}) => {
  const theme = useTheme();

  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <h3 style={{
        fontSize: 18,
        fontWeight: 600,
        color: theme.colors.textPrimary,
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: `1px solid rgba(148, 163, 184, 0.15)`,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        {category}
        <span style={{
          fontSize: 12,
          fontWeight: 400,
          color: theme.colors.textMuted,
          textTransform: 'none',
          letterSpacing: 'normal',
        }}>
          ({demos.length})
        </span>
      </h3>
      {viewMode === 'list' ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          {demos.map((demo, index) => (
            <DemoListItem
              key={demo.id}
              demo={demo}
              index={index}
              isHovered={hoveredId === demo.id}
              actualRuntime={actualRuntime[demo.id]}
              onHover={onHover}
              onSelect={onSelect}
              isFavorite={favorites.has(demo.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 500px), 1fr))',
          gap: '2rem',
        }}>
          {demos.map((demo, index) => (
            <DemoCard
              key={demo.id}
              demo={demo}
              index={index}
              isHovered={hoveredId === demo.id}
              actualRuntime={actualRuntime[demo.id]}
              onHover={onHover}
              onSelect={onSelect}
              onShowBreakdown={onShowBreakdown}
              isFavorite={favorites.has(demo.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </section>
  );
};
