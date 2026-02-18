const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');

const app = express();

// Configuration
const NARRATION_DIR = path.join(__dirname, '../public/narration');
const PORT = process.env.NARRATION_API_PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Utilities
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

function hashText(text) {
  return crypto.createHash('sha256').update(text.trim()).digest('hex');
}

function validateNarrationData(narrationData) {
  if (!narrationData.demoId) {
    return { valid: false, error: 'Missing demoId' };
  }
  if (!narrationData.slides || !Array.isArray(narrationData.slides)) {
    return { valid: false, error: 'Missing or invalid slides array' };
  }
  return { valid: true };
}

// Endpoint 1: Save Narration
app.post('/api/narration/save', (req, res) => {
  try {
    const { demoId, narrationData } = req.body;
    
    // Validation
    if (!demoId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing demoId parameter' 
      });
    }
    
    if (!narrationData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing narrationData parameter' 
      });
    }
    
    const validation = validateNarrationData(narrationData);
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid narrationData: ${validation.error}` 
      });
    }
    
    // Ensure demo directory exists
    const demoDir = path.join(NARRATION_DIR, demoId);
    ensureDirectoryExists(demoDir);
    
    // Update timestamp
    narrationData.lastModified = new Date().toISOString();
    
    // Write to temporary file first (atomic write)
    const filePath = path.join(demoDir, 'narration.json');
    const tempPath = filePath + '.tmp';
    
    fs.writeFileSync(tempPath, JSON.stringify(narrationData, null, 2), 'utf-8');
    
    // Rename temp file to actual file (atomic operation)
    fs.renameSync(tempPath, filePath);
    
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    
    console.log(`✅ [Save] Saved narration for '${demoId}' to ${relativePath}`);
    
    res.json({
      success: true,
      filePath: relativePath.replace(/\\/g, '/'), // Normalize path separators
      timestamp: narrationData.lastModified
    });
    
  } catch (error) {
    console.error('[Save] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Endpoint 2: Update Cache
app.post('/api/narration/update-cache', (req, res) => {
  try {
    const { demoId, segment } = req.body;
    
    // Validation
    if (!demoId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing demoId parameter' 
      });
    }
    
    if (!segment || !segment.key || !segment.hash) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing or invalid segment parameter (requires key and hash)' 
      });
    }
    
    // Ensure demo directory exists
    const demoDir = path.join(NARRATION_DIR, demoId);
    ensureDirectoryExists(demoDir);
    
    const cacheFile = path.join(demoDir, 'narration-cache.json');
    
    // Load existing cache or create new one
    let cache = {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      segments: {}
    };
    
    if (fs.existsSync(cacheFile)) {
      try {
        const cacheContent = fs.readFileSync(cacheFile, 'utf-8');
        cache = JSON.parse(cacheContent);
      } catch (parseError) {
        console.warn(`[Cache] Failed to parse existing cache, creating new one: ${parseError.message}`);
      }
    }
    
    // Update segment hash
    cache.segments[segment.key] = {
      hash: segment.hash,
      lastChecked: segment.timestamp || new Date().toISOString()
    };
    cache.generatedAt = new Date().toISOString();
    
    // Write to temporary file first (atomic write)
    const tempPath = cacheFile + '.tmp';
    fs.writeFileSync(tempPath, JSON.stringify(cache, null, 2), 'utf-8');
    fs.renameSync(tempPath, cacheFile);
    
    console.log(`✅ [Cache] Updated cache for '${demoId}' segment '${segment.key}'`);
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('[Cache] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Endpoint 3: Regenerate Audio (Placeholder for Phase 6)
app.post('/api/narration/regenerate-audio', (req, res) => {
  try {
    const { demoId, chapter, slide, segmentId, narrationText } = req.body;
    
    // Validation
    if (!demoId || chapter === undefined || slide === undefined || !segmentId || !narrationText) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters (demoId, chapter, slide, segmentId, narrationText)' 
      });
    }
    
    // Placeholder response
    const audioPath = `/audio/${demoId}/c${chapter}/s${slide}_segment_${String(segmentId).padStart(2, '0')}.wav`;
    
    console.log(`⚠️  [Audio] Regenerate request for '${demoId}' ch${chapter}:s${slide}:${segmentId} (not implemented - Phase 6)`);
    
    res.json({
      success: true,
      audioPath,
      message: 'TTS regeneration will be implemented in Phase 6',
      implemented: false
    });
    
  } catch (error) {
    console.error('[Audio] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'narration-api',
    version: '1.0.0',
    narrationDir: NARRATION_DIR
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Narration API Server');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  ✅ Server running on http://localhost:${PORT}`);
  console.log(`  📁 Narration directory: ${NARRATION_DIR}`);
  console.log(`  🔗 CORS enabled for: http://localhost:5173`);
  console.log('');
  console.log('  Available endpoints:');
  console.log(`    GET  /api/health                 - Health check`);
  console.log(`    POST /api/narration/save         - Save narration.json`);
  console.log(`    POST /api/narration/update-cache - Update cache`);
  console.log(`    POST /api/narration/regenerate-audio - Regenerate TTS (Phase 6)`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
});