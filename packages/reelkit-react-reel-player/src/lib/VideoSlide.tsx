import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { noop } from '@reelkit/core';
import { useSoundState } from './SoundState';
import './VideoSlide.css';

interface VideoSlideProps {
  src: string;
  poster?: string;
  aspectRatio: number;
  size: [number, number];
  isActive: boolean;
  isInnerActive?: boolean;
  slideKey: string; // Unique key for storing playback position (e.g., "content-5" or "content-5:media-2")
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
}

// Shared video element for iOS sound continuity
// iOS only allows autoplay with sound if user has interacted with the video element
// By reusing the same element, the unmuted state persists across slide changes
let sharedVideo: HTMLVideoElement | null = null;

// Store playback positions per slideKey to restore when returning to a slide
const playbackPositions = new Map<string, number>();

// Store captured video frames per slideKey to use as poster when returning
const capturedFrames = new Map<string, string>();

// Capture current video frame as data URL
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
    sharedVideo.className = 'video-slide-element';
  }
  return sharedVideo;
};

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const VideoSlide: React.FC<VideoSlideProps> = ({
  src,
  poster,
  aspectRatio,
  size,
  isActive,
  isInnerActive = true,
  slideKey,
  onVideoRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const soundState = useSoundState();
  const shouldPlay = isActive && isInnerActive;
  const isVertical = aspectRatio < 1;
  const [isLoading, setIsLoading] = useState(false);
  const [showPoster, setShowPoster] = useState(true);

  // Mount shared video element to this container when active
  useIsomorphicLayoutEffect(() => {
    if (!shouldPlay || !containerRef.current) return;

    const video = getSharedVideo();
    const container = containerRef.current;

    // Show loader and poster initially
    setIsLoading(true);
    setShowPoster(true);

    // Video event handlers for loading state
    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setShowPoster(false);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    // Update video properties
    video.src = src;
    video.muted = soundState.muted;

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

      setIsLoading(false);
    };
  }, [shouldPlay, src, isVertical, slideKey, onVideoRef]);

  // Sync muted state with sound context
  useEffect(() => {
    if (shouldPlay && sharedVideo) {
      sharedVideo.muted = soundState.muted;
    }
  }, [soundState.muted, shouldPlay]);

  return (
    <div
      ref={containerRef}
      className="video-slide-container"
      style={{
        width: size[0],
        height: size[1],
      }}
    >
      {/* Poster image with fade out transition */}
      {/* Use captured frame if available, otherwise fall back to original poster */}
      {(capturedFrames.get(slideKey) ?? poster) && (
        <img
          src={capturedFrames.get(slideKey) ?? poster}
          alt=""
          className={`video-slide-poster ${!shouldPlay || showPoster ? 'visible' : ''}`}
          style={{
            objectFit: isVertical ? 'cover' : 'contain',
          }}
        />
      )}

      {/* Wave loader for buffering/loading state */}
      <div className={`video-slide-loader ${isLoading ? 'visible' : ''}`} />
    </div>
  );
};

export default VideoSlide;
