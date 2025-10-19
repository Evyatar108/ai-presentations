# Highlights COGS Reduction

This repository contains work related to meeting highlights and COGS (Cost of Goods Sold) reduction efforts.

## Directory Structure

```
cogs reduction/
├── README.md
├── highlights_demo/
│   ├── audio/
│   ├── chapters/          # Subtitle files for narrated presentation
│   ├── images/logos/      # Product logos (Teams, BizChat, Loop, etc.)
│   └── context/          # Documentation and implementation files
│       ├── extractive vs abstractive highlights.md
│       ├── v2 goal and efforts.md
│       ├── what is meeting highlights.md
│       ├── v1/
│       │   └── HighlightsPromptMaper.py
│       └── v2/
│           ├── prompt.md
│           ├── prompt_output_schema.md
│           └── TRANSCRIPT_TABLE_SCHEMA.md
├── react_cogs_demo/      # Interactive React presentation
└── tts/                  # Text-to-speech generation system
```
## Files Overview

### Highlights Demo Directory (`highlights_demo/`)
Contains presentation materials and supporting documentation:
- **audio/** - Audio files for narrated presentation
- **chapters/** - Subtitle files (SRT format) for each presentation chapter
- **images/logos/** - Product logos (Teams, BizChat, Loop, Clipchamp, ODSP, MSAI Hive)
- **context/** - Technical documentation and implementation files

### Context Subdirectory (`highlights_demo/context/`)
- **team collaboration.md** - Overview of the 6+ teams collaborating on Meeting Highlights (ODSP, MSAI-Hive, Clipchamp, Loop, BizChat, Teams)
- **architecture comprehensive.md** - Comprehensive component reference with all services, ICM teams, DRIs, and detailed data flow
- **extractive vs abstractive highlights.md** - Documentation comparing extractive and abstractive highlight approaches
- **v2 goal and efforts.md** - Goals and efforts for version 2
- **what is meeting highlights.md** - Overview of meeting highlights functionality
- **how can users try meeting highlights.md** - Instructions for accessing Meeting Highlights via BizChat (includes CIQ usage)
- **v1/** - Original implementation
  - `HighlightsPromptMaper.py` - Python script for highlights prompt mapping (version 1)
- **v2/** - Current implementation documentation
  - `prompt.md` - Prompt documentation
  - `prompt_output_schema.md` - Output schema specification
  - `TRANSCRIPT_TABLE_SCHEMA.md` - Transcript table schema definition
## COGS Reduction Demo Expansion

This project now includes an interactive React + Vite demo illustrating how meeting highlights costs were reduced while improving output quality.

### Key Improvements
- LLM calls: 4 → 1 (75% reduction - single unified prompt preserves full algorithmic flow segment→narrate→extract→rank→compose)
- Input tokens: ~60% reduction (switched from verbose JSON to compact schema, eliminated pre-computed candidate ranges)
- Estimated GPU capacity: ~600 → ~200 (67% reduction - simplified concurrency, fewer orchestration turnarounds, lower token volume)
- COGS: Estimated 70%+ reduction enabling private preview + GA path
- Quality: Internal reviewers strongly prefer unified prompt highlights vs multi-prompt V1 output (higher cohesion, less redundancy)

### V1 Four-Prompt Pipeline
1. Abstractive Topics [`highlights_abstractives()`](highlights_demo/context/v1/HighlightsPromptMaper.py:13)
2. Extractive Selection [`highlights_extractives()`](highlights_demo/context/v1/HighlightsPromptMaper.py:140)
3. Quality Ranking [`highlights_extractive_ranking()`](highlights_demo/context/v1/HighlightsPromptMaper.py:230)
4. Final Narrative Synthesis [`highlights_final()`](highlights_demo/context/v1/HighlightsPromptMaper.py:318)
Each step invoked the LLM separately, adding latency padding, retry surface, token overhead, and GPU reservation pressure.

### Unified V2 Prompt
All semantic transforms executed in one structured pass (segment → narrations → verbatim extraction → quality ranking → narrative composition). Removes intermediate JSON stitching and orchestration overhead while improving narrative flow.

### Demo Run Instructions
```bash
# Navigate to demo directory
cd react_cogs_demo

# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open http://localhost:5173 to view the demo.
### Demo Features

**Interactive Presentation**
- Narrated slides covering the COGS reduction journey from product intro through business impact
- Smooth crossfade transitions between slides
- Keyboard navigation: Arrow keys, Space, or number keys
- Visual progress indicators with clickable dots
- Slide counter showing current position

**Animated Visualizations**
- **Ch1**: Comprehensive product introduction explaining Meeting Highlights (what it is, how it works, where to access it)
- **Ch5_U1**: Challenge framing with initial metrics (4 calls, ~600 GPUs, high tokens)
- **Ch5_U2**: Four-prompt pipeline visualization showing the original 4-step approach
- **Ch6_U1**: Unified convergence animation with pulsing glow and success rate metrics
- **Ch7_U1**: Dual visualization showing both 75% LLM call reduction AND 60% token reduction side-by-side
- **Ch7_U2**: GPU rack visualization with fade-out animation (~600 → ~200 GPUs)
- **Ch7_U3**: Cost impact curve showing estimated 70% COGS reduction
- **Ch7_U4**: Quality comparison metrics
- **Ch8**: User satisfaction metrics (80% extremely useful, 96% likely to reuse)
- **Ch9**: User testimonials and future improvements
- **Slide 32**: Implementation roadmap

**Accessibility**
- Reduced-motion toggle (top-left corner) respects `prefers-reduced-motion`
- All animations gracefully degrade to instant transitions when reduced motion is enabled
- ARIA labels on all interactive controls
- Keyboard-first navigation design

### Demo Source Structure
- [`index.html`](react_cogs_demo/index.html) - Entry point
- [`src/main.tsx`](react_cogs_demo/src/main.tsx) - React initialization
- [`src/App.tsx`](react_cogs_demo/src/App.tsx) - Main app with slide registry
- [`src/components/SlidePlayer.tsx`](react_cogs_demo/src/components/SlidePlayer.tsx) - Slide navigation & transitions
- [`src/slides/AnimatedSlides.tsx`](react_cogs_demo/src/slides/AnimatedSlides.tsx) - Framer Motion animated slides
- [`src/components/CoreComponents.tsx`](react_cogs_demo/src/components/CoreComponents.tsx) - Reusable UI components
- [`src/components/ImpactComponents.tsx`](react_cogs_demo/src/components/ImpactComponents.tsx) - Impact visualization slides
- [`src/accessibility/ReducedMotion.tsx`](react_cogs_demo/src/accessibility/ReducedMotion.tsx) - Motion preferences context

### Technology Stack
- **React 18** + **TypeScript** for type-safe UI components
- **Vite** for fast development and optimized builds
- **Framer Motion** for sophisticated animations and transitions
- **CSS-in-JS** inline styles for component-scoped styling

### Script Reference
### Planning & Script Reference
Planning documents and scripts are available in the project for reference during development.

### Architecture Documentation
Detailed technical decisions and component structure: [`ARCHITECTURE.md`](react_cogs_demo/ARCHITECTURE.md)

### Summary
The consolidation from 4 calls to 1, combined with 60% input token reduction, reduced projected GPU needs (~600 → ~200) and is estimated to cut COGS by over 70%. This produced higher-quality highlight videos (detailed vs generic, natural vs robotic), directly enabling scaled rollout within approved capacity constraints. Internal reviewers strongly prefer the unified prompt output.

### Chapter Files
The presentation includes narrated subtitle files in the `chapters/` directory:
- Chapter 1: Product introduction (8 captions)
- Chapter 2: Team collaboration (4 captions)
- Chapter 3: Generation workflow (6 captions)
- Chapter 4: Highlight types and storage (5 captions)
- Chapter 5: COGS challenge (5 captions)
- Chapter 6: Optimization solution (5 captions)
- Chapter 7: Business impact (5 captions)
- Chapter 8: User reception (4 captions)
- Chapter 9: Testimonials and future (7 captions)