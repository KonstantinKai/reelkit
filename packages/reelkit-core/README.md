# @reelkit/core

<p>
  <a href="https://www.npmjs.com/package/@reelkit/core"><img src="https://img.shields.io/npm/v/@reelkit/core?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/gzip-7.4%20kB-6366f1" alt="Bundle size" />
  <img src="https://img.shields.io/badge/coverage-95%25-brightgreen" alt="Coverage" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
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
- Zero dependencies, ~7.4 kB gzip
- Factory functions over classes — `createSliderController`, `createGestureController`, `createKeyboardController`, `createWheelController`
- Built-in `Signal`, `ComputedSignal`, and `reaction` primitives for reactive state
- Touch gestures with momentum and configurable thresholds
- Keyboard and wheel navigation with debouncing
- Infinite loop mode
- Optional ResizeObserver-based auto-sizing
- Strict TypeScript throughout

## Documentation

API reference and guides at **[reelkit.dev](https://reelkit.dev)**.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot — it's a small thing, but it really helps the project get noticed.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)
