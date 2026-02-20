import torch
import soundfile as sf
import librosa
import numpy as np
import os
import base64
import json
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from vibevoice.processor.vibevoice_processor import VibeVoiceProcessor
from vibevoice.modular.modeling_vibevoice_inference import VibeVoiceForConditionalGenerationInference
from pydub import AudioSegment

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Global variables for model and processor
processor = None
model = None
voice_sample = None
def load_voice_sample(voice_path):
    """Load and preprocess voice sample to 24kHz mono.
    
    Supports both audio files (WAV, FLAC, MP3, etc.) and video files (MP4, MKV, AVI, etc.).
    For video files, extracts the audio track automatically using pydub/ffmpeg.
    """
    # Check if it's a video file by extension
    video_extensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv']
    file_ext = os.path.splitext(voice_path)[1].lower()
    
    if file_ext in video_extensions:
        print(f"Detected video file ({file_ext}), extracting audio...")
        # Extract audio from video file using pydub
        audio = AudioSegment.from_file(voice_path)
        
        # Convert to mono
        if audio.channels > 1:
            audio = audio.set_channels(1)
        
        # Get sample rate
        sr = audio.frame_rate
        
        # Convert to numpy array
        # AudioSegment stores audio as 16-bit integers
        samples = np.array(audio.get_array_of_samples(), dtype=np.float32)
        
        # Normalize to [-1, 1] range
        voice = samples / (2**15)
        
        print(f"Extracted audio: {len(voice)} samples at {sr} Hz")
    else:
        # Load audio file directly with soundfile
        voice, sr = sf.read(voice_path)
        
        if voice.ndim > 1:
            voice = voice.mean(axis=1)
    
    # Resample to 24kHz if needed
    if sr != 24000:
        print(f"Resampling from {sr} Hz to 24000 Hz...")
        voice = librosa.resample(voice, orig_sr=sr, target_sr=24000)
    
    return voice

def initialize_model(voice_sample_path, model_name="aoi-ot/VibeVoice-Large"):
    """Initialize the VibeVoice model and load voice sample."""
    global processor, model, voice_sample
    
    print("Loading voice sample...")
    voice_sample = load_voice_sample(voice_sample_path)
    
    print(f"Loading VibeVoice model: {model_name}...")
    
    # Check for CUDA availability
    if not torch.cuda.is_available():
        raise RuntimeError("CUDA is not available. This server requires a CUDA-enabled GPU.")
    
    processor = VibeVoiceProcessor.from_pretrained(model_name)
    
    # Load model with float16 for GPU compatibility
    model = VibeVoiceForConditionalGenerationInference.from_pretrained(
        model_name,
        torch_dtype=torch.float16,
        device_map="auto"  # Automatically places model on GPU
    )
    
    model.eval()
    model.set_ddpm_inference_steps(10)  # Recommended: 10 for good quality
    
    print(f"Model loaded on CUDA")
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"DDPM inference steps: 10")
    print(f"Server ready!")
@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'engine': 'vibevoice',
        'device': 'cuda',
        'gpu_name': torch.cuda.get_device_name(0) if torch.cuda.is_available() else None
    })

@app.route('/generate', methods=['POST'])
def generate_audio():
    """
    Generate audio from text.
    Expects JSON: {"text": "Hello!", "speaker": "Speaker 0"} or just {"text": "Hello!"}
    If speaker is not provided, defaults to "Speaker 0".
    Returns JSON: {"audio": base64_encoded_wav_data, "sample_rate": 24000}
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        speaker = data.get('speaker', 'Speaker 0')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        if model is None or processor is None:
            return jsonify({'error': 'Model not initialized'}), 500
        
        # Format text with speaker prefix if not already present
        if not text.strip().startswith('Speaker'):
            formatted_text = f"{speaker}: {text}"
        else:
            formatted_text = text
        
        print(f"Generating audio for: {formatted_text[:50]}...")
        
        # Process inputs
        inputs = processor(
            text=[formatted_text],
            voice_samples=[[voice_sample]],
            return_tensors="pt"
        )
        
        # Move inputs to device
        device = next(model.parameters()).device
        inputs = {k: v.to(device) if isinstance(v, torch.Tensor) else v for k, v in inputs.items()}
        
        # Generate audio
        with torch.no_grad():
            audio = model.generate(
                **inputs,
                cfg_scale=1.3,
                tokenizer=processor.tokenizer
            ).speech_outputs[0]
        
        # Convert to numpy and encode as base64
        audio_np = audio.cpu().numpy().squeeze()
        
        # Convert from float16 to float32 for WAV compatibility
        if audio_np.dtype == np.float16:
            audio_np = audio_np.astype(np.float32)
        
        # Save to temporary buffer and encode
        import io
        buffer = io.BytesIO()
        sf.write(buffer, audio_np, 24000, format='WAV', subtype='PCM_16')
        buffer.flush()  # Ensure all data is written
        buffer.seek(0)
        audio_b64 = base64.b64encode(buffer.read()).decode('utf-8')
        buffer.close()
        
        print("Audio generated successfully")
        
        return jsonify({
            'audio': audio_b64,
            'sample_rate': 24000,
            'success': True
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/generate_batch', methods=['POST'])
def generate_audio_batch():
    """
    Generate audio for multiple texts in a single batch.
    Expects JSON: {"texts": ["Speaker 0: Hello!", "Speaker 1: Hi!"]}
    Returns JSON: {"audios": [base64_1, base64_2, ...], "sample_rate": 24000}
    """
    try:
        data = request.get_json()
        texts = data.get('texts', [])
        
        if not texts:
            return jsonify({'error': 'No texts provided'}), 400
        
        if model is None or processor is None:
            return jsonify({'error': 'Model not initialized'}), 500
        
        print(f"Generating audio for {len(texts)} utterances in batch...")
        
        # Process all texts at once
        inputs = processor(
            text=texts,
            voice_samples=[[voice_sample]] * len(texts),  # Same voice for all
            return_tensors="pt"
        )
        
        # Move inputs to device
        device = next(model.parameters()).device
        inputs = {k: v.to(device) if isinstance(v, torch.Tensor) else v for k, v in inputs.items()}
        
        # Generate audio for all texts
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                cfg_scale=1.3,
                tokenizer=processor.tokenizer
            ).speech_outputs
            
            # Clear CUDA cache after generation to prevent memory issues
            torch.cuda.empty_cache()
        
        # Convert each audio to base64
        audios_b64 = []
        for idx, audio in enumerate(outputs):
            audio_np = audio.cpu().numpy().squeeze()
            
            # Convert from float16 to float32 for WAV compatibility
            if audio_np.dtype == np.float16:
                audio_np = audio_np.astype(np.float32)
            
            # Save to temporary buffer and encode - create fresh buffer for each audio
            import io
            buffer = io.BytesIO()
            try:
                sf.write(buffer, audio_np, 24000, format='WAV', subtype='PCM_16')
                buffer.flush()  # Ensure all data is written
                buffer.seek(0)
                audio_data = buffer.read()
                audio_b64 = base64.b64encode(audio_data).decode('utf-8')
                audios_b64.append(audio_b64)
                print(f"  Generated audio {idx + 1}/{len(texts)}: {len(audio_data)} bytes, {len(audio_b64)} base64 chars")
            finally:
                buffer.close()
            
            print(f"  Generated audio {idx + 1}/{len(texts)}")
        print("Batch generation completed successfully")
        
        return jsonify({
            'audios': audios_b64,
            'sample_rate': 24000,
            'count': len(audios_b64),
            'success': True
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='VibeVoice TTS Server')
    parser.add_argument('--voice-sample', type=str, required=True,
                        help='Path to voice sample WAV file')
    parser.add_argument('--model', type=str, default='aoi-ot/VibeVoice-Large',
                        choices=['aoi-ot/VibeVoice-Large', 'FabioSarracino/VibeVoice-Large-Q8'],
                        help='Model to use: aoi-ot/VibeVoice-Large (full) or FabioSarracino/VibeVoice-Large-Q8 (quantized, default: aoi-ot/VibeVoice-Large)')
    parser.add_argument('--host', type=str, default='0.0.0.0',
                        help='Host to bind to (default: 0.0.0.0)')
    parser.add_argument('--port', type=int, default=5000,
                        help='Port to bind to (default: 5000)')
    
    args = parser.parse_args()
    
    # Check if voice sample exists
    if not os.path.exists(args.voice_sample):
        print(f"ERROR: Voice sample not found at '{args.voice_sample}'")
        return
    
    # Initialize model
    initialize_model(args.voice_sample, args.model)
    
    # Start server
    print(f"\nStarting server on {args.host}:{args.port}")
    print(f"Health check: http://{args.host}:{args.port}/health")
    print(f"Generate endpoint: http://{args.host}:{args.port}/generate")
    
    app.run(host=args.host, port=args.port, threaded=True)

if __name__ == "__main__":
    main()