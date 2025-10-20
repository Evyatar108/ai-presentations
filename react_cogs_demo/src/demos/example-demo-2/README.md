# Example Demo 2

An alternative placeholder demonstration with different styling to showcase the flexibility of the multi-demo architecture.

## Purpose

This demo complements Example Demo 1 by demonstrating:
- Alternative visual styling (dark theme with cards)
- Different default playback mode (manual instead of narrated)
- Flexible customization per demo
- Variety in presentation approaches

## Slide Structure

This demo consists of 3 slides with a cohesive dark theme:

### Chapter 0: Presentation
- **Slide 1**: Title slide with bordered gradient box
- **Slide 2**: System benefits displayed as card grid
- **Slide 3**: Thank you slide with call-to-action

## Styling Differences from Demo 1

- **Dark theme**: Uses slate/gray background instead of bright gradients
- **Card layout**: Benefits displayed in a 3-column grid
- **Consistent branding**: Uses teal accent color (#00B7C3) throughout
- **Default mode**: Manual playback instead of narrated

## Assets

- **Audio**: Located in `public/audio/example-demo-2/c0/`
- **Images**: Would be located in `public/images/example-demo-2/` (if needed)
- **Thumbnail**: `public/images/example-demo-2/thumbnail.jpeg` (placeholder)

## Development

To add this demo to your local development:

1. Ensure it's registered in `src/demos/DemoRegistry.ts`
2. Audio files will fall back to silence if not generated
3. Use TTS scripts to generate audio: `npm run tts:generate -- --demo example-demo-2`

## Note

This placeholder demo demonstrates that each demo can have completely different styling, structure, and presentation approaches while using the same underlying architecture.