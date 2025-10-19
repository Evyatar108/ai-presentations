/**
 * TTS Client for browser-side audio regeneration
 * Handles communication with remote TTS server and local Vite file-writing endpoint
 */

interface TTSConfig {
  remoteTTSServerUrl: string;
  localSaveEndpoint: string;
}

interface RegenerateSegmentParams {
  chapter: number;
  slide: number;
  segmentIndex: number;
  segmentId: string;
  narrationText: string;
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

// Cache for config to avoid repeated fetches
let cachedConfig: TTSConfig | null = null;

/**
 * Load TTS configuration from public/tts-config.json
 * Falls back to localhost if config file doesn't exist
 */
async function loadConfig(): Promise<TTSConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const response = await fetch('/tts-config.json');
    if (!response.ok) {
      throw new Error('Config file not found');
    }
    
    const config = await response.json();
    cachedConfig = {
      remoteTTSServerUrl: config.remoteTTSServerUrl || 'http://localhost:5000',
      localSaveEndpoint: '/api/save-audio'
    };
    
    console.log('[TTS] Loaded config:', cachedConfig);
    return cachedConfig;
  } catch (error) {
    console.warn('[TTS] Failed to load config, using defaults');
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
    // Step 1: Call remote TTS server to generate audio
    console.log(`[TTS] Calling remote server: ${config.remoteTTSServerUrl}/generate_batch`);
    
    const ttsResponse = await fetch(
      `${config.remoteTTSServerUrl}/generate_batch`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          texts: [`Speaker 0: ${params.narrationText}`]
        })
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
    
    const audioBase64 = ttsData.audios[0];
    console.log(`[TTS] Received audio data: ${audioBase64.length} characters (base64)`);
    
    // Step 2: Save to local filesystem via Vite plugin
    console.log(`[TTS] Saving audio locally via: ${config.localSaveEndpoint}`);
    
    const filename = `s${params.slide}_segment_${String(params.segmentIndex + 1).padStart(2, '0')}_${params.segmentId}.wav`;
    const outputPath = `c${params.chapter}/${filename}`;
    
    const saveResponse = await fetch(config.localSaveEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audioBase64,
        outputPath,
        narrationText: params.narrationText,
        chapter: params.chapter,
        slide: params.slide,
        segmentId: params.segmentId
      })
    });
    
    if (!saveResponse.ok) {
      throw new Error(`Save failed: ${saveResponse.status} ${saveResponse.statusText}`);
    }
    
    const saveData = await saveResponse.json();
    
    if (!saveData.success) {
      throw new Error(saveData.error || 'Failed to save audio file');
    }
    
    console.log(`[TTS] Audio saved successfully: ${saveData.filePath}`);
    console.log(`[TTS] Timestamp: ${saveData.timestamp}`);
    
    return {
      success: true,
      filePath: saveData.filePath,
      timestamp: saveData.timestamp
    };
    
  } catch (error: any) {
    console.error('[TTS] Regeneration error:', error);
    
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
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