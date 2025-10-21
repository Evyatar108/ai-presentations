# Timing System Architecture

## Design Overview

### Three-Level Timing Hierarchy

```
Demo-Level Defaults
    ↓ (can be overridden by)
Slide-Level Overrides
    ↓ (can be overridden by)
Segment-Level Overrides
```

**Resolution Order**: Segment → Slide → Demo → Global Defaults (500ms/1000ms/2000ms)

---

## Type Definitions

### TimingConfig Interface

**File**: `src/demos/timing/types.ts`

```typescript
/**
 * Timing configuration for delays in narrated presentations.
 * All values in milliseconds.
 */
export interface TimingConfig {
  /** Delay between audio segments within a slide (default: 500ms) */
  betweenSegments?: number;
  
  /** Delay between slides (after last segment of a slide) (default: 1000ms) */
  betweenSlides?: number;
  
  /** Delay after the final slide before showing end overlay (default: 2000ms) */
  afterFinalSlide?: number;
  
  /** Additional custom delays for specific scenarios */
  custom?: {
    [key: string]: number;
  };
}

/**
 * Global default timing values used across all demos.
 */
export const DEFAULT_TIMING: Required<TimingConfig> = {
  betweenSegments: 500,
  betweenSlides: 1000,
  afterFinalSlide: 2000,
  custom: {}
};

/**
 * Resolved timing configuration with all defaults applied.
 */
export interface ResolvedTimingConfig extends Required<TimingConfig> {}

/**
 * Helper to merge timing configs with proper override precedence.
 * Later configs override earlier ones (right-to-left precedence).
 */
export function resolveTimingConfig(
  ...configs: (TimingConfig | undefined)[]
): ResolvedTimingConfig {
  const merged: ResolvedTimingConfig = { ...DEFAULT_TIMING };
  
  for (const config of configs) {
    if (!config) continue;
    
    if (config.betweenSegments !== undefined) {
      merged.betweenSegments = config.betweenSegments;
    }
    if (config.betweenSlides !== undefined) {
      merged.betweenSlides = config.betweenSlides;
    }
    if (config.afterFinalSlide !== undefined) {
      merged.afterFinalSlide = config.afterFinalSlide;
    }
    if (config.custom) {
      merged.custom = { ...merged.custom, ...config.custom };
    }
  }
  
  return merged;
}
```

---

## Enhanced Interfaces

### AudioSegment (Updated)

**File**: `src/slides/SlideMetadata.ts`

```typescript
export interface AudioSegment {
  id: string;
  audioFilePath: string;
  duration?: number;
  animationTrigger?: string;
  srtSegmentNumber?: number;
  visualDescription?: string;
  narrationText?: string;
  
  // NEW: Per-segment timing overrides
  timing?: TimingConfig;
}
```

### SlideMetadata (Updated)

**File**: `src/slides/SlideMetadata.ts`

```typescript
export interface SlideMetadata {
  chapter: number;
  slide: number;
  title: string;
  srtFilePath?: string;
  audioSegments: AudioSegment[];
  
  // NEW: Per-slide timing overrides
  timing?: TimingConfig;
}
```

### DemoConfig (Updated)

**File**: `src/demos/types.ts`

```typescript
import { TimingConfig } from './timing/types';

export interface DemoConfig {
  id: string;
  metadata: DemoMetadata;
  defaultMode?: DemoDefaultMode;
  getSlides: () => Promise<SlideComponentWithMetadata[]>;
  
  // NEW: Demo-level timing defaults
  timing?: TimingConfig;
}
```

### DemoMetadata (Enhanced)

**File**: `src/demos/types.ts`

```typescript
export interface DemoMetadata {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  tags?: string[];
  
  /** Detailed duration breakdown (replaces simple duration field) */
  durationInfo?: {
    /** Total audio duration in seconds */
    audioOnly: number;
    /** Total segment delays in seconds */
    segmentDelays: number;
    /** Total slide delays in seconds */
    slideDelays: number;
    /** Final slide delay in seconds */
    finalDelay: number;
    /** Grand total duration in seconds */
    total: number;
    
    /** Detailed per-slide breakdown for UI display */
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

---

## Duration Calculator

### Core Functions

**File**: `src/demos/timing/calculator.ts`

```typescript
import { SlideMetadata } from '../../slides/SlideMetadata';
import { resolveTimingConfig, TimingConfig } from './types';

export interface SlideDurationBreakdown {
  audioTotal: number;        // Sum of all segment audio
  delaysTotal: number;       // Sum of all delays
  total: number;             // audioTotal + delaysTotal
  segments: Array<{
    id: string;
    audioDuration: number;
    delayAfter: number;      // Delay after this segment
  }>;
}

/**
 * Calculate total duration for a slide including all delays.
 */
export function calculateSlideDuration(
  slide: SlideMetadata,
  demoTiming?: TimingConfig,
  isLastSlide: boolean = false
): SlideDurationBreakdown {
  const segments = slide.audioSegments;
  if (!segments || segments.length === 0) {
    return {
      audioTotal: 0,
      delaysTotal: 0,
      total: 0,
      segments: []
    };
  }
  
  let audioTotal = 0;
  let delaysTotal = 0;
  const segmentBreakdown: SlideDurationBreakdown['segments'] = [];
  
  segments.forEach((segment, index) => {
    const audioDuration = segment.duration || 0;
    audioTotal += audioDuration;
    
    // Resolve timing for this segment
    const timing = resolveTimingConfig(
      demoTiming,
      slide.timing,
      segment.timing
    );
    
    // Determine delay after this segment
    let delayAfter = 0;
    if (index < segments.length - 1) {
      // Between segments within slide
      delayAfter = timing.betweenSegments;
    } else {
      // After last segment of slide
      if (isLastSlide) {
        delayAfter = timing.afterFinalSlide;
      } else {
        delayAfter = timing.betweenSlides;
      }
    }
    
    delaysTotal += delayAfter;
    
    segmentBreakdown.push({
      id: segment.id,
      audioDuration,
      delayAfter
    });
  });
  
  return {
    audioTotal,
    delaysTotal,
    total: audioTotal + delaysTotal,
    segments: segmentBreakdown
  };
}

/**
 * Calculate total presentation duration with full breakdown.
 */
export function calculatePresentationDuration(
  slides: SlideMetadata[],
  demoTiming?: TimingConfig
): {
  totalAudio: number;
  totalDelays: number;
  totalDuration: number;
  slides: Array<{
    chapter: number;
    slide: number;
    title: string;
    breakdown: SlideDurationBreakdown;
  }>;
} {
  let totalAudio = 0;
  let totalDelays = 0;
  const slideBreakdowns: any[] = [];
  
  slides.forEach((slide, index) => {
    const isLastSlide = index === slides.length - 1;
    const breakdown = calculateSlideDuration(slide, demoTiming, isLastSlide);
    
    totalAudio += breakdown.audioTotal;
    totalDelays += breakdown.delaysTotal;
    
    slideBreakdowns.push({
      chapter: slide.chapter,
      slide: slide.slide,
      title: slide.title,
      breakdown
    });
  });
  
  return {
    totalAudio,
    totalDelays,
    totalDuration: totalAudio + totalDelays,
    slides: slideBreakdowns
  };
}
```

---

## Component Integration

### NarratedController Updates

**File**: `src/components/NarratedController.tsx`

Replace hardcoded delays with resolved timing:

```typescript
import { resolveTimingConfig } from '../demos/timing/types';

// In playSlideSegments function:
const demoTiming = demoMetadata.timing;
const currentSlide = allSlides[currentIndex].metadata;
const timing = resolveTimingConfig(demoTiming, currentSlide.timing);

// Use resolved timing values:
setTimeout(advanceSlide, timing.betweenSlides);  // Instead of 1000
setTimeout(() => playSegment(idx), timing.betweenSegments); // Instead of 500
setTimeout(() => setShowStartOverlay(true), timing.afterFinalSlide); // Instead of 2000
```

### Duration Report Format

```json
{
  "meeting-highlights": {
    "audioOnlyDuration": 247.5,
    "totalDelays": 23.5,
    "totalDuration": 271.0,
    "breakdown": {
      "segmentDelays": 14.0,
      "slideDelays": 7.5,
      "finalSlideDelay": 2.0
    },
    "slides": [
      {
        "chapter": 1,
        "slide": 1,
        "title": "Product Intro",
        "audioDuration": 12.5,
        "delaysDuration": 1.5,
        "totalDuration": 14.0,
        "segments": [
          {
            "id": "intro",
            "audioDuration": 5.0,
            "delayAfter": 0.5
          }
        ]
      }
    ]
  }
}
```

---

## File Structure

```
src/demos/
├── timing/
│   ├── types.ts           # TimingConfig, defaults, resolver
│   └── calculator.ts      # Duration calculation utilities
├── types.ts               # Enhanced DemoConfig/DemoMetadata
└── meeting-highlights/
    └── metadata.ts        # Enhanced with timing config

scripts/
└── calculate-durations.ts # Enhanced to use timing system

src/components/
└── NarratedController.tsx # Uses resolved timing
```

---

## Design Principles

1. **Explicit Over Implicit**: Timing is declared in configuration, not hidden in code
2. **Progressive Enhancement**: All fields optional, backward compatible
3. **Clear Precedence**: Segment → Slide → Demo → Global
4. **Type Safety**: Full TypeScript support with validation
5. **Self-Documenting**: Configuration serves as documentation
6. **Single Source of Truth**: One place to control all timing

---

## Next Steps

See [Implementation Guide](./IMPLEMENTATION.md) for step-by-step implementation phases.