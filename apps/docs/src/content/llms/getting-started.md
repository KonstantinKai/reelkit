---
title: Getting Started
url: https://reelkit.dev/docs/getting-started
section: Getting started
order: 1
desc: reelkit is a single-item slider — one item visible at a time, like TikTok, Instagram Reels, or Stories. Perfect for vertical video feeds, fullscreen galleries, and swipeable content.
---

# Getting Started

reelkit = **single-item slider**. One item visible at time. Like TikTok, Instagram Reels, Stories. Good for vertical video feeds, fullscreen galleries, swipeable content.

> [!WARNING]
> ReelKit under active dev. While 0.x.x, APIs may change between minor versions, no deprecation period. Pin version to avoid breakage.

## Try It Online

Try in browser, no install:

- React Demo: https://react-demo.reelkit.dev/?utm_source=docs
- React Starter (StackBlitz): https://stackblitz.com/github/KonstantinKai/reelkit-react-starter
- Angular Demo: https://angular-demo.reelkit.dev/?utm_source=docs
- Angular Starter (StackBlitz): https://stackblitz.com/github/KonstantinKai/reelkit-angular-starter
- Vue Demo: https://vue-demo.reelkit.dev/?utm_source=docs
- Vue Starter (StackBlitz): https://stackblitz.com/github/KonstantinKai/reelkit-vue-starter

## Quick Start

Minimal vertical slider.

### React

```tsx
import { Reel, ReelIndicator } from '@reelkit/react';

const items = [
  { id: 1, title: 'Slide 1', color: '#6366f1' },
  { id: 2, title: 'Slide 2', color: '#8b5cf6' },
  { id: 3, title: 'Slide 3', color: '#ec4899' },
];

function App() {
  return (
    <Reel
      count={items.length}
      size={[400, 600]}
      direction="vertical"
      enableWheel
      itemBuilder={(index) => (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: items[index].color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: 'white',
          }}
        >
          {items[index].title}
        </div>
      )}
    >
      <ReelIndicator />
    </Reel>
  );
}
```

### Angular

```typescript
import { Component } from '@angular/core';
import {
  ReelComponent,
  ReelIndicatorComponent,
  RkReelItemDirective,
} from '@reelkit/angular';

const items = [
  { id: 1, title: 'Slide 1', color: '#6366f1' },
  { id: 2, title: 'Slide 2', color: '#8b5cf6' },
  { id: 3, title: 'Slide 3', color: '#ec4899' },
];

@Component({
  standalone: true,
  imports: [ReelComponent, ReelIndicatorComponent, RkReelItemDirective],
  template: `
    <rk-reel
      [count]="items.length"
      [size]="[400, 600]"
      direction="vertical"
      [enableWheel]="true"
    >
      <ng-template rkReelItem let-i let-size="size">
        <div
          [style.width.px]="size[0]"
          [style.height.px]="size[1]"
          [style.background]="items[i].color"
          style="display:flex;align-items:center;justify-content:center;
                    font-size:2rem;color:#fff"
        >
          {{ items[i].title }}
        </div>
      </ng-template>
      <rk-reel-indicator />
    </rk-reel>
  `,
})
export class AppComponent {
  readonly items = items;
}
```

### Vue

```vue
<script setup lang="ts">
import { Reel, ReelIndicator } from '@reelkit/vue';

const items = [
  { id: 1, title: 'Slide 1', color: '#6366f1' },
  { id: 2, title: 'Slide 2', color: '#8b5cf6' },
  { id: 3, title: 'Slide 3', color: '#ec4899' },
];
</script>

<template>
  <Reel
    :count="items.length"
    :size="[400, 600]"
    direction="vertical"
    enable-wheel
  >
    <template #item="{ index, size }">
      <div
        :style="{
          width: size[0] + 'px',
          height: size[1] + 'px',
          background: items[index].color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          color: '#fff',
        }"
      >
        {{ items[index].title }}
      </div>
    </template>

    <ReelIndicator />
  </Reel>
</template>
```

## Key Concepts

### Reel

`Reel` = main container. Manages slider state, handles touch gestures, keyboard nav, animations. Render prop pattern via `itemBuilder` for slides.

### itemBuilder

`itemBuilder` prop = function. Gets index, returns slide content. Enables virtualization — only visible items render.

### ReelIndicator

Optional. Instagram-style progress indicators. Shows current position.

### React example

```tsx
import { Reel, ReelIndicator } from '@reelkit/react';

function App() {
  return (
    <Reel
      count={items.length}
      size={[400, 600]}
      itemBuilder={(index) => <Slide data={items[index]} />}
    >
      <ReelIndicator />
    </Reel>
  );
}
```

### Angular example

```html
<rk-reel [count]="items.length" [size]="[400, 600]">
  <ng-template rkReelItem let-index>
    <app-slide [data]="items[index]" />
  </ng-template>
  <rk-reel-indicator />
</rk-reel>
```

### Vue example

```vue-html
<Reel :count="items.length" :size="[400, 600]">
  <template #item="{ index }">
    <Slide :data="items[index]" />
  </template>
  <ReelIndicator />
</Reel>
```

## Navigation

Built-in nav methods:

- **Touch/Swipe:** Drag to navigate. Momentum + snap.
- **Keyboard:** Arrow keys. Overlay components also handle Escape to close.
- **Mouse Wheel:** Enable with `enableWheel` prop.
- **Programmatic:** Use `apiRef` for `next()`, `prev()`, `goTo()`.

### React

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

### Angular

```html
<rk-reel [count]="10" [size]="[400, 600]" (apiReady)="reelApi = $event">
  <ng-template rkReelItem let-index>
    <app-slide [index]="index" />
  </ng-template>
</rk-reel>

<button (click)="reelApi?.prev()">Prev</button>
<button (click)="reelApi?.next()">Next</button>
<button (click)="reelApi?.goTo(5)">Go to 5</button>
```

### Vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Reel, type ReelExpose } from '@reelkit/vue';

const reelRef = ref<InstanceType<typeof Reel> & ReelExpose>();
</script>

<template>
  <Reel ref="reelRef" :count="10" :size="[400, 600]">
    <template #item="{ index }">
      <Slide :index="index" />
    </template>
  </Reel>

  <button @click="reelRef?.prev()">Prev</button>
  <button @click="reelRef?.next()">Next</button>
  <button @click="reelRef?.goTo(5)">Go to 5</button>
</template>
```

## Next Steps

- [Installation](/docs/installation) — all packages + setup options
- [Core Guide](/docs/core/guide) — framework-agnostic engine
- Framework Guide — React: [/docs/react/guide](/docs/react/guide), Angular: [/docs/angular/guide](/docs/angular/guide), Vue: [/docs/vue/guide](/docs/vue/guide)
- Reel Player — React: [/docs/reel-player](/docs/reel-player), Angular: [/docs/angular-reel-player](/docs/angular-reel-player), Vue: [/docs/vue-reel-player](/docs/vue-reel-player)
- Lightbox — React: [/docs/lightbox](/docs/lightbox), Angular: [/docs/angular-lightbox](/docs/angular-lightbox), Vue: [/docs/vue-lightbox](/docs/vue-lightbox)
- Stories Player — React: [/docs/stories-player](/docs/stories-player), Angular: [/docs/angular-stories-player](/docs/angular-stories-player), Vue: [/docs/vue-stories-player](/docs/vue-stories-player)
