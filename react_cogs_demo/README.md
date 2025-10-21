# React Multi-Demo Presentation System

A flexible React-based presentation system supporting multiple demos with lazy loading, narrated playback, and TTS audio generation.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the demo selection screen.

## Documentation

- **[Architecture Guide](../docs/ARCHITECTURE.md)** - Multi-demo system architecture and design
- **[Adding Demos](../docs/ADDING_DEMOS.md)** - Step-by-step guide to create new demos
- **[TTS Guide](../docs/TTS_GUIDE.md)** - Text-to-speech audio generation workflow
- **[Component Reference](../docs/COMPONENTS.md)** - Core components and utilities
- **[Troubleshooting](../docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Meeting Highlights Demo](../docs/demos/meeting-highlights/meeting-highlights.md)** - Detailed information about the Meeting Highlights presentation

## Project Structure

```
react_cogs_demo/
├── src/
│   ├── demos/                      # Demo presentations
│   │   ├── DemoRegistry.ts         # Central demo registration
│   │   ├── meeting-highlights/     # Meeting Highlights demo
│   │   ├── example-demo-1/         # Example demo 1
│   │   └── example-demo-2/         # Example demo 2
│   ├── components/                 # Shared UI components
│   ├── slides/                     # Shared slide utilities
│   └── contexts/                   # React contexts
├── public/
│   ├── audio/{demo-id}/            # TTS audio files per demo
│   ├── images/{demo-id}/           # Demo images
│   └── videos/{demo-id}/           # Demo videos
└── scripts/                        # TTS generation scripts
```

## Common Commands

```bash
# Development
npm run dev                         # Start dev server with cache check
npm run dev:skip-cache              # Start without cache check
npm run build                       # Build for production
npm run preview                     # Preview production build

# TTS Audio Generation
npm run tts:generate                # Generate all demos
npm run tts:generate -- --demo meeting-highlights  # Specific demo
npm run tts:duration                # Calculate audio durations

# Type Checking
npm run type-check                  # Run TypeScript compiler
```

## Presentation Modes

- **Narrated Mode**: Auto-advances with audio playback
- **Manual Mode**: Navigate with arrow keys, no audio
- **Manual + Audio**: Navigate manually with audio playback

## Key Features

- **Multi-demo support** - Unlimited demos with lazy loading
- **Smart TTS caching** - Only regenerates changed narration
- **Flexible playback** - Three presentation modes
- **Demo independence** - Each demo has its own assets
- **Shared infrastructure** - Reusable components and utilities

## Tech Stack

- React 18 + TypeScript
- Vite (dev server & build)
- Framer Motion (animations)
- Python Flask TTS server (VibeVoice)

## Contributing

When adding features:
1. Update relevant documentation in `docs/`
2. Update root `Agents.md` with implementation details
3. Follow existing patterns for consistency
4. Test with multiple demos