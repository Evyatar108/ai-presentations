# Manual Mode Enhancements

## Overview

Simplify and enhance manual mode with unified controls and narration editing capabilities. This document describes two major enhancements:

1. **Unified Manual Mode** - Merge Manual (Silent) and Manual + Audio modes with audio toggle
2. **Externalized Narration System** - Move narration text from React code to editable JSON files

---

## Feature 1: Unified Manual Mode with Audio Toggle

### Current State (To Be Changed)

Currently three separate modes:
1. **▶ Narrated** - Auto-advance with audio
2. **⌨ Manual (Silent)** - Keyboard navigation, no audio
3. **⌨ Manual + Audio** - Keyboard navigation with audio

**Problem**: Two manual modes is redundant. Users should just toggle audio on/off within manual mode.

### Proposed Design

Two modes only:
1. **▶ Narrated** - Auto-advance with audio (unchanged)
2. **⌨ Manual** - Keyboard navigation with optional audio toggle

### WelcomeScreen Changes

**Before**:
```
┌─────────────────────────────────────┐
│ ▶ Narrated                         │
│ ⌨ Manual (Silent)                  │
│ ⌨ Manual + Audio                   │
└─────────────────────────────────────┘
```

**After**:
```
┌─────────────────────────────────────┐
│ ▶ Narrated                         │
│ ⌨ Manual                           │
└─────────────────────────────────────┘
```

### Manual Mode Interface

**Audio Toggle Button** in top control bar:

```
┌────────────────────────────────────────────────────┐
│ Slide 5 of 15 (Ch1:S2)  🔊 Audio   ↻ Restart     │
└────────────────────────────────────────────────────┘
```

**Toggle States**:
- **🔊 Audio** (enabled) - Plays audio for each slide/segment
- **🔇 Muted** (disabled) - No audio playback

**User Flow**:
1. User selects "⌨ Manual" from WelcomeScreen
2. Presentation starts in manual mode with audio **enabled** by default
3. User can click "🔊 Audio" to toggle to "🔇 Muted" at any time
4. Setting persists for remainder of session

### Implementation

```typescript
// In NarratedController.tsx
const [isManualMode, setIsManualMode] = useState(false);
const [audioEnabled, setAudioEnabled] = useState(true);  // NEW: Audio toggle

// Start manual mode (replaces both old manual modes)
const handleManualMode = () => {
  setShowStartOverlay(false);
  setIsPlaying(false);
  setIsManualMode(true);
  setAudioEnabled(true);  // Start with audio enabled
  setCurrentIndex(0);
  onSlideChange(allSlides[0].metadata.chapter, allSlides[0].metadata.slide);
};

// Audio toggle button
{isManualMode && (
  <button
    onClick={() => setAudioEnabled(!audioEnabled)}
    style={{
      background: 'transparent',
      border: '1px solid #475569',
      color: audioEnabled ? '#00B7C3' : '#64748b',
      // ... styling
    }}
  >
    {audioEnabled ? '🔊 Audio' : '🔇 Muted'}
  </button>
)}

// Conditional audio playback
useEffect(() => {
  if (!isManualMode || !audioEnabled) return;
  // Play audio logic (same as old Manual+Audio mode)
}, [currentIndex, isManualMode, audioEnabled]);
```

---

## Feature 2: Narration Editor (Manual Mode Only)

### Purpose

Allow users to edit narration text during presentation for:
- Testing different wording
- Fixing typos or errors
- Customizing for specific audiences
- Experimenting with variations

**Note**: Changes are **temporary** (session only) unless explicitly exported/saved.

### UI Design

**Edit Button** appears in manual mode next to segment controls:

```
┌────────────────────────────────────────────────────┐
│ Slide 5 of 15 (Ch1:S2)  🔊 Audio   ↻ Restart     │
│ ─────────────────────────────────────────────────  │
│ Segment: ◀ ● ● ● ● ● ▶  2/5    ✏️ Edit   💾 Export│
└────────────────────────────────────────────────────┘
```

### Edit Modal

**Click "✏️ Edit"** opens modal:

```
┌─────────────────────────────────────────────────────┐
│ Edit Narration - Ch1:S2:Segment 2                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ In BizChat, you can access highlights from     ││
│ │ your recent meetings. Simply click on the       ││
│ │ meeting in your history to view the AI-generated││
│ │ summary and key moments.                        ││
│ │                                                 ││
│ │                                                 ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Character count: 187                                │
│                                                     │
│ ⚠️  Changes are temporary (session only)            │
│                                                     │
│ [Cancel]  [Save & Regenerate Audio]  [Save Only]   │
└─────────────────────────────────────────────────────┘
```

### Button Actions

1. **Cancel** - Discard changes, close modal
2. **Save Only** - Update narration text, keep existing audio
3. **Save & Regenerate Audio** - Update text AND generate new audio via TTS

### Export Feature

**Click "💾 Export"** downloads narration as JSON:

```json
{
  "demoId": "meeting-highlights",
  "exportDate": "2025-01-20T10:30:00Z",
  "slides": [
    {
      "chapter": 1,
      "slide": 2,
      "title": "BizChat Demo",
      "segments": [
        {
          "id": "intro",
          "originalNarration": "Here we see the BizChat interface...",
          "editedNarration": "In BizChat, you can access highlights...",
          "modified": true,
          "timestamp": "2025-01-20T10:25:00Z"
        },
        {
          "id": "ciq",
          "originalNarration": "Click on conversation intelligence...",
          "editedNarration": null,
          "modified": false
        }
      ]
    }
  ],
  "metadata": {
    "totalSlides": 15,
    "totalSegments": 65,
    "modifiedSegments": 3
  }
}
```

**Export Filename**: `narration-export-{demo-id}-{timestamp}.json`

### Implementation Details

```typescript
// In NarratedController.tsx or new NarrationEditor component

interface NarrationEdit {
  slideKey: string;
  segmentIndex: number;
  originalText: string;
  editedText: string;
  timestamp: number;
}

const [narrationEdits, setNarrationEdits] = useState<Map<string, NarrationEdit>>(new Map());
const [showEditModal, setShowEditModal] = useState(false);
const [editingSegment, setEditingSegment] = useState<{
  slideKey: string;
  segmentIndex: number;
  currentText: string;
} | null>(null);

// Open edit modal
const handleEditNarration = () => {
  const slide = allSlides[currentIndex].metadata;
  const slideKey = `Ch${slide.chapter}:S${slide.slide}`;
  const segment = slide.audioSegments[segmentContext.currentSegmentIndex];
  
  setEditingSegment({
    slideKey,
    segmentIndex: segmentContext.currentSegmentIndex,
    currentText: segment.narrationText || ''
  });
  setShowEditModal(true);
};

// Save edited narration
const handleSaveNarration = (newText: string, regenerateAudio: boolean) => {
  if (!editingSegment) return;
  
  const edit: NarrationEdit = {
    slideKey: editingSegment.slideKey,
    segmentIndex: editingSegment.segmentIndex,
    originalText: editingSegment.currentText,
    editedText: newText,
    timestamp: Date.now()
  };
  
  const key = `${editingSegment.slideKey}:${editingSegment.segmentIndex}`;
  setNarrationEdits(prev => new Map(prev).set(key, edit));
  
  // Update segment narrationText in memory
  const slide = allSlides[currentIndex].metadata;
  const segment = slide.audioSegments[editingSegment.segmentIndex];
  segment.narrationText = newText;
  
  if (regenerateAudio) {
    // Call TTS API to regenerate audio
    regenerateSegmentAudio(slide, editingSegment.segmentIndex, newText);
  }
  
  setShowEditModal(false);
  setEditingSegment(null);
};

// Export narration edits
const handleExportNarration = () => {
  const exportData = {
    demoId: demoMetadata.id,
    exportDate: new Date().toISOString(),
    slides: allSlides.map(slide => ({
      chapter: slide.metadata.chapter,
      slide: slide.metadata.slide,
      title: slide.metadata.title,
      segments: slide.metadata.audioSegments.map((seg, idx) => {
        const key = `Ch${slide.metadata.chapter}:S${slide.metadata.slide}:${idx}`;
        const edit = narrationEdits.get(key);
        
        return {
          id: seg.id,
          originalNarration: seg.narrationText,
          editedNarration: edit?.editedText || null,
          modified: !!edit,
          timestamp: edit?.timestamp ? new Date(edit.timestamp).toISOString() : null
        };
      })
    })),
    metadata: {
      totalSlides: allSlides.length,
      totalSegments: allSlides.reduce((sum, s) => sum + s.metadata.audioSegments.length, 0),
      modifiedSegments: narrationEdits.size
    }
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `narration-export-${demoMetadata.id}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

### Edit Modal Component

```typescript
// NarrationEditModal.tsx
interface NarrationEditModalProps {
  slideKey: string;
  segmentId: string;
  currentText: string;
  onSave: (newText: string, regenerateAudio: boolean) => void;
  onCancel: () => void;
}

export const NarrationEditModal: React.FC<NarrationEditModalProps> = ({
  slideKey,
  segmentId,
  currentText,
  onSave,
  onCancel
}) => {
  const [text, setText] = useState(currentText);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const handleSaveAndRegenerate = async () => {
    setIsRegenerating(true);
    await onSave(text, true);
    setIsRegenerating(false);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1e293b',
          borderRadius: 12,
          padding: '2rem',
          width: '90%',
          maxWidth: 600,
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}
      >
        <h2 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>
          Edit Narration - {slideKey}:{segmentId}
        </h2>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: '100%',
            minHeight: 150,
            padding: '1rem',
            background: '#0f172a',
            color: '#f1f5f9',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: 8,
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: 'Inter, system-ui, sans-serif',
            resize: 'vertical'
          }}
        />
        
        <div style={{ 
          color: '#94a3b8', 
          fontSize: 12, 
          marginTop: '0.5rem' 
        }}>
          Character count: {text.length}
        </div>
        
        <div style={{
          background: 'rgba(251, 146, 60, 0.1)',
          border: '1px solid rgba(251, 146, 60, 0.3)',
          borderRadius: 6,
          padding: '0.75rem',
          marginTop: '1rem',
          color: '#fb923c',
          fontSize: 13
        }}>
          ⚠️ Changes are temporary (session only)
        </div>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1.5rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: '1px solid #475569',
              color: '#94a3b8',
              padding: '0.75rem 1.5rem',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={() => onSave(text, false)}
            style={{
              background: 'transparent',
              border: '1px solid #00B7C3',
              color: '#00B7C3',
              padding: '0.75rem 1.5rem',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            Save Only
          </button>
          
          <button
            onClick={handleSaveAndRegenerate}
            disabled={isRegenerating}
            style={{
              background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: 8,
              cursor: isRegenerating ? 'wait' : 'pointer',
              opacity: isRegenerating ? 0.6 : 1
            }}
          >
            {isRegenerating ? 'Regenerating...' : 'Save & Regenerate Audio'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
```

---

## Benefits

### Unified Manual Mode
✅ **Simpler UX** - Two modes instead of three  
✅ **Flexible** - Toggle audio on/off during presentation  
✅ **Cleaner Interface** - One toggle button vs. two separate modes  
✅ **Better Defaults** - Audio enabled by default (more useful)  

### Narration Editor
✅ **Live Editing** - Test changes during presentation  
✅ **TTS Integration** - Regenerate audio on-demand  
✅ **Export Capability** - Save edits for review/reuse  
✅ **Non-Destructive** - Changes temporary unless exported  
✅ **Manual Mode Only** - Keeps narrated mode simple  

---

## Implementation Phases

### Phase 1: Unified Manual Mode ✅ COMPLETE
- [x] Remove "Manual (Silent)" and "Manual + Audio" from WelcomeScreen
- [x] Add single "Manual" mode option
- [x] Add audio toggle button to manual mode UI
- [x] Implement toggle state management
- [x] Update keyboard shortcuts help text
- [x] Test mode switching and audio toggle

### Phase 2: Narration Editor UI ✅ COMPLETE
- [x] Add "✏️ Edit" button in manual mode
- [x] Create NarrationEditModal component
- [x] Implement edit state management
- [x] Add character counter
- [x] Add save/cancel handlers
- [x] Style modal with current design system

### Phase 3: Edit Functionality ✅ COMPLETE
- [x] Track narration edits in state (Map)
- [x] Update segment narrationText in memory
- [x] Preserve edits during navigation
- [x] Add warning about temporary changes
- [x] Test edit/save workflow

### Phase 4: TTS Integration ✅ COMPLETE
- [x] Add "Save & Regenerate Audio" option
- [x] Call TTS API with new narration text
- [x] Update audio file path with cache-busting
- [x] Show loading state during regeneration
- [x] Handle TTS errors gracefully
- [x] Add retry capability on error
- [x] Implement server health check
- [x] Add error display in modal
- [x] Disable UI during regeneration
- [x] Add loading spinner animation

**Implementation Date**: 2025-01-21
**Documentation**: See [`PHASE_4_TTS_INTEGRATION.md`](PHASE_4_TTS_INTEGRATION.md)

### Phase 5: Export Feature ✅ COMPLETE
- [x] Add "💾 Export" button
- [x] Build export JSON structure
- [x] Include original and edited narration
- [x] Add metadata (modified count, timestamps)
- [x] Implement file download
- [x] Test export with various edit states

**Implementation Date**: 2025-01-21
**Location**: [`NarratedController.tsx`](../src/framework/components/NarratedController.tsx) lines 519-568, 996-1020

### Phase 6: Testing ✅ CODE REVIEW COMPLETE
- [x] Code review of all implementations
- [x] TypeScript compilation verification (no errors)
- [x] Implementation completeness check
- [x] Code quality assessment
- [x] Documentation review
- [x] Test plan creation
- [ ] Browser testing (requires user)
- [ ] TTS regeneration testing (requires TTS server)
- [ ] Production build testing (requires user)

**Testing Report**: See [`PHASE_6_TESTING_REPORT.md`](PHASE_6_TESTING_REPORT.md)
**Status**: All features implemented and code-reviewed. Ready for browser testing.

---

## Future Enhancements

1. **Import Narration** - Load exported JSON to restore edits
2. **Edit History** - Undo/redo for narration changes
3. **Bulk Edit** - Edit all segments at once
4. **Voice Selection** - Choose different TTS voices
5. **Preview Audio** - Play before saving
6. **Diff View** - Highlight changes from original

---

## See Also

- [Timing System Documentation](timing-system/README.md)
- [Transition Slides Feature](TRANSITION_SLIDES.md)
- [TTS Guide](TTS_GUIDE.md)