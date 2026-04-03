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
   * Gradient colors for unviewed story segments.
   * @default Instagram gradient
   */
  gradientColors?: string[];

  /**
   * Color for viewed story segments.
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

function buildGradient(
  total: number,
  viewed: number,
  colors: string[],
  viewedColor: string,
): string {
  if (total <= 0) return 'transparent';

  const smooth = `conic-gradient(from 180deg, ${colors.join(', ')}, ${colors[0]})`;

  if (viewed <= 0) return smooth;
  if (viewed >= total) return viewedColor;

  const seg = 360 / total;
  const gap = Math.min(4, seg * 0.1);
  const stops: string[] = [];

  for (let i = 0; i < total; i++) {
    const s = i * seg + gap / 2;
    const e = (i + 1) * seg - gap / 2;

    stops.push(`transparent ${i * seg}deg`);
    stops.push(`transparent ${s}deg`);

    if (i < viewed) {
      stops.push(`${viewedColor} ${s}deg`);
      stops.push(`${viewedColor} ${e}deg`);
    } else {
      const c1 = colors[Math.floor((s / 360) * colors.length) % colors.length];
      const c2 = colors[Math.floor((e / 360) * colors.length) % colors.length];
      stops.push(`${c1} ${s}deg`);
      stops.push(`${c2} ${e}deg`);
    }
  }

  stops.push(`transparent ${360 - gap / 2}deg`);
  return `conic-gradient(from 180deg, ${stops.join(', ')})`;
}

/**
 * Circular avatar with a gradient ring indicating viewed/unviewed story
 * segments. Unviewed stories show a smooth Instagram gradient ring that
 * rotates. Viewed stories show a muted gray ring.
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
  const avatarSize = size - (_kRingWidth + _kGap) * 2;
  const hasUnviewed = viewedCount < totalStories;
  const gradient = buildGradient(
    totalStories,
    viewedCount,
    gradientColors,
    viewedColor,
  );

  const ringStyle: CSSProperties = {
    width: size,
    height: size,
    background: gradient,
  };

  return (
    <div
      className={`rk-stories-ring${hasUnviewed ? ' rk-stories-ring--active' : ''}`}
      style={ringStyle}
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
