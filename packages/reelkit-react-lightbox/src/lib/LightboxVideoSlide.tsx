import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import { createSharedVideo, captureFrame, noop } from '@reelkit/react';
import './LightboxVideoSlide.css';

/**
 * Props for the {@link LightboxVideoSlide} component.
 */
export interface LightboxVideoSlideProps {
  /** URL of the video source. */
  src: string;

  /** Optional poster image shown while video loads. */
  poster?: string;

  /** Whether this slide is the active (visible) slide. */
  isActive: boolean;

  /** [width, height] in pixels. */
  size: [number, number];

  /** Unique key for persisting playback position and captured frames. */
  slideKey: string;
}

const shared = createSharedVideo({
  className: 'rk-lightbox-video-element',
});

/** Current muted state, kept in sync by `useVideoSlideRenderer`. */
let currentMuted = true;

/**
 * Set the muted state on the shared video element directly.
 * Called by `useVideoSlideRenderer` — no re-render needed.
 * @internal
 */
export const setLightboxVideoMuted = (muted: boolean): void => {
  currentMuted = muted;
  const video = shared.getVideo();
  video.muted = muted;
};

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Lightweight video slide component for the lightbox.
 *
 * Uses a shared `<video>` element (same pattern as reel-player) for iOS
 * sound continuity. Manages playback lifecycle, persists playback position,
 * and captures poster frames on deactivation.
 *
 * Import this component via `useVideoSlideRenderer` — it is not meant to
 * be used directly.
 */
const LightboxVideoSlide: React.FC<LightboxVideoSlideProps> = ({
  src,
  poster,
  isActive,
  size,
  slideKey,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPoster, setShowPoster] = useState(true);

  // Mount shared video element to this container when active
  useIsomorphicLayoutEffect(() => {
    if (!isActive || !containerRef.current) return;

    const video = shared.getVideo();
    const container = containerRef.current;

    setIsLoading(true);
    setShowPoster(true);

    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setShowPoster(false);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    video.src = src;
    video.muted = currentMuted;
    video.style.objectFit = 'contain';

    // Restore saved playback position or start from beginning
    const savedPosition = shared.playbackPositions.get(slideKey);
    video.currentTime = savedPosition ?? 0;

    container.appendChild(video);
    video.play().catch(noop);

    return () => {
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

      if (video.parentNode === container) {
        container.removeChild(video);
      }

      setIsLoading(false);
    };
  }, [isActive, src, slideKey]);

  return (
    <div
      ref={containerRef}
      className="rk-lightbox-video-container"
      style={{
        width: size[0],
        height: size[1],
      }}
    >
      {(shared.capturedFrames.get(slideKey) ?? poster) && (
        <img
          src={shared.capturedFrames.get(slideKey) ?? poster}
          alt=""
          className={`rk-lightbox-video-poster ${!isActive || showPoster ? 'rk-visible' : ''}`}
          style={{ objectFit: 'contain' }}
        />
      )}

      <div
        className={`rk-lightbox-video-loader ${isLoading ? 'rk-visible' : ''}`}
      />
    </div>
  );
};

export default LightboxVideoSlide;
