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
- [ ] Register demo in `DemoRegistry.ts`
- [ ] Generate TTS audio
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
import { DemoMetadata } from '../types';

export const metadata: DemoMetadata = {
  id: 'your-demo-name',
  title: 'Your Demo Title',
  description: 'Brief description of what this demo presents',
  thumbnail: '/images/your-demo-name/thumbnail.jpeg',
  tags: ['category1', 'category2'],
  duration: 180  // Optional: duration in seconds
};
```

### Step 3: Create Demo Configuration

Create `src/demos/your-demo-name/index.ts`:

```typescript
import { DemoConfig } from '../types';
import { metadata } from './metadata';

const demoConfig: DemoConfig = {
  id: 'your-demo-name',
  metadata,
  getSlides: async () => {
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  }
};

export default demoConfig;
```

**Note**: Always use `export default` for demo configurations to maintain consistency across all demos. The script tools (TTS generation, duration calculation) expect default exports.

### Step 4: Create Slide Chapters

Create `src/demos/your-demo-name/slides/chapters/Chapter0.tsx`:

```typescript
import { SlideMetadata } from '../../../../../slides/SlideMetadata';

export const Ch0_S1_Welcome: SlideMetadata = {
  chapter: 0,
  slide: 1,
  title: 'Welcome',
  segments: [
    {
      number: 1,
      id: 'intro',
      description: 'Welcome message',
      audioPath: '/audio/your-demo-name/c0/s1_segment_01_intro.wav',
      narrationText: 'Welcome to our presentation.'
    }
  ],
  component: ({ segment }) => (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <h1 style={{ color: 'white', fontSize: '4rem' }}>
        Welcome
      </h1>
    </div>
  )
};
```

### Step 5: Create Slides Registry

Create `src/demos/your-demo-name/slides/SlidesRegistry.ts`:

```typescript
import { SlideMetadata } from '../../../../slides/SlideMetadata';
import { Ch0_S1_Welcome } from './chapters/Chapter0';

export const allSlides: SlideMetadata[] = [
  Ch0_S1_Welcome,
  // Add more slides here
];
```

### Step 6: Register Demo
### Step 6: Register Demo

Update `src/demos/DemoRegistry.ts`:

```typescript
import yourDemo from './your-demo-name';
import { metadata as yourMetadata } from './your-demo-name/metadata';

// Add to registerDemo calls
registerDemo({
  id: yourDemo.id,
  metadata: yourMetadata,
  loadConfig: async () => yourDemo
});
```

**Note**: Import the demo config using default import (no curly braces) since we're using `export default` in the demo's `index.ts`.
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

### Step 9: Configure Timing (Optional)

Customize presentation timing delays if defaults aren't suitable:
**Add to demo config** (`src/demos/{demo-id}/index.ts`):
```typescript
import { TimingConfig } from '../timing/types';

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
```

**Generate duration info**:
```bash
npm run tts:duration -- --demo {demo-id}
```

Copy the generated `durationInfo` object to your metadata file (`src/demos/{demo-id}/metadata.ts`).

See [`docs/timing-system/EXAMPLES.md`](../react_cogs_demo/docs/timing-system/EXAMPLES.md) for timing patterns.

### Step 10: Test Your Demo

```bash
npm run dev
```

Navigate to the demo selection screen and select your new demo.

## Implementation Tips

### Multi-Segment Slides

For slides with progressive reveals, use multiple segments:

```typescript
export const Ch1_S1_MultiSegment: SlideMetadata = {
  chapter: 1,
  slide: 1,
  title: 'Multi-segment Example',
  segments: [
    {
      number: 1,
      id: 'intro',
      description: 'First part',
      audioPath: '/audio/your-demo-name/c1/s1_segment_01_intro.wav',
      narrationText: 'First narration.'
    },
    {
      number: 2,
      id: 'detail',
      description: 'Second part',
      audioPath: '/audio/your-demo-name/c1/s1_segment_02_detail.wav',
      narrationText: 'Second narration.'
    }
  ],
  component: ({ segment }) => (
    <div>
      {segment >= 0 && <h1>First Part</h1>}
      {segment >= 1 && <p>Second Part</p>}
    </div>
  )
};
```

### Using Video Player

```typescript
import { VideoPlayer } from '../../../../../components/VideoPlayer';

component: ({ segment }) => (
  <VideoPlayer
    videoPath="/videos/your-demo-name/demo.mp4"
    playing={segment > 0}
  />
)
```

### Shared Utilities

Use shared components and utilities from `src/slides/`:
- `SlideStyles.ts` - Common styling patterns
- `AnimationVariants.ts` - Framer Motion configs
- `SlideLayouts.tsx` - Layout components
- `SlideIcons.tsx` - Icon components

## Related Documentation

- **[Demo Documentation Structure](DEMO_DOCUMENTATION_STRUCTURE.md)** - Documentation structure and philosophy
- **[TTS Guide](TTS_GUIDE.md)** - Audio generation system
- **[Architecture](ARCHITECTURE.md)** - Overall project architecture
- **[Components](COMPONENTS.md)** - Shared component documentation