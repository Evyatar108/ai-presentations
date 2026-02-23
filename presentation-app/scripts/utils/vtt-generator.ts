/**
 * VTT Subtitle Generator
 *
 * Generates WebVTT subtitle files with per-word timestamps from segment timing
 * events captured during OBS recording + WhisperX word-level alignment data.
 *
 * Outputs a `-words.json` intermediate file with all word timestamps in video
 * time, so VTT can be regenerated without re-recording.
 *
 * Used by record-obs.ts after recording completes.
 */

import * as fs from 'fs';
import { loadAlignmentData, loadSubtitleCorrections } from './alignment-io';

// ── Types ──────────────────────────────────────────────────────────

export interface SegmentEvent {
  chapter: number;
  slide: number;
  segmentIndex: number;
  segmentId: string;
  videoTime: number; // seconds since recording started
}

/** A word with video-absolute timestamps (ready for VTT generation). */
export interface VideoWord {
  word: string;      // display form (corrected spelling for subtitles)
  ttsWord?: string;  // TTS form (only present when different from display)
  start: number;     // video time (seconds)
  end: number;       // video time (seconds)
}

/**
 * Correct a TTS word for subtitle display using a corrections map.
 * Preserves trailing punctuation from the original.
 */
function correctWord(ttsWord: string, corrections: Record<string, string>): { display: string; corrected: boolean } {
  if (Object.keys(corrections).length === 0) return { display: ttsWord, corrected: false };
  // Separate trailing punctuation
  const match = ttsWord.match(/^(.+?)([.!?,;:\u2014]*)$/);
  if (!match) return { display: ttsWord, corrected: false };
  const [, core, punct] = match;
  const correction = corrections[core.toLowerCase()];
  if (correction) {
    return { display: correction + punct, corrected: true };
  }
  return { display: ttsWord, corrected: false };
}

/** A segment with words mapped to video time. */
export interface VideoSegment {
  chapter: number;
  slide: number;
  segmentIndex: number;
  segmentId: string;
  videoTime: number;
  words: VideoWord[];
}

/** The intermediate words file — everything needed to regenerate VTT. */
export interface VideoWordsData {
  demoId: string;
  recordedAt: string;
  segments: VideoSegment[];
}

interface VttCue {
  start: number;
  end: number;
  words: VideoWord[];
}

// ── Helpers ────────────────────────────────────────────────────────

function formatVttTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`;
}

// ── Words data generation ──────────────────────────────────────────

/**
 * Build the intermediate words data from segment events + alignment.
 * Each word gets video-absolute start/end timestamps.
 */
export function buildVideoWordsData(
  demoId: string,
  segmentEvents: SegmentEvent[],
): VideoWordsData {
  const alignment = loadAlignmentData(demoId);
  if (!alignment) {
    console.warn(`  No alignment.json found for "${demoId}". Run: npm run tts:align -- --demo ${demoId}`);
  }

  const corrections = loadSubtitleCorrections(demoId);
  const correctionCount = Object.keys(corrections).length;
  if (correctionCount > 0) {
    console.log(`  Loaded ${correctionCount} subtitle corrections`);
  }

  const segments: VideoSegment[] = [];
  let alignedCount = 0;
  let missingCount = 0;

  for (const event of segmentEvents) {
    const coordKey = `c${event.chapter}_s${event.slide}`;
    const segAlignment = alignment?.slides[coordKey]
      ?.segments.find(s => s.segmentId === event.segmentId);

    const words: VideoWord[] = [];
    if (segAlignment && segAlignment.words.length > 0) {
      for (const w of segAlignment.words) {
        const { display, corrected } = correctWord(w.word, corrections);
        const vw: VideoWord = {
          word: display,
          start: event.videoTime + w.start,
          end: event.videoTime + w.end,
        };
        if (corrected) vw.ttsWord = w.word;
        words.push(vw);
      }
      alignedCount++;
    } else {
      missingCount++;
    }

    segments.push({
      chapter: event.chapter,
      slide: event.slide,
      segmentIndex: event.segmentIndex,
      segmentId: event.segmentId,
      videoTime: event.videoTime,
      words,
    });
  }

  if (missingCount > 0) {
    console.warn(`  ${missingCount} of ${segmentEvents.length} segments have no alignment data`);
  }
  console.log(`  ${alignedCount} segments with word-level timestamps`);

  return {
    demoId,
    recordedAt: new Date().toISOString(),
    segments,
  };
}

// ── Cue grouping ───────────────────────────────────────────────────

const SENTENCE_END_RE = /[.!?]$/;
const CLAUSE_BREAK_RE = /[,;:\u2014]$/;
const MAX_CUE_WORDS = 12;
const MAX_CUE_DURATION = 5; // seconds

/**
 * Group words into cues, splitting at sentence/clause boundaries
 * and enforcing max word count and duration caps.
 */
function groupWordsIntoCues(words: VideoWord[]): VttCue[] {
  if (words.length === 0) return [];

  const cues: VttCue[] = [];
  let current: VideoWord[] = [];
  let cueStart = words[0].start;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    current.push(w);

    const isSentenceEnd = SENTENCE_END_RE.test(w.word);
    const isClauseBreak = CLAUSE_BREAK_RE.test(w.word);
    const duration = w.end - cueStart;
    const isLast = i === words.length - 1;
    const tooMany = current.length >= MAX_CUE_WORDS;

    if (isSentenceEnd || isLast || duration >= MAX_CUE_DURATION || (tooMany && isClauseBreak)) {
      cues.push({ start: cueStart, end: w.end, words: current });
      current = [];
      if (i < words.length - 1) {
        cueStart = words[i + 1].start;
      }
    }
  }

  // Force-split any oversized cues that had no clause breaks
  const result: VttCue[] = [];
  for (const cue of cues) {
    if (cue.words.length > MAX_CUE_WORDS) {
      for (let i = 0; i < cue.words.length; i += MAX_CUE_WORDS) {
        const chunk = cue.words.slice(i, i + MAX_CUE_WORDS);
        result.push({
          start: chunk[0].start,
          end: chunk[chunk.length - 1].end,
          words: chunk,
        });
      }
    } else {
      result.push(cue);
    }
  }

  return result;
}

// ── VTT generation ─────────────────────────────────────────────────

/**
 * Generate VTT content from a VideoWordsData structure.
 * Can be called with freshly built data or loaded from a `-words.json` file.
 *
 * @param wordTimestamps — When true (default), each word is prefixed with its
 *   start time (`<00:00:01.234>word`) for karaoke-style highlighting.
 *   When false, cues contain plain text only.
 */
export function generateVttFromWordsData(
  data: VideoWordsData,
  wordTimestamps: boolean = true,
): string {
  const allCues: VttCue[] = [];

  for (const segment of data.segments) {
    if (segment.words.length === 0) continue;
    allCues.push(...groupWordsIntoCues(segment.words));
  }

  const lines: string[] = ['WEBVTT', ''];

  for (const cue of allCues) {
    lines.push(`${formatVttTime(cue.start)} --> ${formatVttTime(cue.end)}`);
    const wordLine = wordTimestamps
      ? cue.words.map(w => `<${formatVttTime(w.start)}>${w.word}`).join(' ')
      : cue.words.map(w => w.word).join(' ');
    lines.push(wordLine);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Build words data from segment events + alignment, then generate VTT.
 * Returns the words data (for saving), per-word VTT, and clean (plain-text) VTT.
 */
export function generateVtt(
  demoId: string,
  segmentEvents: SegmentEvent[],
): { wordsData: VideoWordsData; vttContent: string; cleanVttContent: string } {
  const wordsData = buildVideoWordsData(demoId, segmentEvents);
  const vttContent = generateVttFromWordsData(wordsData);
  const cleanVttContent = generateVttFromWordsData(wordsData, false);
  return { wordsData, vttContent, cleanVttContent };
}

/**
 * Load a `-words.json` file and regenerate VTT from it.
 */
export function regenerateVttFromFile(wordsFilePath: string): string {
  const data: VideoWordsData = JSON.parse(fs.readFileSync(wordsFilePath, 'utf-8'));
  return generateVttFromWordsData(data);
}
