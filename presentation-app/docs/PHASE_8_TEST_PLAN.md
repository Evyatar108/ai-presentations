# Phase 8: Comprehensive Test Plan
## Narration Externalization System

**Date**: 2025-01-21  
**Phase**: 8 of 9  
**Estimated Duration**: 3-4 hours  
**Status**: ⏳ In Progress

---

## Executive Summary

This document outlines all tests required to verify the narration externalization system is production-ready. The system enables persistent narration editing through JSON files with backend API integration and TTS workflow synchronization.

**Scope**: End-to-end testing of Phases 1-7 implementation
- Narration loading from JSON files
- Browser UI editing capabilities
- Backend API file persistence
- TTS integration and regeneration
- Change detection scripts
- Presentation mode compatibility
- Error handling
- Performance validation

---

## Test Environment

### System Information
- **Node.js**: v18+ required
- **TypeScript**: v5.0+
- **Browser**: Chrome/Edge (Chromium-based recommended)
- **OS**: Windows 11 (primary), macOS/Linux (secondary)
- **Dev Server**: Vite (port 5173)
- **API Server**: Express (port 3001)

### Required Setup
```bash
# Install dependencies
cd presentation-app
npm install

# Start both servers
npm run dev:full

# Or separately:
# Terminal 1: npm run dev
# Terminal 2: npm run narration-api
```

### Pre-Test Verification
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] Production build succeeds: `npm run build`
- [ ] Both servers can start successfully
- [ ] Narration files exist: `public/narration/meeting-highlights/narration.json`

---

## Test Categories

### 1. Narration Loading Tests (5 tests)

#### Test 1.1: Load narration.json for meeting-highlights
**Objective**: Verify narration JSON loads correctly on demo start

**Steps**:
1. Start dev server: `npm run dev`
2. Open http://localhost:5173
3. Select "Meeting Highlights" demo
4. Open browser DevTools console
5. Look for narration loading messages

**Expected Result**:
- Console shows: `[NarrationLoader] Loaded X slides with Y total segments from narration.json`
- No error messages about missing narration
- Demo loads successfully

**Pass Criteria**: ✅ All slides load, console shows success message

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 1.2: Verify all 47 segments load correctly
**Objective**: Ensure all narration segments are present

**Steps**:
1. Open Meeting Highlights demo
2. Switch to Manual mode
3. Navigate through all 15 slides using arrow keys
4. Check each multi-segment slide (especially Chapter 2 with 9 segments)
5. Verify narration text appears for each segment

**Expected Result**:
- All 47 segments have narration text
- No "undefined" or empty narration
- Multi-segment slides show all segments

**Pass Criteria**: ✅ All segments contain valid narration text

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 1.3: Test hybrid fallback (missing JSON)
**Objective**: Verify fallback behavior when narration.json is missing

**Steps**:
1. Temporarily rename `public/narration/meeting-highlights/narration.json`
2. Refresh browser
3. Check console for fallback message
4. Verify demo still loads (using inline narration if available)
5. Restore narration.json file

**Expected Result**:
- Console warns: `[NarrationLoader] No narration.json found for demo 'meeting-highlights'`
- Demo still functions (fallback to inline narration or shows error gracefully)
- No JavaScript errors

**Pass Criteria**: ✅ Graceful fallback without breaking the demo

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 1.4: Test strict mode error handling
**Objective**: Verify `--from-json` flag enforces JSON requirement

**Steps**:
1. Run: `npm run tts:from-json -- --demo meeting-highlights`
2. Temporarily rename narration.json
3. Run same command again
4. Observe error handling
5. Restore narration.json

**Expected Result**:
- Script fails with clear error message when JSON missing
- Error indicates `--from-json` requires narration.json
- Script exits gracefully

**Pass Criteria**: ✅ Clear error message, no crashes

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 1.5: Verify narration merges into slide metadata
**Objective**: Confirm JSON narration replaces inline narration

**Steps**:
1. Open DevTools console
2. Load Meeting Highlights demo
3. In console, inspect slide metadata: `window.__demoSlides[0].metadata.audioSegments`
4. Verify `narrationText` field contains text from JSON

**Expected Result**:
- Metadata contains narration from JSON file
- Text matches content in `public/narration/meeting-highlights/narration.json`

**Pass Criteria**: ✅ Narration text present in metadata

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

### 2. Browser UI Tests (7 tests)

#### Test 2.1: Edit button opens modal
**Objective**: Verify edit functionality is accessible

**Steps**:
1. Load Meeting Highlights demo
2. Switch to Manual mode
3. Navigate to any slide
4. Look for Edit button (✏️) in UI
5. Click Edit button

**Expected Result**:
- Modal opens with narration editor
- Modal displays current narration text
- Modal has Save and Cancel buttons

**Pass Criteria**: ✅ Modal opens correctly

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 2.2: Modal loads current narration text
**Objective**: Verify editor shows correct current text

**Steps**:
1. Open edit modal on slide with known narration
2. Compare displayed text with `narration.json` content
3. Verify exact match

**Expected Result**:
- Textarea contains exact narration from JSON
- No truncation or formatting issues
- Special characters preserved

**Pass Criteria**: ✅ Text matches JSON exactly

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 2.3: Character counter works
**Objective**: Verify character count updates dynamically

**Steps**:
1. Open edit modal
2. Observe initial character count
3. Add/remove text
4. Watch counter update in real-time

**Expected Result**:
- Counter shows correct character count
- Updates immediately on text change
- Displays format: "X characters"

**Pass Criteria**: ✅ Counter accurate and responsive

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 2.4: Save button persists to disk
**Objective**: Verify save writes to narration.json file

**Steps**:
1. Open edit modal
2. Modify narration text (add "TEST" at end)
3. Click "Save" button
4. Wait for success toast notification
5. Open `public/narration/meeting-highlights/narration.json` in editor
6. Verify change appears in file
7. Refresh browser
8. Verify change persists

**Expected Result**:
- Toast shows "Narration saved successfully"
- File updated with new text
- Change persists after refresh

**Pass Criteria**: ✅ Changes written to file and persist

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 2.5: Toast notifications appear
**Objective**: Verify user feedback for save operations

**Steps**:
1. Perform save operation (Test 2.4)
2. Observe toast notification
3. Verify success message
4. Test save failure (stop API server)
5. Observe error toast

**Expected Result**:
- Success toast: Green with checkmark
- Error toast: Red with warning
- Toasts auto-dismiss after ~3 seconds

**Pass Criteria**: ✅ Appropriate notifications shown

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 2.6: Loading states show correctly
**Objective**: Verify loading spinners during operations

**Steps**:
1. Open edit modal
2. Click "Save & Regenerate Audio"
3. Observe loading spinner
4. Wait for completion
5. Verify spinner disappears

**Expected Result**:
- Spinner appears during save/regenerate
- Buttons disabled during operation
- Spinner disappears on completion

**Pass Criteria**: ✅ Loading states display correctly

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 2.7: ESC key closes modal
**Objective**: Verify keyboard navigation

**Steps**:
1. Open edit modal
2. Make text changes (don't save)
3. Press ESC key
4. Verify modal closes without saving

**Expected Result**:
- ESC key closes modal
- Changes not saved
- Can reopen modal to verify

**Pass Criteria**: ✅ ESC closes modal without saving

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

### 3. Backend API Tests (7 tests)

#### Test 3.1: Health check endpoint responds
**Objective**: Verify API server is running

**Steps**:
1. Start API server: `npm run narration-api`
2. Open: http://localhost:3001/health
3. Verify response

**Expected Result**:
- Status: 200 OK
- Response: `{ "status": "ok", "service": "narration-api" }`

**Pass Criteria**: ✅ Health endpoint accessible

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 3.2: POST /api/narration/save writes to disk
**Objective**: Test file write endpoint

**Steps**:
1. Use curl or Postman to POST to `/api/narration/save`
2. Body: `{ "demoId": "meeting-highlights", "narrationData": {...} }`
3. Check response
4. Verify file updated

**Expected Result**:
- Response: `{ "success": true, "filePath": "...", "timestamp": "..." }`
- File written to `public/narration/meeting-highlights/narration.json`

**Pass Criteria**: ✅ File saved successfully

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 3.3: POST /api/narration/update-cache updates cache
**Objective**: Test cache update endpoint

**Steps**:
1. POST to `/api/narration/update-cache`
2. Body: `{ "demoId": "meeting-highlights", "segment": {...} }`
3. Check narration-cache.json updated

**Expected Result**:
- Cache file updated with new hash
- Response indicates success

**Pass Criteria**: ✅ Cache updates correctly

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 3.4: POST /api/narration/regenerate-audio works
**Objective**: Test TTS regeneration endpoint (requires TTS server)

**Steps**:
1. Ensure TTS server running: `cd tts && python server.py`
2. POST to `/api/narration/regenerate-audio`
3. Body: `{ "demoId": "meeting-highlights", "chapter": 1, "slide": 1, "segmentId": "intro", "narrationText": "Test audio." }`
4. Wait for audio generation
5. Verify audio file created

**Expected Result**:
- Response: `{ "success": true, "audioPath": "/audio/...", "timestamp": ... }`
- Audio file generated
- Cache updated

**Pass Criteria**: ✅ Audio regenerated successfully

**Status**: ⏳ Pending (requires TTS server)  
**Result**: _To be filled during testing_

---

#### Test 3.5: CORS allows localhost:5173
**Objective**: Verify CORS configuration

**Steps**:
1. Open browser DevTools Network tab
2. Make API request from frontend (any save operation)
3. Check response headers
4. Verify no CORS errors

**Expected Result**:
- Header: `Access-Control-Allow-Origin: http://localhost:5173`
- No CORS errors in console

**Pass Criteria**: ✅ CORS configured correctly

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 3.6: Error handling for missing parameters
**Objective**: Test API validation

**Steps**:
1. POST to `/api/narration/save` with empty body: `{}`
2. Observe error response

**Expected Result**:
- Status: 400 Bad Request
- Response: `{ "success": false, "error": "Missing demoId or narrationData" }`

**Pass Criteria**: ✅ Proper validation errors

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 3.7: Error handling for invalid JSON
**Objective**: Test error handling for malformed data

**Steps**:
1. POST invalid JSON to `/api/narration/save`
2. Observe error response

**Expected Result**:
- Status: 400 or 500
- Error message indicates invalid JSON

**Pass Criteria**: ✅ Graceful error handling

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

### 4. TTS Integration Tests (5 tests)

#### Test 4.1: npm run tts:generate loads from JSON
**Objective**: Verify TTS script reads narration.json

**Steps**:
1. Run: `npm run tts:generate -- --demo meeting-highlights`
2. Observe console output
3. Check for "Loading narration from JSON" message

**Expected Result**:
- Script loads narration.json
- Audio generated for all segments
- Console shows progress

**Pass Criteria**: ✅ TTS generation uses JSON

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 4.2: npm run tts:from-json enforces JSON
**Objective**: Verify strict JSON mode

**Steps**:
1. Run: `npm run tts:from-json -- --demo meeting-highlights`
2. Verify completes successfully
3. Remove narration.json temporarily
4. Run again
5. Verify error

**Expected Result**:
- Works with JSON present
- Fails with clear error when JSON missing
- Does not fallback to inline narration

**Pass Criteria**: ✅ Strict mode enforced

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 4.3: Narration cache updates after generation
**Objective**: Verify cache synchronization

**Steps**:
1. Run TTS generation
2. Check `narration-cache.json` updated
3. Verify hashes match narration.json content

**Expected Result**:
- Cache file contains hashes for all segments
- Hashes computed from narration.json text
- Timestamp updated

**Pass Criteria**: ✅ Cache synchronized

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 4.4: Single-segment regeneration works
**Objective**: Test regenerate single segment via API

**Steps**:
1. Edit narration for one segment via UI
2. Click "Save & Regenerate Audio"
3. Verify only that segment regenerated
4. Check audio file timestamp

**Expected Result**:
- Only edited segment audio regenerated
- Other segments unchanged
- Cache updated for edited segment only

**Pass Criteria**: ✅ Selective regeneration works

**Status**: ⏳ Pending (requires TTS server)  
**Result**: _To be filled during testing_

---

#### Test 4.5: Cache synchronization (narration + TTS)
**Objective**: Verify both caches stay in sync

**Steps**:
1. Edit narration
2. Regenerate audio
3. Check both:
   - `narration-cache.json`
   - `.tts-narration-cache.json`
4. Verify both updated

**Expected Result**:
- Both caches have matching hashes
- Both timestamps updated
- No desync between caches

**Pass Criteria**: ✅ Caches synchronized

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

### 5. Change Detection Tests (4 tests)

#### Test 5.1: npm run check-narration detects changes
**Objective**: Verify change detection script works

**Steps**:
1. Edit `narration.json` manually (change one segment)
2. Run: `npm run check-narration`
3. Observe output

**Expected Result**:
- Script detects changed segment
- Reports: "⚠️ X narration changes detected"
- Lists specific segments changed

**Pass Criteria**: ✅ Changes detected accurately

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 5.2: npm run check-tts-cache detects narration changes
**Objective**: Verify TTS cache check includes narration

**Steps**:
1. Edit `narration.json`
2. Run: `npm run check-tts-cache`
3. Verify detects narration change

**Expected Result**:
- Script checks both narration and audio changes
- Prompts to regenerate TTS
- Shows which segments changed

**Pass Criteria**: ✅ Dual cache check works

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 5.3: Hash comparison works correctly
**Objective**: Verify hash algorithm consistency

**Steps**:
1. Note hash in cache for segment
2. Make no changes to narration
3. Run check script
4. Verify no changes detected

**Expected Result**:
- Hashes match (no false positives)
- Script reports: "No changes detected"

**Pass Criteria**: ✅ Hash comparison accurate

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 5.4: Change reports are accurate
**Objective**: Verify change reports show correct info

**Steps**:
1. Change 2-3 specific segments
2. Run check-narration
3. Verify report lists exact changes

**Expected Result**:
- Report shows chapter, slide, segment ID
- Shows "Text changed" or "New segment"
- No false positives/negatives

**Pass Criteria**: ✅ Accurate change reporting

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

### 6. Presentation Mode Tests (6 tests)

#### Test 6.1: Narrated mode works with JSON narration
**Objective**: Verify auto-play mode functional

**Steps**:
1. Load Meeting Highlights
2. Select "▶ Narrated" mode
3. Let presentation play through
4. Verify audio plays for each segment
5. Verify auto-advance works

**Expected Result**:
- Audio plays correctly
- Slides advance automatically
- All 15 slides complete
- Audio synchronized with animations

**Pass Criteria**: ✅ Narrated mode fully functional

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 6.2: Manual mode works
**Objective**: Verify manual navigation

**Steps**:
1. Switch to Manual mode
2. Navigate with arrow keys
3. Visit all slides
4. Verify no audio plays

**Expected Result**:
- Arrow keys navigate slides
- No audio playback
- All slides accessible
- Edit button available

**Pass Criteria**: ✅ Manual mode works correctly

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 6.3: Manual + Audio mode works
**Objective**: Verify manual with audio playback

**Steps**:
1. Switch to Manual + Audio mode
2. Navigate to slide
3. Verify audio plays
4. Navigate before audio ends
5. Verify audio stops/restarts

**Expected Result**:
- Audio plays on slide enter
- Audio stops when navigating away
- No audio overlap
- Edit button available

**Pass Criteria**: ✅ Manual + Audio mode functional

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 6.4: All 15 slides display correctly
**Objective**: Verify complete slide deck

**Steps**:
1. Navigate through all slides
2. Verify each displays properly
3. Check for any rendering errors

**Expected Result**:
- All 15 slides render
- No layout issues
- No missing content
- Animations work

**Pass Criteria**: ✅ All slides functional

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 6.5: Multi-segment slides work (Chapter 2)
**Objective**: Test complex slides with 9 segments

**Steps**:
1. Navigate to Chapter 2, Slide 1
2. In Narrated mode, watch all 9 segments play
3. Verify each segment displays correctly
4. Verify animations synchronized

**Expected Result**:
- All 9 segments play in sequence
- Timing correct between segments
- Visual elements appear per segment
- No segment skipped

**Pass Criteria**: ✅ Multi-segment slide works

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 6.6: Audio playback synchronized with animations
**Objective**: Verify timing synchronization

**Steps**:
1. Watch several slides in Narrated mode
2. Observe audio-visual sync
3. Check for timing drift

**Expected Result**:
- Visuals appear with audio cues
- No significant drift (<500ms)
- Transitions smooth

**Pass Criteria**: ✅ Sync maintained

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

### 7. Error Handling Tests (6 tests)

#### Test 7.1: Missing narration.json (strict mode)
**Objective**: Test error when JSON required but missing

**Steps**:
1. Remove narration.json
2. Load demo with `useExternalNarration: true`
3. Observe error handling

**Expected Result**:
- Error message displayed
- Demo doesn't crash
- Clear instruction to user

**Pass Criteria**: ✅ Graceful error handling

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 7.2: Corrupt narration.json
**Objective**: Test malformed JSON handling

**Steps**:
1. Add syntax error to narration.json
2. Refresh browser
3. Observe error handling

**Expected Result**:
- JSON parse error caught
- Error logged to console
- Demo shows error state

**Pass Criteria**: ✅ Handles corrupt JSON

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 7.3: Backend API unavailable
**Objective**: Test save when API down

**Steps**:
1. Stop narration-api server
2. Try to save narration edit
3. Observe error handling

**Expected Result**:
- Error toast: "Failed to save - API unavailable"
- Edit preserved in memory (session)
- Console shows connection error

**Pass Criteria**: ✅ API down handled gracefully

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 7.4: TTS server down
**Objective**: Test regenerate when TTS unavailable

**Steps**:
1. Stop TTS server
2. Try "Save & Regenerate Audio"
3. Observe error handling

**Expected Result**:
- Error toast: "Audio regeneration failed"
- Narration still saved
- Clear error message

**Pass Criteria**: ✅ TTS unavailable handled

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 7.5: Network errors during save
**Objective**: Test network failure scenarios

**Steps**:
1. Use DevTools to simulate offline
2. Try to save edit
3. Observe error handling

**Expected Result**:
- Network error caught
- User notified
- Edit preserved in memory

**Pass Criteria**: ✅ Network errors handled

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 7.6: Invalid segment IDs
**Objective**: Test error handling for bad segment references

**Steps**:
1. Manually edit narration.json with invalid segment ID
2. Load demo
3. Observe error handling

**Expected Result**:
- Warning logged to console
- Segment skipped or uses fallback
- Demo continues to function

**Pass Criteria**: ✅ Invalid IDs handled

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

### 8. Performance Tests (5 tests)

#### Test 8.1: Initial load time acceptable
**Objective**: Measure demo load performance

**Steps**:
1. Open DevTools Performance tab
2. Refresh page
3. Load Meeting Highlights demo
4. Measure time to interactive

**Expected Result**:
- Load time < 2 seconds
- No blocking operations
- Smooth initial render

**Pass Criteria**: ✅ Load time under 2s

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 8.2: Narration loading doesn't block UI
**Objective**: Verify async loading

**Steps**:
1. Load demo
2. Observe if UI freezes during narration load
3. Check if other interactions blocked

**Expected Result**:
- UI remains responsive
- Loading happens async
- No UI freeze

**Pass Criteria**: ✅ Non-blocking load

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 8.3: Save operations complete quickly
**Objective**: Measure save performance

**Steps**:
1. Edit narration
2. Click Save
3. Time until success toast appears

**Expected Result**:
- Save completes in < 1 second
- UI responsive during save
- No noticeable lag

**Pass Criteria**: ✅ Save under 1s

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 8.4: No memory leaks during editing
**Objective**: Check for memory issues

**Steps**:
1. Open DevTools Memory tab
2. Take heap snapshot
3. Edit narration 10 times
4. Take another snapshot
5. Compare memory usage

**Expected Result**:
- No significant memory growth
- Objects properly cleaned up
- No detached DOM nodes

**Pass Criteria**: ✅ No memory leaks detected

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

#### Test 8.5: Build time acceptable
**Objective**: Verify production build performance

**Steps**:
1. Run: `npm run build`
2. Time the build process
3. Check output size

**Expected Result**:
- Build completes in < 30 seconds
- No warnings or errors
- Bundle size reasonable

**Pass Criteria**: ✅ Build time under 30s

**Status**: ⏳ Pending  
**Result**: _To be filled during testing_

---

## Testing Workflow

### Pre-Test Setup
```bash
# 1. Verify TypeScript
npx tsc --noEmit

# 2. Build production
npm run build

# 3. Start servers
npm run dev:full
```

### During Testing
1. Work through each test category sequentially
2. Document results immediately after each test
3. Take screenshots for visual issues
4. Note any unexpected behavior
5. Record performance metrics

### Post-Test
1. Compile results into test report
2. Categorize issues by severity
3. Create fix plan for critical/major issues
4. Document known limitations
5. Update documentation

---

## Success Criteria

### Critical (Must Pass)
- ✅ All narration loading tests pass
- ✅ Save operations persist to file
- ✅ No data loss during edits
- ✅ All presentation modes functional
- ✅ No JavaScript errors in console

### Major (Should Pass)
- ✅ TTS integration works
- ✅ Change detection accurate
- ✅ Error handling graceful
- ✅ Performance acceptable

### Minor (Nice to Have)
- ✅ All edge cases handled
- ✅ Browser compatibility verified
- ✅ Performance optimized

---

## Test Commands Reference

```bash
# Compilation
npx tsc --noEmit

# Build
npm run build
npm run preview

# Development
npm run dev
npm run narration-api
npm run dev:full

# TTS
npm run tts:generate
npm run tts:from-json

# Change Detection
npm run check-narration
npm run check-tts-cache

# Extraction
npm run extract-narration

# Duration Calculation
npm run tts:duration
```

---

## Notes for Tester

1. **Backend API Required**: Many tests require narration-api server running
2. **TTS Server Optional**: Audio regeneration tests need TTS server (can be skipped)
3. **Browser DevTools**: Keep console open to catch warnings/errors
4. **File System Access**: Some tests require checking actual files
5. **Clean State**: Consider resetting to clean state between test categories

---

## Next Steps

After completing this test plan:
1. Execute all tests
2. Document results in `PHASE_8_TEST_RESULTS.md`
3. Fix critical issues found
4. Update documentation
5. Proceed to Phase 9: Final documentation

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-21  
**Related Docs**:
- [`PHASE_8_TEST_RESULTS.md`](PHASE_8_TEST_RESULTS.md) - Test execution results
- [`NARRATION_EXTERNALIZATION_PLAN.md`](NARRATION_EXTERNALIZATION_PLAN.md) - Implementation plan
- [`PHASE_7_MIGRATION_REPORT.md`](PHASE_7_MIGRATION_REPORT.md) - Migration completion report