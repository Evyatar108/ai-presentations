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
  getSlides: async () => {
    // Lazy import - only loads when demo is selected
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  }
};
```

Note: `DemoConfig` no longer has an `id` field — the ID comes exclusively from `metadata.id`.

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