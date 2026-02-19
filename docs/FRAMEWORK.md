# Framework Architecture

## Overview

The `src/framework/` directory contains the reusable presentation framework — everything needed to build narrated, animated slideshow applications. It is cleanly separated from demo-specific content in `src/demos/`.

## Directory Structure

```
src/
├── framework/                    ← Copy this to new projects
│   ├── index.ts                  ← Barrel export
│   ├── config.ts                 ← Centralized defaults (URLs, paths)
│   ├── theme/
│   │   ├── types.ts              ← PresentationTheme interface
│   │   ├── defaultTheme.ts       ← Current teal/blue colors as defaults
│   │   └── ThemeContext.tsx       ← React context + useTheme() hook
│   ├── components/
│   │   ├── WelcomeScreen.tsx      ← Demo selection screen
│   │   ├── DemoPlayer.tsx         ← Demo container with loading/error states
│   │   ├── NarratedController.tsx ← Audio playback orchestration
│   │   ├── SlidePlayer.tsx        ← Slide navigation & display
│   │   ├── VideoPlayer.tsx        ← Video playback component
│   │   ├── NarrationEditModal.tsx ← Edit narration text modal
│   │   └── MetricTile.tsx         ← Metric display tile
│   ├── contexts/
│   │   └── SegmentContext.tsx     ← Segment state management
│   ├── slides/
│   │   ├── SlideMetadata.ts       ← Slide/segment type definitions
│   │   ├── SlideLayouts.tsx       ← Shared layout templates
│   │   ├── SlideStyles.ts         ← Shared styling (static + theme-aware)
│   │   ├── SlideIcons.tsx         ← SVG icon components
│   │   └── AnimationVariants.ts   ← Framer Motion presets
│   ├── demos/
│   │   ├── DemoRegistry.ts        ← Registry logic (no demo imports)
│   │   ├── types.ts               ← DemoMetadata, DemoConfig interfaces
│   │   └── timing/
│   │       ├── types.ts           ← TimingConfig & resolver
│   │       └── calculator.ts      ← Duration calculation
│   ├── utils/
│   │   ├── narrationLoader.ts     ← External narration JSON loader
│   │   ├── narrationApiClient.ts  ← Backend API client (uses config)
│   │   └── ttsClient.ts           ← TTS server communication
│   └── accessibility/
│       └── ReducedMotion.tsx      ← Reduced motion preference
├── demos/                         ← Project-specific content
│   ├── registry.ts                ← Auto-discovery registration (import.meta.glob)
│   ├── meeting-highlights/
│   ├── example-demo-1/
│   └── example-demo-2/
├── App.tsx
├── main.tsx
└── project.config.ts              ← Project-level overrides
```

## Starting a New Project

1. Copy `src/framework/` into your new project's `src/` directory
2. Create `src/project.config.ts` for theme/config overrides
3. Copy `src/demos/registry.ts` (auto-discovers demos via `import.meta.glob`)
4. In `main.tsx`, import the registry and wrap your app with `ThemeProvider` and `WithReducedMotionProvider`

## Framework Configuration

The framework provides two configuration mechanisms:

### `project.config.ts` — Theme & Config Overrides

```typescript
import { setProjectConfig } from './framework/config';
import type { PartialTheme } from './framework/theme/types';

// Override framework config
setProjectConfig({
  narrationApiBaseUrl: 'http://my-server:3001',
});

// Override theme colors
export const themeOverrides: PartialTheme = {
  colors: { primary: '#6366f1' },
};
```

### `config.ts` — Runtime Configuration

Access resolved config values anywhere:
```typescript
import { getConfig } from './framework/config';
const url = getConfig().narrationApiBaseUrl;
```

## How Demos Connect to the Framework

Demos are auto-discovered by `src/demos/registry.ts` using Vite's `import.meta.glob`. Any folder in `src/demos/` with `metadata.ts` (exporting `const metadata: DemoMetadata`) and `index.ts` (with `export default demoConfig`) is automatically registered. No manual editing of `registry.ts` is needed.

This file is imported as a side-effect in `main.tsx` to ensure all demos are registered at startup.

## Key Framework Components

| Component | Purpose |
|-----------|---------|
| `WelcomeScreen` | Displays all registered demos with cards |
| `DemoPlayer` | Loads a demo config, merges narration, orchestrates playback |
| `NarratedController` | Manages audio playback, segment sequencing, timing |
| `SlidePlayer` | Handles slide navigation, keyboard controls, segment dots |
| `MetricTile` | Reusable metric display (before/after values) |

## See Also

- [THEMING.md](./THEMING.md) — Theme system reference
- [ADDING_DEMOS.md](./ADDING_DEMOS.md) — How to add new demos
- [TIMING_SYSTEM.md](./TIMING_SYSTEM.md) — Three-level timing hierarchy
- [COMPONENTS.md](./COMPONENTS.md) — Component reference
