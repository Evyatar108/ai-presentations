# Agents - Meeting Highlights COGS Reduction Presentation

## Recent Changes

### 2025-01-20: Documentation Structure Standardization ✅
**Established consistent documentation hierarchy for all demos:**

**Created Documentation Guidelines:**
- [`DEMO_DOCUMENTATION_STRUCTURE.md`](docs/DEMO_DOCUMENTATION_STRUCTURE.md) - Comprehensive documentation structure guide (consolidated from 3 separate files)
- Updated [`ADDING_DEMOS.md`](docs/ADDING_DEMOS.md) with documentation requirements
- Created PowerShell scaffolding script [`new-demo.ps1`](scripts/new-demo.ps1) for automated demo creation

**Key Principle:** Demo ID consistency across all locations:
- `docs/demos/{demo-id}/` - Documentation
- `src/demos/{demo-id}/` - Implementation
- `public/{audio|images|videos}/{demo-id}/` - Assets

**Naming Conventions:**
- Demo IDs: lowercase with hyphens (e.g., `meeting-highlights`)
- Main doc file: `{demo-id}.md`
- Context files: hyphenated lowercase (e.g., `team-collaboration.md`)
- Directories must match demo ID exactly

**Migration Completed for Meeting Highlights:**
- ✅ Renamed `docs/demos/highlights/` → `docs/demos/meeting-highlights/`
- ✅ Renamed `MEETING_HIGHLIGHTS_DEMO.md` → `meeting-highlights.md`
- ✅ Standardized context files:
  - `what is meeting highlights.md` → `what-is-meeting-highlights.md`
  - `team collaboration.md` → `team-collaboration.md`
  - `architecture comprehensive.md` → `architecture-comprehensive.md`
  - `extractive vs abstractive highlights.md` → `extractive-vs-abstractive-highlights.md`
  - `how can users try meeting highlights.md` → `how-can-users-try-meeting-highlights.md`
  - `v2 goal and efforts.md` → `v2-goals-and-efforts.md`
- ✅ Updated all cross-references in README.md, Agents.md, react_cogs_demo/README.md
- ✅ Updated internal links in meeting-highlights.md

**Example Demo Documentation Created:**
- [`docs/demos/example-demo-1/`](docs/demos/example-demo-1/) - Full documentation with context guidelines
- [`docs/demos/example-demo-2/`](docs/demos/example-demo-2/) - Alternative demo with dark theme docs

**Benefits:**
- **Predictability**: Given demo ID, immediately know all file locations
- **Consistency**: All demos follow same pattern
- **Maintainability**: Clear structure for updates
- **Scalability**: Easy to add new demos
- **Discoverability**: Hyphenated names easier to work with

## Recent Changes
### 2025-01-20: Phase 8 - Testing and Verification Complete ✅
**Comprehensive testing completed for multi-demo architecture:**

**Build & Compilation Tests:**
- ✅ TypeScript compilation passes (`npx tsc --noEmit`)
- ✅ Production build succeeds (`npm run build`)
- ✅ All assets bundled correctly in `dist/`

**Functional Tests:**
- ✅ All 3 demos load and display correctly
- ✅ Demo selection from WelcomeScreen works
- ✅ Navigation between demos functional
- ✅ All presentation modes work (Narrated, Manual, Manual+Audio)
- ✅ Multi-segment slides work correctly (Chapter 2 with 9 segments)
- ✅ Audio playback works for Meeting Highlights
- ✅ Silence fallback works for placeholder demos
- ✅ Video playback works (BizChat and SharePoint demos)
- ✅ Back button returns to WelcomeScreen

**Issues Fixed During Testing:**
1. **TTS Cache Structure** - Migrated to nested multi-demo format
2. **Narration Text Mismatches** - Fixed 5 discrepancies
3. **Example Demo Warnings** - Removed narrationText to skip validation
4. **Video File Paths** - Moved to demo-specific subdirectories

**New Feature Added:**
- **Duration Display** - Added duration field to [`DemoMetadata`](react_cogs_demo/src/demos/types.ts)
- Meeting Highlights shows "~4:07 (audio only)" on WelcomeScreen
- Note: Duration reflects audio length only, not including delays between segments/slides (actual runtime is longer)
- Updated files:
  - [`types.ts`](react_cogs_demo/src/demos/types.ts) - Added optional `duration?: number` field
  - [`metadata.ts`](react_cogs_demo/src/demos/meeting-highlights/metadata.ts) - Added duration: 247 seconds with comment
  - [`WelcomeScreen.tsx`](react_cogs_demo/src/components/WelcomeScreen.tsx) - Display duration with clock icon and "audio only" note

**Final Status:**
- ✅ Development ready - Dev server starts without prompts or errors
- ✅ Production ready - Build completes successfully with all assets
- ✅ All critical functionality validated
- ✅ Multi-demo architecture fully operational


### 2025-01-20: Multi-Demo Architecture Refactoring (Phases 5-7)
**Completed multi-demo support system enabling multiple presentations:**

**Phase 5: Placeholder Demos Created**
- Created `example-demo-1` with 3 placeholder slides
  - Simple gradient styling (purple, pink, blue)
  - Demonstrates basic multi-demo structure
  - Default mode: narrated
- Created `example-demo-2` with 3 placeholder slides
  - Dark theme with card layouts
  - Alternative styling approach
  - Default mode: manual
- Both demos registered in [`DemoRegistry.ts`](react_cogs_demo/src/demos/DemoRegistry.ts)
- Structure: metadata.ts, index.ts, slides/SlidesRegistry.ts, chapters/Chapter0.tsx, README.md

**Phase 6: TTS Scripts Updated for Multi-Demo**
- **[`generate-tts.ts`](react_cogs_demo/scripts/generate-tts.ts)**: Now supports multiple demos
  - Scans `src/demos/*/` for all demos
  - `--demo` CLI parameter for specific demo generation
  - Multi-demo cache structure: `{ "demo-id": { "filepath": { ... } } }`
  - Demo-specific output: `public/audio/{demo-id}/c{chapter}/`
  - Cleanup per demo with orphaned file detection
  - Commands: `npm run tts:generate` (all), `npm run tts:generate -- --demo meeting-highlights` (specific)

- **[`check-tts-cache.ts`](react_cogs_demo/scripts/check-tts-cache.ts)**: Multi-demo cache validation
  - Checks all demos for changes
  - Reports changes per demo
  - Prompts for regeneration with demo list
  - Handles multi-demo cache structure

- **[`calculate-durations.ts`](react_cogs_demo/scripts/calculate-durations.ts)**: Multi-demo duration reports
  - Calculates durations per demo
  - Grand totals across all demos
  - `--demo` parameter for specific demo reports
  - Output: `duration-report.json` or `duration-report-{demo-id}.json`

**Phase 7: Documentation Updates**
- Created comprehensive [`react_cogs_demo/README.md`](react_cogs_demo/README.md)
  - Multi-demo architecture overview
  - Demo organization and structure
  - Step-by-step guide for adding new demos
  - TTS script usage with multi-demo examples
  - Asset management per demo
  - Troubleshooting section
- Updated [`Agents.md`](Agents.md) (this file) with refactoring details

**Benefits:**
- **Scalability**: Unlimited demos supported
- **Independence**: Each demo has its own assets and configuration
- **Lazy Loading**: Demos load on-demand for faster initial load
- **Shared Infrastructure**: Common components reduce duplication
- **Clean Organization**: Demo-specific directories prevent cross-contamination

**Architecture:**
- Demo registry with lazy loading (`DemoRegistry.ts`)
- Welcome screen for demo selection (`WelcomeScreen.tsx`)
- Demo-agnostic player components (`DemoPlayer.tsx`, `SlidePlayer.tsx`)
- Type-safe demo configuration (`src/demos/types.ts`)

**File Structure:**
```
src/demos/
├── types.ts                    # Type definitions
├── DemoRegistry.ts             # Central registry
├── meeting-highlights/         # Migrated Meeting Highlights
├── example-demo-1/             # Placeholder demo 1
└── example-demo-2/             # Placeholder demo 2

public/audio/
├── meeting-highlights/         # Demo-specific audio
├── example-demo-1/
└── example-demo-2/
```

**Updated Files:**
- All TTS scripts support multi-demo
- Cache structure supports multiple demos
- Project README documents new architecture
- 3 demos now registered and functional

### 2025-01-20: Final Slide - Thank You & Call to Action
**Ch9_S2_ClosingThanks Design:**
- **4 segments** with progressive reveal
  - Segment 0: "Thank You" title with animated gradient
  - Segment 1: "Reclaim time. Stay aligned." value statement
  - Segment 2: Feedback email card (meetinghlfeedback@microsoft.com)
  - Segment 3: Large CTA badge "Try Meeting Highlights - Available now in BizChat & SharePoint"
- **Rationale**: Professional closing that thanks audience, invites feedback, and provides clear call-to-action
- **Visual Design**: Animated particles, gradient text, pulsing CTA with shine effect
- **Updated files**:
  - [`Chapter9.tsx`](react_cogs_demo/src/slides/chapters/Chapter9.tsx) - Ch9_S2_ClosingThanks component
  - [`SlidesRegistry.ts`](react_cogs_demo/src/slides/SlidesRegistry.ts) - Updated reference
  - [`Agents.md`](Agents.md) - This entry


### 2025-01-20: Automatic Cleanup of Unused Audio Files
- TTS scripts detect and remove orphaned audio files
- Prompts before deletion with file list
- Cleans up both files and cache entries

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
### Documentation Files
- **README.md** - Main project documentation
- **docs/demos/meeting-highlights/** - Meeting Highlights demo documentation
  - **meeting-highlights.md** - Main demo documentation with slide structure and design system
  - **context/** - Background materials for demo creation:
    - **team-collaboration.md** - Overview of 6+ teams collaborating on Meeting Highlights
    - **architecture-comprehensive.md** - Comprehensive component reference with ICM teams and DRIs
    - **v2-goals-and-efforts.md** - Goals and efforts for v2 implementation
    - **extractive-vs-abstractive-highlights.md** - Technical details on highlight types
    - **what-is-meeting-highlights.md** - Comprehensive product explanation
    - **how-can-users-try-meeting-highlights.md** - Instructions for accessing Meeting Highlights via BizChat
    - **v1/** - Original implementation ([`HighlightsPromptMaper.py`](docs/demos/meeting-highlights/context/v1/HighlightsPromptMaper.py))
    - **v2/** - Current implementation schemas
### Highlights Demo Materials (`highlights_demo/`)
- **audio/** - Audio files for narrated presentation
- **chapters/** - Subtitle files (SRT format) for each presentation chapter
- **images/logos/** - Product logos (BizChat, ClipChamp, Loop, msai-hive, odsp, Teams)

### Meeting Highlights Documentation (`docs/demos/meeting-highlights/`)
- **meeting-highlights.md** - Main demo documentation with slide structure and design system
- **context/** - Background materials directory:
  - **team-collaboration.md** - Team collaboration overview (ODSP, MSAI-Hive, Clipchamp, Loop, BizChat, Teams)
  - **architecture-comprehensive.md** - Detailed component reference including all services (MeTA, TMR, BizChat, ODSP, VRoom, LLM, ACS, Loki, etc.), ICM teams, DRIs, and complete data flow
  - **extractive-vs-abstractive-highlights.md** - Comparison of highlight approaches
  - **v2-goals-and-efforts.md** - V2 implementation goals
  - **what-is-meeting-highlights.md** - Product overview
  - **how-can-users-try-meeting-highlights.md** - User access instructions via BizChat
  - **v1/** - Original implementation ([`HighlightsPromptMaper.py`](docs/demos/meeting-highlights/context/v1/HighlightsPromptMaper.py))
  - **v2/** - Current implementation schemas ([`prompt.md`](docs/demos/meeting-highlights/context/v2/prompt.md), [`prompt_output_schema.md`](docs/demos/meeting-highlights/context/v2/prompt_output_schema.md), [`TRANSCRIPT_TABLE_SCHEMA.md`](docs/demos/meeting-highlights/context/v2/TRANSCRIPT_TABLE_SCHEMA.md))

### React Demo Application (`react_cogs_demo/`)
Interactive presentation slides built with React, Framer Motion, and TypeScript:

#### React Demo Structure
- **15 slides total** across 9 chapters
- Chapter-based organization in `src/demos/meeting-highlights/slides/chapters/`
- Shared utilities: SlideStyles, AnimationVariants, SlideLayouts, SlideIcons
- Core components: DemoPlayer, SlidePlayer, NarratedController, VideoPlayer

### TTS (Text-to-Speech) System
- Python Flask server with VibeVoice model (`tts/server.py`)
- TypeScript generation scripts with smart caching (`scripts/generate-tts.ts`)
- Multi-demo support with per-demo audio directories
- Batch processing (10 segments/batch default)
- Pre-flight cache validation before dev server
- Audio fallback system (1-second silence for missing files)

### Implementation Files
### Implementation Files
- **docs/demos/meeting-highlights/context/v1/** - Original implementation ([`HighlightsPromptMaper.py`](docs/demos/meeting-highlights/context/v1/HighlightsPromptMaper.py))
- **docs/demos/meeting-highlights/context/v2/** - Current implementation with prompt schema and transcript table schema
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


## Development Commands

```bash
# Development
cd react_cogs_demo
npm install
npm run dev

# TTS Generation
cd tts && python server.py --voice-sample path/to/voice.wav
cd react_cogs_demo && npm run tts:generate
npm run tts:duration

# Build
npm run build
npm run preview
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