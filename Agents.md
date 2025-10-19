# Agents - Meeting Highlights COGS Reduction Presentation

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
- **src/slides/AnimatedSlides.tsx** - All animated slide components
- **src/slides/SlidesRegistry.ts** - Central registry of slides with metadata
- **src/components/CoreComponents.tsx** - Reusable UI components (MetricTile, etc.)
- **src/components/ImpactComponents.tsx** - Business impact visualizations
- **src/components/NarratedController.tsx** - Audio-synced presentation controller

#### Notable Slides
- **Ch5_S1_ChallengeFraming** - Shows initial metrics (4 calls, ~600 GPUs, high tokens)
- **Ch5_S2_FourPrompts** - Visualizes original 4-prompt pipeline
- **Ch6_S1_UnifiedConvergence** - Shows convergence to unified single prompt
- **Ch7_S1_CallReduction** - **Dual visualization**: LLM call reduction (75%) + Token reduction (60%)
- **Ch7_S2_GPUReduction** - GPU optimization visualization (600→200)
- **Ch7_S3_CostCurve** - Cost reduction curve
- **Ch7_S4_QualityComparison** - Quality comparison metrics
- **Ch2_S1_TeamCollaboration** - Multi-segment slide with 8 progressive team reveals

### TTS (Text-to-Speech) System (`tts/`)
Python-based TTS service for generating narration audio:
- **server.py** - TTS server
- **client.py** - TTS client
- **generate_audio.py** - Audio generation script
- Configuration and setup documentation

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

## Recent Changes (2025-01-19)

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

### Generating Audio
```bash
cd tts
python generate_audio.py
```

## Target Audience

The presentation is designed for an all-hands meeting where:
- Many attendees are **not familiar** with Meeting Highlights feature
- Focus is on **product value** and **business impact**
- Technical details are high-level, not implementation-specific
- Emphasis on user satisfaction and cost optimization enabling global rollout

## Future Improvements

As mentioned in chapter 9, user requests include:
- More detailed and specific highlights
- Deeper Teams Recap integration
- Action items inclusion
- Additional language support