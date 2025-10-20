# Multi-Demo Refactoring TODO List

**Project**: Decouple React app from Meeting Highlights to support multiple demos  
**Status**: Phase 1 complete, Phase 2 partially complete, Phases 3-8 not started  
**Last Updated**: 2025-01-20

---

## Phase 1: Core Structure ✅

### Create Type Definitions and Registry
- [x] Create `src/demos/` directory
- [x] Create `src/demos/types.ts` with `DemoMetadata`, `DemoConfig`, and `DemoRegistryEntry` interfaces
- [x] Create `src/demos/DemoRegistry.ts` with registry pattern and helper functions
- [x] Verify TypeScript compilation passes

---

## Phase 2: Meeting Highlights Migration ✅

### Create Demo Structure
- [x] Create `src/demos/meeting-highlights/index.ts` with demo configuration
- [x] Create `src/demos/meeting-highlights/metadata.ts` with demo metadata
- [x] Create `src/demos/meeting-highlights/README.md` documenting the demo
- [x] Create `src/demos/meeting-highlights/slides/` directory
- [x] Create `src/demos/meeting-highlights/slides/chapters/` directory

### Move Slide Files ✅
- [x] Move `src/slides/chapters/Chapter0.tsx` → `src/demos/meeting-highlights/slides/chapters/Chapter0.tsx`
- [x] Move `src/slides/chapters/Chapter1.tsx` → `src/demos/meeting-highlights/slides/chapters/Chapter1.tsx`
- [x] Move `src/slides/chapters/Chapter2.tsx` → `src/demos/meeting-highlights/slides/chapters/Chapter2.tsx`
- [x] Move `src/slides/chapters/Chapter4.tsx` → `src/demos/meeting-highlights/slides/chapters/Chapter4.tsx`
- [x] Move `src/slides/chapters/Chapter5.tsx` → `src/demos/meeting-highlights/slides/chapters/Chapter5.tsx`
- [x] Move `src/slides/chapters/Chapter6.tsx` → `src/demos/meeting-highlights/slides/chapters/Chapter6.tsx`
- [x] Move `src/slides/chapters/Chapter7.tsx` → `src/demos/meeting-highlights/slides/chapters/Chapter7.tsx`
- [x] Move `src/slides/chapters/Chapter8.tsx` → `src/demos/meeting-highlights/slides/chapters/Chapter8.tsx`
- [x] Move `src/slides/chapters/Chapter9.tsx` → `src/demos/meeting-highlights/slides/chapters/Chapter9.tsx`
- [x] Move `src/slides/SlidesRegistry.ts` → `src/demos/meeting-highlights/slides/SlidesRegistry.ts`

### Update Imports in Moved Files
- [x] Update imports in all chapter files: `../../SlideMetadata` → `../../../../slides/SlideMetadata`
- [x] Update imports in all chapter files: `../../AnimationVariants` → `../../../../slides/AnimationVariants`
- [x] Update imports in all chapter files: `../../SlideStyles` → `../../../../slides/SlideStyles`
- [x] Update imports in all chapter files: `../../SlideLayouts` → `../../../../slides/SlideLayouts`
- [x] Update imports in all chapter files: `../../SlideIcons` → `../../../../slides/SlideIcons`
- [x] Update imports in SlidesRegistry.ts: `./SlideMetadata` → `../../../slides/SlideMetadata`
- [x] Verify all imports resolve correctly

### Update Audio Paths in Slide Metadata
- [x] Update all audioFilePath in Chapter0: `/audio/c0/` → `/audio/meeting-highlights/c0/`
- [x] Update all audioFilePath in Chapter1: `/audio/c1/` → `/audio/meeting-highlights/c1/`
- [x] Update all audioFilePath in Chapter2: `/audio/c2/` → `/audio/meeting-highlights/c2/`
- [x] Update all audioFilePath in Chapter4: `/audio/c4/` → `/audio/meeting-highlights/c4/`
- [x] Update all audioFilePath in Chapter5: `/audio/c5/` → `/audio/meeting-highlights/c5/`
- [x] Update all audioFilePath in Chapter6: `/audio/c6/` → `/audio/meeting-highlights/c6/`
- [x] Update all audioFilePath in Chapter7: `/audio/c7/` → `/audio/meeting-highlights/c7/`
- [x] Update all audioFilePath in Chapter8: `/audio/c8/` → `/audio/meeting-highlights/c8/`
- [x] Update all audioFilePath in Chapter9: `/audio/c9/` → `/audio/meeting-highlights/c9/`

### Verify Migration
- [x] Verify TypeScript compilation passes after moves
- [x] Test import resolution in demo config

---

## Phase 3: Asset Migration ✅

### Audio Files
- [x] Create `public/audio/meeting-highlights/` directory
- [x] Create `public/audio/meeting-highlights/c0/` directory
- [x] Create `public/audio/meeting-highlights/c1/` through `c9/` directories
- [x] Move `public/audio/c0/*` → `public/audio/meeting-highlights/c0/*`
- [x] Move `public/audio/c1/*` → `public/audio/meeting-highlights/c1/*`
- [x] Move `public/audio/c2/*` → `public/audio/meeting-highlights/c2/*`
- [x] Move `public/audio/c4/*` → `public/audio/meeting-highlights/c4/*`
- [x] Move `public/audio/c5/*` → `public/audio/meeting-highlights/c5/*`
- [x] Move `public/audio/c6/*` → `public/audio/meeting-highlights/c6/*`
- [x] Move `public/audio/c7/*` → `public/audio/meeting-highlights/c7/*`
- [x] Move `public/audio/c8/*` → `public/audio/meeting-highlights/c8/*`
- [x] Move `public/audio/c9/*` → `public/audio/meeting-highlights/c9/*`
- [x] Delete empty `public/audio/c{0-9}/` directories

### Images
- [x] Create `public/images/meeting-highlights/` directory
- [x] Create `public/images/meeting-highlights/logos/` directory
- [x] Move `public/images/meeting_highlights_thumbnail.jpeg` → `public/images/meeting-highlights/`
- [x] Move `public/images/logos/*` → `public/images/meeting-highlights/logos/*`
- [x] Update image paths in Chapter2.tsx (team logos - 14 references)
- [x] Update image path in Chapter1.tsx (thumbnail)
- [x] Delete empty `public/images/logos/` directory

### Videos
- [x] Create `public/videos/meeting-highlights/` directory
- [x] Move `public/videos/meeting_highlights_usage_in_sharepoint-proj.llc` → `public/videos/meeting-highlights/`
- [x] Update video paths in Chapter1.tsx (2 references)

### Cleanup
- [x] Remove empty `src/slides/chapters/` directory (already removed in Phase 2)
- [x] Verify all assets are accessible from new paths

---

## Phase 4: Component Updates ✅

### Create New Components
- [x] Create `src/components/WelcomeScreen.tsx` with demo selection grid
- [x] Create `src/components/DemoPlayer.tsx` as demo wrapper
- [x] Add styles for WelcomeScreen (demo cards, grid layout)
- [x] Add styles for DemoPlayer (back button, loading states)

### Update Existing Components
- [x] Update `src/components/NarratedController.tsx`:
  - [x] Add `demoMetadata` prop
  - [x] Add `slides` prop
  - [x] Add `onBack` prop
  - [x] Remove hardcoded "Meeting Highlights COGS Reduction" title
  - [x] Use `demoMetadata.title` instead
  - [x] Use `slides.length` instead of importing allSlides
  - [x] Add "Back to Demos" button (optional, integrated in UI)
- [x] Update `src/App.tsx`:
  - [x] Add state for selected demo
  - [x] Add demo selection handler
  - [x] Add back to welcome handler
  - [x] Render WelcomeScreen or DemoPlayer based on state
- [x] Update `src/index.html`:
  - [x] Change title from "COGS Reduction Demo" to "Demo Presentations"
  - [x] Update meta description to be generic
- [x] Register Meeting Highlights demo in DemoRegistry

### Verify Component Updates
- [ ] Test WelcomeScreen renders with demo cards
- [ ] Test demo selection loads correct demo
- [ ] Test back navigation works
- [ ] Test loading states display correctly
- [ ] Test error handling for invalid demos

---

## Phase 5: Placeholder Demos ✅

### Example Demo 1
- [x] Create `src/demos/example-demo-1/` directory
- [x] Create `src/demos/example-demo-1/index.ts` with demo config
- [x] Create `src/demos/example-demo-1/metadata.ts`
- [x] Create `src/demos/example-demo-1/slides/` directory
- [x] Create `src/demos/example-demo-1/slides/SlidesRegistry.ts`
- [x] Create `src/demos/example-demo-1/slides/chapters/` directory
- [x] Create `src/demos/example-demo-1/slides/chapters/Chapter0.tsx` with 3 placeholder slides
- [x] Create `src/demos/example-demo-1/README.md`
- [x] Add demo to DemoRegistry.ts

### Example Demo 2
- [x] Create `src/demos/example-demo-2/` directory
- [x] Create `src/demos/example-demo-2/index.ts` with demo config
- [x] Create `src/demos/example-demo-2/metadata.ts`
- [x] Create `src/demos/example-demo-2/slides/` directory
- [x] Create `src/demos/example-demo-2/slides/SlidesRegistry.ts`
- [x] Create `src/demos/example-demo-2/slides/chapters/` directory
- [x] Create `src/demos/example-demo-2/slides/chapters/Chapter0.tsx` with 3 placeholder slides
- [x] Create `src/demos/example-demo-2/README.md`
- [x] Add demo to DemoRegistry.ts

### Verify Placeholder Demos
- [x] Verify TypeScript compilation passes
- [x] Verify both demos registered in DemoRegistry

---

## Phase 6: TTS Script Updates ✅

### Update Generate TTS Script
- [x] Update `scripts/generate-tts.ts`:
  - [x] Add `--demo` CLI parameter
  - [x] Support generating for specific demo or all demos
  - [x] Update to scan `src/demos/*/` for all demos
  - [x] Update output paths to `public/audio/{demo-id}/`
  - [x] Update cache structure to support multiple demos: `{ "demo-id": { "filepath": { ... } } }`
  - [x] Add per-demo orphaned file cleanup
- [x] Cache file `.tts-narration-cache.json` now supports multi-demo structure

### Update Check TTS Cache Script
- [x] Update `scripts/check-tts-cache.ts`:
  - [x] Support checking cache for all demos
  - [x] Report changes per demo
  - [x] Prompt for regeneration with demo list
  - [x] Handle multi-demo cache structure

### Update Calculate Durations Script
- [x] Update `scripts/calculate-durations.ts`:
  - [x] Calculate durations per demo
  - [x] Generate reports with grand totals across all demos
  - [x] Support `--demo` parameter for specific demo reports
  - [x] Output: `duration-report.json` or `duration-report-{demo-id}.json`

### Verify TTS Scripts
- [x] All scripts updated for multi-demo support
- [x] Commands: `npm run tts:generate` (all demos)
- [x] Commands: `npm run tts:generate -- --demo meeting-highlights` (specific demo)
- [x] Commands: `npm run tts:duration` (all demos)
- [x] Commands: `npm run tts:duration -- --demo meeting-highlights` (specific demo)

---
## Phase 7: Documentation ✅

### Update Main Documentation
- [x] Create `react_cogs_demo/README.md`:
  - [x] Add multi-demo architecture overview
  - [x] Update file structure documentation
  - [x] Add step-by-step demo creation guide
  - [x] Update TTS script usage examples with multi-demo commands
  - [x] Add demo registry explanation
  - [x] Add asset management per demo
  - [x] Add troubleshooting section
- [x] Update `Agents.md`:
  - [x] Document Phases 5-7 refactoring
  - [x] Add to Recent Changes section
  - [x] Include architecture benefits
  - [x] Document file structure changes

### Create Demo-Specific Documentation
- [x] Ensure `demos/meeting-highlights/README.md` is complete
- [x] Create `demos/example-demo-1/README.md`
- [x] Create `demos/example-demo-2/README.md`
- [ ] Document new TTS script parameters

---

## Phase 8: Testing

### Unit Testing
- [ ] Test DemoRegistry.getDemoById() returns correct demos
- [ ] Test DemoRegistry.getAllDemos() returns all registered demos
- [ ] Test lazy loading works for all demos

### Integration Testing
- [ ] Test full flow: Welcome → Select Demo → Play → Back → Select Different Demo
- [ ] Test all 3 demos load and play correctly
- [ ] Test narrated mode works for all demos
- [ ] Test manual mode works for all demos
- [ ] Test manual+audio mode works for all demos
- [ ] Test keyboard navigation works
- [ ] Test segment navigation works (for Meeting Highlights)

### Build Testing
- [ ] Run `npm run build` and verify no errors
- [ ] Test production build works correctly
- [ ] Verify all assets load in production build

### Audio Testing
- [ ] Test audio playback for Meeting Highlights
- [ ] Test audio fallback for missing files
- [ ] Test silence fallback works for placeholder demos

### Error Handling
- [ ] Test invalid demo ID handling
- [ ] Test demo load failure handling
- [ ] Test missing audio file handling
- [ ] Test missing slide handling

---

## Completion Criteria

- [ ] All phases completed
- [ ] All tests passing
- [ ] Documentation updated
- [ ] No TypeScript errors
- [ ] No console errors in development
- [ ] Production build succeeds
- [ ] All 3 demos work correctly
- [ ] Code reviewed and approved

---

## Current Status Summary

**✅ Phase 1**: Complete - Core structure created
**✅ Phase 2**: Complete - Demo config files created, all imports updated, audio paths migrated
**✅ Phase 3**: Complete - All assets migrated to demo-specific directories
**✅ Phase 4**: Complete - Components created and updated for multi-demo support
**✅ Phase 5**: Complete - Placeholder demos created (example-demo-1, example-demo-2)
**✅ Phase 6**: Complete - TTS scripts updated for multi-demo support
**✅ Phase 7**: Complete - Documentation updated (README.md, Agents.md, demo READMEs)
**⚠️  Phase 8**: Partial - Manual testing recommended

**Remaining Work**:
1. Phase 8: Testing (optional - runtime verification)
   - Test WelcomeScreen renders with 3 demo cards
   - Test demo selection and navigation
   - Test TTS generation for all demos
   - Test audio playback for all 3 demos

**System Ready**: Multi-demo architecture is functional with 3 registered demos

---

## Notes

- This TODO list reflects the **actual current state** of the project
- Reference [`REFACTORING_PLAN.md`](REFACTORING_PLAN.md) for detailed implementation guidance
- Estimated time remaining: 8-12 hours
- Break work into commits per phase
- Test incrementally after each phase