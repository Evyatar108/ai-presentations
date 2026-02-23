/**
 * Shared narration JSON loading utilities.
 *
 * Consolidates the duplicated NarrationData types and loading logic
 * from 5+ scripts.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** A single narration segment within a slide. */
export interface NarrationSegment {
  id: string;
  narrationText: string;
  visualDescription?: string;
  notes?: string;
  instruct?: string;
}

/** A slide's narration data. */
export interface NarrationSlide {
  chapter: number;
  slide: number;
  title: string;
  segments: NarrationSegment[];
  instruct?: string;
}

/** Top-level narration data for a demo. */
export interface NarrationData {
  demoId: string;
  version: string;
  lastModified: string;
  slides: NarrationSlide[];
  instruct?: string;
}

/**
 * Load and parse narration.json for a given demo.
 * Returns null if the file doesn't exist or is invalid.
 */
export function loadNarrationJson(demoId: string, narrationDir?: string): NarrationData | null {
  const dir = narrationDir ?? path.join(__dirname, '../../public/narration');
  const narrationFile = path.join(dir, demoId, 'narration.json');

  if (!fs.existsSync(narrationFile)) {
    return null;
  }

  try {
    const content = fs.readFileSync(narrationFile, 'utf-8');
    const data = JSON.parse(content) as NarrationData;

    // Validate basic structure
    if (!data.demoId || !Array.isArray(data.slides)) {
      console.warn(`\u26A0\uFE0F  Invalid narration.json structure for '${demoId}'`);
      return null;
    }

    return data;
  } catch (error: any) {
    console.warn(`\u26A0\uFE0F  Failed to parse narration.json for '${demoId}': ${error.message}`);
    return null;
  }
}

/** Extract narration text for a specific segment from narration data. */
export function getNarrationText(
  narrationData: NarrationData | null,
  chapter: number,
  slide: number,
  segmentId: string
): string | null {
  if (!narrationData) return null;

  const slideData = narrationData.slides.find(
    s => s.chapter === chapter && s.slide === slide
  );
  if (!slideData) return null;

  const segment = slideData.segments.find(seg => seg.id === segmentId);
  return segment?.narrationText ?? null;
}

/** Extract instruct string for a segment using the 3-level hierarchy: segment > slide > demo. */
export function getNarrationInstruct(
  narrationData: NarrationData | null,
  chapter: number,
  slide: number,
  segmentId: string
): string | undefined {
  if (!narrationData) return undefined;

  const slideData = narrationData.slides.find(
    s => s.chapter === chapter && s.slide === slide
  );
  if (!slideData) return narrationData.instruct;

  const segment = slideData.segments.find(seg => seg.id === segmentId);
  return segment?.instruct ?? slideData.instruct ?? narrationData.instruct;
}
