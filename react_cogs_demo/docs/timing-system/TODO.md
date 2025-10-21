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

**Estimated**: 2-3 hours | **Status**: ⏳ Not Started

### 4.1 Import Timing Utilities
- [ ] Open `scripts/calculate-durations.ts`
- [ ] Import `calculatePresentationDuration` from calculator
- [ ] Import `TimingConfig` type

### 4.2 Load Demo Timing Configuration
- [ ] After loading slides, load demo config
- [ ] Extract `timing` field from config
- [ ] Handle demos without timing (use defaults)

### 4.3 Calculate Full Duration
- [ ] Call `calculatePresentationDuration()` with slides and timing
- [ ] Calculate breakdown:
  - [ ] Separate segment delays (betweenSegments)
  - [ ] Separate slide delays (betweenSlides)
  - [ ] Identify final delay (afterFinalSlide)
- [ ] Include per-slide breakdown in report

### 4.4 Update Report Structure
- [ ] Add `audioOnlyDuration` field
- [ ] Add `totalDelays` field
- [ ] Add `totalDuration` field
- [ ] Add `breakdown` object with delay categories
- [ ] Include per-slide details with segments
- [ ] Update console output to show new fields

### 4.5 Update Report Generation
- [ ] Generate both summary and detailed reports
- [ ] Save to `duration-report-{demo-id}.json`
- [ ] Pretty-print JSON for readability

**Verification**:
- [ ] Script runs without errors
- [ ] Report includes all new fields
- [ ] Breakdown accurately categorizes delays
- [ ] Per-slide and per-segment details included
- [ ] Calculations match manual verification

---

## Phase 5: Update NarratedController

**Estimated**: 1-2 hours | **Status**: ⏳ Not Started

### 5.1 Import Timing Resolver
- [ ] Open `src/components/NarratedController.tsx`
- [ ] Import `resolveTimingConfig` from timing types

### 5.2 Replace Hardcoded Delays
- [ ] Find all hardcoded delay values (500, 1000, 2000)
- [ ] Replace with resolved timing values:
  - [ ] Between segments: Use `timing.betweenSegments`
  - [ ] Between slides: Use `timing.betweenSlides`
  - [ ] After final slide: Use `timing.afterFinalSlide`
- [ ] Resolve timing per segment considering hierarchy
- [ ] Pass `demoMetadata.timing` to resolver

### 5.3 Test Integration
- [ ] Test narrated mode with default timing
- [ ] Test with custom demo timing
- [ ] Test with per-slide overrides
- [ ] Test with per-segment overrides
- [ ] Verify no regression in audio playback

**Verification**:
- [ ] Narrated mode works correctly
- [ ] Timing resolves correctly at all levels
- [ ] No audio playback issues
- [ ] Manual+Audio mode still works

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
| Phase 1: Infrastructure | 2-3h | - | ⏳ Not Started |
| Phase 2: Calculator | 2-3h | - | ⏳ Not Started |
| Phase 3: Interfaces | 1h | - | ⏳ Not Started |
| Phase 4: Duration Script | 2-3h | - | ⏳ Not Started |
| Phase 5: NarratedController | 1-2h | - | ⏳ Not Started |
| Phase 6: Meeting Highlights | 1h | - | ⏳ Not Started |
| Phase 7: WelcomeScreen | 3-4h | - | ⏳ Not Started |
| Phase 8: Testing | 2-3h | - | ⏳ Not Started |
| Phase 9: Documentation | 2-3h | Done | ✅ Complete |
| **Total** | **15-24h** | - | **5% Complete** |

---

## Notes & Issues

Track implementation notes, blockers, and decisions here:

### [Date] - Note Title
- Description of issue or decision
- Resolution or action taken

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