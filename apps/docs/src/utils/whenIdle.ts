/**
 * Run work once the browser is idle, for anything a page does not need to
 * show its content. Safari has no `requestIdleCallback`, so there the work
 * runs on the next task instead.
 *
 * @returns Cancels the work if it has not started yet.
 */
export function whenIdle(run: () => void, timeout = 3000): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(run, { timeout });
    return () => window.cancelIdleCallback(handle);
  }
  const timer = window.setTimeout(run, 1);
  return () => window.clearTimeout(timer);
}
