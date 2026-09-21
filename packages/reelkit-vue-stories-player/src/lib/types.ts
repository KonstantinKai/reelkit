import type { Signal } from '@reelkit/vue';
import type {
  StoryItem,
  AuthorInfo,
  StoriesGroup,
} from '@reelkit/stories-core';

export type { StoryItem, AuthorInfo, StoriesGroup };
export type { MediaType } from '@reelkit/stories-core';

/**
 * Scope of the `header` slot, which replaces the default story header.
 *
 * @typeParam T - Story item type.
 */
export interface HeaderSlotScope<T extends StoryItem = StoryItem> {
  /** Author information for the current group. */
  author: AuthorInfo;

  /** Currently active story item. */
  story: T;

  /** Zero-based index of the active story within the group. */
  storyIndex: number;

  /** True during a long press as well, not only an explicit pause. */
  isPaused: boolean;

  /** The sound setting every story shares, not this one's. */
  isMuted: boolean;

  /** Gate a sound control on this: an image story has nothing to unmute. */
  isVideo: boolean;

  /** The same action the default header's sound button takes. */
  onToggleSound: () => void;

  /** The same action the default header's pause button takes. */
  onTogglePause: () => void;

  /** Closes the player the way Escape does, through the overlay's own path. */
  onClose: () => void;
}

/**
 * Scope of the `footer` slot, rendered under the active group's stories.
 *
 * @typeParam T - Story item type.
 */
export interface FooterSlotScope<T extends StoryItem = StoryItem> {
  /** Author information for the current group. */
  author: AuthorInfo;

  /** Currently active story item. */
  story: T;

  /** Zero-based index of the active story within the group. */
  storyIndex: number;
}

/**
 * Scope of the `slide` slot, which replaces the default media slides.
 *
 * @typeParam T - Story item type.
 */
export interface SlideSlotScope<T extends StoryItem = StoryItem> {
  /** The story item to render. */
  story: T;

  /** Zero-based index of the story within the group. */
  index: number;

  /** Group index this slide belongs to. */
  groupIndex: number;

  /** Whether this slide is currently visible and active. */
  isActive: boolean;

  /** Current slider dimensions as `[width, height]`. */
  size: [number, number];

  /** Active group index signal from the stories controller. */
  activeGroupIndex: Signal<number>;

  /** Active story index signal from the stories controller. */
  activeStoryIndex: Signal<number>;

  /** Report the actual media duration (for example from video metadata) to restart the timer. */
  onDurationReady: (durationMs: number) => void;

  /** Call when the content is ready (image loaded or video playing). */
  onReady: () => void;

  /** Call when the content stalls (video buffering mid-playback). */
  onWaiting: () => void;

  /** Call when the content fails to load. */
  onError: () => void;

  /** Call when the media has ended (for example a video finished). */
  onEnded: () => void;
}

/**
 * Scope of the `loading` slot, shown over the active story while it loads.
 *
 * @typeParam T - Story item type.
 */
export interface LoadingSlotScope<T extends StoryItem = StoryItem> {
  /** The story item that is loading. */
  story: T;

  /** Zero-based index of the story within the group. */
  storyIndex: number;

  /** Zero-based index of the group. */
  groupIndex: number;
}

/**
 * Scope of the `error` slot, shown over the active story when it fails to load.
 *
 * @typeParam T - Story item type.
 */
export interface ErrorSlotScope<T extends StoryItem = StoryItem> {
  /** The story item that failed to load. */
  story: T;

  /** Zero-based index of the story within the group. */
  storyIndex: number;

  /** Zero-based index of the group. */
  groupIndex: number;
}

/** Scope of the `navigation` slot, which replaces both desktop arrows. */
export interface NavigationSlotScope {
  /** Navigate to the previous story. */
  onPrevStory: () => void;

  /** Navigate to the next story. */
  onNextStory: () => void;

  /** Switch to the previous group. */
  onPrevGroup: () => void;

  /** Switch to the next group. */
  onNextGroup: () => void;
}

/**
 * Scope of the `progressBar` slot, which replaces the canvas progress bar.
 *
 * @typeParam T - Story item type.
 */
export interface ProgressBarSlotScope<T extends StoryItem = StoryItem> {
  /** Total number of stories in the current group. */
  totalStories: number;

  /** Active story index signal. */
  activeIndex: Signal<number>;

  /** Timer progress signal, from 0 to 1. */
  progress: Signal<number>;

  /** Current group. */
  group: StoriesGroup<T>;
}

/**
 * How the player lays out on a desktop screen. `'single'` shows the active
 * story alone; `'carousel'` also shows neighbouring groups as preview cards on
 * both sides, the way the Instagram desktop viewer does. Phones always show
 * the active story alone.
 */
export type DesktopLayout = 'single' | 'carousel';

/**
 * Scope of the `groupPreview` slot, which draws the content of one side card
 * of the desktop carousel.
 *
 * @typeParam T - Story item type.
 */
export interface GroupPreviewSlotScope<T extends StoryItem = StoryItem> {
  /** The group the card previews. */
  group: StoriesGroup<T>;

  /** Zero-based index of that group. */
  groupIndex: number;

  /**
   * The story the group would open on — where it was left this session, or
   * where `resumeStoryIndex` points. Undefined for a group with no stories.
   */
  story: T | undefined;

  /**
   * Distance from the active group: negative on the left, positive on the
   * right, 0 while the card slides through the center.
   */
  offset: number;

  /** Stories of the group already seen, from `viewed`; 0 without it. */
  viewedCount: number;

  /** Opens the group, with the same slide as a click on the default card. */
  onOpen: () => void;
}

/**
 * Imperative API for controlling the stories player programmatically, exposed
 * through a template ref and the `apiReady` event.
 */
export interface StoriesApi {
  /** Advance to the next story within the current group. */
  nextStory: () => void;

  /** Go to the previous story within the current group. */
  prevStory: () => void;

  /** Switch to the next user group. */
  nextGroup: () => void;

  /** Switch to the previous user group. */
  prevGroup: () => void;

  /** Jump to a specific group by index. */
  goToGroup: (index: number) => void;

  /** Pause auto-advance and the progress timer. */
  pause: () => void;

  /** Resume auto-advance and the progress timer. */
  resume: () => void;
}
