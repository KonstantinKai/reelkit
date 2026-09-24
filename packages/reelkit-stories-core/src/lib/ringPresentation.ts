/** Options for {@link getRingPresentation}. */
export interface RingPresentationOptions {
  /** Total number of stories in the group. */
  totalStories: number;

  /** Number of stories already viewed. */
  viewedCount: number;

  /** Outer ring diameter in pixels. */
  size: number;

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
}

/** Class name, inline style and avatar size of a story ring. */
export interface RingPresentation {
  /** Diameter of the avatar inside the ring, in pixels. */
  avatarSize: number;

  /** `rk-stories-ring`, plus `rk-stories-ring--active` while stories are left to watch. */
  className: string;

  /**
   * Inline style for the ring element. Sizes carry their `px` unit so the
   * object works as a style in any framework.
   */
  style: Record<string, string>;
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

/** Default diameter, in pixels, of a single story ring. */
export const kStoriesRingSize = 68;

/** Default diameter, in pixels, of each ring in the ring list. */
export const kStoriesRingListRingSize = 64;

/**
 * Diameter, in pixels, of the ring on a desktop carousel card. Fixed rather
 * than configurable: the card lays its name and time out around it.
 */
export const kStoriesCardRingSize = 52;

/**
 * Class name, inline style and avatar size of a story ring. A group with
 * anything left to watch gets a rotating conic gradient, a fully watched one a
 * flat muted ring, an empty group no ring at all. Shared by the ring component
 * and the desktop carousel cards of every binding: a card is itself a button,
 * so it draws the ring from these rather than nesting a second interactive
 * element inside it.
 */
export const getRingPresentation = ({
  totalStories,
  viewedCount,
  size,
  gradientColors = _kInstagramGradient,
  viewedColor = 'rgba(255,255,255,0.25)',
}: RingPresentationOptions): RingPresentation => {
  const isEmpty = totalStories <= 0;
  const hasUnviewed = !isEmpty && viewedCount < totalStories;
  const palette = gradientColors.length ? gradientColors : _kInstagramGradient;

  return {
    avatarSize: size - (_kRingWidth + _kGap) * 2,
    className: `rk-stories-ring${hasUnviewed ? ' rk-stories-ring--active' : ''}`,
    style: {
      width: `${size}px`,
      height: `${size}px`,
      '--rk-stories-ring-gradient': hasUnviewed
        ? `conic-gradient(from 180deg, ${[...palette, palette[0]].join(', ')})`
        : isEmpty
          ? 'none'
          : viewedColor,
    },
  };
};
