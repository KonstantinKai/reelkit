<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/banner-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/banner-light.svg">
  <img alt="ReelKit — Headless virtualized slider engine" src="assets/banner-dark.svg" width="100%">
</picture>

<p align="center">
  Single-item slider for TikTok/Instagram Reels-style experiences.<br/>
  Virtualized · Touch-first · Zero dependencies · Framework-agnostic
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@reelkit/core"><img src="https://img.shields.io/npm/v/@reelkit/core?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" />
  <img src="https://img.shields.io/badge/types-TypeScript-blue?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/core%20gzip-3.7%20kB-6366f1" alt="Bundle size" />
  <br/>
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

## Features

- **Virtualized** — only 3 slides in DOM, handles 10,000+ items
- **Touch first** — native swipe with momentum and snap
- **Zero dependencies** — tiny bundle (~3.7 kB gzip core)
- **Keyboard & wheel** — full navigation support
- **Loop mode** — infinite circular scrolling
- **SSR ready** — works with Next.js, Remix, and any SSR setup
- **Auto-size** — omit size prop, uses CSS + ResizeObserver
- **TypeScript** — full type safety, no `@types` needed

## Packages

| Package                                                          | Description                      | JS (gzip) |
| ---------------------------------------------------------------- | -------------------------------- | --------- |
| [@reelkit/core](packages/reelkit-core)                           | Framework-agnostic slider engine | 3.7 kB    |
| [@reelkit/react](packages/reelkit-react)                         | React components and hooks       | 2.6 kB    |
| [@reelkit/react-reel-player](packages/reelkit-react-reel-player) | Full-screen video reel player    | 3.8 kB    |
| [@reelkit/react-lightbox](packages/reelkit-react-lightbox)       | Image & video gallery lightbox   | 3.4 kB    |

## Try It

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/KonstantinKai/reelkit-react-starter)

## Quick Start

```bash
npm install @reelkit/react
```

```tsx
import { useState } from 'react';
import { Reel, ReelIndicator } from '@reelkit/react';

function App() {
  const [index, setIndex] = useState(0);

  return (
    <Reel
      className="my-reel"
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

By default, `Reel` measures its own size from CSS via `ResizeObserver` — no explicit `width`/`height` props needed. Just set the container size with CSS:

```css
.my-reel {
  width: 100%;
  height: 100dvh;
}
```

## Documentation

Full documentation, interactive demos, and API reference at **[reelkit.dev](https://reelkit.dev)**.

## Development

```bash
npm install          # install dependencies
npm run build        # build all packages
npm test             # run all tests
npm run typecheck    # typecheck all projects
npm run lint         # lint all projects
npm run fmt:chk      # check formatting
npm run fmt          # fix formatting
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot — it's a small thing, but it really helps the project get noticed.

<p>
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
  &nbsp;
  <a href="https://buymeacoffee.com/konstantinkai"><img src="assets/bmc-button.svg" alt="Support ReelKit" height="32" /></a>
</p>

## License

[MIT](LICENSE)
