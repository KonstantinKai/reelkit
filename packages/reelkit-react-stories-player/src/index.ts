/**
 * @module @reelkit/react-stories-player
 *
 * Instagram-style stories player overlay for React. Full-screen vertical
 * content viewer with two-axis navigation: tap left/right to advance within
 * a user's stories, swipe left/right with a 3D flip transition to switch
 * between users.
 *
 * The main component is {@link StoriesOverlay}. Entry-point components
 * {@link StoriesRing} and {@link StoriesRingList} render the circular
 * avatar rings that open the overlay.
 */

export { StoriesOverlay } from './lib/StoriesOverlay';
export { StoriesRing } from './lib/StoriesRing';
export { StoriesRingList } from './lib/StoriesRingList';
export { CanvasProgressBar } from './lib/CanvasProgressBar';
export { StoryHeader } from './lib/StoryHeader';
export { HeartAnimation } from './lib/HeartAnimation';
export { ImageStorySlide } from './lib/ImageStorySlide';
export { VideoStorySlide } from './lib/VideoStorySlide';
export { SoundProvider, useSoundState } from '@reelkit/react';

export type {
  StoryItem,
  AuthorInfo,
  StoriesGroup,
  MediaType,
  HeaderRenderProps,
  FooterRenderProps,
  SlideRenderProps,
  NavigationRenderProps,
  ProgressBarRenderProps,
  LoadingRenderProps,
  ErrorRenderProps,
  StoriesApi,
  StoriesOverlayProps,
} from './lib/types';
