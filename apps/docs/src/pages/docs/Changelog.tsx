import { useState, useEffect } from 'react';

// Vite raw import — CHANGELOG.md from workspace root
// eslint-disable-next-line @nx/enforce-module-boundaries
import changelogRaw from '../../../../../CHANGELOG.md?raw';

/**
 * Minimal markdown-to-HTML for changelog format.
 * Handles: ## h2, ### h3, - list items (wrapped in ul), empty lines.
 */
const linkMentions = (text: string): string =>
  text
    .replace(
      /\[(@[a-zA-Z\d](?:[a-zA-Z\d-]*[a-zA-Z\d])?)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline">$1</a>',
    )
    .replace(
      /(?<!\[)@([a-zA-Z\d](?:[a-zA-Z\d-]*[a-zA-Z\d])?)(?!\])/g,
      '<a href="https://github.com/$1" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline">@$1</a>',
    );

function renderChangelog(md: string): string {
  const lines = md.split('\n');
  const output: string[] = [];
  let inList = false;

  for (const line of lines) {
    const isList = line.startsWith('- ');

    if (isList && !inList) {
      output.push(
        '<ul class="list-disc list-inside space-y-1 mb-4 text-sm text-slate-600 dark:text-slate-400">',
      );
      inList = true;
    } else if (!isList && inList) {
      output.push('</ul>');
      inList = false;
    }

    if (line.startsWith('### ')) {
      output.push(
        `<h3 class="text-base font-semibold mt-5 mb-2 text-slate-800 dark:text-slate-200">${line.slice(4)}</h3>`,
      );
    } else if (line.startsWith('## ')) {
      output.push(
        `<h2 class="text-xl font-bold mt-10 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">${line.slice(3)}</h2>`,
      );
    } else if (line.startsWith('# ')) {
      output.push(
        `<h1 class="text-2xl font-bold mt-12 mb-4 text-slate-900 dark:text-white">${line.slice(2)}</h1>`,
      );
    } else if (isList) {
      output.push(`<li>${linkMentions(line.slice(2))}</li>`);
    } else if (line.trim() !== '') {
      output.push(
        `<p class="text-sm text-slate-600 dark:text-slate-400 mb-2">${linkMentions(line)}</p>`,
      );
    }
  }

  if (inList) {
    output.push('</ul>');
  }

  return output.join('\n');
}

export default function Changelog() {
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (changelogRaw) {
      setHtml(renderChangelog(changelogRaw));
    }
  }, []);

  if (!html) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-4">Changelog</h1>
        <p className="text-slate-500">No changelog entries yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Changelog</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Release history for all{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/*
          </code>{' '}
          packages.
        </p>
      </div>

      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
