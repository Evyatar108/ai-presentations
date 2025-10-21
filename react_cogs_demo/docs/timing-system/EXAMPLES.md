# Usage Examples

Common timing configuration patterns and use cases.

---

## Basic Examples

### Example 1: Default Timing (No Config)

Demos without timing config use global defaults:

```typescript
export const demoConfig: DemoConfig = {
  id: 'my-demo',
  metadata: { /* ... */ },
  // No timing specified - uses defaults:
  // betweenSegments: 500ms
  // betweenSlides: 1000ms
  // afterFinalSlide: 2000ms
  getSlides: () => import('./slides/SlidesRegistry').then(m => m.allSlides)
};
```

### Example 2: Fast-Paced Demo

Shorter delays for quick presentation:

```typescript
export const demoConfig: DemoConfig = {
  id: 'quick-demo',
  metadata: { /* ... */ },
  timing: {
    betweenSegments: 300,  // 300ms instead of 500ms
    betweenSlides: 500,    // 500ms instead of 1000ms
    afterFinalSlide: 1000  // 1s instead of 2s
  },
  getSlides: () => import('./slides/SlidesRegistry').then(m => m.allSlides)
};
```

### Example 3: Contemplative Demo

Longer delays for reflection:

```typescript
export const demoConfig: DemoConfig = {
  id: 'contemplative-demo',
  metadata: { /* ... */ },
  timing: {
    betweenSegments: 800,   // Extra breathing room
    betweenSlides: 1500,    // More time between slides
    afterFinalSlide: 3000   // Longer ending pause
  },
  getSlides: () => import('./slides/SlidesRegistry').then(m => m.allSlides)
};
```

---

## Per-Slide Overrides

### Example 4: Extra Pause After Video

Video slide needs extra time for comprehension:

```typescript
export const Ch1_S2_VideoDemo: SlideComponentWithMetadata = () => {
  return (
    <VideoPlayer src="/videos/demo.mp4" />
  );
};

Ch1_S2_VideoDemo.metadata = {
  chapter: 1,
  slide: 2,
  title: 'Video Demonstration',
  audioSegments: [
    {
      id: 'narration',
      audioFilePath: '/audio/c1/s2_narration.wav',
      narrationText: 'Watch this demonstration...'
    }
  ],
  timing: {
    betweenSlides: 2000  // Override: Extra 1s after video (2s instead of 1s)
  }
};
```

### Example 5: Quick Transition Slide

Title slide that doesn't need long pause:

```typescript
export const Ch0_S1_Title: SlideComponentWithMetadata = () => {
  return <TitleSlide />;
};

Ch0_S1_Title.metadata = {
  chapter: 0,
  slide: 1,
  title: 'Introduction',
  audioSegments: [
    {
      id: 'title',
      audioFilePath: '/audio/c0/s1_title.wav',
      narrationText: 'Welcome to our presentation'
    }
  ],
  timing: {
    betweenSlides: 500  // Override: Quick transition (500ms instead of 1000ms)
  }
};
```

---

## Per-Segment Overrides

### Example 6: Dramatic Pause

Build suspense before reveal:

```typescript
export const Ch5_S1_BigReveal: SlideComponentWithMetadata = () => {
  return <RevealAnimation />;
};

Ch5_S1_BigReveal.metadata = {
  chapter: 5,
  slide: 1,
  title: 'The Solution',
  audioSegments: [
    {
      id: 'setup',
      audioFilePath: '/audio/c5/s1_setup.wav',
      narrationText: 'So we needed a solution...',
      timing: {
        betweenSegments: 1500  // Override: Dramatic 1.5s pause before reveal
      }
    },
    {
      id: 'reveal',
      audioFilePath: '/audio/c5/s1_reveal.wav',
      narrationText: 'And here it is!'
    }
  ]
};
```

### Example 7: Quick-Fire Segments

Rapid succession for impact:

```typescript
export const Ch7_S1_Metrics: SlideComponentWithMetadata = () => {
  return <MetricsDisplay />;
};

Ch7_S1_Metrics.metadata = {
  chapter: 7,
  slide: 1,
  title: 'Key Metrics',
  audioSegments: [
    {
      id: 'metric1',
      audioFilePath: '/audio/c7/s1_metric1.wav',
      narrationText: '75% reduction',
      timing: {
        betweenSegments: 200  // Override: Quick 200ms between metrics
      }
    },
    {
      id: 'metric2',
      audioFilePath: '/audio/c7/s1_metric2.wav',
      narrationText: '60% savings',
      timing: {
        betweenSegments: 200  // Override: Keep it rapid
      }
    },
    {
      id: 'metric3',
      audioFilePath: '/audio/c7/s1_metric3.wav',
      narrationText: '99% reliability'
      // Last segment uses slide/demo timing for betweenSlides
    }
  ]
};
```

---

## Complex Multi-Level Overrides

### Example 8: Demo with Mixed Pacing

Different sections have different timing needs:

```typescript
// Demo-level: Normal pacing
export const demoConfig: DemoConfig = {
  id: 'mixed-pace-demo',
  timing: {
    betweenSegments: 500,
    betweenSlides: 1000,
    afterFinalSlide: 2000
  },
  // ...
};

// Intro slide: Quick
export const Ch0_S1_Intro: SlideComponentWithMetadata = () => <Intro />;
Ch0_S1_Intro.metadata = {
  // ...
  timing: {
    betweenSlides: 500  // Slide override: Quick intro
  }
};

// Main content: Normal (uses demo defaults)
export const Ch1_S1_Content: SlideComponentWithMetadata = () => <Content />;
Ch1_S1_Content.metadata = {
  // ... no timing override, uses demo defaults
};

// Conclusion: Slow
export const Ch9_S1_Conclusion: SlideComponentWithMetadata = () => <Conclusion />;
Ch9_S1_Conclusion.metadata = {
  // ...
  audioSegments: [
    {
      id: 'summary',
      // ...
      timing: {
        betweenSegments: 1000  // Segment override: Extra pause for reflection
      }
    },
    {
      id: 'cta',
      // ...
      // Uses slide timing (if set) or demo timing (1000ms)
    }
  ],
  timing: {
    betweenSlides: 2000,      // Slide override: Extra time before Q&A
    afterFinalSlide: 3000     // Slide override: Longer final pause
  }
};
```

**Resolution for conclusion slide, final segment**:
```
Segment timing: not set
Slide timing: afterFinalSlide = 3000ms
Demo timing: afterFinalSlide = 2000ms
DEFAULT_TIMING: afterFinalSlide = 2000ms

Result: Uses slide.timing.afterFinalSlide = 3000ms
```

---

## Special Cases

### Example 9: Animation-Heavy Slide

Complex animations need controlled pacing:

```typescript
export const Ch4_S1_Architecture: SlideComponentWithMetadata = () => {
  return <ComplexArchitectureDiagram />;
};

Ch4_S1_Architecture.metadata = {
  chapter: 4,
  slide: 1,
  title: 'System Architecture',
  audioSegments: [
    {
      id: 'intro',
      audioFilePath: '/audio/c4/s1_intro.wav',
      narrationText: 'Let me show you our architecture',
      timing: {
        betweenSegments: 800  // Extra time for initial diagram render
      }
    },
    {
      id: 'frontend',
      audioFilePath: '/audio/c4/s1_frontend.wav',
      narrationText: 'The frontend consists of...',
      timing: {
        betweenSegments: 600  // Time for frontend components to highlight
      }
    },
    {
      id: 'backend',
      audioFilePath: '/audio/c4/s1_backend.wav',
      narrationText: 'The backend handles...',
      timing: {
        betweenSegments: 600  // Time for backend components to highlight
      }
    },
    {
      id: 'data',
      audioFilePath: '/audio/c4/s1_data.wav',
      narrationText: 'Data flows through...'
      // Last segment: uses slide timing
    }
  ],
  timing: {
    betweenSlides: 1500  // Extra time to absorb full diagram
  }
};
```

### Example 10: Interactive Demo Slide

User might interact, so keep timing flexible:

```typescript
export const Ch6_S1_Interactive: SlideComponentWithMetadata = () => {
  return <InteractiveDemo />;
};

Ch6_S1_Interactive.metadata = {
  chapter: 6,
  slide: 1,
  title: 'Try It Yourself',
  audioSegments: [
    {
      id: 'instructions',
      audioFilePath: '/audio/c6/s1_instructions.wav',
      narrationText: 'You can interact with this demo',
      timing: {
        betweenSegments: 2000  // Extra time for users to try it
      }
    },
    {
      id: 'walkthrough',
      audioFilePath: '/audio/c6/s1_walkthrough.wav',
      narrationText: 'Let me show you the features'
    }
  ],
  timing: {
    betweenSlides: 2000  // Extra time before moving on
  }
};
```

---

## Anti-Patterns (What to Avoid)

### ❌ Anti-Pattern 1: Inconsistent Timing

```typescript
// Bad: Random timing values without rationale
timing: {
  betweenSegments: 437,   // Why 437ms? Arbitrary
  betweenSlides: 1234,    // Why 1234ms? Arbitrary
  afterFinalSlide: 999    // Why 999ms? Arbitrary
}
```

**Better**: Use round numbers with clear intent
```typescript
timing: {
  betweenSegments: 400,   // Slightly faster than default for pacing
  betweenSlides: 1200,    // Slightly longer to emphasize transitions
  afterFinalSlide: 1000   // Shorter ending for quick replays
}
```

### ❌ Anti-Pattern 2: Over-Specifying

```typescript
// Bad: Setting timing on every segment unnecessarily
audioSegments: [
  { id: 'seg1', timing: { betweenSegments: 500 } },  // Same as default
  { id: 'seg2', timing: { betweenSegments: 500 } },  // Same as default
  { id: 'seg3', timing: { betweenSegments: 500 } }   // Same as default
]
```

**Better**: Only override when needed
```typescript
audioSegments: [
  { id: 'seg1' },  // Uses defaults
  { id: 'seg2' },  // Uses defaults
  { id: 'seg3' }   // Uses defaults
]
```

### ❌ Anti-Pattern 3: Extreme Values

```typescript
// Bad: Too fast (jarring) or too slow (boring)
timing: {
  betweenSegments: 50,     // Too fast! Users can't process
  betweenSlides: 5000,     // Too slow! Users get impatient
  afterFinalSlide: 100     // Too fast! Feels abrupt
}
```

**Better**: Stay within reasonable ranges
```typescript
timing: {
  betweenSegments: 300-800,     // 0.3-0.8s feels natural
  betweenSlides: 500-2000,      // 0.5-2s gives breathing room
  afterFinalSlide: 1000-3000    // 1-3s for proper conclusion
}
```

---

## Testing Your Timing

### Manual Testing Checklist

1. **Watch the full presentation** in narrated mode
2. **Check transitions feel natural** - Not too fast or slow
3. **Verify delays match expectations** - Run duration script
4. **Test with different playback modes** - Manual, Manual+Audio
5. **Get feedback from others** - Fresh eyes catch pacing issues

### Validation Script

```bash
# Generate duration report
npm run tts:duration -- --demo your-demo-id

# Compare calculated vs. actual runtime
# Watch presentation and time it manually
# Difference should be < 2 seconds
```

### Debugging Timing Issues

```typescript
// Add logging to see resolved timing
const timing = resolveTimingConfig(demoTiming, slide.timing, segment.timing);
console.log('[Timing]', {
  demo: demoTiming,
  slide: slide.timing,
  segment: segment.timing,
  resolved: timing
});
```

---

## Best Practices

1. **Start with defaults** - Only override when necessary
2. **Use round numbers** - 500, 1000, 1500 (not 487, 1023, 1492)
3. **Document rationale** - Comment why you chose specific values
4. **Test actual runtime** - Verify calculations match reality
5. **Consider context** - Video slides need more time than static
6. **Be consistent** - Similar slides should have similar timing
7. **Get feedback** - Let others watch and comment on pacing

---

## See Also

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Type definitions and design
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Implementation guide
- [WELCOME_SCREEN.md](./WELCOME_SCREEN.md) - Duration display UI
- [MIGRATION.md](./MIGRATION.md) - Migrating existing demos