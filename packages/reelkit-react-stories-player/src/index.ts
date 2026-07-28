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
 *
 * Open state comes in two shapes. {@link StoriesOverlay} is controlled — the
 * surrounding component owns `isOpen`. {@link StoriesUrlOverlay} puts it in the
 * address bar instead: the open group and story ride one `?story=<group>.<story>`
 * parameter, so the playing story has a link that can be shared, bookmarked, and
 * closed with the back button. Inner navigation is carried too — swiping between
 * a user's stories updates the URL — and one back step always closes.
 *
 * @example Controlled — the component owns `isOpen`
 * ```tsx
 * import { StoriesOverlay } from '@reelkit/react-stories-player';
 * import '@reelkit/react-stories-player/styles.css';
 *
 * function Feed({ groups }) {
 *   const [open, setOpen] = useState(false);
 *   return (
 *     <>
 *       <button onClick={() => setOpen(true)}>Open stories</button>
 *       <StoriesOverlay isOpen={open} groups={groups} onClose={() => setOpen(false)} />
 *     </>
 *   );
 * }
 * ```
 *
 * @example URL-driven — opening is a link, back closes
 * ```tsx
 * import {
 *   StoriesUrlOverlay,
 *   StoriesRingList,
 *   useOverlayUrlState,
 *   urlIndexTwoAxisKey,
 * } from '@reelkit/react-stories-player';
 * import { Link } from 'react-router-dom';
 * import '@reelkit/react-stories-player/styles.css';
 *
 * function Feed({ groups }) {
 *   // Outer axis is the group, inner is the story within it.
 *   const stories = useOverlayUrlState({
 *     param: 'story',
 *     ...urlIndexTwoAxisKey({
 *       outerCount: () => groups.length,
 *       innerCounts: () => groups.map((g) => g.stories.length),
 *     }),
 *   });
 *
 *   return (
 *     <>
 *       {groups.map((g, i) => (
 *         <Link key={g.author.id} to={`?story=${i}.0`}>{g.author.name}</Link>
 *       ))}
 *       <StoriesUrlOverlay controller={stories} groups={groups} />
 *     </>
 *   );
 * }
 * ```
 */

export {
  StoriesOverlay,
  StoriesUrlOverlay,
  type StoriesOverlayProps,
  type StoriesUrlOverlayProps,
} from './lib/StoriesOverlay';
export { StoriesRing } from './lib/StoriesRing';
export { StoriesRingList } from './lib/StoriesRingList';
export { CanvasProgressBar } from './lib/CanvasProgressBar';
export { StoryHeader } from './lib/StoryHeader';
export { HeartAnimation } from './lib/HeartAnimation';
export { ImageStorySlide } from './lib/ImageStorySlide';
export { VideoStorySlide } from './lib/VideoStorySlide';
export { SoundProvider, useSoundState } from '@reelkit/react';

export {
  useOverlayUrlState,
  urlIndexTwoAxisKey,
  type UrlAdapter,
  type UrlCodec,
  type UrlLocator,
  type UrlKey,
  type UrlStateController,
  type TwoAxisPosition,
  type TwoAxisIdentity,
  type UrlIndexTwoAxisKeyOptions,
} from '@reelkit/react';

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
} from './lib/types';
