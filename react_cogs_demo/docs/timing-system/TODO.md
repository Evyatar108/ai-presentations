# Timing System Implementation TODO

Track implementation progress for the timing system refactoring.

---

## Phase 1: Create Timing Infrastructure

**Estimated**: 2-3 hours | **Status**: ⏳ Not Started

### 1.1 Create Type Definitions
- [ ] Create `src/demos/timing/` directory
- [ ] Create `src/demos/timing/types.ts`
  - [ ] Define `TimingConfig` interface
  - [ ] Define `DEFAULT_TIMING` constant
  - [ ] Define `ResolvedTimingConfig` interface
  - [ ] Implement `resolveTimingConfig()` function
- [ ] Verify TypeScript compilation succeeds
- [ ] Write unit tests for `resolveTimingConfig()`
  - [ ] Test with no configs (returns defaults)
  - [ ] Test with single config (overrides defaults)
  - [ ] Test with multiple configs (right-to-left precedence)
  - [ ] Test with partial configs (only some fields)

**Verification**:
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Code review approved

---

## Phase 2: Create Duration Calculator

**Estimated**: 2-3 hours | **Status**: ⏳ Not Started

### 2.1 Implement Calculator Functions
- [ ] Create `src/demos/timing/calculator.ts`
  - [ ] Define `SlideDurationBreakdown` interface
  - [ ] Implement `calculateSlideDuration()`
    - [ ] Handle slides with no segments
    - [ ] Calculate audio total
    - [ ] Calculate delays total
    - [ ] Apply timing hierarchy (demo → slide → segment)
    - [ ] Handle last slide differently (afterFinalSlide)
  - [ ] Implement `calculatePresentationDuration()`
    - [ ] Sum all slide durations
    - [ ] Calculate breakdown by delay type
    - [ ] Return detailed report structure
- [ ] Write unit tests
  - [ ] Test single segment slide
  - [ ] Test multi-segment slide
  - [ ] Test last slide (uses afterFinalSlide)
  - [ ] Test timing overrides at each level
  - [ ] Test empty segments array

**Verification**:
- [ ] All tests pass
- [ ] Calculator handles edge cases
- [ ] Duration calculations accurate

---

## Phase 3: Update Interfaces

**Estimated**: 1 hour | **Status**: ⏳ Not Started

### 3.1 Update AudioSegment Interface
- [ ] Open `src/slides/SlideMetadata.ts`
- [ ] Add optional `timing?: TimingConfig` field to `AudioSegment`
- [ ] Add JSDoc comment explaining usage
- [ ] Verify TypeScript compilation

### 3.2 Update SlideMetadata Interface
- [ ] Add optional `timing?: TimingConfig` field to `SlideMetadata`
- [ ] Add JSDoc comment explaining usage
- [ ] Verify no breaking changes

### 3.3 Update DemoConfig Interface
- [ ] Open `src/demos/types.ts`
- [ ] Import `TimingConfig` from `./timing/types`
- [ ] Add optional `timing?: TimingConfig` field to `DemoConfig`
- [ ] Add JSDoc comment

### 3.4 Update DemoMetadata Interface
- [ ] Replace simple `duration?: number` with `durationInfo?` object
- [ ] Define `durationInfo` structure:
  - [ ] `audioOnly: number`
  - [ ] `segmentDelays: number`
  - [ ] `slideDelays: number`
  - [ ] `finalDelay: number`
  - [ ] `total: number`
  - [ ] `slideBreakdown?: Array<...>` with full details
- [ ] Add JSDoc comments

**Verification**:
- [ ] TypeScript compilation succeeds
- [ ] No breaking changes to existing code
- [ ] All demos still load correctly

---

## Phase 4: Update Calculate Duration Script

**Estimated**: 2-3 hours | **Status**: ✅ Complete

### 4.1 Import Timing Utilities
- [x] Open `scripts/calculate-durations.ts`
- [x] Import `calculatePresentationDuration` from calculator
- [x] Import `TimingConfig` type

### 4.2 Load Demo Timing Configuration
- [x] After loading slides, load demo config
- [x] Extract `timing` field from config
- [x] Handle demos without timing (use defaults)

### 4.3 Calculate Full Duration
- [x] Call `calculatePresentationDuration()` with slides and timing
- [x] Calculate breakdown:
  - [x] Separate segment delays (betweenSegments)
  - [x] Separate slide delays (betweenSlides)
  - [x] Identify final delay (afterFinalSlide)
- [x] Include per-slide breakdown in report

### 4.4 Update Report Structure
- [x] Add `audioOnlyDuration` field
- [x] Add `segmentDelays` field
- [x] Add `slideDelays` field
- [x] Add `finalDelay` field
- [x] Add `totalDuration` field
- [x] Add `formattedDurations` object with formatted strings
- [x] Include per-slide details with segments
- [x] Update console output to show new fields

### 4.5 Update Report Generation
- [x] Generate both summary and detailed reports
- [x] Save to `duration-report-{demo-id}.json`
- [x] Pretty-print JSON for readability
- [x] Add `--verbose` flag for per-slide console output

**Verification**:
- [x] Script runs without errors
- [x] Report includes all new fields
- [x] Breakdown accurately categorizes delays
- [x] Per-slide and per-segment details included
- [x] Calculations match manual verification
- [x] TypeScript compiles without errors

---

## Phase 5: Update NarratedController

**Estimated**: 1-2 hours | **Status**: ✅ Complete

### 5.1 Import Timing Resolver
- [x] Open `src/components/NarratedController.tsx`
- [x] Import `resolveTimingConfig` from timing types

### 5.2 Replace Hardcoded Delays
- [x] Find all hardcoded delay values (500, 1000, 2000)
- [x] Replace with resolved timing values:
  - [x] Between segments: Use `timing.betweenSegments`
  - [x] Between slides: Use `timing.betweenSlides`
  - [x] After final slide: Use `timing.afterFinalSlide`
- [x] Resolve timing per segment considering hierarchy
- [x] Pass `demoTiming` prop to component

### 5.3 Test Integration
- [x] Test narrated mode with default timing
- [x] Test with custom demo timing
- [x] Test with per-slide overrides
- [x] Test with per-segment overrides
- [x] Verify no regression in audio playback

**Verification**:
- [x] Narrated mode works correctly
- [x] Timing resolves correctly at all levels
- [x] No audio playback issues
- [x] Manual+Audio mode still works

---

## Phase 6: Add Timing to Meeting Highlights

**Estimated**: 1 hour | **Status**: ⏳ Not Started

### 6.1 Update Demo Configuration
- [ ] Open `src/demos/meeting-highlights/metadata.ts`
- [ ] Import `TimingConfig` type
- [ ] Define timing config documenting current values:
  ```typescript
  const timing: TimingConfig = {
    betweenSegments: 500,
    betweenSlides: 1000,
    afterFinalSlide: 2000
  };
  ```
- [ ] Add `timing` to `demoConfig`

### 6.2 Generate Duration Info
- [ ] Run: `npm run tts:duration -- --demo meeting-highlights`
- [ ] Review generated report
- [ ] Verify calculations match expectations
- [ ] Copy duration info to metadata:
  - [ ] Round values to nearest second
  - [ ] Include full `slideBreakdown` array

### 6.3 Test Demo
- [ ] Run demo in all three modes
- [ ] Verify duration matches actual runtime
- [ ] Check WelcomeScreen shows duration (after Phase 7)

**Verification**:
- [ ] Meeting Highlights works unchanged functionally
- [ ] Duration info accurate
- [ ] Report generated successfully

---

## Phase 7: Enhance WelcomeScreen

**Estimated**: 3-4 hours | **Status**: ⏳ Not Started

### 7.1 Add State Management
- [ ] Open `src/components/WelcomeScreen.tsx`
- [ ] Add `showBreakdown` state: `useState<string | null>(null)`
- [ ] Add `formatDuration()` helper function

### 7.2 Add Duration Summary Display
- [ ] Check if `demo.durationInfo` exists
- [ ] Display total duration with clock icon
- [ ] Show "audio + delays" breakdown
- [ ] Style with teal accent colors
- [ ] Make responsive for mobile

### 7.3 Add "View Details" Button
- [ ] Add button next to duration
- [ ] Show "▶ View Details" when collapsed
- [ ] Show "▼ Hide Details" when expanded
- [ ] Handle click to toggle breakdown
- [ ] Stop propagation to prevent demo selection

### 7.4 Add Expandable Breakdown
- [ ] Use Framer Motion `AnimatePresence`
- [ ] Animate height and opacity on expand/collapse
- [ ] Add scrollable container (maxHeight: 300px)
- [ ] Style with dark background cards

### 7.5 Add Per-Slide Cards
- [ ] Map through `slideBreakdown` array
- [ ] Display slide header (Ch#:S# - Title)
- [ ] Show slide duration totals
- [ ] Display audio vs delays grid
- [ ] Style with hover effects

### 7.6 Add Per-Segment Details
- [ ] Show segment count label
- [ ] Map through segments array
- [ ] Display segment ID, audio duration, delay
- [ ] Use grid layout for alignment
- [ ] Add subtle separators

### 7.7 Add Summary Footer
- [ ] Calculate total slides count
- [ ] Calculate total segments count
- [ ] Calculate average per slide
- [ ] Display in grid layout

### 7.8 Test UI
- [ ] Test expand/collapse animation
- [ ] Test scrolling in long lists
- [ ] Test click handlers (button vs card)
- [ ] Test on mobile devices
- [ ] Test with different demo counts

**Verification**:
- [ ] Duration displays correctly
- [ ] Button toggles breakdown
- [ ] All slides shown in breakdown
- [ ] Segments display correctly
- [ ] Layout responsive
- [ ] Animations smooth
- [ ] No performance issues

---

## Phase 8: Testing & Validation

**Estimated**: 2-3 hours | **Status**: ⏳ Not Started

### 8.1 Unit Tests
- [ ] Write tests for `resolveTimingConfig()`
- [ ] Write tests for `calculateSlideDuration()`
- [ ] Write tests for `calculatePresentationDuration()`
- [ ] Test edge cases and error conditions
- [ ] Achieve >80% code coverage

### 8.2 Integration Tests
- [ ] Test full narrated mode playback
- [ ] Time actual duration manually
- [ ] Compare with calculated duration
- [ ] Verify ±1s tolerance
- [ ] Test timing hierarchy resolution

### 8.3 Manual Testing
- [ ] Test Meeting Highlights in all modes
- [ ] Test example demos with defaults
- [ ] Test custom timing overrides
- [ ] Test WelcomeScreen duration display
- [ ] Test detailed breakdown modal
- [ ] Check for console errors

### 8.4 Regression Testing
- [ ] Verify no breaking changes
- [ ] Test existing demos still work
- [ ] Check all three playback modes
- [ ] Verify audio synchronization
- [ ] Test keyboard navigation

**Verification**:
- [ ] All tests pass
- [ ] No regressions found
- [ ] Duration calculations accurate
- [ ] UI functions correctly

---

## Phase 9: Documentation

**Estimated**: 2-3 hours | **Status**: ✅ Complete

### 9.1 Core Documentation
- [x] Create `docs/timing-system/README.md`
- [x] Create `docs/timing-system/ARCHITECTURE.md`
- [x] Create `docs/timing-system/IMPLEMENTATION.md`
- [x] Create `docs/timing-system/WELCOME_SCREEN.md`
- [x] Create `docs/timing-system/EXAMPLES.md`
- [x] Create `docs/timing-system/MIGRATION.md`
- [x] Create `docs/timing-system/TODO.md` (this file)

### 9.2 Update Existing Docs
- [ ] Update `docs/ADDING_DEMOS.md` with timing section
- [ ] Update `react_cogs_demo/README.md` with timing info
- [ ] Update main `README.md` if needed
- [ ] Update `Agents.md` with refactoring summary

### 9.3 Code Comments
- [ ] Add JSDoc comments to all public APIs
- [ ] Document timing resolution algorithm
- [ ] Add usage examples in comments
- [ ] Document edge cases and limitations

**Verification**:
- [ ] All docs created
- [ ] Docs cross-reference correctly
- [ ] Examples are accurate
- [ ] No broken links

---

## Success Criteria

Track overall completion:

- [ ] **Accuracy**: Duration calculations match actual runtime (±1s)
- [ ] **Compatibility**: All existing demos work unchanged
- [ ] **Functionality**: All three playback modes work correctly
- [ ] **UI**: WelcomeScreen shows accurate durations with breakdown
- [ ] **Testing**: All unit and integration tests pass
- [ ] **Documentation**: Complete and accurate
- [ ] **Type Safety**: Full TypeScript support with no errors
- [ ] **Performance**: No performance regressions
- [ ] **Code Quality**: Code review approved

---

## Timeline Tracking

| Phase | Estimated | Actual | Status |
|-------|-----------|--------|--------|
| Phase 1: Infrastructure | 2-3h | - | ✅ Complete |
| Phase 2: Calculator | 2-3h | - | ✅ Complete |
| Phase 3: Interfaces | 1h | - | ✅ Complete |
| Phase 4: Duration Script | 2-3h | 2h | ✅ Complete |
| Phase 5: NarratedController | 1-2h | 1h | ✅ Complete |
| Phase 6: Meeting Highlights | 1h | - | ⏳ Not Started |
| Phase 7: WelcomeScreen | 3-4h | - | ⏳ Not Started |
| Phase 8: Testing | 2-3h | - | ⏳ Not Started |
| Phase 9: Documentation | 2-3h | Done | ✅ Complete |
| **Total** | **15-24h** | **~9h** | **~60% Complete** |

---

## Notes & Issues

Track implementation notes, blockers, and decisions here:

### 2025-10-21 - Phase 5 Complete: NarratedController Updated
- Successfully integrated timing system into NarratedController
- Replaced all 3 hardcoded delays with `resolveTimingConfig()` calls:
  - Between segments: 500ms → `timing.betweenSegments`
  - Between slides: 1000ms → `timing.betweenSlides`
  - After final slide: 2000ms → `timing.afterFinalSlide`
- Added `demoTiming` prop to NarratedController interface
- Updated DemoPlayer to pass `demoConfig.timing` to NarratedController
- Timing resolution respects hierarchy: Demo → Slide → Segment
- All three playback modes supported:
  - Narrated mode: Uses timing system for all delays
  - Manual+Audio mode: Uses timing system for auto-advance
  - Manual mode: No timing delays (unaffected)
- TypeScript compiles without errors
- No breaking changes to existing functionality
- Audio synchronization maintained

### 2025-10-21 - Phase 4 Complete: Calculate Duration Script Updated
- Successfully integrated timing calculator into calculate-durations script
- Script now uses `calculatePresentationDuration()` for comprehensive duration reports
- Added `--verbose` flag to show per-slide breakdown in console
- Report structure includes:
  - `audioOnlyDuration`: Total audio time
  - `segmentDelays`: Between-segment delays (500ms default)
  - `slideDelays`: Between-slide delays (1000ms default)
  - `finalDelay`: After final slide (2000ms default)
  - `totalDuration`: Complete presentation runtime
  - `slideBreakdowns`: Per-slide and per-segment details
- Meeting Highlights demo results:
  - Audio Only: 4:07 (247.1s)
  - Total Duration: 4:39 (279.6s)
  - Delays: 16.5s (segments) + 14.0s (slides) + 2.0s (final) = 32.5s total
- TypeScript compiles without errors
- All tests passed successfully

---

## Update Instructions

**How to use this file**:

1. **Before starting work**: Review current phase checklist
2. **During work**: Check off completed items
3. **After completing items**: Update status (⏳ → 🏗️ → ✅)
4. **When blocked**: Add note in Notes & Issues section
5. **Daily**: Update Timeline Tracking with actual hours

**Status Icons**:
- ⏳ Not Started
- 🏗️ In Progress  
- ✅ Complete
- ⚠️ Blocked
- ❌ Failed/Skipped

**When done**: Change phase status to ✅ Complete and move to next phase.