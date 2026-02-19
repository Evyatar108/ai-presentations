# Text-to-Speech Generator using VibeVoice

This project provides multiple ways to generate audio files from transcript text using the VibeVoice model.

## Available Scripts

1. **[`generate_audio.py`](generate_audio.py:1)** - Standalone local script
2. **[`server.py`](server.py:1)** - TTS server for remote processing
3. **[`client.py`](client.py:1)** - Client to connect to remote server

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
# Run server
python server.py --voice-sample path/to/voice.wav --host 0.0.0.0 --port 5000
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

- **[`generate_audio.py`](generate_audio.py:1)** - Self-contained script for local TTS generation
- **[`server.py`](server.py:1)** - Flask-based HTTP server that runs the VibeVoice model
- **[`client.py`](client.py:1)** - Client script that sends requests to the server
- **[`requirements.txt`](requirements.txt:1)** - Python dependencies
- **[`NETWORK_SETUP.md`](NETWORK_SETUP.md:1)** - Detailed network configuration guide

## Requirements

- Python 3.8 or higher
- CUDA-capable GPU (recommended for faster processing)
- ~10GB disk space for the model
- Voice sample file in WAV format (24kHz mono preferred)

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