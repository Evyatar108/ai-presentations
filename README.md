# Presentation Framework

Multi-demo presentation system built with React + TypeScript + Vite. Each demo is a narrated, animated slideshow with TTS-generated audio, progressive segment reveals, and multiple playback modes.

## Quick Start

```bash
cd presentation-app
npm install
npm run dev        # http://localhost:5173
```

## Demos

| Demo | Description |
|------|-------------|
| **meeting-highlights** | Meeting Highlights COGS Reduction — product overview, team collaboration, optimization (4→1 LLM calls), 70%+ cost savings, business impact |
| **highlights-deep-dive** | Technical deep-dive into collapsing a 4-call GPT-4 pipeline into a single unified prompt |
| **example-demo-1** | Placeholder demo showcasing the multi-demo architecture |
| **example-demo-2** | Showcases layout components, named segments, and timing overrides |

New demos are auto-discovered — any folder in `src/demos/` with `metadata.ts` and `index.ts` is automatically registered.

Scaffold a new demo: `.\scripts\new-demo.ps1 -DemoId "my-demo" [-DemoTitle "My Demo"]`

## Playback Modes

- **Narrated** — auto-advances with synchronized TTS audio
- **Manual Silent** — arrow key navigation, no audio
- **Manual + Audio** — arrow key navigation with audio playback per slide

## Project Structure

```
├── presentation-app/       # React + Vite application
│   ├── src/
│   │   ├── framework/      # Reusable presentation engine
│   │   ├── demos/          # Demo content (auto-discovered)
│   │   └── project.config.ts
│   ├── public/
│   │   ├── audio/{demo-id}/   # TTS audio per demo
│   │   ├── images/{demo-id}/  # Images per demo
│   │   ├── videos/{demo-id}/  # Videos per demo
│   │   └── narration/{demo-id}/  # External narration JSON
│   └── scripts/            # TTS generation, duration calc, cache check
├── tts/                    # Python TTS server (VibeVoice + Qwen3-TTS)
├── scripts/                # new-demo.ps1 scaffolding
└── docs/                   # Detailed documentation
```

### Framework (`src/framework/`)

Reusable presentation engine — copy this to start a new project.

- **components/** — DemoPlayer, NarratedController, SlidePlayer, VideoPlayer, MetricTile, error boundaries
- **slides/** — `defineSlide()` factory, layouts, styles, animation variants, icons
- **demos/** — DemoRegistry (auto-discovery via `import.meta.glob`), timing system
- **theme/** — ThemeProvider, `useTheme()` hook, customizable tokens
- **hooks/** — TTS regeneration, notifications, runtime timer, API health, focus trap
- **accessibility/** — `useReducedMotion()`, reduced-motion toggle respecting `prefers-reduced-motion`
- **index.ts** — barrel export with ~120 explicit named exports

### Demo Structure

Each demo lives in `src/demos/{demo-id}/`:

```
{demo-id}/
├── metadata.ts             # Title, description, tags, durationInfo
├── index.ts                # DemoConfig with lazy getSlides()
└── slides/
    ├── SlidesRegistry.ts   # Ordered array of slides
    └── chapters/
        └── Chapter{N}.tsx  # Slide definitions using defineSlide()
```

## Commands

All commands run from `presentation-app/`:

```bash
# Development
npm run dev              # Dev server (auto-checks TTS cache + durations)
npm run dev:full         # Dev server + Express narration API (port 3001)
npm run build            # Production build
npm run preview          # Preview production build

# Quality
npm run lint             # ESLint
npm run lint:fix         # ESLint auto-fix
npm run type-check       # TypeScript type checking
npm run test             # Run tests (vitest)
npm run test:watch       # Tests in watch mode

# TTS
npm run tts:generate -- --demo {id}   # Generate TTS audio
npm run tts:duration -- --demo {id}   # Calculate audio durations
npm run check-narration               # Validate narration structure
```

## TTS Audio Generation

Two TTS engines are supported (same HTTP API, interchangeable):

| Engine | Command | Notes |
|--------|---------|-------|
| **VibeVoice** | `python tts/server.py --voice-sample voice.wav` | Voice cloning from sample |
| **Qwen3-TTS** | `python tts/server_qwen.py --speaker Vivian` | Preset premium speakers, no sample needed |

Both run on port 5000 by default. See [`tts/README.md`](tts/README.md) for setup details.

The generation system features smart caching (`.tts-narration-cache.json`), batch processing, automatic cleanup of orphaned files, and a pre-flight check that runs before `npm run dev`.

## Tech Stack

- **React 18** + **TypeScript** — type-safe UI components
- **Vite 5** — dev server and builds
- **Framer Motion** — animations and transitions
- **Vitest** — testing (126 tests across 14 files)
- **ReactFlow** — flow diagram visualizations

## Documentation

Detailed docs in [`docs/`](docs/):

| Doc | Topic |
|-----|-------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture and design decisions |
| [ADDING_DEMOS.md](docs/ADDING_DEMOS.md) | How to create new demos |
| [FRAMEWORK.md](docs/FRAMEWORK.md) | Framework API reference |
| [COMPONENTS.md](docs/COMPONENTS.md) | Component documentation |
| [THEMING.md](docs/THEMING.md) | Theme system and customization |
| [TIMING_SYSTEM.md](docs/TIMING_SYSTEM.md) | Three-level timing hierarchy |
| [NARRATION_SYSTEM_GUIDE.md](docs/NARRATION_SYSTEM_GUIDE.md) | Inline and external narration |
| [TTS_GUIDE.md](docs/TTS_GUIDE.md) | TTS generation workflow |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common issues and solutions |

Per-demo documentation lives in `docs/demos/{demo-id}/`.
