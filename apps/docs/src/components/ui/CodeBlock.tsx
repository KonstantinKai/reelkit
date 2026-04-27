import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { codeToHtml } from 'shiki';

interface CodeBlockProps {
  code: string;
  language?: string;

  /** Strip outer border/radius/header for embedding inside another container */
  bare?: boolean;
}

export function CodeBlock({
  code,
  language = 'typescript',
  bare = false,
}: CodeBlockProps) {
  const [html, setHtml] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const highlight = async () => {
      // Render once with both palettes — Shiki emits CSS custom
      // properties keyed off the configured `defaultColor`. The light
      // palette is the default; the dark palette is applied via the
      // `dark` mode override block in `styles.css` so toggling the
      // `<html class="dark">` flag swaps colours without re-running
      // the highlighter and without an SSR-time theme branch.
      const highlighted = await codeToHtml(code.trim(), {
        lang: language,
        themes: {
          light: 'github-light',
          dark: 'catppuccin-macchiato',
        },
        defaultColor: 'light',
      });
      setHtml(highlighted);
    };
    highlight();
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={
        bare
          ? 'relative group overflow-hidden bg-white dark:bg-[#24273a]'
          : 'relative group overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-600 dark:bg-[#24273a]'
      }
    >
      {!bare && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs font-medium text-slate-500 ml-2 uppercase">
              {language}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {copied ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <Copy size={16} className="text-slate-500" />
            )}
          </button>
        </div>
      )}
      <div className="relative">
        <div
          className="p-4 overflow-x-auto text-sm font-mono"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {bare && (
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {copied ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <Copy size={16} className="text-slate-500" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
