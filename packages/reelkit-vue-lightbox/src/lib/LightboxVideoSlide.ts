import {
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  ref,
  watch,
  type ExtractPropTypes,
  type PropType,
} from 'vue';
import {
  captureFrame,
  createDisposableList,
  createSharedVideo,
  observeDomEvent,
  observeMediaLoading,
  syncMutedToVideo,
  useSoundState,
} from '@reelkit/vue';
import './LightboxVideoSlide.css';

/**
 * Shared `<video>` element singleton for the lightbox. Separate from
 * reel-player's shared element so both overlays can coexist on the
 * same page without fighting over one DOM node.
 *
 * @internal
 */
export const shared = createSharedVideo({
  className: 'rk-lightbox-video-element',
});

/**
 * Props for {@link LightboxVideoSlide}. Extracted so consumers can
 * build typed wrappers via `ExtractPropTypes<typeof lightboxVideoSlideProps>`.
 */
export const lightboxVideoSlideProps = {
  /** URL of the video source. */
  src: {
    type: String,
    required: true as const,
  },

  /** Optional poster image shown while the video loads. */
  poster: {
    type: String,
    default: undefined,
  },

  /** Whether this slide is the active (visible) slide. */
  isActive: {
    type: Boolean,
    required: true as const,
  },

  /** `[width, height]` in pixels. */
  size: {
    type: Array as unknown as PropType<[number, number]>,
    required: true as const,
  },

  /** Unique key for persisting playback position and captured frames. */
  slideKey: {
    type: String,
    required: true as const,
  },

  /** Fired when the video starts playing (buffering complete). */
  onPlaying: {
    type: Function as PropType<() => void>,
    default: undefined,
  },

  /** Fired when the video stalls (buffering mid-playback). */
  onWaiting: {
    type: Function as PropType<() => void>,
    default: undefined,
  },

  /** Fired when the video fails to load or play. */
  onLoadError: {
    type: Function as PropType<() => void>,
    default: undefined,
  },
} as const;

export type LightboxVideoSlideProps = ExtractPropTypes<
  typeof lightboxVideoSlideProps
>;

/**
 * Video slide component for the lightbox. Uses a shared `<video>`
 * element (same pattern as reel-player) so playback continues across
 * slide changes on iOS where per-slide `<video>` nodes would need a
 * user gesture each time they mount.
 *
 * Use through `useVideoSlideRenderer` — it is not typically rendered
 * directly.
 */
export const LightboxVideoSlide = defineComponent({
  name: 'LightboxVideoSlide',
  props: lightboxVideoSlideProps,
  setup(props) {
    // Plain `let` for a DOM ref that's only read inside the activate/
    // deactivate helpers — no reactive consumer.
    let containerEl: HTMLDivElement | null = null;
    const soundState = useSoundState();
    const showPoster = ref(true);

    const disposables = createDisposableList();

    const activate = () => {
      disposables.dispose();
      if (!containerEl) return;
      const container = containerEl;
      const video = shared.getVideo();
      showPoster.value = true;

      disposables.push(
        observeMediaLoading(video, {
          onReady: () => props.onPlaying?.(),
          onWaiting: () => props.onWaiting?.(),
          onPlaying: () => (showPoster.value = false),
        }),
        observeDomEvent(video, 'error', () => {
          if (video.error) props.onLoadError?.();
        }),
      );

      video.src = props.src;
      video.muted = soundState.muted.value;
      disposables.push(syncMutedToVideo(soundState, video));
      video.style.objectFit = 'contain';

      const savedPosition = shared.playbackPositions.get(props.slideKey);
      video.currentTime = savedPosition ?? 0;

      container.appendChild(video);
      video.play().catch(() => props.onLoadError?.());

      disposables.push(() => {
        shared.playbackPositions.set(props.slideKey, video.currentTime);
        const frame = captureFrame(video);
        if (frame) shared.capturedFrames.set(props.slideKey, frame);
        if (video.parentNode === container) {
          container.removeChild(video);
        }
      });
    };

    onMounted(() => {
      if (props.isActive) activate();
    });

    onUnmounted(disposables.dispose);

    watch(
      () => [props.isActive, props.src, props.slideKey] as const,
      ([active]) => {
        if (active) {
          activate();
        } else {
          disposables.dispose();
        }
      },
    );

    return () => {
      const posterSrc =
        shared.capturedFrames.get(props.slideKey) ?? props.poster;
      const showOverlay = !props.isActive || showPoster.value;
      return h(
        'div',
        {
          ref: (el: unknown) => {
            containerEl = (el as HTMLDivElement | null) ?? null;
          },
          class: 'rk-lightbox-video-container',
          style: {
            width: `${props.size[0]}px`,
            height: `${props.size[1]}px`,
          },
        },
        [
          posterSrc
            ? h('img', {
                src: posterSrc,
                alt: '',
                class: `rk-lightbox-video-poster${showOverlay ? ' rk-visible' : ''}`,
              })
            : null,
        ],
      );
    };
  },
});
