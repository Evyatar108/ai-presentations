# Qwen3-TTS Setup Guide

## Prerequisites

- Remote PC with NVIDIA GPU (16+ GB VRAM recommended) at `192.168.0.120`
- Firewall rule for port 5000 already in place (from VibeVoice setup)
- This PC has `server_config.json` pointing to `http://192.168.0.120:5000`

## Steps on Remote PC (192.168.0.120)

### 1. Copy files

Copy `server_qwen.py` and `requirements_qwen.txt` to the `tts/` folder on the remote PC.

### 2. Create a separate venv

```bash
cd tts
python -m venv venv_qwen
venv_qwen\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements_qwen.txt
```

### 4. Start the server

```bash
python server_qwen.py --speaker Vivian --language English --host 0.0.0.0 --port 5000
```

Make sure VibeVoice (`server.py`) is not running on the same port.

### 5. Verify health check

Open a browser on the remote PC and navigate to `http://localhost:5000/health`. Expected response:

```json
{
  "status": "ok",
  "model_loaded": true,
  "engine": "qwen3-tts",
  "speaker": "Vivian",
  "language": "English"
}
```

## Steps on This PC (Client)

### 6. Test connectivity

```powershell
Test-NetConnection -ComputerName 192.168.0.120 -Port 5000
```

Should show `TcpTestSucceeded : True`.

### 7. Generate audio

```bash
cd presentation-app
npm run tts:generate -- --demo example-demo-1
```

### 8. Verify output

Check that WAV files were created in `public/audio/example-demo-1/` and play them to confirm quality.

## Speaker Options

The `--speaker` flag accepts any of the 9 premium preset timbres from the CustomVoice model. To try a different voice:

```bash
python server_qwen.py --speaker Chelsie --language English --host 0.0.0.0 --port 5000
```

See the [Qwen3-TTS model card](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice) for the full list.
