import { createSignal } from '@reelkit/core';
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
    initialStoryIndex: initialConfig.initialStoryIndex ?? 0,
    defaultImageDuration:
      initialConfig.defaultImageDuration ?? _kDefaultImageDuration,
  };

  let events = { ...initialEvents };

  const activeGroupIndex = createSignal(config.initialGroupIndex);
  const activeStoryIndex = createSignal(config.initialStoryIndex);
  const isPaused = createSignal(false);

  // Track last viewed story index per group for resume on return
  const lastStoryPerGroup = new Map<number, number>();
  lastStoryPerGroup.set(config.initialGroupIndex, config.initialStoryIndex);

  const fireStoryChange = () => {
    lastStoryPerGroup.set(activeGroupIndex.value, activeStoryIndex.value);
    events.onStoryChange?.(activeGroupIndex.value, activeStoryIndex.value);
    events.onStoryViewed?.(activeGroupIndex.value, activeStoryIndex.value);
  };

  const fireGroupChange = () => {
    events.onGroupChange?.(activeGroupIndex.value);
  };

  const getStoryCount = (groupIndex: number) =>
    config.storyCounts[groupIndex] ?? 0;

  return {
    state: { activeGroupIndex, activeStoryIndex, isPaused },

    getLastStoryIndex(groupIndex: number): number {
      return lastStoryPerGroup.get(groupIndex) ?? 0;
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
        activeStoryIndex.value = lastStoryPerGroup.get(nextGroup) ?? 0;
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
        activeStoryIndex.value = lastStoryPerGroup.get(prevGroup) ?? 0;
        fireGroupChange();
        fireStoryChange();
      }
    },

    goToGroup(index: number) {
      if (index < 0 || index >= config.groupCount) return;
      activeGroupIndex.value = index;
      activeStoryIndex.value = lastStoryPerGroup.get(index) ?? 0;
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

    dispose() {
      events = {};
    },
  };
};
