# Theme System

## Overview

The presentation framework includes a theme system that allows customizing colors and typography via React context. Framework components read theme values through the `useTheme()` hook, while existing demo slides continue to work with static style exports.

## `PresentationTheme` Interface

```typescript
interface PresentationTheme {
  colors: {
    primary: string;      // Main accent (#00B7C3)
    secondary: string;    // Secondary accent (#0078D4)
    bgDeep: string;       // Deep background (#0f172a)
    bgSurface: string;    // Card/surface background (#1e293b)
    bgBorder: string;     // Border color (#334155)
    textPrimary: string;  // Primary text (#f1f5f9)
    textSecondary: string;// Secondary text (#94a3b8)
    textMuted: string;    // Muted text (#64748b)
    success: string;      // Success state (#10b981)
    warning: string;      // Warning state (#fbbf24)
    error: string;        // Error state (#ef4444)
  };
  fontFamily: string;     // 'Inter, system-ui, sans-serif'
}
```

## Customizing via `project.config.ts`

```typescript
import type { PartialTheme } from './framework/theme/types';

export const themeOverrides: PartialTheme = {
  colors: {
    primary: '#6366f1',    // Indigo instead of teal
    secondary: '#8b5cf6',  // Purple instead of blue
  },
  fontFamily: 'Roboto, system-ui, sans-serif',
};
```

Only the properties you specify are overridden; everything else falls back to defaults.

## Using `useTheme()` in Custom Slides

```tsx
import { useTheme } from '../framework/theme/ThemeContext';

const MySlide = () => {
  const theme = useTheme();

  return (
    <div style={{ background: theme.colors.bgDeep, color: theme.colors.textPrimary }}>
      <h1 style={{ color: theme.colors.primary }}>Themed Heading</h1>
    </div>
  );
};
```

## Dual Export Pattern in SlideStyles

`SlideStyles.ts` provides both static and theme-aware exports:

```typescript
// Static (used by demo slides — backward compatible)
import { slideContainer, contentBox, typography } from './framework/slides/SlideStyles';

// Theme-aware (used by framework components)
import { createSlideContainer, createContentBox, createTypography } from './framework/slides/SlideStyles';
const styles = createSlideContainer(theme);
```

Demo slides can continue using static exports without modification. Framework components use the `create*` functions with `useTheme()` for full theme support.

Note: The `SlideContainer` layout component is now theme-aware — it calls `useTheme()` internally and uses `createSlideContainer(theme)` instead of the static `slideContainer` export. Demo slides using `<SlideContainer>` automatically benefit from custom themes without code changes.

## Default Theme Values

| Token | Default Value | Usage |
|-------|--------------|-------|
| `primary` | `#00B7C3` | Buttons, accents, active indicators |
| `secondary` | `#0078D4` | Gradient endpoints, secondary accents |
| `bgDeep` | `#0f172a` | Page/slide backgrounds |
| `bgSurface` | `#1e293b` | Cards, modals, panels |
| `bgBorder` | `#334155` | Borders, dividers |
| `textPrimary` | `#f1f5f9` | Headings, primary text |
| `textSecondary` | `#94a3b8` | Descriptions, labels |
| `textMuted` | `#64748b` | Hints, footnotes |
| `success` | `#10b981` | Success states |
| `warning` | `#fbbf24` | Warning states |
| `error` | `#ef4444` | Error states |
| `fontFamily` | `Inter, system-ui, sans-serif` | All text |
