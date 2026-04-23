import { useState, useEffect } from 'react';
import { renderChangelog } from '../../utils/renderChangelog';

// Vite raw import — CHANGELOG.md from workspace root
// eslint-disable-next-line @nx/enforce-module-boundaries
import changelogRaw from '../../../../../CHANGELOG.md?raw';

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
