import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../theme/ThemeContext';
import { useReducedMotion } from '../accessibility/ReducedMotion';

export interface CodeBlockProps {
  code: string;
  language?: 'python' | 'json' | 'markdown';
  highlightLines?: number[];
  title?: string;
  fontSize?: number;
}

const KEYWORD_PATTERN = /\b(def|class|for|in|range|if|elif|else|return|import|from|as|with|try|except|finally|and|or|not|is|None|True|False|lambda|yield|raise|pass|break|continue|while|assert|del|global|nonlocal|async|await)\b/g;
const STRING_PATTERN = /(["'])(?:(?=(\\?))\2[\s\S])*?\1|`[^`]*`/g;
const COMMENT_PATTERN = /#.*/g;
const NUMBER_PATTERN = /\b\d+\.?\d*\b/g;
const FUNCTION_PATTERN = /\b([a-zA-Z_]\w*)\s*\(/g;
const JSON_KEY_PATTERN = /"([^"]+)"\s*:/g;

function tokenize(code: string, language: string, colors: Record<string, string>): React.ReactNode[] {
  const tokens: { start: number; end: number; color: string; text: string }[] = [];

  // Collect all token ranges
  const addMatches = (pattern: RegExp, color: string, group = 0) => {
    let match;
    const re = new RegExp(pattern.source, pattern.flags);
    while ((match = re.exec(code)) !== null) {
      const text = group > 0 && match[group] ? match[group] : match[0];
      const start = group > 0 && match[group] ? match.index : match.index;
      tokens.push({ start, end: start + (group > 0 ? match[0].length : text.length), color, text: match[0] });
    }
  };

  // Order matters: strings first (to avoid matching keywords inside strings)
  addMatches(STRING_PATTERN, colors.string);
  addMatches(COMMENT_PATTERN, colors.comment);

  if (language === 'json') {
    addMatches(JSON_KEY_PATTERN, colors.key);
  } else {
    addMatches(KEYWORD_PATTERN, colors.keyword);
    addMatches(FUNCTION_PATTERN, colors.function);
  }
  addMatches(NUMBER_PATTERN, colors.number);

  // Sort by start position, remove overlaps
  tokens.sort((a, b) => a.start - b.start);
  const filtered: typeof tokens = [];
  let lastEnd = 0;
  for (const t of tokens) {
    if (t.start >= lastEnd) {
      filtered.push(t);
      lastEnd = t.end;
    }
  }

  // Build React nodes
  const nodes: React.ReactNode[] = [];
  let pos = 0;
  for (const t of filtered) {
    if (t.start > pos) {
      nodes.push(code.slice(pos, t.start));
    }
    nodes.push(
      <span key={t.start} style={{ color: t.color }}>{t.text}</span>
    );
    pos = t.end;
  }
  if (pos < code.length) {
    nodes.push(code.slice(pos));
  }

  return nodes;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'python',
  highlightLines = [],
  title,
  fontSize = 13
}) => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();

  const colors = {
    keyword: theme.colors.secondary,
    string: theme.colors.success,
    comment: theme.colors.textMuted,
    number: theme.colors.warning,
    function: theme.colors.primary,
    key: theme.colors.primary
  };

  const lines = code.split('\n');
  const highlightSet = new Set(highlightLines);

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.2 : 0.4 }}
      style={{
        background: theme.colors.bgSurface,
        border: `1px solid ${theme.colors.bgBorder}`,
        borderRadius: 12,
        overflow: 'hidden',
        textAlign: 'left',
        width: '100%'
      }}
    >
      {title && (
        <div style={{
          padding: '0.5rem 1rem',
          borderBottom: `1px solid ${theme.colors.bgBorder}`,
          fontSize: 12,
          color: theme.colors.textMuted,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          letterSpacing: 0.5
        }}>
          {title}
        </div>
      )}
      <pre style={{
        margin: 0,
        padding: '1rem',
        fontSize,
        lineHeight: 1.6,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        color: theme.colors.textPrimary,
        overflowX: 'auto'
      }}>
        {lines.map((line, i) => {
          const lineNum = i + 1;
          const isHighlighted = highlightSet.has(lineNum);
          const tokenized = tokenize(line, language, colors);

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                background: isHighlighted ? 'rgba(251, 191, 36, 0.12)' : 'transparent',
                borderLeft: isHighlighted ? '3px solid #fbbf24' : '3px solid transparent',
                margin: '0 -1rem',
                padding: '0 1rem'
              }}
            >
              <span style={{
                display: 'inline-block',
                width: '2.5em',
                textAlign: 'right',
                marginRight: '1em',
                color: theme.colors.textMuted,
                userSelect: 'none',
                flexShrink: 0,
                fontSize: fontSize - 1
              }}>
                {lineNum}
              </span>
              <span style={{ flex: 1 }}>{tokenized}</span>
            </div>
          );
        })}
      </pre>
    </motion.div>
  );
};
