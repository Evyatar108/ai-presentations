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

- **Between segments**: 500ms (pause within slides)
- **Between slides**: 1000ms (transition between slides)
- **After final slide**: 2000ms (hold before completion)

## Duration Storage

**Estimated Durations** (calculated by script):
- Stored in: `src/demos/*/metadata.ts` files
- Type: `DurationInfo` (exported from `@framework/demos/types`)
- Format: `durationInfo: { audioOnly, segmentDelays, slideDelays, finalDelay, total, slideBreakdown? }`
- Updated automatically on `npm run dev`

**Actual Runtime** (measured during playback):
- Stored in: Browser `localStorage`
- Format: `{ completedAt, totalSeconds, estimatedTotal }`
- Updated when narrated mode completes with timer enabled
- Automatically purged when estimated total changes

**Important**: These are completely separate storage locations. The duration calculation script cannot accidentally remove actual runtime measurements.

## Features

### Hierarchical Configuration
Override timing at any level:
```typescript
// Demo-level (in index.ts)
const timing: TimingConfig = {
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
import { TimingConfig } from '../../framework/demos/timing/types';

const timing: TimingConfig = {
  betweenSegments: 500,
  betweenSlides: 1000,
  afterFinalSlide: 2000
};

export const demoConfig: DemoConfig = {
  // ... other fields ...
  timing,
};
```

2. Run duration calculation (automatic on `npm run dev`, or manual):
```bash
npm run tts:duration -- --demo your-demo-id
```

3. Copy the generated `durationInfo` from the console or JSON report to your `metadata.ts` file.

See [Adding Demos Guide](./ADDING_DEMOS.md) for complete demo creation workflow.

## Backward Compatibility

All timing fields are optional. Demos without timing configuration will use default values (500ms/1000ms/2000ms). The system is fully backward compatible with existing demos.

## Known Variance

Actual runtime typically runs ~5% longer than estimated duration due to:
- Per-segment audio loading latency
- Browser setTimeout variance
- Initial overlay delay
- Network/cache overhead

This is expected behavior. The estimated duration represents audio + configured delays only, not real-world browser overhead.