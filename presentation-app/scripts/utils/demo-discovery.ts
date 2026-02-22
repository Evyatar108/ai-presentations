/**
 * Shared demo discovery and slide loading utilities.
 *
 * Consolidates getAllDemoIds() and loadDemoSlides() that were duplicated
 * across 6+ scripts.
 */

import * as fs from 'fs';
import * as path from 'path';

/** Get all demo IDs by scanning src/demos/ for directories with index.ts. */
export function getAllDemoIds(): string[] {
  const demosDir = path.join(__dirname, '../../src/demos');
  const entries = fs.readdirSync(demosDir, { withFileTypes: true });

  return entries
    .filter(entry => entry.isDirectory() && entry.name !== 'types.ts')
    .map(entry => entry.name)
    .filter(name => {
      const indexPath = path.join(demosDir, name, 'index.ts');
      return fs.existsSync(indexPath);
    });
}

/**
 * Get all demo IDs from the narration directory (public/narration/).
 * Used by check-narration which scans narration files rather than source code.
 */
export function getNarrationDemoIds(narrationDir?: string): string[] {
  const dir = narrationDir ?? path.join(__dirname, '../../public/narration');
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => {
      const narrationPath = path.join(dir, name, 'narration.json');
      return fs.existsSync(narrationPath);
    });
}

/** Dynamically import and return all slides for a demo from its SlidesRegistry. */
export async function loadDemoSlides(demoId: string): Promise<any[]> {
  try {
    const slidesRegistryPath = `../../src/demos/${demoId}/slides/SlidesRegistry.js`;
    const module = await import(slidesRegistryPath);
    return module.allSlides || [];
  } catch (error: any) {
    console.warn(`\u26A0\uFE0F  Could not load slides for demo '${demoId}': ${error.message}`);
    return [];
  }
}

/** Dynamically import the demo config (index.js) and its slides. */
export async function loadDemoConfig(demoId: string): Promise<{ config: any | null; slides: any[] }> {
  try {
    const configPath = `../../src/demos/${demoId}/index.js`;
    const configModule = await import(configPath);
    const config = configModule.default || configModule.demoConfig;
    const slides = await config.getSlides();
    return { config, slides };
  } catch (error: any) {
    console.warn(`\u26A0\uFE0F  Could not load config for demo '${demoId}': ${error.message}`);
    // Fallback: try to load slides directly
    const slides = await loadDemoSlides(demoId);
    return { config: null, slides };
  }
}
