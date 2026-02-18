# Example Demo 1

## Overview

Example Demo 1 is a placeholder demonstration showcasing the multi-demo architecture. It serves as a reference implementation for developers creating new demos, demonstrating how to structure slides, organize assets, and integrate with the demo registry.

## Demo Structure

**Total Slides**: 3 slides in 1 chapter  
**Duration**: ~30 seconds (placeholder audio)  
**Default Mode**: Narrated

### Chapter Breakdown

#### Chapter 0: Introduction (3 slides)
- **Ch0_S1_Welcome** - Title slide introducing Example Demo 1 with purple gradient
- **Ch0_S2_Features** - Key features of the multi-demo architecture with pink gradient
- **Ch0_S3_Conclusion** - Summary and next steps with blue gradient

## Design System

### Visual Style
- **Gradients**: Each slide uses a different gradient background
- **Typography**: Large, bold titles with simple layouts
- **Animation**: Minimal animations for quick loading
- **Color Palette**:
  - Slide 1: Purple gradient (#667eea to #764ba2)
  - Slide 2: Pink gradient (#f093fb to #f5576c)
  - Slide 3: Blue gradient (#4facfe to #00f2fe)

## Target Audience

This demo is intended for:
- **Developers** learning the multi-demo architecture
- **Contributors** looking for a simple reference implementation
- **Testers** validating the demo system functionality

## Assets

### Images
Located in `public/images/example-demo-1/`:
- **thumbnail.jpeg** - Placeholder thumbnail (can be replaced with actual image)

### Audio
Located in `public/audio/example-demo-1/c0/`:
- Audio files fall back to 1-second silence if not generated
- TTS can be generated with: `npm run tts:generate -- --demo example-demo-1`

### Videos
No videos used in this demo.

## Notable Implementation Details

### Simplicity by Design
- Uses inline CSS-in-JS for styling (no external stylesheets)
- Minimal dependencies (only React and Framer Motion)
- No complex data visualizations or animations
- Single chapter keeps structure simple

### Architecture Demonstration
This demo shows:
- How to organize slides in chapter files
- Metadata structure for slide segments
- Integration with the demo registry
- Asset organization patterns
- Lazy loading of demo modules

### File Structure
- Located in [`src/demos/example-demo-1/slides/chapters/`](../../../presentation-app/src/demos/example-demo-1/slides/chapters/)
- Registered in [`SlidesRegistry.ts`](../../../presentation-app/src/demos/example-demo-1/slides/SlidesRegistry.ts)
- Demo config in [`index.ts`](../../../presentation-app/src/demos/example-demo-1/index.ts)

## Development History

### Creation
- Created as part of multi-demo architecture refactoring (2025-01-20)
- Designed to be a minimal but complete example
- Intentionally kept simple for reference purposes

### Purpose
Serves as:
1. **Reference implementation** for new demos
2. **Architecture validation** ensuring multi-demo system works
3. **Documentation example** showing expected structure
4. **Testing baseline** for system-wide changes

## Related Documentation

- **Architecture**: Multi-demo system allows unlimited presentations
- **Technical Implementation**: [`src/demos/example-demo-1/README.md`](../../../presentation-app/src/demos/example-demo-1/README.md)

## Context Materials

This is a placeholder demo with minimal context requirements. For real demos, the `context/` directory would contain:
- Product/feature overview documentation
- Architecture diagrams and technical details
- Team collaboration information
- User access instructions
- Version-specific implementation files

See the [Meeting Highlights demo](../meeting-highlights/meeting-highlights.md) for a comprehensive example of a fully-documented demo with extensive context materials.

## Demo-Specific Commands

```bash
# Generate TTS audio (creates 1-second silence files)
npm run tts:generate -- --demo example-demo-1

# Calculate duration
npm run tts:duration -- --demo example-demo-1

# Run development server
npm run dev
```

## Presentation Tips

### For Developers
- Review the slide components in `Chapter0.tsx` to understand the pattern
- Check metadata structure for audio paths and narration text
- Note the simple gradient styling approach

### For Testing
- Use this demo to verify system-wide changes don't break basic functionality
- Test all three presentation modes (Narrated, Manual, Manual+Audio)
- Validate asset loading and fallback behavior

## Next Steps

To create your own demo based on this example:
1. Copy the structure from `src/demos/example-demo-1/`
2. Replace placeholder content with your actual presentation
3. Add proper context materials in `docs/demos/{your-demo}/context/`
4. Update metadata with correct title, description, and tags
5. Generate real TTS audio or create custom audio files
6. Add a proper thumbnail image

See [`ADDING_DEMOS.md`](../../ADDING_DEMOS.md) for complete instructions.