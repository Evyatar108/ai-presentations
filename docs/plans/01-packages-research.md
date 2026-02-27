# Package Research & Deep Dive Enhancement Audit

> **Reference document.** This is the research and audit backing the Plan 01 family.
> For actionable implementation plans, see:
> - [`01a-visual-components.md`](./01a-visual-components.md) — Phase 1a: framework SVG/animation components (zero new deps)
> - [`01b-boilerplate-reduction.md`](./01b-boilerplate-reduction.md) — Phase 1b: MarkerCard, RevealCarousel, style utilities (zero new deps)
> - [`01c-must-have-packages.md`](./01c-must-have-packages.md) — Phase 2: rough-notation, shiki, xyflow v12
> - [`01d-nice-to-have-packages.md`](./01d-nice-to-have-packages.md) — Phase 3: visx, type-animation, lottie (deferred)

## Motivation

The presentation framework has rich animation support (Framer Motion, 17+ animation factories, 6 reveal components) but relies on only one external visualization library (ReactFlow v11). There are no charting, diagramming, or fancy text/particle libraries installed. The `CodeBlock` component uses a hand-rolled regex tokenizer that misses edge cases (multi-line strings, nested structures). Meanwhile, the `highlights-deep-dive` demo — the flagship 25-slide, 11-chapter presentation — has several slides that would benefit from richer visual effects.

This document covers:
1. **Package research** — what to install (tiered by value/risk)
2. **New demo ideas** unlocked by those packages
3. **Per-slide enhancement audit** of `highlights-deep-dive`
4. **New framework components** to build
5. **Framework boilerplate reduction** — abstractions that make demos easier to author
6. **Implementation order** (phased)

## Current State

### What We Have

| Capability | Current Approach | Limitation |
|-----------|-----------------|------------|
| Animation | Framer Motion (17 factories, 6 reveal components) | No particle effects, no character-level text animation |
| Flow diagrams | ReactFlow v11 | No dark mode, older TypeScript types, no sub-flows |
| Syntax highlighting | Custom regex tokenizer in `CodeBlock.tsx` | Misses multi-line strings, nested structures, limited to python/json/markdown |
| Charts/Graphs | None | Must build from scratch with SVG |
| Typewriter effects | None | Manual implementation required |
| Hand-drawn annotations | None | No circle/underline/highlight affordances |
| 3D | None | Not needed for current demos |

### Production Dependencies

```
framer-motion ^11.0.0
react ^18.2.0
react-dom ^18.2.0
reactflow ^11.11.4
express ^5.1.0
cors ^2.8.5
```

---

## Part 1: Package Research

### Tier 1 — Must-Have (High Value, Low Risk)

#### `react-rough-notation` (~8 KB gzipped)

Hand-drawn circle / underline / highlight / bracket annotations that animate on trigger.

| Aspect | Detail |
|--------|--------|
| **What it enables** | "Annotate as the narrator speaks" — circle key numbers, underline conclusions, highlight terms. Sketch-style feel adds visual warmth to data-heavy slides. |
| **Bundle size** | ~8 KB gzipped (depends on `rough-notation` ~6 KB) |
| **API surface** | `<RoughNotation type="circle" show={visible}>` wraps any element. Types: `underline`, `circle`, `highlight`, `strike-through`, `crossed-off`, `bracket`. `<RoughNotationGroup show={visible}>` for sequenced annotations. |
| **Compatibility** | React 16+, no peer dependencies beyond React. Pure SVG overlay — works with any DOM element. |
| **Framework integration** | Trigger `show` via `segment >= N` or `useMarker()` — maps directly to our reveal system. Could build a thin `<AnnotateAtMarker>` wrapper. |
| **Demo topics unlocked** | Any data-driven presentation (metrics, cost analysis, A/B results) where the narrator calls attention to specific numbers or phrases. |

#### `shiki` (~100 KB core + themes/grammars lazy-loaded)

VS Code-quality syntax highlighting with real TextMate grammars. Replaces the manual regex tokenizer in `CodeBlock.tsx`.

| Aspect | Detail |
|--------|--------|
| **What it enables** | Accurate syntax highlighting for 200+ languages with VS Code themes. Handles multi-line strings, nested structures, decorators, type annotations — everything the regex tokenizer misses. |
| **Bundle size** | ~100 KB core (gzipped). Themes and grammars are lazy-loaded on demand (~5-20 KB each). Only languages actually used are loaded. |
| **API surface** | `const html = codeToHtml(code, { lang: 'python', theme: 'one-dark-pro' })`. Can also produce token arrays for custom rendering. Supports dual themes (light/dark). |
| **Compatibility** | Framework-agnostic. Works with React via `dangerouslySetInnerHTML` or token-level rendering. ESM-first. |
| **Framework integration** | Replace `CodeBlock.tsx` internals while keeping the same external props API (`code`, `language`, `highlightLines`, `title`, `fontSize`). Pre-highlight at render time — no runtime cost per re-render. Theme selection can tie into our `ThemeContext`. |
| **Demo topics unlocked** | Any code-heavy demo (refactoring case studies, API walkthroughs, prompt engineering). Makes code slides look professional regardless of language. |

#### ReactFlow v11 → `@xyflow/react` v12

Already using ReactFlow. v12 is the official successor with the same team.

| Aspect | Detail |
|--------|--------|
| **What it enables** | Built-in dark mode, better TypeScript generics, server-side rendering, sub-flows (nested groups), computed styles API. |
| **Bundle size** | Similar to v11 (~45 KB gzipped). It's a replacement, not an addition. |
| **Migration** | Mostly import path changes (`reactflow` → `@xyflow/react`). Some API renames (`useNodesState` → `useNodesState` same, but types change). Migration guide available. |
| **Compatibility** | React 17+. Drops IE11 support (not relevant). |
| **Framework integration** | Direct swap. Sub-flows enable "zoom into a node" patterns for architecture demos. |
| **Demo topics unlocked** | Complex architecture diagrams with nested subsystems, animated data flow between nodes. |

### Tier 2 — Nice-to-Have (Enables Specific Demo Types)

#### `@visx/*` (Airbnb, modular ~5-20 KB per chart type)

Low-level D3 primitives wrapped as React components. Pick only what you need.

| Aspect | Detail |
|--------|--------|
| **What it enables** | Bar charts, line charts, area charts, radar/radial, scales, axes, tooltips — all as composable React components backed by D3 math. |
| **Bundle size** | Modular: `@visx/shape` ~8 KB, `@visx/scale` ~5 KB, `@visx/axis` ~10 KB, `@visx/group` ~2 KB. Import only needed packages. |
| **Why visx over recharts/nivo** | (a) Each chart is a custom component, not a configured black box — full control over SVG. (b) SVG elements can be wrapped in `<motion.g>` for Framer Motion segment-based reveals. (c) Modular imports keep bundle small. |
| **Compatibility** | React 16+. Peer dependency on `@visx/group` for most packages. D3 modules are transitive deps. |
| **Framework integration** | SVG output integrates with Framer Motion (`<motion.rect>`, `<motion.path>`). Animate chart elements per-segment. Axis labels can use theme colors. |
| **Demo topics unlocked** | AI/ML metrics dashboards, cost optimization stories, A/B test results, performance benchmarks, timeline/Gantt charts. |

#### `react-type-animation` (~3 KB gzipped)

Typewriter effect with configurable speed, cursor, and sequence steps.

| Aspect | Detail |
|--------|--------|
| **What it enables** | Typewriter text for title slides, "building a prompt" sequences, terminal-style output, streaming AI response simulations. |
| **Bundle size** | ~3 KB gzipped. Zero dependencies. |
| **API surface** | `<TypeAnimation sequence={['Text 1', 1000, 'Text 2', 500]} speed={50} cursor={true} />`. Sequence alternates between strings (to type) and numbers (pause ms). |
| **Compatibility** | React 16+. Simple DOM manipulation internally. |
| **Framework integration** | Trigger via segment visibility. Wrap in `<Reveal from={N}>` to start typing when segment activates. Could also tie to markers for narrator-synced typing. |
| **Demo topics unlocked** | Terminal/CLI demos, "watch the AI think" sequences, prompt construction walkthroughs, code generation animations. |

#### `lottie-react` (~15 KB + animation JSON files)

Play pre-made Lottie animations (from LottieFiles marketplace or After Effects exports).

| Aspect | Detail |
|--------|--------|
| **What it enables** | High-quality vector animations: confetti bursts, checkmark completions, loading spinners, celebration effects, icon animations. Thousands of free animations available on LottieFiles. |
| **Bundle size** | ~15 KB gzipped for the player. Each animation JSON is typically 5-50 KB. |
| **API surface** | `<Lottie animationData={confettiJson} loop={false} autoplay={true} />`. Control via ref: `play()`, `pause()`, `goToAndStop()`. |
| **Compatibility** | React 16+. Uses `lottie-web` internally. |
| **Framework integration** | Trigger `autoplay` on segment change. Overlay on slides for celebration effects. Use `goToAndStop()` for marker-synced frame control. |
| **Demo topics unlocked** | Polished closing slides (confetti), success states (animated checkmarks), onboarding flows, any slide needing "delight" moments. |

### Tier 3 — Stretch (High Bundle Cost, Niche Use)

#### `tsparticles` / `@tsparticles/react` (~40-80 KB)

Full particle system engine — confetti, network connections, fireworks, snow, bubbles.

| Aspect | Detail |
|--------|--------|
| **What it enables** | Background particle effects, confetti explosions, "network of nodes" backgrounds, firework celebrations. Highly configurable. |
| **Bundle size** | 40-80 KB gzipped depending on presets loaded. Heavy. |
| **Trade-off** | Impressive but heavy. Only justifiable for a dedicated "wow" demo or title/closing slides. `lottie-react` covers confetti at much lower cost. |
| **When to consider** | If we need persistent animated backgrounds (particle network behind slides) or multiple particle effect types. |

#### `mermaid` (~300 KB)

Diagram-from-text rendering (sequence diagrams, state machines, ER diagrams, Gantt charts, flowcharts).

| Aspect | Detail |
|--------|--------|
| **What it enables** | Author diagrams in Markdown-like syntax. Renders to SVG. Supports sequence, state, ER, Gantt, flowchart, mindmap, timeline. |
| **Bundle size** | ~300 KB gzipped. Very heavy — includes its own parser, layout engine (dagre/elk), and renderer. |
| **Trade-off** | Convenient authoring but massive bundle. For presentations, hand-built ReactFlow diagrams look better and animate better. Consider only if a demo specifically needs UML-style sequence diagrams that would be tedious to build manually. |

#### `@react-three/fiber` + `drei` (~150+ KB)

React renderer for Three.js — 3D scenes, WebGL, shaders.

| Aspect | Detail |
|--------|--------|
| **What it enables** | 3D data visualizations, rotating models, shader-based backgrounds, immersive transitions. |
| **Bundle size** | 150+ KB gzipped (Three.js alone is ~130 KB). |
| **Trade-off** | Only for a dedicated 3D visualization demo. Overkill for standard presentation content. High learning curve. Performance concerns on low-end devices. |

### Package Summary Matrix

| Package | Tier | Size (gzip) | New Deps | Effort | Visual Impact |
|---------|------|-------------|----------|--------|--------------|
| `react-rough-notation` | 1 | ~8 KB | 1 | S | High |
| `shiki` | 1 | ~100 KB* | 0 | M | Medium-High |
| `@xyflow/react` v12 | 1 | ~0 KB** | 0 | S-M | Low-Medium |
| `@visx/*` | 2 | ~15-30 KB*** | D3 modules | M | High |
| `react-type-animation` | 2 | ~3 KB | 0 | S | Medium |
| `lottie-react` | 2 | ~15 KB + JSON | 1 | S | Medium |
| `tsparticles` | 3 | ~40-80 KB | Several | M | High (niche) |
| `mermaid` | 3 | ~300 KB | Many | M | Medium |
| `@react-three/fiber` | 3 | ~150+ KB | Three.js | L | High (niche) |

\* Grammars/themes lazy-loaded on demand
\** Replaces `reactflow`, net zero
\*** Only import needed `@visx/` sub-packages

---

## Part 2: New Demo Ideas Enabled by Packages

### 1. AI/ML Metrics Dashboard

**Topic**: Model evaluation results, A/B test comparisons, accuracy/latency trade-offs.

| Aspect | Detail |
|--------|--------|
| **Packages** | `@visx/*` (bar, line, radar charts), `react-rough-notation` (annotate key findings) |
| **Visual highlights** | Animated bar charts that grow per-segment, radar chart comparing models, rough-notation circles around best scores |
| **Framework showcase** | Segment-driven chart reveals, marker-synced annotations, AnimatedCounter for headline metrics |
| **Chapters** | Problem setup → Metrics overview → Model A results → Model B results → Comparison radar → Key findings (annotated) → Recommendation |

### 2. System Architecture Evolution

**Topic**: Microservice architecture, data pipeline evolution, before/after redesign.

| Aspect | Detail |
|--------|--------|
| **Packages** | `@xyflow/react` v12 (sub-flows, animated edges), optional `react-type-animation` (terminal commands) |
| **Visual highlights** | Progressive node reveals showing architecture growing, animated data-flow dots along edges, sub-flow zoom into a service's internals |
| **Framework showcase** | ReactFlow nodes as slide segments, marker-driven edge animation, chapter-per-architectural-era |
| **Chapters** | Monolith → First split → Service mesh → Data pipeline → Current state → Lessons learned |

### 3. Code Refactoring Case Study

**Topic**: Any code transformation story (legacy modernization, performance optimization, API redesign).

| Aspect | Detail |
|--------|--------|
| **Packages** | `shiki` (accurate highlighting), `react-type-animation` (typing out new code), `react-rough-notation` (annotate problem areas) |
| **Visual highlights** | Side-by-side before/after with shiki highlighting, typewriter effect "writing" the new code, rough-notation strikethroughs on deprecated patterns |
| **Framework showcase** | BeforeAfterSplit with shiki CodeBlocks, marker-synced line highlighting, segment-driven diff reveals |
| **Chapters** | The problem → Current code (annotated smells) → Refactoring strategy → Step-by-step transformation → Final result → Performance comparison |

### 4. Product Launch Timeline

**Topic**: Project retrospective, release planning, milestone tracking.

| Aspect | Detail |
|--------|--------|
| **Packages** | `@visx/*` (timeline/axis), `react-rough-notation` (milestone annotations), optional `lottie-react` (celebration at launch) |
| **Visual highlights** | Horizontal timeline with animated milestone markers, visx area chart for velocity/burndown, confetti burst on launch slide |
| **Framework showcase** | ProgressSteps enhancement, segment-per-milestone reveals, AnimatedCounter for sprint metrics |
| **Chapters** | Vision → Planning → Sprint highlights → Blockers overcome → Launch → Metrics → Retrospective |

### 5. Cost Optimization Story

**Topic**: Infrastructure cost reduction, efficiency improvements, ROI analysis.

| Aspect | Detail |
|--------|--------|
| **Packages** | `@visx/*` (trend lines, bar comparisons), `react-rough-notation` (circle savings numbers), AnimatedCounter (dramatic reveals) |
| **Visual highlights** | Animated trend line showing cost over time, stacked bar chart of cost breakdown, rough-notation circles on the "after" numbers, AnimatedCounter counting up savings |
| **Framework showcase** | Segment-driven chart animation, marker-synced annotations on key data points, before/after split for cost comparison |
| **Chapters** | The cost problem → Baseline metrics → Analysis → Optimization 1 → Optimization 2 → Results (animated charts) → ROI summary |

---

## Part 3: `highlights-deep-dive` Enhancement Audit

### Current Demo Structure

| Chapter | Slides | Topic |
|---------|--------|-------|
| Ch0 | S1 (Title) | Opening — "Meeting Highlights" |
| Ch1 | S1, S2 | Product Context — pipeline overview, COGS problem |
| Ch2 | S1 | V1 Pipeline — Four API calls architecture |
| Ch3 | S1 | Document Strategy — pre-computation approach |
| Ch4 | S1-S4 | O(n²) Problem — nested loops, candidate explosion, context window |
| Ch5 | S1, S2 | Summarization — batching strategy |
| Ch6 | S1-S4 | Prompt Engineering — overview, pseudocode, prose vs code, output schema |
| Ch7 | S1, S2 | Copy-then-Parse — extraction strategy, self-checks |
| Ch8 | S1, S2 | Evaluation — validation challenges, eval tool |
| Ch9 | S1, S2 | Results — metrics, quality & impact |
| Ch10 | S1, S2 | Lessons & Closing |

### High Impact Enhancements

These are the slides audiences remember — invest here first.

#### Ch9_S1_Metrics — Circular Progress Rings

| Aspect | Detail |
|--------|--------|
| **Current** | `AnimatedCounter` + `MetricDisplay` — numbers animate from 0→75%, 0→60%, 0→70%. Effective but visually flat. |
| **Enhancement** | SVG circular progress rings with animated fill. Each ring sweeps from 0° to final angle with spring easing. Number counter in center. Color-coded (green for good scores). |
| **Package needed** | None — Framer Motion + SVG `stroke-dasharray` / `stroke-dashoffset` animation. |
| **New component** | `CircularProgress` (framework) — props: `value`, `max`, `size`, `color`, `thickness`, `label`. Animated via `motion.circle` with `pathLength` from 0→value/max. |
| **Effort** | M — New component + slide integration + testing. |
| **Why high impact** | Results slides are the climax. Visual progress rings are universally understood and satisfying to watch fill. |

#### Ch0_S1_Title — Character-Level Spring Animation

| Aspect | Detail |
|--------|--------|
| **Current** | Text with opacity + translateY fade using `motion.h1`. Clean but generic. |
| **Enhancement** | Each character in the title wraps in `motion.span`, entering with spring physics (slight overshoot, stagger delay). Characters "land" individually like falling letters. |
| **Package needed** | None — Framer Motion `motion.span` per character with `staggerChildren`. |
| **New component** | `AnimatedHeading` (framework) — props: `text`, `as` (h1-h6), `stagger`, `spring`. Splits text into spans, animates each. |
| **Effort** | S-M — Component build is straightforward; tuning spring physics for good feel takes iteration. |
| **Why high impact** | First impression. Sets the tone. A polished title animation signals production quality. |

#### Ch10_S2_Closing — Character Animation + Confetti

| Aspect | Detail |
|--------|--------|
| **Current** | Gradient text "Thank You" + `GradientHighlightBox` with scale+opacity animation. |
| **Enhancement** | Same `AnimatedHeading` character animation as title (bookend effect). Optional confetti burst on segment 1 — Lottie JSON confetti is lighter than tsparticles (~20 KB animation file vs ~60 KB library). |
| **Package needed** | `lottie-react` (optional — can skip confetti and still improve with `AnimatedHeading` alone). |
| **New component** | Reuse `AnimatedHeading`. Optional `ConfettiOverlay` (demo-specific or framework). |
| **Effort** | S — Reuses AnimatedHeading. Confetti adds a bit more. |
| **Why high impact** | Last impression. Bookends with the opening animation. Confetti provides a "celebration" moment. |

#### Ch2_S1_FourCalls — Animated Data Flow Dots

| Aspect | Detail |
|--------|--------|
| **Current** | `PipelineDiagram` with `visibleSteps` prop — steps appear progressively via `useSegmentedAnimation()`. Steps are styled boxes with arrows. |
| **Enhancement** | Animated dots flowing between pipeline steps. SVG circles travel along a bezier path between steps using Framer Motion `offsetDistance` or `pathLength` animation. Dots flow when each step activates. |
| **Package needed** | None — Framer Motion + SVG path animation (`motion.circle` on a `<path>` with `offset-path`). |
| **New component** | Enhanced `PipelineDiagram` with optional `animateFlow` prop, or standalone `AnimatedArrow` component. |
| **Effort** | M — SVG path math, timing synchronization with segment reveals. |
| **Why high impact** | Pipeline diagrams are central to this demo's story. Flowing dots make the data movement tangible rather than abstract. |

#### Ch7_S2_SelfChecks — SVG Path-Draw Checkmarks

| Aspect | Detail |
|--------|--------|
| **Current** | `SelfCheckCard` grid — 10 cards with green circle badges containing "✓" text. 2-column layout, `tileVariants()` stagger animation. |
| **Enhancement** | SVG path-draw checkmarks: each "✓" animates by drawing its stroke path using `pathLength` 0→1. Creates a satisfying "ding" feel as each validator appears. The stroke draws itself rather than just fading in. |
| **Package needed** | None — SVG `<path>` with Framer Motion `pathLength` prop. |
| **New component** | `AnimatedCheckmark` (framework) — props: `size`, `color`, `strokeWidth`, `delay`. SVG check path with `motion.path` animating `pathLength`. |
| **Effort** | S — Simple SVG component. The path data for a checkmark is ~20 characters. |
| **Why high impact** | 10 checkmarks animating in sequence creates a strong "everything passes" visual rhythm. Much more satisfying than static checkmark text. |

### Moderate Impact Enhancements

#### Ch4_S3_Visualized — Graduated Color Gauge

| Aspect | Detail |
|--------|--------|
| **Current** | `expandWidth()` animation for context window fill bar. Single-color expansion. |
| **Enhancement** | Graduated color gauge — bar transitions through green→yellow→red zones as it fills. Leading edge has a spark/glow effect (SVG filter or box-shadow animation). Communicates "danger" as context fills up. |
| **Package needed** | None — SVG linearGradient + Framer Motion. |
| **Effort** | S |

#### Ch1_S2_COGSProblem — Rough-Notation Annotations

| Aspect | Detail |
|--------|--------|
| **Current** | `MetricTile` showing "4 API calls", "600+ GPUs", cost figures. Clean but the key numbers don't pop. |
| **Enhancement** | `react-rough-notation` circles around the key numbers as the narrator emphasizes them. Circle "4 API calls" when narrator says it, underline "600+ GPUs", highlight the cost figure. Hand-drawn style adds emphasis without feeling corporate. |
| **Package needed** | `react-rough-notation` |
| **Effort** | S — Wrap numbers in `<RoughNotation>`, trigger `show` via markers. |

#### Ch6_S2_Pseudocode — Shiki Syntax Highlighting

| Aspect | Detail |
|--------|--------|
| **Current** | `MarkerCodeBlock` with regex tokenizer for Python pseudocode. Handles basic keywords and strings but misses decorator syntax, multi-line strings, type hints. |
| **Enhancement** | `shiki`-powered syntax highlighting with accurate Python grammar. Same `MarkerCodeBlock` API but rendering quality jumps to VS Code level. Theme matches our dark presentation aesthetic. |
| **Package needed** | `shiki` |
| **Effort** | M — `CodeBlock` internal rewrite. Must preserve `highlightLines`, `markerLines`, `title`, `fontSize` API. Shiki produces HTML tokens; need to merge with our line-highlight and marker-highlight systems. |

#### Ch9_S2_QualityAndImpact — Animated Bar Chart

| Aspect | Detail |
|--------|--------|
| **Current** | `QualityTile` flat tiles + `ProgressSteps` component. Quality scores shown as text. |
| **Enhancement** | Horizontal animated bar chart for quality scores. Bars grow from left to right with stagger. Color intensity maps to score. Much more visual than text-only tiles. |
| **Package needed** | `@visx/shape` or none (pure SVG `<motion.rect>`). |
| **Effort** | S-M |

#### Ch1_S1_ProductContext — Self-Drawing Arrows

| Aspect | Detail |
|--------|--------|
| **Current** | `PipelineBox` + `PipelineArrow` inline components. Arrows are static styled divs with "→" text. |
| **Enhancement** | SVG arrows that draw themselves via `stroke-dasharray` animation. Arrow stroke animates from 0% to 100% drawn when the segment reveals. Arrowhead appears at the end. |
| **Package needed** | None — SVG + Framer Motion `pathLength`. |
| **Effort** | S |

#### Ch6_S1_PromptOverview — Section Connections + Annotations

| Aspect | Detail |
|--------|--------|
| **Current** | Grid of 6 `PromptSectionCard` components + `Callout`. Cards dim via `useMarker('dim-sections')`. |
| **Enhancement** | Animated connecting lines between related sections (SVG paths drawn as narrator describes relationships). `react-rough-notation` highlight on the currently-narrated section. |
| **Package needed** | `react-rough-notation` |
| **Effort** | S |

#### Ch8_S2_EvalTool — Terminal Typewriter Output

| Aspect | Detail |
|--------|--------|
| **Current** | `EvalPipelineStep` boxes + `EvalPipelineArrow` connectors + output description cards. Static layout. |
| **Enhancement** | Terminal-style output animation showing eval results being "printed" line by line. Typewriter effect for the eval output, making it feel like watching a live eval run. |
| **Package needed** | `react-type-animation` |
| **Effort** | S |

### Enhancement Summary Matrix

| Slide | Enhancement | Package | Component | Impact | Effort |
|-------|------------|---------|-----------|--------|--------|
| Ch9_S1_Metrics | Circular progress rings | None | `CircularProgress` | **High** | M |
| Ch0_S1_Title | Character-level spring text | None | `AnimatedHeading` | **High** | S-M |
| Ch10_S2_Closing | Character animation + confetti | `lottie-react` (opt) | `AnimatedHeading` | **High** | S |
| Ch2_S1_FourCalls | Animated data-flow dots | None | Enhanced `PipelineDiagram` | **High** | M |
| Ch7_S2_SelfChecks | SVG path-draw checkmarks | None | `AnimatedCheckmark` | **High** | S |
| Ch4_S3_Visualized | Graduated color gauge | None | Inline | Moderate | S |
| Ch1_S2_COGSProblem | Rough-notation on numbers | `react-rough-notation` | Inline | Moderate | S |
| Ch6_S2_Pseudocode | Shiki highlighting | `shiki` | `CodeBlock` rewrite | Moderate | M |
| Ch9_S2_QualityAndImpact | Animated bar chart | `@visx/shape` or None | Inline | Moderate | S-M |
| Ch1_S1_ProductContext | Self-drawing arrows | None | `AnimatedArrow` | Moderate | S |
| Ch6_S1_PromptOverview | Section connections | `react-rough-notation` | Inline | Moderate | S |
| Ch8_S2_EvalTool | Terminal typewriter output | `react-type-animation` | Inline | Moderate | S |

---

## Part 4: New Framework Components to Build

These components would be reusable across multiple slides and future demos.

### 1. `CircularProgress`

SVG ring with animated fill, configurable size/color/thickness, label in center.

```tsx
// Usage
<CircularProgress value={75} max={100} size={120} color="#4ade80" label="75%" />
```

| Aspect | Detail |
|--------|--------|
| **Implementation** | SVG `<circle>` with `stroke-dasharray` = circumference, `stroke-dashoffset` animated from circumference to `(1 - value/max) * circumference`. Framer Motion `motion.circle` with spring transition. |
| **Props** | `value`, `max`, `size`, `color`, `thickness`, `label`, `animate` (boolean), `delay` |
| **Used by** | Ch9_S1 results, future metrics demos, any dashboard-style slide |
| **Tests** | Renders SVG, respects value/max ratio, label displays, animation triggers |

### 2. `AnimatedHeading`

Character-level spring entrance animation for headings.

```tsx
// Usage
<AnimatedHeading text="Meeting Highlights" as="h1" stagger={0.03} />
```

| Aspect | Detail |
|--------|--------|
| **Implementation** | Split text into characters, wrap each in `motion.span` inside a `motion.div` with `staggerChildren`. Each character animates `y` (drop in) + `opacity` with spring physics. Whitespace preserved as non-breaking spaces. |
| **Props** | `text`, `as` (h1-h6), `stagger` (delay between chars), `spring` (spring config), `style` |
| **Used by** | Ch0_S1 title, Ch10_S2 closing, any future title/closing slide |
| **Tests** | Renders correct text content, correct number of spans, respects `as` prop |

### 3. `AnimatedCheckmark`

SVG path-draw checkmark with satisfying animation.

```tsx
// Usage
<AnimatedCheckmark size={24} color="#4ade80" delay={0.2} />
```

| Aspect | Detail |
|--------|--------|
| **Implementation** | SVG `<motion.path>` with checkmark path data (`M 6 12 L 10 16 L 18 8`). Animate `pathLength` from 0 to 1 with spring easing. Optional circle background. |
| **Props** | `size`, `color`, `strokeWidth`, `delay`, `withCircle` (background circle) |
| **Used by** | Ch7_S2 self-checks, any validation/success slide, BenefitCard-style lists |
| **Tests** | Renders SVG path, correct size, animation starts |

### 4. `AnimatedArrow`

SVG arrow that draws itself via stroke-dasharray animation.

```tsx
// Usage
<AnimatedArrow direction="right" length={80} color="#888" delay={0.3} />
```

| Aspect | Detail |
|--------|--------|
| **Implementation** | SVG `<motion.line>` or `<motion.path>` with arrowhead marker. Animate `pathLength` 0→1. Arrowhead (`<marker>`) appears at end. Supports horizontal, vertical, and bezier curve paths. |
| **Props** | `direction` ("right" \| "down" \| "custom"), `length`, `color`, `strokeWidth`, `delay`, `path` (custom SVG path data) |
| **Used by** | Ch1_S1 pipeline arrows, Ch2_S1 pipeline diagram, any flow/sequence slide |
| **Tests** | Renders SVG, correct direction/length, marker element present |

### 5. `CodeBlock` Shiki Upgrade

Replace regex tokenizer internals with shiki for accurate multi-language highlighting.

| Aspect | Detail |
|--------|--------|
| **Scope** | Internal rewrite only. Same external API: `code`, `language`, `highlightLines`, `title`, `fontSize`. |
| **Implementation** | Use `shiki.codeToTokens()` to get token arrays. Render tokens with our own line-number + highlight-line system (preserving yellow background + border behavior). Lazy-load grammars. Pre-render on mount with `useEffect` + state. |
| **Compatibility** | `MarkerCodeBlock` continues to work — it wraps `CodeBlock` and adds marker-driven `highlightLines`. No change to its API. |
| **Language expansion** | Currently limited to python/json/markdown. Shiki supports 200+ languages. Add TypeScript, JavaScript, YAML, bash, SQL, etc. |
| **Theme** | Match our dark slide background. Use shiki's `one-dark-pro` or `github-dark` theme, or define a custom theme from our `ThemeContext` tokens. |

---

## Part 5: Framework Boilerplate Reduction

An audit of the `highlights-deep-dive` demo (3,100+ lines across 11 chapter files) reveals several repeated patterns that could be eliminated with targeted framework abstractions. These make future demos faster to author and existing demos shorter to maintain.

### What Already Works Well

These patterns are well-abstracted and widely used — no changes needed:

- **`@framework` barrel imports** — clean, no bloat, enforced by ESLint
- **`fadeUp()` / `tileVariants()` animation variants** — used correctly across ~15 slides
- **`<Reveal>` / `<RevealSequence>`** — correctly used for segment-based visibility
- **`defineSlide()` factory** — consistent, enforced, validated at registration
- **Theme system via `useTheme()`** — no scattered magic hex values
- **`typography.*` / `layouts.*` static exports** — broadly adopted

### High Priority: New Abstractions

#### 1. `MarkerCard` Component

**Problem**: 9 instances across 4 chapters wrap a card in `MarkerDim` with nearly identical styling:

```tsx
// Repeated pattern (Ch1, Ch6, Ch7, Ch8):
<MarkerDim at={marker}>
  <div style={{
    background: theme.colors.bgSurface,
    border: `1px solid ${theme.colors.bgBorder}`,
    borderRadius: 8,
    padding: '0.6rem 0.85rem',
  }}>
    {content}
  </div>
</MarkerDim>
```

Inline components like `PipelineBox`, `TypeCard`, `SelfCheckCard`, `CheckCard`, `EvalPipelineStep`, `OutputPill`, `BenefitCard`, and `InsightPill` all follow this structure with minor styling differences.

**Solution**: Framework `MarkerCard` component:

```tsx
<MarkerCard marker="step-1" variant="default" style={{ flex: 1 }}>
  {content}
</MarkerCard>
```

| Aspect | Detail |
|--------|--------|
| **Props** | `marker: string`, `children`, `variant?: 'default' \| 'primary' \| 'error' \| 'warning' \| 'success'`, `style?: CSSProperties` |
| **Implementation** | Wraps `<MarkerDim at={marker}>` around a themed card div. Uses `cardStyle(variant)` internally. Merges optional `style` overrides. |
| **Saves** | ~400 lines across `highlights-deep-dive`; pattern multiplies across every demo using marker-driven cards. |
| **Files** | `Ch1` (3 inline components), `Ch6` (3), `Ch7` (1), `Ch8` (2) |

#### 2. `cardStyle()` Override Parameter

**Problem**: 12+ instances spread `...cardStyle('error')` then immediately override `borderRadius`, `padding`, `flex`, etc.:

```tsx
// Repeated pattern (Ch4, Ch5, Ch6):
style={{
  ...cardStyle('error'),
  borderRadius: 10,
  padding: '0.75rem 1.25rem',
  flex: 1,
  textAlign: 'center' as const,
}}
```

**Solution**: Extend `cardStyle()` to accept an optional overrides object:

```tsx
cardStyle('error', { borderRadius: 10, padding: '0.75rem 1.25rem', flex: 1 })
```

| Aspect | Detail |
|--------|--------|
| **Change** | Add optional second parameter `overrides?: CSSProperties` to `cardStyle()` in `SlideStyles.ts`. Spread overrides after the base style. |
| **Saves** | ~150 lines of inline style merging. |
| **Backward compatible** | Yes — existing `cardStyle('error')` calls unchanged. |

#### 3. `RevealCarousel` Component

**Problem**: 2 slides (Ch4_S4_OutputSafety, Ch6_S4_OutputSchema) use `RevealSequence` with 4+ children, each wrapped in `<Reveal from={N} until={N+1}>` / `<Reveal from={N}>`. Each instance is 200+ lines of mechanical `from`/`until` index wiring:

```tsx
// Repeated pattern — manual index bookkeeping:
<RevealSequence>
  <Reveal from={0} until={1} animation={fadeUp}>{/* panel A */}</Reveal>
  <Reveal from={1} until={2} animation={fadeUp}>{/* panel B */}</Reveal>
  <Reveal from={2} until={3} animation={fadeUp}>{/* panel C */}</Reveal>
  <Reveal from={3} animation={fadeUp}>{/* panel D */}</Reveal>
</RevealSequence>
```

**Solution**: Framework `RevealCarousel` that auto-wires `from`/`until` from a children array:

```tsx
<RevealCarousel animation={fadeUp}>
  <div>{/* panel A — auto from={0} until={1} */}</div>
  <div>{/* panel B — auto from={1} until={2} */}</div>
  <div>{/* panel C — auto from={2} until={3} */}</div>
  <div>{/* panel D — auto from={3} (last, no until) */}</div>
</RevealCarousel>
```

| Aspect | Detail |
|--------|--------|
| **Props** | `children: ReactNode[]`, `animation?: RevealAnimation`, `startFrom?: number` (offset for slides where the carousel doesn't start at segment 0) |
| **Implementation** | Maps over `React.Children`, wraps each in `<Reveal from={startFrom + i} until={startFrom + i + 1}>` (last child omits `until`). Wraps all in `<RevealSequence>`. |
| **Saves** | ~200 lines per instance. Eliminates off-by-one bugs in `from`/`until` index math. |
| **Files** | `Ch4_S4` (4-panel carousel), `Ch6_S4` (4-panel carousel), any future multi-panel slide. |

### Medium Priority: Utility Extractions

#### 4. `GradientBadge` Factory

**Problem**: 3 instances across Ch7 and Ch8 define identical gradient checkmark badges:

```tsx
// Repeated pattern:
<div style={{
  width: 22, height: 22, borderRadius: 6,
  background: `linear-gradient(135deg, ${theme.colors.success}, #059669)`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0,
}}>
  &#10003;
</div>
```

**Solution**: Add `gradientBadge()` factory to `SlideStyles.ts`:

```tsx
gradientBadge(size?: number, color?: string) // returns CSSProperties
```

| Aspect | Detail |
|--------|--------|
| **Defaults** | `size=22`, gradient from `theme.colors.success` to `#059669`. Centered flex, white text. |
| **Saves** | ~30 lines (3 instances). More important: gives a semantic name to the pattern. |
| **Note** | Will be partly superseded by `AnimatedCheckmark` from Part 4, but `gradientBadge()` remains useful for non-animated contexts (static badges, legends). |

#### 5. `monoText` Style Utility

**Problem**: 5 instances across Ch4, Ch5, Ch6 define monospace font styling with slight variations:

```tsx
// Repeated pattern:
fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
fontSize: 13,
fontWeight: 600,
```

**Solution**: Add `monoText(fontSize?: number)` to `SlideStyles.ts` alongside existing `typography.*`:

```tsx
monoText(fontSize?: number) // returns { fontFamily, fontSize, fontWeight }
```

| Aspect | Detail |
|--------|--------|
| **Saves** | ~25 lines. Centralizes the font stack (currently duplicated with slight variations like missing `'Fira Code'` in some instances). |

#### 6. Promote `layouts.grid2Col()` Usage

**Problem**: 8 instances of inline 2-column grid styling despite `layouts.grid2Col(gap)` existing in `SlideStyles.ts`:

```tsx
// Reinvented inline (Ch5, Ch8, Ch9):
style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}

// Already available:
style={layouts.grid2Col('1.5rem')}
```

**Solution**: No code change needed — this is a documentation/awareness gap. Add prominent examples to `ANIMATION_REFERENCE.md` and `COMPONENT_CATALOG.md`. Consider a lint rule or code review checklist item.

### Lower Priority: Nice-to-Have

#### 7. `StatusLabel` Component

3 instances of uppercase, letter-spaced caption labels with color override (Ch8, Ch9). Small component: `<StatusLabel color="success">GROUNDING</StatusLabel>`.

**Saves**: ~20 lines. Low frequency but adds semantic clarity.

### Summary

| # | Abstraction | Occurrences | Lines Saved | Effort | Priority |
|---|------------|-------------|-------------|--------|----------|
| 1 | `MarkerCard` | 9x (4 chapters) | ~400 | S | High |
| 2 | `cardStyle()` overrides | 12x (3 chapters) | ~150 | XS | High |
| 3 | `RevealCarousel` | 2x (2 chapters) | ~200 | S-M | High |
| 4 | `gradientBadge()` | 3x (2 chapters) | ~30 | XS | Medium |
| 5 | `monoText()` | 5x (3 chapters) | ~25 | XS | Medium |
| 6 | `layouts.grid2Col()` docs | 8x (3 chapters) | 0 (awareness) | XS | Medium |
| 7 | `StatusLabel` | 3x (2 chapters) | ~20 | XS | Low |
| | **Total** | **42 instances** | **~825 lines** | | |

These abstractions reduce the `highlights-deep-dive` demo by ~25% in line count and — more importantly — make new demos significantly faster to author. A new slide with 3 marker-driven cards + a carousel sequence drops from ~80 lines of boilerplate to ~20 lines of declarative usage.

---

## Part 6: Implementation Order

### Phase 1 — Pure Framer Motion + SVG + Boilerplate Reduction (Zero New Dependencies)

**Estimated scope**: ~3-4 focused sessions

**New visual components:**

| Task | Component | Applied To | Notes |
|------|-----------|-----------|-------|
| Build `CircularProgress` | Framework | Ch9_S1_Metrics | SVG ring + spring animation |
| Build `AnimatedHeading` | Framework | Ch0_S1_Title, Ch10_S2_Closing | Character-level springs |
| Build `AnimatedCheckmark` | Framework | Ch7_S2_SelfChecks | SVG path-draw |
| Build `AnimatedArrow` | Framework | Ch1_S1_ProductContext, Ch2_S1_FourCalls | Self-drawing arrows |
| Graduated gauge | Inline | Ch4_S3_Visualized | Green→yellow→red fill bar |
| Animated bar chart | Inline | Ch9_S2_QualityAndImpact | Pure SVG `<motion.rect>` |

**Boilerplate reduction (Part 5):**

| Task | Component | Applied To | Notes |
|------|-----------|-----------|-------|
| Build `MarkerCard` | Framework | Ch1, Ch6, Ch7, Ch8 | Replaces 9 inline card-in-MarkerDim patterns |
| Build `RevealCarousel` | Framework | Ch4_S4, Ch6_S4 | Auto-wires from/until indices |
| Extend `cardStyle()` overrides | `SlideStyles.ts` | Ch4, Ch5, Ch6 | Add optional second param |
| Add `gradientBadge()` | `SlideStyles.ts` | Ch7, Ch8 | Gradient checkmark badge factory |
| Add `monoText()` | `SlideStyles.ts` | Ch4, Ch5, Ch6 | Monospace font stack utility |
| Refactor demo slides | Demo | All affected chapters | Apply new abstractions, remove inline duplicates |

**Shared tasks:**

| Task | Scope | Notes |
|------|-------|-------|
| Export new components | `framework/index.ts` | Named exports for MarkerCard, RevealCarousel, etc. |
| Unit tests | vitest + jsdom | All new framework components |
| Update docs | `ANIMATION_REFERENCE.md`, `COMPONENT_CATALOG.md` | Document new components + promote `layouts.grid2Col()` |

**Why first**: Highest visual impact, zero bundle cost, zero dependency risk. Boilerplate reduction makes the subsequent phases faster (less code to update when applying package integrations).

### Phase 2 — Must-Have Packages

**Estimated scope**: ~3-4 focused sessions

| Task | Package | Applied To | Notes |
|------|---------|-----------|-------|
| Install `react-rough-notation` | Tier 1 | Ch1_S2, Ch6_S1 | Wrap with marker-triggered `show` |
| Build `<AnnotateAtMarker>` wrapper | — | Framework utility | Thin wrapper: `<AnnotateAtMarker marker="id" type="circle">` |
| Install `shiki` | Tier 1 | All code slides | Rewrite `CodeBlock.tsx` internals |
| Preserve MarkerCodeBlock API | — | Ch4_S1, Ch6_S2, Ch6_S4, Ch7_S1 | Ensure no regressions |
| Upgrade `reactflow` → `@xyflow/react` v12 | Tier 1 | Existing ReactFlow usage | Import path migration |
| Integration tests | vitest | — | CodeBlock rendering, annotation triggers |

**Why second**: Must-have packages have strong value propositions and low risk. Shiki is the biggest change (CodeBlock rewrite) — do it after Phase 1 validates the component patterns.

### Phase 3 — Nice-to-Have Packages (Per-Demo Basis)

**Estimated scope**: ~2-3 focused sessions, driven by new demo needs

| Task | Package | Applied To | Notes |
|------|---------|-----------|-------|
| Install `@visx/*` | Tier 2 | First chart-based demo | Start with `@visx/shape` + `@visx/scale` |
| Install `react-type-animation` | Tier 2 | Ch8_S2_EvalTool, terminal demos | Small, low-risk |
| Install `lottie-react` | Tier 2 (optional) | Ch10_S2_Closing | Confetti animation JSON |

**Why third**: These packages are best justified by specific demo needs. Install them when building the demo that needs them, not speculatively.

### Phases NOT Planned

Tier 3 packages (`tsparticles`, `mermaid`, `@react-three/fiber`) are not planned. They would only be installed if a specific demo concept requires them and the bundle cost is justified by the demo's value.

---

## Files to Modify

### New Files

| File | Purpose |
|------|---------|
| `src/framework/components/CircularProgress.tsx` | SVG ring progress component |
| `src/framework/components/AnimatedHeading.tsx` | Character-level spring text |
| `src/framework/components/AnimatedCheckmark.tsx` | SVG path-draw checkmark |
| `src/framework/components/AnimatedArrow.tsx` | Self-drawing SVG arrow |
| `src/framework/components/MarkerCard.tsx` | MarkerDim + themed card wrapper |
| `src/framework/components/RevealCarousel.tsx` | Auto-indexed RevealSequence children |

### Modified Files

| File | Change |
|------|--------|
| `src/framework/slides/SlideStyles.ts` | `cardStyle()` overrides param, `gradientBadge()`, `monoText()` |
| `src/framework/components/CodeBlock.tsx` | Rewrite internals with shiki (Phase 2) |
| `src/framework/index.ts` | Export new components (`MarkerCard`, `RevealCarousel`, visual components) |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter0.tsx` | `AnimatedHeading` for title |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter1.tsx` | `AnimatedArrow` + `MarkerCard` + rough-notation |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter2.tsx` | Enhanced `PipelineDiagram` / `AnimatedArrow` |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter4.tsx` | Graduated gauge on Ch4_S3, `RevealCarousel` on Ch4_S4 |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter5.tsx` | `cardStyle()` overrides, `monoText()` |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter6.tsx` | `MarkerCard`, `RevealCarousel` on Ch6_S4, shiki CodeBlock, rough-notation |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter7.tsx` | `AnimatedCheckmark` + `MarkerCard` for self-checks |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter8.tsx` | `MarkerCard` + `gradientBadge()` + `react-type-animation` for eval output |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter9.tsx` | `CircularProgress` + animated bars |
| `src/demos/highlights-deep-dive/slides/chapters/Chapter10.tsx` | `AnimatedHeading` + optional confetti |
| `package.json` | Add `react-rough-notation`, `shiki`, `@xyflow/react` (Phase 2) |
| `docs/ANIMATION_REFERENCE.md` | Document new visual components |
| `docs/COMPONENT_CATALOG.md` | Document `MarkerCard`, `RevealCarousel`, promote `layouts.grid2Col()` |

---

## Verification

- [ ] New framework components have unit tests (vitest + jsdom): `CircularProgress`, `AnimatedHeading`, `AnimatedCheckmark`, `AnimatedArrow`, `MarkerCard`, `RevealCarousel`
- [ ] `cardStyle()` overrides, `gradientBadge()`, `monoText()` have unit tests
- [ ] `npm run type-check` passes
- [ ] `npm run test` passes (all 248+ existing tests + new ones)
- [ ] `npm run lint` — no new errors
- [ ] `npm run test:overflow -- --demo highlights-deep-dive` — no overflow regressions
- [ ] `npm run test:screenshot -- --demo highlights-deep-dive` — visual comparison of enhanced slides
- [ ] Refactored demo slides produce identical visual output (screenshot diff before/after boilerplate reduction)
- [ ] `docs/ANIMATION_REFERENCE.md` updated with new visual component entries
- [ ] `docs/COMPONENT_CATALOG.md` updated with `MarkerCard`, `RevealCarousel`, `layouts.grid2Col()` examples
- [ ] Bundle size impact measured (`npm run build` before/after comparison)
