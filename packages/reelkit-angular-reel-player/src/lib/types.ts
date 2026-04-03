export type MediaType = 'image' | 'video';

/**
 * A single media asset within a content item.
 *
 * Each content item can contain one or more media items. When there are
 * multiple, they are displayed in a horizontal nested slider.
 */
export interface MediaItem {
  id: string;
  type: MediaType;
  src: string;

  /** Optional poster image URL, used as a placeholder while video loads. */
  poster?: string;

  /** Width / height ratio. Values < 1 indicate vertical (cover), > 1 horizontal (contain). */
  aspectRatio: number;
}

/**
 * Base constraint for content items. Extend this interface to use custom
 * data types with `RkReelPlayerOverlayComponent`.
 */
export interface BaseContentItem {
  id: string;
  media: MediaItem[];
}

/**
 * Default content item type with social-media-style metadata.
 */
export interface ContentItem extends BaseContentItem {
  author: {
    name: string;
    avatar: string;
  };
  likes: number;
  description: string;
}

/**
 * Template context for the `rkPlayerSlide` slot.
 * Provides all data needed to render a fully-functional custom slide.
 */
export interface PlayerSlideContext<T extends BaseContentItem = ContentItem> {
  $implicit: T;
  index: number;
  size: [number, number];
  isActive: boolean;
  slideKey: string;

  /** Notify that the slide content is ready (loaded). */
  onReady: () => void;

  /** Notify that the slide content is loading/waiting. */
  onWaiting: () => void;

  /** Notify that the slide content failed to load. */
  onError: () => void;
}

/**
 * Template context for the `rkPlayerSlideOverlay` slot.
 */
export interface PlayerSlideOverlayContext<
  T extends BaseContentItem = ContentItem,
> {
  $implicit: T;
  index: number;
  isActive: boolean;
}

/**
 * Minimal sound-state shape exposed to the `rkPlayerControls` template slot.
 * Matches `SoundStateService`'s public API so custom controls can read and
 * toggle mute state without a direct service injection.
 */
export interface PlayerSoundState {
  /** Whether the player is currently muted. */
  readonly muted: () => boolean;

  /**
   * Whether sound controls should be hidden — `true` while the active slide
   * has no video or is transitioning.
   */
  readonly disabled: () => boolean;

  /** Toggles the muted state. */
  toggle: () => void;
}

/**
 * Template context for the `rkPlayerControls` slot.
 */
export interface PlayerControlsContext<
  T extends BaseContentItem = ContentItem,
> {
  /** The currently active content item. */
  item: T;

  /** Zero-based index of the currently active slide. */
  activeIndex: number;

  /** The full content array passed to the player. */
  content: T[];

  /** Reactive sound state for mute/unmute control in custom controls. */
  soundState: PlayerSoundState;

  /** Close the player overlay. */
  $implicit: () => void;

  /** Close the player overlay. */
  onClose: () => void;
}

/**
 * Template context for the `rkPlayerNavigation` slot.
 */
export interface PlayerNavigationContext {
  /** The currently active content item. */
  item: BaseContentItem;

  /** Zero-based index of the currently active slide. */
  activeIndex: number;

  /** Total number of slides. */
  count: number;

  /** Navigate to the previous slide. */
  $implicit: () => void;

  /** Navigate to the previous slide. */
  onPrev: () => void;

  /** Navigate to the next slide. */
  onNext: () => void;
}

/**
 * Template context for the `rkPlayerNestedSlide` slot.
 */
export interface PlayerNestedSlideContext {
  $implicit: MediaItem;
  index: number;
  size: [number, number];
  isActive: boolean;
  isInnerActive: boolean;
  slideKey: string;
}

/**
 * Template context for the `rkPlayerNestedNavigation` slot.
 */
export interface PlayerNestedNavigationContext {
  /** The currently active media item. */
  media: MediaItem;

  /** Zero-based index of the currently active nested slide. */
  activeIndex: number;

  /** Total number of nested slides. */
  count: number;

  /** Navigate to the previous nested slide. */
  $implicit: () => void;

  /** Navigate to the previous nested slide. */
  onPrev: () => void;

  /** Navigate to the next nested slide. */
  onNext: () => void;
}
