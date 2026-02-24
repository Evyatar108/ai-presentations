# Content Pipeline Automation

## Motivation

Today, every step from editing narration text to having updated audio on a deployed presentation is manual:

1. Edit narration text in slide component
2. Start the GPU machine (if not already running)
3. Run `npm run tts:generate -- --demo {id}` (or regen specific segments)
4. Run `npm run tts:align -- --demo {id}`
5. Run `npm run tts:duration -- --demo {id}`
6. Commit the new audio files
7. Push to GitHub
8. (If deployed) Manually trigger a deploy

This workflow is error-prone (steps get skipped, alignment gets stale) and creates a bottleneck — only people with GPU access and CLI knowledge can update audio. Automating the pipeline removes these friction points.

## Current State

### Pieces Already in Place

| Piece | Status | Location |
|-------|--------|----------|
| TTS generation via CLI | Working | `scripts/generate-tts.ts` — accepts `--demo`, `--segments` |
| WhisperX alignment via CLI | Working | `scripts/generate-alignment.ts` — accepts `--demo` |
| Duration calculation | Working | `scripts/calculate-durations.ts` — updates `metadata.ts` |
| Health check polling | Working | `scripts/utils/server-config.ts` — `loadTtsServerUrl()` with fallback |
| Cache-based change detection | Working | `scripts/utils/tts-cache.ts` — tracks narration text hashes |
| Staleness detection | Working | `vite-plugin-handlers/staleness.ts` — compares text vs. cache |
| Audio format: WAV | Default | `audioPath.ts` — `.wav` extension hardcoded |
| Cloud GPU | Planned (doc 02) | Remote TTS/WhisperX servers |
| Azure Blob Storage | Planned (doc 03) | CDN for audio assets |

### What's Missing

- **Orchestration**: No GitHub Actions workflow tying these together
- **Change detection at CI level**: The staleness check is a dev-server endpoint, not a CI-friendly script
- **GPU instance lifecycle**: No automated start/stop of cloud GPU from CI
- **WAV→MP3 conversion**: No build-time conversion step exists yet
- **Blob upload**: No automated asset upload to Azure

## Proposed Approach

### GitHub Actions Workflow

```yaml
# .github/workflows/content-pipeline.yml
name: Content Pipeline

on:
  push:
    branches: [main]
    paths:
      - 'presentation-app/src/demos/**/Chapter*.tsx'  # Narration text changes
      - 'presentation-app/src/demos/**/metadata.ts'    # Metadata changes

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      changed_demos: ${{ steps.detect.outputs.demos }}
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 2 }
      - id: detect
        run: |
          # Compare narration text hashes against TTS cache
          # Output list of demo IDs with stale audio
          cd presentation-app
          npm ci
          DEMOS=$(npx tsx scripts/detect-stale-demos.ts)
          echo "demos=$DEMOS" >> $GITHUB_OUTPUT

  generate-audio:
    needs: detect-changes
    if: needs.detect-changes.outputs.changed_demos != '[]'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd presentation-app && npm ci

      # Start cloud GPU instance
      - name: Start GPU instance
        run: |
          aws ec2 start-instances --instance-ids ${{ vars.GPU_INSTANCE_ID }}
          aws ec2 wait instance-running --instance-ids ${{ vars.GPU_INSTANCE_ID }}
          # Wait for TTS server health check
          for i in $(seq 1 30); do
            curl -sf ${{ vars.TTS_SERVER_URL }}/health && break || sleep 10
          done
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      # Generate TTS + alignment for each changed demo
      - name: Generate audio
        run: |
          cd presentation-app
          for demo in ${{ needs.detect-changes.outputs.changed_demos }}; do
            npx tsx scripts/generate-tts.ts --demo "$demo"
            npx tsx scripts/generate-alignment.ts --demo "$demo"
            npx tsx scripts/calculate-durations.ts --demo "$demo"
          done
        env:
          TTS_SERVER_URL: ${{ vars.TTS_SERVER_URL }}
          WHISPER_URL: ${{ vars.WHISPER_URL }}
          TTS_API_KEY: ${{ secrets.TTS_API_KEY }}

      # Convert WAV → MP3 for CDN
      - name: Convert audio format
        run: |
          sudo apt-get install -y ffmpeg
          find presentation-app/public/audio -name '*.wav' \
            -exec sh -c 'ffmpeg -i "$1" -b:a 128k "${1%.wav}.mp3"' _ {} \;

      # Upload to blob storage
      - name: Upload assets
        uses: azure/CLI@v2
        with:
          inlineScript: |
            az storage blob upload-batch \
              --source presentation-app/public/audio \
              --destination '$web/audio' \
              --pattern '*.mp3' \
              --account-name ${{ vars.STORAGE_ACCOUNT }} \
              --overwrite

      # Stop GPU instance
      - name: Stop GPU instance
        if: always()
        run: aws ec2 stop-instances --instance-ids ${{ vars.GPU_INSTANCE_ID }}
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### New Script: `detect-stale-demos.ts`

A CI-friendly version of the staleness check that:
1. Reads all demos' narration text from slide components (via existing `demo-discovery.ts`)
2. Compares against `tts-cache.json` hashes (via existing `TtsCacheStore`)
3. Outputs a JSON array of demo IDs with stale segments
4. Exit code 0 with empty array if nothing is stale

This reuses the same hash comparison logic as `vite-plugin-handlers/staleness.ts` but runs headlessly.

### Pipeline Flow

```
Push with narration changes
  │
  ├─ detect-stale-demos.ts → list of affected demo IDs
  │
  ├─ Start GPU instance (if not already running)
  │
  ├─ For each stale demo:
  │   ├─ tts:generate (only stale segments, via cache)
  │   ├─ tts:align (re-align affected segments)
  │   └─ tts:duration (update metadata)
  │
  ├─ Convert WAV → MP3
  │
  ├─ Upload MP3 to blob storage
  │
  ├─ Stop GPU instance
  │
  └─ (Optional) Commit updated cache/duration files back to repo
```

## Challenges & Open Questions

### Committing Generated Files Back

The pipeline generates/updates:
- `public/audio/**/*.wav` — Audio files (large, possibly gitignored)
- `public/audio/{demo-id}/alignment.json` — Word timestamps
- `tts-cache.json` — Hash cache
- `metadata.ts` `durationInfo` fields — Updated by `calculate-durations.ts`

Options:
- **(A)** Commit back to the same branch via `git push` in the workflow — simple but creates noise
- **(B)** Only upload to blob storage, don't commit audio — cache files still need committing
- **(C)** Treat blob storage as the source of truth for audio; local `public/audio/` is gitignored in production

**Recommendation**: (B) — upload audio to blob, commit only small metadata files (cache, durations, alignment JSON) back to the repo.

### GPU Cost During CI

The pipeline starts the GPU instance, generates audio, then stops it. Cost:
- Typical run: 5-15 minutes for a single demo's worth of segments
- GPU instance cost: ~$0.53/hr → ~$0.10 per pipeline run
- Monthly cost with 50 runs: ~$5/month — negligible

### Partial Failures

If TTS generation succeeds but alignment fails:
- The `if: always()` on the stop step ensures the GPU is always stopped
- Stale segments remain stale — the next push will retry
- Consider: GitHub Actions `continue-on-error` on per-demo steps so one demo's failure doesn't block others

### Path Filter Sensitivity

The `paths` trigger in the workflow uses `Chapter*.tsx` and `metadata.ts` patterns. This may miss:
- Narration text changes in external narration JSON files (`public/narration/`)
- Changes to TTS `instruct` fields that affect audio quality but not text

**Mitigation**: Also trigger on `public/narration/**/*.json` changes, and add a manual trigger (`workflow_dispatch`) for on-demand runs.

## Dependencies

- **Requires Cloud GPU (02)**: Needs remote TTS/WhisperX servers accessible from GitHub Actions runners
- **Requires Azure Deployment Phase 2 (03)**: Needs blob storage for audio upload
- **Benefits from Config Unification (01)**: Server URLs and API keys read from consistent env var pattern
- **Benefits from Audio Format Conversion (03, Phase 3)**: WAV→MP3 step

## Effort Estimate

| Task | Time |
|------|------|
| `detect-stale-demos.ts` script | 2-3 hours |
| GitHub Actions workflow | 2-3 hours |
| GPU start/stop integration | 1-2 hours |
| Testing + edge cases | 2-3 hours |
| **Total** | **~4-6 hours** |

**Size: S-M**

## Key Files

| File | Impact |
|------|--------|
| `scripts/detect-stale-demos.ts` | New — CI-friendly staleness detection |
| `scripts/utils/tts-cache.ts` | Reuse existing `TtsCacheStore` |
| `scripts/utils/demo-discovery.ts` | Reuse existing demo enumeration |
| `.github/workflows/content-pipeline.yml` | New — pipeline workflow |
| `scripts/generate-tts.ts` | No changes (already accepts `--demo`) |
| `scripts/generate-alignment.ts` | No changes (already accepts `--demo`) |
| `scripts/calculate-durations.ts` | No changes (already auto-discovers) |

## Reversibility

**Fully reversible** — the workflow is a GitHub Actions file that can be deleted or disabled. The `detect-stale-demos.ts` script is additive. No existing code is modified. Manual workflow remains available at all times.
