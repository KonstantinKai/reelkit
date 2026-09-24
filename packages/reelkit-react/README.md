# @reelkit/react

<p>
  <a href="https://www.npmjs.com/package/@reelkit/react"><img src="https://img.shields.io/npm/v/@reelkit/react?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/gzip-4.9%20kB-6366f1" alt="Bundle size" />
  <img src="https://img.shields.io/badge/coverage-96%25-brightgreen" alt="Statement coverage" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

<p>
  <a href="https://react-demo.reelkit.dev/?utm_source=npm"><img src="https://raw.githubusercontent.com/KonstantinKai/reelkit/main/assets/slider.gif" width="240" alt="A bare vertical slider of 10,000 items on a phone: two swipes up move the counter from 1 to 3, a swipe sideways pages the slider nested in item 3, typing 5000 and tapping Go jumps straight to item 5,000, and a jump back returns to item 1." /></a>
</p>

React bindings for `@reelkit/core`. Drop in a `<Reel>` component, give it a slide count and a render function — it handles virtualization, gestures, and keyboard/wheel input. ~4.9 kB gzip.

**[Live Demo](https://react-demo.reelkit.dev/?utm_source=npm)** · **[Open in StackBlitz](https://stackblitz.com/github/KonstantinKai/reelkit-react-starter)**

## Installation

```bash
npm install @reelkit/react
```

## Quick Start

```tsx
import { Reel, ReelIndicator } from '@reelkit/react';

function App() {
  return (
    <Reel
      count={100}
      direction="vertical"
      itemBuilder={(i) => (
        <div style={{ width: '100%', height: '100%' }}>Slide {i + 1}</div>
      )}
    >
      <ReelIndicator />
    </Reel>
  );
}
```

`ReelIndicator` reads the count and the active index from the parent `Reel`, so
it needs no props of its own.

## Features

- `<Reel>` — virtualized slider, keeps only 3 slides in the DOM
- `<ReelIndicator>` — dot indicators that auto-connect to the parent `<Reel>` via context
- Measures its own size via ResizeObserver — no width/height props needed
- Swipe with momentum and snap, keyboard arrows, mouse wheel
- Tap, double-tap and long-press callbacks on the same gesture recognizer
- Loop mode for infinite circular scrolling
- Transitions — `slideTransition`, `fadeTransition`, `flipTransition`, `cubeTransition`, `zoomTransition`; only the one you import ships
- Overlay building blocks — `<SwipeToClose>`, `<SoundProvider>`, `useFullscreen`, `useBodyLock`, `useOverlayUrlState`
- `<Observe>` — re-render one subtree from a signal instead of the whole component
- SSR compatible (Next.js, Remix, etc.)
- Typed with TypeScript, no `@types` package needed

## API

### Reel Props

| Prop                  | Type                                                 | Default           | Description                                                        |
| --------------------- | ---------------------------------------------------- | ----------------- | ------------------------------------------------------------------ |
| `count`               | `number`                                             | required          | Number of slides                                                   |
| `itemBuilder`         | `(index, indexInRange, size) => ReactNode`           | required          | Render function for slides                                         |
| `size`                | `[number, number]`                                   | auto              | Explicit `[width, height]`; omit to measure the container with CSS |
| `direction`           | `'horizontal' \| 'vertical'`                         | `'vertical'`      | Slide direction                                                    |
| `initialIndex`        | `number`                                             | `0`               | Starting slide index                                               |
| `loop`                | `boolean`                                            | `false`           | Enable infinite loop                                               |
| `transition`          | `TransitionTransformFn`                              | `slideTransition` | Transition effect; import only the one you use                     |
| `swipeDistanceFactor` | `number`                                             | `0.12`            | Swipe threshold (0-1)                                              |
| `transitionDuration`  | `number`                                             | `300`             | Animation duration in ms                                           |
| `enableGestures`      | `boolean`                                            | `true`            | Touch and mouse drag navigation                                    |
| `enableNavKeys`       | `boolean`                                            | `true`            | Enable keyboard navigation                                         |
| `enableWheel`         | `boolean`                                            | `false`           | Enable mouse wheel navigation                                      |
| `wheelDebounceMs`     | `number`                                             | `200`             | Wheel debounce duration                                            |
| `rangeExtractor`      | `RangeExtractor`                                     | current ± 1       | Which slide indices render                                         |
| `keyExtractor`        | `(index, indexInRange) => string`                    | index-based       | React keys; override under `loop` to avoid duplicate-key warnings  |
| `apiRef`              | `MutableRefObject<ReelApi \| null> \| (api) => void` | -                 | Access to the imperative API (`next`, `prev`, `goTo`)              |
| `className`           | `string`                                             | -                 | Class on the root container                                        |
| `style`               | `CSSProperties`                                      | -                 | Inline styles on the root container                                |
| `ariaLabel`           | `string`                                             | -                 | Accessible label for the carousel region                           |
| `children`            | `ReactNode`                                          | -                 | Rendered after the slides — indicators, overlays                   |

### Reel Callbacks

| Prop                  | Type                                       | Description                                                  |
| --------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| `afterChange`         | `(index, indexInRange) => void`            | Transition finished, index updated                           |
| `beforeChange`        | `(index, nextIndex, indexInRange) => void` | Transition about to start                                    |
| `onSlideDragStart`    | `(index) => void`                          | Drag began                                                   |
| `onSlideDragEnd`      | `(index) => void`                          | Drag released                                                |
| `onSlideDragCanceled` | `(index) => void`                          | Drag snapped back to the slide it started on                 |
| `onTap`               | `(event: GestureCommonEvent) => void`      | Single tap — no drag, no long press                          |
| `onDoubleTap`         | `(event: GestureCommonEvent) => void`      | Double tap                                                   |
| `onLongPress`         | `(event: GestureCommonEvent) => void`      | Long press detected                                          |
| `onLongPressEnd`      | `(event: GestureEvent) => void`            | Pointer released after a long press                          |
| `onNavKeyPress`       | `(increment: -1 \| 1) => void`             | Arrow key pressed; replaces the default prev/next navigation |

The gesture callbacks need `enableGestures`.

### ReelIndicator Props

Every prop is optional. `count` and `active` come from the parent `Reel` through
context; pass `active` only to override it.

| Prop            | Type                         | Default                      | Description                                       |
| --------------- | ---------------------------- | ---------------------------- | ------------------------------------------------- |
| `count`         | `number`                     | from context                 | Total number of slides                            |
| `active`        | `number`                     | from context                 | Active slide index; takes precedence over context |
| `direction`     | `'horizontal' \| 'vertical'` | `'vertical'`                 | Axis the dots are arranged along                  |
| `radius`        | `number`                     | `3`                          | Dot radius in pixels                              |
| `visible`       | `number`                     | `5`                          | Full-size dots at once; the rest scale down       |
| `gap`           | `number`                     | `4`                          | Space between dots in pixels                      |
| `activeColor`   | `string`                     | `'#fff'`                     | Color of the active dot                           |
| `inactiveColor` | `string`                     | `'rgba(255, 255, 255, 0.5)'` | Color of the inactive dots                        |
| `edgeScale`     | `number`                     | `0.5`                        | Scale applied to dots outside the visible window  |
| `className`     | `string`                     | -                            | Class on the indicator container                  |
| `style`         | `CSSProperties`              | -                            | Inline styles on the indicator container          |
| `onDotClick`    | `(index) => void`            | -                            | Called with the index of the clicked dot          |

### Components

| Component         | Description                                                                     |
| ----------------- | ------------------------------------------------------------------------------- |
| `Observe`         | Re-renders its children when the given signals change, leaving the parent alone |
| `AnimatedObserve` | Same, driven by an animated value — for per-frame transforms                    |
| `SwipeToClose`    | Swipe-to-dismiss wrapper for overlays                                           |
| `SoundProvider`   | Shares one mute/unmute state across every video in a tree                       |

### Hooks

| Hook                 | Description                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| `useReelContext`     | Index, count and `goTo` of the nearest parent `Reel`                        |
| `useSoundState`      | Mute state from `SoundProvider`                                             |
| `useFullscreen`      | Fullscreen API with the cross-browser differences handled                   |
| `useBodyLock`        | Locks body scrolling while an overlay is open                               |
| `useOverlayUrlState` | Keeps the open overlay and its slide in the URL, so a link reopens the view |

Slider primitives, signals, transitions and the URL/viewed-state controllers are
re-exported from `@reelkit/core`, so a React app installs this package only.

## Documentation

Guide and demos at **[reelkit.dev/docs/react/guide](https://reelkit.dev/docs/react/guide)**, full API reference at **[reelkit.dev/docs/react/api](https://reelkit.dev/docs/react/api)**.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot — it's a small thing, but it really helps the project get noticed.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)
