import { defineComponent, provide, inject, type InjectionKey } from 'vue';
import { createSoundController, type SoundController } from '@reelkit/core';

/**
 * Injection key for the current `SoundController`.
 *
 * Nested `<SoundProvider>` components create independent controllers;
 * `useSoundState()` always resolves to the nearest ancestor provider,
 * shadowing any outer one. Provide explicitly if you need to share a
 * single instance across nested overlays.
 */
export const RK_SOUND_KEY: InjectionKey<SoundController> =
  Symbol('RK_SOUND_KEY');

/**
 * Context provider for `SoundController`.
 *
 * Wraps overlay content in reel-player, stories-player, and lightbox.
 * Creates a single `SoundController` instance with `muted: true`
 * and `disabled: false` as initial values. Nested providers each create
 * their own controller (see `RK_SOUND_KEY` JSDoc).
 */
export const SoundProvider = defineComponent({
  name: 'SoundProvider',
  setup(_, { slots }) {
    const controller = createSoundController();
    provide(RK_SOUND_KEY, controller);
    return () => slots['default']?.();
  },
});

/**
 * Composable to access the current `SoundController` from context.
 *
 * Must be called inside a `SoundProvider` (automatically provided
 * by overlay components). Useful in custom controls built via render props.
 *
 * @throws Error if called outside of a `SoundProvider`.
 */
export const useSoundState = (): SoundController => {
  const context = inject(RK_SOUND_KEY, null);
  if (!context) {
    throw new Error('useSoundState must be used within SoundProvider');
  }
  return context;
};
