---
title: Vue Guide
url: https://reelkit.dev/docs/vue/guide
section: Vue
order: 1
desc: Build sliders with @reelkit/vue. Reel component, #item slot, ReelIndicator, imperative API via template ref, transitions, virtualization, and event handlers.
---

# Vue Guide

Build sliders w/ `@reelkit/vue`. Composition API, `<script setup>`, virtualization w/ 10,000+ items.

## Features

- Touch First — swipe w/ momentum + snap
- Keyboard Nav — arrow keys + Escape
- Wheel Scroll — optional, debounce
- Virtualized — 10,000+ items, 3 in DOM
- Indicators — Instagram-style dot scrolling
- Programmatic API — `next()`, `prev()`, `goTo()` via template ref
- Loop Mode — infinite circular nav
- Directional — vertical or horizontal
- Composition API — `<script setup>` w/ composables

## Basic Slider

`<Reel>` wraps core slider controller. Use `#item` slot render each slide w/ virtualization — only visible slides mounted.

```vue
<script setup lang="ts">
import { Reel, ReelIndicator } from '@reelkit/vue';

const items = [
  { title: 'Virtualized', subtitle: 'Only 3 slides in DOM', color: '#6366f1' },
  { title: 'Touch First', subtitle: 'Native swipe gestures', color: '#8b5cf6' },
  { title: 'Zero Deps', subtitle: 'Tiny bundle size', color: '#7c3aed' },
];

const onAfterChange = (index: number) => {
  console.log('Current index:', index);
};
</script>

<template>
  <Reel
    :count="items.length"
    style="width: 100%; height: 100dvh"
    direction="vertical"
    :enable-wheel="true"
    @after-change="onAfterChange"
  >
    <template #item="{ index, size }">
      <div
        :style="{
          width: size[0] + 'px',
          height: size[1] + 'px',
          background: items[index].color,
        }"
      >
        <div>{{ items[index].title }}</div>
        <div>{{ items[index].subtitle }}</div>
      </div>
    </template>

    <ReelIndicator direction="vertical" />
  </Reel>
</template>
```

## ReelIndicator

Placed inside `<Reel>` → auto-connect parent's `count` + `active` via Vue `provide/inject`. No manual wiring.

```vue-html
<!-- Auto-connect: count and active inherited from parent Reel -->
<Reel :count="10" :size="[400, 600]">
  <template #item="{ index, size }"> ... </template>
  <ReelIndicator direction="vertical" />
</Reel>

<!-- Manual usage: pass count and active explicitly (e.g. outside a Reel) -->
<ReelIndicator :count="10" :active="currentIndex" />
```

## Imperative API — Template Ref

`<Reel>` expose `ReelExpose` via template ref. Use `ref()` store reference, call methods `next()`, `prev()`, `goTo()`.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Reel, type ReelExpose } from '@reelkit/vue';

const items = [
  /* ... */
];
const sliderRef = ref<ReelExpose | null>(null);
const currentIndex = ref(0);

const onAfterChange = (index: number) => {
  currentIndex.value = index;
};
</script>

<template>
  <Reel
    ref="sliderRef"
    :count="items.length"
    style="width: 100%; height: 100dvh"
    direction="vertical"
    :enable-wheel="true"
    @after-change="onAfterChange"
  >
    <template #item="{ index, size }">
      <div :style="{ width: size[0] + 'px', height: size[1] + 'px' }">
        {{ items[index].title }}
      </div>
    </template>
  </Reel>

  <button :disabled="currentIndex === 0" @click="sliderRef?.prev()">
    Prev
  </button>
  <button
    :disabled="currentIndex === items.length - 1"
    @click="sliderRef?.next()"
  >
    Next
  </button>
  <button @click="sliderRef?.goTo(2)">Go to 3</button>
</template>
```

## Horizontal Direction

Set `direction="horizontal"` for left/right swipe. Indicator direction match.

```vue-html
<Reel
  :count="items.length"
  :size="[400, 300]"
  direction="horizontal"
>
  <template #item="{ index, size }">
    <div :style="{ width: size[0] + 'px', height: size[1] + 'px' }">
      {{ items[index].title }}
    </div>
  </template>

  <ReelIndicator direction="horizontal" />
</Reel>
```

## Auto-sizing

`size` prop optional. Omit → `<Reel>` auto-measure container via `ResizeObserver`, adapt CSS-driven layout. Container must be sized by parent (flex, grid, or explicit CSS dimensions).

```vue-html
<!-- Explicit size (fixed) -->
<Reel :count="items.length" :size="[400, 600]">
  <template #item="{ index, size }"> ... </template>
</Reel>

<!-- Auto-size (responsive — sized by CSS) -->
<Reel :count="items.length" style="width: 100%; height: 100dvh">
  <template #item="{ index, size }"> ... </template>
</Reel>
```

## Transitions

Pass `transition` prop customize slide animation. ReelKit ships five tree-shakeable transitions: `slideTransition` (default), `fadeTransition`, `flipTransition`, `cubeTransition`, `zoomTransition`.

```vue
<script setup lang="ts">
import { Reel, cubeTransition } from '@reelkit/vue';
</script>

<template>
  <Reel :count="items.length" :size="[400, 600]" :transition="cubeTransition">
    <template #item="{ index, size }"> ... </template>
  </Reel>
</template>
```

## Event Handlers

```vue
<script setup lang="ts">
const onBeforeChange = (
  index: number,
  nextIndex: number,
  rangeIndex: number,
) => {
  console.log('Before change:', index, '->', nextIndex);
};
const onAfterChange = (index: number, rangeIndex: number) => {
  console.log('After change:', index);
};
const onSlideDragStart = (index: number) => {
  console.log('Drag start at', index);
};
const onSlideDragEnd = (index: number) => {
  console.log('Drag end at', index);
};
</script>

<template>
  <Reel
    :count="items.length"
    :size="[400, 600]"
    @before-change="onBeforeChange"
    @after-change="onAfterChange"
    @slide-drag-start="onSlideDragStart"
    @slide-drag-end="onSlideDragEnd"
  >
    <template #item="{ index, size }"> ... </template>
  </Reel>
</template>
```

## Virtualization

reelkit render only **3 slides in DOM** any time (current, previous, next). Smooth scrolling 10,000+ items.

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { Reel, ReelIndicator } from '@reelkit/vue';

const TOTAL = 10000;
const items = computed(() =>
  Array.from({ length: TOTAL }, (_, i) => ({
    title: `Item ${i + 1}`,
    color: `hsl(${(i * 137.5) % 360}, 70%, 50%)`,
  })),
);
</script>

<template>
  <Reel
    :count="items.length"
    style="width: 100%; height: 100dvh"
    direction="vertical"
    :enable-wheel="true"
  >
    <template #item="{ index, size }">
      <div
        :style="{
          width: size[0] + 'px',
          height: size[1] + 'px',
          background: items[index].color,
        }"
      >
        {{ items[index].title }}
      </div>
    </template>
    <ReelIndicator direction="vertical" :visible="4" />
  </Reel>
</template>
```
