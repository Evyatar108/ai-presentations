# 01a: Visual Components (Zero New Dependencies)

> **Parent**: [`01-packages-research.md`](./01-packages-research.md) — Parts 3 & 4
> **Phase**: 1a | **Size**: M (~3-4 sessions) | **Status**: Done

## Motivation

The `highlights-deep-dive` flagship demo uses effective but visually flat presentations for metrics, titles, checkmarks, and pipeline flows. Building a small set of reusable SVG/Framer Motion components — with zero new dependencies — delivers the highest visual impact at zero bundle cost.

## Scope

### New Framework Components

| # | Component | Props | Status | Notes |
|---|-----------|-------|--------|-------|
| 1 | `CircularProgress` | `value`, `max`, `size`, `color`, `trackColor`, `thickness`, `label`, `animate`, `delay` | Done | SVG `<motion.circle>` with imperative `useSpring` + `pathLength`. Number label centered. |
| 2 | `AnimatedHeading` | `text`, `as` (h1-h6), `stagger`, `stiffness`, `damping`, `style`, `color`, `delay` | Done | Splits text into `motion.span` per character, `staggerChildren` entrance with spring physics. |
| 3 | `AnimatedCheckmark` | `size`, `color`, `strokeWidth`, `delay`, `withCircle`, `circleFill`, `circleStroke` | Done | SVG `<motion.path>` with checkmark path, `pathLength` 0→1. Optional circle background scales in first. |
| 4 | `AnimatedArrow` | `direction`, `length`, `color`, `strokeWidth`, `delay`, `path`, `viewBoxWidth`, `viewBoxHeight`, `headSize`, `style` | Done | SVG `<motion.path>` with arrowhead `<marker>`, `pathLength` 0→1. Supports right/down/left/up + custom bezier. |

### Inline Enhancements (Demo-Specific)

| # | Enhancement | Applied To | Status | Notes |
|---|------------|-----------|--------|-------|
| 5 | Graduated color gauge | `component-showcase` slide 6 | Done | Green→yellow→red gradient bar via CSS `linear-gradient` + imperative `useSpring` `scaleX`. |
| 6 | Animated bar chart | `component-showcase` slide 7 | Done | Horizontal bars via imperative `useSpring` `scaleX` with staggered delays. |

**Note**: The original plan called for applying these to the `highlights-deep-dive` demo (Ch4_S3, Ch9_S2). Instead, all components were showcased in a new `component-showcase` demo. Integration into `highlights-deep-dive` can be done separately.

## New Files

| File | Purpose |
|------|---------|
| `src/framework/components/CircularProgress.tsx` | SVG ring progress component |
| `src/framework/components/AnimatedHeading.tsx` | Character-level spring text |
| `src/framework/components/AnimatedCheckmark.tsx` | SVG path-draw checkmark |
| `src/framework/components/AnimatedArrow.tsx` | Self-drawing SVG arrow |
| `src/demos/component-showcase/` | New demo showcasing all visual components |

## Modified Files

| File | Change |
|------|--------|
| `src/framework/index.ts` | Export all 4 new components + their props types + `ArrowDirection` |
| `src/demos/example-demo-1/metadata.ts` | Removed `hidden: true` |
| `src/demos/example-demo-2/metadata.ts` | Removed `hidden: true` |
| `docs/ANIMATION_REFERENCE.md` | Documented all new visual components |
| `docs/TROUBLESHOOTING.md` | Documented WSL2 reduced-motion gotcha |
| `CLAUDE.md` | Added `pathLength` animation pattern notes + WSL2 gotcha |

## Dependencies

None. Zero new packages — pure Framer Motion + SVG.

Can run in parallel with [01b](./01b-boilerplate-reduction.md).

## Lessons Learned

### pathLength Animation Pattern

Do **NOT** set explicit `strokeDasharray` or `strokeDashoffset` on `motion.circle` / `motion.path` elements. Framer Motion 11 internally sets `pathLength=1` on the SVG element and computes its own `strokeDasharray`/`strokeDashoffset` values. Explicit attributes override FM's values and break the animation entirely.

For components that mount inside an already-animated parent (e.g., inside a `motion.div` with `staggerContainer`), use the **imperative pattern** instead of declarative `initial`/`animate`:

```tsx
const raw = useMotionValue(reduced ? fraction : 0);
const spring = useSpring(raw, { stiffness: 60, damping: 15 });
const pathLength = reduced ? raw : spring;

useEffect(() => {
  if (!reduced) {
    const t = setTimeout(() => raw.set(fraction), delay * 1000);
    return () => clearTimeout(t);
  }
  raw.set(fraction);
}, [fraction, delay, reduced, raw]);

<motion.circle style={{ pathLength }} />
```

This pattern is immune to parent variant state interference and is used by `CircularProgress`, the graduated gauge, and the animated bar chart.

### WSL2 Reduced Motion

On WSL2, browsers inherit the Windows host's `prefers-reduced-motion` setting. If Windows **Settings → Accessibility → Visual effects → Animation effects** is Off, all framework animations are silently suppressed. Diagnose with `window.matchMedia('(prefers-reduced-motion: reduce)').matches` in DevTools.

## Verification

- [x] `npm run type-check` passes
- [x] `npm run test` passes (248 tests)
- [x] `npm run lint` — 0 errors (35 pre-existing warnings)
- [x] `docs/ANIMATION_REFERENCE.md` updated with new visual component entries
- [x] All components visible and animated in `component-showcase` demo (manual mode)
- [ ] Integration into `highlights-deep-dive` slides (deferred — can be done separately)
- [ ] Unit tests for individual components (optional follow-up)
