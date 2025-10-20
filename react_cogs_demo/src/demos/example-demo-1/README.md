# Example Demo 1

A placeholder demonstration showcasing the multi-demo architecture.

## Purpose

This demo serves as a reference implementation demonstrating:
- How to structure a new demo within the multi-demo system
- Demo-specific asset organization (`/audio/example-demo-1/`, `/images/example-demo-1/`)
- Slide component structure with metadata
- Integration with the demo registry

## Slide Structure

This demo consists of 3 simple slides organized in a single chapter:

### Chapter 0: Introduction
- **Slide 1**: Title slide introducing Example Demo 1
- **Slide 2**: Key features of the multi-demo architecture
- **Slide 3**: Conclusion and summary

## Assets

- **Audio**: Located in `public/audio/example-demo-1/c0/`
- **Images**: Would be located in `public/images/example-demo-1/` (if needed)
- **Thumbnail**: `public/images/example-demo-1/thumbnail.jpeg` (placeholder)

## Development

To add this demo to your local development:

1. Ensure it's registered in `src/demos/DemoRegistry.ts`
2. Audio files will fall back to silence if not generated
3. Use TTS scripts to generate audio: `npm run tts:generate -- --demo example-demo-1`

## Note

This is a placeholder demo with simple styling and generic content. It demonstrates the architecture without requiring complex animations or data visualizations.