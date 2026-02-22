/**
 * Automate OBS recording of a presentation demo.
 *
 * Connects to OBS via WebSocket, sets the Browser source URL with autoplay
 * params, starts recording, waits for the demo to complete, then stops.
 *
 * Usage:
 *   npm run record:obs -- --demo highlights-deep-dive
 *   npm run record:obs -- --demo highlights-deep-dive --resolution 2560x1440
 *   npm run record:obs -- --demo highlights-deep-dive --source "My Browser" --buffer 15
 */

import OBSWebSocket from 'obs-websocket-js';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';
import { generateVtt, type SegmentEvent } from './utils/vtt-generator';

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);

function getArg(name: string): string | undefined {
  const idx = args.indexOf(name);
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
  return undefined;
}

function hasFlag(name: string): boolean {
  return args.includes(name);
}

const demoIdArg = getArg('--demo');
if (!demoIdArg) {
  console.error(
    'Usage: npm run record:obs -- --demo <demo-id> [--resolution WxH] [--source name] [--buffer seconds] [--port N] [--password pw] [--no-rename]',
  );
  process.exit(1);
}
const demoId: string = demoIdArg;

const resolution = getArg('--resolution') ?? '2560x1440';
const [resW, resH] = resolution.split('x').map(Number);
if (!resW || !resH) {
  console.error('Invalid --resolution format. Use WxH, e.g. 2560x1440');
  process.exit(1);
}

const sourceName = getArg('--source') ?? 'Presentation';
const bufferSeconds = Number(getArg('--buffer') ?? '10');
const port = Number(getArg('--port') ?? '4455');
const devPort = Number(getArg('--dev-port') ?? '5173');
const password = getArg('--password') ?? process.env.OBS_WEBSOCKET_PASSWORD ?? '';
const skipRename = hasFlag('--no-rename');

// ---------------------------------------------------------------------------
// Load demo metadata to get duration
// ---------------------------------------------------------------------------
async function loadDemoDuration(): Promise<number> {
  // Dynamic import of the metadata module
  const metadataPath = path.resolve(
    process.cwd(),
    `src/demos/${demoId}/metadata.ts`,
  );
  if (!fs.existsSync(metadataPath)) {
    console.error(`Demo metadata not found: ${metadataPath}`);
    process.exit(1);
  }

  const mod = await import(pathToFileURL(metadataPath).href);
  const metadata = mod.metadata ?? mod.default;
  const total = metadata?.durationInfo?.total;
  if (typeof total !== 'number') {
    console.error(
      `No durationInfo.total found in metadata for demo "${demoId}". Run: npm run tts:duration -- --demo ${demoId}`,
    );
    process.exit(1);
  }
  return total;
}

// ---------------------------------------------------------------------------
// Helper: format seconds as mm:ss
// ---------------------------------------------------------------------------
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Helper: sleep
// ---------------------------------------------------------------------------
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Signal server — listens for /complete and /segment-start from the app
// ---------------------------------------------------------------------------
interface SignalServer {
  port: number;
  segmentEvents: SegmentEvent[];
  recordingStartTime: number;
  setRecordingStartTime: (time: number) => void;
  waitForSignal: (maxMs: number) => Promise<'signal' | 'timeout'>;
  close: () => void;
}

async function startSignalServer(): Promise<SignalServer> {
  let resolveSignal: ((reason: 'signal' | 'timeout') => void) | null = null;
  const segmentEvents: SegmentEvent[] = [];
  let recordingStartTime = 0;

  const server = http.createServer((req, res) => {
    if (req.url === '/complete') {
      res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
      res.end('ok');
      resolveSignal?.('signal');
    } else if (req.url?.startsWith('/segment-start')) {
      const params = new URL(req.url, 'http://localhost').searchParams;
      const event: SegmentEvent = {
        chapter: Number(params.get('chapter')),
        slide: Number(params.get('slide')),
        segmentIndex: Number(params.get('segmentIndex')),
        segmentId: params.get('segmentId') ?? '',
        videoTime: (Date.now() - recordingStartTime) / 1000,
      };
      segmentEvents.push(event);
      console.log(`  [segment] c${event.chapter}:s${event.slide}:${event.segmentId} @ ${formatTime(event.videoTime)}`);
      res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
      res.end('ok');
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  // Listen on random available port, wait for it to be ready
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address() as { port: number };

  return {
    port: addr.port,
    segmentEvents,
    recordingStartTime,
    setRecordingStartTime(time: number) { recordingStartTime = time; },
    waitForSignal(maxMs: number) {
      return new Promise<'signal' | 'timeout'>(resolve => {
        resolveSignal = resolve;
        setTimeout(() => resolve('timeout'), maxMs);
      });
    },
    close() { server.close(); },
  };
}

// ---------------------------------------------------------------------------
// Progress timer
// ---------------------------------------------------------------------------
function startProgressTimer(expectedSeconds: number): () => number {
  const start = Date.now();
  const interval = setInterval(() => {
    const elapsed = (Date.now() - start) / 1000;
    const remaining = Math.max(0, expectedSeconds - elapsed);
    process.stdout.write(
      `\r  Recording... ${formatTime(elapsed)} / ~${formatTime(expectedSeconds)} (${formatTime(remaining)} remaining)  `,
    );
  }, 1000);
  return () => {
    clearInterval(interval);
    const elapsed = (Date.now() - start) / 1000;
    process.stdout.write('\n');
    return elapsed;
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const totalDuration = await loadDemoDuration();
  const maxWaitSeconds = Math.ceil(totalDuration * 1.5);

  // Start signal server before connecting to OBS
  const signal = await startSignalServer();

  console.log(`\nOBS Recording: ${demoId}`);
  console.log(`  Duration:   ~${formatTime(totalDuration)} (max wait: ${formatTime(maxWaitSeconds)})`);
  console.log(`  Source:     "${sourceName}" @ ${resW}x${resH}`);
  console.log(`  Signal:     http://127.0.0.1:${signal.port}/complete`);
  console.log(`  OBS:        ws://127.0.0.1:${port}\n`);

  // 1. Connect to OBS
  const obs = new OBSWebSocket();
  try {
    await obs.connect(`ws://127.0.0.1:${port}`, password || undefined);
  } catch (err: any) {
    console.error(`Failed to connect to OBS WebSocket on port ${port}.`);
    console.error('Make sure OBS is running and WebSocket Server is enabled (Tools > WebSocket Server Settings).');
    console.error(`Error: ${err.message ?? err}`);
    process.exit(1);
  }
  console.log('  Connected to OBS WebSocket');

  try {
    // 2. Build autoplay URL
    const url = `http://localhost:${devPort}?demo=${encodeURIComponent(demoId)}&autoplay=narrated&hideUI&zoom&signal=${signal.port}`;

    // 3. Ensure Browser source exists, create if missing
    const { currentProgramSceneName: sceneName } = await obs.call('GetCurrentProgramScene') as any;
    let currentSettings: any = null;
    try {
      const result = await obs.call('GetInputSettings', { inputName: sourceName }) as any;
      currentSettings = result.inputSettings;
    } catch {
      // Source doesn't exist — create it in the current scene
      console.log(`  Browser source "${sourceName}" not found, creating...`);
      await obs.call('CreateInput', {
        sceneName,
        inputName: sourceName,
        inputKind: 'browser_source',
        inputSettings: {
          url,
          width: resW,
          height: resH,
          shutdown: true,
        },
      });
      console.log(`  Created Browser source "${sourceName}" in scene "${sceneName}"`);
    }

    // 3b. Re-enable the scene item in case it was disabled from a previous run
    try {
      const { sceneItemId } = await obs.call('GetSceneItemId', {
        sceneName,
        sourceName,
      }) as any;
      await obs.call('SetSceneItemEnabled', {
        sceneName,
        sceneItemId,
        sceneItemEnabled: true,
      });
    } catch { /* source may not be in scene yet */ }

    // 4. Update Browser source settings
    await obs.call('SetInputSettings', {
      inputName: sourceName,
      inputSettings: {
        url,
        width: resW,
        height: resH,
      },
    });
    console.log(`  Browser source URL: ${url}`);

    // 5. Force page reload by toggling shutdown_on_inactive
    //    (OBS Browser source reloads when shutdown is toggled)
    const wasShutdown = currentSettings?.shutdown;
    if (wasShutdown) {
      // If already set to shutdown, toggle off then on
      await obs.call('SetInputSettings', { inputName: sourceName, inputSettings: { shutdown: false } });
      await sleep(200);
      await obs.call('SetInputSettings', { inputName: sourceName, inputSettings: { shutdown: true } });
    } else {
      // Toggle on then off to trigger reload
      await obs.call('SetInputSettings', { inputName: sourceName, inputSettings: { shutdown: true } });
      await sleep(200);
      await obs.call('SetInputSettings', { inputName: sourceName, inputSettings: { shutdown: false } });
    }

    // Also send RefreshBrowserSource as a more reliable reload method
    try {
      await obs.call('PressInputPropertiesButton', {
        inputName: sourceName,
        propertyName: 'refreshnocache',
      });
    } catch {
      // Not all OBS versions support this — the shutdown toggle above is the fallback
    }

    // 5. Wait for page load + audio preloading
    console.log('  Waiting for page load...');
    await sleep(3000);

    // 6. Start recording
    signal.setRecordingStartTime(Date.now());
    await obs.call('StartRecord');
    console.log('  Recording started (waiting for completion signal...)');
    const stopProgress = startProgressTimer(totalDuration);

    // 7. Wait for completion signal from the app (or max timeout)
    const reason = await signal.waitForSignal(maxWaitSeconds * 1000);
    const elapsed = stopProgress();

    if (reason === 'signal') {
      console.log(`  Completion signal received after ${formatTime(elapsed)}`);
      // Brief delay so the final slide fully renders before we stop
      await sleep(2000);
    } else {
      console.log(`  Max wait reached (${formatTime(maxWaitSeconds)}), stopping`);
    }

    // 8. Stop recording
    let outputPath: string | undefined;
    try {
      const stopResult = await obs.call('StopRecord') as any;
      outputPath = stopResult?.outputPath;
      console.log(`  Recording stopped`);
    } catch (err: any) {
      console.warn(`  StopRecord failed (may already be stopped): ${err.message ?? err}`);
    }

    // 8b. Disable Browser source so OBS shuts down its internal browser
    try {
      const { sceneItemId } = await obs.call('GetSceneItemId', {
        sceneName,
        sourceName,
      }) as any;
      await obs.call('SetSceneItemEnabled', {
        sceneName,
        sceneItemId,
        sceneItemEnabled: false,
      });
      console.log(`  Browser source "${sourceName}" disabled`);
    } catch (err: any) {
      console.warn(`  Could not disable browser source: ${err.message ?? err}`);
    }

    // 9. Rename output file (retry to handle EBUSY when OBS still holds the file)
    let finalVideoPath = outputPath;
    if (outputPath && !skipRename) {
      const ext = path.extname(outputPath);
      const dir = path.dirname(outputPath);
      const newPath = path.join(dir, `${demoId}${ext}`);
      const maxRetries = 5;
      let renamed = false;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const target = fs.existsSync(newPath)
            ? path.join(dir, `${demoId}_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}${ext}`)
            : newPath;
          fs.renameSync(outputPath, target);
          console.log(`  Saved: ${target}`);
          finalVideoPath = target;
          renamed = true;
          break;
        } catch (err: any) {
          if (err.code === 'EBUSY' && attempt < maxRetries) {
            console.log(`  File locked by OBS, retrying rename (${attempt}/${maxRetries})...`);
            await sleep(2000);
          } else {
            console.warn(`  Could not rename: ${err.message}. File at: ${outputPath}`);
            break;
          }
        }
      }
      if (!renamed) {
        console.log(`  Original file: ${outputPath}`);
      }
    } else if (outputPath) {
      console.log(`  Saved: ${outputPath}`);
    }

    // 10. Generate VTT subtitles + words data from segment timing events
    if (signal.segmentEvents.length > 0) {
      try {
        const { wordsData, vttContent } = generateVtt(demoId, signal.segmentEvents);
        const videoFile = finalVideoPath ?? '';
        const basePath = videoFile
          ? videoFile.replace(/\.[^.]+$/, '')
          : path.join(process.cwd(), demoId);

        // Write words data (reusable intermediate for VTT regeneration)
        const wordsPath = `${basePath}-words.json`;
        fs.writeFileSync(wordsPath, JSON.stringify(wordsData, null, 2), 'utf-8');
        console.log(`  Words:     ${wordsPath}`);

        // Write VTT subtitle file
        const vttPath = `${basePath}.vtt`;
        fs.writeFileSync(vttPath, vttContent, 'utf-8');
        console.log(`  Subtitles: ${vttPath}`);
      } catch (err: any) {
        console.warn(`  VTT generation failed: ${err.message ?? err}`);
      }
    } else {
      console.log('  No segment events received — skipping VTT generation');
    }

    console.log('\nDone!');
  } finally {
    signal.close();
    obs.disconnect();
  }
}

main().catch(err => {
  console.error('\nFatal error:', err.message ?? err);
  process.exit(1);
});
