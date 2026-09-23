import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { formatTimeAgo } from './timeAgo';

describe('formatTimeAgo', () => {
  const now = new Date('2026-09-18T12:00:00Z').getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const ago = (seconds: number) => new Date(now - seconds * 1000);

  it.each([
    [30, 'now'],
    [5 * 60, '5m'],
    [3 * 3600, '3h'],
    [2 * 86400, '2d'],
    [15 * 86400, '2w'],
  ])('labels a story %i seconds old as "%s"', (seconds, label) => {
    expect(formatTimeAgo(ago(seconds))).toBe(label);
  });

  it('accepts an ISO string', () => {
    expect(formatTimeAgo(ago(7200).toISOString())).toBe('2h');
  });
});
