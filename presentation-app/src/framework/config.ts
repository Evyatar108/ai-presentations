/**
 * Framework configuration with sensible defaults.
 * Projects can override via project.config.ts.
 */

export interface FrameworkConfig {
  /** Base URL for the narration API server (default: '' for same-origin Vite plugin) */
  narrationApiBaseUrl: string;
  /** Path to fallback silence audio file (default: '/audio/silence-1s.wav') */
  fallbackAudioPath: string;
}

export const defaultConfig: FrameworkConfig = {
  narrationApiBaseUrl: '',
  fallbackAudioPath: '/audio/silence-1s.wav',
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
