---
title: Server-Side Rendering
url: https://reelkit.dev/docs/ssr
section: Getting started
order: 3
desc: All reelkit packages work on the server. Import and render with Next.js, Remix, Angular Universal, Nuxt 3, or any SSR setup.
---

# Server-Side Rendering

All reelkit packages work on server. Import + render with Next.js, Remix, Angular Universal, Nuxt 3, any SSR setup.

## How It Works

Core slider controller pure logic — no DOM access at construction. Gesture, keyboard, wheel listeners attach only in client lifecycle hooks.

During SSR, `Reel` renders static container with initial visible slides (typically 3: prev, current, next). On hydration, attaches gesture/keyboard/wheel controllers → interactive.

### SSR Safety Matrix

| Package                         | SSR Safe | Notes                                                        |
| ------------------------------- | -------- | ------------------------------------------------------------ |
| `@reelkit/core`                 | yes      | Pure logic, no browser APIs at import or construction        |
| `@reelkit/react`                | yes      | `Reel` and `ReelIndicator` render valid HTML on server       |
| `@reelkit/react-reel-player`    | yes      | Renders nothing when `isOpen=false`                          |
| `@reelkit/react-lightbox`       | yes      | Renders nothing when `isOpen=false`                          |
| `@reelkit/react-stories-player` | yes      | Renders nothing when `isOpen=false`                          |
| `@reelkit/angular`              | yes      | Standalone components, SSR compatible with Angular Universal |
| `@reelkit/angular-reel-player`  | yes      | Renders nothing when `isOpen=false`                          |
| `@reelkit/angular-lightbox`     | yes      | Renders nothing when `isOpen=false`                          |
| `@reelkit/vue`                  | yes      | Components and composables, SSR compatible with Nuxt 3       |
| `@reelkit/stories-core`         | yes      | Framework-agnostic, no DOM access                            |

## React

### Next.js App Router

`Reel` use browser events + refs → Client Component. Add `"use client"` at top:

```tsx
'use client';

import { Reel, ReelIndicator } from '@reelkit/react';

export function Feed({ items }: { items: FeedItem[] }) {
  return (
    <Reel
      count={items.length}
      size={[400, 700]}
      direction="vertical"
      enableWheel
      itemBuilder={(index) => (
        <div className="w-full h-full flex items-center justify-center">
          {items[index].title}
        </div>
      )}
    >
      <ReelIndicator />
    </Reel>
  );
}
```

Fetch data in Server Component, pass down:

```tsx
// app/feed/page.tsx (Server Component)
import { Feed } from './Feed';

export default async function FeedPage() {
  const items = await fetchFeedItems();

  return <Feed items={items} />;
}
```

### Next.js Pages Router

Works no extra config. Renders during SSR, hydrates on client:

```tsx
// pages/feed.tsx
import { Reel } from '@reelkit/react';
import type { GetServerSideProps } from 'next';

interface Props {
  items: FeedItem[];
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const items = await fetchFeedItems();
  return { props: { items } };
};

export default function FeedPage({ items }: Props) {
  return (
    <Reel
      count={items.length}
      size={[400, 700]}
      itemBuilder={(index) => <Slide data={items[index]} />}
    />
  );
}
```

### Responsive Size with SSR (React)

Omit `size` prop. When not provided, `Reel` auto-measures container via `ResizeObserver` on client. SSR renders empty container; hydration measures + renders slides immediately:

```tsx
'use client';

import { Reel } from '@reelkit/react';

export function FullScreenFeed({ items }: { items: FeedItem[] }) {
  return (
    <Reel
      count={items.length}
      style={{ width: '100%', height: '100dvh' }}
      itemBuilder={(index) => <Slide data={items[index]} />}
    />
  );
}
```

When `size` omitted, container ! sized by CSS (parent flex/grid, explicit width/height, or percentages). Slider renders nothing until first measurement, then fills measured dimensions + responds to resizes auto.

#### Explicit size (manual approach)

For pixel control, pass explicit `size`. Since `window.innerWidth` no available during SSR, provide default + update on mount:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Reel } from '@reelkit/react';

// Default size for SSR — matches common mobile viewport
const DEFAULT_SIZE: [number, number] = [390, 844];

export function FullScreenFeed({ items }: { items: FeedItem[] }) {
  const [size, setSize] = useState<[number, number]>(DEFAULT_SIZE);

  useEffect(() => {
    const update = () => setSize([window.innerWidth, window.innerHeight]);

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <Reel
      count={items.length}
      size={size}
      itemBuilder={(index) => <Slide data={items[index]} />}
    />
  );
}
```

### Overlay Components (React)

`ReelPlayerOverlay` + `LightboxOverlay` render nothing when `isOpen={false}` → SSR-safe by default. Mount portal only when opened (typically from user interaction on client):

```tsx
'use client';

import { useState } from 'react';
import { ReelPlayerOverlay } from '@reelkit/react-reel-player';

export function VideoFeed({ content }: { content: ContentItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {content.map((item, i) => (
          <button
            key={i}
            onClick={() => {
              setStartIndex(i);
              setIsOpen(true);
            }}
          >
            <img src={item.thumbnail} alt="" />
          </button>
        ))}
      </div>

      <ReelPlayerOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={content}
        initialIndex={startIndex}
      />
    </>
  );
}
```

## Angular

### Angular Universal / SSR

All Angular components SSR-safe. Slider controller defers browser API access to `afterRenderEffect`. Overlay components render nothing when `isOpen=false` → no markup during server render.

```typescript
import { Component, signal } from '@angular/core';
import { RkReelPlayerOverlayComponent } from '@reelkit/angular-reel-player';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [RkReelPlayerOverlayComponent],
  template: `
    <rk-reel-player-overlay
      [isOpen]="isOpen()"
      [content]="content"
      (closed)="isOpen.set(false)"
    />
  `,
})
export class FeedComponent {
  isOpen = signal(false);
  content = [
    /* ... */
  ];
}
```

## Vue

### Nuxt 3

ReelKit Vue works with Nuxt 3 out of box. `Reel` use browser APIs (touch events, ResizeObserver) → wrap in `<ClientOnly>` or use `.client.vue` suffix:

```vue
<!-- pages/feed.vue -->
<script setup lang="ts">
const items = await useFetch('/api/feed');
</script>

<template>
  <ClientOnly>
    <Feed :items="items.data.value" />
  </ClientOnly>
</template>
```

Feed uses Reel normally:

```vue
<!-- components/Feed.vue -->
<script setup lang="ts">
import { Reel, ReelIndicator } from '@reelkit/vue';

defineProps<{ items: FeedItem[] }>();
</script>

<template>
  <Reel :count="items.length" direction="vertical" enable-wheel>
    <template #item="{ index, size }">
      <div :style="{ width: size[0] + 'px', height: size[1] + 'px' }">
        {{ items[index].title }}
      </div>
    </template>
    <ReelIndicator />
  </Reel>
</template>
```

### Responsive Size with SSR (Vue)

Omit `size` for auto-measurement. Reel auto-sizes to 100% of parent. SSR renders empty container; hydration measures + renders slides:

```vue
<template>
  <ClientOnly>
    <div style="width: 100%; height: 100dvh">
      <Reel :count="items.length">
        <template #item="{ index, size }">
          <Slide :data="items[index]" :size="size" />
        </template>
      </Reel>
    </div>
  </ClientOnly>
</template>
```

## Using Core Directly

When using `@reelkit/core` direct for custom framework integration, create controller on server. Call `attach()` + `observe()` on client:

```typescript
import { createSliderController } from '@reelkit/core';

// Safe to call on the server — no DOM access
const controller = createSliderController({
  count: 10,
  direction: 'vertical',
});

// Only call on the client — attaches DOM event listeners
if (typeof window !== 'undefined') {
  controller.attach(element);
  controller.observe();
}
```

## Summary

> [!SUCCESS]
> Works out of box:
>
> - Import any reelkit package on server
> - Render slider components during SSR (valid static HTML)
> - Create controllers on server
> - Overlay components when `isOpen=false`

> [!WARNING]
> Keep in mind:
>
> - Omit `size` for auto-measurement, or provide default when using viewport-based dimensions
> - Don't call `attach()` / `observe()` on server when using core direct
