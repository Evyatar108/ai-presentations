import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../theme/ThemeContext';
import { useReducedMotion } from '../accessibility/ReducedMotion';
import type { ThemeColors } from '../theme/types';
import type { ThemedToken } from 'shiki';

/** Any bundled shiki theme name, or 'framework' for theme-aware colors. */
export type ShikiColorTheme = 'framework' | (string & {});

export interface ShikiCodeBlockProps {
  code: string;
  language?: string;
  highlightLines?: number[];
  title?: string;
  fontSize?: number;
  /** Color theme for syntax tokens. Default: 'one-dark-pro' */
  colorTheme?: ShikiColorTheme;
}

// Module-level singleton for the shiki highlighter
type ShikiHighlighter = Awaited<ReturnType<typeof import('shiki')['createHighlighter']>>;
let highlighterPromise: Promise<ShikiHighlighter> | null = null;

const PRELOADED_LANGS = ['python', 'json', 'typescript', 'markdown', 'bash'];
const FRAMEWORK_THEME_NAME = 'framework-custom';
let frameworkThemeLoaded = false;

/**
 * Build a VS Code TextMate theme from framework ThemeColors.
 * Maps token scopes to the same colors that CodeBlock's regex tokenizer uses.
 */
function buildFrameworkTheme(colors: ThemeColors) {
  return {
    name: FRAMEWORK_THEME_NAME,
    type: 'dark' as const,
    colors: {
      'editor.background': colors.bgSurface,
      'editor.foreground': colors.textPrimary,
    },
    tokenColors: [
      { scope: ['keyword', 'storage.type', 'storage.modifier', 'constant.language'],
        settings: { foreground: colors.secondary } },
      { scope: ['keyword.operator'],
        settings: { foreground: colors.accent } },
      { scope: ['string', 'string.quoted'],
        settings: { foreground: colors.success } },
      { scope: ['comment', 'punctuation.definition.comment'],
        settings: { foreground: colors.textMuted } },
      { scope: ['constant.numeric', 'constant.other'],
        settings: { foreground: colors.warning } },
      { scope: ['entity.name.function', 'support.function', 'meta.function-call.generic'],
        settings: { foreground: colors.primary } },
      { scope: ['support.type.property-name.json', 'meta.object-literal.key'],
        settings: { foreground: colors.primary } },
      { scope: ['variable', 'variable.other'],
        settings: { foreground: colors.textPrimary } },
      { scope: ['variable.parameter.function-call'],
        settings: { foreground: colors.error } },
      { scope: ['variable.parameter'],
        settings: { foreground: colors.warning } },
      { scope: ['entity.name.type', 'entity.name.class', 'support.type'],
        settings: { foreground: colors.accent } },
      { scope: ['punctuation'],
        settings: { foreground: colors.textSecondary } },
    ],
  };
}

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
 * Ensure the framework custom theme is registered with the highlighter.
 */
async function ensureFrameworkTheme(hl: ShikiHighlighter, colors: ThemeColors) {
  if (!frameworkThemeLoaded || import.meta.hot) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await hl.loadTheme(buildFrameworkTheme(colors) as any);
    frameworkThemeLoaded = true;
  }
}

/**
 * Custom hook that returns shiki-tokenized lines for the given code/language.
 * Returns null while loading (async).
 */
function useShikiTokens(
  code: string,
  language: string,
  colorTheme: ShikiColorTheme,
  themeColors: ThemeColors
): { tokens: ThemedToken[][] | null; bg: string | null } {
  const [tokens, setTokens] = useState<ThemedToken[][] | null>(null);
  const [bg, setBg] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    getHighlighter()
      .then(async (hl) => {
        // Register framework theme if needed
        if (colorTheme === 'framework') {
          await ensureFrameworkTheme(hl, themeColors);
        }

        // Load theme on-demand if not preloaded
        const shikiThemeName = colorTheme === 'framework' ? FRAMEWORK_THEME_NAME : colorTheme;
        if (colorTheme !== 'framework' && !hl.getLoadedThemes().includes(shikiThemeName)) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await hl.loadTheme(colorTheme as any);
          } catch {
            // Unknown theme — fall back to one-dark-pro
          }
        }

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

        const effectiveTheme = hl.getLoadedThemes().includes(shikiThemeName)
          ? shikiThemeName
          : 'one-dark-pro';

        const result = hl.codeToTokens(code, {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          lang: effectiveLang as any,
          theme: effectiveTheme,
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
  }, [code, language, colorTheme, themeColors]);

  return { tokens, bg };
}

export const ShikiCodeBlock: React.FC<ShikiCodeBlockProps> = ({
  code,
  language = 'python',
  highlightLines = [],
  title,
  fontSize = 13,
  colorTheme = 'one-dark-pro',
}) => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const { tokens, bg } = useShikiTokens(code, language, colorTheme, theme.colors);

  const lines = useMemo(() => code.split('\n'), [code]);
  const highlightSet = useMemo(() => new Set(highlightLines), [highlightLines]);

  // framework theme uses bgSurface; all other themes use their native background
  const codeBg = colorTheme === 'framework'
    ? theme.colors.bgSurface
    : (bg ?? theme.colors.bgSurface);

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.2 : 0.4 }}
      style={{
        background: codeBg,
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
          background: codeBg,
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
