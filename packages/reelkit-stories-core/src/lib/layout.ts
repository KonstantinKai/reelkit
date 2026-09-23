import { clamp, extractRange } from '@reelkit/core';

const _kMobileBreakpoint = 768;
const _kAspectRatio = 9 / 16;
const _kDesktopMargin = 16;
// One arrow and its gap, matching the default `--rk-stories-nav-size` and
// `--rk-stories-swipe-gap`. The size has to be known here, before layout, so
// the CSS values cannot be read; arrows themed larger than the default can
// crowd a very narrow desktop window.
const _kNavReserve = 44 + 16;

/** Height of a side card as a share of the active story's height. */
const _kCardScale = 0.4;
/** Space between two side cards on the same side. */
const _kCardGap = 64;
/**
 * Space between an arrow and the first card beside it, the same as between the
 * arrow and the active story.
 */
const _kCardArrowGap = 16;
/** Side cards shown on each side of the active story. */
const _kCardsPerSide = 2;

/**
 * Longest duration in a computed `transition-duration`, in milliseconds. The
 * value lists one time per transitioned property, each in seconds or
 * milliseconds. Anything that is not a time counts as no duration at all.
 */
export const parseDurationMs = (value: string): number =>
  Math.max(
    0,
    ...value.split(',').map((part) => {
      const match = /^(\d*\.?\d+)(ms|s)$/.exec(part.trim());
      if (!match) return 0;
      return Math.round(Number(match[1]) * (match[2] === 's' ? 1000 : 1));
    }),
  );

/** Whether a viewport of this width uses the phone layout. */
export const isMobileWidth = (viewportWidth: number) =>
  viewportWidth <= _kMobileBreakpoint;

/**
 * Size of the story canvas. A phone fills the screen. On a desktop the story
 * fills the window height, less a margin above and below, at 9:16, and only
 * narrows when the canvas and both arrows would not fit across the window.
 * Widths up to and including 768 count as a phone, matching the stylesheet,
 * which hides the arrows and squares the corners at that width. Without a
 * window (server rendering) the size is `[0, 0]`.
 */
export const getStoriesSize = (): [number, number] => {
  if (typeof window === 'undefined') return [0, 0];
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  if (isMobileWidth(viewportWidth)) {
    return [viewportWidth, viewportHeight];
  }
  const maxWidth = viewportWidth - 2 * (_kNavReserve + _kDesktopMargin);
  const height = Math.min(
    viewportHeight - 2 * _kDesktopMargin,
    maxWidth / _kAspectRatio,
  );
  return [height * _kAspectRatio, height];
};

/** Where one slot of the desktop carousel sits, relative to the window center. */
export interface CarouselSlot {
  /** Horizontal distance of the slot's center from the window center. */
  x: number;

  /** Rendered width of the slot. */
  width: number;

  /** Rendered height of the slot. */
  height: number;
}

/** Size of a side card for an active story of the given size. */
export const getCardSize = (activeSize: [number, number]): [number, number] => {
  const height = activeSize[1] * _kCardScale;
  return [height * _kAspectRatio, height];
};

/**
 * Slot for a group `offset` places away from the active one. Offset 0 is the
 * active story itself; the first card on each side sits a gap past the arrow
 * beside the active story, and every further card one card width and a gap
 * beyond that.
 */
export const getCarouselSlot = (
  offset: number,
  activeSize: [number, number],
): CarouselSlot => {
  if (offset === 0) {
    return { x: 0, width: activeSize[0], height: activeSize[1] };
  }
  const [cardWidth, cardHeight] = getCardSize(activeSize);
  const distance =
    activeSize[0] / 2 +
    _kNavReserve +
    _kCardArrowGap +
    cardWidth / 2 +
    (Math.abs(offset) - 1) * (cardWidth + _kCardGap);
  return {
    x: Math.sign(offset) * distance,
    width: cardWidth,
    height: cardHeight,
  };
};

/** Offsets of the side cards to render around the active group. */
export const getCardOffsets = (
  activeGroupIndex: number,
  groupCount: number,
): number[] =>
  extractRange(groupCount, activeGroupIndex, activeGroupIndex, _kCardsPerSide)
    .filter((groupIndex) => groupIndex !== activeGroupIndex)
    .map((groupIndex) => groupIndex - activeGroupIndex);

/** Whether a card this many places from the center is shown, not faded out. */
export const isCardShown = (offset: number) =>
  Math.abs(offset) <= _kCardsPerSide;

/**
 * Slot a card moves to. A card past the ones shown waits one place further
 * out, faded, so it slides in from beside the last shown card rather than from
 * wherever its group happens to sit.
 */
export const getSlotOffset = (offset: number) =>
  clamp(offset, -_kCardsPerSide - 1, _kCardsPerSide + 1);

/**
 * Groups a slide between two groups draws: the cards shown around the group
 * being left and around the one being opened, in group order. The groups a far
 * jump passes over are left out. They would cross the screen faded out, and
 * drawing them mounts a card, with its images, for every group on the way.
 */
export const getSlideGroupIndexes = (
  from: number,
  to: number,
  groupCount: number,
): number[] =>
  [
    ...new Set([
      ...extractRange(groupCount, from, from, _kCardsPerSide),
      ...extractRange(groupCount, to, to, _kCardsPerSide),
    ]),
  ].sort((a, b) => a - b);
