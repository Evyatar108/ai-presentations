# Component Reference

## Core Components

### WelcomeScreen

Demo selection interface with card-based layout.

**Location**: `src/components/WelcomeScreen.tsx`

**Features**:
- Displays all registered demos
- Shows thumbnail, title, description, tags, duration
- Click to select and load demo
- Responsive grid layout

### DemoPlayer

Main container for demo playback with mode selection.

**Location**: `src/components/DemoPlayer.tsx`

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

**Location**: `src/components/SlidePlayer.tsx`

**Props**:
- `slide: SlideMetadata` - Slide configuration
- `isActive: boolean` - Whether slide is currently active
- `currentSegment: number` - Current segment index
- `mode: PresentationMode` - Playback mode

**Features**:
- Dynamic segment rendering
- Component isolation
- Segment state management

### NarratedController

Manages audio-synced playback in narrated mode.

**Location**: `src/components/NarratedController.tsx`

**Features**:
- Automatic slide progression
- Audio playback synchronization
- Segment advancement
- Completion handling
- Audio cleanup

### VideoPlayer

Video embed component with playback controls.

**Location**: `src/components/VideoPlayer.tsx`

**Props**:
- `videoPath: string` - Path to video file
- `playing: boolean` - Whether video should play
- `onEnded?: () => void` - Callback when video ends

**Features**:
- Freeze-on-end playback (pauses on last frame)
- Framer Motion animations
- Responsive sizing
- Synchronized with slide segments

## Shared Utilities

### SlideStyles

Common styling patterns and utilities.

**Location**: `src/slides/SlideStyles.ts`

**Exports**:
```typescript
export const colors = {
  primary: '#667eea',
  secondary: '#764ba2',
  // ...
};

export const gradients = {
  purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  // ...
};

export const commonStyles = {
  centerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  // ...
};
```

### AnimationVariants

Framer Motion animation configurations.

**Location**: `src/slides/AnimationVariants.ts`

**Common Variants**:
```typescript
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

export const slideUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};
```

### SlideLayouts

Reusable layout components.

**Location**: `src/slides/SlideLayouts.tsx`

**Components**:
- `TitleSlide` - Full-screen title layout
- `ContentSlide` - Header + content layout
- `TwoColumnSlide` - Split-screen layout
- `FullScreenSlide` - Custom full-screen content

### SlideIcons

Common icon components.

**Location**: `src/slides/SlideIcons.tsx`

**Available Icons**:
- `CheckIcon`
- `XIcon`
- `ArrowRightIcon`
- `StarIcon`
- `InfoIcon`

### CoreComponents

Reusable UI elements.

**Location**: `src/components/CoreComponents.tsx`

**Components**:
- `MetricTile` - Display metric with label and value
- `ProgressBar` - Animated progress indicator
- `Badge` - Tag/badge display
- `Card` - Container with shadow and border

## Context Providers

### SegmentContext

Manages multi-segment slide state.

**Location**: `src/contexts/SegmentContext.tsx`

**Usage**:
```typescript
const { currentSegment, setCurrentSegment } = useSegmentContext();
```

**Features**:
- Track current segment index
- Segment progression
- Slide-level state management

### ReducedMotion

Respects user motion preferences.

**Location**: `src/accessibility/ReducedMotion.tsx`

**Usage**:
```typescript
const prefersReducedMotion = useReducedMotion();

const variants = prefersReducedMotion
  ? { hidden: {}, visible: {} }  // No animation
  : fadeIn;  // Normal animation
```

## Type Definitions

### SlideMetadata

**Location**: `src/slides/SlideMetadata.ts`

```typescript
interface SlideMetadata {
  chapter: number;
  slide: number;
  title: string;
  segments: SegmentMetadata[];
  videoPath?: string;
  component: React.ComponentType<SlideComponentProps>;
}

interface SegmentMetadata {
  number: number;
  id: string;
  description: string;
  audioPath?: string;
  narrationText?: string;
}

interface SlideComponentProps {
  segment: number;
}
```

### DemoMetadata

**Location**: `src/demos/types.ts`

```typescript
interface DemoMetadata {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  tags: string[];
  duration?: number;  // seconds
}

interface DemoConfig {
  id: string;
  metadata: DemoMetadata;
  defaultMode: PresentationMode;
  getSlides: () => Promise<SlideMetadata[]>;
}

type PresentationMode = 'narrated' | 'manual' | 'manual-audio';
```

## Usage Examples

### Creating a Simple Slide

```typescript
export const Ch1_S1_Example: SlideMetadata = {
  chapter: 1,
  slide: 1,
  title: 'Example Slide',
  segments: [
    {
      number: 1,
      id: 'main',
      description: 'Main content',
      audioPath: '/audio/demo/c1/s1_segment_01_main.wav',
      narrationText: 'This is an example slide.'
    }
  ],
  component: ({ segment }) => (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1>Example Slide</h1>
    </div>
  )
};
```

### Using Framer Motion Animations

```typescript
import { motion } from 'framer-motion';
import { fadeIn, slideUp } from '../../../../../slides/AnimationVariants';

component: ({ segment }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={fadeIn}
    style={{ width: '100%', height: '100vh' }}
  >
    <motion.h1 variants={slideUp}>
      Animated Title
    </motion.h1>
  </motion.div>
)
```

### Multi-Segment Progressive Reveal

```typescript
component: ({ segment }) => (
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
)
```

### Using Video Player

```typescript
import { VideoPlayer } from '../../../../../components/VideoPlayer';

component: ({ segment }) => (
  <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
    <VideoPlayer
      videoPath="/videos/demo/example.mp4"
      playing={segment > 0}
      onEnded={() => console.log('Video ended')}
    />
  </div>
)