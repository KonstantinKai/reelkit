---
title: Angular Stories Player
url: https://reelkit.dev/docs/angular-stories-player
section: Angular
order: 5
desc: Angular stories player overlay (in development). React version available now; Angular version will share @reelkit/stories-core engine for two-level navigation, RAF timer, and canvas progress.
---

# Angular Stories Player

Full-screen Instagram-style stories player overlay for Angular.

> [!INFO]
> **Coming Soon.** Angular stories player in development.

React version available now at [`@reelkit/react-stories-player`](/docs/stories-player). Angular version follow same architecture, use `@reelkit/stories-core` for framework-agnostic state machine, timer, canvas progress renderer.

## Planned API (mirrors React)

- Component: `RkStoriesPlayerOverlayComponent`
- Inputs: `isOpen`, `groups`, `initialGroupIndex`, `initialStoryIndex`, `groupTransition`, `defaultImageDuration`, `tapZoneSplit`, `hideUIOnPause`, `enableKeyboard`, `innerTransitionDuration`
- Outputs: `closed`, `storyChange`, `groupChange`, `storyViewed`, `storyComplete`, `doubleTap`, `paused`, `resumed`, `apiReady`
- Template slot directives: `rkStoriesHeader`, `rkStoriesFooter`, `rkStoriesSlide`, `rkStoriesNavigation`, `rkStoriesProgressBar`, `rkStoriesLoading`, `rkStoriesError`
- Imperative API via `(apiReady)`: `nextStory()`, `prevStory()`, `nextGroup()`, `prevGroup()`, `goToGroup(index)`, `pause()`, `resume()`

## Use the engine today

While wait for bound component, use `@reelkit/stories-core` direct to drive own Angular components. See [Stories Core](/docs/stories-core) for controller, timer, canvas renderer reference.
