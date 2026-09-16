/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useEffect, useState, type CSSProperties } from 'react';
import { Check, Copy } from 'lucide-react';
import { createSignal, Observe } from '@reelkit/react';
import { whenIdle } from '../../utils/whenIdle';

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
  const [{ html, copied }] = useState(() => ({
    html: createSignal(''),
    copied: createSignal(false),
  }));

  useEffect(() => {
    let cancelled = false;
    // After the page settles, so the highlighter never competes with the
    // first paint.
    const cancelIdle = whenIdle(() => {
      void (async () => {
        // Loaded on demand: the highlighter is the largest script on the
        // site, and a page that only shows a sample or two should not wait
        // for it.
        const { codeToHtml } = await import('shiki');
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
        if (!cancelled) html.value = highlighted;
      })();
    }, 2000);
    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code.trim());
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  };

  const copyIcon = (
    <Observe signals={[copied]}>
      {() =>
        copied.value ? (
          <Check size={16} className="text-green-500" />
        ) : (
          <Copy size={16} className="text-slate-500" />
        )
      }
    </Observe>
  );

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
            {copyIcon}
          </button>
        </div>
      )}
      <div className="relative">
        <Observe signals={[html]}>
          {() =>
            html.value ? (
              <div
                className="p-4 overflow-x-auto text-sm font-mono"
                dangerouslySetInnerHTML={{ __html: html.value }}
              />
            ) : (
              <div className="p-4 overflow-x-auto text-sm font-mono">
                <PlainCode code={code.trim()} />
              </div>
            )
          }
        </Observe>
        {bare && (
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {copyIcon}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * The code before the highlighter arrives, in the markup Shiki produces — the
 * same `pre.shiki`, theme colours and one `span.line` per line — so the
 * prerendered page already shows the sample and highlighting it later does
 * not move anything.
 */
function PlainCode({ code }: { code: string }) {
  const lines = code.split('\n');
  return (
    <pre
      className="shiki shiki-themes github-light catppuccin-macchiato"
      style={
        {
          backgroundColor: '#fff',
          '--shiki-dark-bg': '#24273a',
          color: '#24292e',
          '--shiki-dark': '#cad3f5',
        } as CSSProperties
      }
      tabIndex={0}
    >
      <code>
        {lines.map((line, index) => (
          <Fragment key={index}>
            <span className="line">{line}</span>
            {index < lines.length - 1 ? '\n' : null}
          </Fragment>
        ))}
      </code>
    </pre>
  );
}
