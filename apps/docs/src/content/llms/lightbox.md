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
  downloadUrl?: string; // what the download button saves; default src
  downloadName?: string; // file name; default last URL path segment
}
```

## URL State (shareable links, back button)

Live demo: https://react-demo.reelkit.dev/image-preview-url

`LightboxUrlOverlay` is a separate component whose open state lives in the URL. Build a controller with `useOverlayUrlState` from `@reelkit/react` and pass it as `controller`: the lightbox opens itself when the param names a slide and closes when it goes away. **Opening is a link** — the href is the open action, no click handler.

> **Built-in keys.** Spread `urlIndexKey` (by position) or `urlStableIdKey` (by a stable `id`) into the controller — both re-exported from `@reelkit/react`. See the [URL State guide](/docs/core/guide#url-state) and [Core API](/docs/core/api#url-state).

```tsx
import {
  useOverlayUrlState,
  urlIndexKey,
  urlStableIdKey,
} from '@reelkit/react';
import { LightboxUrlOverlay } from '@reelkit/react-lightbox';
import { Link } from 'react-router-dom';

const photo = useOverlayUrlState({
  param: 'photo',
  ...urlIndexKey(() => images.length),
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
- **Back closes only when opened from within the app** (the link pushed an entry). A shared link opened directly in a fresh tab has no history behind it, so browser-back leaves the site — close with the ✕ button or Escape to remove the parameter in place and stay. The packaged router adapters vouch for a same-page link push; a custom adapter that cannot say how the entry arrived gets the in-place close too, which leaves a duplicate of the page in history — one back step then looks like nothing happened, but nothing reopens.
- Deep link `?photo=3` opens the gallery at that slide on load. Closing a link that arrived with the page removes the param in place rather than navigating off-site.
- A param naming no slide (stale bookmark, hand-edited) is dropped from the URL instead of leaving the address bar asserting a slide that cannot open.

**Routed app — pass an adapter.** Writing `history.pushState` behind a router leaves its location stale and its next navigation drops the param:

```tsx
import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';

const adapter = useReactRouterUrlAdapter(); // { read, subscribe, push, replace, getState, goBack }
const photo = useOverlayUrlState({
  param: 'photo',
  adapter,
  ...urlIndexKey(() => images.length),
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

**Stable links.** The index is positional — a bookmarked `?photo=3` opens a different image once the list is reordered. `urlStableIdKey` keys by each item's stable `id`, scanning the live list — one call covers the common case:

```tsx
const photo = useOverlayUrlState({
  param: 'photo',
  ...urlStableIdKey({ items: () => images }),
});

<LightboxUrlOverlay controller={photo} images={images} />;
```

Pass `hashCodec: base64UrlCodec` to base64url-encode the id in the URL — reversible obfuscation, not a cryptographic hash.

Key by a different field (a `slug`), or page an infinite feed with `locateAsync`, and build the `codec`/`locator` yourself. Two separate jobs: `codec` spells the identity into the URL (wire), `locator` finds where that identity sits (lookup).

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

> **Shortcut.** Keying by the item's `id`? Skip the hand-rolled codec and locator — pass `locateAsync` straight to `urlStableIdKey({ items, locateAsync })` (it fetches on a miss, then returns the index). The fuller version below is for keying by another field, or for full control.

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

## Auto-advance

`autoAdvance` → gallery plays as slideshow on open. Off by default.

```tsx
<LightboxOverlay
  isOpen={index !== null}
  images={images}
  initialIndex={index ?? 0}
  onClose={() => setIndex(null)}
  autoAdvance
  autoAdvanceInterval={4000}
/>
```

- Images stay `autoAdvanceInterval` (default 5000 ms), counted from load — slow image never skipped unseen. Failed image counts from error.
- Videos play once (no loop), advance on end. `useVideoSlideRenderer` wires it; custom `renderSlide` reads `autoAdvance`, reports end via `onEnded`.
- Waits while mouse rests on a control (button, link, caption), during swipe, while page hidden; continues from same progress.
- Manual nav (arrows, keys, wheel, swipe) restarts new slide's interval; slideshow stays on.
- Stops on last slide unless `loop`. Play/pause button in controls shows + switches state.
- Custom `renderControls` gets `isAutoAdvancing` + `onToggleAutoAdvance` (only when `autoAdvance` on) → render `PlayPauseButton` when present.
- Timing = `createSlideshowController` from `@reelkit/core` ([Autoplay guide](/docs/core/guide#autoplay), [Core API](/docs/core/api#autoplay)).

## Download

`showDownload` → download button in controls. Saves active item from `downloadUrl` (else `src`) as `downloadName` (else last URL path segment).

```tsx
const images: LightboxItem[] = [
  {
    src: 'https://cdn.example.com/beach-1600.jpg',
    downloadUrl: 'https://cdn.example.com/beach-original.jpg',
    downloadName: 'beach.jpg',
  },
];

<LightboxOverlay
  isOpen={index !== null}
  images={images}
  onClose={close}
  showDownload
/>;
```

- Fetch → blob → save, since browsers ignore `download` attr on cross-origin link. Fetch fails (cross-origin w/o CORS usual) → file opens in new tab. Serve with `Access-Control-Allow-Origin` for one-click save.
- Button disabled while downloading.
- Custom `renderControls` gets `isDownloading` + `onDownload` (only when `showDownload` on) → render `DownloadButton` when present.
- Helper = `downloadFile` from `@reelkit/core` ([Download guide](/docs/core/guide#download)).

## LightboxOverlay Props

Type: `LightboxOverlayProps`.

| Prop                  | Type                                             | Default           | Description                                                                                                                                                                |
| --------------------- | ------------------------------------------------ | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isOpen`              | `boolean`                                        | required          | Control lightbox visibility. For URL-driven open state, use the separate `LightboxUrlOverlay` — see URL State.                                                             |
| `images`              | `LightboxItem[]`                                 | required          | Image array to display                                                                                                                                                     |
| `ariaLabel`           | `string`                                         | `'Image gallery'` | Accessible label for dialog region; announced on open                                                                                                                      |
| `initialIndex`        | `number`                                         | `0`               | Starting image index                                                                                                                                                       |
| `transitionFn`        | `TransitionTransformFn`                          | `slideTransition` | Slide transition fn. Import from `@reelkit/react-lightbox` (`slideTransition`, `flipTransition`, `lightboxFadeTransition`, `lightboxZoomTransition`) or pass a custom one. |
| `autoAdvance`         | `boolean`                                        | `false`           | Play gallery as slideshow (see Auto-advance)                                                                                                                               |
| `autoAdvanceInterval` | `number`                                         | `5000`            | Image time during slideshow, ms, counted once loaded                                                                                                                       |
| `showDownload`        | `boolean`                                        | `false`           | Download button for active item (see Download)                                                                                                                             |
| `apiRef`              | `MutableRefObject<ReelApi>`                      | -                 | Ref to Reel API                                                                                                                                                            |
| `renderControls`      | `(props: ControlsRenderProps) => ReactNode`      | -                 | Custom controls, replace default close button, counter, fullscreen toggle                                                                                                  |
| `renderNavigation`    | `(props: NavigationRenderProps) => ReactNode`    | -                 | Custom nav, replace default prev/next arrows                                                                                                                               |
| `renderInfo`          | `(props: InfoRenderProps) => ReactNode`          | -                 | Custom info overlay, replace default title + description gradient. Return null to hide.                                                                                    |
| `renderSlide`         | `(props: SlideRenderProps) => ReactNode \| null` | -                 | Custom slide render. Receive `{ item, index, size, isActive, autoAdvance, onReady, onWaiting, onError, onEnded }`. Return null = fall back to default.                     |
| `renderLoading`       | `(props: { item, activeIndex }) => ReactNode`    | -                 | Custom loading indicator, replace default spinner                                                                                                                          |
| `renderError`         | `(props: { item, activeIndex }) => ReactNode`    | -                 | Custom error indicator, replace default error icon                                                                                                                         |

### Reel-Forwarded Props

Type: `ReelProxyProps` — subset of Reel props the overlay passes through; type a wrapper that forwards them.

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

Type: `LightboxUrlOverlayProps`. Takes every visual/behavior prop above except `isOpen`, replaced by a `controller`. `initialIndex` is ignored — the controller's position picks the slide, so a value passed alongside it is overwritten on every open.

| Prop         | Type                 | Default  | Description                                                                                                                                                             |
| ------------ | -------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controller` | `UrlStateController` | required | Controller from `useOverlayUrlState`. Its `position` decides whether the overlay is open and which slide; the overlay writes back through it on slide change and close. |

## Callbacks

| Prop            | Type                      | Description                                                                                                                              |
| --------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `onClose`       | `() => void`              | Called on close. Required on `LightboxOverlay` (you own the open state); optional on `LightboxUrlOverlay`, where the URL drives closing. |
| `onSlideChange` | `(index: number) => void` | Fire after slide change                                                                                                                  |

## Sub-Components

Reusable sub-components for composing custom controls via `renderControls`.

| Component          | Description                                                                                                                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `CloseButton`      | Default X close button. `CloseButtonProps`: `onClick`, `className?`, `style?`.                                                                                                                                                                                                       |
| `Counter`          | Image counter pill showing "1 / 3". `CounterProps`: `currentIndex` (zero-based), `count`, `className?`, `style?`.                                                                                                                                                                    |
| `FullscreenButton` | Fullscreen toggle button (Maximize/Minimize icon). `FullscreenButtonProps`: `isFullscreen`, `onToggle`, `className?`, `style?`.                                                                                                                                                      |
| `SoundButton`      | Mute/unmute toggle for video slides (Volume2/VolumeX icon). Included automatically in the `renderControls` from `useVideoSlideRenderer`. Standalone inside custom controls, read sound state via `useSoundState`. `SoundButtonProps`: `isMuted`, `onToggle`, `className?`, `style?`. |
| `PlayPauseButton`  | Slideshow toggle (Play/Pause icon, `aria-pressed` while playing). `PlayPauseButtonProps`: `isPlaying`, `onToggle`, `className?`, `style?`. Default controls show it when `autoAdvance` on.                                                                                           |
| `DownloadButton`   | Download button (Download icon), disabled while downloading. `DownloadButtonProps`: `isDownloading`, `onClick`, `className?`, `style?`. Default controls show it when `showDownload` on.                                                                                             |

```tsx
import {
  CloseButton,
  Counter,
  FullscreenButton,
  PlayPauseButton,
  DownloadButton,
} from '@reelkit/react-lightbox';

<Counter currentIndex={activeIndex} count={count} />
<FullscreenButton isFullscreen={isFullscreen} onToggle={onToggleFullscreen} />
{onToggleAutoAdvance && (
  <PlayPauseButton isPlaying={isAutoAdvancing} onToggle={onToggleAutoAdvance} />
)}
{onDownload && <DownloadButton isDownloading={isDownloading} onClick={onDownload} />}
<CloseButton onClick={onClose} />
```

## Hooks

### useVideoSlideRenderer

Hook for opt-in video support. Returns `renderSlide`, `renderControls`, and `SoundProvider` — wrap the overlay in `SoundProvider` and pass the render functions.

```typescript
import { useVideoSlideRenderer } from '@reelkit/react-lightbox';

const { renderSlide, renderControls, SoundProvider, hasVideo } =
  useVideoSlideRenderer(items);

// SoundProvider  — wrap LightboxOverlay in this for mute/unmute support
// renderSlide    — pass to LightboxOverlay's renderSlide prop; with
//                  autoAdvance a video plays once and reports its end
// renderControls — pass to LightboxOverlay's renderControls prop
//                  (Counter, FullscreenButton, SoundButton, CloseButton, plus
//                  PlayPauseButton / DownloadButton when those are switched on)
// hasVideo       — true if items contain at least one video
```

Return type: `UseVideoSlideRendererResult`.

`LightboxVideoSlide` — video slide its `renderSlide` draws for video items. Plays through one shared `<video>` element (sound keeps working on iOS), remembers each video's position. Render it yourself only from a custom `renderSlide`. `LightboxVideoSlideProps`: `src`, `poster?`, `isActive`, `size`, `slideKey` (keys saved position + captured frame), `loop?` (default `true`), `onPlaying?`, `onWaiting?`, `onError?`, `onEnded?`.

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

| Token                                | Default                    | Controls                                                |
| ------------------------------------ | -------------------------- | ------------------------------------------------------- |
| `--rk-lightbox-btn-bg`               | `rgba(0, 0, 0, 0.5)`       | Default bg for close, nav, small buttons                |
| `--rk-lightbox-btn-bg-hover`         | `rgba(255, 255, 255, 0.2)` | Hover bg for close, nav, small buttons                  |
| `--rk-lightbox-btn-fg`               | `#fff`                     | Icon color for close, nav, small buttons                |
| `--rk-lightbox-btn-size`             | `36px`                     | Small button size (fullscreen toggle, etc.)             |
| `--rk-lightbox-btn-disabled-opacity` | `0.5`                      | Opacity of disabled small button (download in progress) |
| `--rk-lightbox-close-size`           | `40px`                     | Close button size                                       |
| `--rk-lightbox-nav-size`             | `48px`                     | Prev/next arrow size                                    |
| `--rk-lightbox-nav-opacity`          | `0.7`                      | Idle opacity of prev/next arrows                        |

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
- `.rk-lightbox-play-pause` — slideshow play/pause button (with `.rk-lightbox-btn`)
- `.rk-lightbox-download` — download button (with `.rk-lightbox-btn`)
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
    count,
    isFullscreen,
    onToggleFullscreen,
    onClose,
  }) => (
    <div className="my-controls">
      <button onClick={onClose}>×</button>
      <span>
        {activeIndex + 1} / {count}
      </span>
      <button onClick={onToggleFullscreen}>{isFullscreen ? '⤡' : '⤢'}</button>
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
