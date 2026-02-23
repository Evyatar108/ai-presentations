/**
 * Shared CLI argument parsing utilities for all scripts.
 *
 * Consolidates the duplicated --demo, --segments, --force, --verbose, --instruct
 * parsing that was copy-pasted across 6+ scripts.
 */

/** Get the value of a named CLI argument (e.g., --demo <value>). */
export function getArg(name: string, args: string[] = process.argv.slice(2)): string | undefined {
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return undefined;
}

/** Check if a flag is present (e.g., --force, --verbose). */
export function hasFlag(name: string, args: string[] = process.argv.slice(2)): boolean {
  return args.includes(`--${name}`) || args.includes(`-${name.charAt(0)}`);
}

/** Split a comma-separated segment filter string into individual keys. */
export function parseSegmentFilter(raw: string): string[] {
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

/** Build a standardized segment key from chapter, slide, and segment ID. */
export function buildSegmentKey(chapter: number, slide: number, segmentId: number): string {
  return `ch${chapter}:s${slide}:${segmentId}`;
}

/** Parse a viewport string like "1920x1080" into width and height. */
export function parseViewport(raw: string): { width: number; height: number } | null {
  const match = raw.match(/^(\d+)x(\d+)$/);
  if (!match) return null;
  return { width: parseInt(match[1], 10), height: parseInt(match[2], 10) };
}

/** Split an array into chunks of a given size. */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
