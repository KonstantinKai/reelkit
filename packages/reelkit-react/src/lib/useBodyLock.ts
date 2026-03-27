import { useEffect } from 'react';

/**
 * Locks the document body scroll when `locked` is `true`.
 *
 * Applies `position: fixed` with a negative `top` offset to freeze
 * the viewport, `overflow: hidden` and `overscroll-behavior: none`
 * to prevent any scroll, and `padding-right` to compensate for the
 * disappearing scrollbar. Restores all original styles and scroll
 * position on cleanup or when `locked` becomes `false`.
 *
 * @param locked - Whether body scroll should be locked.
 */
export const useBodyLock = (locked: boolean) => {
  useEffect(() => {
    if (!locked) return;

    const { style } = document.body;
    const originalOverflow = style.overflow;
    const originalPaddingRight = style.paddingRight;
    const originalOverscroll = style.overscrollBehavior;
    const originalPosition = style.position;
    const originalTop = style.top;
    const originalWidth = style.width;
    const scrollY = window.scrollY;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    style.overflow = 'hidden';
    style.overscrollBehavior = 'none';
    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.width = '100%';
    if (scrollbarWidth > 0) {
      style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      style.overflow = originalOverflow;
      style.overscrollBehavior = originalOverscroll;
      style.paddingRight = originalPaddingRight;
      style.position = originalPosition;
      style.top = originalTop;
      style.width = originalWidth;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
};

export default useBodyLock;
