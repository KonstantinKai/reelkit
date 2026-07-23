---
title: Angular API Reference
url: https://reelkit.dev/docs/angular/api
section: Angular
order: 2
desc: Complete reference for @reelkit/angular components, inputs, outputs, exposed API methods, ReelIndicator, RK_REEL_CONTEXT injection token, and signal bridges.
---

# Angular API Reference

Reference for `@reelkit/angular` components, inputs, outputs, exposed API methods.

## ReelComponent (rk-reel) Inputs

| Input                 | Type                                        | Default                 | Description                                                                                                        |
| --------------------- | ------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `count`               | `number`                                    | required                | Total slides                                                                                                       |
| `direction`           | `'vertical' \| 'horizontal'`                | `'vertical'`            | Scroll direction                                                                                                   |
| `size`                | `[number, number] \| undefined`             | `undefined`             | Width/height. Omit = auto-measure via ResizeObserver                                                               |
| `initialIndex`        | `number`                                    | `0`                     | Start slide index                                                                                                  |
| `loop`                | `boolean`                                   | `false`                 | Infinite loop                                                                                                      |
| `transition`          | `TransitionTransformFn`                     | `slideTransition`       | Transition fn. Built-in: `slideTransition`, `fadeTransition`, `flipTransition`, `cubeTransition`, `zoomTransition` |
| `transitionDuration`  | `number`                                    | `300`                   | Anim duration ms                                                                                                   |
| `swipeDistanceFactor` | `number`                                    | `0.12`                  | Swipe threshold (0-1)                                                                                              |
| `enableGestures`      | `boolean`                                   | `true`                  | Touch/mouse drag nav                                                                                               |
| `enableNavKeys`       | `boolean`                                   | `true`                  | Keyboard arrow nav                                                                                                 |
| `enableWheel`         | `boolean`                                   | `false`                 | Mouse wheel nav                                                                                                    |
| `wheelDebounceMs`     | `number`                                    | `200`                   | Wheel debounce ms                                                                                                  |
| `rangeExtractor`      | `(index, count) => number[]`                | `defaultRangeExtractor` | Custom fn picks rendered indexes                                                                                   |
| `keyExtractor`        | `(index, indexInRange) => string \| number` | `index => index`        | Key fn for `@for` track (useful w/ loop)                                                                           |
| `className`           | `string`                                    | `''`                    | CSS class on root                                                                                                  |
| `ariaLabel`           | `string`                                    | `'Carousel'`            | Accessible label                                                                                                   |

## ReelComponent Outputs

| Output              | Type                                               | Description                                       |
| ------------------- | -------------------------------------------------- | ------------------------------------------------- |
| `afterChange`       | `EventEmitter<{ index, indexInRange }>`            | Fires after transition done                       |
| `beforeChange`      | `EventEmitter<{ index, nextIndex, indexInRange }>` | Fires before transition starts                    |
| `slideDragStart`    | `EventEmitter<number>`                             | Drag gesture start                                |
| `slideDragEnd`      | `EventEmitter<number>`                             | Drag gesture released                             |
| `slideDragCanceled` | `EventEmitter<number>`                             | Drag canceled (snap-back)                         |
| `apiReady`          | `EventEmitter<ReelApi>`                            | Fires once post view init, exposes imperative API |

## ReelApi Methods (via apiReady)

| Method                  | Type                                  | Description                           |
| ----------------------- | ------------------------------------- | ------------------------------------- |
| `next()`                | `() => void`                          | Next slide                            |
| `prev()`                | `() => void`                          | Prev slide                            |
| `goTo(index, animate?)` | `(number, boolean?) => Promise<void>` | Nav to index                          |
| `adjust()`              | `() => void`                          | Recalc positions (post layout change) |
| `observe()`             | `() => void`                          | Start keyboard listen                 |
| `unobserve()`           | `() => void`                          | Stop keyboard listen                  |

```typescript
@Component({
  template: `<rk-reel
    [count]="10"
    [size]="[400, 600]"
    (apiReady)="api.set($event)"
    >…</rk-reel
  >`,
})
export class AppComponent {
  api = signal<ReelApi | undefined>(undefined);
  // call api()?.next() etc.
}
```

## ReelIndicatorComponent (rk-reel-indicator) Inputs

| Input           | Type                         | Default                   | Description                                                                                       |
| --------------- | ---------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------- |
| `count`         | `number \| undefined`        | auto                      | Total items. Auto-wired from parent `rk-reel` context when nested; pass explicit when standalone  |
| `active`        | `number \| undefined`        | auto                      | Active index. Auto-wired from parent `rk-reel` context when nested; pass explicit when standalone |
| `direction`     | `'vertical' \| 'horizontal'` | `'vertical'`              | Orientation                                                                                       |
| `radius`        | `number`                     | `3`                       | Dot radius px                                                                                     |
| `visible`       | `number`                     | `5`                       | Max normal-size dots shown                                                                        |
| `gap`           | `number`                     | `4`                       | Dot spacing px                                                                                    |
| `activeColor`   | `string`                     | `'#fff'`                  | Active dot color                                                                                  |
| `inactiveColor` | `string`                     | `'rgba(255,255,255,0.5)'` | Inactive dot color                                                                                |
| `edgeScale`     | `number`                     | `0.5`                     | Scale for edge overflow dots                                                                      |
| `className`     | `string`                     | `''`                      | CSS class on container                                                                            |
| `tablistLabel`  | `string`                     | `'Slide navigation'`      | Accessible label for tablist                                                                      |

## ReelIndicatorComponent Outputs

| Output     | Type                   | Description            |
| ---------- | ---------------------- | ---------------------- |
| `dotClick` | `EventEmitter<number>` | Dot click; emits index |

## RK_REEL_CONTEXT Injection Token

When `<rk-reel>` is parent, provides reactive context children inject. Used internally by `rk-reel-indicator` for auto-connect; inject it in custom components that need slider context.

Type: `ReelContextValue`

| Property | Type                                                  | Description            |
| -------- | ----------------------------------------------------- | ---------------------- |
| `index`  | `Signal<number>`                                      | Reactive current index |
| `count`  | `Signal<number>`                                      | Reactive total count   |
| `goTo`   | `(index: number, animate?: boolean) => Promise<void>` | Programmatic nav       |

```typescript
import { Component, inject } from '@angular/core';
import { RK_REEL_CONTEXT } from '@reelkit/angular';

@Component({ ... })
export class MyChild {
  ctx = inject(RK_REEL_CONTEXT, { optional: true });
  // this.ctx?.index(), this.ctx?.count(), this.ctx?.goTo(5)
}
```

## Signal Bridges

Bridges core `Subscribable<T>` / `AnimatedValue` to Angular signals for clean OnPush integration.

| Function               | Signature                                                                                                   | Description                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `toAngularSignal`      | `(source: Subscribable<T>, destroyRef: DestroyRef) => Signal<T>`                                            | Core Subscribable → read-only Angular Signal                                           |
| `animatedSignalBridge` | `(source: AnimatedValue, zone: NgZone, cdRef: ChangeDetectorRef, destroyRef: DestroyRef) => Signal<number>` | Core animated value → Angular Signal, updates via `requestAnimationFrame` outside zone |

## RkReelItemDirective

Structural directive on `<ng-template>` for slide content.

Template context type: `RkReelItemContext`

| Variable                            | Type               | Description                          |
| ----------------------------------- | ------------------ | ------------------------------------ |
| `$implicit` (`let-i`)               | `number`           | Absolute slide index                 |
| `indexInRange` (`let-indexInRange`) | `number`           | Position in visible window (0, 1, 2) |
| `size` (`let-size="size"`)          | `[number, number]` | `[width, height]` of container       |

```html
<ng-template rkReelItem let-i let-indexInRange="indexInRange" let-size="size">
  <app-slide [index]="i" [size]="size" />
</ng-template>
```

## BodyLockService

Reference-counted body scroll lock. Multiple concurrent callers (e.g. a lightbox and a modal both open) can each call lock/unlock independently — the body is only restored once the last caller releases it. Provided at root, so it can be injected anywhere.

```typescript
import { inject } from '@angular/core';
import { BodyLockService } from '@reelkit/angular';

@Component({ ... })
export class OverlayComponent {
  private readonly bodyLock = inject(BodyLockService);

  open() { this.bodyLock.lock(); }
  close() { this.bodyLock.unlock(); }
}
```

## RkSwipeToCloseDirective

Attribute directive (`[rkSwipeToClose]`) that adds a vertical swipe-to-dismiss gesture to its host element. While enabled it translates the host along the swipe direction and fades it out, emits `dismissed` once the drag exceeds the threshold, and animates back when it does not.

| Member                    | Type                     | Default | Description                                     |
| ------------------------- | ------------------------ | ------- | ----------------------------------------------- |
| `rkSwipeToClose`          | `boolean`                | `false` | When `true`, the swipe-to-close gesture is live |
| `rkSwipeToCloseDirection` | `SwipeToCloseDirection`  | `'up'`  | Swipe direction that triggers the close         |
| `dismissed`               | `OutputEmitterRef<void>` | —       | Emitted once a swipe passes the threshold       |

`SwipeToCloseDirection` is `'up' | 'down'`.

```html
<div
  [rkSwipeToClose]="isMobile"
  rkSwipeToCloseDirection="up"
  (dismissed)="handleClose()"
>
  …slider content…
</div>
```

## createOverlayUrlState

Type: `OverlayUrlStateOptions`

Builds a URL-state controller for an overlay, which you hand to `<rk-lightbox-url-overlay>` as its `[controller]` input. Call it in an injection context — a field initialiser or the constructor; it attaches immediately and releases through `DestroyRef`.

| Option    | Type                                                                                        | Default     | Description                                                                                                                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `param`   | `string`                                                                                    | required    | Query parameter carrying the active slide, e.g. `photo`.                                                                                                                                                                       |
| `adapter` | `UrlAdapter`                                                                                | History API | Navigation system to read/write through. Pass a Router-backed adapter in a routed app so the Router's location does not go stale.                                                                                              |
| `codec`   | `{ decode(raw) => Id \| null; encode(id) => string }`                                       | required    | Wire format: param text ↔ a stable identity. Travels with `locator` as a matched pair — spread `...indexKey(() => images().length)` for the default `?photo=3` gallery, or supply your own so a bookmark survives reordering. |
| `locator` | `{ locate(id) => number \| null; locateAsync?(id) => Promise<...>; identify(index) => id }` | required    | Maps the identity to a position and owns its own validity: `locate` (sync), `locateAsync` (async fallback for a paginated gallery), `identify` (writes).                                                                       |

## createRouterUrlAdapter

Subpath: `@reelkit/angular/ng-router-url-adapter`

A `UrlAdapter` backed by the Angular Router. Pass it as the `adapter` option of `createOverlayUrlState` in a routed app so the Router stays the single source of navigation truth — writing `history.pushState` behind the Router leaves its location stale and its next navigation drops the parameter. Call it in an injection context; the `NavigationEnd` subscription releases through `DestroyRef`.

Ships from its own subpath, so an app without routing never pulls `@angular/router` in. `@angular/router` is an optional peer dependency.

```ts
import { createRouterUrlAdapter } from '@reelkit/angular/ng-router-url-adapter';

protected readonly photo = createOverlayUrlState({
  param: 'photo',
  adapter: createRouterUrlAdapter(),
  ...indexKey(() => this.images().length),
});
```

## Re-exports from core

`@reelkit/angular` re-exports core helpers:

- Transitions: `slideTransition`, `fadeTransition`, `flipTransition`, `cubeTransition`, `zoomTransition`
- Range extractor: `defaultRangeExtractor`
- Key extractor: `createDefaultKeyExtractorForLoop` — handles duplicate indexes when `loop` is enabled
- Focus: `captureFocusForReturn`, `createFocusTrap`, `getFocusableElements`
- Signals: `Signal`, `ComputedSignal`, `createSignal`, `createComputed`, `reaction`, `batch`
