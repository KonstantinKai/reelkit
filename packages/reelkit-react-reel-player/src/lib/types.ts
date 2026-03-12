import type { SoundState } from './SoundState';

/** Supported media types for content items. */
export type MediaType = 'image' | 'video';

/**
 * A single media asset within a content item.
 *
 * Each content item can contain one or more media items. When there are
 * multiple, they are displayed in a horizontal nested slider.
 */
export interface MediaItem {
  /** Unique identifier for this media asset. */
  id: string;
  /** Whether this asset is an image or a video. */
  type: MediaType;
  /** URL of the media source. */
  src: string;
  /** Optional poster image URL, used as a placeholder while video loads. */
  poster?: string;
  /** Width / height ratio. Values < 1 indicate vertical, > 1 horizontal. */
  aspectRatio: number;
}

/**
 * Base constraint for content items. Extend this interface to use custom
 * data types with `ReelPlayerOverlay`.
 *
 * @example
 * ```ts
 * interface MyItem extends BaseContentItem {
 *   title: string;
 *   category: string;
 * }
 *
 * <ReelPlayerOverlay<MyItem> content={items} ... />
 * ```
 */
export interface BaseContentItem {
  /** Unique identifier for this content item. */
  id: string;
  /** One or more media assets to display for this item. */
  media: MediaItem[];
}

/**
 * Default content item type with social-media-style metadata.
 *
 * Used by the built-in {@link SlideOverlay} to display author info,
 * description text, and a like count. Extends {@link BaseContentItem}.
 */
export interface ContentItem extends BaseContentItem {
  /** Author information displayed in the slide overlay. */
  author: {
    /** Display name of the content author. */
    name: string;
    /** URL of the author's avatar image. */
    avatar: string;
  };
  /** Number of likes, displayed with compact formatting (e.g. 1.2K, 3.5M). */
  likes: number;
  /** Short description text shown in the slide overlay (max 2 lines). */
  description: string;
}

/**
 * Props passed to the `renderControls` callback.
 *
 * Use these to build custom player controls while retaining access to
 * the player's state and actions.
 *
 * @typeParam T - The content item type, defaults to {@link ContentItem}.
 */
export interface ControlsRenderProps<T extends BaseContentItem> {
  /** Callback to close the player overlay. */
  onClose: () => void;
  /** Reactive sound state for mute/unmute control. */
  soundState: SoundState;
  /** Zero-based index of the currently active slide. */
  activeIndex: number;
  /** The full content array passed to the player. */
  content: T[];
}

/**
 * Props passed to the `renderNavigation` callback.
 *
 * Use these to build custom navigation arrows while retaining access to
 * slide navigation actions and position info.
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
