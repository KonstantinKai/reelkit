import { describe, it, expect } from 'vitest';
import { first, last, generate } from './array';

describe('first', () => {
  it('should return the first element of an array', () => {
    expect(first([1, 2, 3])).toBe(1);
    expect(first(['a', 'b', 'c'])).toBe('a');
  });

  it('should return undefined for empty array', () => {
    expect(first([])).toBeUndefined();
  });

  it('should work with single element array', () => {
    expect(first([42])).toBe(42);
  });
});

describe('last', () => {
  it('should return the last element of an array', () => {
    expect(last([1, 2, 3])).toBe(3);
    expect(last(['a', 'b', 'c'])).toBe('c');
  });

  it('should return undefined for empty array', () => {
    expect(last([])).toBeUndefined();
  });

  it('should work with single element array', () => {
    expect(last([42])).toBe(42);
  });
});

describe('generate', () => {
  it('should generate array with specified length', () => {
    const result = generate(4, (i) => i);
    expect(result).toEqual([0, 1, 2, 3]);
  });

  it('should apply generator function to each index', () => {
    const result = generate(3, (i) => i * 2);
    expect(result).toEqual([0, 2, 4]);
  });

  it('should return empty array for count 0', () => {
    const result = generate(0, (i) => i);
    expect(result).toEqual([]);
  });

  it('should work with object generator', () => {
    const result = generate(2, (i) => ({ id: i, name: `item-${i}` }));
    expect(result).toEqual([
      { id: 0, name: 'item-0' },
      { id: 1, name: 'item-1' },
    ]);
  });
});
