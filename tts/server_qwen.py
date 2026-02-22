import torch
import soundfile as sf
import librosa
import numpy as np
import io
import re
import base64
import argparse
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Global variables
model = None
default_speaker = None
default_language = None


def initialize_model(model_name, speaker, language):
    """Initialize the Qwen3-TTS model."""
    global model, default_speaker, default_language
    from qwen_tts import Qwen3TTSModel

    default_speaker = speaker
    default_language = language

    print(f"Loading Qwen3-TTS model: {model_name}...")

    if not torch.cuda.is_available():
        raise RuntimeError("CUDA is not available. This server requires a CUDA-enabled GPU.")

    model = Qwen3TTSModel.from_pretrained(model_name)

    print(f"Model loaded on CUDA")
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"Speaker: {speaker}")
    print(f"Language: {language}")
    print("Server ready!")


# ── Text preprocessing ─────────────────────────────────────────────

# Strip "Speaker N: " prefix added by TS callers (VibeVoice-specific)
_SPEAKER_PREFIX_RE = re.compile(r"^Speaker\s+\d+:\s*")

# Strip trailing ". Amazing." / " Amazing." workaround added by ttsClient.ts
_AMAZING_SUFFIX_RE = re.compile(r"[.\s]*\s*Amazing\.\s*$")


def clean_text(text: str) -> str:
    """Remove VibeVoice-specific decorations from input text."""
    text = _SPEAKER_PREFIX_RE.sub("", text)
    text = _AMAZING_SUFFIX_RE.sub("", text)
    return text.strip()


# ── Audio helpers ───────────────────────────────────────────────────

def wav_to_base64(audio_np, sr: int) -> str:
    """Convert a numpy audio array to base64-encoded WAV at 24 kHz."""
    if isinstance(audio_np, torch.Tensor):
        audio_np = audio_np.cpu().numpy()
    audio_np = audio_np.squeeze().astype(np.float32)

    # Resample to 24 kHz if the model outputs a different rate
    if sr != 24000:
        audio_np = librosa.resample(audio_np, orig_sr=sr, target_sr=24000)

    buf = io.BytesIO()
    sf.write(buf, audio_np, 24000, format="WAV", subtype="PCM_16")
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode("utf-8")
    buf.close()
    return b64


def generate_one(text: str, instruct: str | None = None) -> str:
    """Generate audio for a single text and return base64-encoded WAV."""
    cleaned = clean_text(text)

    kwargs = dict(
        text=cleaned,
        language=default_language,
        speaker=default_speaker,
    )
    if instruct:
        kwargs["instruct"] = instruct

    wavs, sr = model.generate_custom_voice(**kwargs)

    audio_np = wavs[0] if isinstance(wavs, list) else wavs
    return wav_to_base64(audio_np, sr)


def generate_batch_native(texts: list[str], instruct: str | None = None,
                          instructs: list[str] | None = None) -> list[str]:
    """Generate audio for multiple texts using the model's native batch support."""
    cleaned = [clean_text(t) for t in texts]
    n = len(cleaned)

    kwargs = dict(
        text=cleaned,
        language=[default_language] * n,
        speaker=[default_speaker] * n,
    )

    # Per-item instructs take priority over global instruct
    if instructs and len(instructs) == n:
        kwargs["instruct"] = [inst or "" for inst in instructs]
    elif instruct:
        kwargs["instruct"] = [instruct] * n

    wavs, sr = model.generate_custom_voice(**kwargs)

    return [wav_to_base64(wavs[i], sr) for i in range(n)]


# ── Endpoints ───────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "engine": "qwen3-tts",
        "device": "cuda",
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
        "speaker": default_speaker,
        "language": default_language,
    })


@app.route("/generate", methods=["POST"])
def generate_audio():
    """
    Generate audio from text.
    Expects JSON: {"text": "Hello!", "instruct": "speak slowly"}  (instruct is optional)
    Returns JSON: {"audio": base64_wav, "sample_rate": 24000, "success": true}
    """
    try:
        data = request.get_json()
        text = data.get("text", "")
        instruct = data.get("instruct") or None

        if not text:
            return jsonify({"error": "No text provided"}), 400
        if model is None:
            return jsonify({"error": "Model not initialized"}), 500

        print(f"Generating audio for: {clean_text(text)[:80]}...")
        if instruct:
            print(f"Instruct: {instruct}")
        audio_b64 = generate_one(text, instruct)
        print("Audio generated successfully")

        return jsonify({
            "audio": audio_b64,
            "sample_rate": 24000,
            "success": True,
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/generate_batch", methods=["POST"])
def generate_audio_batch():
    """
    Generate audio for multiple texts.
    Expects JSON:
      {"texts": ["Speaker 0: Hello!", "Speaker 0: Hi!"], "instruct": "speak clearly"}
      or with per-item instructs:
      {"texts": [...], "instructs": ["instruct1", "instruct2"]}
    When "batch" is true (default for >1 texts), uses native model batch inference.
    When "batch" is false, falls back to sequential generation.
    Returns JSON: {"audios": [b64_1, b64_2, ...], "sample_rate": 24000, "count": N, "success": true}
    """
    try:
        data = request.get_json()
        texts = data.get("texts", [])
        instruct = data.get("instruct") or None
        instructs = data.get("instructs") or None
        use_batch = data.get("batch", len(texts) > 1)

        if not texts:
            return jsonify({"error": "No texts provided"}), 400
        if model is None:
            return jsonify({"error": "Model not initialized"}), 500

        if use_batch and len(texts) > 1:
            print(f"Generating audio for {len(texts)} utterances (native batch)...")
            if instructs:
                print(f"Per-item instructs: {len(instructs)} entries")
            elif instruct:
                print(f"Instruct: {instruct}")

            audios_b64 = generate_batch_native(texts, instruct, instructs)
        else:
            print(f"Generating audio for {len(texts)} utterance(s) sequentially...")
            if instruct:
                print(f"Instruct: {instruct}")

            audios_b64 = []
            for idx, text in enumerate(texts):
                per_instruct = instructs[idx] if instructs and idx < len(instructs) else instruct
                audio_b64 = generate_one(text, per_instruct or None)
                audios_b64.append(audio_b64)
                print(f"  Generated audio {idx + 1}/{len(texts)}")

        # Free GPU memory between batches
        torch.cuda.empty_cache()

        print("Batch generation completed successfully")

        return jsonify({
            "audios": audios_b64,
            "sample_rate": 24000,
            "count": len(audios_b64),
            "success": True,
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


# ── Main ────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Qwen3-TTS Server")
    parser.add_argument(
        "--speaker", type=str, default="Vivian",
        help="Preset speaker timbre (default: Vivian). Options: Vivian, Chelsie, Ethan, etc.",
    )
    parser.add_argument(
        "--language", type=str, default="English",
        help="Language for synthesis (default: English)",
    )
    parser.add_argument(
        "--model", type=str, default="Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
        help="HuggingFace model ID (default: Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice)",
    )
    parser.add_argument(
        "--host", type=str, default="0.0.0.0",
        help="Host to bind to (default: 0.0.0.0)",
    )
    parser.add_argument(
        "--port", type=int, default=5000,
        help="Port to bind to (default: 5000)",
    )

    args = parser.parse_args()

    initialize_model(args.model, args.speaker, args.language)

    print(f"\nStarting server on {args.host}:{args.port}")
    print(f"Health check: http://{args.host}:{args.port}/health")
    print(f"Generate endpoint: http://{args.host}:{args.port}/generate")

    app.run(host=args.host, port=args.port, threaded=True)


if __name__ == "__main__":
    main()
