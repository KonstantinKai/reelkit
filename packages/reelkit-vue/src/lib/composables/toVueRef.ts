import { onScopeDispose, readonly, shallowRef, type Ref } from 'vue';
import type { Subscribable } from '@reelkit/core';

/**
 * Bridges a core `Subscribable` reactive value into a Vue `Ref`.
 *
 * Subscribes to the source immediately and writes each new value into a
 * shallow `ref`. The subscription is automatically disposed when the
 * surrounding effect scope ends (typically component unmount), so this
 * helper must be called inside a Vue `setup()` or other effect-scope-aware
 * context.
 *
 * Use this whenever you need to render a core `Signal<T>` value inside a
 * Vue component — direct reads of `signal.value` inside a render function
 * will NOT trigger re-renders, because Vue's reactivity system has no
 * knowledge of core signals.
 *
 * @param source - The core subscribable to bridge.
 * @returns A read-only Vue ref that mirrors the source value.
 *
 * @example
 * ```ts
 * import { toVueRef, useSoundState } from '@reelkit/vue';
 *
 * const soundState = useSoundState();
 * const muted = toVueRef(soundState.muted);
 *
 * return () => h('button', muted.value ? 'Unmute' : 'Mute');
 * ```
 */
export function toVueRef<T>(source: Subscribable<T>): Readonly<Ref<T>> {
  const ref = shallowRef<T>(source.value);
  const dispose = source.observe(() => {
    ref.value = source.value;
  });
  onScopeDispose(dispose);
  return readonly(ref) as Readonly<Ref<T>>;
}
