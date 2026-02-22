# Recording Guide

## OBS Automated Recording

Record any demo with a single command using the OBS WebSocket integration.

### One-Time OBS Setup

1. **Install OBS** if not already installed
2. **Enable WebSocket Server**: Tools > WebSocket Server Settings > Enable WebSocket Server (default port: 4455)
3. **Note the password** (or disable authentication for local use)
4. **Configure output settings** (recommended):
   - Settings > Output > Recording
   - Format: MP4 or MKV
   - Encoder: GPU encoder (NVENC/AMF/QuickSync) if available
   - Quality: CRF 18 for high quality

The script will automatically create a Browser source named `Presentation` in your current scene if one doesn't exist.

### Usage

Start the dev server first, then run:

```bash
npm run record:obs -- --demo <demo-id> --password <obs-password>
```

Or set the password as an environment variable:

```bash
export OBS_WEBSOCKET_PASSWORD=your-password
npm run record:obs -- --demo <demo-id>
```

### CLI Options

| Option | Default | Description |
|--------|---------|-------------|
| `--demo <id>` | (required) | Demo ID to record |
| `--password <pw>` | `$OBS_WEBSOCKET_PASSWORD` | OBS WebSocket password |
| `--resolution <WxH>` | `2560x1440` | Browser source resolution |
| `--dev-port <N>` | `5173` | Vite dev server port |
| `--source <name>` | `Presentation` | OBS Browser source name |
| `--buffer <seconds>` | `10` | (unused with signal — kept for compatibility) |
| `--port <N>` | `4455` | OBS WebSocket port |
| `--no-rename` | | Keep OBS's timestamp filename |

### Examples

```bash
# Basic recording
npm run record:obs -- --demo highlights-deep-dive --password mypass

# 1080p recording with longer buffer
npm run record:obs -- --demo highlights-deep-dive --password mypass --resolution 1920x1080 --buffer 15

# Dev server on non-standard port
npm run record:obs -- --demo highlights-deep-dive --password mypass --dev-port 5175
```

### What the Script Does

1. Reads `durationInfo.total` from the demo's `metadata.ts`
2. Starts a local HTTP signal server on a random port
3. Connects to OBS via WebSocket
4. Creates or updates the Browser source with autoplay URL (`?demo=X&autoplay=narrated&hideUI&zoom&signal=PORT`)
5. Refreshes the Browser source to load the page
6. Waits 3 seconds for page load
7. Starts OBS recording and shows a progress timer
8. Waits for the app to send a completion signal to `http://localhost:PORT/complete` (safety timeout: 1.5x estimated duration)
9. Stops recording after a 2-second buffer for the final slide
10. Renames the output file to `{demo-id}.{ext}` (retries if file is still locked by OBS)
11. Generates a `-words.json` (word timestamps in video time) and `.vtt` subtitle file from segment events + alignment data

### Subtitles (VTT)

The recording script automatically generates a WebVTT subtitle file (`.vtt`) alongside the video. The VTT contains per-word timestamps for karaoke-style highlighting, derived from:

1. **Segment timing events** — captured live during recording via the signal server
2. **WhisperX alignment data** — word-level timestamps from `alignment.json`

**Prerequisites:**
- Run `npm run tts:align -- --demo <demo-id>` before recording to generate word-level alignment data

**Output files:**
- `{demo-id}.vtt` — WebVTT subtitle file with per-word timestamps (next to the video)
- `{demo-id}-words.json` — Word-level timing data in video time; can be used to regenerate VTT without re-recording

**Subtitle corrections:** TTS narration uses phonetic spellings for better pronunciation (e.g., "Kwen" for "Qwen", "EvYatar" for "Evyatar"). To display correct spellings in subtitles, create a `subtitle-corrections.json` in the demo's audio directory:

```
public/audio/{demo-id}/subtitle-corrections.json
```

```json
{
  "kwen": "Qwen",
  "evyatar": "Evyatar",
  "l-l-m": "LLM"
}
```

Keys are lowercase TTS forms; values are the correct display forms. Both forms are stored in the `-words.json` output (`word` for display, `ttsWord` when different).

**Using subtitles:**
- **VLC**: Open video, then Subtitle > Add Subtitle File > select the `.vtt`
- **Web**: Use `<track kind="subtitles" src="file.vtt">` in a `<video>` element
- **YouTube/Vimeo**: Upload the `.vtt` as a subtitle track

### Troubleshooting

- **"connect ECONNREFUSED"**: OBS isn't running or WebSocket Server isn't enabled
- **"authentication is required"**: Pass `--password` or set `OBS_WEBSOCKET_PASSWORD`
- **"No source was found"**: The script auto-creates sources now; if using a custom `--source` name, ensure it matches
- **No audio in recording**: Make sure OBS is capturing desktop/application audio (Audio Mixer panel)
- **Recording is blank**: Ensure the dev server is running on the expected port

## Autoplay URL Parameters

The app supports URL query parameters for automated playback:

| Parameter | Description |
|-----------|-------------|
| `demo=<id>` | Skip welcome screen, load demo directly |
| `autoplay=narrated` | Auto-start narrated playback |
| `hideUI` | Hide the progress bar and back button |
| `zoom` | Enable zoom mode |
| `signal=<port>` | Signal port for completion notification (used by record:obs) |

Examples:
- `http://localhost:5173?demo=highlights-deep-dive` — Show demo with StartOverlay
- `http://localhost:5173?demo=highlights-deep-dive&autoplay=narrated&hideUI&zoom` — Full autoplay

In OBS's Browser source, audio autoplay works without user interaction. In regular browsers, a "Click anywhere to start" overlay appears due to browser autoplay policy.

## Playwright Video Recording

For recording without OBS (uses CDP screencast + ffmpeg):

```bash
npm run test:record -- --demo <demo-id>
npm run test:record -- --demo <demo-id> --fps 60
npm run test:record -- --demo <demo-id> --viewport 1920x1080
```

Requires the dev server running and `ffmpeg` installed. See `tests/record.spec.ts` for details.
