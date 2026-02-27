# 01d: Nice-to-Have Packages (Deferred)

> **Parent**: [`01-packages-research.md`](./01-packages-research.md) — Part 1 Tier 2 & Part 2
> **Phase**: 3 | **Size**: S-M (~2-3 sessions, per-demo) | **Status**: Proposed (Deferred)

## Motivation

Three Tier 2 packages enable specific demo types but lack immediate application in the existing demo. Install them when building the demo that needs them, not speculatively. This plan documents what each unlocks so the decision is ready when the time comes.

## Scope

### Packages

| Package | Size (gzip) | What It Enables | Install When |
|---------|-------------|----------------|-------------|
| `@visx/*` | ~15-30 KB (modular) | Bar/line/area/radar charts as composable React+D3 components. SVG output works with Framer Motion `<motion.rect>`, `<motion.path>`. | Building a metrics dashboard, cost analysis, or A/B results demo |
| `react-type-animation` | ~3 KB | Typewriter effect with configurable speed, cursor, sequence steps. Terminal-style output, streaming AI response simulations. | Building a terminal/CLI demo or code generation walkthrough |
| `lottie-react` | ~15 KB + JSON | Pre-made vector animations (confetti, checkmarks, loading spinners) from LottieFiles. Frame-level control via ref. | Adding celebration effects to closing slides, or polished icon animations |

### Demo Ideas Unlocked

These are described in detail in the [research document](./01-packages-research.md) Part 2:

| Demo Concept | Packages Used | Key Visuals |
|-------------|---------------|-------------|
| AI/ML Metrics Dashboard | `@visx/*`, `react-rough-notation` | Animated bar/radar charts, rough-notation on key findings |
| System Architecture Evolution | `@xyflow/react` v12, `react-type-animation` | Sub-flow zoom, terminal command typing |
| Code Refactoring Case Study | `shiki`, `react-type-animation`, `react-rough-notation` | Side-by-side shiki diffs, typewriter "writing" new code |
| Product Launch Timeline | `@visx/*`, `react-rough-notation`, `lottie-react` | Timeline axis, milestone annotations, confetti at launch |
| Cost Optimization Story | `@visx/*`, `react-rough-notation` | Trend lines, stacked bars, circled savings numbers |

### Immediate Application (If Installed Early)

| Slide | Package | Enhancement |
|-------|---------|------------|
| Ch8_S2_EvalTool | `react-type-animation` | Terminal-style typewriter output for eval results |
| Ch10_S2_Closing | `lottie-react` | Confetti burst animation (optional — `AnimatedHeading` from 01a already improves this slide) |
| Ch9_S2_QualityAndImpact | `@visx/shape` | Animated bar chart (alternative to pure SVG `<motion.rect>` approach in 01a) |

### Packages NOT Planned

Tier 3 packages are not included in any plan:

| Package | Size | Reason to Skip |
|---------|------|---------------|
| `tsparticles` | ~40-80 KB | `lottie-react` covers confetti at much lower cost |
| `mermaid` | ~300 KB | Hand-built ReactFlow diagrams look and animate better |
| `@react-three/fiber` | ~150+ KB | No current demo needs 3D; high learning curve |

## New Files

None planned — install and build when a specific demo requires it.

## Dependencies

- None (fully independent)
- Each package can be installed individually as needed

## Verification

Per-package, when installed:

- [ ] Package installed and imported correctly
- [ ] Demo-specific usage renders correctly
- [ ] `npm run type-check` passes
- [ ] `npm run test` passes
- [ ] `npm run lint` — no new errors
- [ ] Bundle size delta measured and documented
