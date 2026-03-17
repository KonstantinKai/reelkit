import React, {
  type CSSProperties,
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { createSignal, noop } from '@reelkit/core';
import { Observe } from '@reelkit/react';
import { useSoundState } from './useSoundState';
import './VideoSlide.css';

/**
 * Props for the {@link VideoSlide} component.
 */
export interface VideoSlideProps {
  /** URL of the video source. */
  src: string;

  /** Optional poster image shown while video loads. */
  poster?: string;

  /** Width / height ratio. Values < 1 use `cover`, >= 1 use `contain`. */
  aspectRatio: number;

  /** [width, height] in pixels. */
  size: [number, number];

  /** Whether this slide is the active (visible) slide in the parent reel. */
  isActive: boolean;

  /** Whether this slide is the active item in a nested horizontal slider. Defaults to `true`. */
  isInnerActive?: boolean;

  /** Unique key for persisting playback position and captured frames (e.g. "content-5" or "content-5:media-2"). */
  slideKey: string;

  /** Callback to report the shared video element ref to the parent for drag pause/resume. */
  onVideoRef?: (ref: HTMLVideoElement | null) => void;

  /** Additional CSS class for the root container. */
  className?: string;

  /** Additional inline styles merged onto the root container. */
  style?: CSSProperties;
}

/**
 * Shared video element for iOS sound continuity.
 *
 * iOS only allows autoplay with sound if the user has interacted with the
 * video element. By reusing the same element across slides, the unmuted
 * state persists through slide changes.
 */
let sharedVideo: HTMLVideoElement | null = null;

/** Playback positions per slideKey, restored when returning to a slide. */
const playbackPositions = new Map<string, number>();

/** Captured video frames per slideKey, used as poster when returning. */
const capturedFrames = new Map<string, string>();

/**
 * Captures the current video frame as a JPEG data URL.
 * Returns `null` on cross-origin errors or if the video has no dimensions.
 */
const captureFrame = (video: HTMLVideoElement): string | null => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx || video.videoWidth === 0) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch {
    // Cross-origin or other error
    return null;
  }
};

const getSharedVideo = (): HTMLVideoElement => {
  if (!sharedVideo) {
    sharedVideo = document.createElement('video');
    sharedVideo.playsInline = true;
    sharedVideo.loop = true;
    sharedVideo.preload = 'auto';
    sharedVideo.muted = true;
    sharedVideo.autoplay = true;
    sharedVideo.disableRemotePlayback = true;
    sharedVideo.disablePictureInPicture = true;
    sharedVideo.crossOrigin = 'anonymous';
    sharedVideo.className = 'rk-video-slide-element';
  }
  return sharedVideo;
};

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Renders a single video slide using a shared `<video>` element for iOS
 * sound continuity. Manages playback lifecycle (play/pause on
 * active state), persists playback position, and captures poster frames
 * on deactivation for seamless visual transitions.
 *
 * Shows a poster image and a wave loader while the video is buffering.
 *
 * Must be rendered inside a {@link SoundProvider}.
 *
 * @example
 * ```tsx
 * <VideoSlide
 *   src="/video.mp4"
 *   poster="/thumb.jpg"
 *   aspectRatio={9 / 16}
 *   size={[400, 700]}
 *   isActive={true}
 *   slideKey="slide-1"
 *   style={{ borderRadius: 12 }}
 * />
 * ```
 */
const VideoSlide: React.FC<VideoSlideProps> = ({
  src,
  poster,
  aspectRatio,
  size,
  isActive,
  isInnerActive = true,
  slideKey,
  onVideoRef,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const soundState = useSoundState();
  const shouldPlay = isActive && isInnerActive;
  const isVertical = aspectRatio < 1;
  const [isLoading, showPoster] = useState(
    () => [createSignal(false), createSignal(true)] as const,
  )[0];

  // Mount shared video element to this container when active
  useIsomorphicLayoutEffect(() => {
    if (!shouldPlay || !containerRef.current) return;

    const video = getSharedVideo();
    const container = containerRef.current;

    // Show loader and poster initially
    isLoading.value = true;
    showPoster.value = true;

    // Video event handlers for loading state
    const handleCanPlay = () => (isLoading.value = false);
    const handleWaiting = () => (isLoading.value = true);
    const handlePlaying = () => {
      isLoading.value = false;
      showPoster.value = false;
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    // Update video properties
    video.src = src;
    video.muted = soundState.muted.value;

    // Restore saved playback position or start from beginning
    const savedPosition = playbackPositions.get(slideKey);
    video.currentTime = savedPosition ?? 0;

    // Update object-fit based on aspect ratio
    video.style.objectFit = isVertical ? 'cover' : 'contain';

    // Append to this container
    container.appendChild(video);

    // Report ref to parent
    if (onVideoRef) {
      onVideoRef(video);
    }

    // Play
    // Autoplay may be prevented by the browser
    video.play().catch(noop);

    return () => {
      // Remove event listeners
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);

      // Save current playback position before removing
      playbackPositions.set(slideKey, video.currentTime);

      // Capture current frame to use as poster when returning
      const frame = captureFrame(video);
      if (frame) {
        capturedFrames.set(slideKey, frame);
      }

      // Remove from this container when unmounting or becoming inactive
      if (video.parentNode === container) {
        container.removeChild(video);
      }
      if (onVideoRef) {
        onVideoRef(null);
      }

      isLoading.value = false;
    };
  }, [shouldPlay, src, isVertical, slideKey, onVideoRef]);

  // Sync muted state with sound context
  useEffect(() => {
    if (!shouldPlay) return;
    const video = sharedVideo;
    if (video) video.muted = soundState.muted.value;
    return soundState.muted.observe(() => {
      if (video) video.muted = soundState.muted.value;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPlay]);

  return (
    <div
      ref={containerRef}
      className={
        className
          ? `rk-video-slide-container ${className}`
          : 'rk-video-slide-container'
      }
      style={{
        width: size[0],
        height: size[1],
        ...style,
      }}
    >
      {/* Poster image with fade out transition */}
      {/* Use captured frame if available, otherwise fall back to original poster */}
      <Observe signals={[showPoster]}>
        {() => {
          const posterSrc = capturedFrames.get(slideKey) ?? poster;
          if (!posterSrc) return null;
          return (
            <img
              src={posterSrc}
              alt=""
              className={`rk-video-slide-poster ${!shouldPlay || showPoster.value ? 'rk-visible' : ''}`}
              style={{
                objectFit: isVertical ? 'cover' : 'contain',
              }}
            />
          );
        }}
      </Observe>

      {/* Wave loader for buffering/loading state */}
      <Observe signals={[isLoading]}>
        {() => (
          <div
            className={`rk-video-slide-loader ${isLoading.value ? 'rk-visible' : ''}`}
          />
        )}
      </Observe>
    </div>
  );
};

export default VideoSlide;
