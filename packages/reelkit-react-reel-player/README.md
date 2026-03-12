# @reelkit/react-reel-player

Full-screen vertical-swipe video/image player for React. Inspired by Instagram Reels and TikTok.

## Installation

```bash
npm install @reelkit/react-reel-player
```

**Peer dependencies:**
```bash
npm install react react-dom lucide-react
```

## Quick Start

```tsx
import { ReelPlayerOverlay, type ContentItem } from '@reelkit/react-reel-player';
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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | required | Controls overlay visibility |
| `onClose` | `() => void` | required | Called when player closes |
| `content` | `ContentItem[]` | required | Content items to display |
| `initialIndex` | `number` | `0` | Starting slide index |
| `onSlideChange` | `(index: number) => void` | - | Callback after slide change |
| `apiRef` | `MutableRefObject<ReelApi>` | - | Ref to access Reel API |
| `loop` | `boolean` | `false` | Enable infinite loop |
| `useNavKeys` | `boolean` | `true` | Enable keyboard navigation |
| `enableWheel` | `boolean` | `true` | Enable mouse wheel navigation |
| `wheelDebounceMs` | `number` | `200` | Wheel debounce duration (ms) |
| `transitionDuration` | `number` | `300` | Transition duration (ms) |
| `swipeDistanceFactor` | `number` | `0.12` | Swipe threshold (0-1) |

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

| Key | Action |
|-----|--------|
| `ArrowUp` | Previous slide |
| `ArrowDown` | Next slide |
| `ArrowLeft` | Previous media (nested) |
| `ArrowRight` | Next media (nested) |
| `Escape` | Close player |

## CSS Classes

```css
.rk-reel-overlay { }        /* Overlay background */
.rk-reel-container { }      /* Player container */
.rk-player-nav-arrows { }   /* Desktop nav arrows */
.rk-player-close-btn { }    /* Close button */
.rk-player-sound-btn { }    /* Sound toggle */
.rk-video-slide-container { }
.rk-video-slide-loader { }
.rk-video-slide-poster { }
```

## License

MIT
