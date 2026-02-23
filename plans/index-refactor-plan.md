# Plan: Normalize Indexing to 0-Based + Numeric Segment IDs

## Context

Chapters are 0-indexed but slides are 1-indexed, creating an inconsistency: `ch1:s2` means "2nd chapter (0-based), 2nd slide (1-based)". Segment IDs use arbitrary strings ("intro", "summary"). This plan normalizes both to 0-based numeric indexing so coordinates are uniform: `ch0:s0:0` = first chapter, first slide, first segment.

## Summary of Changes

| Item | Before | After |
|------|--------|-------|
| Slide metadata | `slide: 1` | `slide: 0` |
| Slide export | `Ch0_S1_Title` | `Ch0_S0_Title` |
| Segment ID type | `id: string` ("intro") | `id: number` (0) |
| Audio filename | `s1_segment_01_intro.wav` | `s0_segment_00.wav` |
| Audio dir path | `c0/s1_segment_01_intro.wav` | `c0/s0_segment_00.wav` |
| TTS cache key | `c0/s1_segment_01_intro.wav` | `c0/s0_segment_00.wav` |
| Narration cache key | `ch0:s1:intro` | `ch0:s0:0` |
| CLI filter | `--segments ch1:s2:intro` | `--segments ch1:s1:0` |
| Alignment slide key | `c0_s1` | `c0_s0` |
| Alignment segmentId | `"intro"` | `0` |
| Segment index padding | 1-based (`01`, `02`) | 0-based (`00`, `01`) |

---

## Step 1: Migration Script

**Create `presentation-app/scripts/migrate-0indexed.ts`**

A one-time script that migrates all existing data files before code changes. Supports `--dry-run`.

### What it does:
1. Discovers all demos via filesystem scan of `src/demos/*/metadata.ts`
2. For each demo, loads slide definitions to build a mapping of `{ chapter, oldSlide, newSlide, segmentIndex, oldSegmentId }`
3. **Renames audio files**: `public/audio/{demo}/c{ch}/s{slide}_segment_{pad}_{id}.wav` → new format
4. **Updates `.tts-narration-cache.json`**: renames keys in each demo bucket
5. **Updates `public/narration/{demo}/narration-cache.json`**: renames segment keys
6. **Updates `public/narration/{demo}/narration.json`**: decrements slide numbers, changes segment `id` from string to index
7. **Updates `public/audio/{demo}/alignment.json`**: renames slide keys (`c0_s1` → `c0_s0`), decrements `slide` values, changes `segmentId` from string to number
8. **Updates `public/audio/{demo}/subtitle-corrections.json`**: no segment refs, but verify
9. **Renames preview directories**: `.previews/ch{ch}_s{slide}_{id}` → new format
10. Prints summary of all changes

### Key implementation details:
- Load slides by dynamically importing each demo's `SlidesRegistry.ts` (or parse with regex since we're in Node)
- Since slides are defined in TypeScript, parsing with regex for `slide: N` and `id: 'name'` patterns is more practical than dynamic imports
- Alternatively, scan existing audio files on disk to infer the mapping (filenames encode chapter, slide, index, and ID)
- Use `fs.renameSync` for file renames, atomic JSON writes
- `--dry-run` flag logs changes without executing

---

## Step 2: Framework Type Changes

### 2.1: `src/framework/slides/SlideMetadata.ts`
- `AudioSegment.id`: change type from `string` to `number`
- Update JSDoc to: `/** 0-based segment index (must match position in audioSegments array) */`

### 2.2: `src/framework/utils/audioPath.ts`
- `buildAudioFileName(slide, segmentIndex)` — remove `segmentId` param, remove `+1` offset, drop `_${segmentId}` suffix
  - New: `` `s${slide}_segment_${String(segmentIndex).padStart(2, '0')}.wav` ``
- `buildAudioOutputPath(chapter, slide, segmentIndex)` — remove `segmentId` param
- `buildAudioFilePath(demoId, chapter, slide, segmentIndex)` — remove `segmentId` param
- `resolveAudioFilePath(segment, demoId, chapter, slide, segmentIndex)` — pass `segmentIndex` only (which equals `segment.id`)

### 2.3: `src/framework/utils/audioPath.test.ts`
- Update all expectations to new format

### 2.4: `scripts/utils/narration-cache.ts`
- `buildNarrationCacheKey(chapter, slide, segmentId: number)` — change param type to `number`

### 2.5: `scripts/utils/narration-cache.test.ts`
- Update expectations

### 2.6: `scripts/utils/tts-cache.ts`
- `TtsCacheStore.buildKey(chapter, slide, segmentIndex)` — remove `segmentId` param, remove `+1` offset, drop `_${segmentId}` suffix

### 2.7: `scripts/utils/cli-parser.ts`
- `buildSegmentKey(chapter, slide, segmentId: number)` — change param type to `number`

### 2.8: `src/framework/alignment/types.ts`
- `SegmentAlignment.segmentId`: change from `string` to `number`

---

## Step 3: Framework Components & Hooks

Update all consumers of the changed types. Key files:

- `src/framework/components/DemoPlayer.tsx` — `resolveAudioFilePath` call (drop segmentId arg)
- `src/framework/contexts/SegmentContext.tsx` — `isSegmentVisibleById(id: number)`
- `src/framework/components/StalenessWarning.tsx` — segment lookup type
- `src/framework/hooks/useStalenessCheck.ts` — `ChangedSegmentDetail.segmentId` → number
- `src/framework/hooks/useNarrationEditor.ts` — `EditingSegment.segmentId` → number
- `src/framework/hooks/useTtsRegeneration.ts` — `segmentId` param → number
- `src/framework/hooks/useAudioPlayback.ts` — alignment lookup, signal server params
- `src/framework/utils/narrationLoader.ts` — `NarrationSegment.id` → number, lookup type
- `src/framework/utils/narrationApiClient.ts` — API param types
- `src/framework/utils/ttsClient.ts` — `RegenerateSegmentParams.segmentId`, `SaveGeneratedAudioParams.segmentId` → number; `buildAudioOutputPath` call drops segmentId
- `src/framework/components/NarrationEditModal.tsx` — props and path construction

---

## Step 4: Vite Plugin & Handlers

- `vite-plugin-handlers/types.ts` — `SaveAudioRequest.segmentId` → number
- `vite-plugin-handlers/staleness.ts` — segment key construction, `TtsCacheStore.buildKey` call
- `vite-plugin-handlers/narration.ts` — realign handler, preview handlers
- `vite-plugin-handlers/preview-store.ts` — `getPreviewDir`/`buildServeUrl` segmentId param → number

---

## Step 5: Script Updates

All scripts that construct audio paths or segment keys:

- `scripts/generate-tts.ts` — `buildSegmentKey`, `TtsCacheStore.buildKey`, filename construction
- `scripts/generate-alignment.ts` — slide key construction, `SegmentAlignment.segmentId`
- `scripts/calculate-durations.ts` — filename construction (drop `_${segment.id}`, fix padding)
- `scripts/check-narration.ts` — segment key types
- `scripts/check-tts-cache.ts` — segment key and filename construction
- `scripts/verify-tts.ts` — filename construction
- `scripts/extract-narration.ts` — `NarrationSegment.id` type
- `scripts/record-obs.ts` — segment ID parsing from URL params
- `scripts/utils/vtt-generator.ts` — `SegmentTimingEvent.segmentId` type
- `scripts/utils/narration-loader.ts` (server-side) — `NarrationSegment.id` type, lookup functions

---

## Step 6: Demo Slide Updates

All `src/demos/*/slides/chapters/Chapter*.tsx` files:

1. **Slide numbers**: `slide: N` → `slide: N-1` (decrement by 1)
2. **Segment IDs**: `{ id: 'intro' }` → `{ id: 0 }`, `{ id: 'main' }` → `{ id: 1 }`, etc. (use array position)
3. **Export names**: `Ch0_S1_Title` → `Ch0_S0_Title`
4. **`isSegmentVisibleById` calls**: string args → numeric args (only in example-demo-2)

All `src/demos/*/slides/SlidesRegistry.ts` files — update import names to match new exports.

All `src/demos/*/metadata.ts` files — update `durationInfo.slideBreakdown[].slideIndex` if present (decrement by 1).

---

## Step 7: Test Updates

- `src/framework/utils/audioPath.test.ts` — new expectations (covered in Step 2)
- `scripts/utils/narration-cache.test.ts` — new expectations (covered in Step 2)
- `tests/overflow.spec.ts` — `segmentId` in results → number
- `tests/screenshot.spec.ts` — same
- `tests/record.spec.ts` — same

---

## Step 8: Documentation Updates

- `CLAUDE.md` — update conventions, audio path examples, CLI examples
- `docs/ADDING_DEMOS.md` — segment ID examples
- `docs/MARKERS_GUIDE.md` — segment coordinate examples
- `docs/TTS_GUIDE.md` — CLI examples
- `docs/ARCHITECTURE.md` — slide model description
- `docs/TIMING_SYSTEM.md` — examples
- `scripts/new-demo.ps1` — template uses `slide: 0` and `{ id: 0 }`

---

## Verification

1. `npm run type-check` — zero TypeScript errors
2. `npm run test` — all unit tests pass
3. `npm run lint` — no lint errors
4. `npm run dev` — start dev server and verify a demo plays correctly in the browser
5. `npm run tts:generate -- --demo example-demo-1 --dry-run` (or similar) — verify TTS pipeline recognizes new paths
6. Spot-check that audio files load and play in narrated mode
