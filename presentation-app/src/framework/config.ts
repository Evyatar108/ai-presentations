/**
 * Framework configuration with sensible defaults.
 * Projects can override via project.config.ts.
 */

export interface FrameworkConfig {
  /** Base URL for the narration API server (default: '' for same-origin Vite plugin) */
  narrationApiBaseUrl: string;
  /** Path to fallback silence audio file (default: '/audio/silence-1s.wav') */
  fallbackAudioPath: string;
  /** CDN / asset base URL prefix (default: '' for same-origin) */
  assetBaseUrl: string;
  /** Whether TTS regeneration UI is available (default: true in dev, false in production) */
  ttsEnabled: boolean;
  /** Audio file format: 'wav' for dev, 'mp3' for production (default: 'wav') */
  audioFormat: 'wav' | 'mp3';
}

export const defaultConfig: FrameworkConfig = {
  narrationApiBaseUrl: '',
  fallbackAudioPath: '/audio/silence-1s.wav',
  assetBaseUrl: import.meta.env.VITE_ASSET_BASE_URL ?? '',
  ttsEnabled: import.meta.env.VITE_TTS_ENABLED !== 'false',
  audioFormat: (import.meta.env.VITE_AUDIO_FORMAT as 'wav' | 'mp3') ?? 'wav',
};

let projectOverrides: Partial<FrameworkConfig> = {};

/**
 * Set project-level config overrides. Called from project.config.ts.
 */
export function setProjectConfig(overrides: Partial<FrameworkConfig>): void {
  projectOverrides = overrides;
}

/**
 * Get the resolved framework config (defaults merged with project overrides).
 */
export function getConfig(): FrameworkConfig {
  return { ...defaultConfig, ...projectOverrides };
}
