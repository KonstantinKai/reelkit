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
} from './lib/types';

// Sub-components for composition
export { CloseButton, SoundButton } from './lib/PlayerControls';
export type { CloseButtonProps, SoundButtonProps } from './lib/PlayerControls';

// Slide overlay
export { default as SlideOverlay } from './lib/SlideOverlay';
export type { SlideOverlayProps } from './lib/SlideOverlay';

// Sound context (for custom control implementations)
export { SoundProvider } from './lib/SoundState';
export type { SoundState } from './lib/SoundState';
export { useSoundState } from './lib/useSoundState';
