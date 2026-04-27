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

### AnimatedObserve

Subscribes to animated value signals. Smooth interpolate via `requestAnimationFrame`.

```tsx
import { AnimatedObserve } from '@reelkit/react';

<AnimatedObserve signal={controller.state.axisValue}>
  {(value) => <div style={{ transform: `translateY(${value}px)` }} />}
</AnimatedObserve>;
```

## Hooks

### useBodyLock

Locks body scroll. Compensates scrollbar width shift.

```typescript
import { useBodyLock } from '@reelkit/react';

// Lock body scroll when overlay is open
useBodyLock(isOpen);
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
