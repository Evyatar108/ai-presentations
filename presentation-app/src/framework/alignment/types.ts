/** Word-level timing from WhisperX forced alignment */
export interface AlignedWord {
  word: string;
  start: number;
  end: number;
  score: number;
}

/** A resolved marker — maps a {#id} or {id#} to an absolute timestamp */
export interface ResolvedMarker {
  id: string;
  time: number;
  anchor: 'start' | 'end';
  wordIndex: number;
}

/** Alignment data for a single audio segment */
export interface SegmentAlignment {
  segmentId: string;
  audioHash: string;
  words: AlignedWord[];
  markers: ResolvedMarker[];
}

/** Complete alignment data for a demo */
export interface DemoAlignment {
  demoId: string;
  generatedAt: string;
  slides: Record<string, {
    chapter: number;
    slide: number;
    segments: SegmentAlignment[];
  }>;
}
