import React, { useState } from 'react';

export interface HoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  hoverStyle?: React.CSSProperties;
}

/**
 * Thin button wrapper that manages hover state internally.
 * Merges `hoverStyle` into `style` on mouse-enter and reverts on mouse-leave.
 */
export const HoverButton: React.FC<HoverButtonProps> = ({
  style,
  hoverStyle,
  children,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      {...rest}
      style={{ ...style, ...(isHovered && !rest.disabled ? hoverStyle : undefined) }}
      onMouseEnter={(e) => {
        if (!rest.disabled) setIsHovered(true);
        rest.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        rest.onMouseLeave?.(e);
      }}
    >
      {children}
    </button>
  );
};
