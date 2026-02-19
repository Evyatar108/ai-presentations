import requests
import base64
import soundfile as sf
import os
import re
import json

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

def check_server_health(server_url):
    """Check if the server is running and healthy."""
    try:
        response = requests.get(f"{server_url}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Server is healthy")
            print(f"  - Model loaded: {data.get('model_loaded', False)}")
            print(f"  - Device: {data.get('device', 'unknown')}")
            return True
        else:
            print(f"✗ Server returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"✗ Could not connect to server at {server_url}")
        return False
    except Exception as e:
        print(f"✗ Error checking server health: {e}")
        return False

def generate_audio_remote(server_url, text):
    """Send text to server and get generated audio."""
    try:
        response = requests.post(
            f"{server_url}/generate",
            json={"text": text},
            timeout=90000  # 25 hours timeout for generation
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                # Decode base64 audio
                audio_b64 = data.get('audio')
                audio_bytes = base64.b64decode(audio_b64)
                return audio_bytes, data.get('sample_rate', 24000)
            else:
                print(f"Server returned error: {data.get('error', 'Unknown error')}")
                return None, None
        else:
            print(f"Server returned status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None, None
            
    except requests.exceptions.Timeout:
        print("Request timed out. The server might be processing, but took too long.")
        return None, None
    except Exception as e:
        print(f"Error generating audio: {e}")
        return None, None

def generate_audio_batch_remote(server_url, texts):
    """Send multiple texts to server and get generated audio files in batch."""
    try:
        response = requests.post(
            f"{server_url}/generate_batch",
            json={"texts": texts},
            timeout=900  # 15 minutes timeout for batch generation
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                # Decode base64 audio files
                audios_b64 = data.get('audios', [])
                audio_files = []
                for audio_b64 in audios_b64:
                    audio_bytes = base64.b64decode(audio_b64)
                    audio_files.append(audio_bytes)
                return audio_files, data.get('sample_rate', 24000)
            else:
                print(f"Server returned error: {data.get('error', 'Unknown error')}")
                return None, None
        else:
            print(f"Server returned status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None, None
            
    except requests.exceptions.Timeout:
        print("Request timed out. The server might be processing, but took too long.")
        return None, None
    except Exception as e:
        print(f"Error generating batch audio: {e}")
        return None, None

def process_transcript(server_url, transcript_path, output_dir="output", concatenate=False, batch=False):
    """Process entire transcript file and generate audio for each utterance."""
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Check server health
    print(f"Connecting to server at {server_url}...")
    if not check_server_health(server_url):
        print("\nPlease ensure the server is running and accessible.")
        return
    
    # Parse transcript
    print("\nParsing transcript...")
    utterances = parse_transcript_file(transcript_path)
    print(f"Found {len(utterances)} utterances\n")
    
    if batch:
        # BATCH MODE: Generate all utterances separately but in one batch request
        print("Using batch mode (separate utterances, single batch request)...\n")
        
        # Prepare all texts with speaker labels
        all_texts = [f"Speaker 0: {text}" for _, _, _, text in utterances]
        
        print(f"Generating {len(utterances)} audio files in one batch request...")
        print(f"Total utterances: {len(utterances)}\n")
        
        # Generate all audio files in batch
        audio_files, sample_rate = generate_audio_batch_remote(server_url, all_texts)
        
        if audio_files:
            print(f"\nSaving {len(audio_files)} audio files...")
            for idx, ((utterance_id, _, _, text), audio_bytes) in enumerate(zip(utterances, audio_files), 1):
                output_filename = f"batch_utterance_{utterance_id.zfill(2)}.wav"
                output_path = os.path.join(output_dir, output_filename)
                
                with open(output_path, 'wb') as f:
                    f.write(audio_bytes)
                
                print(f"  [{idx}/{len(audio_files)}] ✓ Saved: {output_filename}")
            
            print(f"\n{'='*50}")
            print(f"Batch generation completed successfully!")
            print(f"Generated {len(audio_files)} separate audio files")
            print(f"Output directory: {output_dir}")
            print(f"{'='*50}")
        else:
            print(f"✗ Failed to generate batch audio")
    
    elif concatenate:
        # CONCATENATED MODE: Generate all utterances in a single request for better quality
        print("Using concatenated mode (all utterances in one generation)...\n")
        
        # Concatenate all texts with newlines
        all_texts = [text for _, _, _, text in utterances]
        concatenated_text = "\n".join([f"Speaker 0: {text}" for text in all_texts])
        
        print(f"Generating single audio file with {len(utterances)} segments...")
        print(f"Total text length: {len(concatenated_text)} characters\n")
        
        # Generate single audio file
        audio_bytes, sample_rate = generate_audio_remote(server_url, concatenated_text)
        
        if audio_bytes:
            output_filename = "combined_utterances.wav"
            output_path = os.path.join(output_dir, output_filename)
            
            with open(output_path, 'wb') as f:
                f.write(audio_bytes)
            
            print(f"✓ Saved combined audio: {output_path}")
            print(f"\nNote: This is a single audio file containing all {len(utterances)} utterances.")
            print(f"The model generated this with full context, which should improve quality.")
        else:
            print(f"✗ Failed to generate audio")
    else:
        # INDIVIDUAL MODE: Generate each utterance separately
        print("Using individual mode (separate generation per utterance)...\n")
        
        success_count = 0
        for idx, (utterance_id, start_time, end_time, text) in enumerate(utterances, 1):
            print(f"[{idx}/{len(utterances)}] Processing utterance {utterance_id}...")
            print(f"  Text: {text[:60]}{'...' if len(text) > 60 else ''}")
            
            # Format text with speaker label
            formatted_text = f"Speaker 0: {text}"
            
            # Generate audio
            audio_bytes, sample_rate = generate_audio_remote(server_url, formatted_text)
            
            if audio_bytes:
                # Save audio file
                output_filename = f"utterance_{utterance_id.zfill(2)}.wav"
                output_path = os.path.join(output_dir, output_filename)
                
                # Write bytes to file
                with open(output_path, 'wb') as f:
                    f.write(audio_bytes)
                
                print(f"  ✓ Saved: {output_path}\n")
                success_count += 1
            else:
                print(f"  ✗ Failed to generate audio\n")
        
        print(f"\n{'='*50}")
        print(f"Completed: {success_count}/{len(utterances)} utterances generated successfully")
        print(f"Output directory: {output_dir}")
        print(f"{'='*50}")

def load_server_config(config_path='server_config.json'):
    """Load server configuration from JSON file."""
    if os.path.exists(config_path):
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
                server_url = config.get('server_url', '').strip()
                if server_url:
                    return server_url
        except Exception as e:
            print(f"Warning: Could not load config file: {e}")
    return None

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='VibeVoice TTS Client')
    parser.add_argument('--server', type=str,
                        help='Server URL (e.g., http://192.168.1.100:5000). If not provided, reads from server_config.json')
    parser.add_argument('--transcript', type=str, default='../demo/2b_cogs_reduction.txt',
                        help='Path to transcript file')
    parser.add_argument('--output', type=str, default='output',
                        help='Output directory for audio files')
    parser.add_argument('--concatenate', action='store_true',
                        help='Generate all utterances in a single audio file for better quality')
    parser.add_argument('--batch', action='store_true',
                        help='Generate all utterances as separate files in one batch request (efficient)')
    parser.add_argument('--test', action='store_true',
                        help='Only test server connection without processing')
    
    args = parser.parse_args()
    
    # Get server URL from argument or config file
    server_url = args.server
    if not server_url:
        server_url = load_server_config()
        if not server_url:
            print("ERROR: No server URL provided.")
            print("Either:")
            print("  1. Use --server argument: python client.py --server http://192.168.1.100:5000")
            print("  2. Set 'server_url' in server_config.json")
            return
    
    # Ensure server URL doesn't have trailing slash
    server_url = server_url.rstrip('/')
    
    if args.test:
        print("Testing server connection...")
        check_server_health(server_url)
    else:
        # Check if transcript exists
        if not os.path.exists(args.transcript):
            print(f"ERROR: Transcript file not found at '{args.transcript}'")
            return
        
        # Check for conflicting modes
        if args.concatenate and args.batch:
            print("ERROR: Cannot use both --concatenate and --batch modes together.")
            print("Choose one:")
            print("  --concatenate: Single audio file with all utterances (better context)")
            print("  --batch: Separate audio files, batch processed (more efficient than individual)")
            return
        
        process_transcript(server_url, args.transcript, args.output,
                         concatenate=args.concatenate, batch=args.batch)

if __name__ == "__main__":
    main()