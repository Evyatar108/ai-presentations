# Component Reference

## Core Components

### WelcomeScreen

Demo selection interface with card-based layout.

**Location**: `src/framework/components/WelcomeScreen.tsx`

**Features**:
- Displays all registered demos
- Shows thumbnail, title, description, tags, duration
- Click to select and load demo
- Responsive grid layout

### DemoPlayer

Main container for demo playback with mode selection.

**Location**: `src/framework/components/DemoPlayer.tsx`

**Props**:
- `demoId: string` - Demo identifier

**Features**:
- Mode selection (Narrated, Manual, Manual+Audio)
- Slide counter display
- Restart functionality
- Hide interface option
- Back to welcome screen

### SlidePlayer

Renders individual slides with segment management.

**Location**: `src/framework/components/SlidePlayer.tsx`

**Props**:
- `slide: SlideMetadata` - Slide configuration
- `isActive: boolean` - Whether slide is currently active
- `currentSegment: number` - Current segment index
- `mode: PresentationMode` - Playback mode

**Features**:
- Dynamic segment rendering
- Component isolation
- Segment state management
- Chapter navigation (when `chapters` is defined on `DemoConfig`, a toggle enables chapter-level dots and `PageUp`/`PageDown` keyboard shortcuts)

### NarratedController

Manages audio-synced playback in narrated mode.

**Location**: `src/framework/components/NarratedController.tsx`

**Features**:
- Automatic slide progression
- Audio playback synchronization
- Segment advancement
- Completion handling
- Audio cleanup

### VideoPlayer

Video embed component with playback controls.

**Location**: `src/framework/components/VideoPlayer.tsx`

**Props**:
- `videoPath: string` - Path to video file
- `isPlaying: boolean` - Whether video should play
- `onEnded?: () => void` - Callback when video ends
- `captionsSrc?: string` - Optional path to WebVTT captions file

**Features**:
- Freeze-on-end playback (pauses on last frame)
- Framer Motion animations
- Responsive sizing
- Synchronized with slide segments
- Optional captions track (only rendered when `captionsSrc` is provided)

## Shared Utilities

### SlideStyles

Common styling patterns and utilities, available via the `@framework` barrel.

**Location**: `src/framework/slides/SlideStyles.ts`

**Static exports** (hardcoded colors — suitable for quick prototyping):
```typescript
import { slideContainer, contentBox, gradientBox, typography, layouts } from '@framework';
```

**Theme-aware factories** (use current theme colors — recommended for production):
```typescript
import { createSlideContainer, createContentBox, createGradientBox, createTypography, useTheme } from '@framework';

const theme = useTheme();
const container = createSlideContainer(theme);
```

### AnimationVariants

Framer Motion animation configurations.

**Location**: `src/framework/slides/AnimationVariants.ts`

**Common Variants**:
```typescript
import { fadeIn, fadeUp, scaleIn, staggerContainer } from '@framework';
```

Available presets: `fadeIn`, `fadeUp`, `fadeDown`, `fadeLeft`, `fadeRight`, `scaleIn`, `scaleInSpring`, `staggerContainer`, `tileVariants`, `pulseGlow`, `emphasisPulse`, `expandWidth`, `expandHeight`.

### SlideLayouts

Reusable layout components.

**Location**: `src/framework/slides/SlideLayouts.tsx`

**Components** (all importable from `@framework`):
- `SlideContainer` - Theme-aware full-screen slide wrapper
- `ContentCard` - Styled content card with shadow
- `GradientHighlightBox` - Gradient-bordered highlight box
- `SlideTitle` - Consistent slide title styling
- `MetricDisplay` - Metric with label and value
- `TestimonialCard` - Quote card layout
- `BenefitCard` / `ImprovementCard` - Feature showcase cards

### SlideIcons

Common icon components.

**Location**: `src/framework/slides/SlideIcons.tsx`

**Available Icons** (all importable from `@framework`):
- `ArrowDown`, `ArrowRight`, `ArrowRightLarge`, `ArrowRightXL`, `ArrowDownSmall`
- `Checkmark`, `ConvergingLines`, `EmojiIcons`

### CoreComponents

Reusable UI elements.

**Location**: `src/framework/components/MetricTile.tsx`

**Components**:
- `MetricTile` - Display metric with label and value
- `ProgressBar` - Animated progress indicator
- `Badge` - Tag/badge display
- `Card` - Container with shadow and border

## Context Providers

### SegmentContext

Manages multi-segment slide state.

**Location**: `src/framework/contexts/SegmentContext.tsx`

**Usage**:
```typescript
import { useSegmentContext, useSegmentedAnimation } from '@framework';

// Basic segment access
const { segment } = useSegmentContext();

// Advanced: segmented animation API with named segment lookups
const { isSegmentVisible, getSegmentAnimation } = useSegmentedAnimation();
```

**Features**:
- Track current segment index
- Named segment lookups via `isSegmentVisibleById()`
- Segment progression
- Slide-level state management

### ReducedMotion

Respects user motion preferences.

**Location**: `src/framework/accessibility/ReducedMotion.tsx`

**Usage**:
```typescript
import { useReducedMotion, fadeIn } from '@framework';

const { reduced } = useReducedMotion();
const variants = fadeIn(reduced);
```

## Type Definitions

### SlideMetadata

**Import**: `import type { SlideMetadata, SlideComponentWithMetadata, AudioSegment } from '@framework';`

```typescript
interface SlideMetadata {
  chapter: number;
  slide: number;
  title: string;
  audioSegments?: AudioSegment[];
  timing?: TimingConfig;
}

interface AudioSegment {
  id: string;
  audioFilePath: string;
  narrationText?: string;
  timing?: TimingConfig;
}
```

### DemoMetadata

**Import**: `import type { DemoMetadata, DemoConfig, TimingConfig } from '@framework';`

```typescript
interface DemoMetadata {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  tags: string[];
  hidden?: boolean;
  durationInfo?: DurationInfo;
}

interface DemoConfig {
  metadata: DemoMetadata;
  defaultMode?: DemoDefaultMode;
  getSlides: () => Promise<SlideComponentWithMetadata[]>;
  timing?: TimingConfig;
  startTransition?: StartTransition;
  chapters?: Record<number, { title: string }>;
}

interface StartTransition {
  exit?: { opacity?: number; scale?: number; x?: number | string; y?: number | string };
  transition?: { duration?: number; ease?: string | number[]; type?: 'tween' | 'spring'; stiffness?: number; damping?: number };
}

interface TimingConfig {
  beforeFirstSlide?: number; // Default: 1000ms
  betweenSegments?: number;  // Default: 500ms
  betweenSlides?: number;    // Default: 1000ms
  afterFinalSlide?: number;  // Default: 2000ms
}

type DemoDefaultMode = 'narrated' | 'manual' | 'manual-audio';
```

## Exported Props Interfaces

The framework barrel (`@framework`) exports all component props interfaces for external use:

- **`DemoPlayerProps`** — `{ demoId, onBack }`
- **`SlidePlayerProps`** — `{ slides, slidesWithMetadata?, autoAdvance?, ... }`
- **`NarratedControllerProps`** — `{ demoMetadata, slides, onSlideChange, ... }`
- **`SlideContainerProps`**, **`ContentCardProps`**, **`HighlightBoxProps`**, **`SlideTitleProps`**
- **`MetricDisplayProps`**, **`TestimonialCardProps`**, **`BenefitCardProps`**, **`ImprovementCardProps`**
- **`HoverButtonProps`** — `{ hoverStyle?, ...ButtonHTMLAttributes }`

## Usage Examples

### Creating a Slide with `defineSlide()`

```typescript
import { defineSlide } from '@framework';

export const Ch1_S1_Example = defineSlide({
  metadata: {
    chapter: 1,
    slide: 1,
    title: 'Example Slide',
    audioSegments: [
      {
        id: 'main',
        audioFilePath: '/audio/demo/c1/s1_segment_01_main.wav',
        narrationText: 'This is an example slide.',
      }
    ]
  },
  component: () => (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <h1>Example Slide</h1>
    </div>
  )
});
```

### Using Framer Motion Animations

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { defineSlide, fadeIn, fadeUp, useReducedMotion } from '@framework';

const AnimatedComponent: React.FC = () => {
  const { reduced } = useReducedMotion();

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn(reduced)}
      style={{ width: '100%', height: '100vh' }}>
      <motion.h1 variants={fadeUp(reduced)}>Animated Title</motion.h1>
    </motion.div>
  );
};

export const Ch1_S1_Animated = defineSlide({
  metadata: { chapter: 1, slide: 1, title: 'Animated', audioSegments: [/* ... */] },
  component: AnimatedComponent,
});
```

> **Note**: Always extract the component to a named `const` when using hooks inside `defineSlide()` to satisfy ESLint `rules-of-hooks`.

### Multi-Segment Progressive Reveal

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { defineSlide, useSegmentContext } from '@framework';

const RevealComponent: React.FC = () => {
  const { segment } = useSegmentContext();

  return (
    <div>
      {segment >= 0 && (
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          First Part
        </motion.h1>
      )}
      {segment >= 1 && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Second Part
        </motion.p>
      )}
      {segment >= 2 && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
          Third Part
        </motion.div>
      )}
    </div>
  );
};

export const Ch1_S1_Reveal = defineSlide({
  metadata: {
    chapter: 1, slide: 1, title: 'Reveal',
    audioSegments: [
      { id: 'part1', audioFilePath: '...', narrationText: 'First.' },
      { id: 'part2', audioFilePath: '...', narrationText: 'Second.' },
      { id: 'part3', audioFilePath: '...', narrationText: 'Third.' },
    ]
  },
  component: RevealComponent
});
```

### Using Video Player

```typescript
import { VideoPlayer } from '@framework';

// Inside a slide component:
<VideoPlayer
  videoPath="/videos/demo/example.mp4"
  isPlaying={segment > 0}
  onEnded={() => console.log('Video ended')}
  captionsSrc="/videos/demo/example.vtt"
/>
```
