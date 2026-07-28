import { effect, signal, type WritableSignal } from '@angular/core';

/**
 * A writable signal that seeds from `localStorage` and writes every change
 * back, so a demo switch survives a reload — flip it, refresh, and the page
 * comes back the way you left it. Must be called in an injection context (a
 * field initialiser or constructor) because it registers an `effect`.
 * Best-effort: a storage that throws (private mode, quota) falls back to the
 * in-memory value rather than breaking the page.
 */
export function persistedSignal<T>(
  key: string,
  fallback: T,
): WritableSignal<T> {
  let initial = fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) initial = JSON.parse(raw) as T;
  } catch {
    // A read failure just leaves the fallback in place.
  }

  const state = signal(initial);

  effect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state()));
    } catch {
      // A write failure is not worth interrupting the demo for.
    }
  });

  return state;
}
