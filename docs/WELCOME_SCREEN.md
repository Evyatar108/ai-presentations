# Welcome Screen Guide

The welcome screen is the landing page for the presentation system. It displays all registered demos and provides tools for discovery, filtering, and navigation.

## File Structure

```
src/framework/components/welcome/
├── types.ts                    # SortMode, SortDirection, ViewMode, WelcomeState, WelcomeAction
├── WelcomeScreen.tsx           # Orchestrator (~200 lines)
├── WelcomeHeader.tsx           # Title + subtitle
├── WelcomeFooter.tsx           # Footer message
├── ToolbarRow.tsx              # Sticky toolbar (search + tags + sort + view toggle)
├── SearchBar.tsx               # Debounced search input (200ms)
├── TagFilter.tsx               # Clickable tag pills with OR filtering
├── SortControls.tsx            # Default / A–Z / Duration / Category with direction toggle
├── ViewToggle.tsx              # Grid/list SVG icon buttons
├── DemoGrid.tsx                # 2-column grid or list rendering
├── DemoCard.tsx                # Grid card with IO entrance animations + favorite
├── DemoListItem.tsx            # Compact single-row list item
├── DurationBreakdownModal.tsx  # Per-slide timing detail modal
├── FavoritesSection.tsx        # Horizontal scrollable favorites row
├── RecentlyViewedSection.tsx   # Horizontal scrollable recently viewed row
├── CategorySection.tsx         # Grouped demos by tag category
└── (re-exported from src/framework/components/WelcomeScreen.tsx)

src/framework/hooks/
├── useWelcomeState.ts          # Central useReducer for all welcome screen state
├── useUrlParams.ts             # URL param helpers (replaceState / pushState)
├── useFavorites.ts             # Favorites + recently viewed (localStorage)
├── useLocalStorage.ts          # Generic useLocalStorage<T> hook
└── useIntersectionObserver.ts  # IO hook for scroll-triggered entrance animations
```

## Component Tree

```
WelcomeScreen (orchestrator)
├── WelcomeHeader
├── ToolbarRow (sticky)
│   ├── SearchBar
│   ├── SortControls
│   └── ViewToggle
│   └── TagFilter
├── FavoritesSection (if any favorites exist)
├── RecentlyViewedSection (if any recent views exist)
├── DemoGrid (flat) OR CategorySection[] (grouped)
│   ├── DemoCard (grid view)
│   └── DemoListItem (list view)
├── DurationBreakdownModal
└── WelcomeFooter
```

## Features

### Search

- Case-insensitive match across demo `title`, `description`, and `tags`
- 200ms debounce (setTimeout, no external library)
- Clear button appears when text is entered
- Synced to URL param `?q=`

### Tag Filtering

- Tags are extracted from all visible demos via `useMemo`
- Clicking a tag toggles it on/off (filled = active)
- Multiple tags use OR logic (show demos matching any selected tag)
- Tags combine with search using AND logic
- "Clear all" button appears when any tag is active
- Synced to URL param `?tags=tag1,tag2`

### Sorting

Four sort modes, selectable via buttons in the toolbar:

| Mode | Behavior | Reversible |
|------|----------|------------|
| **Default** | Original registration order | No |
| **A–Z** | Alphabetical by title (`localeCompare`) | Yes |
| **Duration** | By `durationInfo.total` (nulls last) | Yes |
| **Category** | Grouped by first tag (renders `CategorySection` components) | No |

**Sort direction toggle**: Clicking the already-active sort button (A–Z or Duration) flips between ascending (▲) and descending (▼). Switching to a different sort mode resets direction to ascending. The arrow indicator appears on the active button. Synced to URL param `?dir=desc` (omitted when ascending).

Each button shows a tooltip on hover describing its function and current state.

### View Modes

- **Grid** (default): 2-column CSS grid (`repeat(2, 1fr)`) with `DemoCard` components
- **List**: Single-column flex layout with compact `DemoListItem` components

Toggle via SVG icon buttons in the toolbar. View preference persists to `localStorage('welcome:viewMode')` and can be overridden by URL param `?view=list`.

### Favorites

- Heart button on each card/list item (top-right corner in grid, inline in list)
- Click toggles favorite state; `onClick` stops propagation to prevent card selection
- Favorited demos appear in a horizontal scrollable `FavoritesSection` above the main grid
- Persisted to `localStorage('welcome:favorites')` as a JSON array of demo IDs

### Recently Viewed

- Automatically recorded when a demo is selected (via `recordView()` in the orchestrator)
- Up to 10 entries, most recent first, deduplicated
- Displayed in a horizontal scrollable `RecentlyViewedSection` above the main grid
- Persisted to `localStorage('welcome:recentlyViewed')`

### URL Navigation

Two strategies to avoid polluting the browser history:

| Action | Method | URL example |
|--------|--------|-------------|
| Filter/search/sort changes | `replaceState` | `?q=meeting&tags=ai&sort=alpha&dir=desc&view=list` |
| Demo selection | `pushState` | `?demo=meeting-highlights` |
| Back to welcome | `pushState` | `/` |

`App.tsx` listens for `popstate` events so the browser back button navigates from a demo back to the welcome screen. Filter params are restored on mount via `RESTORE_FROM_URL` reducer action.

### Scroll Enhancements

- **Sticky toolbar**: `position: sticky; top: 0` with `backdrop-filter: blur(12px)` and semi-transparent background using the theme's `bgDeep` color
- **IO entrance animations**: `DemoCard` uses `useIntersectionObserver` — cards start at `opacity: 0, y: 20` and animate in when they scroll into view. The `hasIntersected` flag ensures the animation only plays once.
- **Reduced motion**: All entrance animations respect `useReducedMotion()` — when reduced motion is preferred, cards render immediately without animation

### Hover Tooltips

All interactive toolbar controls show descriptive `title` text on hover:

- **Search input**: "Search by title, description, or tags"
- **Sort buttons (inactive)**: Description + "click to activate"
- **Sort buttons (active, reversible)**: "Click to reverse (currently ascending/descending)"
- **Tag pills**: "Show only {tag} demos" / "Remove {tag} filter"
- **Clear all tags**: "Remove all tag filters"
- **Grid/list buttons**: "Grid view — show demo cards in a grid" / "List view — show demos as compact rows"

### Duration Breakdown Modal

- Opened via "Details" link on a demo card's duration section
- Shows per-slide breakdown: chapter/slide title, audio duration, delay duration, segment count
- Slides with multiple segments expand to show per-segment detail
- Summary footer with total slides, segments, and average duration per slide
- Compares actual runtime vs estimated when runtime data exists
- Uses `useFocusTrap` for keyboard accessibility; closes on Escape

## State Management

All welcome screen state is managed by `useWelcomeState`, a `useReducer` hook:

```typescript
interface WelcomeState {
  search: string;
  selectedTags: string[];
  sort: SortMode;        // 'default' | 'alpha' | 'duration' | 'category'
  sortDirection: SortDirection;  // 'asc' | 'desc'
  view: ViewMode;        // 'grid' | 'list'
  hoveredId: string | null;
  showBreakdown: string | null;
}
```

**Actions**: `SET_SEARCH`, `TOGGLE_TAG`, `CLEAR_TAGS`, `SET_SORT` (also toggles direction when clicking active sort), `TOGGLE_SORT_DIRECTION`, `SET_VIEW`, `SET_HOVERED`, `SHOW_BREAKDOWN`, `RESTORE_FROM_URL`.

**Derived data** (computed via `useMemo`):
- `allTags` — sorted unique tags across all demos
- `filteredDemos` — demos after search + tag filter + sort applied
- `groupedDemos` — `Map<string, DemoMetadata[]>` grouped by first tag (for category view)

## localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `welcome:viewMode` | `'grid' \| 'list'` | Persisted view preference |
| `welcome:favorites` | `string[]` | Favorited demo IDs |
| `welcome:recentlyViewed` | `string[]` | Recently viewed demo IDs (max 10) |
| `demoRuntime:{id}` | `{ elapsed, plannedTotal }` | Actual runtime per demo (set by NarratedController) |

## Styling Conventions

- All styles are inline `style={{}}` (no CSS modules)
- Colors come from `useTheme()` — no hardcoded color values in components
- Animations use Framer Motion (`motion.div`, `AnimatePresence`)
- Interactive buttons use the `HoverButton` component from the framework
- The sticky toolbar uses `hexToRgb()` helper to convert theme hex colors for `rgba()` backgrounds
- Grid layout: `repeat(2, 1fr)` for consistent 2-column cards

## Barrel Exports

The following are exported from `src/framework/index.ts` for use by demos or external code:

```typescript
// Hooks
export { useLocalStorage } from './hooks/useLocalStorage';
export { useFavorites } from './hooks/useFavorites';
export { useIntersectionObserver } from './hooks/useIntersectionObserver';
export { getParam, getParamList, setParams, pushDemo, pushWelcome } from './hooks/useUrlParams';

// Types
export type { SortMode, SortDirection, ViewMode } from './components/welcome/types';
```
