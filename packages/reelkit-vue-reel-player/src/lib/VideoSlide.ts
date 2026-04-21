import {
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watch,
  type CSSProperties,
  type ExtractPropTypes,
  type PropType,
} from 'vue';
import {
  captureFrame,
  createDisposableList,
  createSharedVideo,
  noop,
  observeDomEvent,
  observeMediaLoading,
  syncMutedToVideo,
  useSoundState,
} from '@reelkit/vue';

/**
 * Singleton shared `<video>` element + per-slide playback-position and
 * captured-frame caches. Imported by `ReelPlayerOverlay` to capture a
 * frame on slide change without remounting the video element.
 *
 * @internal
 */
export const shared = createSharedVideo({
  className: 'rk-video-slide-element',
  disableRemotePlayback: true,
  disablePictureInPicture: true,
});

/**
 * Module-scoped ownership token tracking which `VideoSlide` instance
 * currently owns the shared `<video>` element. Vue `watch` callbacks for
 * sibling slides can fire in any order — when slide A reactivates and
 * slide B deactivates in the same flush, an instance-local token would
 * always match its own `myToken`, causing slide B's cleanup to call
 * `pause()` and interrupt slide A's `play()`. A shared token lets the
 * losing slide skip the cleanup that would clobber the new owner.
 */
let activeToken: symbol | null = null;

/** Props accepted by the {@link VideoSlide} component. */
const videoSlideProps = {
  /** URL of the video source. */
  src: { type: String, required: true as const },

  /** Optional poster image shown while the video loads. */
  poster: { type: String, default: undefined },

  /** Width / height ratio. Values < 1 use `cover`, >= 1 use `contain`. */
  aspectRatio: { type: Number, required: true as const },

  /** `[width, height]` of the slide in pixels. */
  size: {
    type: Array as unknown as PropType<[number, number]>,
    required: true as const,
  },

  /** Whether this slide is the active (visible) slide in the parent reel. */
  isActive: { type: Boolean, required: true as const },

  /**
   * Whether this slide is the active item in a nested horizontal slider.
   *
   * @default true
   */
  isInnerActive: { type: Boolean, default: true },

  /** Unique key for persisting playback position and captured frames. */
  slideKey: { type: String, required: true as const },

  /** Additional inline styles merged onto the root container. */
  containerStyle: {
    type: Object as PropType<CSSProperties>,
    default: () => ({}),
  },

  /** Reports the shared video element to the parent for drag pause/resume. */
  onVideoRef: {
    type: Function as PropType<(ref: HTMLVideoElement | null) => void>,
    default: undefined,
  },

  /** Called when the video is ready to play (buffering complete). */
  onReady: { type: Function as PropType<() => void>, default: undefined },

  /** Called when the video stalls (buffering mid-playback). */
  onWaiting: { type: Function as PropType<() => void>, default: undefined },

  /** Called when the video fails to load or play. */
  onError: { type: Function as PropType<() => void>, default: undefined },
};

/** Public props interface for the {@link VideoSlide} component. */
export type VideoSlideProps = ExtractPropTypes<typeof videoSlideProps>;

/**
 * Renders a single video slide using a shared `<video>` element for iOS
 * sound continuity. Manages playback lifecycle (play/pause on active
 * state), persists playback position, and captures poster frames on
 * deactivation for seamless visual transitions.
 *
 * Must be rendered inside a `SoundProvider` (from `@reelkit/vue`).
 */
export const VideoSlide = defineComponent({
  name: 'RkVideoSlide',
  props: videoSlideProps,
  setup(props) {
    const containerRef = shallowRef<HTMLDivElement | null>(null);
    const showPoster = ref(true);
    const soundState = useSoundState();

    const shouldPlay = () => props.isActive && props.isInnerActive;

    // Reused across activations. `dispose()` empties the list, so
    // re-activating after deactivate() pushes onto a clean slate.
    const disposables = createDisposableList();

    const isVertical = () => props.aspectRatio < 1;

    const activate = () => {
      const container = containerRef.value;
      if (!container) return;

      const video = shared.getVideo();
      const myToken = Symbol();
      activeToken = myToken;

      showPoster.value = true;

      // Push the lifecycle disposer FIRST so LIFO ordering runs it LAST,
      // after listeners + muteSync have already been disposed.
      disposables.push(
        () => {
          // Shared video token lost — another VideoSlide already activated
          // (Vue may run sibling watchers in either order during the same
          // flush). Listeners + muteSync were already torn down above; we
          // just skip pause/remove/onVideoRef so we don't clobber the new
          // owner's setup.
          if (activeToken !== myToken) return;

          shared.playbackPositions.set(props.slideKey, video.currentTime);
          const frame = captureFrame(video);
          if (frame) {
            shared.capturedFrames.set(props.slideKey, frame);
          }
          if (!video.paused) video.pause();
          if (video.parentNode === container) {
            container.removeChild(video);
          }
          props.onVideoRef?.(null);
          activeToken = null;
        },
        observeMediaLoading(video, {
          onReady: () => props.onReady?.(),
          onWaiting: () => props.onWaiting?.(),
          onPlaying: () => {
            showPoster.value = false;
          },
        }),
        observeDomEvent(video, 'error', () => {
          if (video.error) props.onError?.();
        }),
      );

      video.src = props.src;
      video.muted = soundState.muted.value;

      const savedPosition = shared.playbackPositions.get(props.slideKey);
      video.currentTime = savedPosition ?? 0;

      video.style.objectFit = isVertical() ? 'cover' : 'contain';
      video.dataset['slideKey'] = props.slideKey;

      container.appendChild(video);
      props.onVideoRef?.(video);

      video.play().catch(noop);

      disposables.push(syncMutedToVideo(soundState, video));
    };

    const deactivate = disposables.dispose;

    onMounted(() => {
      if (shouldPlay()) activate();
    });

    // Two focused watches: one for play-state (isActive && isInnerActive),
    // one for media identity (src, slideKey). Splitting them removes the
    // need to inspect previous values across four sources.
    watch(
      () => props.isActive && props.isInnerActive,
      (isPlaying, wasPlaying) => {
        if (wasPlaying && !isPlaying) deactivate();
        else if (!wasPlaying && isPlaying) activate();
      },
    );

    watch(
      () => [props.src, props.slideKey] as const,
      () => {
        if (shouldPlay()) {
          deactivate();
          activate();
        }
      },
    );

    onUnmounted(deactivate);

    return () => {
      const posterSrc =
        shared.capturedFrames.get(props.slideKey) ?? props.poster;
      const posterVisible = !shouldPlay() || showPoster.value;

      return h(
        'div',
        {
          ref: containerRef,
          class: 'rk-video-slide-container',
          style: {
            width: `${props.size[0]}px`,
            height: `${props.size[1]}px`,
            ...props.containerStyle,
          },
        },
        posterSrc
          ? [
              h('img', {
                src: posterSrc,
                alt: '',
                class: `rk-video-slide-poster${posterVisible ? ' rk-visible' : ''}`,
                style: { objectFit: isVertical() ? 'cover' : 'contain' },
                onError: (e: Event) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                },
              }),
            ]
          : [],
      );
    };
  },
});

export default VideoSlide;
