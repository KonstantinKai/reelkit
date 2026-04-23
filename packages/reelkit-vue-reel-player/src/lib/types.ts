import type { Ref, VNode } from 'vue';
import type {
  ReelExpose,
  SoundController,
  TimelineController,
} from '@reelkit/vue';

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
 * Used by the built-in slide overlay to display author info,
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
 * Gating strategy for the built-in playback timeline bar.
 *
 * - `'auto'`: render whenever the active media is a video whose duration
 *   exceeds `timelineMinDurationSeconds`. Works for single-video slides
 *   and multi-media carousels (follows the active nested item).
 * - `'always'`: render whenever the active slide contains a video.
 * - `'never'`: never render the bar. For a fully custom replacement, use
 *   the `#timeline` slot instead; it still respects the same gating logic.
 */
export type TimelineMode = 'auto' | 'always' | 'never';

/** Scope passed to the `controls` slot. */
export interface ControlsSlotScope<
  T extends BaseContentItem = BaseContentItem,
> {
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
 * Scope passed to the `timeline` slot.
 *
 * Only passed when the overlay's gating rules would render the default bar
 * (same `timeline='auto'|'always'|'never'` + `timelineMinDurationSeconds`
 * logic), so consumers don't re-implement it. Use `defaultContent` to wrap
 * the built-in bar, or render a fully custom element from `timelineState`
 * signals.
 */
export interface TimelineSlotScope<
  T extends BaseContentItem = BaseContentItem,
> {
  /** The currently active content item. */
  item: T;

  /** Zero-based index of the currently active slide. */
  activeIndex: number;

  /** Reactive timeline controller: signals plus `bindInteractions` for scrubbing. */
  timelineState: TimelineController;

  /**
   * Default `<TimelineBar />` content as a render function. Call it to
   * include the built-in bar inside a wrapper, or omit to replace entirely.
   */
  defaultContent: () => VNode | VNode[];
}

/** Scope passed to the `navigation` slot. */
export interface NavigationSlotScope<
  T extends BaseContentItem = BaseContentItem,
> {
  /** The currently active content item (vertical navigation). */
  item: T;

  /** The currently active media item (nested horizontal navigation only). */
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

/** Scope passed to the `slide` slot. */
export interface SlideSlotScope<T extends BaseContentItem = BaseContentItem> {
  /** The content item for this slide. */
  item: T;

  /** Zero-based index of this slide in the content array. */
  index: number;

  /** [width, height] of the slide in pixels. */
  size: [number, number];

  /** Whether this is the currently active (visible) slide. */
  isActive: boolean;

  /** Unique key for video playback-position persistence. Derived from `content.id`. */
  slideKey: string;

  /** Ref to the inner horizontal slider API, required for drag coordination in multi-media slides. */
  innerSliderRef: Ref<ReelExpose | null>;

  /** Whether wheel navigation is enabled (forwarded to nested sliders). */
  enableWheel?: boolean;

  /**
   * Default slide content as a render function. Use it to wrap the
   * built-in MediaSlide + overlay inside your own container.
   *
   * - **Render-fn consumers:** call directly, e.g. `h('div', defaultContent())`.
   * - **Template consumers:** render via `<component :is="defaultContent" />`.
   *   Backed by a per-slide stable component cache so the wrapper patches
   *   in place across renders (no remount of the active video).
   *
   * To selectively customize while letting other slides use the default,
   * **omit the slot for those slides**: return nothing from the slot
   * (e.g. `<template #slide="..."><Cta v-if="..." /></template>`) and
   * the parent will fall back to its built-in rendering automatically.
   */
  defaultContent: () => VNode | VNode[];

  /** Report active media type changes in nested sliders. Only provided when `isActive` is true. */
  onActiveMediaTypeChange?: (type: MediaType) => void;

  /** Report the active video element to the player for drag pause/resume. Only provided when `isActive` is true. */
  onVideoRef?: (ref: HTMLVideoElement | null) => void;

  /** Signal that the slide content has finished loading. Clears the wave loader. */
  onReady: () => void;

  /** Signal that the slide content is buffering. Shows the wave loader. */
  onWaiting: () => void;

  /** Signal that the slide content failed to load. */
  onError: () => void;
}

/** Scope passed to the `slideOverlay` slot. */
export interface SlideOverlaySlotScope<
  T extends BaseContentItem = BaseContentItem,
> {
  item: T;
  index: number;
  isActive: boolean;
}

/** Scope passed to the `nestedSlide` slot. */
export interface NestedSlideSlotScope<
  T extends BaseContentItem = BaseContentItem,
> {
  /** The parent content item containing this nested slide. */
  item: T;

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

  /** Unique key for video playback-position persistence. */
  slideKey: string;

  /**
   * Default slide content as a render function (ImageSlide or
   * VideoSlide). See {@link SlideSlotScope.defaultContent} for usage;
   * same template/render-fn patterns apply.
   */
  defaultContent: () => VNode | VNode[];
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  onReady?: () => void;
  onWaiting?: () => void;
  onError?: () => void;
}

/** Scope passed to the `loading` and `error` slots. */
export interface LoadingSlotScope<T extends BaseContentItem = BaseContentItem> {
  item: T;
  activeIndex: number;
}
