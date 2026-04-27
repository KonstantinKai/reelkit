/**
 * A single item displayed by the lightbox overlay.
 *
 * `title` and `description`, when present, are rendered in the built-in
 * info overlay (unless overridden via the `info` slot).
 *
 * For video items, set `type: 'video'` and optionally provide a `poster`
 * thumbnail. Video rendering requires opting in via `useVideoSlideRenderer`.
 */
export interface LightboxItem {
  /** URL of the image or video. */
  src: string;

  /**
   * Item type.
   *
   * @default 'image'
   */
  type?: 'image' | 'video';

  /** Poster/thumbnail image for video items. */
  poster?: string;

  /** Title shown in the info overlay. */
  title?: string;

  /** Description shown below the title in the info overlay. */
  description?: string;

  /** Intrinsic width of the image in pixels. Currently unused by the layout. */
  width?: number;

  /** Intrinsic height of the image in pixels. Currently unused by the layout. */
  height?: number;
}

/**
 * Scope object provided to the `controls` slot.
 */
export interface ControlsSlotScope {
  /** The currently active lightbox item. */
  item: LightboxItem;

  /** Zero-based index of the currently active slide. */
  activeIndex: number;

  /** Total number of items. */
  count: number;

  /** Whether the lightbox is currently in fullscreen mode. */
  isFullscreen: boolean;

  /** Close the overlay. */
  onClose: () => void;

  /** Toggle fullscreen on/off. */
  onToggleFullscreen: () => void;
}

/**
 * Scope object provided to the `navigation` slot.
 */
export interface NavigationSlotScope {
  /** The currently active lightbox item. */
  item: LightboxItem;

  /** Zero-based index of the currently active slide. */
  activeIndex: number;

  /** Total number of items. */
  count: number;

  /** Navigate to the previous slide. */
  onPrev: () => void;

  /** Navigate to the next slide. */
  onNext: () => void;
}

/**
 * Scope object provided to the `slide` slot. Return `null` or omit the
 * slot content to fall back to the default image renderer.
 */
export interface SlideSlotScope {
  /** The lightbox item rendered by this slide. */
  item: LightboxItem;

  /** Zero-based index of this slide. */
  index: number;

  /** `[width, height]` dimensions of the lightbox container in pixels. */
  size: [number, number];

  /** Whether this is the currently active slide. */
  isActive: boolean;

  /** Notify that the slide content is ready (loaded). Clears the spinner. */
  onReady: () => void;

  /** Notify that the slide content is loading/waiting. Shows the spinner. */
  onWaiting: () => void;

  /** Notify that the slide content failed to load. Shows the error indicator. */
  onError: () => void;
}

/**
 * Scope object provided to the `info` slot.
 */
export interface InfoSlotScope {
  /** The currently active lightbox item. */
  item: LightboxItem;

  /** Zero-based index of the current item. */
  index: number;
}

/**
 * Scope object provided to the `loading` slot.
 */
export interface LoadingSlotScope {
  /** The currently active lightbox item. */
  item: LightboxItem;

  /** Zero-based index of the current item. */
  activeIndex: number;
}

/**
 * Scope object provided to the `error` slot.
 */
export interface ErrorSlotScope {
  /** The currently active lightbox item. */
  item: LightboxItem;

  /** Zero-based index of the current item. */
  activeIndex: number;
}
