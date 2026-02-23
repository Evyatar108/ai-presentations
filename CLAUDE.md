# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-demo presentation system built with React + TypeScript + Vite. Each demo is a narrated, animated slideshow with TTS-generated audio, progressive segment reveals, and multiple playback modes (narrated, manual, manual+audio). The codebase is split into a reusable `src/framework/` and project-specific `src/demos/`.

## Commands

All commands run from `presentation-app/`:

```bash
npm run dev          # Start dev server (auto-checks TTS cache + marker alignment + calculates durations, then starts Vite on :5173)
npm run dev:full     # Start dev server + standalone Express narration API (port 3001) — rarely needed, Vite plugin serves /api/* by default
npm run build        # Production build
npm run lint         # ESLint on src/
npm run lint:fix     # ESLint auto-fix
npm run type-check   # TypeScript type checking (tsc --noEmit)
npm run test         # Run tests (vitest run)
npm run test:watch   # Run tests in watch mode
npm run tts:generate -- --demo {id}  # Generate TTS audio for a specific demo (requires Python TTS server running)
npm run tts:generate -- --demo {id} --segments ch1:s2:intro,ch3:s1:summary  # Regenerate specific segments only
npm run tts:duration -- --demo {id}  # Calculate audio durations and auto-update metadata.ts durationInfo
npm run tts:align -- --demo {id}     # Generate word-level alignment via WhisperX + resolve {#markers}
npm run tts:verify -- --demo {id}    # Transcribe TTS audio via WhisperX and output side-by-side comparison
npm run check-narration              # Validate narration structure
npm run test:overflow -- --demo {id}  # Playwright (static): detect viewport overflow on every slide/segment
npm run test:overflow -- --demo {id} --viewport 1920x1019  # Same, at a custom viewport size
npm run test:screenshot -- --demo {id}  # Playwright (static): screenshot every slide/segment
npm run test:screenshot -- --demo {id} --slides 3-5  # Screenshot only slides 3 through 5
npm run test:screenshot -- --demo {id} --markers all  # Also capture screenshots at each marker position
npm run test:screenshot -- --demo {id} --markers id1,id2  # Capture only specific markers
npm run record:obs -- --demo {id}  # Automate OBS recording + generate .vtt subtitles (requires OBS running + WebSocket enabled)
npm run record:obs -- --demo {id} --password <pw> --resolution 1920x1080  # With auth + custom resolution
npm run test:record -- --demo {id}  # Playwright (record): record narrated playback as .mp4 video (requires ffmpeg)
npm run test:record -- --demo {id} --fps 60  # Same, at 60fps
```

Playwright tests require the dev server running on localhost:5173. Two Playwright projects in `playwright.config.ts`:
- **`static`** — `reducedMotion: 'reduce'` for fast tests (overflow, screenshot)
- **`record`** — full animations for video recording

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
- `metadata.ts` — title, description, thumbnail, tags, durationInfo, hidden
- `index.ts` — DemoConfig with lazy `getSlides()` that imports `SlidesRegistry`, optional `chapters` map
- `slides/SlidesRegistry.ts` — ordered array of all slide components
- `slides/chapters/Chapter{N}.tsx` — slide definitions

`DemoConfig` supports an optional `chapters?: Record<number, { title: string }>` field that maps chapter numbers to titles. When provided, chapter-level navigation can be enabled in manual mode (see Slide Model below).

### Slide Model
Slides are objects with `metadata` (chapter, slide number, title, audio segments) and a `component` React function receiving `{ segment }`. Progressive reveals use `segment >= N` conditionals. Audio segments define `narrationText`, and optional `timing` and `instruct` overrides. `audioFilePath` is **auto-derived** at runtime from slide coordinates (via `resolveAudioFilePath` in `DemoPlayer`) — do not hardcode it. The pattern is `/audio/{demoId}/c{chapter}/s{slide}_segment_{paddedIndex}_{segmentId}.wav`. To override, set `audioFilePath` explicitly on the segment.

**Inline markers** enable sub-segment animations synchronized to the narrator's speech. Embed `{#id}` (forward anchor — start of next word) or `{id#}` (backward anchor — end of previous word) tokens in `narrationText`. These are stripped before TTS and resolved to word-level timestamps via WhisperX forced alignment (`tts:align`). Use `<RevealAtMarker at="id">` for progressive reveals or `<RevealAtMarker from="a" until="b">` for bounded ranges. See `docs/MARKERS_GUIDE.md` for details.

In **manual mode**, arrow keys step through markers within a segment before advancing to the next segment/slide. Diamond-shaped marker dots with `◀`/`▶` arrows appear above the segment dots for click-to-seek navigation. When chapter mode is enabled (toggle available in manual mode), rounded-square chapter dots appear below slide dots and slide dots filter to show only the current chapter. The full navigation hierarchy top-to-bottom is: markers → segments → slides → chapters (when enabled). Keyboard shortcuts: `ArrowLeft`/`ArrowRight` for markers/segments/slides, `PageUp`/`PageDown` for chapter jumping.

### Viewport Overflow Detection
`SlideContainer` has a `viewportFraction` prop (default `0.75`) that controls dev-mode overflow detection. When content exceeds `window.innerHeight * viewportFraction`, a red outline + badge appears and a `data-overflow` attribute is set (used by the Playwright `test:overflow` command). The console.warn includes the slide heading for identification. Fix overflows with `<RevealSequence>` + `until={N}` to swap content instead of accumulating it. Note: Playwright's headless Chromium renders text ~15-20px shorter than real browsers due to font fallbacks, so always test at a viewport slightly shorter than target (e.g., `--viewport 1920x1019` for 1080p monitors).

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

Alignment data: `public/audio/{demo-id}/alignment.json` — word-level timestamps + resolved marker times, generated by `tts:align`.

Subtitle corrections: `public/audio/{demo-id}/subtitle-corrections.json` — maps TTS pronunciation spellings (lowercase keys) to correct display forms for VTT subtitles (e.g., `"kwen": "Qwen"`). Editable via the collapsible "Subtitle Corrections" section in the NarrationEditModal or by editing the JSON file directly.

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
| `src/framework/hooks/useTtsRegeneration.ts` | TTS audio regeneration hook (used by NarratedController and useNarrationEditor) |
| `src/framework/hooks/useNotifications.ts` | Toast notification state management |
| `src/framework/hooks/useRuntimeTimer.ts` | Runtime timer with delta calculations |
| `src/framework/hooks/useApiHealth.ts` | Backend API health check |
| `src/framework/hooks/useNarrationEditor.ts` | Narration editing workflow |
| `src/framework/hooks/useFocusTrap.ts` | Keyboard focus trap for modals |
| `src/framework/hooks/useStalenessCheck.ts` | Dev-mode staleness detection with enriched per-segment details + refetch |
| `src/framework/components/StalenessWarning.tsx` | Dev-mode staleness review panel with per-segment play/regen/edit, batch TTS, and NarrationEditModal integration |
| `src/framework/alignment/types.ts` | AlignedWord, ResolvedMarker, DemoAlignment types |
| `src/framework/contexts/AudioTimeContext.tsx` | Continuous audio time tracking context (sub-segment markers) |
| `src/framework/utils/alignmentLoader.ts` | Lazy-load alignment.json per demo |
| `src/framework/components/reveal/RevealAtMarker.tsx` | Time-based reveal driven by inline markers |
| `src/framework/hooks/useMarker.ts` | useMarker() and useMarkerRange() hooks |
| `src/framework/hooks/useAudioTime.ts` | Raw useAudioTime() hook |
| `src/framework/hooks/useWordHighlight.ts` | Karaoke word-level highlight hook |
| `scripts/utils/tts-cache.ts` | TTS cache I/O — `TtsCacheStore` is the primary API for all cache operations |
| `scripts/utils/server-config.ts` | TTS + WhisperX server URL loading from `tts/server_config.json` |
| `scripts/utils/narration-cache.ts` | Per-demo narration cache (`narration-cache.json`) load/save/hash utilities |
| `scripts/utils/alignment-io.ts` | Server-side alignment.json + subtitle-corrections.json I/O |
| `scripts/utils/marker-parser.ts` | Shared parseMarkers() / stripMarkers() utilities |
| `scripts/generate-alignment.ts` | Alignment generation + marker resolution script |
| `tts/server_whisperx.py` | WhisperX server (transcription + forced alignment) |
| `src/framework/utils/audioPath.ts` | Audio file path derivation (buildAudioFilePath, resolveAudioFilePath) |
| `src/framework/utils/formatTime.ts` | Time formatting utilities (mm:ss, delta colors) |
| `vite-plugin-handlers/preview-store.ts` | Preview take directory + `previews.json` I/O for TTS preview workflow |
| `vite-plugin-audio-writer.ts` | Custom Vite plugin for /api/save-audio, /api/staleness-check, /api/narration/* endpoints |
| `scripts/record-obs.ts` | OBS automated recording via WebSocket (signal-based completion + VTT subtitle generation) |
| `scripts/utils/vtt-generator.ts` | VTT subtitle generation from segment timing events + alignment data |
| `tests/overflow.spec.ts` | Playwright test: viewport overflow detection for all slides/segments |
| `tests/screenshot.spec.ts` | Playwright test: screenshot every slide/segment for visual review |
| `tests/record.spec.ts` | Playwright test: CDP screencast → ffmpeg recording of narrated playback |
| `playwright.config.ts` | Playwright config: `static` project (overflow/screenshot, reducedMotion) + `record` project (full animations) |

## Conventions

- Demo IDs: kebab-case (e.g., `meeting-highlights`)
- Chapter files: `Chapter0.tsx`, `Chapter1.tsx`, etc.
- Slide exports: `Ch{chapter}_S{slide}_{Name}` (e.g., `Ch1_S2_Details`)
- **Slides must use `defineSlide({ metadata, component })`** factory from `@framework` (not two-step `.metadata =` pattern)
- **Demo code must import from `@framework` barrel only** — deep imports like `@framework/slides/SlideMetadata` are blocked by the `no-restricted-imports` ESLint rule
- When using hooks inside `defineSlide()`, extract the component to a named `const` (ESLint `rules-of-hooks` requires hooks in named functions)
- Accessibility: animations respect `prefers-reduced-motion` via `useReducedMotion()` hook
- Framework components use `useTheme()` for colors; demo slides may use static style exports or theme-aware `create*()` factories
- **`<Reveal>` is the preferred pattern for segment-based visibility** — use `useSegmentedAnimation()` hook only for non-visual logic (data computation, conditional styling, components with built-in `isVisible` props)
- **`<RevealAtMarker>` is the preferred pattern for sub-segment (time-based) visibility** — use `useMarker()` / `useMarkerRange()` hooks only for programmatic logic. Requires `{#id}` markers in `narrationText` and `alignment.json` from `tts:align`.
- See `docs/ANIMATION_REFERENCE.md` for the full animation catalog; keep it updated when adding or modifying animation factories

## Documentation

Detailed docs in `docs/`: ANIMATION_REFERENCE.md, ARCHITECTURE.md, ADDING_DEMOS.md, COMPONENT_CATALOG.md, COMPONENTS.md, MARKERS_GUIDE.md, TIMING_SYSTEM.md, TTS_GUIDE.md, TROUBLESHOOTING.md, FRAMEWORK.md, THEMING.md, NARRATION_SYSTEM_GUIDE.md, NARRATION_API_REFERENCE.md, NARRATION_TROUBLESHOOTING.md, RECORDING_GUIDE.md. Per-demo docs in `docs/demos/{demo-id}/`.
