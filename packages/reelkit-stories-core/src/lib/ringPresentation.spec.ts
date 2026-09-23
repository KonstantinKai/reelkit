import { describe, it, expect } from 'vitest';
import { getRingPresentation } from './ringPresentation';

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

  it('closes the gradient on the color it opened with', () => {
    const { style, className } = getRingPresentation({
      totalStories: 6,
      viewedCount: 5,
      size: 64,
    });
    expect(style['--rk-stories-ring-gradient']).toBe(
      'conic-gradient(from 180deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #f09433)',
    );
    expect(className).toBe('rk-stories-ring rk-stories-ring--active');
  });

  it('shows the viewed color once the group is fully watched', () => {
    const { style, className } = getRingPresentation({
      totalStories: 6,
      viewedCount: 9,
      size: 64,
      viewedColor: '#333',
    });
    expect(style['--rk-stories-ring-gradient']).toBe('#333');
    expect(className).toBe('rk-stories-ring');
  });

  it('draws no ring for an empty group', () => {
    expect(
      getRingPresentation({ totalStories: 0, viewedCount: 0, size: 64 }).style[
        '--rk-stories-ring-gradient'
      ],
    ).toBe('none');
  });

  it('falls back to the default palette when given no colors', () => {
    expect(
      getRingPresentation({
        totalStories: 2,
        viewedCount: 0,
        size: 64,
        gradientColors: [],
      }).style['--rk-stories-ring-gradient'],
    ).toContain('#f09433');
  });
});
