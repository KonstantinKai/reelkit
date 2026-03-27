import { describe, it, expect } from 'vitest';
import { lightboxZoomTransition } from './lightboxZoomTransition';

const _kSize = 400;

describe('lightboxZoomTransition', () => {
  it('at rest: current slide is fully opaque at scale 1', () => {
    const current = lightboxZoomTransition(_kSize * -1, 1, 1, _kSize, 'horizontal');
    expect(current.opacity).toBe(1);
    expect(current.transform).toContain('scale(1)');
    expect(current.zIndex).toBe(2);
  });

  it('at rest: neighbors are hidden', () => {
    expect(lightboxZoomTransition(_kSize * -1, 0, 1, _kSize, 'horizontal').opacity).toBe(0);
    expect(lightboxZoomTransition(_kSize * -1, 2, 1, _kSize, 'horizontal').opacity).toBe(0);
  });

  it('halfway: scale is between 0.7 and 1', () => {
    const axisValue = _kSize * -1.5;
    const next = lightboxZoomTransition(axisValue, 2, 1, _kSize, 'horizontal');
    expect(next.transform).toContain('scale(');

    const match = next.transform!.match(/scale\(([\d.]+)\)/);
    const scale = match ? parseFloat(match[1]) : 0;
    expect(scale).toBeGreaterThan(0.7);
    expect(scale).toBeLessThan(1);
  });

  it('applies horizontal nudge transform', () => {
    const axisValue = _kSize * -1.5;
    const current = lightboxZoomTransition(axisValue, 1, 1, _kSize, 'horizontal');
    expect(current.transform).toContain('translateX(');
  });

  it('fully off-screen slides are hidden with zIndex 0', () => {
    const farAway = lightboxZoomTransition(_kSize * -5, 1, 1, _kSize, 'horizontal');
    expect(farAway.opacity).toBe(0);
    expect(farAway.zIndex).toBe(0);
  });

  it('zIndex flips at midpoint', () => {
    const nearCurrent = lightboxZoomTransition(_kSize * -1.3, 2, 1, _kSize, 'horizontal');
    const nearNext = lightboxZoomTransition(_kSize * -1.7, 2, 1, _kSize, 'horizontal');
    expect(nearCurrent.zIndex).toBe(1);
    expect(nearNext.zIndex).toBe(2);
  });

  it('returns opacity 0 when primarySize is 0', () => {
    expect(lightboxZoomTransition(0, 0, 0, 0, 'horizontal')).toEqual({ opacity: 0 });
  });
});
