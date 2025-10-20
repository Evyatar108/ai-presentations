# React Multi-Demo Presentation System

A flexible React-based presentation system supporting multiple demos with lazy loading, narrated playback, and TTS audio generation.

## Overview

This project provides a framework for creating and displaying multiple presentation demos. Each demo can have its own slides, styling, assets, and configuration while sharing common components and infrastructure.

## Project Structure

```
react_cogs_demo/
├── src/
│   ├── demos/                      # Demo presentations
│   │   ├── types.ts                # Demo type definitions
│   │   ├── DemoRegistry.ts         # Central demo registration
│   │   ├── meeting-highlights/     # Meeting Highlights demo
│   │   │   ├── metadata.ts         # Demo metadata
│   │   │   ├── index.ts            # Demo configuration
│   │   │   ├── README.md           # Demo documentation
│   │   │   └── slides/
│   │   │       ├── SlidesRegistry.ts
│   │   │       └── chapters/       # Slide definitions by chapter
│   │   ├── example-demo-1/         # Example placeholder demo 1
│   │   └── example-demo-2/         # Example placeholder demo 2
│   ├── components/                 # Shared UI components
│   │   ├── WelcomeScreen.tsx       # Demo selection screen
│   │   ├── DemoPlayer.tsx          # Demo playback container
│   │   ├── SlidePlayer.tsx         # Individual slide renderer
│   │   ├── NarratedController.tsx  # Audio-synced playback
│   │   ├── VideoPlayer.tsx         # Video embed component
│   │   └── CoreComponents.tsx      # Reusable UI elements
│   ├── slides/                     # Shared slide utilities
│   │   ├── SlideMetadata.ts        # Slide type definitions
│   │   ├── SlideStyles.ts          # Shared styling
│   │   ├── AnimationVariants.ts    # Framer Motion configs
│   │   ├── SlideLayouts.tsx        # Layout components
│   │   └── SlideIcons.tsx          # Icon components
│   └── contexts/                   # React contexts
│       └── SegmentContext.tsx      # Multi-segment slide state
├── public/
│   ├── audio/                      # Generated TTS audio files
│   │   ├── meeting-highlights/     # Demo-specific audio
│   │   ├── example-demo-1/
│   │   └── example-demo-2/
│   ├── images/                     # Demo assets
│   │   ├── meeting-highlights/
│   │   ├── example-demo-1/
│   │   └── example-demo-2/
│   └── videos/                     # Demo videos
│       └── meeting-highlights/
├── scripts/                        # Build and generation scripts
│   ├── generate-tts.ts             # TTS audio generation (multi-demo)
│   ├── check-tts-cache.ts          # Pre-flight cache validation
│   └── calculate-durations.ts      # Audio duration analysis
└── tts/                            # Python TTS server (separate repo)
```

## Multi-Demo Architecture

### Demo Organization

Each demo is self-contained in its own directory under `src/demos/`:

- **metadata.ts**: Demo metadata (id, title, description, thumbnail, tags)
- **index.ts**: Demo configuration with lazy-loaded slides
- **slides/**: Slide definitions organized by chapter
- **README.md**: Demo-specific documentation

### Demo Registry

The `DemoRegistry` provides centralized demo management:

```typescript
// Accessing all demos
const allDemos = DemoRegistry.getAllMetadata();

// Loading a specific demo
const config = await DemoRegistry.loadDemoConfig('meeting-highlights');

// Get demo IDs
const ids = DemoRegistry.getDemoIds();
```

### Adding a New Demo

1. **Create demo directory**: `src/demos/your-demo-name/`

2. **Create metadata.ts**:
```typescript
import { DemoMetadata } from '../types';

export const metadata: DemoMetadata = {
  id: 'your-demo-name',
  title: 'Your Demo Title',
  description: 'Brief description',
  thumbnail: '/images/your-demo-name/thumbnail.jpeg',
  tags: ['tag1', 'tag2']
};
```

3. **Create index.ts**:
```typescript
import { DemoConfig } from '../types';
import { metadata } from './metadata';

export const demo: DemoConfig = {
  id: 'your-demo-name',
  metadata,
  defaultMode: 'narrated',
  getSlides: async () => {
    const { allSlides } = await import('./slides/SlidesRegistry');
    return allSlides;
  }
};
```

4. **Create slides**: Organize in `slides/chapters/ChapterN.tsx`

5. **Create SlidesRegistry**: `slides/SlidesRegistry.ts`

6. **Register demo** in `src/demos/DemoRegistry.ts`:
```typescript
import { demo as yourDemo } from './your-demo-name';
import { metadata as yourMetadata } from './your-demo-name/metadata';

registerDemo({
  id: yourDemo.id,
  metadata: yourMetadata,
  loadConfig: async () => yourDemo
});
```

7. **Add assets**:
   - Audio: `public/audio/your-demo-name/`
   - Images: `public/images/your-demo-name/`
   - Videos: `public/videos/your-demo-name/`

## Development

### Getting Started

```bash
# Install dependencies
npm install

# Start development server (includes TTS cache check)
npm run dev

# Start without cache check
npm run dev:skip-cache
```

### TTS Audio Generation

The system supports multi-demo TTS generation with smart caching.

#### Prerequisites

Start the Python TTS server:
```bash
cd tts
python server.py --voice-sample path/to/voice.wav
```

#### Generate Audio

```bash
# Generate audio for all demos
npm run tts:generate

# Generate for specific demo
npm run tts:generate -- --demo meeting-highlights

# Use smart caching (skip unchanged segments)
npm run tts:generate -- --skip-existing

# Combine options
npm run tts:generate -- --demo example-demo-1 --skip-existing
```

#### Calculate Durations

```bash
# Calculate durations for all demos
npm run tts:duration

# Calculate for specific demo
npm run tts:duration -- --demo meeting-highlights
```

### Cache Structure

The TTS cache (`.tts-narration-cache.json`) now supports multiple demos:

```json
{
  "meeting-highlights": {
    "c0/s1_segment_01_main.wav": {
      "narrationText": "Welcome to...",
      "generatedAt": "2025-01-20T..."
    }
  },
  "example-demo-1": {
    "c0/s1_segment_01_title.wav": {
      "narrationText": "Example...",
      "generatedAt": "2025-01-20T..."
    }
  }
}
```

## Presentation Modes

The player supports three modes:

- **Narrated Mode**: Auto-advances with audio playback
- **Manual Mode**: Navigate with arrow keys, no audio
- **Manual + Audio**: Navigate manually, plays audio for each slide

## Components

### Core Components

- **WelcomeScreen**: Demo selection interface
- **DemoPlayer**: Main demo playback container
- **SlidePlayer**: Renders individual slides
- **NarratedController**: Manages audio-synced playback
- **VideoPlayer**: Embeds and controls demo videos

### Shared Utilities

- **SlideStyles**: Common styling patterns
- **AnimationVariants**: Framer Motion animation configs
- **SlideLayouts**: Reusable layout components
- **SlideIcons**: Icon components

## Asset Management

### Audio Files

- Location: `public/audio/{demo-id}/c{chapter}/`
- Format: WAV files (24kHz mono)
- Naming: `s{slide}_segment_{number}_{id}.wav`
- Fallback: Silence for missing files

### Images

- Location: `public/images/{demo-id}/`
- Includes logos, thumbnails, screenshots
- Referenced via `/images/{demo-id}/filename`

### Videos

- Location: `public/videos/{demo-id}/`
- Format: MP4
- Integrated via VideoPlayer component

## Build and Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing

```bash
# Run tests (if configured)
npm test

# Type checking
npm run type-check
```

## Architecture Benefits

### Lazy Loading
- Demos load on-demand
- Faster initial load times
- Reduced bundle size

### Demo Independence
- Each demo has its own assets
- No cross-contamination
- Easy to add/remove demos

### Shared Infrastructure
- Common components reduce duplication
- Consistent UX across demos
- Centralized configuration

## Troubleshooting

### TTS Generation Issues

1. **Server not responding**: Ensure Python TTS server is running
2. **Cache conflicts**: Delete `.tts-narration-cache.json` and regenerate
3. **Missing audio**: Check `public/audio/{demo-id}/` directory structure

### Demo Not Appearing

1. Verify demo is registered in `DemoRegistry.ts`
2. Check `metadata.ts` has correct id
3. Ensure `slides/SlidesRegistry.ts` exports `allSlides`

### TypeScript Errors

Script TypeScript errors (process, Buffer, fs) are expected and resolve during compilation. These are Node.js types used in build scripts.

## Contributing

When adding features:

1. Update this README
2. Update `Agents.md` in root with implementation details
3. Follow existing patterns for consistency
4. Test with multiple demos

## License

[Your License]

## Contact

[Your Contact Info]