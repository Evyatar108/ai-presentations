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
- **[Timing System](../docs/TIMING_SYSTEM.md)** - Duration tracking and timing configuration
- **[Component Reference](../docs/COMPONENTS.md)** - Core components and utilities
- **[Troubleshooting](../docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Meeting Highlights Demo](../docs/demos/meeting-highlights/meeting-highlights.md)** - Detailed information about the Meeting Highlights presentation

## Project Structure

```
presentation-app/
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
npm run dev                         # Start dev server (checks cache + calculates durations)
npm run build                       # Build for production
npm run preview                     # Preview production build

# TTS Audio Generation
npm run tts:generate                # Generate all demos
npm run tts:generate -- --demo meeting-highlights  # Specific demo
npm run tts:duration                # Manually calculate durations (auto-runs on dev start)

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

## Narration System

The narration externalization system allows editing presentation narration through JSON files without touching React code.

### Architecture

- **Narration JSON**: `public/narration/{demo-id}/narration.json` - Single source of truth for all narration text
- **Narration Cache**: `public/narration/{demo-id}/narration-cache.json` - SHA-256 hashes for change detection
- **Backend API**: Express server on port 3001 for file persistence
- **Frontend Integration**: Browser-based editing with save functionality
- **TTS Integration**: Audio regeneration from JSON narration

### Quick Start

```bash
# Start development with narration editing
npm run dev:full

# Edit narration via browser UI
# 1. Open Meeting Highlights demo
# 2. Switch to Manual mode
# 3. Click Edit button (✏️) on any segment
# 4. Modify text and click "Save"
# 5. Changes persist to narration.json

# Or edit narration.json directly
code public/narration/meeting-highlights/narration.json

# Check for changes
npm run check-narration

# Regenerate TTS audio from JSON
npm run tts:from-json
```

### NPM Scripts

```bash
npm run extract-narration      # Extract narration from React components to JSON
npm run check-narration        # Detect narration changes via hash comparison
npm run narration-api          # Start backend API server (port 3001)
npm run dev:full              # Start both dev server and narration API
npm run tts:from-json         # Generate TTS audio from narration JSON exclusively
```

### Features

- ✅ **Browser-Based Editing** - Edit narration directly in presentation UI
- ✅ **Persistent File Storage** - Changes saved to disk and version controlled
- ✅ **Automatic Change Detection** - Hash-based detection triggers regeneration
- ✅ **TTS Audio Regeneration** - Generate audio from updated narration
- ✅ **Version Control Friendly** - Track narration changes separately from code
- ✅ **Collaborative Editing** - Multiple people can edit narration files

### Documentation

- **[User Guide](docs/NARRATION_SYSTEM_GUIDE.md)** - Complete usage documentation
- **[API Reference](docs/NARRATION_API_REFERENCE.md)** - Backend API endpoints
- **[Troubleshooting](docs/NARRATION_TROUBLESHOOTING.md)** - Common issues and solutions
- **[Implementation Plan](docs/NARRATION_EXTERNALIZATION_PLAN.md)** - System architecture

### Phase Reports

- [Phase 5: Frontend Integration](docs/PHASE_5_IMPLEMENTATION_REPORT.md)
- [Phase 6: TTS Integration](docs/PHASE_6_TTS_INTEGRATION.md)
- [Phase 7: Migration](docs/PHASE_7_MIGRATION_REPORT.md)
- [Phase 8: Testing](docs/PHASE_8_TEST_RESULTS.md)

## Tech Stack

- React 18 + TypeScript
- Vite (dev server & build)
- Framer Motion (animations)
- Python Flask TTS server (VibeVoice)
- Express.js (narration API backend)

## Contributing

When adding features:
1. Update relevant documentation in `docs/`
2. Update root `Agents.md` with implementation details
3. Follow existing patterns for consistency
4. Test with multiple demos