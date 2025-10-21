# Migration Guide

How to migrate existing demos to use the timing system.

---

## Overview

The timing system is **backward compatible**. Existing demos work unchanged with default timing values. Migration is **optional** but recommended for:
- Accurate duration calculations
- Explicit timing documentation
- Per-demo customization

---

## Migration Steps

### Step 1: No Action Required (Default Behavior)

Existing demos automatically use default timing:
```typescript
// Your existing demo - no changes needed
export const demoConfig: DemoConfig = {
  id: 'existing-demo',
  metadata: { /* ... */ },
  getSlides: () => import('./slides/SlidesRegistry').then(m => m.allSlides)
};

// Automatically uses:
// betweenSegments: 500ms
// betweenSlides: 1000ms  
// afterFinalSlide: 2000ms
```

**Result**: Demo works exactly as before.

---

### Step 2: Document Current Timing (Recommended)

Make current timing explicit in config:

```typescript
import type { TimingConfig } from '../timing/types';

const timing: TimingConfig = {
  betweenSegments: 500,   // Document current default
  betweenSlides: 1000,    // Document current default
  afterFinalSlide: 2000   // Document current default
};

export const demoConfig: DemoConfig = {
  id: 'existing-demo',
  metadata: { /* ... */ },
  timing,  // ADD THIS
  getSlides: () => import('./slides/SlidesRegistry').then(m => m.allSlides)
};
```

**Benefit**: Timing now visible in config, easier to adjust later.

---

### Step 3: Generate Duration Info

Run calculation script to generate `durationInfo`:

```bash
npm run tts:duration -- --demo existing-demo
```

This creates `duration-report-existing-demo.json`:
```json
{
  "existing-demo": {
    "audioOnlyDuration": 180.5,
    "totalDelays": 15.0,
    "totalDuration": 195.5,
    "breakdown": {
      "segmentDelays": 8.0,
      "slideDelays": 5.0,
      "finalSlideDelay": 2.0
    },
    "slides": [ /* detailed breakdown */ ]
  }
}
```

---

### Step 4: Add Duration Info to Metadata

Copy generated data to metadata:

```typescript
export const metadata: DemoMetadata = {
  id: 'existing-demo',
  title: 'Existing Demo',
  description: 'My demo description',
  thumbnail: '/images/existing-demo/thumbnail.jpg',
  
  // ADD THIS: Duration info from generated report
  durationInfo: {
    audioOnly: 180,      // Round to nearest second
    segmentDelays: 8,
    slideDelays: 5,
    finalDelay: 2,
    total: 195,
    slideBreakdown: [
      // Copy from generated report
      {
        chapter: 0,
        slide: 1,
        title: "Intro",
        audioTotal: 10,
        delaysTotal: 1,
        total: 11,
        segments: [
          { id: "intro", audioDuration: 10, delayAfter: 1000 }
        ]
      },
      // ... rest of slides
    ]
  }
};
```

**Benefit**: WelcomeScreen now shows accurate duration with breakdown.

---

### Step 5: Customize Timing (Optional)

If your demo needs different timing, adjust as needed:

```typescript
const timing: TimingConfig = {
  betweenSegments: 600,   // Slightly slower pacing
  betweenSlides: 1200,    // More time between slides
  afterFinalSlide: 2500   // Longer ending
};
```

After changing timing, regenerate duration info:
```bash
npm run tts:duration -- --demo existing-demo
```

---

## Migration Examples

### Example 1: Meeting Highlights Demo

**Before** (implicit defaults):
```typescript
export const demoConfig: DemoConfig = {
  id: 'meeting-highlights',
  metadata: {
    id: 'meeting-highlights',
    title: 'Meeting Highlights - COGS Reduction',
    description: 'Presentation about COGS optimization',
    thumbnail: '/images/meeting-highlights/thumbnail.jpeg',
    duration: 247  // Audio only
  },
  defaultMode: 'narrated',
  getSlides: () => import('./slides/SlidesRegistry').then(m => m.allSlides)
};
```

**After** (explicit timing + full duration info):
```typescript
import type { TimingConfig } from '../timing/types';

const timing: TimingConfig = {
  betweenSegments: 500,
  betweenSlides: 1000,
  afterFinalSlide: 2000
};

export const metadata: DemoMetadata = {
  id: 'meeting-highlights',
  title: 'Meeting Highlights - COGS Reduction',
  description: 'Presentation about COGS optimization',
  thumbnail: '/images/meeting-highlights/thumbnail.jpeg',
  durationInfo: {
    audioOnly: 247,
    segmentDelays: 14,
    slideDelays: 7,
    finalDelay: 2,
    total: 270,
    slideBreakdown: [/* ... */]
  }
};

export const demoConfig: DemoConfig = {
  id: 'meeting-highlights',
  metadata,
  timing,
  defaultMode: 'narrated',
  getSlides: () => import('./slides/SlidesRegistry').then(m => m.allSlides)
};
```

---

### Example 2: Simple Demo (Minimal Migration)

**Before**:
```typescript
export const demoConfig: DemoConfig = {
  id: 'simple-demo',
  metadata: {
    id: 'simple-demo',
    title: 'Simple Demo'
  },
  getSlides: () => import('./slides/SlidesRegistry').then(m => m.allSlides)
};
```

**After** (just add timing, skip duration info if not needed):
```typescript
import type { TimingConfig } from '../timing/types';

const timing: TimingConfig = {
  betweenSegments: 500,
  betweenSlides: 1000,
  afterFinalSlide: 2000
};

export const demoConfig: DemoConfig = {
  id: 'simple-demo',
  metadata: {
    id: 'simple-demo',
    title: 'Simple Demo'
    // No durationInfo - WelcomeScreen won't show duration
  },
  timing,  // Documented for clarity
  getSlides: () => import('./slides/SlidesRegistry').then(m => m.allSlides)
};
```

---

## Handling Special Cases

### Case 1: Demo with Custom Delays in Code

If your demo has custom delays in component code:

**Option A**: Convert to per-segment timing overrides
```typescript
// Old: Hardcoded delay in component
useEffect(() => {
  setTimeout(() => setShowAnimation(true), 1500);
}, []);

// New: Declare in metadata
audioSegments: [
  {
    id: 'segment1',
    // ...
    timing: {
      betweenSegments: 1500  // Now explicit and counted
    }
  }
]
```

**Option B**: Break into multiple segments
```typescript
// Old: Single segment with internal delay
audioSegments: [
  { id: 'combined', /* delay happens in component */ }
]

// New: Separate segments
audioSegments: [
  { id: 'part1', /* ... */ },  // Standard delay after
  { id: 'part2', /* ... */ }   // Animation triggers here
]
```

### Case 2: Video Slides

Videos typically play during narration:

```typescript
// Document that video plays concurrently
Ch1_S2_VideoDemo.metadata = {
  // ...
  audioSegments: [
    {
      id: 'narration',
      audioFilePath: '/audio/c1/s2.wav',
      narrationText: 'As you can see in the video...'
      // Video plays during this audio (concurrent, not additive)
    }
  ],
  timing: {
    betweenSlides: 1500  // Extra time after video for comprehension
  }
};
```

---

## Validation Checklist

After migrating a demo:

- [ ] Demo still works in all three modes (Narrated, Manual, Manual+Audio)
- [ ] No visual or functional regressions
- [ ] Duration calculation runs without errors
- [ ] Calculated duration matches actual runtime (±2s)
- [ ] WelcomeScreen displays duration correctly (if durationInfo added)
- [ ] Detailed breakdown shows all slides (if slideBreakdown added)
- [ ] TypeScript compilation succeeds
- [ ] No console warnings or errors

---

## Common Issues

### Issue 1: TypeScript Errors After Migration

**Error**: `Property 'timing' does not exist on type 'DemoConfig'`

**Fix**: Make sure you've updated `src/demos/types.ts` to include timing field

### Issue 2: Duration Mismatch

**Symptom**: Calculated duration doesn't match actual runtime

**Diagnosis**:
```bash
# 1. Watch demo and time it manually
# 2. Run calculation script
npm run tts:duration -- --demo your-demo
# 3. Compare values
```

**Common Causes**:
- Missing audio files (fallback silence used)
- Custom delays not declared in metadata
- Timing overrides not applied correctly

**Fix**: Add missing timing declarations or adjust values

### Issue 3: Breakdown Not Showing

**Symptom**: WelcomeScreen doesn't show duration breakdown

**Cause**: `slideBreakdown` not included in `durationInfo`

**Fix**: Copy full breakdown from generated report

---

## Gradual Migration Strategy

Don't need to migrate everything at once:

**Phase 1**: Core demos
- Migrate Meeting Highlights (reference implementation)
- Migrate most-used demos
- Test thoroughly

**Phase 2**: Secondary demos
- Migrate remaining production demos
- Update example demos

**Phase 3**: Optional
- Add per-slide overrides where beneficial
- Fine-tune timing based on feedback

---

## Rollback Instructions

If you need to rollback a migrated demo:

```typescript
// Remove timing field
export const demoConfig: DemoConfig = {
  id: 'demo-to-rollback',
  metadata: {
    // Remove or restore old duration field
    duration: 180  // Old simple duration
    // Remove durationInfo
  },
  // Remove timing field
  getSlides: () => import('./slides/SlidesRegistry').then(m => m.allSlides)
};
```

Demo will revert to default timing behavior.

---

## Getting Help

If you encounter issues during migration:

1. Check [EXAMPLES.md](./EXAMPLES.md) for patterns
2. Review [IMPLEMENTATION.md](./IMPLEMENTATION.md) for details
3. Examine Meeting Highlights as reference
4. Test with example demos first
5. Ask team for code review

---

## See Also

- [README.md](./README.md) - Overview and quick start
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [EXAMPLES.md](./EXAMPLES.md) - Common patterns
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Implementation guide