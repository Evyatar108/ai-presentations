/**
 * Standardized error handling for CLI scripts.
 *
 * Replaces inconsistent patterns (console.error + process.exit, console.error + return,
 * throw new Error, catch(error: any)) with a single approach.
 */

import axios from 'axios';

/** Format an error into a readable string, handling Axios errors specially. */
export function formatError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;
    const msg = typeof data === 'string' ? data : (data?.error ?? data?.message ?? error.message);
    return status ? `HTTP ${status}: ${msg}` : `Network error: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

/**
 * Handle a script-level error: log it and exit with non-zero code.
 * Use this as the top-level catch handler for script entry points.
 *
 * @example
 * ```ts
 * main().catch(err => handleScriptError(err, 'generate-tts'));
 * ```
 */
export function handleScriptError(error: unknown, scriptName: string): never {
  console.error(`\n[${scriptName}] Fatal error: ${formatError(error)}`);
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
}

/**
 * Log a non-fatal error during batch processing.
 * Returns the formatted message for further handling.
 */
export function logBatchError(error: unknown, context: string): string {
  const msg = formatError(error);
  console.error(`  [error] ${context}: ${msg}`);
  return msg;
}
