import type { LightboxItem } from './LightboxOverlay';

/**
 * Props passed to the {@link LightboxOverlay} `renderControls` callback.
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

  /** Callback to close the lightbox. */
  onClose: () => void;

  /** Toggle fullscreen mode. */
  onToggleFullscreen: () => void;
}

/**
 * Props passed to the {@link LightboxOverlay} `renderNavigation` callback.
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
 * Props passed to the {@link LightboxOverlay} `renderSlide` callback.
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

  /** Notify that the slide content is ready (loaded). Clears the spinner. */
  onReady: () => void;

  /** Notify that the slide content is loading/waiting. Shows the spinner. */
  onWaiting: () => void;

  /** Notify that the slide content failed to load. Shows error icon. */
  onError: () => void;
}

/**
 * Props passed to the {@link LightboxOverlay} `renderInfo` callback.
 */
export interface InfoRenderProps {
  /** The currently active lightbox item. */
  item: LightboxItem;

  /** Zero-based index of the current item. */
  index: number;
}
