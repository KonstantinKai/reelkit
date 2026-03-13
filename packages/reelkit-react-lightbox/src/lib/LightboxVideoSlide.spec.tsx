import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LightboxVideoSlide, {
  setLightboxVideoMuted,
} from './LightboxVideoSlide';

const mockPlay = vi.fn().mockResolvedValue(undefined);
const mockPause = vi.fn();

beforeEach(() => {
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

  // Reset muted state to default before each test
  setLightboxVideoMuted(true);
  mockPlay.mockClear();
  mockPause.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LightboxVideoSlide', () => {
  describe('rendering', () => {
    it('renders container with correct dimensions', () => {
      const { container } = render(
        <LightboxVideoSlide
          src="video.mp4"
          isActive={false}
          size={[1024, 768]}
          slideKey="test-1"
        />,
      );

      const wrapper = container.querySelector(
        '.rk-lightbox-video-container',
      ) as HTMLElement;
      expect(wrapper.style.width).toBe('1024px');
      expect(wrapper.style.height).toBe('768px');
    });

    it('shows poster image when provided', () => {
      const { container } = render(
        <LightboxVideoSlide
          src="video.mp4"
          poster="poster.jpg"
          isActive={false}
          size={[1024, 768]}
          slideKey="test-2"
        />,
      );

      const poster = container.querySelector(
        '.rk-lightbox-video-poster',
      ) as HTMLElement;
      expect(poster).toBeTruthy();
      expect(poster.getAttribute('src')).toBe('poster.jpg');
    });

    it('does not render poster when none provided', () => {
      const { container } = render(
        <LightboxVideoSlide
          src="video.mp4"
          isActive={false}
          size={[1024, 768]}
          slideKey="test-3"
        />,
      );

      const poster = container.querySelector('.rk-lightbox-video-poster');
      expect(poster).toBeNull();
    });

    it('shows wave loader element', () => {
      const { container } = render(
        <LightboxVideoSlide
          src="video.mp4"
          isActive={false}
          size={[1024, 768]}
          slideKey="test-4"
        />,
      );

      const loader = container.querySelector('.rk-lightbox-video-loader');
      expect(loader).toBeTruthy();
    });
  });

  describe('playback', () => {
    it('appends video element when active', () => {
      const { container } = render(
        <LightboxVideoSlide
          src="video.mp4"
          isActive={true}
          size={[1024, 768]}
          slideKey="test-play-1"
        />,
      );

      const videoContainer = container.querySelector(
        '.rk-lightbox-video-container',
      )!;
      const video = videoContainer.querySelector('video');
      expect(video).toBeTruthy();
    });

    it('does not append video element when inactive', () => {
      const { container } = render(
        <LightboxVideoSlide
          src="video.mp4"
          isActive={false}
          size={[1024, 768]}
          slideKey="test-play-2"
        />,
      );

      const videoContainer = container.querySelector(
        '.rk-lightbox-video-container',
      )!;
      const video = videoContainer.querySelector('video');
      expect(video).toBeNull();
    });

    it('calls play when becoming active', () => {
      render(
        <LightboxVideoSlide
          src="video.mp4"
          isActive={true}
          size={[1024, 768]}
          slideKey="test-play-3"
        />,
      );

      expect(mockPlay).toHaveBeenCalled();
    });

    it('removes video element on unmount', () => {
      const { container, unmount } = render(
        <LightboxVideoSlide
          src="video.mp4"
          isActive={true}
          size={[1024, 768]}
          slideKey="test-play-4"
        />,
      );

      const videoContainer = container.querySelector(
        '.rk-lightbox-video-container',
      )!;
      expect(videoContainer.querySelector('video')).toBeTruthy();

      unmount();

      expect(videoContainer.querySelector('video')).toBeNull();
    });
  });

  describe('setLightboxVideoMuted', () => {
    it('sets video.muted on the shared element immediately', () => {
      const { container } = render(
        <LightboxVideoSlide
          src="video.mp4"
          isActive={true}
          size={[1024, 768]}
          slideKey="test-mute-1"
        />,
      );

      const video = container.querySelector('video')!;
      expect(video.muted).toBe(true);

      setLightboxVideoMuted(false);
      expect(video.muted).toBe(false);

      setLightboxVideoMuted(true);
      expect(video.muted).toBe(true);
    });

    it('applies muted state when video becomes active after setLightboxVideoMuted', () => {
      // Set unmuted before rendering
      setLightboxVideoMuted(false);

      const { container } = render(
        <LightboxVideoSlide
          src="video.mp4"
          isActive={true}
          size={[1024, 768]}
          slideKey="test-mute-2"
        />,
      );

      const video = container.querySelector('video')!;
      expect(video.muted).toBe(false);
    });
  });

  describe('object-fit', () => {
    it('always uses contain for object-fit', () => {
      const { container } = render(
        <LightboxVideoSlide
          src="video.mp4"
          isActive={true}
          size={[1024, 768]}
          slideKey="test-fit-1"
        />,
      );

      const video = container.querySelector('video')!;
      expect(video.style.objectFit).toBe('contain');
    });
  });
});
