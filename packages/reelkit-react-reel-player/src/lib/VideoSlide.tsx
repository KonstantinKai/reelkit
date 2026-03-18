import React, {
  type CSSProperties,
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  createSignal,
  createSharedVideo,
  captureFrame,
  noop,
  Observe,
} from '@reelkit/react';
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

const shared = createSharedVideo({
  className: 'rk-video-slide-element',
  disableRemotePlayback: true,
  disablePictureInPicture: true,
});

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

    const video = shared.getVideo();
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
    const savedPosition = shared.playbackPositions.get(slideKey);
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
      shared.playbackPositions.set(slideKey, video.currentTime);

      // Capture current frame to use as poster when returning
      const frame = captureFrame(video);
      if (frame) {
        shared.capturedFrames.set(slideKey, frame);
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
    const video = shared.getVideo();
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
          const posterSrc = shared.capturedFrames.get(slideKey) ?? poster;
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
