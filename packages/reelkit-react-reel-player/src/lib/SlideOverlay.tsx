import React from 'react';
import { Heart } from 'lucide-react';
import './SlideOverlay.css';

/**
 * Props for the {@link SlideOverlay} component.
 *
 * All fields are optional — the overlay renders nothing when all are omitted.
 * When used with `ContentItem` data, the built-in overlay fills these
 * automatically. You can also render `SlideOverlay` manually inside
 * `renderSlideOverlay` with custom data.
 */
export interface SlideOverlayProps {
  /** Author info. When provided, renders an avatar image and display name. */
  author?: { name: string; avatar: string };
  /** Description text. Clamped to 2 lines via CSS. */
  description?: string;
  /** Like count. Formatted compactly (e.g. 1.2K, 3.5M). Shown with a heart icon. */
  likes?: number;
}

/**
 * Formats a like count into a compact human-readable string.
 *
 * - >= 1,000,000 → "1.2M"
 * - >= 1,000 → "4.5K"
 * - < 1,000 → raw number as string
 */
function formatLikes(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return String(count);
}

/**
 * Instagram/TikTok-style gradient overlay displayed at the bottom of each slide.
 *
 * Shows author avatar + name, a short description (2-line clamp), and a
 * like count with a heart icon. Renders nothing when all props are omitted.
 *
 * This is the default overlay used by `ReelPlayerOverlay` when the content
 * items have `author`, `description`, and `likes` fields (i.e. {@link ContentItem}).
 * It can be replaced entirely via `renderSlideOverlay`, or hidden by passing
 * `renderSlideOverlay={() => null}`.
 *
 * Can also be used standalone inside a `renderSlideOverlay` callback:
 *
 * @example
 * ```tsx
 * import { SlideOverlay } from '@reelkit/react-reel-player';
 *
 * <ReelPlayerOverlay
 *   renderSlideOverlay={(item) => (
 *     <SlideOverlay author={item.author} description={item.bio} />
 *   )}
 *   ...
 * />
 * ```
 */
const SlideOverlay: React.FC<SlideOverlayProps> = ({
  author,
  description,
  likes,
}) => {
  if (!author && !description && likes == null) return null;

  return (
    <div className="reel-slide-overlay">
      {author && (
        <div className="reel-slide-overlay-author">
          <img
            className="reel-slide-overlay-avatar"
            src={author.avatar}
            alt={author.name}
          />
          <span className="reel-slide-overlay-name">{author.name}</span>
        </div>
      )}
      {description && (
        <p className="reel-slide-overlay-description">{description}</p>
      )}
      {likes != null && (
        <div className="reel-slide-overlay-likes">
          <Heart size={16} />
          <span>{formatLikes(likes)}</span>
        </div>
      )}
    </div>
  );
};

export default SlideOverlay;
