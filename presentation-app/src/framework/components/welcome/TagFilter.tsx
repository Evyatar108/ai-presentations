import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  allTags,
  selectedTags,
  onToggleTag,
  onClearTags,
}) => {
  const theme = useTheme();

  if (allTags.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.4rem',
      alignItems: 'center',
    }}>
      {allTags.map(tag => {
        const active = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => onToggleTag(tag)}
            aria-pressed={active}
            title={active ? `Remove "${tag}" filter` : `Show only "${tag}" demos`}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: active ? theme.colors.bgDeep : theme.colors.primary,
              background: active ? theme.colors.primary : 'rgba(0, 183, 195, 0.1)',
              padding: '0.3rem 0.7rem',
              borderRadius: 12,
              border: `1px solid ${active ? theme.colors.primary : 'rgba(0, 183, 195, 0.3)'}`,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.2s ease',
            }}
          >
            {tag}
          </button>
        );
      })}
      {selectedTags.length > 0 && (
        <button
          onClick={onClearTags}
          title="Remove all tag filters"
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: theme.colors.textMuted,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.3rem 0.5rem',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
          }}
        >
          Clear all
        </button>
      )}
    </div>
  );
};
