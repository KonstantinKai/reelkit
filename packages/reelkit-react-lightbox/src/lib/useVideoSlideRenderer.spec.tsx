import {
  renderHook,
  act,
  render,
  screen,
  fireEvent,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useVideoSlideRenderer } from './useVideoSlideRenderer';
import type { LightboxItem } from './LightboxOverlay';
import type { LightboxControlsRenderProps } from './types';

// Mock LightboxVideoSlide so we can inspect what gets rendered
const mockSetLightboxVideoMuted = vi.fn();
vi.mock('./LightboxVideoSlide', () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="mock-video-slide" data-props={JSON.stringify(props)} />
  ),
  setLightboxVideoMuted: (...args: unknown[]) =>
    mockSetLightboxVideoMuted(...args),
}));

// Mock LightboxControls so we can inspect renderControls output
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
  mockSetLightboxVideoMuted.mockClear();

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

describe('useVideoSlideRenderer', () => {
  describe('hasVideo', () => {
    it('returns false for image-only items', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(imageItems));
      expect(result.current.hasVideo).toBe(false);
    });

    it('returns true when items contain at least one video', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems));
      expect(result.current.hasVideo).toBe(true);
    });
  });

  describe('isMuted', () => {
    it('defaults to true', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems));
      expect(result.current.isMuted).toBe(true);
    });

    it('toggles on onToggleMute', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems));

      act(() => result.current.onToggleMute());
      expect(result.current.isMuted).toBe(false);

      act(() => result.current.onToggleMute());
      expect(result.current.isMuted).toBe(true);
    });
  });

  describe('renderSlide', () => {
    it('returns null for image items', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems));
      const output = result.current.renderSlide(
        mixedItems[0],
        0,
        [1024, 768],
        true,
      );
      expect(output).toBeNull();
    });

    it('returns null for items without type field', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(imageItems));
      const output = result.current.renderSlide(
        imageItems[0],
        0,
        [1024, 768],
        true,
      );
      expect(output).toBeNull();
    });

    it('returns LightboxVideoSlide for video items', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems));
      const output = result.current.renderSlide(
        mixedItems[1],
        1,
        [1024, 768],
        true,
      );
      expect(output).not.toBeNull();
    });

    it('passes correct props to LightboxVideoSlide', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems));
      const output = result.current.renderSlide(
        mixedItems[1],
        1,
        [1024, 768],
        true,
      ) as React.ReactElement;

      expect(output).not.toBeNull();
      expect(output.props).toEqual({
        src: 'video1.mp4',
        poster: 'poster1.jpg',
        isActive: true,
        size: [1024, 768],
        slideKey: 'lightbox-1',
      });
    });

    it('passes isActive=false when slide is not active', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems));
      const output = result.current.renderSlide(
        mixedItems[1],
        1,
        [1024, 768],
        false,
      ) as React.ReactElement;

      expect(output.props.isActive).toBe(false);
    });

    it('keeps stable reference when isMuted changes (no slide remount)', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems));

      const firstRenderSlide = result.current.renderSlide;

      act(() => result.current.onToggleMute());

      // renderSlide must be the same reference — otherwise itemBuilder
      // changes and Reel remounts slides, destroying the video element
      expect(result.current.renderSlide).toBe(firstRenderSlide);
    });
  });

  describe('mute sync via setLightboxVideoMuted', () => {
    it('calls setLightboxVideoMuted with initial value on mount', () => {
      renderHook(() => useVideoSlideRenderer(mixedItems));

      expect(mockSetLightboxVideoMuted).toHaveBeenCalledWith(true);
    });

    it('calls setLightboxVideoMuted when isMuted changes', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems));

      mockSetLightboxVideoMuted.mockClear();

      act(() => result.current.onToggleMute());

      expect(mockSetLightboxVideoMuted).toHaveBeenCalledWith(false);
    });

    it('calls setLightboxVideoMuted on every toggle', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems));

      mockSetLightboxVideoMuted.mockClear();

      act(() => result.current.onToggleMute());
      expect(mockSetLightboxVideoMuted).toHaveBeenCalledWith(false);

      act(() => result.current.onToggleMute());
      expect(mockSetLightboxVideoMuted).toHaveBeenCalledWith(true);
    });
  });

  describe('reset on close', () => {
    it('resets isMuted to true when isOpen becomes false', () => {
      const { result, rerender } = renderHook(
        ({ isOpen }) => useVideoSlideRenderer(mixedItems, isOpen),
        { initialProps: { isOpen: true } },
      );

      // Unmute
      act(() => result.current.onToggleMute());
      expect(result.current.isMuted).toBe(false);

      // Close lightbox
      rerender({ isOpen: false });
      expect(result.current.isMuted).toBe(true);
    });

    it('calls setLightboxVideoMuted(true) when isOpen becomes false', () => {
      const { result, rerender } = renderHook(
        ({ isOpen }) => useVideoSlideRenderer(mixedItems, isOpen),
        { initialProps: { isOpen: true } },
      );

      act(() => result.current.onToggleMute());
      mockSetLightboxVideoMuted.mockClear();

      rerender({ isOpen: false });
      expect(mockSetLightboxVideoMuted).toHaveBeenCalledWith(true);
    });

    it('does not reset when isOpen is not provided', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems));

      act(() => result.current.onToggleMute());
      expect(result.current.isMuted).toBe(false);
      // No reset since isOpen is not tracked
    });
  });

  describe('renderControls', () => {
    const controlsProps: LightboxControlsRenderProps = {
      onClose: vi.fn(),
      currentIndex: 2,
      count: 5,
      isFullscreen: false,
      onToggleFullscreen: vi.fn(),
    };

    it('renders Counter with correct props', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems));
      const { container } = render(
        <>{result.current.renderControls(controlsProps)}</>,
      );

      expect(screen.getByTestId('counter')).toBeTruthy();
      expect(screen.getByTestId('counter').textContent).toBe('3 / 5');
      expect(
        container.querySelector('.rk-lightbox-controls-left'),
      ).toBeTruthy();
    });

    it('renders CloseButton that calls onClose', () => {
      const onClose = vi.fn();
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems));
      render(
        <>{result.current.renderControls({ ...controlsProps, onClose })}</>,
      );

      fireEvent.click(screen.getByTestId('close-btn'));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('renders FullscreenButton with correct state', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems));
      render(
        <>
          {result.current.renderControls({
            ...controlsProps,
            isFullscreen: false,
          })}
        </>,
      );

      expect(screen.getByTestId('fullscreen-btn').textContent).toBe(
        'Enter Fullscreen',
      );
    });

    it('renders FullscreenButton in fullscreen state', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems));
      render(
        <>
          {result.current.renderControls({
            ...controlsProps,
            isFullscreen: true,
          })}
        </>,
      );

      expect(screen.getByTestId('fullscreen-btn').textContent).toBe(
        'Exit Fullscreen',
      );
    });

    it('renders SoundButton when items contain video', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems));
      render(<>{result.current.renderControls(controlsProps)}</>);

      expect(screen.getByTestId('sound-btn')).toBeTruthy();
      expect(screen.getByTestId('sound-btn').textContent).toBe('Unmute');
    });

    it('does not render SoundButton for image-only items', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(imageItems));
      render(<>{result.current.renderControls(controlsProps)}</>);

      expect(screen.queryByTestId('sound-btn')).toBeNull();
    });

    it('SoundButton reflects muted state after toggle', () => {
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems));

      act(() => result.current.onToggleMute());

      const { unmount } = render(
        <>{result.current.renderControls(controlsProps)}</>,
      );

      expect(screen.getByTestId('sound-btn').textContent).toBe('Mute');
      unmount();
    });

    it('FullscreenButton calls onToggleFullscreen', () => {
      const onToggleFullscreen = vi.fn();
      const { result } = renderHook(() => useVideoSlideRenderer(mixedItems));
      render(
        <>
          {result.current.renderControls({
            ...controlsProps,
            onToggleFullscreen,
          })}
        </>,
      );

      fireEvent.click(screen.getByTestId('fullscreen-btn'));
      expect(onToggleFullscreen).toHaveBeenCalledOnce();
    });
  });
});
