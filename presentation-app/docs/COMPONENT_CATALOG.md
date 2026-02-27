# Component Catalog

> **These components are starting points and inspiration, not the only building blocks you can use.**
>
> The expected workflow is: browse this catalog for patterns, then **create custom components** when a slide needs something specific. Demo-specific components that prove broadly useful get promoted here over time (that's how CodeBlock, BeforeAfterSplit, PipelineDiagram, and CandidateGrid all started).
>
> When building custom components, follow the conventions below (theme-aware colors, reduced-motion support, named exports with props interfaces) so they integrate cleanly and can be promoted later.

---

## Quick Reference

| Component | Category | Source | Summary |
|-----------|----------|--------|---------|
| Callout | Layout Cards | `framework/components/Callout.tsx` | Left-bordered callout box (info/tip/warning/error/success) |
| NumberedStepCard | Layout Cards | `framework/components/NumberedStepCard.tsx` | Numbered step with circle badge + active state |
| ComparisonTable | Comparison | `framework/components/ComparisonTable.tsx` | Color-coded comparison table |
| FieldCard | Layout Cards | `framework/components/FieldCard.tsx` | Left-accent card with monospace name + badge |
| CodeBlock | Data Display | `framework/components/CodeBlock.tsx` | Syntax-highlighted code with line numbers |
| MetricTile | Data Display | `framework/components/MetricTile.tsx` | Before/after metric comparison tile |
| MetricDisplay | Data Display | `framework/slides/SlideLayouts.tsx` | Single animated metric value |
| BeforeAfterSplit | Comparison | `framework/components/BeforeAfterSplit.tsx` | Side-by-side before/after panels with arrow |
| ContentCard | Layout Cards | `framework/slides/SlideLayouts.tsx` | Dark background content card |
| GradientHighlightBox | Layout Cards | `framework/slides/SlideLayouts.tsx` | Gradient box with glow effect |
| BenefitCard | Layout Cards | `framework/slides/SlideLayouts.tsx` | Feature card with icon, title, description |
| ImprovementCard | Layout Cards | `framework/slides/SlideLayouts.tsx` | Improvement item with visibility control |
| TestimonialCard | Layout Cards | `framework/slides/SlideLayouts.tsx` | Quote card with author attribution |
| PipelineDiagram | Data Visualization | `framework/components/PipelineDiagram.tsx` | Vertical step-by-step pipeline |
| CandidateGrid | Data Visualization | `framework/components/CandidateGrid.tsx` | Animated upper-triangle matrix grid |
| VideoPlayer | Media | `framework/components/VideoPlayer.tsx` | Controlled video with play/pause/end |
| RevealAtMarker | Animation | `framework/components/reveal/RevealAtMarker.tsx` | Time-based reveal driven by inline markers |
| MarkerDim | Animation | `framework/components/reveal/MarkerDim.tsx` | Declarative marker-driven opacity dimming |
| MarkerCard | Animation | `framework/components/MarkerCard.tsx` | MarkerDim + themed card wrapper (replaces MarkerDim + cardStyle boilerplate) |
| MarkerCodeBlock | Data Display | `framework/components/MarkerCodeBlock.tsx` | CodeBlock with marker-driven line highlighting |
| AnimatedCounter | Data Display | `framework/components/AnimatedCounter.tsx` | Counting-up number animation |
| ProgressSteps | Data Visualization | `framework/components/ProgressSteps.tsx` | Horizontal step indicator with states |
| RevealCarousel | Animation | `framework/components/RevealCarousel.tsx` | Auto-indexed one-at-a-time RevealSequence children |

---

## Animation

### RevealAtMarker

Time-based reveal component that triggers animations at specific moments during audio playback, using inline markers (`{#id}` / `{id#}`) in narration text. Complements the segment-based `<Reveal>` for sub-segment timing.

**Source:** `src/framework/components/reveal/RevealAtMarker.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `at` | `string` | — | Marker ID for progressive reveal (mutually exclusive with `from`/`until`) |
| `from` | `string` | — | Start marker ID for bounded range |
| `until` | `string` | — | End marker ID for bounded range |
| `animation` | `RevealAnimation` | `fadeIn` | Entrance animation factory |
| `exitAnimation` | `RevealAnimation` | — | Exit animation factory |
| `as` | `'div' \| 'span' \| 'li' \| 'section' \| 'article' \| 'p'` | `'div'` | HTML element type |
| `className` | `string` | — | CSS class |
| `style` | `CSSProperties` | — | Inline styles |

```tsx
import { RevealAtMarker, fadeUp } from '@framework';

// Progressive: visible once narrator reaches {#pipeline}
<RevealAtMarker at="pipeline" animation={fadeUp}>
  <PipelineDiagram />
</RevealAtMarker>

// Bounded: visible only between {#llm} and {#topics}
<RevealAtMarker from="llm" until="topics">
  <LLMHighlight />
</RevealAtMarker>
```

**Graceful degradation:** When `alignment.json` is missing (markers not yet aligned), children render immediately without waiting for audio timestamps.

**Tips:** Use `at` for content that should stay visible once introduced. Use `from`/`until` for temporary highlights or callouts. Combine with segment-based `<Reveal>` on the same slide for mixed granularity.

---

### MarkerDim

Declarative marker-driven dimming wrapper. Unlike `RevealAtMarker` (binary show/hide), `MarkerDim` keeps content always visible but toggles between full and dimmed opacity based on marker state.

**Source:** `src/framework/components/reveal/MarkerDim.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `at` | `string` | — | Marker ID; content is dimmed until this marker is reached |
| `until` | `string` | — | Marker ID; content dims after this marker is reached |
| `notAt` | `string` | — | Inverse of `at`; content dims when this marker IS reached |
| `dimOpacity` | `number` | `0.15` | Opacity when dimmed |
| `duration` | `number` | `0.4` | Transition duration in seconds |
| `as` | `ElementType` | `'div'` | HTML element type |
| `style` | `CSSProperties` | — | Additional inline styles |
| `className` | `string` | — | CSS class |

```tsx
import { MarkerDim } from '@framework';

// Progressive: dimmed until marker reached
<MarkerDim at="pipeline">
  <PipelineBox />
</MarkerDim>

// Inverse: full opacity until marker reached, then dims
<MarkerDim until="next-section">
  <PreviousContent />
</MarkerDim>

// Focus pattern: dim when another marker IS reached
<MarkerDim notAt="other-item">
  <ThisItem />
</MarkerDim>
```

**Graceful degradation:** When alignment data is missing, content renders at full opacity (markers default to `reached: true`).

**Tips:** This is the #1 replacement for the common `useMarker()` + `opacity` boilerplate. Use `at` for progressive "light-up" reveals. Use `notAt` on BeforeAfterSplit sides to dim one side when the other is focused. Nest inside `<Reveal>` for combined segment + marker control.

### MarkerCard

Combines `<MarkerDim>` + themed card styling into a single component. Eliminates the common `<MarkerDim at={marker}><div style={cardStyle(variant)}>...</div></MarkerDim>` boilerplate.

**Source:** `src/framework/components/MarkerCard.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `marker` | `string` | — | Marker ID; content is dimmed until this marker is reached |
| `icon` | `ReactNode` | — | Optional icon/emoji displayed to the left of the title |
| `title` | `string` | — | Bold title text at the top of the card |
| `children` | `ReactNode` | — | Card body content |
| `variant` | `CardVariant` | `'default'` | Card color variant |
| `style` | `CSSProperties` | — | Style overrides applied to the inner card div |
| `dimOpacity` | `number` | `0.15` | Opacity when the marker hasn't been reached |

```tsx
import { MarkerCard } from '@framework';

// Simple card with marker-driven reveal
<MarkerCard marker="pipeline" variant="primary">
  Pipeline processes transcript data
</MarkerCard>

// Card with icon, title, and style override
<MarkerCard marker="validation" icon="✓" title="Output Validation" style={{ borderRadius: 10 }}>
  JSON checked for structural correctness
</MarkerCard>
```

**When to use:** Prefer `MarkerCard` over manual `MarkerDim` + `cardStyle()` whenever the content follows the standard card pattern. Use raw `MarkerDim` when you need non-card layouts or custom wrapper elements.

### RevealCarousel

Auto-indexed `RevealSequence` children — each child gets sequential `from`/`until` props so only one is visible at a time. Eliminates manual index wiring and off-by-one errors.

**Source:** `src/framework/components/RevealCarousel.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode[]` | — | Array of elements to cycle through |
| `animation` | `AnimationFactory` | — | Optional entrance animation |
| `startFrom` | `number` | `0` | Segment offset for the first child |

```tsx
import { RevealCarousel } from '@framework';

<RevealCarousel animation={fadeUp}>
  <SlideA />  {/* visible at segment 0, hidden at 1+ */}
  <SlideB />  {/* visible at segment 1, hidden at 2+ */}
  <SlideC />  {/* visible at segment 2+ */}
</RevealCarousel>
```

---

## Data Display

### CodeBlock

Syntax-highlighted code block with line numbers, optional title bar, and line highlighting. Supports Python, JSON, and Markdown tokenization.

**Source:** `src/framework/components/CodeBlock.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | *required* | The source code to display |
| `language` | `'python' \| 'json' \| 'markdown'` | `'python'` | Language for syntax highlighting |
| `highlightLines` | `number[]` | `[]` | 1-based line numbers to highlight |
| `title` | `string` | — | Title bar text (e.g. filename) |
| `fontSize` | `number` | `13` | Font size in pixels |

```tsx
import { CodeBlock } from '@framework';

<CodeBlock
  code={`def hello():\n    return "world"`}
  language="python"
  title="example.py"
  highlightLines={[2]}
  fontSize={12}
/>
```

**Tips:** Use `fontSize={11}` or `fontSize={12}` for code that needs to fit alongside other content. The title bar is great for showing file paths.

---

### MarkerCodeBlock

CodeBlock wrapper with built-in marker-driven line highlighting. Instead of manually wiring `useMarker()` hooks and building `highlightLines` arrays, pass a `markerLines` mapping.

**Source:** `src/framework/components/MarkerCodeBlock.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | *required* | Source code to display |
| `language` | `'python' \| 'json' \| 'markdown'` | `'python'` | Syntax highlighting language |
| `markerLines` | `Record<string, number[]>` | *required* | Map of marker IDs to line numbers |
| `title` | `string` | — | Title bar text |
| `fontSize` | `number` | `13` | Font size in pixels |

```tsx
import { MarkerCodeBlock } from '@framework';

<MarkerCodeBlock
  code={PYTHON_CODE}
  language="python"
  title="utils.py"
  fontSize={12}
  markerLines={{
    'outer-loop': [11],
    'inner-loop': [12],
    'return': [15, 16],
  }}
/>
```

**Tips:** The number of entries in `markerLines` must be stable across renders (React hooks constraint). Lines from all reached markers are accumulated — earlier markers stay highlighted as later ones are reached.

---

### AnimatedCounter

Counting-up number animation using Framer Motion's `useMotionValue` and `animate`. In reduced-motion mode, shows the final value immediately.

**Source:** `src/framework/components/AnimatedCounter.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `from` | `number` | `0` | Start value |
| `to` | `number` | *required* | Target value |
| `suffix` | `string` | `''` | Suffix (e.g. `"%"`) |
| `prefix` | `string` | `''` | Prefix (e.g. `"~"`) |
| `duration` | `number` | `1.5` | Animation duration in seconds |
| `decimals` | `number` | `0` | Decimal places |

```tsx
import { AnimatedCounter } from '@framework';

<AnimatedCounter to={75} suffix="%" duration={1.5} />
<AnimatedCounter from={0} to={600} prefix="~" />
```

**Tips:** Can be composed inside `MetricDisplay` by passing it as the `value` prop. Uses `useReducedMotion()` internally — no need to pass `reduced` manually.

---

### MetricTile

Compact tile for displaying a before/after metric comparison with optional emphasis styling and footnote.

**Source:** `src/framework/components/MetricTile.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | *required* | Metric name (shown uppercase) |
| `before` | `string` | — | Old value (shown with strikethrough) |
| `after` | `string` | — | New value (shown bold) |
| `emphasis` | `boolean` | — | Gradient background when true |
| `note` | `string` | — | Small footnote text |

```tsx
import { MetricTile } from '@framework';

<MetricTile label="API Calls" before="4" after="1" emphasis />
```

---

### MetricDisplay

Single animated metric value with label, suitable for hero numbers.

**Source:** `src/framework/slides/SlideLayouts.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| number` | *required* | The metric value |
| `label` | `string` | *required* | Description below the value |
| `reduced` | `boolean` | *required* | Reduced-motion flag |
| `emphasis` | `boolean` | — | Highlighted styling |
| `delay` | `number` | — | Animation delay in seconds |

```tsx
import { MetricDisplay, useReducedMotion } from '@framework';

const { reduced } = useReducedMotion();
<MetricDisplay value="4x" label="Cost Reduction" reduced={reduced} emphasis />
```

---

## Comparison

### BeforeAfterSplit

Side-by-side comparison layout with a "before" panel (amber), arrow divider, and "after" panel (teal). Panels stretch to equal height.

**Source:** `src/framework/components/BeforeAfterSplit.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `beforeTitle` | `string` | *required* | Header for the left panel |
| `afterTitle` | `string` | *required* | Header for the right panel |
| `beforeContent` | `ReactNode` | *required* | Left panel content |
| `afterContent` | `ReactNode` | *required* | Right panel content |

```tsx
import { BeforeAfterSplit, CodeBlock } from '@framework';

<BeforeAfterSplit
  beforeTitle="V1: JSON"
  afterTitle="V2: Compact Table"
  beforeContent={<CodeBlock code={v1Code} language="json" />}
  afterContent={<CodeBlock code={v2Code} language="markdown" />}
/>
```

**Tips:** Works well with CodeBlock as content for both panels. The arrow animates in with a slight delay.

---

### ComparisonTable

Theme-aware table with styled headers and color-coded columns. The first column is treated as the label column (uses `textPrimary` regardless of color). Remaining columns use their respective `color` from the column definition.

**Source:** `src/framework/components/ComparisonTable.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ComparisonColumn[]` | *required* | Column definitions with header + optional color |
| `rows` | `string[][]` | *required* | Row data (array of string arrays) |
| `fontSize` | `number` | `13` | Font size in pixels |
| `style` | `CSSProperties` | — | Style overrides for the table element |

```tsx
import { ComparisonTable, useTheme } from '@framework';

const theme = useTheme();
<ComparisonTable
  columns={[
    { header: 'Aspect' },
    { header: 'V1', color: theme.colors.warning },
    { header: 'V2', color: theme.colors.primary },
  ]}
  rows={[
    ['Speaker', 'Per-utterance key', 'Once per turn'],
    ['Timestamps', 'Start + End per row', 'Omitted'],
  ]}
/>
```

**Tips:** Uses monospace font by default. Pair with `BeforeAfterSplit` above and a `ComparisonTable` below for a full comparison slide.

---

## Layout Cards

### Callout

Left-bordered, tinted-background box for tips, warnings, and insights. Theme-aware via `useTheme()`. Not animated — compose with `<Reveal>` externally.

**Source:** `src/framework/components/Callout.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'info' \| 'tip' \| 'warning' \| 'error' \| 'success'` | `'info'` | Color variant |
| `icon` | `string` | per-variant | Emoji/text icon; pass `""` to suppress |
| `children` | `ReactNode` | *required* | Callout content |
| `style` | `CSSProperties` | — | Style overrides |

```tsx
import { Callout } from '@framework';

<Callout variant="info">Key insight here</Callout>
<Callout variant="warning" icon="">No icon callout</Callout>
```

**Tips:** Use `icon=""` to suppress the default icon for text-heavy callouts. A matching `calloutStyle(variant)` function is available for inline use without the component.

---

### NumberedStepCard

Numbered step card with a circle badge, title, and optional description. Supports active highlighting and an error variant.

**Source:** `src/framework/components/NumberedStepCard.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `number` | `number` | *required* | Number shown in the badge |
| `title` | `string` | *required* | Step title |
| `description` | `string` | — | Detail text below title |
| `isActive` | `boolean` | `false` | Primary gradient highlight when active |
| `variant` | `'default' \| 'error'` | `'default'` | Error variant uses red badge gradient |
| `style` | `CSSProperties` | — | Style overrides |

```tsx
import { NumberedStepCard, useSegmentedAnimation } from '@framework';

const { currentSegmentIndex } = useSegmentedAnimation();
<NumberedStepCard
  number={1}
  title="Parse input"
  description="Extract tokens from raw text"
  isActive={currentSegmentIndex === 1}
/>
```

**Tips:** Uses `useTheme()` and `useReducedMotion()` internally. When `variant='error'` and `isActive=true`, the card background/border/glow use error colors instead of primary.

---

### FieldCard

Left-accent-bordered card with a monospace name, optional badge, and description. Generalized version of the demo-specific `MarkerFieldCard`.

**Source:** `src/framework/components/FieldCard.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | *required* | Field name (rendered monospace) |
| `description` | `string` | — | Description text |
| `badge` | `{ text: string; color?: string; bg?: string }` | — | Optional badge label |
| `accentColor` | `string` | `theme.colors.primary` | Left border accent color |
| `dimmed` | `boolean` | `false` | Reduces opacity to 0.15 |
| `compact` | `boolean` | `false` | Tighter padding and smaller font |
| `style` | `CSSProperties` | — | Style overrides |

```tsx
import { FieldCard } from '@framework';

<FieldCard
  name="abstractive_topics"
  description="1-7 topics with narration"
  badge={{ text: 'V1: Call 1', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' }}
  accentColor="#fbbf24"
/>
```

**Tips:** For marker-driven dimming, wrap with `<MarkerDim at="marker-id">` instead of manual `useMarker()` + opacity boilerplate. The `dimmed` prop can also be driven by marker state when you need the dimming applied to the card itself.

---

### ContentCard

Simple dark-background card for grouping content.

**Source:** `src/framework/slides/SlideLayouts.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | *required* | Card content |
| `style` | `CSSProperties` | — | Style overrides |

```tsx
import { ContentCard } from '@framework';

<ContentCard>
  <p>Some content here</p>
</ContentCard>
```

---

### GradientHighlightBox

Gradient-bordered card with optional glow effect for callouts and key insights.

**Source:** `src/framework/slides/SlideLayouts.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | *required* | Box content |
| `reduced` | `boolean` | *required* | Reduced-motion flag |
| `style` | `CSSProperties` | — | Style overrides |

```tsx
import { GradientHighlightBox, useReducedMotion } from '@framework';

const { reduced } = useReducedMotion();
<GradientHighlightBox reduced={reduced}>
  <p>Key insight goes here</p>
</GradientHighlightBox>
```

---

### BenefitCard

Feature card with icon, title, description, and detail text. Supports visibility and highlight states for progressive reveals.

**Source:** `src/framework/slides/SlideLayouts.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string` | *required* | Emoji or symbol |
| `title` | `string` | *required* | Card heading |
| `description` | `string` | *required* | Short description |
| `detail` | `string` | *required* | Detail text |
| `isHighlighted` | `boolean` | *required* | Active highlight state |
| `isVisible` | `boolean` | *required* | Visibility control |
| `reduced` | `boolean` | *required* | Reduced-motion flag |

---

### ImprovementCard

Compact card for listing improvement items with visibility control.

**Source:** `src/framework/slides/SlideLayouts.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string` | *required* | Emoji or symbol |
| `title` | `string` | *required* | Card heading |
| `description` | `string` | *required* | Description text |
| `isVisible` | `boolean` | *required* | Visibility control |
| `reduced` | `boolean` | *required* | Reduced-motion flag |

---

### TestimonialCard

Quote card with author attribution and animated entrance.

**Source:** `src/framework/slides/SlideLayouts.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `quote` | `string` | *required* | Quote text |
| `author` | `string` | *required* | Attribution |
| `reduced` | `boolean` | *required* | Reduced-motion flag |
| `delay` | `number` | — | Animation delay in seconds |

---

## Data Visualization

### PipelineDiagram

Vertical step-by-step pipeline with numbered nodes, connecting arrows, and progressive reveal via `visibleSteps`. Active step gets highlighted with a glow effect.

**Source:** `src/framework/components/PipelineDiagram.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visibleSteps` | `number` | *required* | How many steps to show (1-based) |
| `steps` | `PipelineStep[]` | *required* | Array of `{ name, purpose }` |
| `arrowLabel` | `string` | — | Label shown on arrows between steps |

```tsx
import { PipelineDiagram } from '@framework';
import type { PipelineStep } from '@framework';

const STEPS: PipelineStep[] = [
  { name: 'preprocess', purpose: 'Clean and normalize input' },
  { name: 'analyze', purpose: 'Run analysis pipeline' },
  { name: 'output', purpose: 'Generate final results' },
];

<PipelineDiagram visibleSteps={2} steps={STEPS} arrowLabel="JSON" />
```

**Tips:** Use with `useSegmentedAnimation()` to reveal steps one at a time: `visibleSteps={Math.max(0, currentSegmentIndex)}`.

---

### CandidateGrid

Animated upper-triangle matrix that progressively fills cells with a warm-to-hot color gradient. Useful for visualizing O(n^2) combinatorial relationships.

**Source:** `src/framework/components/CandidateGrid.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `n` | `number` | *required* | Grid dimension (n x n matrix) |
| `animate` | `boolean` | `true` | Whether to animate cell fill-in |
| `topicRanges` | `[number, number][]` | — | Restrict candidates to within ranges |
| `hideLastLabel` | `boolean` | `false` | Hide the last diagonal label |
| `counterLabel` | `string` | `"Candidates"` | Label for the counter below the grid |

```tsx
import { CandidateGrid } from '@framework';

<CandidateGrid
  n={30}
  animate
  topicRanges={[[0, 9], [10, 19], [20, 29]]}
/>
```

**Tips:** Cell size auto-scales based on `n`. For large grids (n > 20), the animation batches cells for performance.

---

### ProgressSteps

Horizontal step indicator with completed/active/pending states and configurable connectors. Active step gets gradient border + glow, completed steps show a checkmark overlay.

**Source:** `src/framework/components/ProgressSteps.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `ProgressStep[]` | *required* | Array of `{ label, icon?, status }` |
| `connectorStyle` | `'arrow' \| 'line' \| 'dashed'` | `'arrow'` | Connector between steps |

```tsx
import { ProgressSteps } from '@framework';

<ProgressSteps
  steps={[
    { label: 'Cost Reduction', status: 'completed' },
    { label: 'Private Preview', status: 'active' },
    { label: 'GA Rollout', icon: '🚀', status: 'pending' },
  ]}
  connectorStyle="arrow"
/>
```

**Tips:** Uses `useReducedMotion()` internally for staggered entrance. Pending steps are dimmed to 40% opacity, completed steps to 70%.

---

## Media

### VideoPlayer

Controlled video element with play/pause tied to segment state, optional freeze-on-end, and captions support. Auto-registers with `VideoSyncContext` (when present) for marker-driven seeks using its `videoPath`, and reports its `slideKey` from `SegmentContext` for video-slide usage tracking.

**Source:** `src/framework/components/VideoPlayer.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `videoPath` | `string` | *required* | Path to video file |
| `isPlaying` | `boolean` | *required* | Play/pause control |
| `onEnded` | `() => void` | — | Callback when video ends |
| `freezeOnEnd` | `boolean` | `true` | Keep final frame visible |
| `ariaLabel` | `string` | — | Accessibility label |
| `captionsSrc` | `string` | — | Path to WebVTT captions file |

```tsx
import { VideoPlayer } from '@framework';

// Basic usage
<VideoPlayer
  videoPath="/videos/my-demo/intro.mp4"
  isPlaying={segment >= 1}
  onEnded={() => console.log('done')}
/>

// With marker-driven seeks (auto-registers when VideoSyncContext is present)
<VideoPlayer
  videoPath="/videos/my-demo/demo.mp4"
  isPlaying={segment >= 0}
/>
```

**Marker-driven seeks:** When `VideoSyncContext` is present, the player automatically registers a seek function using its `videoPath` and reports its `slideKey` (from `useSegmentContextOptional()`) for usage tracking. When a TTS marker fires (via `videoSeeks` on the segment), the video automatically seeks to the bookmarked timestamp and plays or pauses based on the trigger's `autoPlay` (defaults to `true`). The `videoPath` must match the `videoPath` field in `VideoSeekTrigger` and the key in `bookmarks.json`. Use the 📹 Videos button in the dev-mode ProgressBar to create bookmarks interactively. See `MARKERS_GUIDE.md` for the full workflow.

**Usage cross-references in the bookmark editor:** The 📹 Videos editor shows which slides use each video and which bookmarks are referenced by triggers. Video-slide associations come from two sources: (1) a server-side source scan of slide `.tsx` files for `videoPath` references (`/api/video-bookmarks/:demoId/source-usage`), and (2) trigger metadata (`videoSeeks`/`videoWaits` on `AudioSegment`). Source-scanned references are available immediately; trigger details include bookmark IDs, marker names, and sync patterns.

---

## Building Custom Components

When a slide needs a component that doesn't exist here, build it. Here are the conventions to follow:

### 1. Use `useTheme()` for all colors

```tsx
import { useTheme } from '../theme/ThemeContext';

const theme = useTheme();
// Use theme.colors.primary, theme.colors.bgSurface, etc.
```

### 2. Support reduced motion

```tsx
import { useReducedMotion } from '../accessibility/ReducedMotion';

const { reduced } = useReducedMotion();
// Pass `reduced` to animation variants: fadeUp(reduced), staggerContainer(reduced, 0.1)
// Use shorter durations when reduced is true
```

### 3. Export named component + props interface

```tsx
export interface MyWidgetProps {
  title: string;
  data: number[];
}

export const MyWidget: React.FC<MyWidgetProps> = ({ title, data }) => {
  // ...
};
```

### 4. Use framework-relative imports (not `@framework` barrel)

When writing a framework component, import from siblings:

```tsx
import { useTheme } from '../theme/ThemeContext';
import { useReducedMotion } from '../accessibility/ReducedMotion';
import { fadeUp } from '../slides/AnimationVariants';
import { ArrowRight } from '../slides/SlideIcons';
```

### 5. Templates

- **CodeBlock** is a good template for data-display components (theme colors, reduced motion, animation entrance)
- **PipelineDiagram** is a good template for visualization components (progressive reveal, active/past states, arrow connectors)

---

## Style Utilities

Beyond components, the framework provides style factories and design tokens for common patterns. Import from `@framework`.

### Style Factories (`SlideStyles.ts`)

| Function | Returns | Description |
|----------|---------|-------------|
| `cardStyle(variant?, overrides?)` | `CSSProperties` | Card with variant-colored background/border (`'default'`, `'primary'`, `'error'`, `'warning'`, `'success'`). Optional `overrides` merged into base styles. |
| `calloutStyle(variant?)` | `CSSProperties` | Left-bordered box (`'info'`, `'tip'`, `'warning'`, `'error'`, `'success'`) |
| `badgeStyle(options?)` | `CSSProperties` | Compact tag/label (`{ color?, bg? }`) |
| `monoText(fontSize?, fontWeight?)` | `CSSProperties` | Monospace text (`JetBrains Mono / Fira Code`). Defaults: `fontSize=13`, `fontWeight=600`. |
| `gradientBadge(size?, from?, to?)` | `CSSProperties` | Circular gradient badge for icons/checkmarks. Defaults: `size=22`, green gradient. |
| `circularBadge(size?)` | `CSSProperties` | Numbered circle badge |
| `layouts.flexRow(gap?)` | `CSSProperties` | Centered flex row |
| `layouts.flexCol(gap?)` | `CSSProperties` | Flex column |
| `layouts.grid2Col(gap?)` | `CSSProperties` | 2-column grid |
| `layouts.grid3Col(gap?)` | `CSSProperties` | 3-column grid |

Theme-aware counterparts: `createCard(theme, variant, overrides?)`, `createCallout(theme, variant)`.

**`cardStyle` with overrides** — eliminates the `{ ...cardStyle('error'), borderRadius: 10 }` spread pattern:

```tsx
// Before: spread + override
<div style={{ ...cardStyle('error'), borderRadius: 10, textAlign: 'center' }}>

// After: overrides parameter
<div style={cardStyle('error', { borderRadius: 10, textAlign: 'center' })}>
```

**`monoText`** — centralizes the monospace font stack:

```tsx
// Before: inline font stack
<span style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 13, fontWeight: 600 }}>

// After: utility
<span style={{ ...monoText(13), color: theme.colors.primary }}>
```

### Design Tokens (`tokens.ts`)

Structural constants independent of the color theme:

```ts
import { spacing, spacingPx, radii, shadows, fontSizes } from '@framework';

spacing.lg    // '1rem'
spacingPx.lg  // 16
radii.xl      // 12
shadows.md    // '0 0 20px'
fontSizes.lg  // 14
```

---

## See Also

- [ANIMATION_REFERENCE.md](./ANIMATION_REFERENCE.md) — Animation variants, factories, and presets
- [COMPONENTS.md](./COMPONENTS.md) — Framework component architecture and patterns
- [THEMING.md](./THEMING.md) — Theme system, colors, and `useTheme()` hook
