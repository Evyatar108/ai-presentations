# Azure Deployment for SPA + Assets

## Motivation

The presentation system currently runs only on `localhost:5173` via Vite dev server. Deploying to Azure enables:

- **Sharing presentations** with stakeholders who don't have the repo cloned
- **Stable demo URLs** for meetings, documentation links, and reviews
- **Offloading large audio/media assets** to CDN-backed blob storage (faster loads, smaller repo)
- **CI/CD pipeline** for automated builds on push

## Current State

### Build Output

`npm run build` produces a standard Vite SPA in `dist/`:
- `dist/index.html` — Single entry point
- `dist/assets/` — JS/CSS bundles (hashed filenames, cache-friendly)
- Static assets from `public/` are copied as-is

### Asset Structure

Audio and media live under `public/` and are served by Vite's static file server:

```
public/
├── audio/{demo-id}/c{chapter}/s{slide}_segment_{nn}.wav   # TTS audio
├── audio/{demo-id}/alignment.json                          # Word timestamps
├── audio/{demo-id}/subtitle-corrections.json               # VTT corrections
├── images/{demo-id}/                                       # Demo images
├── videos/{demo-id}/                                       # Demo videos
├── server_config.json                                      # TTS server URLs (copied at dev start)
└── audio/silence-1s.wav                                    # Fallback silence
```

Total audio for a single demo: typically 50-200 MB (WAV format). This dominates the build size.

### Dev-Only Endpoints

The Vite plugin (`vite-plugin-audio-writer.ts`) provides `/api/*` endpoints that are **dev-only**:
- `/api/save-audio` — Write regenerated audio to disk
- `/api/staleness-check` — Compare narration text hashes
- `/api/narration/*` — Load/save/update narration JSON
- `/api/health` — Health check

These do NOT need to be deployed — they're authoring tools. The deployed SPA is read-only.

### Routing

The app uses `?demo={id}` query parameters (not path-based routing) via `useUrlParams.ts`. This means:
- No server-side routing needed
- Standard SPA fallback (`index.html` for all paths) works
- Deep links like `?demo=meeting-highlights&slide=Ch1:S2` work out of the box

## Proposed Approach

### Phase 1: Static Web App Deployment

**Azure Static Web Apps** — purpose-built for SPAs:

1. **GitHub Actions workflow** triggered on push to `main`:
   - `npm ci && npm run build` in `presentation-app/`
   - Deploy `dist/` to Azure Static Web Apps
   - Auto-configures `index.html` fallback routing

2. **Configuration** (`staticwebapp.config.json`):
   ```json
   {
     "navigationFallback": {
       "rewrite": "/index.html",
       "exclude": ["/audio/*", "/images/*", "/videos/*"]
     }
   }
   ```

3. **Environment config**: Use `VITE_` env vars (from Config Unification, doc 01) for build-time configuration:
   - `VITE_TTS_ENABLED=false` — Disable TTS regeneration UI in production
   - `VITE_ASSET_BASE_URL` — CDN URL for audio/media (Phase 2)

**Estimated setup time**: 2-3 hours

### Phase 1b: PR Preview Environments

Azure Static Web Apps provides **automatic preview deployments** for pull requests — each PR gets a unique URL (e.g., `https://nice-river-0123-preview.azurestaticapps.net`):

- Enabled by default when using the GitHub Actions integration
- Stakeholders can review presentation changes at the preview URL before merge
- Preview environments are automatically destroyed when the PR is closed
- No additional cost (included in Azure Static Web Apps plan)

This is nearly zero-effort to enable and provides immediate value for reviewing slide content, narration text changes, and visual tweaks.

### Phase 2: Blob Storage + CDN for Assets

Move audio/media to **Azure Blob Storage** with **Azure CDN** front:

1. **Blob container structure** mirrors `public/`:
   ```
   $web/audio/{demo-id}/c{chapter}/...
   $web/images/{demo-id}/...
   $web/videos/{demo-id}/...
   ```

2. **Upload pipeline**: GitHub Action uploads `public/audio/`, `public/images/`, `public/videos/` to blob storage after build

3. **CDN configuration**:
   - Custom domain (e.g., `assets.myproject.com`)
   - HTTPS with managed certificate
   - Cache rules: Audio/images cached aggressively (content-addressed by demo version)

4. **Code change** — `FrameworkConfig` needs an asset base URL:
   ```typescript
   // src/framework/config.ts
   export interface FrameworkConfig {
     narrationApiBaseUrl: string;
     fallbackAudioPath: string;
     assetBaseUrl: string;  // NEW: '' for local, 'https://assets.myproject.com' for CDN
   }
   ```

   `audioPath.ts` functions prepend `assetBaseUrl` when set:
   ```typescript
   export function buildAudioFilePath(demoId, chapter, slide, segmentIndex): string {
     const config = getConfig();
     const base = config.assetBaseUrl || '';
     return `${base}/audio/${demoId}/${buildAudioOutputPath(chapter, slide, segmentIndex)}`;
   }
   ```

**Estimated setup time**: 4-6 hours

### Phase 3: CI/CD Pipeline + Audio Format Conversion

**GitHub Actions** workflow:

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd presentation-app && npm ci
      - run: cd presentation-app && npm run build
        env:
          VITE_ASSET_BASE_URL: ${{ vars.ASSET_BASE_URL }}
          VITE_AUDIO_FORMAT: mp3
      - name: Convert WAV to MP3
        run: |
          find presentation-app/public/audio -name '*.wav' \
            -exec sh -c 'ffmpeg -i "$1" -b:a 128k "${1%.wav}.mp3"' _ {} \;
      - uses: Azure/static-web-apps-deploy@v1
        with:
          app_location: presentation-app/dist
      - name: Upload assets to blob storage
        uses: azure/CLI@v2
        with:
          inlineScript: |
            az storage blob upload-batch \
              --source presentation-app/public/audio \
              --destination '$web/audio' \
              --pattern '*.mp3' \
              --account-name ${{ vars.STORAGE_ACCOUNT }}
```

**Audio format conversion details**:

WAV files are uncompressed (~10 MB/minute). For web delivery, MP3 at 128 kbps CBR is sufficient for speech:

| Format | Size vs WAV | Browser Support | Quality |
|--------|------------|-----------------|---------|
| MP3 | ~10% | Universal | Good |
| OGG Vorbis | ~8% | All except Safari | Good |
| Opus | ~5% | Modern browsers | Excellent |

Implementation:
1. `ffmpeg` batch converts `public/audio/**/*.wav` → `.mp3` in the CI pipeline
2. `audioPath.ts` uses `.mp3` extension when `VITE_AUDIO_FORMAT=mp3` (via `FrameworkConfig`)
3. Keep WAV for local dev (editing, alignment, regeneration) and MP3 for deployed CDN
4. **Alignment timestamp impact**: Word-level timestamps in `alignment.json` reference WAV. MP3 encoding may introduce slight timing shifts (~10-50ms). Verify alignment accuracy with MP3 — if drift is noticeable, alignment should always run against WAV originals.

This conversion reduces per-demo audio from ~50-200 MB to ~5-20 MB — a prerequisite for practical CDN delivery and offline/PWA support (see doc 04).

## Challenges & Open Questions

### Dev vs. Production Feature Split

Some features are dev-only and should be disabled in production:
- TTS regeneration (StalenessWarning panel, NarrationEditModal)
- `/api/*` endpoints (don't exist in static deploy)
- `server_config.json` (not needed if TTS regen is disabled)

**Approach**: Gate on `import.meta.env.DEV` (already used in 8+ places) or `VITE_TTS_ENABLED` env var for finer control.

### Authentication

Options depending on audience:
- **Public** — No auth, anyone with the URL can view
- **Azure AD** — Restrict to organization members (Azure Static Web Apps has built-in Azure AD integration)
- **Invite links** — Generate time-limited URLs

For initial deployment, public access is simplest. Auth can be added later without code changes (Azure Static Web Apps config only).

### Cache Invalidation

When audio is re-generated for a demo:
- Blob storage files are overwritten
- CDN cache must be purged for that demo's audio paths
- **Solution**: Include a version/hash in the blob path (`/audio/{demo-id}/v{hash}/...`) or use CDN purge API in the upload pipeline

### OBS Recording Impact

OBS recording (`record:obs`) connects to the presentation via WebSocket on localhost. For cloud deployment:
- OBS can still point at `localhost:5173` for local recording (no change)
- OBS could point at the deployed URL for remote recording (works if audio loads from CDN)
- The VTT subtitle generation reads local files — would need adjustment for remote recording

Minimal impact on the recording workflow.

### Large Asset Git History

Audio files in `public/audio/` bloat git history. Moving to blob storage helps future assets but doesn't fix history.
- Consider: Git LFS for audio files, or `.gitignore` audio in favor of blob-only storage
- This is an orthogonal concern but worth noting

## Dependencies

- **Benefits from Config Unification (01)**: `VITE_*` env var pattern established
- **Independent of Cloud GPU (02)** for core deployment
- **Repo Split (06)**: Build pipeline would need adjustment if repo structure changes. Better to finalize repo structure first, or accept that the CI/CD workflow will be updated.

## Effort Estimate

| Phase | Work | Time |
|-------|------|------|
| Phase 1: Static Web App | Azure setup, GitHub Actions, SPA config | 3-4 hours |
| Phase 1b: PR Previews | Enable preview environments (near-zero effort) | 0.5-1 hour |
| Phase 2: Blob Storage + CDN | Storage account, CDN, upload pipeline, `assetBaseUrl` code change | 4-6 hours |
| Phase 3: CI/CD + audio conversion | Pipeline polish, ffmpeg conversion, cache invalidation | 4-5 hours |
| **Total** | | **~1-1.5 weeks** |

**Size: M**

## Key Files

| File | Impact |
|------|--------|
| `vite.config.ts` | Env var configuration for `VITE_*` variables |
| `src/framework/config.ts` | Add `assetBaseUrl`, `audioFormat` to `FrameworkConfig` |
| `src/framework/utils/audioPath.ts` | Prepend `assetBaseUrl`, swap extension based on format config |
| `src/framework/utils/ttsClient.ts` | Respect `VITE_TTS_ENABLED` flag |
| `src/project.config.ts` | Set `assetBaseUrl` from env var |
| `vite-plugin-audio-writer.ts` | No change (dev-only, not deployed) |

## Reversibility

**Fully reversible** — the SPA is a static build with no server dependencies. Removing the Azure deployment leaves local dev workflow unchanged. The `assetBaseUrl` config defaults to `''` (local), so existing behavior is preserved.
