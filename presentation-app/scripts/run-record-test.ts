/**
 * Wrapper that parses CLI args and runs the Playwright video recording test.
 *
 * Usage:
 *   npm run test:record -- --demo highlights-deep-dive
 *   npm run test:record -- --demo highlights-deep-dive --viewport 1920x800
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
  console.error('Usage: npm run test:record -- --demo <demo-id> [--viewport WxH]');
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

const parts = [
  `demo: ${demoId}`,
  viewport ? `viewport: ${viewport}` : null,
].filter(Boolean).join(', ');
console.log(`Recording video (${parts})\n`);

try {
  execSync(`npx playwright test tests/record.spec.ts`, {
    stdio: 'inherit',
    env,
    cwd: process.cwd(),
  });
} catch {
  process.exit(1);
}
