# WhisperX Server Setup Guide

## Overview

The WhisperX server provides two capabilities:
- **Transcription** — transcribes TTS-generated audio back to text for quality verification (`tts:verify`)
- **Forced alignment** — produces word-level timestamps for inline marker resolution (`tts:align`)

It uses [WhisperX](https://github.com/m-bain/whisperX) which wraps faster-whisper with phoneme-level alignment.

## Prerequisites

- Remote PC with NVIDIA GPU (8+ GB VRAM recommended) at `192.168.0.120`
- Firewall rule for port 5001 (see step 2 below)
- The Qwen3-TTS server may run concurrently on port 5000

## Steps on Remote PC (192.168.0.120)

### 1. Copy files

Copy `server_whisperx.py` and `requirements_whisper.txt` to the `tts/` folder on the remote PC.

### 2. Open firewall port 5001

```powershell
New-NetFirewallRule -DisplayName "WhisperX Server" -Direction Inbound -LocalPort 5001 -Protocol TCP -Action Allow
```

### 3. Create a separate venv

```bash
cd tts
python -m venv venv_whisper
venv_whisper\Scripts\activate
```

### 4. Install dependencies

```bash
pip install -r requirements_whisper.txt
pip install whisperx librosa
```

The first run will download the Whisper model (~3 GB for `large-v3`) and alignment model.

### 5. Start the server

```bash
python server_whisperx.py --model large-v3 --port 5001
```

This runs alongside the Qwen3-TTS server (port 5000) without conflict.

### 6. Verify health check

Open a browser on the remote PC and navigate to `http://localhost:5001/health`. Expected response:

```json
{
  "status": "ok",
  "model_loaded": true,
  "engine": "whisperx",
  "model_size": "large-v3",
  "gpu_name": "NVIDIA GeForce RTX ..."
}
```

## Steps on This PC (Client)

### 7. Test connectivity

```powershell
Test-NetConnection -ComputerName 192.168.0.120 -Port 5001
```

Should show `TcpTestSucceeded : True`.

### 8. Verify TTS audio

```bash
cd presentation-app
npm run tts:verify -- --demo highlights-deep-dive
```

### 9. Generate word-level alignment

```bash
npm run tts:align -- --demo highlights-deep-dive
```

### 10. Review output

- Verification: console shows side-by-side comparison table; full report saved to `verification-report-{demoId}.json`
- Alignment: word timestamps + resolved markers saved to `public/audio/{demoId}/alignment.json`

## Model Options

| Model | VRAM | Speed | Accuracy |
|-------|------|-------|----------|
| `tiny` | ~1 GB | Fastest | Low |
| `base` | ~1 GB | Fast | Fair |
| `small` | ~2 GB | Moderate | Good |
| `medium` | ~5 GB | Slow | Very good |
| `large-v2` | ~6 GB | Slower | Excellent |
| **`large-v3`** | ~6 GB | Slower | **Best** (recommended) |

```bash
# Default (recommended)
python server_whisperx.py --model large-v3 --port 5001

# Faster, less accurate
python server_whisperx.py --model medium --port 5001

# CPU-only (no GPU required, much slower)
python server_whisperx.py --model large-v3 --device cpu --compute-type int8 --port 5001
```

## Compute Type Options

| Type | Description |
|------|-------------|
| `float16` | Default, requires GPU with FP16 support |
| `int8` | Lower VRAM, slightly less accurate |
| `int8_float16` | Balanced between the two |
