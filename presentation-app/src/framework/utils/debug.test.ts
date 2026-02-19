// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('debug utility', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.removeItem('debug:framework');
    vi.resetModules();
  });

  it('debug.log outputs when debug:framework is set', async () => {
    localStorage.setItem('debug:framework', '1');
    const { debug } = await import('./debug');
    debug.log('test message');
    expect(consoleLogSpy).toHaveBeenCalledWith('[Framework]', 'test message');
  });

  it('debug.log suppresses output when debug:framework is not set', async () => {
    const { debug } = await import('./debug');
    debug.log('should not appear');
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('debug.warn outputs when debug:framework is set', async () => {
    localStorage.setItem('debug:framework', '1');
    const { debug } = await import('./debug');
    debug.warn('warning message');
    expect(consoleWarnSpy).toHaveBeenCalledWith('[Framework]', 'warning message');
  });

  it('debug.warn suppresses output when debug:framework is not set', async () => {
    const { debug } = await import('./debug');
    debug.warn('should not appear');
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('debug.error always outputs in dev mode', async () => {
    const { debug } = await import('./debug');
    debug.error('error message');
    expect(consoleErrorSpy).toHaveBeenCalledWith('[Framework]', 'error message');
  });

  it('debug.error outputs even without debug:framework set', async () => {
    const { debug } = await import('./debug');
    debug.error('critical error');
    expect(consoleErrorSpy).toHaveBeenCalledWith('[Framework]', 'critical error');
  });
});
