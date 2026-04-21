import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Route-aware scroll restorer. On navigation:
 *   - if the URL has a `#hash`, scrolls the matching element into view,
 *   - otherwise resets scroll to the top.
 *
 * Handles both cross-page navigations and in-page hash clicks.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      requestAnimationFrame(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
