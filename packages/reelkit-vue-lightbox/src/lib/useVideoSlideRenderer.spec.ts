import { mount } from '@vue/test-utils';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
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
      Array.from(wrapper.element.querySelectorAll('button')).find(
        (b) => b.title === 'Unmute' || b.title === 'Mute',
      );

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
});
