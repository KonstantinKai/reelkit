import { createSignal } from '@reelkit/core';
import type {
  StoriesControllerConfig,
  StoriesControllerEvents,
  StoriesController,
} from './types';

const DEFAULT_IMAGE_DURATION = 5000;
const DEFAULT_TAP_ZONE_SPLIT = 0.3;

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
      initialConfig.defaultImageDuration ?? DEFAULT_IMAGE_DURATION,
    tapZoneSplit: initialConfig.tapZoneSplit ?? DEFAULT_TAP_ZONE_SPLIT,
  };

  let events = { ...initialEvents };

  const activeGroupIndex = createSignal(config.initialGroupIndex);
  const activeStoryIndex = createSignal(config.initialStoryIndex);
  const isPaused = createSignal(false);

  const fireStoryChange = () => {
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
        activeStoryIndex.value = 0;
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
        activeStoryIndex.value = 0;
        fireGroupChange();
        fireStoryChange();
      }
    },

    goToGroup(index: number) {
      if (index < 0 || index >= config.groupCount) return;
      activeGroupIndex.value = index;
      activeStoryIndex.value = 0;
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
