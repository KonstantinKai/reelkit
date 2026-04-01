/* eslint-disable react-hooks/exhaustive-deps */
import { type FC, useRef, useState, useEffect } from 'react';
import {
  createSharedVideo,
  createSignal,
  createDisposableList,
  observeDomEvent,
  observeMediaLoading,
  syncMutedToVideo,
  reaction,
  captureFrame,
  noop,
  Observe,
  useSoundState,
  type Signal,
} from '@reelkit/react';

/** Props for the {@link VideoStorySlide} component. */
export interface VideoStorySlideProps {
  /** Video source URL. */
  src: string;

  /** Optional poster image URL shown before playback. */
  poster?: string;

  /** Group index this slide belongs to. */
  groupIndex: number;

  /** Story index within the group. */
  storyIndex: number;

  /** Active group index signal from the stories controller. */
  activeGroupIndex: Signal<number>;

  /** Active story index signal from the stories controller. */
  activeStoryIndex: Signal<number>;

  /** Called when video metadata loads, reporting duration in milliseconds. */
  onDurationReady?: (ms: number) => void;

  /** Called when the video starts playing (buffering complete). */
  onPlaying?: () => void;

  /** Called when the video stalls (buffering mid-playback). */
  onWaiting?: () => void;

  /** Called when the video reaches the end. */
  onEnded?: () => void;

  /** Called when the video fails to load or play. */
  onError?: () => void;
}

export const shared = createSharedVideo({
  className: 'rk-stories-video-element',
  disableRemotePlayback: true,
  disablePictureInPicture: true,
});

/**
 * Renders a single video story slide using a shared `<video>` element
 * for iOS sound continuity across slide changes.
 *
 * Determines active state directly from controller signals via
 * `reaction`, bypassing React re-render timing. The shared element
 * is moved into the active slide's container and removed on deactivation.
 */
export const VideoStorySlide: FC<VideoStorySlideProps> = ({
  src,
  poster,
  groupIndex,
  storyIndex,
  activeGroupIndex,
  activeStoryIndex,
  onDurationReady,
  onPlaying,
  onWaiting,
  onEnded,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const soundState = useSoundState();
  const [showPoster] = useState(() => createSignal(true));
  const resolvedPoster = shared.capturedFrames.get(src) ?? poster ?? '';
  const callbacksRef = useRef({
    onDurationReady,
    onPlaying,
    onWaiting,
    onEnded,
    onError,
  });
  callbacksRef.current = {
    onDurationReady,
    onPlaying,
    onWaiting,
    onEnded,
    onError,
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let active = false;
    const disposables = createDisposableList();
    let activeDisposables: ReturnType<typeof createDisposableList> | null =
      null;

    const activate = () => {
      const video = shared.getVideo();
      const srcChanged = !video.src.endsWith(src);

      showPoster.value = true;

      // Attach listeners BEFORE changing src/currentTime/play.
      // Changing src or seeking on a cached video can fire events
      // synchronously — listeners must be in place to catch them.
      activeDisposables = createDisposableList();
      activeDisposables.push(
        observeDomEvent(video, 'loadedmetadata', () => {
          if (video.duration && isFinite(video.duration)) {
            callbacksRef.current.onDurationReady?.(video.duration * 1000);
          }
        }),
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
        observeDomEvent(video, 'ended', () => {
          callbacksRef.current.onEnded?.();
        }),
        observeDomEvent(video, 'error', () => {
          callbacksRef.current.onError?.();
        }),
      );

      if (srcChanged) video.src = src;
      video.currentTime = 0;
      video.muted = soundState.muted.value;
      video.loop = false;
      video.style.objectFit = 'cover';
      video.style.width = '100%';
      video.style.height = '100%';

      container.appendChild(video);

      if (video.readyState >= 1 && video.duration && isFinite(video.duration)) {
        callbacksRef.current.onDurationReady?.(video.duration * 1000);
      }

      video.play().catch(noop);
    };

    const deactivate = () => {
      activeDisposables?.dispose();
      activeDisposables = null;

      const video = shared.getVideo();
      // Only pause and remove if the video is still in THIS container.
      // Another slide's activate() may have already claimed the shared
      // video via appendChild (which auto-removes from the old parent).
      if (video.parentNode === container) {
        const frame = captureFrame(video);
        if (frame) shared.capturedFrames.set(src, frame);
        video.pause();
        container.removeChild(video);
      }
      showPoster.value = true;
    };

    disposables.push(
      reaction(
        () => [activeGroupIndex, activeStoryIndex],
        () => {
          const shouldBeActive =
            activeGroupIndex.value === groupIndex &&
            activeStoryIndex.value === storyIndex;

          if (shouldBeActive && !active) {
            active = true;
            activate();
          } else if (!shouldBeActive && active) {
            active = false;
            deactivate();
          }
        },
      ),
      () => {
        if (active) deactivate();
      },
    );

    // Check initial state
    if (
      activeGroupIndex.value === groupIndex &&
      activeStoryIndex.value === storyIndex
    ) {
      active = true;
      activate();
    }

    return disposables.dispose;
  }, [src, groupIndex, storyIndex]);

  useEffect(() => syncMutedToVideo(soundState, shared.getVideo()), []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: '#000',
      }}
    >
      {resolvedPoster && (
        <Observe signals={[showPoster]}>
          {() => (
            <img
              src={resolvedPoster}
              alt=""
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
                opacity: showPoster.value ? 1 : 0,
                transition: 'opacity 200ms ease',
              }}
            />
          )}
        </Observe>
      )}
    </div>
  );
};
