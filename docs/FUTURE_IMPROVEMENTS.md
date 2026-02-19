# Future Improvements

Deferred work and improvement opportunities discovered during the framework API & demo contract audit. These are not bugs — the current code works correctly — but addressing them would improve maintainability, testability, and developer experience.

## 1. NarratedController Decomposition

**File**: `src/framework/components/NarratedController.tsx` (1,247 lines — 39% of all framework component code)

The NarratedController is the largest single file in the framework. It could be decomposed into focused hooks and presentational sub-components:

**Hooks to extract:**
- `useAudioPlayback()` — audio loading, fallback logic, segment-by-segment orchestration, event handlers
- `useNarrationEditor()` — edit modal state, TTS regeneration, narration save/cache
- `usePlaybackState()` — isPlaying/isManualMode/audioEnabled states, notification system
- `useManualMode()` — manual slide/segment navigation, audio toggle, auto-advance
- `useRuntimeTimer()` — runtime timer with delta calculations, planned vs. actual display, localStorage persistence

**Presentational sub-components:**
- `StartOverlay` — mode selection, options checkboxes, playback buttons
- `ProgressIndicator` — slide counter, timer, audio toggle, edit/restart buttons
- `NotificationToasts` — success/error/warning/info toast system

## 2. Unify SlidePlayer Dual Inputs

**File**: `src/framework/components/SlidePlayer.tsx`

SlidePlayer currently accepts both `slides: Slide[]` and `slidesWithMetadata?: SlideComponentWithMetadata[]`:
- `slides` is the minimal interface (component + identifiers)
- `slidesWithMetadata` adds audio segments, timing, TTS

Unifying these into a single interface would simplify the component API, but requires updating all callers in DemoPlayer and potentially the Slide/SlideComponentWithMetadata type hierarchy.

## 3. React Error Boundaries

The framework currently has no error boundaries. A single broken slide component crashes the entire presentation.

**Recommended boundaries:**
- `SlideErrorBoundary` — wrap `<CurrentComponent />` in SlidePlayer so a single broken slide shows a fallback instead of crashing
- `DemoLoaderErrorBoundary` — wrap `<SlidePlayer>` and `<NarratedController>` in DemoPlayer
- `WelcomeScreenErrorBoundary` — guard against `DemoRegistry.getAllMetadata()` failures

Create a shared `ErrorBoundary` component with fallback UI, error details display, and recovery/navigate-back support.

## 4. Accessibility Gaps

- **Focus management**: No focus trap in modals (NarrationEditModal, WelcomeScreen); no focus restoration on close; no skip-to-content link
- **ARIA live regions**: Notification toasts missing `aria-live="polite"`; progress indicator sequence not announced
- **Semantic HTML**: Start overlay and progress indicator use plain `<div>` instead of `<section>`/`<nav>`/`<status>`
- **Decorative content**: Emojis (icons) missing `aria-hidden="true"`
- **Video**: VideoPlayer has no `<track>` for captions, no alt text

## 5. Systematize Inline Styles

NarratedController, SlidePlayer, and WelcomeScreen use heavy inline styles with scattered hex values (`#475569`, `#00B7C3`, etc.).

**Improvements:**
- Extract repeated patterns into theme-aware factory functions (`createButtonStyle()`, `createContainerStyle()`, `createProgressIndicator()`)
- Centralize any remaining hardcoded hex values into theme tokens
- Consider CSS modules or a styling solution for complex components
