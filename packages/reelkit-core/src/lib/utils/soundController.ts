import { createSignal, type Signal } from './signal';
import type { Disposer } from './disposable';

export interface SoundController {
  /** Whether audio is muted. Defaults to `true` (muted). */
  muted: Signal<boolean>;

  /**
   * Whether sound controls should be hidden/disabled.
   * Set to `true` when the active slide has no audio content.
   */
  disabled: Signal<boolean>;

  /** Toggles the muted state. */
  toggle: () => void;
}

/**
 * Creates a framework-agnostic sound controller with reactive
 * `muted` and `disabled` signals.
 */
export const createSoundController = (initialMuted = true): SoundController => {
  const muted = createSignal(initialMuted);
  const disabled = createSignal(false);
  return {
    muted,
    disabled,
    toggle: () => {
      muted.value = !muted.value;
    },
  };
};

/**
 * Syncs the muted signal to a video element. Sets the initial
 * value and observes changes. Returns a disposer.
 */
export const syncMutedToVideo = (
  controller: SoundController,
  video: HTMLVideoElement,
): Disposer => {
  video.muted = controller.muted.value;
  return controller.muted.observe(() => {
    video.muted = controller.muted.value;
  });
};
