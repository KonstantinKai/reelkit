import { inject, type InjectionKey } from 'vue';
import type { Signal } from '@reelkit/core';

/**
 * Shape of the context a {@link Reel} component provides to descendants
 * via `provide` / `inject`. Enables nested components (like
 * {@link ReelIndicator} or custom control buttons) to read live slider
 * state and drive navigation without prop drilling.
 */
export interface ReelContextValue {
  /**
   * Reactive signal holding the currently active slide index. Subscribe
   * with `index.observe(listener)` for imperative reactions, or read
   * `index.value` inside a Vue reactive scope.
   */
  index: Signal<number>;

  /**
   * Reactive signal mirroring the parent Reel's `count` prop. Useful for
   * indicator components that need to redraw when the slide count
   * changes.
   */
  count: Signal<number>;

  /**
   * Navigate the parent slider to a specific index.
   *
   * @param index  Target slide index. Values are clamped to `[0, count - 1]`
   *   unless the parent is in loop mode.
   * @param animate  Whether to animate the transition. Defaults to `true`
   *   in most callers; pass `false` for instant jumps.
   * @returns A promise that resolves when the transition completes.
   */
  goTo: (index: number, animate?: boolean) => Promise<void>;
}

/**
 * Vue injection key used by {@link Reel} to expose its
 * {@link ReelContextValue} to descendants. Prefer the
 * {@link useReelContext} composable over calling `inject(RK_REEL_KEY)`
 * directly — the composable returns a typed value or `null`.
 */
export const RK_REEL_KEY: InjectionKey<ReelContextValue> =
  Symbol('RK_REEL_KEY');

/**
 * Reads the {@link ReelContextValue} from the nearest ancestor
 * {@link Reel}, or returns `null` when called outside one.
 *
 * Typical usage is inside a descendant component that wants to reflect
 * or drive the parent slider's state:
 *
 * ```vue
 * <script setup lang="ts">
 * import { useReelContext } from '@reelkit/vue';
 *
 * const reel = useReelContext();
 * if (!reel) throw new Error('must be rendered inside <Reel>');
 *
 * const goToThird = () => reel.goTo(2, true);
 * </script>
 * ```
 *
 * @returns The parent Reel's context value, or `null` if no `<Reel>`
 *   ancestor is found. Callers that require a context (e.g. a
 *   component that can only be used inside `<Reel>`) should throw on
 *   `null` themselves.
 */
export const useReelContext = (): ReelContextValue | null =>
  inject(RK_REEL_KEY, null);
