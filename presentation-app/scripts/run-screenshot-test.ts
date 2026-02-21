/**
 * Wrapper that parses CLI args and runs the Playwright screenshot test.
 *
 * Usage:
 *   npm run test:screenshot -- --demo highlights-deep-dive
 *   npm run test:screenshot -- --demo highlights-deep-dive --viewport 1920x800
 *   npm run test:screenshot -- --demo highlights-deep-dive --slides 3-5
 */
import { execSync } from 'child_process';

const args = process.argv.slice(2);

function getArg(name: string): string | undefined {
  const idx = args.indexOf(name);
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
  return undefined;
}

const demoId = getArg('--demo');
if (!demoId) {
  console.error('Usage: npm run test:screenshot -- --demo <demo-id> [--viewport WxH] [--slides N-M]');
  process.exit(1);
}

const env: Record<string, string> = { ...process.env as Record<string, string>, DEMO: demoId };

const viewport = getArg('--viewport');
if (viewport) {
  const [w, h] = viewport.split('x').map(Number);
  if (!w || !h) {
    console.error('Invalid --viewport format. Use WxH, e.g. 1920x800');
    process.exit(1);
  }
  env.VIEWPORT_WIDTH = String(w);
  env.VIEWPORT_HEIGHT = String(h);
}

const slides = getArg('--slides');
if (slides) {
  env.SLIDE_RANGE = slides;
}

const parts = [
  `demo: ${demoId}`,
  viewport ? `viewport: ${viewport}` : null,
  slides ? `slides: ${slides}` : null,
].filter(Boolean).join(', ');
console.log(`Taking screenshots (${parts})\n`);

try {
  execSync(`npx playwright test tests/screenshot.spec.ts --project=static`, {
    stdio: 'inherit',
    env,
    cwd: process.cwd(),
  });
} catch {
  process.exit(1);
}
