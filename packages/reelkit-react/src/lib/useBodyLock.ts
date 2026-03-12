import { useEffect } from 'react';

/**
 * Locks the document body scroll when `locked` is `true`. Adds
 * `overflow: hidden` to `document.body` and compensates for the
 * disappearing scrollbar by adding equivalent `padding-right`,
 * preventing layout shift. Original styles are restored on cleanup
 * or when `locked` becomes `false`.
 *
 * @param locked - Whether body scroll should be locked.
 */
export const useBodyLock = (locked: boolean) => {
  useEffect(() => {
    if (!locked) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [locked]);
};

export default useBodyLock;
