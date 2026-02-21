/**
 * Screenshot Capture Test
 *
 * Steps through every slide and segment of a demo in manual mode
 * and captures a screenshot of each state.
 *
 * Usage:
 *   npm run test:screenshot -- --demo highlights-deep-dive
 *   npm run test:screenshot -- --demo highlights-deep-dive --viewport 1920x800
 *   npm run test:screenshot -- --demo highlights-deep-dive --slides 3-5
 *
 * Screenshots are saved to: presentation-app/screenshots/{demo-id}/
 * Named: c{chapter}_s{slide}_seg{segmentIdx}_{segmentId}.png
 *
 * Assumes the Vite dev server is already running on localhost:5173.
 */
import { test, type Page } from '@playwright/test';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

// ---------------------------------------------------------------------------
// Parse env vars set by the wrapper script
// ---------------------------------------------------------------------------
function getDemoId(): string {
  if (process.env.DEMO) return process.env.DEMO;
  throw new Error(
    'Missing DEMO env var. Usage: npm run test:screenshot -- --demo <demo-id>'
  );
}

function getSlideRange(): { start: number; end: number } | null {
  const range = process.env.SLIDE_RANGE;
  if (!range) return null;
  const match = range.match(/^(\d+)(?:-(\d+))?$/);
  if (!match) return null;
  const start = parseInt(match[1], 10);
  const end = match[2] ? parseInt(match[2], 10) : start;
  return { start, end };
}

const DEMO_ID = getDemoId();
const SLIDE_RANGE = getSlideRange();

// ---------------------------------------------------------------------------
// Helpers (reused from overflow.spec.ts)
// ---------------------------------------------------------------------------

/** Wait for Framer Motion animations to settle + ResizeObserver + React re-render. */
async function waitForAnimations(page: Page, ms = 1500) {
  await page.waitForTimeout(ms);
}

/** Parse slide info from the progress bar and navigation dots. */
async function getSlideInfo(page: Page): Promise<{ current: number; total: number; chapter: number; slide: number }> {
  const currentDot = page.locator('button[aria-label^="Go to slide"][aria-current="true"]');
  const label = await currentDot.getAttribute('aria-label') ?? '';
  const slideMatch = label.match(/Go to slide (\d+):/);
  const slideNum = slideMatch ? parseInt(slideMatch[1], 10) : 1;
  const totalSlides = await page.locator('button[aria-label^="Go to slide"]').count();

  const progressText = await page.locator('text=/Slide \\d+ of \\d+/').textContent() ?? '';
  const chMatch = progressText.match(/Ch(\d+):S(\d+)/);
  const chapter = chMatch ? parseInt(chMatch[1], 10) : 0;
  const slide = chMatch ? parseInt(chMatch[2], 10) : 0;

  return { current: slideNum, total: totalSlides, chapter, slide };
}

/** Get the title from the current slide dot's aria-label. */
async function getSlideTitle(page: Page): Promise<string> {
  const currentDot = page.locator('button[aria-label^="Go to slide"][aria-current="true"]');
  const label = await currentDot.getAttribute('aria-label') ?? '';
  const match = label.match(/Go to slide \d+: (.+)/);
  return match ? match[1] : 'Unknown';
}

/** Get segment count for the current slide. */
async function getSegmentCount(page: Page): Promise<number> {
  const dots = page.locator('button[aria-label^="Go to segment"]');
  return await dots.count();
}

/** Get segment ID from aria-label. */
async function getSegmentId(page: Page, idx: number): Promise<string> {
  const dot = page.locator(`button[aria-label^="Go to segment ${idx}:"]`);
  if (await dot.count() === 0) return `segment_${idx}`;
  const label = await dot.getAttribute('aria-label') ?? '';
  const match = label.match(/Go to segment \d+: (.+)/);
  return match ? match[1] : `segment_${idx}`;
}

// ---------------------------------------------------------------------------
// Test
// ---------------------------------------------------------------------------

test(`screenshot: ${DEMO_ID}`, async ({ page }) => {
  // Prepare output directory
  const outDir = join(process.cwd(), 'screenshots', DEMO_ID);
  if (existsSync(outDir)) {
    rmSync(outDir, { recursive: true });
  }
  mkdirSync(outDir, { recursive: true });

  // 1. Navigate to welcome screen and click the demo tile
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const demoTile = page.locator(`[data-demo-id="${DEMO_ID}"]`);
  await demoTile.waitFor({ state: 'visible', timeout: 15_000 });
  await demoTile.click();

  // 2. Start manual mode
  const manualBtn = page.locator('[aria-label="Start manual mode"]');
  await manualBtn.waitFor({ state: 'visible', timeout: 10_000 });
  await manualBtn.click();

  await waitForAnimations(page, 2000);

  // 3. If we need to skip to a specific starting slide, press ArrowRight
  if (SLIDE_RANGE) {
    const info = await getSlideInfo(page);
    for (let i = info.current; i < SLIDE_RANGE.start; i++) {
      await page.keyboard.press('ArrowRight');
      await waitForAnimations(page, 800);
    }
  }

  // 4. Step through slides and segments, taking screenshots
  let screenshotCount = 0;
  let done = false;

  while (!done) {
    const info = await getSlideInfo(page);
    const title = await getSlideTitle(page);
    const segmentCount = await getSegmentCount(page);

    // Check if we're past our range
    if (SLIDE_RANGE && info.current > SLIDE_RANGE.end) {
      break;
    }

    const pad = (n: number) => String(n).padStart(2, '0');
    const slideLabel = `c${info.chapter}_s${info.slide}`;

    if (segmentCount > 0) {
      for (let s = 0; s < segmentCount; s++) {
        const segId = await getSegmentId(page, s);
        const segDot = page.locator(`button[aria-label="Go to segment ${s}: ${segId}"]`);
        if (await segDot.count() > 0) {
          await segDot.click();
        }
        await waitForAnimations(page);

        const filename = `${slideLabel}_seg${pad(s)}_${segId}.png`;
        await page.screenshot({ path: join(outDir, filename) });
        screenshotCount++;
        console.log(`  [${info.current}/${info.total}] ${filename}  "${title}"`);
      }
    } else {
      const filename = `${slideLabel}_seg00_default.png`;
      await page.screenshot({ path: join(outDir, filename) });
      screenshotCount++;
      console.log(`  [${info.current}/${info.total}] ${filename}  "${title}"`);
    }

    // Advance to next slide
    if (info.current >= info.total) {
      done = true;
    } else {
      await page.keyboard.press('ArrowRight');
      await waitForAnimations(page, 1000);
    }
  }

  console.log('');
  console.log(`Done. ${screenshotCount} screenshots saved to: screenshots/${DEMO_ID}/`);
});
