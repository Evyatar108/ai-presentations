# Narration API Reference

Complete reference for the narration backend API server.

**Last Updated**: January 21, 2025  
**Version**: 1.0  
**API Server**: Express.js on Node.js

---

## Base Configuration

**Base URL**: `http://localhost:3001`  
**Port**: 3001 (configurable via `NARRATION_API_PORT` environment variable)  
**Protocol**: HTTP (development only)  
**CORS**: Enabled for `http://localhost:5173` (Vite dev server)

### Starting the Server

```bash
# Start API server only
npm run narration-api

# Start both API server and dev server
npm run dev:full
```

**Server Output**:
```
Narration API server running on http://localhost:3001
```

---

## Authentication

**Current**: None (development environment)  
**Future**: Consider adding API keys for production deployments

---

## Endpoints

### 1. Health Check

Check if the API server is running and responding.

**Endpoint**: `GET /api/health`

**Request**: No parameters

**Response** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2025-01-21T10:30:00.000Z",
  "service": "narration-api",
  "version": "1.0.0"
}
```

**Example**:
```bash
curl http://localhost:3001/api/health
```

**Use Cases**:
- Verify API server is running
- Monitor service health
- Pre-flight check before operations

---

### 2. Save Narration

Write narration data to disk. Creates or overwrites the `narration.json` file for the specified demo.

**Endpoint**: `POST /api/narration/save`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "demoId": "meeting-highlights",
  "narrationData": {
    "demoId": "meeting-highlights",
    "version": "1.0",
    "lastModified": "2025-01-21T10:30:00Z",
    "instruct": "speak clearly with a professional tone",
    "slides": [
      {
        "chapter": 1,
        "slide": 1,
        "title": "What is Meeting Highlights",
        "segments": [
          {
            "id": "intro",
            "narrationText": "Meeting Highlights automatically generates...",
            "visualDescription": "Title slide",
            "notes": ""
          }
        ]
      }
    ]
  }
}
```

**Parameters**:
- `demoId` (string, required) - Demo identifier (e.g., "meeting-highlights")
- `narrationData` (object, required) - Complete narration data object
  - Must match narration JSON schema
  - `lastModified` field will be auto-updated

**Response** (200 OK):
```json
{
  "success": true,
  "filePath": "public/narration/meeting-highlights/narration.json",
  "timestamp": "2025-01-21T10:30:00.123Z"
}
```

**Response Fields**:
- `success` (boolean) - Operation success status
- `filePath` (string) - Relative path to saved file
- `timestamp` (string) - ISO 8601 timestamp of save operation

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Missing demoId or narrationData"
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "success": false,
  "error": "EACCES: permission denied, open 'public/narration/...'"
}
```

**Status Codes**:
- `200 OK` - Save successful
- `400 Bad Request` - Missing or invalid parameters
- `500 Internal Server Error` - File system error

**Example**:
```bash
curl -X POST http://localhost:3001/api/narration/save \
  -H "Content-Type: application/json" \
  -d '{
    "demoId": "meeting-highlights",
    "narrationData": { ... }
  }'
```

**JavaScript Example**:
```typescript
const response = await fetch('http://localhost:3001/api/narration/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    demoId: 'meeting-highlights',
    narrationData: updatedNarration
  })
});

const result = await response.json();
if (result.success) {
  console.log(`Saved to ${result.filePath}`);
}
```

**Behavior**:
- Creates `public/narration/{demoId}/` directory if missing
- Overwrites existing `narration.json` file
- Auto-updates `lastModified` timestamp
- Pretty-prints JSON with 2-space indentation

---

### 3. Update Narration Cache

Update the narration cache with new segment hash. Used to track changes and trigger TTS regeneration.

**Endpoint**: `POST /api/narration/update-cache`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "demoId": "meeting-highlights",
  "segment": {
    "key": "ch1:s1:0",
    "hash": "a1b2c3d4e5f6789...",
    "timestamp": "2025-01-21T10:30:00Z"
  }
}
```

**Parameters**:
- `demoId` (string, required) - Demo identifier
- `segment` (object, required) - Segment cache entry
  - `key` (string) - Segment key format: `ch{chapter}:s{slide}:{segmentId}`
  - `hash` (string) - SHA-256 hash of narration text
  - `timestamp` (string) - ISO 8601 timestamp

**Response** (200 OK):
```json
{
  "success": true
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Missing demoId or segment"
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "success": false,
  "error": "ENOENT: no such file or directory..."
}
```

**Status Codes**:
- `200 OK` - Cache updated
- `400 Bad Request` - Missing parameters
- `500 Internal Server Error` - File system error

**Example**:
```bash
curl -X POST http://localhost:3001/api/narration/update-cache \
  -H "Content-Type: application/json" \
  -d '{
    "demoId": "meeting-highlights",
    "segment": {
      "key": "ch1:s1:0",
      "hash": "abc123...",
      "timestamp": "2025-01-21T10:30:00Z"
    }
  }'
```

**Behavior**:
- Loads existing `narration-cache.json` or creates new
- Updates specified segment hash
- Updates `generatedAt` timestamp
- Preserves other segment hashes
- Pretty-prints JSON with 2-space indentation

---

### 4. Regenerate Audio (Single Segment)

Regenerate TTS audio for a single segment. Calls TTS server to generate new audio file.

**Endpoint**: `POST /api/narration/regenerate-audio`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "demoId": "meeting-highlights",
  "chapter": 1,
  "slide": 2,
  "segmentId": "intro",
  "narrationText": "New narration text here...",
  "instruct": "speak slowly and clearly"
}
```

**Parameters**:
- `demoId` (string, required) - Demo identifier
- `chapter` (number, required) - Chapter number
- `slide` (number, required) - Slide number
- `segmentId` (string, required) - Segment identifier
- `narrationText` (string, required) - Updated narration text
- `instruct` (string, optional) - TTS style/tone instruction (e.g., "speak slowly and clearly"). Passed to the TTS server for engines that support it (Qwen3-TTS).

**Response** (200 OK):
```json
{
  "success": true,
  "audioPath": "/audio/meeting-highlights/c1/s2_segment_01_intro.wav",
  "timestamp": 1642766400000,
  "duration": 5.234
}
```

**Response Fields**:
- `success` (boolean) - Operation success
- `audioPath` (string) - Public path to generated audio file
- `timestamp` (number) - Unix timestamp (ms)
- `duration` (number) - Audio duration in seconds

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Missing required parameters"
}
```

**Error Response** (503 Service Unavailable):
```json
{
  "success": false,
  "error": "TTS server unavailable at http://localhost:5000"
}
```

**Status Codes**:
- `200 OK` - Audio generated successfully
- `400 Bad Request` - Missing parameters
- `503 Service Unavailable` - TTS server not running

**Example**:
```bash
curl -X POST http://localhost:3001/api/narration/regenerate-audio \
  -H "Content-Type: application/json" \
  -d '{
    "demoId": "meeting-highlights",
    "chapter": 1,
    "slide": 2,
    "segmentId": "intro",
    "narrationText": "Updated narration..."
  }'
```

**Behavior**:
- Calls TTS server to generate audio
- Saves WAV file to `public/audio/{demoId}/c{chapter}/`
- Updates TTS cache
- Updates narration cache
- Returns audio metadata

**Requirements**:
- TTS server must be running on port 5000
- See [`TTS_GUIDE.md`](../../docs/TTS_GUIDE.md) for TTS server setup

---

## Error Handling

### Common Error Codes

| Status Code | Meaning | Common Causes |
|-------------|---------|---------------|
| 400 | Bad Request | Missing parameters, invalid JSON |
| 403 | Forbidden | File permission issues |
| 404 | Not Found | Demo directory doesn't exist |
| 500 | Internal Server Error | File system errors, unexpected exceptions |
| 503 | Service Unavailable | TTS server not running |

### Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

### Client-Side Error Handling

**Example**:
```typescript
try {
  const response = await fetch('http://localhost:3001/api/narration/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const result = await response.json();
  
  if (!result.success) {
    console.error('API Error:', result.error);
    // Show error toast to user
    return;
  }
  
  // Success handling
  console.log('Saved successfully');
  
} catch (error) {
  console.error('Network Error:', error);
  // Show network error toast
}
```

---

## CORS Configuration

The API server enables CORS for the Vite dev server:

```javascript
// server/narration-api.cjs
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',  // Vite dev server
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
```

**Allowed Origins**:
- `http://localhost:5173` (Vite dev server)

**Allowed Methods**:
- GET
- POST

**Note**: For production, configure CORS with appropriate origins.

---

## Rate Limiting

**Current**: No rate limiting (development environment)

**Future Considerations**:
- Implement rate limiting for production
- Suggested: 100 requests/minute per client
- Use `express-rate-limit` package

---

## File System Operations

### Directory Structure

```
public/narration/
├── meeting-highlights/
│   ├── narration.json        # Narration data
│   └── narration-cache.json  # Change tracking
├── example-demo-1/
│   └── narration.json
└── example-demo-2/
    └── narration.json
```

### File Permissions

**Requirements**:
- Read/write access to `public/narration/` directory
- Directory auto-creation with `{ recursive: true }`
- JSON files saved with 2-space indentation

**Common Issues**:
- Permission denied (EACCES) - Check directory permissions
- No space left (ENOSPC) - Check disk space
- Path too long (ENAMETOOLONG) - Shorten file paths

---

## Performance Considerations

### Save Operation

- **Average Time**: 50-300ms
- **Depends On**: File size, disk speed
- **Optimization**: Async file operations (non-blocking)

### Cache Update

- **Average Time**: 20-100ms
- **Depends On**: Existing cache size
- **Optimization**: Incremental updates (single segment)

### Audio Regeneration

- **Average Time**: 2-10 seconds
- **Depends On**: Narration length, TTS server load
- **Optimization**: Queue multiple requests

---

## Testing

### Manual Testing

**Health Check**:
```bash
curl http://localhost:3001/api/health
```

**Save Narration**:
```bash
curl -X POST http://localhost:3001/api/narration/save \
  -H "Content-Type: application/json" \
  -d @test-narration.json
```

**Update Cache**:
```bash
curl -X POST http://localhost:3001/api/narration/update-cache \
  -H "Content-Type: application/json" \
  -d '{
    "demoId": "test-demo",
    "segment": {
      "key": "ch1:s1:0",
      "hash": "test123",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }
  }'
```

### Automated Testing

See [`PHASE_8_TEST_RESULTS.md`](PHASE_8_TEST_RESULTS.md) for comprehensive test coverage:
- 7 API endpoint tests (100% pass rate)
- Error handling validation
- CORS verification
- Performance benchmarks

---

## Security Considerations

### Current (Development)

- ❌ No authentication
- ❌ No rate limiting
- ❌ No input validation beyond basic checks
- ✅ CORS restricted to localhost

### Production Recommendations

- ✅ Add API key authentication
- ✅ Implement rate limiting
- ✅ Validate all input thoroughly
- ✅ Use HTTPS only
- ✅ Sanitize file paths
- ✅ Log all operations

---

## Troubleshooting

### API Server Won't Start

**Error**: `EADDRINUSE: port 3001 already in use`

**Solution**:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### CORS Errors

**Error**: `Access to fetch blocked by CORS policy`

**Solution**:
- Verify dev server is on `localhost:5173`
- Check CORS configuration in `server/narration-api.cjs`
- Restart API server after changes

### File Permission Errors

**Error**: `EACCES: permission denied`

**Solution**:
```bash
# Check permissions
ls -la public/narration/

# Fix permissions (Linux/Mac)
chmod -R 755 public/narration/

# Fix permissions (Windows)
# Right-click folder → Properties → Security → Edit
```

### More Help

See [`NARRATION_TROUBLESHOOTING.md`](NARRATION_TROUBLESHOOTING.md) for complete troubleshooting guide.

---

## Related Documentation

- **[User Guide](NARRATION_SYSTEM_GUIDE.md)** - Complete usage documentation
- **[Troubleshooting](NARRATION_TROUBLESHOOTING.md)** - Common issues and solutions
- **[Implementation Plan](NARRATION_EXTERNALIZATION_PLAN.md)** - System architecture
- **[Test Results](PHASE_8_TEST_RESULTS.md)** - API test coverage

---

**Document Version**: 1.0  
**Last Updated**: January 21, 2025  
**API Version**: 1.0.0  
**Maintained By**: React COGS Demo Team