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

### Skip Existing Files

```bash
npm run tts:generate -- --skip-existing
```

Only generates audio for files that don't exist yet. Useful for initial generation.

### Force Regeneration

```bash
npm run tts:generate -- --force
```

Regenerates all audio files, ignoring the cache.

## Smart Caching

### How It Works

The cache (`.tts-narration-cache.json`) tracks narration text per audio file:

```json
{
  "meeting-highlights": {
    "c0/s1_segment_01_intro.wav": {
      "narrationText": "Welcome to Meeting Highlights...",
      "generatedAt": "2025-01-20T10:30:00.000Z"
    }
  }
}
```

When you run generation:
1. Script reads all slide narration text
2. Compares against cache
3. Only regenerates files where narration text changed
4. Updates cache with new narration text

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

Generates `duration-report.json`:

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