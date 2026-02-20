# Text-to-Speech Generator

This project provides multiple ways to generate audio files from transcript text. Two TTS engines are supported:

- **VibeVoice** (`server.py`) — requires a voice sample WAV file for cloning
- **Qwen3-TTS** (`server_qwen.py`) — uses premium preset speaker timbres (no voice sample needed)

Both servers expose the same HTTP API, so the TypeScript scripts and browser client work unchanged regardless of which engine is running.

## Available Scripts

1. **[`generate_audio.py`](generate_audio.py:1)** - Standalone local script (VibeVoice)
2. **[`server.py`](server.py:1)** - VibeVoice TTS server
3. **[`server_qwen.py`](server_qwen.py:1)** - Qwen3-TTS server
4. **[`client.py`](client.py:1)** - Client to connect to remote server

## Engine Selection

Both engines run on the same port (default 5000) and use the same `server_config.json` — just start the one you want.

### VibeVoice (voice cloning)

```bash
# Install dependencies
pip install -r requirements.txt

# Start server (requires a voice sample file)
python server.py --voice-sample path/to/voice.wav
```

### Qwen3-TTS (preset speakers)

```bash
# Install dependencies (separate venv recommended)
pip install -r requirements_qwen.txt

# Start server (no voice sample needed)
python server_qwen.py --speaker Aiden --language English
```

**Recommended speakers for English narration: `Aiden` (sunny American male) or `Ryan` (dynamic male).** Other presets exist but were tested and not preferred. See the [Qwen3-TTS model card](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice) for the full list.

### Generating audio (same for both engines)

Once either server is running, use the standard commands from `presentation-app/`:

```bash
npm run tts:generate -- --demo my-demo
npm run tts:generate -- --demo my-demo --instruct "speak slowly and clearly"
npm run tts:duration -- --demo my-demo
```

Or trigger regeneration from the browser via `npm run dev:full`.

### Instruct parameter (Qwen3-TTS only)

The `instruct` parameter controls voice style and tone. It can be set at demo, slide, or segment level in the TypeScript types and narration JSON files (most-specific wins). The CLI `--instruct` flag serves as a fallback default. VibeVoice ignores instruct silently. See `docs/TTS_GUIDE.md` for the full hierarchy.

## Quick Start

### Option 1: Local Processing (Standalone)

Use this if you have a powerful PC with GPU and want to process everything locally.

```bash
# Setup
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Configure and run
# Edit generate_audio.py to set VOICE_SAMPLE_PATH
python generate_audio.py
```

### Option 2: Remote Processing (Client-Server)

Use this if you want to run the model on a remote PC with GPU and process from your local machine.

**See [`NETWORK_SETUP.md`](NETWORK_SETUP.md:1) for detailed setup instructions.**

#### Quick Summary:

**On Remote PC (Server):**
```bash
# Setup
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Open firewall port 5000 (see NETWORK_SETUP.md)
# Run server (VibeVoice)
python server.py --voice-sample path/to/voice.wav --host 0.0.0.0 --port 5000

# Or run Qwen3-TTS instead
python server_qwen.py --speaker Aiden --host 0.0.0.0 --port 5000
```

**On Local PC (Client):**
```bash
# Setup
python -m venv venv
venv\Scripts\activate
pip install requests soundfile

# Configure server URL (edit server_config.json)
# Set "server_url": "http://192.168.1.100:5000"

# Test connection
python client.py --test

# Process transcript
python client.py
```

**Note:** You can override the config file with `--server` argument if needed.

## File Descriptions

- **[`generate_audio.py`](generate_audio.py:1)** - Self-contained script for local TTS generation (VibeVoice)
- **[`server.py`](server.py:1)** - Flask-based HTTP server running the VibeVoice model
- **[`server_qwen.py`](server_qwen.py:1)** - Flask-based HTTP server running Qwen3-TTS (same API)
- **[`client.py`](client.py:1)** - Client script that sends requests to the server
- **[`requirements.txt`](requirements.txt:1)** - Python dependencies for VibeVoice
- **[`requirements_qwen.txt`](requirements_qwen.txt:1)** - Python dependencies for Qwen3-TTS
- **[`NETWORK_SETUP.md`](NETWORK_SETUP.md:1)** - Detailed network configuration guide

## Requirements

- Python 3.8 or higher
- CUDA-capable GPU (required)
- ~10GB disk space for models
- Voice sample file in WAV format (VibeVoice only; not needed for Qwen3-TTS)

## Network Setup

If using client-server mode, you need to:

1. Open port 5000 in Windows Firewall on the server PC
2. Ensure both PCs are on the same LAN
3. Know the server's IP address

**See [`NETWORK_SETUP.md`](NETWORK_SETUP.md:1) for complete instructions with firewall configuration steps.**

## How It Works

1. Parses transcript file ([`demo/2b_cogs_reduction.txt`](../demo/2b_cogs_reduction.txt:1))
2. Extracts individual utterances with timestamps
3. Generates audio for each utterance using VibeVoice model
4. Saves as separate WAV files: `utterance_01.wav`, `utterance_02.wav`, etc.

## Output

All generated audio files are saved in the `output` directory:
- Format: WAV
- Sample rate: 24kHz
- Channels: Mono
- Naming: `utterance_XX.wav` (where XX is the utterance ID)

## Notes

- First run downloads the VibeVoice model (~4GB)
- GPU processing is significantly faster than CPU
- Server processes one request at a time
- Client has 2-minute timeout per utterance