import React, { useState } from 'react';

export interface HoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  hoverStyle?: React.CSSProperties;
}

/**
 * Thin button wrapper that manages hover and focus state internally.
 * Merges `hoverStyle` into `style` on mouse-enter or keyboard focus,
 * and reverts on mouse-leave or blur.
 */
export const HoverButton: React.FC<HoverButtonProps> = ({
  style,
  hoverStyle,
  children,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isActive = (isHovered || isFocused) && !rest.disabled;

  return (
    <button
      {...rest}
      style={{ ...style, ...(isActive ? hoverStyle : undefined) }}
      onMouseEnter={(e) => {
        if (!rest.disabled) setIsHovered(true);
        rest.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        rest.onMouseLeave?.(e);
      }}
      onFocus={(e) => {
        if (!rest.disabled) setIsFocused(true);
        rest.onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        rest.onBlur?.(e);
      }}
    >
      {children}
    </button>
  );
};
