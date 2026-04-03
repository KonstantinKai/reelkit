import type { ReactNode } from 'react';
import type { ReelApi } from '@reelkit/react';
import type { SoundController } from '@reelkit/react';

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
  /** The currently active content item. */
  item: T;

  /** Reactive sound state for mute/unmute control. */
  soundState: SoundController;

  /** Zero-based index of the currently active slide. */
  activeIndex: number;

  /** The full content array passed to the player. */
  content: T[];

  /** Callback to close the player overlay. */
  onClose: () => void;
}

/**
 * Props passed to the `renderSlide` callback.
 *
 * Contains everything needed to render a fully-functional custom slide,
 * including video playback plumbing and nested slider coordination.
 *
 * Use `defaultContent` to wrap or augment the default slide without
 * reconstructing the full media/overlay stack.
 *
 * @typeParam T - The content item type.
 *
 * @example Using defaultContent with a custom badge
 * ```tsx
 * renderSlide={(props) => (
 *   <>
 *     {props.defaultContent}
 *     {props.isActive && <Badge>Live</Badge>}
 *   </>
 * )}
 * ```
 *
 * @example Custom slide with VideoSlide
 * ```tsx
 * renderSlide={({ item, size, isActive, slideKey, onVideoRef }) => {
 *   const video = item.media[0];
 *   return (
 *     <VideoSlide
 *       src={video.src}
 *       poster={video.poster}
 *       aspectRatio={video.aspectRatio}
 *       size={size}
 *       isActive={isActive}
 *       slideKey={slideKey}
 *       onVideoRef={onVideoRef}
 *     />
 *   );
 * }}
 * ```
 */
export interface SlideRenderProps<T extends BaseContentItem> {
  /** The content item for this slide. */
  item: T;

  /** Zero-based index of this slide in the content array. */
  index: number;

  /** [width, height] of the slide in pixels. */
  size: [number, number];

  /** Whether this is the currently active (visible) slide. */
  isActive: boolean;

  /** Unique key for {@link VideoSlide} playback position persistence. Derived from `content.id`. */
  slideKey: string;

  /** Ref to the inner horizontal slider API, required for drag coordination in multi-media slides. */
  innerSliderRef: React.MutableRefObject<ReelApi | null>;

  /** Whether wheel navigation is enabled (forwarded to nested sliders). */
  enableWheel?: boolean;

  /** The default slide content (MediaSlide + overlay). Render this to use default rendering inside your own wrapper. */
  defaultContent: ReactNode;

  /** Report active media type changes in nested sliders (controls sound button visibility). Only provided when `isActive` is true. */
  onActiveMediaTypeChange?: (type: 'image' | 'video') => void;

  /** Custom navigation renderer for nested horizontal sliders. Forwarded from `renderNestedNavigation`. */
  renderNestedNavigation?: (props: NavigationRenderProps) => ReactNode;

  /** Report the active video element to the player for drag pause/resume. Only provided when `isActive` is true. */
  onVideoRef?: (ref: HTMLVideoElement | null) => void;

  /** Signal that the slide content has finished loading. Clears the wave loader. */
  onReady: () => void;

  /** Signal that the slide content is buffering. Shows the wave loader. */
  onWaiting: () => void;

  /** Signal that the slide content failed to load. */
  onError: () => void;
}

/**
 * Props passed to the `renderNestedSlide` callback.
 *
 * Provides everything needed to render a custom slide inside the
 * nested horizontal slider (multi-media carousel). Includes the
 * `defaultContent` for easy wrapping.
 *
 * @example Custom rounded video slides
 * ```tsx
 * renderNestedSlide={({ media, defaultContent }) => (
 *   <div style={{ borderRadius: 16, overflow: 'hidden' }}>
 *     {defaultContent}
 *   </div>
 * )}
 * ```
 */
export interface NestedSlideRenderProps {
  /** The parent content item containing this nested slide. */
  item: BaseContentItem;

  /** The media item for this nested slide. */
  media: MediaItem;

  /** Zero-based index within the nested slider. */
  index: number;

  /** [width, height] of the slide in pixels. */
  size: [number, number];

  /** Whether the parent vertical slide is the active slide. */
  isActive: boolean;

  /** Whether this is the active item within the nested slider. */
  isInnerActive: boolean;

  /** Unique key for {@link VideoSlide} playback position persistence. */
  slideKey: string;

  /** The default slide content (ImageSlide or VideoSlide). Render this to wrap the default with your own styles. */
  defaultContent: ReactNode;

  /** Report the active video element for drag pause/resume. Only provided when `isInnerActive` is true. */
  onVideoRef?: (ref: HTMLVideoElement | null) => void;

  /** Signal that the nested slide content has finished loading. Only provided when `isInnerActive` is true. */
  onReady?: () => void;

  /** Signal that the nested slide content is buffering. Only provided when `isInnerActive` is true. */
  onWaiting?: () => void;

  /** Signal that the nested slide content failed to load. Only provided when `isInnerActive` is true. */
  onError?: () => void;
}

/**
 * Props passed to the `renderNavigation` callback.
 *
 * Use these to build custom navigation arrows while retaining access to
 * slide navigation actions and position info.
 */
export interface NavigationRenderProps {
  /** The currently active content item (main navigation). */
  item: BaseContentItem;

  /** The currently active media item (nested navigation only). */
  media?: MediaItem;

  /** Zero-based index of the currently active slide. */
  activeIndex: number;

  /** Total number of slides. */
  count: number;

  /** Navigate to the previous slide. */
  onPrev: () => void;

  /** Navigate to the next slide. */
  onNext: () => void;
}
