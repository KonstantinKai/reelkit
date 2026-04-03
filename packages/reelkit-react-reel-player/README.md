# @reelkit/react-reel-player

<p>
  <a href="https://www.npmjs.com/package/@reelkit/react-reel-player"><img src="https://img.shields.io/npm/v/@reelkit/react-reel-player?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/gzip-4.3%20kB-6366f1" alt="Bundle size" />
  <img src="https://img.shields.io/badge/coverage-90%25-brightgreen" alt="Coverage" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

Drop-in Instagram Reels / TikTok-style video player for React. Opens as a full-screen overlay with vertical swipe navigation. Handles video autoplay, sound continuity on iOS, and multi-media posts. ~4.3 kB gzip.

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
- Instagram-style indicator dots
- Keyboard navigation (Arrow keys, Escape)
- Desktop navigation arrows
- iOS sound continuity
- Video position memory

## API Reference

### ReelPlayerOverlay

| Prop                  | Type                        | Default  | Description                   |
| --------------------- | --------------------------- | -------- | ----------------------------- |
| `isOpen`              | `boolean`                   | required | Controls overlay visibility   |
| `onClose`             | `() => void`                | required | Called when player closes     |
| `content`             | `ContentItem[]`             | required | Content items to display      |
| `initialIndex`        | `number`                    | `0`      | Starting slide index          |
| `onSlideChange`       | `(index: number) => void`   | -        | Callback after slide change   |
| `apiRef`              | `MutableRefObject<ReelApi>` | -        | Ref to access Reel API        |
| `loop`                | `boolean`                   | `false`  | Enable infinite loop          |
| `enableNavKeys`       | `boolean`                   | `true`   | Enable keyboard navigation    |
| `enableWheel`         | `boolean`                   | `true`   | Enable mouse wheel navigation |
| `wheelDebounceMs`     | `number`                    | `200`    | Wheel debounce duration (ms)  |
| `transitionDuration`  | `number`                    | `300`    | Transition duration (ms)      |
| `swipeDistanceFactor` | `number`                    | `0.12`   | Swipe threshold (0-1)         |

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

```tsx
import { SoundProvider, useSoundState } from '@reelkit/react-reel-player';

interface SoundState {
  muted: boolean;
  disabled: boolean;
  toggle: () => void;
  setMuted: (value: boolean) => void;
  setDisabled: (value: boolean) => void;
}
```

### Re-exports from @reelkit/react

```tsx
import {
  Reel,
  ReelIndicator,
  type ReelProps,
  type ReelApi,
  type ReelIndicatorProps,
} from '@reelkit/react-reel-player';
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
| `.rk-player-nav-arrows`              | Desktop nav arrows container      |
| `.rk-player-nav-btn`                 | Individual nav arrow button       |
| `.rk-player-close-btn`               | Close button                      |
| `.rk-player-sound-btn`               | Sound toggle                      |
| `.rk-reel-slide-overlay`             | Per-slide overlay (author, likes) |
| `.rk-reel-slide-overlay-author`      | Author row                        |
| `.rk-reel-slide-overlay-avatar`      | Author avatar                     |
| `.rk-reel-slide-overlay-name`        | Author name                       |
| `.rk-reel-slide-overlay-description` | Slide description                 |
| `.rk-reel-slide-overlay-likes`       | Like count                        |
| `.rk-nested-slider-inner`            | Nested horizontal slider          |
| `.rk-nested-nav`                     | Nested nav arrows                 |
| `.rk-nested-indicator`               | Nested slider dot indicator       |
| `.rk-video-slide-container`          | Video slide wrapper               |
| `.rk-video-slide-element`            | Video element                     |
| `.rk-video-slide-poster`             | Video poster image                |
| `.rk-video-slide-loader`             | Video loading indicator           |

## Documentation

Docs and interactive demos at **[reelkit.dev/docs/reel-player](https://reelkit.dev/docs/reel-player)**.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot — it's a small thing, but it really helps the project get noticed.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)
