---
title: React API Reference
url: https://reelkit.dev/docs/react/api
section: React
order: 2
desc: Complete reference for @reelkit/react components, props, methods, callbacks, ReelIndicator, Observe, AnimatedObserve, hooks, accessibility, and utilities.
---

# React API Reference

Reference for `@reelkit/react` components, props, methods.

## Reel Props

Type: `ReelProps`

| Prop                  | Type                                          | Default                 | Description                                                                                                        |
| --------------------- | --------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `count`               | `number`                                      | required                | Total items                                                                                                        |
| `size`                | `[number, number]`                            | -                       | Width/height. Omit = auto-measure via ResizeObserver                                                               |
| `itemBuilder`         | `(index, indexInRange, size) => ReactElement` | required                | Render each slide                                                                                                  |
| `direction`           | `'vertical' \| 'horizontal'`                  | `'vertical'`            | Scroll direction                                                                                                   |
| `initialIndex`        | `number`                                      | `0`                     | Start index                                                                                                        |
| `loop`                | `boolean`                                     | `false`                 | Infinite loop                                                                                                      |
| `enableWheel`         | `boolean`                                     | `false`                 | Mouse wheel nav                                                                                                    |
| `wheelDebounceMs`     | `number`                                      | `200`                   | Wheel debounce ms                                                                                                  |
| `enableNavKeys`       | `boolean`                                     | `true`                  | Keyboard nav                                                                                                       |
| `onNavKeyPress`       | `(increment: -1 \| 1) => void`                | -                       | Custom arrow key handler. Replaces default prev/next.                                                              |
| `transition`          | `TransitionTransformFn`                       | `slideTransition`       | Transition fn. Built-in: `slideTransition`, `fadeTransition`, `flipTransition`, `cubeTransition`, `zoomTransition` |
| `transitionDuration`  | `number`                                      | `300`                   | Animation ms                                                                                                       |
| `enableGestures`      | `boolean`                                     | `true`                  | Touch/mouse drag                                                                                                   |
| `swipeDistanceFactor` | `number`                                      | `0.12`                  | Swipe threshold (0-1)                                                                                              |
| `rangeExtractor`      | `(index, count) => number[]`                  | `defaultRangeExtractor` | Pick rendered indexes                                                                                              |
| `keyExtractor`        | `(index: number) => string`                   | -                       | Key fn for React reconciliation (useful w/ loop)                                                                   |
| `apiRef`              | `RefObject<ReelApi>`                          | -                       | Ref to API methods                                                                                                 |
| `className`           | `string`                                      | -                       | Container CSS class                                                                                                |
| `style`               | `CSSProperties`                               | -                       | Container inline styles                                                                                            |
| `ariaLabel`           | `string`                                      | -                       | Screen reader label for carousel region                                                                            |

## Callbacks

| Prop                  | Type                                       | Description               |
| --------------------- | ------------------------------------------ | ------------------------- |
| `afterChange`         | `(index, indexInRange) => void`            | Fires after slide change  |
| `beforeChange`        | `(index, nextIndex, indexInRange) => void` | Fires before slide change |
| `onSlideDragStart`    | `(index) => void`                          | Drag start                |
| `onSlideDragEnd`      | `(index) => void`                          | Drag end                  |
| `onSlideDragCanceled` | `(index) => void`                          | Drag canceled             |

## ReelApi Methods

Access via `apiRef`:

```typescript
const apiRef = useRef<ReelApi>(null);

// Navigation
apiRef.current?.next();
apiRef.current?.prev();
apiRef.current?.goTo(5); // instant
apiRef.current?.goTo(5, true); // animated

// Lifecycle
apiRef.current?.adjust(); // recalculate positions
apiRef.current?.observe(); // start observing keyboard
apiRef.current?.unobserve(); // stop observing keyboard
```

| Method                  | Type                            | Description            |
| ----------------------- | ------------------------------- | ---------------------- |
| `next()`                | `() => void`                    | Next slide             |
| `prev()`                | `() => void`                    | Prev slide             |
| `goTo(index, animate?)` | `(number, boolean?) => Promise` | Go to slide            |
| `adjust()`              | `() => void`                    | Recalc positions       |
| `observe()`             | `() => void`                    | Start keyboard observe |
| `unobserve()`           | `() => void`                    | Stop keyboard observe  |

## ReelIndicator Props

Type: `ReelIndicatorProps`

| Prop            | Type                         | Default                   | Description                                                                       |
| --------------- | ---------------------------- | ------------------------- | --------------------------------------------------------------------------------- |
| `count`         | `number`                     | auto                      | Total items. Auto-wired from parent Reel when nested; pass explicitly standalone  |
| `active`        | `number`                     | auto                      | Active index. Auto-wired from parent Reel when nested; pass explicitly standalone |
| `direction`     | `'vertical' \| 'horizontal'` | `'vertical'`              | Orientation                                                                       |
| `radius`        | `number`                     | `3`                       | Dot size px                                                                       |
| `visible`       | `number`                     | `5`                       | Max normal-sized dots                                                             |
| `gap`           | `number`                     | `4`                       | Dot gap px                                                                        |
| `activeColor`   | `string`                     | `'#fff'`                  | Active dot color                                                                  |
| `inactiveColor` | `string`                     | `'rgba(255,255,255,0.5)'` | Inactive dot color                                                                |
| `edgeScale`     | `number`                     | `0.5`                     | Scale for overflow edge dots                                                      |
| `onDotClick`    | `(index: number) => void`    | -                         | Dot click callback                                                                |
| `className`     | `string`                     | -                         | CSS class                                                                         |
| `style`         | `CSSProperties`              | -                         | Inline styles                                                                     |

## Observer Components

### Observe

Bridges core signals to React render. No parent re-render. Only children fn re-runs on signal change.

```tsx
import { Observe } from '@reelkit/react';

<Observe signals={[controller.state.index]}>
  {() => <span>Current: {controller.state.index.value}</span>}
</Observe>;
```

| Prop       | Type                         | Default  | Description                                                                                                                |
| ---------- | ---------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `signals`  | `Subscribable[]`             | required | Signals to subscribe to. Any of them notifying re-runs the children fn — and only that fn, never the parent.               |
| `children` | `() => ReactElement \| null` | required | Render fn, re-executed on each change. Read signal values inside it; a value read outside is captured once and goes stale. |

### AnimatedObserve

Subscribes to animated value signals. Smooth interpolate via `requestAnimationFrame`.

```tsx
import { AnimatedObserve } from '@reelkit/react';

<AnimatedObserve signal={controller.state.axisValue}>
  {(value) => <div style={{ transform: `translateY(${value}px)` }} />}
</AnimatedObserve>;
```

| Prop       | Type                              | Default  | Description                                                                                                                     |
| ---------- | --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `signal`   | `Signal<AnimatedValue>`           | required | Signal emitting `{ value, duration, done? }`. A `duration` above 0 interpolates from the current value; 0 jumps straight there. |
| `children` | `(value: number) => ReactElement` | required | Render fn receiving the interpolated value for the current frame, committed synchronously so the DOM keeps up.                  |

## Hooks

### useBodyLock

Locks body scroll. Compensates scrollbar width shift.

```typescript
import { useBodyLock } from '@reelkit/react';

// Lock body scroll when overlay is open
useBodyLock(isOpen);
```

### useOverlayUrlState

Type: `OverlayUrlStateOptions`

Builds a URL-state controller for an overlay, which you hand to a `*UrlOverlay` as its `controller` prop.

Walkthrough + examples: [URL State in the React guide](/docs/react/guide#url-state).

| Option    | Type                                                                                        | Default     | Description                                                                                                                                                                                                                                                                                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `param`   | `string`                                                                                    | required    | Query parameter carrying the active slide, e.g. `photo`.                                                                                                                                                                                                                                                                                                                     |
| `adapter` | `UrlAdapter`                                                                                | History API | Navigation system to read/write through. Pass a router-backed adapter in a routed app so the router's location does not go stale.                                                                                                                                                                                                                                            |
| `codec`   | `{ decode(raw) => Id \| null; encode(id) => string }`                                       | required    | Wire format: param text ↔ a stable identity. Travels with `locator` as a matched pair sharing the same `Id` — spread `...urlIndexKey(() => images.length)` for the default `?photo=3` index gallery, or supply your own (base64, slug) so a bookmark survives reordering.                                                                                                   |
| `locator` | `{ locate(id) => number \| null; locateAsync?(id) => Promise<...>; identify(index) => id }` | required    | Maps the identity to a position and owns its own validity: `locate` (sync), `locateAsync` (async fallback for a paginated gallery), `identify` (writes). For a plain index gallery spread `...urlIndexKey(() => images.length)` — it supplies this locator plus the matching codec and bounds `?photo=3` against the live count so a stale `?photo=99` heals out of the URL. |

### useReactRouterUrlAdapter

A `UrlAdapter` backed by React Router. Pass it as the `adapter` option of `useOverlayUrlState` in a routed app so the router stays the single source of navigation truth — writing `history.pushState` behind the router leaves its location stale and its next navigation drops the parameter.

Ships from its own subpath, so an app without a router never pulls `react-router-dom` in. `react-router-dom` is an optional peer dependency.

```tsx
import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';

const adapter = useReactRouterUrlAdapter();
const photo = useOverlayUrlState({
  param: 'photo',
  adapter,
  ...urlIndexKey(() => images.length),
});
```

## Accessibility

`<Reel>` renders `role="region"` + `aria-roledescription="carousel"`. Set `ariaLabel` for screen reader name. Polite live region announces "Slide N of M" on change, no re-render. Inactive slides get `inert` — focus + AT skip them.

`<ReelIndicator>` renders `role="tablist"` w/ roving tabindex on dots. Arrow keys move focus, Enter/Space activates slide.

Custom modal around `<Reel>`? `captureFocusForReturn`, `createFocusTrap`, `getFocusableElements` re-exported from `@reelkit/react` for focus return + trap.

## Utilities

### createDefaultKeyExtractorForLoop

Key extractor handling duplicate indexes when `loop` on.

```tsx
import { createDefaultKeyExtractorForLoop } from '@reelkit/react';

<Reel
  count={items.length}
  size={size}
  loop
  keyExtractor={createDefaultKeyExtractorForLoop(items.length)}
  itemBuilder={...}
/>
```
