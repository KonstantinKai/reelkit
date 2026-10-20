/** Options for {@link getRingPresentation}. */
export interface RingPresentationOptions {
  /** Total number of stories in the group. */
  totalStories: number;

  /** Number of stories already viewed. */
  viewedCount: number;

  /** Outer ring diameter in pixels. */
  size: number;

  /**
   * Gradient colors for this ring when its group has stories left to watch.
   * Leave it out to follow `--rk-stories-ring-active-gradient`, which themes
   * every ring from CSS.
   * @default the `--rk-stories-ring-active-gradient` token (Instagram gradient)
   */
  gradientColors?: string[];

  /**
   * Color for this ring once its group is fully watched. Leave it out to
   * follow `--rk-stories-ring-viewed-color`, which themes every ring from CSS.
   * @default the `--rk-stories-ring-viewed-color` token (`rgba(255,255,255,0.25)`)
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
 * Class name, inline style and avatar size of a story ring. The style's
 * `--rk-stories-ring-gradient` points at `--rk-stories-ring-active-gradient`
 * or `--rk-stories-ring-viewed-color`, so a page themes the rings from CSS;
 * `gradientColors` and `viewedColor` replace them for one ring. A group with
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
  gradientColors,
  viewedColor,
}: RingPresentationOptions): RingPresentation => {
  const isEmpty = totalStories <= 0;
  const hasUnviewed = !isEmpty && viewedCount < totalStories;

  // The inline value only points at the theme tokens, whose defaults live on
  // :root in each player's stylesheet: a colour written here would beat any
  // stylesheet, so a page could never retheme the rings. A colour passed for
  // this ring is the exception, and wins for it alone.
  const activeGradient = gradientColors?.length
    ? `conic-gradient(from 180deg, ${[...gradientColors, gradientColors[0]].join(', ')})`
    : 'var(--rk-stories-ring-active-gradient)';

  return {
    avatarSize: size - (_kRingWidth + _kGap) * 2,
    className: `rk-stories-ring${hasUnviewed ? ' rk-stories-ring--active' : ''}`,
    style: {
      width: `${size}px`,
      height: `${size}px`,
      '--rk-stories-ring-gradient': hasUnviewed
        ? activeGradient
        : isEmpty
          ? 'none'
          : (viewedColor ?? 'var(--rk-stories-ring-viewed-color)'),
    },
  };
};
