interface HeaderSlotScope<T extends StoryItem = StoryItem> {
  author: AuthorInfo;
  story: T;
  storyIndex: number;
  isPaused: boolean;
  isMuted: boolean;
  /** True while the active story is a video — gate your sound button on it. */
  isVideo: boolean;
  groupIndex: number;
  /** False for a neighbouring group's header with chrome-placement="group". */
  isActive: boolean;
  onToggleSound: () => void;
  onTogglePause: () => void;
  onClose: () => void;
}

interface FooterSlotScope<T extends StoryItem = StoryItem> {
  author: AuthorInfo;
  story: T;
  storyIndex: number;
}

interface SlideSlotScope<T extends StoryItem = StoryItem> {
  story: T;
  index: number;
  groupIndex: number;
  /** False for the copy a carousel card draws. */
  isActive: boolean;
  size: [number, number];
  activeGroupIndex: Signal<number>;
  activeStoryIndex: Signal<number>;
  /** Report the real media length, in milliseconds. */
  onDurationReady: (durationMs: number) => void;
  onReady: () => void;
  onWaiting: () => void;
  onError: () => void;
  onEnded: () => void;
}

interface NavigationSlotScope {
  onPrevStory: () => void;
  onNextStory: () => void;
  onPrevGroup: () => void;
  onNextGroup: () => void;
}

interface ProgressBarSlotScope<T extends StoryItem = StoryItem> {
  totalStories: number;
  activeIndex: Signal<number>;
  /** 0 to 1 for the active story. Bridge it with toVueRef. */
  progress: Signal<number>;
  group: StoriesGroup<T>;
  groupIndex: number;
  /** False: the signals hold still for a neighbouring group. */
  isActive: boolean;
}

interface LoadingSlotScope<T extends StoryItem = StoryItem> {
  story: T;
  storyIndex: number;
  groupIndex: number;
}

/** Same shape as LoadingSlotScope. */
interface ErrorSlotScope<T extends StoryItem = StoryItem> {
  story: T;
  storyIndex: number;
  groupIndex: number;
}

interface GroupPreviewSlotScope<T extends StoryItem = StoryItem> {
  group: StoriesGroup<T>;
  groupIndex: number;
  /** The story the group would open on, if it has one. */
  story: T | undefined;
  /** Negative left, positive right, 0 while sliding through the center. */
  offset: number;
  viewedCount: number;
  onOpen: () => void;
}

interface StoriesApi {
  nextStory: () => void;
  prevStory: () => void;
  nextGroup: () => void;
  prevGroup: () => void;
  goToGroup: (index: number) => void;
  pause: () => void;
  resume: () => void;
}
