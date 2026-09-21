/**
 * @module @reelkit/stories-core
 *
 * Framework-agnostic stories state machine, timer, and utilities for
 * building Instagram-style stories players.
 *
 * Provides {@link createStoriesController} for two-axis navigation
 * (stories within a group and groups), {@link createTimerController}
 * for auto-advance timing, {@link createCanvasProgressRenderer} for
 * framework-agnostic canvas progress bar rendering, and pure functions
 * for tap zone detection ({@link getTapAction}) and progress bar
 * computation ({@link getSegments}, {@link getVisibleWindow}).
 *
 * The layout helpers every binding shares live here too: the story canvas
 * size ({@link getStoriesSize}), the desktop carousel geometry
 * ({@link getCarouselSlot} and its neighbours), the ring look
 * ({@link getRingPresentation}) and the relative time label
 * ({@link formatTimeAgo}).
 */

export type {
  MediaType,
  StoryItem,
  AuthorInfo,
  StoriesGroup,
  StoriesControllerConfig,
  StoriesControllerEvents,
  SegmentStatus,
  SegmentState,
  VisibleWindow,
  TapAction,
} from './lib/types';

export {
  createStoriesController,
  type StoriesController,
} from './lib/storiesController';

export {
  createStoriesViewedStateController,
  type StoriesViewedStateController,
  type StoriesViewedStateControllerConfig,
} from './lib/storiesViewedState';

export {
  createTimerController,
  type TimerControllerConfig,
  type TimerController,
} from './lib/timerController';

export { getTapAction } from './lib/tapZone';
export { getSegments, getVisibleWindow } from './lib/progress';

export {
  createCanvasProgressRenderer,
  type CanvasProgressRendererConfig,
  type CanvasProgressRenderer,
} from './lib/canvasProgressRenderer';

export {
  getStoriesSize,
  isMobileWidth,
  parseDurationMs,
  getCardSize,
  getCarouselSlot,
  getCardOffsets,
  isCardShown,
  getSlotOffset,
  getSlideGroupIndexes,
  type CarouselSlot,
} from './lib/layout';

export { formatTimeAgo } from './lib/timeAgo';

export {
  getRingPresentation,
  type RingPresentationOptions,
  type RingPresentation,
} from './lib/ringPresentation';
