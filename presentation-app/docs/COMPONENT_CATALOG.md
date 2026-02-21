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

## Layout Cards

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

## Media

### VideoPlayer

Controlled video element with play/pause tied to segment state, optional freeze-on-end, and captions support.

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

<VideoPlayer
  videoPath="/videos/my-demo/intro.mp4"
  isPlaying={segment >= 1}
  onEnded={() => console.log('done')}
/>
```

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

## See Also

- [ANIMATION_REFERENCE.md](./ANIMATION_REFERENCE.md) — Animation variants, factories, and presets
- [COMPONENTS.md](./COMPONENTS.md) — Framework component architecture and patterns
- [THEMING.md](./THEMING.md) — Theme system, colors, and `useTheme()` hook
