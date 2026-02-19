# Transition Slides Feature

## Overview

Automatically add invisible transition slides between content slides to prevent fade-in/fade-out animations from executing simultaneously, ensuring smooth visual transitions.

**Key Feature**: Fully automatic - demo owners don't need to do anything. The system injects transition slides transparently.

---

## Problem Statement

Currently, when navigating between slides:
1. Current slide fades out (exit animation)
2. Next slide fades in (enter animation)
3. **These animations overlap**, causing visual artifacts or jarring transitions

**Goal**: Insert blank transition slides between content slides to separate the animations temporally.

---

## Requirements

### Functional Requirements

1. **Invisible Transition Slides**
   - Rendered between each pair of content slides
   - Completely blank/empty (no visual content)
   - Zero duration (instant transition)

2. **Navigator Behavior**
   - Transition slides do NOT appear in slide navigator
   - Slide counter shows only content slides (e.g., "Slide 3 of 15", skipping transitions)
   - Keyboard navigation skips transition slides automatically

3. **Timing Behavior**
   - **Configurable transition delay** (default: 200ms for animation completion)
   - Delay occurs DURING the transition slide (between fade-out and fade-in)
   - Content slides retain their normal delays (betweenSlides)
   - Transition delay configurable per-demo via timing config

4. **Animation Sequence**
   ```
   Content Slide A (visible)
     ↓ exit animation (fade out ~200ms)
   Transition Slide (blank, holds for transitionDelay)
     ↓ transition delay (default 200ms)
     ↓ enter animation (fade in ~200ms)
   Content Slide B (visible)
   ```
   
   **Total time between slides**: fade-out + transitionDelay + fade-in + betweenSlides

---

## Design

### Slide Metadata Enhancement

Add marker to identify transition slides:

```typescript
export interface SlideMetadata {
  chapter: number;
  slide: number;
  title: string;
  audioSegments: AudioSegment[];
  timing?: TimingConfig;
  
  // NEW: Mark slide as transition-only
  isTransitionSlide?: boolean;  // Default: false
}
```

### Automatic Injection (Transparent to Demo Owners)

**Injection happens automatically in DemoPlayer component** - demo owners don't need to do anything.

```typescript
// In DemoPlayer.tsx - Automatic injection when slides load
import { defineSlide } from '@framework';
import type { SlideComponentWithMetadata } from '@framework';

function injectTransitionSlides(contentSlides: SlideComponentWithMetadata[]): SlideComponentWithMetadata[] {
  const result: SlideComponentWithMetadata[] = [];

  contentSlides.forEach((slide, index) => {
    // Add content slide
    result.push(slide);

    // Add transition slide after (except after last slide)
    if (index < contentSlides.length - 1) {
      result.push(createTransitionSlide(slide.metadata.chapter, slide.metadata.slide));
    }
  });

  return result;
}
```

---

## Integration with Timing System

### New Timing Field

Add `transitionDelay` to TimingConfig (in `src/demos/timing/types.ts`):

```typescript
/**
 * Timing configuration for transitions and delays in narrated presentations.
 * All values in milliseconds.
 */
export interface TimingConfig {
  /** Delay between segments within a slide (default: 500ms) */
  betweenSegments?: number;
  
  /** Delay after last segment of slide (before next slide) (default: 1000ms) */
  betweenSlides?: number;
  
  /** Delay after last slide before end overlay (default: 2000ms) */
  afterFinalSlide?: number;
  
  /** NEW: Delay during transition slide (time between fade-out and fade-in) (default: 200ms) */
  transitionDelay?: number;
  
  /** Custom delays for special scenarios */
  custom?: {
    [key: string]: number;
  };
}

// Update defaults
export const DEFAULT_TIMING: Required<TimingConfig> = {
  betweenSegments: 500,
  betweenSlides: 1000,
  afterFinalSlide: 2000,
  transitionDelay: 200,    // NEW: Default 200ms for smooth animations
  custom: {}
};
```

### Configurable Transition Creation

```typescript
// In DemoPlayer.tsx - Pass demo timing to factory
import { defineSlide, resolveTimingConfig } from '@framework';
import type { SlideComponentWithMetadata, TimingConfig } from '@framework';

function createTransitionSlide(
  afterChapter: number,
  afterSlide: number,
  demoTiming?: TimingConfig
): SlideComponentWithMetadata {
  const resolvedTiming = resolveTimingConfig(demoTiming);
  const transitionDelay = resolvedTiming.transitionDelay; // 200ms default

  return defineSlide({
    metadata: {
      chapter: afterChapter,
      slide: afterSlide + 0.5,  // Virtual slide number (e.g., 1.5)
      title: `Transition (${transitionDelay}ms)`,
      audioSegments: [],
      isTransitionSlide: true,
      timing: {
        betweenSegments: transitionDelay,  // This IS the transition delay
        betweenSlides: 0  // No additional delay after transition
      }
    },
    component: () => (
      <div style={{ width: '100%', height: '100vh', background: '#0f172a' }} />
    ),
  });
}

// In injection function
function injectTransitionSlides(
  contentSlides: SlideComponentWithMetadata[],
  demoTiming?: TimingConfig
): SlideComponentWithMetadata[] {
  const result: SlideComponentWithMetadata[] = [];
  
  contentSlides.forEach((slide, index) => {
    result.push(slide);
    
    if (index < contentSlides.length - 1) {
      // Pass demoTiming so transition uses configured delay
      result.push(createTransitionSlide(
        slide.metadata.chapter, 
        slide.metadata.slide,
        demoTiming  // Transition delay from demo config
      ));
    }
  });
  
  return result;
}
```

### Duration Calculation Integration

Transition slides ARE counted in duration calculations:

```typescript
// In calculateSlideDuration() - transition slides are normal slides with delay
export function calculateSlideDuration(
  slide: SlideMetadata,
  demoTiming?: TimingConfig,
  isLastSlide: boolean = false
): SlideDurationBreakdown {
  // Transition slides have no audio, but have delay
  if (slide.isTransitionSlide) {
    const timing = resolveTimingConfig(demoTiming, slide.timing);
    
    return {
      audioTotal: 0,
      delaysTotal: timing.betweenSegments,  // This is transitionDelay
      total: timing.betweenSegments,
      segments: []
    };
  }
  
  // Normal slide calculation...
}
```

### Example: Custom Transition Delay

```typescript
// Fast-paced demo with quick transitions
const demoConfig: DemoConfig = {
  metadata,  // id comes from metadata.id
  timing: {
    betweenSegments: 300,
    betweenSlides: 500,
    afterFinalSlide: 1000,
    transitionDelay: 100  // Quick 100ms transitions instead of 200ms
  },
  // ...
};

// Slow-paced demo with leisurely transitions
const demoConfig: DemoConfig = {
  metadata,  // id comes from metadata.id
  timing: {
    betweenSegments: 800,
    betweenSlides: 1500,
    afterFinalSlide: 3000,
    transitionDelay: 400  // Longer 400ms transitions for elegance
  },
  // ...
};
```

### Duration Report Format

```json
{
  "meeting-highlights": {
    "audioOnlyDuration": 247,
    "totalDelays": 26,
    "totalDuration": 273,
    "breakdown": {
      "segmentDelays": 14,
      "slideDelays": 7,
      "transitionDelays": 3,     // NEW: 14 transitions × 200ms = 2.8s
      "finalSlideDelay": 2
    },
    "slides": [
      {
        "chapter": 0,
        "slide": 1,
        "title": "Intro",
        "isTransitionSlide": false,
        "audioDuration": 10,
        "delaysDuration": 1,
        "totalDuration": 11
      },
      {
        "chapter": 0,
        "slide": 1.5,
        "title": "Transition (200ms)",
        "isTransitionSlide": true,
        "audioDuration": 0,
        "delaysDuration": 0.2,       // transitionDelay
        "totalDuration": 0.2
      },
      {
        "chapter": 1,
        "slide": 1,
        "title": "Product Intro",
        "isTransitionSlide": false,
        // ...
      }
    ]
  }
}
```

}

function createTransitionSlide(afterChapter: number, afterSlide: number): SlideComponentWithMetadata {
  return defineSlide({
    metadata: {
      chapter: afterChapter,
      slide: afterSlide + 0.5,  // Virtual slide number (e.g., 1.5 between 1 and 2)
      title: `Transition after Ch${afterChapter}:S${afterSlide}`,
      audioSegments: [],
      isTransitionSlide: true,
      timing: {
        betweenSlides: 0  // No delay after transition
      }
    },
    component: () => (
      <div style={{ width: '100%', height: '100vh', background: '#0f172a' }} />
    ),
  });
}

// Usage in DemoPlayer
const [processedSlides, setProcessedSlides] = useState<SlideComponentWithMetadata[]>([]);

useEffect(() => {
  // Automatically inject transitions when demo loads
  const slidesWithTransitions = injectTransitionSlides(slides);
  setProcessedSlides(slidesWithTransitions);
}, [slides]);

// Use processedSlides instead of slides throughout component
```

**Key Point**: Demo owners only provide content slides. The system automatically adds transitions.

---

## Component Updates

### SlidePlayer Updates

1. **Navigator Filtering**
```typescript
// Only show content slides in navigator
const contentSlides = slides.filter(s => !s.metadata.isTransitionSlide);

// Map navigator clicks to actual slide indices
const navigateToContentSlide = (contentIndex: number) => {
  const actualIndex = slides.findIndex((s, idx) => 
    !s.metadata.isTransitionSlide && 
    contentSlides.indexOf(s) === contentIndex
  );
  goToSlide(actualIndex);
};
```

2. **Counter Display**
```typescript
// Show only content slide count
const currentContentIndex = contentSlides.findIndex(s => s === slides[currentIndex]);
const totalContentSlides = contentSlides.length;

<div>Slide {currentContentIndex + 1} of {totalContentSlides}</div>
```

3. **Keyboard Navigation**
```typescript
const goToNext = () => {
  let nextIndex = currentIndex + 1;
  
  // Skip transition slides
  while (nextIndex < slides.length && slides[nextIndex].metadata.isTransitionSlide) {
    nextIndex++;
  }
  
  if (nextIndex < slides.length) {
    setCurrentIndex(nextIndex);
  }
};
```

### NarratedController Updates

1. **Skip Transition Slides in Auto-Advance**
```typescript
const advanceSlide = () => {
  let nextIndex = currentIndex + 1;
  
  // Skip transition slides (should be instant anyway)
  while (nextIndex < allSlides.length && allSlides[nextIndex].metadata.isTransitionSlide) {
    nextIndex++;
  }
  
  if (nextIndex >= allSlides.length) {
    // End of presentation
    setShowStartOverlay(true);
    return;
  }
  
  setCurrentIndex(nextIndex);
};
```

2. **Apply Zero Delay for Transition Slides**
```typescript
const playSlideSegments = (slideMetadata, slideKey) => {
  // Check if transition slide
  if (slideMetadata.isTransitionSlide) {
    // Skip immediately to next slide (no audio, no delay)
    setTimeout(advanceSlide, 0);
    return;
  }
  
  // Normal slide playback...
};
```

---

## Animation Timeline

### Without Transition Slides (Current - Problematic)
```
Time: 0ms    200ms   400ms   600ms
      |------|-------|-------|
      [Slide A visible      ]
              [Slide A fade out]
                      [Slide B fade in]
                              [Slide B visible]
      
      Problem: Fade out + fade in overlap (200-400ms)
```

### With Transition Slides (Proposed - Clean)
```
Time: 0ms    200ms   400ms   600ms   800ms
      |------|-------|-------|-------|
      [Slide A visible      ]
              [Slide A fade out]
                      [Blank]
                              [Slide B fade in]
                                      [Slide B visible]
      
      Result: Clean separation, no overlap
```

---

## Duration Calculation Impact

### Transition Slides and Timing

Transition slides should be **transparent to duration calculations**:

```typescript
// In calculateSlideDuration()
export function calculateSlideDuration(
  slide: SlideMetadata,
  demoTiming?: TimingConfig,
  isLastSlide: boolean = false
): SlideDurationBreakdown {
  // Skip transition slides in calculations
  if (slide.isTransitionSlide) {
    return {
      audioTotal: 0,
      delaysTotal: 0,
      total: 0,
      segments: []
    };
  }
  
  // Normal calculation for content slides...
}
```

**Why?** Transition slides are implementation details for smooth animations, not part of the actual presentation content or timing.

---

## Edge Cases

### Case 1: Manual Mode Navigation
**Scenario**: User presses arrow key  
**Behavior**: Skip directly from content slide to content slide (transition invisible)

### Case 2: Segment Navigation
**Scenario**: User navigates segments within a slide  
**Behavior**: Transition slides only between different slides, not between segments

### Case 3: First/Last Slides
**No transition before first slide**
**No transition after last slide**

### Case 4: Video Slides
**Behavior**: Same as other slides - transition before and after

---

## Implementation Phases

### Phase 1: Add Metadata Field
- [ ] Add `isTransitionSlide?: boolean` to `SlideMetadata`
- [ ] Update TypeScript types
- [ ] Verify compilation

### Phase 2: Create Transition Slide Factory
- [ ] Implement `createTransitionSlide()` function
- [ ] Create blank component
- [ ] Set metadata with zero delays

### Phase 3: Inject Transition Slides
- [ ] Implement `buildSlidesList()` in registry
- [ ] Inject after each content slide
- [ ] Test with Meeting Highlights

### Phase 4: Update SlidePlayer
- [ ] Filter transition slides from navigator
- [ ] Update slide counter logic
- [ ] Update keyboard navigation
- [ ] Test manual mode

### Phase 5: Update NarratedController
- [ ] Skip transition slides in auto-advance
- [ ] Handle zero-delay transitions
- [ ] Test narrated mode

### Phase 6: Update Duration Calculator
- [ ] Skip transition slides in calculations
- [ ] Verify duration accuracy
- [ ] Test with all demos

### Phase 7: Testing
- [ ] Test all three playback modes
- [ ] Verify smooth animations
- [ ] Check navigator displays correctly
- [ ] Validate timing calculations

---

## Testing Checklist

- [ ] Transition slides render (but invisible)
- [ ] Navigator shows only content slides
- [ ] Slide counter accurate (content only)
- [ ] Keyboard navigation skips transitions
- [ ] Auto-advance skips transitions
- [ ] Animations don't overlap
- [ ] Duration calculations unchanged
- [ ] No performance impact
- [ ] Works in all three modes

---

## Benefits

✅ **Smooth Animations** - No overlapping fade effects  
✅ **Clean Transitions** - Visual separation between slides  
✅ **Transparent** - Users unaware of transition slides  
✅ **No Timing Impact** - Duration calculations unaffected  
✅ **Backward Compatible** - Existing slides work unchanged  

---

## Risks & Mitigations

**Risk**: Transition slides double slide count  
**Mitigation**: Filter from navigator and counter

**Risk**: Navigation complexity increases  
**Mitigation**: Helper functions encapsulate logic

**Risk**: Performance impact from extra slides  
**Mitigation**: Minimal - just blank divs

**Risk**: Timing calculations affected  
**Mitigation**: Explicitly skip transition slides

---

## Alternative Approaches

### Alternative 1: Sequential Animations
Instead of transition slides, delay next slide's enter animation:

```typescript
// Exit current slide
await exitAnimation();
// Wait for exit to complete
await delay(200);
// Enter next slide
await enterAnimation();
```

**Pros**: Simpler, no extra slides  
**Cons**: Requires async/await in animation system

### Alternative 2: Animation Queue
Use animation queue to prevent overlaps:

```typescript
animationQueue.add(() => exitSlideA());
animationQueue.add(() => enterSlideB());
```

**Pros**: Cleaner architecture  
**Cons**: More complex state management

**Recommendation**: Stick with transition slides approach - simpler and more explicit.

---

## See Also

- [Timing System Documentation](timing-system/README.md)
- [Animation Variants](../src/framework/slides/AnimationVariants.ts)
- [Slide Player Component](../src/framework/components/SlidePlayer.tsx)