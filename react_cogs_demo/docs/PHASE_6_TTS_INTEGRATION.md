# Phase 6: TTS Workflow Integration - Implementation Report

**Status**: ✅ Complete  
**Date**: 2025-01-21  
**Phase**: 6 of Narration Externalization Plan

## Overview

Phase 6 successfully integrates the TTS generation workflow with the narration JSON system, enabling audio regeneration from externalized narration files instead of hardcoded React components.

## Objectives Completed

✅ Update [`generate-tts.ts`](../scripts/generate-tts.ts) to load narration from JSON files  
✅ Update [`check-tts-cache.ts`](../scripts/check-tts-cache.ts) to integrate with narration changes  
✅ Implement backend API regenerate-audio endpoint in [`narration-api.cjs`](../server/narration-api.cjs)  
✅ Create helper script [`generate-single-tts.ts`](../scripts/generate-single-tts.ts)  
✅ Add npm script `tts:from-json`  
✅ TypeScript compilation verified (0 errors)

---

## Implementation Details

### 1. Updated generate-tts.ts

**File**: [`scripts/generate-tts.ts`](../scripts/generate-tts.ts)

#### New Features

- **Narration JSON Loading**: Loads narration from `public/narration/{demo-id}/narration.json`
- **Hybrid Mode**: Falls back to inline narration if JSON not found
- **`--from-json` Flag**: Enforces JSON exclusively (fails if JSON missing)
- **Narration Cache Updates**: Updates `narration-cache.json` after successful generation
- **JSON Merge**: Merges JSON narration into slide metadata before generation

#### Key Functions Added

```typescript
// Load narration JSON for a demo
function loadNarrationJson(demoId: string): NarrationData | null

// Get narration text from JSON data
function getNarrationText(
  narrationData: NarrationData | null,
  chapter: number,
  slide: number,
  segmentId: string
): string | null

// Update narration cache after TTS generation
function updateNarrationCache(
  demoId: string,
  slides: SlideComponentWithMetadata[]
): void
```

#### Usage

```bash
# Standard mode (uses JSON if available, falls back to inline)
npm run tts:generate

# JSON-only mode (fails if narration.json missing)
npm run tts:from-json

# Specific demo
npm run tts:generate -- --demo meeting-highlights

# JSON-only for specific demo
npm run tts:from-json -- --demo meeting-highlights
```

#### Workflow

1. Load narration JSON from `public/narration/{demo-id}/narration.json`
2. Load slide metadata from demo's SlidesRegistry
3. Merge JSON narration into slide segments (overrides inline)
4. Generate TTS audio via batch API
5. Update TTS cache (`.tts-narration-cache.json`)
6. Update narration cache (`public/narration/{demo-id}/narration-cache.json`)

---

### 2. Updated check-tts-cache.ts

**File**: [`scripts/check-tts-cache.ts`](../scripts/check-tts-cache.ts)

#### New Features

- **Two-Step Validation**: Checks both narration JSON and TTS audio
- **Narration Change Detection**: Compares narration.json against narration-cache.json
- **Integrated Reporting**: Shows narration and TTS changes together
- **Smart Prompts**: Recommends regeneration when changes detected

#### Key Functions Added

```typescript
// Check narration JSON changes for a demo
function checkNarrationChanges(demoId: string): {
  hasChanges: boolean;
  changedCount: number;
  missingCount: number;
  details: string[];
}
```

#### Workflow

**Step 1: Check Narration JSON**
- Loads `public/narration/{demo-id}/narration.json`
- Loads `public/narration/{demo-id}/narration-cache.json`
- Compares SHA-256 hashes of narration text
- Reports: new segments, changed segments

**Step 2: Check TTS Audio**
- Loads `.tts-narration-cache.json`
- Compares inline/JSON narration against cached values
- Scans for missing audio files
- Detects orphaned files and cache entries

**Step 3: Summary & Prompt**
- Shows affected demos
- Shows narration JSON changes count
- Shows TTS audio changes count
- Prompts user to regenerate (runs `npm run tts:generate -- --skip-existing`)

#### Output Example

```
═══════════════════════════════════════════════════════════════════
🔍 TTS Cache & Narration Validation (Multi-Demo)
═══════════════════════════════════════════════════════════════════

📋 Step 1: Checking narration JSON files...

⚠️  Narration JSON changes detected!

   📁 meeting-highlights:
      - Changed: 3
      - New: 1
        🔄 Changed: ch1:s2:intro
        🔄 Changed: ch1:s2:bizchat
        🔄 Changed: ch2:s1:odsp
        📝 New: ch9:s2:cta

   💡 TTS regeneration recommended for these changes.

──────────────────────────────────────────────────────────────────
📋 Step 2: Checking TTS audio cache...

──────────────────────────────────────────────────────────────────
📁 Checking demo: meeting-highlights
──────────────────────────────────────────────────────────────────
✅ All audio files are up-to-date for this demo

═══════════════════════════════════════════════════════════════════
⚠️  Changes Detected - TTS Regeneration Recommended
═══════════════════════════════════════════════════════════════════

Demos affected: meeting-highlights
   📝 Narration JSON changes: 4

Do you want to regenerate? (y/n):
```

---

### 3. Backend API: Regenerate Audio Endpoint

**File**: [`server/narration-api.cjs`](../server/narration-api.cjs)

#### New Endpoint

**POST** `/api/narration/regenerate-audio`

**Request Body**:
```json
{
  "demoId": "meeting-highlights",
  "chapter": 1,
  "slide": 2,
  "segmentId": "intro",
  "narrationText": "Welcome to the presentation..."
}
```

**Success Response** (200):
```json
{
  "success": true,
  "audioPath": "/audio/meeting-highlights/c1/s2_segment_intro.wav?t=1737468123456",
  "message": "TTS audio regenerated successfully",
  "fileSize": 245760,
  "timestamp": "2025-01-21T09:02:03.456Z"
}
```

**Error Responses**:

- **400**: Missing required parameters
- **500**: TTS generation failed
- **503**: TTS server not available

#### Implementation

1. Validates request parameters
2. Executes [`generate-single-tts.ts`](../scripts/generate-single-tts.ts) via `npx tsx`
3. Waits for TTS generation (2 minute timeout)
4. Verifies audio file created
5. Returns audio path with cache-busting timestamp
6. Updates both TTS cache and narration cache

#### Error Handling

- **TTS Server Down**: Returns 503 with helpful error message
- **Generation Failure**: Returns 500 with error details
- **Timeout**: Returns 500 after 2 minutes
- **File Not Created**: Returns 500 with error

---

### 4. Single-Segment TTS Generator

**File**: [`scripts/generate-single-tts.ts`](../scripts/generate-single-tts.ts)

#### Purpose

Generates TTS audio for a single segment on-demand. Used by backend API for browser-triggered regeneration.

#### Usage

```bash
tsx scripts/generate-single-tts.ts \
  --demo meeting-highlights \
  --chapter 1 \
  --slide 2 \
  --segment intro \
  --text "Welcome to the presentation"
```

#### Workflow

1. **Validate Parameters**: Ensures all required args present
2. **Check TTS Server**: Verifies server health before generation
3. **Generate Audio**: Calls `/generate` endpoint with narration text
4. **Save Audio File**: Writes to `public/audio/{demo-id}/c{chapter}/s{slide}_segment_{id}.wav`
5. **Update TTS Cache**: Updates `.tts-narration-cache.json`
6. **Update Narration Cache**: Updates `public/narration/{demo-id}/narration-cache.json`

#### Features

- **Health Check**: Verifies TTS server before generation
- **Dual Cache Updates**: Updates both TTS and narration caches
- **Error Handling**: Clear error messages for debugging
- **Progress Logging**: Shows generation progress
- **File Verification**: Confirms audio file created

---

### 5. NPM Scripts Added

**File**: [`package.json`](../package.json)

```json
{
  "scripts": {
    "tts:from-json": "tsx scripts/generate-tts.ts --from-json"
  }
}
```

**Usage**:

```bash
# Generate TTS using JSON exclusively (fails if JSON missing)
npm run tts:from-json

# Generate for specific demo
npm run tts:from-json -- --demo meeting-highlights
```

---

## Integration Workflow

### End-to-End: Edit → Save → Regenerate

1. **User edits narration** in browser (NarrationEditModal)
2. **Click "Save"** → Saves to `narration.json` via API
3. **Click "Save & Regenerate Audio"**:
   - Saves narration.json
   - Calls `/api/narration/regenerate-audio`
   - Backend executes `generate-single-tts.ts`
   - TTS server generates audio
   - Audio file saved to `public/audio/`
   - Both caches updated
   - Browser receives new audio path with timestamp
4. **Audio automatically reloads** in browser (cache-busted URL)

### Cache Synchronization

**Two separate caches**:

1. **TTS Cache** (`.tts-narration-cache.json`):
   - Tracks TTS audio generation
   - Maps audio files to narration text
   - Used by `generate-tts.ts` for change detection

2. **Narration Cache** (`public/narration/{demo-id}/narration-cache.json`):
   - Tracks narration JSON changes
   - Maps segments to SHA-256 hashes
   - Used by `check-narration.ts` and `check-tts-cache.ts`

**Both caches updated together** to maintain synchronization:
- After TTS generation (batch or single)
- After narration save (via API)

---

## Testing Results

### TypeScript Compilation

✅ **PASSED** - 0 errors

```bash
$ cd react_cogs_demo && npx tsc --noEmit
# Exit code: 0
```

### Manual Testing Scenarios

✅ **Scenario 1**: Load narration from JSON
- Edit narration.json manually
- Run `npm run tts:from-json`
- Verify audio generated with JSON text

✅ **Scenario 2**: Fallback to inline narration
- Remove narration.json
- Run `npm run tts:generate`
- Verify audio generated with inline text

✅ **Scenario 3**: --from-json enforcement
- Remove narration.json
- Run `npm run tts:from-json`
- Verify error: "narration.json not found"

✅ **Scenario 4**: Cache synchronization
- Generate TTS with `npm run tts:generate`
- Run `npm run check-narration`
- Verify no changes detected

✅ **Scenario 5**: Narration change detection
- Edit narration.json
- Run `npm run check-tts-cache`
- Verify narration changes detected
- Verify prompt to regenerate

✅ **Scenario 6**: Single-segment regeneration (requires TTS server)
- Start narration API: `npm run narration-api`
- Edit narration in browser
- Click "Save & Regenerate Audio"
- Verify audio file updated
- Verify both caches updated

---

## File Changes Summary

### Modified Files

1. **[`scripts/generate-tts.ts`](../scripts/generate-tts.ts)** (169 lines added)
   - Added narration JSON loading
   - Added --from-json flag
   - Added narration cache updates
   - Added merge logic

2. **[`scripts/check-tts-cache.ts`](../scripts/check-tts-cache.ts)** (86 lines added)
   - Added narration change detection
   - Added two-step validation
   - Enhanced reporting

3. **[`server/narration-api.cjs`](../server/narration-api.cjs)** (88 lines modified)
   - Implemented regenerate-audio endpoint
   - Added TTS script execution
   - Added error handling

4. **[`package.json`](../package.json)** (1 line added)
   - Added tts:from-json script

### Created Files

5. **[`scripts/generate-single-tts.ts`](../scripts/generate-single-tts.ts)** (233 lines)
   - Single-segment TTS generator
   - CLI argument parsing
   - Health check
   - Dual cache updates

---

## Dependencies

### Runtime Dependencies

- **Python TTS Server**: Must be running on `http://localhost:5000` (or configured URL)
- **Narration API Server**: Must be running on `http://localhost:3001` for browser regeneration
- **narration.json files**: Optional (falls back to inline) unless `--from-json` used

### NPM Dependencies

All dependencies already installed (no new packages required):
- `axios` - HTTP requests to TTS server
- `tsx` - TypeScript execution
- `express` - Backend API
- `crypto` (Node.js built-in) - SHA-256 hashing

---

## API Reference

### TTS Generation Scripts

#### generate-tts.ts

**Flags**:
- `--demo <id>` - Generate for specific demo only
- `--skip-existing` - Skip segments with unchanged narration
- `--from-json` - Use JSON exclusively (fail if missing)

**Examples**:
```bash
# All demos, all segments
npm run tts:generate

# All demos, skip unchanged
npm run tts:generate -- --skip-existing

# Specific demo, JSON only
npm run tts:from-json -- --demo meeting-highlights

# Specific demo, skip unchanged
npm run tts:generate -- --demo meeting-highlights --skip-existing
```

#### generate-single-tts.ts

**Arguments** (all required):
- `--demo <id>` - Demo identifier
- `--chapter <num>` - Chapter number
- `--slide <num>` - Slide number
- `--segment <id>` - Segment identifier
- `--text "<narration>"` - Narration text

**Example**:
```bash
tsx scripts/generate-single-tts.ts \
  --demo meeting-highlights \
  --chapter 1 \
  --slide 2 \
  --segment intro \
  --text "Welcome to Meeting Highlights"
```

### Backend API Endpoints

#### POST /api/narration/regenerate-audio

**Request**:
```typescript
{
  demoId: string;        // Demo identifier
  chapter: number;       // Chapter number
  slide: number;         // Slide number
  segmentId: string;     // Segment identifier
  narrationText: string; // Narration text to convert
}
```

**Response** (Success):
```typescript
{
  success: true;
  audioPath: string;     // Path with cache-busting timestamp
  message: string;       // Success message
  fileSize: number;      // Audio file size in bytes
  timestamp: string;     // ISO 8601 timestamp
}
```

**Response** (Error):
```typescript
{
  success: false;
  error: string;         // Error message
  details?: string;      // Additional details
  serverError?: boolean; // True if TTS server down
}
```

---

## Troubleshooting

### Issue: "Cannot connect to TTS server"

**Cause**: Python TTS server not running

**Solution**:
```bash
cd tts
python server.py --voice-sample path/to/voice.wav
```

### Issue: "narration.json not found" with --from-json

**Cause**: No narration.json file exists for demo

**Solution**:
1. Run extraction script first:
   ```bash
   npm run extract-narration
   ```
2. Or remove `--from-json` flag to use inline narration

### Issue: Narration changes not detected

**Cause**: Narration cache out of sync

**Solution**:
```bash
# Delete narration cache
rm public/narration/*/narration-cache.json

# Regenerate TTS (will recreate cache)
npm run tts:generate
```

### Issue: TTS generation timeout

**Cause**: Segment narration too long (>2 minutes to generate)

**Solution**:
1. Check TTS server logs for errors
2. Split long narration into multiple segments
3. Increase timeout in `generate-single-tts.ts` if needed

---

## Future Enhancements

### Potential Improvements

1. **Batch Single-Segment Generation**: Regenerate multiple segments at once from browser
2. **Progress Feedback**: Real-time progress updates during TTS generation
3. **Audio Preview**: Play audio in browser before saving
4. **Diff Viewer**: Show what changed in narration before regenerating
5. **Queue System**: Queue multiple regeneration requests
6. **Retry Logic**: Automatic retry on TTS server errors
7. **Concurrent Generation**: Generate multiple demos in parallel

---

## Conclusion

Phase 6 successfully integrates the TTS workflow with the narration JSON system:

✅ **JSON Loading**: generate-tts.ts loads narration from JSON files  
✅ **Change Detection**: check-tts-cache.ts detects narration changes  
✅ **API Integration**: Backend API regenerates single segments  
✅ **Cache Sync**: Both TTS and narration caches stay synchronized  
✅ **Browser Support**: Complete edit→save→regenerate workflow  
✅ **Backward Compatible**: Falls back to inline narration gracefully  
✅ **Type Safe**: 0 TypeScript errors  

The integration enables a seamless workflow where narration can be edited in JSON files or via the browser UI, with automatic TTS regeneration and cache management.

---

**Next Steps**: See [`NARRATION_EXTERNALIZATION_PLAN.md`](NARRATION_EXTERNALIZATION_PLAN.md) for remaining phases (Phase 7: Migration & Cleanup, Phase 8: Testing, Phase 9: Documentation).