import type { IncomingMessage, ServerResponse } from 'http';

// ─── Request / Response Interfaces ─────────────────────────────────────────

export interface SaveAudioRequest {
  audioBase64: string;
  outputPath: string;      // e.g., "c2/s1_segment_01_intro.wav"
  narrationText: string;
  chapter: number;
  slide: number;
  segmentId: string;
}

export interface SaveAudioResponse {
  success: boolean;
  filePath?: string;
  timestamp?: number;
  error?: string;
}

// ─── Middleware Types ──────────────────────────────────────────────────────

export type NextFunction = () => void;

export type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: NextFunction,
) => void | Promise<void>;

/** Context passed from the main plugin to every handler group. */
export interface HandlerContext {
  projectRoot: string;
}

// ─── Shared Helpers ────────────────────────────────────────────────────────

/** Read full JSON body from an IncomingMessage. */
export function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

/** Send a JSON response. */
export function sendJson(res: ServerResponse, statusCode: number, data: Record<string, unknown>) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

/** Parse query string from a URL. */
export function parseQuery(url: string): Record<string, string> {
  const idx = url.indexOf('?');
  if (idx === -1) return {};
  const params: Record<string, string> = {};
  for (const part of url.slice(idx + 1).split('&')) {
    const [k, v] = part.split('=');
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
  }
  return params;
}
