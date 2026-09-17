import { describe, it, expect } from 'vitest';
import {
  getCardOffsets,
  getCardSize,
  getCarouselSlot,
  getSlideGroupIndexes,
  getSlotOffset,
  isCardShown,
  isMobileWidth,
} from './layout';

// Card proportions follow the Instagram desktop viewer: a side card is 0.4 of
// the active story's height at the same 9:16 shape.
describe('desktop carousel layout', () => {
  const at1440 = [488.25, 868] as [number, number];
  const at1920 = [589.5, 1048] as [number, number];

  it('sizes a side card at 0.4 of the active height, 9:16', () => {
    const [width, height] = getCardSize(at1440);
    expect(height).toBeCloseTo(347.2, 5);
    expect(width).toBeCloseTo(195.3, 5);
  });

  it('keeps the active slot centered at full size', () => {
    expect(getCarouselSlot(0, at1440)).toEqual({
      x: 0,
      width: 488.25,
      height: 868,
    });
  });

  // 1440 wide: half the active story (244.125), the arrow reserve (60), the
  // gap after the arrow (16) and half a card (97.65) put the first card's
  // center about 418 from the middle.
  it('places the first card on each side a gap past the arrow', () => {
    expect(getCarouselSlot(1, at1440).x).toBeCloseTo(417.775, 3);
    expect(getCarouselSlot(-1, at1440).x).toBeCloseTo(-417.775, 3);
  });

  // The arrow ends 60 past the active story's edge; the card must start later.
  it('leaves a gap between the arrow and the first card', () => {
    const [cardWidth] = getCardSize(at1440);
    const cardLeft = getCarouselSlot(1, at1440).x - cardWidth / 2;
    expect(cardLeft - (at1440[0] / 2 + 60)).toBeCloseTo(16, 5);
  });

  it('places the second card one card width and a gap further out', () => {
    const [cardWidth] = getCardSize(at1920);
    const first = getCarouselSlot(1, at1920).x;
    expect(getCarouselSlot(2, at1920).x).toBeCloseTo(first + cardWidth + 64, 3);
    expect(getCarouselSlot(-2, at1920).x).toBeCloseTo(
      -(first + cardWidth + 64),
      3,
    );
  });

  it.each([
    [0, 5, [1, 2]],
    [2, 5, [-2, -1, 1, 2]],
    [4, 5, [-2, -1]],
    [1, 2, [-1]],
    [0, 1, []],
  ])(
    'renders cards around group %i of %i at offsets %j',
    (active, count, expected) => {
      expect(getCardOffsets(active, count)).toEqual(expected);
    },
  );

  it.each([
    [-5, -3, false],
    [-3, -3, false],
    [-2, -2, true],
    [0, 0, true],
    [2, 2, true],
    [4, 3, false],
  ])(
    'parks a card %i places out in slot %i, shown: %s',
    (offset, slot, shown) => {
      expect(getSlotOffset(offset)).toBe(slot);
      expect(isCardShown(offset)).toBe(shown);
    },
  );

  it.each([
    [2, 3, 10, [0, 1, 2, 3, 4, 5]],
    [3, 2, 10, [0, 1, 2, 3, 4, 5]],
    [0, 1, 2, [0, 1]],
    [7, 9, 10, [5, 6, 7, 8, 9]],
  ])(
    'draws the groups of a slide from %i to %i among %i groups',
    (from, to, count, expected) => {
      expect(getSlideGroupIndexes(from, to, count)).toEqual(expected);
    },
  );

  it('treats 768 and below as a phone', () => {
    expect(isMobileWidth(768)).toBe(true);
    expect(isMobileWidth(769)).toBe(false);
  });
});
