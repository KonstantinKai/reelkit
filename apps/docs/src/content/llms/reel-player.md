---
title: Reel Player
url: https://reelkit.dev/docs/reel-player
section: React
order: 3
desc: Full-screen TikTok/Reels-style video reel player overlay for React. ContentItem schema, props, callbacks, slot renderers, keyboard shortcuts, theming tokens, and CSS classes.
---

# Reel Player

Full-screen TikTok/Reels-style video reel player overlay for React. Vertical reel of mixed image/video content. Shared video instance, lazy preload, configurable slot renderers, accessible focus management, full theming via CSS custom properties.

## Install

```bash
npm install @reelkit/react-reel-player
```

```ts
import {
  ReelPlayerOverlay,
  type ContentItem,
} from '@reelkit/react-reel-player';
import '@reelkit/react-reel-player/styles.css';
```

## Quick Start

```tsx
import { useState } from 'react';
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
        src: '/videos/v1.mp4',
        poster: '/posters/v1.jpg',
        aspectRatio: 16 / 9,
      },
    ],
    author: { name: 'Alex', avatar: '/avatars/a1.jpg' },
    likes: 1234,
    description: 'Sunset vibes',
  },
  // ...
];

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  return (
    <>
      {content.map((item, i) => (
        <button
          key={item.id}
          onClick={() => {
            setInitialIndex(i);
            setIsOpen(true);
          }}
        >
          <img src={item.media[0].poster ?? item.media[0].src} />
        </button>
      ))}

      <ReelPlayerOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={content}
        initialIndex={initialIndex}
      />
    </>
  );
}
```

## ContentItem Schema

```ts
interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  poster?: string; // video only
  aspectRatio?: number; // declared aspect; auto-corrected on metadata load
}

interface ContentItem {
  id: string;
  media: MediaItem[]; // 1+; 2+ enables nested horizontal slider
  author?: { name: string; avatar?: string };
  likes?: number;
  description?: string;
}
```

## URL State (shareable links, back button)

`ReelPlayerUrlOverlay` is a separate component whose open state lives in the URL. Build a controller with `useOverlayUrlState` from `@reelkit/react` and pass it as `controller`: the player opens itself when the param names a slide and closes when it goes away. **Opening is a link** — the href is the open action, no click handler.

```tsx
import { useOverlayUrlState, indexKey } from '@reelkit/react';
import { ReelPlayerUrlOverlay } from '@reelkit/react-reel-player';
import { Link } from 'react-router-dom';

const reel = useOverlayUrlState({
  param: 'reel',
  ...indexKey(() => content.length),
});

// Opening is a link — the overlay reads the URL and opens itself.
{
  content.map((item, i) => (
    <Link key={item.id} to={`?reel=${i}`}>
      <img src={getThumbnail(item)} />
    </Link>
  ));
}

<ReelPlayerUrlOverlay controller={reel} content={content} />;
```

Full `useOverlayUrlState` options (`param`, `adapter`, `codec`, `locator`): see the [React API reference](/docs/react/api#useoverlayurlstate).

- Opening pushes **one** history entry. Swiping the feed **replaces** it — N swipes add 0 entries, so one back step always leaves the player. Back closes; it does not step slides.
- **Back closes only when opened from within the app** (the link pushed an entry). A shared link opened directly in a fresh tab has no history behind it, so browser-back leaves the site — close with the ✕ button or Escape to remove the parameter in place and stay.
- Deep link `?reel=3` opens the player at that slide on load. Closing a link that arrived with the page removes the param in place rather than navigating off-site.
- A param naming no slide (stale bookmark, hand-edited) is dropped from the URL instead of leaving the address bar asserting a slide that cannot open.
- The param addresses the **vertical** slide only. Which image a multi-media post is showing is not carried in the URL.

**Routed app — pass an adapter.** Writing `history.pushState` behind a router leaves its location stale and its next navigation drops the param:

```tsx
import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';

const adapter = useReactRouterUrlAdapter(); // { read, subscribe, push, replace, getState, goBack }
const reel = useOverlayUrlState({
  param: 'reel',
  adapter,
  ...indexKey(() => content.length),
});

<ReelPlayerUrlOverlay controller={reel} content={content} />;
```

**Stable links.** The index is positional — a bookmarked `?reel=3` opens a different post once the feed is reordered, which for a feed is the normal case rather than the exception. Key by identity instead. Two separate jobs: `codec` spells the identity into the URL (wire), `locator` finds where that identity sits (lookup).

```tsx
const reel = useOverlayUrlState({
  param: 'reel',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => content.findIndex((x) => x.id === id),
    identify: (index) => content[index].id,
  },
});

<ReelPlayerUrlOverlay controller={reel} content={content} />;
```

**Infinite feeds.** `locate` is synchronous, so it can only answer for posts already loaded — a shared link to post 400 of a feed that has loaded 20 comes up empty. `locateAsync` is the fallback, called only when `locate` misses: load the pages you need, then return the index the identity turned out to have.

```tsx
const reel = useOverlayUrlState({
  param: 'reel',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => content.findIndex((x) => x.id === id),
    identify: (index) => content[index].id,
    locateAsync: async (id) => {
      const loaded = await loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!loaded) return null; // exhausted — link names no post
      setContent(loaded); // commit — the overlay renders from this state
      return loaded.findIndex((x) => x.id === id); // wherever it landed
    },
  },
});

<ReelPlayerUrlOverlay controller={reel} content={content} />;
```

While `locateAsync` is pending the player stays closed and the param is left alone — the deep link survives the fetch. `null` or a rejection drops the param. An answer that arrives after the URL moved on, after a close, or after unmount is discarded, so a slow fetch cannot open a slide nobody asked for.

Nothing is rendered while pending; the page already owns that loading state, so render your own skeleton. There is no timeout — the player cannot know how long the feed is, so settle with `null` when pagination is exhausted or the overlay stays closed indefinitely.

## ReelPlayerOverlay Props

| Prop                         | Type                                                     | Default          | Description                                                                                                                                                                                                              |
| ---------------------------- | -------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `isOpen`                     | `boolean`                                                | required         | Control overlay visibility                                                                                                                                                                                               |
| `content`                    | `T[]`                                                    | required         | Content items array (generic, defaults to `ContentItem`)                                                                                                                                                                 |
| `initialIndex`               | `number`                                                 | `0`              | Start slide index                                                                                                                                                                                                        |
| `apiRef`                     | `MutableRefObject<ReelApi>`                              | -                | Ref to Reel API                                                                                                                                                                                                          |
| `ariaLabel`                  | `string`                                                 | `'Video player'` | Dialog region label; screen reader announce on overlay open                                                                                                                                                              |
| `aspectRatio`                | `number`                                                 | `9/16 (0.5625)`  | Width/height ratio, desktop player container. Mobile = full viewport.                                                                                                                                                    |
| `timeline`                   | `'auto' \| 'always' \| 'never'`                          | `'auto'`         | Built-in timeline bar gating. `'auto'` = render only videos longer than `timelineMinDurationSeconds`. `'always'` = whenever active slide video. `'never'` = disable built-in (use `renderTimeline` for custom).          |
| `timelineMinDurationSeconds` | `number`                                                 | `30`             | Min video duration (s) for `timeline='auto'` render. Short loops below threshold suppressed.                                                                                                                             |
| `renderControls`             | `(props: ControlsRenderProps) => ReactNode`              | -                | Custom controls. Replace default close + sound.                                                                                                                                                                          |
| `renderError`                | `(props: { item: T; activeIndex: number }) => ReactNode` | -                | Custom error indicator. Replace default error icon.                                                                                                                                                                      |
| `renderLoading`              | `(props: { item: T; activeIndex: number }) => ReactNode` | -                | Custom loading indicator. Replace default wave loader.                                                                                                                                                                   |
| `renderNavigation`           | `(props: NavigationRenderProps) => ReactNode`            | -                | Custom nav. Replace default vertical arrows.                                                                                                                                                                             |
| `renderNestedNavigation`     | `(props: NavigationRenderProps) => ReactNode`            | -                | Custom nav for nested horizontal slider (multi-media posts). Replace default left/right arrows.                                                                                                                          |
| `renderNestedSlide`          | `(props: NestedSlideRenderProps) => ReactNode`           | -                | Custom slide renderer for nested horizontal slider items. Use `props.defaultContent` to wrap/embed default ImageSlide/VideoSlide. Unlike `renderSlide`, null not fallback.                                               |
| `renderSlide`                | `(props: SlideRenderProps) => ReactNode \| null`         | -                | Custom slide rendering. Return null = fallback default. Use `props.defaultContent` to wrap/embed default.                                                                                                                |
| `renderSlideOverlay`         | `(item, index, isActive) => ReactNode`                   | -                | Custom overlay per slide. Replace default SlideOverlay. Return null = hide.                                                                                                                                              |
| `renderTimeline`             | `(props: TimelineRenderProps) => ReactNode`              | -                | Custom timeline bar. Invoked only when gating rules render default bar (same auto/always/never + `timelineMinDurationSeconds` logic). Use `props.defaultContent` to wrap built-in `<TimelineBar />`. Return null = hide. |

### Reel-Forwarded Props

Pass through to `<Reel>`:

| Prop                  | Type      | Default | Description              |
| --------------------- | --------- | ------- | ------------------------ |
| `enableNavKeys`       | `boolean` | `true`  | Keyboard nav             |
| `enableWheel`         | `boolean` | `true`  | Mouse wheel nav          |
| `loop`                | `boolean` | `false` | Infinite loop            |
| `swipeDistanceFactor` | `number`  | `0.12`  | Swipe threshold (0-1)    |
| `transitionDuration`  | `number`  | `300`   | Transition duration (ms) |
| `wheelDebounceMs`     | `number`  | `200`   | Wheel debounce (ms)      |

## ReelPlayerUrlOverlay Props

Type: `ReelPlayerUrlOverlayProps<T>`

Takes every visual/behavior prop above except `isOpen`, replaced by a `controller`. `initialIndex` is ignored — the controller's index picks the slide, so a value passed alongside it is overwritten on every open.

| Prop         | Type                 | Default  | Description                                                                                                                                                          |
| ------------ | -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controller` | `UrlStateController` | required | Controller from `useOverlayUrlState`. Its `index` decides whether the overlay is open and which slide; the overlay writes back through it on slide change and close. |

## Callbacks

| Prop            | Type                      | Description             |
| --------------- | ------------------------- | ----------------------- |
| `onClose`       | `() => void`              | Fire on player close    |
| `onSlideChange` | `(index: number) => void` | Fire after slide change |

## Sub-Components

Reusable building blocks exported for composition in custom render props.

| Component          | Description                                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `CloseButton`      | Standalone close button with default reel-player styling. Use inside `renderControls`.                                                                                                                 |
| `SoundButton`      | Standalone sound toggle. Must be inside a `SoundProvider` (automatically provided by `ReelPlayerOverlay`).                                                                                             |
| `TimelineProvider` | Supplies the timeline state that `TimelineBar` reads. Mounted automatically inside `ReelPlayerOverlay`; mount it yourself to render a `TimelineBar` standalone.                                        |
| `TimelineBar`      | Default playback scrub bar. Reads the nearest `TimelineProvider` and renders track, buffered ranges, progress fill, and scrub pill. Theme via `--rk-reel-timeline-*`, or replace via `renderTimeline`. |
| `SlideOverlay`     | Default gradient overlay showing author, description, and likes. Rendered automatically when content has the required fields. Use `renderSlideOverlay` to replace or hide it.                          |

```ts
interface CloseButtonProps {
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

interface SoundButtonProps {
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface TimelineBarProps {
  className?: string;
  style?: React.CSSProperties;
}
```

```tsx
import { CloseButton, SoundButton } from '@reelkit/react-reel-player';

<CloseButton onClick={onClose} />
<SoundButton />
```

## CSS Theming Tokens

All CSS custom properties on `:root` — app-level overrides stick. Set on higher selector to scope per-instance.

### Overlay

| Token                  | Default | Controls        |
| ---------------------- | ------- | --------------- |
| `--rk-reel-overlay-bg` | `#000`  | Backdrop color  |
| `--rk-reel-overlay-z`  | `1000`  | Overlay z-index |

### Buttons (close, sound, nav arrows)

| Token                              | Default                    | Controls                   |
| ---------------------------------- | -------------------------- | -------------------------- |
| `--rk-reel-button-bg`              | `rgba(0, 0, 0, 0.5)`       | Default circular button bg |
| `--rk-reel-button-bg-hover`        | `rgba(255, 255, 255, 0.1)` | Nav arrow bg (base hover)  |
| `--rk-reel-button-bg-hover-strong` | `rgba(255, 255, 255, 0.2)` | Nav arrow hover bg         |
| `--rk-reel-button-fg`              | `#fff`                     | Button icon color          |
| `--rk-reel-button-size`            | `44px`                     | Button width/height        |
| `--rk-reel-button-radius`          | `50%`                      | Button border-radius       |

### UI layout

| Token                    | Default | Controls                           |
| ------------------------ | ------- | ---------------------------------- |
| `--rk-reel-ui-z`         | `10`    | Close/sound/nav z-index            |
| `--rk-reel-edge-padding` | `16px`  | Edge inset, close/sound/nav arrows |
| `--rk-reel-nav-gap`      | `8px`   | Spacing between stacked nav arrows |
| `--rk-reel-transition`   | `0.2s`  | Hover transition duration          |

### Loader & Error

| Token                       | Default                     | Controls                   |
| --------------------------- | --------------------------- | -------------------------- |
| `--rk-reel-loader-color`    | `rgba(255, 255, 255, 0.12)` | Wave loader gradient color |
| `--rk-reel-loader-duration` | `1.8s`                      | Wave loader duration       |
| `--rk-reel-error-fg`        | `rgba(255, 255, 255, 0.4)`  | Error icon + text color    |
| `--rk-reel-error-text-size` | `13px`                      | Error message font size    |

### Slide caption overlay

| Token                                       | Default                                         | Controls               |
| ------------------------------------------- | ----------------------------------------------- | ---------------------- |
| `--rk-reel-slide-overlay-bg`                | `linear-gradient(transparent, rgba(0,0,0,0.7))` | Caption scrim gradient |
| `--rk-reel-slide-overlay-padding`           | `48px 16px 16px`                                | Caption inner padding  |
| `--rk-reel-slide-overlay-name-color`        | `#fff`                                          | Author name color      |
| `--rk-reel-slide-overlay-description-color` | `rgba(255, 255, 255, 0.9)`                      | Description text color |
| `--rk-reel-slide-overlay-likes-color`       | `rgba(255, 255, 255, 0.8)`                      | Likes row text color   |

### Video & nested slider

| Token                              | Default                    | Controls                      |
| ---------------------------------- | -------------------------- | ----------------------------- |
| `--rk-reel-video-bg`               | `#000`                     | Letterbox bg behind `<video>` |
| `--rk-reel-nested-button-bg`       | `rgba(0, 0, 0, 0.5)`       | Nested arrow bg               |
| `--rk-reel-nested-button-bg-hover` | `rgba(255, 255, 255, 0.2)` | Nested arrow hover bg         |
| `--rk-reel-nested-button-size`     | `36px`                     | Nested arrow size             |
| `--rk-reel-nested-edge-padding`    | `12px`                     | Nested arrow edge inset       |

### Playback timeline bar

| Token                                     | Default                     | Controls                                  |
| ----------------------------------------- | --------------------------- | ----------------------------------------- |
| `--rk-reel-timeline-track`                | `rgba(255, 255, 255, 0.22)` | Track bg (unplayed region)                |
| `--rk-reel-timeline-buffered`             | `rgba(255, 255, 255, 0.4)`  | Buffered segments color                   |
| `--rk-reel-timeline-fill`                 | `#fff`                      | Played-progress fill color                |
| `--rk-reel-timeline-cursor`               | `#fff`                      | Scrub-handle pill color                   |
| `--rk-reel-timeline-height`               | `3px`                       | Track height at rest                      |
| `--rk-reel-timeline-height-active`        | `6px`                       | Track height on hover/focus/scrub         |
| `--rk-reel-timeline-cursor-width`         | `10px`                      | Scrub-pill width at rest                  |
| `--rk-reel-timeline-cursor-width-active`  | `14px`                      | Scrub-pill width while scrubbing          |
| `--rk-reel-timeline-cursor-height`        | `24px`                      | Scrub-pill height at rest                 |
| `--rk-reel-timeline-cursor-height-active` | `32px`                      | Scrub-pill height while scrubbing         |
| `--rk-reel-timeline-hitbox`               | `16px`                      | Extra pointer hit-area above track        |
| `--rk-reel-timeline-transition`           | `0.15s ease-out`            | Track + pill grow/shrink animation        |
| `--rk-reel-timeline-z`                    | `11`                        | Timeline z-index (above default UI layer) |

## CSS Classes

### Overlay

- `.rk-reel-overlay` — fixed full-screen backdrop
- `.rk-reel-container` — player container
- `.rk-reel-loader` — wave loading animation overlay
- `.rk-reel-media-error` — error state overlay (centered icon + text)
- `.rk-reel-media-error-text` — error message text

### Controls

- `.rk-reel-button` — shared circular icon button (close, sound, nav arrows)
- `.rk-reel-close-btn` — close button
- `.rk-reel-sound-btn` — sound toggle button

### Navigation

- `.rk-reel-nav-arrows` — desktop-only arrow container (hidden below 768px)
- `.rk-reel-nav-button` — individual prev/next nav arrow

### Slide

- `.rk-reel-slide-wrapper` — wrap media + overlay

### SlideOverlay

- `.rk-reel-slide-overlay` — gradient overlay container
- `.rk-reel-slide-overlay-author` — author row (avatar + name)
- `.rk-reel-slide-overlay-avatar`, `-name`, `-description`, `-likes`

### VideoSlide

- `.rk-reel-video-container` — video wrapper
- `.rk-reel-video-element` — the `<video>` element
- `.rk-reel-video-poster` — poster image (fades out on play)
- `.rk-reel-video-poster.rk-visible` — state modifier, video paused/loading

### NestedSlider (multi-media posts)

- `.rk-reel-nested-indicator` — dot pagination
- `.rk-reel-nested-nav` — horizontal carousel arrows (hidden below 768px)
- `.rk-reel-nested-nav-next`, `.rk-reel-nested-nav-prev`

### TimelineBar

- `.rk-reel-timeline` — scrub-bar wrapper. Reuse on custom `renderTimeline` roots to inherit flush-bottom positioning, safe-area padding, touch-device slide-overlay clearance.
- `.rk-reel-timeline-track` — track (unplayed region)
- `.rk-reel-timeline-buffered` — buffered segments layer
- `.rk-reel-timeline-fill` — played-progress fill
- `.rk-reel-timeline-cursor` — scrub-handle pill (floats above track)

## Keyboard Shortcuts

| Key          | Action                     |
| ------------ | -------------------------- |
| `ArrowUp`    | Prev slide                 |
| `ArrowDown`  | Next slide                 |
| `ArrowLeft`  | Prev media (nested slider) |
| `ArrowRight` | Next media (nested slider) |
| `Escape`     | Close player               |

## Custom Slot Examples

### renderControls

```tsx
<ReelPlayerOverlay
  {...props}
  renderControls={({ isMuted, toggleSound, close }) => (
    <>
      <button onClick={close} aria-label="Close">
        ×
      </button>
      <button onClick={toggleSound}>{isMuted ? '🔇' : '🔊'}</button>
    </>
  )}
/>
```

### renderTimeline

```tsx
<ReelPlayerOverlay
  {...props}
  renderTimeline={({ defaultContent, timelineState }) => (
    <div className="rk-reel-timeline my-custom-wrapper">{defaultContent}</div>
  )}
/>
```

### Generic ContentItem

```tsx
type MyItem = ContentItem & { tags: string[] };

<ReelPlayerOverlay<MyItem>
  content={items}
  renderSlideOverlay={(item) => <Tags items={item.tags} />}
/>;
```
