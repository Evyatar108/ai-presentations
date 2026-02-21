/**
 * Reusable Layout Components for Slides
 * Extracted from AnimatedSlides.tsx to reduce duplication
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { contentBox, highlightOverlayBox, typography, createSlideContainer } from './SlideStyles';
import { useTheme } from '../theme/ThemeContext';
import { useHideInterface } from '../contexts/HideInterfaceContext';

export interface SlideContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
  textAlign?: 'center' | 'left' | 'right';
  /** Fraction of viewport height considered the safe content area (default 0.75). */
  viewportFraction?: number;
}

/**
 * Standard slide container with dark background.
 * Theme-aware via useTheme() — uses theme's bgDeep and fontFamily.
 * In dev mode, detects content overflow and shows a red outline + badge.
 * Sets data-overflow attribute on the content div for Playwright testing.
 * Used in: ~20 slides
 */
export const SlideContainer: React.FC<SlideContainerProps> = ({
  children,
  maxWidth = 900,
  textAlign = 'center',
  viewportFraction = 0.75
}) => {
  const theme = useTheme();
  const hideInterface = useHideInterface();
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflowPx, setOverflowPx] = useState(0);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const el = contentRef.current;
    if (!el) return;

    const measure = () => {
      const threshold = window.innerHeight * viewportFraction;
      const overflow = Math.max(0, Math.round(el.scrollHeight - threshold));
      setOverflowPx(overflow);
      if (overflow > 0) {
        const h1 = el.querySelector('h1, h2');
        const hint = h1?.textContent?.slice(0, 60) || '(no heading)';
        console.warn(
          `[SlideContainer] Overflow: ${overflow}px (scrollHeight: ${el.scrollHeight}px, threshold: ${Math.round(threshold)}px) — "${hint}"`
        );
      }
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [viewportFraction]);

  const isOverflowing = import.meta.env.DEV && overflowPx > 0 && !hideInterface;

  return (
    <div style={createSlideContainer(theme)}>
      <div
        ref={contentRef}
        data-overflow={String(overflowPx)}
        style={{
          maxWidth,
          width: '100%',
          textAlign,
          position: 'relative',
          ...(isOverflowing ? { outline: '2px solid red' } : {})
        }}
      >
        {children}
        {isOverflowing && (
          <div
            style={{
              position: 'absolute',
              top: -12,
              right: -12,
              background: 'red',
              color: 'white',
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 8,
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          >
            +{overflowPx}px
          </div>
        )}
      </div>
    </div>
  );
};

export interface ContentCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * Content card with dark background
 * Used in: ~15 slides
 */
export const ContentCard: React.FC<ContentCardProps> = ({
  children,
  style
}) => (
  <div style={{ ...contentBox, ...style }}>
    {children}
  </div>
);

export interface HighlightBoxProps {
  children: React.ReactNode;
  reduced: boolean;
  style?: React.CSSProperties;
}

/**
 * Gradient highlight box with glow effect
 * Used in: Ch1_S3, Ch4_S1, Ch7_S3, others
 */
export const GradientHighlightBox: React.FC<HighlightBoxProps> = ({
  children,
  reduced,
  style
}) => (
  <div style={{ ...highlightOverlayBox(reduced), ...style }}>
    {children}
  </div>
);

export interface SlideTitleProps {
  children: React.ReactNode;
  reduced: boolean;
  subtitle?: string;
  style?: React.CSSProperties;
}

/**
 * Animated slide title with optional subtitle
 * Used in: ~18 slides
 */
export const SlideTitle: React.FC<SlideTitleProps> = ({
  children,
  reduced,
  subtitle,
  style
}) => (
  <>
    <motion.h1
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.2 : 0.5 }}
      style={{ ...typography.h1, ...style }}
    >
      {children}
    </motion.h1>
    {subtitle && (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0.2 : 0.5, delay: reduced ? 0 : 0.2 }}
        style={{ ...typography.caption, marginBottom: '3rem' }}
      >
        {subtitle}
      </motion.p>
    )}
  </>
);

export interface MetricDisplayProps {
  value: string | number;
  label: string;
  reduced: boolean;
  emphasis?: boolean;
  delay?: number;
}

/**
 * Large metric display (for impact numbers like "80%")
 * Used in: Ch8_S1
 */
export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  value,
  label,
  reduced,
  emphasis = false,
  delay = 0
}) => {
  const theme = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduced ? 0.3 : 0.8, type: 'spring', delay }}
      style={{
        background: emphasis
          ? 'linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))'
          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
        borderRadius: 16,
        padding: '3rem 2rem',
        border: emphasis ? `2px solid ${theme.colors.primary}` : `2px solid ${theme.colors.success}`,
        boxShadow: !reduced && emphasis ? '0 0 40px rgba(0, 183, 195, 0.3)' : !reduced ? '0 0 40px rgba(16, 185, 129, 0.3)' : 'none'
      }}
    >
      <div style={{
        fontSize: 72,
        fontWeight: 'bold',
        color: emphasis ? theme.colors.primary : theme.colors.success,
        marginBottom: '1rem'
      }}>
        {value}
      </div>
      <div style={{ color: theme.colors.textPrimary, fontSize: 18, marginBottom: '0.5rem' }}>
        {label}
      </div>
    </motion.div>
  );
};

export interface TestimonialCardProps {
  quote: string;
  author: string;
  reduced: boolean;
  delay?: number;
}

/**
 * Testimonial card component
 * Used in: Ch9_S1
 */
export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  reduced,
  delay = 0
}) => {
  const theme = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reduced ? 0.3 : 0.6, type: 'spring', delay }}
      style={{
        background: theme.colors.bgSurface,
        borderRadius: 16,
        padding: '2rem',
        border: `1px solid ${theme.colors.bgBorder}`,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ fontSize: 32, marginBottom: '1rem' }}>💬</div>
      <p style={{
        color: theme.colors.textPrimary,
        fontSize: 16,
        lineHeight: 1.6,
        fontStyle: 'italic',
        flex: 1,
        marginBottom: '1rem'
      }}>
        "{quote}"
      </p>
      <div style={{ color: theme.colors.primary, fontSize: 14, fontWeight: 600 }}>
        — {author}
      </div>
    </motion.div>
  );
};

export interface BenefitCardProps {
  icon: string;
  title: string;
  description: string;
  detail: string;
  isHighlighted: boolean;
  isVisible: boolean;
  reduced: boolean;
}

/**
 * Benefit card with icon and description
 * Used in: Ch1_S3
 */
export const BenefitCard: React.FC<BenefitCardProps> = ({
  icon,
  title,
  description,
  detail,
  isHighlighted,
  isVisible,
  reduced
}) => {
  const theme = useTheme();
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: isHighlighted ? 1.05 : 1
          }}
          transition={{ duration: reduced ? 0.3 : 0.6, type: 'spring' }}
          style={{
            background: isHighlighted
              ? 'linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))'
              : theme.colors.bgSurface,
            borderRadius: 16,
            padding: '2rem',
            textAlign: 'center',
            border: isHighlighted ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.bgBorder}`,
            boxShadow: isHighlighted && !reduced ? '0 0 30px rgba(0, 183, 195, 0.3)' : 'none'
          }}
        >
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>{icon}</div>
          <h3 style={{ color: theme.colors.textPrimary, fontSize: 20, marginBottom: '0.5rem' }}>
            {title}
          </h3>
          <div style={{ color: theme.colors.primary, fontSize: 18, fontWeight: 600, marginBottom: '0.75rem' }}>
            {description}
          </div>
          <p style={{ color: theme.colors.textSecondary, fontSize: 14, margin: 0 }}>
            {detail}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export interface ImprovementCardProps {
  icon: string;
  title: string;
  description: string;
  isVisible: boolean;
  reduced: boolean;
}

/**
 * Future improvement card
 * Used in: Ch9_S2
 */
export const ImprovementCard: React.FC<ImprovementCardProps> = ({
  icon,
  title,
  description,
  isVisible,
  reduced
}) => {
  const theme = useTheme();
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduced ? 0.3 : 0.6, type: 'spring' }}
          style={{
            background: theme.colors.bgSurface,
            borderRadius: 16,
            padding: '2rem',
            border: `1px solid ${theme.colors.bgBorder}`,
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>{icon}</div>
          <h3 style={{ color: theme.colors.textPrimary, fontSize: 20, marginBottom: '0.75rem' }}>
            {title}
          </h3>
          <p style={{ color: theme.colors.textSecondary, fontSize: 14, margin: 0 }}>
            {description}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};