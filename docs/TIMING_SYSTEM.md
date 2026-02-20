# Timing System

Comprehensive timing configuration system for accurate presentation duration tracking in the React demo player.

## Overview

The timing system provides a flexible three-level hierarchy for configuring delays during presentations:
- **Demo-level**: Default timing for entire demo
- **Slide-level**: Override timing for specific slides
- **Segment-level**: Fine-tune timing for individual segments

## Automatic Duration Calculation

Durations are **automatically calculated** when starting the dev server:

```bash
npm run dev
# 1. Checks TTS cache for changes
# 2. Calculates durations for all demos
# 3. Starts Vite dev server
```

Manual calculation:
```bash
npm run tts:duration                          # All demos
npm run tts:duration -- --demo meeting-highlights  # Specific demo
npm run tts:duration -- -v                    # Verbose mode
```

## Default Timing Values

- **Before first slide**: 1000ms (blank screen before first slide appears)
- **Between segments**: 500ms (pause within slides)
- **Between slides**: 1000ms (transition between slides)
- **After final slide**: 2000ms (hold before completion)

## Duration Storage

**Estimated Durations** (calculated by script):
- Stored in: `src/demos/*/metadata.ts` files
- Type: `DurationInfo` (exported from `@framework/demos/types`)
- Format: `durationInfo: { audioOnly, segmentDelays, slideDelays, finalDelay, startSilence, total, slideBreakdown? }`
- Updated automatically on `npm run dev`

**Actual Runtime** (measured during playback):
- Stored in: Browser `localStorage`
- Format: `{ completedAt, totalSeconds, estimatedTotal }`
- Updated when narrated mode completes with timer enabled
- Automatically purged when estimated total changes

**Important**: These are completely separate storage locations. The duration calculation script cannot accidentally remove actual runtime measurements.

## Features

### Start Silence (beforeFirstSlide)

When narrated playback begins, a blank dark screen is shown for `beforeFirstSlide` milliseconds before the first slide appears. This provides a clean visual transition from the start overlay to the first slide's content and audio.

- Default: 1000ms (1 second)
- Set to `0` to disable: `beforeFirstSlide: 0`
- Only applies to narrated mode (manual mode is unaffected)

### Start Transition (startTransition)

The `startTransition` option on `DemoConfig` controls how the blank overlay animates away when the first slide appears after the start silence period. It accepts Framer Motion `exit` targets and `transition` timing.

- Default: `{ exit: { opacity: 0 }, transition: { duration: 0.8, ease: 'easeInOut' } }` (fade out)
- Set on `DemoConfig` (not `TimingConfig`) since it's a visual animation concern, not a numeric delay

**Examples:**
```typescript
// Slower fade (1.5s)
startTransition: { transition: { duration: 1.5 } }

// Scale out with fade
startTransition: {
  exit: { opacity: 0, scale: 1.1 },
  transition: { duration: 0.6 }
}

// Slide up with fade
startTransition: {
  exit: { opacity: 0, y: '-100%' },
  transition: { duration: 0.5, ease: 'easeIn' }
}

// Spring physics
startTransition: {
  exit: { opacity: 0, scale: 0.8 },
  transition: { type: 'spring', stiffness: 200, damping: 20 }
}
```

**Note**: `startTransition` is separate from `TimingConfig` because it defines a Framer Motion animation object, not a numeric millisecond value, and only applies at the demo level (not slide or segment).

### Hierarchical Configuration
Override timing at any level:
```typescript
// Demo-level (in index.ts)
const timing: TimingConfig = {
  beforeFirstSlide: 1000,
  betweenSegments: 500,
  betweenSlides: 1000,
  afterFinalSlide: 2000
};

// Slide-level override (in Chapter.tsx)
timing: { betweenSegments: 750 }

// Segment-level override (in segment definition)
timing: { betweenSegments: 1000 }
```

### Interactive Duration Breakdown
WelcomeScreen displays:
- Audio-only duration
- Total duration with all delays
- Expandable per-slide breakdown
- Per-segment details for multi-segment slides
- Actual vs estimated runtime (when available)

### Runtime Validation
Optional timer during narrated playback:
- Live elapsed time display
- Color-coded delta indicator (green/amber/red)
- Actual runtime saved to localStorage
- Automatic comparison with estimated duration

## Documentation

For detailed information, see:
- **[Architecture](../presentation-app/docs/timing-system/ARCHITECTURE.md)** - System design and types
- **[Implementation](../presentation-app/docs/timing-system/IMPLEMENTATION.md)** - Complete implementation guide
- **[Examples](../presentation-app/docs/timing-system/EXAMPLES.md)** - Common timing patterns
- **[Migration](../presentation-app/docs/timing-system/MIGRATION.md)** - Migrating existing demos

## Usage in New Demos

When creating a new demo, timing configuration is optional. To add custom timing:

1. Define timing in your demo config (`src/demos/{demo-id}/index.ts`):
```typescript
import type { DemoConfig, TimingConfig } from '@framework';

const timing: TimingConfig = {
  betweenSegments: 500,
  betweenSlides: 1000,
  afterFinalSlide: 2000
};

const demoConfig: DemoConfig = {
  // ... other fields ...
  timing,
};

export default demoConfig;
```

2. Run duration calculation (automatic on `npm run dev`, or manual):
```bash
npm run tts:duration -- --demo your-demo-id
```

3. Copy the generated `durationInfo` from the console or JSON report to your `metadata.ts` file.

See [Adding Demos Guide](./ADDING_DEMOS.md) for complete demo creation workflow.

## Related: Instruct Hierarchy

The TTS `instruct` parameter (voice style/tone for Qwen3-TTS) follows the same three-level hierarchy pattern: Demo → Slide → Segment (most specific wins). See [TTS_GUIDE.md](./TTS_GUIDE.md#instruct-hierarchy) for details.

## Backward Compatibility

All timing fields are optional. Demos without timing configuration will use default values (1000ms/500ms/1000ms/2000ms for beforeFirstSlide/betweenSegments/betweenSlides/afterFinalSlide). The system is fully backward compatible with existing demos.

## Known Variance

Actual runtime typically runs ~5% longer than estimated duration due to:
- Per-segment audio loading latency
- Browser setTimeout variance
- Initial overlay delay
- Network/cache overhead

This is expected behavior. The estimated duration represents audio + configured delays only, not real-world browser overhead.