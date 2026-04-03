import { describe, it, expect } from 'vitest';
import { zoomTransition } from './zoomTransition';

const _kSize = 400;

describe('zoomTransition', () => {
  it('at rest: current slide is full scale and opacity', () => {
    const current = zoomTransition(_kSize * -1, 1, 1, _kSize, 'horizontal');
    expect(current.opacity).toBe(1);
    expect(current.transform).toContain('scale(1)');
    expect(current.zIndex).toBe(2);
  });

  it('at rest: adjacent slides are hidden', () => {
    const prev = zoomTransition(_kSize * -1, 0, 1, _kSize, 'horizontal');
    const next = zoomTransition(_kSize * -1, 2, 1, _kSize, 'horizontal');
    expect(prev.opacity).toBe(0);
    expect(next.opacity).toBe(0);
  });

  it('halfway: both slides have intermediate scale and opacity', () => {
    const axisValue = _kSize * -1.5;
    const current = zoomTransition(axisValue, 1, 1, _kSize, 'horizontal');
    const next = zoomTransition(axisValue, 2, 1, _kSize, 'horizontal');

    expect(current.opacity).toBe(0.5);
    expect(current.transform).toContain('scale(0.9)');
    expect(next.opacity).toBe(0.5);
    expect(next.transform).toContain('scale(0.9)');
  });

  it('returns opacity 0 when primarySize is 0', () => {
    expect(zoomTransition(0, 0, 0, 0, 'horizontal')).toEqual({ opacity: 0 });
  });

  it('current slide gets higher zIndex', () => {
    const current = zoomTransition(_kSize * -1, 1, 1, _kSize, 'horizontal');
    const other = zoomTransition(_kSize * -1.5, 2, 1, _kSize, 'horizontal');
    expect(current.zIndex).toBe(2);
    expect(other.zIndex).toBe(1);
  });
});
