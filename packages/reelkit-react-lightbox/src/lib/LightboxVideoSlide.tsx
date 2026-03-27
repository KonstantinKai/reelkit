import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import {
  createSignal,
  createSharedVideo,
  createDisposableList,
  observeMediaLoading,
  syncMutedToVideo,
  captureFrame,
  noop,
  Observe,
  useSoundState,
} from '@reelkit/react';
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

  /** Called when the video starts playing (buffering complete). */
  onPlaying?: () => void;

  /** Called when the video stalls (buffering mid-playback). */
  onWaiting?: () => void;
}

const shared = createSharedVideo({
  className: 'rk-lightbox-video-element',
});

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
  onPlaying,
  onWaiting,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const soundState = useSoundState();
  const [showPoster] = useState(() => createSignal(true));
  const callbacksRef = useRef({ onPlaying, onWaiting });
  callbacksRef.current = { onPlaying, onWaiting };

  useIsomorphicLayoutEffect(() => {
    if (!isActive || !containerRef.current) return;

    const video = shared.getVideo();
    const container = containerRef.current;
    const disposables = createDisposableList();

    showPoster.value = true;

    disposables.push(
      observeMediaLoading(video, {
        onReady: () => {
          callbacksRef.current.onPlaying?.();
        },
        onWaiting: () => {
          callbacksRef.current.onWaiting?.();
        },
        onPlaying: () => {
          showPoster.value = false;
        },
      }),
    );

    video.src = src;
    video.muted = soundState.muted.value;
    disposables.push(syncMutedToVideo(soundState, video));
    video.style.objectFit = 'contain';

    const savedPosition = shared.playbackPositions.get(slideKey);
    video.currentTime = savedPosition ?? 0;

    container.appendChild(video);
    video.play().catch(noop);

    disposables.push(() => {
      shared.playbackPositions.set(slideKey, video.currentTime);

      const frame = captureFrame(video);
      if (frame) {
        shared.capturedFrames.set(slideKey, frame);
      }

      if (video.parentNode === container) {
        container.removeChild(video);
      }
    });

    return disposables.dispose;
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
      <Observe signals={[showPoster]}>
        {() => {
          const posterSrc = shared.capturedFrames.get(slideKey) ?? poster;
          if (!posterSrc) return null;
          return (
            <img
              src={posterSrc}
              alt=""
              className={`rk-lightbox-video-poster ${!isActive || showPoster.value ? 'rk-visible' : ''}`}
              style={{ objectFit: 'contain' }}
            />
          );
        }}
      </Observe>
    </div>
  );
};

export default LightboxVideoSlide;
