import { describe, it, expect, beforeEach } from 'vitest';
import { DemoRegistry } from './DemoRegistry';

function makeMeta(id: string) {
  return { id, title: `Demo ${id}` };
}

function makeEntry(id: string) {
  return {
    id,
    metadata: makeMeta(id),
    loadConfig: async () => ({
      metadata: makeMeta(id),
      getSlides: async () => [],
    }),
  };
}

describe('DemoRegistry', () => {
  beforeEach(() => {
    DemoRegistry._resetForTesting();
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

    it('returns shallow copies (mutation-safe)', () => {
      DemoRegistry.registerDemo(makeEntry('z'));
      const meta1 = DemoRegistry.getAllMetadata();
      meta1[0].title = 'MUTATED';
      const meta2 = DemoRegistry.getAllMetadata();
      expect(meta2[0].title).toBe('Demo z');
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

    it('returns a shallow copy (mutation-safe)', () => {
      DemoRegistry.registerDemo(makeEntry('safe'));
      const meta1 = DemoRegistry.getMetadataById('safe');
      meta1!.title = 'MUTATED';
      const meta2 = DemoRegistry.getMetadataById('safe');
      expect(meta2!.title).toBe('Demo safe');
    });
  });

  describe('loadDemoConfig', () => {
    it('loads config for registered demo', async () => {
      DemoRegistry.registerDemo(makeEntry('loadable'));
      const config = await DemoRegistry.loadDemoConfig('loadable');
      expect(config.metadata.id).toBe('loadable');
      expect(typeof config.getSlides).toBe('function');
    });

    it('throws for unregistered demo', async () => {
      await expect(DemoRegistry.loadDemoConfig('missing')).rejects.toThrow('Demo not found: missing');
    });
  });

  describe('_resetForTesting', () => {
    it('clears all registered demos', () => {
      DemoRegistry.registerDemo(makeEntry('a'));
      DemoRegistry.registerDemo(makeEntry('b'));
      expect(DemoRegistry.getDemoIds()).toHaveLength(2);
      DemoRegistry._resetForTesting();
      expect(DemoRegistry.getDemoIds()).toEqual([]);
    });
  });
});
