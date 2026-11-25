import { useEffect, useRef, useState } from 'react';
import {
  createDisposableList,
  createSignal,
  Observe,
  reaction,
} from '@reelkit/react';
import { chunkCount, head, loadChunk } from 'virtual:reelkit-changelog';
import { renderChangelog } from '../../utils/renderChangelog';

// Rendered while the page module loads, so the newest releases are in the
// prerendered HTML instead of appearing only after the page runs.
const headHtml = renderChangelog(head);

type LoadStatus = 'idle' | 'loading' | 'failed';

export default function Changelog() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [{ loaded, status, nearEnd, showAll }] = useState(() => ({
    /** Rendered HTML of every chunk after the head, in order. */
    loaded: createSignal<string[]>([]),
    status: createSignal<LoadStatus>('idle'),
    /** The reader has scrolled to within a screen of the last release. */
    nearEnd: createSignal(false),
    /** The reader asked for every release at once. */
    showAll: createSignal(false),
  }));

  const isComplete = () => loaded.value.length >= chunkCount - 1;

  useEffect(() => {
    const disposables = createDisposableList();

    // One chunk at a time, always the next one, so chunks append in order
    // whatever asked for them. A failure parks the loader until the reader
    // retries; the releases already shown stay.
    const loadNext = () => {
      if (status.value !== 'idle' || isComplete()) return;
      if (!nearEnd.value && !showAll.value) return;
      status.value = 'loading';
      loadChunk(loaded.value.length + 1).then(
        (markdown) => {
          loaded.value = [...loaded.value, renderChangelog(markdown)];
          status.value = 'idle';
        },
        () => {
          status.value = 'failed';
        },
      );
    };
    disposables.push(reaction(() => [nearEnd, showAll, status], loadNext));

    const sentinel = sentinelRef.current;
    if (sentinel && typeof IntersectionObserver !== 'undefined') {
      // A screen of margin below the viewport starts the fetch before the
      // reader reaches the end of what is shown.
      const observer = new IntersectionObserver(
        ([entry]) => {
          nearEnd.value = entry.isIntersecting;
        },
        { rootMargin: '0px 0px 100% 0px' },
      );
      observer.observe(sentinel);
      disposables.push(
        () => observer.disconnect(),
        reaction(
          () => [loaded],
          () => {
            if (isComplete()) observer.disconnect();
          },
        ),
      );
    }

    return disposables.dispose;
  }, []);

  if (!head) {
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

      <div dangerouslySetInnerHTML={{ __html: headHtml }} />

      {/* Each chunk keeps its own element, so appending one never touches
          the releases already on the page. */}
      <Observe signals={[loaded]}>
        {() => (
          <>
            {loaded.value.map((html, index) => (
              <div key={index} dangerouslySetInnerHTML={{ __html: html }} />
            ))}
          </>
        )}
      </Observe>

      <Observe signals={[loaded, status]}>
        {() =>
          isComplete() ? null : (
            <div className="mt-12 flex flex-col items-center gap-3">
              <div ref={sentinelRef} aria-hidden="true" />
              <p
                aria-live="polite"
                className="text-sm text-slate-500 dark:text-slate-400"
              >
                {status.value === 'loading'
                  ? 'Loading older releases…'
                  : status.value === 'failed'
                    ? 'Older releases failed to load.'
                    : ''}
              </p>
              <button
                type="button"
                className="btn-secondary"
                disabled={status.value === 'loading'}
                onClick={() => {
                  // A retry resumes whatever was loading; the button sits
                  // under the sentinel, so the reader is near the end.
                  if (status.value === 'failed') status.value = 'idle';
                  else showAll.value = true;
                }}
              >
                {status.value === 'failed' ? 'Try again' : 'Show all releases'}
              </button>
            </div>
          )
        }
      </Observe>
    </div>
  );
}
