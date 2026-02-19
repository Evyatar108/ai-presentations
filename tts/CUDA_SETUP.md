# CUDA Setup Guide for Windows

The error indicates that PyTorch is not detecting your CUDA-enabled GPU. You need to install the CUDA-enabled version of PyTorch.

## Step 1: Check Your CUDA Version

Open Command Prompt and run:
```cmd
nvidia-smi
```

Look for the CUDA Version in the top right corner (e.g., `CUDA Version: 12.1`).

## Step 2: Uninstall Current PyTorch

In your virtual environment:
```bash
pip uninstall torch torchvision torchaudio
```

## Step 3: Install CUDA-Enabled PyTorch

Choose the appropriate command based on your CUDA version:

### For CUDA 12.1 or newer:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

### For CUDA 11.8:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Not sure which version?
Visit https://pytorch.org/get-started/locally/ and select:
- PyTorch Build: Stable
- Your OS: Windows
- Package: Pip
- Language: Python
- Compute Platform: CUDA XX.X (match your version)

## Step 4: Verify CUDA Installation

After installation, test in Python:
```python
import torch
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"CUDA version: {torch.version.cuda}")
print(f"Device count: {torch.cuda.device_count()}")
if torch.cuda.is_available():
    print(f"Device name: {torch.cuda.get_device_name(0)}")
```

Expected output:
```
CUDA available: True
CUDA version: 12.1
Device count: 1
Device name: NVIDIA GeForce RTX 3080 (or your GPU model)
```

## Step 5: Reinstall Other Dependencies

```bash
pip install -r requirements.txt
```

## Step 6: Test the Server

```bash
python server.py --voice-sample "path/to/voice.wav" --host 0.0.0.0 --port 5000
```

You should see:
```
Model loaded on cuda
```

## Troubleshooting

### Issue: CUDA still not detected after reinstalling PyTorch

**Solution 1: Update NVIDIA Drivers**
1. Go to https://www.nvidia.com/Download/index.aspx
2. Download and install the latest driver for your GPU
3. Restart your computer
4. Retry PyTorch installation

**Solution 2: Check if CUDA Toolkit is installed**
```cmd
nvcc --version
```

If not found, download CUDA Toolkit from:
https://developer.nvidia.com/cuda-downloads

**Solution 3: Verify PATH Environment Variables**
Ensure these are in your PATH:
- `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.1\bin`
- `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v12.1\libnvvp`

### Issue: Out of memory errors

If you get CUDA out of memory errors, the model is too large for your GPU. Consider:
1. Using a smaller model variant
2. Reducing batch size
3. Processing utterances one at a time (already done in our script)

## Alternative: CPU-Only Mode (Not Recommended)

If you can't get CUDA working, you can run on CPU (much slower):

The script will automatically fall back to CPU if CUDA is not available, but generation will be significantly slower (minutes instead of seconds per utterance).