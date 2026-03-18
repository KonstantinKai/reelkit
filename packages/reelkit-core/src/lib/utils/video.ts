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
  /** Get or create the shared video element. */
  getVideo: () => HTMLVideoElement;

  /** Playback positions per slideKey, restored when returning to a slide. */
  playbackPositions: Map<string, number>;

  /** Captured video frames per slideKey, used as poster when returning. */
  capturedFrames: Map<string, string>;
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
    playbackPositions: new Map(),
    capturedFrames: new Map(),
  };
};
