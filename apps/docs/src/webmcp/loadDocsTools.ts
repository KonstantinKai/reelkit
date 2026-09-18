import { whenIdle } from '../utils/whenIdle';
import { findModelContext } from './modelContext';

/**
 * Offers the docs to an AI agent in the reader's browser through WebMCP.
 * Browsers without it load nothing more; everywhere else the tools arrive in
 * their own chunk once the page is idle.
 *
 * @returns Unregisters the tools, or stops them from registering if they
 * have not yet.
 */
export function loadDocsTools(navigate: (to: string) => void): () => void {
  const context = findModelContext();
  if (!context) return () => undefined;

  const controller = new AbortController();
  const cancelIdle = whenIdle(() => {
    import('./registerDocsTools')
      .then(({ registerDocsTools }) =>
        controller.signal.aborted
          ? undefined
          : registerDocsTools(context, navigate, controller.signal),
      )
      // A chunk that fails to load leaves the page as it was without WebMCP.
      .catch(() => undefined);
  });

  return () => {
    cancelIdle();
    controller.abort();
  };
}
