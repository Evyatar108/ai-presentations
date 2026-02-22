# Recording Presentations with OBS

High-quality video recording of narrated presentations using OBS Studio with a Browser source.

## Prerequisites

- [OBS Studio](https://obsproject.com/) installed
- Dev server running: `npm run dev` from `presentation-app/`
- OBS WebSocket Server enabled: **Tools > WebSocket Server Settings**
- `.env.local` file in `presentation-app/` with your OBS WebSocket password (see below)

### `.env.local` Setup

Create `presentation-app/.env.local` (gitignored) with:

```
OBS_WEBSOCKET_PASSWORD=<your-password>
```

To find the password: in OBS, go to **Tools > WebSocket Server Settings > Show Connect Info**.

## Automated Recording

The `record:obs` script automates the entire recording flow via the OBS WebSocket API.

### Usage

```bash
npm run record:obs -- --demo <demo-id>
npm run record:obs -- --demo <demo-id> --resolution 1920x1080
npm run record:obs -- --demo <demo-id> --scene "My Scene"
npm run record:obs -- --demo <demo-id> --password <pw>
```

### CLI Options

| Option | Default | Description |
|--------|---------|-------------|
| `--demo` | (required) | Demo ID to record |
| `--resolution` | `2560x1440` | Canvas/source resolution (WxH) |
| `--source` | `Presentation` | Browser source name in OBS |
| `--scene` | `AI-Presentations` | Dedicated OBS scene name |
| `--buffer` | `10` | Extra seconds after completion signal |
| `--port` | `4455` | OBS WebSocket port |
| `--dev-port` | `5173` | Vite dev server port |
| `--password` | (env `OBS_WEBSOCKET_PASSWORD`) | OBS WebSocket password |
| `--no-rename` | off | Keep OBS's default output filename |

### What the Script Does

1. **Connects** to OBS via WebSocket
2. **Creates a dedicated scene** (default: "AI-Presentations") — reuses it if it already exists
3. **Switches** OBS to the dedicated scene (saves the original scene for later restoration)
4. **Creates/configures** a Browser source pointing to the demo with autoplay params
5. **Resets the Browser source transform** to fill the canvas (position 0,0, stretch to resolution)
6. **Mutes global audio inputs** (Desktop Audio, Mic/Aux, etc.) so only the Browser source's internal Chromium audio is captured
7. **Starts recording** and displays a progress timer
8. **Waits** for a completion signal from the app (or max timeout at 1.5x expected duration)
9. **Stops recording**, disables the Browser source, and renames the output file to `{demo-id}.mp4`
10. **Generates** VTT subtitles from segment timing events
11. **Restores** original mute states for all global audio inputs
12. **Switches back** to the original OBS scene

### Audio Isolation

The script ensures only the Browser source's TTS audio is captured:

1. **`reroute_audio`** is enabled on the Browser source, giving it a dedicated audio channel in OBS's mixer (instead of routing through Desktop Audio)
2. **Global audio inputs** (Desktop Audio, Mic/Aux, etc.) are muted during recording to prevent system sounds, notifications, and microphone noise from bleeding in
3. All mute states are **restored** in the cleanup phase, even if an error occurs

## Manual Recording

For manual control over the recording process:

### Setup

1. **Add a Browser source**
   - In OBS, click `+` under Sources → **Browser**
   - Set URL to `http://localhost:5173`
   - Set resolution to **2560x1440**
   - Click **OK**

2. **Open the interaction window**
   - Right-click the Browser source → **Interact**
   - This opens a browser window where you can click and navigate

3. **Configure the presentation**
   - In the Interact window, click the demo tile to open it
   - On the start overlay, enable these checkboxes:
     - **Zoom** (scales content to fill viewport)
     - **Hide interface (recording)** (removes all UI chrome)
   - Choose **Narrated** playback mode

4. **Record**
   - Close the Interact window
   - In OBS, click **Start Recording**
   - The presentation plays automatically with narration audio
   - When the start overlay reappears, click **Stop Recording**

## OBS Recording Settings (recommended)

Go to **Settings → Output → Recording**:

| Setting | Value |
|---------|-------|
| Recording Format | mp4 |
| Video Encoder | x264 or NVENC (GPU) |
| Rate Control | CRF |
| CRF Value | 18 (visually lossless) |
| Resolution | 2560x1440 |
| FPS | 60 |

## Tips

- The Browser source captures audio natively — no extra audio setup needed
- Use **Studio Mode** to preview before recording
- For 1080p output, set OBS canvas to 1920x1080 and downscale from the 1440p source for supersampled quality
- To re-record a specific section, use the Interact window to navigate to the desired slide, then start/stop recording around that section
