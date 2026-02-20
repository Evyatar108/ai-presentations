# Adding a New Demo

This guide walks through creating a new presentation demo from scratch.

## Quick Start

**Recommended**: Use the PowerShell scaffolding script to create a complete demo structure automatically:

```powershell
.\scripts\new-demo.ps1 -DemoId "my-demo" [-DemoTitle "My Demo"]
```

The script creates all required files and directories with templates. See [`DEMO_DOCUMENTATION_STRUCTURE.md`](DEMO_DOCUMENTATION_STRUCTURE.md) for documentation structure details.

**Manual approach**: Follow the implementation steps below if you need to understand the details or customize the structure.

## Quick Start Checklist

- [ ] Choose a demo ID (lowercase with hyphens, e.g., `my-feature-demo`)
- [ ] Run PowerShell script OR create structure manually
- [ ] Add context materials to `docs/demos/{demo-id}/context/`
- [ ] Implement slides in `src/demos/{demo-id}/slides/chapters/`
- [ ] Add assets to `public/{audio|images|videos}/{demo-id}/`
- [ ] Generate TTS audio (registration is automatic)
- [ ] Test the demo

## Manual Implementation Steps

### Step 1: Create Demo Directory

Create a new directory under `src/demos/`:

```bash
mkdir -p src/demos/your-demo-name/slides/chapters
```

### Step 2: Create Metadata

Create `src/demos/your-demo-name/metadata.ts`:

```typescript
import type { DemoMetadata } from '@framework';

export const metadata: DemoMetadata = {
  id: 'your-demo-name',
  title: 'Your Demo Title',
  description: 'Brief description of what this demo presents',
  thumbnail: '/images/your-demo-name/thumbnail.jpeg',
  tags: ['category1', 'category2'],
};
```

### Step 3: Create Demo Configuration

Create `src/demos/your-demo-name/index.ts`:

```typescript
import type { DemoConfig } from '@framework';
import { metadata } from './metadata';

const demoConfig: DemoConfig = {
  metadata,
  getSlides: async () => {
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  }
};

export default demoConfig;
```

**Note**: Always use `export default` for demo configurations to maintain consistency across all demos. The script tools (TTS generation, duration calculation) expect default exports. The `DemoConfig` interface no longer has an `id` field — the demo ID comes from `metadata.id` only, avoiding duplication and potential mismatch.

### Step 4: Create Slide Chapters

Create `src/demos/your-demo-name/slides/chapters/Chapter0.tsx`:

```typescript
import { defineSlide } from '@framework';

export const Ch0_S1_Welcome = defineSlide({
  metadata: {
    chapter: 0,
    slide: 1,
    title: 'Welcome',
    audioSegments: [
      {
        id: 'intro',
        audioFilePath: '/audio/your-demo-name/c0/s1_segment_01_intro.wav',
        narrationText: 'Welcome to our presentation.',
      }
    ]
  },
  component: () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
    }}>
      <h1 style={{ fontSize: '4rem' }}>Welcome</h1>
    </div>
  )
});
```

Slides are created using the `defineSlide()` factory, which combines `metadata` and a `component` into a single object. Use `segment >= N` conditionals for progressive reveals (the `segment` prop comes from `useSegmentContext()`).

> **Important**: All demo code must import from the `@framework` barrel (`import { ... } from '@framework'`). Deep imports like `@framework/slides/SlideMetadata` or `@framework/contexts/SegmentContext` are blocked by the `no-restricted-imports` ESLint rule.

### Step 5: Create Slides Registry

Create `src/demos/your-demo-name/slides/SlidesRegistry.ts`:

```typescript
import type { SlideComponentWithMetadata } from '@framework';
import { Ch0_S1_Welcome } from './chapters/Chapter0';

export const allSlides: SlideComponentWithMetadata[] = [
  Ch0_S1_Welcome,
  // Add more slides here
];
```

### Step 6: Registration (Automatic)

No manual registration needed. The `src/demos/registry.ts` file uses Vite's `import.meta.glob` to auto-discover all demos. Any folder in `src/demos/` with a `metadata.ts` (exporting `const metadata: DemoMetadata`) and `index.ts` (with `export default demoConfig`) is automatically registered at startup.

### Step 7: Add Assets

Create asset directories:

```bash
mkdir -p public/audio/your-demo-name/c0
mkdir -p public/images/your-demo-name
mkdir -p public/videos/your-demo-name
```

Add your assets:
- `public/images/your-demo-name/thumbnail.jpeg` - Demo thumbnail (16:9 ratio recommended)
- Audio files will be generated via TTS (see [TTS Guide](TTS_GUIDE.md))
- Add any videos to `public/videos/your-demo-name/`

### Step 8: Create Documentation

Create documentation structure (see [`DEMO_DOCUMENTATION_STRUCTURE.md`](DEMO_DOCUMENTATION_STRUCTURE.md) for details):

```bash
mkdir -p docs/demos/your-demo-name/context
```

Create `docs/demos/your-demo-name/your-demo-name.md` with demo overview, structure, and context file references.

### Step 9: Generate TTS Audio

Generate audio for your demo (see [TTS Guide](TTS_GUIDE.md)):

```bash
npm run tts:generate -- --demo your-demo-name
```

### Step 10: Configure Timing (Optional)

Customize presentation timing delays if defaults aren't suitable.

**Add to demo config** (`src/demos/{demo-id}/index.ts`):
```typescript
import type { DemoConfig, TimingConfig } from '@framework';

const timing: TimingConfig = {
  betweenSegments: 500,   // Delay between segments within slides
  betweenSlides: 1000,    // Delay between slides
  afterFinalSlide: 2000   // Hold time after final slide
};

const demoConfig: DemoConfig = {
  // ... other fields ...
  timing,
};

export default demoConfig;
```

**Generate duration info**:
```bash
npm run tts:duration -- --demo {demo-id}
```

Copy the generated `durationInfo` object to your metadata file (`src/demos/{demo-id}/metadata.ts`). The `DurationInfo` interface is exported from the framework:

```typescript
import type { DemoMetadata, DurationInfo } from '@framework';

const durationInfo: DurationInfo = {
  audioOnly: 120.5,
  segmentDelays: 8.0,
  slideDelays: 10.0,
  finalDelay: 2.0,
  total: 140.5,
};

export const metadata: DemoMetadata = {
  id: 'your-demo-name',
  // ...
  durationInfo,
};
```

See [TIMING_SYSTEM.md](TIMING_SYSTEM.md) for detailed timing patterns and examples.

### Step 11: Configure TTS Instruct (Optional)

Set a TTS voice style instruction for Qwen3-TTS. Like timing, `instruct` supports a three-level hierarchy: demo → slide → segment (most specific wins).

**Add to demo config** (`src/demos/{demo-id}/index.ts`):
```typescript
const demoConfig: DemoConfig = {
  metadata,
  instruct: 'speak slowly and clearly with a professional tone',
  getSlides: async () => {
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  }
};

export default demoConfig;
```

**Override per-slide** (in chapter file):
```typescript
export const Ch1_S5_Exciting = defineSlide({
  metadata: {
    chapter: 1, slide: 5, title: 'Key Results',
    instruct: 'speak with excitement and energy',
    audioSegments: [...]
  },
  component: ExcitingSlide
});
```

**Override per-segment** (in audio segment):
```typescript
audioSegments: [
  {
    id: 'dramatic',
    audioFilePath: '/audio/your-demo-name/c1/s5_segment_01_dramatic.wav',
    narrationText: 'And the results are in...',
    instruct: 'speak with dramatic anticipation',
  }
]
```

See [TTS_GUIDE.md](TTS_GUIDE.md#instruct-hierarchy) for details on instruct in narration JSON and CLI usage.

### Registry Validation

The registry performs development-time validation when demos are registered:
- **Duplicate IDs**: Warns and skips if a demo with the same ID is already registered
- **ID consistency**: Warns if `entry.id` and `metadata.id` don't match
- **Missing title**: Warns if `metadata.title` is empty
- **Invalid loadConfig**: Rejects entries where `loadConfig` is not a function

### Step 12: Test Your Demo

```bash
npm run dev
```

Navigate to the demo selection screen and select your new demo.

## Implementation Tips

### Multi-Segment Slides

For slides with progressive reveals, use multiple segments with `defineSlide()` and `useSegmentContext()`:

```typescript
import React from 'react';
import { defineSlide, useSegmentContext } from '@framework';

const MultiSegmentComponent: React.FC = () => {
  const { segment } = useSegmentContext();

  return (
    <div>
      {segment >= 0 && <h1>First Part</h1>}
      {segment >= 1 && <p>Second Part</p>}
    </div>
  );
};

export const Ch1_S1_MultiSegment = defineSlide({
  metadata: {
    chapter: 1,
    slide: 1,
    title: 'Multi-segment Example',
    audioSegments: [
      {
        id: 'intro',
        audioFilePath: '/audio/your-demo-name/c1/s1_segment_01_intro.wav',
        narrationText: 'First narration.',
      },
      {
        id: 'detail',
        audioFilePath: '/audio/your-demo-name/c1/s1_segment_02_detail.wav',
        narrationText: 'Second narration.',
      }
    ]
  },
  component: MultiSegmentComponent
});
```

> **Note**: When using hooks inside `defineSlide()`, extract the component to a named `const` (like `MultiSegmentComponent` above). This satisfies the ESLint `rules-of-hooks` requirement that hooks are called from named functions.

### Using Video Player

```typescript
import { VideoPlayer } from '@framework';

// Inside a slide component:
<VideoPlayer
  videoPath="/videos/your-demo-name/demo.mp4"
  isPlaying={segment > 0}
/>
```

### Shared Utilities

Import shared components and utilities from the `@framework` barrel:
- **Layout components**: `SlideContainer`, `ContentCard`, `GradientHighlightBox`, `SlideTitle`
- **Animation presets**: `fadeIn`, `fadeUp`, `scaleIn`, `staggerContainer`, etc.
- **Style factories**: `createSlideContainer()`, `createContentBox()`, `createGradientBox()`
- **Icons**: `ArrowDown`, `ArrowRight`, `Checkmark`, etc.
- **Accessibility**: `useReducedMotion()` — respects `prefers-reduced-motion`
- **Theme**: `useTheme()` — access current theme colors and typography

### Testing Your Demo

The framework provides test utilities for unit-testing slides:

```typescript
import { TestSlideWrapper, createTestSlide, createTestMetadata } from '@framework';
import { render, screen } from '@testing-library/react';

// Create test metadata
const metadata = createTestMetadata({ title: 'Test Slide' });

// Create a complete test slide
const slide = createTestSlide({ metadata });

// Render a slide with required providers (SegmentProvider, ThemeProvider, etc.)
render(
  <TestSlideWrapper segment={0}>
    <MySlideComponent />
  </TestSlideWrapper>
);
```

See the existing test files in `src/framework/testing/` for more examples.

## Related Documentation

- **[Demo Documentation Structure](DEMO_DOCUMENTATION_STRUCTURE.md)** - Documentation structure and philosophy
- **[TTS Guide](TTS_GUIDE.md)** - Audio generation system
- **[Architecture](ARCHITECTURE.md)** - Overall project architecture
- **[Components](COMPONENTS.md)** - Shared component documentation
- **[Timing System](TIMING_SYSTEM.md)** - Timing configuration details
