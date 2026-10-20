import { describe, it, expect } from 'vitest';
import {
  getRingPresentation,
  kStoriesCardRingSize,
  kStoriesRingListRingSize,
  kStoriesRingSize,
} from './ringPresentation';

// Every binding draws its rings at these sizes, so a change here reaches the
// React, Vue and Angular players at once.
describe('shared ring sizes', () => {
  it('keeps the sizes the players have always drawn', () => {
    expect(kStoriesRingSize).toBe(68);
    expect(kStoriesRingListRingSize).toBe(64);
    expect(kStoriesCardRingSize).toBe(52);
  });

  it('leaves room for an avatar inside every one', () => {
    for (const size of [
      kStoriesRingSize,
      kStoriesRingListRingSize,
      kStoriesCardRingSize,
    ]) {
      expect(
        getRingPresentation({ totalStories: 1, viewedCount: 0, size })
          .avatarSize,
      ).toBeGreaterThan(0);
    }
  });
});

describe('getRingPresentation', () => {
  it('sizes the ring with pixel units so any framework can use the style', () => {
    const { style } = getRingPresentation({
      totalStories: 3,
      viewedCount: 0,
      size: 68,
    });
    expect(style['width']).toBe('68px');
    expect(style['height']).toBe('68px');
  });

  it('leaves room for the ring width and the gap around the avatar', () => {
    expect(
      getRingPresentation({ totalStories: 3, viewedCount: 0, size: 68 })
        .avatarSize,
    ).toBe(60);
  });

  // The colours come from CSS custom properties with their defaults on :root,
  // so a page can theme every ring from its stylesheet. The inline value only
  // points at them, and a ring drawn by hand from this output keeps working.
  it('points a ring with stories left at the active gradient token', () => {
    const { style, className } = getRingPresentation({
      totalStories: 6,
      viewedCount: 5,
      size: 64,
    });
    expect(style['--rk-stories-ring-gradient']).toBe(
      'var(--rk-stories-ring-active-gradient)',
    );
    expect(className).toBe('rk-stories-ring rk-stories-ring--active');
  });

  it('points a fully watched ring at the viewed color token', () => {
    const { style, className } = getRingPresentation({
      totalStories: 6,
      viewedCount: 9,
      size: 64,
    });
    expect(style['--rk-stories-ring-gradient']).toBe(
      'var(--rk-stories-ring-viewed-color)',
    );
    expect(className).toBe('rk-stories-ring');
  });

  it('uses a viewed color given for this ring over the token', () => {
    expect(
      getRingPresentation({
        totalStories: 6,
        viewedCount: 6,
        size: 64,
        viewedColor: '#333',
      }).style['--rk-stories-ring-gradient'],
    ).toBe('#333');
  });

  it('closes gradient colors given for this ring on the one it opened with', () => {
    expect(
      getRingPresentation({
        totalStories: 2,
        viewedCount: 0,
        size: 64,
        gradientColors: ['#111', '#222'],
      }).style['--rk-stories-ring-gradient'],
    ).toBe('conic-gradient(from 180deg, #111, #222, #111)');
  });

  it('draws no ring for an empty group', () => {
    expect(
      getRingPresentation({ totalStories: 0, viewedCount: 0, size: 64 }).style[
        '--rk-stories-ring-gradient'
      ],
    ).toBe('none');
  });

  it('treats an empty list of gradient colors as no override', () => {
    expect(
      getRingPresentation({
        totalStories: 2,
        viewedCount: 0,
        size: 64,
        gradientColors: [],
      }).style['--rk-stories-ring-gradient'],
    ).toBe('var(--rk-stories-ring-active-gradient)');
  });
});
