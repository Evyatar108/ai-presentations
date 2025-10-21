# Multi-Demo Architecture

## Overview

The system supports multiple independent presentation demos through a centralized registry with lazy loading. Each demo maintains its own slides, assets, and configuration while sharing common infrastructure.

## Demo Organization

Each demo is self-contained in `src/demos/{demo-id}/`:

```
src/demos/meeting-highlights/
├── metadata.ts              # Demo metadata (title, description, thumbnail)
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

The `DemoRegistry` provides centralized demo management:

```typescript
// Get all registered demos
const allDemos = DemoRegistry.getAllMetadata();

// Load specific demo configuration (lazy)
const config = await DemoRegistry.loadDemoConfig('meeting-highlights');

// Get demo IDs
const ids = DemoRegistry.getDemoIds();
```

### Registration

Demos are registered in `src/demos/DemoRegistry.ts`:

```typescript
registerDemo({
  id: 'meeting-highlights',
  metadata: meetingHighlightsMetadata,
  loadConfig: async () => meetingHighlightsDemo
});
```

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
  id: 'meeting-highlights',
  metadata,
  defaultMode: 'narrated',
  getSlides: async () => {
    // Lazy import - only loads when demo is selected
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  }
};
```

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