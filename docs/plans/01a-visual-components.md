# 01a: Visual Components (Zero New Dependencies)

> **Parent**: [`01-packages-research.md`](./01-packages-research.md) — Parts 3 & 4
> **Phase**: 1a | **Size**: M (~3-4 sessions) | **Status**: Proposed

## Motivation

The `highlights-deep-dive` flagship demo uses effective but visually flat presentations for metrics, titles, checkmarks, and pipeline flows. Building a small set of reusable SVG/Framer Motion components — with zero new dependencies — delivers the highest visual impact at zero bundle cost.

## Scope

### New Framework Components

| # | Component | Props | Applied To | Notes |
|---|-----------|-------|-----------|-------|
| 1 | `CircularProgress` | `value`, `max`, `size`, `color`, `thickness`, `label`, `animate`, `delay` | Ch9_S1_Metrics | SVG `<motion.circle>` with `pathLength` 0→value/max, spring transition. Number label centered. |
| 2 | `AnimatedHeading` | `text`, `as` (h1-h6), `stagger`, `spring`, `style` | Ch0_S1_Title, Ch10_S2_Closing | Splits text into `motion.span` per character, `staggerChildren` entrance with spring physics. |
| 3 | `AnimatedCheckmark` | `size`, `color`, `strokeWidth`, `delay`, `withCircle` | Ch7_S2_SelfChecks | SVG `<motion.path>` with checkmark path (`M 6 12 L 10 16 L 18 8`), `pathLength` 0→1. Optional circle background. |
| 4 | `AnimatedArrow` | `direction`, `length`, `color`, `strokeWidth`, `delay`, `path` | Ch1_S1_ProductContext, Ch2_S1_FourCalls | SVG `<motion.line>` or `<motion.path>` with arrowhead `<marker>`, `pathLength` 0→1. Supports horizontal, vertical, bezier. |

### Inline Enhancements (Demo-Specific)

| # | Enhancement | Applied To | Notes |
|---|------------|-----------|-------|
| 5 | Graduated color gauge | Ch4_S3_Visualized | Green→yellow→red fill bar via SVG `linearGradient` + Framer Motion. Replaces single-color `expandWidth()`. |
| 6 | Animated bar chart | Ch9_S2_QualityAndImpact | Horizontal bars via pure SVG `<motion.rect>` with stagger. Replaces text-only quality tiles. |

## New Files

| File | Purpose |
|------|---------|
| `src/framework/components/CircularProgress.tsx` | SVG ring progress component |
| `src/framework/components/AnimatedHeading.tsx` | Character-level spring text |
| `src/framework/components/AnimatedCheckmark.tsx` | SVG path-draw checkmark |
| `src/framework/components/AnimatedArrow.tsx` | Self-drawing SVG arrow |

## Modified Files

| File | Change |
|------|--------|
| `src/framework/index.ts` | Export `CircularProgress`, `AnimatedHeading`, `AnimatedCheckmark`, `AnimatedArrow` |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter0.tsx` | Use `AnimatedHeading` for title |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter1.tsx` | Use `AnimatedArrow` for pipeline arrows |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter2.tsx` | Use `AnimatedArrow` / enhanced `PipelineDiagram` |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter4.tsx` | Graduated gauge on Ch4_S3 |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter7.tsx` | Use `AnimatedCheckmark` in self-check cards |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter9.tsx` | Use `CircularProgress` on Ch9_S1, animated bars on Ch9_S2 |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter10.tsx` | Use `AnimatedHeading` for closing text |
| `docs/ANIMATION_REFERENCE.md` | Document all new visual components |

## Dependencies

None. Zero new packages — pure Framer Motion + SVG.

Can run in parallel with [01b](./01b-boilerplate-reduction.md).

## Verification

- [ ] New framework components have unit tests (vitest + jsdom): `CircularProgress`, `AnimatedHeading`, `AnimatedCheckmark`, `AnimatedArrow`
- [ ] `npm run type-check` passes
- [ ] `npm run test` passes (existing + new tests)
- [ ] `npm run lint` — no new errors
- [ ] `npm run test:overflow -- --demo highlights-deep-dive` — no overflow regressions
- [ ] `npm run test:screenshot -- --demo highlights-deep-dive` — visual comparison of enhanced slides
- [ ] `docs/ANIMATION_REFERENCE.md` updated with new visual component entries
- [ ] Bundle size unchanged (`npm run build` before/after)
