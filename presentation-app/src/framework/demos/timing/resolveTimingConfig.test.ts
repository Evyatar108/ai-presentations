import { describe, it, expect } from 'vitest';
import { resolveTimingConfig, DEFAULT_TIMING, TimingConfig } from './types';

describe('resolveTimingConfig', () => {
  it('returns defaults when no configs provided', () => {
    const result = resolveTimingConfig();
    expect(result).toEqual(DEFAULT_TIMING);
  });

  it('returns defaults when all configs are undefined', () => {
    const result = resolveTimingConfig(undefined, undefined);
    expect(result).toEqual(DEFAULT_TIMING);
  });

  it('overrides betweenSegments from a single config', () => {
    const config: TimingConfig = { betweenSegments: 200 };
    const result = resolveTimingConfig(config);
    expect(result.betweenSegments).toBe(200);
    expect(result.betweenSlides).toBe(DEFAULT_TIMING.betweenSlides);
    expect(result.afterFinalSlide).toBe(DEFAULT_TIMING.afterFinalSlide);
  });

  it('later configs override earlier ones', () => {
    const demoTiming: TimingConfig = { betweenSegments: 300, betweenSlides: 1500 };
    const slideTiming: TimingConfig = { betweenSegments: 100 };
    const result = resolveTimingConfig(demoTiming, slideTiming);
    expect(result.betweenSegments).toBe(100); // slide overrides demo
    expect(result.betweenSlides).toBe(1500); // kept from demo
  });

  it('skips undefined configs in the chain', () => {
    const config: TimingConfig = { afterFinalSlide: 5000 };
    const result = resolveTimingConfig(undefined, config, undefined);
    expect(result.afterFinalSlide).toBe(5000);
    expect(result.betweenSegments).toBe(DEFAULT_TIMING.betweenSegments);
  });

  it('merges custom timing keys', () => {
    const config1: TimingConfig = { custom: { fadeIn: 300 } };
    const config2: TimingConfig = { custom: { fadeOut: 200 } };
    const result = resolveTimingConfig(config1, config2);
    expect(result.custom).toEqual({ fadeIn: 300, fadeOut: 200 });
  });

  it('later custom keys override earlier ones', () => {
    const config1: TimingConfig = { custom: { fadeIn: 300 } };
    const config2: TimingConfig = { custom: { fadeIn: 100 } };
    const result = resolveTimingConfig(config1, config2);
    expect(result.custom).toEqual({ fadeIn: 100 });
  });

  it('handles three-level hierarchy (demo → slide → segment)', () => {
    const demo: TimingConfig = { betweenSegments: 500, betweenSlides: 1000, afterFinalSlide: 2000 };
    const slide: TimingConfig = { betweenSegments: 300 };
    const segment: TimingConfig = { betweenSegments: 100 };
    const result = resolveTimingConfig(demo, slide, segment);
    expect(result.betweenSegments).toBe(100);
    expect(result.betweenSlides).toBe(1000);
    expect(result.afterFinalSlide).toBe(2000);
  });

  it('overrides beforeFirstSlide from config', () => {
    const config: TimingConfig = { beforeFirstSlide: 2000 };
    const result = resolveTimingConfig(config);
    expect(result.beforeFirstSlide).toBe(2000);
  });

  it('allows opting out of start silence with beforeFirstSlide: 0', () => {
    const config: TimingConfig = { beforeFirstSlide: 0 };
    const result = resolveTimingConfig(config);
    expect(result.beforeFirstSlide).toBe(0);
  });
});
