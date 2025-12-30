import { describe, it, expect } from 'vitest';
import { abs, isNegative, clamp, lerp, extractRange } from './number';

describe('abs', () => {
  it('should return absolute value of positive number', () => {
    expect(abs(5)).toBe(5);
  });

  it('should return absolute value of negative number', () => {
    expect(abs(-5)).toBe(5);
  });

  it('should return 0 for 0', () => {
    expect(abs(0)).toBe(0);
  });
});

describe('isNegative', () => {
  it('should return true for negative numbers', () => {
    expect(isNegative(-1)).toBe(true);
    expect(isNegative(-0.5)).toBe(true);
  });

  it('should return false for positive numbers', () => {
    expect(isNegative(1)).toBe(false);
    expect(isNegative(0.5)).toBe(false);
  });

  it('should return false for zero', () => {
    expect(isNegative(0)).toBe(false);
  });
});

describe('clamp', () => {
  it('should return value if within bounds', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('should return min if value is below min', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('should return max if value is above max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('should handle equal min and max', () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });

  it('should handle negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(0, -10, -1)).toBe(-1);
  });
});

describe('lerp', () => {
  it('should return a when t is 0', () => {
    expect(lerp(0, 10, 30)).toBe(10);
  });

  it('should return b when t is 1', () => {
    expect(lerp(1, 10, 30)).toBe(30);
  });

  it('should return midpoint when t is 0.5', () => {
    expect(lerp(0.5, 10, 30)).toBe(20);
  });

  it('should work with negative values', () => {
    expect(lerp(0.5, -10, 10)).toBe(0);
  });

  it('should extrapolate beyond 0-1 range', () => {
    expect(lerp(2, 0, 10)).toBe(20);
    expect(lerp(-1, 0, 10)).toBe(-10);
  });
});

describe('extractRange', () => {
  describe('basic behavior', () => {
    it('should extract range with default overscan of 1', () => {
      const result = extractRange(10, 5);
      expect(result).toEqual([4, 5, 6]);
    });

    it('should extract range from start to end', () => {
      const result = extractRange(10, 3, 5, 0);
      expect(result).toEqual([3, 4, 5]);
    });

    it('should include overscan on both sides', () => {
      const result = extractRange(10, 5, 5, 2);
      expect(result).toEqual([3, 4, 5, 6, 7]);
    });
  });

  describe('edge cases', () => {
    it('should return empty array for count <= 0', () => {
      expect(extractRange(0, 0)).toEqual([]);
      expect(extractRange(-1, 0)).toEqual([]);
    });

    it('should return empty array if end >= count', () => {
      expect(extractRange(5, 5)).toEqual([]);
      expect(extractRange(5, 10)).toEqual([]);
    });

    it('should clamp to array boundaries without loop', () => {
      const result = extractRange(5, 0, 0, 2);
      expect(result).toEqual([0, 1, 2]);
    });

    it('should clamp end to array boundaries without loop', () => {
      const result = extractRange(5, 4, 4, 2);
      expect(result).toEqual([2, 3, 4]);
    });
  });

  describe('loop mode', () => {
    it('should wrap around at start', () => {
      const result = extractRange(5, 0, 0, 1, true);
      expect(result).toEqual([4, 0, 1]);
    });

    it('should wrap around at end', () => {
      const result = extractRange(5, 4, 4, 1, true);
      expect(result).toEqual([3, 4, 0]);
    });

    it('should return single element for count of 1 in loop mode', () => {
      expect(extractRange(1, 0, 0, 1, true)).toEqual([0]);
    });
  });

  describe('zero overscan', () => {
    it('should return exact range with zero overscan', () => {
      const result = extractRange(10, 2, 4, 0);
      expect(result).toEqual([2, 3, 4]);
    });

    it('should return single element with zero overscan and same start/end', () => {
      const result = extractRange(10, 5, 5, 0);
      expect(result).toEqual([5]);
    });
  });
});
