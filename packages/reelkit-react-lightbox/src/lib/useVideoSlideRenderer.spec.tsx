import { renderHook, render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SoundProvider } from '@reelkit/react';
import { useVideoSlideRenderer } from './useVideoSlideRenderer';
import type { LightboxItem } from './types';
import type { ControlsRenderProps } from './types';

vi.mock('./LightboxVideoSlide', () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="mock-video-slide" data-props={JSON.stringify(props)} />
  ),
}));

vi.mock('./LightboxControls', () => ({
  Counter: ({
    currentIndex,
    count,
  }: {
    currentIndex: number;
    count: number;
  }) => (
    <span data-testid="counter">
      {currentIndex + 1} / {count}
    </span>
  ),
  CloseButton: ({ onClick }: { onClick: () => void }) => (
    <button data-testid="close-btn" onClick={onClick}>
      Close
    </button>
  ),
  FullscreenButton: ({
    isFullscreen,
    onToggle,
  }: {
    isFullscreen: boolean;
    onToggle: () => void;
  }) => (
    <button data-testid="fullscreen-btn" onClick={onToggle}>
      {isFullscreen ? 'Exit' : 'Enter'} Fullscreen
    </button>
  ),
  SoundButton: ({
    isMuted,
    onToggle,
  }: {
    isMuted: boolean;
    onToggle: () => void;
  }) => (
    <button data-testid="sound-btn" onClick={onToggle}>
      {isMuted ? 'Unmute' : 'Mute'}
    </button>
  ),
  PlayPauseButton: ({
    isPlaying,
    onToggle,
  }: {
    isPlaying: boolean;
    onToggle: () => void;
  }) => (
    <button data-testid="play-pause-btn" onClick={onToggle}>
      {isPlaying ? 'Pause' : 'Play'}
    </button>
  ),
  DownloadButton: ({ onClick }: { onClick: () => void }) => (
    <button data-testid="download-btn" onClick={onClick}>
      Download
    </button>
  ),
}));

const imageItems: LightboxItem[] = [
  { src: 'img1.jpg', title: 'Image 1' },
  { src: 'img2.jpg', title: 'Image 2' },
];

const mixedItems: LightboxItem[] = [
  { src: 'img1.jpg', title: 'Image 1' },
  {
    src: 'video1.mp4',
    type: 'video',
    poster: 'poster1.jpg',
    title: 'Video 1',
  },
  { src: 'img2.jpg', title: 'Image 2' },
  { src: 'video2.mp4', type: 'video', title: 'Video 2' },
];

beforeEach(() => {
  const origCreateElement = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation(
    (tag: string, options?: ElementCreationOptions) => {
      const el = origCreateElement(tag, options);
      if (tag === 'video') {
        Object.defineProperty(el, 'play', {
          value: vi.fn().mockResolvedValue(undefined),
          writable: true,
          configurable: true,
        });
      }
      return el;
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SoundProvider>{children}</SoundProvider>
);

describe('useVideoSlideRenderer', () => {
  describe('hasVideo', () => {
    it('returns false for image-only items', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(imageItems), {
        wrapper,
      });
      expect(result.current.hasVideo).toBe(false);
    });

    it('returns true when items contain at least one video', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems), {
        wrapper,
      });
      expect(result.current.hasVideo).toBe(true);
    });
  });

  describe('SoundProvider', () => {
    it('returns SoundProvider', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems), {
        wrapper,
      });
      expect(result.current.SoundProvider).toBe(SoundProvider);
    });
  });

  describe('renderSlide', () => {
    it('returns null for image items', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems), {
        wrapper,
      });
      const output = result.current.renderSlide({
        item: mixedItems[0],
        index: 0,
        size: [1024, 768],
        isActive: true,
        autoAdvance: false,
        onReady: vi.fn(),
        onWaiting: vi.fn(),
        onError: vi.fn(),
        onEnded: vi.fn(),
      });
      expect(output).toBeNull();
    });

    it('returns LightboxVideoSlide for video items', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems), {
        wrapper,
      });
      const output = result.current.renderSlide({
        item: mixedItems[1],
        index: 1,
        size: [1024, 768],
        isActive: true,
        autoAdvance: false,
        onReady: vi.fn(),
        onWaiting: vi.fn(),
        onError: vi.fn(),
        onEnded: vi.fn(),
      });
      expect(output).not.toBeNull();
    });

    it.each([
      [false, true],
      [true, false],
    ])(
      'loops the video slide when auto-advance is %s: %s',
      (autoAdvance, loop) => {
        const { result } = renderHook(() => useVideoSlideRenderer(mixedItems), {
          wrapper,
        });
        render(
          <>
            {result.current.renderSlide({
              item: mixedItems[1],
              index: 1,
              size: [1024, 768],
              isActive: true,
              autoAdvance,
              onReady: vi.fn(),
              onWaiting: vi.fn(),
              onError: vi.fn(),
              onEnded: vi.fn(),
            })}
          </>,
        );

        const props = JSON.parse(
          screen.getByTestId('mock-video-slide').dataset['props'] ?? '{}',
        );
        expect(props.loop).toBe(loop);
      },
    );
  });

  describe('renderControls', () => {
    const controlsProps: ControlsRenderProps = {
      item: mixedItems[2],
      onClose: vi.fn(),
      activeIndex: 2,
      count: 5,
      isFullscreen: false,
      isAutoAdvancing: false,
      isDownloading: false,
      onToggleFullscreen: vi.fn(),
    };

    it('shows the slideshow and download buttons only when their handlers are given', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems), {
        wrapper,
      });
      const { rerender } = render(
        <SoundProvider>
          {result.current.renderControls(controlsProps)}
        </SoundProvider>,
      );
      expect(screen.queryByTestId('play-pause-btn')).toBeNull();
      expect(screen.queryByTestId('download-btn')).toBeNull();

      const onToggleAutoAdvance = vi.fn();
      const onDownload = vi.fn();
      rerender(
        <SoundProvider>
          {result.current.renderControls({
            ...controlsProps,
            isAutoAdvancing: true,
            onToggleAutoAdvance,
            onDownload,
          })}
        </SoundProvider>,
      );
      fireEvent.click(screen.getByTestId('play-pause-btn'));
      fireEvent.click(screen.getByTestId('download-btn'));

      expect(screen.getByTestId('play-pause-btn').textContent).toBe('Pause');
      expect(onToggleAutoAdvance).toHaveBeenCalledOnce();
      expect(onDownload).toHaveBeenCalledOnce();
    });

    it('renders Counter with correct props', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems), {
        wrapper,
      });
      render(
        <SoundProvider>
          {result.current.renderControls(controlsProps)}
        </SoundProvider>,
      );

      expect(screen.getByTestId('counter').textContent).toBe('3 / 5');
    });

    it('renders SoundButton when current slide is a video', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems), {
        wrapper,
      });
      render(
        <SoundProvider>
          {result.current.renderControls({ ...controlsProps, activeIndex: 1 })}
        </SoundProvider>,
      );

      expect(screen.getByTestId('sound-btn')).toBeTruthy();
      expect(screen.getByTestId('sound-btn').textContent).toBe('Unmute');
    });

    it('does not render SoundButton for image-only items', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(imageItems), {
        wrapper,
      });
      render(
        <SoundProvider>
          {result.current.renderControls(controlsProps)}
        </SoundProvider>,
      );

      expect(screen.queryByTestId('sound-btn')).toBeNull();
    });

    it('does not render SoundButton when current slide is an image', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems), {
        wrapper,
      });
      render(
        <SoundProvider>
          {result.current.renderControls({ ...controlsProps, activeIndex: 0 })}
        </SoundProvider>,
      );

      expect(screen.queryByTestId('sound-btn')).toBeNull();
    });

    it('renders CloseButton that calls onClose', () => {
      const onClose = vi.fn();
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems), {
        wrapper,
      });
      render(
        <SoundProvider>
          {result.current.renderControls({ ...controlsProps, onClose })}
        </SoundProvider>,
      );

      fireEvent.click(screen.getByTestId('close-btn'));
      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});
