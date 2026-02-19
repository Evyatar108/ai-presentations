import torch
import soundfile as sf
import librosa
import numpy as np
import os
import re
from vibevoice.processor.vibevoice_processor import VibeVoiceProcessor
from vibevoice.modular.modeling_vibevoice_inference import VibeVoiceForConditionalGenerationInference

def parse_transcript_file(filepath):
    """
    Parse the transcript file and extract utterances with their metadata.
    Returns a list of tuples: (utterance_id, start_time, end_time, text)
    """
    utterances = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Check if line is an utterance ID (numeric)
        if line.isdigit():
            utterance_id = line
            
            # Next line should be timestamp
            if i + 1 < len(lines):
                timestamp_line = lines[i + 1].strip()
                # Parse timestamp: "00:02:16,000 --> 00:02:22,000"
                timestamp_match = re.match(r'(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})', timestamp_line)
                
                if timestamp_match:
                    start_time = timestamp_match.group(1)
                    end_time = timestamp_match.group(2)
                    
                    # Next line should be the text
                    if i + 2 < len(lines):
                        text = lines[i + 2].strip()
                        
                        if text:  # Only add if text is not empty
                            utterances.append((utterance_id, start_time, end_time, text))
            
            i += 3  # Skip to next block (id, timestamp, text)
        else:
            i += 1
    
    return utterances

def load_voice_sample(voice_path):
    """
    Load and preprocess voice sample to 24kHz mono.
    """
    voice, sr = sf.read(voice_path)
    
    # Convert to mono if stereo
    if voice.ndim > 1:
        voice = voice.mean(axis=1)
    
    # Resample to 24kHz if needed
    if sr != 24000:
        voice = librosa.resample(voice, orig_sr=sr, target_sr=24000)
    
    return voice

def generate_audio_for_utterances(transcript_path, voice_sample_path, output_dir="output"):
    """
    Generate audio files for each utterance in the transcript.
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Parse transcript
    print("Parsing transcript...")
    utterances = parse_transcript_file(transcript_path)
    print(f"Found {len(utterances)} utterances")
    
    # Load voice sample
    print(f"Loading voice sample from {voice_sample_path}...")
    voice = load_voice_sample(voice_sample_path)
    
    # Load processor and model
    print("Loading VibeVoice model...")
    processor = VibeVoiceProcessor.from_pretrained("FabioSarracino/VibeVoice-Large-Q8")
    model = VibeVoiceForConditionalGenerationInference.from_pretrained(
        "FabioSarracino/VibeVoice-Large-Q8", 
        torch_dtype=torch.bfloat16
    )
    
    # Move to GPU if available, otherwise CPU
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = model.to(device).eval()
    model.set_ddpm_inference_steps(5)
    
    print(f"Model loaded on {device}")
    
    # Generate audio for each utterance
    for utterance_id, start_time, end_time, text in utterances:
        print(f"\nProcessing utterance {utterance_id}: {text[:50]}...")
        
        # Format text with speaker label
        formatted_text = f"Speaker 0: {text}"
        
        # Process inputs
        inputs = processor(
            text=[formatted_text],
            voice_samples=[[voice]], 
            return_tensors="pt"
        )
        
        # Move inputs to device
        inputs = {k: v.to(device) if isinstance(v, torch.Tensor) else v for k, v in inputs.items()}
        
        # Generate audio
        with torch.no_grad():
            audio = model.generate(
                **inputs, 
                cfg_scale=1.3,
                tokenizer=processor.tokenizer
            ).speech_outputs[0]
        
        # Save audio file
        output_filename = f"utterance_{utterance_id.zfill(2)}.wav"
        output_path = os.path.join(output_dir, output_filename)
        sf.write(output_path, audio.cpu().numpy().squeeze(), 24000)
        
        print(f"Saved: {output_path}")
    
    print(f"\n✓ Generated {len(utterances)} audio files in '{output_dir}' directory")

if __name__ == "__main__":
    # Configuration
    TRANSCRIPT_PATH = "../demo/2b_cogs_reduction.txt"
    VOICE_SAMPLE_PATH = "path/to/voice_sample.wav"  # Update this path
    OUTPUT_DIR = "output"
    
    # Check if voice sample exists
    if not os.path.exists(VOICE_SAMPLE_PATH):
        print(f"ERROR: Voice sample not found at '{VOICE_SAMPLE_PATH}'")
        print("Please update VOICE_SAMPLE_PATH in the script to point to your voice sample file.")
        exit(1)
    
    # Generate audio
    generate_audio_for_utterances(TRANSCRIPT_PATH, VOICE_SAMPLE_PATH, OUTPUT_DIR)