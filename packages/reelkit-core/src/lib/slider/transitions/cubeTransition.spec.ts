import { describe, it, expect } from 'vitest';
import { cubeTransition } from './cubeTransition';

const _kSize = 400;

describe('cubeTransition', () => {
  describe('horizontal direction', () => {
    it('at rest: current slide has no rotation and no translate', () => {
      const current = cubeTransition(_kSize * -1, 1, 1, _kSize, 'horizontal');
      expect(current.opacity).toBe(1);
      expect(current.transform).toContain('translateX(0px)');
      expect(current.transform).toContain('rotateY(0deg)');
    });

    it('at rest: prev and next slides are hidden', () => {
      expect(
        cubeTransition(_kSize * -1, 0, 1, _kSize, 'horizontal').opacity,
      ).toBe(0);
      expect(
        cubeTransition(_kSize * -1, 2, 1, _kSize, 'horizontal').opacity,
      ).toBe(0);
    });

    it('halfway to next: current translates left with rotation', () => {
      const axisValue = _kSize * -1.5;
      const current = cubeTransition(axisValue, 1, 1, _kSize, 'horizontal');

      expect(current.opacity).toBe(1);
      expect(current.transform).toContain(`translateX(${_kSize * -0.5}px)`);
      expect(current.transform).toContain('perspective(500px)');
      expect(current.transform).toContain('rotateY(');
    });

    it('halfway to next: next slide translates in from right', () => {
      const axisValue = _kSize * -1.5;
      const next = cubeTransition(axisValue, 2, 1, _kSize, 'horizontal');

      expect(next.opacity).toBe(1);
      expect(next.transform).toContain(`translateX(${_kSize * 0.5}px)`);
    });

    it('current slide hinges on right edge, next on left edge', () => {
      const axisValue = _kSize * -1.5;
      const current = cubeTransition(axisValue, 1, 1, _kSize, 'horizontal');
      const next = cubeTransition(axisValue, 2, 1, _kSize, 'horizontal');

      expect(current.transformOrigin).toBe('right center');
      expect(next.transformOrigin).toBe('left center');
    });

    it('dragging backward: prev becomes visible', () => {
      const axisValue = _kSize * -0.5;
      const prev = cubeTransition(axisValue, 0, 1, _kSize, 'horizontal');
      expect(prev.opacity).toBe(1);
      expect(prev.transform).toContain('translateX(');
    });

    it('rotation is proportional to scroll position', () => {
      const quarter = cubeTransition(
        _kSize * -1.25,
        1,
        1,
        _kSize,
        'horizontal',
      );
      const half = cubeTransition(_kSize * -1.5, 1, 1, _kSize, 'horizontal');

      const getRotation = (s: string) => {
        const match = s.match(/rotateY\((-?[\d.]+)deg\)/);
        return match ? parseFloat(match[1]) : 0;
      };

      const quarterRot = Math.abs(getRotation(quarter.transform!));
      const halfRot = Math.abs(getRotation(half.transform!));
      expect(halfRot).toBeGreaterThan(quarterRot);
    });
  });

  describe('vertical direction', () => {
    it('at rest: current slide uses rotateX and translateY', () => {
      const current = cubeTransition(_kSize * -1, 1, 1, _kSize, 'vertical');
      expect(current.opacity).toBe(1);
      expect(current.transform).toContain('translateY(');
      expect(current.transform).toContain('rotateX(');
    });

    it('uses bottom/top origin instead of right/left', () => {
      const axisValue = _kSize * -1.5;
      const current = cubeTransition(axisValue, 1, 1, _kSize, 'vertical');
      const next = cubeTransition(axisValue, 2, 1, _kSize, 'vertical');

      expect(current.transformOrigin).toBe('center bottom');
      expect(next.transformOrigin).toBe('center top');
    });
  });

  it('returns empty object when primarySize is 0', () => {
    expect(cubeTransition(0, 0, 0, 0, 'horizontal')).toEqual({});
  });

  it('current slide gets higher zIndex', () => {
    const current = cubeTransition(_kSize * -1, 1, 1, _kSize, 'horizontal');
    const neighbor = cubeTransition(_kSize * -1.5, 2, 1, _kSize, 'horizontal');
    expect(current.zIndex).toBe(2);
    expect(neighbor.zIndex).toBe(1);
  });

  it('fully off-screen slides are hidden', () => {
    const farAway = cubeTransition(_kSize * -3, 1, 1, _kSize, 'horizontal');
    expect(farAway.opacity).toBe(0);
    expect(farAway.zIndex).toBe(0);
  });
});
