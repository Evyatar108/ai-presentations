# Azure Production Enhancements: Error Reporting & Offline Support

## Motivation

Once the SPA is deployed to Azure (doc 03), two production-quality concerns emerge that don't apply to local dev:

1. **Errors are invisible** — `console.error` with `[ComponentName]` prefixes is useful in dev but goes nowhere in production. The codebase has well-structured error handling that can feed into a reporting service.
2. **Network drops break playback** — if presentations are shared via URL for meetings, a network hiccup during a live presentation is embarrassing. Pre-caching assets enables offline resilience.

These are independent decisions with different effort/risk profiles, so they're documented separately from the core Azure deployment.

## Part A: Production Error Reporting

### Current Error Handling Infrastructure

The codebase already has comprehensive error handling — it just needs an external sink:

| Component | What It Catches | Current Behavior |
|-----------|----------------|-----------------|
| `SlideErrorBoundary` | Per-slide render errors | Shows fallback UI with Skip/Back buttons, logs via `componentDidCatch` |
| `DemoPlayerBoundary` | Top-level demo errors | Shows "Something went wrong" dialog with Back to Demos button |
| `useNotifications()` | Error-type toasts | Red toast with 5s auto-dismiss, `aria-live="polite"` |
| `ErrorToast` | Playback errors | Fixed-position alert with `role="alert"`, `aria-live="assertive"` |
| `useAudioPlayback` | Missing audio files | Falls back to silence, logs warning, auto-advances after 1s |
| `useTtsRegeneration` | TTS generation failures | Shows error status for 5s, returns `{ success: false, error }` |

### Proposed Approach

**Azure Application Insights** — native to Azure, minimal setup:

1. **Install SDK**: `npm install @microsoft/applicationinsights-web`

2. **Initialize in `main.tsx`** (production only):
   ```typescript
   if (import.meta.env.PROD) {
     const appInsights = new ApplicationInsights({
       config: { connectionString: import.meta.env.VITE_APPINSIGHTS_CONNECTION }
     });
     appInsights.loadAppInsights();
   }
   ```

3. **Wire into error boundaries**: Add `appInsights.trackException()` calls in `componentDidCatch` methods — these already receive the error and React ErrorInfo.

4. **Auto-instrumentation**: Application Insights automatically captures:
   - Unhandled exceptions
   - Page load performance
   - AJAX/fetch failures (audio loads, TTS calls)
   - Browser/OS/device telemetry

**Alternative: Sentry** — richer error grouping, better stack traces, but adds a non-Azure dependency. The React SDK has built-in `ErrorBoundary` components that could replace the existing custom boundaries, but that's a larger change.

**Recommendation**: Application Insights for simplicity. Add Sentry later if error grouping/dedup becomes a pain point.

### Effort Estimate

| Task | Time |
|------|------|
| SDK install + initialization | 0.5 hour |
| Wire into error boundaries (2 components) | 1 hour |
| Test with intentional errors | 0.5 hour |
| Azure portal dashboard setup | 0.5 hour |
| **Total** | **~2-3 hours** |

### Key Files

| File | Change |
|------|--------|
| `src/main.tsx` | Initialize Application Insights (production only) |
| `src/framework/components/SlideErrorBoundary.tsx` | Add `trackException` in `componentDidCatch` |
| `src/framework/components/DemoPlayerBoundary.tsx` | Add `trackException` in `componentDidCatch` |
| `.env.production` | `VITE_APPINSIGHTS_CONNECTION` |

## Part B: Offline / PWA Support

### Why Offline Matters

Presentations shared via URL may be viewed in environments with unreliable connectivity:
- Conference rooms with spotty WiFi
- On-stage demos with no network
- Mobile viewing during commutes

The existing audio fallback to `silence-1s.wav` already handles missing files gracefully — a service worker would prevent that fallback from triggering in the first place.

### Proposed Approach

**Workbox + vite-plugin-pwa** — Google's service worker toolkit with a Vite integration:

1. **Install**: `npm install -D vite-plugin-pwa`

2. **Configure in `vite.config.ts`**:
   ```typescript
   import { VitePWA } from 'vite-plugin-pwa';

   export default defineConfig({
     plugins: [
       react(),
       audioWriterPlugin(),
       VitePWA({
         registerType: 'autoUpdate',
         workbox: {
           // Cache the SPA shell
           globPatterns: ['**/*.{js,css,html,ico,svg}'],
           // Runtime caching for audio/images
           runtimeCaching: [
             {
               urlPattern: /\/audio\/.*\.(mp3|wav)$/,
               handler: 'CacheFirst',
               options: {
                 cacheName: 'audio-cache',
                 expiration: { maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 },
               },
             },
             {
               urlPattern: /\/images\/.*\.(png|jpg|svg)$/,
               handler: 'CacheFirst',
               options: {
                 cacheName: 'image-cache',
                 expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
               },
             },
           ],
         },
       }),
     ],
   });
   ```

3. **On demo load**: The `CacheFirst` strategy caches audio files as they're fetched. After playing through a demo once, it's fully cached for offline replay.

4. **Optional**: Add a "Download for Offline" button that pre-fetches all audio for the selected demo into the service worker cache.

### Prerequisites

- **MP3 audio conversion** (doc 03, Phase 3) — WAV files are 50-200 MB per demo, impractical for service worker caching. MP3 reduces this to 5-20 MB.
- Without MP3 conversion, PWA support should be limited to the SPA shell only (no audio caching).

### Effort Estimate

| Task | Time |
|------|------|
| `vite-plugin-pwa` install + config | 1-2 hours |
| Runtime caching strategy for audio/images | 1 hour |
| Testing offline playback | 1 hour |
| Optional "Download for Offline" button | 2-3 hours |
| **Total** | **~3-4 hours** (basic), **~5-7 hours** (with download button) |

### Key Files

| File | Change |
|------|--------|
| `vite.config.ts` | Add `VitePWA` plugin |
| `package.json` | Add `vite-plugin-pwa` dev dependency |
| `public/manifest.json` | PWA manifest (app name, icons, theme color) |

## Dependencies

- **Requires Azure Deployment (03)** — these are production-only features
- **Part B requires MP3 conversion** from doc 03, Phase 3 — WAV files are too large for practical caching
- **Benefits from Config Unification (01)**: `VITE_APPINSIGHTS_CONNECTION` follows the env var pattern
- **Independent of each other** — Part A and Part B can be done in any order

## Combined Effort

| Part | Time |
|------|------|
| Part A: Error Reporting | 2-3 hours |
| Part B: PWA / Offline | 3-7 hours |
| **Total** | **~5-10 hours** |

**Size: S-M**

## Reversibility

**Fully reversible** for both:
- **Part A**: Remove Application Insights SDK and `trackException` calls. No data collection without the SDK.
- **Part B**: Remove `vite-plugin-pwa` from config. Service worker auto-unregisters. Cached data is browser-local and auto-expires.
