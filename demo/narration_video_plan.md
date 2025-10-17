# Narrated Demo Video Plan

## 1. Goal
Automate slide progression synchronized with pre-generated TTS narration so a screen recording produces a smooth "video-like" experience showing: LLM calls 4→1 and GPUs ~600→~200 plus quality uplift.

## 2. Feasibility
High. Pure client-side React orchestration using HTMLAudioElement or Web Audio API. Complexity is low: a controller component + a manifest mapping slide ids to audio files + optional intra-slide cue timestamps for sub-animations (if needed later).

## 3. Core Constraints
- Browser Autoplay Policies: Audio will not start until a user gesture (click) triggers playback. Provide a Start button overlay.
- Loading / buffering: Need preloading or sequential queuing; avoid gaps between tracks.
- Reduced Motion: Honor existing reduced-motion; narration timing stays constant.
- Resilience: If an audio file fails, fallback to timed progression.

## 4. Assets Needed
Generate one narration audio file per slide (preferred) OR one concatenated file with cue timestamps. Per-slide simplifies modular edits.

Recommended format: .mp3 (size) or .wav (quality). Place under `public/audio/`.

Naming convention:
```
public/audio/slide19_challenge.mp3
public/audio/slide20_four_prompts.mp3
...
public/audio/slide31_quality.mp3
```

## 5. Manifest Definition
Create `narrationManifest.json`:

```json
{
  "slides": [
    { "id": 19, "src": "/audio/slide19_challenge.mp3", "autoAdvance": true },
    { "id": 20, "src": "/audio/slide20_four_prompts.mp3", "autoAdvance": true },
    { "id": 21, "src": "/audio/slide21_topic.mp3", "autoAdvance": true },
    { "id": 22, "src": "/audio/slide22_extractive.mp3", "autoAdvance": true },
    { "id": 23, "src": "/audio/slide23_quality_ranking.mp3", "autoAdvance": true },
    { "id": 24, "src": "/audio/slide24_narrative.mp3", "autoAdvance": true },
    { "id": 25, "src": "/audio/slide25_unified_convergence.mp3", "autoAdvance": true },
    { "id": 26, "src": "/audio/slide26_unified_flow.mp3", "autoAdvance": true },
    { "id": 27, "src": "/audio/slide27_token_optimization.mp3", "autoAdvance": true },
    { "id": 28, "src": "/audio/slide28_call_reduction.mp3", "autoAdvance": true },
    { "id": 29, "src": "/audio/slide29_gpu_reduction.mp3", "autoAdvance": true },
    { "id": 30, "src": "/audio/slide30_cogs_impact.mp3", "autoAdvance": true },
    { "id": 31, "src": "/audio/slide31_quality_shift.mp3", "autoAdvance": true }
  ]
}
```

Optional cue support (later):
```
"cues":[ { "t": 4.2, "event": "highlightMetric" }, ... ]
```

## 6. React Integration Outline
Add a `NarratedController` component:

Steps:
1. Load manifest (fetch on mount).
2. Maintain index pointer into slides.
3. On Start button click: set `isPlaying = true`, create Audio element for current slide.
4. `audio.onended` triggers `advanceSlide()`:
   - Update SlidePlayer active slide id.
   - Load next audio.
5. Preload next audio (`nextAudio.preload = 'auto'`).

Pseudo logic:
```ts
function playCurrent() {
  audio.src = current.src;
  audio.play();
  audio.onended = advanceSlide;
}
```

Interaction with existing [`SlidePlayer`](react_cogs_demo/src/components/SlidePlayer.tsx:1):
- Expose a prop: `externalActiveSlideId` and `onExternalAdvance`.
- Disable manual navigation during narrated mode (or allow fallback).

## 7. Timing Strategies
Option A (simple): One audio per slide; auto advance on `ended`.
Option B (granular): Single long track with timestamp cue list; use `requestAnimationFrame` to poll `audio.currentTime` and fire events for mid-slide animations (only needed if narration references dynamic transitions not already auto-triggered).

Start with Option A.

## 8. Preloading / Performance
- Keep only current + next Audio elements in memory.
- Use `canplaythrough` event to ensure readiness before hiding the start overlay.
- If buffering detected, show a small "Loading next narration…" toast.

## 9. Failure Handling
- If audio load fails: show toast, start a fallback timer equal to average narration length (e.g. 12s) then advance.
- Log errors to console for debugging.

## 10. Reduced Motion Compatibility
Existing motion variants run immediately; narration does not alter them.
If reduced motion enabled: keep narration but skip any future planned time-synced intra-slide pulses.

## 11. Recording Workflow
1. Generate TTS files matching script in `demo/2b_cogs_reduction.txt`.
2. Place in `public/audio`.
3. Implement controller & manifest.
4. Start app, click "Start Narrated Playback".
5. Use screen recorder (1080p, 60fps recommended).
6. Trim start/end in editor; export final MP4.

## 12. Stretch Enhancements (Optional)
- Add visible progress bar per slide (audio currentTime / duration).
- Add narration transcript overlay toggled by a key (improves accessibility).
- Export automated video via Remotion (would eliminate manual screen recording).

## 13. Feasibility Summary
All required additions are incremental and isolated:
- 1 manifest file
- 1 controller component (~150 lines)
- Minor prop extension to existing player
No architectural blockers; autoplay permission is the only user-interaction requirement. Effort: ~1–2 hours.

## 14. Key Messaging Preservation
Slides continue emphasizing:
- LLM calls 4→1
- GPU capacity ~600→~200 (~67% reduction)
- Quality preference & unified prompt improvements

## 15. Next Implementation Steps
1. Add manifest file.
2. Create `NarratedController.tsx`.
3. Extend `SlidePlayer` for external slide control.
4. Insert controller wrapper in [`App.tsx`](react_cogs_demo/src/App.tsx:1).
5. Test with two sample audio files before full batch.
