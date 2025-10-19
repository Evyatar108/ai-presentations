# Multi-Segment Audio & Animation Design

## Overview

This document outlines the architecture for supporting **multi-segment slides** - slides that progressively reveal content synchronized with multiple sequential audio files and animations. This enables complex narratives like team introductions where each team's logo and description appears as the narrator discusses them.

## File Organization

### Slide Files (SRT Format)
Slide definitions are organized in chapter folders under `highlights_demo/chapters/`:

```
highlights_demo/chapters/
├── c2/                           # Chapter 2: Team Collaboration
│   └── s1_team_collaboration.srt # Slide 1 with 8 segments
├── c5/                           # Chapter 5: COGS Challenge
│   ├── s1_challenge_framing.srt
│   ├── s2_four_prompts.srt
│   └── ...
└── c7/                           # Chapter 7: Business Impact
    ├── s1_call_reduction.srt
    └── ...
```

Each SRT file contains:
- React component reference (comment)
- Multiple segments with timing and narration
- Visual descriptions for each segment

### Audio Files
Audio segments organized by chapter and slide:

```
public/audio/
├── c2/                           # Chapter 2 audio
│   ├── s1_segment_01_intro.mp3
│   ├── s1_segment_02_odsp.mp3
│   └── ...
├── c5/                           # Chapter 5 audio
│   └── ...
└── c7/                           # Chapter 7 audio
    └── ...
```

Naming convention: `sX_segment_YY_description.mp3` where:
- `X` = slide number
- `YY` = segment number (zero-padded)
- `description` = brief segment identifier

## Current Architecture Analysis

### Existing System
- **One audio file per slide** - Each slide has a single `audioFilePath` in metadata
- **Slide-level animations** - Animations start when slide mounts (framer-motion `initial`/`animate`)
- **Audio managed by NarratedController** - Plays audio, advances on `onended`
- **No intra-slide sequencing** - All animations run immediately or with fixed delays

### Limitations
1. Cannot pause mid-slide to wait for audio completion
2. Cannot trigger new animations based on audio progress
3. Cannot play multiple audio files sequentially within one slide
4. No way to coordinate "narration segment → animation → next narration segment"

## Proposed Architecture

### 1. Multi-Segment Metadata Structure

Extend `SlideMetadata` to support segments:

```typescript
interface AudioSegment {
  id: string;                    // Unique identifier (e.g., "intro", "team_odsp")
  audioFilePath: string;         // Path to audio file
  duration?: number;             // Optional pre-computed duration (for scrubbing)
  animationTrigger?: string;     // Animation key to trigger when this segment starts
}

interface SlideMetadata {
  chapter: number;
  utterance: number;
  title: string;
  
  // NEW: Support both single audio (legacy) and multi-segment
  audioFilePath?: string;              // Legacy single audio
  audioSegments?: AudioSegment[];      // New multi-segment support
  
  // NEW: Slide-level configuration
  isMultiSegment?: boolean;            // Flag for multi-segment slides
}
```

### 2. Segment-Aware Slide Component Pattern

Slides with multiple segments should use a custom hook for segment coordination:

```typescript
// New hook: useSegmentedAnimation
interface SegmentedAnimationProps {
  segments: AudioSegment[];
  onSegmentChange?: (segmentId: string, index: number) => void;
  onComplete?: () => void;
}

function useSegmentedAnimation(props: SegmentedAnimationProps) {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isSegmentActive, setIsSegmentActive] = useState(false);
  
  // Expose current segment and controls
  return {
    currentSegmentIndex,
    currentSegment: props.segments[currentSegmentIndex],
    isSegmentActive,
    nextSegment: () => { /* advance to next */ },
    resetSegments: () => { /* reset to beginning */ }
  };
}
```

### 3. Enhanced NarratedController

Extend `NarratedController` to handle multi-segment slides:

```typescript
// In NarratedController.tsx
useEffect(() => {
  if (!isPlaying || currentIndex >= allSlides.length || isManualMode) return;
  
  const currentSlide = allSlides[currentIndex].metadata;
  
  // NEW: Check if multi-segment slide
  if (currentSlide.isMultiSegment && currentSlide.audioSegments) {
    playSegmentedSlide(currentSlide);
  } else {
    // Legacy single audio path
    playSingleAudio(currentSlide);
  }
}, [isPlaying, currentIndex, isManualMode]);

function playSegmentedSlide(slideMetadata: SlideMetadata) {
  let segmentIndex = 0;
  
  function playNextSegment() {
    if (segmentIndex >= slideMetadata.audioSegments!.length) {
      // All segments complete, advance to next slide
      advanceSlide();
      return;
    }
    
    const segment = slideMetadata.audioSegments![segmentIndex];
    const audio = new Audio(segment.audioFilePath);
    
    // Notify slide component of segment change
    onSegmentChange?.(slideMetadata.chapter, slideMetadata.utterance, segment.id, segmentIndex);
    
    audio.onended = () => {
      segmentIndex++;
      playNextSegment();
    };
    
    audio.play();
  }
  
  playNextSegment();
}
```

### 4. Segment-Driven Animation Pattern

Example: Team Collaboration Slide

```typescript
interface TeamInfo {
  id: string;
  name: string;
  logo: string;
  role: string;
}

const teams: TeamInfo[] = [
  { id: "odsp", name: "ODSP", logo: "/logos/odsp.png", role: "Storage & orchestration" },
  { id: "msai", name: "MSAI-Hive", logo: "/logos/msai-hive.png", role: "AI generation" },
  // ... more teams
];

export const Ch2_TeamCollaboration: SlideComponentWithMetadata = () => {
  const { currentSegmentIndex } = useSegmentedAnimation({
    segments: Ch2_TeamCollaboration.metadata.audioSegments!
  });
  
  return (
    <div>
      <h1>Teams Collaborating on Meeting Highlights</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
        {teams.map((team, index) => (
          <AnimatePresence key={team.id}>
            {/* Reveal team when its segment becomes active */}
            {index <= currentSegmentIndex && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
              >
                <img src={team.logo} alt={team.name} />
                <h3>{team.name}</h3>
                <p>{team.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>
    </div>
  );
};

Ch2_S1_TeamCollaboration.metadata = {
  chapter: 2,
  slide: 1,
  title: "Team Collaboration",
  isMultiSegment: true,
  audioSegments: [
    { id: "intro", audioFilePath: "/audio/c2/s1_segment_01_intro.mp3" },
    { id: "odsp", audioFilePath: "/audio/c2/s1_segment_02_odsp.mp3" },
    { id: "msai", audioFilePath: "/audio/c2/s1_segment_03_msai.mp3" },
    { id: "clipchamp", audioFilePath: "/audio/c2/s1_segment_04_clipchamp.mp3" },
    { id: "loop", audioFilePath: "/audio/c2/s1_segment_05_loop.mp3" },
    { id: "bizchat", audioFilePath: "/audio/c2/s1_segment_06_bizchat.mp3" },
    { id: "teams", audioFilePath: "/audio/c2/s1_segment_07_teams.mp3" },
    { id: "conclusion", audioFilePath: "/audio/c2/s1_segment_08_conclusion.mp3" }
  ]
};
```

## Implementation Plan

### Phase 1: Core Infrastructure
1. **Extend `SlideMetadata` interface** - Add `audioSegments` and `isMultiSegment` fields
2. **Create `useSegmentedAnimation` hook** - Manage segment state and transitions
3. **Create `SegmentContext`** - React context for segment state across components
4. **Enhance `NarratedController`** - Add segment playback logic

### Phase 2: Slide Component Support
5. **Create `SegmentedSlideWrapper`** - HOC for segment-aware slides
6. **Add segment change callbacks** - Pass segment info from controller to slides
7. **Create animation helpers** - Utility functions for segment-based reveals

### Phase 3: Developer Experience
8. **Create slide templates** - Example patterns for common use cases
9. **Add segment preview mode** - Debug UI to jump between segments
10. **Document patterns** - Clear examples and best practices

## Key Design Decisions

### Decision 1: Segment State Management
**Chosen Approach**: React Context + Hook Pattern
- **Why**: Allows any component in slide tree to access current segment
- **Alternative**: Prop drilling - rejected due to deep nesting in slides

### Decision 2: Audio Sequencing
**Chosen Approach**: Controller manages all audio, notifies slides
- **Why**: Centralized audio management, consistent with current architecture
- **Alternative**: Slides manage their own audio - rejected for complexity

### Decision 3: Animation Triggering
**Chosen Approach**: Segment index drives visibility/animation
- **Why**: Declarative, works with AnimatePresence, easy to reason about
- **Alternative**: Imperative callbacks - rejected as less React-idiomatic

### Decision 4: Backward Compatibility
**Chosen Approach**: Optional `audioSegments` field, legacy `audioFilePath` still works
- **Why**: Don't break existing slides, gradual migration
- **Alternative**: Breaking change - rejected for disruption

## Example Use Cases

### Use Case 1: Team Introduction (6 teams)
```
Segment 1: "Meeting Highlights brings together six teams..."
  → Intro text fades in

Segment 2: "ODSP provides storage and orchestration..."
  → ODSP logo + description appear

Segment 3: "MSAI-Hive generates highlights using AI..."
  → MSAI-Hive logo + description appear

... (continue for each team)

Segment 7: "Together, these teams deliver a seamless experience"
  → All logos pulse, connection lines appear
```

### Use Case 2: Sequential Process Flow
```
Segment 1: "First, the recording is created..."
  → Recording icon appears

Segment 2: "ODSP triggers TMR processor..."
  → Arrow animates from ODSP to TMR

Segment 3: "TMR calls the LLM for analysis..."
  → LLM processing animation

Segment 4: "Results are stored back in ODSP..."
  → Data flow back to ODSP
```

### Use Case 3: Before/After Comparison
```
Segment 1: "Our original approach used four prompts..."
  → Show 4 boxes

Segment 2: "Each prompt added latency and cost..."
  → Boxes shake, red indicators appear

Segment 3: "The unified approach combines everything..."
  → Boxes merge into one with animation

Segment 4: "Reducing calls by 75% and improving quality"
  → Metrics appear
```

## Technical Considerations

### Audio Preloading
- Preload all segments when slide becomes active
- Show loading indicator if segments not ready
- Handle network failures gracefully

### Animation Performance
- Use `will-change` CSS for animated elements
- Limit concurrent animations
- Respect `prefers-reduced-motion`

### Timing Precision
- Audio `onended` callback may have ~50ms delay
- Add configurable delay between segments if needed
- Support manual segment advancement for debugging

### Manual Navigation
- In manual mode, allow skipping to any segment
- In manual+audio mode, segment navigation triggers appropriate audio
- Show segment progress indicator (e.g., "Segment 3 of 7")

## Migration Path

### For Existing Slides
1. No changes required - single audio continues to work
2. Optional: Convert to segments for finer control

### For New Slides
1. Use multi-segment from start if narrative has clear breaks
2. Use single audio if slide is cohesive unit
3. Prefer segments when content reveals progressively

## Open Questions

1. **Segment Scrubbing**: Should users be able to skip segments in manual mode?
   - **Proposal**: Yes, show segment dots like slide dots
   
2. **Segment Duration**: Should we pre-compute durations or rely on audio metadata?
   - **Proposal**: Optional pre-computed, fallback to audio loading
   
3. **Cross-Segment Animations**: How to handle animations spanning multiple segments?
   - **Proposal**: Use segment ranges: `activeFrom: 2, activeTo: 5`

4. **Segment Naming**: Enforce naming convention or allow freeform IDs?
   - **Proposal**: Freeform IDs, but suggest pattern: `<topic>_<subtopic>`

## Success Metrics

- **Developer Experience**: Can create 6-team slide in < 100 lines of code
- **Performance**: No jank during segment transitions
- **Compatibility**: 100% of existing slides work without modification
- **Flexibility**: Support 90% of progressive reveal use cases

## Next Steps

1. Review design with team
2. Create proof-of-concept with one multi-segment slide
3. Iterate based on feedback
4. Document patterns and best practices
5. Migrate team collaboration slide as pilot
