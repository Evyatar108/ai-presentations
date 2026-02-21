/**
 * High-Quality Video Recording Test
 *
 * Records the full narrated playback using CDP screencast piped to ffmpeg
 * for high quality, configurable fps, and H.264 encoding.
 *
 * Usage:
 *   npm run test:record -- --demo highlights-deep-dive
 *   npm run test:record -- --demo highlights-deep-dive --viewport 1920x800
 *   npm run test:record -- --demo highlights-deep-dive --fps 60
 *
 * Video is saved to: presentation-app/recordings/{demo-id}.mp4
 *
 * Requires: ffmpeg installed and on PATH.
 * Assumes the Vite dev server is already running on localhost:5173.
 */
import { test } from '@playwright/test';
import { spawn, execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// ---------------------------------------------------------------------------
// Parse env vars
// ---------------------------------------------------------------------------
function getDemoId(): string {
  if (process.env.DEMO) return process.env.DEMO;
  throw new Error('Missing DEMO env var.');
}

const DEMO_ID = getDemoId();
const FPS = parseInt(process.env.FPS || '30', 10);

// ---------------------------------------------------------------------------
// CSS to hide UI chrome that "Hide interface" doesn't cover
// ---------------------------------------------------------------------------
const HIDE_CHROME_CSS = `
  [data-testid="back-button"],
  [data-testid="reduced-motion-toggle"] {
    display: none !important;
  }
`;

// ---------------------------------------------------------------------------
// Test — disable Playwright's built-in video
// ---------------------------------------------------------------------------

test.use({ video: 'off' });

test(`record: ${DEMO_ID}`, async ({ page, context }) => {
  test.setTimeout(10_800_000);

  // Verify ffmpeg is available
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
  } catch {
    throw new Error('ffmpeg is required but not found on PATH.');
  }

  const outDir = join(process.cwd(), 'recordings');
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  const width = parseInt(process.env.VIEWPORT_WIDTH || '1920', 10);
  const height = parseInt(process.env.VIEWPORT_HEIGHT || '1080', 10);
  const outPath = join(outDir, `${DEMO_ID}_${FPS}fps.mp4`);

  // 1. Navigate to welcome screen and click the demo tile
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const demoTile = page.locator(`[data-demo-id="${DEMO_ID}"]`);
  await demoTile.waitFor({ state: 'visible', timeout: 15_000 });
  await demoTile.click();

  // 2. Check "Hide interface (recording)" and start narrated playback
  const hideCheckbox = page.locator('text=Hide interface (recording)');
  await hideCheckbox.waitFor({ state: 'visible', timeout: 10_000 });
  await hideCheckbox.click();

  const startBtn = page.locator('[aria-label="Start narrated playback"]');
  await startBtn.waitFor({ state: 'visible', timeout: 10_000 });

  // 3. Inject CSS to hide remaining chrome (back button, reduced motion toggle)
  await page.addStyleTag({ content: HIDE_CHROME_CSS });

  // 4. Start CDP screencast
  const client = await context.newCDPSession(page);

  // Spawn ffmpeg: pipe JPEG frames in, produce H.264 MP4 out
  const ffmpegProc = spawn('ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-framerate', String(FPS),
    '-i', 'pipe:0',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-s', `${width}x${height}`,
    outPath,
  ], { stdio: ['pipe', 'ignore', 'pipe'] });

  let ffmpegErr = '';
  ffmpegProc.stderr!.on('data', (chunk: Buffer) => { ffmpegErr += chunk.toString(); });

  // Buffer the latest CDP frame; write to ffmpeg at constant FPS
  let latestFrame: Buffer | null = null;
  let recording = true;

  client.on('Page.screencastFrame', async (event: { data: string; sessionId: number }) => {
    latestFrame = Buffer.from(event.data, 'base64');
    try {
      await client.send('Page.screencastFrameAck', { sessionId: event.sessionId });
    } catch {
      // Session may be closed during teardown
    }
  });

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 100,
    maxWidth: width,
    maxHeight: height,
    everyNthFrame: 1,
  });

  // Write frames to ffmpeg at constant FPS
  const frameIntervalMs = 1000 / FPS;
  const frameWriter = setInterval(() => {
    if (latestFrame && recording) {
      try {
        ffmpegProc.stdin!.write(latestFrame);
      } catch {
        // pipe may be closing
      }
    }
  }, frameIntervalMs);

  // 5. Start playback
  await startBtn.click();
  console.log(`Recording at ${width}x${height} @ ${FPS}fps (H.264 CRF 18)...`);

  // 6. Wait for overlay to disappear then reappear (playback complete)
  await startBtn.waitFor({ state: 'hidden', timeout: 10_000 });
  await startBtn.waitFor({ state: 'visible', timeout: 10_800_000 });

  console.log('Playback complete. Finalizing video...');

  // 7. Stop recording
  recording = false;
  clearInterval(frameWriter);

  try {
    await client.send('Page.stopScreencast');
  } catch {
    // session may already be closed
  }

  // Close ffmpeg stdin to signal end of input
  ffmpegProc.stdin!.end();

  // Wait for ffmpeg to finish encoding
  await new Promise<void>((resolve, reject) => {
    ffmpegProc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}:\n${ffmpegErr.slice(-500)}`));
    });
  });

  console.log(`Video saved to: recordings/${DEMO_ID}_${FPS}fps.mp4`);
});
