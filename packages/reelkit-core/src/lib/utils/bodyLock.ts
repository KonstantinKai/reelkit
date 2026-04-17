import type { Disposer } from './disposable';
import { noop } from './noop';

/**
 * A reference-counted body scroll lock. Multiple callers can lock/unlock
 * independently — the body is only restored once the last caller releases.
 *
 * Applies `position: fixed` with negative `top` to freeze the viewport,
 * `overflow: hidden` and `overscroll-behavior: none` to block all scroll,
 * and `padding-right` to compensate for the disappearing scrollbar.
 */
export interface BodyLock {
  /** Whether at least one lock is active. */
  readonly locked: boolean;

  /**
   * Increment the lock count. On the first lock, captures original
   * styles and applies lock styles.
   * Returns a disposer that calls {@link unlock} once.
   */
  lock: () => Disposer;

  /**
   * Decrement the lock count. When the count reaches zero, restores
   * original styles and scroll position.
   */
  unlock: () => void;
}

/**
 * Creates a reference-counted body scroll lock.
 *
 * SSR-safe — all `document`/`window` access is guarded.
 */
export const createBodyLock = (): BodyLock => {
  let lockCount = 0;
  let originalOverflow = '';
  let originalPaddingRight = '';
  let originalOverscroll = '';
  let originalPosition = '';
  let originalTop = '';
  let originalWidth = '';
  let savedScrollY = 0;

  const applyLock = () => {
    const { style } = document.body;
    savedScrollY = window.scrollY;
    originalOverflow = style.overflow;
    originalPaddingRight = style.paddingRight;
    originalOverscroll = style.overscrollBehavior;
    originalPosition = style.position;
    originalTop = style.top;
    originalWidth = style.width;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    style.overflow = 'hidden';
    style.overscrollBehavior = 'none';
    style.position = 'fixed';
    style.top = `-${savedScrollY}px`;
    style.width = '100%';
    if (scrollbarWidth > 0) {
      style.paddingRight = `${scrollbarWidth}px`;
    }
  };

  const restoreLock = () => {
    const { style } = document.body;
    style.overflow = originalOverflow;
    style.overscrollBehavior = originalOverscroll;
    style.paddingRight = originalPaddingRight;
    style.position = originalPosition;
    style.top = originalTop;
    style.width = originalWidth;
    window.scrollTo(0, savedScrollY);
  };

  const unlock = () => {
    if (typeof document === 'undefined') return;
    if (lockCount === 0) return;
    lockCount--;
    if (lockCount === 0) restoreLock();
  };

  const lock = () => {
    if (typeof document === 'undefined') return noop;
    if (lockCount === 0) applyLock();
    lockCount++;
    return unlock;
  };

  return {
    get locked() {
      return lockCount > 0;
    },
    lock,
    unlock,
  };
};

/**
 * Module-level shared body lock. Framework bindings (`@reelkit/react`,
 * `@reelkit/vue`, etc.) use this so multiple concurrent callers across
 * unrelated components share a single reference counter — nested modals
 * and overlays interleave correctly without stepping on each other's
 * saved body styles.
 *
 * If you need an isolated lock (e.g. for testing, or for an embedded
 * iframe scenario), call `createBodyLock()` directly.
 */
export const sharedBodyLock: BodyLock = createBodyLock();
