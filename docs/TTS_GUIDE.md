# TTS Audio Generation Guide

## Overview

The system uses a Python Flask server with VibeVoice model to generate high-quality text-to-speech audio. Smart caching tracks narration text changes to only regenerate modified segments.

## Setup

### Start TTS Server

```bash
cd tts
python server.py --voice-sample path/to/voice.wav
```

The server runs on `http://localhost:5000` by default.

See `tts/README.md` for detailed server setup instructions.

## Generating Audio

### Generate All Demos

```bash
npm run tts:generate
```

Scans all demos in `src/demos/` and generates audio for segments with narration text.

### Generate Specific Demo

```bash
npm run tts:generate -- --demo meeting-highlights
```

### With TTS Style Instruction

```bash
npm run tts:generate -- --demo meeting-highlights --instruct "speak slowly and clearly"
```

The `--instruct` flag sets a demo-wide TTS style instruction (lowest priority). See [Instruct Hierarchy](#instruct-hierarchy) below.

### Smart Caching (Default)

By default, the generator skips segments whose audio file already exists and whose narration text and instruct haven't changed (based on the TTS cache). Only new or modified segments are generated.

### Regenerate Specific Segments

```bash
npm run tts:generate -- --demo meeting-highlights --segments ch1:s2:intro,ch1:s2:details,ch3:s1:summary
```

Regenerates only the listed segments, bypassing cache checks. All other segments are skipped entirely. Requires `--demo`. The format is `ch{N}:s{N}:{segmentId}`. Orphan cleanup is skipped in this mode. Unmatched segment keys produce a warning.

### Force Regeneration

```bash
npm run tts:generate -- --force
```

Regenerates all audio files, ignoring the cache.

## Smart Caching

### How It Works

The cache (`.tts-narration-cache.json`) tracks narration text and instruct per audio file:

```json
{
  "meeting-highlights": {
    "c0/s1_segment_01_intro.wav": {
      "narrationText": "Welcome to Meeting Highlights...",
      "instruct": "speak slowly and clearly",
      "generatedAt": "2025-01-20T10:30:00.000Z"
    }
  }
}
```

Inline markers (`{#id}`, `{id#}`) are stripped before caching and comparison — they don't affect TTS audio and won't trigger regeneration. Only the clean spoken text and instruct are factored into cache validity.

When you run generation:
1. Script reads all slide narration text, strips markers, and resolves instruct
2. Compares stripped text + instruct against cache
3. Only regenerates files where spoken text or instruct changed
4. Updates cache with stripped narration text and instruct

### Pre-flight Cache Check

Before `npm run dev`, the system automatically checks for narration changes:

```
Checking TTS cache for changes...
Found 3 changed narration texts in meeting-highlights:
  - c1/s1_segment_01_intro.wav
  - c1/s2_segment_03_detail.wav
  - c2/s1_segment_05_conclusion.wav

Do you want to regenerate these files? (y/n)
```

Answer `y` to regenerate automatically, or `n` to skip.

### Skip Cache Check

```bash
npm run dev:skip-cache
```

## Audio Duration Analysis

### Calculate Durations

```bash
# All demos
npm run tts:duration

# Specific demo
npm run tts:duration -- --demo meeting-highlights
```

Generates `duration-report.json` and automatically updates `durationInfo` in each demo's `metadata.ts`:

```json
{
  "meeting-highlights": {
    "totalDuration": 247,
    "chapters": {
      "c0": 5,
      "c1": 45,
      "c2": 62,
      ...
    },
    "slides": [
      {
        "chapter": 0,
        "slide": 1,
        "duration": 5,
        "segments": [...]
      }
    ]
  }
}
```

## Batch Processing

Generation processes segments in batches for efficient GPU utilization:

- Default: 10 segments per batch
- Configurable via `BATCH_SIZE` environment variable
- Progress tracking with percentage completion

```bash
BATCH_SIZE=20 npm run tts:generate
```

## Audio File Naming

Pattern: `s{slide}_segment_{number}_{id}.wav`

Examples:
- `s1_segment_01_intro.wav` - Slide 1, segment 1, id "intro"
- `s2_segment_03_detail.wav` - Slide 2, segment 3, id "detail"

## Audio Specifications

- **Format**: WAV
- **Sample Rate**: 24kHz
- **Channels**: Mono
- **Location**: `public/audio/{demo-id}/c{chapter}/`

## Fallback System

If audio files are missing, the system falls back to 1-second silence:
- No presentation crashes
- Console warnings for debugging
- Allows development without complete audio

## Orphaned File Cleanup

The system automatically detects and removes orphaned audio files:

1. Scans `public/audio/{demo-id}/` directories
2. Compares against slides in `SlidesRegistry.ts`
3. Identifies files not referenced by any slide
4. Prompts for deletion before removing

During cache check:
```
Found 2 orphaned audio files:
  - c3/s5_segment_01_old.wav
  - c4/s2_segment_02_removed.wav

Do you want to remove these unused files? (y/n)
```

## Instruct Hierarchy

The `instruct` parameter controls TTS voice style/tone (supported by Qwen3-TTS). It follows a three-level hierarchy mirroring the timing system:

**Resolution order** (most specific wins):
```
AudioSegment.instruct → SlideMetadata.instruct → NarrationJSON.instruct → DemoConfig.instruct → CLI --instruct
```

### Setting instruct at each level

**Demo-level** (in `index.ts`):
```typescript
const demoConfig: DemoConfig = {
  metadata,
  instruct: 'speak with a professional, clear tone',
  getSlides: async () => { ... }
};
```

**Slide-level** (in chapter file):
```typescript
export const Ch1_S1_Intro = defineSlide({
  metadata: {
    chapter: 1, slide: 1, title: 'Intro',
    instruct: 'speak with excitement and energy',
    audioSegments: [...]
  },
  component: () => <div>...</div>
});
```

**Segment-level** (in audio segment):
```typescript
audioSegments: [
  {
    id: 'whisper',
    audioFilePath: '/audio/demo/c1/s1_segment_01_whisper.wav',
    narrationText: 'This is a secret...',
    instruct: 'speak in a soft whisper',
  }
]
```

**Narration JSON** (all three levels):
```json
{
  "demoId": "my-demo",
  "instruct": "speak clearly with a warm tone",
  "slides": [
    {
      "chapter": 1, "slide": 1,
      "instruct": "speak with excitement",
      "segments": [
        { "id": "intro", "narrationText": "...", "instruct": "speak softly" }
      ]
    }
  ]
}
```

**CLI fallback** (lowest priority):
```bash
npm run tts:generate -- --demo my-demo --instruct "speak slowly and clearly"
```

### Cache behavior

Changing the instruct for a segment triggers TTS regeneration (the instruct value is included in the cache hash). The narration cache (`narration-cache.json`) also factors instruct into its hashes.

## Inline Markers

### Marker Syntax in Narration Text

Narration text can contain inline marker tokens that define animation cue points within a segment's audio:

- **`{#id}`** (forward anchor) — resolves to the start time of the next word
- **`{id#}`** (backward anchor) — resolves to the end time of the preceding word

```typescript
narrationText: 'Our system uses a {#pipeline}four-stage pipeline.{done#} {#llm}The transcript goes into an LLM.'
```

Markers are purely metadata for the alignment system. They do not affect how the text sounds.

### Marker Stripping During Generation

`tts:generate` automatically strips all `{#id}` and `{id#}` tokens from narration text before sending it to the TTS server. The audio file contains only the clean spoken text. No special flags are needed — stripping is always on.

### Generating Alignment Data

After generating audio, run the alignment command to resolve marker positions to timestamps:

```bash
# Align all segments for a demo
npm run tts:align -- --demo my-demo

# Force re-alignment (ignore cache)
npm run tts:align -- --demo my-demo --force

# Align specific segments only
npm run tts:align -- --demo my-demo --segments ch1:s2:explain
```

This sends each audio file plus its clean text to a WhisperX server for forced alignment, then maps marker positions to word-level timestamps. The result is stored in `public/audio/{demoId}/alignment.json`.

### WhisperX Server Setup

The WhisperX server handles both transcription verification and word-level forced alignment. The server script is `tts/server_whisperx.py` (port 5001):

```bash
cd tts
python server_whisperx.py --model large-v3 --port 5001
```

WhisperX provides accurate word-level timestamps needed for marker resolution. Standard Whisper only provides segment-level timestamps, which are too coarse for inline markers.

The `WHISPER_URL` environment variable works with both `tts:verify` and `tts:align`:

```bash
WHISPER_URL=http://gpu-server:5001 npm run tts:align -- --demo my-demo
```

> See [MARKERS_GUIDE.md](../presentation-app/docs/MARKERS_GUIDE.md) for the full marker syntax reference and `<RevealAtMarker>` component usage.

## Troubleshooting

### Server Not Responding

**Error**: `ECONNREFUSED` or timeout errors

**Solution**:
1. Verify TTS server is running: `cd tts && python server.py`
2. Check server is on correct port (default 5000)
3. Test server: `curl http://localhost:5000/health`

### Cache Conflicts

**Error**: Audio doesn't match narration after editing

**Solution**:
```bash
# Delete cache and regenerate
rm .tts-narration-cache.json
npm run tts:generate
```

### Missing Audio Files

**Error**: Console warnings about missing audio

**Solution**:
```bash
# Check directory structure
ls -la public/audio/{demo-id}/

# Regenerate specific demo
npm run tts:generate -- --demo {demo-id}
```

### Generation Hangs

**Error**: Script stops responding during generation

**Solution**:
1. Check TTS server logs for errors
2. Reduce batch size: `BATCH_SIZE=5 npm run tts:generate`
3. Restart TTS server
4. Run with force flag: `npm run tts:generate -- --force`

## Development Workflow

1. Edit slide narration text in components
2. Run `npm run dev`
3. Pre-flight check detects changes
4. Answer `y` to regenerate
5. Server starts with updated audio

## Verification (Whisper Transcription)

### Overview

After generating TTS audio, you can verify what the TTS actually said by transcribing it back to text using a Whisper server. This catches mispronunciations, garbled audio, and missing/extra words.

### Setup

Start the WhisperX server on the remote GPU machine (see `tts/WHISPER_SETUP.md`):

```bash
python server_whisperx.py --model large-v3 --port 5001
```

### Verify Audio

```bash
# Verify all segments for a demo
npm run tts:verify -- --demo highlights-deep-dive

# Force re-verification (ignore cache)
npm run tts:verify -- --demo highlights-deep-dive --force

# Verify specific segments only
npm run tts:verify -- --demo highlights-deep-dive --segments ch1:s2:intro,ch3:s1:summary
```

### Output

The script produces:
1. **Console table** — side-by-side comparison of original vs. transcribed text
2. **Report file** — `verification-report-{demoId}.json` with full details
3. **Verification cache** — `.tts-verification-cache.json` (keyed on audio file hash; re-runs automatically when audio changes)

### `/fix-tts` Skill

The `/fix-tts` Claude Code command runs an interactive verify-evaluate-regenerate cycle:

```
/fix-tts highlights-deep-dive
```

This will:
1. Transcribe all audio via Whisper (cached — only re-transcribes changed audio)
2. Auto-approve trivial differences (whitespace, punctuation)
3. For each flagged segment: show diff, play audio, ask the user to decide
4. Log decisions to `.tts-verification-decisions.json` for future calibration
5. Regenerate only user-flagged segments
6. Re-verify up to 3 times

Use `--force` to re-transcribe all segments regardless of cache.

**Decisions log**: Each decision records the original text, transcription, diff summary, user choice (`ok` or `regenerate`), and the reason why. Over time this log helps calibrate which differences are benign (e.g., acronym casing) vs. problematic (e.g., missing words).

### Custom Whisper URL

```bash
WHISPER_URL=http://other-server:5001 npm run tts:verify -- --demo my-demo
```

## Advanced Configuration

### Custom TTS Server URL

Set environment variable:
```bash
TTS_SERVER_URL=http://other-server:5000 npm run tts:generate
```

### Parallel Generation

For faster generation with multiple demos:
```bash
npm run tts:generate -- --demo demo-1 &
npm run tts:generate -- --demo demo-2 &
wait