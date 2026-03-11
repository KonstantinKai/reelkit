# Reelkit

A headless, virtualized, TikTok-style vertical slider component library. Supports touch gestures, keyboard navigation, smooth animations, and **virtualized rendering for massive lists**.

## Features

- **Virtualized rendering** - efficiently handles 10,000+ items
- **Headless design** - bring your own styles
- **Touch gestures** - swipe up/down or left/right
- **Keyboard navigation** - arrow keys support
- **Mouse wheel** - scroll to navigate
- **Smooth animations** - bezier-eased transitions
- **Loop mode** - infinite scrolling support
- **Indicator component** - Instagram-style position dots
- **Framework bindings** - React (Vue, Svelte coming soon)
- **TypeScript** - full type safety
- **Zero dependencies** - lightweight core

## Packages

| Package | Description |
|---------|-------------|
| `@reelkit/core` | Framework-agnostic core with gesture and slider controllers |
| `@reelkit/react` | React bindings with hooks and components |
| `@reelkit/react-reel-player` | Full-screen Instagram/TikTok-style video player |
| `@reelkit/react-lightbox` | Full-screen image gallery lightbox |

## Bundle Sizes

| Package | JS | JS (gzip) | CSS | CSS (gzip) |
|---------|---:|----------:|----:|-----------:|
| `@reelkit/core` | 14.9 kB | 4.9 kB | - | - |
| `@reelkit/react` | 9.1 kB | 3.1 kB | - | - |
| `@reelkit/react-reel-player` | 13.5 kB | 3.9 kB | 1.8 kB | 0.7 kB |
| `@reelkit/react-lightbox` | 8.9 kB | 2.8 kB | 3.1 kB | 0.8 kB |

### Comparison with Other Libraries

| Library | JS (gzip) | CSS (gzip) | Virtualization | Notes |
|---------|----------:|-----------:|:--------------:|-------|
| **ReelKit** (core + react) | 8.0 kB | - | ✅ | Zero dependencies |
| [Swiper](https://swiperjs.com/) | ~25 kB | ~5 kB | ❌ | Full bundle; tree-shakeable |
| [Embla Carousel](https://www.embla-carousel.com/) | ~7 kB | - | ❌ | Lightweight, plugin-based |
| [keen-slider](https://keen-slider.io/) | ~6 kB | - | ❌ | Zero dependencies |

ReelKit renders only **3 slides to DOM** at any time (current, previous, next), efficiently handling 10,000+ items without performance degradation. Most other carousel libraries render all slides in the DOM, which can cause performance issues with large lists.

## Installation

```bash
# Core React components
npm install @reelkit/core @reelkit/react

# Reel Player (Instagram/TikTok style)
npm install @reelkit/react-reel-player

# Image Lightbox
npm install @reelkit/react-lightbox
```

## Usage

### Basic Reel Component

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
        <div style={{ width: '100%', height: '100%' }}>
          Slide {i + 1}
        </div>
      )}
    >
      <ReelIndicator count={100} active={index} />
    </Reel>
  );
}
```

### Reel Player (Instagram/TikTok style)

```tsx
import { useState } from 'react';
import { ReelPlayerOverlay, type ContentItem } from '@reelkit/react-reel-player';
import '@reelkit/react-reel-player/styles.css';

const content: ContentItem[] = [
  {
    id: '1',
    media: [{
      id: 'v1',
      type: 'video',
      src: 'https://example.com/video.mp4',
      poster: 'https://example.com/poster.jpg',
      aspectRatio: 9 / 16,
    }],
    author: { name: 'Creator', avatar: '...' },
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

### Image Lightbox

```tsx
import { useState } from 'react';
import { LightboxOverlay, type LightboxItem } from '@reelkit/react-lightbox';
import '@reelkit/react-lightbox/styles.css';

const images: LightboxItem[] = [
  { src: 'https://example.com/1.jpg', title: 'Sunset' },
  { src: 'https://example.com/2.jpg', title: 'Mountains' },
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
        transition="slide"
      />
    </>
  );
}
```

## API

### Reel Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| count | number | required | Number of slides |
| itemBuilder | (index) => ReactElement | required | Render function for slides |
| direction | 'horizontal' \| 'vertical' | 'vertical' | Slide direction |
| initialIndex | number | 0 | Starting slide index |
| loop | boolean | false | Enable infinite loop |
| swipeDistanceFactor | number | 0.12 | Swipe threshold (0-1) |
| transitionDuration | number | 300 | Animation duration in ms |
| useNavKeys | boolean | true | Enable keyboard navigation |
| enableWheel | boolean | false | Enable mouse wheel navigation |
| wheelDebounceMs | number | 200 | Wheel debounce duration |
| apiRef | ref | - | Ref to access public API |
| afterChange | (index) => void | - | Callback after slide change |
| beforeChange | (index, nextIndex) => void | - | Callback before slide change |

### ReelIndicator Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| count | number | required | Total number of slides |
| active | number | required | Currently active slide index |
| radius | number | 3 | Dot radius in pixels |
| visible | number | 3 | Number of visible dots |
| onDotClick | (index) => void | - | Callback when dot is clicked |

### Public API (via apiRef)

```typescript
interface ReelApi {
  next: () => void;           // Go to next slide
  prev: () => void;           // Go to previous slide
  goTo: (index) => void;      // Go to specific slide
  adjust: () => void;         // Recalculate positions
  observe: () => void;        // Start observing gestures
  unobserve: () => void;      // Stop observing gestures
}
```

## CSS Customization

All UI components use CSS classes that can be overridden for custom styling.

### Lightbox Classes

| Class | Description |
|-------|-------------|
| `.lightbox-container` | Root container |
| `.lightbox-close` | Close button |
| `.lightbox-nav` | Navigation arrows |
| `.lightbox-nav-prev` | Previous arrow |
| `.lightbox-nav-next` | Next arrow |
| `.lightbox-counter` | Image counter |
| `.lightbox-btn` | Control buttons |
| `.lightbox-info` | Title/description container |
| `.lightbox-title` | Image title |
| `.lightbox-description` | Image description |
| `.lightbox-swipe-hint` | Mobile swipe hint |

### Reel Player Classes

| Class | Description |
|-------|-------------|
| `.reel-overlay` | Root overlay container |
| `.reel-container` | Player container |
| `.player-nav-arrows` | Navigation arrows container |

## Development

```bash
# Install dependencies
npm install

# Build all libraries
npx nx run-many -t build

# Run React example
npx nx serve example-react

# Run tests
npx nx run-many -t test

# Run E2E tests
npx nx e2e example-react-e2e
```

## License

MIT
