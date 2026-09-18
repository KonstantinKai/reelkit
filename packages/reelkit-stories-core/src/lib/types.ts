export type MediaType = 'image' | 'video';

export interface StoryItem {
  /** Unique identifier. */
  id: string;

  /** Whether the story is an image or video. */
  mediaType: MediaType;

  /** Media source URL. */
  src: string;

  /** Video poster image URL. */
  poster?: string;

  /**
   * Auto-advance duration override in ms.
   * Images default to 5000. Videos use their natural duration.
   */
  duration?: number;

  /** When the story was created. */
  createdAt?: string | Date;

  /** Media aspect ratio (width / height). */
  aspectRatio?: number;
}

export interface AuthorInfo {
  /** Unique identifier. */
  id: string;

  /** Display name. */
  name: string;

  /** Avatar image URL. */
  avatar: string;

  /** Whether the author has a verified badge. */
  verified?: boolean;
}

export interface StoriesGroup<T extends StoryItem = StoryItem> {
  /** Author information. */
  author: AuthorInfo;

  /** Ordered list of stories in this group. */
  stories: T[];
}

export interface StoriesControllerConfig {
  /** Total number of story groups. */
  groupCount: number;

  /** Number of stories in each group. */
  storyCounts: number[];

  /**
   * Initial group index.
   * @default 0
   */
  initialGroupIndex?: number;

  /**
   * Initial story index within the group. Naming one outright wins over
   * anything remembered, which is what makes a shared link open where it
   * points; leave it out and the opening group resumes through
   * {@link StoriesControllerConfig.resumeStoryIndex} like any other.
   *
   * @default resumeStoryIndex(initialGroupIndex), or 0 with no resume callback
   */
  initialStoryIndex?: number;

  /**
   * Default auto-advance duration for image stories in ms.
   * @default 5000
   */
  defaultImageDuration?: number;

  /**
   * Where a group should open the first time it is reached this session —
   * how a remembered "seen up to here" reaches the player. Called only for a
   * group with no position from this session, and its answer is bounded to a
   * story the group has, so an out-of-range suggestion cannot open nothing.
   *
   * @default undefined — every unvisited group opens on its first story
   */
  resumeStoryIndex?: (groupIndex: number) => number;
}

export interface StoriesControllerEvents {
  /** Fired when the active story changes. */
  onStoryChange?: (groupIndex: number, storyIndex: number) => void;

  /** Fired when the active group changes. */
  onGroupChange?: (groupIndex: number) => void;

  /** Fired when a story becomes visible. */
  onStoryViewed?: (groupIndex: number, storyIndex: number) => void;

  /** Fired when a story's timer completes (before advancing). */
  onStoryComplete?: (groupIndex: number, storyIndex: number) => void;

  /** Fired when the last story of the last group finishes. */
  onComplete?: () => void;

  /** Fired when the overlay should close. */
  onClose?: () => void;
}

export type SegmentStatus = 'completed' | 'active' | 'upcoming';

export interface SegmentState {
  /** Whether this segment is completed, active, or upcoming. */
  status: SegmentStatus;

  /** Fill percentage (0–100). 100 for completed, 0 for upcoming, variable for active. */
  fillPercentage: number;
}

export interface VisibleWindow {
  /** First visible segment index. */
  startIndex: number;

  /** Last visible segment index. */
  endIndex: number;

  /** Segment states within the window. */
  segments: SegmentState[];
}

export type TapAction = 'prev' | 'next';
