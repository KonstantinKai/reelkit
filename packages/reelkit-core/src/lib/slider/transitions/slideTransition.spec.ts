import { describe, it, expect } from 'vitest';
import { slideTransition } from './slideTransition';

const _kSize = 400;

describe('slideTransition', () => {
  describe('horizontal direction', () => {
    it('at rest: current slide is at 0px', () => {
      const current = slideTransition(_kSize * -1, 1, 1, _kSize, 'horizontal');
      expect(current.transform).toBe('translateX(0px)');
    });

    it('at rest: prev slide is one size to the left', () => {
      const prev = slideTransition(_kSize * -1, 0, 1, _kSize, 'horizontal');
      expect(prev.transform).toBe(`translateX(${-_kSize}px)`);
    });

    it('at rest: next slide is one size to the right', () => {
      const next = slideTransition(_kSize * -1, 2, 1, _kSize, 'horizontal');
      expect(next.transform).toBe(`translateX(${_kSize}px)`);
    });

    it('halfway to next: current shifts left', () => {
      const current = slideTransition(
        _kSize * -1.5,
        1,
        1,
        _kSize,
        'horizontal',
      );
      expect(current.transform).toBe(`translateX(${_kSize * -0.5}px)`);
    });

    it('halfway to next: next shifts into view', () => {
      const next = slideTransition(_kSize * -1.5, 2, 1, _kSize, 'horizontal');
      expect(next.transform).toBe(`translateX(${_kSize * 0.5}px)`);
    });
  });

  describe('vertical direction', () => {
    it('at rest: current slide is at 0px', () => {
      const current = slideTransition(_kSize * -1, 1, 1, _kSize, 'vertical');
      expect(current.transform).toBe('translateY(0px)');
    });

    it('at rest: prev slide is one size above', () => {
      const prev = slideTransition(_kSize * -1, 0, 1, _kSize, 'vertical');
      expect(prev.transform).toBe(`translateY(${-_kSize}px)`);
    });

    it('at rest: next slide is one size below', () => {
      const next = slideTransition(_kSize * -1, 2, 1, _kSize, 'vertical');
      expect(next.transform).toBe(`translateY(${_kSize}px)`);
    });
  });

  it('returns empty object when primarySize is 0', () => {
    expect(slideTransition(0, 0, 0, 0, 'horizontal')).toEqual({});
  });

  it('only returns transform property', () => {
    const result = slideTransition(_kSize * -1, 1, 1, _kSize, 'horizontal');
    expect(Object.keys(result)).toEqual(['transform']);
  });
});
