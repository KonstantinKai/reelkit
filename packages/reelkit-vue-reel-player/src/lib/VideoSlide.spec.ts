import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, reactive, type VNode } from 'vue';
import { SoundProvider } from '@reelkit/vue';
import { VideoSlide, shared } from './VideoSlide';
import { TimelineProvider, useTimelineState } from './useTimelineState';

type SlideProps = {
  src: string;
  poster?: string;
  aspectRatio: number;
  size: [number, number];
  isActive: boolean;
  isInnerActive?: boolean;
  slideKey: string;
  containerStyle?: Record<string, string>;
  onVideoRef?: (video: HTMLVideoElement | null) => void;
  onReady?: () => void;
  onWaiting?: () => void;
  onError?: () => void;
};

let keySequence = 0;

// Each test gets its own slide key: playback positions and captured frames
// are kept per key on the shared element, which outlives every test.
const nextKey = () => `video-slide-${++keySequence}`;

const baseProps = (): SlideProps => ({
  src: 'https://example.com/clip.mp4',
  aspectRatio: 9 / 16,
  size: [360, 640],
  isActive: true,
  slideKey: nextKey(),
});

const mountSlide = (overrides: Partial<SlideProps> = {}) => {
  const props = reactive<SlideProps>({ ...baseProps(), ...overrides });
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(SoundProvider, null, {
          default: () => [h(VideoSlide, { ...props })],
        }),
    }),
    { attachTo: document.body },
  );
  const container = () =>
    wrapper.find('.rk-reel-video-container').element as HTMLElement;
  const video = () => container().querySelector('video');
  const poster = () =>
    container().querySelector('.rk-reel-video-poster') as HTMLImageElement;
  return { wrapper, props, container, video, poster };
};

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(
    () => undefined,
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  const video = shared.getVideo();
  for (const key of ['error', 'paused']) {
    delete (video as unknown as Record<string, unknown>)[key];
  }
  document.body.innerHTML = '';
});

describe('VideoSlide', () => {
  describe('rendering', () => {
    it('sizes the container and merges a custom style', () => {
      const { container } = mountSlide({
        size: [300, 500],
        containerStyle: { borderRadius: '8px' },
      });

      expect(container().style.width).toBe('300px');
      expect(container().style.height).toBe('500px');
      expect(container().style.borderRadius).toBe('8px');
    });

    it('shows the poster with a fit that follows the aspect ratio', () => {
      const vertical = mountSlide({
        poster: 'https://example.com/tall.jpg',
        isActive: false,
      });
      expect(vertical.poster().getAttribute('src')).toBe(
        'https://example.com/tall.jpg',
      );
      expect(vertical.poster().style.objectFit).toBe('cover');
      vertical.wrapper.unmount();

      const wide = mountSlide({
        poster: 'https://example.com/wide.jpg',
        aspectRatio: 16 / 9,
        isActive: false,
      });
      expect(wide.poster().style.objectFit).toBe('contain');
    });

    it('renders no poster when none is given', () => {
      const { poster } = mountSlide({ isActive: false });

      expect(poster()).toBeNull();
    });

    it('hides a poster that fails to load', () => {
      const { poster } = mountSlide({
        poster: 'https://example.com/broken.jpg',
        isActive: false,
      });

      poster().dispatchEvent(new Event('error'));

      expect(poster().style.display).toBe('none');
    });
  });

  describe('playback', () => {
    it('plays the shared video inside the active slide', () => {
      const onVideoRef = vi.fn();
      const { video, props } = mountSlide({ onVideoRef });

      expect(video()).toBe(shared.getVideo());
      expect(video()?.src).toBe(props.src);
      expect(video()?.dataset['slideKey']).toBe(props.slideKey);
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
      expect(onVideoRef).toHaveBeenLastCalledWith(shared.getVideo());
    });

    it('keeps the video out of an inactive slide', () => {
      const { video } = mountSlide({ isActive: false });

      expect(video()).toBeNull();
      expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    });

    it('keeps the video out of a slide that is not the active inner one', () => {
      const { video } = mountSlide({ isInnerActive: false });

      expect(video()).toBeNull();
    });

    it('hides the poster once playback starts', async () => {
      const { video, poster } = mountSlide({
        poster: 'https://example.com/poster.jpg',
      });
      expect(poster().classList.contains('rk-visible')).toBe(true);

      video()!.dispatchEvent(new Event('playing'));
      await nextTick();

      expect(poster().classList.contains('rk-visible')).toBe(false);
    });

    it('reports ready, buffering and a media error', () => {
      const onReady = vi.fn();
      const onWaiting = vi.fn();
      const onError = vi.fn();
      const { video } = mountSlide({ onReady, onWaiting, onError });
      const element = video()!;

      element.dispatchEvent(new Event('canplay'));
      element.dispatchEvent(new Event('waiting'));
      element.dispatchEvent(new Event('error'));
      expect(onError).not.toHaveBeenCalled();

      Object.defineProperty(element, 'error', {
        configurable: true,
        value: { code: 4 },
      });
      element.dispatchEvent(new Event('error'));

      expect(onReady).toHaveBeenCalledTimes(1);
      expect(onWaiting).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it('hands the video back and remembers where it stopped', async () => {
      const onVideoRef = vi.fn();
      const { props, video } = mountSlide({ onVideoRef });
      const element = video()!;
      Object.defineProperty(element, 'paused', {
        configurable: true,
        value: false,
      });
      element.currentTime = 7;

      props.isActive = false;
      await nextTick();

      expect(video()).toBeNull();
      expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
      expect(onVideoRef).toHaveBeenLastCalledWith(null);
      expect(shared.playbackPositions.get(props.slideKey)).toBe(7);

      element.currentTime = 0;
      props.isActive = true;
      await nextTick();

      expect(video()).toBe(element);
      expect(element.currentTime).toBe(7);
    });

    it('reloads the video when the source changes while playing', async () => {
      const { props, video } = mountSlide();

      props.src = 'https://example.com/other.mp4';
      await nextTick();

      expect(video()?.src).toBe('https://example.com/other.mp4');
    });

    it('ignores a source change while inactive', async () => {
      const { props, video } = mountSlide({ isActive: false });

      props.src = 'https://example.com/other.mp4';
      await nextTick();

      expect(video()).toBeNull();
    });

    it('releases the video when it unmounts', () => {
      const onVideoRef = vi.fn();
      const { wrapper, container } = mountSlide({ onVideoRef });
      const element = container();

      wrapper.unmount();

      expect(element.querySelector('video')).toBeNull();
      expect(onVideoRef).toHaveBeenLastCalledWith(null);
    });

    // Vue may run the two slides' watchers in either order within one
    // update, so the slide losing the video must not undo the new owner.
    it('leaves the video with the slide that took it in the same update', async () => {
      const first = reactive({ isActive: true });
      const second = reactive({ isActive: false });
      const firstRef = vi.fn();
      const secondRef = vi.fn();
      const firstKey = nextKey();
      const secondKey = nextKey();
      const wrapper = mount(
        defineComponent({
          setup: () => () =>
            h(SoundProvider, null, {
              default: (): VNode[] => [
                h(VideoSlide, {
                  ...baseProps(),
                  class: 'second',
                  slideKey: secondKey,
                  isActive: second.isActive,
                  onVideoRef: secondRef,
                }),
                h(VideoSlide, {
                  ...baseProps(),
                  class: 'first',
                  slideKey: firstKey,
                  isActive: first.isActive,
                  onVideoRef: firstRef,
                }),
              ],
            }),
        }),
        { attachTo: document.body },
      );

      first.isActive = false;
      second.isActive = true;
      await nextTick();

      const secondContainer = wrapper.find('.second').element;
      expect(secondContainer.querySelector('video')).toBe(shared.getVideo());
      expect(secondRef).toHaveBeenLastCalledWith(shared.getVideo());
      expect(firstRef).not.toHaveBeenCalledWith(null);
    });
  });

  describe('timeline', () => {
    it('attaches the playing video to the timeline and detaches on leave', async () => {
      let timeline: ReturnType<typeof useTimelineState> | undefined;
      const props = reactive({ ...baseProps() });
      const video = shared.getVideo();
      Object.defineProperty(video, 'duration', {
        configurable: true,
        value: 30,
      });
      const Probe = defineComponent({
        setup() {
          timeline = useTimelineState();
          return () => h(VideoSlide, { ...props });
        },
      });
      try {
        mount(
          defineComponent({
            setup: () => () =>
              h(SoundProvider, null, {
                default: () => [
                  h(TimelineProvider, null, { default: () => [h(Probe)] }),
                ],
              }),
          }),
          { attachTo: document.body },
        );

        expect(timeline!.duration.value).toBe(30);

        props.isActive = false;
        await nextTick();

        expect(timeline!.duration.value).toBe(0);
      } finally {
        delete (video as unknown as Record<string, unknown>)['duration'];
      }
    });
  });
});
