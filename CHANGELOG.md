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
