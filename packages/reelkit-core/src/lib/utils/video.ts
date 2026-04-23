import { createLruCache, type LruCache } from './lruCache';
import { observeDomEvent } from './observeDomEvent';
import type { Disposer } from './disposable';

const _kMaxCachedPositions = 200;
const _kMaxCachedFrames = 50;

/**
 * Captures the current video frame as a JPEG data URL.
 * Returns `null` on cross-origin errors or if the video has no dimensions.
 */
export const captureFrame = (video: HTMLVideoElement): string | null => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx || video.videoWidth === 0) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch {
    return null;
  }
};

/**
 * Keeps `video.style.objectFit` in sync with the video's real orientation.
 *
 * Applies `fallbackIsVertical` immediately (based on the consumer's
 * declared aspect ratio), then on `loadedmetadata` reads the actual
 * `videoWidth / videoHeight` and switches to `cover` for portrait content
 * or `contain` for landscape. Resilient to consumers declaring a wrong
 * aspect ratio in metadata.
 *
 * @returns A {@link Disposer} that removes the `loadedmetadata` listener.
 */
export const syncVideoObjectFit = (
  video: HTMLVideoElement,
  fallbackIsVertical: boolean,
): Disposer => {
  const apply = (isVertical: boolean) =>
    (video.style.objectFit = isVertical ? 'cover' : 'contain');

  apply(fallbackIsVertical);
  const syncFromMetadata = () => {
    if (video.videoWidth && video.videoHeight) {
      apply(video.videoWidth < video.videoHeight);
    }
  };
  // Metadata may already be loaded if the same `<video>` was reused.
  syncFromMetadata();
  return observeDomEvent(video, 'loadedmetadata', syncFromMetadata);
};

/**
 * Configuration for {@link createSharedVideo}.
 */
export interface SharedVideoConfig {
  /** CSS class applied to the shared video element. */
  className: string;

  /**
   * Disable remote playback (Chromecast etc).
   * @default false
   */
  disableRemotePlayback?: boolean;

  /**
   * Disable picture-in-picture.
   * @default false
   */
  disablePictureInPicture?: boolean;
}

/**
 * Scoped shared video instance returned by {@link createSharedVideo}.
 */
export interface SharedVideoInstance {
  /** Playback positions per slideKey, restored when returning to a slide. LRU-evicted. */
  playbackPositions: LruCache<number>;

  /** Captured video frames per slideKey, used as poster when returning. LRU-evicted. */
  capturedFrames: LruCache<string>;

  /** Get or create the shared video element. */
  getVideo: () => HTMLVideoElement;
}

/**
 * Creates a scoped shared video singleton with its own playback position
 * and frame capture maps.
 *
 * Each consumer (e.g. reel-player, lightbox) should call this once at
 * module scope to get an isolated instance. The shared `<video>` element
 * enables iOS sound continuity across slide changes.
 *
 * @example
 * ```ts
 * const shared = createSharedVideo({
 *   className: 'rk-video-slide-element',
 *   disableRemotePlayback: true,
 * });
 *
 * const video = shared.getVideo();
 * ```
 */
export const createSharedVideo = (
  config: SharedVideoConfig,
): SharedVideoInstance => {
  let video: HTMLVideoElement | null = null;

  const getVideo = (): HTMLVideoElement => {
    if (!video) {
      video = document.createElement('video');
      video.playsInline = true;
      video.loop = true;
      video.preload = 'auto';
      video.muted = true;
      video.autoplay = true;
      video.crossOrigin = 'anonymous';
      video.className = config.className;
      if (config.disableRemotePlayback) video.disableRemotePlayback = true;
      if (config.disablePictureInPicture) video.disablePictureInPicture = true;
    }
    return video;
  };

  return {
    getVideo,
    playbackPositions: createLruCache(_kMaxCachedPositions),
    capturedFrames: createLruCache(_kMaxCachedFrames),
  };
};
