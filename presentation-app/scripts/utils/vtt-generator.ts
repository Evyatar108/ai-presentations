/**
 * VTT Subtitle Generator
 *
 * Generates WebVTT subtitle files with per-word timestamps (karaoke-style)
 * from segment timing events captured during OBS recording + WhisperX
 * word-level alignment data.
 *
 * Used by record-obs.ts after recording completes.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { stripMarkers } from './marker-parser';
import type { DemoAlignment, AlignedWord } from '../../src/framework/alignment/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Types ──────────────────────────────────────────────────────────

export interface SegmentEvent {
  chapter: number;
  slide: number;
  segmentIndex: number;
  segmentId: string;
  videoTime: number; // seconds since recording started
}

// Narration JSON structure (same as generate-alignment.ts)
interface NarrationSegment {
  id: string;
  narrationText: string;
}

interface NarrationSlide {
  chapter: number;
  slide: number;
  segments: NarrationSegment[];
}

interface NarrationData {
  demoId: string;
  slides: NarrationSlide[];
}

interface VttCue {
  start: number;
  end: number;
  text: string; // plain text (for fallback)
  wordTimestamps?: { time: number; word: string }[];
}

// ── Helpers ────────────────────────────────────────────────────────

function formatVttTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`;
}

function loadAlignmentData(demoId: string): DemoAlignment | null {
  const alignmentPath = path.join(__dirname, `../../public/audio/${demoId}/alignment.json`);
  if (!fs.existsSync(alignmentPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(alignmentPath, 'utf-8'));
  } catch {
    return null;
  }
}

function loadNarrationJson(demoId: string): NarrationData | null {
  const narrationFile = path.join(__dirname, `../../public/narration/${demoId}/narration.json`);
  if (!fs.existsSync(narrationFile)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(narrationFile, 'utf-8'));
    if (!data.demoId || !Array.isArray(data.slides)) return null;
    return data;
  } catch {
    return null;
  }
}

async function loadDemoSlides(demoId: string) {
  try {
    const slidesRegistryPath = `../../src/demos/${demoId}/slides/SlidesRegistry.js`;
    const module = await import(slidesRegistryPath);
    return module.allSlides || [];
  } catch {
    return [];
  }
}

/**
 * Get narration text for a segment, checking external narration JSON first,
 * then falling back to inline slide data.
 */
function getNarrationTextForSegment(
  narrationData: NarrationData | null,
  slides: any[],
  chapter: number,
  slide: number,
  segmentId: string,
): string | null {
  // Try external narration JSON first
  if (narrationData) {
    const slideData = narrationData.slides.find(
      (s) => s.chapter === chapter && s.slide === slide,
    );
    if (slideData) {
      const segment = slideData.segments.find((seg) => seg.id === segmentId);
      if (segment?.narrationText) return segment.narrationText;
    }
  }

  // Fall back to inline slides
  for (const s of slides) {
    if (s.metadata?.chapter === chapter && s.metadata?.slide === slide) {
      const seg = s.metadata.audioSegments?.find(
        (seg: any) => seg.id === segmentId,
      );
      if (seg?.narrationText) return seg.narrationText;
    }
  }

  return null;
}

// ── Cue grouping ───────────────────────────────────────────────────

const SENTENCE_END_RE = /[.!?]$/;
const MAX_CUE_DURATION = 7; // seconds

/**
 * Group words into sentence-based cues, splitting at sentence-ending
 * punctuation and enforcing a max duration cap.
 */
function groupWordsIntoCues(
  words: AlignedWord[],
  videoTimeOffset: number,
): VttCue[] {
  if (words.length === 0) return [];

  const cues: VttCue[] = [];
  let currentWords: { time: number; word: string }[] = [];
  let cueStart = videoTimeOffset + words[0].start;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const wordVideoTime = videoTimeOffset + w.start;
    currentWords.push({ time: wordVideoTime, word: w.word });

    const isSentenceEnd = SENTENCE_END_RE.test(w.word);
    const cueDuration = videoTimeOffset + w.end - cueStart;
    const isLast = i === words.length - 1;

    if (isSentenceEnd || cueDuration >= MAX_CUE_DURATION || isLast) {
      cues.push({
        start: cueStart,
        end: videoTimeOffset + w.end,
        text: currentWords.map((cw) => cw.word).join(' '),
        wordTimestamps: currentWords,
      });
      currentWords = [];
      if (i < words.length - 1) {
        cueStart = videoTimeOffset + words[i + 1].start;
      }
    }
  }

  return cues;
}

// ── Main ───────────────────────────────────────────────────────────

/**
 * Generate a WebVTT subtitle file from segment timing events and alignment data.
 *
 * Each word gets a per-word timestamp tag for karaoke-style highlighting:
 * ```
 * 00:00:03.120 --> 00:00:07.500
 * <00:00:03.120>Hello, <00:00:03.543>I'm <00:00:04.220>narrating.
 * ```
 */
export async function generateVtt(
  demoId: string,
  segmentEvents: SegmentEvent[],
): Promise<string> {
  const alignment = loadAlignmentData(demoId);
  const narrationData = loadNarrationJson(demoId);
  const slides = await loadDemoSlides(demoId);

  const cues: VttCue[] = [];

  for (let i = 0; i < segmentEvents.length; i++) {
    const event = segmentEvents[i];
    const coordKey = `c${event.chapter}_s${event.slide}`;

    // Try to find word-level alignment for this segment
    const slideAlignment = alignment?.slides[coordKey];
    const segAlignment = slideAlignment?.segments.find(
      (s) => s.segmentId === event.segmentId,
    );

    if (segAlignment && segAlignment.words.length > 0) {
      // Word-level cues from alignment data
      const segmentCues = groupWordsIntoCues(
        segAlignment.words,
        event.videoTime,
      );
      cues.push(...segmentCues);
    } else {
      // Fallback: single cue from narration text
      const rawText = getNarrationTextForSegment(
        narrationData,
        slides,
        event.chapter,
        event.slide,
        event.segmentId,
      );
      if (!rawText) continue;

      const text = stripMarkers(rawText);
      if (!text) continue;

      // Estimate end time from next segment start or add a default duration
      const nextEvent = segmentEvents[i + 1];
      const estimatedEnd = nextEvent
        ? nextEvent.videoTime - 0.1
        : event.videoTime + 5;

      cues.push({
        start: event.videoTime,
        end: estimatedEnd,
        text,
      });
    }
  }

  // Build VTT output
  const lines: string[] = ['WEBVTT', ''];

  for (const cue of cues) {
    lines.push(`${formatVttTime(cue.start)} --> ${formatVttTime(cue.end)}`);

    if (cue.wordTimestamps && cue.wordTimestamps.length > 0) {
      // Per-word timestamp tags for karaoke highlighting
      const wordLine = cue.wordTimestamps
        .map((wt) => `<${formatVttTime(wt.time)}>${wt.word}`)
        .join(' ');
      lines.push(wordLine);
    } else {
      lines.push(cue.text);
    }

    lines.push('');
  }

  return lines.join('\n');
}
