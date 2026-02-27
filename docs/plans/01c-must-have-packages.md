# 01c: Must-Have Packages

> **Parent**: [`01-packages-research.md`](./01-packages-research.md) — Part 1 Tier 1 & Part 3 moderate-impact items
> **Phase**: 2 | **Size**: M (~3-4 sessions) | **Status**: Proposed

## Motivation

Three Tier 1 packages deliver high value at low risk: `react-rough-notation` adds hand-drawn annotation effects synced to narration markers, `shiki` replaces the limited regex tokenizer in `CodeBlock` with VS Code-quality highlighting, and `@xyflow/react` v12 is a direct upgrade of the already-installed ReactFlow with better TypeScript types and dark mode support.

## Scope

### Package Installations

| Package | Size (gzip) | New Deps | What It Enables |
|---------|-------------|----------|----------------|
| `react-rough-notation` | ~8 KB | 1 (`rough-notation`) | Hand-drawn circle/underline/highlight/bracket annotations, triggered by markers |
| `shiki` | ~100 KB core* | 0 | VS Code-quality syntax highlighting for 200+ languages; replaces regex tokenizer |
| `@xyflow/react` v12 | ~0 KB net** | 0 | Dark mode, better TS generics, sub-flows, computed styles API |

\* Grammars/themes lazy-loaded on demand (~5-20 KB each)
\** Replaces `reactflow` — net zero bundle change

### Implementation Tasks

| # | Task | Effort | Notes |
|---|------|--------|-------|
| 1 | ~~Install `react-rough-notation`~~ | XS | Done |
| 2 | ~~Build `<AnnotateAtMarker>` wrapper~~ | S | Done — `src/framework/components/reveal/AnnotateAtMarker.tsx` + showcase slide in component-showcase |
| 3 | ~~Apply annotations to demo slides~~ | S | Done — Ch1_S2 (circle on LLM Calls + GPUs, underline on conclusion), Ch6_S1 (bracket on Callout) |
| 4 | ~~Install `shiki`~~ | XS | Done |
| 5 | ~~Create `ShikiCodeBlock` component~~ | M | Done — New `ShikiCodeBlock.tsx` with async shiki singleton, same API as `CodeBlock`. Kept `CodeBlock` untouched. Showcase slide added (CS_S12). |
| 6 | ~~Verify `MarkerCodeBlock` compatibility~~ | S | Done — `MarkerCodeBlock` wraps `CodeBlock` (unchanged), still works. |
| 7 | ~~Upgrade `reactflow` → `@xyflow/react` v12~~ | S-M | Done — Import path + CSS path updated in Chapter2.tsx. All APIs identical. |
| 8 | Integration tests | S | CodeBlock rendering accuracy, annotation trigger/hide, ReactFlow v12 smoke test |

## New Files

| File | Purpose |
|------|---------|
| `src/framework/components/reveal/AnnotateAtMarker.tsx` | Marker-driven `react-rough-notation` wrapper |
| `src/framework/components/ShikiCodeBlock.tsx` | Shiki-powered code block (same API as CodeBlock) |

## Modified Files

| File | Change |
|------|--------|
| `package.json` | Add `react-rough-notation`, `shiki`, `@xyflow/react`; remove `reactflow` |
| `src/framework/components/CodeBlock.tsx` | Rewrite internals with shiki (same external API) |
| `src/framework/index.ts` | Export `AnnotateAtMarker` |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter1.tsx` | Rough-notation circles on Ch1_S2 key numbers |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter6.tsx` | Rough-notation highlights on Ch6_S1 sections |
| All files importing from `reactflow` | Update to `@xyflow/react` v12 imports |
| `docs/ANIMATION_REFERENCE.md` | Document `AnnotateAtMarker` |
| `docs/COMPONENT_CATALOG.md` | Document `AnnotateAtMarker`, updated `CodeBlock` language support |

## Dependencies

- Benefits from [01b](./01b-boilerplate-reduction.md) completing first (less code to update after `MarkerCard` refactoring reduces inline card patterns)
- Not blocked by 01b — can start independently if needed

## Verification

- [ ] `react-rough-notation` annotations render and trigger correctly via markers
- [ ] `<AnnotateAtMarker>` has unit tests
- [ ] `CodeBlock` produces correct highlighting for Python, TypeScript, JSON, YAML, bash, SQL
- [ ] `MarkerCodeBlock` still works (marker-driven line highlighting)
- [ ] ReactFlow v12 renders existing flow diagrams without regressions
- [ ] `npm run type-check` passes
- [ ] `npm run test` passes
- [ ] `npm run lint` — no new errors
- [ ] `npm run test:overflow -- --demo highlights-deep-dive` — no overflow regressions
- [ ] `npm run test:screenshot -- --demo highlights-deep-dive` — visual comparison
- [ ] Bundle size delta measured and documented (`npm run build` before/after)
