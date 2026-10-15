import { defineComponent, Fragment, h } from 'vue';
import type { ExtractPropTypes, PropType } from 'vue';
import {
  X,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Download,
} from 'lucide-vue-next';

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
 * Props for the slideshow toggle. In a custom `controls` slot, render it only
 * when `onToggleAutoAdvance` is present and pass `isAutoAdvancing` through.
 */
export const playPauseButtonProps = {
  /** Whether the slideshow is running. Shows Pause when it is, Play when not. */
  isPlaying: { type: Boolean, required: true as const },

  /**
   * Optional CSS class applied to the `<button>` element.
   *
   * @default 'rk-lightbox-btn rk-lightbox-play-pause'
   */
  className: {
    type: String,
    default: 'rk-lightbox-btn rk-lightbox-play-pause',
  },

  /** Fired when the button is clicked. */
  onPress: {
    type: Function as PropType<() => void>,
    required: true as const,
  },
} as const;

export type PlayPauseButtonProps = ExtractPropTypes<
  typeof playPauseButtonProps
>;

/**
 * Slideshow play/pause toggle. The default controls show it when
 * `auto-advance` is on; in a custom `controls` slot, render it when
 * `onToggleAutoAdvance` is present.
 */
export const PlayPauseButton = defineComponent({
  name: 'LightboxPlayPauseButton',
  props: playPauseButtonProps,
  setup(props) {
    return () =>
      h(
        'button',
        {
          class: props.className,
          title: props.isPlaying ? 'Pause slideshow' : 'Play slideshow',
          'aria-pressed': props.isPlaying ? 'true' : 'false',
          onClick: props.onPress,
        },
        [h(props.isPlaying ? Pause : Play, { size: 20 })],
      );
  },
});

/**
 * Props for the download button. In a custom `controls` slot, render it only
 * when `onDownload` is present and pass `isDownloading` through.
 */
export const downloadButtonProps = {
  /** Whether a download is in progress. The button is disabled meanwhile. */
  isDownloading: { type: Boolean, required: true as const },

  /**
   * Optional CSS class applied to the `<button>` element.
   *
   * @default 'rk-lightbox-btn rk-lightbox-download'
   */
  className: { type: String, default: 'rk-lightbox-btn rk-lightbox-download' },

  /** Fired when the button is clicked. */
  onPress: {
    type: Function as PropType<() => void>,
    required: true as const,
  },
} as const;

export type DownloadButtonProps = ExtractPropTypes<typeof downloadButtonProps>;

/**
 * Download button for the active item. The default controls show it when
 * `show-download` is on; in a custom `controls` slot, render it when
 * `onDownload` is present.
 */
export const DownloadButton = defineComponent({
  name: 'LightboxDownloadButton',
  props: downloadButtonProps,
  setup(props) {
    return () =>
      h(
        'button',
        {
          class: props.className,
          title: 'Download',
          disabled: props.isDownloading,
          'aria-busy': props.isDownloading ? 'true' : 'false',
          onClick: props.onPress,
        },
        [h(Download, { size: 20 })],
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

  /** Whether the slideshow is running. */
  isAutoAdvancing: { type: Boolean, default: false },

  /** Whether the active item is being downloaded. */
  isDownloading: { type: Boolean, default: false },

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

  /** Slideshow toggle; the play/pause button shows only when it is given. */
  onToggleAutoAdvance: {
    type: Function as PropType<() => void>,
    default: undefined,
  },

  /** Download handler; the download button shows only when it is given. */
  onDownload: {
    type: Function as PropType<() => void>,
    default: undefined,
  },
} as const;

/**
 * Default composed controls bar. Used internally by `LightboxOverlay`
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
          props.onToggleAutoAdvance
            ? h(PlayPauseButton, {
                isPlaying: props.isAutoAdvancing,
                onPress: props.onToggleAutoAdvance,
              })
            : null,
          props.onDownload
            ? h(DownloadButton, {
                isDownloading: props.isDownloading,
                onPress: props.onDownload,
              })
            : null,
        ]),
        h(CloseButton, { onPress: props.onClose }),
      ]);
  },
});
