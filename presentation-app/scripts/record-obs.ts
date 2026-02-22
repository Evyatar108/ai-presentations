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
import path from 'path';
import fs from 'fs';

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

  const mod = await import(metadataPath);
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
// Progress timer
// ---------------------------------------------------------------------------
function startProgressTimer(totalSeconds: number): () => void {
  const start = Date.now();
  const interval = setInterval(() => {
    const elapsed = (Date.now() - start) / 1000;
    const remaining = Math.max(0, totalSeconds - elapsed);
    process.stdout.write(
      `\r  Recording... ${formatTime(elapsed)} / ${formatTime(totalSeconds)} (${formatTime(remaining)} remaining)  `,
    );
  }, 1000);
  return () => {
    clearInterval(interval);
    process.stdout.write('\n');
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const totalDuration = await loadDemoDuration();
  const waitSeconds = totalDuration + bufferSeconds;

  console.log(`\nOBS Recording: ${demoId}`);
  console.log(`  Duration:   ${formatTime(totalDuration)} + ${bufferSeconds}s buffer = ${formatTime(waitSeconds)}`);
  console.log(`  Source:     "${sourceName}" @ ${resW}x${resH}`);
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
    const url = `http://localhost:5173?demo=${encodeURIComponent(demoId)}&autoplay=narrated&hideUI&zoom`;

    // 3. Update Browser source settings
    const { inputSettings: currentSettings } = await obs.call('GetInputSettings', { inputName: sourceName }) as any;
    await obs.call('SetInputSettings', {
      inputName: sourceName,
      inputSettings: {
        url,
        width: resW,
        height: resH,
      },
    });
    console.log(`  Browser source URL: ${url}`);

    // 4. Force page reload by toggling shutdown_on_inactive
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
    await obs.call('StartRecord');
    console.log('  Recording started');
    const stopProgress = startProgressTimer(waitSeconds);

    // 7. Wait for demo duration + buffer
    await sleep(waitSeconds * 1000);
    stopProgress();

    // 8. Stop recording
    const stopResult = await obs.call('StopRecord') as any;
    const outputPath = stopResult?.outputPath;
    console.log(`  Recording stopped`);

    // 9. Rename output file
    if (outputPath && !skipRename) {
      const ext = path.extname(outputPath);
      const dir = path.dirname(outputPath);
      const newPath = path.join(dir, `${demoId}${ext}`);
      try {
        if (fs.existsSync(newPath)) {
          // Add timestamp to avoid overwriting
          const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
          const tsPath = path.join(dir, `${demoId}_${ts}${ext}`);
          fs.renameSync(outputPath, tsPath);
          console.log(`  Saved: ${tsPath}`);
        } else {
          fs.renameSync(outputPath, newPath);
          console.log(`  Saved: ${newPath}`);
        }
      } catch (err: any) {
        console.warn(`  Could not rename: ${err.message}. File at: ${outputPath}`);
      }
    } else if (outputPath) {
      console.log(`  Saved: ${outputPath}`);
    }

    console.log('\nDone!');
  } finally {
    obs.disconnect();
  }
}

main().catch(err => {
  console.error('\nFatal error:', err.message ?? err);
  process.exit(1);
});
