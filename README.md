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

# Generate TTS audio files (requires Python TTS server running)
npm run tts:generate

# Calculate audio durations
npm run tts:duration
```

Open http://localhost:5173 to view the demo.

### TTS Audio Generation System

The presentation includes an automated TTS (Text-to-Speech) generation system for creating narration audio:

**Prerequisites:**
1. Python TTS server must be running (see [`tts/README.md`](tts/README.md))
2. Server configuration in `tts/server_config.json`

**Generate Audio Files:**
```bash
# Start Python TTS server (in tts/ directory)
cd tts
python server.py --voice-sample path/to/voice.wav

# Generate all audio files (in react_cogs_demo/ directory)
cd react_cogs_demo
npm run tts:generate
```

**Smart Caching System:**
- Tracks narration text changes in `.tts-narration-cache.json`
- Only regenerates audio when narration text changes
- Skips unchanged segments automatically
- Pre-flight check before `npm run dev` detects changes and prompts for regeneration
- **Automatic cleanup of unused audio files:**
  - Detects audio files no longer referenced in slides
  - Removes orphaned cache entries
  - Prompts before deletion during both generation and pre-flight check
  - Keeps audio directory clean and synchronized with slide content

**Features:**
- **Batch processing**: Generates 10 segments per batch for efficiency
- **Fallback audio**: Uses 1-second silence for missing files
- **Progress tracking**: Shows real-time generation progress
- **Duration calculation**: `npm run tts:duration` analyzes all audio files
- **Automatic cache updates**: Saves narration text + timestamps after generation

**File Organization:**
```
public/audio/
├── c0/ - c9/              # Chapter-based folders
│   └── sX_segment_YY_id.wav  # Slide X, segment YY, segment ID
└── silence-1s.mp3         # Fallback for missing files
```

### Demo Features

**Presentation Modes:**
1. **Narrated Mode** (▶ Narrated)
   - Auto-advances through slides with synchronized audio
   - Plays all audio segments sequentially
   - Ideal for hands-free viewing or recording

2. **Manual Mode** (⌨ Manual Silent)
   - Navigate slides with arrow keys
   - No audio playback
   - Best for quick review or exploration

3. **Manual + Audio** (⌨ Manual + Audio)
   - Navigate slides manually with arrow keys
   - Plays audio for each slide you visit
   - Optional auto-advance when audio ends
   - Prevents audio overlap with smart cleanup

**Navigation:**
- Arrow keys: Previous/Next slide
- Space: Next slide
- Number keys: Jump to slide
- Visual progress indicators with clickable dots
- Slide counter showing current position (Ch:S format)

**Animated Visualizations**
**Animated Visualizations:**
- **Ch0**: Blank intro slide
- **Ch1** (3 slides): Comprehensive product introduction
  - What is Meeting Highlights
  - How to access via BizChat
  - User value proposition
- **Ch2**: Team collaboration (8-segment progressive reveal with team logos)
- **Ch3**: Architecture overview
- **Ch4**: Highlight types (extractive vs abstractive)
- **Ch5** (5 slides): COGS Challenge
  - Challenge framing with initial metrics
  - Four-prompt pipeline visualization
  - GPU requirements (~600)
  - Latency and complexity impact
  - Need for reduction
- **Ch6** (5 slides): Optimization Solution
  - Unified convergence animation
  - Algorithm flow preservation
  - Single invocation benefit
  - 60% token optimization
  - Model tuning approach
- **Ch7** (5 slides): Business Impact
  - Dual visualization: 75% call + 60% token reduction
  - GPU reduction animation (600→200)
  - Cost curve showing 70% COGS reduction
  - Quality comparison metrics
  - Path to GA rollout
- **Ch8**: User satisfaction (80% useful, 96% likely to reuse)
- **Ch9** (2 slides): Testimonials and call-to-action to try Meeting Highlights
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
- **[`src/slides/chapters/`](react_cogs_demo/src/slides/chapters/)** - **Chapter-based slide organization (10 files, 23 slides)**
  - [`Chapter0.tsx`](react_cogs_demo/src/slides/chapters/Chapter0.tsx) - Intro slide
  - [`Chapter1.tsx`](react_cogs_demo/src/slides/chapters/Chapter1.tsx) - What is Meeting Highlights (3 slides)
  - [`Chapter2.tsx`](react_cogs_demo/src/slides/chapters/Chapter2.tsx) - Team Collaboration (1 slide)
  - [`Chapter3.tsx`](react_cogs_demo/src/slides/chapters/Chapter3.tsx) - Architecture Overview (1 slide)
  - [`Chapter4.tsx`](react_cogs_demo/src/slides/chapters/Chapter4.tsx) - Highlight Types (1 slide)
  - [`Chapter5.tsx`](react_cogs_demo/src/slides/chapters/Chapter5.tsx) - COGS Challenge (6 slides)
  - [`Chapter6.tsx`](react_cogs_demo/src/slides/chapters/Chapter6.tsx) - Optimization Solution (3 slides)
  - [`Chapter7.tsx`](react_cogs_demo/src/slides/chapters/Chapter7.tsx) - Business Impact (5 slides)
  - [`Chapter8.tsx`](react_cogs_demo/src/slides/chapters/Chapter8.tsx) - User Reception (1 slide)
  - [`Chapter9.tsx`](react_cogs_demo/src/slides/chapters/Chapter9.tsx) - Testimonials & Try It Out (2 slides)
- [`src/slides/SlidesRegistry.ts`](react_cogs_demo/src/slides/SlidesRegistry.ts) - Central registry importing all chapter slides
- [`src/slides/SlideStyles.ts`](react_cogs_demo/src/slides/SlideStyles.ts) - Shared styling utilities
- [`src/slides/AnimationVariants.ts`](react_cogs_demo/src/slides/AnimationVariants.ts) - Shared animation definitions
- [`src/slides/SlideLayouts.tsx`](react_cogs_demo/src/slides/SlideLayouts.tsx) - Reusable layout components
- [`src/slides/SlideIcons.tsx`](react_cogs_demo/src/slides/SlideIcons.tsx) - Shared icon components
- [`src/components/CoreComponents.tsx`](react_cogs_demo/src/components/CoreComponents.tsx) - Reusable UI components (MetricTile, etc.)
- [`src/accessibility/ReducedMotion.tsx`](react_cogs_demo/src/accessibility/ReducedMotion.tsx) - Motion preferences context
- [`src/components/VideoPlayer.tsx`](react_cogs_demo/src/components/VideoPlayer.tsx) - Demo video player component
- [`src/components/NarratedController.tsx`](react_cogs_demo/src/components/NarratedController.tsx) - Audio-synced presentation controller
- [`scripts/generate-tts.ts`](react_cogs_demo/scripts/generate-tts.ts) - TTS audio generation with smart caching
- [`scripts/calculate-durations.ts`](react_cogs_demo/scripts/calculate-durations.ts) - Audio duration calculation
- [`scripts/check-tts-cache.ts`](react_cogs_demo/scripts/check-tts-cache.ts) - Pre-flight cache validation

### Technology Stack
- **React 18** + **TypeScript** for type-safe UI components
- **Vite** for fast development and optimized builds
- **Framer Motion** for sophisticated animations and transitions
- **CSS-in-JS** inline styles for component-scoped styling

### npm Scripts

**Development:**
- `npm run dev` - Start development server (checks TTS cache first)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**TTS Generation:**
- `npm run tts:generate` - Generate all TTS audio files (cleans up unused files first)
- `npm run tts:generate -- --skip-existing` - Only generate changed/new files (smart cache)
- `npm run tts:duration` - Calculate and report audio durations

**TTS Cleanup Workflow:**
1. Scans `public/audio/` directories for WAV files
2. Compares against slides in `SlidesRegistry.ts`
3. Identifies orphaned files (not referenced by any slide)
4. Identifies orphaned cache entries (no corresponding slide)
5. Prompts: "Do you want to remove these unused files? (y/n)"
6. Deletes files and updates cache on confirmation

**Output:**
- `public/audio/` - Generated audio files organized by chapter
- `public/videos/` - Demo video files (MP4 format)
- `.tts-narration-cache.json` - Narration text cache for change detection
- `duration-report.json` - Audio duration analysis

### Demo Video Integration

The presentation includes an embedded video player component for displaying Meeting Highlights demo videos:

**Video Player Component:**
- **Location**: [`src/components/VideoPlayer.tsx`](react_cogs_demo/src/components/VideoPlayer.tsx)
- **Features**:
  - Freeze-on-end playback (video pauses on last frame)
  - Synchronized with slide narration segments
  - Framer Motion animations for smooth entry/exit
  - Responsive sizing and positioning
  - Multiple video support across different slides

**Video Storage:**
- Videos stored in `public/videos/` directory
- Format: MP4
- Referenced in slide metadata via `videoPath` property

**Available Demo Videos:**
- **`meeting_highlights_usage_in_bizchat.mp4`** - Demonstrates how users access Meeting Highlights through BizChat, showing the CIQ interface and Meeting Highlights player in action

**Usage in Slides:**
```typescript
export const Ch1_S2_HowToAccess = {
  metadata: {
    chapter: 1,
    slide: 2,
    title: "How to Access",
    videoPath: '/videos/meeting_highlights_usage_in_bizchat.mp4',
    audioSegments: [
      {
        id: 'intro',
        narrationText: 'Let me show you how Meeting Highlights works...',
        audioFilePath: '/audio/c1/s2_segment_01_intro.wav'
      }
    ]
  }
}
```

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