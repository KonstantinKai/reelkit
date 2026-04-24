import { defineComponent, Fragment, h } from 'vue';
import type { ExtractPropTypes, PropType } from 'vue';
import { X, Maximize, Minimize, Volume2, VolumeX } from 'lucide-vue-next';

/**
 * Props for {@link CloseButton}.
 */
export const closeButtonProps = {
  /**
   * Optional CSS class applied to the `<button>` element.
   *
   * @default 'rk-lightbox-close'
   */
  className: { type: String, default: 'rk-lightbox-close' },

  /** Fired when the button is clicked. */
  onPress: {
    type: Function as PropType<() => void>,
    required: true as const,
  },
} as const;

export type CloseButtonProps = ExtractPropTypes<typeof closeButtonProps>;

/**
 * Default close button. Compose into a custom `controls` slot if you
 * replace the built-in controls bar.
 */
export const CloseButton = defineComponent({
  name: 'LightboxCloseButton',
  props: closeButtonProps,
  setup(props) {
    return () =>
      h(
        'button',
        {
          class: props.className,
          title: 'Close (Esc)',
          onClick: props.onPress,
        },
        [h(X, { size: 24 })],
      );
  },
});

/**
 * Props for {@link Counter}.
 */
export const counterProps = {
  /** Zero-based index of the current slide. */
  currentIndex: { type: Number, required: true as const },

  /** Total number of items. */
  count: { type: Number, required: true as const },

  /**
   * Optional CSS class applied to the wrapper span.
   *
   * @default 'rk-lightbox-counter'
   */
  className: { type: String, default: 'rk-lightbox-counter' },
} as const;

export type CounterProps = ExtractPropTypes<typeof counterProps>;

/**
 * Default slide counter. Renders `"N / M"` using current index and total,
 * with a polite live region so screen readers announce changes.
 */
export const Counter = defineComponent({
  name: 'LightboxCounter',
  props: counterProps,
  setup(props) {
    return () =>
      h(
        'span',
        {
          class: props.className,
          role: 'status',
          'aria-live': 'polite',
        },
        `${props.currentIndex + 1} / ${props.count}`,
      );
  },
});

/**
 * Props for {@link FullscreenButton}.
 */
export const fullscreenButtonProps = {
  /** Whether the lightbox container is currently in fullscreen. */
  isFullscreen: { type: Boolean, required: true as const },

  /**
   * Optional CSS class applied to the `<button>` element.
   *
   * @default 'rk-lightbox-btn'
   */
  className: { type: String, default: 'rk-lightbox-btn' },

  /** Fired when the button is clicked. */
  onPress: {
    type: Function as PropType<() => void>,
    required: true as const,
  },
} as const;

export type FullscreenButtonProps = ExtractPropTypes<
  typeof fullscreenButtonProps
>;

/**
 * Default fullscreen toggle. Renders the Maximize icon when windowed
 * and the Minimize icon when in fullscreen.
 */
export const FullscreenButton = defineComponent({
  name: 'LightboxFullscreenButton',
  props: fullscreenButtonProps,
  setup(props) {
    return () =>
      h(
        'button',
        {
          class: props.className,
          title: props.isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen',
          onClick: props.onPress,
        },
        [h(props.isFullscreen ? Minimize : Maximize, { size: 20 })],
      );
  },
});

/**
 * Props for {@link SoundButton}.
 */
export const soundButtonProps = {
  /** Whether audio is currently muted. */
  isMuted: { type: Boolean, required: true as const },

  /**
   * Optional CSS class applied to the `<button>` element.
   *
   * @default 'rk-lightbox-btn'
   */
  className: { type: String, default: 'rk-lightbox-btn' },

  /** Fired when the button is clicked. */
  onPress: {
    type: Function as PropType<() => void>,
    required: true as const,
  },
} as const;

export type SoundButtonProps = ExtractPropTypes<typeof soundButtonProps>;

/**
 * Default sound toggle used with video slides. Renders the Volume2
 * icon when unmuted and the VolumeX icon when muted.
 */
export const SoundButton = defineComponent({
  name: 'LightboxSoundButton',
  props: soundButtonProps,
  setup(props) {
    return () =>
      h(
        'button',
        {
          class: props.className,
          title: props.isMuted ? 'Unmute' : 'Mute',
          onClick: props.onPress,
        },
        [h(props.isMuted ? VolumeX : Volume2, { size: 20 })],
      );
  },
});

/**
 * Props for the internal {@link LightboxControls} composed bar.
 *
 * @internal
 */
export const lightboxControlsProps = {
  /** Zero-based index of the current slide. */
  currentIndex: { type: Number, required: true as const },

  /** Total number of items. */
  count: { type: Number, required: true as const },

  /** Whether the overlay is currently in fullscreen. */
  isFullscreen: { type: Boolean, required: true as const },

  /** Close handler passed to the embedded {@link CloseButton}. */
  onClose: {
    type: Function as PropType<() => void>,
    required: true as const,
  },

  /** Toggle handler passed to the embedded {@link FullscreenButton}. */
  onToggleFullscreen: {
    type: Function as PropType<() => void>,
    required: true as const,
  },
} as const;

/**
 * Default composed controls bar. Used internally by {@link LightboxOverlay}
 * when no `controls` slot is provided. Emits a Fragment so the counter +
 * fullscreen group and the close button can each own their absolute
 * positioning via CSS.
 *
 * @internal
 */
export const LightboxControls = defineComponent({
  name: 'LightboxControls',
  props: lightboxControlsProps,
  setup(props) {
    return () =>
      h(Fragment, null, [
        h('div', { class: 'rk-lightbox-controls-left' }, [
          h(Counter, {
            currentIndex: props.currentIndex,
            count: props.count,
          }),
          h(FullscreenButton, {
            isFullscreen: props.isFullscreen,
            onPress: props.onToggleFullscreen,
          }),
        ]),
        h(CloseButton, { onPress: props.onClose }),
      ]);
  },
});
