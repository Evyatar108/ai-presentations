import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { DemoRegistry as DemoRegistryType } from '@framework/demos/DemoRegistry';

/**
 * Integration test for auto-discovery demo registration.
 * Verifies that import.meta.glob in registry.ts correctly discovers
 * and registers all demos in src/demos/.
 */

const EXPECTED_DEMO_IDS = ['meeting-highlights', 'example-demo-1', 'example-demo-2'];

describe('Auto-discovery demo registration', () => {
  let DemoRegistry: typeof DemoRegistryType;

  beforeEach(async () => {
    vi.resetModules();
    // Import registry (side-effect registers demos) after resetting modules
    // so we get a fresh DemoRegistry each time
    await import('./registry');
    const mod = await import('@framework/demos/DemoRegistry');
    DemoRegistry = mod.DemoRegistry;
  });

  it('registers all expected demos', () => {
    const ids = DemoRegistry.getDemoIds();
    for (const expectedId of EXPECTED_DEMO_IDS) {
      expect(ids).toContain(expectedId);
    }
  });

  it('populates metadata for each demo', () => {
    for (const id of EXPECTED_DEMO_IDS) {
      const metadata = DemoRegistry.getMetadataById(id);
      expect(metadata).toBeDefined();
      expect(metadata!.id).toBe(id);
      expect(metadata!.title).toBeTruthy();
    }
  });

  it('lazy-loads config for each demo', async () => {
    for (const id of EXPECTED_DEMO_IDS) {
      const config = await DemoRegistry.loadDemoConfig(id);
      expect(config).toBeDefined();
      expect(config.id).toBe(id);
      expect(typeof config.getSlides).toBe('function');
    }
  });

  it('has no duplicate IDs', () => {
    expect(() => DemoRegistry.ensureUniqueIds()).not.toThrow();
  });
});
