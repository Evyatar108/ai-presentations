/**
 * Reusable SVG Icons for Slide Components
 * Extracted from AnimatedSlides.tsx to reduce duplication
 */

import React from 'react';

interface IconProps {
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Downward arrow icon
 * Used in: Ch5_S1, Ch7_S1
 */
export const ArrowDown: React.FC<IconProps> = ({
  width = 60,
  height = 80,
  stroke = '#00B7C3',
  strokeWidth = 4,
  style
}) => (
  <svg width={width} height={height} viewBox="0 0 60 80" style={style}>
    <path
      d="M30 0 L30 60 M10 45 L30 65 L50 45"
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Right arrow icon
 * Used in: Ch5_S2, Ch7_S2, Ch7_S5
 */
export const ArrowRight: React.FC<IconProps> = ({
  width = 40,
  height = 40,
  stroke = '#475569',
  strokeWidth = 2,
  style
}) => (
  <svg width={width} height={height} viewBox="0 0 40 40" style={style}>
    <path
      d="M5 20 L30 20 M20 10 L30 20 L20 30"
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Large right arrow (for roadmap/flow)
 * Used in: Ch7_S2, Ch7_S5
 */
export const ArrowRightLarge: React.FC<IconProps> = ({
  width = 60,
  height = 40,
  stroke = '#00B7C3',
  strokeWidth = 3,
  style
}) => (
  <svg width={width} height={height} viewBox="0 0 60 40" style={style}>
    <path
      d="M5 20 L50 20 M35 10 L50 20 L35 30"
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Extra large right arrow (for major transitions)
 * Used in: Ch7_S5
 */
export const ArrowRightXL: React.FC<IconProps> = ({
  width = 80,
  height = 40,
  stroke = '#00B7C3',
  strokeWidth = 3,
  style
}) => (
  <svg width={width} height={height} viewBox="0 0 80 40" style={style}>
    <path
      d="M5 20 L70 20 M55 10 L70 20 L55 30"
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Small downward arrow (for token reduction visualization)
 * Used in: Ch7_S1
 */
export const ArrowDownSmall: React.FC<IconProps> = ({
  width = 40,
  height = 40,
  stroke = '#00B7C3',
  strokeWidth = 3,
  style
}) => (
  <svg width={width} height={height} viewBox="0 0 40 40" style={style}>
    <path
      d="M20 5 L20 30 M10 20 L20 30 L30 20"
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Checkmark icon
 * Used in: Ch7_S2, Ch7_S5
 */
export const Checkmark: React.FC<{
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ size = 30, color = '#fff', style }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: '#10b981',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.6,
      color,
      ...style
    }}
  >
    ✓
  </div>
);

/**
 * Converging lines animation (for Ch6_S1)
 */
export const ConvergingLines: React.FC<{
  reduced: boolean;
}> = ({ reduced }) => {
  if (reduced) return null;

  return (
    <>
      {[0, 90, 180, 270].map((angle, idx) => (
        <div
          key={angle}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 120,
            height: 2,
            background: 'linear-gradient(90deg, #00B7C3, transparent)',
            transformOrigin: 'left center',
            transform: `translate(-50%, -50%) rotate(${angle}deg)`,
            animation: `converge 1.2s ease-out ${idx * 0.1}s infinite`,
            opacity: 0
          }}
        />
      ))}
      <style>{`
        @keyframes converge {
          0% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--angle)) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--angle)) scale(0); }
        }
      `}</style>
    </>
  );
};

/**
 * Emoji-style icons as components for consistency
 */
export const EmojiIcons = {
  Clock: () => <span style={{ fontSize: 48 }}>⏱️</span>,
  Target: () => <span style={{ fontSize: 48 }}>🎯</span>,
  Speech: () => <span style={{ fontSize: 48 }}>💬</span>,
  Document: () => <span style={{ fontSize: 48 }}>📝</span>,
  Video: () => <span style={{ fontSize: 48 }}>🎬</span>,
  Magnify: () => <span style={{ fontSize: 48 }}>🔍</span>,
  Chart: () => <span style={{ fontSize: 48 }}>📊</span>,
  Checkmark: () => <span style={{ fontSize: 48 }}>✅</span>,
  Globe: () => <span style={{ fontSize: 48 }}>🌍</span>,
  Recording: () => <span style={{ fontSize: 32 }}>📹</span>,
  Storage: () => <span style={{ fontSize: 32 }}>🗄️</span>,
  Gear: () => <span style={{ fontSize: 32 }}>⚙️</span>,
  Robot: () => <span style={{ fontSize: 32 }}>🤖</span>,
  Microphone: () => <span style={{ fontSize: 32 }}>🎙️</span>,
  Success: () => <span style={{ fontSize: 32 }}>✅</span>
};