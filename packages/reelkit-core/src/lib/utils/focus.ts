import { createDisposableList, type Disposer } from './disposable';
import { observeDomEvent } from './observeDomEvent';
import { noop } from './noop';

/**
 * Selector matching elements that can receive keyboard focus and are not
 * explicitly disabled or hidden. Intentionally excludes `tabindex="-1"` —
 * those are programmatic-focus-only and should stay out of the Tab cycle.
 */
const _kFocusableSelector = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const isVisible = (el: HTMLElement): boolean => {
  if (el.hidden) return false;
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden';
};

/**
 * Returns every keyboard-focusable descendant of `container` in DOM
 * order, skipping disabled or hidden elements. Used by the focus trap
 * and as a standalone helper for first/last-focusable queries.
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const nodes = container.querySelectorAll<HTMLElement>(_kFocusableSelector);
  const result: HTMLElement[] = [];
  for (const el of Array.from(nodes)) {
    if (isVisible(el)) result.push(el);
  }
  return result;
};

/**
 * Captures the currently focused element and returns a disposer that
 * focuses it again. SSR-safe — returns a no-op when there's no document.
 *
 * @example
 * ```ts
 * // On overlay open:
 * const restore = captureFocusForReturn();
 *
 * // On overlay close:
 * restore();
 * ```
 */
export const captureFocusForReturn = (): Disposer => {
  if (typeof document === 'undefined') return noop;
  const previous = document.activeElement as HTMLElement | null;
  if (!previous || typeof previous.focus !== 'function') return noop;

  return () => {
    // If the previously-focused element is no longer in the DOM (the
    // trigger was unmounted while the overlay was open), skip — nothing
    // sensible to restore to.
    if (!previous.isConnected) return;
    try {
      previous.focus();
    } catch {
      // Some elements (e.g. detached custom elements) can throw.
      // Restoration is best-effort.
    }
  };
};

/**
 * Creates a keyboard focus trap scoped to the given container element.
 *
 * While active:
 * - Tab at the last focusable element wraps to the first.
 * - Shift+Tab at the first focusable element wraps to the last.
 * - Focus that escapes the container (mouse click outside, programmatic
 *   focus, etc.) is pulled back to the container's first focusable or
 *   the container itself.
 * - With no focusable descendants, Tab is prevented and focus stays on
 *   the container.
 *
 * The trap does not move focus into the container on activation — the
 * caller decides whether to focus the container itself or its first
 * focusable element.
 *
 * SSR-safe: returns a no-op disposer in non-browser environments.
 *
 * @param container Element whose descendants should keep focus.
 * @returns Disposer that releases the trap.
 */
export const createFocusTrap = (container: HTMLElement): Disposer => {
  if (typeof document === 'undefined') return noop;

  const disposables = createDisposableList();

  disposables.push(
    observeDomEvent(
      document,
      'keydown',
      (event) => {
        if (event.key !== 'Tab') return;

        const focusables = getFocusableElements(container);
        if (focusables.length === 0) {
          event.preventDefault();
          container.focus();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (event.shiftKey) {
          if (active === first || active === container) {
            event.preventDefault();
            last.focus();
          }
          return;
        }

        if (active === last) {
          event.preventDefault();
          first.focus();
        }
      },
      { capture: true },
    ),
    observeDomEvent(
      document,
      'focusin',
      (event) => {
        const target = event.target as Node | null;
        if (!target || container.contains(target)) return;

        // Focus escaped the container. Pull it back to the first
        // focusable, or the container itself when there are none.
        const focusables = getFocusableElements(container);
        if (focusables.length > 0) {
          focusables[0].focus();
        } else {
          container.focus();
        }
      },
      { capture: true },
    ),
  );

  return disposables.dispose;
};
