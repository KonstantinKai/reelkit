export interface LruCache<V> {
  /** Number of entries. */
  readonly size: number;

  /** Get a value by key. Returns `undefined` if not found. */
  get: (key: string) => V | undefined;

  /** Set a value. Evicts the oldest entry if at capacity. */
  set: (key: string, value: V) => void;

  /** Check if a key exists. */
  has: (key: string) => boolean;

  /** Remove a key. */
  delete: (key: string) => void;
}

/**
 * Creates a simple LRU (least recently used) cache with a fixed capacity.
 * When the cache exceeds `maxSize`, the oldest entry is evicted.
 * An optional `onEvict` callback is called with the evicted value
 * (useful for cleanup like `URL.revokeObjectURL`).
 */
export const createLruCache = <V>(
  maxSize: number,
  onEvict?: (value: V, key: string) => void,
): LruCache<V> => {
  const map = new Map<string, V>();

  const evictIfNeeded = () => {
    while (map.size > maxSize) {
      const [key, value] = map.entries().next().value!;
      map.delete(key);
      onEvict?.(value, key);
    }
  };

  return {
    get: (key) => map.get(key),
    set: (key, value) => {
      map.delete(key);
      map.set(key, value);
      evictIfNeeded();
    },
    has: (key) => map.has(key),
    delete: (key) => map.delete(key),
    get size() {
      return map.size;
    },
  };
};
