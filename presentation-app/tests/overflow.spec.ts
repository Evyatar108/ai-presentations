/**
 * Overflow Detection Test
 *
 * Steps through every slide and segment of a demo in manual mode,
 * reads the `data-overflow` attribute set by SlideContainer's dev-mode
 * overflow detector, and reports which slides/segments exceed the viewport.
 *
 * Usage:
 *   npm run test:overflow -- --demo highlights-deep-dive
 *
 * Assumes the Vite dev server is already running on localhost:5173.
 */
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Parse --demo from CLI: look in process.env.DEMO (set by npm script wrapper)
// or fall back to scanning process.argv for --demo <id>.
// ---------------------------------------------------------------------------
function getDemoId(): string {
  if (process.env.DEMO) return process.env.DEMO;

  const args = process.argv;
  const idx = args.indexOf('--demo');
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }

  throw new Error(
    'Missing --demo argument. Usage: npm run test:overflow -- --demo <demo-id>'
  );
}

const DEMO_ID = getDemoId();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface SegmentResult {
  segmentIdx: number;
  segmentId: string;
  scrollHeight: number;
  threshold: number;
  overflow: number;
}

interface SlideResult {
  slideIdx: number;
  totalSlides: number;
  chapter: number;
  slide: number;
  title: string;
  segments: SegmentResult[];
}

/** Wait for Framer Motion animations to settle + ResizeObserver + React re-render. */
async function waitForAnimations(page: Page, ms = 1500) {
  await page.waitForTimeout(ms);
}

/**
 * Read the data-overflow attribute set by SlideContainer's ResizeObserver.
 * Must be called AFTER waitForAnimations() so the ResizeObserver has fired
 * and React has re-rendered with the measured value.
 *
 * Uses querySelectorAll + last element because during slide transitions,
 * AnimatePresence briefly mounts both the exiting and entering slides.
 * The LAST [data-overflow] element is the current (entering) slide.
 */
async function readOverflow(page: Page): Promise<{ overflow: number; scrollHeight: number; threshold: number }> {
  return page.evaluate(() => {
    const all = document.querySelectorAll('[data-overflow]');
    const el = all[all.length - 1] as HTMLElement | undefined;
    if (!el) return { overflow: 0, scrollHeight: 0, threshold: 0 };
    const threshold = Math.round(window.innerHeight * 0.75);
    const overflow = parseInt(el.getAttribute('data-overflow') || '0', 10);
    return { overflow, scrollHeight: el.scrollHeight, threshold };
  });
}

/** Parse "Slide X of Y (ChN:SM)" from the progress bar text. */
async function getSlideInfo(page: Page): Promise<{ current: number; total: number; chapter: number; slide: number }> {
  // The ProgressBar renders: "Slide {N} of {T} (Ch{C}:S{S})"
  // The SlidePlayer bottom nav shows "Slide:" label but also has
  // aria-label="Go to slide N: Title" on dots.
  // Let's get the current dot's aria-label.
  const currentDot = page.locator('button[aria-label^="Go to slide"][aria-current="true"]');
  const label = await currentDot.getAttribute('aria-label') ?? '';
  // "Go to slide 5: Prompt Overview"
  const slideMatch = label.match(/Go to slide (\d+):/);
  const slideNum = slideMatch ? parseInt(slideMatch[1], 10) : 1;

  // Count total slides from all slide dots
  const totalSlides = await page.locator('button[aria-label^="Go to slide"]').count();

  // Get chapter/slide from ProgressBar text: "Slide X of Y (ChN:SM)"
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

/** Get segment count for the current slide (0 if no segment dots visible). */
async function getSegmentCount(page: Page): Promise<number> {
  const dots = page.locator('button[aria-label^="Go to segment"]');
  const count = await dots.count();
  return count;
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

test(`overflow check: ${DEMO_ID}`, async ({ page }) => {
  // 1. Navigate to the app
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // 2. Click the demo tile by data-demo-id attribute
  const demoTile = page.locator(`[data-demo-id="${DEMO_ID}"]`);
  await expect(demoTile).toBeVisible({ timeout: 15_000 });
  await demoTile.click();

  // 3. Start manual mode
  const manualBtn = page.locator('[aria-label="Start manual mode"]');
  await expect(manualBtn).toBeVisible({ timeout: 10_000 });
  await manualBtn.click();

  // Wait for the first slide to render
  await waitForAnimations(page, 1500);

  // 4. Step through all slides and segments
  const results: SlideResult[] = [];
  let done = false;

  while (!done) {
    const info = await getSlideInfo(page);
    const title = await getSlideTitle(page);
    const segmentCount = await getSegmentCount(page);

    const slideResult: SlideResult = {
      slideIdx: info.current,
      totalSlides: info.total,
      chapter: info.chapter,
      slide: info.slide,
      title,
      segments: [],
    };

    if (segmentCount > 0) {
      // Click each segment dot and measure overflow
      for (let s = 0; s < segmentCount; s++) {
        const segId = await getSegmentId(page, s);
        const segDot = page.locator(`button[aria-label="Go to segment ${s}: ${segId}"]`);
        if (await segDot.count() > 0) {
          await segDot.click();
        }
        await waitForAnimations(page);
        const { overflow, scrollHeight, threshold } = await readOverflow(page);
        slideResult.segments.push({
          segmentIdx: s,
          segmentId: segId,
          scrollHeight,
          threshold,
          overflow,
        });
      }
    } else {
      // Single segment (no dots), just measure
      await waitForAnimations(page);
      const { overflow, scrollHeight, threshold } = await readOverflow(page);
      slideResult.segments.push({
        segmentIdx: 0,
        segmentId: 'default',
        scrollHeight,
        threshold,
        overflow,
      });
    }

    results.push(slideResult);

    // Advance to next slide (unless on last)
    if (info.current >= info.total) {
      done = true;
    } else {
      await page.keyboard.press('ArrowRight');
      await waitForAnimations(page, 1000);
    }
  }

  // 5. Print report
  const overflowSlides: SlideResult[] = [];

  console.log('');
  console.log(`OVERFLOW REPORT — ${DEMO_ID}`);
  console.log('='.repeat(55));

  for (const slide of results) {
    const hasOverflow = slide.segments.some(s => s.overflow > 0);
    const label = `Slide ${slide.slideIdx}/${slide.totalSlides}  Ch${slide.chapter}_S${slide.slide} "${slide.title}"`;

    if (hasOverflow) {
      overflowSlides.push(slide);
      console.log(`FAIL  ${label}`);
      for (const seg of slide.segments) {
        if (seg.overflow > 0) {
          console.log(`      Segment ${seg.segmentIdx} (${seg.segmentId}): OVERFLOW ${seg.overflow}px (${seg.scrollHeight}px / ${seg.threshold}px threshold)`);
        } else {
          console.log(`      Segment ${seg.segmentIdx} (${seg.segmentId}): OK (${seg.scrollHeight}px / ${seg.threshold}px threshold)`);
        }
      }
    } else {
      console.log(`PASS  ${label} — all ${slide.segments.length} segments fit`);
    }
  }

  console.log('');
  console.log(`SUMMARY: ${overflowSlides.length} slides with overflow, ${results.length - overflowSlides.length} slides OK`);
  console.log('');

  // 6. Assert no overflow
  expect(
    overflowSlides.length,
    `${overflowSlides.length} slide(s) have content overflowing the viewport. See report above.`
  ).toBe(0);
});
