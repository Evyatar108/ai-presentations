"""
WhisperX Server — Transcription + Forced Alignment

Provides transcription (for TTS verification) and forced alignment
(for word-level timestamps used by inline markers).

Usage:
    python server_whisperx.py --model large-v3 --port 5001

Endpoints:
    GET  /health           — Health check (engine: whisperx)
    POST /transcribe       — Single audio → text
    POST /transcribe_batch — Batch audio → text
    POST /align            — Single audio + reference text → word timestamps
    POST /align_batch      — Batch audio + reference texts → word timestamps
"""

import numpy as np
import soundfile as sf
import io
import base64
import argparse
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Global variables
whisperx_model = None
align_model = None
align_metadata = None
model_size = None
device_str = None
compute_type_str = None


def initialize_model(size, device, compute_type):
    """Initialize the WhisperX model (used for transcription)."""
    global whisperx_model, model_size, device_str, compute_type_str
    import whisperx

    model_size = size
    device_str = device
    compute_type_str = compute_type

    print(f"Loading WhisperX model: {size}...")
    print(f"Device: {device}, Compute type: {compute_type}")

    whisperx_model = whisperx.load_model(size, device, compute_type=compute_type)

    print("Model loaded successfully")
    if device == "cuda":
        print(f"GPU: {torch.cuda.get_device_name(0)}")
    print("Server ready!")


def load_align_model(language="en"):
    """Lazy-load the alignment model on first use."""
    global align_model, align_metadata
    if align_model is not None:
        return

    import whisperx
    print(f"Loading alignment model for language: {language}...")
    align_model, align_metadata = whisperx.load_align_model(
        language_code=language, device=device_str
    )
    print("Alignment model loaded.")


WHISPERX_SAMPLE_RATE = 16000


def decode_audio(audio_b64):
    """Decode base64 WAV to float32 numpy array, resampled to 16kHz for WhisperX."""
    audio_bytes = base64.b64decode(audio_b64)
    buf = io.BytesIO(audio_bytes)
    audio_np, sample_rate = sf.read(buf)

    # Ensure float32 mono
    if audio_np.ndim > 1:
        audio_np = audio_np.mean(axis=1)
    audio_np = audio_np.astype(np.float32)

    # Resample to 16kHz if needed (WhisperX expects 16kHz)
    if sample_rate != WHISPERX_SAMPLE_RATE:
        import librosa
        audio_np = librosa.resample(
            audio_np, orig_sr=sample_rate, target_sr=WHISPERX_SAMPLE_RATE
        )
        sample_rate = WHISPERX_SAMPLE_RATE

    return audio_np, sample_rate


def transcribe_audio(audio_np, language="en"):
    """Transcribe audio using WhisperX, return text."""
    result = whisperx_model.transcribe(audio_np, language=language, batch_size=16)
    segments = result.get("segments", [])
    text_parts = [seg["text"].strip() for seg in segments]
    return " ".join(text_parts)


def align_audio(audio_np, text, language="en"):
    """
    Forced-align audio against reference text using WhisperX.
    Returns list of word-level timestamps.
    """
    import whisperx

    load_align_model(language)

    # WhisperX align expects a transcription result with segments.
    # We create a synthetic result from the reference text.
    segments = [{"text": text, "start": 0.0, "end": float(len(audio_np)) / 16000.0}]
    transcript = {"segments": segments, "language": language}

    result = whisperx.align(
        transcript["segments"],
        align_model,
        align_metadata,
        audio_np,
        device_str,
        return_char_alignments=False,
    )

    # Extract word-level timestamps
    words = []
    for seg in result.get("segments", []):
        for w in seg.get("words", []):
            word_entry = {
                "word": w.get("word", ""),
                "start": round(w.get("start", 0.0), 4),
                "end": round(w.get("end", 0.0), 4),
                "score": round(w.get("score", 0.0), 4),
            }
            words.append(word_entry)

    return words


# ── Endpoints ───────────────────────────────────────────────────────


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    gpu_name = None
    try:
        if torch.cuda.is_available():
            gpu_name = torch.cuda.get_device_name(0)
    except Exception:
        pass

    return jsonify(
        {
            "status": "ok",
            "model_loaded": whisperx_model is not None,
            "engine": "whisperx",
            "model_size": model_size,
            "gpu_name": gpu_name,
        }
    )


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
        if whisperx_model is None:
            return jsonify({"error": "Model not initialized"}), 500

        audio_np, _ = decode_audio(audio_b64)
        print(f"Transcribing audio ({len(audio_np)} samples)...")

        text = transcribe_audio(audio_np, language)
        print(f"Transcribed: {text[:80]}...")

        return jsonify({"text": text, "success": True})

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
        if whisperx_model is None:
            return jsonify({"error": "Model not initialized"}), 500

        print(f"Transcribing batch of {len(audios)} audio files...")

        transcriptions = []
        for idx, audio_b64 in enumerate(audios):
            audio_np, _ = decode_audio(audio_b64)
            text = transcribe_audio(audio_np, language)
            transcriptions.append({"text": text})
            print(f"  Transcribed {idx + 1}/{len(audios)}: {text[:60]}...")

        print("Batch transcription completed successfully")

        return jsonify(
            {
                "transcriptions": transcriptions,
                "count": len(transcriptions),
                "success": True,
            }
        )

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/align", methods=["POST"])
def align():
    """
    Forced alignment: audio + reference text → word-level timestamps.
    Expects JSON: {"audio": base64_wav, "text": "reference text", "language": "en"}
    Returns JSON: {
        "words": [{"word": "hello", "start": 0.0, "end": 0.32, "score": 0.95}, ...],
        "success": true
    }
    """
    try:
        data = request.get_json()
        audio_b64 = data.get("audio", "")
        text = data.get("text", "")
        language = data.get("language", "en")

        if not audio_b64:
            return jsonify({"error": "No audio provided"}), 400
        if not text:
            return jsonify({"error": "No text provided"}), 400
        if whisperx_model is None:
            return jsonify({"error": "Model not initialized"}), 500

        audio_np, _ = decode_audio(audio_b64)
        print(f"Aligning audio ({len(audio_np)} samples) against text: {text[:60]}...")

        words = align_audio(audio_np, text, language)
        print(f"Aligned {len(words)} words")

        return jsonify({"words": words, "success": True})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/align_batch", methods=["POST"])
def align_batch():
    """
    Batch forced alignment: multiple audio + reference texts → word-level timestamps.
    Expects JSON: {
        "items": [
            {"audio": base64_wav, "text": "reference text"},
            ...
        ],
        "language": "en"
    }
    Returns JSON: {
        "alignments": [
            {"words": [{"word": "hello", "start": 0.0, "end": 0.32, "score": 0.95}, ...]},
            ...
        ],
        "count": N,
        "success": true
    }
    """
    try:
        data = request.get_json()
        items = data.get("items", [])
        language = data.get("language", "en")

        if not items:
            return jsonify({"error": "No items provided"}), 400
        if whisperx_model is None:
            return jsonify({"error": "Model not initialized"}), 500

        print(f"Aligning batch of {len(items)} items...")

        alignments = []
        for idx, item in enumerate(items):
            audio_b64 = item.get("audio", "")
            text = item.get("text", "")

            if not audio_b64 or not text:
                alignments.append({"words": [], "error": "Missing audio or text"})
                continue

            audio_np, _ = decode_audio(audio_b64)
            words = align_audio(audio_np, text, language)
            alignments.append({"words": words})
            print(f"  Aligned {idx + 1}/{len(items)}: {len(words)} words")

        print("Batch alignment completed successfully")

        return jsonify(
            {"alignments": alignments, "count": len(alignments), "success": True}
        )

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


# ── Main ────────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(
        description="WhisperX Server — Transcription + Forced Alignment"
    )
    parser.add_argument(
        "--model",
        type=str,
        default="large-v3",
        help="Whisper model size (default: large-v3). Options: tiny, base, small, medium, large-v2, large-v3",
    )
    parser.add_argument(
        "--compute-type",
        type=str,
        default="float16",
        help="Compute type for CTranslate2 (default: float16). Options: float16, int8, int8_float16",
    )
    parser.add_argument(
        "--device",
        type=str,
        default="cuda",
        help="Device to run on (default: cuda). Options: cuda, cpu",
    )
    parser.add_argument(
        "--host",
        type=str,
        default="0.0.0.0",
        help="Host to bind to (default: 0.0.0.0)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=5001,
        help="Port to bind to (default: 5001)",
    )

    args = parser.parse_args()

    initialize_model(args.model, args.device, args.compute_type)

    print(f"\nStarting server on {args.host}:{args.port}")
    print(f"Health check: http://{args.host}:{args.port}/health")
    print(f"Transcribe endpoint: http://{args.host}:{args.port}/transcribe")
    print(f"Batch transcribe: http://{args.host}:{args.port}/transcribe_batch")
    print(f"Align endpoint: http://{args.host}:{args.port}/align")
    print(f"Batch align: http://{args.host}:{args.port}/align_batch")

    app.run(host=args.host, port=args.port, threaded=True)


if __name__ == "__main__":
    main()
