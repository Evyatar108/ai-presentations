# Cloud GPU for TTS & WhisperX Servers

## Motivation

The TTS (Qwen3-TTS) and WhisperX servers currently run on a local machine with a CUDA-capable GPU. This creates a hard dependency on physical hardware availability — if the GPU machine is off, busy, or unreachable, no TTS generation, alignment, or verification can happen. Hosting these servers on cloud GPU instances decouples the workflow from a single machine and enables:

- **Team access**: Multiple developers or machines can generate/align audio without sharing one GPU
- **On-demand capacity**: Spin up only when needed, shut down when idle
- **Reproducibility**: A known, consistent environment (Docker image with pinned model versions)

## Current State

### Server Architecture

Two Flask HTTP servers, each requiring CUDA:

| Server | File | Default Port | GPU Requirement |
|--------|------|-------------|-----------------|
| Qwen3-TTS | `tts/server_qwen.py` | 5000 | CUDA required (`torch.cuda.is_available()` check) |
| WhisperX | `tts/server_whisperx.py` | 5001 | CUDA required for transcription + alignment |

### Configuration Flow

Server URLs are configured via `tts/server_config.json` (not checked in — machine-specific):

```json
{
  "server_url": "http://192.168.1.100:5000",
  "whisper_url": "http://192.168.1.100:5001"
}
```

**Two consumers** read this config:

1. **CLI scripts** (`scripts/utils/server-config.ts`): Reads from `../../tts/server_config.json` at build time. Functions: `loadTtsServerUrl()`, `loadWhisperUrl()`. Falls back to `localhost:5000` / `localhost:5001`.

2. **Browser client** (`src/framework/utils/ttsClient.ts`): Fetches `/server_config.json` at runtime (copied to `public/` by `vite-plugin-audio-writer.ts` on dev server start). Used for in-browser TTS regeneration via the StalenessWarning panel.

### Endpoints Used

**TTS server** (`server_qwen.py`):
- `GET /health` — Health check (returns `model_loaded`, `gpu_name`)
- `POST /generate_batch` — Generate audio from text(s). Accepts `texts[]`, optional `instruct`/`instructs[]`, optional `batch: true`

**WhisperX server** (`server_whisperx.py`):
- `GET /health` — Health check (returns `engine: "whisperx"`)
- `POST /transcribe` / `POST /transcribe_batch` — Audio → text transcription
- `POST /align` / `POST /align_batch` — Audio + reference text → word-level timestamps

## Proposed Approach

### Infrastructure

**AWS EC2 g4dn.xlarge** (or equivalent):
- 1x NVIDIA T4 GPU (16 GB VRAM) — sufficient for Qwen3-TTS + WhisperX
- 4 vCPUs, 16 GB RAM
- ~$0.53/hr on-demand, ~$0.16/hr spot

**Containerization**:
- Single Docker image with both servers (they share the CUDA runtime)
- Pre-bake model weights into the image to avoid cold-start model downloads
- Use `ENTRYPOINT` that starts both Flask servers via `supervisord` or a simple shell script
- Image size: ~15-20 GB (models are large)

**Networking**:
- ALB (Application Load Balancer) in front with HTTPS termination
- Path-based routing: `/tts/*` → port 5000, `/whisperx/*` → port 5001
- Or: Two separate target groups on same ALB, different ports
- Fixed DNS name (e.g., `gpu.myproject.internal` or a public domain)

### Authentication

- **API key via header** (`X-API-Key`) — simplest option
- Server-side: Flask middleware that checks the key against an env var
- CLI scripts: Read API key from `server_config.json` or env var `TTS_API_KEY`
- Browser client: Read API key from `server_config.json` — **concern for public deploys** (key visible in network tab)
  - Mitigation: For public deploys, proxy TTS requests through the Vite plugin / backend, never expose GPU server directly
  - For internal/dev use: API key in config is acceptable

### Request Concurrency

Both Flask servers currently use the default single-threaded WSGI development server. With multiple developers or simultaneous browser + CLI requests, this becomes a bottleneck — requests serialize or fail.

**For cloud deployment**:
- Run behind **gunicorn** with multiple workers: `gunicorn -w 2 -b 0.0.0.0:5000 server_qwen:app`
  - Worker count limited by GPU VRAM (only 1 model instance fits in 16 GB T4, but gunicorn handles HTTP concurrency)
  - Alternative: `--threads 4` for thread-based concurrency within one worker (safer for shared GPU model)
- Consider a **request queue** (Redis + Celery, or a simple in-process queue) for batch TTS jobs that take 30+ seconds
- The 30-minute timeout in `ttsClient.ts` (`AbortSignal.timeout(1800000)`) suggests long-running requests are expected — concurrent access needs proper queuing to avoid GPU OOM

### Monitoring & Observability

The existing `/health` endpoints return point-in-time status but there's no persistent monitoring:

- **CloudWatch metrics** for the EC2 instance: GPU utilization, memory, request latency
- **Custom CloudWatch metrics** from Flask middleware: requests/minute, generation time per segment, error rate
- **CloudWatch alarms**: GPU memory > 90% (OOM risk), error rate spike, instance unreachable
- **Dashboard**: A simple CloudWatch dashboard showing GPU health, cost-to-date, and active request count
- The auto-stop Lambda's idle detection depends on accurate CPU metrics — GPU-only workloads may show low CPU while actively generating. Consider a custom "last request timestamp" metric pushed from Flask middleware instead.

### Cost Management

| Strategy | Description |
|----------|-------------|
| **Auto-stop on idle** | CloudWatch alarm on `CPUUtilization < 5%` for 15 min → Lambda stops instance |
| **Start-on-demand** | CLI script or webhook that starts the instance before TTS generation |
| **Spot instances** | Use spot for non-urgent batch generation (~70% savings) |
| **Scheduled scaling** | If work hours are predictable, start/stop on schedule |

Estimated monthly cost at 4 hrs/day usage: ~$0.53 × 4 × 22 = **~$47/month** (on-demand) or **~$14/month** (spot).

### Configuration Changes

The only change to the codebase is the URL in `server_config.json`:

```json
{
  "server_url": "https://gpu.myproject.com/tts",
  "whisper_url": "https://gpu.myproject.com/whisperx"
}
```

Both `server-config.ts` (CLI) and `ttsClient.ts` (browser) already read from this config — no code changes needed for the happy path.

**Optional enhancements** (not required for MVP):
- Add `api_key` field to `server_config.json`, pass as `X-API-Key` header
- Add a `--start-gpu` flag to TTS scripts that calls AWS API to start the instance and wait for health check
- Add instance status indicator to the StalenessWarning panel

## Challenges & Open Questions

### Cold Start Latency

Model loading takes 30-60 seconds on first request after instance start. Mitigations:
- Pre-load models on instance boot (systemd service or Docker `HEALTHCHECK`)
- CLI scripts: Poll `/health` with retry before sending generation requests
- Browser: `checkTTSServerHealth()` in `ttsClient.ts` already handles unavailable server gracefully

### Model Update Workflow

When model versions change (new Qwen3-TTS release, WhisperX update):
- Rebuild Docker image with new model weights
- Tag with version (e.g., `tts-server:qwen3-v2.1`)
- Blue-green deployment: Start new instance, verify, switch DNS, stop old

### Browser-Side TTS Regeneration Security

The browser's `ttsClient.ts` calls the TTS server directly (`fetch(remoteTTSServerUrl/generate_batch)`). For public deployments:
- API key in `server_config.json` is visible to any user inspecting network requests
- **Solution**: Route browser TTS requests through the Vite plugin backend (which already handles `/api/save-audio`), adding a `/api/tts-generate` proxy endpoint
- This keeps the API key server-side only

### CORS Configuration

Both Flask servers already have `CORS(app, resources={r"/*": {"origins": "*"}})`. For cloud deployment:
- Restrict to specific origins (the deployed SPA URL)
- Or rely on ALB/API Gateway to handle CORS

### Data Transfer

Audio files are base64-encoded in HTTP responses. For batch generation of an entire demo:
- A 30-segment demo generates ~50-100 MB of audio data
- Over internet (vs. LAN), this adds latency
- Consider: Streaming responses, or generating to S3 and returning pre-signed URLs

## Dependencies

- **Blocks nothing** — this is a pure infrastructure change
- **No code changes required** for basic usage (just config URLs)
- **Benefits from Config Unification (01)**: `api_key` field follows the established pattern
- **Optional dependency on Azure Deployment (03)**: If the SPA is deployed publicly, browser-side TTS needs the proxy approach mentioned above

## Effort Estimate

| Phase | Work | Time |
|-------|------|------|
| Dockerfile + gunicorn + supervisord | Build image with both servers, concurrent request handling | 3-4 hours |
| AWS infrastructure | EC2, ALB, security groups, DNS | 3-4 hours |
| Auto-stop Lambda | CloudWatch alarm + Lambda function | 2-3 hours |
| API key auth | Flask middleware + config support | 2-3 hours |
| Monitoring | CloudWatch dashboard, custom metrics, alerts | 2-3 hours |
| Testing + docs | Verify all scripts work against cloud server | 2-3 hours |
| **Total** | | **~1-1.5 weeks** |

**Size: M**

## Key Files

| File | Impact |
|------|--------|
| `tts/server_qwen.py` | No changes (runs in container as-is) |
| `tts/server_whisperx.py` | No changes (runs in container as-is) |
| `tts/server_config.json` | URL change only |
| `scripts/utils/server-config.ts` | Optional: Add API key header support |
| `src/framework/utils/ttsClient.ts` | Optional: Add API key header support |
| `vite-plugin-audio-writer.ts` | Optional: Add `/api/tts-generate` proxy endpoint |

## Reversibility

**Fully reversible** — change URLs back to localhost and you're back to local GPU. No code contracts change. The Docker image is useful regardless (reproducible local dev setup too).
