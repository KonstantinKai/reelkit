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
  createDisposableList,
  observeDomEvent,
  observeMediaLoading,
  syncMutedToVideo,
  syncVideoObjectFit,
  captureFrame,
  noop,
  Observe,
  useSoundState,
} from '@reelkit/react';
import { useTimelineStateOptional } from './TimelineState';
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

  /** Additional CSS class for the root container. */
  className?: string;

  /** Additional inline styles merged onto the root container. */
  style?: CSSProperties;

  /** Callback to report the shared video element ref to the parent for drag pause/resume. */
  onVideoRef?: (ref: HTMLVideoElement | null) => void;

  /** Called when the video is ready to play (buffering complete). */
  onReady?: () => void;

  /** Called when the video stalls (buffering mid-playback). */
  onWaiting?: () => void;

  /** Called when the video fails to load or play. */
  onError?: () => void;
}

/** @internal */
export const shared = createSharedVideo({
  className: 'rk-reel-video-element',
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
  onReady,
  onWaiting,
  onError,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const soundState = useSoundState();
  const timelineController = useTimelineStateOptional();
  const shouldPlay = isActive && isInnerActive;
  const isVertical = aspectRatio < 1;
  const [showPoster] = useState(() => createSignal(true));
  const callbacksRef = useRef({ onReady, onWaiting, onError });
  callbacksRef.current = { onReady, onWaiting, onError };

  useIsomorphicLayoutEffect(() => {
    if (!shouldPlay || !containerRef.current) return;

    const video = shared.getVideo();
    const container = containerRef.current;

    const disposables = createDisposableList();

    showPoster.value = true;

    disposables.push(
      observeMediaLoading(video, {
        onReady: () => {
          callbacksRef.current.onReady?.();
        },
        onWaiting: () => {
          callbacksRef.current.onWaiting?.();
        },
        onPlaying: () => {
          showPoster.value = false;
        },
      }),
      observeDomEvent(video, 'error', () => {
        if (video.error) callbacksRef.current.onError?.();
      }),
    );

    video.src = src;
    video.muted = soundState.muted.value;

    const savedPosition = shared.playbackPositions.get(slideKey);
    video.currentTime = savedPosition ?? 0;

    disposables.push(syncVideoObjectFit(video, isVertical));
    video.dataset['slideKey'] = slideKey;

    container.appendChild(video);

    if (onVideoRef) {
      onVideoRef(video);
    }

    if (timelineController) {
      timelineController.attach(video);
      disposables.push(timelineController.detach);
    }

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
      if (onVideoRef) {
        onVideoRef(null);
      }
    });

    return disposables.dispose;
  }, [shouldPlay, src, isVertical, slideKey, onVideoRef]);

  useEffect(() => {
    if (!shouldPlay) return;
    return syncMutedToVideo(soundState, shared.getVideo());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPlay]);

  return (
    <div
      ref={containerRef}
      className={
        className
          ? `rk-reel-video-container ${className}`
          : 'rk-reel-video-container'
      }
      style={{
        width: size[0],
        height: size[1],
        ...style,
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
              className={`rk-reel-video-poster ${!shouldPlay || showPoster.value ? 'rk-visible' : ''}`}
              style={{
                objectFit: isVertical ? 'cover' : 'contain',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          );
        }}
      </Observe>
    </div>
  );
};

export default VideoSlide;
