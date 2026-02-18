import { Plugin } from 'vite';
import * as fs from 'fs';
import * as path from 'path';

interface SaveAudioRequest {
  audioBase64: string;
  outputPath: string;      // e.g., "c2/s1_segment_01_intro.wav"
  narrationText: string;
  chapter: number;
  slide: number;
  segmentId: string;
}

interface SaveAudioResponse {
  success: boolean;
  filePath?: string;
  timestamp?: number;
  error?: string;
}

/**
 * Vite plugin that adds a local file-writing endpoint for TTS audio files.
 * This allows the browser to save regenerated audio to disk via the dev server.
 */
export function audioWriterPlugin(): Plugin {
  return {
    name: 'audio-writer',
    
    // Copy server_config.json to public/ on dev server start
    configResolved() {
      const projectRoot = process.cwd();
      const sourceConfig = path.join(projectRoot, '..', 'tts', 'server_config.json');
      const destConfig = path.join(projectRoot, 'public', 'server_config.json');
      
      try {
        if (fs.existsSync(sourceConfig)) {
          fs.copyFileSync(sourceConfig, destConfig);
          console.log('[audio-writer] Copied tts/server_config.json to public/');
        } else {
          console.warn('[audio-writer] Warning: tts/server_config.json not found');
        }
      } catch (error: any) {
        console.error('[audio-writer] Failed to copy server_config.json:', error.message);
      }
    },
    
    configureServer(server) {
      server.middlewares.use('/api/save-audio', async (req, res) => {
        // Only allow POST requests
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const data: SaveAudioRequest = JSON.parse(body);
            
            // Validate required fields
            if (!data.audioBase64 || !data.outputPath || !data.narrationText) {
              throw new Error('Missing required fields: audioBase64, outputPath, or narrationText');
            }

            // Get project root (where vite.config.ts is)
            const projectRoot = process.cwd();
            
            // Construct paths
            const publicAudioDir = path.join(projectRoot, 'public', 'audio');
            const fullOutputPath = path.join(publicAudioDir, data.outputPath);
            
            // Security: Ensure output path is within public/audio/
            const normalizedOutput = path.normalize(fullOutputPath);
            const normalizedBase = path.normalize(publicAudioDir);
            
            if (!normalizedOutput.startsWith(normalizedBase)) {
              throw new Error('Invalid output path: must be within public/audio/');
            }
            
            // Security: Only allow .wav files
            if (!data.outputPath.endsWith('.wav')) {
              throw new Error('Invalid file extension: only .wav files allowed');
            }
            
            // Create directory if it doesn't exist
            const outputDir = path.dirname(fullOutputPath);
            if (!fs.existsSync(outputDir)) {
              fs.mkdirSync(outputDir, { recursive: true });
            }
            
            // Write audio file
            const audioBuffer = Buffer.from(data.audioBase64, 'base64');
            fs.writeFileSync(fullOutputPath, audioBuffer);
            
            console.log(`[audio-writer] Saved audio file: ${data.outputPath} (${audioBuffer.length} bytes)`);
            
            // Update cache file
            const cacheFile = path.join(projectRoot, '.tts-narration-cache.json');
            let cache: Record<string, any> = {};
            
            if (fs.existsSync(cacheFile)) {
              try {
                const cacheContent = fs.readFileSync(cacheFile, 'utf-8');
                cache = JSON.parse(cacheContent);
              } catch (error) {
                console.warn('[audio-writer] Failed to parse cache file, creating new cache');
                cache = {};
              }
            }
            
            // Update cache entry (use forward slashes for consistency)
            const cacheKey = data.outputPath.replace(/\\/g, '/');
            cache[cacheKey] = {
              narrationText: data.narrationText,
              generatedAt: new Date().toISOString()
            };
            
            fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
            
            console.log(`[audio-writer] Updated cache entry: ${cacheKey}`);
            
            // Success response
            const response: SaveAudioResponse = {
              success: true,
              filePath: data.outputPath,
              timestamp: Date.now()
            };
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(response));
            
          } catch (error: any) {
            console.error('[audio-writer] Error:', error);
            
            const response: SaveAudioResponse = {
              success: false,
              error: error.message || 'Unknown error occurred'
            };
            
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(response));
          }
        });
      });
    }
  };
}