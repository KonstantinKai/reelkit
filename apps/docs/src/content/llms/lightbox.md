---
title: Lightbox
url: https://reelkit.dev/docs/lightbox
section: React
order: 4
desc: Full-screen image gallery lightbox overlay for React. LightboxItem schema, props, transitions (slide/fade/flip/zoom-in), keyboard shortcuts, theming tokens, CSS classes, slot renderers.
---

# Lightbox

Full-screen image gallery lightbox overlay for React. Configurable transitions, keyboard nav, fullscreen toggle, swipe-to-close on mobile, full theming via CSS custom properties.

## Install

```bash
npm install @reelkit/react-lightbox
```

```ts
import { LightboxOverlay, type LightboxItem } from '@reelkit/react-lightbox';
import '@reelkit/react-lightbox/styles.css';
```

## Quick Start

```tsx
import { useState } from 'react';
import { LightboxOverlay, type LightboxItem } from '@reelkit/react-lightbox';
import '@reelkit/react-lightbox/styles.css';

const images: LightboxItem[] = [
  {
    src: '/images/mountain.jpg',
    title: 'Mountain River',
    description: 'River flowing through the forest',
    width: 1600,
    height: 1000,
  },
  // ...
];

export default function App() {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      {images.map((img, i) => (
        <button key={i} onClick={() => setIndex(i)}>
          <img src={img.src} alt={img.title} />
        </button>
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

## LightboxItem Schema

```ts
interface LightboxItem {
  src: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  type?: 'image' | 'video';
  poster?: string; // video only
}
```

## LightboxOverlay Props

| Prop               | Type                                             | Default           | Description                                                                                                                      |
| ------------------ | ------------------------------------------------ | ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `isOpen`           | `boolean`                                        | required          | Control lightbox visibility                                                                                                      |
| `images`           | `LightboxItem[]`                                 | required          | Image array to display                                                                                                           |
| `ariaLabel`        | `string`                                         | `'Image gallery'` | Accessible label for dialog region; announced on open                                                                            |
| `initialIndex`     | `number`                                         | `0`               | Starting image index                                                                                                             |
| `transition`       | `TransitionType`                                 | `'slide'`         | Transition animation. One of `'slide'`, `'fade'`, `'flip'`, `'zoom-in'`                                                          |
| `transitionFn`     | `TransitionTransformFn`                          | -                 | Custom transition fn. Priority over `transition` alias.                                                                          |
| `apiRef`           | `MutableRefObject<ReelApi>`                      | -                 | Ref to Reel API                                                                                                                  |
| `renderControls`   | `(props: ControlsRenderProps) => ReactNode`      | -                 | Custom controls, replace default close button, counter, fullscreen toggle                                                        |
| `renderNavigation` | `(props: NavigationRenderProps) => ReactNode`    | -                 | Custom nav, replace default prev/next arrows                                                                                     |
| `renderInfo`       | `(props: InfoRenderProps) => ReactNode`          | -                 | Custom info overlay, replace default title + description gradient. Return null to hide.                                          |
| `renderSlide`      | `(props: SlideRenderProps) => ReactNode \| null` | -                 | Custom slide render. Receive `{ item, index, size, isActive, onReady, onWaiting, onError }`. Return null = fall back to default. |
| `renderLoading`    | `(props: { item, activeIndex }) => ReactNode`    | -                 | Custom loading indicator, replace default spinner                                                                                |
| `renderError`      | `(props: { item, activeIndex }) => ReactNode`    | -                 | Custom error indicator, replace default error icon                                                                               |

### Reel-Forwarded Props

| Prop                    | Type             | Default | Description                        |
| ----------------------- | ---------------- | ------- | ---------------------------------- |
| `loop`                  | `boolean`        | `false` | Enable infinite loop               |
| `enableNavKeys`         | `boolean`        | `true`  | Enable keyboard nav                |
| `enableWheel`           | `boolean`        | `true`  | Enable mouse wheel nav             |
| `wheelDebounceMs`       | `number`         | `200`   | Wheel debounce (ms)                |
| `transitionDuration`    | `number`         | `300`   | Transition animation duration (ms) |
| `swipeDistanceFactor`   | `number`         | `0.12`  | Swipe threshold (0-1)              |
| `swipeToCloseDirection` | `'up' \| 'down'` | `'up'`  | Swipe-to-close direction on mobile |

## Callbacks

| Prop            | Type                      | Description             |
| --------------- | ------------------------- | ----------------------- |
| `onClose`       | `() => void`              | Fire on close           |
| `onSlideChange` | `(index: number) => void` | Fire after slide change |

## Keyboard Shortcuts

| Key          | Action                                        |
| ------------ | --------------------------------------------- |
| `ArrowLeft`  | Previous image                                |
| `ArrowRight` | Next image                                    |
| `Escape`     | Close lightbox (or exit fullscreen if active) |

## CSS Theming Tokens

### Overlay

| Token                            | Default                                         | Controls                  |
| -------------------------------- | ----------------------------------------------- | ------------------------- |
| `--rk-lightbox-overlay-bg`       | `#000`                                          | Backdrop color            |
| `--rk-lightbox-overlay-z`        | `9999`                                          | Overlay z-index           |
| `--rk-lightbox-top-shade-height` | `80px`                                          | Top gradient scrim height |
| `--rk-lightbox-top-shade-bg`     | `linear-gradient(rgba(0,0,0,0.6), transparent)` | Top gradient scrim color  |

### Layout

| Token                        | Default | Controls                                       |
| ---------------------------- | ------- | ---------------------------------------------- |
| `--rk-lightbox-edge-padding` | `16px`  | Edge inset for close / nav / top-left controls |
| `--rk-lightbox-controls-gap` | `12px`  | Gap between top-left controls                  |
| `--rk-lightbox-transition`   | `0.2s`  | Button hover transition duration               |
| `--rk-lightbox-blur`         | `8px`   | Backdrop blur radius for buttons / chips       |

### Buttons

| Token                        | Default                    | Controls                                    |
| ---------------------------- | -------------------------- | ------------------------------------------- |
| `--rk-lightbox-btn-bg`       | `rgba(0, 0, 0, 0.5)`       | Default bg for close, nav, small buttons    |
| `--rk-lightbox-btn-bg-hover` | `rgba(255, 255, 255, 0.2)` | Hover bg for close, nav, small buttons      |
| `--rk-lightbox-btn-fg`       | `#fff`                     | Icon color for close, nav, small buttons    |
| `--rk-lightbox-btn-size`     | `36px`                     | Small button size (fullscreen toggle, etc.) |
| `--rk-lightbox-close-size`   | `40px`                     | Close button size                           |
| `--rk-lightbox-nav-size`     | `48px`                     | Prev/next arrow size                        |
| `--rk-lightbox-nav-opacity`  | `0.7`                      | Idle opacity of prev/next arrows            |

### Counter

| Token                           | Default              | Controls                   |
| ------------------------------- | -------------------- | -------------------------- |
| `--rk-lightbox-counter-fg`      | `#fff`               | Counter text color         |
| `--rk-lightbox-counter-bg`      | `rgba(0, 0, 0, 0.5)` | Counter chip bg            |
| `--rk-lightbox-counter-size`    | `14px`               | Counter font size          |
| `--rk-lightbox-counter-padding` | `6px 12px`           | Counter chip padding       |
| `--rk-lightbox-counter-radius`  | `20px`               | Counter chip border-radius |

### Spinner & Error

| Token                            | Default                    | Controls                     |
| -------------------------------- | -------------------------- | ---------------------------- |
| `--rk-lightbox-spinner-size`     | `28px`                     | Default spinner width/height |
| `--rk-lightbox-spinner-track`    | `rgba(255, 255, 255, 0.2)` | Spinner track color          |
| `--rk-lightbox-spinner-fg`       | `#fff`                     | Spinner indicator color      |
| `--rk-lightbox-spinner-duration` | `0.8s`                     | Spinner rotation duration    |
| `--rk-lightbox-error-fg`         | `rgba(255, 255, 255, 0.4)` | Error icon + text color      |
| `--rk-lightbox-error-text-size`  | `13px`                     | Error message font size      |

### Info caption

| Token                            | Default                                         | Controls               |
| -------------------------------- | ----------------------------------------------- | ---------------------- |
| `--rk-lightbox-info-bg`          | `linear-gradient(transparent, rgba(0,0,0,0.8))` | Caption scrim gradient |
| `--rk-lightbox-info-padding`     | `24px`                                          | Caption inner padding  |
| `--rk-lightbox-title-size`       | `18px`                                          | Title font size        |
| `--rk-lightbox-description-size` | `14px`                                          | Description font size  |
| `--rk-lightbox-info-fg`          | `#fff`                                          | Caption text color     |

### Swipe hint (mobile) & video

| Token                         | Default                    | Controls                              |
| ----------------------------- | -------------------------- | ------------------------------------- |
| `--rk-lightbox-hint-fg`       | `rgba(255, 255, 255, 0.5)` | Swipe hint text color                 |
| `--rk-lightbox-hint-bg`       | `rgba(0, 0, 0, 0.3)`       | Swipe hint chip bg                    |
| `--rk-lightbox-hint-duration` | `3s`                       | Swipe hint fade in/out total duration |
| `--rk-lightbox-video-bg`      | `#000`                     | Letterbox bg behind `<video>`         |

## CSS Classes

### Overlay

- `.rk-lightbox-overlay` — root container (full-screen backdrop)
- `.rk-lightbox-spinner` — default loading spinner
- `.rk-lightbox-img-error` — error state container (broken image/video)
- `.rk-lightbox-img-error-text` — error state text label
- `.rk-lightbox-swipe-hint` — mobile swipe hint

### Controls

- `.rk-lightbox-controls-left` — top-left controls container
- `.rk-lightbox-btn` — control buttons (fullscreen, etc.)
- `.rk-lightbox-close` — close button
- `.rk-lightbox-counter` — image counter chip

### Navigation & Info

- `.rk-lightbox-nav-prev`, `.rk-lightbox-nav-next` — arrow buttons
- `.rk-lightbox-info` — bottom info overlay container
- `.rk-lightbox-info-title` — title text
- `.rk-lightbox-info-description` — description text

## Custom Slot Examples

### renderControls

```tsx
<LightboxOverlay
  {...props}
  renderControls={({
    activeIndex,
    total,
    isFullscreen,
    toggleFullscreen,
    close,
  }) => (
    <div className="my-controls">
      <button onClick={close}>×</button>
      <span>
        {activeIndex + 1} / {total}
      </span>
      <button onClick={toggleFullscreen}>{isFullscreen ? '⤡' : '⤢'}</button>
    </div>
  )}
/>
```

### renderInfo

```tsx
<LightboxOverlay
  {...props}
  renderInfo={({ item }) => (
    <div className="my-info">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <a href={`/photo/${item.id}`}>View details</a>
    </div>
  )}
/>
```
