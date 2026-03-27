import { describe, it, expect } from 'vitest';
import { fadeTransition } from './fadeTransition';

const _kSize = 400;

describe('fadeTransition', () => {
  it('at rest: current slide has opacity 1, others have opacity 0', () => {
    const axisValue = _kSize * -1; // current at rangeIndex 1
    const current = fadeTransition(axisValue, 1, 1, _kSize, 'horizontal');
    const prev = fadeTransition(axisValue, 0, 1, _kSize, 'horizontal');
    const next = fadeTransition(axisValue, 2, 1, _kSize, 'horizontal');

    expect(current.opacity).toBe(1);
    expect(prev.opacity).toBe(0);
    expect(next.opacity).toBe(0);
  });

  it('halfway to next: both current and next have opacity 0.5', () => {
    const axisValue = _kSize * -1.5;
    const current = fadeTransition(axisValue, 1, 1, _kSize, 'horizontal');
    const next = fadeTransition(axisValue, 2, 1, _kSize, 'horizontal');

    expect(current.opacity).toBeCloseTo(0.5);
    expect(next.opacity).toBeCloseTo(0.5);
  });

  it('fully at next: current has opacity 0, next has opacity 1', () => {
    const axisValue = _kSize * -2;
    const current = fadeTransition(axisValue, 1, 1, _kSize, 'horizontal');
    const next = fadeTransition(axisValue, 2, 1, _kSize, 'horizontal');

    expect(current.opacity).toBe(0);
    expect(next.opacity).toBe(1);
  });

  it('dragging backward: prev becomes visible', () => {
    const axisValue = _kSize * -0.5; // halfway toward prev
    const prev = fadeTransition(axisValue, 0, 1, _kSize, 'horizontal');
    const current = fadeTransition(axisValue, 1, 1, _kSize, 'horizontal');

    expect(prev.opacity).toBeCloseTo(0.5);
    expect(current.opacity).toBeCloseTo(0.5);
  });

  it('current slide gets higher zIndex', () => {
    const axisValue = _kSize * -1;
    const current = fadeTransition(axisValue, 1, 1, _kSize, 'horizontal');
    const other = fadeTransition(axisValue, 0, 1, _kSize, 'horizontal');

    expect(current.zIndex).toBe(2);
    expect(other.zIndex).toBe(1);
  });

  it('returns opacity 0 when primarySize is 0', () => {
    const result = fadeTransition(0, 0, 0, 0, 'horizontal');
    expect(result.opacity).toBe(0);
  });

  it('opacity is clamped between 0 and 1', () => {
    // Far away from any slide
    const axisValue = _kSize * -5;
    const result = fadeTransition(axisValue, 0, 1, _kSize, 'horizontal');
    expect(result.opacity).toBeGreaterThanOrEqual(0);
    expect(result.opacity).toBeLessThanOrEqual(1);
  });
});
