## @reelkit/vue-reel-player@0.2.0 (2026-04-24)

### 🚀 Features

- Built-in playback timeline bar over the active video with track, buffered segments, progress fill, and draggable pill cursor
- New `timeline` prop (`'auto' | 'always' | 'never'`, default `'auto'`) with `timeline-min-duration-seconds` (default 30) to gate when the bar renders; on multi-media carousels the bar follows the active nested video
- `#timeline` scoped slot for fully custom scrub UI
- `TimelineBar`, `TimelineProvider`, `useTimelineState` exports for composition
- Pointer + keyboard scrubbing on the track (pointer capture, arrows, Home/End, PageUp/PageDown)
- Sound button relocated under the close button for more consistent top-right stacking
- Auto-detect vertical video orientation via `syncVideoObjectFit` so portrait clips with stale declared aspect ratios still render with the correct `object-fit`

### 🧱 Updated Dependencies

- Updated @reelkit/vue to 0.3.0

## @reelkit/react-reel-player@0.5.0 (2026-04-24)

### 🚀 Features

- Built-in playback timeline bar over the active video with track, buffered segments, progress fill, and draggable pill cursor
- New `timeline` prop (`'auto' | 'always' | 'never'`, default `'auto'`) with `timelineMinDurationSeconds` (default 30) to gate when the bar renders; on multi-media carousels the bar follows the active nested video
- `renderTimeline` render prop for fully custom scrub UI
- `TimelineBar`, `TimelineProvider`, `useTimelineState` exports for composition
- Pointer + keyboard scrubbing on the track (pointer capture, arrows, Home/End, PageUp/PageDown)
- Sound button relocated under the close button for more consistent top-right stacking
- Auto-detect vertical video orientation via `syncVideoObjectFit` so portrait clips with stale declared aspect ratios still render with the correct `object-fit`

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.6.0

## @reelkit/angular-reel-player@0.4.0 (2026-04-24)

### 🚀 Features

- Built-in playback timeline bar over the active video with track, buffered segments, progress fill, and draggable pill cursor
- New `timeline` input (`'auto' | 'always' | 'never'`, default `'auto'`) with `timelineMinDurationSeconds` (default 30) to gate when the bar renders; on multi-media carousels the bar follows the active nested video
- `rkPlayerTimeline` template slot directive for fully custom scrub UI
- `RkTimelineBarComponent` and `TimelineStateService` exports for composition
- Pointer + keyboard scrubbing on the track (pointer capture, arrows, Home/End, PageUp/PageDown)
- Sound button relocated under the close button for more consistent top-right stacking
- Auto-detect vertical video orientation via `syncVideoObjectFit` so portrait clips with stale declared aspect ratios still render with the correct `object-fit`

### 🩹 Fixes

- Draggable error slides: the error-state overlay no longer swallows pointer events, so broken slides can be swiped away

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.4.0

## @reelkit/vue@0.3.0 (2026-04-24)

### 🚀 Features

- Re-exports `createTimelineController`, `syncVideoObjectFit`, `TimelineController`, `TimelineControllerConfig`, `BufferedRange`, and `Disposer` from `@reelkit/core`

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.6.0

## @reelkit/core@0.6.0 (2026-04-24)

### 🚀 Features

- `createTimelineController` factory with reactive signals (duration, currentTime, progress, bufferedRanges, isScrubbing) plus seek and bindInteractions for pointer + keyboard video scrubbing — pointer capture, arrows, Home/End, PageUp/PageDown
- `syncVideoObjectFit` utility auto-detects video orientation from `loadedmetadata` and keeps `object-fit` aligned (cover for portrait, contain for landscape)

## @reelkit/react@0.6.0 (2026-04-24)

### 🚀 Features

- Re-exports `createTimelineController`, `syncVideoObjectFit`, `TimelineController`, `TimelineControllerConfig`, and `BufferedRange` from `@reelkit/core`

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.6.0

## @reelkit/angular@0.4.0 (2026-04-24)

### 🚀 Features

- Re-exports `createTimelineController`, `syncVideoObjectFit`, `TimelineController`, `TimelineControllerConfig`, and `BufferedRange` from `@reelkit/core`

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.6.0

## @reelkit/stories-core@0.1.3 (2026-04-24)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.6.0

## @reelkit/react-lightbox@0.4.1 (2026-04-24)

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.6.0

## @reelkit/angular-lightbox@0.3.1 (2026-04-24)

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.4.0

## @reelkit/react-stories-player@0.2.1 (2026-04-24)

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.1.3
- Updated @reelkit/react to 0.6.0

## @reelkit/vue-reel-player@0.1.0 (2026-04-22)

### 🎉 Initial Release

- Full-screen TikTok/Instagram Reels-style vertical video player overlay for Vue 3
- `v-model:is-open` two-way binding; Teleport to body; shared `<SoundProvider>` context
- Full slot customization: slide, slide overlay, controls, navigation, nested slide, nested navigation, loading, error
- Imperative API via template ref or `apiReady` emit
- Generic content types via `BaseContentItem`
- Themeable via `--rk-reel-*` CSS custom properties
- Dialog a11y: `role="dialog"`, `aria-modal`, focus trap, focus return on close

## @reelkit/vue@0.2.0 (2026-04-22)

### 🚀 Features

- Add `toVueRef(source)` composable that bridges core Subscribables into a read-only Vue ref with auto-disposal via `onScopeDispose`
- Re-export core focus management utilities (`captureFocusForReturn`, `createFocusTrap`, `getFocusableElements`)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.5.0

## @reelkit/core@0.5.0 (2026-04-22)

### 🚀 Features

- Add focus management utilities: `captureFocusForReturn`, `createFocusTrap`, `getFocusableElements` for building accessible modal overlays

## @reelkit/react@0.5.0 (2026-04-22)

### 🚀 Features

- Re-export core focus management utilities (`captureFocusForReturn`, `createFocusTrap`, `getFocusableElements`)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.5.0

## @reelkit/angular@0.3.0 (2026-04-22)

### 🚀 Features

- Re-export core focus management utilities (`captureFocusForReturn`, `createFocusTrap`, `getFocusableElements`)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.5.0

## @reelkit/stories-core@0.1.2 (2026-04-22)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.5.0

## @reelkit/react-lightbox@0.4.0 (2026-04-22)

### 🚀 Features

- Themeable via `--rk-lightbox-*` CSS custom properties
- Dialog a11y: `role="dialog"`, `aria-modal`, focus trap, focus return on close

### ⚠️ Breaking Changes

- overlay root class `rk-lightbox-container` → `rk-lightbox-overlay`

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.5.0

## @reelkit/angular-lightbox@0.3.0 (2026-04-22)

### 🚀 Features

- Themeable via `--rk-lightbox-*` CSS custom properties
- Dialog a11y: `role="dialog"`, `aria-modal`, focus trap, focus return on close

### ⚠️ Breaking Changes

- overlay root class `rk-lightbox-container` → `rk-lightbox-overlay`

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.3.0

## @reelkit/react-reel-player@0.4.0 (2026-04-22)

### 🚀 Features

- Themeable via `--rk-reel-*` CSS custom properties
- Dialog a11y: `role="dialog"`, `aria-modal`, focus trap, focus return on close

### ⚠️ Breaking Changes

- class renames `rk-player-*` / `rk-video-slide-*` / `rk-nested-*` / `rk-media-error` → `rk-reel-*` — retarget custom CSS overrides

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.5.0

## @reelkit/angular-reel-player@0.3.0 (2026-04-22)

### 🚀 Features

- Themeable via `--rk-reel-*` CSS custom properties
- Dialog a11y: `role="dialog"`, `aria-modal`, focus trap, focus return on close

### ⚠️ Breaking Changes

- class renames `rk-player-*` / `rk-video-slide-*` / `rk-nested-*` / `rk-media-error` → `rk-reel-*` — retarget custom CSS overrides

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.3.0

## @reelkit/react-stories-player@0.2.0 (2026-04-22)

### 🚀 Features

- Themeable via `--rk-stories-*` CSS custom properties
- Dialog a11y: `role="dialog"`, `aria-modal`, focus trap, focus return on close

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.1.2
- Updated @reelkit/react to 0.5.0

## @reelkit/vue@0.1.0 (2026-04-17)

### 🎉 Initial Release

- Virtualized single-item slider — only 3 slides in the DOM at a time, handles 10,000+ items
- Built-in transitions: slide, cube, fade, flip, zoom (tree-shakeable)
- `<Reel>` component with auto-sizing via `ResizeObserver` — omit `size` prop and the container measures itself
- `<ReelIndicator>` — dot indicators that auto-connect to the parent `<Reel>`; new `indicatorClass` and `indicatorStyle` props for custom styling
- `<SwipeToClose>` — swipe-to-dismiss wrapper for overlays
- `<SoundProvider>` and `useSoundState()` for shared mute/unmute across nested players
- `useBodyLock` composable — locks body scroll with shared reference counting across components
- `useFullscreen` composable — generic over the element type; all methods return `Promise<void>`; safely exits before requesting when another element is already fullscreen
- Full WAI-ARIA carousel accessibility: region role, live announcements, roving tabindex on indicator dots, `inert` on inactive slides
- SSR-safe — works with Nuxt 3 server rendering
- Gesture events via Vue's emits API: `@tap`, `@double-tap`, `@long-press`, `@long-press-end`
- `onNavKeyPress` prop to override default arrow-key navigation
- `ReelProps` type export for consumers building wrappers
- Core utilities re-exported — no separate `@reelkit/core` install needed

## @reelkit/core@0.4.0 (2026-04-17)

### 🚀 Features

- New `sharedBodyLock` singleton export — a shared body scroll lock instance that multiple components can lock/unlock independently without stepping on each other. Use this instead of `createBodyLock()` when you want nested modals and overlays to interleave correctly

## @reelkit/react@0.4.0 (2026-04-17)

### 🚀 Features

- Full WAI-ARIA carousel accessibility on `<Reel>`: `role="region"`, `aria-roledescription="carousel"`, new `ariaLabel` prop, and an `aria-live` region that announces slide changes without re-rendering
- Inactive slides get `inert` to keep keyboard focus and assistive tech on the active slide only
- `<ReelIndicator>` is now a proper tablist: each dot is a `role="tab"` with `aria-selected` and roving `tabindex`; Arrow keys, Home, End move focus, Enter/Space activate
- `useBodyLock` now shares a single reference counter across components — nested overlays (e.g. lightbox inside a modal) interleave correctly and body styles stay locked until the last caller releases
- `useFullscreen.request()` safely exits any other fullscreen element before requesting; all methods (`request`, `exit`, `toggle`) now return `Promise<void>`

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.4.0

## @reelkit/angular@0.2.1 (2026-04-17)

### 🩹 Fixes

- `BodyLockService` now shares a single body scroll lock counter across the entire app — nested modals and overlays interleave correctly and body styles stay locked until the last caller releases
- Re-exports `sharedBodyLock` from core for components that want to bypass the service and work with the lock directly

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.4.0

## @reelkit/stories-core@0.1.1 (2026-04-17)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.4.0

## @reelkit/react-lightbox@0.3.1 (2026-04-17)

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.4.0

## @reelkit/react-reel-player@0.3.1 (2026-04-17)

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.4.0

## @reelkit/react-stories-player@0.1.1 (2026-04-17)

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.1.1
- Updated @reelkit/react to 0.4.0

## @reelkit/angular-lightbox@0.2.1 (2026-04-17)

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.2.1

## @reelkit/angular-reel-player@0.2.1 (2026-04-17)

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.2.1

## @reelkit/stories-core@0.1.0 (2026-04-03)

### 🎉 Initial Release

- Framework-agnostic stories state machine with story and group navigation
- Auto-advance timer with pause/resume
- Tap zone detection (left/center/right)
- Segmented progress bar with sliding window for 50+ stories

## @reelkit/react-stories-player@0.1.0 (2026-04-03)

### 🎉 Initial Release

- Full-screen Instagram-style stories player overlay for React
- 3D cube transition between users
- Tap-to-advance navigation with segmented progress bar
- Double-tap heart animation
- Auto-advance timer with pause on hold

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

### ⚠️ Breaking Changes

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

### ⚠️ Breaking Changes

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

### ⚠️ Breaking Changes

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

### ⚠️ Breaking Changes

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

### ⚠️ Breaking Changes

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

### ⚠️ Breaking Changes

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

### ⚠️ Breaking Changes

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
