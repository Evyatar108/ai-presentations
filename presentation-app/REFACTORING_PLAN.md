# Multi-Demo Architecture Refactoring Plan

## Overview

This document outlines the comprehensive plan to refactor the React app from a Meeting Highlights-specific presentation to a flexible multi-demo platform with a welcome screen for demo selection.

---

## Current Architecture Analysis

### Key Components
- **App.tsx**: Main application component, currently hardcoded to Meeting Highlights
- **NarratedController.tsx**: Manages audio playback and slide progression, has hardcoded title
- **SlidePlayer.tsx**: Renders slides with navigation, mostly demo-agnostic
- **SlidesRegistry.ts**: Central registry of all slides (Meeting Highlights specific)
- **Chapter files**: 9 chapter files with 15 total slides

### Current File Structure
```
presentation-app/src/
├── App.tsx (hardcoded to Meeting Highlights)
├── slides/
│   ├── SlidesRegistry.ts (Meeting Highlights slides)
│   └── chapters/ (Ch0-Ch9)
├── components/
│   ├── NarratedController.tsx (hardcoded title)
│   └── SlidePlayer.tsx (mostly generic)
└── contexts/SegmentContext.tsx
```

### Assets Organization
```
public/
├── audio/c{0-9}/ (Meeting Highlights audio)
├── images/ (Meeting Highlights images)
└── videos/ (Meeting Highlights videos)
```

### Issues to Address
1. Hardcoded "Meeting Highlights COGS Reduction" title in NarratedController
2. Direct import of `allSlides` from SlidesRegistry in multiple components
3. No abstraction for demo metadata or configuration
4. Audio/image/video paths not organized by demo
5. TTS scripts assume single demo structure

---

## Proposed Architecture

### New File Structure
```
presentation-app/
├── src/
│   ├── demos/                          # NEW: Demo-specific content
│   │   ├── DemoRegistry.ts            # Central demo registry
│   │   ├── types.ts                   # Demo type definitions
│   │   │
│   │   ├── meeting-highlights/        # Meeting Highlights demo
│   │   │   ├── index.ts               # Demo config & exports
│   │   │   ├── metadata.ts            # Demo metadata
│   │   │   ├── slides/                # Slides moved here
│   │   │   │   ├── SlidesRegistry.ts
│   │   │   │   └── chapters/
│   │   │   │       ├── Chapter0.tsx
│   │   │   │       ├── Chapter1.tsx
│   │   │   │       └── ...
│   │   │   └── README.md              # Demo-specific docs
│   │   │
│   │   ├── example-demo-1/            # Placeholder demo 1
│   │   │   ├── index.ts
│   │   │   ├── metadata.ts
│   │   │   └── slides/
│   │   │
│   │   └── example-demo-2/            # Placeholder demo 2
│   │       ├── index.ts
│   │       ├── metadata.ts
│   │       └── slides/
│   │
│   ├── components/
│   │   ├── WelcomeScreen.tsx          # NEW: Demo selection screen
│   │   ├── DemoPlayer.tsx             # NEW: Demo player wrapper
│   │   ├── NarratedController.tsx     # Updated: Accept demo config
│   │   ├── SlidePlayer.tsx            # Updated: Demo-agnostic
│   │   └── ...
│   │
│   ├── slides/                         # Keep for shared slide utilities
│   │   ├── SlideMetadata.ts           # Shared metadata types
│   │   ├── SlideLayouts.tsx           # Shared layouts
│   │   ├── SlideStyles.ts             # Shared styles
│   │   ├── SlideIcons.tsx             # Shared icons
│   │   └── AnimationVariants.ts       # Shared animations
│   │
│   └── App.tsx                         # Updated: Route between welcome & demo
│
└── public/
    ├── audio/
    │   ├── meeting-highlights/         # Organized by demo
    │   │   ├── c0/
    │   │   ├── c1/
    │   │   └── ...
    │   ├── example-demo-1/
    │   └── example-demo-2/
    │
    ├── images/
    │   ├── meeting-highlights/
    │   ├── example-demo-1/
    │   └── example-demo-2/
    │
    └── videos/
        ├── meeting-highlights/
        ├── example-demo-1/
        └── example-demo-2/
```

---

## Type Definitions

### demos/types.ts
```typescript
import { SlideComponentWithMetadata } from '../slides/SlideMetadata';

/**
 * Metadata for a demo presentation
 */
export interface DemoMetadata {
  id: string;                           // Unique demo identifier (kebab-case)
  title: string;                        // Display title
  description: string;                  // Short description (1-2 sentences)
  duration?: string;                    // e.g., "~4 minutes"
  thumbnail?: string;                   // Thumbnail image path
  slideCount: number;                   // Number of slides
  tags?: string[];                      // Optional categorization
  author?: string;                      // Optional author name
  date?: string;                        // Optional creation/update date
}

/**
 * Complete demo configuration
 */
export interface DemoConfig {
  metadata: DemoMetadata;
  slides: SlideComponentWithMetadata[]; // Imported from demo's SlidesRegistry
  audioBasePath: string;                // e.g., "/audio/meeting-highlights"
  assetsBasePath?: string;              // e.g., "/images/meeting-highlights"
}

/**
 * Registry entry for a demo (supports lazy loading)
 */
export interface DemoRegistryEntry {
  id: string;
  metadata: DemoMetadata;
  loadDemo: () => Promise<DemoConfig>;  // Lazy loading function
}
```

---

## Demo Registry Pattern

### demos/DemoRegistry.ts
```typescript
import { DemoRegistryEntry } from './types';

/**
 * Central registry of all available demos.
 * Demos are lazy-loaded for better performance.
 */
export const demoRegistry: DemoRegistryEntry[] = [
  {
    id: 'meeting-highlights',
    metadata: {
      id: 'meeting-highlights',
      title: 'Meeting Highlights COGS Reduction',
      description: 'Optimizing LLM costs: 4→1 calls, 70% GPU reduction',
      duration: '~4 minutes',
      thumbnail: '/images/meeting-highlights/meeting_highlights_thumbnail.jpeg',
      slideCount: 15,
      tags: ['AI/ML', 'Cost Optimization', 'Product']
    },
    loadDemo: async () => {
      const { meetingHighlightsDemo } = await import('./meeting-highlights');
      return meetingHighlightsDemo;
    }
  },
  {
    id: 'example-demo-1',
    metadata: {
      id: 'example-demo-1',
      title: 'Example Demo 1',
      description: 'Placeholder demonstration for future content',
      duration: '~2 minutes',
      slideCount: 3,
      tags: ['Example', 'Placeholder']
    },
    loadDemo: async () => {
      const { exampleDemo1 } = await import('./example-demo-1');
      return exampleDemo1;
    }
  },
  {
    id: 'example-demo-2',
    metadata: {
      id: 'example-demo-2',
      title: 'Example Demo 2',
      description: 'Another placeholder for demonstration purposes',
      duration: '~2 minutes',
      slideCount: 3,
      tags: ['Example', 'Placeholder']
    },
    loadDemo: async () => {
      const { exampleDemo2 } = await import('./example-demo-2');
      return exampleDemo2;
    }
  }
];

/**
 * Get a demo by its ID
 */
export function getDemoById(id: string): DemoRegistryEntry | undefined {
  return demoRegistry.find(demo => demo.id === id);
}

/**
 * Get all registered demos
 */
export function getAllDemos(): DemoRegistryEntry[] {
  return [...demoRegistry];
}
```

---

## Component Updates

### 1. WelcomeScreen Component

**File**: `src/components/WelcomeScreen.tsx`

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { demoRegistry } from '../demos/DemoRegistry';
import { DemoMetadata } from '../demos/types';

interface WelcomeScreenProps {
  onSelectDemo: (demoId: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectDemo }) => {
  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <h1 style={styles.title}>Demo Presentations</h1>
        <p style={styles.subtitle}>Select a presentation to view</p>
      </motion.div>

      <div style={styles.grid}>
        {demoRegistry.map((demo, index) => (
          <DemoCard
            key={demo.id}
            metadata={demo.metadata}
            index={index}
            onSelect={() => onSelectDemo(demo.id)}
          />
        ))}
      </div>
    </div>
  );
};

interface DemoCardProps {
  metadata: DemoMetadata;
  index: number;
  onSelect: () => void;
}

const DemoCard: React.FC<DemoCardProps> = ({ metadata, index, onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      style={styles.card}
      onClick={onSelect}
    >
      {metadata.thumbnail && (
        <div style={styles.thumbnail}>
          <img src={metadata.thumbnail} alt={metadata.title} style={styles.thumbnailImg} />
        </div>
      )}
      <div style={styles.cardContent}>
        <h2 style={styles.cardTitle}>{metadata.title}</h2>
        <p style={styles.cardDescription}>{metadata.description}</p>
        <div style={styles.cardMeta}>
          {metadata.duration && <span style={styles.metaItem}>⏱ {metadata.duration}</span>}
          <span style={styles.metaItem}>📊 {metadata.slideCount} slides</span>
        </div>
        {metadata.tags && metadata.tags.length > 0 && (
          <div style={styles.tags}>
            {metadata.tags.map(tag => (
              <span key={tag} style={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const styles = {
  // ... styles defined here
};
```

### 2. DemoPlayer Component

**File**: `src/components/DemoPlayer.tsx`

```typescript
import React from 'react';
import { DemoConfig } from '../demos/types';
import { NarratedController } from './NarratedController';
import { SlidePlayer } from './SlidePlayer';
import { SegmentProvider } from '../contexts/SegmentContext';

interface DemoPlayerProps {
  demo: DemoConfig;
  onBack: () => void;
}

export const DemoPlayer: React.FC<DemoPlayerProps> = ({ demo, onBack }) => {
  const [currentSlide, setCurrentSlide] = useState<{ chapter: number; slide: number } | undefined>(undefined);
  const [isNarratedMode, setIsNarratedMode] = useState(false);
  const [manualSlideChange, setManualSlideChange] = useState<{ chapter: number; slide: number } | null>(null);

  // Build slides from demo config
  const slides = useMemo(() => {
    return demo.slides.map(slideComponent => ({
      chapter: slideComponent.metadata.chapter,
      slide: slideComponent.metadata.slide,
      title: slideComponent.metadata.title,
      Component: slideComponent
    }));
  }, [demo.slides]);

  // ... handlers ...

  return (
    <SegmentProvider>
      <div style={{ position: 'relative' }}>
        <NarratedController
          demoMetadata={demo.metadata}
          slides={demo.slides}
          onSlideChange={handleSlideChange}
          onPlaybackStart={handlePlaybackStart}
          onPlaybackEnd={handlePlaybackEnd}
          manualSlideChange={manualSlideChange}
          onBack={onBack}
        />

        <SlidePlayer
          slides={slides}
          autoAdvance={false}
          externalSlide={currentSlide}
          onSlideChange={handleManualSlideChange}
          disableManualNav={isNarratedMode}
        />
      </div>
    </SegmentProvider>
  );
};
```

### 3. Updated NarratedController

**Changes**:
- Remove hardcoded "Meeting Highlights COGS Reduction" title
- Accept `demoMetadata` prop
- Accept `slides` prop (instead of importing allSlides)
- Accept `onBack` prop for returning to welcome screen
- Use dynamic title and slide count

### 4. Updated App.tsx

**File**: `src/App.tsx`

```typescript
import React, { useState } from 'react';
import { WithReducedMotionProvider } from './accessibility/ReducedMotion';
import { WelcomeScreen } from './components/WelcomeScreen';
import { DemoPlayer } from './components/DemoPlayer';
import { getDemoById } from './demos/DemoRegistry';
import { DemoConfig } from './demos/types';
import 'reactflow/dist/style.css';

export const App: React.FC = () => {
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);
  const [demoConfig, setDemoConfig] = useState<DemoConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectDemo = async (demoId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const entry = getDemoById(demoId);
      if (!entry) {
        throw new Error(`Demo not found: ${demoId}`);
      }
      
      const config = await entry.loadDemo();
      setDemoConfig(config);
      setSelectedDemoId(demoId);
    } catch (err) {
      console.error('Failed to load demo:', err);
      setError(err instanceof Error ? err.message : 'Failed to load demo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToWelcome = () => {
    setSelectedDemoId(null);
    setDemoConfig(null);
    setError(null);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onBack={handleBackToWelcome} />;
  }

  if (!selectedDemoId || !demoConfig) {
    return <WelcomeScreen onSelectDemo={handleSelectDemo} />;
  }

  return <DemoPlayer demo={demoConfig} onBack={handleBackToWelcome} />;
};

export default App;
```

---

## Meeting Highlights Demo Configuration

### demos/meeting-highlights/index.ts
```typescript
import { DemoConfig } from '../types';
import { allSlides } from './slides/SlidesRegistry';

export const meetingHighlightsDemo: DemoConfig = {
  metadata: {
    id: 'meeting-highlights',
    title: 'Meeting Highlights COGS Reduction',
    description: 'Technical presentation on optimizing Meeting Highlights LLM costs: reducing from 4 to 1 call and achieving 70% GPU reduction',
    duration: '~4 minutes',
    thumbnail: '/images/meeting-highlights/meeting_highlights_thumbnail.jpeg',
    slideCount: 15,
    tags: ['AI/ML', 'Cost Optimization', 'Product', 'All-Hands'],
    author: 'ODSP Team',
    date: '2025-01'
  },
  slides: allSlides,
  audioBasePath: '/audio/meeting-highlights',
  assetsBasePath: '/images/meeting-highlights'
};
```

### demos/meeting-highlights/README.md
```markdown
# Meeting Highlights COGS Reduction Demo

This demo presents the Meeting Highlights feature and its COGS optimization journey.

## Content
- 15 slides organized in 9 chapters
- ~4 minute narrated presentation
- Technical + business impact focus

## Structure
- Chapter 0: Introduction
- Chapter 1: What is Meeting Highlights (3 slides)
- Chapter 2: Team Collaboration (1 slide, 9 segments)
- Chapter 4: Highlight Types (1 slide)
- Chapter 5: COGS Challenge (1 slide)
- Chapter 6: Optimization Solution (2 slides)
- Chapter 7: Business Impact (3 slides)
- Chapter 8: User Reception (1 slide)
- Chapter 9: Testimonials & Thank You (2 slides)

## Assets
- Audio: `/public/audio/meeting-highlights/c{0-9}/`
- Images: `/public/images/meeting-highlights/`
- Videos: `/public/videos/meeting-highlights/`

## Key Metrics
- 75% reduction in LLM calls (4 → 1)
- 60% reduction in input tokens
- 67% reduction in GPU capacity (~600 → ~200 GPUs)
- 70%+ estimated COGS reduction overall
```

---

## Placeholder Demo Examples

### example-demo-1/index.ts
```typescript
import { DemoConfig } from '../types';
import { allSlides } from './slides/SlidesRegistry';

export const exampleDemo1: DemoConfig = {
  metadata: {
    id: 'example-demo-1',
    title: 'Example Demo 1',
    description: 'Placeholder demonstration for future content',
    duration: '~2 minutes',
    slideCount: 3,
    tags: ['Example', 'Placeholder']
  },
  slides: allSlides,
  audioBasePath: '/audio/example-demo-1'
};
```

### example-demo-1/slides/SlidesRegistry.ts
```typescript
import { SlideComponentWithMetadata } from '../../../slides/SlideMetadata';
import { PlaceholderSlide1, PlaceholderSlide2, PlaceholderSlide3 } from './chapters/Chapter0';

export const allSlides: SlideComponentWithMetadata[] = [
  PlaceholderSlide1,
  PlaceholderSlide2,
  PlaceholderSlide3
];
```

### example-demo-1/slides/chapters/Chapter0.tsx
```typescript
import React from 'react';
import { SlideComponentWithMetadata } from '../../../../slides/SlideMetadata';

export const PlaceholderSlide1: SlideComponentWithMetadata = () => {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <h1 style={{ color: '#fff', fontSize: 64 }}>Example Demo 1</h1>
    </div>
  );
};

PlaceholderSlide1.metadata = {
  chapter: 0,
  slide: 0,
  title: 'Example Demo 1 - Slide 1',
  audioSegments: [{
    id: 'intro',
    audioFilePath: '/audio/example-demo-1/c0/s0_intro.wav',
    narrationText: 'Welcome to Example Demo 1. This is a placeholder demonstration.'
  }]
};

// Similar for PlaceholderSlide2 and PlaceholderSlide3
```

---

## File Move Operations

### Phase 1: Create New Structure
1. Create `src/demos/` directory
2. Create `src/demos/types.ts`
3. Create `src/demos/DemoRegistry.ts`
4. Create `src/demos/meeting-highlights/` directory
5. Create `src/demos/meeting-highlights/slides/` directory
6. Create `src/demos/meeting-highlights/slides/chapters/` directory
7. Create `src/demos/example-demo-1/` and `example-demo-2/` directories

### Phase 2: Move Meeting Highlights Files
1. Move `src/slides/chapters/Chapter*.tsx` → `src/demos/meeting-highlights/slides/chapters/`
2. Move `src/slides/SlidesRegistry.ts` → `src/demos/meeting-highlights/slides/SlidesRegistry.ts`
3. Update all imports in moved files:
   - `../../SlideMetadata` → `../../../../slides/SlideMetadata`
   - `../../AnimationVariants` → `../../../../slides/AnimationVariants`
   - `../../SlideStyles` → `../../../../slides/SlideStyles`
   - etc.

### Phase 3: Move Assets
1. Create `public/audio/meeting-highlights/` directory
2. Move `public/audio/c{0-9}/` → `public/audio/meeting-highlights/c{0-9}/`
3. Create `public/images/meeting-highlights/` directory
4. Move `public/images/*` → `public/images/meeting-highlights/`
5. Create `public/videos/meeting-highlights/` directory
6. Move `public/videos/*` → `public/videos/meeting-highlights/`

### Phase 4: Update Audio Paths
Update all `audioFilePath` in slide metadata:
- `/audio/c0/s0_intro.wav` → `/audio/meeting-highlights/c0/s0_intro.wav`
- Apply to all ~65 audio file references

### Phase 5: Clean Up
1. Remove empty `src/slides/chapters/` directory
2. Keep `src/slides/` for shared utilities (SlideMetadata, SlideStyles, etc.)
3. Update `.gitignore` if needed

---

## TTS Script Updates

### scripts/generate-tts.ts
**Changes**:
- Add `--demo` parameter to specify which demo to generate audio for
- Default to all demos if no parameter specified
- Update cache structure to support multiple demos
- Update audio output paths to demo-specific folders

```typescript
// Usage:
// npm run tts:generate                       # Generate for all demos
// npm run tts:generate -- --demo meeting-highlights
// npm run tts:generate -- --demo example-demo-1 --force
```

### scripts/check-tts-cache.ts
**Changes**:
- Check cache for all demos
- Report changes per demo
- Prompt for regeneration per demo or all at once

### scripts/calculate-durations.ts
**Changes**:
- Calculate durations per demo
- Generate separate duration reports per demo
- Support `--demo` parameter

### .tts-narration-cache.json Structure
```json
{
  "meeting-highlights": {
    "Ch0:S0:intro": "Welcome to...",
    "Ch1:S1:segment_01": "Meeting Highlights combines..."
  },
  "example-demo-1": {
    "Ch0:S0:intro": "Welcome to Example Demo 1..."
  }
}
```

---

## Implementation Checklist

### Phase 1: Core Structure ✅
- [ ] Create `demos/types.ts` with type definitions
- [ ] Create `demos/DemoRegistry.ts` with registry pattern
- [ ] Create `demos/meeting-highlights/` folder structure
- [ ] Create `demos/example-demo-1/` and `example-demo-2/` folders

### Phase 2: Meeting Highlights Migration ✅
- [ ] Create `demos/meeting-highlights/index.ts` config
- [ ] Create `demos/meeting-highlights/metadata.ts`
- [ ] Create `demos/meeting-highlights/README.md`
- [ ] Move slides to `demos/meeting-highlights/slides/`
- [ ] Update all imports in moved slide files
- [ ] Update all audio file paths in slide metadata

### Phase 3: Asset Migration ✅
- [ ] Move audio files to `public/audio/meeting-highlights/`
- [ ] Move images to `public/images/meeting-highlights/`
- [ ] Move videos to `public/videos/meeting-highlights/`
- [ ] Update `.gitignore` if needed

### Phase 4: Component Updates ✅
- [ ] Create `components/WelcomeScreen.tsx`
- [ ] Create `components/DemoPlayer.tsx`
- [ ] Update `components/NarratedController.tsx` (accept demo config)
- [ ] Update `App.tsx` (demo selection flow)
- [ ] Update `index.html` title to generic

### Phase 5: Placeholder Demos ✅
- [ ] Create example-demo-1 structure with 3 placeholder slides
- [ ] Create example-demo-2 structure with 3 placeholder slides
- [ ] Add placeholder audio files or use silence fallback

### Phase 6: TTS Script Updates ✅
- [ ] Update `scripts/generate-tts.ts` for multi-demo support
- [ ] Update `scripts/check-tts-cache.ts` for multi-demo support
- [ ] Update `scripts/calculate-durations.ts` for multi-demo support
- [ ] Update cache file structure

### Phase 7: Documentation ✅
- [ ] Update `README.md` with new structure
- [ ] Update `Agents.md` with architecture changes
- [ ] Create demo-specific README files
- [ ] Update package.json scripts documentation

### Phase 8: Testing ✅
- [ ] Test welcome screen rendering
- [ ] Test demo selection and loading
- [ ] Test Meeting Highlights demo (all modes)
- [ ] Test placeholder demos
- [ ] Test back to welcome navigation
- [ ] Test TTS generation for multiple demos
- [ ] Test build process

---

## Breaking Changes & Migration Notes

### For Developers Adding New Demos

1. **Create demo folder**: `src/demos/your-demo-name/`
2. **Create index.ts** with DemoConfig
3. **Create slides/** folder with SlidesRegistry.ts
4. **Add to DemoRegistry.ts**
5. **Create audio/image folders** in `public/`
6. **Run TTS generation**: `npm run tts:generate -- --demo your-demo-name`

### Import Path Changes
- Old: `import { allSlides } from '../slides/SlidesRegistry'`
- New: `import { allSlides } from '../demos/meeting-highlights/slides/SlidesRegistry'`

### Audio Path Changes
- Old: `/audio/c0/s0_intro.wav`
- New: `/audio/meeting-highlights/c0/s0_intro.wav`

### Asset Path Changes
- Old: `/images/logos/Teams.png`
- New: `/images/meeting-highlights/logos/Teams.png`

---

## Benefits of This Architecture

✅ **Clean Separation**: Each demo is self-contained in its own folder  
✅ **Scalability**: Easy to add unlimited demos without conflicts  
✅ **Lazy Loading**: Demos load on-demand for better performance  
✅ **Maintainability**: Clear folder structure, easy to find files  
✅ **Reusability**: Shared components (SlidePlayer, NarratedController) work with any demo  
✅ **Type Safety**: Strict TypeScript interfaces prevent errors  
✅ **Flexibility**: Each demo can have different slide counts, audio strategies, etc.  
✅ **Professional UX**: Welcome screen provides clear demo selection  

---

## Timeline Estimate

- **Phase 1-2 (Core + Meeting Highlights)**: 2-3 hours
- **Phase 3 (Asset Migration)**: 1 hour
- **Phase 4 (Component Updates)**: 2-3 hours
- **Phase 5 (Placeholder Demos)**: 1 hour
- **Phase 6 (TTS Scripts)**: 1-2 hours
- **Phase 7 (Documentation)**: 1 hour
- **Phase 8 (Testing)**: 1-2 hours

**Total**: 9-13 hours of focused development work

---

## Next Steps

Ready to proceed with implementation in Code mode!