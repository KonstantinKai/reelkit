import { createSignal, type Signal } from '@reelkit/react';

/**
 * A signal seeded from `localStorage` and written back on every change, so a
 * demo's UI state survives a reload — a consumer can flip the switches, refresh,
 * and see them restored. Best-effort: a storage error (private mode, quota,
 * server render) degrades to a plain in-memory signal.
 *
 * Key convention: `reelkit-<page>-<dashed-prop>`.
 */
export const persistedSignal = <T>(key: string, fallback: T): Signal<T> => {
  let initial = fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) initial = JSON.parse(raw) as T;
  } catch {
    /* ignore — fall back to the default */
  }

  const signal = createSignal<T>(initial);
  signal.observe(() => {
    try {
      localStorage.setItem(key, JSON.stringify(signal.value));
    } catch {
      /* ignore — persistence is best-effort */
    }
  });
  return signal;
};
