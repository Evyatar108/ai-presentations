# Configuration Unification

**Status: Done** (2026-02-27)

## Motivation

The codebase currently has **5 separate configuration patterns** that evolved independently. All other roadmap initiatives add new config dimensions (cloud URLs, asset URLs, API keys, feature flags), and without a unified strategy the config surface will sprawl further. Establishing a clean pattern first prevents each initiative from inventing its own approach.

## Current State

| Pattern | Location | Consumers | Example Values |
|---------|----------|-----------|----------------|
| `FrameworkConfig` (TypeScript) | `src/framework/config.ts`, `src/project.config.ts` | Browser runtime (`useAudioPlayback`, `narrationApiClient`, `NarratedController`) | `narrationApiBaseUrl: ''`, `fallbackAudioPath: '/audio/silence-1s.wav'` |
| `server_config.json` (JSON) | `tts/server_config.json` (not checked in) | CLI scripts via `scripts/utils/server-config.ts`, browser via `ttsClient.ts` (copied to `public/` at dev start) | `server_url`, `whisper_url` |
| `process.env.*` (Node) | Scattered across 6+ scripts | CLI tools only | `TTS_SERVER_URL`, `WHISPER_URL`, `BATCH_SIZE`, `OBS_WEBSOCKET_PASSWORD`, `NARRATION_API_PORT`, `CORS_ORIGIN` |
| `import.meta.env.DEV` (Vite) | 8+ sites in framework source | Dev-only feature gating | Debug logging, staleness check, overflow detection, slide validation |
| `localStorage` | `debug:framework` key | Runtime debug toggle (checked by `debug.ts`) | `'true'` / absent |

**Today there are zero `VITE_*` build-time variables.** The other initiatives will introduce:
- `VITE_ASSET_BASE_URL` — CDN URL for audio/media (Azure Deployment)
- `VITE_TTS_ENABLED` — Enable/disable TTS regeneration UI (Azure Deployment)
- `VITE_AUDIO_FORMAT` — `wav` or `mp3` (Azure Deployment / Audio Format Pipeline)
- API keys for cloud GPU (Cloud GPU)

## Proposed Approach

### 1. Adopt Vite's Built-in Dotenv Support

Vite natively loads `.env` files with zero configuration:

```
presentation-app/
├── .env                    # Shared defaults (checked in)
├── .env.development        # Dev overrides (checked in)
├── .env.production         # Production overrides (checked in)
├── .env.local              # Machine-specific secrets (gitignored)
└── .env.development.local  # Dev secrets (gitignored)
```

Vite's load order: `.env` < `.env.{mode}` < `.env.local` < `.env.{mode}.local` (later overrides earlier).

### 2. Define Variable Naming Convention

| Prefix | Scope | Example |
|--------|-------|---------|
| `VITE_` | Browser (exposed to client code via `import.meta.env.VITE_*`) | `VITE_ASSET_BASE_URL`, `VITE_TTS_ENABLED` |
| `TTS_` | CLI scripts only (never reaches browser) | `TTS_SERVER_URL`, `TTS_API_KEY` |
| `APP_` | Build pipeline / CI only | `APP_AZURE_STORAGE_ACCOUNT` |

### 3. Wire Into FrameworkConfig

```typescript
// src/framework/config.ts
export const defaultConfig: FrameworkConfig = {
  narrationApiBaseUrl: '',
  fallbackAudioPath: '/audio/silence-1s.wav',
  assetBaseUrl: import.meta.env.VITE_ASSET_BASE_URL || '',
  ttsEnabled: import.meta.env.VITE_TTS_ENABLED !== 'false',
  audioFormat: import.meta.env.VITE_AUDIO_FORMAT || 'wav',
};
```

This consolidates `VITE_*` env vars into the existing `FrameworkConfig` pattern — one source of truth for browser-side configuration.

### 4. Keep server_config.json for Machine-Specific Secrets

`server_config.json` stays as-is for TTS/WhisperX server URLs and API keys — these are machine-specific (local GPU vs. cloud) and should never be checked in. The existing `loadTtsServerUrl()` / `loadWhisperUrl()` pattern in `server-config.ts` already handles this well.

Add an `api_key` field:
```json
{
  "server_url": "https://gpu.myproject.com/tts",
  "whisper_url": "https://gpu.myproject.com/whisperx",
  "api_key": "sk-..."
}
```

### 5. Default .env Files

```bash
# .env (shared defaults, checked in)
VITE_TTS_ENABLED=true
VITE_AUDIO_FORMAT=wav

# .env.production (production overrides, checked in)
VITE_TTS_ENABLED=false
VITE_AUDIO_FORMAT=mp3

# .env.local (machine-specific, gitignored — template provided as .env.local.example)
VITE_ASSET_BASE_URL=https://assets.myproject.com
```

## Implementation Steps

1. Create `.env`, `.env.development`, `.env.production` with current defaults
2. Create `.env.local.example` as a template (document in README)
3. Add `.env.local` and `.env.*.local` to `.gitignore`
4. Update `FrameworkConfig` to read `VITE_*` variables
5. Update `server-config.ts` to support `api_key` field
6. Document the convention in `CLAUDE.md` and `docs/ARCHITECTURE.md`

## Key Files

| File | Change |
|------|--------|
| `src/framework/config.ts` | Read `VITE_*` env vars into `FrameworkConfig` |
| `src/project.config.ts` | May set overrides from env vars |
| `scripts/utils/server-config.ts` | Add `loadApiKey()` function |
| `.gitignore` | Add `.env.local`, `.env.*.local` |
| `CLAUDE.md` | Document config convention |

## Effort Estimate

**~1-2 hours** — this is a small, focused task. The value is in establishing the pattern before the other initiatives add their own config.

**Size: S**

## Dependencies

- **Prerequisite for all other initiatives** — each one adds config, this establishes the pattern
- **No blockers** — can be done immediately

## Reversibility

**Fully reversible** — `.env` files can be deleted and `FrameworkConfig` reverted to hardcoded defaults. Vite ignores `.env` files that don't exist.
