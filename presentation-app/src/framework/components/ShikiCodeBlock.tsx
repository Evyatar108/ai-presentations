import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../theme/ThemeContext';
import { useReducedMotion } from '../accessibility/ReducedMotion';
import type { ThemedToken } from 'shiki';

export interface ShikiCodeBlockProps {
  code: string;
  language?: string;
  highlightLines?: number[];
  title?: string;
  fontSize?: number;
}

// Module-level singleton for the shiki highlighter
type ShikiHighlighter = Awaited<ReturnType<typeof import('shiki')['createHighlighter']>>;
let highlighterPromise: Promise<ShikiHighlighter> | null = null;

const PRELOADED_LANGS = ['python', 'json', 'typescript', 'markdown', 'bash'];

function getHighlighter(): Promise<ShikiHighlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki').then(({ createHighlighter }) =>
      createHighlighter({
        themes: ['one-dark-pro'],
        langs: PRELOADED_LANGS,
      })
    );
  }
  return highlighterPromise;
}

/**
 * Custom hook that returns shiki-tokenized lines for the given code/language.
 * Returns null while loading (async).
 */
function useShikiTokens(
  code: string,
  language: string
): { tokens: ThemedToken[][] | null; bg: string | null } {
  const [tokens, setTokens] = useState<ThemedToken[][] | null>(null);
  const [bg, setBg] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    getHighlighter()
      .then(async (hl) => {
        // Load language on-demand if not preloaded
        const loadedLangs = hl.getLoadedLanguages();
        if (!loadedLangs.includes(language)) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await hl.loadLanguage(language as any);
          } catch {
            // Unknown language — fall through to plaintext
          }
        }

        if (!mountedRef.current) return;

        const effectiveLang = hl.getLoadedLanguages().includes(language)
          ? language
          : 'plaintext';

        const result = hl.codeToTokens(code, {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          lang: effectiveLang as any,
          theme: 'one-dark-pro',
        });

        if (mountedRef.current) {
          setTokens(result.tokens);
          setBg(result.bg ?? null);
        }
      })
      .catch((err) => {
        console.error('[ShikiCodeBlock] Failed to tokenize:', err);
      });

    return () => {
      mountedRef.current = false;
    };
  }, [code, language]);

  return { tokens, bg };
}

export const ShikiCodeBlock: React.FC<ShikiCodeBlockProps> = ({
  code,
  language = 'python',
  highlightLines = [],
  title,
  fontSize = 13,
}) => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const { tokens } = useShikiTokens(code, language);

  const lines = useMemo(() => code.split('\n'), [code]);
  const highlightSet = useMemo(() => new Set(highlightLines), [highlightLines]);

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
        width: '100%',
      }}
    >
      {title && (
        <div
          style={{
            padding: '0.5rem 1rem',
            borderBottom: `1px solid ${theme.colors.bgBorder}`,
            fontSize: 12,
            color: theme.colors.textMuted,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            letterSpacing: 0.5,
          }}
        >
          {title}
        </div>
      )}
      <pre
        style={{
          margin: 0,
          padding: '1rem',
          fontSize,
          lineHeight: 1.6,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          color: theme.colors.textPrimary,
          overflowX: 'auto',
          background: theme.colors.bgSurface,
        }}
      >
        {lines.map((line, i) => {
          const lineNum = i + 1;
          const isHighlighted = highlightSet.has(lineNum);
          const tokenLine = tokens?.[i];

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                background: isHighlighted
                  ? 'rgba(251, 191, 36, 0.12)'
                  : 'transparent',
                borderLeft: isHighlighted
                  ? '3px solid #fbbf24'
                  : '3px solid transparent',
                margin: '0 -1rem',
                padding: '0 1rem',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '2.5em',
                  textAlign: 'right',
                  marginRight: '1em',
                  color: theme.colors.textMuted,
                  userSelect: 'none',
                  flexShrink: 0,
                  fontSize: fontSize - 1,
                }}
              >
                {lineNum}
              </span>
              <span style={{ flex: 1 }}>
                {tokenLine
                  ? tokenLine.map((token, j) => (
                      <span key={j} style={{ color: token.color }}>
                        {token.content}
                      </span>
                    ))
                  : line}
              </span>
            </div>
          );
        })}
      </pre>
    </motion.div>
  );
};
