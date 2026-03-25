import { describe, it, expect } from 'vitest';
import { getSegments, getVisibleWindow } from './progress';

describe('getSegments', () => {
  it('marks segments before active as completed', () => {
    const segments = getSegments(5, 2, 0.5);
    expect(segments[0]).toEqual({ status: 'completed', fillPercentage: 100 });
    expect(segments[1]).toEqual({ status: 'completed', fillPercentage: 100 });
  });

  it('marks active segment with timer progress', () => {
    const segments = getSegments(5, 2, 0.5);
    expect(segments[2]).toEqual({ status: 'active', fillPercentage: 50 });
  });

  it('marks segments after active as upcoming', () => {
    const segments = getSegments(5, 2, 0.5);
    expect(segments[3]).toEqual({ status: 'upcoming', fillPercentage: 0 });
    expect(segments[4]).toEqual({ status: 'upcoming', fillPercentage: 0 });
  });

  it('handles first story', () => {
    const segments = getSegments(3, 0, 0);
    expect(segments[0]).toEqual({ status: 'active', fillPercentage: 0 });
    expect(segments[1]).toEqual({ status: 'upcoming', fillPercentage: 0 });
  });

  it('handles last story fully complete', () => {
    const segments = getSegments(3, 2, 1);
    expect(segments[2]).toEqual({ status: 'active', fillPercentage: 100 });
  });

  it('handles single story', () => {
    const segments = getSegments(1, 0, 0.75);
    expect(segments).toHaveLength(1);
    expect(segments[0]).toEqual({ status: 'active', fillPercentage: 75 });
  });

  it('clamps fill percentage to 0-100', () => {
    const segments = getSegments(1, 0, 1.5);
    expect(segments[0].fillPercentage).toBe(100);

    const segments2 = getSegments(1, 0, -0.5);
    expect(segments2[0].fillPercentage).toBe(0);
  });
});

describe('getVisibleWindow', () => {
  it('returns all segments when they fit', () => {
    const window = getVisibleWindow(5, 2, 0.5, 200, 4, 2);
    expect(window.startIndex).toBe(0);
    expect(window.endIndex).toBe(4);
    expect(window.segments).toHaveLength(5);
  });

  it('returns a sliding window when segments overflow', () => {
    // Container fits ~10 segments at 4px + 2px gap = 6px each
    // (200 + 2) / (4 + 2) = 33.66 → 33 visible
    // With 50 stories, need a window
    const window = getVisibleWindow(50, 25, 0.5, 200, 4, 2);
    expect(window.segments.length).toBeLessThanOrEqual(33);
    expect(window.startIndex).toBeGreaterThanOrEqual(0);
    expect(window.endIndex).toBeLessThan(50);
  });

  it('keeps active segment within visible range', () => {
    const window = getVisibleWindow(50, 45, 0.5, 60, 4, 2);
    const maxVisible = Math.floor(62 / 6);
    expect(window.endIndex).toBe(49);
    expect(window.startIndex).toBe(50 - maxVisible);
    expect(45 >= window.startIndex && 45 <= window.endIndex).toBe(true);
  });

  it('clamps window at start', () => {
    const window = getVisibleWindow(50, 0, 0, 60, 4, 2);
    expect(window.startIndex).toBe(0);
  });

  it('clamps window at end', () => {
    const window = getVisibleWindow(50, 49, 0, 60, 4, 2);
    expect(window.endIndex).toBe(49);
  });
});
