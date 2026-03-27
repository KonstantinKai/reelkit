import { describe, it, expect } from 'vitest';
import { lightboxFadeTransition } from './lightboxFadeTransition';

const _kSize = 400;

describe('lightboxFadeTransition', () => {
  it('at rest: current slide is fully opaque', () => {
    const current = lightboxFadeTransition(_kSize * -1, 1, 1, _kSize, 'horizontal');
    expect(current.opacity).toBe(1);
    expect(current.zIndex).toBe(2);
  });

  it('at rest: neighbors are fully transparent', () => {
    expect(lightboxFadeTransition(_kSize * -1, 0, 1, _kSize, 'horizontal').opacity).toBe(0);
    expect(lightboxFadeTransition(_kSize * -1, 2, 1, _kSize, 'horizontal').opacity).toBe(0);
  });

  it('halfway: current and next are both partially visible', () => {
    const axisValue = _kSize * -1.5;
    const current = lightboxFadeTransition(axisValue, 1, 1, _kSize, 'horizontal');
    const next = lightboxFadeTransition(axisValue, 2, 1, _kSize, 'horizontal');

    expect(current.opacity).toBeGreaterThan(0);
    expect(current.opacity).toBeLessThan(1);
    expect(next.opacity).toBeGreaterThan(0);
    expect(next.opacity).toBeLessThan(1);
  });

  it('applies horizontal nudge transform', () => {
    const axisValue = _kSize * -1.5;
    const current = lightboxFadeTransition(axisValue, 1, 1, _kSize, 'horizontal');
    expect(current.transform).toContain('translateX(');
  });

  it('current slide gets higher zIndex', () => {
    const current = lightboxFadeTransition(_kSize * -1, 1, 1, _kSize, 'horizontal');
    const neighbor = lightboxFadeTransition(_kSize * -1.5, 2, 1, _kSize, 'horizontal');
    expect(current.zIndex).toBe(2);
    expect(neighbor.zIndex).toBe(1);
  });

  it('returns opacity 0 when primarySize is 0', () => {
    expect(lightboxFadeTransition(0, 0, 0, 0, 'horizontal')).toEqual({ opacity: 0 });
  });

  it('clamps opacity to 0 (never negative)', () => {
    const farAway = lightboxFadeTransition(_kSize * -5, 1, 1, _kSize, 'horizontal');
    expect(farAway.opacity).toBeGreaterThanOrEqual(0);
  });
});
