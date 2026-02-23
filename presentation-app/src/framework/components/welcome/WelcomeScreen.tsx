import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DemoRegistry } from '../../demos/DemoRegistry';
import type { DemoMetadata } from '../../demos/types';
import { useTheme } from '../../theme/ThemeContext';
import { useWelcomeState } from '../../hooks/useWelcomeState';
import { useFavorites } from '../../hooks/useFavorites';
import { getParam, getParamList, setParams } from '../../hooks/useUrlParams';
import { WelcomeHeader } from './WelcomeHeader';
import { WelcomeFooter } from './WelcomeFooter';
import { ToolbarRow } from './ToolbarRow';
import { DemoGrid } from './DemoGrid';
import { DurationBreakdownModal } from './DurationBreakdownModal';
import { FavoritesSection } from './FavoritesSection';
import { RecentlyViewedSection } from './RecentlyViewedSection';
import { CategorySection } from './CategorySection';
import type { SortMode, SortDirection, ViewMode } from './types';

interface WelcomeScreenProps {
  onSelectDemo: (demoId: string) => void;
}

const VALID_SORTS: SortMode[] = ['default', 'alpha', 'duration', 'category'];
const VALID_VIEWS: ViewMode[] = ['grid', 'list'];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectDemo }) => {
  const theme = useTheme();
  const [demos, setDemos] = useState<DemoMetadata[]>([]);
  const [actualRuntime, setActualRuntime] = useState<Record<string, { elapsed: number; plannedTotal: number }>>({});
  const initializedRef = useRef(false);

  const { state, dispatch, allTags, filteredDemos, groupedDemos } = useWelcomeState(demos);
  const { favorites, recentlyViewed, toggleFavorite, recordView } = useFavorites();

  // Build demo lookup for favorites/recent sections
  const demoMap = useMemo(() => {
    const map = new Map<string, DemoMetadata>();
    for (const d of demos) map.set(d.id, d);
    return map;
  }, [demos]);

  const favoriteDemos = useMemo(
    () => Array.from(favorites).map(id => demoMap.get(id)).filter((d): d is DemoMetadata => d !== undefined),
    [favorites, demoMap]
  );

  const recentDemos = useMemo(
    () => recentlyViewed.map(id => demoMap.get(id)).filter((d): d is DemoMetadata => d !== undefined),
    [recentlyViewed, demoMap]
  );

  const handleSelectDemo = (demoId: string) => {
    recordView(demoId);
    onSelectDemo(demoId);
  };

  useEffect(() => {
    const allDemos = DemoRegistry.getAllMetadata().filter(d => !d.hidden);
    setDemos(allDemos);
  }, []);

  // Restore state from URL params on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const q = getParam('q');
    const tags = getParamList('tags');
    const sortParam = getParam('sort') as SortMode | null;
    const dirParam = getParam('dir') as SortDirection | null;
    const viewParam = getParam('view') as ViewMode | null;

    const payload: Record<string, unknown> = {};
    if (q) payload.search = q;
    if (tags.length > 0) payload.selectedTags = tags;
    if (sortParam && VALID_SORTS.includes(sortParam)) payload.sort = sortParam;
    if (dirParam === 'asc' || dirParam === 'desc') payload.sortDirection = dirParam;
    if (viewParam && VALID_VIEWS.includes(viewParam)) payload.view = viewParam;

    if (Object.keys(payload).length > 0) {
      dispatch({ type: 'RESTORE_FROM_URL', payload: payload as Record<string, string> });
    }
  }, [dispatch]);

  // Sync state changes to URL params (replaceState — no history pollution)
  useEffect(() => {
    if (!initializedRef.current) return;
    setParams({
      q: state.search.trim() || null,
      tags: state.selectedTags.length > 0 ? state.selectedTags.join(',') : null,
      sort: state.sort !== 'default' ? state.sort : null,
      dir: state.sortDirection !== 'asc' ? state.sortDirection : null,
      view: state.view !== 'grid' ? state.view : null,
    });
  }, [state.search, state.selectedTags, state.sort, state.sortDirection, state.view]);

  // Load persisted actual runtimes and validate against current planned totals
  useEffect(() => {
    if (demos.length === 0) return;
    const next: Record<string, { elapsed: number; plannedTotal: number }> = {};
    for (const demo of demos) {
      try {
        const key = `demoRuntime:${demo.id}`;
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (typeof parsed.elapsed !== 'number' || typeof parsed.plannedTotal !== 'number') {
          localStorage.removeItem(key);
          continue;
        }
        const currentPlanned = demo.durationInfo?.total;
        if (currentPlanned != null && Math.abs(currentPlanned - parsed.plannedTotal) > 0.001) {
          localStorage.removeItem(key);
          continue;
        }
        next[demo.id] = { elapsed: parsed.elapsed, plannedTotal: parsed.plannedTotal };
      } catch {
        localStorage.removeItem(`demoRuntime:${demo.id}`);
      }
    }
    setActualRuntime(next);
  }, [demos]);

  const breakdownDemo = useMemo(
    () => (state.showBreakdown ? demos.find(d => d.id === state.showBreakdown) : undefined),
    [state.showBreakdown, demos]
  );

  if (demos.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.colors.bgDeep} 0%, ${theme.colors.bgSurface} 100%)`,
        fontFamily: theme.fontFamily,
        color: theme.colors.textPrimary
      }}>
        <p>Loading demos...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.colors.bgDeep} 0%, ${theme.colors.bgSurface} 100%)`,
      padding: '3rem 2rem',
      fontFamily: theme.fontFamily,
      scrollBehavior: 'smooth' as const
    }}>
      <WelcomeHeader />

      <ToolbarRow
        search={state.search}
        selectedTags={state.selectedTags}
        allTags={allTags}
        sort={state.sort}
        sortDirection={state.sortDirection}
        view={state.view}
        onSearchChange={(v) => dispatch({ type: 'SET_SEARCH', payload: v })}
        onToggleTag={(t) => dispatch({ type: 'TOGGLE_TAG', payload: t })}
        onClearTags={() => dispatch({ type: 'CLEAR_TAGS' })}
        onSetSort={(s) => dispatch({ type: 'SET_SORT', payload: s })}
        onSetView={(v) => dispatch({ type: 'SET_VIEW', payload: v })}
        resultCount={filteredDemos.length}
        totalCount={demos.length}
      />

      <FavoritesSection
        demos={favoriteDemos}
        onSelect={handleSelectDemo}
        onToggleFavorite={toggleFavorite}
      />

      <RecentlyViewedSection
        demos={recentDemos}
        onSelect={handleSelectDemo}
      />

      {state.sort === 'category' ? (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {Array.from(groupedDemos.entries()).map(([category, categoryDemos]) => (
            <CategorySection
              key={category}
              category={category}
              demos={categoryDemos}
              viewMode={state.view}
              hoveredId={state.hoveredId}
              actualRuntime={actualRuntime}
              favorites={favorites}
              onHover={(id) => dispatch({ type: 'SET_HOVERED', payload: id })}
              onSelect={handleSelectDemo}
              onShowBreakdown={(id) => dispatch({ type: 'SHOW_BREAKDOWN', payload: id })}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <DemoGrid
          demos={filteredDemos}
          viewMode={state.view}
          hoveredId={state.hoveredId}
          actualRuntime={actualRuntime}
          favorites={favorites}
          onHover={(id) => dispatch({ type: 'SET_HOVERED', payload: id })}
          onSelect={handleSelectDemo}
          onShowBreakdown={(id) => dispatch({ type: 'SHOW_BREAKDOWN', payload: id })}
          onToggleFavorite={toggleFavorite}
        />
      )}

      <DurationBreakdownModal
        demo={breakdownDemo}
        actualRuntime={state.showBreakdown ? actualRuntime[state.showBreakdown] : undefined}
        onClose={() => dispatch({ type: 'SHOW_BREAKDOWN', payload: null })}
      />

      <WelcomeFooter />
    </div>
  );
};
