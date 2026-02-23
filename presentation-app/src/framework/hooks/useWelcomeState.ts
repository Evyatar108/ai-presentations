import { useReducer, useMemo } from 'react';
import type { DemoMetadata } from '../demos/types';
import type { WelcomeState, WelcomeAction, SortMode } from '../components/welcome/types';

function getInitialState(): WelcomeState {
  let view: WelcomeState['view'] = 'grid';
  try {
    const stored = localStorage.getItem('welcome:viewMode');
    if (stored === 'list') view = 'list';
  } catch {
    // localStorage unavailable
  }
  return {
    search: '',
    selectedTags: [],
    sort: 'default',
    view,
    hoveredId: null,
    showBreakdown: null,
  };
}

function reducer(state: WelcomeState, action: WelcomeAction): WelcomeState {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'TOGGLE_TAG': {
      const tag = action.payload;
      const tags = state.selectedTags.includes(tag)
        ? state.selectedTags.filter(t => t !== tag)
        : [...state.selectedTags, tag];
      return { ...state, selectedTags: tags };
    }
    case 'CLEAR_TAGS':
      return { ...state, selectedTags: [] };
    case 'SET_SORT':
      return { ...state, sort: action.payload };
    case 'SET_VIEW':
      try { localStorage.setItem('welcome:viewMode', action.payload); } catch { /* noop */ }
      return { ...state, view: action.payload };
    case 'SET_HOVERED':
      return { ...state, hoveredId: action.payload };
    case 'SHOW_BREAKDOWN':
      return { ...state, showBreakdown: action.payload };
    case 'RESTORE_FROM_URL':
      return {
        ...state,
        ...(action.payload.search !== undefined && { search: action.payload.search }),
        ...(action.payload.selectedTags !== undefined && { selectedTags: action.payload.selectedTags }),
        ...(action.payload.sort !== undefined && { sort: action.payload.sort }),
        ...(action.payload.view !== undefined && { view: action.payload.view }),
      };
    default:
      return state;
  }
}

function matchesSearch(demo: DemoMetadata, query: string): boolean {
  const q = query.toLowerCase();
  if (demo.title.toLowerCase().includes(q)) return true;
  if (demo.description?.toLowerCase().includes(q)) return true;
  if (demo.tags?.some(t => t.toLowerCase().includes(q))) return true;
  return false;
}

function sortDemos(demos: DemoMetadata[], mode: SortMode): DemoMetadata[] {
  if (mode === 'default') return demos;
  const sorted = [...demos];
  if (mode === 'alpha') {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (mode === 'duration') {
    sorted.sort((a, b) => {
      const aDur = a.durationInfo?.total ?? Infinity;
      const bDur = b.durationInfo?.total ?? Infinity;
      return aDur - bDur;
    });
  }
  return sorted;
}

export function useWelcomeState(allDemos: DemoMetadata[]) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const demo of allDemos) {
      if (demo.tags) {
        for (const tag of demo.tags) tagSet.add(tag);
      }
    }
    return Array.from(tagSet).sort();
  }, [allDemos]);

  const filteredDemos = useMemo(() => {
    let result = allDemos;

    // Search filter
    if (state.search.trim()) {
      result = result.filter(d => matchesSearch(d, state.search.trim()));
    }

    // Tag filter (OR among selected tags)
    if (state.selectedTags.length > 0) {
      result = result.filter(d =>
        d.tags?.some(t => state.selectedTags.includes(t))
      );
    }

    // Sort
    result = sortDemos(result, state.sort);

    return result;
  }, [allDemos, state.search, state.selectedTags, state.sort]);

  // Group demos by first tag for category view
  const groupedDemos = useMemo(() => {
    const groups = new Map<string, DemoMetadata[]>();
    for (const demo of filteredDemos) {
      const category = demo.tags?.[0] ?? 'Other';
      const group = groups.get(category);
      if (group) {
        group.push(demo);
      } else {
        groups.set(category, [demo]);
      }
    }
    return groups;
  }, [filteredDemos]);

  return {
    state,
    dispatch,
    allTags,
    filteredDemos,
    groupedDemos,
  };
}
