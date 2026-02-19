import type { PresentationTheme } from '../theme/types';

/**
 * Format seconds as mm:ss string.
 */
export function formatMMSS(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Return a color indicating how far actual timing deviates from planned.
 * Uses theme tokens when available; falls back to hardcoded values.
 */
export function deltaColor(deltaSeconds: number, theme?: PresentationTheme): string {
  const abs = Math.abs(deltaSeconds);
  if (abs <= 2) return theme?.colors.success ?? '#22c55e';
  if (abs <= 5) return theme?.colors.warning ?? '#f59e0b';
  return theme?.colors.error ?? '#ef4444';
}
