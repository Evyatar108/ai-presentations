# Inline Markers Guide

Inline markers enable **sub-segment animations** — revealing content at specific moments during audio playback, synchronized to the narrator's speech. They complement the existing segment-based `<Reveal>` system with finer-grained, time-based control.

## Concept

Segments are the existing unit of animation control — each segment plays one audio file and advances an integer index. Markers go *inside* segments, allowing multiple animation triggers within a single audio file.

| Feature | Segments | Markers |
|---------|----------|---------|
| Granularity | Per audio file | Per word |
| Trigger | Integer index | Audio timestamp |
| Declaration | `audioSegments` array | `{#id}` tokens in narrationText |
| Component | `<Reveal from={N}>` | `<RevealAtMarker at="id">` |
| Data source | Slide metadata | alignment.json (generated) |

## Marker Syntax

Markers are inline tokens embedded in `narrationText`. Two anchor modes:

### Forward anchor: `{#id}`

Resolves to the **start time** of the word immediately **after** the marker.

```
"Let me show you the {#pipeline}four-stage pipeline."
                      ↑ resolves to start of "four-stage"
```

### Backward anchor: `{id#}`

Resolves to the **end time** of the word immediately **before** the marker.

```
"The four-stage pipeline{done#} is powerful."
                        ↑ resolves to end of "pipeline"
```

### Combining markers

Use multiple markers in the same narration text for overlapping animations:

```tsx
narrationText: "Let me show you the {#pipeline}four-stage pipeline.{done-pipeline#} {#llm}The transcript goes into an LLM,{done-llm#} {#topics}which extracts key topics."
```

## Pipeline Flow

```
narrationText with {#markers}     (author embeds point markers in text)
       |
  [tts:generate]                  (strips markers → clean text → TTS)
       |
  [tts:align + WhisperX]          (forced alignment → resolve marker timestamps)
       |
  alignment.json                  (word timestamps + marker→time mapping)
       |
  [NarratedController timeupdate] (pipes audio.currentTime into AudioTimeContext)
       |
  <RevealAtMarker> / useMarker()  (slide components consume time-based triggers)
```

### Step by step

1. Author writes narration text with `{#id}` markers
2. `npm run tts:generate` strips markers, sends clean text to TTS
3. `npm run tts:align` sends audio + clean text to WhisperX, resolves marker positions to word timestamps
4. Result stored in `public/audio/{demoId}/alignment.json`
5. At runtime, `DemoPlayer` loads alignment data, `NarratedController` feeds `audio.currentTime` to `AudioTimeContext`
6. `<RevealAtMarker>` and `useMarker()` consume timestamps from context

## `<RevealAtMarker>` Component

### Progressive reveal (stays visible once reached)

```tsx
<RevealAtMarker at="pipeline" animation={fadeUp}>
  <PipelineDiagram />
</RevealAtMarker>
```

Visible when `currentTime >= marker("pipeline").time`.

### Bounded range (visible only during range)

```tsx
<RevealAtMarker from="llm" until="topics">
  <LLMHighlight />
</RevealAtMarker>
```

Visible when `marker("llm").time <= currentTime < marker("topics").time`.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `at` | `string` | Marker ID for progressive reveal (mutually exclusive with `from`/`until`) |
| `from` | `string` | Start marker ID for bounded range |
| `until` | `string` | End marker ID for bounded range |
| `animation` | `RevealAnimation` | Entrance animation (default: `fadeIn`) |
| `exitAnimation` | `RevealAnimation` | Exit animation |
| `as` | `'div' \| 'span' \| 'li' \| ...` | HTML element type (default: `'div'`) |
| `className` | `string` | CSS class |
| `style` | `CSSProperties` | Inline styles |

## Hooks

### `useMarker(id: string): MarkerState`

Check if a single marker has been reached. Progressive: stays true.

```tsx
const { time, reached } = useMarker("pipeline");
// time: number | null — resolved timestamp
// reached: boolean — currentTime >= time
```

### `useMarkerRange(fromId, untilId): MarkerRangeState`

Check if current time is within a range between two markers.

```tsx
const { within, progress, fromTime, untilTime } = useMarkerRange("llm", "topics");
// within: boolean — currently in range
// progress: number — 0→1 through the range
```

### `useAudioTime(): AudioTimeState`

Raw audio time for fully custom logic.

```tsx
const { currentTime, duration } = useAudioTime();
```

### `useWordHighlight(): WordHighlightState`

Karaoke-style word highlighting.

```tsx
const { words, currentWordIndex, currentWord } = useWordHighlight();
```

## Graceful Degradation

When `alignment.json` is missing (e.g., markers haven't been aligned yet):

- `<RevealAtMarker>` renders children **immediately** (visible without sync)
- `useMarker()` returns `{ time: null, reached: true }`
- `useMarkerRange()` returns `{ within: true, progress: 0 }`

This means slides with markers work correctly even before alignment data exists — content just appears without waiting for the narrator.

## End-to-End Example

### 1. Add markers to narration text

```tsx
// In slides/chapters/Chapter1.tsx
export const Ch1_S2_Pipeline = defineSlide({
  metadata: {
    chapter: 1,
    slide: 2,
    title: 'The Pipeline',
    audioSegments: [
      {
        id: 'explain',
        narrationText: 'Our system uses a {#pipeline}four-stage pipeline. {#stage1}First, we transcribe the audio.{stage1-done#} {#stage2}Then we extract key topics.',
      },
    ],
  },
  component: PipelineSlide,
});

const PipelineSlide = ({ segment }: { segment: number }) => (
  <SlideContainer>
    <SlideTitle>The Pipeline</SlideTitle>

    <RevealAtMarker at="pipeline" animation={fadeUp}>
      <PipelineDiagram />
    </RevealAtMarker>

    <RevealAtMarker at="stage1" animation={fadeUp}>
      <StageDetail stage={1} />
    </RevealAtMarker>

    <RevealAtMarker at="stage2" animation={fadeUp}>
      <StageDetail stage={2} />
    </RevealAtMarker>
  </SlideContainer>
);
```

### 2. Generate audio

```bash
npm run tts:generate -- --demo my-demo
# Strips {#markers} before sending to TTS — audio sounds natural
```

### 3. Generate alignment

```bash
npm run tts:align -- --demo my-demo
# Creates public/audio/my-demo/alignment.json with word timestamps + marker times
```

### 4. Test

Open in browser — content appears synchronized to the narrator's speech.

## Marker-Driven Video Seeks

Markers can do more than reveal UI — they can also **seek a video to a specific timestamp** when the narrator reaches a word. This mirrors the `<RevealAtMarker>` pattern but fires a video seek instead of a visibility change.

### How it works

| Step | What happens |
|------|--------------|
| `{#id}` in narrationText | Marks the trigger word in audio |
| `videoSeeks` on `AudioSegment` | Declares which video + bookmark to seek to |
| `bookmarks.json` | Maps bookmark IDs to video timestamps (`public/videos/{demoId}/bookmarks.json`) |
| `VideoSyncContext` | Routes the seek to the registered `<VideoPlayer>` at 60fps via the RAF loop |

### Author workflow

1. Put your MP4 at `public/videos/{demo-id}/demo.mp4`
2. Add `<VideoPlayer videoPath="..." videoId="demo-vid" isPlaying={segment >= 0} />` to your slide
3. In dev mode, open the 📹 **Videos** button in the ProgressBar toolbar
4. Select the video, scrub to a key moment, click **📌 Add Bookmark at current time**, set an ID (e.g., `scene2`), save
5. Add `{#scene2}` to the relevant `narrationText` and run `npm run tts:align -- --demo {id}`
6. Add `videoSeeks` to the segment in the slide metadata:

```tsx
audioSegments: [
  {
    id: 0,
    narrationText: 'And here we can see {#scene2}the second scene in action.',
    videoSeeks: [
      { videoId: 'demo-vid', bookmarkId: 'scene2', atMarker: 'scene2' }
    ],
  },
],
```

7. Play in narrated mode — the video seeks to the bookmarked timestamp the moment the narrator says "scene2".

### `VideoSeekTrigger` fields

| Field | Type | Description |
|-------|------|-------------|
| `videoId` | `string` | Key in `bookmarks.json` videos map; must match the `videoId` prop on `<VideoPlayer>` |
| `bookmarkId` | `string` | ID of the bookmark to seek to |
| `atMarker` | `string` | TTS marker ID (`{#id}` system) that fires the seek |
| `pauseNarration` | `boolean?` | If `true`: pause TTS, play clip start→end, resume when clip ends (Pattern 1) |
| `autoPlay` | `boolean?` | `true` (default) = seek + play; `false` = seek + pause (freeze frame) |
| `endBookmarkId` | `string?` | Bookmark whose time is the clip end; plays to `video.onended` if absent |
| `playbackRate` | `number?` | Playback speed multiplier (default `1`); e.g. `3` = 3x fast-forward |

### `VideoBookmark` fields (in bookmarks.json)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Bookmark identifier, referenced by `VideoSeekTrigger.bookmarkId` |
| `time` | `number` | Seek target timestamp (seconds) |
| `label` | `string?` | Human-readable description (editor only) |

Bookmarks are pure named timestamps. Playback behavior (`autoPlay`, `endTime`) lives on `VideoSeekTrigger` — the same bookmark can be played differently in different contexts.

### Narration-Pausing Video Clips (Three Patterns)

When a trigger has `endBookmarkId` set, you can control how TTS and the video clip interact.

---

#### Pattern 1 — TTS yields to clip (`pauseNarration: true`)

TTS pauses at the marker, clip plays from `bookmarkId` to `endBookmarkId`, TTS resumes from where it was paused.

```
Timeline:
TTS:  ──────────────── PAUSE ─── (clip plays) ───────────────────────►
Video:                 ├──── bookmark → endBookmark ──────┤ (frozen)
                       ↑ {#demo-clip} fires               ↑ TTS resumes
```

```tsx
// narrationText
"Let me show you the full workflow. {#demo-clip}
 Now that you've seen it, let's break down each step."

// AudioSegment
videoSeeks: [
  { videoId: 'demo', bookmarkId: 'clip1', atMarker: 'demo-clip', pauseNarration: true }
]
```

---

#### Pattern 2 — Clip overlays TTS (no pause)

Clip starts at the marker, TTS keeps narrating in parallel. When the clip reaches `endBookmarkId`'s timestamp, the video freezes on the last frame — TTS continues to completion.

```
Timeline:
TTS:  ──────────────────────────────────────────────────────────────►
Video:              ├── clip plays ──┤ (frozen at endTime)
                    ↑ {#side-clip}
```

```tsx
// narrationText
"While I walk through the architecture {#side-clip}
 you can see the system processing requests on the right.
 Notice the latency stays under 100ms throughout."

// AudioSegment
videoSeeks: [
  { videoId: 'demo', bookmarkId: 'clip-overlay', atMarker: 'side-clip', pauseNarration: false }
]
```

No `videoWaits` needed. When the clip reaches the end bookmark, it auto-pauses and freezes. TTS finishes naturally.

---

#### Pattern 3 — TTS leads, then waits (`videoWaits`)

TTS narrates alongside the clip, but at a *later* marker it pauses and waits for the clip to finish. If the clip already finished, TTS continues uninterrupted.

```
Timeline (clip still active at {#after-clip}):
TTS:  ───────────────── (narrating) ───── PAUSE ─── RESUME ►
Video:        ├── clip plays ───────────────┤ (frozen)
              ↑ {#start-clip}  ↑ {#after-clip} → clip active → TTS waits
                                             ↑ clip ends → TTS resumes

Timeline (clip already done before {#after-clip}):
TTS:  ──────────────────────────────────────────────────────────────►
Video:        ├── clip plays ──┤ (frozen)
              ↑ {#start-clip}              ↑ {#after-clip} → clip done → TTS continues
```

```tsx
// narrationText
"Watch the three phases carefully. {#start-clip}
 In phase one the data is ingested, in phase two it is transformed,
 and in phase three {#after-clip} results are published."

// AudioSegment
videoSeeks: [
  { videoId: 'demo', bookmarkId: 'clip1', atMarker: 'start-clip', pauseNarration: false }
],
videoWaits: [
  { videoId: 'demo', bookmarkId: 'clip1', atMarker: 'after-clip' }
]
```

### `VideoWaitTrigger` fields

| Field | Type | Description |
|-------|------|-------------|
| `videoId` | `string` | Key in `bookmarks.json` videos map |
| `bookmarkId` | `string` | Which clip (bookmark) to wait for |
| `atMarker` | `string` | TTS marker at which to check/wait |

### Graceful degradation

- A demo without `bookmarks.json` plays normally — `VideoSyncContext` has no triggers to fire
- A `<VideoPlayer>` without `videoId` works unchanged (no registration)
- A `VideoSeekTrigger` whose marker hasn't been aligned yet simply never fires
- `endBookmarkId` absent → clip plays until `video.onended`, then the `onDone` callback fires
- Segment change mid-clip → stale callbacks do not fire (generation counter guard)

---

## Cache Behavior

Markers are transparent to the TTS cache. Both the narration cache (`narration-cache.json`) and the TTS cache (`.tts-narration-cache.json`) strip markers before hashing and comparison. This means:

- **Adding or moving markers** in narration text does **not** trigger TTS regeneration
- Only changes to the actual spoken text or instruct require new audio
- The `npm run dev` startup check (Step 3) validates that all markers have resolved timestamps in `alignment.json`. If you say "yes" to regenerate, the script auto-chains `tts:align` after `tts:generate` for all affected demos — no manual alignment step needed
- If you skip the dev-start prompt, a **staleness review panel** appears in the browser (manual mode only) listing each changed segment with per-segment **Play**, **Regen**, and **Edit** buttons plus a **Fix All** button that runs batch TTS generation + full-demo alignment. A "Batch TTS" checkbox (on by default) sends all segments to the GPU in one call. The panel is dismissed per session and reappears on page refresh

## CLI Commands

| Command | Description |
|---------|-------------|
| `npm run tts:generate -- --demo {id}` | Generate TTS audio (strips markers automatically) |
| `npm run tts:align -- --demo {id}` | Generate alignment + resolve markers |
| `npm run tts:align -- --demo {id} --force` | Regenerate alignment (ignore cache) |
| `npm run tts:align -- --demo {id} --segments ch1:s2:explain` | Align specific segments only |

## Navigating Markers in Manual Mode

In **manual mode**, markers are navigable via keyboard and a clickable marker dots UI. This makes it possible to preview marker-driven animations without listening to the audio.

### Arrow key navigation

Arrow keys step through markers within a segment before advancing to the next segment/slide. The full navigation hierarchy is: markers → segments → slides → chapters (when chapter mode is enabled via `DemoConfig.chapters`). Use `PageUp`/`PageDown` to jump between chapters.

1. **ArrowRight** — jumps to the next marker in the current segment. If at the last marker (or no markers), advances to the next segment/slide as usual.
2. **ArrowLeft** — jumps to the previous marker. If before the first marker, goes back to the previous segment/slide.

This works in both audio-enabled and muted manual modes.

### Marker dots UI

When a segment has resolved markers, a navigation row appears above the segment dots (order top-to-bottom: markers → segments → slides → chapters when enabled):

- `◀`/`▶` arrow buttons to step through markers
- Diamond-shaped dots (one per marker), labeled "Markers:"
- **Click** any dot to seek to that marker's timestamp
- Current marker is highlighted with the primary theme color; passed markers are semi-transparent; future markers are muted
- Hover/aria-labels show the marker ID

### AudioTimeContext seek API

`AudioTimeContext` exposes `seekToTime(t)` for programmatic navigation:

```tsx
const audioTimeCtx = useAudioTimeContext();
audioTimeCtx.seekToTime(markerTime); // updates UI + audio position
```

The `registerSeekHandler(fn)` method lets `NarratedController` connect its `<audio>` element to the seek API.

### Screenshot captures at marker positions

Use `--markers` with `test:screenshot` to capture the visual state at marker positions:

```bash
npm run test:screenshot -- --demo my-demo --markers all
npm run test:screenshot -- --demo my-demo --markers pipeline,stage1
```

Screenshots are named `c{ch}_s{slide}_seg{idx}_{segId}_marker_{markerId}.png`.
