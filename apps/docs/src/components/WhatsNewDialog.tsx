import { useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X, Sparkles } from 'lucide-react';
import { captureFocusForReturn, createFocusTrap } from '@reelkit/react';
import { parseChangelog } from '../utils/parseChangelog';
import { getDeltaSinceLastSeen } from '../utils/getDeltaSinceLastSeen';
import { useLastSeenRelease } from '../hooks/useLastSeenRelease';

// eslint-disable-next-line @nx/enforce-module-boundaries
import changelogRaw from '../../../../CHANGELOG.md?raw';

const _kMaxEntries = 3;
const _kChangelogPath = '/docs/changelog';

const isExcludedRoute = (pathname: string): boolean =>
  pathname === '/' || pathname.endsWith('/changelog');

export default function WhatsNewDialog() {
  const location = useLocation();
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const entries = useMemo(() => parseChangelog(changelogRaw), []);
  const newestId = entries[0]?.id ?? null;

  const { lastSeen, markSeen } = useLastSeenRelease(newestId);

  const excluded = isExcludedRoute(location.pathname);
  const delta = useMemo(
    () => (excluded ? [] : getDeltaSinceLastSeen(entries, lastSeen)),
    [entries, lastSeen, excluded],
  );
  const open = !excluded && lastSeen !== null && delta.length > 0;

  const visible = delta.slice(0, _kMaxEntries);
  const hiddenCount = Math.max(0, delta.length - _kMaxEntries);

  const handleClose = () => {
    markSeen();
  };

  const handleViewFull = () => {
    markSeen();
    navigate(_kChangelogPath);
  };

  useEffect(() => {
    if (!open) return;
    const container = dialogRef.current;
    if (!container) return;

    const restoreFocus = captureFocusForReturn();
    const releaseTrap = createFocusTrap(container);

    const firstFocusable = container.querySelector<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])',
    );
    (firstFocusable ?? container).focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        handleClose();
      }
    };
    document.addEventListener('keydown', onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      releaseTrap();
      restoreFocus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close what's new dialog"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-title"
        tabIndex={-1}
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 max-h-[85vh] flex flex-col animate-slide-up"
      >
        <div className="flex items-start gap-3 px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h2
              id="whats-new-title"
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              What&rsquo;s new
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {delta.length === 1
                ? '1 new release since your last visit'
                : `${delta.length} new releases since your last visit`}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {visible.map((entry) => (
            <article key={entry.id}>
              <header className="mb-2">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  {entry.title}
                </h3>
              </header>
              <div
                className="text-sm text-slate-600 dark:text-slate-400"
                dangerouslySetInnerHTML={{ __html: entry.bodyHtml }}
              />
            </article>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800">
          {hiddenCount > 0 ? (
            <Link
              to={_kChangelogPath}
              onClick={markSeen}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              +{hiddenCount} more {hiddenCount === 1 ? 'release' : 'releases'}
            </Link>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handleViewFull}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-lg transition-all"
            >
              View full changelog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
