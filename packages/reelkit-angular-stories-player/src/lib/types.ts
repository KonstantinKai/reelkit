import type { CoreSignal } from '@reelkit/angular';
import type {
  StoryItem,
  AuthorInfo,
  StoriesGroup,
} from '@reelkit/stories-core';

export type { StoryItem, AuthorInfo, StoriesGroup };
export type { MediaType } from '@reelkit/stories-core';

/**
 * Context handed to a `[rkStoriesHeader]` template.
 *
 * Every value here is already a plain one, read at the moment the template
 * renders; the player re-renders it when any of them changes.
 *
 * @typeParam T - Story item type.
 */
export interface StoriesHeaderContext<T extends StoryItem = StoryItem> {
  /** Author of the current group. */
  $implicit: AuthorInfo;

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
 * Context handed to a `[rkStoriesFooter]` template.
 *
 * @typeParam T - Story item type.
 */
export interface StoriesFooterContext<T extends StoryItem = StoryItem> {
  /** Currently active story item. */
  $implicit: T;

  /** Author of the current group. */
  author: AuthorInfo;

  /** Zero-based index of the active story within the group. */
  storyIndex: number;
}

/**
 * Context handed to a `[rkStoriesSlide]` template, which replaces the built-in
 * image and video rendering for one story.
 *
 * @typeParam T - Story item type.
 */
export interface StoriesSlideContext<T extends StoryItem = StoryItem> {
  /** The story item to render. */
  $implicit: T;

  /** Zero-based index of the story within its group. */
  index: number;

  /** Group index this slide belongs to. */
  groupIndex: number;

  /** Whether this slide is currently visible and active. */
  isActive: boolean;

  /** Current slider dimensions as `[width, height]`. */
  size: [number, number];

  /**
   * Active group index, for a slide that renders across group changes. A core
   * signal, because what a slide template does with it is hand it back to
   * `RkVideoStorySlideComponent`, which is what the react and vue slots do.
   */
  activeGroupIndex: CoreSignal<number>;

  /** Active story index within the group, for the same reason. */
  activeStoryIndex: CoreSignal<number>;

  /** Report real media length, e.g. from video metadata, to restart the timer. */
  onDurationReady: (durationMs: number) => void;

  /** Content is ready: the image loaded, or the video started playing. */
  onReady: () => void;

  /** Content stalled, e.g. a video buffering mid-playback. */
  onWaiting: () => void;

  /** Content failed to load. */
  onError: () => void;

  /** The media finished on its own, e.g. a video played to its end. */
  onEnded: () => void;
}

/**
 * Context handed to a `[rkStoriesProgressBar]` template.
 *
 * @typeParam T - Story item type.
 */
export interface StoriesProgressBarContext<T extends StoryItem = StoryItem> {
  /** The group being drawn. */
  $implicit: StoriesGroup<T>;

  /** Number of stories in that group. */
  totalStories: number;

  /** Active story index within the group. */
  activeIndex: CoreSignal<number>;

  /** Timer progress through the active story, from 0 to 1. */
  progress: CoreSignal<number>;

  /** Zero-based index of that group. */
  groupIndex: number;

  /**
   * False for the bar of a neighbouring group, drawn while the player turns to
   * it or away from it with `chromePlacement="group"`. Its signals then hold
   * still: the story the group stands on, and how far that story had played.
   */
  isActive: boolean;
}

/** The four moves a navigation control can make. */
export interface StoriesNavigationActions {
  /** Move to the previous story in the current group. */
  onPrevStory: () => void;

  /** Move to the next story in the current group. */
  onNextStory: () => void;

  /** Move to the previous group. */
  onPrevGroup: () => void;

  /** Move to the next group. */
  onNextGroup: () => void;
}

/**
 * Context handed to a `[rkStoriesNavigation]` template, which replaces the
 * previous and next controls.
 *
 * The moves arrive as the implicit value, so `let-nav` is all a template
 * needs: `nav.onNextStory()`.
 */
export interface StoriesNavigationContext {
  /** The moves the control can make. */
  $implicit: StoriesNavigationActions;
}

/**
 * Context handed to a `[rkStoriesLoading]` template.
 *
 * @typeParam T - Story item type.
 */
export interface StoriesLoadingContext<T extends StoryItem = StoryItem> {
  /** The story that is loading. */
  $implicit: T;

  /** Zero-based index of the story within its group. */
  storyIndex: number;

  /** Zero-based index of the group. */
  groupIndex: number;
}

/**
 * Context handed to a `[rkStoriesError]` template.
 *
 * @typeParam T - Story item type.
 */
export interface StoriesErrorContext<T extends StoryItem = StoryItem> {
  /** The story that failed to load. */
  $implicit: T;

  /** Zero-based index of the story within its group. */
  storyIndex: number;

  /** Zero-based index of the group. */
  groupIndex: number;
}

/**
 * How the player lays out on a desktop screen. `'single'` shows the active
 * story alone; `'carousel'` also shows neighbouring groups as preview cards on
 * both sides, the way the Instagram desktop viewer does. Phones always show
 * the active story alone.
 */
export type DesktopLayout = 'single' | 'carousel';

/**
 * Where the progress bar and the header live. `'overlay'` draws one copy above
 * the player that switches to the new group when the group changes.
 * `'group'` gives every group its own copy inside its slide, so both turn with
 * the group the way they do on Instagram.
 */
export type ChromePlacement = 'overlay' | 'group';

/**
 * Context handed to a `[rkStoriesGroupPreview]` template, which draws one side
 * card of the desktop carousel.
 *
 * @typeParam T - Story item type.
 */
export interface StoriesGroupPreviewContext<T extends StoryItem = StoryItem> {
  /** The group the card previews. */
  $implicit: StoriesGroup<T>;

  /** Zero-based index of that group. */
  groupIndex: number;

  /**
   * The story the group would open on — where it was left this session, or
   * where `resumeStoryIndex` points. Undefined for a group with no stories.
   */
  story: T | undefined;

  /**
   * Distance from the active group: negative on the left, positive on the
   * right, 0 while the card slides through the centre.
   */
  offset: number;

  /** Stories of the group already seen, from `viewed`; 0 without it. */
  viewedCount: number;

  /** Opens the group on the same story a click on the default card would. */
  onOpen: () => void;
}

/**
 * Imperative handle on the player, emitted by the overlay's `apiReady` output
 * for a component that drives playback itself.
 */
export interface StoriesApi {
  /** Advance to the next story within the current group. */
  nextStory: () => void;

  /** Go back to the previous story within the current group. */
  prevStory: () => void;

  /** Switch to the next group. */
  nextGroup: () => void;

  /** Switch to the previous group. */
  prevGroup: () => void;

  /** Jump to a group by index. */
  goToGroup: (index: number) => void;

  /** Pause auto-advance and the progress timer. */
  pause: () => void;

  /** Resume auto-advance and the progress timer. */
  resume: () => void;
}
