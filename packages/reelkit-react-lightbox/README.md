# @reelkit/react-lightbox

<p>
  <a href="https://www.npmjs.com/package/@reelkit/react-lightbox"><img src="https://img.shields.io/npm/v/@reelkit/react-lightbox?color=6366f1&label=npm" alt="npm" /></a>
  <img src="https://img.shields.io/badge/gzip-3.4%20kB-6366f1" alt="Bundle size" />
  <img src="https://img.shields.io/badge/coverage-94%25-brightgreen" alt="Statement coverage" />
  <a href="https://github.com/KonstantinKai/reelkit"><img src="https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social" alt="Star on GitHub" /></a>
</p>

<p>
  <a href="https://react-demo.reelkit.dev/image-preview?utm_source=npm"><img src="https://raw.githubusercontent.com/KonstantinKai/reelkit/main/assets/lightbox.gif" width="240" alt="An image lightbox on a phone: tapping a gallery thumbnail opens it full screen, two sideways swipes page to the third photo, and a swipe up closes it back to the gallery." /></a>
</p>

Image gallery lightbox for React — opens full-screen with swipe navigation, keyboard controls, and transition effects. Everything is replaceable via render props if the defaults don't fit. ~3.4 kB gzip.

**[Live Demo](https://react-demo.reelkit.dev/image-preview?utm_source=npm)**

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
- Transitions — tree-shakable `slideTransition`, `flipTransition`, `lightboxFadeTransition`, `lightboxZoomTransition` (import only what you use)
- Image preloading — adjacent images prefetched
- Video slides (opt-in) — tree-shakeable video support via `useVideoSlideRenderer`
- Counter — "1 / 10" indicator
- Info overlay — title and description with gradient
- Render props — `renderControls`, `renderNavigation`, `renderInfo`, `renderSlide`, `renderLoading`, `renderError` to override any part of the UI
- Sub-components — `CloseButton`, `Counter`, `FullscreenButton`, `SoundButton` for composing custom controls
- Shareable URLs — `LightboxUrlOverlay` opens itself from the address bar

## API Reference

### LightboxOverlay Props

| Prop                    | Type                                | Default           | Description                                      |
| ----------------------- | ----------------------------------- | ----------------- | ------------------------------------------------ |
| `isOpen`                | `boolean`                           | required          | Controls lightbox visibility                     |
| `images`                | `LightboxItem[]`                    | required          | Array of images to display                       |
| `initialIndex`          | `number`                            | `0`               | Starting image index                             |
| `transitionFn`          | `TransitionTransformFn`             | `slideTransition` | Slide transition fn (built-in or custom)         |
| `swipeToCloseDirection` | `SwipeToCloseDirection`             | `'up'`            | Which way a swipe dismisses the lightbox         |
| `ariaLabel`             | `string`                            | `'Image gallery'` | Accessible label announced when the dialog opens |
| `apiRef`                | `MutableRefObject<ReelApi \| null>` | -                 | Ref to access Reel API                           |

### Render Props

| Prop               | Receives                | Replaces                                                       |
| ------------------ | ----------------------- | -------------------------------------------------------------- |
| `renderSlide`      | `SlideRenderProps`      | The slide itself; `null` falls back to the default image slide |
| `renderControls`   | `ControlsRenderProps`   | Counter, fullscreen, sound, close                              |
| `renderNavigation` | `NavigationRenderProps` | Previous/next arrows                                           |
| `renderInfo`       | `InfoRenderProps`       | Title and description overlay                                  |
| `renderLoading`    | `{ item, activeIndex }` | The loading indicator                                          |
| `renderError`      | `{ item, activeIndex }` | The error indicator                                            |

### Callbacks

| Prop            | Type                      | Description                 |
| --------------- | ------------------------- | --------------------------- |
| `onClose`       | `() => void`              | Called when lightbox closes |
| `onSlideChange` | `(index: number) => void` | Called after slide change   |

### Reel Props (proxied)

| Prop                  | Type      | Default | Description                |
| --------------------- | --------- | ------- | -------------------------- |
| `loop`                | `boolean` | `false` | Enable infinite loop       |
| `enableNavKeys`       | `boolean` | `true`  | Enable keyboard navigation |
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
```

## Video Slides (Opt-in)

Video support is tree-shakeable — image-only usage pays zero extra bundle cost. Import `useVideoSlideRenderer` and wire it into `LightboxOverlay` to enable video slides.

```tsx
import { useState } from 'react';
import {
  LightboxOverlay,
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
  const { renderSlide, renderControls, SoundProvider } =
    useVideoSlideRenderer(items);

  return (
    <SoundProvider>
      {/* thumbnails… */}
      <LightboxOverlay
        isOpen={isOpen}
        images={items}
        initialIndex={index ?? 0}
        onClose={() => setIndex(null)}
        renderSlide={renderSlide}
        renderControls={renderControls}
      />
    </SoundProvider>
  );
}
```

### useVideoSlideRenderer

```ts
function useVideoSlideRenderer(items: LightboxItem[]): {
  SoundProvider: FC<{ children: ReactNode }>; // wrap the lightbox in it — mute state lives here
  renderSlide: (props: SlideRenderProps) => ReactNode | null; // video items only, null for images
  renderControls: (props: ControlsRenderProps) => ReactNode; // counter, fullscreen, sound, close
  hasVideo: boolean; // at least one item has `type: 'video'`
};
```

The returned `renderControls` already includes the sound button when the gallery
holds a video. Build your own from the sub-components when you need a different
layout:

```tsx
renderControls={({ onClose, activeIndex, count }) => (
  <>
    <div className="rk-lightbox-controls-left">
      <Counter currentIndex={activeIndex} count={count} />
    </div>
    <CloseButton onClick={onClose} />
  </>
)}
```

### SoundButton

| Prop        | Type            | Description                            |
| ----------- | --------------- | -------------------------------------- |
| `isMuted`   | `boolean`       | Current mute state                     |
| `onToggle`  | `() => void`    | Toggle callback                        |
| `className` | `string`        | CSS class (default: `rk-lightbox-btn`) |
| `style`     | `CSSProperties` | Inline styles                          |

## URL-driven lightbox

`LightboxUrlOverlay` takes the same props except `isOpen` — the address bar owns
the open state, so a shared link opens the gallery on the right image:

```tsx
import { useOverlayUrlState, urlIndexKey } from '@reelkit/react';
import { LightboxUrlOverlay } from '@reelkit/react-lightbox';
import { Link } from 'react-router-dom';

const photo = useOverlayUrlState({
  param: 'photo',
  ...urlIndexKey(() => images.length),
});

// Opening is a link — the overlay reads the URL and opens itself.
{
  images.map((image, i) => (
    <Link key={image.src} to={`?photo=${i}`}>
      <img src={image.src} />
    </Link>
  ));
}

<LightboxUrlOverlay controller={photo} images={images} />;
```

Swap `urlIndexKey` for `urlStableIdKey({ items: () => images })` to key the URL
by image id, so a bookmark survives the gallery being reordered.

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
| `.rk-lightbox-overlay`         | Root container              |
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
| `.rk-lightbox-spinner`         | Default loading spinner     |
| `.rk-lightbox-img-error`       | Error state container       |
| `.rk-lightbox-swipe-hint`      | Mobile swipe hint chip      |

### Theming via CSS custom properties

Every visual value is exposed as a `--rk-lightbox-*` custom property with a sensible default. Override at `:root` (or any ancestor of `.rk-lightbox-overlay`) to retheme without touching component source — see the [Theming docs](https://reelkit.dev/docs/lightbox#theming) for the full token table.

## Documentation

Docs, demos, and customization examples at **[reelkit.dev/docs/lightbox](https://reelkit.dev/docs/lightbox)**.

## Support

If ReelKit saved you some time, a star on GitHub would mean a lot — it's a small thing, but it really helps the project get noticed.

[![Star on GitHub](https://img.shields.io/github/stars/KonstantinKai/reelkit?style=social)](https://github.com/KonstantinKai/reelkit)

## License

[MIT](LICENSE)
