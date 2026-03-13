# @reelkit/react-lightbox

<p>
  <a href="https://www.npmjs.com/package/@reelkit/react-lightbox"><img src="https://img.shields.io/npm/v/@reelkit/react-lightbox?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/bundlephobia/minzip/@reelkit/react-lightbox?color=6366f1" alt="Bundle size" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

Full-screen image gallery lightbox for React. Touch gestures, keyboard navigation, fullscreen API, transition effects, and render props for full customization.

## Installation

```bash
npm install @reelkit/react-lightbox @reelkit/react lucide-react
```

## Quick Start

```tsx
import { useState } from 'react';
import { LightboxOverlay, type LightboxItem } from '@reelkit/react-lightbox';
import '@reelkit/react-lightbox/styles.css';

const images: LightboxItem[] = [
  {
    src: 'https://example.com/image1.jpg',
    title: 'Sunset',
    description: 'Beautiful sunset over the ocean',
  },
  {
    src: 'https://example.com/image2.jpg',
    title: 'Mountains',
  },
];

function App() {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      {images.map((img, i) => (
        <img key={i} src={img.src} onClick={() => setIndex(i)} />
      ))}
      <LightboxOverlay
        isOpen={index !== null}
        images={images}
        initialIndex={index ?? 0}
        onClose={() => setIndex(null)}
      />
    </>
  );
}
```

## Features

- Touch gestures — swipe to navigate, swipe up to close
- Keyboard navigation — arrow keys, Escape
- Fullscreen — cross-browser Fullscreen API
- Transitions — slide, fade, and zoom-in effects
- Image preloading — adjacent images prefetched
- Video slides (opt-in) — tree-shakeable video support via `useVideoSlideRenderer`
- Counter — "1 / 10" indicator
- Info overlay — title and description with gradient
- Render props — `renderControls`, `renderNavigation`, `renderInfo`, `renderSlide` for full customization
- Sub-components — `CloseButton`, `Counter`, `FullscreenButton`, `SoundButton` for composing custom controls

## API Reference

### LightboxOverlay Props

| Prop               | Type                                                 | Default   | Description                  |
| ------------------ | ---------------------------------------------------- | --------- | ---------------------------- |
| `isOpen`           | `boolean`                                            | required  | Controls lightbox visibility |
| `images`           | `LightboxItem[]`                                     | required  | Array of images to display   |
| `initialIndex`     | `number`                                             | `0`       | Starting image index         |
| `transition`       | `TransitionType`                                     | `'slide'` | Transition animation type    |
| `apiRef`           | `MutableRefObject<ReelApi>`                          | -         | Ref to access Reel API       |
| `renderControls`   | `(props) => ReactNode`                               | -         | Custom controls              |
| `renderNavigation` | `(props) => ReactNode`                               | -         | Custom navigation arrows     |
| `renderInfo`       | `(props) => ReactNode`                               | -         | Custom info overlay          |
| `renderSlide`      | `(item, index, size, isActive) => ReactNode \| null` | -         | Custom slide rendering       |

### Callbacks

| Prop            | Type                      | Description                 |
| --------------- | ------------------------- | --------------------------- |
| `onClose`       | `() => void`              | Called when lightbox closes |
| `onSlideChange` | `(index: number) => void` | Called after slide change   |

### Reel Props (proxied)

| Prop                  | Type      | Default | Description                |
| --------------------- | --------- | ------- | -------------------------- |
| `loop`                | `boolean` | `false` | Enable infinite loop       |
| `useNavKeys`          | `boolean` | `true`  | Enable keyboard navigation |
| `enableWheel`         | `boolean` | `true`  | Enable mouse wheel         |
| `wheelDebounceMs`     | `number`  | `200`   | Wheel debounce (ms)        |
| `transitionDuration`  | `number`  | `300`   | Animation duration (ms)    |
| `swipeDistanceFactor` | `number`  | `0.12`  | Swipe threshold (0-1)      |

### Types

```ts
interface LightboxItem {
  src: string;
  type?: 'image' | 'video'; // defaults to 'image'
  poster?: string; // thumbnail for video items
  title?: string;
  description?: string;
  width?: number;
  height?: number;
}

type TransitionType = 'slide' | 'fade' | 'zoom-in';
```

## Video Slides (Opt-in)

Video support is tree-shakeable — image-only usage pays zero extra bundle cost. Import `useVideoSlideRenderer` and wire it into `LightboxOverlay` to enable video slides.

```tsx
import {
  LightboxOverlay,
  Counter,
  CloseButton,
  SoundButton,
  useVideoSlideRenderer,
  type LightboxItem,
} from '@reelkit/react-lightbox';
import '@reelkit/react-lightbox/styles.css';

const items: LightboxItem[] = [
  { src: '/photo.jpg', title: 'Photo' },
  {
    src: '/clip.mp4',
    type: 'video',
    poster: '/clip-thumb.jpg',
    title: 'Video Clip',
  },
];

function Gallery() {
  const [index, setIndex] = useState<number | null>(null);
  const isOpen = index !== null;
  const { renderSlide, isMuted, onToggleMute, hasVideo } =
    useVideoSlideRenderer(items, isOpen);

  return (
    <>
      {/* thumbnails… */}
      <LightboxOverlay
        isOpen={isOpen}
        images={items}
        initialIndex={index ?? 0}
        onClose={() => setIndex(null)}
        renderSlide={renderSlide}
        renderControls={({ onClose, currentIndex, count }) => (
          <>
            <div className="rk-lightbox-controls-left">
              <Counter currentIndex={currentIndex} count={count} />
              {hasVideo && (
                <SoundButton isMuted={isMuted} onToggle={onToggleMute} />
              )}
            </div>
            <CloseButton onClick={onClose} />
          </>
        )}
      />
    </>
  );
}
```

### useVideoSlideRenderer

```ts
function useVideoSlideRenderer(
  items: LightboxItem[],
  isOpen?: boolean,
): {
  renderSlide: (item, index, size, isActive) => ReactNode | null;
  isMuted: boolean; // current mute state (default: true)
  onToggleMute: () => void;
  hasVideo: boolean; // true if items contain at least one video
};
```

Pass `isOpen` to reset muted state when the lightbox closes (enables autoplay on reopen).

### SoundButton

| Prop        | Type            | Description                            |
| ----------- | --------------- | -------------------------------------- |
| `isMuted`   | `boolean`       | Current mute state                     |
| `onToggle`  | `() => void`    | Toggle callback                        |
| `className` | `string`        | CSS class (default: `rk-lightbox-btn`) |
| `style`     | `CSSProperties` | Inline styles                          |

## Keyboard Shortcuts

| Key          | Action                              |
| ------------ | ----------------------------------- |
| `ArrowLeft`  | Previous image                      |
| `ArrowRight` | Next image                          |
| `Escape`     | Close lightbox (or exit fullscreen) |

## CSS Classes

All UI elements use CSS classes prefixed with `rk-lightbox-` that can be overridden:

| Class                          | Description                 |
| ------------------------------ | --------------------------- |
| `.rk-lightbox-container`       | Root container              |
| `.rk-lightbox-close`           | Close button                |
| `.rk-lightbox-nav`             | Navigation arrows           |
| `.rk-lightbox-nav-prev`        | Previous arrow              |
| `.rk-lightbox-nav-next`        | Next arrow                  |
| `.rk-lightbox-counter`         | Image counter               |
| `.rk-lightbox-btn`             | Control buttons             |
| `.rk-lightbox-info`            | Title/description container |
| `.rk-lightbox-title`           | Image title                 |
| `.rk-lightbox-description`     | Image description           |
| `.rk-lightbox-slide`           | Slide container             |
| `.rk-lightbox-img`             | Image element               |
| `.rk-lightbox-video-container` | Video slide wrapper         |
| `.rk-lightbox-video-element`   | Video element               |
| `.rk-lightbox-video-poster`    | Video poster image          |
| `.rk-lightbox-video-loader`    | Video loading indicator     |

## Documentation

Full documentation, interactive demos, and customization examples at **[reelkit.dev/docs/lightbox](https://reelkit.dev/docs/lightbox)**.

## License

[MIT](LICENSE)
