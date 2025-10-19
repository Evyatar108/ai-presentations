# Agents - Meeting Highlights COGS Reduction Presentation

## ⚠️ IMPORTANT: Documentation Maintenance

**When making changes to the project, ALWAYS update both:**
1. [`README.md`](README.md) - Main project documentation
2. [`Agents.md`](Agents.md) - This file (AI agent context & recent changes)

These files must stay synchronized with the codebase to provide accurate context for future work.

## Project Overview

This project contains materials for an all-hands presentation about Meeting Highlights feature and its COGS (Cost of Goods Sold) optimization. The presentation explains what Meeting Highlights is as a product and details the technical optimizations that reduced computational costs by over 70%.

## Project Structure

### Documentation Files
- **README.md** - Main project documentation
- **highlights_demo/context/team collaboration.md** - Overview of 6+ teams collaborating on Meeting Highlights
- **highlights_demo/context/architecture comprehensive.md** - Comprehensive component reference with ICM teams and DRIs
- **highlights_demo/context/v2 goal and efforts.md** - Goals and efforts for v2 implementation
- **highlights_demo/context/extractive vs abstractive highlights.md** - Technical details on highlight types
- **highlights_demo/context/what is meeting highlights.md** - Comprehensive product explanation
- **highlights_demo/context/how can users try meeting highlights.md** - Instructions for accessing Meeting Highlights via BizChat

### Chapter & Slide Files (`highlights_demo/chapters/`)

Slide files are organized in chapter-specific folders. Each slide file represents one complete slide in the presentation and may contain multiple segments (utterances) for progressive content reveal.

#### File Organization
```
highlights_demo/chapters/
├── c2/                           # Chapter 2: Team Collaboration
│   └── s1_team_collaboration.srt
├── c5/                           # Chapter 5: COGS Challenge
│   ├── s1_challenge_framing.srt
│   ├── s2_four_prompts.srt
│   ├── s3_gpu_requirements.srt
│   ├── s4_latency_complexity.srt
│   └── s5_need_reduction.srt
├── c6/                           # Chapter 6: Optimization Solution
│   ├── s1_unified_convergence.srt
│   ├── s2_unified_flow.srt
│   ├── s3_single_invocation.srt
│   ├── s4_token_optimization.srt
│   └── s5_model_tuning.srt
└── c7/                           # Chapter 7: Business Impact
    ├── s1_call_reduction.srt
    ├── s2_gpu_reduction.srt
    ├── s3_cost_curve.srt
    ├── s4_quality_comparison.srt
    └── s5_path_to_ga.srt
```

#### File Format
Each slide file includes:
- **React Component Reference** - Link to implementing component (e.g., `Ch5_S1_ChallengeFraming`)
- **Segments** - Numbered with visual descriptions, timestamps, and narration text

#### Legacy Files (To Be Migrated)
- **1_intro.srt** (8 captions) - Product introduction
- **3_generation_workflow.srt** (6 captions) - Backend workflow
- **4_highlight_types_and_storage.srt** (5 captions) - Highlight types
- **8_user_reception.srt** (4 captions) - User feedback
- **9_testimonials_and_future.srt** (7 captions) - Testimonials

### Highlights Demo Materials (`highlights_demo/`)
- **audio/** - Audio files for narrated presentation
- **chapters/** - Subtitle files (SRT format) for each presentation chapter
- **images/logos/** - Product logos (BizChat, ClipChamp, Loop, msai-hive, odsp, Teams)
- **context/** - Technical documentation and implementation files
  - **team collaboration.md** - Team collaboration overview (ODSP, MSAI-Hive, Clipchamp, Loop, BizChat, Teams)
  - **architecture comprehensive.md** - Detailed component reference including all services (MeTA, TMR, BizChat, ODSP, VRoom, LLM, ACS, Loki, etc.), ICM teams, DRIs, and complete data flow
  - **extractive vs abstractive highlights.md** - Comparison of highlight approaches
  - **v2 goal and efforts.md** - V2 implementation goals
  - **what is meeting highlights.md** - Product overview
  - **how can users try meeting highlights.md** - User access instructions via BizChat
  - **v1/** - Original implementation ([`HighlightsPromptMaper.py`](highlights_demo/context/v1/HighlightsPromptMaper.py))
  - **v2/** - Current implementation schemas ([`prompt.md`](highlights_demo/context/v2/prompt.md), [`prompt_output_schema.md`](highlights_demo/context/v2/prompt_output_schema.md), [`TRANSCRIPT_TABLE_SCHEMA.md`](highlights_demo/context/v2/TRANSCRIPT_TABLE_SCHEMA.md))

### React Demo Application (`react_cogs_demo/`)
Interactive presentation slides built with React, Framer Motion, and TypeScript:

#### Key Files
- **src/App.tsx** - Main application component
- **src/slides/AnimatedSlides.tsx** - **All 23 slide components consolidated** (Ch0-Ch9)
- **src/slides/SlidesRegistry.ts** - Central registry importing all slides from AnimatedSlides.tsx
- **src/components/CoreComponents.tsx** - Reusable UI components (MetricTile, etc.)
- **src/components/NarratedController.tsx** - Audio-synced presentation controller
- **src/components/VideoPlayer.tsx** - Demo video player with freeze-on-end functionality
- **src/contexts/SegmentContext.tsx** - Segment state management for multi-segment slides
- **src/accessibility/ReducedMotion.tsx** - Motion preferences context

#### Notable Slides
- **Ch5_S1_ChallengeFraming** - Shows initial metrics (4 calls, ~600 GPUs, high tokens)
- **Ch5_S2_FourPrompts** - Visualizes original 4-prompt pipeline
- **Ch6_S1_UnifiedConvergence** - Shows convergence to unified single prompt
- **Ch7_S1_CallReduction** - **Dual visualization**: LLM call reduction (75%) + Token reduction (60%)
- **Ch7_S2_GPUReduction** - GPU optimization visualization (600→200)
- **Ch7_S3_CostCurve** - Cost reduction curve
- **Ch7_S4_QualityComparison** - Quality comparison metrics
- **Ch2_S1_TeamCollaboration** - Multi-segment slide with 8 progressive team reveals

### TTS (Text-to-Speech) System

**Python TTS Server (`tts/`)**
- **server.py** - Flask server running VibeVoice model on GPU
- **client.py** - Python reference client with batch processing
- **generate_audio.py** - Legacy audio generation script
- **README.md** - Setup and configuration instructions
- **NETWORK_SETUP.md** - Remote server configuration guide

**TypeScript TTS Scripts (`react_cogs_demo/scripts/`)**
- **generate-tts.ts** - Main TTS generation script with batch processing and smart caching
- **calculate-durations.ts** - Audio duration analysis and reporting
- **check-tts-cache.ts** - Pre-flight cache validation (runs before `npm run dev`)

**Smart Caching System:**
- Tracks narration text in `.tts-narration-cache.json`
- Detects changes and only regenerates modified segments
- Pre-flight check before dev server start
- Prompts user: "Do you want to regenerate? (y/n)"
- Auto-runs generation if user answers "y"

**Batch Processing:**
- Default: 10 segments per batch (configurable via `BATCH_SIZE` env var)
- Efficient GPU utilization
- Progress tracking with percentage completion
- Error recovery with retry capability

**Audio Fallback System:**
- Missing files fall back to 1-second silence (`public/audio/silence-1s.mp3`)
- Prevents presentation crashes
- Console warnings for debugging
- Graceful degradation in all presentation modes

### Implementation Files
- **highlights_demo/context/v1/** - Original implementation ([`HighlightsPromptMaper.py`](highlights_demo/context/v1/HighlightsPromptMaper.py))
- **highlights_demo/context/v2/** - Current implementation with prompt schema and transcript table schema

## Key Metrics

### Product Metrics
- **80%** of users rate Meeting Highlights as extremely/very useful
- **96%** of users likely to use again
- **3-5 minutes** typical highlight video length

### Optimization Metrics
- **75%** reduction in LLM calls (4 → 1)
- **60%** reduction in input tokens
- **67%** reduction in GPU capacity (~600 → ~200 GPUs)
- **70%+** estimated COGS reduction overall

## Recent Changes

### 2025-01-20: File Consolidation
**Consolidated All Slide Components:**
- Merged all slides into single file ([`src/slides/AnimatedSlides.tsx`](react_cogs_demo/src/slides/AnimatedSlides.tsx))
- Components consolidated:
  - Ch2_TeamCollaboration (from TeamCollaborationSlide.tsx)
  - Ch7_S3_CostCurve (from ImpactComponents.tsx)
  - Ch7_S4_QualityComparison (from ImpactComponents.tsx)
  - All existing slides from AnimatedSlides.tsx
- Updated SlidesRegistry.ts to import all slides from AnimatedSlides.tsx only
- Deleted redundant files: TeamCollaborationSlide.tsx, ImpactComponents.tsx
- Result: Cleaner project structure with all 23 slides in one location

### 2025-01-20: Video Player Integration
**Added Demo Video Support:**
- Created VideoPlayer component ([`src/components/VideoPlayer.tsx`](react_cogs_demo/src/components/VideoPlayer.tsx))
- Freeze-on-end playback (pauses on last frame)
- Synchronized with slide narration
- Framer Motion animations
- Responsive sizing and positioning
- Videos stored in `public/videos/` directory
- MP4 format support
- Referenced via `videoPath` in slide metadata

**Available Demo Videos:**
- **`meeting_highlights_usage_in_bizchat.mp4`** - Shows how users access Meeting Highlights through BizChat, demonstrating the CIQ (Conversation Intelligence Query) interface and the Meeting Highlights player experience

### 2025-01-20: TTS System & Audio Playback Fixes
1. **Implemented Smart TTS Caching**
   - Narration text change detection
   - Only regenerate modified segments
   - Batch processing (10 segments/batch)
   - Cache stored in `.tts-narration-cache.json`

2. **Pre-flight Cache Validation**
   - Automatic check before `npm run dev`
   - Detects changed narration text
   - Prompts for regeneration with clear message
   - Auto-runs generation if user confirms

3. **Fixed Audio Overlap Bug**
   - Manual+Audio mode was playing multiple audios simultaneously
   - Root cause: Async audio loading race condition
   - Solution: Implemented `isActive` flag to cancel stale audio loads
   - Comprehensive cleanup of all audio references and event listeners

4. **Audio Fallback System**
   - Created `silence-1s.mp3` fallback file
   - Graceful handling of missing audio files
   - Console warnings for debugging
   - No presentation crashes

5. **Updated All Audio File Paths**
   - Migrated from placeholder paths to actual TTS-generated files
   - Pattern: `/audio/c{chapter}/s{slide}_segment_{number}_{id}.wav`
   - ~65 audio file references updated across all slides

### 2025-01-19: Content Restructuring

### Content Restructuring
1. **Enhanced Introduction** - Expanded from 3 to 8 captions to comprehensively explain Meeting Highlights for all-hands audience
2. **Simplified COGS Challenge** - Removed detailed explanations of each of the 4 prompts, focusing on high-level impact
3. **Added Token Optimization Details** - Explicitly mentioned 60% input token reduction in both narration and slides
4. **Updated Business Impact** - Changed from "over 50%" to "over 70%" COGS reduction with "estimated" framing
5. **Enhanced React Slide** - Ch7_U1 now shows both call reduction dial AND token reduction bar chart side-by-side

### Code Changes
- Renamed all slide components from `_U` (Utterance) to `_S` (Slide) convention
- Removed 4 detailed prompt slides (Ch5_S3-S6 for individual prompts) from SlidesRegistry
- Deleted unused SlideRegistry.ts file
- Updated Ch7_S1_CallReduction to "Optimization Impact" with dual visualizations
- Implemented multi-segment slide support for progressive content reveal
- Organized slide definitions by chapter in `highlights_demo/chapters/cX/` folders

## Development

### Running the React Demo
```bash
cd react_cogs_demo
npm install
npm run dev
```
### TTS Audio Generation

**Start Python TTS Server:**
```bash
cd tts
python server.py --voice-sample path/to/voice.wav
```

**Generate Audio Files:**
```bash
cd react_cogs_demo

# Generate all files (uses smart cache to skip unchanged)
npm run tts:generate

# Force regenerate all files
npm run tts:generate -- --force

# Calculate durations
npm run tts:duration
```

**Development Workflow:**
1. Edit narration text in slide components
2. Run `npm run dev`
3. Pre-flight check detects changes
4. Answer "y" to regenerate automatically
5. Server starts with updated audio

**Cache Management:**
- Cache file: `react_cogs_demo/.tts-narration-cache.json`
- Duration report: `react_cogs_demo/duration-report.json`
- Audio files: `react_cogs_demo/public/audio/c{0-9}/`
```

## Presentation Modes

The React demo supports three presentation modes:

**1. Narrated Mode (▶ Narrated)**
- Auto-advances through all slides
- Plays all audio segments sequentially
- Synchronized animations with narration
- Ideal for unattended playback or recording
- ~4 minute duration

**2. Manual Mode (⌨ Manual Silent)**
- Navigate with arrow keys
- No audio playback
- Instant slide transitions
- Best for quick review

**3. Manual + Audio Mode (⌨ Manual + Audio)**
- Navigate manually with arrow keys
- Plays audio for each visited slide
- Optional auto-advance on audio end
- Smart audio cleanup prevents overlap
- Best for interactive presentations

**Interface Options:**
- "Hide interface" checkbox for clean recording
- Auto-advance toggle in Manual+Audio mode
- Restart button available in all modes
- Slide counter shows position (e.g., "Slide 5 of 20 (Ch1:S2)")

## Target Audience

The presentation is designed for an all-hands meeting where:
- Many attendees are **not familiar** with Meeting Highlights feature
- Focus is on **product value** and **business impact**
- Technical details are high-level, not implementation-specific
- Emphasis on user satisfaction and cost optimization enabling global rollout

## Technical Stack

**Frontend:**
- React 18 + TypeScript
- Vite for dev server and build
- Framer Motion for animations
- Inline CSS-in-JS styling

**TTS System:**
- Python Flask server with VibeVoice model
- TypeScript batch client
- Smart caching with narration text tracking
- WAV audio output (24kHz mono)

**Development Tools:**
- tsx for TypeScript script execution
- axios for HTTP requests
- get-audio-duration for audio analysis
- ffmpeg for silence generation

## Future Improvements

As mentioned in chapter 9, user requests include:
- More detailed and specific highlights
- Deeper Teams Recap integration
- Action items inclusion
- Additional language support