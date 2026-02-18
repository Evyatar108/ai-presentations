# Narration System User Guide

Complete guide to using the narration externalization system for editing presentation narration text.

**Last Updated**: January 21, 2025  
**Version**: 1.0  
**Status**: Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Editing Narration](#editing-narration)
4. [TTS Integration](#tts-integration)
5. [Change Detection](#change-detection)
6. [Best Practices](#best-practices)
7. [Advanced Topics](#advanced-topics)

---

## Overview

The narration externalization system allows you to edit presentation narration text through JSON files or a browser-based UI, without touching React component code.

### Key Features

- ✅ **Browser-Based Editing** - Edit narration directly in the presentation UI
- ✅ **Persistent File Storage** - Changes saved to disk and committed to git
- ✅ **Automatic Change Detection** - Hash-based detection triggers TTS regeneration prompts
- ✅ **TTS Audio Regeneration** - Automatically regenerate audio from updated narration
- ✅ **Version Control Friendly** - Track narration changes separately from code
- ✅ **Collaborative Editing** - Multiple people can edit narration files

### Architecture

```
public/narration/{demo-id}/
├── narration.json        # Single source of truth for all narration text
└── narration-cache.json  # SHA-256 hashes for change detection
```

**Narration JSON** - Contains all narration text organized by slide and segment  
**Narration Cache** - Stores content hashes to detect changes without comparing full text  
**Backend API** - Express server (port 3001) for file persistence  
**TTS Integration** - Generates audio from narration JSON

---

## Getting Started

### Prerequisites

- Node.js v18+ installed
- Project dependencies installed (`npm install`)
- Text editor or browser for editing

### Quick Start

**Option 1: Browser-Based Editing (Recommended)**

```bash
# Start both dev server and narration API
npm run dev:full

# Opens two terminals:
# - API server on http://localhost:3001
# - Dev server on http://localhost:5173
```

1. Navigate to `http://localhost:5173`
2. Select a demo (e.g., Meeting Highlights)
3. Switch to Manual mode
4. Click the Edit button (✏️) on any segment
5. Modify text and click "Save"
6. Changes persist to `narration.json`

**Option 2: Direct File Editing**

```bash
# Edit narration JSON directly
code public/narration/meeting-highlights/narration.json

# Check for changes
npm run check-narration

# Regenerate TTS audio if needed
npm run tts:from-json
```

---

## Editing Narration

### Method 1: Browser UI (Interactive)

**Steps**:

1. **Start the system**:
   ```bash
   npm run dev:full
   ```

2. **Navigate to demo**: Open browser to `http://localhost:5173` and select your demo

3. **Switch to Manual mode**: Click "⌨ Manual" button (editing only available in Manual mode)

4. **Click Edit button**: Click the ✏️ Edit button on any segment

5. **Edit text**: Modify the narration text in the modal
   - Character counter shows current length
   - Real-time validation
   - ESC key to cancel

6. **Save changes**: Click one of:
   - **"Save"** - Write changes to `narration.json` only
   - **"Save & Regenerate Audio"** - Save JSON + regenerate TTS audio

7. **Verify**: Changes appear immediately and persist after page refresh

**UI Features**:

- **Character Counter** - Shows text length (e.g., "285 characters")
- **Loading States** - Spinner during save/regenerate operations
- **Toast Notifications** - Success/error feedback
- **ESC to Close** - Quick exit without saving
- **Backdrop Click** - Click outside modal to cancel

### Method 2: Direct JSON Editing (Advanced)

**Edit `public/narration/{demo-id}/narration.json`**:

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
          "visualDescription": "Title slide",
          "notes": ""
        }
      ]
    }
  ]
}
```

**After editing**:

```bash
# Check what changed
npm run check-narration

# Regenerate audio for changes
npm run tts:from-json -- --demo meeting-highlights
```

### Narration JSON Schema

**Required Fields**:
- `demoId` - Demo identifier (matches directory name)
- `version` - Schema version (currently "1.0")
- `lastModified` - ISO 8601 timestamp
- `slides` - Array of slide objects

**Slide Object**:
- `chapter` - Chapter number (integer)
- `slide` - Slide number within chapter (integer)
- `title` - Slide title (string)
- `segments` - Array of segment objects

**Segment Object**:
- `id` - Unique segment identifier (string)
- `narrationText` - The actual narration text (string)
- `visualDescription` - Description of visual content (optional)
- `notes` - Internal notes/comments (optional)

---

## TTS Integration

The narration system integrates seamlessly with the TTS (Text-to-Speech) audio generation system.

### Generating Audio from JSON

**Command**:
```bash
# Generate audio for all demos from their narration.json
npm run tts:from-json

# Generate for specific demo
npm run tts:from-json -- --demo meeting-highlights
```

**What it does**:
1. Loads narration from `narration.json` exclusively
2. Fails if `narration.json` missing (strict mode)
3. Generates WAV files via TTS server
4. Updates both TTS cache and narration cache
5. Outputs audio to `public/audio/{demo-id}/`

### Audio Regeneration Workflow

**Automatic (Browser UI)**:

1. Edit narration via browser
2. Click "Save & Regenerate Audio"
3. System calls backend API
4. Audio generated via TTS server
5. Caches updated automatically
6. New audio immediately available

**Manual (Command Line)**:

```bash
# Step 1: Edit narration
code public/narration/meeting-highlights/narration.json

# Step 2: Check what changed
npm run check-narration

# Step 3: Regenerate audio
npm run tts:from-json -- --demo meeting-highlights
```

### Cache Synchronization

The system maintains two caches that must stay synchronized:

1. **TTS Cache** (`.tts-narration-cache.json`) - Tracks audio file status
2. **Narration Cache** (`narration-cache.json`) - Tracks narration JSON hashes

**Both caches update together** when:
- Generating audio via `npm run tts:from-json`
- Regenerating single segment via browser
- Running TTS generation scripts

**Check synchronization**:
```bash
npm run tts:check
```

---

## Change Detection

### Automatic Change Detection

The system uses SHA-256 hashing to detect narration changes without comparing full text.

**How it works**:

1. Each segment's narration text is hashed
2. Hash stored in `narration-cache.json`
3. On next check, current text is hashed
4. If hashes differ → change detected
5. Prompt to regenerate TTS audio

### Checking for Changes

**Command**:
```bash
npm run check-narration
```

**Sample Output**:
```
🔍 Checking narration changes...
✅ Scanning demos: example-demo-1, example-demo-2, meeting-highlights

📊 Results for "meeting-highlights": ✅ All 47 segments unchanged
📊 Results for "example-demo-1": ⚠️ 2 segment(s) modified:
   - Chapter 1, Slide 1, Segment: intro (Text changed)
   - Chapter 1, Slide 2, Segment: main (New segment)

⚠️ Changes detected. Regenerate audio? (npm run tts:from-json)
```

### Integrated Cache Check

**Check both narration AND audio caches**:

```bash
npm run tts:check
```

**Two-step validation**:
1. **Step 1**: Check narration JSON files
2. **Step 2**: Check TTS audio cache

**Sample Output**:
```
📋 Step 1: Checking narration JSON files...
✅ All narration JSON files match cache

📋 Step 2: Checking TTS audio cache...
📁 Checking demo: meeting-highlights
   📝 Loaded narration.json with 14 slides
✅ All audio files are up-to-date for this demo

✅ All systems up-to-date!
```

---

## Best Practices

### Editing Guidelines

**DO**:
- ✅ Use clear, concise language
- ✅ Keep segments focused (one idea per segment)
- ✅ Test audio playback after changes
- ✅ Commit changes to git regularly
- ✅ Add notes for context/rationale

**DON'T**:
- ❌ Make extremely long narration (>500 chars)
- ❌ Use special characters that break JSON
- ❌ Edit multiple segments simultaneously
- ❌ Forget to regenerate audio after edits
- ❌ Edit while presentation is running

### Version Control

**Commit Strategy**:

```bash
# After editing narration
git add public/narration/meeting-highlights/narration.json
git add public/narration/meeting-highlights/narration-cache.json
git commit -m "Update narration for Chapter 1, Slide 2"

# After regenerating audio
git add public/audio/meeting-highlights/
git add .tts-narration-cache.json
git commit -m "Regenerate audio for updated narration"
```

**Branching**:
- Create feature branches for major narration rewrites
- Use pull requests for collaborative review
- Test audio playback before merging

### Collaboration Workflow

**Multiple Editors**:

1. **Editor A** edits narration JSON
2. **Editor A** commits and pushes
3. **Editor B** pulls changes
4. **Editor B** runs `npm run check-narration`
5. **Editor B** regenerates audio if needed
6. **Editor B** commits and pushes

**Review Process**:
- Use PR comments to discuss narration changes
- Link to specific segment IDs in comments
- Test presentation flow with new narration

---

## Advanced Topics

### Custom Narration Location

**Override narration path** (advanced use case):

```typescript
// In src/utils/narrationLoader.ts
export async function loadNarration(
  demoId: string,
  customPath?: string
): Promise<NarrationData | null> {
  const path = customPath || `/narration/${demoId}/narration.json`;
  // ...
}
```

### Programmatic Narration Updates

**Bulk updates via script**:

```typescript
import * as fs from 'fs';
import * as path from 'path';

// Load narration
const narrationPath = 'public/narration/meeting-highlights/narration.json';
const narration = JSON.parse(fs.readFileSync(narrationPath, 'utf-8'));

// Update all segments
narration.slides.forEach(slide => {
  slide.segments.forEach(segment => {
    // Example: Add prefix to all narration
    segment.narrationText = `[Demo] ${segment.narrationText}`;
  });
});

// Save updated narration
fs.writeFileSync(narrationPath, JSON.stringify(narration, null, 2));
console.log('✅ Updated narration');
```

### Narration Extraction

**Extract narration from React components** (one-time migration):

```bash
npm run extract-narration -- --demo meeting-highlights
```

**What it does**:
1. Scans React component files
2. Extracts `narrationText` from metadata
3. Builds `narration.json` structure
4. Generates initial `narration-cache.json`
5. Saves to `public/narration/{demo-id}/`

### Export and Import

**Export narration** (browser or command line):

```bash
# Browser: Click "Export Narration" button
# Downloads: narration-export-{demo-id}-{timestamp}.json

# Command line: Copy file
cp public/narration/meeting-highlights/narration.json \
   backups/narration-backup-$(date +%Y%m%d).json
```

**Import narration**:

```bash
# Restore from backup
cp backups/narration-backup-20250121.json \
   public/narration/meeting-highlights/narration.json

# Regenerate audio
npm run tts:from-json -- --demo meeting-highlights
```

### Backend API Details

**API Server**: Express server on port 3001

**Start API**:
```bash
npm run narration-api
```

**Endpoints**:
- `GET /api/health` - Health check
- `POST /api/narration/save` - Save narration to file
- `POST /api/narration/update-cache` - Update narration cache
- `POST /api/narration/regenerate-audio` - Regenerate single segment audio

**See**: [`NARRATION_API_REFERENCE.md`](NARRATION_API_REFERENCE.md) for complete API documentation

---

## Related Documentation

- **[API Reference](NARRATION_API_REFERENCE.md)** - Complete backend API documentation
- **[Troubleshooting](NARRATION_TROUBLESHOOTING.md)** - Common issues and solutions
- **[Implementation Plan](NARRATION_EXTERNALIZATION_PLAN.md)** - System architecture and design
- **[Test Results](PHASE_8_TEST_RESULTS.md)** - Comprehensive testing report

---

**Document Version**: 1.0  
**Last Updated**: January 21, 2025  
**Maintained By**: React COGS Demo Team