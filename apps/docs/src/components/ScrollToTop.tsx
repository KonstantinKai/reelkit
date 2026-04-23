import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const _kStabilityWindowMs = 2500;

/**
 * Route-aware scroll restorer.
 *
 * - No hash → reset scroll to top after navigation.
 * - With hash → re-anchor the `#id` target for a bounded window. Docs
 *   pages mount progressively (lazy chunk, code samples, images, fonts)
 *   so a single `scrollIntoView` lands on a stale coordinate. We drive
 *   an instant re-scroll every animation frame for `_kStabilityWindowMs`
 *   so the final position tracks the element's final laid-out location.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const id = hash.slice(1);
    const start = performance.now();
    let rafId: number | null = null;

    const step = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
      if (performance.now() - start < _kStabilityWindowMs) {
        rafId = requestAnimationFrame(step);
      }
    };
    rafId = requestAnimationFrame(step);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [pathname, hash]);

  return null;
}
