/**
 * @module @reelkit/stories-core
 *
 * Framework-agnostic stories state machine, timer, and utilities for
 * building Instagram-style stories players.
 *
 * Provides {@link createStoriesController} for two-axis navigation
 * (stories within a group and groups), {@link createTimerController}
 * for auto-advance timing, and pure functions for tap zone detection
 * ({@link getTapAction}) and progress bar computation
 * ({@link getSegments}, {@link getVisibleWindow}).
 */

export type {
  MediaType,
  StoryItem,
  AuthorInfo,
  StoriesGroup,
  StoriesControllerConfig,
  StoriesControllerEvents,
  StoriesController,
  SegmentStatus,
  SegmentState,
  VisibleWindow,
  TapAction,
} from './lib/types';

export { createStoriesController } from './lib/storiesController';

export {
  createTimerController,
  type TimerControllerConfig,
  type TimerController,
} from './lib/timerController';

export { getTapAction } from './lib/tapZone';
export { getSegments, getVisibleWindow } from './lib/progress';
