/**
 * TTS Client for browser-side audio regeneration
 * Handles communication with remote TTS server and local Vite file-writing endpoint
 */

interface TTSConfig {
  remoteTTSServerUrl: string;
  localSaveEndpoint: string;
}

interface RegenerateSegmentParams {
  demoId: string;
  chapter: number;
  slide: number;
  segmentIndex: number;
  segmentId: string;
  narrationText: string;
  addPauses?: boolean; // Optional flag to add " Amazing." or ". Amazing." at the end
  instruct?: string;   // Optional tone/style instruction (e.g. "speak slowly and clearly")
}

interface RegenerateResult {
  success: boolean;
  filePath?: string;
  timestamp?: number;
  error?: string;
}

interface TTSServerHealthResponse {
  available: boolean;
  modelLoaded?: boolean;
  gpuName?: string;
  error?: string;
}

export interface GenerateTtsPreviewParams {
  narrationText: string;
  addPauses?: boolean;
  instruct?: string;
}

export interface GenerateTtsPreviewResult {
  base64: string;
}

export interface SaveGeneratedAudioParams {
  demoId: string;
  chapter: number;
  slide: number;
  segmentIndex: number;
  segmentId: string;
  narrationText: string;
  audioBase64: string;
  instruct?: string;
}

export interface SaveGeneratedAudioResult {
  filePath: string;
  timestamp: number;
}

// Cache for config to avoid repeated fetches
let cachedConfig: TTSConfig | null = null;

/**
 * Load TTS configuration from tts/server_config.json (same as CLI tools)
 * Falls back to localhost if config file doesn't exist
 */
async function loadConfig(): Promise<TTSConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    // Try to load from the same config file used by tts/generate-tts.ts
    const response = await fetch('/server_config.json');
    if (!response.ok) {
      throw new Error('Config file not found');
    }

    const config = await response.json();
    cachedConfig = {
      remoteTTSServerUrl: config.server_url || 'http://localhost:5000',
      localSaveEndpoint: '/api/save-audio'
    };

    console.log('[TTS] Loaded config from server_config.json:', cachedConfig);
    return cachedConfig;
  } catch (error) {
    console.warn('[TTS] Failed to load server_config.json, using localhost default');
    cachedConfig = {
      remoteTTSServerUrl: 'http://localhost:5000',
      localSaveEndpoint: '/api/save-audio'
    };
    return cachedConfig;
  }
}

/**
 * Check if remote TTS server is available and healthy
 */
export async function checkTTSServerHealth(): Promise<TTSServerHealthResponse> {
  const config = await loadConfig();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${config.remoteTTSServerUrl}/health`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        available: false,
        error: `Server returned ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();
    return {
      available: true,
      modelLoaded: data.model_loaded,
      gpuName: data.gpu_name
    };

  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        available: false,
        error: `Timeout: Cannot reach TTS server at ${config.remoteTTSServerUrl}`
      };
    }

    return {
      available: false,
      error: `Cannot reach TTS server at ${config.remoteTTSServerUrl}: ${error.message}`
    };
  }
}

/**
 * Generate a TTS preview (base64 audio) without saving to disk.
 * Calls the remote TTS server's /generate_batch endpoint.
 */
export async function generateTtsPreview(
  params: GenerateTtsPreviewParams
): Promise<GenerateTtsPreviewResult> {
  const config = await loadConfig();

  const ttsResponse = await fetch(
    `${config.remoteTTSServerUrl}/generate_batch`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts: [
          `Speaker 0: ${params.narrationText}${params.addPauses !== false ? (params.narrationText.trim().endsWith('.') ? ' Amazing.' : '. Amazing.') : ''}`,
        ],
        ...(params.instruct ? { instruct: params.instruct } : {}),
      }),
      signal: AbortSignal.timeout(1800000) // 30 minute timeout
    }
  );

  if (!ttsResponse.ok) {
    throw new Error(`TTS server error: ${ttsResponse.status} ${ttsResponse.statusText}`);
  }

  const ttsData = await ttsResponse.json();

  if (!ttsData.success) {
    throw new Error(ttsData.error || 'TTS generation failed');
  }

  if (!ttsData.audios || ttsData.audios.length === 0) {
    throw new Error('No audio data received from server');
  }

  return { base64: ttsData.audios[0] };
}

export interface GenerateTtsBatchItem {
  narrationText: string;
  addPauses?: boolean;
  instruct?: string;
}

/**
 * Generate TTS for multiple texts in a single batch call.
 * Supports per-item instructs via the `instructs` array.
 * Returns base64 audio in the same order as the input texts.
 */
export async function generateTtsBatch(
  items: GenerateTtsBatchItem[],
): Promise<string[]> {
  const config = await loadConfig();

  const texts = items.map(item => {
    const addPauses = item.addPauses !== false;
    const suffix = addPauses
      ? (item.narrationText.trim().endsWith('.') ? ' Amazing.' : '. Amazing.')
      : '';
    return `Speaker 0: ${item.narrationText}${suffix}`;
  });

  const instructs = items.map(item => item.instruct || '');
  const hasAnyInstruct = instructs.some(i => i.length > 0);

  const ttsResponse = await fetch(
    `${config.remoteTTSServerUrl}/generate_batch`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts,
        batch: true,
        ...(hasAnyInstruct ? { instructs } : {}),
      }),
      signal: AbortSignal.timeout(1800000) // 30 minute timeout
    }
  );

  if (!ttsResponse.ok) {
    throw new Error(`TTS server error: ${ttsResponse.status} ${ttsResponse.statusText}`);
  }

  const ttsData = await ttsResponse.json();

  if (!ttsData.success) {
    throw new Error(ttsData.error || 'TTS batch generation failed');
  }

  if (!ttsData.audios || ttsData.audios.length !== items.length) {
    throw new Error(`Expected ${items.length} audios, got ${ttsData.audios?.length ?? 0}`);
  }

  return ttsData.audios;
}

/**
 * Save base64 audio to disk via the Vite plugin endpoint.
 * Returns the file path and a cache-busting timestamp.
 */
export async function saveGeneratedAudio(
  params: SaveGeneratedAudioParams
): Promise<SaveGeneratedAudioResult> {
  const config = await loadConfig();
  const { buildAudioOutputPath } = await import('./audioPath');
  const outputPath = `${params.demoId}/${buildAudioOutputPath(params.chapter, params.slide, params.segmentIndex, params.segmentId)}`;

  const saveResponse = await fetch(config.localSaveEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audioBase64: params.audioBase64,
      outputPath,
      narrationText: params.narrationText,
      chapter: params.chapter,
      slide: params.slide,
      segmentId: params.segmentId,
      ...(params.instruct ? { instruct: params.instruct } : {}),
    })
  });

  if (!saveResponse.ok) {
    throw new Error(`Save failed: ${saveResponse.status} ${saveResponse.statusText}`);
  }

  const saveData = await saveResponse.json();

  if (!saveData.success) {
    throw new Error(saveData.error || 'Failed to save audio file');
  }

  return {
    filePath: saveData.filePath,
    timestamp: saveData.timestamp
  };
}

/**
 * Regenerate audio for a single segment
 *
 * Process:
 * 1. Call remote TTS server to generate audio
 * 2. Receive base64-encoded audio
 * 3. Save to local filesystem via Vite plugin endpoint
 * 4. Update local cache
 * 5. Return success with new file path
 */
export async function regenerateSegment(
  params: RegenerateSegmentParams
): Promise<RegenerateResult> {
  const config = await loadConfig();

  console.log(`[TTS] Regenerating segment: Ch${params.chapter}/S${params.slide} - ${params.segmentId}`);
  console.log(`[TTS] Narration: "${params.narrationText.substring(0, 50)}..."`);

  try {
    // Step 1: Generate TTS preview
    console.log(`[TTS] Calling remote server: ${config.remoteTTSServerUrl}/generate_batch`);
    const preview = await generateTtsPreview({
      narrationText: params.narrationText,
      addPauses: params.addPauses,
      instruct: params.instruct,
    });

    console.log(`[TTS] Received audio data: ${preview.base64.length} characters (base64)`);

    // Step 2: Save to disk
    console.log(`[TTS] Saving audio locally via: ${config.localSaveEndpoint}`);
    const saved = await saveGeneratedAudio({
      demoId: params.demoId,
      chapter: params.chapter,
      slide: params.slide,
      segmentIndex: params.segmentIndex,
      segmentId: params.segmentId,
      narrationText: params.narrationText,
      audioBase64: preview.base64,
      instruct: params.instruct,
    });

    console.log(`[TTS] Audio saved successfully: ${saved.filePath}`);
    console.log(`[TTS] Timestamp: ${saved.timestamp}`);

    return {
      success: true,
      filePath: saved.filePath,
      timestamp: saved.timestamp
    };

  } catch (error: any) {
    console.error('[TTS] Regeneration error:', error);

    // Provide more helpful error messages
    let errorMessage = error.message || 'Unknown error occurred';

    if (error.name === 'TypeError' && errorMessage.includes('fetch')) {
      errorMessage = `Cannot connect to TTS server at ${config.remoteTTSServerUrl}. Please check:\n` +
                    `1. TTS server is running on the remote machine\n` +
                    `2. Server URL in public/tts-config.json is correct\n` +
                    `3. Firewall allows connections to port 5000\n` +
                    `4. Network connectivity between machines`;
    } else if (error.name === 'AbortError') {
      errorMessage = 'Request timed out (60s). TTS generation took too long or server is not responding.';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Clear cached config (useful for testing or when config changes)
 */
export function clearConfigCache(): void {
  cachedConfig = null;
  console.log('[TTS] Config cache cleared');
}
