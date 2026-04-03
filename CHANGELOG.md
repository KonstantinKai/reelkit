## @reelkit/core@0.3.0 (2026-04-03)

### 🚀 Features

- Transition engine rewrite: transitions are pure functions (`TransitionTransformFn`) that receive slide progress and return CSS transforms
- Built-in transitions: slide, fade, flip, cube, zoom (tree-shakeable imports)
- `getSlideProgress` helper computes normalized slide offsets for custom transitions
- Tap, double-tap, and long-press gesture detection
- Sound controller for shared mute state across framework bindings
- Content loading controller tracks per-slide loading and error states via `isLoading`/`isError` signals
- Content preloader with LRU cache preloads neighbors and caches broken URLs to skip retries
- Fullscreen utilities with Safari vendor-prefix guards
- Reference-counted body scroll lock with SSR guard
- `enableNavKeys` config flag controls keyboard navigation independently from gestures
- `onNavKeyPress` event replaces default arrow-key navigation, receives `-1|1` increment
- `observeMediaLoading` uses `playing` + `canplaythrough` instead of `canplay` as ready signals

### ⚠️  Breaking Changes

- `Escape` key removed from `NavKey` type and keyboard controller

## @reelkit/react@0.3.0 (2026-04-03)

### 🚀 Features

- `Reel` accepts `TransitionTransformFn` for custom slide animations
- Built-in transitions: slide, fade, flip, cube, zoom (tree-shakeable imports)
- `SoundProvider` and `useSoundState` give components shared mute/unmute context
- `enableGestures` prop disables touch/mouse drag on `Reel`
- `onNavKeyPress` callback replaces default arrow-key navigation with custom handler
- Re-exports core utilities: content loading, preloading, sound controller, LRU cache
- `useFullscreen` hook bridges core fullscreen state to React with request/exit/toggle helpers
- `useBodyLock` hook for declarative body scroll locking

### ⚠️  Breaking Changes

- `Reel` `transition` prop no longer accepts string names — pass a `TransitionTransformFn` directly (e.g. `slideTransition` instead of `'slide'`)
- `useNavKeys` prop renamed to `enableNavKeys`

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.3.0

## @reelkit/angular@0.2.0 (2026-04-03)

### 🚀 Features

- `Reel` component accepts `TransitionTransformFn` via `transition` input for custom slide animations (slide, fade, flip, cube, zoom as tree-shakeable imports)
- Per-slide absolute positioning replaces flex+translate rendering
- `enableGestures` input disables touch/mouse drag
- Re-exports core utilities: content loading, preloading, sound controller, fullscreen, body lock, transition functions/types, `observeDomEvent`, `createDisposableList`
- `BodyLockService` wraps core `createBodyLock`
- `SwipeToClose` directive moved from lightbox with configurable up/down direction

### ⚠️  Breaking Changes

- `Reel` uses per-slide absolute positioning with `TransitionTransformFn` — custom CSS targeting `.rk-lightbox-slider-track` or `flex-direction` no longer applies
- `enableNavKeys` input renamed from `useNavKeys`

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.3.0

## @reelkit/react-lightbox@0.3.0 (2026-04-03)

### 🚀 Features

- Controls, navigation, info overlay, and loading spinner update independently via signals without full re-renders
- Loading spinner tracks image and video load states; content preloader skips already-cached images
- Flip transition added
- Sound button appears only on video slides with reactive mute toggle
- Top shade gradient improves control visibility on bright images
- Broken image/video shows an error icon; errored URLs stay cached so revisiting skips the retry
- `renderLoading`/`renderError` props accept custom loading and error UI
- All render callbacks include the current `LightboxItem`
- Render props type names simplified: `ControlsRenderProps`, `SlideRenderProps`, `NavigationRenderProps`, `InfoRenderProps` (Lightbox prefix dropped)

### ⚠️  Breaking Changes

- `useFullscreen` hook removed — import from `@reelkit/react` instead
- `renderSlide` accepts a single `SlideRenderProps` object instead of separate parameters
- `LightboxControlsRenderProps` renamed to `ControlsRenderProps`, `currentIndex` renamed to `activeIndex`
- `LightboxSlideRenderProps` renamed to `SlideRenderProps`

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.3.0

## @reelkit/angular-lightbox@0.2.0 (2026-04-03)

### 🚀 Features

- Lightbox renders via `ReelComponent` internally with `TransitionTransformFn` (slide, fade, flip, zoom-in)
- Loading spinner and error icon track per-slide load states
- Content preloader caches broken URLs so revisiting skips the retry
- Reactive per-slide sound button via `createSoundController`
- `lightboxFadeTransition` and `lightboxZoomTransition` exported as `TransitionTransformFn`
- `rkLightboxLoading` and `rkLightboxError` template slot directives accept custom loading/error UI
- All template contexts include `item` (`LightboxItem`)
- Top shade gradient improves control visibility

### ⚠️  Breaking Changes

- `FullscreenService` removed — use `fullscreenSignal`/`requestFullscreen`/`exitFullscreen` from `@reelkit/angular`
- `LightboxControlsContext.currentIndex` renamed to `activeIndex`
- `enableWheel` defaults to `true`

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.2.0

## @reelkit/react-reel-player@0.3.0 (2026-04-03)

### 🚀 Features

- Controls, navigation, and wave loader update independently via signals without full re-renders
- Wave loader tracks image and video load states; content preloader skips already-cached media
- Nested slider forwards loading callbacks to inner slides and clears the loader on video-to-image navigation
- Video frame capture before transition provides seamless poster display
- `onReady`/`onWaiting`/`onError` added to `SlideRenderProps` and `NestedSlideRenderProps`
- Broken image/video shows an error icon; errored URLs stay cached so revisiting skips the retry
- `renderLoading`/`renderError` props accept custom loading and error UI
- All render callbacks include the active content item: `ControlsRenderProps`, `NavigationRenderProps`, `renderLoading`/`renderError` receive `item`
- `NavigationRenderProps` also receives `media` (`MediaItem`) in nested context

### ⚠️  Breaking Changes

- `SoundState` removed — import `SoundProvider` and `useSoundState` from `@reelkit/react` instead
- `NestedSlideRenderProps.item` renamed to `media` (`MediaItem`), new `item` field is the parent `BaseContentItem`

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.3.0

## @reelkit/angular-reel-player@0.2.0 (2026-04-03)

### 🚀 Features

- Loading wave indicator and error icon track per-slide load states
- Content preloader caches broken URLs so revisiting skips the retry
- Nested slider forwards loading callbacks to inner slides and clears the loader on image navigation
- Video frame capture before transition provides seamless poster display
- `onError` propagates through `VideoSlide`, `ImageSlide`, `NestedSlider`, `MediaSlide`
- `SoundStateService` wraps core `createSoundController`
- `rkPlayerLoading` and `rkPlayerError` template slot directives accept custom loading/error UI
- All template contexts include `item`: `PlayerControlsContext` adds `item` and `onClose`, `PlayerNavigationContext` adds `item` and `onPrev`, `PlayerNestedNavigationContext` adds `media` and `onPrev`
- Inline SVG icons replaced with tree-shakeable `lucide-angular` components

### ⚠️  Breaking Changes

- `PlayerControlsContext` adds required `onClose` callback
- `PlayerSlideContext` adds required `onError` callback
- `lucide-angular` >= 0.460.0 required as peer dependency

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.2.0

## @reelkit/angular-lightbox@0.1.2 (2026-03-24)

### 🩹 Fixes

- Reset muted state when overlay closes

## @reelkit/angular-reel-player@0.1.2 (2026-03-24)

### 🩹 Fixes

- Reset muted state when overlay closes

## @reelkit/angular-lightbox@0.1.1 (2026-03-24)

### 🩹 Fixes

- Add missing lightbox-video-slide.css to package exports

## @reelkit/angular-reel-player@0.1.1 (2026-03-24)

### 🩹 Fixes

- Fix CSS assets not included in published package

## @reelkit/angular@0.1.0 (2026-03-24)

### 🎉 Initial Release

- Reel component with signal bridge and context injection
- ReelIndicator with auto-connect via RK_REEL_CONTEXT
- BodyLockService for scroll-locking overlays
- Standalone components, OnPush, signal inputs/outputs

### ❤️ Thanks

- [@eurusik](https://github.com/eurusik)

## @reelkit/angular-lightbox@0.1.0 (2026-03-24)

### 🎉 Initial Release

- Full-screen image and video gallery lightbox overlay
- Swipe-to-close, fullscreen toggle, keyboard navigation
- Template slot directives for custom controls, navigation, and info overlays

### ❤️ Thanks

- [@eurusik](https://github.com/eurusik)

## @reelkit/angular-reel-player@0.1.0 (2026-03-24)

### 🎉 Initial Release

- TikTok/Reels-style vertical video player overlay
- Nested horizontal carousel for multi-media posts
- Shared video element for iOS sound continuity
- SoundStateService for mute/unmute management

### ❤️ Thanks

- [@eurusik](https://github.com/eurusik)

## @reelkit/core@0.2.2 (2026-03-24)

### 🩹 Fixes

- Gesture controller improvements and internal refactoring

## @reelkit/core@0.2.1 (2026-03-21)

### 🩹 Fixes

- Custom rangeExtractor output is now clamped to 3 slides to preserve virtualization

## @reelkit/react@0.2.1 (2026-03-21)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.2.1

## @reelkit/react-lightbox@0.2.1 (2026-03-21)

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.2.1
- Updated @reelkit/core to 0.2.1

## @reelkit/react-reel-player@0.2.1 (2026-03-21)

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.2.1

## @reelkit/core@0.2.0 (2026-03-18)

### 🚀 Features

- Add createSharedVideo factory and captureFrame utility for framework-agnostic video playback

## @reelkit/react@0.2.0 (2026-03-18)

### 🚀 Features

- Auto-connect ReelIndicator to parent Reel via context — active and count props are now optional

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.2.0

## @reelkit/react-lightbox@0.2.0 (2026-03-18)

### 🚀 Features

- Add toggle function to useFullscreen hook

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.2.0
- Updated @reelkit/core to 0.2.0

## @reelkit/react-reel-player@0.2.0 (2026-03-18)

### 🚀 Features

- Add imageProps to ImageSlide, migrate VideoSlide internals to signal-based state

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.2.0

## @reelkit/core@0.1.0 (2026-03-13)

### 🎉 Initial Release

- Framework-agnostic virtualized slider engine
- Custom signal-based reactive system (Signal, ComputedSignal, batch, reaction)
- Gesture, keyboard, and wheel controllers
- Range extractor for virtualization (renders only 3 DOM nodes)
- Zero dependencies, ~3.7 kB gzip

## @reelkit/react@0.1.0 (2026-03-13)

### 🎉 Initial Release

- Reel component — virtualized slider with auto-sizing via ResizeObserver
- ReelIndicator — Instagram-style scrolling dot indicator
- Observe and AnimatedObserve for signal-to-React bridging
- useBodyLock hook for scroll-locking overlays

## @reelkit/react-reel-player@0.1.0 (2026-03-13)

### 🎉 Initial Release

- Full-screen TikTok/Instagram Reels-style video player overlay
- Shared video element for iOS sound continuity
- Multi-media nested horizontal slider
- Render props for controls, navigation, slides, and overlays
- Generic content types via BaseContentItem

## @reelkit/react-lightbox@0.1.0 (2026-03-13)

### 🎉 Initial Release

- Full-screen image and video gallery lightbox
- Three transition modes: slide, fade, zoom-in
- Swipe-to-close, keyboard navigation, fullscreen API
- Opt-in video support via useVideoSlideRenderer (tree-shakeable)
- Render props for controls, navigation, info overlay, and slides
