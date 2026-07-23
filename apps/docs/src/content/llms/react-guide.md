---
title: React Guide
url: https://reelkit.dev/docs/react/guide
section: React
order: 1
desc: Build sliders with @reelkit/react. Reel component, itemBuilder pattern, navigation, ReelIndicator, virtualization with 10000+ items, and performance tips.
---

# React Guide

Build sliders with `@reelkit/react`.

## Features

- Touch First — swipe w/ momentum + snap
- Keyboard Nav — arrow keys + Escape
- Wheel Scroll — optional, debounced
- Virtualized — 10,000+ items, 3 in DOM
- Indicators — Instagram-style dot scroll
- Programmatic API — `next()`, `prev()`, `goTo()` via ref
- Loop Mode — infinite circular nav
- Directional — vertical or horizontal
- Zero Re-renders — signal-based state

## Reel Component

`Reel` = main container. Manages slider state, touch gestures, keyboard nav, animations.

```tsx
import { Reel, ReelIndicator } from '@reelkit/react';

<Reel
  count={items.length}
  size={[width, height]}
  direction="vertical"
  enableWheel
  afterChange={(index) => console.log('Current:', index)}
  itemBuilder={(index, indexInRange, size) => (
    <div style={{ width: size[0], height: size[1] }}>Slide {index}</div>
  )}
>
  {/* Optional children like ReelIndicator */}
</Reel>;
```

## Auto-sizing

`size` prop optional. Omit = `Reel` auto-measures container via `ResizeObserver`, adapts to CSS layout. Container must be sized by parent (flex, grid, explicit CSS dims).

```tsx
// Explicit size (fixed)
<Reel count={items.length} size={[400, 600]} itemBuilder={...} />

// Auto-size (responsive — sized by CSS)
<Reel count={items.length} style={{ width: '100%', height: '100dvh' }} itemBuilder={...} />
```

## itemBuilder Pattern

`itemBuilder` = fn. Receive index, return slide content. Enables virtualization — only visible items render.

```tsx
itemBuilder={(index, indexInRange, size) => {
  // index: actual item index (0 to count-1)
  // indexInRange: position in visible window (0, 1, or 2)
  // size: [width, height] of the container
  return <Slide index={index} />;
}}
```

## Navigation

Built-in nav methods:

- **Touch/Swipe:** Drag w/ momentum + snap
- **Keyboard:** Arrow keys + Escape
- **Mouse Wheel:** Enable via `enableWheel` prop
- **Programmatic:** Use `apiRef` for `next()`, `prev()`, `goTo()`

```tsx
import { useRef } from 'react';
import { Reel, type ReelApi } from '@reelkit/react';

function App() {
  const apiRef = useRef<ReelApi>(null);

  return (
    <>
      <Reel
        count={10}
        size={[400, 600]}
        apiRef={apiRef}
        itemBuilder={(index) => <Slide index={index} />}
      />
      <button onClick={() => apiRef.current?.prev()}>Prev</button>
      <button onClick={() => apiRef.current?.next()}>Next</button>
      <button onClick={() => apiRef.current?.goTo(5)}>Go to 5</button>
    </>
  );
}
```

## URL State

`useOverlayUrlState` builds a URL-state controller for an overlay and returns it whole — hand it to a `*UrlOverlay` as its `controller` prop. The URL owns the open state, so a bound overlay opens itself and a **link** is the usual open action. Keep the controller to read `value`/`index` and to drive it programmatically: `set(index)` opens, `set(null)` closes, and `set` is the same low-level write the overlay uses internally on slide change.

First write of an absent param pushes ONE history entry; every write after replaces it. So paging N slides costs 0 entries and one back step always leaves.

```tsx
import { useOverlayUrlState, indexKey } from '@reelkit/react';
import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';
import { LightboxUrlOverlay } from '@reelkit/react-lightbox';
import { Link } from 'react-router-dom';

const photo = useOverlayUrlState({
  param: 'photo',
  ...indexKey(() => images.length),
});

// Opening is a link — the overlay reads the URL and opens itself.
<Link to="?photo=3">
  <img src={images[3].src} />
</Link>;
<LightboxUrlOverlay controller={photo} images={images} />;

// Read the url-derived state, or close programmatically (a low-level write).
photo.index.value; // 3 for ?photo=3, null when nothing is open
photo.set(null); // close

// Routed app: pass a router-backed adapter, otherwise the router's
// own location goes stale and its next navigation drops the param.
const adapter = useReactRouterUrlAdapter();
const routed = useOverlayUrlState({
  param: 'photo',
  adapter,
  ...indexKey(() => images.length),
});
```

The options object takes `param`, `codec`, and `locator` (all three required), plus an optional `adapter`. `codec` and `locator` are a matched pair sharing the same `Id`, so they travel together — for a plain `?photo=3` gallery spread `...indexKey(() => images.length)`, which returns both halves at once. `indexKey` maps the param to a slide index and bounds it against the live count the getter returns, so a stale or out-of-range `?photo=99` is rejected and heals itself out of the URL instead of opening a slide that was never named. Pass a getter, not a number, so the bound stays right as a paginated feed grows. It wraps `createIndexLocator` (the locator half) and pairs it with `indexCodec`. A paginated feed or an identity-keyed gallery supplies its own matched `codec` + `locator` instead. Full options table: [React API reference](/docs/react/api#useoverlayurlstate).

## ReelIndicator

Optional. Show Instagram-style progress dots for current position. Inside `Reel` = auto-connect to parent's `count` + `active` via context. No manual wiring.

```tsx
import { Reel, ReelIndicator } from '@reelkit/react';

{/* Auto-connect: count and active are inherited from parent Reel */}
<Reel count={10} size={[400, 600]} itemBuilder={...}>
  <ReelIndicator />
</Reel>

{/* Manual usage: pass count and active explicitly (e.g. outside a Reel) */}
<ReelIndicator count={10} active={currentIndex} />
```

## Key Points

- **size prop**: Optional [width, height] tuple. Omit = auto-size via CSS
- **itemBuilder**: Receive index, return slide content
- **apiRef**: Access controller methods for nav
- **afterChange**: Track current index for UI updates

## Virtualization (Infinite List)

reelkit render only **3 slides in DOM** at once (current, prev, next). Smooth scroll for 10,000+ items.

- 3 Items in DOM — only visible slides render
- 10,000+ Items — no jank at any scale
- Constant Memory — same 3 DOM nodes regardless of count
- `goTo(n)` — jump to any index instantly

```tsx
import { useRef, useMemo, useState } from 'react';
import { Reel, ReelIndicator, type ReelApi } from '@reelkit/react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const TOTAL_ITEMS = 10000;

const generateItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    title: `Item ${i + 1}`,
    color: `hsl(${(i * 137.5) % 360}, 70%, 50%)`,
  }));

export default function InfiniteList() {
  const apiRef = useRef<ReelApi>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = useMemo(() => generateItems(TOTAL_ITEMS), []);

  return (
    <Reel
      count={items.length}
      style={{ width: '100%', height: '100dvh' }}
      direction="vertical"
      enableWheel
      apiRef={apiRef}
      afterChange={(index) => setCurrentIndex(index)}
      itemBuilder={(index, indexInRange, itemSize) => (
        <div
          style={{
            width: itemSize[0],
            height: itemSize[1],
            background: items[index].color,
          }}
        >
          {items[index].title}
        </div>
      )}
    >
      <ReelIndicator direction="vertical" visible={4} />
    </Reel>
  );
}
```

## Growable List (load on scroll)

Simulate infinite feed — items load on demand, like TikTok/Instagram. Start w/ N items, scroll near end, new batches arrive auto.

- Dynamic Count — items load on scroll
- Batch Loading — N items per batch
- Virtualized — still 3 in DOM
- Auto Indicator — dots grow w/ content

```tsx
import { useRef, useState } from 'react';
import { Reel, ReelIndicator, type ReelApi } from '@reelkit/react';

const BATCH_SIZE = 20;
const MAX_ITEMS = 200;
const LOAD_THRESHOLD = 3;

const generateItems = (startIndex: number, count: number) =>
  Array.from({ length: count }, (_, i) => {
    const index = startIndex + i;
    return {
      title: `Item ${index + 1}`,
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
    };
  });

export default function GrowableList() {
  const apiRef = useRef<ReelApi>(null);
  const [items, setItems] = useState(() => generateItems(0, BATCH_SIZE));
  const loadingRef = useRef(false);

  const handleAfterChange = (index: number) => {
    if (
      index >= items.length - LOAD_THRESHOLD &&
      items.length < MAX_ITEMS &&
      !loadingRef.current
    ) {
      loadingRef.current = true;
      setTimeout(() => {
        setItems((prev) => [
          ...prev,
          ...generateItems(prev.length, BATCH_SIZE),
        ]);
        loadingRef.current = false;
      }, 1000);
    }
  };

  return (
    <Reel
      count={items.length}
      style={{ width: '100%', height: '100dvh' }}
      direction="vertical"
      enableWheel
      apiRef={apiRef}
      afterChange={handleAfterChange}
      itemBuilder={(index, _indexInRange, itemSize) => (
        <div
          style={{
            width: itemSize[0],
            height: itemSize[1],
            background: items[index].color,
          }}
        >
          {items[index].title}
        </div>
      )}
    />
  );
}
```
