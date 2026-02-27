/**
 * TTS + WhisperX server URL loading from tts/server_config.json.
 *
 * Centralises the duplicated `loadServerConfig()` / `loadWhisperUrl()` helpers
 * that were previously copy-pasted across generate-tts.ts, generate-single-tts.ts,
 * generate-alignment.ts, and verify-tts.ts.
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_PATH = path.join(__dirname, '../../../tts/server_config.json');

function loadConfigField(field: string, fallback: string): string {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const configData = fs.readFileSync(CONFIG_PATH, 'utf-8');
      const config = JSON.parse(configData);
      if (config[field]) {
        return config[field];
      }
    }
  } catch (error: any) {
    console.warn(`Warning: Could not load server config: ${error.message}`);
  }
  return fallback;
}

/** Load the TTS server URL from `tts/server_config.json` (field: `server_url`). */
export function loadTtsServerUrl(): string {
  return loadConfigField('server_url', 'http://localhost:5000');
}

/** Load the WhisperX server URL from `tts/server_config.json` (field: `whisper_url`). */
export function loadWhisperUrl(): string {
  return loadConfigField('whisper_url', 'http://localhost:5001');
}

/** Load the API key from `tts/server_config.json` (field: `api_key`). */
export function loadApiKey(): string {
  return loadConfigField('api_key', '');
}
