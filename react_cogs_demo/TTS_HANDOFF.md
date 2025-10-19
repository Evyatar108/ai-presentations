# TTS Generation Implementation - Engineer Handoff

## Overview

This document provides all context files needed to implement the TTS generation and duration calculation scripts for the Meeting Highlights presentation.

## Task Summary

Implement two npm scripts:
1. **`npm run tts:generate`** - Generate TTS audio files using batch processing
2. **`npm run tts:duration`** - Calculate durations of all audio files

## Required Context Files

### 1. Primary Implementation Plan
📄 **[TTS_GENERATION_PLAN.md](TTS_GENERATION_PLAN.md)** - Complete implementation plan
- Contains full TypeScript code for both scripts
- Batch processing architecture
- Usage examples and error handling
- Timeline estimates

### 2. Slide Metadata (Data Source)
📄 **[src/slides/SlidesRegistry.ts](src/slides/SlidesRegistry.ts)** - Central slide registry
- Imports all slide components
- Exports `allSlides` array that scripts will iterate through

📄 **[src/slides/SlideMetadata.ts](src/slides/SlideMetadata.ts)** - Type definitions
- `AudioSegment` interface with `narrationText` field
- `SlideMetadata` interface
- `SlideComponentWithMetadata` type

📄 **[src/slides/AnimatedSlides.tsx](src/slides/AnimatedSlides.tsx)** - Slide components with metadata
- Contains all slide components with complete metadata
- Each slide has `audioSegments` array with `narrationText` for TTS generation
- Covers chapters 1, 3, 4, 5, 6, 7, 8, 9

📄 **[src/components/ImpactComponents.tsx](src/components/ImpactComponents.tsx)** - Additional slides
- Contains Ch7_S3_CostCurve and Ch7_S4_QualityComparison

📄 **[src/slides/TeamCollaborationSlide.tsx](src/slides/TeamCollaborationSlide.tsx)** - Multi-segment example
- Example of 8-segment slide (Ch2_S1)
- Shows how `useSegmentedAnimation()` works
- Reference implementation (not yet in registry)

### 3. Python TTS Server (Existing Infrastructure)
📄 **[../tts/server.py](../tts/server.py)** - Flask TTS server
- Runs VibeVoice model on GPU
- Endpoints: `/health`, `/generate`, `/generate_batch`
- Returns base64-encoded WAV files

📄 **[../tts/client.py](../tts/client.py)** - Python reference client
- Shows how to call server endpoints
- Batch processing example
- Base64 decoding logic

📄 **[../tts/README.md](../tts/README.md)** - TTS system documentation
- Setup instructions
- Server startup commands
- Network configuration

### 4. Project Configuration
📄 **[package.json](package.json)** - npm dependencies and scripts
- Will need to add:
  - `axios` - HTTP client
  - `get-audio-duration` - Audio duration calculator
  - `tsx` - TypeScript executor
  - `@types/node` - Node.js types
- Will need to add scripts:
  - `"tts:generate": "tsx scripts/generate-tts.ts"`
  - `"tts:duration": "tsx scripts/calculate-durations.ts"`

### 5. Existing Scripts (For Reference)
📄 **[scripts/capture.ts](scripts/capture.ts)** - Example TypeScript script
- Shows how to structure a TypeScript CLI script
- Axios usage examples
- File I/O patterns

📄 **[scripts/merge-audio.ts](scripts/merge-audio.ts)** - Audio processing example
- Shows audio file handling
- Path resolution patterns

## File Structure Overview

```
react_cogs_demo/
├── TTS_GENERATION_PLAN.md          # ⭐ MAIN IMPLEMENTATION PLAN
├── TTS_HANDOFF.md                  # ⭐ THIS FILE
├── package.json                    # Dependencies & scripts
├── src/
│   ├── slides/
│   │   ├── SlidesRegistry.ts       # ⭐ Slide data source
│   │   ├── SlideMetadata.ts        # ⭐ Type definitions
│   │   ├── AnimatedSlides.tsx      # ⭐ Slide metadata with narrationText
│   │   └── TeamCollaborationSlide.tsx
│   ├── components/
│   │   └── ImpactComponents.tsx    # Additional slides
│   └── contexts/
│       └── SegmentContext.tsx      # Segment state management
├── scripts/                        # ⭐ WHERE YOU'LL CREATE NEW FILES
│   ├── generate-tts.ts             # ⭐ TO BE CREATED
│   ├── calculate-durations.ts      # ⭐ TO BE CREATED
│   ├── capture.ts                  # Reference example
│   └── merge-audio.ts              # Reference example
└── public/audio/                   # ⭐ OUTPUT DIRECTORY
    ├── c1/                         # Chapter 1 audio files (to be generated)
    ├── c2/                         # Chapter 2 audio files (to be generated)
    └── ...

../tts/                             # Python TTS server (existing)
├── server.py                       # ⭐ TTS server to call
├── client.py                       # ⭐ Reference implementation
└── README.md                       # Setup instructions
```

## Implementation Checklist

### Phase 1: Setup (15 minutes)
- [ ] Read [TTS_GENERATION_PLAN.md](TTS_GENERATION_PLAN.md) thoroughly
- [ ] Review [src/slides/SlidesRegistry.ts](src/slides/SlidesRegistry.ts) to understand data structure
- [ ] Check [src/slides/SlideMetadata.ts](src/slides/SlideMetadata.ts) for types
- [ ] Install dependencies:
  ```bash
  npm install axios get-audio-duration tsx @types/node
  ```
- [ ] Update [package.json](package.json) with new scripts

### Phase 2: TTS Generation Script (2-3 hours)
- [ ] Create `scripts/generate-tts.ts`
- [ ] Implement TypeScript client that calls `/generate_batch` endpoint
- [ ] Copy implementation from [TTS_GENERATION_PLAN.md](TTS_GENERATION_PLAN.md) lines 56-255
- [ ] Test with Python server running:
  ```bash
  cd ../tts
  python server.py --voice-sample path/to/voice.wav
  ```
- [ ] Verify batch processing works correctly
- [ ] Test error handling (server down, timeout, etc.)

### Phase 3: Duration Calculation Script (1 hour)
- [ ] Create `scripts/calculate-durations.ts`
- [ ] Copy implementation from [TTS_GENERATION_PLAN.md](TTS_GENERATION_PLAN.md) lines 360-500
- [ ] Test with generated audio files
- [ ] Verify JSON report generation

### Phase 4: Testing & Validation (1 hour)
- [ ] Generate small batch (first 10 segments only for testing)
- [ ] Calculate durations for test batch
- [ ] Verify file naming matches expected pattern
- [ ] Generate full audio library (~160 segments)
- [ ] Calculate all durations
- [ ] Review duration-report.json

## Key Implementation Notes

### Batch Processing Strategy
- **Default batch size**: 10 segments per request
- **Configurable**: Set `BATCH_SIZE` environment variable
- **Error handling**: Failed batches can be retried with `--skip-existing`
- **Progress tracking**: Shows percentage completion

### File Naming Convention
```
public/audio/cX/sY_segment_ZZ_id.wav

Where:
- X = Chapter number
- Y = Slide number within chapter
- ZZ = Segment number (zero-padded)
- id = Segment ID from metadata (e.g., "intro", "ai_generation")

Examples:
- c1/s1_segment_01_intro.wav
- c1/s1_segment_02_ai_generation.wav
- c2/s1_segment_01_intro.wav
```

### Server API Reference

**Health Check:**
```bash
GET http://localhost:5000/health
Response: { "status": "ok", "model_loaded": true, "device": "cuda", "gpu_name": "..." }
```

**Batch Generation:**
```bash
POST http://localhost:5000/generate_batch
Body: { "texts": ["Speaker 0: text1", "Speaker 0: text2", ...] }
Response: { "success": true, "audios": ["base64...", "base64..."], "sample_rate": 24000, "count": 2 }
```

### Data Flow

```
SlidesRegistry.ts (allSlides array)
    ↓
Read each slide.metadata.audioSegments
    ↓
Extract segment.narrationText
    ↓
Group into batches of 10
    ↓
Call /generate_batch endpoint
    ↓
Decode base64 audio
    ↓
Save as public/audio/cX/sY_segment_ZZ_id.wav
```

## Expected Output

### Total Files to Generate
- **~160 audio files** across 20 slides
- **16 batches** (10 segments per batch)
- **Format**: WAV, 24kHz mono
- **Total time**: 15-20 minutes with batch processing

### Directory Structure After Generation
```
public/audio/
├── c1/ (17 files)
├── c2/ (8 files)
├── c3/ (7 files)
├── c4/ (7 files)
├── c5/ (10 files)
├── c6/ (15 files)
├── c7/ (25 files)
├── c8/ (4 files)
└── c9/ (11 files)
```

## Troubleshooting

### Server Connection Issues
```bash
# Check if server is running
curl http://localhost:5000/health

# Check server logs
cd ../tts
# Look for startup messages and errors
```

### Missing Narration Text
- All slides in registry should have `narrationText` in metadata
- If missing, check [src/slides/AnimatedSlides.tsx](src/slides/AnimatedSlides.tsx)
- Verify metadata was properly populated

### TypeScript Compilation Errors
```bash
# Ensure types are installed
npm install @types/node --save-dev

# Check tsconfig.json is correct
# Should have "module": "ESNext" and proper paths
```

## Success Criteria

✅ **TTS Generation:**
- Script runs without errors
- Generates ~160 audio files
- Files organized by chapter in correct structure
- Batch processing shows progress
- Summary report shows totals

✅ **Duration Calculation:**
- Calculates duration for all audio files
- Exports JSON report with per-segment and per-slide durations
- Shows total presentation time
- Handles missing files gracefully

## Contact & Questions

If you need clarification on:
- **Slide metadata structure** → Check [src/slides/SlideMetadata.ts](src/slides/SlideMetadata.ts)
- **TTS server API** → Check [../tts/server.py](../tts/server.py) and [../tts/client.py](../tts/client.py)
- **Implementation details** → Refer to [TTS_GENERATION_PLAN.md](TTS_GENERATION_PLAN.md)
- **Batch processing logic** → See Python client [../tts/client.py](../tts/client.py) `generate_audio_batch_remote()` function

## Timeline Estimate

- **Setup & dependencies**: 15 minutes
- **TTS generation script**: 2-3 hours
- **Duration calculation script**: 1 hour
- **Testing & validation**: 1 hour
- **Audio generation**: 15-20 minutes (actual TTS)

**Total**: 4-6 hours development + 20 minutes generation

Good luck! The implementation plan is comprehensive and all context files are listed above. 🚀