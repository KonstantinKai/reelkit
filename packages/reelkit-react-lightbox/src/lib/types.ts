import type { LightboxItem } from './LightboxOverlay';

/**
 * Props passed to the {@link LightboxOverlay} `renderControls` callback.
 */
export interface LightboxControlsRenderProps {
  /** Callback to close the lightbox. */
  onClose: () => void;
  /** Zero-based index of the currently active slide. */
  currentIndex: number;
  /** Total number of images. */
  count: number;
  /** Whether the lightbox is currently in fullscreen mode. */
  isFullscreen: boolean;
  /** Toggle fullscreen mode. */
  onToggleFullscreen: () => void;
}

/**
 * Props passed to the {@link LightboxOverlay} `renderNavigation` callback.
 */
export interface NavigationRenderProps {
  /** Navigate to the previous slide. */
  onPrev: () => void;
  /** Navigate to the next slide. */
  onNext: () => void;
  /** Zero-based index of the currently active slide. */
  activeIndex: number;
  /** Total number of slides. */
  count: number;
}

/**
 * Props passed to the {@link LightboxOverlay} `renderInfo` callback.
 */
export interface InfoRenderProps {
  /** The current lightbox item data. */
  item: LightboxItem;
  /** Zero-based index of the current item. */
  index: number;
}
