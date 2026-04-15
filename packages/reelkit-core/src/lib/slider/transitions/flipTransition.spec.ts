import { describe, it, expect } from 'vitest';
import { flipTransition } from './flipTransition';

const _kSize = 400;

describe('flipTransition', () => {
  describe('horizontal direction', () => {
    it('at rest: current slide has no rotation and no translate', () => {
      const current = flipTransition(_kSize * -1, 1, 1, _kSize, 'horizontal');
      expect(current.opacity).toBe(1);
      expect(current.transform).toContain('translateX(0px)');
      expect(current.transform).toContain('rotateY(0deg)');
    });

    it('at rest: prev and next slides are hidden', () => {
      expect(
        flipTransition(_kSize * -1, 0, 1, _kSize, 'horizontal').opacity,
      ).toBe(0);
      expect(
        flipTransition(_kSize * -1, 2, 1, _kSize, 'horizontal').opacity,
      ).toBe(0);
    });

    it('halfway to next: current translates left with rotation', () => {
      const axisValue = _kSize * -1.5;
      const current = flipTransition(axisValue, 1, 1, _kSize, 'horizontal');

      expect(current.opacity).toBe(1);
      expect(current.transform).toContain(`translateX(${_kSize * -0.5}px)`);
      expect(current.transform).toContain('perspective(');
      expect(current.transform).toContain('rotateY(');
      expect(current.transformOrigin).toBe('center left');
    });

    it('halfway to next: next slide translates in from right', () => {
      const axisValue = _kSize * -1.5;
      const next = flipTransition(axisValue, 2, 1, _kSize, 'horizontal');

      expect(next.opacity).toBe(1);
      expect(next.transform).toContain(`translateX(${_kSize * 0.5}px)`);
      expect(next.transformOrigin).toBe('center right');
    });

    it('uses scale for depth compression at midpoint', () => {
      const axisValue = _kSize * -1.5;
      const current = flipTransition(axisValue, 1, 1, _kSize, 'horizontal');
      expect(current.transform).toContain('scale(');
    });

    it('dragging backward: prev becomes visible', () => {
      const axisValue = _kSize * -0.5;
      const prev = flipTransition(axisValue, 0, 1, _kSize, 'horizontal');
      expect(prev.opacity).toBe(1);
      expect(prev.transform).toContain('translateX(');
    });
  });

  describe('vertical direction', () => {
    it('at rest: current slide uses rotateX', () => {
      const current = flipTransition(_kSize * -1, 1, 1, _kSize, 'vertical');
      expect(current.opacity).toBe(1);
      expect(current.transform).toContain('translateY(');
      expect(current.transform).toContain('rotateX(');
    });
  });

  it('returns empty object when primarySize is 0', () => {
    expect(flipTransition(0, 0, 0, 0, 'horizontal')).toEqual({});
  });

  it('current slide gets higher zIndex', () => {
    const current = flipTransition(_kSize * -1, 1, 1, _kSize, 'horizontal');
    expect(current.zIndex).toBe(2);
  });
});
