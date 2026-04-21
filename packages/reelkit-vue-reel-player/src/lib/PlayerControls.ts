import {
  defineComponent,
  h,
  type CSSProperties,
  type ExtractPropTypes,
  type PropType,
} from 'vue';
import { X, Volume2, VolumeX } from 'lucide-vue-next';
import { toVueRef, useSoundState } from '@reelkit/vue';

/** Props accepted by the {@link CloseButton} component. */
const closeButtonProps = {
  /**
   * CSS class name.
   *
   * @default 'rk-reel-close-btn'
   */
  className: { type: String, default: 'rk-reel-close-btn' },

  /** Additional inline styles merged on top of the default button styles. */
  style: {
    type: Object as PropType<CSSProperties>,
    default: () => ({}),
  },

  /** Click handler. */
  onClick: {
    type: Function as PropType<() => void>,
    required: true as const,
  },
};

/** Public props interface for the {@link CloseButton} component. */
export type CloseButtonProps = ExtractPropTypes<typeof closeButtonProps>;

/**
 * Reusable close button rendered as an absolutely-positioned circular icon
 * in the top-right corner. Intended for use inside the `controls` slot.
 */
export const CloseButton = defineComponent({
  name: 'RkCloseButton',
  props: closeButtonProps,
  setup(props) {
    return () =>
      h(
        'button',
        {
          onClick: () => props.onClick(),
          class: ['rk-reel-button', props.className],
          style: props.style,
          'aria-label': 'Close',
        },
        [h(X, { size: 24 })],
      );
  },
});

/** Props accepted by the {@link SoundButton} component. */
const soundButtonProps = {
  /**
   * Render the button dimmed and ignore clicks. Useful when the active
   * slide carries an image inside a multi-media carousel.
   *
   * @default false
   */
  disabled: { type: Boolean, default: false },

  /**
   * CSS class name.
   *
   * @default 'rk-reel-sound-btn'
   */
  className: { type: String, default: 'rk-reel-sound-btn' },

  /** Additional inline styles merged on top of the default button styles. */
  style: {
    type: Object as PropType<CSSProperties>,
    default: () => ({}),
  },
};

/** Public props interface for the {@link SoundButton} component. */
export type SoundButtonProps = ExtractPropTypes<typeof soundButtonProps>;

/**
 * Reusable mute/unmute toggle button rendered as an absolutely-positioned
 * circular icon in the bottom-right corner.
 *
 * Must be rendered inside a `SoundProvider` (automatically provided by
 * `ReelPlayerOverlay`). Reads mute state from `SoundController` context.
 *
 * Hidden when `SoundController.disabled` is `true`.
 */
export const SoundButton = defineComponent({
  name: 'RkSoundButton',
  props: soundButtonProps,
  setup(props) {
    const soundState = useSoundState();
    const muted = toVueRef(soundState.muted);
    const disabled = toVueRef(soundState.disabled);

    return () => {
      if (disabled.value) return null;
      return h(
        'button',
        {
          onClick: props.disabled ? undefined : soundState.toggle,
          class: ['rk-reel-button', props.className],
          style: props.style,
          'aria-label': muted.value ? 'Unmute' : 'Mute',
          'aria-disabled': props.disabled,
        },
        [muted.value ? h(VolumeX, { size: 22 }) : h(Volume2, { size: 22 })],
      );
    };
  },
});

/** Props accepted by the default {@link PlayerControls} composer. */
const playerControlsProps = {
  /**
   * Show the {@link SoundButton}.
   *
   * @default false
   */
  showSound: { type: Boolean, default: false },

  /**
   * Render the {@link SoundButton} dimmed and non-interactive.
   *
   * @default false
   */
  soundDisabled: { type: Boolean, default: false },

  /** Click handler for the {@link CloseButton}. */
  onClose: {
    type: Function as PropType<() => void>,
    required: true as const,
  },
};

/** Public props interface for the default {@link PlayerControls} composer. */
export type PlayerControlsProps = ExtractPropTypes<typeof playerControlsProps>;

/**
 * Default player controls composing {@link CloseButton} and
 * {@link SoundButton}. Used internally by `ReelPlayerOverlay` when no
 * `controls` slot is provided.
 */
export const PlayerControls = defineComponent({
  name: 'RkPlayerControls',
  props: playerControlsProps,
  setup(props) {
    return () => {
      const children = [h(CloseButton, { onClick: () => props.onClose() })];
      if (props.showSound) {
        children.push(h(SoundButton, { disabled: props.soundDisabled }));
      }
      return children;
    };
  },
});

export default PlayerControls;
