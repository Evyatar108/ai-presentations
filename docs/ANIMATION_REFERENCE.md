# Animation Reference

Quick reference for slide authors. All factories live in `src/framework/slides/AnimationVariants.ts` and are re-exported from `@framework`.

---

## Entrance Animations

Compatible with `<Reveal>` and `<RevealGroup>`. Each factory takes `reduced: boolean` (from `useReducedMotion()`) and returns Framer Motion `Variants` with `hidden` / `visible` keys.

| Factory | Signature | Description |
|---------|-----------|-------------|
| `fadeIn` | `(reduced)` | Simple opacity fade |
| `fadeUp` | `(reduced, delay?)` | Fade + slide up 20px |
| `fadeDown` | `(reduced, delay?)` | Fade + slide down 20px |
| `fadeLeft` | `(reduced, distance?)` | Fade + slide from left |
| `fadeRight` | `(reduced, distance?)` | Fade + slide from right |
| `scaleIn` | `(reduced, delay?, from?)` | Scale from 0.8 + fade |
| `scaleInSpring` | `(reduced, delay?)` | Scale from 0.5 with spring |
| `tileVariants` | `(reduced)` | Card/tile entrance for stagger children |
| `arrowVariants` | `(reduced, delay?)` | Arrow scaleY reveal |
| `targetVariants` | `(reduced, delay?)` | Target/goal scale entrance |
| `promptVariants` | `(reduced)` | Slide from left 40px |

### Stagger Container

| Factory | Signature | Description |
|---------|-----------|-------------|
| `staggerContainer` | `(reduced, staggerDelay?, childDelay?)` | Parent container for staggered children |

---

## Continuous / Imperative Animations

**NOT compatible with `<Reveal>`** — these return raw animate props, not `hidden`/`visible` variants. Use directly on `motion` elements.

| Factory | Signature | Description |
|---------|-----------|-------------|
| `pulseGlow` | `(reduced, color?)` | Looping box-shadow pulse |
| `emphasisPulse` | `(reduced)` | Looping scale pulse |
| `rotateFromTo` | `(reduced, from, to, duration?)` | Rotate between angles |
| `expandWidth` | `(reduced, targetWidth, delay?)` | Animate width from 0 |
| `expandHeight` | `(reduced, targetHeight, delay?)` | Animate height from 0 |

---

## Visual Components

Self-contained animated components in `src/framework/components/`. Import from `@framework`. All respect `prefers-reduced-motion` via `useReducedMotion()`.

### CircularProgress

Animated SVG ring progress indicator. Uses imperative `useMotionValue` + `useSpring` for the `pathLength` animation (immune to parent variant state).

```tsx
import { CircularProgress, AnimatedCounter } from '@framework';

<CircularProgress value={75} label={<AnimatedCounter to={75} suffix="%" />} />
<CircularProgress value={92} size={140} thickness={10} color="#22c55e" />
<CircularProgress value={42} max={50} size={80} trackColor="#1e293b" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current value |
| `max` | `number` | `100` | Maximum value |
| `size` | `number` | `120` | Diameter in px |
| `color` | `string` | `theme.colors.primary` | Arc stroke color |
| `trackColor` | `string` | `theme.colors.bgBorder` | Background track color |
| `thickness` | `number` | `8` | Stroke width in px |
| `label` | `ReactNode` | — | Centered content |
| `animate` | `boolean` | `true` | Whether to animate on mount |
| `delay` | `number` | `0` | Delay in seconds |

### AnimatedHeading

Per-character spring entrance animation with `staggerChildren`.

```tsx
import { AnimatedHeading } from '@framework';

<AnimatedHeading text="Hello World" as="h1" />
<AnimatedHeading text="Subtitle" stagger={0.06} stiffness={80} damping={8} />
<AnimatedHeading text="Colored" color="#22c55e" delay={0.3} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | — | Text to animate |
| `as` | `'h1'–'h6'` | `'h2'` | HTML heading level |
| `stagger` | `number` | `0.04` | Delay between characters (seconds) |
| `stiffness` | `number` | `120` | Spring stiffness |
| `damping` | `number` | `14` | Spring damping |
| `style` | `CSSProperties` | — | Heading element styles |
| `color` | `string` | `theme.colors.textPrimary` | Text color |
| `delay` | `number` | `0` | Delay before first character |

### AnimatedCheckmark

SVG path-draw checkmark with optional circle background.

```tsx
import { AnimatedCheckmark } from '@framework';

<AnimatedCheckmark />
<AnimatedCheckmark size={80} withCircle color="#22c55e" />
<AnimatedCheckmark size={40} strokeWidth={4} delay={0.3} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `60` | Diameter in px |
| `color` | `string` | `theme.colors.success` | Checkmark stroke color |
| `strokeWidth` | `number` | `3` | Stroke width |
| `delay` | `number` | `0` | Delay in seconds |
| `withCircle` | `boolean` | `false` | Show circular background |
| `circleFill` | `string` | `color` at 15% opacity | Circle fill color |
| `circleStroke` | `string` | `color` | Circle stroke color |

### AnimatedArrow

Self-drawing SVG arrow with arrowhead marker. Supports 4 directions or a custom bezier path.

```tsx
import { AnimatedArrow } from '@framework';

<AnimatedArrow direction="right" length={150} />
<AnimatedArrow direction="down" length={80} color="#22c55e" />
<AnimatedArrow path="M 10 50 C 40 10, 160 10, 190 50" viewBoxWidth={200} viewBoxHeight={60} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'right' \| 'down' \| 'left' \| 'up'` | `'right'` | Preset direction (ignored with `path`) |
| `length` | `number` | `120` | Arrow length in px (ignored with `path`) |
| `color` | `string` | `theme.colors.primary` | Stroke + arrowhead color |
| `strokeWidth` | `number` | `3` | Stroke width |
| `delay` | `number` | `0` | Delay in seconds |
| `path` | `string` | — | Custom SVG path data |
| `viewBoxWidth` | `number` | `200` | viewBox width for custom path |
| `viewBoxHeight` | `number` | `100` | viewBox height for custom path |
| `headSize` | `number` | `10` | Arrowhead size in px |
| `style` | `CSSProperties` | — | SVG element styles |

---

## Background Effects

Pre-built background animation components in `src/framework/components/effects/`. All handle `useReducedMotion()` internally — no need to pass `reduced` as a prop.

### FloatingParticles

Colored dots drifting across a container. Parent needs `position: relative; overflow: hidden`.

```tsx
import { FloatingParticles } from '@framework';

<div style={{ position: 'relative', overflow: 'hidden', height: '100vh' }}>
  <FloatingParticles />
  <FloatingParticles count={25} size={6} speed={3} />
</div>
```

### FloatingEmojis

Emojis rising from bottom to top with rotation. Parent needs `position: relative; overflow: hidden`.

```tsx
import { FloatingEmojis } from '@framework';

<FloatingEmojis />
<FloatingEmojis emojis={['🔥', '💪']} speed={3} staggerDelay={2} />
```

### ShimmerOverlay

Skewed gradient sweep across parent. Parent **must** have `position: relative; overflow: hidden`.

```tsx
import { ShimmerOverlay } from '@framework';

<div style={{ position: 'relative', overflow: 'hidden' }}>
  <ShimmerOverlay />
  <ShimmerOverlay color="rgba(255,255,255,0.2)" duration={2} repeatDelay={1} />
</div>
```

### GlowBorder

Pulsing gradient halo wrapper. Static glow when reduced motion is active.

```tsx
import { GlowBorder } from '@framework';

<GlowBorder>
  <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: 16 }}>
    Content
  </div>
</GlowBorder>
```

### GradientText

Animated cycling gradient text. Static gradient when reduced.

```tsx
import { GradientText } from '@framework';

<GradientText as="h1" style={{ fontSize: 48 }}>Hello World</GradientText>
```

### PulsingBadge

Gradient badge with pulse, shine sweep, bouncing icon, and floating icons.

```tsx
import { PulsingBadge } from '@framework';

<PulsingBadge icon="🚀" floatingIcons={['✨', '💡']}>
  <div style={{ color: '#fff', fontWeight: 700 }}>Try It Now</div>
</PulsingBadge>
```

---

## Using with `<Reveal>`

### Basic usage

```tsx
import { Reveal, fadeUp, scaleIn } from '@framework';

// Default animation (fadeIn)
<Reveal from={1}>Content</Reveal>

// Specific animation — pass the factory directly (Reveal calls it with `reduced`)
<Reveal from={1} animation={fadeUp}>Content</Reveal>

// Factory with extra parameters — wrap in an arrow function
<Reveal from={1} animation={(r) => fadeUp(r, 0.3)}>Delayed content</Reveal>

// Exact segment visibility
<Reveal on={2}>Only on segment 2</Reveal>

// Range visibility
<Reveal from={1} until={3}>Visible on segments 1–3</Reveal>

// By segment ID
<Reveal id="summary">Summary</Reveal>

// Custom exit animation (useful with `on` or `from+until` where content disappears)
<Reveal on={2} animation={scaleIn} exitAnimation={fadeDown}>
  Scales in, fades down on exit
</Reveal>

// Exit uses the hidden state of the provided animation factory
<Reveal from={1} until={3} exitAnimation={fadeRight}>
  Slides right on exit
</Reveal>
```

### Staggered groups

```tsx
import { RevealGroup, scaleIn } from '@framework';

<RevealGroup from={1} stagger childAnimation={scaleIn}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</RevealGroup>
```

### Default animation context

```tsx
import { Reveal, RevealContext, scaleIn } from '@framework';

<RevealContext animation={scaleIn}>
  <Reveal from={0}>Uses scaleIn</Reveal>
  <Reveal from={1}>Also uses scaleIn</Reveal>
  <Reveal from={2} animation={fadeUp}>Overrides to fadeUp</Reveal>
</RevealContext>
```

### Sequenced exit-before-enter

By default, when one element exits and another enters on the same segment boundary, both animations play simultaneously. Wrap in `<RevealSequence>` to play exits first, then entrances — no per-element configuration needed.

```tsx
import { Reveal, RevealSequence } from '@framework';

// Default 500ms pause between exit completing and entrance starting
<RevealSequence>
  <Reveal from={0} until={1} exitAnimation={fadeDown}>
    This exits first when moving to segment 2
  </Reveal>
  <Reveal from={2}>
    This enters after the exit above completes + 500ms
  </Reveal>
</RevealSequence>

// Custom delay (in ms)
<RevealSequence delay={300}>
  ...
</RevealSequence>
```

How it works:
- When the segment changes, `RevealSequence` holds back newly-entering Reveals
- Exiting Reveals fade out and smoothly collapse their height — content below slides up gradually
- After all exits complete + `delay`, entering Reveals animate in
- Elements use `layout="position"` for smooth repositioning during transitions
- Inside a `RevealSequence`, `Reveal`/`RevealGroup` do **not** use `AnimatePresence` — the `exitAnimation` prop only applies outside a `RevealSequence`

> See [TROUBLESHOOTING.md — Content jumps twice during RevealSequence transitions](TROUBLESHOOTING.md#content-jumps-twice-during-revealsequence-transitions) for the design rationale and debugging tips.

### RevealCarousel — auto-indexed one-at-a-time carousel

`<RevealCarousel>` auto-wires `<Reveal from={i} until={i}>` for each child inside a `<RevealSequence>`, creating a one-at-a-time carousel with zero manual index arithmetic.

```tsx
import { RevealCarousel, fadeUp } from '@framework';

// Each child is shown one at a time, starting from segment 2
<RevealCarousel startFrom={2} animation={fadeUp}>
  <div>Shown on segment 2</div>
  <div>Shown on segment 3</div>
  <div>Shown on segment 4</div>
</RevealCarousel>

// Custom exit animation and delay
<RevealCarousel startFrom={0} animation={fadeUp} exitAnimation={fadeDown} delay={300}>
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</RevealCarousel>
```

Props:
- `children: ReactNode[]` — items to cycle through (each gets its own segment)
- `startFrom?: number` — segment offset for the first child (default: `0`)
- `animation?: RevealAnimation` — entrance animation
- `exitAnimation?: RevealAnimation` — exit animation
- `delay?: number` — ms between exit completing and entrance starting (default: `500`)

---

## Using with `<RevealAtMarker>` (Time-Based)

`<RevealAtMarker>` uses inline markers in narration text to trigger animations at specific moments during audio playback, rather than at segment boundaries. It shares the same animation factories as `<Reveal>`.

### Progressive reveal (stays visible once narrator reaches the marker)

```tsx
import { RevealAtMarker, fadeUp } from '@framework';

<RevealAtMarker at="pipeline" animation={fadeUp}>
  <PipelineDiagram />
</RevealAtMarker>
```

### Bounded range (visible only while audio is between two markers)

```tsx
<RevealAtMarker from="llm" until="topics">
  <LLMHighlight />
</RevealAtMarker>
```

### How markers are declared

Markers are `{#id}` (forward anchor) or `{id#}` (backward anchor) tokens embedded in `narrationText`:

```tsx
narrationText: 'Our system uses a {#pipeline}four-stage pipeline. {#stage1}First, we transcribe the audio.{stage1-done#} {#stage2}Then we extract key topics.'
```

After `tts:generate` strips markers and `tts:align` resolves timestamps, `<RevealAtMarker>` reads timing from `AudioTimeContext`. When alignment data is missing, children render immediately (graceful degradation).

> See [docs/MARKERS_GUIDE.md](../presentation-app/docs/MARKERS_GUIDE.md) for the full marker syntax reference, hooks (`useMarker`, `useMarkerRange`, `useAudioTime`), and end-to-end workflow.

---

## When to Use `<Reveal>` vs `<RevealAtMarker>` vs the Hook

| Use case | Tool |
|----------|------|
| Element show/hide at segment boundaries (~70% of slides) | `<Reveal>` |
| Sub-segment timing synced to narration | `<RevealAtMarker>` |
| Hand-drawn annotations synced to narration (circle, underline, highlight) | `<AnnotateAtMarker>` |
| Staggered lists/grids | `<RevealGroup stagger>` |
| Exit-before-enter sequencing | `<RevealSequence>` wrapper |
| Non-visual logic (data, conditional styling, highlighting) | `useSegmentedAnimation()` hook |
| Sub-segment logic (timestamps, progress) | `useMarker()` / `useMarkerRange()` hooks |
| Components with built-in `isVisible` prop (`BenefitCard`, etc.) | `useSegmentedAnimation()` hook |
| Continuous/looping animations | `motion` elements directly |

---

## Adding New Animations

When adding a new animation factory to `AnimationVariants.ts`:

1. Follow the existing `(reduced: boolean, ...params) => Variants` signature for entrance animations
2. Export from `AnimationVariants.ts`
3. Add to the barrel export in `src/framework/index.ts`
4. Update this document with the new entry
