---
title: Lightbox
url: https://reelkit.dev/docs/lightbox
section: React
order: 4
desc: Full-screen image gallery lightbox overlay for React. LightboxItem schema, props, tree-shakable transitions (slideTransition, lightboxFadeTransition, flipTransition, lightboxZoomTransition), keyboard shortcuts, theming tokens, CSS classes, slot renderers.
---

# Lightbox

Full-screen image gallery lightbox overlay for React. Tree-shakable transitions, keyboard nav, fullscreen toggle, swipe-to-close on mobile, shareable/bookmarkable URL state, full theming via CSS custom properties.

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
import {
  LightboxOverlay,
  lightboxFadeTransition,
  type LightboxItem,
} from '@reelkit/react-lightbox';
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
        transitionFn={lightboxFadeTransition}
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

## URL State (shareable links, back button)

`LightboxUrlOverlay` is a separate component whose open state lives in the URL. Build a controller with `useOverlayUrlState` from `@reelkit/react` and pass it as `controller`: the lightbox opens itself when the param names a slide and closes when it goes away. **Opening is a link** — the href is the open action, no click handler.

```tsx
import { useOverlayUrlState, indexKey } from '@reelkit/react';
import { LightboxUrlOverlay } from '@reelkit/react-lightbox';
import { Link } from 'react-router-dom';

const photo = useOverlayUrlState({
  param: 'photo',
  ...indexKey(() => images.length),
});

// Opening is a link — the overlay reads the URL and opens itself.
{
  images.map((img, i) => (
    <Link key={img.src} to={`?photo=${i}`}>
      <img src={img.src} />
    </Link>
  ));
}

<LightboxUrlOverlay controller={photo} images={images} />;
```

Full `useOverlayUrlState` options (`param`, `adapter`, `codec`, `locator`): see the [React API reference](/docs/react/api#useoverlayurlstate).

- Opening pushes **one** history entry. Paging slides **replaces** it — N swipes add 0 entries, so one back step always leaves the gallery. Back closes; it does not step photos.
- **Back closes only when opened from within the app** (the link pushed an entry). A shared link opened directly in a fresh tab has no history behind it, so browser-back leaves the site — close with the ✕ button or Escape to remove the parameter in place and stay.
- Deep link `?photo=3` opens the gallery at that slide on load. Closing a link that arrived with the page removes the param in place rather than navigating off-site.
- A param naming no slide (stale bookmark, hand-edited) is dropped from the URL instead of leaving the address bar asserting a slide that cannot open.

**Routed app — pass an adapter.** Writing `history.pushState` behind a router leaves its location stale and its next navigation drops the param:

```tsx
import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';

const adapter = useReactRouterUrlAdapter(); // { read, subscribe, push, replace, getState, goBack }
const photo = useOverlayUrlState({
  param: 'photo',
  adapter,
  ...indexKey(() => images.length),
});

<LightboxUrlOverlay controller={photo} images={images} />;
```

**Opening is a link.** The open state lives in the URL, so a thumbnail is an ordinary link — no click handler — and the browser's own behaviour comes free: open in a new tab, copy the address, preview on hover. In a routed app use the router's link so it stays client-side:

```tsx
import { Link } from 'react-router-dom';

// The href is the open action — no onClick, no open flag.
{
  images.map((img, i) => (
    <Link key={img.src} to={`?photo=${i}`}>
      <img src={img.src} />
    </Link>
  ));
}

<LightboxUrlOverlay controller={photo} images={images} />;
```

**Stable links.** The index is positional — a bookmarked `?photo=3` opens a different image once the list is reordered. Key by identity instead:

Two separate jobs: `codec` spells the identity into the URL (wire), `locator` finds where that identity sits (lookup).

```tsx
const photo = useOverlayUrlState({
  param: 'photo',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => images.findIndex((x) => x.slug === id),
    identify: (index) => images[index].slug,
  },
});

<LightboxUrlOverlay controller={photo} images={images} />;
```

**Infinite / paginated galleries.** `locate` is synchronous, so it can only answer for images already loaded — a shared link to image 400 of a feed that has loaded 20 comes up empty. `locateAsync` is the fallback, called only when `locate` misses: load the pages you need, then return the index the identity turned out to have.

```tsx
const photo = useOverlayUrlState({
  param: 'photo',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => images.findIndex((x) => x.id === id),
    identify: (index) => images[index].id,
    locateAsync: async (id) => {
      const loaded = await loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!loaded) return null; // exhausted — link names no image
      setImages(loaded); // commit — the overlay renders from this state
      return loaded.findIndex((x) => x.id === id); // wherever it landed
    },
  },
});

<LightboxUrlOverlay controller={photo} images={images} />;
```

How you load is up to you — fetch contiguous pages up to the target, or fetch just that one image and append it. The URL keys by identity, not position, so `findIndex` returns wherever the item lands.

While `locateAsync` is pending the lightbox stays closed and the param is left alone — the deep link survives the fetch. `null` or a rejection drops the param. An answer that arrives after the URL moved on, after a close, or after unmount is discarded, so a slow fetch cannot open a slide nobody asked for.

Nothing is rendered while pending; the page already owns that loading state, so render your own skeleton. There is no timeout — the lightbox cannot know how long the gallery is, so settle with `null` when pagination is exhausted or the overlay stays closed indefinitely.

Whatever `locateAsync` returns is authoritative — it reports the index of data it just fetched, and the lightbox takes it as-is rather than re-reading `images`, which React has not re-rendered yet.

## LightboxOverlay Props

| Prop               | Type                                             | Default           | Description                                                                                                                                                                |
| ------------------ | ------------------------------------------------ | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isOpen`           | `boolean`                                        | required          | Control lightbox visibility. For URL-driven open state, use the separate `LightboxUrlOverlay` — see URL State.                                                             |
| `images`           | `LightboxItem[]`                                 | required          | Image array to display                                                                                                                                                     |
| `ariaLabel`        | `string`                                         | `'Image gallery'` | Accessible label for dialog region; announced on open                                                                                                                      |
| `initialIndex`     | `number`                                         | `0`               | Starting image index                                                                                                                                                       |
| `transitionFn`     | `TransitionTransformFn`                          | `slideTransition` | Slide transition fn. Import from `@reelkit/react-lightbox` (`slideTransition`, `flipTransition`, `lightboxFadeTransition`, `lightboxZoomTransition`) or pass a custom one. |
| `apiRef`           | `MutableRefObject<ReelApi>`                      | -                 | Ref to Reel API                                                                                                                                                            |
| `renderControls`   | `(props: ControlsRenderProps) => ReactNode`      | -                 | Custom controls, replace default close button, counter, fullscreen toggle                                                                                                  |
| `renderNavigation` | `(props: NavigationRenderProps) => ReactNode`    | -                 | Custom nav, replace default prev/next arrows                                                                                                                               |
| `renderInfo`       | `(props: InfoRenderProps) => ReactNode`          | -                 | Custom info overlay, replace default title + description gradient. Return null to hide.                                                                                    |
| `renderSlide`      | `(props: SlideRenderProps) => ReactNode \| null` | -                 | Custom slide render. Receive `{ item, index, size, isActive, onReady, onWaiting, onError }`. Return null = fall back to default.                                           |
| `renderLoading`    | `(props: { item, activeIndex }) => ReactNode`    | -                 | Custom loading indicator, replace default spinner                                                                                                                          |
| `renderError`      | `(props: { item, activeIndex }) => ReactNode`    | -                 | Custom error indicator, replace default error icon                                                                                                                         |

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

## LightboxUrlOverlay Props

Takes every visual/behavior prop above except `isOpen`, replaced by a `controller`. `initialIndex` is ignored — the controller's index picks the slide, so a value passed alongside it is overwritten on every open.

| Prop         | Type                 | Default  | Description                                                                                                                                                          |
| ------------ | -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controller` | `UrlStateController` | required | Controller from `useOverlayUrlState`. Its `index` decides whether the overlay is open and which slide; the overlay writes back through it on slide change and close. |

## Callbacks

| Prop            | Type                      | Description             |
| --------------- | ------------------------- | ----------------------- |
| `onClose`       | `() => void`              | Fire on close           |
| `onSlideChange` | `(index: number) => void` | Fire after slide change |

## Sub-Components

Reusable sub-components for composing custom controls via `renderControls`.

| Component          | Description                                                                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CloseButton`      | Default X close button.                                                                                                                                                                                           |
| `Counter`          | Image counter pill showing "1 / 3".                                                                                                                                                                               |
| `FullscreenButton` | Fullscreen toggle button (Maximize/Minimize icon).                                                                                                                                                                |
| `SoundButton`      | Mute/unmute toggle for video slides (Volume2/VolumeX icon). Included automatically in the `renderControls` from `useVideoSlideRenderer`. Standalone inside custom controls, read sound state via `useSoundState`. |

```tsx
import { CloseButton, Counter, FullscreenButton } from '@reelkit/react-lightbox';

<Counter currentIndex={activeIndex} count={count} />
<FullscreenButton isFullscreen={isFullscreen} onToggle={onToggleFullscreen} />
<CloseButton onClick={onClose} />
```

## Hooks

### useVideoSlideRenderer

Hook for opt-in video support. Returns `renderSlide`, `renderControls`, and `SoundProvider` — wrap the overlay in `SoundProvider` and pass the render functions.

```typescript
import { useVideoSlideRenderer } from '@reelkit/react-lightbox';

const { renderSlide, renderControls, SoundProvider, hasVideo } =
  useVideoSlideRenderer(items, isOpen);

// SoundProvider  — wrap LightboxOverlay in this for mute/unmute support
// renderSlide    — pass to LightboxOverlay's renderSlide prop
// renderControls — pass to LightboxOverlay's renderControls prop
//                  (includes Counter, FullscreenButton, SoundButton, CloseButton)
// hasVideo       — true if items contain at least one video
// isOpen param   — resets mute to true on close (enables autoplay on reopen)
```

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

## Keyboard Shortcuts

| Key          | Action                                        |
| ------------ | --------------------------------------------- |
| `ArrowLeft`  | Previous image                                |
| `ArrowRight` | Next image                                    |
| `Escape`     | Close lightbox (or exit fullscreen if active) |

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
