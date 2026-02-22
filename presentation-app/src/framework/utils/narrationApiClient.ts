/**
 * Narration API Client
 * 
 * Provides type-safe wrapper functions for backend API calls.
 * Handles errors, retries, and graceful degradation when API is unavailable.
 */

import { NarrationData } from './narrationLoader';
import { getConfig } from '../config';

const getApiBaseUrl = () => getConfig().narrationApiBaseUrl;

/**
 * Request interface for saving narration data
 */
export interface SaveNarrationRequest {
  demoId: string;
  narrationData: NarrationData;
}

/**
 * Response interface for save operation
 */
export interface SaveNarrationResponse {
  success: boolean;
  filePath?: string;
  timestamp?: string;
  error?: string;
}

/**
 * Request interface for updating narration cache
 */
export interface UpdateCacheRequest {
  demoId: string;
  segment: {
    key: string;
    hash: string;
    timestamp: string;
  };
}

/**
 * Response interface for cache update operation
 */
export interface UpdateCacheResponse {
  success: boolean;
  error?: string;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  service: string;
  version: string;
  narrationDir: string;
}

/**
 * Check if backend API is available.
 * Uses a short timeout to avoid blocking the UI.
 * 
 * @returns Promise resolving to true if API is healthy, false otherwise
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout
    
    const response = await fetch(`${getApiBaseUrl()}/api/health`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn('[NarrationAPI] Health check returned non-OK status:', response.status);
      return false;
    }
    
    const data = await response.json() as HealthCheckResponse;
    console.log('[NarrationAPI] Health check passed:', data.service, data.version);
    return true;
    
  } catch (error) {
    // Timeout or network error
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn('[NarrationAPI] Health check timed out (API not responding)');
      } else {
        console.warn('[NarrationAPI] Health check failed:', error.message);
      }
    }
    return false;
  }
}

/**
 * Save narration data to disk via backend API.
 * 
 * @param request - Save request with demoId and narration data
 * @returns Promise resolving to save response
 * @throws Error if save fails
 */
export async function saveNarrationToFile(
  request: SaveNarrationRequest
): Promise<SaveNarrationResponse> {
  try {
    console.log('[NarrationAPI] Saving narration for demo:', request.demoId);
    
    const response = await fetch(`${getApiBaseUrl()}/api/narration/save`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Failed to parse error response, use default message
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json() as SaveNarrationResponse;
    
    if (!result.success) {
      throw new Error(result.error || 'Save failed (unknown reason)');
    }
    
    console.log('[NarrationAPI] Save successful:', result.filePath);
    return result;
    
  } catch (error) {
    console.error('[NarrationAPI] Save failed:', error);
    throw error;
  }
}

/**
 * Update narration cache for a specific segment via backend API.
 * This should be called after TTS regeneration to update the hash.
 * 
 * @param request - Cache update request with demoId and segment info
 * @returns Promise resolving to cache update response
 * @throws Error if update fails
 */
export async function updateNarrationCache(
  request: UpdateCacheRequest
): Promise<UpdateCacheResponse> {
  try {
    console.log('[NarrationAPI] Updating cache for segment:', request.segment.key);
    
    const response = await fetch(`${getApiBaseUrl()}/api/narration/update-cache`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Failed to parse error response, use default message
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json() as UpdateCacheResponse;
    
    if (!result.success) {
      throw new Error(result.error || 'Cache update failed (unknown reason)');
    }
    
    console.log('[NarrationAPI] Cache update successful');
    return result;
    
  } catch (error) {
    console.error('[NarrationAPI] Cache update failed:', error);
    throw error;
  }
}

/**
 * Trigger re-alignment for a specific segment via the Vite plugin.
 * Shells out to `generate-alignment.ts` on the server side.
 *
 * @param params - Segment coordinates
 * @returns Promise resolving to success/error
 */
export async function realignSegment(params: {
  demoId: string; chapter: number; slide: number; segmentId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[NarrationAPI] Realigning segment:', `ch${params.chapter}:s${params.slide}:${params.segmentId}`);

    const response = await fetch(`${getApiBaseUrl()}/api/narration/realign-segment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // use default
      }
      return { success: false, error: errorMessage };
    }

    const result = await response.json();
    if (!result.success) {
      return { success: false, error: result.error || 'Realignment failed' };
    }

    console.log('[NarrationAPI] Realignment successful');
    return { success: true };
  } catch (error) {
    console.error('[NarrationAPI] Realignment failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Helper to create a SHA-256 hash of text (matches backend implementation).
 * Used for cache validation.
 * 
 * @param text - Text to hash
 * @returns Promise resolving to hex-encoded hash
 */
export async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}