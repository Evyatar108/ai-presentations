# Network Setup Guide for Remote TTS Server

This guide helps you configure Windows to allow connections to the TTS server running on a remote PC.

## Architecture Overview

- **Remote PC (Server)**: Runs the VibeVoice model and serves TTS generation requests
- **Local PC (Client)**: Sends transcript text and receives generated audio files

## Part 1: Server Setup (Remote PC)

### 1. Install Dependencies

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### 2. Configure Windows Firewall

You need to open port 5000 (or your chosen port) in Windows Firewall.

#### Option A: Using Windows Defender Firewall GUI

1. Press `Win + R`, type `wf.msc`, and press Enter
2. Click "Inbound Rules" in the left panel
3. Click "New Rule..." in the right panel
4. Select "Port" and click Next
5. Select "TCP" and enter port number: `5000`
6. Click Next, select "Allow the connection"
7. Click Next, check all profiles (Domain, Private, Public)
8. Click Next, name it "VibeVoice TTS Server"
9. Click Finish

#### Option B: Using PowerShell (Run as Administrator)

```powershell
New-NetFirewallRule -DisplayName "VibeVoice TTS Server" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
```

#### Option C: Using Command Prompt (Run as Administrator)

```cmd
netsh advfirewall firewall add rule name="VibeVoice TTS Server" dir=in action=allow protocol=TCP localport=5000
```

### 3. Find Your Server's IP Address

```cmd
ipconfig
```

Look for "IPv4 Address" under your network adapter (usually starts with 192.168.x.x or 10.x.x.x)

### 4. Start the Server

```bash
# Replace with your actual voice sample path
python server.py --voice-sample path/to/voice_sample.wav --host 0.0.0.0 --port 5000
```

**Important Parameters:**
- `--voice-sample`: Path to your reference voice WAV file
- `--host 0.0.0.0`: Listen on all network interfaces (required for remote access)
- `--port 5000`: Port number (default: 5000)

### 5. Verify Server is Running

Open a browser on the remote PC and navigate to:
```
http://localhost:5000/health
```

You should see JSON response like:
```json
{
  "status": "ok",
  "model_loaded": true,
  "device": "cuda"
}
```

## Part 2: Client Setup (Local PC)

### 1. Install Client Dependencies

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate

# Install requirements (client needs fewer dependencies)
pip install requests soundfile
```

### 2. Configure Server URL

Edit [`server_config.json`](server_config.json:1) and set your server's IP address:

```json
{
  "server_url": "http://192.168.1.100:5000",
  "port": 5000
}
```

Replace `192.168.1.100` with your server's actual IP address.

**Note:** [`server_config.json`](server_config.json:1) is in [`.gitignore`](.gitignore:1), so your IP address won't be committed to git.

### 3. Test Connection to Server

```bash
python client.py --test
```

Expected output:
```
Testing server connection...
✓ Server is healthy
  - Model loaded: True
  - Device: cuda
```

### 4. Process Transcript

```bash
python client.py
```

Or with custom options:
```bash
python client.py --transcript ../demo/2b_cogs_reduction.txt --output output
```

## Troubleshooting

### Connection Refused

**Symptom:** `Could not connect to server`

**Solutions:**
1. Verify server is running on remote PC
2. Check firewall rule is active:
   ```powershell
   Get-NetFirewallRule -DisplayName "VibeVoice TTS Server"
   ```
3. Verify you're using the correct IP address
4. Try pinging the server: `ping 192.168.1.100`
5. Temporarily disable Windows Firewall to test (re-enable afterwards)

### Timeout Errors

**Symptom:** `Request timed out`

**Solutions:**
1. First generation takes longer (model loading)
2. CPU processing is slower than GPU
3. Increase timeout in [`client.py`](client.py:64) if needed

### Port Already in Use

**Symptom:** `Address already in use`

**Solutions:**
1. Choose a different port:
   ```bash
   python server.py --voice-sample voice.wav --port 5001
   ```
2. Update firewall rule for new port
3. Update client command with new port

### Network Discovery

If you can't find the server IP:

1. On server PC, run: `ipconfig /all`
2. Look for IPv4 address on the active network adapter
3. Both PCs must be on the same network/subnet

### Checking if Port is Open

From the client PC, test if port is accessible:

```powershell
Test-NetConnection -ComputerName 192.168.1.100 -Port 5000
```

Should show `TcpTestSucceeded : True`

## Security Notes

- The server runs on `0.0.0.0` which accepts connections from any IP
- Consider using `--host 192.168.1.100` (server's IP) for better security
- Only open firewall on private/trusted networks
- The server has no authentication - use only on trusted LANs

## Performance Tips

1. **GPU Recommended**: Server performs much better with CUDA-capable GPU
2. **Network Speed**: Use wired Ethernet for faster audio transfer
3. **Concurrent Requests**: Server processes one request at a time (by design)
4. **Keep Server Running**: First request is slower due to model loading

## Command Reference

### Server Commands

```bash
# Basic server start
python server.py --voice-sample voice.wav

# Custom port
python server.py --voice-sample voice.wav --port 8080

# Specific IP binding (more secure)
python server.py --voice-sample voice.wav --host 192.168.1.100
```
### Client Commands

```bash
# Test connection (uses server_config.json)
python client.py --test

# Process transcript (uses server_config.json)
python client.py

# Custom transcript and output
python client.py --transcript custom.txt --output audio_files

# Override config file with explicit server
python client.py --server http://192.168.1.100:5000 --test
```