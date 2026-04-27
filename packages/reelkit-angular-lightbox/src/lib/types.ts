/**
 * Data for a single lightbox item (image or video).
 *
 * At minimum, provide `src`. Optional `title` and `description` are
 * rendered in the built-in info overlay (unless overridden via a template slot).
 *
 * For video items, set `type: 'video'` and optionally provide a `poster`
 * thumbnail. Video rendering requires opting in via `RkLightboxVideoSlideComponent`.
 */
export interface LightboxItem {
  /** URL of the image or video. */
  src: string;

  /**
   * Item type. Defaults to `'image'` when omitted.
   * Video items require using `RkLightboxVideoSlideComponent` in a custom slide template.
   */
  type?: 'image' | 'video';

  /** Poster/thumbnail image for video items. Used for preloading and as placeholder. */
  poster?: string;

  /** Title displayed in the info overlay. */
  title?: string;

  /** Description displayed below the title in the info overlay. */
  description?: string;

  /** Intrinsic width of the image in pixels. */
  width?: number;

  /** Intrinsic height of the image in pixels. */
  height?: number;
}

/**
 * Subset of reel configuration forwarded to the underlying slider.
 *
 * Allows controlling transition duration, swipe sensitivity, looping,
 * keyboard navigation, and wheel behaviour.
 */
export interface ReelProxyProps {
  /** Duration of slide transition animations in milliseconds. @default 300 */
  transitionDuration?: number;

  /** Minimum swipe distance fraction (0–1) to trigger a slide change. @default 0.12 */
  swipeDistanceFactor?: number;

  /** Whether the slider wraps from last slide to first. @default false */
  loop?: boolean;

  /** Enable keyboard arrow key navigation. @default true */
  enableNavKeys?: boolean;

  /** Enable mouse wheel navigation. @default false */
  enableWheel?: boolean;

  /** Debounce duration for wheel events in milliseconds. @default 200 */
  wheelDebounceMs?: number;
}

/**
 * Context provided to the `rkLightboxControls` template slot.
 */
export interface LightboxControlsContext {
  $implicit: void;

  /** The currently active lightbox item. */
  item: LightboxItem;

  /** Zero-based index of the currently active slide. */
  activeIndex: number;

  /** Total number of items. */
  count: number;

  /** Whether the lightbox is currently in fullscreen mode. */
  isFullscreen: boolean;

  /** Close the lightbox. */
  onClose: () => void;

  /** Toggle fullscreen mode. */
  onToggleFullscreen: () => void;
}

/**
 * Context provided to the `rkLightboxNavigation` template slot.
 */
export interface LightboxNavContext {
  $implicit: void;

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
 * Context provided to the `rkLightboxInfo` template slot.
 */
export interface LightboxInfoContext {
  /** The current lightbox item data. */
  $implicit: LightboxItem;

  /** Zero-based index of the current item. */
  index: number;
}

/**
 * Context provided to the `rkLightboxSlide` template slot.
 */
export interface LightboxSlideContext {
  /** The lightbox item for this slide. */
  $implicit: LightboxItem;

  /** Zero-based index of this slide. */
  index: number;

  /** `[width, height]` dimensions of the lightbox in pixels. */
  size: [number, number];

  /** Whether this is the currently active slide. */
  isActive: boolean;

  /** Notify that the slide content is ready (loaded). */
  onReady: () => void;

  /** Notify that the slide content is loading/waiting. */
  onWaiting: () => void;

  /** Notify that the slide content failed to load. */
  onError: () => void;
}
