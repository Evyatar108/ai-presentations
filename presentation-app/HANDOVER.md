# Implementation Handover: Multi-Demo Refactoring

**Date**: 2025-01-20  
**Architect**: Roo (Architect Mode)  
**Status**: Architecture planning complete, ready for implementation  
**Estimated Effort**: 9-13 hours

---

## 📋 Quick Links

- **[TODO.md](TODO.md)** - Detailed checklist with 285 actionable items across 8 phases
- **[REFACTORING_PLAN.md](REFACTORING_PLAN.md)** - Complete architectural design with code examples and rationale
- **Current Code**: All existing code is in `src/` and continues to work

---

## 🎯 Project Goal

Transform the React presentation app from a Meeting Highlights-specific application into a flexible multi-demo platform with:

1. **Welcome screen** for demo selection
2. **Demo registry** supporting unlimited presentations
3. **Self-contained demos** (slides, audio, assets per demo)
4. **Backward compatibility** (Meeting Highlights works exactly as before)

---

## 📐 Architecture Overview

### Current State
```
App.tsx → NarratedController → SlidePlayer
          (hardcoded to Meeting Highlights)
```

### Target State
```
App.tsx → WelcomeScreen (demo selection)
       → DemoPlayer → NarratedController → SlidePlayer
                     (receives demo config)
```

### New File Structure
```
src/demos/
├── DemoRegistry.ts              # Central registry of all demos
├── types.ts                     # Type definitions
├── meeting-highlights/          # Existing demo (moved here)
│   ├── index.ts                 # Demo config
│   └── slides/                  # All slides moved from src/slides/
├── example-demo-1/              # Placeholder demo 1
└── example-demo-2/              # Placeholder demo 2

public/
├── audio/meeting-highlights/    # Audio organized by demo
├── images/meeting-highlights/
└── videos/meeting-highlights/
```

---

## 🔑 Key Implementation Points

### 1. Type Safety First
Start by creating [`src/demos/types.ts`](REFACTORING_PLAN.md#type-definitions) - this defines the contract for all demos:
- `DemoMetadata` - Title, description, thumbnail, etc.
- `DemoConfig` - Complete demo configuration
- `DemoRegistryEntry` - Registry entry with lazy loading

### 2. Demo Registry Pattern
The [`DemoRegistry.ts`](REFACTORING_PLAN.md#demo-registry-pattern) is the heart of the system:
- Centralized list of all available demos
- Lazy loading for performance (demos load on-demand)
- Helper functions: `getDemoById()`, `getAllDemos()`

### 3. File Migration Strategy
**Critical**: Move files in this order to avoid breaking imports:
1. Create new demo folder structure
2. Move slide files to demo folders
3. Update imports in moved files
4. Move audio/asset files
5. Update audio paths in slide metadata

See [Phase 2](TODO.md#phase-2-meeting-highlights-migration) in TODO.md for detailed checklist.

### 4. Component Updates
- **WelcomeScreen**: New component for demo selection
- **DemoPlayer**: New wrapper that manages demo context
- **NarratedController**: Remove hardcoded title, accept demo config as props
- **App.tsx**: Route between welcome screen and demo player

### 5. Import Path Changes
Most common update you'll need to make:
```typescript
// Before
import { something } from '../../SlideMetadata';

// After
import { something } from '../../../../slides/SlideMetadata';
```

### 6. Audio Path Changes
Update ~65 audio file references:
```typescript
// Before
audioFilePath: '/audio/c1/s1_segment_01.wav'

// After
audioFilePath: '/audio/meeting-highlights/c1/s1_segment_01.wav'
```

---

## 📝 Implementation Phases

### Phase 1: Core Structure (2-3 hours)
Create type definitions and demo registry. This establishes the foundation.

**Start here**: [`TODO.md - Phase 1`](TODO.md#phase-1-core-structure-)

### Phase 2: Meeting Highlights Migration (2-3 hours)
Move all Meeting Highlights slides to demo folder, update imports and paths.

**Most complex phase** - take your time with imports!

### Phase 3: Asset Migration (1 hour)
Move audio, images, videos to demo-specific folders.

**Straightforward** - just file operations.

### Phase 4: Component Updates (2-3 hours)
Create WelcomeScreen, DemoPlayer, update existing components.

**This brings it all together** - you'll see the app working end-to-end.

### Phase 5: Placeholder Demos (1 hour)
Create 2 simple example demos to prove the multi-demo system works.

**Optional but recommended** - validates the architecture.

### Phase 6: TTS Script Updates (1-2 hours)
Update audio generation scripts to support multiple demos.

**Can be done in parallel** with other phases.

### Phase 7: Documentation (1 hour)
Update README.md and Agents.md with new architecture.

**Don't skip this** - future developers need this context!

### Phase 8: Testing (1-2 hours)
Comprehensive testing of all flows and edge cases.

**Critical** - ensure nothing broke!

---

## 🚀 Getting Started

### Immediate Next Steps

1. **Review the plan**: Read [`REFACTORING_PLAN.md`](REFACTORING_PLAN.md) sections 1-4 (up to "Component Updates")

2. **Start Phase 1**: Create the type system
   ```bash
   # Create the demos directory
   mkdir src/demos
   
   # Create types.ts using code from REFACTORING_PLAN.md
   # Create DemoRegistry.ts using code from REFACTORING_PLAN.md
   ```

3. **Test incrementally**: After each phase, verify TypeScript compiles:
   ```bash
   npm run build
   ```

4. **Use the checklist**: Check off items in [`TODO.md`](TODO.md) as you complete them

5. **Commit frequently**: Commit after each completed phase

---

## ⚠️ Gotchas & Tips

### Import Path Hell
- Use VSCode's "Find All References" before moving files
- Update imports immediately after moving each file
- Test compilation after each batch of file moves

### Audio Path Updates
- Use global find/replace: `"/audio/c` → `"/audio/meeting-highlights/c`
- Check all 9 chapter files (Chapter0.tsx through Chapter9.tsx)
- ~65 total audio path references need updating

### TypeScript Errors
- Start from the bottom of the error list (dependencies first)
- Most errors will be import path issues
- `SlideMetadata` imports are most common issue

### Testing Strategy
- Test welcome screen first (it's independent)
- Then test Meeting Highlights demo (should work exactly as before)
- Then test placeholder demos (simpler, good for debugging)

### TTS Scripts
- Can update these last - existing audio files still work
- Focus on getting the app working first
- TTS updates are bonus for multi-demo audio generation

---

## 📊 Success Criteria

You'll know you're done when:

- ✅ Welcome screen displays 3 demo cards
- ✅ Clicking a demo card loads that demo
- ✅ Meeting Highlights plays exactly as before (all 15 slides, audio works)
- ✅ Example demos display and navigate correctly
- ✅ "Back to Demos" button returns to welcome screen
- ✅ `npm run build` succeeds with no errors
- ✅ No console errors in browser
- ✅ All 3 presentation modes work (Narrated, Manual, Manual+Audio)

---

## 🆘 Need Help?

### Common Issues & Solutions

**Problem**: TypeScript can't find imports after moving files  
**Solution**: Check relative path depth - moved files need `../../../` instead of `../../`

**Problem**: Audio doesn't play in moved demo  
**Solution**: Verify audio file paths in slide metadata match new folder structure

**Problem**: Demo registry throws error on load  
**Solution**: Check that demo index.ts exports correct object matching DemoConfig interface

**Problem**: Welcome screen doesn't show demo thumbnails  
**Solution**: Verify thumbnail paths point to `/images/meeting-highlights/` folder

### Resources

- **TypeScript Errors**: Start from first error, fix bottom-up
- **Import Issues**: Use VSCode's auto-import feature
- **Path Issues**: Check [`REFACTORING_PLAN.md`](REFACTORING_PLAN.md) for path patterns
- **Component Examples**: See plan for complete component code

---

## 📦 Deliverables

When you're finished, you should have:

1. ✅ All phases in [`TODO.md`](TODO.md) checked off
2. ✅ Welcome screen working with 3 demos
3. ✅ Meeting Highlights demo working identically to before
4. ✅ 2 placeholder demos demonstrating multi-demo support
5. ✅ Updated documentation (README.md, Agents.md)
6. ✅ All tests passing
7. ✅ Clean build with no errors

---

## 💡 Final Notes

This refactoring is **additive, not destructive**:
- Meeting Highlights functionality remains identical
- All existing slides, audio, and assets continue to work
- New structure adds capabilities without breaking existing features

The architecture is designed to be:
- **Scalable**: Add unlimited demos easily
- **Maintainable**: Clear separation of concerns
- **Type-safe**: TypeScript prevents common errors
- **Professional**: Clean UX with demo selection

Take your time with Phase 2 (migration) - this is where most of the work is. Once that's done, the rest flows naturally.

**Good luck, and happy coding!** 🚀

---

*For detailed code examples and architectural rationale, see [`REFACTORING_PLAN.md`](REFACTORING_PLAN.md)*  
*For step-by-step checklist, see [`TODO.md`](TODO.md)*