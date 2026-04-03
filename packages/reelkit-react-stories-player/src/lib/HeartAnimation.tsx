import type { FC } from 'react';
import './HeartAnimation.css';

/** Props for the {@link HeartAnimation} component. */
export interface HeartAnimationProps {
  /** Callback fired when the animation ends, used to remove from DOM. */
  onComplete: () => void;
}

/**
 * CSS-only floating heart animation triggered on double-tap.
 *
 * Renders a heart at the given `(x, y)` position, scales up with a pop
 * effect, then fades out over 800ms. Calls {@link HeartAnimationProps.onComplete}
 * when the animation finishes so the parent can remove it from the DOM.
 */
export const HeartAnimation: FC<HeartAnimationProps> = ({ onComplete }) => (
  <div className="rk-stories-heart" onAnimationEnd={onComplete}>
    <svg width="48" height="48" viewBox="0 0 24 24" fill="#ff2d55">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  </div>
);
