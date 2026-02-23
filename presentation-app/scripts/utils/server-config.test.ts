import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';

// Mock fs before importing the module under test
vi.mock('fs');

const mockedFs = vi.mocked(fs);

// Dynamic import to ensure mocks are in place
let loadTtsServerUrl: () => string;
let loadWhisperUrl: () => string;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  const mod = await import('./server-config');
  loadTtsServerUrl = mod.loadTtsServerUrl;
  loadWhisperUrl = mod.loadWhisperUrl;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('loadTtsServerUrl', () => {
  it('returns server_url from valid config file', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ server_url: 'http://myhost:9000' }));

    expect(loadTtsServerUrl()).toBe('http://myhost:9000');
  });

  it('returns default http://localhost:5000 when file missing', () => {
    mockedFs.existsSync.mockReturnValue(false);

    expect(loadTtsServerUrl()).toBe('http://localhost:5000');
  });

  it('returns default when server_url field missing from JSON', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ whisper_url: 'http://other:5001' }));

    expect(loadTtsServerUrl()).toBe('http://localhost:5000');
  });

  it('returns default when file is invalid JSON', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('not valid json{{{');

    expect(loadTtsServerUrl()).toBe('http://localhost:5000');
  });
});

describe('loadWhisperUrl', () => {
  it('returns whisper_url from valid config file', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ whisper_url: 'http://whisper:8000' }));

    expect(loadWhisperUrl()).toBe('http://whisper:8000');
  });

  it('returns default http://localhost:5001 when file missing', () => {
    mockedFs.existsSync.mockReturnValue(false);

    expect(loadWhisperUrl()).toBe('http://localhost:5001');
  });

  it('returns default when whisper_url field missing from JSON', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ server_url: 'http://tts:5000' }));

    expect(loadWhisperUrl()).toBe('http://localhost:5001');
  });

  it('returns default when file is invalid JSON', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('{{broken}}');

    expect(loadWhisperUrl()).toBe('http://localhost:5001');
  });
});
