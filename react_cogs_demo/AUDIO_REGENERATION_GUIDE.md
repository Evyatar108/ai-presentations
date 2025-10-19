# Audio Regeneration Quick Start Guide

This guide explains how to use the on-the-fly audio regeneration feature in manual presentation mode.

## Overview

The audio regeneration feature allows you to regenerate TTS audio for individual segments directly from the browser during a presentation. This is useful for:

- Quick iteration on narration text without rebuilding
- Fixing audio issues during rehearsal
- Experimenting with different narration styles
- Testing TTS quality for specific segments

## Prerequisites

### 1. Remote TTS Server

Your TTS server must be running on a remote machine (or localhost). The server generates audio from text.

**Start the server:**
```bash
cd tts
python server.py --voice-sample path/to/voice.wav
```

**Verify server is running:**
```bash
curl http://your-server-ip:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "gpu_name": "NVIDIA GeForce RTX 3090"
}
```

### 2. Configure TTS Server URL

Edit `react_cogs_demo/public/tts-config.json`:

```json
{
  "remoteTTSServerUrl": "http://192.168.1.100:5000"
}
```

Replace `192.168.1.100` with your TTS server's actual IP address.

### 3. Start Dev Server

The regeneration feature requires the Vite dev server to be running:

```bash
cd react_cogs_demo
npm run dev
```

The dev server includes a custom plugin that provides the `/api/save-audio` endpoint for writing files to disk.

## How to Use

### Step 1: Enter Manual Mode

1. Open http://localhost:5173
2. Click either:
   - **⌨ Manual (Silent)** - For silent navigation
   - **⌨ Manual + Audio** - For audio playback with manual control

### Step 2: Navigate to a Segment

1. Use arrow keys to navigate to a slide with multiple segments
2. Use the segment navigation controls (bottom of screen) to select a specific segment
3. You'll see:
   ```
   [◀] Segment: [•][•][•] [▶] | 🔄  2/3
   ```

### Step 3: Regenerate Audio

1. Click the **🔄** button in the segment navigation bar
2. The button changes to **⏳** (hourglass) during generation
3. Watch for the status toast in the top-right corner:
   - **Green toast with ✓**: Success! Audio regenerated
   - **Red toast with ✗**: Error occurred

### Step 4: Audio Automatically Reloads

- The audio file is saved to `public/audio/c{chapter}/s{slide}_segment_{num}_{id}.wav`
- Cache is updated in `.tts-narration-cache.json`
- In **Manual + Audio** mode, the new audio plays immediately
- In **Manual (Silent)** mode, the audio is ready for next playback

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌────────────────┐
│   Browser   │─────▶│  Remote TTS      │─────▶│  Audio (Base64)│
│  (React UI) │      │  Server          │      │                │
└─────────────┘      └──────────────────┘      └────────────────┘
       │                                                │
       │ 1. Request generation                         │
       │                                                │
       │◀───────────────────────────────────────────────┘
       │ 2. Receive base64 audio
       │
       ▼
┌─────────────┐      ┌──────────────────┐
│ POST Request│─────▶│  Vite Dev Server │
│ /api/save   │      │  Plugin          │
└─────────────┘      └──────────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │  Write to Disk   │
                     │  public/audio/   │
                     │  + Update Cache  │
                     └──────────────────┘
```

## Technical Details

### Files Created/Modified

**New Files:**
- `react_cogs_demo/vite-plugin-audio-writer.ts` - Vite plugin with file-writing endpoint
- `react_cogs_demo/src/utils/ttsClient.ts` - TTS API client
- `react_cogs_demo/public/tts-config.json` - TTS server configuration

**Modified Files:**
- `react_cogs_demo/vite.config.ts` - Registered audio writer plugin
- `react_cogs_demo/src/components/SlidePlayer.tsx` - Added regenerate button and handler

### API Endpoints

**Remote TTS Server:**
- `GET /health` - Check server health
- `POST /generate_batch` - Generate audio from text
  ```json
  {
    "texts": ["Speaker 0: Your narration text here"]
  }
  ```
  Returns:
  ```json
  {
    "success": true,
    "audios": ["base64-encoded-wav-data"],
    "sample_rate": 24000
  }
  ```

**Local Vite Dev Server:**
- `POST /api/save-audio` - Save audio to disk
  ```json
  {
    "audioBase64": "base64-encoded-wav",
    "outputPath": "c2/s1_segment_01_intro.wav",
    "narrationText": "Your narration text",
    "chapter": 2,
    "slide": 1,
    "segmentId": "intro"
  }
  ```
  Returns:
  ```json
  {
    "success": true,
    "filePath": "c2/s1_segment_01_intro.wav",
    "timestamp": 1705678901234
  }
  ```

### Cache Management

The system maintains a cache file `.tts-narration-cache.json`:

```json
{
  "c2/s1_segment_01_intro.wav": {
    "narrationText": "Welcome to the presentation...",
    "generatedAt": "2025-01-20T16:30:00.000Z"
  }
}
```

This cache:
- Tracks which audio files correspond to which narration text
- Used by `npm run tts:generate` to detect changes
- Updated automatically after browser regeneration
- Shared between browser and CLI workflows

### Cache-Busting

After regeneration, the audio file path is updated with a timestamp:
```javascript
segment.audioFilePath = `/audio/c2/s1_segment_01_intro.wav?t=1705678901234`
```

This forces the browser to reload the audio file instead of using a cached version.

## Troubleshooting

### "Cannot reach TTS server" Error

**Symptoms:** Red error toast showing "Cannot reach TTS server at http://..."

**Solutions:**
1. Verify TTS server is running:
   ```bash
   curl http://your-server-ip:5000/health
   ```
2. Check firewall settings allow port 5000
3. Verify IP address in `public/tts-config.json`
4. Try accessing server from browser: `http://your-server-ip:5000/health`

### "Save failed" Error

**Symptoms:** Red error toast showing "Save failed: ..."

**Solutions:**
1. Verify Vite dev server is running (`npm run dev`)
2. Check file permissions on `public/audio/` directory
3. Check browser console for detailed error messages
4. Try restarting the dev server

### Audio Doesn't Reload

**Symptoms:** Regeneration succeeds but audio still plays old version

**Solutions:**
1. Navigate to a different segment and back
2. Refresh the browser page
3. Check browser network tab for 304 (cached) responses
4. Clear browser cache (Ctrl+Shift+Del)

### Button Stays Disabled

**Symptoms:** Regenerate button (🔄) is grayed out

**Possible Causes:**
1. Currently regenerating (shows ⏳)
2. Segment has no narration text
3. In narrated mode (not manual mode)

**Solution:** Wait for current regeneration to complete, or switch to manual mode

### Server Timeout

**Symptoms:** Request takes very long, then fails

**Causes:**
- TTS model is loading (first request after server start)
- Server is overloaded
- Network latency is high

**Solutions:**
1. Wait for model to fully load (check server logs)
2. Reduce concurrent requests
3. Increase timeout in `ttsClient.ts` (if needed)

## Best Practices

### 1. Test Server Connection First

Before starting a presentation, verify the TTS server is accessible:

```bash
# From your development machine
curl http://your-tts-server:5000/health
```

### 2. Regenerate Before Recording

If you're recording the presentation, regenerate any audio segments you've recently edited before starting the recording.

### 3. Use Manual + Audio Mode

For the best regeneration experience:
1. Navigate to the segment you want to regenerate
2. Click 🔄 to regenerate
3. New audio plays automatically
4. Continue presentation with updated audio

### 4. Keep Cache in Sync

The browser regeneration updates the cache file, which means `npm run tts:generate` will recognize the changes and skip regenerating those segments.

### 5. Monitor Server Resources

The TTS server uses significant GPU memory. If you notice slowness:
1. Check GPU utilization: `nvidia-smi`
2. Restart the TTS server if needed
3. Reduce batch size if generating multiple segments

## Limitations

### Development-Only Feature

This feature only works with the Vite dev server running. In production builds:
- The `/api/save-audio` endpoint is not available
- Regeneration button will show errors
- Use `npm run tts:generate` instead

### Single Segment at a Time

Currently, you can only regenerate one segment at a time. To regenerate multiple segments:
1. Navigate to each segment
2. Click 🔄 for each one
3. Wait for completion before moving to the next

(Future enhancement: Batch regeneration for entire slide)

### Requires Network Access

Both the browser and TTS server must be on the same network (or have appropriate network routing configured).

### File Permissions

The Vite dev server must have write permissions to:
- `public/audio/` directory
- `.tts-narration-cache.json` file

## FAQ

**Q: Can I use this feature in production?**  
A: No, it requires the Vite dev server. For production, use `npm run tts:generate` to pre-generate all audio.

**Q: Will regenerated audio persist after browser refresh?**  
A: Yes! The audio is written to disk and cached, so it persists across refreshes.

**Q: Can I regenerate all segments on a slide at once?**  
A: Not yet. This is a planned future enhancement.

**Q: Does this work with the Python TTS server on the same machine?**  
A: Yes! Just set `"remoteTTSServerUrl": "http://localhost:5000"` in `tts-config.json`.

**Q: What happens if I regenerate while audio is playing?**  
A: The current audio stops, regeneration occurs, and the new audio plays (in Manual + Audio mode).

**Q: Can I undo a regeneration?**  
A: Not directly. You would need to:
  1. Edit the narration text back to the original
  2. Regenerate again
  Or restore the old audio file from backup/git

## Support

For issues or questions:
1. Check console logs in browser DevTools (F12)
2. Check Vite dev server terminal output
3. Check TTS server logs
4. Review this guide's troubleshooting section
5. Check main README.md for general TTS setup

## Related Documentation

- [`README.md`](../README.md) - Main project documentation
- [`tts/README.md`](../tts/README.md) - TTS server setup
- [`ARCHITECTURE.md`](ARCHITECTURE.md) - Technical architecture details