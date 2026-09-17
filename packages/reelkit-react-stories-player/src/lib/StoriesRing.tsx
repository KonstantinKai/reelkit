import type { CSSProperties, FC } from 'react';
import type { AuthorInfo } from '@reelkit/stories-core';
import './StoriesRing.css';

/** Props for the {@link StoriesRing} component. */
export interface StoriesRingProps {
  /** Author information (avatar, name). */
  author: AuthorInfo;

  /** Total number of stories in the group. */
  totalStories: number;

  /** Number of stories already viewed. */
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

  /** Callback fired when the ring is clicked. */
  onClick?: () => void;
}

const _kInstagramGradient = [
  '#f09433',
  '#e6683c',
  '#dc2743',
  '#cc2366',
  '#bc1888',
];

const _kRingWidth = 2;
const _kGap = 2;

/**
 * Class name, inline style and avatar size of a ring, shared by
 * {@link StoriesRing} and the desktop carousel cards. A card is itself the
 * button, so it draws the ring from these rather than nesting a second
 * interactive element inside it.
 */
export const getRingPresentation = ({
  totalStories,
  viewedCount,
  size,
  gradientColors = _kInstagramGradient,
  viewedColor = 'rgba(255,255,255,0.25)',
}: {
  totalStories: number;
  viewedCount: number;
  size: number;
  gradientColors?: string[];
  viewedColor?: string;
}) => {
  const isEmpty = totalStories <= 0;
  const hasUnviewed = !isEmpty && viewedCount < totalStories;
  const palette = gradientColors.length ? gradientColors : _kInstagramGradient;

  return {
    avatarSize: size - (_kRingWidth + _kGap) * 2,
    className: `rk-stories-ring${hasUnviewed ? ' rk-stories-ring--active' : ''}`,
    style: {
      width: size,
      height: size,
      '--rk-stories-ring-gradient': hasUnviewed
        ? `conic-gradient(from 180deg, ${[...palette, palette[0]].join(', ')})`
        : isEmpty
          ? 'none'
          : viewedColor,
    } as CSSProperties,
  };
};

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
  gradientColors = _kInstagramGradient,
  viewedColor = 'rgba(255,255,255,0.25)',
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
      style={style}
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
