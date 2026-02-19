/**
 * Framework debug logging utility.
 *
 * - `debug.log()` / `debug.warn()` — only output in dev when
 *   `localStorage['debug:framework']` is set to a truthy value.
 * - `debug.error()` — always outputs in dev mode.
 *
 * All calls are tree-shaken out of production builds via
 * `import.meta.env.DEV` guards.
 */

function isDebugEnabled(): boolean {
  try {
    return !!localStorage.getItem('debug:framework');
  } catch {
    return false;
  }
}

export const debug = {
  log(...args: unknown[]): void {
    if (import.meta.env.DEV && isDebugEnabled()) {
      console.log('[Framework]', ...args);
    }
  },

  warn(...args: unknown[]): void {
    if (import.meta.env.DEV && isDebugEnabled()) {
      console.warn('[Framework]', ...args);
    }
  },

  error(...args: unknown[]): void {
    if (import.meta.env.DEV) {
      console.error('[Framework]', ...args);
    }
  },
};
