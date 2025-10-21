# Implementation Guide

Step-by-step guide for implementing the timing system refactoring.

---

## Phase 1: Create Timing Infrastructure (2-3 hours)

### 1.1 Create Type Definitions

**File**: `src/demos/timing/types.ts`

```typescript
/**
 * Timing configuration for delays in narrated presentations.
 * All values in milliseconds.
 */
export interface TimingConfig {
  betweenSegments?: number;
  betweenSlides?: number;
  afterFinalSlide?: number;
  custom?: { [key: string]: number };
}

export const DEFAULT_TIMING: Required<TimingConfig> = {
  betweenSegments: 500,
  betweenSlides: 1000,
  afterFinalSlide: 2000,
  custom: {}
};

export interface ResolvedTimingConfig extends Required<TimingConfig> {}

export function resolveTimingConfig(
  ...configs: (TimingConfig | undefined)[]
): ResolvedTimingConfig {
  const merged: ResolvedTimingConfig = { ...DEFAULT_TIMING };
  for (const config of configs) {
    if (!config) continue;
    if (config.betweenSegments !== undefined) merged.betweenSegments = config.betweenSegments;
    if (config.betweenSlides !== undefined) merged.betweenSlides = config.betweenSlides;
    if (config.afterFinalSlide !== undefined) merged.afterFinalSlide = config.afterFinalSlide;
    if (config.custom) merged.custom = { ...merged.custom, ...config.custom };
  }
  return merged;
}
```

**Verification**: 
- [ ] File compiles without errors
- [ ] `resolveTimingConfig()` correctly merges configs
- [ ] Unit tests pass

---

## Phase 2: Create Duration Calculator (2-3 hours)

### 2.1 Implement Calculator Functions

**File**: `src/demos/timing/calculator.ts`

See [ARCHITECTURE.md](./ARCHITECTURE.md#duration-calculator) for complete implementation.

Key functions:
- `calculateSlideDuration()` - Per-slide duration with delays
- `calculatePresentationDuration()` - Total presentation duration

**Verification**:
- [ ] Calculator handles slides with no segments
- [ ] Calculator correctly applies timing hierarchy
- [ ] Calculator distinguishes last slide (uses afterFinalSlide)
- [ ] Unit tests validate calculations

---

## Phase 3: Update Interfaces (1 hour)

### 3.1 Update AudioSegment

**File**: `src/slides/SlideMetadata.ts`

```typescript
export interface AudioSegment {
  // ... existing fields
  timing?: TimingConfig;  // ADD THIS
}
```

### 3.2 Update SlideMetadata

```typescript
export interface SlideMetadata {
  // ... existing fields
  timing?: TimingConfig;  // ADD THIS
}
```

### 3.3 Update DemoConfig

**File**: `src/demos/types.ts`

```typescript
import { TimingConfig } from './timing/types';

export interface DemoConfig {
  // ... existing fields
  timing?: TimingConfig;  // ADD THIS
}
```

### 3.4 Update DemoMetadata

```typescript
export interface DemoMetadata {
  // ... existing fields
  durationInfo?: {
    audioOnly: number;
    segmentDelays: number;
    slideDelays: number;
    finalDelay: number;
    total: number;
    slideBreakdown?: Array<{
      chapter: number;
      slide: number;
      title: string;
      audioTotal: number;
      delaysTotal: number;
      total: number;
      segments: Array<{
        id: string;
        audioDuration: number;
        delayAfter: number;
      }>;
    }>;
  };
}
```

**Verification**:
- [ ] TypeScript compilation succeeds
- [ ] No breaking changes to existing code
- [ ] All fields are optional

---

## Phase 4: Update Calculate Duration Script (2-3 hours)

### 4.1 Import Timing Utilities

**File**: `scripts/calculate-durations.ts`

```typescript
import { calculatePresentationDuration } from '../src/demos/timing/calculator';
import type { TimingConfig } from '../src/demos/timing/types';
```

### 4.2 Load Demo Timing Configuration

```typescript
// After loading slides:
const demoModule = await import(`../src/demos/${demoId}/index.js`);
const demoConfig = await demoModule.loadDemoConfig();
const demoTiming: TimingConfig | undefined = demoConfig.timing;
```

### 4.3 Calculate Full Duration

```typescript
const fullDuration = calculatePresentationDuration(
  allSlides.map(s => s.metadata),
  demoTiming
);

// Calculate breakdown
const segmentDelays = fullDuration.slides.reduce((sum, slide) => {
  return sum + slide.breakdown.segments.reduce((segSum, seg, idx) => {
    // Count betweenSegments delays (not last segment)
    if (idx < slide.breakdown.segments.length - 1) {
      return segSum + seg.delayAfter;
    }
    return segSum;
  }, 0);
}, 0);

const slideDelays = fullDuration.slides.reduce((sum, slide, idx) => {
  if (idx < fullDuration.slides.length - 1) {
    const lastSeg = slide.breakdown.segments[slide.breakdown.segments.length - 1];
    return sum + lastSeg.delayAfter; // betweenSlides delay
  }
  return sum;
}, 0);

const finalDelay = fullDuration.slides.length > 0 
  ? fullDuration.slides[fullDuration.slides.length - 1].breakdown.segments.slice(-1)[0].delayAfter
  : 0;
```

### 4.4 Update Report Structure

```typescript
report[demoId] = {
  audioOnlyDuration: fullDuration.totalAudio,
  totalDelays: fullDuration.totalDelays,
  totalDuration: fullDuration.totalDuration,
  breakdown: {
    segmentDelays,
    slideDelays,
    finalDelay
  },
  slides: fullDuration.slides.map(s => ({
    chapter: s.chapter,
    slide: s.slide,
    title: s.title,
    audioDuration: s.breakdown.audioTotal,
    delaysDuration: s.breakdown.delaysTotal,
    totalDuration: s.breakdown.total,
    segments: s.breakdown.segments
  }))
};
```

**Verification**:
- [ ] Script runs without errors
- [ ] Report includes both audio-only and total durations
- [ ] Breakdown separates segment/slide/final delays
- [ ] Per-slide and per-segment details included

---

## Phase 5: Update NarratedController (1-2 hours)

### 5.1 Import Timing Resolver

**File**: `src/components/NarratedController.tsx`

```typescript
import { resolveTimingConfig } from '../demos/timing/types';
```

### 5.2 Replace Hardcoded Delays

Find and replace:

```typescript
// OLD: Hardcoded 1000ms
setTimeout(advanceSlide, 1000);

// NEW: Resolved timing
const demoTiming = demoMetadata.timing;
const currentSlide = allSlides[currentIndex].metadata;
const timing = resolveTimingConfig(demoTiming, currentSlide.timing);
setTimeout(advanceSlide, timing.betweenSlides);
```

```typescript
// OLD: Hardcoded 500ms
setTimeout(() => playSegment(currentSegmentIndex), 500);

// NEW: Resolved timing
const segment = segments[segmentIndex];
const timing = resolveTimingConfig(demoTiming, currentSlide.timing, segment.timing);
setTimeout(() => playSegment(currentSegmentIndex), timing.betweenSegments);
```

```typescript
// OLD: Hardcoded 2000ms
setTimeout(() => setShowStartOverlay(true), 2000);

// NEW: Resolved timing
setTimeout(() => setShowStartOverlay(true), timing.afterFinalSlide);
```

**Verification**:
- [ ] Narrated mode still works with default timing
- [ ] Timing correctly resolves hierarchy
- [ ] No regression in audio playback

---

## Phase 6: Add Timing to Meeting Highlights (1 hour)

### 6.1 Update Demo Metadata

**File**: `src/demos/meeting-highlights/metadata.ts`

```typescript
import type { TimingConfig } from '../timing/types';

// Document current timing explicitly
const timing: TimingConfig = {
  betweenSegments: 500,   // Current default
  betweenSlides: 1000,    // Current default
  afterFinalSlide: 2000   // Current default
};

export const demoConfig: DemoConfig = {
  id: 'meeting-highlights',
  metadata: {
    // ... existing metadata
  },
  timing,  // Add timing config
  // ... rest of config
};
```

### 6.2 Generate Duration Info

Run calculation script:
```bash
npm run tts:duration -- --demo meeting-highlights
```

Update metadata with generated `durationInfo`:
```typescript
metadata: {
  // ... existing fields
  durationInfo: {
    audioOnly: 247,
    segmentDelays: 14,
    slideDelays: 7,
    finalDelay: 2,
    total: 270,
    slideBreakdown: [/* ... from report */]
  }
}
```

**Verification**:
- [ ] Meeting Highlights demo works unchanged
- [ ] Duration calculations match actual runtime
- [ ] Report shows accurate breakdown

---

## Phase 7: Enhance WelcomeScreen (3-4 hours)

See [WELCOME_SCREEN.md](./WELCOME_SCREEN.md) for detailed implementation.

### 7.1 Add Duration Display Component

**File**: `src/components/WelcomeScreen.tsx`

- [ ] Add summary duration display
- [ ] Add "View Details" button
- [ ] Add expandable breakdown modal
- [ ] Add per-slide details
- [ ] Add per-segment details
- [ ] Add scrollable container for many slides

### 7.2 Add Helper Functions

```typescript
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
```

**Verification**:
- [ ] Duration displays correctly
- [ ] "View Details" button expands/collapses
- [ ] Breakdown shows all slides
- [ ] Per-segment details visible
- [ ] Layout responsive on mobile
- [ ] Animations smooth

---

## Phase 8: Testing & Validation (2-3 hours)

### 8.1 Unit Tests

- [ ] Test `resolveTimingConfig()` with various inputs
- [ ] Test `calculateSlideDuration()` edge cases
- [ ] Test `calculatePresentationDuration()` accuracy

### 8.2 Integration Tests

- [ ] Run narrated mode, time actual duration
- [ ] Compare with calculated duration (±1s tolerance)
- [ ] Verify timing hierarchy works correctly
- [ ] Test all three playback modes

### 8.3 Manual Testing

- [ ] Meeting Highlights demo plays correctly
- [ ] Example demos work with default timing
- [ ] WelcomeScreen displays accurate durations
- [ ] Detailed breakdown shows correct values
- [ ] No regression in existing functionality

---

## Phase 9: Documentation (2-3 hours)

- [ ] Update [ADDING_DEMOS.md](../ADDING_DEMOS.md) with timing section
- [ ] Update [react_cogs_demo/README.md](../../README.md) with duration info
- [ ] Create [EXAMPLES.md](./EXAMPLES.md) with common patterns
- [ ] Create [MIGRATION.md](./MIGRATION.md) for existing demos
- [ ] Update [Agents.md](../../../Agents.md) with refactoring details

---

## Rollback Plan

If issues arise:

1. **Phase 1-3**: No runtime impact, can be left as-is
2. **Phase 4**: Revert script changes, continue using audio-only calculations
3. **Phase 5**: Restore hardcoded delays in NarratedController
4. **Phase 6-7**: Remove timing from demo configs, hide duration details
5. **Full Rollback**: Git revert to pre-refactoring state

---

## Success Criteria

- ✅ Duration calculations match actual runtime (±1s)
- ✅ All three playback modes work correctly
- ✅ Meeting Highlights demo unchanged functionally
- ✅ WelcomeScreen shows accurate durations
- ✅ Detailed breakdown displays correctly
- ✅ No breaking changes to existing code
- ✅ Type-safe with full TypeScript support
- ✅ Documentation complete and clear
- ✅ Example demos updated

---

## Next Steps

After completing implementation:

1. Update [TODO.md](./TODO.md) to mark completed phases
2. Test with additional demos beyond Meeting Highlights
3. Gather feedback from team
4. Consider adding timing presets ("fast", "normal", "relaxed")
5. Explore runtime timing adjustment features