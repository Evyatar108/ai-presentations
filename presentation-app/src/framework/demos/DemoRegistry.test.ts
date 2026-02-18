import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { DemoRegistry as DemoRegistryType } from './DemoRegistry';

/**
 * DemoRegistry uses module-level state (a `registry` array).
 * We use vi.resetModules() + dynamic import to get a fresh module per test.
 */

function makeMeta(id: string) {
  return { id, title: `Demo ${id}` };
}

function makeEntry(id: string) {
  return {
    id,
    metadata: makeMeta(id),
    loadConfig: async () => ({
      id,
      metadata: makeMeta(id),
      getSlides: async () => [],
    }),
  };
}

describe('DemoRegistry', () => {
  let DemoRegistry: typeof DemoRegistryType;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('./DemoRegistry');
    DemoRegistry = mod.DemoRegistry;
  });

  describe('registerDemo', () => {
    it('registers a new demo', () => {
      DemoRegistry.registerDemo(makeEntry('demo-a'));
      expect(DemoRegistry.getDemoIds()).toEqual(['demo-a']);
    });

    it('skips duplicate IDs', () => {
      DemoRegistry.registerDemo(makeEntry('demo-a'));
      DemoRegistry.registerDemo(makeEntry('demo-a'));
      expect(DemoRegistry.getDemoIds()).toEqual(['demo-a']);
    });

    it('registers multiple unique demos', () => {
      DemoRegistry.registerDemo(makeEntry('demo-a'));
      DemoRegistry.registerDemo(makeEntry('demo-b'));
      expect(DemoRegistry.getDemoIds()).toEqual(['demo-a', 'demo-b']);
    });
  });

  describe('getAllMetadata', () => {
    it('returns empty array when no demos registered', () => {
      expect(DemoRegistry.getAllMetadata()).toEqual([]);
    });

    it('returns metadata for all registered demos', () => {
      DemoRegistry.registerDemo(makeEntry('x'));
      DemoRegistry.registerDemo(makeEntry('y'));
      const metadata = DemoRegistry.getAllMetadata();
      expect(metadata).toHaveLength(2);
      expect(metadata[0].id).toBe('x');
      expect(metadata[1].id).toBe('y');
    });
  });

  describe('getDemoIds', () => {
    it('returns empty array initially', () => {
      expect(DemoRegistry.getDemoIds()).toEqual([]);
    });

    it('returns IDs in registration order', () => {
      DemoRegistry.registerDemo(makeEntry('c'));
      DemoRegistry.registerDemo(makeEntry('a'));
      DemoRegistry.registerDemo(makeEntry('b'));
      expect(DemoRegistry.getDemoIds()).toEqual(['c', 'a', 'b']);
    });
  });

  describe('getMetadataById', () => {
    it('returns metadata for existing ID', () => {
      DemoRegistry.registerDemo(makeEntry('my-demo'));
      const meta = DemoRegistry.getMetadataById('my-demo');
      expect(meta).toBeDefined();
      expect(meta!.title).toBe('Demo my-demo');
    });

    it('returns undefined for unknown ID', () => {
      expect(DemoRegistry.getMetadataById('nonexistent')).toBeUndefined();
    });
  });

  describe('loadDemoConfig', () => {
    it('loads config for registered demo', async () => {
      DemoRegistry.registerDemo(makeEntry('loadable'));
      const config = await DemoRegistry.loadDemoConfig('loadable');
      expect(config.id).toBe('loadable');
      expect(typeof config.getSlides).toBe('function');
    });

    it('throws for unregistered demo', async () => {
      await expect(DemoRegistry.loadDemoConfig('missing')).rejects.toThrow('Demo not found: missing');
    });
  });

  describe('ensureUniqueIds', () => {
    it('does not throw when all IDs are unique', () => {
      DemoRegistry.registerDemo(makeEntry('a'));
      DemoRegistry.registerDemo(makeEntry('b'));
      expect(() => DemoRegistry.ensureUniqueIds()).not.toThrow();
    });

    it('does not throw on empty registry', () => {
      expect(() => DemoRegistry.ensureUniqueIds()).not.toThrow();
    });
  });
});
