# React COGs Reduction Demo – Architecture Specification

## Overview
Interactive slide-driven visualization of COGs optimization using React + Framer Motion. Each “slide” is a React component receiving a shared context (theme, navigation state, reduced-motion preference, timing controller). Supports auto-play and manual navigation, with optional script text overlay sourced from [`demo/2b_cogs_reduction.txt`](demo/2b_cogs_reduction.txt).

## Tech Stack
- React 18 (functional components + hooks)
- Framer Motion (variants, layout animations, orchestrated sequences)
- Vite (fast dev build)
- TypeScript (strong typing of slide model + animation contracts)
- ESLint + Prettier (consistency)
- Optional: Remotion (future export to MP4) (deferred)

## Directory Structure
```
react_cogs_demo/
  package.json
  vite.config.ts
  tsconfig.json
  src/
    index.tsx
    App.tsx
    theme/
      colors.ts
      typography.ts
      motion.ts
    slides/
      SlideRegistry.ts
      types.ts
      data.ts
      common/
        SlideContainer.tsx
        SlideTitle.tsx
        MetricTile.tsx
        ArrowTransition.tsx
        TokenBar.tsx
        GPUStack.tsx
        DialReduction.tsx
        CostCurve.tsx
        PreferenceCompare.tsx
        Roadmap.tsx
      Slide19Challenge.tsx
      Slide20Pipeline.tsx
      Slide21Topics.tsx
      Slide22Extractives.tsx
      Slide23Ranking.tsx
      Slide24Narrative.tsx
      Slide25Unified.tsx
      Slide26Flow.tsx
      Slide27Tokens.tsx
      Slide28Calls.tsx
      Slide29GPUs.tsx
      Slide30COGs.tsx
      Slide31Quality.tsx
      Slide32Path.tsx
    animations/
      variants.ts
      sequencing.ts
    context/
      NavigationContext.tsx
      PreferencesContext.tsx
    overlay/
      ScriptOverlay.tsx
      TimestampSync.ts
    accessibility/
      ReducedMotionToggle.tsx
      AriaAnnouncer.tsx
    utils/
      timing.ts
      easing.ts
      format.ts
    assets/
      (optional SVG placeholders)
  README.md
```

## Data Model

[`slides/types.ts`](react_cogs_demo/src/slides/types.ts):
```ts
export interface SlideSpec {
  id: number;
  title: string;
  component: React.FC;
  durationMs: number;         // expected auto-play duration
  description?: string;
  scriptExcerpt?: string;     // mapped from transcript lines
  animationKey?: string;      // key for variant selection
}
```

[`slides/data.ts`](react_cogs_demo/src/slides/data.ts):
- Exports ordered array: SlideSpec[] (ids 19..32).
- Associates each slide with script excerpt pulled from plan.

## Animation Architecture

[`animations/variants.ts`](react_cogs_demo/src/animations/variants.ts):
- Defines shared Framer Motion variants: fadeIn, staggerRow, zoomGlow, wipeDown, dialSweep, barShrink, pulseGlow.
- Each variant typed:
```ts
interface MotionVariant {
  initial: object;
  animate: object;
  exit?: object;
  transition?: object;
}
```

[`animations/sequencing.ts`](react_cogs_demo/src/animations/sequencing.ts):
- slideAnimationMap: Record<number, { elements: string[]; timeline: TimelineStep[] }>
- TimelineStep: { targetId: string; delayMs: number; variant: string }

Slide components reference sequencing via hook:
```ts
useSequencedAnimation(slideId) // returns controls for each element key
```

## Navigation & State

[`context/NavigationContext.tsx`](react_cogs_demo/src/context/NavigationContext.tsx):
- currentSlideId
- goNext(), goPrev(), goTo(id)
- autoPlayEnabled boolean
- elapsedMs state for synchronization

Keyboard shortcuts:
- ArrowRight / ArrowLeft for navigation
- Space toggles auto-play
- “R” toggles reduced motion

## Reduced Motion

[`accessibility/ReducedMotionToggle.tsx`](react_cogs_demo/src/accessibility/ReducedMotionToggle.tsx):
- Provides boolean reducedMotion
- If true: all durations minimized (150ms) and removes non-essential effects (glow, zoom)

## Script Overlay

[`overlay/ScriptOverlay.tsx`](react_cogs_demo/src/overlay/ScriptOverlay.tsx):
- Fixed panel (bottom or side) showing current slide excerpt
- Timestamp sync maps slide start/end to displayed excerpt

## Core Components

- [`slides/common/MetricTile.tsx`](react_cogs_demo/src/slides/common/MetricTile.tsx): props: label, value, icon, variantKey
- [`slides/common/ArrowTransition.tsx`](react_cogs_demo/src/slides/common/ArrowTransition.tsx): downward or horizontal arrow with wipe variant
- [`slides/common/TokenBar.tsx`](react_cogs_demo/src/slides/common/TokenBar.tsx): animated height shrink
- [`slides/common/GPUStack.tsx`](react_cogs_demo/src/slides/common/GPUStack.tsx): array of rack silhouettes fading out
- [`slides/common/DialReduction.tsx`](react_cogs_demo/src/slides/common/DialReduction.tsx): circular dial with rotating needle (SVG + motion)
- [`slides/common/CostCurve.tsx`](react_cogs_demo/src/slides/common/CostCurve.tsx): path element stroke animated with pathLength
- [`slides/common/PreferenceCompare.tsx`](react_cogs_demo/src/slides/common/PreferenceCompare.tsx): side-by-side frames + badge Pop
- [`slides/common/Roadmap.tsx`](react_cogs_demo/src/slides/common/Roadmap.tsx): horizontal progress arrow growth

## Slide Example (Slide 19)

[`slides/Slide19Challenge.tsx`](react_cogs_demo/src/slides/Slide19Challenge.tsx):
- Layout: top metric tiles row, arrow, target tile, caption
- Each element given data-element id (“tileA”, “tileB”, “tileC”, “arrow”, “target”, “caption”)
- useSequencedAnimation(19) binds variants:
  - tileA/tileB/tileC: fadeIn stagger
  - arrow: wipeDown
  - target: zoomGlow
  - caption: fadeIn

## Theming

[`theme/colors.ts`](react_cogs_demo/src/theme/colors.ts):
```ts
export const colors = {
  navy: "#102437",
  tile: "#1E3C5C",
  teal: "#00B7C3",
  white: "#FFFFFF",
  accentGold: "#D9A441",
  bronze: "#B06E37",
  silver: "#BFC5CC",
};
```

[`theme/motion.ts`](react_cogs_demo/src/theme/motion.ts):
```ts
export const motionDurations = { short: 0.3, medium: 0.5, long: 0.8 };
export const easing = { default: [0.4, 0, 0.2, 1] };
```

## Accessibility
- All meaningful graphics get aria-labels or role="img" with descriptive alt text.
- Reduced-motion switch eliminates zoom / glow / stagger beyond minimal fade.
- High contrast check using tile background + white text ratio.

## Development Workflow
1. Initialize Vite + React + TS.
2. Add Framer Motion dependency.
3. Stub SlideRegistry + navigation context.
4. Implement two slides (19, 20) as baseline.
5. Add variant library + sequencing for those slides.
6. Expand remaining slides incrementally; reuse common components.
7. Integrate script overlay mapping excerpt per slideId.
8. Add keyboard controls + reduced motion toggle.
9. QA: verify timing alignment with narration durations from [`demo/2b_cogs_reduction.txt`](demo/2b_cogs_reduction.txt).

## Future Extensions
- Export to video via Remotion (render each Slide component onto frames).
- Dynamic metrics using props (e.g., GPU numbers fed from external JSON).
- Localization support for titles/excerpts.
- Toggle between “presenter mode” and “auto-play mode”.

## Minimal package.json (Draft)
```json
{
  "name": "react-cogs-demo",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.0"
  }
}
```

## Timing Reference (Seconds → durationMs)
- Slide 19: 6s
- Slide 20: 6s
- Slides 21–24: 7s each
- Slide 25: 7s
- Slide 26: 7s
- Slide 27: 7s
- Slide 28: 7s
- Slide 29: 8s
- Slide 30: 7s
- Slide 31: 7s
- Slide 32: 7s

Map seconds * 1000 to durationMs in data.ts.

## Initial Implementation Priority (Order)
1. Environment setup
2. Theme + motion constants
3. Navigation context
4. SlideRegistry + SlideContainer
5. Slide19 + sequencing baseline
6. Add shared components (MetricTile, ArrowTransition)
7. Implement Slide20 pipeline chain animation
8. Continue remaining slides with reusable patterns.
