import { ref, watch, type Ref } from 'vue';

/**
 * A ref that seeds from `localStorage` and writes every change back, so a
 * demo switch survives a reload — flip it, refresh, and the page comes back the
 * way you left it. Best-effort: a storage that throws (private mode, quota)
 * falls back to the in-memory value rather than breaking the page.
 */
export function persistedRef<T>(key: string, fallback: T): Ref<T> {
  let initial = fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) initial = JSON.parse(raw) as T;
  } catch {
    // A read failure just leaves the fallback in place.
  }

  const state = ref(initial) as Ref<T>;

  watch(state, (value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // A write failure is not worth interrupting the demo for.
    }
  });

  return state;
}
