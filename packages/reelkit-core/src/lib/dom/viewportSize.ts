import { noop } from '../utils/noop';
import type { Disposer } from '../utils/disposable';
import { observeDomEvent } from './observeDomEvent';

const _kMobileBreakpoint = 768;
const _kDefaultAspectRatio = 9 / 16;

/**
 * Size of the browser window as `[innerWidth, innerHeight]`.
 *
 * @returns The window size, or `[0, 0]` without a window (server rendering).
 */
export const getViewportSize = (): [number, number] =>
  typeof window === 'undefined'
    ? [0, 0]
    : [window.innerWidth, window.innerHeight];

/**
 * Calls back with the window size on every window resize event.
 *
 * Every event is reported, including one that leaves the size as it was:
 * a resize can change what the device reports without changing the window
 * size, such as switching a browser's device emulation to a touch device of
 * the same dimensions. Callers that only care about the size compare it
 * themselves. The current size is not reported on subscription; read it with
 * {@link getViewportSize}.
 *
 * @param callback - Receives `[innerWidth, innerHeight]`.
 * @returns A disposer that removes the listener. Without a window (server
 * rendering) nothing is listened to and the disposer does nothing.
 */
export const observeViewportSize = (
  callback: (size: [number, number]) => void,
): Disposer => {
  if (typeof window === 'undefined') return noop;
  return observeDomEvent(window, 'resize', () => callback(getViewportSize()));
};

/**
 * Whether a viewport this wide gets the phone layout. Every overlay shares
 * this breakpoint, and their stylesheets switch at the same width: 768px and
 * narrower is a phone.
 *
 * @param viewportWidth - Window width in CSS pixels.
 */
export const isMobileWidth = (viewportWidth: number): boolean =>
  viewportWidth <= _kMobileBreakpoint;

/**
 * Size of an overlay that fills a phone screen and keeps an aspect ratio on a
 * desktop. On a desktop the overlay takes the full window height at the given
 * ratio, and narrows to the window width when that would not fit.
 *
 * @param viewport - Window size as `[width, height]`.
 * @param aspectRatio - Width divided by height. A missing, zero, negative or
 * non-finite ratio falls back to 9/16 rather than producing a zero or infinite
 * size.
 * @returns The overlay size as `[width, height]`.
 */
export const fitAspectRatio = (
  viewport: [number, number],
  aspectRatio?: number,
): [number, number] => {
  const [viewportWidth, viewportHeight] = viewport;
  if (isMobileWidth(viewportWidth)) return [viewportWidth, viewportHeight];

  const ratio =
    aspectRatio !== undefined && Number.isFinite(aspectRatio) && aspectRatio > 0
      ? aspectRatio
      : _kDefaultAspectRatio;

  const width = viewportHeight * ratio;
  if (width > viewportWidth) return [viewportWidth, viewportWidth / ratio];
  return [width, viewportHeight];
};

/**
 * Whether the device takes touch input. This is a capability check, not a
 * screen size check: a touch laptop counts, a narrow desktop window does not.
 *
 * @returns `false` without a window (server rendering).
 */
export const isTouchDevice = (): boolean =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);
