# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-demo presentation system built with React + TypeScript + Vite. Each demo is a narrated, animated slideshow with TTS-generated audio, progressive segment reveals, and multiple playback modes (narrated, manual, manual+audio). The codebase is split into a reusable `src/framework/` and project-specific `src/demos/`.

## Commands

All commands run from `presentation-app/`:

```bash
npm run dev          # Start dev server (auto-checks TTS cache + calculates durations, then starts Vite on :5173)
npm run dev:full     # Start dev server + Express narration API (port 3001) concurrently
npm run build        # Production build
npm run lint         # ESLint on src/
npm run lint:fix     # ESLint auto-fix
npm run type-check   # TypeScript type checking (tsc --noEmit)
npm run test         # Run tests (vitest run)
npm run test:watch   # Run tests in watch mode
npm run tts:generate -- --demo {id}  # Generate TTS audio for a specific demo (requires Python TTS server running)
npm run tts:duration -- --demo {id}  # Calculate audio durations for a demo
npm run check-narration              # Validate narration structure
```

Scaffold a new demo: `.\scripts\new-demo.ps1 -DemoId "my-demo" [-DemoTitle "My Demo"]`

## Architecture

### Framework / Demo Separation
- `src/framework/` — Reusable presentation engine (components, theme, utilities, registry logic). Copy this to start a new project.
- `src/demos/` — Project-specific demo content (auto-discovered).
- `src/project.config.ts` — Project-level theme and config overrides.

### Demo Registry Pattern
Registry logic lives in `src/framework/demos/DemoRegistry.ts` using an internal `Map<string, DemoRegistryEntry>` for O(1) lookups. Demos are auto-discovered via `import.meta.glob` in `src/demos/registry.ts` (imported as a side-effect in `main.tsx`). Any folder in `src/demos/` with `metadata.ts` and `index.ts` is automatically registered — no manual editing of `registry.ts` needed. Demo configs use `export default`. `DemoConfig` no longer has an `id` field — the ID comes exclusively from `metadata.id`. The registry validates entries at registration time (duplicate IDs, ID consistency, missing title, invalid loadConfig).

### Demo Structure
Each demo lives in `src/demos/{demo-id}/` with:
- `metadata.ts` — title, description, thumbnail, tags, durationInfo
- `index.ts` — DemoConfig with lazy `getSlides()` that imports `SlidesRegistry`
- `slides/SlidesRegistry.ts` — ordered array of all slide components
- `slides/chapters/Chapter{N}.tsx` — slide definitions

### Slide Model
Slides are objects with `metadata` (chapter, slide number, title, audio segments) and a `component` React function receiving `{ segment }`. Progressive reveals use `segment >= N` conditionals. Audio segments define `audioPath`, `narrationText`, and optional `timing` and `instruct` overrides.

### Theme System
Colors and typography are centralized in `src/framework/theme/`. Framework components use `useTheme()` hook. Demo slides can use static exports from `SlideStyles.ts` or opt into theme-aware `create*()` factory functions. Override colors via `src/project.config.ts`.

### Three-Level Timing Hierarchy
Timing (beforeFirstSlide, betweenSegments, betweenSlides, afterFinalSlide) can be set at demo, slide, or segment level. Later levels override earlier. Defaults: 1000ms / 500ms / 1000ms / 2000ms. Resolution via `resolveTimingConfig()` in `src/framework/demos/timing/types.ts`. The `startTransition` option on `DemoConfig` controls the Framer Motion exit animation for the start silence overlay (default: 0.8s fade-out). It lives on `DemoConfig` rather than `TimingConfig` because it's a visual animation config, not a numeric delay.

### Three-Level Instruct Hierarchy
TTS style instructions (`instruct?: string`) follow the same three-level pattern: `DemoConfig.instruct` → `SlideMetadata.instruct` → `AudioSegment.instruct`. Most-specific wins (first non-undefined). Passed to Qwen3-TTS server as the `instruct` parameter. CLI scripts also accept `--instruct "..."` as lowest-priority fallback. Instruct changes are tracked in the TTS cache and trigger regeneration.

### Narration System
Two modes: **inline** (narration text in slide components) or **external** (JSON in `public/narration/{demo-id}/narration.json`). External mode enabled via `useExternalNarration: true` in metadata with fallback options: `'inline'`, `'error'`, `'silent'`.

### Playback
`NarratedController.tsx` orchestrates audio playback, segment sequencing, and slide advancement. Missing audio falls back to configurable silence path (default: `public/audio/silence-1s.wav`).

### Assets
Isolated per demo: `public/audio/{demo-id}/c{chapter}/`, `public/images/{demo-id}/`, `public/videos/{demo-id}/`.

Audio naming: `s{slide}_segment_{number}_{id}.wav`

## Key Files

| File | Role |
|------|------|
| `src/framework/demos/DemoRegistry.ts` | Registry logic (generic) |
| `src/demos/registry.ts` | Auto-discovery registration via import.meta.glob |
| `src/framework/demos/types.ts` | DemoMetadata, DemoConfig interfaces |
| `src/framework/slides/SlideMetadata.ts` | Slide/segment type definitions |
| `src/framework/components/NarratedController.tsx` | Audio playback orchestration (core logic only) |
| `src/framework/components/narrated/StartOverlay.tsx` | Presentation start mode selection overlay |
| `src/framework/components/narrated/ProgressBar.tsx` | Playback progress indicator with controls |
| `src/framework/components/narrated/NotificationStack.tsx` | Toast notification display |
| `src/framework/components/narrated/ErrorToast.tsx` | Playback error display |
| `src/framework/components/DemoPlayer.tsx` | Demo container with loading/error states |
| `src/framework/components/SlideErrorBoundary.tsx` | Error boundary for individual slides |
| `src/framework/components/DemoPlayerBoundary.tsx` | Top-level error boundary for DemoPlayer |
| `src/framework/components/HoverButton.tsx` | Reusable button with hover state management |
| `src/framework/slides/SlideLayouts.tsx` | Shared layout templates |
| `src/framework/slides/SlideStyles.ts` | Shared styling (static + theme-aware factories) |
| `src/framework/slides/AnimationVariants.ts` | Framer Motion presets |
| `src/framework/demos/timing/types.ts` | TimingConfig, StartTransition interfaces & resolver |
| `src/framework/theme/ThemeContext.tsx` | Theme provider & useTheme() hook |
| `src/framework/config.ts` | Centralized framework config |
| `src/project.config.ts` | Project-level overrides |
| `src/framework/index.ts` | Barrel export (explicit named exports, no wildcards) |
| `src/framework/hooks/useTtsRegeneration.ts` | TTS audio regeneration hook (used by SlidePlayer) |
| `src/framework/hooks/useNotifications.ts` | Toast notification state management |
| `src/framework/hooks/useRuntimeTimer.ts` | Runtime timer with delta calculations |
| `src/framework/hooks/useApiHealth.ts` | Backend API health check |
| `src/framework/hooks/useNarrationEditor.ts` | Narration editing workflow |
| `src/framework/hooks/useFocusTrap.ts` | Keyboard focus trap for modals |
| `src/framework/utils/formatTime.ts` | Time formatting utilities (mm:ss, delta colors) |
| `vite-plugin-audio-writer.ts` | Custom Vite plugin for /api/save-audio |

## Conventions

- Demo IDs: kebab-case (e.g., `meeting-highlights`)
- Chapter files: `Chapter0.tsx`, `Chapter1.tsx`, etc.
- Slide exports: `Ch{chapter}_S{slide}_{Name}` (e.g., `Ch1_S2_Details`)
- **Slides must use `defineSlide({ metadata, component })`** factory from `@framework` (not two-step `.metadata =` pattern)
- **Demo code must import from `@framework` barrel only** — deep imports like `@framework/slides/SlideMetadata` are blocked by the `no-restricted-imports` ESLint rule
- When using hooks inside `defineSlide()`, extract the component to a named `const` (ESLint `rules-of-hooks` requires hooks in named functions)
- Accessibility: animations respect `prefers-reduced-motion` via `useReducedMotion()` hook
- Framework components use `useTheme()` for colors; demo slides may use static style exports or theme-aware `create*()` factories

## Documentation

Detailed docs in `docs/`: ARCHITECTURE.md, ADDING_DEMOS.md, COMPONENTS.md, TIMING_SYSTEM.md, TTS_GUIDE.md, TROUBLESHOOTING.md, FRAMEWORK.md, THEMING.md, NARRATION_SYSTEM_GUIDE.md, NARRATION_API_REFERENCE.md, NARRATION_TROUBLESHOOTING.md. Per-demo docs in `docs/demos/{demo-id}/`.
