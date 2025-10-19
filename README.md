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

### Chapter Files & Slide Structure

The presentation includes narrated subtitle files organized in chapter-specific folders under [`highlights_demo/chapters/`](highlights_demo/chapters/).

#### Directory Structure
```
highlights_demo/chapters/
├── c2/                    # Chapter 2: Team Collaboration
│   └── s1_team_collaboration.srt
├── c5/                    # Chapter 5: COGS Challenge
│   ├── s1_challenge_framing.srt
│   ├── s2_four_prompts.srt
│   ├── s3_gpu_requirements.srt
│   ├── s4_latency_complexity.srt
│   └── s5_need_reduction.srt
├── c6/                    # Chapter 6: Optimization Solution
│   ├── s1_unified_convergence.srt
│   ├── s2_unified_flow.srt
│   ├── s3_single_invocation.srt
│   ├── s4_token_optimization.srt
│   └── s5_model_tuning.srt
└── c7/                    # Chapter 7: Business Impact
    ├── s1_call_reduction.srt
    ├── s2_gpu_reduction.srt
    ├── s3_cost_curve.srt
    ├── s4_quality_comparison.srt
    └── s5_path_to_ga.srt
```

#### File Naming Convention
- **Folder**: `cX/` where X is the chapter number
- **File**: `sY_description.srt` where Y is the slide number within that chapter
- Each file represents one slide in the presentation
- Each slide may contain multiple segments (utterances) with timing information

#### Slide File Format
Each slide file includes:
1. **React Component Reference** (comment lines at top)
   ```
   # React Component: Ch5_S1_ChallengeFraming
   # Location: react_cogs_demo/src/slides/AnimatedSlides.tsx:52
   ```
2. **Segment entries** with visual descriptions and narration:
   ```
   1 - Visual description
   00:00:00,000 --> 00:00:04,000
   Narration text for this segment
   ```

Each segment includes:
- **Segment number and visual description** - What appears on screen during this utterance
- **Timing information** - Start and end timestamps in SRT format
- **Narration text** - The spoken content for this segment

#### Current Chapters

**Chapter 2: Team Collaboration**
- [`s1_team_collaboration.srt`](highlights_demo/chapters/c2/s1_team_collaboration.srt) - 8 segments showing team logos (ODSP, MSAI-Hive, Clipchamp, Loop, BizChat, Teams)

**Chapter 5: COGS Challenge** (5 slides)
- [`s1_challenge_framing.srt`](highlights_demo/chapters/c5/s1_challenge_framing.srt) - Cost efficiency critical for scale
- [`s2_four_prompts.srt`](highlights_demo/chapters/c5/s2_four_prompts.srt) - Four LLM calls visualization
- [`s3_gpu_requirements.srt`](highlights_demo/chapters/c5/s3_gpu_requirements.srt) - GPU requirements (~600)
- [`s4_latency_complexity.srt`](highlights_demo/chapters/c5/s4_latency_complexity.srt) - Latency and complexity impact
- [`s5_need_reduction.srt`](highlights_demo/chapters/c5/s5_need_reduction.srt) - Need for dramatic cost reduction

**Chapter 6: Optimization Solution** (5 slides)
- [`s1_unified_convergence.srt`](highlights_demo/chapters/c6/s1_unified_convergence.srt) - Four prompts collapse into one
- [`s2_unified_flow.srt`](highlights_demo/chapters/c6/s2_unified_flow.srt) - Algorithm preserved as reasoning chain
- [`s3_single_invocation.srt`](highlights_demo/chapters/c6/s3_single_invocation.srt) - Single invocation replaces four calls
- [`s4_token_optimization.srt`](highlights_demo/chapters/c6/s4_token_optimization.srt) - 60% input token reduction
- [`s5_model_tuning.srt`](highlights_demo/chapters/c6/s5_model_tuning.srt) - Model tuning for slimmer schema

**Chapter 7: Business Impact** (5 slides)
- [`s1_call_reduction.srt`](highlights_demo/chapters/c7/s1_call_reduction.srt) - 75% call reduction + 60% token reduction
- [`s2_gpu_reduction.srt`](highlights_demo/chapters/c7/s2_gpu_reduction.srt) - GPU reduction (600→200)
- [`s3_cost_curve.srt`](highlights_demo/chapters/c7/s3_cost_curve.srt) - 70% COGS reduction curve
- [`s4_quality_comparison.srt`](highlights_demo/chapters/c7/s4_quality_comparison.srt) - Quality metrics comparison
- [`s5_path_to_ga.srt`](highlights_demo/chapters/c7/s5_path_to_ga.srt) - Enables preview and GA rollout

**Other Chapters** (Legacy SRT format - to be migrated):
- **Chapter 1**: Product introduction (8 captions)
- **Chapter 3**: Generation workflow (6 captions)
- **Chapter 4**: Highlight types and storage (5 captions)
- **Chapter 8**: User reception (4 captions)
- **Chapter 9**: Testimonials and future (7 captions)