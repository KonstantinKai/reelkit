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
  $implicit: () => void;
  activeIndex: number;
  content: T[];

  /** Reactive sound state for mute/unmute control in custom controls. */
  soundState: PlayerSoundState;
}

/**
 * Template context for the `rkPlayerNavigation` slot.
 */
export interface PlayerNavigationContext {
  $implicit: () => void;
  onNext: () => void;
  activeIndex: number;
  count: number;
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
  $implicit: () => void;
  onNext: () => void;
  activeIndex: number;
  count: number;
}
