import numpy as np
import soundfile as sf
import io
import base64
import argparse
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Global variables
whisper_model = None
model_size = None


def initialize_model(size, device, compute_type):
    """Initialize the faster-whisper model."""
    global whisper_model, model_size
    from faster_whisper import WhisperModel

    model_size = size

    print(f"Loading faster-whisper model: {size}...")
    print(f"Device: {device}, Compute type: {compute_type}")

    whisper_model = WhisperModel(size, device=device, compute_type=compute_type)

    print(f"Model loaded successfully")
    if device == "cuda":
        import torch
        print(f"GPU: {torch.cuda.get_device_name(0)}")
    print("Server ready!")


def transcribe_audio(audio_bytes, language="en"):
    """Decode WAV bytes and run transcription, return text."""
    # Decode WAV from bytes
    buf = io.BytesIO(audio_bytes)
    audio_np, sample_rate = sf.read(buf)

    # Ensure float32 mono
    if audio_np.ndim > 1:
        audio_np = audio_np.mean(axis=1)
    audio_np = audio_np.astype(np.float32)

    # Run transcription
    segments, info = whisper_model.transcribe(
        audio_np,
        language=language,
        beam_size=5,
        vad_filter=True,
    )

    # Collect all segment texts
    text_parts = []
    for segment in segments:
        text_parts.append(segment.text.strip())

    return " ".join(text_parts)


# ── Endpoints ───────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    gpu_name = None
    try:
        import torch
        if torch.cuda.is_available():
            gpu_name = torch.cuda.get_device_name(0)
    except ImportError:
        pass

    return jsonify({
        "status": "ok",
        "model_loaded": whisper_model is not None,
        "engine": "faster-whisper",
        "model_size": model_size,
        "gpu_name": gpu_name,
    })


@app.route("/transcribe", methods=["POST"])
def transcribe():
    """
    Transcribe audio to text.
    Expects JSON: {"audio": base64_wav, "language": "en"}
    Returns JSON: {"text": "transcribed text", "success": true}
    """
    try:
        data = request.get_json()
        audio_b64 = data.get("audio", "")
        language = data.get("language", "en")

        if not audio_b64:
            return jsonify({"error": "No audio provided"}), 400
        if whisper_model is None:
            return jsonify({"error": "Model not initialized"}), 500

        audio_bytes = base64.b64decode(audio_b64)
        print(f"Transcribing audio ({len(audio_bytes)} bytes)...")

        text = transcribe_audio(audio_bytes, language)
        print(f"Transcribed: {text[:80]}...")

        return jsonify({
            "text": text,
            "success": True,
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/transcribe_batch", methods=["POST"])
def transcribe_batch():
    """
    Transcribe multiple audio files.
    Expects JSON: {"audios": [b64_1, b64_2, ...], "language": "en"}
    Returns JSON: {"transcriptions": [{"text": "..."}, ...], "count": N, "success": true}
    """
    try:
        data = request.get_json()
        audios = data.get("audios", [])
        language = data.get("language", "en")

        if not audios:
            return jsonify({"error": "No audios provided"}), 400
        if whisper_model is None:
            return jsonify({"error": "Model not initialized"}), 500

        print(f"Transcribing batch of {len(audios)} audio files...")

        transcriptions = []
        for idx, audio_b64 in enumerate(audios):
            audio_bytes = base64.b64decode(audio_b64)
            text = transcribe_audio(audio_bytes, language)
            transcriptions.append({"text": text})
            print(f"  Transcribed {idx + 1}/{len(audios)}: {text[:60]}...")

        print("Batch transcription completed successfully")

        return jsonify({
            "transcriptions": transcriptions,
            "count": len(transcriptions),
            "success": True,
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


# ── Main ────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Whisper Transcription Server (faster-whisper)")
    parser.add_argument(
        "--model", type=str, default="large-v3",
        help="Whisper model size (default: large-v3). Options: tiny, base, small, medium, large-v2, large-v3",
    )
    parser.add_argument(
        "--compute-type", type=str, default="float16",
        help="Compute type for CTranslate2 (default: float16). Options: float16, int8, int8_float16",
    )
    parser.add_argument(
        "--device", type=str, default="cuda",
        help="Device to run on (default: cuda). Options: cuda, cpu",
    )
    parser.add_argument(
        "--host", type=str, default="0.0.0.0",
        help="Host to bind to (default: 0.0.0.0)",
    )
    parser.add_argument(
        "--port", type=int, default=5001,
        help="Port to bind to (default: 5001)",
    )

    args = parser.parse_args()

    initialize_model(args.model, args.device, args.compute_type)

    print(f"\nStarting server on {args.host}:{args.port}")
    print(f"Health check: http://{args.host}:{args.port}/health")
    print(f"Transcribe endpoint: http://{args.host}:{args.port}/transcribe")
    print(f"Batch endpoint: http://{args.host}:{args.port}/transcribe_batch")

    app.run(host=args.host, port=args.port, threaded=True)


if __name__ == "__main__":
    main()
