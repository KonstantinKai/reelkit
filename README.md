# Reelkit

A headless, virtualized, TikTok-style vertical slider component library. Supports touch gestures, keyboard navigation, smooth animations, and **virtualizing rendering for massive lists**.

## Features

- 🎯 **Virtualized rendering** - efficiently handles 10,000+ items
- 🎨 **Headless design** - bring your own styles
- 👆 **Touch gestures** - swipe up/down or left/right
- ⌨️ **Keyboard navigation** - arrow keys support
- 🎬 **Smooth animations** - bezier-eased transitions
- 🔄 **Loop mode** - infinite scrolling support
- 📍 **Indicator component** - visual position feedback
- 📦 **Framework bindings** - React and Vue 3 support
- 💪 **TypeScript** - full type safety
- 🪶 **Zero dependencies** - lightweight core

## Packages

| Package | Description |
|---------|-------------|
| `@reelkit/core` | Framework-agnostic core with gesture and slider controllers |
| `@reelkit/react` | React bindings with hooks and components |
| `@reelkit/vue` | Vue 3 bindings with composables and components |

## Installation

```bash
# React
npm install @reelkit/react

# Vue 3
npm install @reelkit/vue

# Core only (framework-agnostic)
npm install @reelkit/core
```

## Usage

### React

```tsx
import { OneItemSlider, OneItemSliderIndicator } from '@reelkit/react';

function App() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <OneItemSlider
      count={5}
      size={[window.innerWidth, window.innerHeight]}
      direction="vertical"
      afterChange={(index) => setActiveIndex(index)}
      itemBuilder={(index) => (
        <div style={{ width: '100%', height: '100%' }}>
          Slide {index + 1}
        </div>
      )}
    >
      <OneItemSliderIndicator
        count={5}
        active={activeIndex}
      />
    </OneItemSlider>
  );
}
```

## API

### OneItemSlider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| count | number | required | Number of slides |
| size | [width, height] | required | Container dimensions |
| itemBuilder | (index, indexInRange, size) => ReactElement | required | Render function for slides |
| direction | 'horizontal' \| 'vertical' | 'vertical' | Slide direction |
| initialIndex | number | 0 | Starting slide index |
| loop | boolean | false | Enable infinite loop |
| swipeDistanceFactor | number | 0.12 | Swipe threshold (0-1) |
| transitionDuration | number | 300 | Animation duration in ms |
| useNavKeys | boolean | true | Enable keyboard navigation |
| apiRef | ref | - | Ref to access public API |
| afterChange | (index) => void | - | Callback after slide change |
| beforeChange | (index, nextIndex) => void | - | Callback before slide change |

### OneItemSliderIndicator Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| count | number | required | Total number of slides |
| active | number | required | Currently active slide index |
| radius | number | 3 | Dot radius in pixels |
| visible | number | 3 | Number of visible dots |
| renderDot | (props) => ReactElement | - | Custom dot renderer |

### Public API (via apiRef)

```typescript
interface OneItemSliderPublicApi {
  next: () => void;      // Go to next slide
  prev: () => void;      // Go to previous slide
  adjust: () => void;    // Recalculate positions (call on resize)
  observe: () => void;   // Start observing gestures
  unobserve: () => void; // Stop observing gestures
}
```

### Vue 3

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { OneItemSlider, type OneItemSliderExpose } from '@reelkit/vue';

const activeIndex = ref(0);
const sliderRef = ref<OneItemSliderExpose | null>(null);
</script>

<template>
  <OneItemSlider
    ref="sliderRef"
    :count="100"
    :size="[400, 600]"
    direction="vertical"
    @index-change="(index) => activeIndex = index"
  >
    <template #default="{ indexes, axisValue }">
      <div :style="{ transform: `translateY(${axisValue}px)` }">
        <div v-for="index in indexes" :key="index">
          Slide {{ index + 1 }}
        </div>
      </div>
    </template>
  </OneItemSlider>
</template>
```

## Development

```bash
# Install dependencies
npm install

# Build all libraries
npx nx run-many -t build -p @reelkit/core @reelkit/react @reelkit/vue

# Run React example
npx nx serve example-react

# Run Vue example
npx nx serve example-vue

# Run tests
npx nx run-many -t test

# Run E2E tests
npx nx e2e example-react
```

## License

MIT
