import type { Signal } from '@reelkit/react';
import type {
  StoryItem,
  AuthorInfo,
  StoriesGroup,
} from '@reelkit/stories-core';

export type { StoryItem, AuthorInfo, StoriesGroup };
export type { MediaType } from '@reelkit/stories-core';

/**
 * Render props passed to the story header renderer.
 *
 * @typeParam T - Story item type.
 */
export interface HeaderRenderProps<T extends StoryItem = StoryItem> {
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

  /** Zero-based index of the group this header belongs to. */
  groupIndex: number;

  /**
   * False for the header of a neighbouring group, drawn while the player turns
   * to it or away from it with `chromePlacement="group"`. Such a header shows
   * where that group stands; its actions still act on the active story.
   */
  isActive: boolean;

  /** The same action the default header's sound button takes. */
  onToggleSound: () => void;

  /** The same action the default header's pause button takes. */
  onTogglePause: () => void;

  /** Closes the player the way Escape does, through the overlay's own path. */
  onClose: () => void;
}

/**
 * Render props passed to the story footer renderer.
 *
 * @typeParam T - Story item type.
 */
export interface FooterRenderProps<T extends StoryItem = StoryItem> {
  /** Author information for the current group. */
  author: AuthorInfo;

  /** Currently active story item. */
  story: T;

  /** Zero-based index of the active story within the group. */
  storyIndex: number;
}

/**
 * Render props passed to the custom slide renderer.
 *
 * @typeParam T - Story item type.
 */
export interface SlideRenderProps<T extends StoryItem = StoryItem> {
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

  /** Report the actual media duration (e.g. from video metadata) to restart the timer. */
  onDurationReady: (durationMs: number) => void;

  /** Called when content is ready (image loaded or video playing). */
  onReady: () => void;

  /** Called when content stalls (video buffering mid-playback). */
  onWaiting: () => void;

  /** Called when content fails to load. */
  onError: () => void;

  /** Signal that the media has ended (e.g. video finished). */
  onEnded: () => void;
}

/**
 * Render props passed to the custom loading renderer.
 *
 * @typeParam T - Story item type.
 */
export interface LoadingRenderProps<T extends StoryItem = StoryItem> {
  /** The story item that is loading. */
  story: T;

  /** Zero-based index of the story within the group. */
  storyIndex: number;

  /** Zero-based index of the group. */
  groupIndex: number;
}

/**
 * Render props passed to the custom error renderer.
 *
 * @typeParam T - Story item type.
 */
export interface ErrorRenderProps<T extends StoryItem = StoryItem> {
  /** The story item that failed to load. */
  story: T;

  /** Zero-based index of the story within the group. */
  storyIndex: number;

  /** Zero-based index of the group. */
  groupIndex: number;
}

/**
 * Render props passed to the custom navigation renderer.
 */
export interface NavigationRenderProps {
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
 * Render props passed to the custom progress bar renderer.
 *
 * @typeParam T - Story item type.
 */
export interface ProgressBarRenderProps<T extends StoryItem = StoryItem> {
  /** Total number of stories in the current group. */
  totalStories: number;

  /** Active story index signal. */
  activeIndex: Signal<number>;

  /** Timer progress signal (0–1). */
  progress: Signal<number>;

  /** Current group. */
  group: StoriesGroup<T>;

  /** Zero-based index of that group. */
  groupIndex: number;

  /**
   * False for the bar of a neighbouring group, drawn while the player turns to
   * it or away from it with `chromePlacement="group"`. Its signals then hold
   * still: the story the group stands on, and how far that story had played.
   */
  isActive: boolean;
}

/**
 * Where the progress bar and the header live. `'overlay'` draws one copy above
 * the player that switches to the new group when the group changes.
 * `'group'` gives every group its own copy inside its slide, so both turn with
 * the group the way they do on Instagram.
 */
export type ChromePlacement = 'overlay' | 'group';

/**
 * How the player lays out on a desktop screen. `'single'` shows the active
 * story alone; `'carousel'` also shows neighbouring groups as preview cards on
 * both sides, the way the Instagram desktop viewer does. Phones always show
 * the active story alone.
 */
export type DesktopLayout = 'single' | 'carousel';

/**
 * Render props passed to the custom group preview renderer, which draws one
 * side card of the desktop carousel.
 *
 * @typeParam T - Story item type.
 */
export interface GroupPreviewRenderProps<T extends StoryItem = StoryItem> {
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
 * Imperative API for controlling the stories player programmatically.
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
