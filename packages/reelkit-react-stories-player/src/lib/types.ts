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

  /** Whether the story is currently paused. */
  isPaused: boolean;

  /** Whether audio is muted. */
  isMuted: boolean;

  /** Whether the current story is a video. */
  isVideo: boolean;

  /** Toggle mute/unmute. */
  onToggleSound: () => void;

  /** Toggle pause/resume. */
  onTogglePause: () => void;

  /** Callback to close the overlay. */
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
}

/**
 * Imperative API for controlling the stories player programmatically.
 */
export interface StoriesApi {
  /** Advance to the next story within the current group. */
  nextStory(): void;

  /** Go to the previous story within the current group. */
  prevStory(): void;

  /** Switch to the next user group. */
  nextGroup(): void;

  /** Switch to the previous user group. */
  prevGroup(): void;

  /** Jump to a specific group by index. */
  goToGroup(index: number): void;

  /** Pause auto-advance and the progress timer. */
  pause(): void;

  /** Resume auto-advance and the progress timer. */
  resume(): void;
}
