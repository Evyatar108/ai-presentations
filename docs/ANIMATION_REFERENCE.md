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

// Default 150ms pause between exit completing and entrance starting
<RevealSequence>
  <Reveal from={0} until={1} exitAnimation={fadeDown}>
    This exits first when moving to segment 2
  </Reveal>
  <Reveal from={2}>
    This enters after the exit above completes + 150ms
  </Reveal>
</RevealSequence>

// Custom delay (in ms)
<RevealSequence delay={300}>
  ...
</RevealSequence>
```

How it works:
- When the segment changes, `RevealSequence` holds back newly-entering Reveals
- Exiting Reveals play their exit animations via AnimatePresence
- Once all exits complete, a `delay` pause is applied (default 150ms), then entrances animate in
- If no exits occur on a segment change, entrances play after the delay

---

## When to Use `<Reveal>` vs the Hook

| Use case | Tool |
|----------|------|
| Element show/hide with animation (~70% of slides) | `<Reveal>` |
| Staggered lists/grids | `<RevealGroup stagger>` |
| Exit-before-enter sequencing | `<RevealSequence>` wrapper |
| Non-visual logic (data, conditional styling, highlighting) | `useSegmentedAnimation()` hook |
| Components with built-in `isVisible` prop (`BenefitCard`, etc.) | `useSegmentedAnimation()` hook |
| Continuous/looping animations | `motion` elements directly |

---

## Adding New Animations

When adding a new animation factory to `AnimationVariants.ts`:

1. Follow the existing `(reduced: boolean, ...params) => Variants` signature for entrance animations
2. Export from `AnimationVariants.ts`
3. Add to the barrel export in `src/framework/index.ts`
4. Update this document with the new entry
