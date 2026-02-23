/**
 * Screenshot Capture Test
 *
 * Steps through every slide and segment of a demo in manual mode
 * and captures a clean screenshot (UI chrome hidden) of each state.
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
import { existsSync, mkdirSync, rmSync, readFileSync } from 'fs';
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

// Parse --markers filter
function getMarkerFilter(): 'all' | string[] | null {
  const raw = process.env.MARKER_FILTER;
  if (!raw) return null;
  if (raw === 'all') return 'all';
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}
const MARKER_FILTER = getMarkerFilter();

// Load alignment.json for marker screenshots
interface ResolvedMarker { id: string; time: number; anchor: string; wordIndex: number; }
interface SegmentAlignment { segmentId: number; markers: ResolvedMarker[]; }
interface SlideAlignment { chapter: number; slide: number; segments: SegmentAlignment[]; }
interface DemoAlignmentFile { demoId: string; slides: Record<string, SlideAlignment>; }

let alignmentData: DemoAlignmentFile | null = null;
if (MARKER_FILTER) {
  const alignmentPath = join(process.cwd(), 'public', 'audio', DEMO_ID, 'alignment.json');
  if (existsSync(alignmentPath)) {
    alignmentData = JSON.parse(readFileSync(alignmentPath, 'utf-8'));
  } else {
    console.warn(`[markers] alignment.json not found at ${alignmentPath} — marker screenshots will be skipped`);
  }
}

/** Get markers for a segment that match the filter. */
function getMarkersForSegment(
  alignment: DemoAlignmentFile | null,
  chapter: number,
  slide: number,
  segmentId: number,
  filter: 'all' | string[] | null
): ResolvedMarker[] {
  if (!alignment || !filter) return [];
  const coordKey = `c${chapter}_s${slide}`;
  const slideData = alignment.slides[coordKey];
  if (!slideData) return [];
  const segData = slideData.segments.find(s => s.segmentId === segmentId);
  if (!segData) return [];
  if (filter === 'all') return segData.markers;
  return segData.markers.filter(m => filter.includes(m.id));
}

// ---------------------------------------------------------------------------
// CSS to hide UI chrome for clean screenshots.
// Uses visibility:hidden to keep layout stable (elements remain in DOM
// and are clickable by Playwright via aria-labels).
// ---------------------------------------------------------------------------
const HIDE_CHROME_CSS = `
  [data-testid="progress-bar"],
  [data-testid="slide-nav"],
  [data-testid="keyboard-hint"],
  [data-testid="back-button"],
  [data-testid="reduced-motion-toggle"] {
    display: none !important;
  }
`;

// ---------------------------------------------------------------------------
// Helpers
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

/** Hide UI chrome, take screenshot, restore. */
async function takeCleanScreenshot(page: Page, path: string) {
  const tag = await page.addStyleTag({ content: HIDE_CHROME_CSS });
  await page.screenshot({ path });
  await tag.evaluate(el => el.remove());
}

/** Navigate to a specific slide by clicking its dot (1-indexed). */
async function goToSlide(page: Page, slideNumber: number) {
  const dot = page.locator(`button[aria-label^="Go to slide ${slideNumber}:"]`);
  if (await dot.count() > 0) {
    await dot.click();
    await waitForAnimations(page, 1000);
  }
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

  // 3. If we need to skip to a specific starting slide, click its dot directly
  if (SLIDE_RANGE) {
    await goToSlide(page, SLIDE_RANGE.start);
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
        await takeCleanScreenshot(page, join(outDir, filename));
        screenshotCount++;
        console.log(`  [${info.current}/${info.total}] ${filename}  "${title}"`);

        // Marker screenshots for this segment
        const segMarkers = getMarkersForSegment(alignmentData, info.chapter, info.slide, segId, MARKER_FILTER);
        for (const marker of segMarkers) {
          await page.evaluate((t: number) => (window as any).__seekToTime?.(t), marker.time);
          await waitForAnimations(page, 500);
          const markerFilename = `${slideLabel}_seg${pad(s)}_${segId}_marker_${marker.id}.png`;
          await takeCleanScreenshot(page, join(outDir, markerFilename));
          screenshotCount++;
          console.log(`  [${info.current}/${info.total}] ${markerFilename}  "${title}" (marker: ${marker.id})`);
        }
      }
    } else {
      const filename = `${slideLabel}_seg00_default.png`;
      await takeCleanScreenshot(page, join(outDir, filename));
      screenshotCount++;
      console.log(`  [${info.current}/${info.total}] ${filename}  "${title}"`);
    }

    // Advance to next slide — use goToSlide() instead of ArrowRight to avoid
    // the capture-phase marker navigation handler intercepting the keypress.
    if (info.current >= info.total) {
      done = true;
    } else {
      await goToSlide(page, info.current + 1);
    }
  }

  console.log('');
  console.log(`Done. ${screenshotCount} screenshots saved to: screenshots/${DEMO_ID}/`);
});
