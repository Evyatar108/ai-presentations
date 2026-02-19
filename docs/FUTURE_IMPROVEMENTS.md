# Future Improvements

Deferred work and improvement opportunities discovered during the framework API & demo contract audit. These are not bugs — the current code works correctly — but addressing them would improve maintainability, testability, and developer experience.

## 1. NarratedController Decomposition — DONE

**Status**: Completed. NarratedController reduced from 1,247 lines to ~280 lines.

**Extracted hooks:**
- `useNotifications()` — toast notification system (`src/framework/hooks/useNotifications.ts`)
- `useRuntimeTimer()` — runtime timer with delta calculations (`src/framework/hooks/useRuntimeTimer.ts`)
- `useApiHealth()` — backend API health check (`src/framework/hooks/useApiHealth.ts`)
- `useNarrationEditor()` — edit modal state, TTS regeneration, narration save (`src/framework/hooks/useNarrationEditor.ts`)

**Extracted presentational sub-components:**
- `StartOverlay` — mode selection, options, playback buttons (`src/framework/components/narrated/StartOverlay.tsx`)
- `ProgressBar` — slide counter, timer, audio toggle, edit/restart (`src/framework/components/narrated/ProgressBar.tsx`)
- `NotificationStack` — success/error/warning/info toast system (`src/framework/components/narrated/NotificationStack.tsx`)
- `ErrorToast` — playback error display (`src/framework/components/narrated/ErrorToast.tsx`)

**Shared utility:** `formatMMSS()` and `deltaColor()` in `src/framework/utils/formatTime.ts`.

## 2. Unify SlidePlayer Dual Inputs — Deferred (Intentional Design)

**Status**: Explored and deferred. The dual-input design (`slides` + `slidesWithMetadata`) is intentional — `slides` is the minimal interface for basic usage, while `slidesWithMetadata` adds audio segments, timing, and TTS. Unifying would break the progressive-complexity API.

## 3. React Error Boundaries — DONE

**Status**: Completed.

- `SlideErrorBoundary` — wraps `<CurrentComponent />` in SlidePlayer; shows fallback with skip forward/backward buttons; auto-resets on slide change
- `DemoPlayerBoundary` — wraps DemoPlayer's render output; shows "Back to Demos" escape hatch
- Fixed unhandled promise rejection in NarratedController API health check

Tests in `SlideErrorBoundary.test.tsx` (4 tests).

## 4. Accessibility Gaps — DONE

**Status**: Completed.

- **Focus management**: `useFocusTrap` hook added to NarrationEditModal, StartOverlay, and WelcomeScreen breakdown modal
- **ARIA live regions**: `aria-live="polite"` on NotificationStack and SlidePlayer regeneration toast; `aria-live="assertive"` on ErrorToast; `role="status"` and `role="alert"` added
- **Semantic HTML**: `<nav aria-label="Slide navigation">` in SlidePlayer; `<header>`, `<main>`, `<footer>` in WelcomeScreen
- **Dialog semantics**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` on NarrationEditModal and StartOverlay
- **Decorative content**: `aria-hidden="true"` on emoji spans in StartOverlay, ProgressBar, SlideErrorBoundary, DemoPlayerBoundary
- **Video**: VideoPlayer `ariaLabel` prop + `<track kind="captions">` placeholder
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` on spinner animations in DemoPlayer and NarrationEditModal

## 5. Systematize Inline Styles — DONE

**Status**: Completed.

- **New theme tokens**: `accent`, `bgOverlay`, `borderSubtle` added to `ThemeColors`
- **Theme-ified components**: MetricTile and ReducedMotionToggle now use theme tokens instead of hardcoded colors
- **Replaced hardcoded colors**: `#475569` → `borderSubtle`, `#14b8a6` → `accent`, `#fb923c` → `warning` across NarrationEditModal, WelcomeScreen, ProgressBar
- **New factory functions**: `createOverlayContainer()`, `createFixedButton()`, `createModalBackdrop()` in SlideStyles.ts
- **HoverButton utility**: `src/framework/components/HoverButton.tsx` — thin wrapper managing hover state internally
