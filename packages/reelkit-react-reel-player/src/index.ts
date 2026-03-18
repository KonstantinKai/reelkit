/**
 * @module @reelkit/react-reel-player
 *
 * Full-screen, Instagram/TikTok-style vertical reel player overlay for React.
 *
 * The main entry point is {@link ReelPlayerOverlay} — a generic, customizable
 * component that renders a virtualized vertical slider with media playback,
 * gesture/keyboard/wheel navigation, and optional sound controls.
 *
 * Customization is achieved via render props:
 * - `renderSlideOverlay` — custom per-slide overlays
 * - `renderSlide` — fully custom slide content
 * - `renderControls` — custom player controls (compose with {@link CloseButton}, {@link SoundButton})
 * - `renderNavigation` — custom navigation arrows
 * - `renderNestedNavigation` — custom arrows for the inner horizontal slider (multi-media posts)
 *
 * For custom data types, extend {@link BaseContentItem} and pass as a
 * type parameter: `<ReelPlayerOverlay<MyItem> />`.
 *
 * @example
 * ```tsx
 * import { useState } from 'react';
 * import { ReelPlayerOverlay, type ContentItem } from '@reelkit/react-reel-player';
 * import '@reelkit/react-reel-player/styles.css';
 *
 * const content: ContentItem[] = [
 *   {
 *     id: '1',
 *     media: [{ id: 'v1', type: 'video', src: '/video.mp4', aspectRatio: 9 / 16 }],
 *     author: { name: 'John', avatar: '/avatar.jpg' },
 *     likes: 1234,
 *     description: 'Amazing video!',
 *   },
 * ];
 *
 * function App() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   return (
 *     <>
 *       <button onClick={() => setIsOpen(true)}>Open Player</button>
 *       <ReelPlayerOverlay
 *         isOpen={isOpen}
 *         onClose={() => setIsOpen(false)}
 *         content={content}
 *       />
 *     </>
 *   );
 * }
 * ```
 */

// Main component
export { ReelPlayerOverlay } from './lib/ReelPlayerOverlay';
export type {
  ReelPlayerOverlayProps,
  ReelProxyProps,
} from './lib/ReelPlayerOverlay';

// Types
export type {
  MediaType,
  MediaItem,
  BaseContentItem,
  ContentItem,
  ControlsRenderProps,
  NavigationRenderProps,
  SlideRenderProps,
  NestedSlideRenderProps,
} from './lib/types';

// Sub-components for composition
export { CloseButton, SoundButton } from './lib/PlayerControls';
export type { CloseButtonProps, SoundButtonProps } from './lib/PlayerControls';

// Slide components
export { default as ImageSlide } from './lib/ImageSlide';
export type { ImageSlideProps } from './lib/ImageSlide';

export { default as VideoSlide } from './lib/VideoSlide';
export type { VideoSlideProps } from './lib/VideoSlide';

export { default as SlideOverlay } from './lib/SlideOverlay';
export type { SlideOverlayProps } from './lib/SlideOverlay';

// Sound context (for custom control implementations)
export { SoundProvider } from './lib/SoundState';
export type { SoundState } from './lib/SoundState';
export { useSoundState } from './lib/useSoundState';
