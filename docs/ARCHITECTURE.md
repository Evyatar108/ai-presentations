# Multi-Demo Architecture

## Overview

The system supports multiple independent presentation demos through a centralized registry with lazy loading. Each demo maintains its own slides, assets, and configuration while sharing common infrastructure.

## Demo Organization

Each demo is self-contained in `src/demos/{demo-id}/`:

```
src/demos/meeting-highlights/
├── metadata.ts              # Demo metadata (title, description, thumbnail, hidden)
├── index.ts                 # Demo configuration with lazy-loaded slides
├── README.md                # Demo-specific documentation
└── slides/
    ├── SlidesRegistry.ts    # Slide registration
    └── chapters/            # Slide definitions by chapter
        ├── Chapter0.tsx
        ├── Chapter1.tsx
        └── ...
```

## Demo Registry

The `DemoRegistry` provides centralized demo management using an internal `Map<string, DemoRegistryEntry>` for O(1) lookups and structural duplicate prevention:

```typescript
// Get all registered demos (returns shallow copies)
const allDemos = DemoRegistry.getAllMetadata();

// Load specific demo configuration (lazy)
const config = await DemoRegistry.loadDemoConfig('meeting-highlights');

// Get demo IDs
const ids = DemoRegistry.getDemoIds();

// Reset for test isolation
DemoRegistry._resetForTesting();
```

### Registration

Demos are auto-discovered by `src/demos/registry.ts` using Vite's `import.meta.glob`. Any folder in `src/demos/` with `metadata.ts` and `index.ts` is automatically registered — no manual editing needed.

The registry performs development-time validation (duplicate IDs, ID consistency, missing title, invalid loadConfig) and logs warnings to the console.

## Asset Organization

Assets are organized per demo to prevent cross-contamination:

```
public/
├── audio/
│   ├── meeting-highlights/
│   │   ├── c0/                    # Chapter 0 audio
│   │   ├── c1/                    # Chapter 1 audio
│   │   └── ...
│   ├── example-demo-1/
│   └── example-demo-2/
├── images/
│   ├── meeting-highlights/
│   │   ├── meeting_highlights_thumbnail.jpeg
│   │   └── logos/
│   └── ...
└── videos/
    └── meeting-highlights/
```

## Lazy Loading

Demos load on-demand to optimize initial bundle size:

```typescript
export const demo: DemoConfig = {
  metadata,
  defaultMode: 'narrated',
  chapters: {
    0: { title: 'Introduction' },
    1: { title: 'Main Content' },
    2: { title: 'Conclusion' },
  },
  getSlides: async () => {
    // Lazy import - only loads when demo is selected
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  }
};
```

Note: `DemoConfig` no longer has an `id` field — the ID comes exclusively from `metadata.id`. The optional `chapters` field maps chapter numbers to `{ title }` objects; when provided, chapter data flows through to the navigation UI, enabling chapter-level dots and `PageUp`/`PageDown` keyboard navigation in manual mode.

## Alignment System (Sub-Segment Timing)

The alignment system enables animations triggered at specific moments *within* a segment's audio, complementing the discrete segment-based `<Reveal>` model.

### Data Flow

```
narrationText with {#markers}
       │
  [tts:generate]           → strips markers, generates audio
  [tts:align + WhisperX]   → forced alignment → word timestamps → marker resolution
       │
  alignment.json           → stored at public/audio/{demoId}/alignment.json
       │
  DemoPlayer               → loads alignment via alignmentLoader.ts, passes to AudioTimeProvider
  NarratedController       → feeds audio.currentTime into AudioTimeContext on each timeupdate
       │
  <RevealAtMarker>         → reads markers + currentTime from context, triggers animations
  useMarker() / useMarkerRange() → hooks for custom time-based logic
```

### Key Files

| File | Role |
|------|------|
| `src/framework/alignment/types.ts` | `AlignedWord`, `ResolvedMarker`, `SegmentAlignment`, `DemoAlignment` types |
| `src/framework/contexts/AudioTimeContext.tsx` | React context: continuous `currentTime`, per-segment `markers` and `words` |
| `src/framework/utils/alignmentLoader.ts` | Lazy fetch + in-memory cache for `alignment.json` |
| `src/framework/components/reveal/RevealAtMarker.tsx` | Time-based reveal component (progressive `at` or bounded `from`/`until`) |
| `src/framework/hooks/useMarker.ts` | `useMarker()`, `useMarkerRange()`, `useAudioTime()`, `useWordHighlight()` hooks |

### Composing with Segments

Segments and markers operate at different granularities and compose naturally:

- **Segments** control which audio file plays and which integer index is active (`segment >= N`)
- **Markers** control sub-segment timing within that audio file (`currentTime >= markerTime`)
- A slide can use both `<Reveal>` (segment-based) and `<RevealAtMarker>` (time-based) together
- `AudioTimeContext` resets when the segment changes, so marker timestamps are always relative to the current segment's audio

When `alignment.json` is missing, `<RevealAtMarker>` degrades gracefully by rendering children immediately.

In dev mode, a **staleness review panel** (`StalenessWarning`) appears when the demo has unresolved markers or changed narration segments. It checks `/api/staleness-check` on mount and lists each changed segment with per-segment **Play**, **Regen**, and **Edit** actions. **Fix All** regenerates all stale segments (via batch TTS when the "Batch TTS" checkbox is enabled) and runs full-demo alignment, then reloads alignment data. The **Edit** button opens `NarrationEditModal` (which also supports editing the TTS `instruct` string). The `npm run dev` startup script also auto-chains `tts:align` after `tts:generate` when you accept regeneration.

## Benefits

### Scalability
- Support unlimited demos without affecting performance
- Each demo loads independently
- Shared code is bundled once

### Independence
- Demos don't interfere with each other
- Assets are isolated per demo
- Easy to add/remove demos

### Shared Infrastructure
- Common components reduce code duplication
- Consistent UX across all demos
- Centralized configuration

### Development Workflow
- Work on demos independently
- No merge conflicts between demos
- Clear separation of concerns

## Welcome Screen

The welcome screen (`src/framework/components/welcome/`) is a decomposed component tree for demo discovery and navigation.

### Component Tree
`WelcomeScreen` (orchestrator) renders: `WelcomeHeader` → `ToolbarRow` (sticky, SearchBar + TagFilter + SortControls + ViewToggle) → `FavoritesSection` → `RecentlyViewedSection` → `DemoGrid` (or `CategorySection` groups) → `DurationBreakdownModal` → `WelcomeFooter`.

### State Management
Central `useWelcomeState` reducer hook manages search, selectedTags, sort, sortDirection, view, hoveredId, and showBreakdown. Derived data (`filteredDemos`, `groupedDemos`, `allTags`) computed via `useMemo`. Sort supports ascending/descending toggle — clicking the already-active sort button flips direction.

### URL Navigation
Filter state syncs to URL query params (`q`, `tags`, `sort`, `dir`, `view`) via `replaceState` (no back-button pollution). Demo selection uses `pushState` so the browser back button returns to the welcome screen. `App.tsx` listens for `popstate` events.

### localStorage Persistence
- `welcome:viewMode` — grid or list preference
- `welcome:favorites` — favorited demo IDs
- `welcome:recentlyViewed` — recently viewed demo IDs (max 10, most recent first)
- `demoRuntime:{id}` — actual runtime data per demo (pre-existing)

See `docs/WELCOME_SCREEN.md` for the full guide including all features, state shape, and styling conventions.