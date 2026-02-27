# 01b: Boilerplate Reduction (Zero New Dependencies)

> **Parent**: [`01-packages-research.md`](./01-packages-research.md) — Part 5
> **Phase**: 1b | **Size**: S-M (~2 sessions) | **Status**: **Done** (utilities built + applied to `highlights-deep-dive`)

## Motivation

An audit of `highlights-deep-dive` (3,100+ lines across 11 chapter files) reveals 42 instances of repeated patterns — card-in-MarkerDim wrappers, manual RevealSequence index wiring, inline style spreads. Targeted framework abstractions eliminate ~825 lines of boilerplate and make future demos significantly faster to author.

## Scope

### High Priority

| # | Abstraction | Occurrences | Lines Saved | Effort |
|---|------------|-------------|-------------|--------|
| 1 | `MarkerCard` component | 9x (4 chapters) | ~400 | S |
| 2 | `cardStyle()` override parameter | 12x (3 chapters) | ~150 | XS |
| 3 | `RevealCarousel` component | 2x (2 chapters) | ~200 | S-M |

### Medium Priority

| # | Abstraction | Occurrences | Lines Saved | Effort |
|---|------------|-------------|-------------|--------|
| 4 | `gradientBadge()` factory | 3x (2 chapters) | ~30 | XS |
| 5 | `monoText()` utility | 5x (3 chapters) | ~25 | XS |
| 6 | `layouts.grid2Col()` docs | 8x (3 chapters) | 0 (awareness) | XS |

### Lower Priority

| # | Abstraction | Occurrences | Lines Saved | Effort |
|---|------------|-------------|-------------|--------|
| 7 | `StatusLabel` component | 3x (2 chapters) | ~20 | XS |

### Component Details

**`MarkerCard`** — wraps `<MarkerDim at={marker}>` around a themed card div. Props: `marker`, `children`, `variant?: 'default' | 'primary' | 'error' | 'warning' | 'success'`, `style?`. Replaces inline components: `PipelineBox`, `TypeCard`, `SelfCheckCard`, `CheckCard`, `EvalPipelineStep`, `OutputPill`, `BenefitCard`, `InsightPill`.

**`RevealCarousel`** — auto-wires `from`/`until` indices from a children array. Props: `children: ReactNode[]`, `animation?`, `startFrom?` (offset). Eliminates off-by-one bugs and ~200 lines per instance.

**`cardStyle()` overrides** — add optional second parameter `overrides?: CSSProperties` to `cardStyle()` in `SlideStyles.ts`. Backward compatible.

**`gradientBadge()`** — factory in `SlideStyles.ts` returning `CSSProperties` for gradient checkmark badges. Defaults: `size=22`, gradient from `theme.colors.success` to `#059669`.

**`monoText()`** — factory in `SlideStyles.ts` returning `{ fontFamily, fontSize, fontWeight }` for monospace text. Centralizes the `'JetBrains Mono', 'Fira Code', monospace` font stack.

## New Files

| File | Purpose |
|------|---------|
| `src/framework/components/MarkerCard.tsx` | MarkerDim + themed card wrapper |
| `src/framework/components/RevealCarousel.tsx` | Auto-indexed RevealSequence children |

## Modified Files

| File | Change |
|------|--------|
| `src/framework/slides/SlideStyles.ts` | `cardStyle()` overrides param, `gradientBadge()`, `monoText()` |
| `src/framework/index.ts` | Export `MarkerCard`, `RevealCarousel` |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter1.tsx` | Replace 3 inline card components with `MarkerCard` |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter4.tsx` | `cardStyle()` overrides, `RevealCarousel` on Ch4_S4 |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter5.tsx` | `cardStyle()` overrides, `monoText()` |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter6.tsx` | `MarkerCard` (3x), `RevealCarousel` on Ch6_S4, `monoText()` |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter7.tsx` | `MarkerCard`, `gradientBadge()` |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter8.tsx` | `MarkerCard` (2x), `gradientBadge()` |
| `docs/COMPONENT_CATALOG.md` | Document `MarkerCard`, `RevealCarousel`, promote `layouts.grid2Col()` |

## Dependencies

None. Zero new packages.

Can run in parallel with [01a](./01a-visual-components.md).

## Verification

- [x] `cardStyle()` overrides, `gradientBadge()`, `monoText()` implemented
- [x] `MarkerCard` and `RevealCarousel` implemented
- [ ] Unit tests for new components/utilities (deferred)
- [x] Refactored demo slides produce identical visual output
- [x] `npm run type-check` passes
- [x] `npm run test` passes (248 tests)
- [x] `npm run lint` — no new errors
- [x] `docs/COMPONENT_CATALOG.md` updated with new component/utility entries

## Completion Notes

**Phase 1** (2026-02-27): Built all utilities and components. Showcased in `component-showcase` demo (slides 8-10).

**Phase 2** (2026-02-27): Applied to `highlights-deep-dive` demo:
- 16 `monoText()` replacements across Ch3–Ch7
- 10 `cardStyle()` override conversions across Ch1, Ch4, Ch5, Ch8
- 2 `MarkerCard` conversions in Ch8 (eval tool cards)
- Net result: 7 files changed, -40 lines
