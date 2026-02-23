import React from 'react';
import type { DemoMetadata } from '../../demos/types';
import { DemoCard } from './DemoCard';
import { DemoListItem } from './DemoListItem';
import type { ViewMode } from './types';

interface DemoGridProps {
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

export const DemoGrid: React.FC<DemoGridProps> = ({
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
  if (viewMode === 'list') {
    return (
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxWidth: 1200,
        margin: '0 auto',
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
      </main>
    );
  }

  return (
    <main style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      maxWidth: 1200,
      margin: '0 auto'
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
    </main>
  );
};
