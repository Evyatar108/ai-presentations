# Timing & Duration Calculation Refactoring Plan

## Problem Statement

Currently, the duration calculation script only accounts for audio file durations, but the actual presentation runtime includes:
- **Delays between segments** (currently hardcoded: 500ms)
- **Delays between slides** (currently hardcoded: 1000ms)
- **Delay after final slide** (currently hardcoded: 2000ms)

This causes a discrepancy between calculated duration (~4:07) and actual runtime (longer). We need a flexible system that:
1. Makes timing configuration explicit and discoverable
2. Allows per-demo, per-slide, and per-segment customization
3. Accurately calculates total presentation duration
4. Maintains consistency between runtime behavior and calculations

---

## Design Overview

### Three-Level Timing Hierarchy

```
Demo-Level Defaults
    ↓ (can be overridden by)
Slide-Level Overrides
    ↓ (can be overridden by)
Segment-Level Overrides
```

**Resolution Order**: Segment → Slide → Demo → Global Defaults

---

## Architecture Design

### 1. Type Definitions

Create **`src/demos/timing/types.ts`**:

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

### 2. Enhanced AudioSegment Interface

Update **`src/slides/SlideMetadata.ts`**:

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

### 3. Enhanced SlideMetadata Interface

Update **`src/slides/SlideMetadata.ts`**:

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

### 4. Enhanced DemoConfig Interface

Update **`src/demos/types.ts`**:

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

---

## Implementation Plan

### Phase 1: Create Timing Infrastructure

**File**: `src/demos/timing/types.ts`
- Define `TimingConfig`, `DEFAULT_TIMING`, `ResolvedTimingConfig`
- Implement `resolveTimingConfig()` helper
- Export timing utilities

**File**: `src/demos/timing/calculator.ts`
- Create `calculateSlideDuration()` - accounts for audio + delays
- Create `calculatePresentationDuration()` - full demo duration
- Create `getDurationReport()` - detailed breakdown

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
 * @param slide - Slide metadata with audio segments
 * @param demoTiming - Demo-level timing defaults
 * @param isLastSlide - Whether this is the final slide in presentation
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

---

## Phase 7: Enhanced WelcomeScreen Duration Display

### Problem
Currently, WelcomeScreen only shows audio duration with "(audio only)" note. Users don't see the actual total runtime or breakdown of delays.

### Solution
Update [`WelcomeScreen.tsx`](presentation-app/src/components/WelcomeScreen.tsx) to display comprehensive duration information.

**Enhanced `DemoMetadata` Interface**:

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
    /** Total segment delays in seconds (between segments within slides) */
    segmentDelays: number;
    /** Total slide delays in seconds (between slides) */
    slideDelays: number;
    /** Final slide delay in seconds (after last slide) */
    finalDelay: number;
    /** Grand total duration in seconds (sum of all above) */
    total: number;
  };
}
```

**Updated Duration Display Component**:

```typescript
{/* Enhanced Duration Display in WelcomeScreen */}
{demo.durationInfo && (
  <div style={{
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(0, 183, 195, 0.05)',
    borderRadius: 8,
    border: '1px solid rgba(0, 183, 195, 0.2)'
  }}>
    {/* Total Duration (Primary) */}
    <div style={{
      fontSize: 15,
      color: '#00B7C3',
      fontWeight: 600,
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <span>🕒</span>
      <span>Total: ~{formatDuration(demo.durationInfo.total)}</span>
    </div>
    
    {/* Breakdown (Expandable/Tooltip) */}
    <div style={{
      fontSize: 12,
      color: '#94a3b8',
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gap: '0.25rem 0.75rem',
      marginTop: '0.5rem'
    }}>
      <span>Audio:</span>
      <span>{formatDuration(demo.durationInfo.audioOnly)}</span>
      
      <span>Segment delays:</span>
      <span>{formatDuration(demo.durationInfo.segmentDelays)}</span>
      
      <span>Slide delays:</span>
      <span>{formatDuration(demo.durationInfo.slideDelays)}</span>
      
      <span>Final delay:</span>
      <span>{formatDuration(demo.durationInfo.finalDelay)}</span>
    </div>
  </div>
)}

// Helper function
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
```

**Alternative: Compact Display with Tooltip**:

```typescript
{/* Compact Duration with Hover Breakdown */}
{demo.durationInfo && (
  <div 
    style={{
      fontSize: 13,
      color: '#94a3b8',
      marginTop: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}
    title={`Audio: ${formatDuration(demo.durationInfo.audioOnly)} | Segment delays: ${formatDuration(demo.durationInfo.segmentDelays)} | Slide delays: ${formatDuration(demo.durationInfo.slideDelays)} | Final delay: ${formatDuration(demo.durationInfo.finalDelay)}`}
  >
    <span>🕒</span>
    <span>
      ~{formatDuration(demo.durationInfo.total)}
      {' '}
      <span style={{ color: '#64748b', fontSize: 11 }}>
        ({formatDuration(demo.durationInfo.audioOnly)} audio + {formatDuration(demo.durationInfo.total - demo.durationInfo.audioOnly)} delays)
      </span>
    </span>
  </div>
)}
```

**Visual Example**:

```
┌─────────────────────────────────────────┐
│ Meeting Highlights - COGS Reduction     │
│                                         │
│ 🕒 Total: ~4:31                         │
│    Audio: 4:07                          │
│    Segment delays: 0:14                 │
│    Slide delays: 0:07                   │
│    Final delay: 0:02                    │
└─────────────────────────────────────────┘
```

**Update Metadata Generation**:

In the duration calculation script, generate the enhanced metadata:

```typescript
// In calculate-durations.ts
const fullDuration = calculatePresentationDuration(
  allSlides.map(s => s.metadata),
  demoTiming

### Interactive Detailed Breakdown Modal

Add an expandable modal/accordion for per-slide and per-segment duration details:

**Enhanced `DemoMetadata` with Full Breakdown**:

```typescript
export interface DemoMetadata {
  // ... existing fields
  
  durationInfo?: {
    audioOnly: number;
    segmentDelays: number;
    slideDelays: number;
    finalDelay: number;
    total: number;
    
    // NEW: Detailed per-slide breakdown
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

**WelcomeScreen with "View Details" Button**:

```typescript
const [showBreakdown, setShowBreakdown] = useState<string | null>(null);

{/* Duration Display with Details Button */}
{demo.durationInfo && (
  <div style={{
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(0, 183, 195, 0.05)',
    borderRadius: 8,
    border: '1px solid rgba(0, 183, 195, 0.2)'
  }}>
    {/* Summary */}
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <div style={{
          fontSize: 15,
          color: '#00B7C3',
          fontWeight: 600,
          marginBottom: '0.25rem'
        }}>
          🕒 Total: ~{formatDuration(demo.durationInfo.total)}
        </div>
        <div style={{
          fontSize: 11,
          color: '#64748b'
        }}>
          {formatDuration(demo.durationInfo.audioOnly)} audio + 
          {' '}{formatDuration(demo.durationInfo.total - demo.durationInfo.audioOnly)} delays
        </div>
      </div>
      
      {/* View Details Button */}
      {demo.durationInfo.slideBreakdown && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowBreakdown(showBreakdown === demo.id ? null : demo.id);
          }}
          style={{
            background: 'transparent',
            border: '1px solid rgba(0, 183, 195, 0.4)',
            color: '#00B7C3',
            padding: '0.4rem 0.8rem',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {showBreakdown === demo.id ? '▼ Hide Details' : '▶ View Details'}
        </button>
      )}
    </div>
    
    {/* Expanded Breakdown */}
    <AnimatePresence>
      {showBreakdown === demo.id && demo.durationInfo.slideBreakdown && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(148, 163, 184, 0.2)',
            overflow: 'hidden'
          }}
        >
          {/* Per-Slide Breakdown */}
          <div style={{
            maxHeight: 300,
            overflowY: 'auto',
            paddingRight: '0.5rem'
          }}>
            {demo.durationInfo.slideBreakdown.map((slide, idx) => (
              <div
                key={`${slide.chapter}-${slide.slide}`}
                style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: 'rgba(30, 41, 59, 0.4)',
                  borderRadius: 6,
                  border: '1px solid rgba(148, 163, 184, 0.1)'
                }}
              >
                {/* Slide Header */}
                <div style={{
                  fontSize: 12,
                  color: '#f1f5f9',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>Ch{slide.chapter}:S{slide.slide} - {slide.title}</span>
                  <span style={{ color: '#00B7C3' }}>
                    {formatDuration(slide.total)}
                  </span>
                </div>
                
                {/* Slide Summary */}
                <div style={{
                  fontSize: 11,
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: '0.25rem 0.5rem'
                }}>
                  <span>Audio:</span>
                  <span>{formatDuration(slide.audioTotal)}</span>
                  <span>Delays:</span>
                  <span>{formatDuration(slide.delaysTotal)}</span>
                </div>
                
                {/* Per-Segment Breakdown */}
                {slide.segments.length > 1 && (
                  <div style={{
                    marginTop: '0.5rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid rgba(148, 163, 184, 0.1)'
                  }}>
                    <div style={{
                      fontSize: 10,
                      color: '#64748b',
                      marginBottom: '0.25rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Segments ({slide.segments.length})
                    </div>
                    {slide.segments.map((segment, segIdx) => (
                      <div
                        key={segment.id}
                        style={{
                          fontSize: 10,
                          color: '#94a3b8',
                          display: 'grid',
                          gridTemplateColumns: '1fr auto auto',
                          gap: '0.5rem',
                          padding: '0.25rem 0',
                          borderBottom: segIdx < slide.segments.length - 1 
                            ? '1px solid rgba(148, 163, 184, 0.05)' 
                            : 'none'
                        }}
                      >
                        <span style={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {segIdx + 1}. {segment.id}
                        </span>
                        <span style={{ color: '#f1f5f9' }}>
                          {formatDuration(segment.audioDuration)}
                        </span>
                        <span style={{ color: '#64748b', fontSize: 9 }}>
                          +{(segment.delayAfter / 1000).toFixed(1)}s
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Summary Footer */}
          <div style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(148, 163, 184, 0.2)',
            fontSize: 11,
            color: '#94a3b8',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '0.25rem 0.75rem'
          }}>
            <span>Total Slides:</span>
            <span>{demo.durationInfo.slideBreakdown.length}</span>
            
            <span>Total Segments:</span>
            <span>
              {demo.durationInfo.slideBreakdown.reduce(
                (sum, s) => sum + s.segments.length, 0
              )}
            </span>
            
            <span>Avg per Slide:</span>
            <span>
              {formatDuration(
                demo.durationInfo.total / demo.durationInfo.slideBreakdown.length
              )}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)}
```

**Visual Example (Expanded State)**:

```
┌─────────────────────────────────────────────────────────────┐
│ Meeting Highlights - COGS Reduction                         │
│                                                              │
│ Duration Breakdown                                          │
│ 🕒 Total: ~4:31                   ▼ Hide Details           │
│    4:07 audio + 0:24 delays                                │
│ ──────────────────────────────────────────────────────────  │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Ch0:S1 - Intro                             0:12     │    │
│ │ Audio: 0:10  Delays: 0:02                          │    │
│ │ ─────────────────────────────────────────           │    │
│ │ SEGMENTS (3)                                        │    │
│ │ 1. intro              0:05  +0.5s                  │    │
│ │ 2. combination        0:03  +0.5s                  │    │
│ │ 3. problem            0:02  +1.0s                  │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Ch1:S1 - Product Intro                     0:18     │    │
│ │ Audio: 0:15  Delays: 0:03                          │    │
│ │ ─────────────────────────────────────────           │    │
│ │ SEGMENTS (5)                                        │    │
│ │ 1. intro              0:04  +0.5s                  │    │
│ │ 2. bizchat            0:03  +0.5s                  │    │
│ │ 3. ciq                0:03  +0.5s                  │    │
│ │ 4. select             0:03  +0.5s                  │    │
│ │ 5. note               0:02  +1.0s                  │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ ... (scrollable list of all slides)                        │
│ ──────────────────────────────────────────────────────────  │
│ Total Slides: 15          Avg per Slide: 0:18             │
│ Total Segments: 65                                         │
└─────────────────────────────────────────────────────────────┘
```

**Implementation Notes**:

1. **Data Loading**: The full breakdown is loaded from the duration report JSON file generated by the calculation script

2. **Performance**: Only render expanded breakdown when button is clicked (lazy rendering)

3. **Scrollable**: If many slides, use `maxHeight` with `overflowY: auto`

4. **Accessibility**: 
   - Button has clear label (View/Hide Details)
   - Focus management for keyboard navigation
   - ARIA attributes for screen readers

5. **Mobile Friendly**:
   - Compact layout for small screens
   - Touch-friendly button sizing
   - Scrollable content area

**Alternative: Separate Details Page**

Instead of inline expansion, open a full modal overlay:

```typescript
{/* Details Button opens Modal */}
<button onClick={() => setShowDetailsModal(demo.id)}>
  📊 View Timing Details
</button>

{/* Full-Screen Modal */}
{showDetailsModal === demo.id && (
  <DurationDetailsModal 
    demo={demo}
    onClose={() => setShowDetailsModal(null)}
  />
)}
```

This provides more space for detailed breakdown and better UX for demos with many slides.

);

// Export to metadata
const durationInfo = {
  audioOnly: fullDuration.totalAudio,
  segmentDelays: /* sum of all segment delays */,
  slideDelays: /* sum of all slide transition delays */,
  finalDelay: /* delay after final slide */,
  total: fullDuration.totalDuration
};

// Write to demo metadata file or generate metadata.json
```

**Benefits**:
- ✅ Users see actual total runtime upfront
- ✅ Clear breakdown shows where time is spent
- ✅ Transparency about delays vs. content
- ✅ Helps users make informed selection
- ✅ Accurate expectations for presentation length

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

### Phase 2: Update Duration Calculation Script

**File**: `scripts/calculate-durations.ts`

Enhance to:
1. Import timing utilities
2. Load demo timing configuration
3. Calculate both audio-only and full durations
4. Generate detailed reports with delay breakdowns

```typescript
// Add import
import { calculatePresentationDuration } from '../src/demos/timing/calculator';

// In calculateDurations function, after loading slides:
const demoModule = await import(`../src/demos/${demoId}/index.js`);
const demoConfig = await demoModule.loadDemoConfig();
const demoTiming = demoConfig.timing;

// Calculate with delays
const fullDuration = calculatePresentationDuration(
  allSlides.map(s => s.metadata),
  demoTiming
);

// Update report structure:
report[demoId] = {
  audioOnlyDuration: totalAudioDuration,
  totalDelays: fullDuration.totalDelays,
  totalDuration: fullDuration.totalDuration,
  slides: [/* ... with delay breakdowns */]
};
```

### Phase 3: Update NarratedController

**File**: `src/components/NarratedController.tsx`

Replace hardcoded delays with resolved timing:

```typescript
import { resolveTimingConfig } from '../demos/timing/types';

// In component, resolve timing:
const demoTiming = demoMetadata.timing;
const currentSlide = allSlides[currentIndex].metadata;
const timing = resolveTimingConfig(demoTiming, currentSlide.timing);

// Use resolved timing values:
setTimeout(advanceSlide, timing.betweenSlides);  // Instead of 1000
setTimeout(() => playSegment(currentSegmentIndex), timing.betweenSegments); // Instead of 500
setTimeout(() => setShowStartOverlay(true), timing.afterFinalSlide); // Instead of 2000
```

### Phase 4: Add Timing to Demo Configurations

**Example**: `src/demos/meeting-highlights/metadata.ts`

```typescript
import { DemoConfig } from '../types';
import { TimingConfig } from '../timing/types';

const timing: TimingConfig = {
  betweenSegments: 500,   // Keep current values
  betweenSlides: 1000,
  afterFinalSlide: 2000
};

export const metadata: DemoMetadata = {
  id: 'meeting-highlights',
  title: 'Meeting Highlights - COGS Reduction',
  // ... other metadata
  timing  // Add timing to metadata
};
```

### Phase 5: Per-Slide Timing Examples

For slides that need special timing (e.g., after videos):

```typescript
// In Chapter1.tsx - after video slide
export const Ch1_S2_BizChatDemo: SlideComponentWithMetadata = () => {
  return <VideoPlayerSlide />;
};

Ch1_S2_BizChatDemo.metadata = {
  chapter: 1,
  slide: 2,
  title: 'BizChat Demo',
  audioSegments: [/* ... */],
  timing: {
    betweenSlides: 1500  // Extra 500ms after video
  }
};
```

### Phase 6: Per-Segment Timing Examples

For segments that need special pauses:

```typescript
audioSegments: [
  {
    id: 'dramatic_pause',
    audioFilePath: '/audio/...',
    narrationText: '...',
    timing: {
      betweenSegments: 1000  // Longer pause for emphasis
    }
  }
]
```

---

## Enhanced Duration Report Format

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
          },
          {
            "id": "combination",
            "audioDuration": 4.5,
            "delayAfter": 0.5
          },
          {
            "id": "problem",
            "audioDuration": 3.0,
            "delayAfter": 1.0
          }
        ]
      }
    ]
  }
}
```

---

## Migration Strategy

### Step 1: Add Timing Types (Non-Breaking)
- Create `src/demos/timing/` directory
- Add type definitions
- All fields optional, defaults provided

### Step 2: Update Interfaces (Non-Breaking)
- Add optional `timing?` fields to existing interfaces
- Backward compatible - no existing code breaks

### Step 3: Enhance Calculation Script
- Update to use timing configurations
- Generate enhanced reports
- Old reports still work

### Step 4: Update NarratedController
- Replace hardcoded values with resolved timing
- Falls back to defaults if not specified
- Existing demos work unchanged

### Step 5: Add Timing to meeting-highlights
- Document current delays explicitly
- Sets baseline for future demos

### Step 6: Update Documentation
- Add timing guide to demo creation docs
- Update ADDING_DEMOS.md
- Add examples to example demos

---

## Benefits

### 1. Accuracy
- Duration calculations match actual runtime
- Reports show both audio and delays
- Predictable presentation timing

### 2. Flexibility
- Per-demo defaults for consistent style
- Per-slide overrides for special cases
- Per-segment overrides for emphasis

### 3. Discoverability
- Timing explicit in configuration
- Easy to see what delays exist
- Type-safe with TypeScript

### 4. Maintainability
- Single source of truth for timing
- Changes propagate automatically
- Clear override hierarchy

### 5. Scalability
- New demos define their own timing
- Custom timing patterns supported
- No hardcoded magic numbers

---

## Example Usage Scenarios

### Scenario 1: Fast-Paced Demo
```typescript
timing: {
  betweenSegments: 300,  // Quicker transitions
  betweenSlides: 500,
  afterFinalSlide: 1000
}
```

### Scenario 2: Contemplative Demo
```typescript
timing: {
  betweenSegments: 800,  // More breathing room
  betweenSlides: 1500,
  afterFinalSlide: 3000
}
```

### Scenario 3: Video-Heavy Demo
```typescript
// Demo-level
timing: {
  betweenSlides: 1500  // Extra time after videos
}

// Specific slide override
timing: {
  betweenSlides: 2500  // Even longer after key video
}
```

### Scenario 4: Dramatic Pause
```typescript
audioSegments: [
  {
    id: 'before_reveal',
    // ...
    timing: {
      betweenSegments: 1500  // Build suspense
    }
  },
  {
    id: 'big_reveal',
    // ... reveal content
  }
]
```

---

## File Structure

```
src/demos/
├── timing/
│   ├── types.ts           # TimingConfig, defaults, resolver
│   └── calculator.ts      # Duration calculation utilities
├── types.ts               # Enhanced with timing field
└── meeting-highlights/
    ├── metadata.ts        # Enhanced with timing config
    └── slides/...

scripts/
└── calculate-durations.ts # Enhanced to use timing system

src/components/
└── NarratedController.tsx # Uses resolved timing
```

---

## Testing Strategy

### Unit Tests
- Test `resolveTimingConfig()` with various override combinations
- Test `calculateSlideDuration()` with different configurations
- Test `calculatePresentationDuration()` with multi-slide scenarios

### Integration Tests
- Verify duration calculations match actual runtime
- Test timing resolution order (segment → slide → demo → default)
- Verify backward compatibility with demos without timing config

### Manual Testing
- Run narrated mode and time actual duration
- Compare with calculated duration from script
- Verify delays feel natural

---

## Documentation Updates Needed

1. **`ADDING_DEMOS.md`** - Add timing configuration section
2. **`presentation-app/README.md`** - Update duration calculation docs
3. **`docs/demos/meeting-highlights/meeting-highlights.md`** - Add timing details
4. **New: `docs/TIMING_GUIDE.md`** - Comprehensive timing configuration guide

---

## Success Criteria

✅ Duration calculation accounts for all delays  
✅ Calculated duration matches actual runtime (±1s)  
✅ Timing configurable at demo, slide, and segment levels  
✅ Backward compatible with existing demos  
✅ Type-safe with clear documentation  
✅ Easy to add custom timing patterns  
✅ Clear examples for common scenarios  

---

## Timeline Estimate

- **Phase 1** (Timing Infrastructure): 2-3 hours
- **Phase 2** (Calculation Script): 2-3 hours
- **Phase 3** (NarratedController): 1-2 hours
- **Phase 4** (Demo Configs): 1 hour
- **Phase 5-6** (Examples): 1 hour
- **Documentation**: 2-3 hours
- **Testing & Refinement**: 2-3 hours

**Total**: 11-17 hours

---

## Questions for Review

1. Should we add visual indicators in the UI showing when delays are occurring?
2. Should timing be part of `DemoMetadata` or `DemoConfig`?
3. Do we want to support custom timing presets (e.g., "fast", "normal", "relaxed")?
4. Should the WelcomeScreen show accurate duration including delays?
5. Do we need runtime delay adjustment (speed up/slow down playback)?
