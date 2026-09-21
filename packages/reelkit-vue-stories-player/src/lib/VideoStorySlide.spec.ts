import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { createSignal, SoundProvider } from '@reelkit/vue';
import { VideoStorySlide, shared } from './VideoStorySlide';

let mockVideo: HTMLVideoElement;
let playSpy: ReturnType<typeof vi.fn<() => Promise<void>>>;

beforeEach(() => {
  mockVideo = document.createElement('video');
  playSpy = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  mockVideo.play = playSpy;
  mockVideo.pause = vi.fn();
  vi.spyOn(shared, 'getVideo').mockReturnValue(mockVideo);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function renderSlide(overrides: Record<string, unknown> = {}) {
  const activeGroupIndex = createSignal(0);
  const activeStoryIndex = createSignal(0);

  const Host = defineComponent({
    setup: () => () =>
      h(SoundProvider, null, {
        default: () =>
          h(VideoStorySlide, {
            src: 'video.mp4',
            groupIndex: 0,
            storyIndex: 0,
            activeGroupIndex,
            activeStoryIndex,
            ...overrides,
          }),
      }),
  });

  const wrapper = mount(Host, { attachTo: document.body });
  return { wrapper, activeGroupIndex, activeStoryIndex };
}

describe('VideoStorySlide', () => {
  it('renders the video container', () => {
    const { wrapper } = renderSlide();
    expect(wrapper.find('.rk-stories-video').exists()).toBe(true);
    wrapper.unmount();
  });

  it.each([
    ['playing', 'onPlaying'],
    ['waiting', 'onWaiting'],
    ['ended', 'onEnded'],
  ])('reports the %s event through %s', (event, callback) => {
    const handler = vi.fn();
    const { wrapper } = renderSlide({ [callback]: handler });
    mockVideo.dispatchEvent(new Event(event));
    expect(handler).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('calls onError when the video emits an error event', () => {
    const onError = vi.fn();
    const { wrapper } = renderSlide({ onError });
    Object.defineProperty(mockVideo, 'error', { value: { code: 4 } });
    mockVideo.dispatchEvent(new Event('error'));
    expect(onError).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('swallows a play() rejection without reporting an error', async () => {
    const onError = vi.fn();
    playSpy.mockRejectedValueOnce(new Error('AbortError'));
    const { wrapper } = renderSlide({ onError });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(onError).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('reports the duration in milliseconds when metadata loads', () => {
    const onDurationReady = vi.fn();
    const { wrapper } = renderSlide({ onDurationReady });
    Object.defineProperty(mockVideo, 'duration', {
      value: 10,
      configurable: true,
    });
    mockVideo.dispatchEvent(new Event('loadedmetadata'));
    expect(onDurationReady).toHaveBeenCalledWith(10_000);
    wrapper.unmount();
  });

  it('moves the shared video into the active slide and out when it deactivates', async () => {
    const { wrapper, activeStoryIndex } = renderSlide();
    const container = wrapper.find('.rk-stories-video').element;
    expect(container.contains(mockVideo)).toBe(true);
    expect(playSpy).toHaveBeenCalled();

    activeStoryIndex.value = 1;
    await nextTick();
    expect(container.contains(mockVideo)).toBe(false);
    expect(mockVideo.pause).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('leaves the shared video alone while another story is active', () => {
    const { wrapper } = renderSlide({ storyIndex: 1 });
    expect(wrapper.find('.rk-stories-video').element.contains(mockVideo)).toBe(
      false,
    );
    wrapper.unmount();
  });

  it('shows the poster until the video plays', async () => {
    const { wrapper } = renderSlide({ poster: 'poster.jpg' });
    const poster = () => wrapper.find('.rk-stories-video-poster');
    expect((poster().element as HTMLImageElement).src).toContain('poster.jpg');
    expect(poster().classes()).toContain('rk-stories-video-poster--visible');

    mockVideo.dispatchEvent(new Event('playing'));
    await nextTick();
    expect(poster().classes()).not.toContain(
      'rk-stories-video-poster--visible',
    );
    wrapper.unmount();
  });
});
