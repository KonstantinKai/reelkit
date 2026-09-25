# @reelkit/core

<p>
  <a href="https://www.npmjs.com/package/@reelkit/core"><img src="https://img.shields.io/npm/v/@reelkit/core?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/gzip-10.2%20kB-6366f1" alt="Bundle size" />
  <img src="https://img.shields.io/badge/coverage-94%25-brightgreen" alt="Statement coverage" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

<p>
  <a href="https://react-demo.reelkit.dev/?utm_source=npm"><img src="https://raw.githubusercontent.com/KonstantinKai/reelkit/main/assets/slider.gif" width="240" alt="A bare vertical slider of 10,000 items on a phone: two swipes up move the counter from 1 to 3, a swipe sideways pages the slider nested in item 3, typing 5000 and tapping Go jumps straight to item 5,000, and a jump back returns to item 1." /></a>
</p>

The engine behind ReelKit — handles slider logic, gesture recognition, and transitions without depending on any UI framework. Ships its own signal-based reactive system so you don't need RxJS or similar.

## Installation

```bash
npm install @reelkit/core
```

## Quick Start

```ts
import { createSliderController } from '@reelkit/core';

const slider = createSliderController({
  count: 100,
  direction: 'vertical',
});

// Navigate
slider.next();
slider.prev();
slider.goTo(5);

// Read state via signals
console.log(slider.currentIndex.value); // 5

// Subscribe to changes
slider.currentIndex.subscribe((index) => {
  console.log('Slide changed:', index);
});
```

## Features

- Renders only 3 slides at a time (virtualized), handles 10,000+ items
- Zero dependencies, ~10.2 kB gzip
- Factory functions over classes — `createSliderController`, `createGestureController`, `createKeyboardController`, `createWheelController`
- Built-in `Signal`, `ComputedSignal`, and `reaction` primitives for reactive state
- Touch gestures with momentum and configurable thresholds — tap, double-tap and long press on the same recognizer
- Keyboard and wheel navigation with debouncing
- Infinite loop mode
- Optional ResizeObserver-based auto-sizing
- Transitions — `slideTransition`, `fadeTransition`, `flipTransition`, `cubeTransition`, `zoomTransition`; only the one you import ships
- URL state — `createUrlStateController` with index, stable-id and two-axis keys, so a link reopens a slide
- Viewed state — `createViewedStateController` over local, session or memory storage, with expiry and a cap
- Media — content preloading, a shared `<video>` element for iOS sound continuity, sound and playback-timeline controllers
- Fullscreen, body-scroll lock, focus trap and focus return for overlays
- Strict TypeScript throughout

## Documentation

Guide at **[reelkit.dev/docs/core/guide](https://reelkit.dev/docs/core/guide)**, full API reference at **[reelkit.dev/docs/core/api](https://reelkit.dev/docs/core/api)**.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot — it's a small thing, but it really helps the project get noticed.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)
