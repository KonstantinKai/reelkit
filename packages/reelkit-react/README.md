# @reelkit/react

<p>
  <a href="https://www.npmjs.com/package/@reelkit/react"><img src="https://img.shields.io/npm/v/@reelkit/react?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/bundlephobia/minzip/@reelkit/react?color=6366f1" alt="Bundle size" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

React components and hooks for building TikTok/Instagram Reels-style sliders. Virtualized rendering, touch gestures, keyboard/wheel navigation — all in ~2.6 kB gzip.

## Installation

```bash
npm install @reelkit/react
```

## Quick Start

```tsx
import { useState } from 'react';
import { Reel, ReelIndicator } from '@reelkit/react';

function App() {
  const [index, setIndex] = useState(0);

  return (
    <Reel
      count={100}
      direction="vertical"
      afterChange={setIndex}
      itemBuilder={(i) => (
        <div style={{ width: '100%', height: '100%' }}>Slide {i + 1}</div>
      )}
    >
      <ReelIndicator count={100} active={index} />
    </Reel>
  );
}
```

## Features

- **`<Reel>`** — virtualized slider component (only 3 slides in DOM)
- **`<ReelIndicator>`** — Instagram-style position dots
- **Auto-size** — measures container via ResizeObserver, no explicit size props needed
- **Touch gestures** — swipe with momentum and snap
- **Keyboard & wheel** — arrow keys and scroll navigation
- **Loop mode** — infinite circular scrolling
- **SSR ready** — works with Next.js, Remix, and any SSR setup
- **TypeScript** — full type safety

## API

### Reel Props

| Prop                  | Type                         | Default      | Description                   |
| --------------------- | ---------------------------- | ------------ | ----------------------------- |
| `count`               | `number`                     | required     | Number of slides              |
| `itemBuilder`         | `(index) => ReactElement`    | required     | Render function for slides    |
| `direction`           | `'horizontal' \| 'vertical'` | `'vertical'` | Slide direction               |
| `initialIndex`        | `number`                     | `0`          | Starting slide index          |
| `loop`                | `boolean`                    | `false`      | Enable infinite loop          |
| `swipeDistanceFactor` | `number`                     | `0.12`       | Swipe threshold (0-1)         |
| `transitionDuration`  | `number`                     | `300`        | Animation duration in ms      |
| `useNavKeys`          | `boolean`                    | `true`       | Enable keyboard navigation    |
| `enableWheel`         | `boolean`                    | `false`      | Enable mouse wheel navigation |
| `wheelDebounceMs`     | `number`                     | `200`        | Wheel debounce duration       |
| `apiRef`              | `ref`                        | -            | Ref to access public API      |
| `afterChange`         | `(index) => void`            | -            | Callback after slide change   |
| `beforeChange`        | `(index, nextIndex) => void` | -            | Callback before slide change  |

### ReelIndicator Props

| Prop         | Type              | Default  | Description                  |
| ------------ | ----------------- | -------- | ---------------------------- |
| `count`      | `number`          | required | Total number of slides       |
| `active`     | `number`          | required | Currently active slide index |
| `radius`     | `number`          | `3`      | Dot radius in pixels         |
| `visible`    | `number`          | `3`      | Number of visible dots       |
| `onDotClick` | `(index) => void` | -        | Callback when dot is clicked |

## Documentation

Full API reference, interactive demos, and guides at **[reelkit.dev](https://reelkit.dev)**.

## Support

If you find ReelKit useful, give it a star on GitHub — it helps others discover the project and keeps development going.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)
