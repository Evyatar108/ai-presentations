/**
 * Marker parser for inline narration markers.
 *
 * Two anchor modes:
 *   {#id}  — resolves to the START time of the word immediately AFTER the marker
 *   {id#}  — resolves to the END time of the word immediately BEFORE the marker
 *
 * Example:
 *   "The {#pipeline}four-stage pipeline{done#} is fast."
 *   → cleanText: "The four-stage pipeline is fast."
 *   → markers: [
 *       { id: "pipeline", wordIndex: 1, anchor: "start" },   // start of "four-stage"
 *       { id: "done",     wordIndex: 2, anchor: "end" },     // end of "pipeline"
 *     ]
 */

export interface ParsedMarker {
  id: string;
  wordIndex: number;
  anchor: 'start' | 'end';
}

export interface ParseMarkersResult {
  cleanText: string;
  markers: ParsedMarker[];
}

// Forward anchor: {#id} — binds to start of next word
const FORWARD_MARKER_RE = /\{#([a-zA-Z0-9_-]+)\}/g;

// Backward anchor: {id#} — binds to end of previous word
const BACKWARD_MARKER_RE = /\{([a-zA-Z0-9_-]+)#\}/g;

// Combined pattern for stripping (both directions)
const ANY_MARKER_RE = /\{#?([a-zA-Z0-9_-]+)#?\}/g;

/**
 * Strip all markers from text, returning clean narration text.
 * Used by tts:generate to send clean text to the TTS server.
 */
export function stripMarkers(text: string): string {
  return text.replace(ANY_MARKER_RE, '').replace(/\s{2,}/g, ' ').trim();
}

/**
 * Parse markers from narration text, returning clean text and marker metadata.
 * Used by tts:align to know where markers sit relative to words.
 */
export function parseMarkers(text: string): ParseMarkersResult {
  const markers: ParsedMarker[] = [];

  // We process the text by scanning character-by-character, tracking:
  //  - how many words we've seen so far (to compute wordIndex)
  //  - where markers appear relative to words

  // Strategy: tokenize the text into an ordered list of "tokens" that are either
  // WORD or MARKER, then derive wordIndex from the word count at each marker position.

  interface WordToken { type: 'word'; text: string }
  interface MarkerToken { type: 'marker'; id: string; anchor: 'start' | 'end' }
  type Token = WordToken | MarkerToken;

  const tokens: Token[] = [];

  // Replace markers with sentinel characters to split, while recording marker positions
  let working = text;

  // First, find all marker occurrences with their positions in the original text
  interface MarkerOccurrence {
    index: number;
    length: number;
    id: string;
    anchor: 'start' | 'end';
  }

  const occurrences: MarkerOccurrence[] = [];

  // Find forward markers {#id}
  let match: RegExpExecArray | null;
  const fwdRe = /\{#([a-zA-Z0-9_-]+)\}/g;
  while ((match = fwdRe.exec(text)) !== null) {
    occurrences.push({
      index: match.index,
      length: match[0].length,
      id: match[1],
      anchor: 'start',
    });
  }

  // Find backward markers {id#}
  const bwdRe = /\{([a-zA-Z0-9_-]+)#\}/g;
  while ((match = bwdRe.exec(text)) !== null) {
    occurrences.push({
      index: match.index,
      length: match[0].length,
      id: match[1],
      anchor: 'end',
    });
  }

  // Sort by position in text
  occurrences.sort((a, b) => a.index - b.index);

  // Build token list: interleave text chunks and markers
  let cursor = 0;
  for (const occ of occurrences) {
    // Text before this marker
    const before = text.substring(cursor, occ.index);
    if (before.trim()) {
      // Split into words
      const words = before.trim().split(/\s+/);
      for (const w of words) {
        tokens.push({ type: 'word', text: w });
      }
    }
    tokens.push({ type: 'marker', id: occ.id, anchor: occ.anchor });
    cursor = occ.index + occ.length;
  }

  // Remaining text after last marker
  const remaining = text.substring(cursor);
  if (remaining.trim()) {
    const words = remaining.trim().split(/\s+/);
    for (const w of words) {
      tokens.push({ type: 'word', text: w });
    }
  }

  // Now walk tokens and resolve marker word indices
  let wordCount = 0;
  for (const token of tokens) {
    if (token.type === 'word') {
      wordCount++;
    } else {
      // Marker
      if (token.anchor === 'start') {
        // Forward anchor: binds to the NEXT word (current wordCount = index of next word)
        markers.push({ id: token.id, wordIndex: wordCount, anchor: 'start' });
      } else {
        // Backward anchor: binds to the PREVIOUS word
        markers.push({ id: token.id, wordIndex: wordCount - 1, anchor: 'end' });
      }
    }
  }

  // Build clean text from word tokens
  const cleanText = tokens
    .filter((t): t is WordToken => t.type === 'word')
    .map(t => t.text)
    .join(' ');

  return { cleanText, markers };
}

/**
 * Check if narration text contains any markers.
 */
export function hasMarkers(text: string): boolean {
  ANY_MARKER_RE.lastIndex = 0;
  return ANY_MARKER_RE.test(text);
}
