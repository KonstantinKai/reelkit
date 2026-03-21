import { signal, type Signal, type DestroyRef } from '@angular/core';
import type { Subscribable } from '@reelkit/core';

/**
 * Bridges a core `Subscribable` reactive value into an Angular `Signal`.
 *
 * Subscribes to the source immediately and writes each new value into an
 * Angular writable signal. The subscription is automatically disposed when
 * the provided `DestroyRef` fires.
 *
 * @param source - The core subscribable to bridge.
 * @param destroyRef - Angular destroy ref that cleans up the subscription.
 * @returns A read-only Angular signal that mirrors the source value.
 */
export function toAngularSignal<T>(
  source: Subscribable<T>,
  destroyRef: DestroyRef,
): Signal<T> {
  const angularSignal = signal<T>(source.value);
  const dispose = source.observe(() => angularSignal.set(source.value));
  destroyRef.onDestroy(dispose);
  return angularSignal.asReadonly();
}
