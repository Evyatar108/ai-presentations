# Highlights COGS Reduction

This repository contains work related to meeting highlights and COGS (Cost of Goods Sold) reduction efforts.

## Directory Structure

```
cogs reduction/
├── README.md
├── extractive vs abstractive highlights.md
├── v2 goal and efforts.md
├── what is meeting highlights.md
├── demo/
│   ├── 1_intro.txt
│   ├── 2_generation.txt
│   ├── 3_teams.txt
│   └── 4_feedback.txt
├── v1/
│   └── HighlightsPromptMaper.py
└── v2/
    ├── prompt.md
    ├── prompt_output_schema.md
    └── TRANSCRIPT_TABLE_SCHEMA.md
```

## Files Overview

### Root Level Documentation
- **extractive vs abstractive highlights.md** - Documentation comparing extractive and abstractive highlight approaches
- **v2 goal and efforts.md** - Goals and efforts for version 2
- **what is meeting highlights.md** - Overview of meeting highlights functionality

### Demo Directory
Contains demonstration files:
- `1_intro.txt` - Introduction demo
- `2_generation.txt` - Generation demo
- `3_teams.txt` - Teams integration demo
- `4_feedback.txt` - Feedback demo

### V1 Directory
- `HighlightsPromptMaper.py` - Python script for highlights prompt mapping (version 1)

### V2 Directory
Contains version 2 documentation:
- `prompt.md` - Prompt documentation
- `prompt_output_schema.md` - Output schema specification
- `TRANSCRIPT_TABLE_SCHEMA.md` - Transcript table schema definition
## COGS Reduction Demo Expansion

This project now includes an interactive React + Vite demo illustrating how meeting highlights costs were reduced while improving output quality.

### Key Improvements
- LLM calls: 4 → 1 (single unified prompt preserves full algorithmic flow segment→narrate→extract→rank→compose)
- Estimated GPU capacity: ~600 → ~200 (simplified concurrency, fewer orchestration turnarounds, lower token volume)
- COGS: 50%+ reduction enabling private preview + GA path
- Quality: Internal reviewers strongly prefer unified prompt highlights vs multi-prompt V1 output (higher cohesion, less redundancy)

### V1 Four-Prompt Pipeline
1. Abstractive Topics [`highlights_abstractives()`](v1/HighlightsPromptMaper.py:13)  
2. Extractive Selection [`highlights_extractives()`](v1/HighlightsPromptMaper.py:140)  
3. Quality Ranking [`highlights_extractive_ranking()`](v1/HighlightsPromptMaper.py:230)  
4. Final Narrative Synthesis [`highlights_final()`](v1/HighlightsPromptMaper.py:318)  

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
- 8 slides covering the COGS reduction journey
- Smooth crossfade transitions between slides
- Keyboard navigation: Arrow keys, Space, or number keys (1-9)
- Visual progress indicators with clickable dots
- Slide counter showing current position

**Animated Visualizations**
- **Slide 19**: Challenge framing with staggered metric tiles and animated arrow
- **Slide 20**: Four-prompt pipeline chain with strikethrough "4" showing deprecation
- **Slide 25**: Unified convergence with pulsing glow, converging energy lines, and success rate metrics
- **Slide 28**: Circular dial animation showing 75% LLM call reduction
- **Slide 29**: GPU rack visualization with fade-out animation (~600 → ~200 GPUs)
- **Slide 30**: Cost impact curve with updated orchestration metrics
- **Slide 31**: Quality comparison with detailed/natural narrative improvements
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
- **Visual Plan**: [`cogs_visuals_plan.md`](demo/cogs_visuals_plan.md) - Complete storyboard with animation specifications
- **Content Plan**: [`cogs_reduction_plan.md`](demo/cogs_reduction_plan.md) - Slide-by-slide content strategy
- **Demo Script**: [`2b_cogs_reduction.txt`](demo/2b_cogs_reduction.txt) - Expanded script for slides 19–32

### Architecture Documentation
Detailed technical decisions and component structure: [`ARCHITECTURE.md`](react_cogs_demo/ARCHITECTURE.md)

### Summary
The consolidation from 4 calls to 1 reduced projected GPU needs (~600 → ~200) and produced higher-quality highlight videos (detailed vs generic, natural vs robotic), directly enabling scaled rollout within approved capacity constraints. Internal reviewers strongly prefer the unified prompt output.