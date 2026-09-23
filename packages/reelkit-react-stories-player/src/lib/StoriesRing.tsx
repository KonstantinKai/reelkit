import type { CSSProperties, FC } from 'react';
import { getRingPresentation, type AuthorInfo } from '@reelkit/stories-core';
import './StoriesRing.css';

/** Props for the {@link StoriesRing} component. */
export interface StoriesRingProps {
  /** Only the avatar and the name are drawn; nothing keys on the id here. */
  author: AuthorInfo;

  /** A group of 0 draws no ring at all, just the avatar. */
  totalStories: number;

  /** Short of `totalStories` keeps the gradient; reaching it mutes the ring. */
  viewedCount: number;

  /**
   * Outer ring diameter in pixels.
   * @default 68
   */
  size?: number;

  /**
   * Gradient colors for a group with stories left to watch.
   * @default Instagram gradient
   */
  gradientColors?: string[];

  /**
   * Color for a fully watched group.
   * @default 'rgba(255,255,255,0.25)'
   */
  viewedColor?: string;

  /** The ring is a button and nothing more — opening the player is yours. */
  onClick?: () => void;
}

/**
 * Circular avatar with a gradient ring. The ring has two states: a group with
 * anything left to watch gets the rotating Instagram gradient, a fully watched
 * one gets a flat muted ring. Progress within a group is not shown here — the
 * progress bar inside the player carries that.
 */
export const StoriesRing: FC<StoriesRingProps> = ({
  author,
  totalStories,
  viewedCount,
  size = 68,
  onClick,
  gradientColors,
  viewedColor,
}) => {
  const { avatarSize, className, style } = getRingPresentation({
    totalStories,
    viewedCount,
    size,
    gradientColors,
    viewedColor,
  });

  return (
    <div
      className={className}
      style={style as CSSProperties}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${author.name}'s stories`}
    >
      <img
        className="rk-stories-ring-avatar"
        src={author.avatar}
        alt={author.name}
        width={avatarSize}
        height={avatarSize}
      />
    </div>
  );
};
