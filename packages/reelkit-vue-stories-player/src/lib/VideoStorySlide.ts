import {
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  shallowRef,
  watch,
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
  reaction,
  syncMutedToVideo,
  useSoundState,
  type DisposableList,
  type Signal,
} from '@reelkit/vue';

/** Props accepted by the {@link VideoStorySlide} component. */
const videoStorySlideProps = {
  /** Loaded only while this slide is the active one. */
  src: { type: String, required: true as const },

  /** Shown until playback starts. A frame captured from an earlier play wins. */
  poster: { type: String, default: undefined },

  /** Where this slide sits. Matched against the two signals below. */
  groupIndex: { type: Number, required: true as const },

  /** Where this slide sits. Matched against the two signals below. */
  storyIndex: { type: Number, required: true as const },

  /** Both signals equal to the pair above means this slide owns the video. */
  activeGroupIndex: {
    type: Object as PropType<Signal<number>>,
    required: true as const,
  },

  /** Both signals equal to the pair above means this slide owns the video. */
  activeStoryIndex: {
    type: Object as PropType<Signal<number>>,
    required: true as const,
  },

  /** Called when video metadata loads, reporting the duration in milliseconds. */
  onDurationReady: {
    type: Function as PropType<(ms: number) => void>,
    default: undefined,
  },

  /** Called when the video starts playing (buffering complete). */
  onPlaying: { type: Function as PropType<() => void>, default: undefined },

  /** Called when the video stalls (buffering mid-playback). */
  onWaiting: { type: Function as PropType<() => void>, default: undefined },

  /** The story is over; the player moves on rather than waiting for the timer. */
  onEnded: { type: Function as PropType<() => void>, default: undefined },

  /** Covers a source that will not load and a play() the browser refused. */
  onError: { type: Function as PropType<() => void>, default: undefined },
};

/** Public props interface for the {@link VideoStorySlide} component. */
export type VideoStorySlideProps = ExtractPropTypes<
  typeof videoStorySlideProps
>;

/**
 * The one `<video>` element every video story plays through, with the frames
 * captured from it for posters. The overlay pauses and resumes it on drag and
 * on pause.
 *
 * @internal
 */
export const shared = createSharedVideo({
  className: 'rk-stories-video-element',
  disableRemotePlayback: true,
  disablePictureInPicture: true,
});

/**
 * Renders a single video story slide using a shared `<video>` element
 * for iOS sound continuity across slide changes.
 *
 * Decides whether it is active straight from the controller signals through a
 * `reaction`, without waiting for a render. The shared element is moved into
 * the active slide's container and removed on deactivation, leaving a
 * captured frame behind as the poster. Must be rendered inside a
 * `SoundProvider`.
 */
export const VideoStorySlide = defineComponent({
  name: 'VideoStorySlide',
  props: videoStorySlideProps,
  setup(props) {
    const containerRef = shallowRef<HTMLDivElement | null>(null);
    const soundState = useSoundState();
    const showPoster = shallowRef(true);
    let lifecycle: DisposableList | null = null;

    const setUp = () => {
      const container = containerRef.value;
      if (!container) return;

      const {
        src,
        groupIndex,
        storyIndex,
        activeGroupIndex,
        activeStoryIndex,
      } = props;
      let active = false;
      let activeDisposables: DisposableList | null = null;
      const disposables = createDisposableList();

      const activate = () => {
        const video = shared.getVideo();
        const srcChanged = !video.src.endsWith(src);

        showPoster.value = true;

        // Listeners go on before the source, the position or play change: a
        // cached video can fire its events synchronously on any of them.
        activeDisposables = createDisposableList();
        activeDisposables.push(
          observeDomEvent(video, 'loadedmetadata', () => {
            if (video.duration && isFinite(video.duration)) {
              props.onDurationReady?.(video.duration * 1000);
            }
          }),
          observeMediaLoading(video, {
            onReady: () => props.onPlaying?.(),
            onWaiting: () => props.onWaiting?.(),
            onPlaying: () => {
              showPoster.value = false;
            },
          }),
          observeDomEvent(video, 'ended', () => props.onEnded?.()),
          observeDomEvent(video, 'error', () => {
            if (video.error) props.onError?.();
          }),
        );

        if (srcChanged) video.src = src;
        video.currentTime = 0;
        video.muted = soundState.muted.value;
        video.loop = false;
        video.style.objectFit = 'cover';
        video.style.width = '100%';
        video.style.height = '100%';

        container.appendChild(video);

        if (
          video.readyState >= 1 &&
          video.duration &&
          isFinite(video.duration)
        ) {
          props.onDurationReady?.(video.duration * 1000);
        }

        video.play().catch(noop);
      };

      const deactivate = () => {
        activeDisposables?.dispose();
        activeDisposables = null;

        const video = shared.getVideo();
        // Pause and remove only while the video is still in this container.
        // The next slide may already have claimed it, which moves the element
        // out of here on its own.
        if (video.parentNode === container) {
          const frame = captureFrame(video);
          if (frame) shared.capturedFrames.set(src, frame);
          video.pause();
          container.removeChild(video);
        }
        showPoster.value = true;
      };

      const isActiveNow = () =>
        activeGroupIndex.value === groupIndex &&
        activeStoryIndex.value === storyIndex;

      disposables.push(
        reaction(
          () => [activeGroupIndex, activeStoryIndex],
          () => {
            const shouldBeActive = isActiveNow();
            if (shouldBeActive && !active) {
              active = true;
              activate();
            } else if (!shouldBeActive && active) {
              active = false;
              deactivate();
            }
          },
        ),
        () => {
          if (active) deactivate();
        },
      );

      if (isActiveNow()) {
        active = true;
        activate();
      }

      lifecycle = disposables;
    };

    const tearDown = () => {
      lifecycle?.dispose();
      lifecycle = null;
    };

    let unsyncMuted = noop;

    onMounted(() => {
      unsyncMuted = syncMutedToVideo(soundState, shared.getVideo());
      setUp();
    });

    watch(
      () => [props.src, props.groupIndex, props.storyIndex] as const,
      () => {
        tearDown();
        setUp();
      },
      { flush: 'post' },
    );

    onUnmounted(() => {
      tearDown();
      unsyncMuted();
    });

    return () => {
      const poster = shared.capturedFrames.get(props.src) ?? props.poster ?? '';

      return h(
        'div',
        { ref: containerRef, class: 'rk-stories-video' },
        poster
          ? [
              h('img', {
                src: poster,
                alt: '',
                class: [
                  'rk-stories-video-poster',
                  showPoster.value ? 'rk-stories-video-poster--visible' : '',
                ],
              }),
            ]
          : [],
      );
    };
  },
});
