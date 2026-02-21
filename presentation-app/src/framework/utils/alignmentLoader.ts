import type { DemoAlignment } from '../alignment/types';

/** In-memory cache: demoId → alignment data */
const cache = new Map<string, DemoAlignment | null>();

/**
 * Lazily load alignment.json for a demo.
 * Returns null if not found. Caches in memory after first fetch.
 */
export async function loadAlignment(demoId: string): Promise<DemoAlignment | null> {
  if (cache.has(demoId)) {
    return cache.get(demoId)!;
  }

  try {
    const response = await fetch(`/audio/${demoId}/alignment.json`);
    if (!response.ok) {
      cache.set(demoId, null);
      return null;
    }

    const data: DemoAlignment = await response.json();
    cache.set(demoId, data);
    return data;
  } catch {
    cache.set(demoId, null);
    return null;
  }
}

/**
 * Clear the alignment cache for a specific demo or all demos.
 */
export function clearAlignmentCache(demoId?: string): void {
  if (demoId) {
    cache.delete(demoId);
  } else {
    cache.clear();
  }
}
