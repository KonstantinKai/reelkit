import { clamp, createSignal, type Signal } from '@reelkit/core';
import type { StoriesControllerConfig, StoriesControllerEvents } from './types';

export interface StoriesController {
  /** Reactive state signals. */
  readonly state: {
    activeGroupIndex: Signal<number>;
    activeStoryIndex: Signal<number>;
    isPaused: Signal<boolean>;
  };

  /**
   * Where a group opens: the story it was left on this session, or the one
   * `resumeStoryIndex` names for a group not yet visited (its first story when
   * nothing is configured).
   */
  getLastStoryIndex: (groupIndex: number) => number;

  /**
   * Replaces the group and story counts, for a feed that changes while the
   * player is open: more groups paged in, or a story added to a group. The
   * counts are copied when the controller is created, so until this is called
   * a group past the original count cannot be reached, and the last original
   * group closes the player instead of moving on.
   *
   * Fires no event. Positions are kept by group index, so where each group was
   * left survives groups being appended; inserting or removing groups before
   * the end shifts them. If the feed shrank, the active position and every
   * remembered one are pulled back to a group and story that still exist.
   *
   * @example Follow a feed that loads more groups
   * ```ts
   * controller.updateConfig({
   *   groupCount: groups.length,
   *   storyCounts: groups.map((group) => group.stories.length),
   * });
   * ```
   */
  updateConfig: (
    config: Pick<StoriesControllerConfig, 'groupCount' | 'storyCounts'>,
  ) => void;

  /**
   * Reports the story the player opened on as viewed, once.
   *
   * Navigation is what normally marks a story viewed, so the very first story
   * — the one already on screen before anything is tapped — would otherwise go
   * unreported, and a group holding a single story could never be marked seen.
   * Call this after mounting, not while rendering: it invokes `onStoryViewed`,
   * and a consumer's handler is free to write state from it.
   *
   * A no-op once anything has been viewed, so calling it late or twice cannot
   * double-count.
   */
  reportInitialView: () => void;

  /** Advance to the next story, switching groups at boundary. */
  nextStory: () => void;

  /** Go to the previous story, switching groups at boundary. */
  prevStory: () => void;

  /**
   * Switches to the next group, opening it where `getLastStoryIndex` says.
   * Past the last group it fires `onComplete` and `onClose` instead.
   */
  nextGroup: () => void;

  /**
   * Switches to the previous group, opening it where `getLastStoryIndex`
   * says. Does nothing on the first group.
   */
  prevGroup: () => void;

  /** Jump to a specific group by index. */
  goToGroup: (index: number) => void;

  /** Pause auto-advance. */
  pause: () => void;

  /** Resume auto-advance. */
  resume: () => void;

  /** Called when the timer for the current story completes. */
  onStoryTimerComplete: () => void;
}

const _kDefaultImageDuration = 5000;

/**
 * Creates the central stories state machine that manages two-axis
 * navigation (stories within a group and groups), pause/resume, and
 * auto-advance coordination.
 */
export const createStoriesController = (
  initialConfig: StoriesControllerConfig,
  initialEvents: StoriesControllerEvents = {},
): StoriesController => {
  const config = {
    groupCount: initialConfig.groupCount,
    storyCounts: [...initialConfig.storyCounts],
    initialGroupIndex: initialConfig.initialGroupIndex ?? 0,
    initialStoryIndex: initialConfig.initialStoryIndex,
    defaultImageDuration:
      initialConfig.defaultImageDuration ?? _kDefaultImageDuration,
    resumeStoryIndex: initialConfig.resumeStoryIndex,
  };

  const events = { ...initialEvents };

  const getStoryCount = (groupIndex: number) =>
    config.storyCounts[groupIndex] ?? 0;

  const lastStoryOf = (groupIndex: number) =>
    Math.max(getStoryCount(groupIndex) - 1, 0);

  /**
   * Where a group opens the first time it is reached: what `resumeStoryIndex`
   * names, which is how a persisted "seen up to here" reaches the player,
   * bounded to a story the group actually has.
   */
  const resumedStoryIndex = (groupIndex: number): number => {
    const suggested = config.resumeStoryIndex?.(groupIndex) ?? 0;

    // The answer is computed by a consumer, so it can arrive as anything a
    // number can be. Only a whole one names a story: a fraction would index
    // nothing, and a value that is not a number at all carries no opinion, so
    // the group starts at its beginning.
    const resumed = Number.isFinite(suggested) ? Math.trunc(suggested) : 0;
    return clamp(resumed, 0, lastStoryOf(groupIndex));
  };

  // The group the player opens on is reached for the first time like any other,
  // so it resumes like any other. An explicit `initialStoryIndex` still wins —
  // that is a caller naming the story outright, which is what a shared link
  // does, and a link beats what was remembered.
  const openingStoryIndex =
    config.initialStoryIndex ?? resumedStoryIndex(config.initialGroupIndex);

  const activeGroupIndex = createSignal(config.initialGroupIndex);
  const activeStoryIndex = createSignal(openingStoryIndex);
  const isPaused = createSignal(false);

  // Track last viewed story index per group for resume on return
  const lastStoryPerGroup = new Map<number, number>();
  lastStoryPerGroup.set(config.initialGroupIndex, openingStoryIndex);

  let hasReportedInitialView = false;

  /**
   * Where a group should open. Somewhere already visited reopens exactly where
   * it was left, whatever a caller might suggest — nothing beats the viewer's
   * own position this session.
   */
  const storyIndexFor = (groupIndex: number): number =>
    lastStoryPerGroup.get(groupIndex) ?? resumedStoryIndex(groupIndex);

  const fireStoryChange = () => {
    hasReportedInitialView = true;
    lastStoryPerGroup.set(activeGroupIndex.value, activeStoryIndex.value);
    events.onStoryChange?.(activeGroupIndex.value, activeStoryIndex.value);
    events.onStoryViewed?.(activeGroupIndex.value, activeStoryIndex.value);
  };

  const fireGroupChange = () => {
    events.onGroupChange?.(activeGroupIndex.value);
  };

  return {
    state: { activeGroupIndex, activeStoryIndex, isPaused },

    getLastStoryIndex(groupIndex: number): number {
      return storyIndexFor(groupIndex);
    },

    updateConfig({ groupCount, storyCounts }) {
      config.groupCount = groupCount;
      config.storyCounts = [...storyCounts];

      // A feed that shrank can leave positions pointing past its end.
      for (const [groupIndex, storyIndex] of lastStoryPerGroup) {
        if (groupIndex >= groupCount) {
          lastStoryPerGroup.delete(groupIndex);
        } else {
          lastStoryPerGroup.set(
            groupIndex,
            clamp(storyIndex, 0, lastStoryOf(groupIndex)),
          );
        }
      }

      const groupIndex = clamp(
        activeGroupIndex.value,
        0,
        Math.max(groupCount - 1, 0),
      );
      const storyIndex =
        groupIndex === activeGroupIndex.value
          ? clamp(activeStoryIndex.value, 0, lastStoryOf(groupIndex))
          : storyIndexFor(groupIndex);
      activeGroupIndex.value = groupIndex;
      activeStoryIndex.value = storyIndex;
      lastStoryPerGroup.set(groupIndex, storyIndex);
    },

    reportInitialView() {
      if (hasReportedInitialView) return;
      hasReportedInitialView = true;
      events.onStoryViewed?.(activeGroupIndex.value, activeStoryIndex.value);
    },

    nextStory() {
      const storyCount = getStoryCount(activeGroupIndex.value);
      const nextStory = activeStoryIndex.value + 1;

      if (nextStory < storyCount) {
        activeStoryIndex.value = nextStory;
        fireStoryChange();
      } else {
        this.nextGroup();
      }
    },

    prevStory() {
      const prevStory = activeStoryIndex.value - 1;

      if (prevStory >= 0) {
        activeStoryIndex.value = prevStory;
        fireStoryChange();
      } else {
        this.prevGroup();
      }
    },

    nextGroup() {
      const nextGroup = activeGroupIndex.value + 1;

      if (nextGroup < config.groupCount) {
        activeGroupIndex.value = nextGroup;
        activeStoryIndex.value = storyIndexFor(nextGroup);
        fireGroupChange();
        fireStoryChange();
      } else {
        events.onComplete?.();
        events.onClose?.();
      }
    },

    prevGroup() {
      const prevGroup = activeGroupIndex.value - 1;

      if (prevGroup >= 0) {
        activeGroupIndex.value = prevGroup;
        activeStoryIndex.value = storyIndexFor(prevGroup);
        fireGroupChange();
        fireStoryChange();
      }
    },

    goToGroup(index: number) {
      if (index < 0 || index >= config.groupCount) return;
      activeGroupIndex.value = index;
      activeStoryIndex.value = storyIndexFor(index);
      fireGroupChange();
      fireStoryChange();
    },

    pause() {
      isPaused.value = true;
    },

    resume() {
      isPaused.value = false;
    },

    onStoryTimerComplete() {
      events.onStoryComplete?.(activeGroupIndex.value, activeStoryIndex.value);
      this.nextStory();
    },
  };
};
