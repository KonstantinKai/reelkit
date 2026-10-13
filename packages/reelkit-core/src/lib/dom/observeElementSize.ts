import { noop } from '../utils/noop';
import type { Disposer } from '../utils/disposable';

/**
 * Watches an element's size and reports it as `[width, height]` whenever it
 * changes.
 *
 * The size is the padding box (`clientWidth` / `clientHeight`), not the
 * observer entry's `contentRect`. Slides are absolutely positioned, so they
 * fill the padding box; measuring the content box would leave a padded
 * container's slides wider than the size the slider works with.
 *
 * A size with a zero dimension is skipped, because an element that is hidden
 * or not laid out yet would otherwise collapse the slider. A size equal to the
 * last one reported is skipped too, so the callback runs only on real changes.
 *
 * @param element - The element to measure.
 * @param callback - Receives `[width, height]` in CSS pixels.
 * @returns A disposer that stops observing. Without `ResizeObserver` (server
 * rendering) nothing is observed and the disposer does nothing.
 */
export const observeElementSize = (
  element: Element,
  callback: (size: [number, number]) => void,
): Disposer => {
  if (typeof ResizeObserver === 'undefined') return noop;

  let lastWidth = 0;
  let lastHeight = 0;

  const observer = new ResizeObserver(() => {
    const width = element.clientWidth;
    const height = element.clientHeight;
    if (width <= 0 || height <= 0) return;
    if (width === lastWidth && height === lastHeight) return;
    lastWidth = width;
    lastHeight = height;
    callback([width, height]);
  });
  observer.observe(element);

  return () => observer.disconnect();
};
