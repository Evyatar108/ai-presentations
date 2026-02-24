# Slide Variants

## Motivation

Some slides benefit from having multiple visual representations of the same content — e.g., a "code walkthrough" variant vs. a "diagram overview" variant for the same concept. Currently, a slide position (`chapter:slide`) maps to exactly one component. Slide variants would allow:

- **Alternative explanations** of the same concept (text-heavy vs. visual)
- **Audience adaptation** — a technical variant and a non-technical variant
- **A/B testing** of different visual approaches before committing to one
- **Progressive complexity** — a simplified variant for overviews, a detailed one for deep dives

This relates to item #21 (A/B Testing Framework) in `docs/FUTURE_ENHANCEMENTS.md`, but focuses specifically on the slide-level component swapping mechanism rather than analytics or user assignment.

## Current State

### `defineSlide()` Factory

Each slide is created via `defineSlide({ metadata, component })` which attaches a `SlideMetadata` object to a React component:

```typescript
// src/framework/slides/defineSlide.ts
export function defineSlide(options: DefineSlideOptions): SlideComponentWithMetadata {
  const slide = Object.assign(
    (props) => options.component(props),
    { metadata: options.metadata }
  );
  return slide;
}
```

A `SlideComponentWithMetadata` is a `React.FC` with a `.metadata` property. There is no concept of variants — each call to `defineSlide()` produces one slide at one position.

### Slides Registry

Each demo has a `slides/SlidesRegistry.ts` that exports an ordered array:

```typescript
export const slides: SlideComponentWithMetadata[] = [Ch0_S0_Title, Ch1_S1_Intro, ...];
```

This array is loaded lazily via `DemoConfig.getSlides()`. The array index determines playback order.

### Audio Path Derivation

Audio files are auto-derived from slide coordinates:

```
/audio/{demoId}/c{chapter}/s{slide}_segment_{nn}.wav
```

There is no variant dimension in this path. Each slide position has exactly one set of audio files.

### Segment Context

`SegmentContext.tsx` manages segment state per slide. It reinitializes when `slideKey` changes (format: `Ch{chapter}:U{utterance}`). Switching variants with different segment counts would require reinitialization.

## Design Options

### Option A: `defineSlideVariants()` Factory (Recommended)

A new factory that produces a slide with multiple component variants sharing the same position:

```typescript
export const Ch1_S2_Architecture = defineSlideVariants({
  metadata: {
    chapter: 1, slide: 2, title: 'Architecture',
    audioSegments: [/* default variant's segments */],
  },
  defaultVariant: 'diagram',
  variants: {
    diagram: {
      component: DiagramComponent,
      // inherits metadata.audioSegments
    },
    code: {
      component: CodeWalkthroughComponent,
      audioSegments: [/* different narration for code walkthrough */],
    },
    simplified: {
      component: SimplifiedComponent,
      audioSegments: [/* shorter narration */],
    },
  },
});
```

**Pros**: Explicit, self-contained, easy to validate at registration time
**Cons**: New factory to maintain alongside `defineSlide()`; backward-incompatible type unless `SlideComponentWithMetadata` is extended

The returned type would extend `SlideComponentWithMetadata` with:
```typescript
interface SlideWithVariants extends SlideComponentWithMetadata {
  variants: Record<string, { component: React.FC; audioSegments?: AudioSegment[] }>;
  defaultVariant: string;
}
```

### Option B: Metadata-Level `variantOf` Field

Each variant is a separate `defineSlide()` call that references a parent:

```typescript
export const Ch1_S2_Diagram = defineSlide({
  metadata: { chapter: 1, slide: 2, title: 'Architecture (Diagram)', audioSegments: [...] },
  component: DiagramComponent,
});

export const Ch1_S2_Code = defineSlide({
  metadata: { chapter: 1, slide: 2, title: 'Architecture (Code)', variantOf: 'diagram', audioSegments: [...] },
  component: CodeComponent,
});
```

**Pros**: No new factory; uses existing `defineSlide()`
**Cons**: Variants are scattered across files; ordering in `SlidesRegistry` becomes ambiguous (which variant is "primary"?); `variantOf` creates implicit relationships

### Option C: External Variant Registry

Variants are registered separately from slide definitions:

```typescript
// slides/variants.ts
export const variantConfig = {
  'Ch1:S2': {
    default: Ch1_S2_Diagram,
    alternatives: { code: Ch1_S2_Code, simplified: Ch1_S2_Simple },
  },
};
```

**Pros**: Clean separation; existing `defineSlide()` unchanged
**Cons**: Extra file to maintain; variant-slide association is stringly-typed; easy to get out of sync

### Recommendation

**Option A** is the cleanest approach. It keeps variant definitions co-located, is easy to validate, and has a clear type contract. The `defineSlide()` factory remains untouched for non-variant slides.

## Audio Implications

Each variant potentially has different narration text, which means:

### Path Scheme Extension

Add a variant dimension to the audio path:

```
/audio/{demoId}/c{chapter}/s{slide}_segment_{nn}.wav           # default variant (backward-compatible)
/audio/{demoId}/c{chapter}/s{slide}_v-{variant}_segment_{nn}.wav  # named variant
```

Changes to `audioPath.ts`:
```typescript
export function buildAudioFilePath(
  demoId: string, chapter: number, slide: number, segmentIndex: number,
  variant?: string  // NEW optional parameter
): string {
  const variantSuffix = variant ? `_v-${variant}` : '';
  return `/audio/${demoId}/c${chapter}/s${slide}${variantSuffix}_segment_${paddedIndex}.wav`;
}
```

### TTS Generation

`scripts/generate-tts.ts` needs to iterate over variants:
- Parse `audioSegments` from each variant
- Generate audio with variant-aware output paths
- Update `tts-cache.json` with variant keys

### Alignment

`scripts/generate-alignment.ts` needs variant-aware paths in `alignment.json`:
- Each variant's segments get their own alignment entries
- Marker IDs should be scoped per variant to avoid collisions

## Segment Mismatch Handling

When switching from variant A (5 segments) to variant B (3 segments):

1. `SegmentContext` must reinitialize — the `slideKey` should include variant: `Ch1:S2:code`
2. If in narrated mode at segment 4 of variant A, switching to variant B (3 segments) requires resetting to segment 0
3. Progress bar segment dots must update immediately
4. Audio playback must stop and restart with the new variant's audio

## UI Design

### Variant Selector

- **Visible in manual mode only** — narrated mode always uses the default variant
- Location: Near the slide navigation dots (e.g., a small dropdown or pill selector)
- Shows variant names with optional short descriptions
- Keyboard shortcut: `V` to cycle variants, or `1-9` to select by index

### Navigation Dots

- Variant slides show a small indicator (e.g., a layered dot icon) to signal alternatives exist
- When a non-default variant is active, show the variant name as a tooltip

### Narrated Mode Behavior

In narrated mode, only the default variant plays. Variants are an authoring/review tool:
- Presenters can preview alternatives in manual mode
- The narrated flow is deterministic (always default)

### URL-Based Variant Selection

Since the app already uses `?demo={id}` query parameters via `useUrlParams.ts`, variant selection should be deep-linkable:

```
?demo=meeting-highlights&slide=Ch1:S2&variant=code
```

This enables:
- Sharing a link that opens directly to a specific variant
- Bookmarking variant comparisons
- Playwright tests targeting specific variants via URL

Implementation: Extend `useUrlParams.ts` with `getVariant()` / `setVariant()` helpers. The variant URL param takes precedence over localStorage persistence.

### Variant Comparison View (Stretch Goal)

Beyond switching variants one at a time, a side-by-side comparison view would help authors decide which variant to keep:

- Split screen: two variants rendering simultaneously
- Synchronized segment stepping (both advance together)
- Diff highlights showing what's different between the two
- Audio A/B toggle (listen to variant A narration, then B)

This is a stretch goal — the core variant switching mechanism must be solid first. But it's worth designing the data model to not preclude this (e.g., variant components should be renderable independently without singleton state conflicts).

## Open Questions

1. **Variant persistence**: Should the selected variant survive page reload? (localStorage key: `variant:{demoId}:{chapter}:{slide}`). URL params should take precedence over localStorage.
2. **Duration calculation**: `durationInfo` in `metadata.ts` currently assumes one path through all slides. With variants, total duration depends on which variants are selected. Options: Calculate with all defaults, or show a range.
3. **Playwright test coverage**: `test:overflow` and `test:screenshot` should test all variants. The test script needs a `--variants` flag or automatic enumeration.
4. **OBS recording**: Which variant is recorded? Default only, or a specific set? The `record:obs` script would need variant selection.
5. **Alignment data**: Should `alignment.json` contain all variants' alignment data, or should there be per-variant alignment files?
6. **Welcome screen duration display**: Show default variant duration? Range? Average?
7. **Chapter interaction**: If a variant has significantly different content, does it belong in the same chapter? Or should variants be chapter-scoped rather than slide-scoped?

## Key Files

| File | Change Type |
|------|-------------|
| `src/framework/slides/defineSlide.ts` | Add `defineSlideVariants()` factory |
| `src/framework/slides/SlideMetadata.ts` | Extend `SlideComponentWithMetadata` with variant support |
| `src/framework/components/SlidePlayer.tsx` | Variant selection + component swapping logic |
| `src/framework/contexts/SegmentContext.tsx` | Variant-aware `slideKey` for reinit |
| `src/framework/utils/audioPath.ts` | Add optional `variant` parameter |
| `src/framework/components/narrated/ProgressBar.tsx` | Variant indicator on dots |
| `scripts/generate-tts.ts` | Iterate over variants for TTS generation |
| `scripts/generate-alignment.ts` | Variant-aware alignment paths |
| `scripts/utils/tts-cache.ts` | Variant-scoped cache keys |
| `src/framework/hooks/useUrlParams.ts` | Add `getVariant()` / `setVariant()` helpers |
| `src/framework/index.ts` | Export `defineSlideVariants` |

## Effort Estimate

| Phase | Work | Time |
|-------|------|------|
| `defineSlideVariants()` factory + types | Core API design | 3-4 hours |
| SlidePlayer variant switching | UI + state management | 4-6 hours |
| Audio path + TTS script changes | Variant-aware generation | 4-6 hours |
| Alignment + SegmentContext | Variant-aware reinitialization | 3-4 hours |
| Playwright test support | Variant enumeration in tests | 2-3 hours |
| **Total** | | **~1-1.5 weeks** |

**Size: M**

## Dependencies

- **No blocking dependencies** — self-contained within the framework
- **Should be finalized before Repo Split (06)** — changes the framework's public API surface (`defineSlideVariants` export, extended types)
- **Interacts with Cloud GPU (02)** only in that TTS generation is needed for variant audio — no architectural dependency

## Reversibility

**Mostly reversible** — `defineSlideVariants()` is additive (doesn't change `defineSlide()`). Removing it later would require converting any variant slides back to single slides. Audio files for variants would need cleanup but the default variant paths are backward-compatible.
