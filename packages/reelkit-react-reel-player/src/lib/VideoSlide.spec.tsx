import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SoundProvider } from '@reelkit/react';
import VideoSlide from './VideoSlide';

// Mock play/pause on HTMLVideoElement
const mockPlay = vi.fn().mockResolvedValue(undefined);
const mockPause = vi.fn();

beforeEach(() => {
  // Mock createElement for video elements
  const origCreateElement = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation(
    (tag: string, options?: ElementCreationOptions) => {
      const el = origCreateElement(tag, options);
      if (tag === 'video') {
        Object.defineProperty(el, 'play', {
          value: mockPlay,
          writable: true,
          configurable: true,
        });
        Object.defineProperty(el, 'pause', {
          value: mockPause,
          writable: true,
          configurable: true,
        });
        Object.defineProperty(el, 'videoWidth', {
          value: 1920,
          writable: true,
          configurable: true,
        });
        Object.defineProperty(el, 'videoHeight', {
          value: 1080,
          writable: true,
          configurable: true,
        });
      }
      return el;
    },
  );

  mockPlay.mockClear();
  mockPause.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Helper to render with SoundProvider
const renderWithSound = (ui: React.ReactElement) =>
  render(<SoundProvider>{ui}</SoundProvider>);

describe('VideoSlide', () => {
  describe('rendering', () => {
    it('renders container with correct dimensions', () => {
      const { container } = renderWithSound(
        <VideoSlide
          src="video.mp4"
          aspectRatio={0.56}
          size={[400, 700]}
          isActive={false}
          slideKey="test-render-1"
        />,
      );

      const wrapper = container.querySelector(
        '.rk-reel-video-container',
      ) as HTMLElement;
      expect(wrapper.style.width).toBe('400px');
      expect(wrapper.style.height).toBe('700px');
    });

    it('shows poster image when provided', () => {
      const { container } = renderWithSound(
        <VideoSlide
          src="video.mp4"
          poster="poster.jpg"
          aspectRatio={0.56}
          size={[400, 700]}
          isActive={false}
          slideKey="test-render-2"
        />,
      );

      const poster = container.querySelector(
        '.rk-reel-video-poster',
      ) as HTMLElement;
      expect(poster).toBeTruthy();
      expect(poster.getAttribute('src')).toBe('poster.jpg');
    });

    it('does not render poster when none provided', () => {
      const { container } = renderWithSound(
        <VideoSlide
          src="video.mp4"
          aspectRatio={0.56}
          size={[400, 700]}
          isActive={false}
          slideKey="test-render-3"
        />,
      );

      const poster = container.querySelector('.rk-reel-video-poster');
      expect(poster).toBeNull();
    });
  });

  describe('playback', () => {
    it('appends video element when active', () => {
      const { container } = renderWithSound(
        <VideoSlide
          src="video.mp4"
          aspectRatio={0.56}
          size={[400, 700]}
          isActive={true}
          slideKey="test-play-1"
        />,
      );

      const videoContainer = container.querySelector(
        '.rk-reel-video-container',
      )!;
      const video = videoContainer.querySelector('video');
      expect(video).toBeTruthy();
    });

    it('does not append video element when inactive', () => {
      const { container } = renderWithSound(
        <VideoSlide
          src="video.mp4"
          aspectRatio={0.56}
          size={[400, 700]}
          isActive={false}
          slideKey="test-play-2"
        />,
      );

      const videoContainer = container.querySelector(
        '.rk-reel-video-container',
      )!;
      const video = videoContainer.querySelector('video');
      expect(video).toBeNull();
    });

    it('calls play when becoming active', () => {
      renderWithSound(
        <VideoSlide
          src="video.mp4"
          aspectRatio={0.56}
          size={[400, 700]}
          isActive={true}
          slideKey="test-play-3"
        />,
      );

      expect(mockPlay).toHaveBeenCalled();
    });

    it('removes video element on unmount', () => {
      const { container, unmount } = renderWithSound(
        <VideoSlide
          src="video.mp4"
          aspectRatio={0.56}
          size={[400, 700]}
          isActive={true}
          slideKey="test-play-4"
        />,
      );

      const videoContainer = container.querySelector(
        '.rk-reel-video-container',
      )!;
      expect(videoContainer.querySelector('video')).toBeTruthy();

      unmount();

      expect(videoContainer.querySelector('video')).toBeNull();
    });
  });

  describe('ref reporting', () => {
    it('calls onVideoRef with element when active', () => {
      const onVideoRef = vi.fn();

      renderWithSound(
        <VideoSlide
          src="video.mp4"
          aspectRatio={0.56}
          size={[400, 700]}
          isActive={true}
          slideKey="test-ref-1"
          onVideoRef={onVideoRef}
        />,
      );

      expect(onVideoRef).toHaveBeenCalledWith(expect.any(HTMLVideoElement));
    });

    it('calls onVideoRef with null on cleanup', () => {
      const onVideoRef = vi.fn();

      const { unmount } = renderWithSound(
        <VideoSlide
          src="video.mp4"
          aspectRatio={0.56}
          size={[400, 700]}
          isActive={true}
          slideKey="test-ref-2"
          onVideoRef={onVideoRef}
        />,
      );

      unmount();

      expect(onVideoRef).toHaveBeenCalledWith(null);
    });
  });

  describe('loading callbacks', () => {
    it('calls onReady when playing event fires', () => {
      const onReady = vi.fn();
      const { container } = renderWithSound(
        <VideoSlide
          src="video.mp4"
          aspectRatio={0.56}
          size={[400, 700]}
          isActive={true}
          slideKey="test-cb-1"
          onReady={onReady}
        />,
      );

      const video = container.querySelector('video')!;
      act(() => video.dispatchEvent(new Event('playing')));
      expect(onReady).toHaveBeenCalled();
    });

    it('calls onReady when canplay event fires', () => {
      const onReady = vi.fn();
      const { container } = renderWithSound(
        <VideoSlide
          src="video.mp4"
          aspectRatio={0.56}
          size={[400, 700]}
          isActive={true}
          slideKey="test-cb-2"
          onReady={onReady}
        />,
      );

      const video = container.querySelector('video')!;
      video.dispatchEvent(new Event('playing'));
      expect(onReady).toHaveBeenCalled();
    });

    it('calls onWaiting when waiting event fires', () => {
      const onWaiting = vi.fn();
      const { container } = renderWithSound(
        <VideoSlide
          src="video.mp4"
          aspectRatio={0.56}
          size={[400, 700]}
          isActive={true}
          slideKey="test-cb-3"
          onWaiting={onWaiting}
        />,
      );

      const video = container.querySelector('video')!;
      act(() => video.dispatchEvent(new Event('waiting')));
      expect(onWaiting).toHaveBeenCalled();
    });

    it('does not call callbacks when inactive', () => {
      const onReady = vi.fn();
      const onWaiting = vi.fn();
      renderWithSound(
        <VideoSlide
          src="video.mp4"
          aspectRatio={0.56}
          size={[400, 700]}
          isActive={false}
          slideKey="test-cb-4"
          onReady={onReady}
          onWaiting={onWaiting}
        />,
      );

      expect(onReady).not.toHaveBeenCalled();
      expect(onWaiting).not.toHaveBeenCalled();
    });
  });

  describe('aspect ratio', () => {
    it('uses cover object-fit for vertical video (auto-detected from metadata)', () => {
      // Redefine the shared mock video's dimensions to portrait BEFORE
      // rendering, so `syncObjectFit` reads `videoWidth`/`videoHeight`
      // and switches to 'cover' when height > width.
      const { container } = renderWithSound(
        <VideoSlide
          src="video.mp4"
          aspectRatio={0.56}
          size={[400, 700]}
          isActive={true}
          slideKey="test-aspect-1"
        />,
      );

      const video = container.querySelector('video')!;
      Object.defineProperty(video, 'videoWidth', {
        value: 720,
        configurable: true,
      });
      Object.defineProperty(video, 'videoHeight', {
        value: 1280,
        configurable: true,
      });
      act(() => video.dispatchEvent(new Event('loadedmetadata')));
      expect(video.style.objectFit).toBe('cover');
    });

    it('uses contain object-fit for horizontal video (auto-detected from metadata)', () => {
      // The shared video element is a singleton across tests, so previous
      // tests may have mutated its dimensions. Redefine to horizontal
      // explicitly before asserting.
      const { container } = renderWithSound(
        <VideoSlide
          src="video.mp4"
          aspectRatio={1.78}
          size={[400, 700]}
          isActive={true}
          slideKey="test-aspect-2"
        />,
      );

      const video = container.querySelector('video')!;
      Object.defineProperty(video, 'videoWidth', {
        value: 1920,
        configurable: true,
      });
      Object.defineProperty(video, 'videoHeight', {
        value: 1080,
        configurable: true,
      });
      act(() => video.dispatchEvent(new Event('loadedmetadata')));
      expect(video.style.objectFit).toBe('contain');
    });
  });
});
