import { describe, it, expect } from 'vitest';
import { cubeTransition } from './cubeTransition';

const SIZE = 400;

describe('cubeTransition', () => {
  describe('horizontal direction', () => {
    it('at rest (axisValue=0, currentRangeIndex=1): current slide has no rotation', () => {
      // Range [prev, current, next], current at index 1
      const current = cubeTransition(SIZE * -1, 1, 1, SIZE, 'horizontal');
      expect(current.opacity).toBe(1);
      expect(current.transform).toContain('rotateY(0deg)');
    });

    it('at rest: prev slide is at -90deg (hidden)', () => {
      const prev = cubeTransition(SIZE * -1, 0, 1, SIZE, 'horizontal');
      expect(prev.opacity).toBe(0);
    });

    it('at rest: next slide is at 90deg (hidden)', () => {
      const next = cubeTransition(SIZE * -1, 2, 1, SIZE, 'horizontal');
      expect(next.opacity).toBe(0);
    });

    it('halfway to next: both current and next are at ~45deg', () => {
      const axisValue = SIZE * -1.5; // halfway between current and next
      const current = cubeTransition(axisValue, 1, 1, SIZE, 'horizontal');
      const next = cubeTransition(axisValue, 2, 1, SIZE, 'horizontal');

      expect(current.opacity).toBe(1);
      expect(current.transform).toContain('rotateY(-45deg)');
      expect(next.opacity).toBe(1);
      expect(next.transform).toContain('rotateY(45deg)');
    });

    it('fully at next slide position: current is at -90deg (hidden)', () => {
      const axisValue = SIZE * -2; // fully at next
      const current = cubeTransition(axisValue, 1, 1, SIZE, 'horizontal');
      expect(current.opacity).toBe(0);
    });

    it('dragging backward (toward prev): prev becomes visible', () => {
      const axisValue = SIZE * -0.5; // halfway toward prev
      const prev = cubeTransition(axisValue, 0, 1, SIZE, 'horizontal');
      expect(prev.opacity).toBe(1);
      expect(prev.transform).toContain('rotateY(-45deg)');
    });
  });

  describe('vertical direction', () => {
    it('at rest: current slide has no rotation', () => {
      const current = cubeTransition(SIZE * -1, 1, 1, SIZE, 'vertical');
      expect(current.opacity).toBe(1);
      expect(current.transform).toContain('rotateX(0deg)');
    });

    it('halfway to next: uses rotateX', () => {
      const axisValue = SIZE * -1.5;
      const next = cubeTransition(axisValue, 2, 1, SIZE, 'vertical');
      expect(next.opacity).toBe(1);
      expect(next.transform).toContain('rotateX');
    });
  });

  it('returns empty object when primarySize is 0', () => {
    const result = cubeTransition(0, 0, 0, 0, 'horizontal');
    expect(result).toEqual({});
  });

  it('current slide gets higher zIndex', () => {
    const current = cubeTransition(SIZE * -1, 1, 1, SIZE, 'horizontal');
    const other = cubeTransition(SIZE * -1, 0, 1, SIZE, 'horizontal');
    expect(current.zIndex).toBe(2);
    // prev is hidden so zIndex doesn't matter, but check it exists
    expect(other.zIndex).toBeDefined();
  });
});
