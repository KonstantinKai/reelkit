import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { codeToHtml } from 'shiki';
import { useTheme } from '../../context/ThemeContext';

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
  const { theme } = useTheme();

  useEffect(() => {
    const highlight = async () => {
      const highlighted = await codeToHtml(code.trim(), {
        lang: language,
        theme: theme === 'dark' ? 'nord' : 'github-light',
      });
      setHtml(highlighted);
    };
    highlight();
  }, [code, language, theme]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative group overflow-hidden ${bare ? (theme === 'dark' ? 'bg-[#2e3440]' : 'bg-white') : `rounded-2xl border ${theme === 'dark' ? 'border-slate-600 bg-[#2e3440]' : 'border-slate-200 bg-white'}`}`}
    >
      {!bare && (
        <div
          className={`flex items-center justify-between px-4 py-3 border-b ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}
        >
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
