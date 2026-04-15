import { describe, it, expect } from 'vitest';
import { getTapAction } from './tapZone';

describe('getTapAction', () => {
  it('returns prev for taps in the left zone', () => {
    expect(getTapAction(50, 400)).toBe('prev');
    expect(getTapAction(0, 400)).toBe('prev');
    expect(getTapAction(119, 400)).toBe('prev');
  });

  it('returns next for taps in the right zone', () => {
    expect(getTapAction(120, 400)).toBe('next');
    expect(getTapAction(200, 400)).toBe('next');
    expect(getTapAction(400, 400)).toBe('next');
  });

  it('uses custom split ratio', () => {
    // 50% split: left half = prev, right half = next
    expect(getTapAction(199, 400, 0.5)).toBe('prev');
    expect(getTapAction(200, 400, 0.5)).toBe('next');
  });

  it('at exact boundary: returns next', () => {
    // 30% of 400 = 120, tap at 120 should be next
    expect(getTapAction(120, 400, 0.3)).toBe('next');
  });
});
