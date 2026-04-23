// Vitest jsdom default URL is `about:blank` → opaque origin → `localStorage`
// throws `SecurityError`. Supply an in-memory shim so module-level reads in
// `frameworkSignal.ts` (and anywhere else) resolve cleanly.
if (typeof window !== 'undefined') {
  const probe = () => {
    try {
      window.localStorage.getItem('__probe__');
      return true;
    } catch {
      return false;
    }
  };

  if (!probe()) {
    const store = new Map<string, string>();
    const memoryStorage: Storage = {
      get length() {
        return store.size;
      },
      clear: () => store.clear(),
      getItem: (key) => store.get(key) ?? null,
      key: (i) => [...store.keys()][i] ?? null,
      removeItem: (key) => {
        store.delete(key);
      },
      setItem: (key, value) => {
        store.set(key, String(value));
      },
    };
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: memoryStorage,
    });
  }
}
