/**
 * Data for a single lightbox item (image or video).
 *
 * At minimum, provide `src`. Optional `title` and `description` are
 * rendered in the built-in info overlay (unless overridden via `renderInfo`).
 *
 * For video items, set `type: 'video'` and optionally provide a `poster`
 * thumbnail. Video rendering requires opting in via `useVideoSlideRenderer`.
 */
export interface LightboxItem {
  /** URL of the image or video. */
  src: string;

  /**
   * Item type. Defaults to `'image'` when omitted.
   * Video items require opting in via `useVideoSlideRenderer` and `renderSlide`.
   */
  type?: 'image' | 'video';

  /** Poster/thumbnail image for video items. Used for preloading and as placeholder. */
  poster?: string;

  /** Title displayed in the info overlay. */
  title?: string;

  /** Description displayed below the title in the info overlay. */
  description?: string;

  /** Intrinsic width of the image in pixels. Currently unused by the lightbox. */
  width?: number;

  /** Intrinsic height of the image in pixels. Currently unused by the lightbox. */
  height?: number;

  /**
   * Address the download button saves, when it differs from `src`, such as
   * a full-resolution original behind a resized preview.
   *
   * @default src
   */
  downloadUrl?: string;

  /**
   * File name the download button saves under.
   *
   * @default the last segment of the download URL's path
   */
  downloadName?: string;
}

/**
 * Props passed to the `LightboxOverlay` `renderControls` callback.
 */
export interface ControlsRenderProps {
  /** The currently active lightbox item. */
  item: LightboxItem;

  /** Zero-based index of the currently active slide. */
  activeIndex: number;

  /** Total number of images. */
  count: number;

  /** Whether the lightbox is currently in fullscreen mode. */
  isFullscreen: boolean;

  /** Whether the slideshow is running. Always `false` without `autoAdvance`. */
  isAutoAdvancing: boolean;

  /** Whether the active item is being downloaded. */
  isDownloading: boolean;

  /** Callback to close the lightbox. */
  onClose: () => void;

  /** Toggle fullscreen mode. */
  onToggleFullscreen: () => void;

  /**
   * Switch the slideshow on or off. Present only when `autoAdvance` is on,
   * so a custom renderer shows a play/pause button only when it does
   * something.
   */
  onToggleAutoAdvance?: () => void;

  /**
   * Download the active item. Present only when `showDownload` is on.
   */
  onDownload?: () => void;
}

/**
 * Props passed to the `LightboxOverlay` `renderNavigation` callback.
 */
export interface NavigationRenderProps {
  /** The currently active lightbox item. */
  item: LightboxItem;

  /** Zero-based index of the currently active slide. */
  activeIndex: number;

  /** Total number of slides. */
  count: number;

  /** Navigate to the previous slide. */
  onPrev: () => void;

  /** Navigate to the next slide. */
  onNext: () => void;
}

/**
 * Props passed to the `LightboxOverlay` `renderSlide` callback.
 */
export interface SlideRenderProps {
  /** The lightbox item for this slide. */
  item: LightboxItem;

  /** Zero-based index of this slide. */
  index: number;

  /** `[width, height]` dimensions of the lightbox in pixels. */
  size: [number, number];

  /** Whether this is the currently active slide. */
  isActive: boolean;

  /**
   * Whether the lightbox auto-advances. A video slide should then play once
   * rather than loop, because a looping video never ends.
   */
  autoAdvance: boolean;

  /** Notify that the slide content is ready (loaded). Clears the spinner. */
  onReady: () => void;

  /** Notify that the slide content is loading/waiting. Shows the spinner. */
  onWaiting: () => void;

  /** Notify that the slide content failed to load. Shows error icon. */
  onError: () => void;

  /**
   * Notify that a video slide played to its end. With auto-advance on, the
   * lightbox moves to the next slide; otherwise nothing happens.
   */
  onEnded: () => void;
}

/**
 * Props passed to the `LightboxOverlay` `renderInfo` callback.
 */
export interface InfoRenderProps {
  /** The currently active lightbox item. */
  item: LightboxItem;

  /** Zero-based index of the current item. */
  index: number;
}
