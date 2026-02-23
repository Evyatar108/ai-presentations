import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../theme/ThemeContext';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const theme = useTheme();
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync external value changes (e.g. from URL restore)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocalValue(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), 200);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div style={{ position: 'relative', flex: '1 1 250px', maxWidth: 400 }}>
      <input
        type="search"
        value={localValue}
        onChange={handleChange}
        placeholder="Search demos..."
        aria-label="Search demos"
        style={{
          width: '100%',
          padding: '0.6rem 2.2rem 0.6rem 2.4rem',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          borderRadius: 10,
          color: theme.colors.textPrimary,
          fontSize: 14,
          fontFamily: theme.fontFamily,
          outline: 'none',
          transition: 'border-color 0.2s ease',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.colors.primary;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.25)';
        }}
      />
      {/* Search icon */}
      <span style={{
        position: 'absolute',
        left: 10,
        top: '50%',
        transform: 'translateY(-50%)',
        color: theme.colors.textMuted,
        fontSize: 14,
        pointerEvents: 'none'
      }}>
        {'\uD83D\uDD0D'}
      </span>
      {/* Clear button */}
      {localValue && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: theme.colors.textMuted,
            cursor: 'pointer',
            fontSize: 14,
            padding: '2px 4px',
            borderRadius: 4,
            lineHeight: 1,
          }}
        >
          {'\u2715'}
        </button>
      )}
    </div>
  );
};
