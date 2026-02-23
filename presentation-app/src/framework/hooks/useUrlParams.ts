/**
 * Thin wrapper around URLSearchParams for welcome screen state.
 * Uses replaceState for filter changes (no back-button stack pollution)
 * and pushState for demo selection (enables back button navigation).
 */

export function getParam(key: string): string | null {
  return new URLSearchParams(window.location.search).get(key);
}

export function getParamList(key: string): string[] {
  const val = getParam(key);
  return val ? val.split(',').filter(Boolean) : [];
}

/**
 * Update URL params using replaceState (no history entry).
 * Used for filter/search/sort state.
 */
export function setParams(params: Record<string, string | null>): void {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === '') {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  }
  window.history.replaceState({}, '', url.toString());
}

/**
 * Navigate to a demo (pushState — adds history entry for back button).
 */
export function pushDemo(demoId: string): void {
  const url = new URL(window.location.href);
  // Clear welcome screen params
  url.searchParams.delete('q');
  url.searchParams.delete('tags');
  url.searchParams.delete('sort');
  url.searchParams.delete('view');
  url.searchParams.set('demo', demoId);
  window.history.pushState({}, '', url.toString());
}

/**
 * Navigate back to welcome screen (pushState — adds history entry).
 */
export function pushWelcome(): void {
  window.history.pushState({}, '', window.location.pathname);
}
