# Multi-Demo Refactoring TODO List

**Project**: Decouple React app from Meeting Highlights to support multiple demos  
**Status**: Architecture planning complete, ready for implementation  
**Last Updated**: 2025-01-20

---

## Phase 1: Core Structure ✅

### Create Type Definitions and Registry
- [ ] Create `src/demos/` directory
- [ ] Create `src/demos/types.ts` with `DemoMetadata`, `DemoConfig`, and `DemoRegistryEntry` interfaces
- [ ] Create `src/demos/DemoRegistry.ts` with registry pattern and helper functions
- [ ] Verify TypeScript compilation passes

---

## Phase 2: Meeting Highlights Migration

### Create Demo Structure
- [ ] Create `src/demos/meeting-highlights/` directory
- [ ] Create `src/demos/meeting-highlights/index.ts` with demo configuration
- [ ] Create `src/demos/meeting-highlights/metadata.ts` with demo metadata
- [ ] Create `src/demos/meeting-highlights/README.md` documenting the demo
- [ ] Create `src/demos/meeting-highlights/slides/` directory
- [ ] Create `src/demos/meeting-highlights/slides/chapters/` directory

### Move Slide Files
- [ ] Move `src/slides/chapters/Chapter0.tsx` → `src/demos/meeting-highlights/slides/chapters/Chapter0.tsx`
- [ ] Move `src/slides/chapters/Chapter1.tsx` → `src/demos/meeting-highlights/slides/chapters/Chapter1.tsx`
- [ ] Move `src/slides/chapters/Chapter2.tsx` → `src/demos/meeting-highlights/slides/chapters/Chapter2.tsx`
- [ ] Move `src/slides/chapters/Chapter4.tsx` → `src/demos/meeting-highlights/slides/chapters/Chapter4.tsx`
- [ ] Move `src/slides/chapters/Chapter5.tsx` → `src/demos/meeting-highlights/slides/chapters/Chapter5.tsx`
- [ ] Move `src/slides/chapters/Chapter6.tsx` → `src/demos/meeting-highlights/slides/chapters/Chapter6.tsx`
- [ ] Move `src/slides/chapters/Chapter7.tsx` → `src/demos/meeting-highlights/slides/chapters/Chapter7.tsx`
- [ ] Move `src/slides/chapters/Chapter8.tsx` → `src/demos/meeting-highlights/slides/chapters/Chapter8.tsx`
- [ ] Move `src/slides/chapters/Chapter9.tsx` → `src/demos/meeting-highlights/slides/chapters/Chapter9.tsx`
- [ ] Move `src/slides/SlidesRegistry.ts` → `src/demos/meeting-highlights/slides/SlidesRegistry.ts`

### Update Imports in Moved Files
- [ ] Update imports in all chapter files: `../../SlideMetadata` → `../../../../slides/SlideMetadata`
- [ ] Update imports in all chapter files: `../../AnimationVariants` → `../../../../slides/AnimationVariants`
- [ ] Update imports in all chapter files: `../../SlideStyles` → `../../../../slides/SlideStyles`
- [ ] Update imports in all chapter files: `../../SlideLayouts` → `../../../../slides/SlideLayouts`
- [ ] Update imports in all chapter files: `../../SlideIcons` → `../../../../slides/SlideIcons`
- [ ] Update imports in SlidesRegistry.ts: `./chapters/*` → `./chapters/*` (no change)
- [ ] Update imports in SlidesRegistry.ts: `./SlideMetadata` → `../../../slides/SlideMetadata`

### Update Audio Paths in Slide Metadata
- [ ] Update all audioFilePath in Chapter0: `/audio/c0/` → `/audio/meeting-highlights/c0/`
- [ ] Update all audioFilePath in Chapter1: `/audio/c1/` → `/audio/meeting-highlights/c1/`
- [ ] Update all audioFilePath in Chapter2: `/audio/c2/` → `/audio/meeting-highlights/c2/`
- [ ] Update all audioFilePath in Chapter4: `/audio/c4/` → `/audio/meeting-highlights/c4/`
- [ ] Update all audioFilePath in Chapter5: `/audio/c5/` → `/audio/meeting-highlights/c5/`
- [ ] Update all audioFilePath in Chapter6: `/audio/c6/` → `/audio/meeting-highlights/c6/`
- [ ] Update all audioFilePath in Chapter7: `/audio/c7/` → `/audio/meeting-highlights/c7/`
- [ ] Update all audioFilePath in Chapter8: `/audio/c8/` → `/audio/meeting-highlights/c8/`
- [ ] Update all audioFilePath in Chapter9: `/audio/c9/` → `/audio/meeting-highlights/c9/`

### Verify Migration
- [ ] Verify TypeScript compilation passes after moves
- [ ] Test import resolution in demo config

---

## Phase 3: Asset Migration

### Audio Files
- [ ] Create `public/audio/meeting-highlights/` directory
- [ ] Create `public/audio/meeting-highlights/c0/` directory
- [ ] Create `public/audio/meeting-highlights/c1/` through `c9/` directories
- [ ] Move `public/audio/c0/*` → `public/audio/meeting-highlights/c0/*`
- [ ] Move `public/audio/c1/*` → `public/audio/meeting-highlights/c1/*`
- [ ] Move `public/audio/c2/*` → `public/audio/meeting-highlights/c2/*`
- [ ] Move `public/audio/c4/*` → `public/audio/meeting-highlights/c4/*`
- [ ] Move `public/audio/c5/*` → `public/audio/meeting-highlights/c5/*`
- [ ] Move `public/audio/c6/*` → `public/audio/meeting-highlights/c6/*`
- [ ] Move `public/audio/c7/*` → `public/audio/meeting-highlights/c7/*`
- [ ] Move `public/audio/c8/*` → `public/audio/meeting-highlights/c8/*`
- [ ] Move `public/audio/c9/*` → `public/audio/meeting-highlights/c9/*`
- [ ] Delete empty `public/audio/c{0-9}/` directories

### Images
- [ ] Create `public/images/meeting-highlights/` directory
- [ ] Create `public/images/meeting-highlights/logos/` directory
- [ ] Move `public/images/meeting_highlights_thumbnail.jpeg` → `public/images/meeting-highlights/`
- [ ] Move `public/images/logos/*` → `public/images/meeting-highlights/logos/*`
- [ ] Update image paths in Chapter2.tsx (team logos)
- [ ] Delete empty `public/images/logos/` directory

### Videos
- [ ] Create `public/videos/meeting-highlights/` directory
- [ ] Move `public/videos/meeting_highlights_usage_in_sharepoint-proj.llc` → `public/videos/meeting-highlights/`
- [ ] Update video paths in slides that reference videos

### Cleanup
- [ ] Remove empty `src/slides/chapters/` directory
- [ ] Verify all assets are accessible from new paths

---

## Phase 4: Component Updates

### Create New Components
- [ ] Create `src/components/WelcomeScreen.tsx` with demo selection grid
- [ ] Create `src/components/DemoPlayer.tsx` as demo wrapper
- [ ] Add styles for WelcomeScreen (demo cards, grid layout)
- [ ] Add styles for DemoPlayer (back button, loading states)

### Update Existing Components
- [ ] Update `src/components/NarratedController.tsx`:
  - [ ] Add `demoMetadata` prop
  - [ ] Add `slides` prop
  - [ ] Add `onBack` prop
  - [ ] Remove hardcoded "Meeting Highlights COGS Reduction" title
  - [ ] Use `demoMetadata.title` instead
  - [ ] Use `slides.length` instead of importing allSlides
  - [ ] Add "Back to Demos" button
- [ ] Update `src/App.tsx`:
  - [ ] Add state for selected demo
  - [ ] Add state for demo config
  - [ ] Add demo selection handler
  - [ ] Add back to welcome handler
  - [ ] Add loading and error states
  - [ ] Render WelcomeScreen or DemoPlayer based on state
- [ ] Update `src/index.html`:
  - [ ] Change title from "COGS Reduction Demo" to "Demo Presentations"
  - [ ] Update meta description to be generic

### Verify Component Updates
- [ ] Test WelcomeScreen renders with demo cards
- [ ] Test demo selection loads correct demo
- [ ] Test back navigation works
- [ ] Test loading states display correctly
- [ ] Test error handling for invalid demos

---

## Phase 5: Placeholder Demos

### Example Demo 1
- [ ] Create `src/demos/example-demo-1/` directory
- [ ] Create `src/demos/example-demo-1/index.ts` with demo config
- [ ] Create `src/demos/example-demo-1/metadata.ts`
- [ ] Create `src/demos/example-demo-1/slides/` directory
- [ ] Create `src/demos/example-demo-1/slides/SlidesRegistry.ts`
- [ ] Create `src/demos/example-demo-1/slides/chapters/` directory
- [ ] Create `src/demos/example-demo-1/slides/chapters/Chapter0.tsx` with 3 placeholder slides
- [ ] Create `public/audio/example-demo-1/` directory structure
- [ ] Add placeholder audio files or rely on silence fallback
- [ ] Add demo to DemoRegistry.ts

### Example Demo 2
- [ ] Create `src/demos/example-demo-2/` directory
- [ ] Create `src/demos/example-demo-2/index.ts` with demo config
- [ ] Create `src/demos/example-demo-2/metadata.ts`
- [ ] Create `src/demos/example-demo-2/slides/` directory
- [ ] Create `src/demos/example-demo-2/slides/SlidesRegistry.ts`
- [ ] Create `src/demos/example-demo-2/slides/chapters/` directory
- [ ] Create `src/demos/example-demo-2/slides/chapters/Chapter0.tsx` with 3 placeholder slides
- [ ] Create `public/audio/example-demo-2/` directory structure
- [ ] Add placeholder audio files or rely on silence fallback
- [ ] Add demo to DemoRegistry.ts

### Verify Placeholder Demos
- [ ] Test example-demo-1 loads and displays correctly
- [ ] Test example-demo-2 loads and displays correctly
- [ ] Test navigation between all 3 demos

---

## Phase 6: TTS Script Updates

### Update Generate TTS Script
- [ ] Update `scripts/generate-tts.ts`:
  - [ ] Add `--demo` CLI parameter
  - [ ] Support generating for specific demo or all demos
  - [ ] Update to read from `src/demos/*/slides/SlidesRegistry.ts`
  - [ ] Update output paths to `public/audio/{demo-id}/`
  - [ ] Update cache structure to support multiple demos
- [ ] Update cache file `.tts-narration-cache.json` structure

### Update Check TTS Cache Script
- [ ] Update `scripts/check-tts-cache.ts`:
  - [ ] Support checking cache for all demos
  - [ ] Report changes per demo
  - [ ] Prompt for regeneration per demo or all at once

### Update Calculate Durations Script
- [ ] Update `scripts/calculate-durations.ts`:
  - [ ] Calculate durations per demo
  - [ ] Generate separate duration reports per demo
  - [ ] Support `--demo` parameter

### Update Package.json Scripts
- [ ] Update `package.json` scripts documentation
- [ ] Add examples for multi-demo TTS commands

### Verify TTS Scripts
- [ ] Test `npm run tts:generate` generates for all demos
- [ ] Test `npm run tts:generate -- --demo meeting-highlights`
- [ ] Test `npm run tts:check` checks all demos
- [ ] Test cache detection works correctly

---

## Phase 7: Documentation

### Update Main Documentation
- [ ] Update `README.md`:
  - [ ] Add multi-demo architecture overview
  - [ ] Update file structure documentation
  - [ ] Add demo creation guide
  - [ ] Update TTS script usage examples
  - [ ] Add demo registry explanation
- [ ] Update `Agents.md`:
  - [ ] Document architecture changes
  - [ ] Add refactoring to recent changes
  - [ ] Update project structure section
  - [ ] Add demo organization section

### Create Demo-Specific Documentation
- [ ] Ensure `demos/meeting-highlights/README.md` is complete
- [ ] Create `demos/example-demo-1/README.md`
- [ ] Create `demos/example-demo-2/README.md`
- [ ] Create `demos/README.md` explaining demo organization

### Update Script Documentation
- [ ] Update `scripts/README.md` if it exists
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

## Notes

- Keep this TODO list synced with the internal architect mode todo list
- Reference [`REFACTORING_PLAN.md`](react_cogs_demo/REFACTORING_PLAN.md) for detailed implementation guidance
- Estimated time: 9-13 hours total
- Break work into commits per phase
- Test incrementally after each phase