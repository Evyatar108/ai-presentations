# Recording Presentations with OBS

High-quality video recording of narrated presentations using OBS Studio with a Browser source.

## Prerequisites

- [OBS Studio](https://obsproject.com/) installed
- Dev server running: `npm run dev` from `presentation-app/`

## Setup

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
