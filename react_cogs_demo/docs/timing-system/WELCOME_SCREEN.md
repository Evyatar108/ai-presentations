# WelcomeScreen Enhancement Design

Detailed design for adding duration breakdown to the WelcomeScreen component.

---

## Overview

Enhance WelcomeScreen to display:
1. **Summary** - Total duration with audio + delays breakdown
2. **Interactive Button** - "View Details" to expand/collapse
3. **Detailed Breakdown** - Per-slide and per-segment durations
4. **Scrollable Container** - For demos with many slides

---

## Visual Design

### Collapsed State (Default)

```
┌─────────────────────────────────────────┐
│ Meeting Highlights - COGS Reduction     │
│ Description text...                     │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 🕒 Total: ~4:31    ▶ View Details  ││
│ │    4:07 audio + 0:24 delays        ││
│ └─────────────────────────────────────┘│
│                                         │
│ [Tags: Feature, COGS]                  │
│ ▶ Play Presentation                    │
└─────────────────────────────────────────┘
```

### Expanded State

```
┌─────────────────────────────────────────┐
│ Meeting Highlights - COGS Reduction     │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ 🕒 Total: ~4:31    ▼ Hide Details  ││
│ │    4:07 audio + 0:24 delays        ││
│ │─────────────────────────────────────││
│ │ Detailed Breakdown                  ││
│ │                                     ││
│ │ ┌─────────────────────────────────┐││
│ │ │Ch0:S1 - Intro            0:12   │││
│ │ │Audio: 0:10  Delays: 0:02        │││
│ │ │─────────────────────────────────│││
│ │ │SEGMENTS (3)                     │││
│ │ │1. intro         0:05  +0.5s    │││
│ │ │2. combination   0:03  +0.5s    │││
│ │ │3. problem       0:02  +1.0s    │││
│ │ └─────────────────────────────────┘││
│ │                                     ││
│ │ ┌─────────────────────────────────┐││
│ │ │Ch1:S1 - Product Intro    0:18   │││
│ │ │Audio: 0:15  Delays: 0:03        │││
│ │ │... (scrollable)                 │││
│ │ └─────────────────────────────────┘││
│ │                                     ││
│ │─────────────────────────────────────││
│ │ Total Slides: 15  Avg: 0:18/slide  ││
│ │ Total Segments: 65                  ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## Implementation

### Component State

```typescript
const [showBreakdown, setShowBreakdown] = useState<string | null>(null);

// Helper function
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
```

### Duration Display Component

```typescript
{/* Enhanced Duration Display */}
{demo.durationInfo && (
  <div style={{
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(0, 183, 195, 0.05)',
    borderRadius: 8,
    border: '1px solid rgba(0, 183, 195, 0.2)'
  }}>
    {/* Summary Header */}
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <div style={{
          fontSize: 15,
          color: '#00B7C3',
          fontWeight: 600,
          marginBottom: '0.25rem'
        }}>
          🕒 Total: ~{formatDuration(demo.durationInfo.total)}
        </div>
        <div style={{
          fontSize: 11,
          color: '#64748b'
        }}>
          {formatDuration(demo.durationInfo.audioOnly)} audio + 
          {' '}{formatDuration(demo.durationInfo.total - demo.durationInfo.audioOnly)} delays
        </div>
      </div>
      
      {/* View Details Button */}
      {demo.durationInfo.slideBreakdown && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowBreakdown(showBreakdown === demo.id ? null : demo.id);
          }}
          style={{
            background: 'transparent',
            border: '1px solid rgba(0, 183, 195, 0.4)',
            color: '#00B7C3',
            padding: '0.4rem 0.8rem',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {showBreakdown === demo.id ? '▼ Hide Details' : '▶ View Details'}
        </button>
      )}
    </div>
    
    {/* Expanded Breakdown */}
    <AnimatePresence>
      {showBreakdown === demo.id && demo.durationInfo.slideBreakdown && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(148, 163, 184, 0.2)',
            overflow: 'hidden'
          }}
        >
          {/* Scrollable Slide List */}
          <div style={{
            maxHeight: 300,
            overflowY: 'auto',
            paddingRight: '0.5rem'
          }}>
            {demo.durationInfo.slideBreakdown.map((slide, idx) => (
              <div
                key={`${slide.chapter}-${slide.slide}`}
                style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: 'rgba(30, 41, 59, 0.4)',
                  borderRadius: 6,
                  border: '1px solid rgba(148, 163, 184, 0.1)'
                }}
              >
                {/* Slide Header */}
                <div style={{
                  fontSize: 12,
                  color: '#f1f5f9',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>Ch{slide.chapter}:S{slide.slide} - {slide.title}</span>
                  <span style={{ color: '#00B7C3' }}>
                    {formatDuration(slide.total)}
                  </span>
                </div>
                
                {/* Slide Summary */}
                <div style={{
                  fontSize: 11,
                  color: '#94a3b8',
                  marginBottom: '0.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: '0.25rem 0.5rem'
                }}>
                  <span>Audio:</span>
                  <span>{formatDuration(slide.audioTotal)}</span>
                  <span>Delays:</span>
                  <span>{formatDuration(slide.delaysTotal)}</span>
                </div>
                
                {/* Per-Segment Breakdown */}
                {slide.segments.length > 1 && (
                  <div style={{
                    marginTop: '0.5rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid rgba(148, 163, 184, 0.1)'
                  }}>
                    <div style={{
                      fontSize: 10,
                      color: '#64748b',
                      marginBottom: '0.25rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Segments ({slide.segments.length})
                    </div>
                    {slide.segments.map((segment, segIdx) => (
                      <div
                        key={segment.id}
                        style={{
                          fontSize: 10,
                          color: '#94a3b8',
                          display: 'grid',
                          gridTemplateColumns: '1fr auto auto',
                          gap: '0.5rem',
                          padding: '0.25rem 0',
                          borderBottom: segIdx < slide.segments.length - 1 
                            ? '1px solid rgba(148, 163, 184, 0.05)' 
                            : 'none'
                        }}
                      >
                        <span style={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {segIdx + 1}. {segment.id}
                        </span>
                        <span style={{ color: '#f1f5f9' }}>
                          {formatDuration(segment.audioDuration)}
                        </span>
                        <span style={{ color: '#64748b', fontSize: 9 }}>
                          +{(segment.delayAfter / 1000).toFixed(1)}s
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Summary Footer */}
          <div style={{
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(148, 163, 184, 0.2)',
            fontSize: 11,
            color: '#94a3b8',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '0.25rem 0.75rem'
          }}>
            <span>Total Slides:</span>
            <span>{demo.durationInfo.slideBreakdown.length}</span>
            
            <span>Total Segments:</span>
            <span>
              {demo.durationInfo.slideBreakdown.reduce(
                (sum, s) => sum + s.segments.length, 0
              )}
            </span>
            
            <span>Avg per Slide:</span>
            <span>
              {formatDuration(
                demo.durationInfo.total / demo.durationInfo.slideBreakdown.length
              )}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)}
```

---

## Styling Guidelines

### Colors
- **Primary Accent**: `#00B7C3` (teal)
- **Background**: `rgba(0, 183, 195, 0.05)` (subtle teal)
- **Border**: `rgba(0, 183, 195, 0.2)`
- **Text Primary**: `#f1f5f9`
- **Text Secondary**: `#94a3b8`
- **Text Muted**: `#64748b`

### Typography
- **Summary Title**: 15px, font-weight 600
- **Summary Subtitle**: 11px
- **Slide Header**: 12px, font-weight 600
- **Slide Details**: 11px
- **Segment Details**: 10px
- **Labels**: 10px, uppercase, letter-spacing 0.5px

### Spacing
- **Container Padding**: 1rem
- **Element Gaps**: 0.5rem - 1rem
- **Slide Card Padding**: 0.75rem
- **Border Radius**: 6-8px

### Animations
- **Duration**: 0.3s
- **Easing**: ease-in-out
- **Expand/Collapse**: Height + opacity transition

---

## Responsive Considerations

### Mobile (< 768px)
```typescript
style={{
  fontSize: showMobile ? 13 : 15,
  padding: showMobile ? '0.75rem' : '1rem'
}}
```

### Tablet (768px - 1024px)
- Reduce font sizes slightly
- Adjust grid columns for better fit
- Maintain touch targets (min 44x44px)

### Desktop (> 1024px)
- Full layout as designed
- Hover effects on interactive elements
- Smooth scrolling in breakdown

---

## Accessibility

### Keyboard Navigation
```typescript
<button
  aria-label={`${showBreakdown === demo.id ? 'Hide' : 'View'} timing details for ${demo.title}`}
  aria-expanded={showBreakdown === demo.id}
  // ... other props
>
```

### Screen Readers
- Semantic HTML structure
- ARIA labels on buttons
- Descriptive text for durations
- Logical reading order

### Focus Management
- Visible focus indicators
- Logical tab order
- Focus trap in expanded state (optional)

---

## Performance Optimization

### Lazy Rendering
Only render breakdown when expanded:
```typescript
{showBreakdown === demo.id && /* render breakdown */}
```

### Virtualization (Optional)
For demos with >50 slides, consider:
```typescript
import { FixedSizeList } from 'react-window';
```

### Memoization
```typescript
const slideBreakdown = useMemo(() => 
  demo.durationInfo?.slideBreakdown || [],
  [demo.durationInfo]
);
```

---

## Alternative Designs

### Option 1: Modal Overlay
Instead of inline expansion, open full-screen modal:
```typescript
{showDetailsModal === demo.id && (
  <DurationDetailsModal 
    demo={demo}
    onClose={() => setShowDetailsModal(null)}
  />
)}
```

**Pros**: More space, better for many slides  
**Cons**: Context switch, modal management

### Option 2: Tooltip on Hover
Show brief breakdown on hover, click for full:
```typescript
<Tooltip content={briefBreakdown}>
  <span>🕒 {formatDuration(total)}</span>
</Tooltip>
```

**Pros**: Quick preview, no expansion  
**Cons**: Not mobile-friendly, limited info

### Option 3: Accordion Per Slide
Each slide card expandable individually:
```typescript
{slides.map(slide => (
  <Accordion key={slide.id}>
    <AccordionHeader>{slide.title}</AccordionHeader>
    <AccordionContent>{/* segments */}</AccordionContent>
  </Accordion>
))}
```

**Pros**: Granular control  
**Cons**: Complex interaction, more clicks

---

## Testing Checklist

- [ ] Duration displays for demos with `durationInfo`
- [ ] Duration hidden for demos without `durationInfo`
- [ ] "View Details" button expands/collapses correctly
- [ ] Breakdown shows all slides
- [ ] Per-segment details display correctly
- [ ] Scrolling works in tall lists
- [ ] Animations smooth and performant
- [ ] Click on card (non-button) selects demo
- [ ] Click on button only toggles breakdown
- [ ] Mobile layout responsive
- [ ] Keyboard navigation works
- [ ] Screen reader accessible

---

## Future Enhancements

1. **Filtering**: Filter slides by chapter
2. **Search**: Search within breakdown
3. **Export**: Export breakdown as CSV/JSON
4. **Compare**: Compare durations across demos
5. **Visualization**: Timeline/chart view of duration
6. **Customization**: User can collapse individual slides
7. **Sorting**: Sort slides by duration

---

## See Also

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Type definitions
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Implementation phases
- [EXAMPLES.md](./EXAMPLES.md) - Usage examples