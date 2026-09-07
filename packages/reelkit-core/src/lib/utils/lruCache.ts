/**
 * A Map that keeps at most a fixed number of entries. Setting a key moves it
 * to the end, and once the count passes the cap the oldest entry is dropped,
 * so what remains is whatever was set most recently.
 *
 * It is a real Map, so everything a Map does — iteration, spreading, `size`,
 * handing it to `new Map()` — works on it directly. Only `set` differs.
 *
 * @typeParam V - The value stored under each string key.
 */
export type LruCache<V> = Map<string, V>;

/**
 * Creates an {@link LruCache}: a Map with a capacity, evicting the least
 * recently set entry once it is exceeded.
 *
 * The cap lives in a `set` placed on the instance rather than in a wrapper, a
 * Proxy, or a subclass. A wrapper hides the Map behind its own interface and
 * has to grow a method for every way a caller wants to read it. A Proxy has no
 * Map internals, so every method it hands out must be rebound to the target or
 * the receiver check throws. A subclass works, and would be the one class in a
 * codebase built from factories. Replacing the method leaves a plain Map with
 * its storage intact and nothing else to maintain.
 *
 * @param maxSize - Entries kept. Setting one past this drops the oldest.
 * @param onEvict - Runs for each dropped entry, for cleanup such as
 * `URL.revokeObjectURL`.
 * @returns A `Map<string, V>` whose `set` enforces the cap.
 */
export const createLruCache = <V>(
  maxSize: number,
  onEvict?: (value: V, key: string) => void,
): LruCache<V> => {
  const map = new Map<string, V>();
  const insert = Map.prototype.set.bind(map);

  map.set = (key, value) => {
    // Delete first, so a key already present moves to the end: insertion
    // order is the recency order that eviction walks from the front.
    map.delete(key);
    insert(key, value);

    while (map.size > maxSize) {
      const [oldestKey, oldestValue] = map.entries().next().value!;
      map.delete(oldestKey);
      onEvict?.(oldestValue, oldestKey);
    }

    return map;
  };

  return map;
};
