import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSignal, SoundProvider } from '@reelkit/react';
import { VideoStorySlide, shared } from './VideoStorySlide';

let mockVideo: HTMLVideoElement;
let playSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockVideo = document.createElement('video');
  playSpy = vi.fn().mockResolvedValue(undefined);
  mockVideo.play = playSpy;
  vi.spyOn(shared, 'getVideo').mockReturnValue(mockVideo);
  vi.stubGlobal('requestAnimationFrame', (cb: () => void) => setTimeout(cb, 0));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

function renderSlide(
  overrides: Partial<React.ComponentProps<typeof VideoStorySlide>> = {},
) {
  const activeGroupIndex = createSignal(0);
  const activeStoryIndex = createSignal(0);

  return render(
    <SoundProvider>
      <VideoStorySlide
        src="video.mp4"
        groupIndex={0}
        storyIndex={0}
        activeGroupIndex={activeGroupIndex}
        activeStoryIndex={activeStoryIndex}
        {...overrides}
      />
    </SoundProvider>,
  );
}

describe('VideoStorySlide', () => {
  it('renders a container div', () => {
    const { container } = renderSlide();
    expect(container.querySelector('div')).toBeTruthy();
  });

  it('calls onPlaying when video is ready', () => {
    const onPlaying = vi.fn();
    renderSlide({ onPlaying });

    act(() => {
      mockVideo.dispatchEvent(new Event('playing'));
    });

    expect(onPlaying).toHaveBeenCalled();
  });

  it('calls onWaiting when video stalls', () => {
    const onWaiting = vi.fn();
    renderSlide({ onWaiting });

    act(() => {
      mockVideo.dispatchEvent(new Event('waiting'));
    });

    expect(onWaiting).toHaveBeenCalled();
  });

  it('calls onEnded when video ends', () => {
    const onEnded = vi.fn();
    renderSlide({ onEnded });

    act(() => {
      mockVideo.dispatchEvent(new Event('ended'));
    });

    expect(onEnded).toHaveBeenCalled();
  });

  it('calls onError when video emits error event', () => {
    const onError = vi.fn();
    renderSlide({ onError });

    act(() => {
      Object.defineProperty(mockVideo, 'error', { value: { code: 4 } });
      mockVideo.dispatchEvent(new Event('error'));
    });

    expect(onError).toHaveBeenCalled();
  });

  it('swallows play() rejection without triggering onError', async () => {
    const onError = vi.fn();
    playSpy.mockRejectedValueOnce(new Error('AbortError'));
    renderSlide({ onError });

    // play() rejection is caught by noop — should NOT trigger onError
    await new Promise((r) => setTimeout(r, 10));
    expect(onError).not.toHaveBeenCalled();
  });

  it('calls onDurationReady when metadata loads', () => {
    const onDurationReady = vi.fn();
    renderSlide({ onDurationReady });

    Object.defineProperty(mockVideo, 'duration', {
      value: 10,
      writable: true,
      configurable: true,
    });

    act(() => {
      mockVideo.dispatchEvent(new Event('loadedmetadata'));
    });

    expect(onDurationReady).toHaveBeenCalledWith(10_000);
  });

  it('appends video to container when active', () => {
    const { container } = renderSlide();
    const wrapper = container.firstElementChild!;
    expect(wrapper.contains(mockVideo)).toBe(true);
  });

  it('shows poster image when provided', () => {
    const { container } = renderSlide({ poster: 'poster.jpg' });
    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img!.src).toContain('poster.jpg');
  });
});
