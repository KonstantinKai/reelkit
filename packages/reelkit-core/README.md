# @reelkit/core

<p>
  <a href="https://www.npmjs.com/package/@reelkit/core"><img src="https://img.shields.io/npm/v/@reelkit/core?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/bundlephobia/minzip/@reelkit/core?color=6366f1" alt="Bundle size" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

Framework-agnostic slider engine with zero dependencies. Provides virtualized rendering, gesture recognition, keyboard/wheel controllers, and a lightweight signal-based reactive system.

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

- **Virtualized** — renders only 3 slides at a time, handles 10,000+ items
- **Zero dependencies** — ~3.7 kB gzip
- **Controller pattern** — factory functions (`createSliderController`, `createGestureController`, `createKeyboardController`, `createWheelController`)
- **Signal-based reactivity** — lightweight `Signal`, `ComputedSignal`, and `reaction` primitives
- **Touch gestures** — swipe with momentum, configurable thresholds
- **Keyboard & wheel** — full navigation support with debouncing
- **Loop mode** — infinite circular scrolling
- **Auto-size** — optional ResizeObserver-based sizing
- **TypeScript** — full type safety

## Documentation

Full API reference and guides at **[reelkit.dev](https://reelkit.dev)**.

## Support

If you find ReelKit useful, give it a star on GitHub — it helps others discover the project and keeps development going.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)
