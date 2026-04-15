import { describe, it, expect, vi } from 'vitest';
import { createLruCache } from './lruCache';

describe('createLruCache', () => {
  it('stores and retrieves values', () => {
    const cache = createLruCache<number>(5);
    cache.set('a', 1);
    expect(cache.get('a')).toBe(1);
  });

  it('returns undefined for missing keys', () => {
    const cache = createLruCache<number>(5);
    expect(cache.get('missing')).toBeUndefined();
  });

  it('has returns true for existing keys', () => {
    const cache = createLruCache<string>(5);
    cache.set('a', 'hello');
    expect(cache.has('a')).toBe(true);
    expect(cache.has('b')).toBe(false);
  });

  it('delete removes a key', () => {
    const cache = createLruCache<number>(5);
    cache.set('a', 1);
    cache.delete('a');
    expect(cache.has('a')).toBe(false);
  });

  it('tracks size', () => {
    const cache = createLruCache<number>(5);
    expect(cache.size).toBe(0);
    cache.set('a', 1);
    cache.set('b', 2);
    expect(cache.size).toBe(2);
  });

  describe('eviction', () => {
    it('evicts oldest entry at capacity', () => {
      const cache = createLruCache<number>(3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      cache.set('d', 4);

      expect(cache.has('a')).toBe(false);
      expect(cache.has('b')).toBe(true);
      expect(cache.has('d')).toBe(true);
      expect(cache.size).toBe(3);
    });

    it('re-setting a key moves it to the end (not evicted first)', () => {
      const cache = createLruCache<number>(3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      cache.set('a', 10);
      cache.set('d', 4);

      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(false);
      expect(cache.get('a')).toBe(10);
    });

    it('calls onEvict with evicted value and key', () => {
      const onEvict = vi.fn();
      const cache = createLruCache<string>(2, onEvict);
      cache.set('a', 'first');
      cache.set('b', 'second');
      cache.set('c', 'third');

      expect(onEvict).toHaveBeenCalledWith('first', 'a');
    });

    it('does not call onEvict when under capacity', () => {
      const onEvict = vi.fn();
      const cache = createLruCache<number>(5, onEvict);
      cache.set('a', 1);
      cache.set('b', 2);

      expect(onEvict).not.toHaveBeenCalled();
    });
  });
});
