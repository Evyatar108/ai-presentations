# Agents - Meeting Highlights COGS Reduction Presentation

## Recent Changes
### 2025-01-20: Streamlined Closing Slide - Removed Repetitive Content
**Refactored Ch9_S2 from "Try It Yourself" to "What's Next":**
- **Removed**: Repeated 80% satisfaction metric (already shown in Ch8_S1)
- **Removed**: Detailed BizChat usage instructions (already covered in Ch1_S2)
- **New Focus**: Forward-looking content on GA rollout, quality improvements, and ongoing innovation
- **New Structure**: 5 segments (down from 7)
  - Segment 0: Title "What's Next?"
  - Segment 1: Path to GA with unified prompt enabling global rollout
  - Segment 2: Enhanced quality from unified architecture
  - Segment 3: Ongoing optimization commitment
  - Segment 4: Simple CTA "Try Meeting Highlights Today!"
- **Rationale**: Closing slide should advance the narrative, not repeat earlier content
- **Result**: More impactful ending that emphasizes momentum and future improvements
- **Updated files**:
  - [`Chapter9.tsx`](react_cogs_demo/src/slides/chapters/Chapter9.tsx) - Renamed Ch9_S2_TryItYourself to Ch9_S2_WhatsNext
  - [`SlidesRegistry.ts`](react_cogs_demo/src/slides/SlidesRegistry.ts) - Updated import and reference
  - [`Agents.md`](Agents.md) - This entry


### 2025-01-20: Automatic Cleanup of Unused Audio Files
**Added Orphaned File Detection and Removal:**
- **Enhanced TTS Generation Script** ([`generate-tts.ts`](react_cogs_demo/scripts/generate-tts.ts))
  - Added `cleanupUnusedAudio()` function to scan for orphaned audio files
  - Detects WAV files in `public/audio/c*/` not referenced in any slide
  - Identifies orphaned cache entries for non-existent slides
  - Automatically deletes orphaned files and removes cache entries
  - Reports cleanup: "Cleaned up X files and Y cache entries"

- **Enhanced Cache Check Script** ([`check-tts-cache.ts`](react_cogs_demo/scripts/check-tts-cache.ts))
  - Added `detectOrphanedAudio()` function for pre-flight cleanup check
  - Prompts user before deletion: "Do you want to remove these unused files? (y/n)"
  - Shows list of orphaned files (up to 5, with "... and X more")
  - Cleans up both files and cache entries on confirmation
  - Runs before checking for narration changes

- **Updated Documentation**
  - [`README.md`](README.md) - Added cleanup workflow explanation
  - Section "TTS Cleanup Workflow" with 6-step process
  - Smart caching system now includes automatic cleanup feature

**Rationale:**
- Keeps audio directory synchronized with slide content
- Prevents accumulation of unused files from refactored/deleted slides
- Reduces storage usage and improves project organization
- Automatic detection prevents manual file management

**Technical Implementation:**
- Scans all chapter directories (`c0/` through `c9/`)
- Builds set of expected files from `SlidesRegistry.ts`
- Compares actual filesystem against expected files
- Normalizes paths (handles Windows backslashes)
- User confirmation required before deletion

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
- **src/slides/chapters/** - **Chapter-based slide organization** (9 files, 22 slides total)
  - **Chapter0.tsx** (33 lines) - Intro slide
  - **Chapter1.tsx** (543 lines) - What is Meeting Highlights (3 slides)
  - **Chapter2.tsx** (657 lines) - Team Collaboration with inline ReactFlow diagram (1 slide, 9 segments)
  - **Chapter4.tsx** (183 lines) - Highlight Types (1 slide)
  - **Chapter5.tsx** (160 lines) - COGS Challenge (2 slides)
  - **Chapter6.tsx** (266 lines) - Optimization Solution (3 slides)
  - **Chapter7.tsx** (812 lines) - Business Impact (5 slides)
  - **Chapter8.tsx** (118 lines) - User Reception (1 slide)
  - **Chapter9.tsx** (290 lines) - Testimonials & Try It Out (2 slides)
- **src/slides/SlidesRegistry.ts** - Central registry importing all slides from chapter files
- **src/slides/SlideStyles.ts** - Shared styling utilities
- **src/slides/AnimationVariants.ts** - Shared animation definitions
- **src/slides/SlideLayouts.tsx** - Reusable layout components
- **src/slides/SlideIcons.tsx** - Shared icon components
- **src/components/CoreComponents.tsx** - Reusable UI components (MetricTile, etc.)
- **src/components/NarratedController.tsx** - Audio-synced presentation controller
- **src/components/VideoPlayer.tsx** - Demo video player with freeze-on-end functionality
- **src/contexts/SegmentContext.tsx** - Segment state management for multi-segment slides
- **src/accessibility/ReducedMotion.tsx** - Motion preferences context
- **src/accessibility/ReducedMotion.tsx** - Motion preferences context

#### Notable Slides
- **Ch5_S1_ChallengeFraming** - Shows initial metrics (4 calls, ~600 GPUs, high tokens)
- **Ch5_S2_FourPrompts** - Visualizes original 4-prompt pipeline
- **Ch6_S1_UnifiedConvergence** - Shows convergence to unified single prompt
- **Ch7_S1_CallReduction** - **Dual visualization**: LLM call reduction (75%) + Token reduction (60%)
- **Ch7_S2_GPUReduction** - GPU optimization visualization (600→200)
- **Ch7_S3_CostCurve** - Cost reduction curve
- **Ch7_S4_QualityComparison** - Quality comparison metrics
- **Ch2_S1_TeamCollaboration** - Multi-segment slide with 9 segments showing team collaboration and architecture flow with dual visualization (ReactFlow diagram + Backend Flow)

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

### 2025-01-20: Replaced "Future Improvements" with "Try It Yourself" Call-to-Action Slide
**Created Engaging Closing Slide:**
- **Replaced**: Ch9_S2_FutureImprovements with Ch9_S2_TryItYourself
- **New Design**: 7-segment progressive reveal leveraging social proof and quality teaser
  - Segment 0: Title "Ready to Experience It?" with 80% satisfaction hook
  - Segment 1: Large 80% metric visualization with 5 stars
  - Segment 2: "Coming Soon" banner teasing unified prompt quality improvements
  - Segments 3-5: Three-step instructions (Open BizChat → Reference meeting → Ask for recap)
  - Segment 6: Pulsing call-to-action button "Try It Today in BizChat! 🚀"
- **Rationale**: All-hands audience benefits more from invitation to try the product than feature roadmap
- **Connects story**: Links user satisfaction (Ch8) → quality improvements (Ch7) → actionable next step
- **Updated files**:
  - [`Chapter9.tsx`](react_cogs_demo/src/slides/chapters/Chapter9.tsx) - New slide component with 7 audio segments
  - [`SlidesRegistry.ts`](react_cogs_demo/src/slides/SlidesRegistry.ts) - Updated import/export names
  - [`README.md`](README.md) - Updated slide descriptions
  - [`Agents.md`](Agents.md) - This entry

### 2025-01-20: Removed Individual Prompt Detail Slides
**Streamlined Chapter 5 Content:**
- **Deleted 4 slides**: Ch5_S3_TopicAbstraction, Ch5_S4_ExtractiveSelection, Ch5_S5_QualityRanking, Ch5_S6_NarrativeSynthesis
- **Reason**: All-hands presentation should focus on high-level business impact, not detailed prompt implementations
- **Kept**: Ch5_S1_ChallengeFraming (shows the problem) and Ch5_S2_FourPrompts (shows the 4-prompt pipeline overview)
- **Result**: Chapter 5 now has 2 slides (down from 6), faster pacing, clearer narrative
- **Updated**: [`SlidesRegistry.ts`](react_cogs_demo/src/slides/SlidesRegistry.ts) and [`Chapter5.tsx`](react_cogs_demo/src/slides/chapters/Chapter5.tsx)
- **Total slides**: Presentation now has 18 slides (down from 22)

### 2025-01-20: Chapter 2 Team Collaboration Slide Refactoring
**Fixed Narration-Visual Synchronization Issues:**
- **Problem**: Mismatch between narration audio and visual component reveals in Chapter 2 slide
- **Root cause**: Team array ordering didn't match segment indices, causing wrong cards to highlight
- **Fixed team array**: Reordered so Teams at index 5, Loop at index 6 (matching segment numbers)
- **Updated architecture diagram**: All ReactFlow nodes and edges now aligned with narration timing
- **Added MSAI duplicate**: Keeps MSAI-Hive card highlighted during ACS narration (segment 3)

**Code Consolidation:**
- **Inlined architecture diagram**: Moved ReactFlow component from separate [`Ch2_ArchitectureDiagram.tsx`](react_cogs_demo/src/slides/Ch2_ArchitectureDiagram.tsx) into [`Chapter2.tsx`](react_cogs_demo/src/slides/chapters/Chapter2.tsx)
- **Deleted separate file**: Removed redundant Ch2_ArchitectureDiagram.tsx (323 lines)
- **Added ReactFlow imports**: All dependencies now in single chapter file
- **Result**: Cleaner file structure, easier maintenance

**Audio File Path Corrections:**
- Fixed segment numbering to match actual generated files:
  - Teams: `s1_segment_06_teams.wav` (was 05)
  - Loop: `s1_segment_07_loop_storage.wav` (was 06)
  - Clipchamp: `s1_segment_08_clipchamp.wav` (was 07)
  - Conclusion: `s1_segment_09_conclusion.wav` (was 08)

**Teams Feature Clarification:**
- **Updated narration**: "We are also planning to provide access to highlights directly within the Teams ecosystem as another interface option"
- **Updated labels**: Changed from "Alternative UI" to "Planned UI" throughout
- **Reflects reality**: Teams access is planned, not yet implemented (BizChat is current primary UI)

**UI Enhancements:**
- **Sticky header**: "Backend Flow" header remains visible during scrolling
- **Auto-scroll**: Backend flow automatically scrolls to show newest items as they appear
- **Better layout**: Flexbox structure with fixed header and scrollable content area

**Final Segment Configuration (9 segments):**
- Segment 0: Intro
- Segment 1: ODSP
- Segment 2: MSAI-Hive
- Segment 3: ACS (keeps MSAI highlighted)
- Segment 4: BizChat
- Segment 5: Teams (with audio)
- Segment 6: Loop
- Segment 7: Clipchamp
- Segment 8: Conclusion

### 2025-01-20: Architecture Overview Slide Removal
**Removed Redundant Architecture Slide:**
- **Deleted**: [`Chapter3.tsx`](react_cogs_demo/src/slides/chapters/Chapter3.tsx) (Architecture Overview slide)
- **Reason**: Slide was redundant and not needed for all-hands presentation focused on business impact
- **Updated**: [`SlidesRegistry.ts`](react_cogs_demo/src/slides/SlidesRegistry.ts) to remove Ch3_S1_ArchitectureOverview import and reference
- **Result**: Presentation now has 22 slides (down from 23), streamlined flow from Team Collaboration directly to Highlight Types

### 2025-01-20: Chapter-Based File Organization
**Split AnimatedSlides.tsx into Chapter Files:**
- **Deleted**: Monolithic [`AnimatedSlides.tsx`](react_cogs_demo/src/slides/AnimatedSlides.tsx) (3,075 lines)
- **Created**: 10 chapter files in [`src/slides/chapters/`](react_cogs_demo/src/slides/chapters/) directory
- **File sizes**: Range from 33 lines (Chapter0) to 812 lines (Chapter7)
- **Average size**: ~296 lines per chapter file
- **Benefits**:
  - Improved navigation - find slides by opening relevant chapter
  - Reduced merge conflicts - developers work on separate chapters
  - Better IDE performance - smaller files load and parse faster
  - Logical organization - chapters align with presentation narrative
  - Scalable structure - easy to add new slides or split further
- **Updated**: [`SlidesRegistry.ts`](react_cogs_demo/src/slides/SlidesRegistry.ts) to import from chapter files
- **Verified**: TypeScript compilation passes, all 23 slides render correctly
- **Documentation**: Updated SPLITTING_STRATEGY.md with completion status

### 2025-01-20: Previous File Consolidation
**Earlier Consolidation Step (Now Superseded):**
- Initially merged all slides into single AnimatedSlides.tsx file
- Consolidated Ch2_TeamCollaboration, Ch7_S3_CostCurve, Ch7_S4_QualityComparison
- This monolithic file (3,075 lines) was then split into chapters (see above)

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

## Call to Action

The presentation closes with an invitation for users to try Meeting Highlights themselves through BizChat, reinforcing the product value demonstrated throughout the presentation. The closing slide teases upcoming quality improvements from the unified prompt optimization discussed in Chapter 7.