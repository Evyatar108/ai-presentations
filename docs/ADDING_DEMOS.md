# Adding a New Demo

This guide walks through creating a new presentation demo from scratch.

## Step 1: Create Demo Directory

Create a new directory under `src/demos/`:

```bash
mkdir -p src/demos/your-demo-name/slides/chapters
```

## Step 2: Create Metadata

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

## Step 3: Create Demo Configuration

Create `src/demos/your-demo-name/index.ts`:

```typescript
import { DemoConfig } from '../types';
import { metadata } from './metadata';

export const demo: DemoConfig = {
  id: 'your-demo-name',
  metadata,
  defaultMode: 'narrated',  // or 'manual' or 'manual-audio'
  getSlides: async () => {
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  }
};
```

## Step 4: Create Slide Chapters

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

## Step 5: Create Slides Registry

Create `src/demos/your-demo-name/slides/SlidesRegistry.ts`:

```typescript
import { SlideMetadata } from '../../../../slides/SlideMetadata';
import { Ch0_S1_Welcome } from './chapters/Chapter0';

export const allSlides: SlideMetadata[] = [
  Ch0_S1_Welcome,
  // Add more slides here
];
```

## Step 6: Register Demo

Update `src/demos/DemoRegistry.ts`:

```typescript
import { demo as yourDemo } from './your-demo-name';
import { metadata as yourMetadata } from './your-demo-name/metadata';

// Add to registerDemo calls
registerDemo({
  id: yourDemo.id,
  metadata: yourMetadata,
  loadConfig: async () => yourDemo
});
```

## Step 7: Add Assets

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

## Step 8: Create Demo README

Create `src/demos/your-demo-name/README.md`:

```markdown
# Your Demo Name

Description of the demo content and purpose.

## Structure

- Chapter 0: Introduction
- Chapter 1: Main content
- ...

## Duration

Approximately X minutes

## Assets

- Thumbnail: `/images/your-demo-name/thumbnail.jpeg`
- Audio: Generated via TTS
- Videos: (list any videos used)
```

## Step 9: Generate TTS Audio

Generate audio for your demo (see [TTS Guide](TTS_GUIDE.md)):

```bash
npm run tts:generate -- --demo your-demo-name
```

## Step 10: Test Your Demo

```bash
npm run dev
```

Navigate to the demo selection screen and select your new demo.

## Tips

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