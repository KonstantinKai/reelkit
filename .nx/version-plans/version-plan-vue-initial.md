---
'@reelkit/vue': minor
---

Virtualized Reel component with per-slide absolute positioning and TransitionTransformFn
Built-in transitions: slide, cube, fade, flip, zoom (tree-shakeable imports)
ReelIndicator auto-connects to parent Reel via provide/inject context with sliding dot window
SwipeToClose component for gesture-driven overlay dismiss
useBodyLock composable for reference-counted body scroll lock
useFullscreen composable bridging core fullscreenSignal with request/exit/toggle
SoundProvider and useSoundState for shared mute/unmute context
Full core re-exports so consumers don't need a direct @reelkit/core dependency
Carousel accessibility: role=region, aria-roledescription, aria-live announcements, inert on inactive slides, roving tabindex on indicator dots
