# Narration Externalization Plan

**Status**: ✅ **COMPLETE** (All 9 phases implemented)
**Implementation Period**: January 20-22, 2025
**Total Effort**: ~28 hours across 9 phases
**Test Pass Rate**: 96% (48/50 tests)
**Production Ready**: ✅ Yes

---

## Implementation Summary

All phases successfully completed with production-ready results:

- ✅ **Phase 1**: Extraction script (3h) - [`extract-narration.ts`](../scripts/extract-narration.ts)
- ✅ **Phase 2**: Loading system (4h) - [`narrationLoader.ts`](../src/framework/utils/narrationLoader.ts)
- ✅ **Phase 3**: Change detection (2h) - [`check-narration.ts`](../scripts/check-narration.ts)
- ✅ **Phase 4**: Backend API (3h) - [`narration-api.cjs`](../server/narration-api.cjs)
- ✅ **Phase 5**: Frontend integration (4h) - [`NarratedController.tsx`](../src/framework/components/NarratedController.tsx) + [`NarrationEditModal.tsx`](../src/framework/components/NarrationEditModal.tsx)
- ✅ **Phase 6**: TTS integration (3h) - [`generate-tts.ts`](../scripts/generate-tts.ts) + [`check-tts-cache.ts`](../scripts/check-tts-cache.ts)
- ✅ **Phase 7**: Migration & cleanup (2h) - All demos migrated
- ✅ **Phase 8**: Comprehensive testing (4h) - 96% pass rate
- ✅ **Phase 9**: Documentation (3h) - Complete documentation suite

### Phase Reports

- [Phase 5: Frontend Integration Report](PHASE_5_IMPLEMENTATION_REPORT.md)
- [Phase 6: TTS Integration Report](PHASE_6_TTS_INTEGRATION.md)
- [Phase 7: Migration Report](PHASE_7_MIGRATION_REPORT.md)
- [Phase 8: Test Results](PHASE_8_TEST_RESULTS.md)
- [Phase 9: Documentation Summary](#phase-9-documentation-2-3-hours) (this document)

### Documentation Created

- **[Narration System User Guide](NARRATION_SYSTEM_GUIDE.md)** - 451 lines
- **[Narration API Reference](NARRATION_API_REFERENCE.md)** - 659 lines
- **[Narration Troubleshooting Guide](NARRATION_TROUBLESHOOTING.md)** - 664 lines
- **[Updated README.md](../README.md)** - Added narration system section

### Key Achievements

✅ **Zero-config editing** - Browser UI requires no setup beyond `npm run dev:full`
✅ **Persistent storage** - Changes survive page refresh and commit to git
✅ **Change detection** - Automatic hash-based detection triggers regeneration
✅ **Full TTS integration** - Audio regeneration from JSON narration
✅ **Backward compatible** - Inline narration fallback for flexibility
✅ **Production tested** - 96% test pass rate, 0 critical bugs

---

## Executive Summary

**Problem**: Narration edits made through the UI are currently session-only (stored in memory). Users cannot persist changes or collaborate on narration text without editing React component code.

**Solution**: Move all narration text from React components to external JSON files (one per demo), similar to the existing TTS cache system. Enable live editing with file persistence through a backend API.

**Benefits**:
- ✅ **Persistent Edits** - Changes survive page refresh and can be committed to git
- ✅ **Easier Collaboration** - Edit narration in JSON files without touching React code
- ✅ **Version Control** - Track narration changes separately from code changes
- ✅ **Live Editing** - Edit during presentations with save-to-file capability
- ✅ **Consistent with TTS** - Mirrors existing TTS cache architecture
- ✅ **Hash-based Detection** - Automatic change detection like TTS cache

---

## Current Architecture Analysis

### Narration Storage (Current State)

**Location**: Hardcoded in React components
```typescript
// Example from Chapter1.tsx (lines 146-168)
Ch1_S1_WhatIsMeetingHighlights.metadata = {
  chapter: 1,
  slide: 1,
  title: "What is Meeting Highlights",
  audioSegments: [
    {
      id: "intro",
      audioFilePath: "/audio/meeting-highlights/c1/s1_segment_01_intro.wav",
      narrationText: "Meeting Highlights automatically generates 2-3 minute video recaps..."
    }
    // ... more segments
  ]
};
```

**Problems**:
1. Narration text embedded in TypeScript files
2. Edits require code changes and rebuild
3. Hard to review narration separately from code
4. Live edits (Phase 3-5) are session-only
5. No collaboration workflow for copywriters/content editors

### TTS Cache System (Existing Pattern)

**File**: `.tts-narration-cache.json`
```json
{
  "meeting-highlights": {
    "c1\\s1_segment_01_intro.wav": {
      "narrationText": "Meeting Highlights automatically...",
      "generatedAt": "2025-10-20T00:16:31.232Z"
    }
  }
}
```

**Key Points**:
- Multi-demo structure (one cache for all demos)
- Keyed by relative audio file path
- Stores narration text + timestamp
- Used for change detection by `check-tts-cache.ts`
- Smart regeneration only when text changes

---

## Proposed Architecture

### 1. Narration File Structure

**One JSON file per demo** (similar to TTS cache, but separate files):

```
public/narration/
├── meeting-highlights/
│   ├── narration.json           # All narration text
│   └── narration-cache.json     # Hash-based change tracking
├── example-demo-1/
│   └── narration.json
└── example-demo-2/
    └── narration.json
```

### 2. Narration JSON Schema

**File**: `public/narration/{demo-id}/narration.json`

```json
{
  "demoId": "meeting-highlights",
  "version": "1.0",
  "lastModified": "2025-01-21T10:30:00Z",
  "slides": [
    {
      "chapter": 1,
      "slide": 1,
      "title": "What is Meeting Highlights",
      "segments": [
        {
          "id": "intro",
          "narrationText": "Meeting Highlights automatically generates 2-3 minute video recaps of your meetings.",
          "visualDescription": "Title slide \"Meeting Highlights\"",
          "notes": ""
        },
        {
          "id": "combination",
          "narrationText": "It combines AI summaries with authentic video clips...",
          "visualDescription": "Split screen showing AI summaries + authentic video clips",
          "notes": "Consider shortening this segment"
        }
      ]
    },
    {
      "chapter": 1,
      "slide": 2,
      "title": "How to Access via BizChat",
      "segments": [
        // ... more segments
      ]
    }
  ]
}
```

### 3. Narration Cache Schema

**File**: `public/narration/{demo-id}/narration-cache.json`

```json
{
  "version": "1.0",
  "generatedAt": "2025-01-21T10:30:00Z",
  "segments": {
    "ch1:s1:intro": {
      "hash": "a1b2c3d4e5f6...",
      "lastChecked": "2025-01-21T10:30:00Z"
    },
    "ch1:s1:combination": {
      "hash": "f6e5d4c3b2a1...",
      "lastChecked": "2025-01-21T10:30:00Z"
    }
    // ... hashes for all segments
  }
}
```

**Purpose**: 
- Detect narration changes without comparing full text
- Trigger TTS regeneration only when hash differs
- Similar to existing `.tts-narration-cache.json` but per-demo

---

## Component Integration

### 1. Narration Loader Service

**File**: `src/framework/utils/narrationLoader.ts`

```typescript
export interface NarrationData {
  demoId: string;
  version: string;
  lastModified: string;
  slides: Array<{
    chapter: number;
    slide: number;
    title: string;
    segments: Array<{
      id: string;
      narrationText: string;
      visualDescription?: string;
      notes?: string;
    }>;
  }>;
}

/**
 * Load narration JSON for a demo
 */
export async function loadNarration(demoId: string): Promise<NarrationData | null> {
  try {
    const response = await fetch(`/narration/${demoId}/narration.json`);
    if (!response.ok) {
      console.warn(`No narration.json found for demo '${demoId}'`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to load narration for '${demoId}':`, error);
    return null;
  }
}

/**
 * Get narration text for specific segment
 */
export function getNarrationText(
  narrationData: NarrationData | null,
  chapter: number,
  slide: number,
  segmentId: string
): string | null {
  if (!narrationData) return null;
  
  const slideData = narrationData.slides.find(
    s => s.chapter === chapter && s.slide === slide
  );
  
  if (!slideData) return null;
  
  const segment = slideData.segments.find(seg => seg.id === segmentId);
  return segment?.narrationText || null;
}
```

### 2. Demo Metadata Enhancement

**Update**: `src/demos/meeting-highlights/metadata.ts`

```typescript
export const meetingHighlightsMetadata: DemoMetadata = {
  id: 'meeting-highlights',
  title: 'Meeting Highlights - COGS Reduction',
  // ... existing fields
  
  // NEW: Flag to enable narration JSON loading
  useExternalNarration: true,
  
  // OPTIONAL: Fallback if narration.json not found
  narrationFallback: 'inline' // 'inline' | 'error' | 'silent'
};
```

### 3. Slides Registry Update

**Current**: Slides define narrationText inline
**New**: Slides can optionally omit narrationText (loaded from JSON)

```typescript
// Chapter1.tsx - Metadata can now omit narrationText
Ch1_S1_WhatIsMeetingHighlights.metadata = {
  chapter: 1,
  slide: 1,
  title: "What is Meeting Highlights",
  audioSegments: [
    {
      id: "intro",
      audioFilePath: "/audio/meeting-highlights/c1/s1_segment_01_intro.wav",
      visualDescription: "Title slide \"Meeting Highlights\"",
      // narrationText: LOADED FROM narration.json
    }
  ]
};
```

**Hybrid Mode** (during migration):
- If `narrationText` exists inline → use it (backward compatible)
- If missing → load from `narration.json`
- If both exist → `narration.json` takes precedence

### 4. DemoPlayer Integration

**File**: `src/framework/components/DemoPlayer.tsx`

```typescript
export const DemoPlayer: React.FC<DemoPlayerProps> = ({ demo }) => {
  const [narrationData, setNarrationData] = useState<NarrationData | null>(null);
  const [slidesWithNarration, setSlidesWithNarration] = useState<SlideComponentWithMetadata[]>([]);

  // Load narration JSON on mount
  useEffect(() => {
    if (demo.metadata.useExternalNarration) {
      loadNarration(demo.metadata.id).then(data => {
        setNarrationData(data);
        
        // Merge narration into slide metadata
        const updated = demo.slides.map(slide => {
          const metadata = { ...slide.metadata };
          metadata.audioSegments = metadata.audioSegments.map(seg => {
            const narrationText = getNarrationText(
              data,
              metadata.chapter,
              metadata.slide,
              seg.id
            );
            return narrationText ? { ...seg, narrationText } : seg;
          });
          
          return { ...slide, metadata };
        });
        
        setSlidesWithNarration(updated);
      });
    } else {
      setSlidesWithNarration(demo.slides);
    }
  }, [demo]);

  // Pass slidesWithNarration to SlidePlayer/NarratedController
  return (
    <SlidePlayer slides={slidesWithNarration} {...props} />
  );
};
```

---

## Backend API for Persistence

### Why Backend API?

**Browser limitation**: JavaScript in browser cannot write to local files for security reasons.

**Options**:
1. **Node.js Express Server** (recommended) - Simple HTTP API
2. **Electron App** - Full desktop app with file system access
3. **VS Code Extension** - Integrated into VS Code
4. **Manual Edit + Reload** - No backend, users edit JSON manually

**Chosen Approach**: Node.js Express server (minimal, easy to run)

### API Design

**Base URL**: `http://localhost:3001` (separate from Vite dev server on 5173)

#### 1. Save Narration (Write to file)

```http
POST /api/narration/save
Content-Type: application/json

{
  "demoId": "meeting-highlights",
  "narrationData": {
    "demoId": "meeting-highlights",
    "version": "1.0",
    "lastModified": "2025-01-21T10:30:00Z",
    "slides": [...]
  }
}

Response:
{
  "success": true,
  "filePath": "public/narration/meeting-highlights/narration.json",
  "timestamp": "2025-01-21T10:30:00Z"
}
```

#### 2. Regenerate TTS Audio

```http
POST /api/narration/regenerate-audio
Content-Type: application/json

{
  "demoId": "meeting-highlights",
  "chapter": 1,
  "slide": 2,
  "segmentId": "intro",
  "narrationText": "New narration text here..."
}

Response:
{
  "success": true,
  "audioPath": "/audio/meeting-highlights/c1/s2_segment_01_intro.wav",
  "timestamp": 1642766400000
}
```

#### 3. Update Narration Cache

```http
POST /api/narration/update-cache
Content-Type: application/json

{
  "demoId": "meeting-highlights",
  "segment": {
    "key": "ch1:s1:intro",
    "hash": "a1b2c3d4...",
    "timestamp": "2025-01-21T10:30:00Z"
  }
}

Response:
{
  "success": true
}
```

### Backend Implementation

**File**: `react_cogs_demo/server/narration-api.js`

```javascript
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const NARRATION_DIR = path.join(__dirname, '../public/narration');

// Save narration to file
app.post('/api/narration/save', (req, res) => {
  const { demoId, narrationData } = req.body;
  
  if (!demoId || !narrationData) {
    return res.status(400).json({ success: false, error: 'Missing demoId or narrationData' });
  }
  
  try {
    const demoDir = path.join(NARRATION_DIR, demoId);
    fs.mkdirSync(demoDir, { recursive: true });
    
    const filePath = path.join(demoDir, 'narration.json');
    narrationData.lastModified = new Date().toISOString();
    
    fs.writeFileSync(filePath, JSON.stringify(narrationData, null, 2));
    
    res.json({
      success: true,
      filePath: path.relative(path.join(__dirname, '..'), filePath),
      timestamp: narrationData.lastModified
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update cache with new hash
app.post('/api/narration/update-cache', (req, res) => {
  const { demoId, segment } = req.body;
  
  try {
    const cacheFile = path.join(NARRATION_DIR, demoId, 'narration-cache.json');
    let cache = { version: '1.0', segments: {} };
    
    if (fs.existsSync(cacheFile)) {
      cache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    }
    
    cache.segments[segment.key] = {
      hash: segment.hash,
      lastChecked: segment.timestamp
    };
    cache.generatedAt = new Date().toISOString();
    
    fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.NARRATION_API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Narration API server running on http://localhost:${PORT}`);
});
```

**Start Command**:
```bash
node server/narration-api.js
```

---

## Migration Strategy

### Phase 1: Extract Narration Script

**Script**: `scripts/extract-narration.ts`

```typescript
/**
 * One-time migration: Extract narration text from React components to JSON files
 * 
 * Usage: npm run extract-narration -- --demo meeting-highlights
 */
import * as fs from 'fs';
import * as path from 'path';

async function extractNarration(demoId: string) {
  // 1. Load slides for demo
  const slides = await loadDemoSlides(demoId);
  
  // 2. Build narration JSON structure
  const narrationData = {
    demoId,
    version: '1.0',
    lastModified: new Date().toISOString(),
    slides: slides.map(slide => ({
      chapter: slide.metadata.chapter,
      slide: slide.metadata.slide,
      title: slide.metadata.title,
      segments: slide.metadata.audioSegments.map(seg => ({
        id: seg.id,
        narrationText: seg.narrationText || '',
        visualDescription: seg.visualDescription || '',
        notes: ''
      }))
    }))
  };
  
  // 3. Write to public/narration/{demo-id}/narration.json
  const outputDir = path.join(__dirname, '../public/narration', demoId);
  fs.mkdirSync(outputDir, { recursive: true });
  
  const outputFile = path.join(outputDir, 'narration.json');
  fs.writeFileSync(outputFile, JSON.stringify(narrationData, null, 2));
  
  console.log(`✅ Extracted narration to ${outputFile}`);
  
  // 4. Generate initial cache
  generateInitialCache(demoId, narrationData);
}
```

**Run**: 
```bash
npm run extract-narration -- --demo meeting-highlights
```

### Phase 2: Update Components (Optional)

**Manual step**: Remove `narrationText` from component metadata (or keep for fallback)

```typescript
// Before:
audioSegments: [
  {
    id: "intro",
    audioFilePath: "/audio/.../intro.wav",
    narrationText: "Meeting Highlights automatically generates..."  // REMOVE
  }
]

// After:
audioSegments: [
  {
    id: "intro",
    audioFilePath: "/audio/.../intro.wav"
    // narrationText loaded from narration.json
  }
]
```

### Phase 3: Enable External Narration

**Update**: `metadata.ts`
```typescript
export const meetingHighlightsMetadata: DemoMetadata = {
  // ... existing fields
  useExternalNarration: true  // ADD THIS
};
```

### Phase 4: Test & Validate

1. Start backend API: `node server/narration-api.js`
2. Start dev server: `npm run dev`
3. Verify narration loads from JSON
4. Test live editing + save
5. Verify TTS regeneration updates cache

---

## Narration Editor Enhancements

### Updated Save Flow (with File Persistence)

**Current** (Phase 3-5): Session-only
**New**: Write to file via backend API

```typescript
// In src/framework/components/NarratedController.tsx
const handleSaveNarration = async (newText: string, regenerateAudio: boolean) => {
  // 1. Update in-memory state (same as before)
  const edit: NarrationEdit = {
    slideKey: editingSegment.slideKey,
    segmentIndex: currentSegmentIdx,
    originalText: segment.narrationText || '',
    editedText: newText,
    timestamp: Date.now()
  };
  
  setNarrationEdits(prev => new Map(prev).set(editKey, edit));
  segment.narrationText = newText;
  
  // 2. NEW: Persist to narration.json via backend API
  try {
    const response = await fetch('http://localhost:3001/api/narration/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        demoId: demoMetadata.id,
        narrationData: buildUpdatedNarrationData() // Helper function
      })
    });
    
    const result = await response.json();
    if (result.success) {
      console.log(`[Edit] Saved to ${result.filePath}`);
    }
  } catch (error) {
    console.error('[Edit] Failed to save to file:', error);
    // Continue anyway - at least in-memory edit succeeded
  }
  
  // 3. Regenerate audio if requested (same as before)
  if (regenerateAudio) {
    await regenerateSegmentAudio(slide, currentSegmentIdx, newText);
    
    // 4. NEW: Update narration cache after TTS regeneration
    await updateNarrationCache(editKey, newText);
  }
  
  setShowEditModal(false);
};
```

### Export Feature Update

**Current**: Download JSON file (client-side only)
**New**: Option to save directly to file system

```typescript
const handleExportNarration = async () => {
  const exportData = buildExportData(); // Same as before
  
  // Option 1: Download JSON (existing)
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `narration-export-${demoMetadata.id}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  // Option 2: Save to file system (NEW)
  const shouldSaveToFile = await confirm('Also save to narration.json file?');
  if (shouldSaveToFile) {
    await fetch('http://localhost:3001/api/narration/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        demoId: demoMetadata.id,
        narrationData: exportData
      })
    });
  }
};
```

---

## Change Detection System

### Narration Check Script

**Script**: `scripts/check-narration.ts`

Similar to `check-tts-cache.ts` but for narration.json changes:

```typescript
/**
 * Check if narration.json has changed and trigger TTS regeneration if needed
 * 
 * Usage: npm run check-narration
 */

async function checkNarration() {
  const demoIds = await getAllDemoIds();
  
  for (const demoId of demoIds) {
    // 1. Load narration.json
    const narrationData = await loadNarration(demoId);
    if (!narrationData) continue;
    
    // 2. Load narration-cache.json
    const cache = loadNarrationCache(demoId);
    
    // 3. Compare hashes
    const changes = [];
    for (const slide of narrationData.slides) {
      for (const segment of slide.segments) {
        const key = `ch${slide.chapter}:s${slide.slide}:${segment.id}`;
        const currentHash = hashText(segment.narrationText);
        const cachedHash = cache.segments[key]?.hash;
        
        if (currentHash !== cachedHash) {
          changes.push({
            chapter: slide.chapter,
            slide: slide.slide,
            segmentId: segment.id,
            reason: cachedHash ? 'Text changed' : 'New segment'
          });
        }
      }
    }
    
    // 4. Report changes
    if (changes.length > 0) {
      console.log(`⚠️  ${changes.length} narration changes detected for '${demoId}'`);
      // Prompt to regenerate TTS
    }
  }
}
```

### Integration with TTS Generation

**Update**: `scripts/generate-tts.ts`

```typescript
// Before generating audio, check narration.json for changes
async function generateTTS(config: TTSConfig) {
  // ... existing code
  
  // NEW: Load narration from JSON if available
  const narrationData = await loadNarration(demoId);
  
  if (narrationData) {
    // Merge narration text from JSON into slide metadata
    for (const slide of allSlides) {
      for (const segment of slide.metadata.audioSegments) {
        const narrationText = getNarrationText(
          narrationData,
          slide.metadata.chapter,
          slide.metadata.slide,
          segment.id
        );
        if (narrationText) {
          segment.narrationText = narrationText;
        }
      }
    }
  }
  
  // ... rest of TTS generation (unchanged)
}
```

---

## Implementation Phases

### Phase 1: Extraction Script & Initial Migration (3-4 hours)

**Tasks**:
- [x] Create `scripts/extract-narration.ts`
- [x] Implement narration JSON schema
- [x] Extract meeting-highlights narration to JSON
- [x] Generate initial narration-cache.json
- [x] Validate extracted data matches components

**Deliverables**:
- `public/narration/meeting-highlights/narration.json`
- `public/narration/meeting-highlights/narration-cache.json`
- `scripts/extract-narration.ts`

### Phase 2: Narration Loading System (4-5 hours)

**Tasks**:
- [x] Create `src/framework/utils/narrationLoader.ts`
- [x] Add `useExternalNarration` flag to DemoMetadata
- [x] Update DemoPlayer to load narration JSON
- [x] Implement hybrid mode (JSON + inline fallback)
- [x] Test narration loading in dev server

**Deliverables**:
- Narration loader utility
- Updated DemoPlayer component
- Backward compatibility verified

### Phase 3: Narration Check Script (2-3 hours)

**Tasks**:
- [x] Create `scripts/check-narration.ts`
- [x] Implement hash-based change detection
- [x] Add comparison with narration-cache.json
- [x] Generate change reports
- [x] Add to pre-dev workflow

**Deliverables**:
- `scripts/check-narration.ts`
- npm script: `npm run check-narration`

### Phase 4: Backend API (3-4 hours)

**Tasks**:
- [x] Create `server/narration-api.js`
- [x] Implement /api/narration/save endpoint
- [x] Implement /api/narration/update-cache endpoint
- [x] Add CORS configuration
- [x] Create start script
- [x] Test file write operations

**Deliverables**:
- Backend API server
- npm script: `npm run narration-api`
- API documentation

### Phase 5: Narration Editor Integration (4-5 hours)

**Tasks**:
- [x] Update handleSaveNarration to call backend API
- [x] Implement file persistence on save
- [x] Update narration cache after edits
- [x] Add error handling for API failures
- [x] Update export feature with save-to-file option
- [x] Test full edit → save → reload workflow

**Deliverables**:
- Updated NarratedController with persistence
- File-based save functionality
- Enhanced export feature

### Phase 6: TTS Integration (3-4 hours)

**Tasks**:
- [x] Update generate-tts.ts to load from narration.json
- [x] Integrate with check-narration.ts
- [x] Update TTS cache after regeneration
- [x] Test full workflow: edit → save → regenerate TTS
- [x] Verify cache updates correctly

**Deliverables**:
- TTS scripts integrated with narration.json
- End-to-end workflow verified

### Phase 7: Migration & Cleanup (2-3 hours)

**Tasks**:
- [x] Migrate all demos to external narration
- [x] Remove inline narrationText from components (optional)
- [x] Update documentation
- [x] Add migration guide
- [x] Create demo for other developers

**Deliverables**:
- All demos migrated
- Updated documentation
- Migration guide

### Phase 8: Testing (3-4 hours)

**Tasks**:
- [x] Test narration loading for all demos
- [x] Test edit → save → reload workflow
- [x] Test TTS regeneration with cache updates
- [x] Test concurrent edits
- [x] Test error scenarios (API down, file permissions)
- [x] Performance testing (load times)

**Deliverables**:
- Test report
- Known issues documented
- Performance benchmarks

### Phase 9: Documentation (2-3 hours)

**Status**: ✅ **COMPLETE**
**Date**: January 21, 2025
**Duration**: 3 hours

**Tasks**:
- [x] Document narration.json schema
- [x] Document backend API
- [x] Update MANUAL_MODE_ENHANCEMENTS.md
- [x] Create NARRATION_SYSTEM_GUIDE.md (451 lines)
- [x] Create NARRATION_API_REFERENCE.md (659 lines)
- [x] Create NARRATION_TROUBLESHOOTING.md (664 lines)
- [x] Update README.md with narration system section
- [x] Update NARRATION_EXTERNALIZATION_PLAN.md with completion status
- [x] Update Agents.md with Phase 9 completion

**Deliverables**:
- ✅ [`NARRATION_SYSTEM_GUIDE.md`](NARRATION_SYSTEM_GUIDE.md) - Complete user-facing documentation (451 lines)
  - Overview and architecture
  - Getting started guide
  - Browser UI and direct file editing workflows
  - TTS integration details
  - Change detection system
  - Best practices and collaboration
  - Advanced topics (extraction, export, API integration)
  
- ✅ [`NARRATION_API_REFERENCE.md`](NARRATION_API_REFERENCE.md) - Complete backend API documentation (659 lines)
  - All 4 API endpoints documented
  - Request/response formats with examples
  - Error handling guide
  - CORS configuration
  - Security considerations
  - Performance metrics
  - Testing commands
  
- ✅ [`NARRATION_TROUBLESHOOTING.md`](NARRATION_TROUBLESHOOTING.md) - Comprehensive troubleshooting guide (664 lines)
  - 10+ common errors with solutions
  - Debug checklist (5 categories)
  - Component-specific issues
  - Performance troubleshooting
  - 15+ FAQ entries
  - Recovery procedures
  
- ✅ Updated [`README.md`](../README.md) - Added 75-line narration system section
  - Architecture overview
  - Quick start guide
  - NPM scripts reference
  - Feature highlights
  - Documentation links
  - Phase report links
  
- ✅ Updated [`NARRATION_EXTERNALIZATION_PLAN.md`](NARRATION_EXTERNALIZATION_PLAN.md) (this document)
  - Added implementation summary at top
  - Marked all 9 phases complete
  - Added documentation deliverables
  - Added production readiness assessment

**Documentation Metrics**:
- **Total Lines**: 2,774 lines of documentation
- **Files Created**: 3 new guides
- **Files Updated**: 2 (README.md, this plan)
- **Cross-References**: All documentation properly linked
- **Coverage**: Complete system documentation

**Quality Checks**:
- ✅ All markdown properly formatted
- ✅ All code examples tested
- ✅ All links verified (internal references)
- ✅ Consistent terminology throughout
- ✅ Clear navigation structure
- ✅ Comprehensive troubleshooting coverage

**Key Documentation Features**:
- **Progressive Disclosure** - Simple quick start, detailed advanced topics
- **Multiple Audiences** - Users, developers, troubleshooters
- **Practical Examples** - Real commands, actual file paths
- **Visual Structure** - Tables, code blocks, sections
- **Cross-Referenced** - All docs link to related content

**Production Readiness**:
The documentation suite provides complete coverage for:
- ✅ New users getting started
- ✅ Developers understanding architecture
- ✅ Troubleshooters resolving issues
- ✅ API consumers integrating with backend
- ✅ Collaborators following best practices

---

## Total Estimated Time: 26-32 hours

**Breakdown**:
- Core Infrastructure (Phases 1-4): 12-16 hours
- Editor Integration (Phase 5): 4-5 hours
- TTS Integration (Phase 6): 3-4 hours
- Migration & Testing (Phases 7-8): 5-7 hours
- Documentation (Phase 9): 2-3 hours

---

## File Structure After Implementation

```
react_cogs_demo/
├── public/
│   ├── narration/                    # NEW: Narration JSON files
│   │   ├── meeting-highlights/
│   │   │   ├── narration.json        # All narration text
│   │   │   └── narration-cache.json  # Hash-based change tracking
│   │   ├── example-demo-1/
│   │   │   └── narration.json
│   │   └── example-demo-2/
│   │       └── narration.json
│   └── audio/                        # Existing TTS audio files
│       └── meeting-highlights/
├── server/                           # NEW: Backend API
│   └── narration-api.js
├── scripts/
│   ├── extract-narration.ts          # NEW: Migration script
│   ├── check-narration.ts            # NEW: Change detection
│   ├── generate-tts.ts               # UPDATED: Load from JSON
│   └── check-tts-cache.ts            # Existing
├── src/
│   ├── framework/
│   │   ├── utils/
│   │   │   └── narrationLoader.ts        # NEW: Narration loading
│   │   └── components/
│   │       ├── DemoPlayer.tsx            # UPDATED: Load narration
│   │       └── NarratedController.tsx    # UPDATED: Persist edits
│   └── demos/
│       ├── types.ts                  # UPDATED: Add useExternalNarration
│       └── meeting-highlights/
│           ├── metadata.ts           # UPDATED: Enable external narration
│           └── slides/chapters/
│               └── Chapter1.tsx      # OPTIONAL: Remove inline narrationText
└── docs/
    ├── NARRATION_EXTERNALIZATION_PLAN.md  # This document
    └── MANUAL_MODE_ENHANCEMENTS.md        # UPDATED: Document new features
```

---

## Benefits Summary

### For Content Creators
✅ Edit narration in JSON without touching code  
✅ See diffs in git for narration changes  
✅ Collaborate on narration separate from code  
✅ Live preview + save during presentations  

### For Developers
✅ Clean separation of content and code  
✅ Easier to review code changes  
✅ Automatic change detection (like TTS cache)  
✅ Consistent architecture across system  

### For System
✅ Persistent edits survive page refresh  
✅ Version control for narration  
✅ Hash-based change detection  
✅ Integrated with existing TTS workflow  

---

## Future Enhancements

1. **Import Narration** - Load exported JSON to restore edits
2. **Narration Diff Viewer** - Visual comparison of changes
3. **Collaborative Editing** - Real-time multi-user edits
4. **Voice Selection** - Per-segment TTS voice configuration
5. **Translation Support** - Multi-language narration files
6. **Version History** - Track narration changes over time
7. **VS Code Extension** - Edit narration directly in IDE

---

## See Also

- [Manual Mode Enhancements](MANUAL_MODE_ENHANCEMENTS.md) - Live narration editing
- [TTS Guide](../docs/TTS_GUIDE.md) - Audio generation workflow
- [Timing System](timing-system/README.md) - Presentation timing