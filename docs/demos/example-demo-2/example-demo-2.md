# Example Demo 2

## Overview

Example Demo 2 is a second placeholder demonstration with alternative styling, showcasing dark theme design patterns and card-based layouts. It complements Example Demo 1 by demonstrating different visual approaches within the multi-demo architecture.

## Demo Structure

**Total Slides**: 3 slides in 1 chapter  
**Duration**: ~30 seconds (placeholder audio)  
**Default Mode**: Manual (no audio)

### Chapter Breakdown

#### Chapter 0: Introduction (3 slides)
- **Ch0_S1_Welcome** - Dark themed title slide with card layout
- **Ch0_S2_Features** - Feature cards with hover effects
- **Ch0_S3_Conclusion** - Summary with call-to-action styling

## Design System

### Visual Style
- **Theme**: Dark background with light text
- **Layout**: Card-based design with subtle shadows
- **Typography**: Clean, modern font stack
- **Animation**: Subtle hover effects and transitions
- **Color Palette**:
  - Background: Dark navy (#0f172a, #1e293b)
  - Cards: Lighter navy (#334155)
  - Text: White (#ffffff) and light gray (#e2e8f0)
  - Accent: Blue (#3b82f6)

### Design Differences from Example Demo 1
- **Dark theme** vs bright gradients
- **Card layouts** vs full-screen centered content
- **Structured information** vs minimalist approach
- **Manual mode default** vs narrated mode

## Target Audience

This demo is intended for:
- **Developers** exploring alternative design patterns
- **Designers** reviewing dark theme implementation
- **Contributors** comparing different slide layout approaches

## Assets

### Images
Located in `public/images/example-demo-2/`:
- **thumbnail.jpeg** - Placeholder thumbnail (can be replaced)

### Audio
Located in `public/audio/example-demo-2/c0/`:
- This demo defaults to manual mode (no audio)
- TTS can be generated if needed: `npm run tts:generate -- --demo example-demo-2`
- Falls back to silence if audio files don't exist

### Videos
No videos used in this demo.

## Notable Implementation Details

### Alternative Styling Approach
Demonstrates:
- Dark theme color scheme
- Card-based information architecture
- CSS box shadows and borders
- Structured content layout
- Responsive grid patterns

### Default Mode: Manual
Unlike Example Demo 1 (narrated), this demo defaults to manual mode:
- User navigates with arrow keys
- No automatic audio playback
- Better for quick reviews and testing
- Shows flexibility of presentation system

### File Structure
- Located in [`src/demos/example-demo-2/slides/chapters/`](../../../presentation-app/src/demos/example-demo-2/slides/chapters/)
- Registered in [`SlidesRegistry.ts`](../../../presentation-app/src/demos/example-demo-2/slides/SlidesRegistry.ts)
- Demo config in [`index.ts`](../../../presentation-app/src/demos/example-demo-2/index.ts)

## Development History

### Creation
- Created alongside Example Demo 1 during multi-demo refactoring (2025-01-20)
- Designed to show alternative visual approach
- Demonstrates dark theme best practices

### Purpose
Serves as:
1. **Alternative design pattern** showing dark theme approach
2. **Manual mode example** for non-narrated presentations
3. **Card layout reference** for structured content
4. **Testing variety** ensuring system handles different styles

## Related Documentation

- **Comparison**: See [Example Demo 1](../example-demo-1/example-demo-1.md) for bright gradient approach
- **Technical Implementation**: [`src/demos/example-demo-2/README.md`](../../../presentation-app/src/demos/example-demo-2/README.md)

## Context Materials

This is a placeholder demo with minimal context requirements. The `context/` directory contains a README explaining what context materials would typically include for real demos.

For comprehensive context examples, see:
- [Meeting Highlights context](../meeting-highlights/context/) - Full set of context materials
- [Example Demo 1 context](../example-demo-1/context/README.md) - Guidelines for context materials

## Demo-Specific Commands

```bash
# Generate TTS audio if needed (creates 1-second silence files)
npm run tts:generate -- --demo example-demo-2

# Calculate duration
npm run tts:duration -- --demo example-demo-2

# Run development server
npm run dev
```

## Presentation Tips

### Design Considerations
- Dark theme reduces eye strain during long presentations
- Card layouts work well for structured information
- Subtle animations maintain professional appearance
- Good contrast ratios ensure readability

### When to Use This Style
- Technical documentation presentations
- Data-heavy content requiring organization
- Professional/corporate settings
- Presentations with multiple information categories

### Customization
To adapt this style for your demo:
1. Keep the dark background (#0f172a)
2. Adjust card colors for your brand
3. Modify accent colors (#3b82f6) to match theme
4. Maintain sufficient contrast for accessibility

## Comparison with Example Demo 1

| Aspect | Example Demo 1 | Example Demo 2 |
|--------|---------------|----------------|
| Theme | Bright gradients | Dark cards |
| Layout | Centered content | Card-based |
| Default Mode | Narrated | Manual |
| Colors | Purple, pink, blue | Navy, gray, blue |
| Use Case | Dynamic presentations | Structured content |

## Next Steps

To create a dark-themed demo based on this example:
1. Copy structure from `src/demos/example-demo-2/`
2. Adjust colors to match your brand
3. Replace placeholder content with actual information
4. Add proper context materials in `docs/demos/{your-demo}/context/`
5. Choose appropriate default mode (narrated/manual)
6. Create or generate audio if using narrated mode

See [`ADDING_DEMOS.md`](../../ADDING_DEMOS.md) for complete instructions.