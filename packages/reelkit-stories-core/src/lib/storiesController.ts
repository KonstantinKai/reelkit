import { clamp, createSignal } from '@reelkit/core';
import type {
  StoriesControllerConfig,
  StoriesControllerEvents,
  StoriesController,
} from './types';

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
    const lastStory = Math.max(getStoryCount(groupIndex) - 1, 0);
    return clamp(resumed, 0, lastStory);
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
