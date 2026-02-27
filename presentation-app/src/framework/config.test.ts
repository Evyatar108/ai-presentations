import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * config.ts uses module-level state for projectOverrides.
 * We use vi.resetModules() + dynamic import for isolation.
 */

describe('config', () => {
  let getConfig: typeof import('./config').getConfig;
  let setProjectConfig: typeof import('./config').setProjectConfig;
  let defaultConfig: typeof import('./config').defaultConfig;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('./config');
    getConfig = mod.getConfig;
    setProjectConfig = mod.setProjectConfig;
    defaultConfig = mod.defaultConfig;
  });

  describe('defaultConfig', () => {
    it('has expected default values', () => {
      expect(defaultConfig.narrationApiBaseUrl).toBe('');
      expect(defaultConfig.fallbackAudioPath).toBe('/audio/silence-1s.wav');
    });
  });

  describe('getConfig (no overrides)', () => {
    it('returns defaults when no overrides set', () => {
      expect(getConfig()).toEqual(defaultConfig);
    });
  });

  describe('setProjectConfig + getConfig', () => {
    it('overrides narrationApiBaseUrl', () => {
      setProjectConfig({ narrationApiBaseUrl: 'http://custom:4000' });
      expect(getConfig().narrationApiBaseUrl).toBe('http://custom:4000');
      expect(getConfig().fallbackAudioPath).toBe('/audio/silence-1s.wav');
    });

    it('overrides fallbackAudioPath', () => {
      setProjectConfig({ fallbackAudioPath: '/custom/silence.mp3' });
      expect(getConfig().fallbackAudioPath).toBe('/custom/silence.mp3');
      expect(getConfig().narrationApiBaseUrl).toBe('');
    });

    it('overrides all fields', () => {
      setProjectConfig({
        narrationApiBaseUrl: 'http://prod:8080',
        fallbackAudioPath: '/prod/fallback.mp3',
      });
      const config = getConfig();
      expect(config.narrationApiBaseUrl).toBe('http://prod:8080');
      expect(config.fallbackAudioPath).toBe('/prod/fallback.mp3');
      // New env-derived fields retain their defaults
      expect(config.assetBaseUrl).toBe('');
      expect(config.ttsEnabled).toBe(true);
      expect(config.audioFormat).toBe('wav');
    });

    it('last setProjectConfig wins', () => {
      setProjectConfig({ narrationApiBaseUrl: 'http://first' });
      setProjectConfig({ narrationApiBaseUrl: 'http://second' });
      expect(getConfig().narrationApiBaseUrl).toBe('http://second');
    });

    it('empty overrides return defaults', () => {
      setProjectConfig({});
      expect(getConfig()).toEqual(defaultConfig);
    });
  });
});
