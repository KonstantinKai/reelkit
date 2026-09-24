# @reelkit/react-reel-player

<p>
  <a href="https://www.npmjs.com/package/@reelkit/react-reel-player"><img src="https://img.shields.io/npm/v/@reelkit/react-reel-player?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/gzip-5.4%20kB-6366f1" alt="Bundle size" />
  <img src="https://img.shields.io/badge/coverage-87%25-green" alt="Statement coverage" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

<p>
  <a href="https://react-demo.reelkit.dev/reel-player?utm_source=npm"><img src="https://raw.githubusercontent.com/KonstantinKai/reelkit/main/assets/reel.gif" width="240" alt="A full-screen reel player on a phone: a swipe up moves to a three-photo post, a swipe sideways shows its next photo, and a swipe down returns to the first post." /></a>
</p>

Drop-in Instagram Reels / TikTok-style video player for React. Opens as a full-screen overlay with vertical swipe navigation. Handles video autoplay, sound continuity on iOS, and multi-media posts. ~5.4 kB gzip.

**[Live Demo](https://react-demo.reelkit.dev/reel-player?utm_source=npm)**

## Installation

```bash
npm install @reelkit/react-reel-player @reelkit/react lucide-react
```

## Quick Start

```tsx
import {
  ReelPlayerOverlay,
  type ContentItem,
} from '@reelkit/react-reel-player';
import '@reelkit/react-reel-player/styles.css';

const content: ContentItem[] = [
  {
    id: '1',
    media: [
      {
        id: 'v1',
        type: 'video',
        src: 'https://example.com/video.mp4',
        poster: 'https://example.com/poster.jpg',
        aspectRatio: 9 / 16,
      },
    ],
    author: { name: 'John Doe', avatar: 'https://example.com/avatar.jpg' },
    likes: 1234,
    description: 'Amazing video!',
  },
];

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Player</button>
      <ReelPlayerOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={content}
      />
    </>
  );
}
```

## Features

- Vertical swipe navigation (touch, mouse, keyboard, wheel)
- Video autoplay with sound toggle
- Multi-media posts with horizontal nested slider
- Playback timeline bar over long videos, scrubbable, with buffered ranges
- Instagram-style indicator dots
- Keyboard navigation (Arrow keys, Escape)
- Desktop navigation arrows
- iOS sound continuity
- Video position memory
- Shareable URLs — `ReelPlayerUrlOverlay` opens itself from the address bar
- Replaceable UI — a render prop for every part, or compose from the exported sub-components
- Themeable — every visual value is a `--rk-reel-*` custom property

## API Reference

### ReelPlayerOverlay

| Prop                         | Type                                | Default          | Description                                               |
| ---------------------------- | ----------------------------------- | ---------------- | --------------------------------------------------------- |
| `isOpen`                     | `boolean`                           | required         | Controls overlay visibility                               |
| `onClose`                    | `() => void`                        | required         | Called when the player closes                             |
| `content`                    | `T[]`                               | required         | Content items to display; `T` defaults to `ContentItem`   |
| `initialIndex`               | `number`                            | `0`              | Starting slide index                                      |
| `initialInnerIndex`          | `number`                            | `0`              | Inner media index for the first slide only                |
| `aspectRatio`                | `number`                            | `0.5625`         | Desktop container ratio; mobile always fills the viewport |
| `ariaLabel`                  | `string`                            | `'Video player'` | Accessible label announced when the dialog opens          |
| `timeline`                   | `'auto' \| 'always' \| 'never'`     | `'auto'`         | When the built-in timeline bar renders                    |
| `timelineMinDurationSeconds` | `number`                            | `30`             | Under `'auto'`, videos shorter than this get no bar       |
| `apiRef`                     | `MutableRefObject<ReelApi \| null>` | -                | Ref to access the Reel API                                |
| `loop`                       | `boolean`                           | `false`          | Enable infinite loop                                      |
| `enableNavKeys`              | `boolean`                           | `true`           | Enable keyboard navigation                                |
| `enableWheel`                | `boolean`                           | `true`           | Enable mouse wheel navigation                             |
| `wheelDebounceMs`            | `number`                            | `200`            | Wheel debounce duration (ms)                              |
| `transitionDuration`         | `number`                            | `300`            | Transition duration (ms)                                  |
| `swipeDistanceFactor`        | `number`                            | `0.12`           | Swipe threshold (0-1)                                     |

### Callbacks

| Prop                 | Type                               | Description                                                         |
| -------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| `onSlideChange`      | `(index: number) => void`          | Fired after the vertical slide changes                              |
| `onInnerSlideChange` | `(outerIndex, innerIndex) => void` | Inner media changed, or a post activated at its current inner index |

### Render Props

Each one replaces a part of the default UI. Those receiving `defaultContent`
let you wrap the built-in rendering instead of rebuilding it; returning `null`
hides that part.

| Prop                     | Receives                  | Replaces                                           |
| ------------------------ | ------------------------- | -------------------------------------------------- |
| `renderSlide`            | `SlideRenderProps<T>`     | The whole slide — video, image or nested slider    |
| `renderSlideOverlay`     | `(item, index, isActive)` | The per-slide overlay (author, likes, description) |
| `renderControls`         | `ControlsRenderProps<T>`  | Close and sound buttons                            |
| `renderTimeline`         | `TimelineRenderProps<T>`  | The playback timeline bar                          |
| `renderNavigation`       | `NavigationRenderProps`   | Desktop up/down arrows                             |
| `renderNestedNavigation` | `NavigationRenderProps`   | Left/right arrows inside a multi-media post        |
| `renderNestedSlide`      | `NestedSlideRenderProps`  | One item of a multi-media post                     |
| `renderLoading`          | `{ item, activeIndex }`   | The wave loader                                    |
| `renderError`            | `{ item, activeIndex }`   | The error icon                                     |

### URL-driven player

`ReelPlayerUrlOverlay` takes the same props except `isOpen` — the address bar
owns the open state, so a shared link reopens the same post:

```tsx
import { ReelPlayerUrlOverlay } from '@reelkit/react-reel-player';
import { useOverlayUrlState, urlIndexTwoAxisKey } from '@reelkit/react';

function Feed() {
  const reel = useOverlayUrlState({
    param: 'reel',
    ...urlIndexTwoAxisKey({
      outerCount: () => content.length,
      innerCounts: () => content.map((post) => post.media.length),
    }),
  });

  return <ReelPlayerUrlOverlay controller={reel} content={content} />;
}
```

A one-axis `urlIndexKey(() => content.length)` writes the post alone
(`?reel=3`); the two-axis key above also writes the inner media index
(`?reel=3.2`). The overlay reads which one it got from the position shape —
there is no mode prop.

### Sub-components

For composing custom controls or slides rather than replacing the whole thing:
`CloseButton`, `SoundButton`, `ImageSlide`, `VideoSlide`, `SlideOverlay`,
`TimelineBar`, plus `TimelineProvider` with `useTimelineState` and
`useTimelineStateOptional` to read playback state (progress, buffered ranges,
duration) anywhere inside the player.

### Types

```tsx
interface ContentItem {
  id: string;
  media: MediaItem[];
  author: {
    name: string;
    avatar: string;
  };
  likes: number;
  description: string;
}

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  poster?: string;
  aspectRatio: number; // width / height
}

type MediaType = 'image' | 'video';
```

### Sound Context

The sound context ships with `@reelkit/react`, which this package depends on:

```tsx
import { SoundProvider, useSoundState } from '@reelkit/react';

interface SoundState {
  muted: boolean;
  disabled: boolean;
  toggle: () => void;
  setMuted: (value: boolean) => void;
  setDisabled: (value: boolean) => void;
}
```

### From @reelkit/react

The slider primitives the player is built on are imported from `@reelkit/react` directly:

```tsx
import {
  Reel,
  ReelIndicator,
  type ReelProps,
  type ReelApi,
  type ReelIndicatorProps,
} from '@reelkit/react';
```

## Examples

### Single Video

```tsx
{
  id: '1',
  media: [{
    id: 'v1',
    type: 'video',
    src: 'https://example.com/video.mp4',
    poster: 'https://example.com/thumb.jpg',
    aspectRatio: 9 / 16,
  }],
  author: { name: 'Creator', avatar: '...' },
  likes: 5000,
  description: 'Check this out!',
}
```

### Multi-Media Post

```tsx
{
  id: '2',
  media: [
    { id: 'img1', type: 'image', src: '...', aspectRatio: 4 / 5 },
    { id: 'v1', type: 'video', src: '...', poster: '...', aspectRatio: 9 / 16 },
    { id: 'img2', type: 'image', src: '...', aspectRatio: 1 },
  ],
  author: { name: 'Blogger', avatar: '...' },
  likes: 10000,
  description: 'My trip',
}
```

### Gallery with Index

```tsx
function Gallery() {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const open = (i: number) => {
    setIndex(i);
    setIsOpen(true);
  };

  return (
    <>
      {content.map((item, i) => (
        <div key={item.id} onClick={() => open(i)}>
          <img src={item.media[0].poster || item.media[0].src} />
        </div>
      ))}
      <ReelPlayerOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={content}
        initialIndex={index}
      />
    </>
  );
}
```

## Keyboard Shortcuts

| Key          | Action                  |
| ------------ | ----------------------- |
| `ArrowUp`    | Previous slide          |
| `ArrowDown`  | Next slide              |
| `ArrowLeft`  | Previous media (nested) |
| `ArrowRight` | Next media (nested)     |
| `Escape`     | Close player            |

## CSS Classes

| Class                                | Description                       |
| ------------------------------------ | --------------------------------- |
| `.rk-reel-overlay`                   | Overlay background                |
| `.rk-reel-container`                 | Player container                  |
| `.rk-reel-slide-wrapper`             | Slide wrapper                     |
| `.rk-reel-button`                    | Shared circular icon button       |
| `.rk-reel-nav-arrows`                | Desktop nav arrows container      |
| `.rk-reel-nav-button`                | Individual nav arrow button       |
| `.rk-reel-close-btn`                 | Close button                      |
| `.rk-reel-sound-btn`                 | Sound toggle                      |
| `.rk-reel-slide-overlay`             | Per-slide overlay (author, likes) |
| `.rk-reel-slide-overlay-author`      | Author row                        |
| `.rk-reel-slide-overlay-avatar`      | Author avatar                     |
| `.rk-reel-slide-overlay-name`        | Author name                       |
| `.rk-reel-slide-overlay-description` | Slide description                 |
| `.rk-reel-slide-overlay-likes`       | Like count                        |
| `.rk-reel-nested-nav`                | Nested nav arrows                 |
| `.rk-reel-nested-nav-prev`           | Nested prev arrow                 |
| `.rk-reel-nested-nav-next`           | Nested next arrow                 |
| `.rk-reel-video-container`           | Video slide wrapper               |
| `.rk-reel-video-element`             | Video element                     |
| `.rk-reel-video-poster`              | Video poster image                |
| `.rk-reel-media-error`               | Error state container             |
| `.rk-reel-media-error-text`          | Error message text                |
| `.rk-reel-loader`                    | Wave loading overlay              |

### Theming via CSS custom properties

Every visual value is exposed as a `--rk-reel-*` custom property with a sensible default. Override at `:root` (or any ancestor of `.rk-reel-overlay`) to retheme without touching component source — see the [Theming docs](https://reelkit.dev/docs/reel-player#theming) for the full token table.

```css
:root {
  --rk-reel-button-bg: rgba(0, 0, 0, 0.6);
  --rk-reel-button-size: 44px;
  --rk-reel-edge-padding: 20px;
}
```

## Documentation

Docs and interactive demos at **[reelkit.dev/docs/reel-player](https://reelkit.dev/docs/reel-player)**.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot — it's a small thing, but it really helps the project get noticed.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)
