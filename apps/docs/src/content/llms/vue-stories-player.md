---
title: Vue Stories Player
url: https://reelkit.dev/docs/vue-stories-player
section: Vue
order: 5
desc: Vue 3 stories player overlay (in development). React version available now; Vue version will share @reelkit/stories-core engine for two-level navigation, RAF timer, and canvas progress.
---

# Vue Stories Player

Full-screen Instagram-style stories player overlay Vue 3.

> [!INFO]
> **Coming Soon.** Vue stories player in development.

React version available now at [`@reelkit/react-stories-player`](/docs/stories-player). Vue version follow same architecture, use `@reelkit/stories-core` for framework-agnostic state machine, timer, canvas progress renderer.

## Planned API (mirrors React)

- Component: `RkStoriesPlayerOverlay`
- Props: `isOpen`, `groups`, `initialGroupIndex`, `initialStoryIndex`, `groupTransition`, `defaultImageDuration`, `tapZoneSplit`, `hideUIOnPause`, `enableKeyboard`, `innerTransitionDuration`
- Emits: `update:is-open`, `close`, `story-change`, `group-change`, `story-viewed`, `story-complete`, `double-tap`, `pause`, `resume`
- Scoped slots: `header`, `footer`, `slide`, `navigation`, `progressBar`, `loading`, `error`
- Imperative API via template ref: `nextStory()`, `prevStory()`, `nextGroup()`, `prevGroup()`, `goToGroup(index)`, `pause()`, `resume()`

## Use the engine today

While wait for bound component, use `@reelkit/stories-core` direct to drive own Vue components. See [Stories Core](/docs/stories-core) for controller, timer, canvas renderer reference.
