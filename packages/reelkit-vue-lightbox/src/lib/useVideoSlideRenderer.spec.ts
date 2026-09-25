import { mount } from '@vue/test-utils';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { useSoundState } from '@reelkit/vue';
import { useVideoSlideRenderer } from './useVideoSlideRenderer';
import type { LightboxItem } from './types';

// jsdom does not implement HTMLMediaElement.play/pause. Stub them so the
// video slide's activation flow doesn't throw.
beforeAll(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() =>
    Promise.resolve(),
  );
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(
    () => undefined,
  );
});

const imageOnly: LightboxItem[] = [
  { src: 'https://example.com/a.jpg' },
  { src: 'https://example.com/b.jpg' },
];

const mixed: LightboxItem[] = [
  { src: 'https://example.com/a.jpg' },
  {
    type: 'video',
    src: 'https://example.com/clip.mp4',
    poster: 'https://example.com/poster.jpg',
  },
];

afterEach(() => {
  document.body.innerHTML = '';
});

describe('useVideoSlideRenderer', () => {
  it('hasVideo is false for image-only items', () => {
    const Host = defineComponent({
      setup(_, { expose }) {
        const result = useVideoSlideRenderer(imageOnly);
        expose({ result });
        return () => h('div');
      },
    });
    const wrapper = mount(Host);
    expect(
      (wrapper.vm as unknown as { result: { hasVideo: { value: boolean } } })
        .result.hasVideo.value,
    ).toBe(false);
  });

  it('hasVideo is true when any item is a video', () => {
    const Host = defineComponent({
      setup(_, { expose }) {
        const result = useVideoSlideRenderer(mixed);
        expose({ result });
        return () => h('div');
      },
    });
    const wrapper = mount(Host);
    expect(
      (wrapper.vm as unknown as { result: { hasVideo: { value: boolean } } })
        .result.hasVideo.value,
    ).toBe(true);
  });

  it('VideoSlideRenderer renders the default image slide for image items', () => {
    const Host = defineComponent({
      setup() {
        const { VideoSlideRenderer, SoundProvider } =
          useVideoSlideRenderer(imageOnly);
        return () =>
          h(SoundProvider, null, {
            default: () => [
              h(VideoSlideRenderer, {
                item: imageOnly[0],
                index: 0,
                size: [100, 100] as [number, number],
                isActive: true,
                onReady: () => undefined,
                onWaiting: () => undefined,
                onError: () => undefined,
              }),
            ],
          });
      },
    });
    const wrapper = mount(Host, { attachTo: document.body });
    // Self-sufficient renderer: emits an <img> directly instead of
    // relying on the overlay's slot fallback.
    expect(
      wrapper.element.querySelector('.rk-lightbox-video-container'),
    ).toBeNull();
    const img = wrapper.element.querySelector('img.rk-lightbox-img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe(imageOnly[0].src);
  });

  it('VideoControlsRenderer sound button icon+title stay reactive to SoundController.muted toggles', async () => {
    type SoundCtl = ReturnType<typeof useSoundState>;
    let captured: SoundCtl | undefined;

    const Host = defineComponent({
      setup() {
        const { VideoControlsRenderer, SoundProvider } =
          useVideoSlideRenderer(mixed);
        const Inner = defineComponent({
          setup() {
            captured = useSoundState();
            return () =>
              h(VideoControlsRenderer, {
                item: mixed[1],
                activeIndex: 1,
                count: mixed.length,
                isFullscreen: false,
                onClose: () => undefined,
                onToggleFullscreen: () => undefined,
              });
          },
        });
        return () => h(SoundProvider, null, { default: () => [h(Inner)] });
      },
    });

    const wrapper = mount(Host, { attachTo: document.body });
    const soundBtn = () =>
      Array.from(
        (wrapper.element as HTMLElement).querySelectorAll('button'),
      ).find((b) => b.title === 'Unmute' || b.title === 'Mute');

    expect(soundBtn()?.title).toBe('Unmute');
    captured!.toggle();
    await nextTick();
    expect(soundBtn()?.title).toBe('Mute');
    captured!.toggle();
    await nextTick();
    expect(soundBtn()?.title).toBe('Unmute');
  });

  it('VideoSlideRenderer mounts the video container for video items', () => {
    const Host = defineComponent({
      setup() {
        const { VideoSlideRenderer, SoundProvider } =
          useVideoSlideRenderer(mixed);
        return () =>
          h(SoundProvider, null, {
            default: () => [
              h(VideoSlideRenderer, {
                item: mixed[1],
                index: 1,
                size: [100, 100] as [number, number],
                isActive: true,
                onReady: () => undefined,
                onWaiting: () => undefined,
                onError: () => undefined,
              }),
            ],
          });
      },
    });
    const wrapper = mount(Host, { attachTo: document.body });
    expect(
      wrapper.element.querySelector('.rk-lightbox-video-container'),
    ).not.toBeNull();
  });

  it('VideoControlsRenderer leaves the next session muted once it unmounts', async () => {
    type SoundCtl = ReturnType<typeof useSoundState>;
    let captured: SoundCtl | undefined;
    const showControls = ref(true);

    const Host = defineComponent({
      setup() {
        const { VideoControlsRenderer, SoundProvider } =
          useVideoSlideRenderer(mixed);
        const Inner = defineComponent({
          setup() {
            captured = useSoundState();
            return () =>
              showControls.value
                ? h(VideoControlsRenderer, {
                    item: mixed[1],
                    activeIndex: 1,
                    count: mixed.length,
                    isFullscreen: false,
                    onClose: () => undefined,
                    onToggleFullscreen: () => undefined,
                  })
                : null;
          },
        });
        return () => h(SoundProvider, null, { default: () => [h(Inner)] });
      },
    });

    mount(Host, { attachTo: document.body });
    captured!.toggle();
    expect(captured!.muted.value).toBe(false);

    showControls.value = false;
    await nextTick();
    expect(captured!.muted.value).toBe(true);
  });
});

describe('LightboxVideoSlide through VideoSlideRenderer', () => {
  const videoItem = mixed[1];

  const mountVideo = (
    options: {
      isActive?: boolean;
      index?: number;
      onReady?: () => void;
      onWaiting?: () => void;
      onError?: () => void;
    } = {},
  ) => {
    const isActive = ref(options.isActive ?? true);
    const Host = defineComponent({
      setup() {
        const { VideoSlideRenderer, SoundProvider } =
          useVideoSlideRenderer(mixed);
        return () =>
          h(SoundProvider, null, {
            default: () => [
              h(VideoSlideRenderer, {
                item: videoItem,
                index: options.index ?? 1,
                size: [100, 100] as [number, number],
                isActive: isActive.value,
                onReady: options.onReady ?? (() => undefined),
                onWaiting: options.onWaiting ?? (() => undefined),
                onError: options.onError ?? (() => undefined),
              }),
            ],
          });
      },
    });
    const wrapper = mount(Host, { attachTo: document.body });
    const container = () =>
      wrapper.element.querySelector(
        '.rk-lightbox-video-container',
      ) as HTMLElement;
    const video = () => container().querySelector('video');
    const poster = () =>
      container().querySelector('.rk-lightbox-video-poster') as HTMLElement;
    return { wrapper, isActive, container, video, poster };
  };

  it('plays the shared video inside the active slide with the item source', () => {
    const { video } = mountVideo();

    expect(video()).not.toBeNull();
    expect(video()?.getAttribute('src') ?? video()?.src).toBe(videoItem.src);
    expect(video()?.style.objectFit).toBe('contain');
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it('keeps the video out of an inactive slide and shows its poster', () => {
    const { video, poster } = mountVideo({ isActive: false });

    expect(video()).toBeNull();
    expect(poster().getAttribute('src')).toBe(videoItem.poster);
    expect(poster().classList.contains('rk-visible')).toBe(true);
  });

  it('reports ready and hides the poster once playback starts', async () => {
    const onReady = vi.fn();
    const { video, poster } = mountVideo({ onReady, index: 11 });

    expect(poster().classList.contains('rk-visible')).toBe(true);
    video()!.dispatchEvent(new Event('playing'));
    await nextTick();

    expect(onReady).toHaveBeenCalled();
    expect(poster().classList.contains('rk-visible')).toBe(false);
  });

  it('reports buffering when the video stalls', () => {
    const onWaiting = vi.fn();
    const { video } = mountVideo({ onWaiting });

    video()!.dispatchEvent(new Event('waiting'));

    expect(onWaiting).toHaveBeenCalledTimes(1);
  });

  it('reports an error when the video fails to load', () => {
    const onError = vi.fn();
    const { video } = mountVideo({ onError });
    const element = video()!;
    Object.defineProperty(element, 'error', {
      configurable: true,
      value: { code: 4 },
    });

    element.dispatchEvent(new Event('error'));
    // The shared element outlives this slide, so the stub must not leak into
    // the next test.
    delete (element as unknown as Record<string, unknown>)['error'];

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('ignores an error event that carries no media error', () => {
    const onError = vi.fn();
    const { video } = mountVideo({ onError });

    video()!.dispatchEvent(new Event('error'));

    expect(onError).not.toHaveBeenCalled();
  });

  it('reports an error when playback is refused', async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockReturnValueOnce(
      Promise.reject(new Error('NotAllowedError')),
    );
    const onError = vi.fn();
    mountVideo({ onError });
    await Promise.resolve();
    await Promise.resolve();

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('hands the video back and resumes from the saved position', async () => {
    const { isActive, video } = mountVideo({ index: 7 });
    const element = video()!;
    element.currentTime = 12;

    isActive.value = false;
    await nextTick();
    expect(video()).toBeNull();

    element.currentTime = 0;
    isActive.value = true;
    await nextTick();
    expect(video()).toBe(element);
    expect(element.currentTime).toBe(12);
  });
});
