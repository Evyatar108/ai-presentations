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
import type { DemoMetadata } from '@framework/demos/types';

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
import type { DemoConfig } from '@framework/demos/types';
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
import { SlideComponentWithMetadata } from '@framework/slides/SlideMetadata';
import { SlideContainer } from '@framework/slides/SlideLayouts';

export const Ch0_S1_Welcome: SlideComponentWithMetadata = () => (
  <SlideContainer>
    <h1 style={{ color: 'white', fontSize: '4rem' }}>
      Welcome
    </h1>
  </SlideContainer>
);

Ch0_S1_Welcome.metadata = {
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
};
```

Slides are React function components with a `metadata` property attached. Use `segment >= N` conditionals for progressive reveals (the `segment` prop comes from `SegmentContext`).

### Step 5: Create Slides Registry

Create `src/demos/your-demo-name/slides/SlidesRegistry.ts`:

```typescript
import { SlideComponentWithMetadata } from '@framework/slides/SlideMetadata';
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
import type { TimingConfig } from '@framework/demos/timing/types';

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
import type { DemoMetadata, DurationInfo } from '@framework/demos/types';

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

### Registry Validation

The registry performs development-time validation when demos are registered:
- **Duplicate IDs**: Warns and skips if a demo with the same ID is already registered
- **ID consistency**: Warns if `entry.id` and `metadata.id` don't match
- **Missing title**: Warns if `metadata.title` is empty
- **Invalid loadConfig**: Rejects entries where `loadConfig` is not a function

### Step 11: Test Your Demo

```bash
npm run dev
```

Navigate to the demo selection screen and select your new demo.

## Implementation Tips

### Multi-Segment Slides

For slides with progressive reveals, use multiple segments:

```typescript
import { useSegmentContext } from '@framework/contexts/SegmentContext';
import { SlideComponentWithMetadata } from '@framework/slides/SlideMetadata';

export const Ch1_S1_MultiSegment: SlideComponentWithMetadata = () => {
  const { segment } = useSegmentContext();

  return (
    <div>
      {segment >= 0 && <h1>First Part</h1>}
      {segment >= 1 && <p>Second Part</p>}
    </div>
  );
};

Ch1_S1_MultiSegment.metadata = {
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
};
```

### Using Video Player

```typescript
import { VideoPlayer } from '@framework/components/VideoPlayer';

// Inside a slide component:
<VideoPlayer
  videoPath="/videos/your-demo-name/demo.mp4"
  playing={segment > 0}
/>
```

### Shared Utilities

Use shared components and utilities from `src/framework/slides/` (also available via `@framework` alias):
- `SlideStyles.ts` - Common styling patterns
- `AnimationVariants.ts` - Framer Motion configs
- `SlideLayouts.tsx` - Layout components (SlideContainer, ContentCard, etc.)
- `SlideIcons.tsx` - Icon components (ArrowDown, ArrowRight, etc.)

## Related Documentation

- **[Demo Documentation Structure](DEMO_DOCUMENTATION_STRUCTURE.md)** - Documentation structure and philosophy
- **[TTS Guide](TTS_GUIDE.md)** - Audio generation system
- **[Architecture](ARCHITECTURE.md)** - Overall project architecture
- **[Components](COMPONENTS.md)** - Shared component documentation
- **[Timing System](TIMING_SYSTEM.md)** - Timing configuration details
