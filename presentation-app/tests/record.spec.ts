/**
 * Video Recording Test
 *
 * Plays through an entire demo in narrated mode with the UI hidden
 * and records the viewport as a .webm video.
 *
 * Usage:
 *   npm run test:record -- --demo highlights-deep-dive
 *   npm run test:record -- --demo highlights-deep-dive --viewport 1920x800
 *
 * Video is saved to: presentation-app/recordings/{demo-id}.webm
 *
 * Assumes the Vite dev server is already running on localhost:5173.
 */
import { test } from '@playwright/test';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// ---------------------------------------------------------------------------
// Parse env vars set by the wrapper script
// ---------------------------------------------------------------------------
function getDemoId(): string {
  if (process.env.DEMO) return process.env.DEMO;
  throw new Error(
    'Missing DEMO env var. Usage: npm run test:record -- --demo <demo-id>'
  );
}

const DEMO_ID = getDemoId();

// ---------------------------------------------------------------------------
// Test
// ---------------------------------------------------------------------------

test.use({
  video: {
    mode: 'on',
    size: {
      width: parseInt(process.env.VIEWPORT_WIDTH || '1920', 10),
      height: parseInt(process.env.VIEWPORT_HEIGHT || '1080', 10),
    },
  },
});

test(`record: ${DEMO_ID}`, async ({ page }) => {
  // Presentations can be long — override the default 5min test timeout (3 hours)
  test.setTimeout(10_800_000);
  const outDir = join(process.cwd(), 'recordings');
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  // 1. Navigate to welcome screen and click the demo tile
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const demoTile = page.locator(`[data-demo-id="${DEMO_ID}"]`);
  await demoTile.waitFor({ state: 'visible', timeout: 15_000 });
  await demoTile.click();

  // 2. Check "Hide interface (recording)" checkbox
  const hideCheckbox = page.locator('text=Hide interface (recording)');
  await hideCheckbox.waitFor({ state: 'visible', timeout: 10_000 });
  await hideCheckbox.click();

  // 3. Start narrated playback
  const startBtn = page.locator('[aria-label="Start narrated playback"]');
  await startBtn.waitFor({ state: 'visible', timeout: 10_000 });
  await startBtn.click();

  console.log(`Recording narrated playback of "${DEMO_ID}"...`);

  // 4. Wait for the overlay to disappear (playback started)
  await startBtn.waitFor({ state: 'hidden', timeout: 10_000 });

  // 5. Wait for playback to finish — the StartOverlay reappears
  //    Use a long timeout since presentations can be several minutes
  await startBtn.waitFor({ state: 'visible', timeout: 10_800_000 });

  console.log('Playback complete.');

  // 6. Close page to finalize the video, then save it
  await page.close();

  const video = page.video();
  if (video) {
    const finalPath = join(outDir, `${DEMO_ID}.webm`);
    await video.saveAs(finalPath);
    console.log(`Video saved to: recordings/${DEMO_ID}.webm`);
  }
});
