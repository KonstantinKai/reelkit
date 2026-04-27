---
title: Angular Guide
url: https://reelkit.dev/docs/angular/guide
section: Angular
order: 1
desc: Build sliders with @reelkit/angular. rk-reel component, rkReelItem directive, ReelIndicator, apiReady output, signal-based imperative API, virtualization.
---

# Angular Guide

Build sliders w/ `@reelkit/angular`. Standalone components, OnPush change detection, signal reactivity.

## Features

- Touch First — swipe w/ momentum + snap
- Keyboard Nav — arrow keys + Escape
- Wheel Scroll — optional w/ debounce
- Virtualized — 10,000+ items, 3 in DOM
- Indicators — Instagram-style dot scrolling
- Programmatic API — `next()`, `prev()`, `goTo()` via apiReady output
- Loop Mode — infinite circular nav
- Directional — vertical or horizontal
- Standalone Components — no NgModule

## rk-reel Component

`rk-reel` wraps core slider controller. Standalone, OnPush.

```typescript
import { Component } from '@angular/core';
import {
  ReelComponent,
  ReelIndicatorComponent,
  RkReelItemDirective,
} from '@reelkit/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReelComponent, ReelIndicatorComponent, RkReelItemDirective],
  template: `
    <rk-reel
      [count]="items.length"
      style="width: 100%; height: 100dvh"
      direction="vertical"
      [enableWheel]="true"
      (afterChange)="onAfterChange($event)"
    >
      <ng-template rkReelItem let-i let-size="size">
        <div
          [style.width.px]="size[0]"
          [style.height.px]="size[1]"
          [style.background]="items[i].color"
          style="display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff"
        >
          <div style="font-size:1.5rem;font-weight:bold">
            {{ items[i].title }}
          </div>
          <div style="font-size:0.875rem;opacity:0.8">
            {{ items[i].subtitle }}
          </div>
        </div>
      </ng-template>

      <div
        style="position:absolute;right:12px;top:50%;transform:translateY(-50%);z-index:10"
      >
        <rk-reel-indicator direction="vertical" />
      </div>
    </rk-reel>
  `,
})
export class AppComponent {
  items = [
    {
      title: 'Virtualized',
      subtitle: 'Only 3 slides in DOM',
      color: '#6366f1',
    },
    {
      title: 'Touch First',
      subtitle: 'Native swipe gestures',
      color: '#8b5cf6',
    },
    { title: 'Zero Deps', subtitle: 'Tiny bundle size', color: '#7c3aed' },
  ];

  onAfterChange(event: { index: number; indexInRange: number }) {
    console.log('Current index:', event.index);
  }
}
```

## Auto-sizing

`size` input optional. Omit = `rk-reel` auto-measures container via `ResizeObserver`, adapts to CSS layout. Container must be sized by parent (flex, grid, explicit CSS dims).

```html
<!-- Explicit size (fixed) -->
<rk-reel [count]="items.length" [size]="[400, 600]">
  <ng-template rkReelItem let-i let-size="size"> ... </ng-template>
</rk-reel>

<!-- Auto-size (responsive — sized by CSS) -->
<rk-reel [count]="items.length" style="width: 100%; height: 100dvh">
  <ng-template rkReelItem let-i let-size="size"> ... </ng-template>
</rk-reel>
```

## rkReelItem Template Pattern

Instead of React render prop, Angular uses structural directive `rkReelItem` on `ng-template`. Enables virtualization — only visible slides instantiated. Template context gives 3 vars.

```html
<ng-template rkReelItem let-i let-indexInRange="indexInRange" let-size="size">
  <!--
    $implicit (let-i)   : number — absolute slide index (0 to count-1)
    indexInRange        : number — position in visible window (0, 1, or 2)
    size                : [number, number] — [width, height] of container
  -->
  <app-slide
    [data]="items[i]"
    [style.width.px]="size[0]"
    [style.height.px]="size[1]"
  />
</ng-template>
```

## Navigation

Built-in nav methods:

- **Touch/Swipe:** Drag to nav w/ momentum + snap
- **Keyboard:** Arrow keys + Escape
- **Mouse Wheel:** Enable w/ `[enableWheel]="true"`
- **Programmatic:** Use `(apiReady)` output to get `next()`, `prev()`, `goTo()`

```typescript
import { Component } from '@angular/core';
import {
  ReelComponent,
  RkReelItemDirective,
  type ReelApi,
} from '@reelkit/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReelComponent, RkReelItemDirective],
  template: `
    <rk-reel [count]="10" [size]="[400, 600]" (apiReady)="api = $event">
      <ng-template rkReelItem let-i let-size="size">
        <app-slide [index]="i" [size]="size" />
      </ng-template>
    </rk-reel>

    <button (click)="api?.prev()">Prev</button>
    <button (click)="api?.next()">Next</button>
    <button (click)="api?.goTo(5)">Go to 5</button>
  `,
})
export class AppComponent {
  api: ReelApi | undefined;
}
```

## ReelIndicator

Inside `rk-reel`, auto-connects to parent `count` + `active` via `RK_REEL_CONTEXT` injection token — no manual wiring.

```html
<!-- Auto-connect: count and active inherited from parent rk-reel -->
<rk-reel [count]="10" [size]="[400, 600]">
  <ng-template rkReelItem let-i let-size="size"> ... </ng-template>
  <rk-reel-indicator direction="vertical" />
</rk-reel>

<!-- Manual usage: pass count and active explicitly (e.g. outside a rk-reel) -->
<rk-reel-indicator [count]="10" [active]="currentIndex" />
```

## apiReady Output — Signal-Based Pattern

`(apiReady)` fires once after component mounted + measured. Emits `ReelApi` — store + use for imperative nav. Signals work cleanly w/ OnPush.

```typescript
import { Component, signal } from '@angular/core';
import {
  ReelComponent,
  RkReelItemDirective,
  type ReelApi,
} from '@reelkit/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReelComponent, RkReelItemDirective],
  template: `
    <rk-reel
      [count]="items.length"
      [size]="[400, 600]"
      (apiReady)="api.set($event)"
      (afterChange)="onAfterChange($event)"
    >
      <ng-template rkReelItem let-i let-size="size">
        <app-slide [index]="i" [size]="size" />
      </ng-template>
    </rk-reel>

    <span>Current: {{ currentIndex() }}</span>
    <button (click)="api()?.prev()">Prev</button>
    <button (click)="api()?.next()">Next</button>
  `,
})
export class AppComponent {
  api = signal<ReelApi | undefined>(undefined);
  currentIndex = signal(0);

  onAfterChange(event: { index: number }) {
    this.currentIndex.set(event.index);
  }
}
```

## Horizontal Direction

```html
<rk-reel [count]="items.length" [size]="[400, 300]" direction="horizontal">
  <ng-template rkReelItem let-i let-size="size">
    <div [style.width.px]="size[0]" [style.height.px]="size[1]">
      {{ items[i].title }}
    </div>
  </ng-template>
  <rk-reel-indicator direction="horizontal" />
</rk-reel>
```

## Transitions

```typescript
import { Component } from '@angular/core';
import {
  ReelComponent,
  RkReelItemDirective,
  cubeTransition,
} from '@reelkit/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReelComponent, RkReelItemDirective],
  template: `
    <rk-reel
      [count]="items.length"
      [size]="[400, 600]"
      [transition]="cubeTransition"
    >
      <ng-template rkReelItem let-i let-size="size"> ... </ng-template>
    </rk-reel>
  `,
})
export class AppComponent {
  cubeTransition = cubeTransition;
}
```

Built-in: `slideTransition` (default), `fadeTransition`, `flipTransition`, `cubeTransition`, `zoomTransition`.
