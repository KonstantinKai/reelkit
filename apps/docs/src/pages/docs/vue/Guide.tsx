import { CodeBlock } from '../../../components/ui/CodeBlock';
import { NextSteps } from '../../../components/NextSteps';
import { Sandbox } from '../../../components/ui/Sandbox';
import { FeatureCardGrid } from '../../../components/ui/FeatureCard';
import {
  ArrowRight,
  Hand,
  Keyboard,
  Layers,
  Navigation,
  Zap,
  MousePointer,
  Infinity as InfinityIcon,
  Radio,
  Code,
} from 'lucide-react';

export default function VueGuide() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Vue Guide</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Learn how to build sliders with{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue
          </code>
          .
        </p>
      </div>

      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FeatureCardGrid
            items={[
              {
                icon: Hand,
                label: 'Touch First',
                desc: 'Swipe with momentum and snap',
              },
              {
                icon: Keyboard,
                label: 'Keyboard Nav',
                desc: 'Arrow keys + Escape',
              },
              {
                icon: MousePointer,
                label: 'Wheel Scroll',
                desc: 'Optional with debounce',
              },
              {
                icon: InfinityIcon,
                label: 'Virtualized',
                desc: '10,000+ items, 3 in DOM',
              },
              {
                icon: Radio,
                label: 'Indicators',
                desc: 'Instagram-style dot scrolling',
              },
              {
                icon: Navigation,
                label: 'Programmatic API',
                desc: 'next(), prev(), goTo() via template ref',
              },
              {
                icon: Zap,
                label: 'Loop Mode',
                desc: 'Infinite circular navigation',
              },
              {
                icon: Layers,
                label: 'Directional',
                desc: 'Vertical or horizontal',
              },
              {
                icon: Code,
                label: 'Composition API',
                desc: '<script setup> with composables',
              },
            ]}
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Basic Slider</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'<Reel>'}
          </code>{' '}
          component wraps the core slider controller. Use the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #item
          </code>{' '}
          slot to render each slide with virtualization — only visible slides
          are mounted.
        </p>
        <Sandbox
          code={`<script setup lang="ts">
import { Reel, ReelIndicator } from '@reelkit/vue';

const items = [
  { title: 'Virtualized', subtitle: 'Only 3 slides in DOM', color: '#6366f1' },
  { title: 'Touch First', subtitle: 'Native swipe gestures', color: '#8b5cf6' },
  { title: 'Zero Deps', subtitle: 'Tiny bundle size', color: '#7c3aed' },
  { title: 'Keyboard Nav', subtitle: 'Full a11y support', color: '#ec4899' },
  { title: 'SSR Ready', subtitle: 'Works everywhere', color: '#14b8a6' },
  { title: '60fps', subtitle: 'Smooth animations', color: '#f59e0b' },
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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }"
      >
        <div style="font-size: 1.5rem; font-weight: bold">
          {{ items[index].title }}
        </div>
        <div style="font-size: 0.875rem; opacity: 0.8">
          {{ items[index].subtitle }}
        </div>
      </div>
    </template>

    <div style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); z-index: 10">
      <ReelIndicator direction="vertical" />
    </div>
  </Reel>
</template>`}
          language="vue"
          title="App.vue"
          framework="vue"
          stackblitzDeps={{ '@reelkit/vue': '0.1.0' }}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">ReelIndicator</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Optional component that displays Instagram-style progress indicators
          showing the current position in the slider. When placed inside a{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'<Reel>'}
          </code>
          , it auto-connects to the parent's{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            count
          </code>{' '}
          and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            active
          </code>{' '}
          values via Vue's{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            provide/inject
          </code>{' '}
          — no manual wiring needed.
        </p>
        <CodeBlock
          code={`<!-- Auto-connect: count and active are inherited from parent Reel -->
<Reel :count="10" :size="[400, 600]">
  <template #item="{ index, size }"> ... </template>
  <ReelIndicator direction="vertical" />
</Reel>

<!-- Manual usage: pass count and active explicitly (e.g. outside a Reel) -->
<ReelIndicator :count="10" :active="currentIndex" />`}
          language="vue-html"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          Imperative API — Template Ref
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'<Reel>'}
          </code>{' '}
          component exposes a{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelExpose
          </code>{' '}
          interface via template ref. Use{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ref()
          </code>{' '}
          to store the reference and call imperative methods like{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            next()
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            prev()
          </code>
          , and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            goTo()
          </code>
          .
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { ref } from 'vue';
import { Reel, type ReelExpose } from '@reelkit/vue';

const items = [
  { title: 'Slide 1', color: '#6366f1' },
  { title: 'Slide 2', color: '#8b5cf6' },
  { title: 'Slide 3', color: '#ec4899' },
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
      <div
        :style="{
          width: size[0] + 'px',
          height: size[1] + 'px',
        }"
      >
        {{ items[index].title }}
      </div>
    </template>
  </Reel>

  <div style="position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%)">
    <button
      :disabled="currentIndex === 0"
      @click="sliderRef?.prev()"
    >
      Prev
    </button>
    <button
      :disabled="currentIndex === items.length - 1"
      @click="sliderRef?.next()"
    >
      Next
    </button>
    <button @click="sliderRef?.goTo(2)">Go to 3</button>
  </div>
</template>`}
          language="vue"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Horizontal Direction</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Set{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            direction="horizontal"
          </code>{' '}
          for a left/right swipe slider. The indicator direction should match.
        </p>
        <CodeBlock
          code={`<Reel
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
</Reel>`}
          language="vue-html"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Auto-sizing</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            size
          </code>{' '}
          prop is optional. When omitted,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<Reel>'}
          </code>{' '}
          auto-measures its container via{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ResizeObserver
          </code>{' '}
          and adapts to CSS-driven layout. The container must be sized by its
          parent (e.g. flex, grid, or explicit CSS dimensions).
        </p>
        <CodeBlock
          code={`<!-- Explicit size (fixed) -->
<Reel :count="items.length" :size="[400, 600]">
  <template #item="{ index, size }"> ... </template>
</Reel>

<!-- Auto-size (responsive — sized by CSS) -->
<Reel :count="items.length" style="width: 100%; height: 100dvh">
  <template #item="{ index, size }"> ... </template>
</Reel>`}
          language="vue-html"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Transitions</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Pass a{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            transition
          </code>{' '}
          prop to customize the slide animation. ReelKit ships five
          tree-shakeable transitions:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            slideTransition
          </code>{' '}
          (default),{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            fadeTransition
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            flipTransition
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            cubeTransition
          </code>
          , and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            zoomTransition
          </code>
          .
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { Reel, cubeTransition } from '@reelkit/vue';
</script>

<template>
  <Reel
    :count="items.length"
    :size="[400, 600]"
    :transition="cubeTransition"
  >
    <template #item="{ index, size }"> ... </template>
  </Reel>
</template>`}
          language="vue"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Loop Mode</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Enable infinite circular navigation with the{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            loop
          </code>{' '}
          prop. The slider wraps seamlessly from the last slide back to the
          first (and vice versa).
        </p>
        <CodeBlock
          code={`<Reel
  :count="items.length"
  :size="[400, 600]"
  :loop="true"
>
  <template #item="{ index, size }"> ... </template>
</Reel>`}
          language="vue-html"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Event Callbacks</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'<Reel>'}
          </code>{' '}
          component emits several events for tracking slider state:
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { Reel } from '@reelkit/vue';

const onBeforeChange = (index: number, nextIndex: number, rangeIndex: number) => {
  console.log('Transitioning from', index, 'to', nextIndex);
};

const onAfterChange = (index: number, rangeIndex: number) => {
  console.log('Arrived at slide', index);
};

const onSlideDragStart = (index: number) => {
  console.log('Started dragging slide', index);
};

const onSlideDragEnd = (index: number) => {
  console.log('Stopped dragging slide', index);
};
</script>

<template>
  <Reel
    :count="20"
    style="width: 100%; height: 100dvh"
    @before-change="onBeforeChange"
    @after-change="onAfterChange"
    @slide-drag-start="onSlideDragStart"
    @slide-drag-end="onSlideDragEnd"
  >
    <template #item="{ index, size }"> ... </template>
  </Reel>
</template>`}
          language="vue"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Navigation</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Built-in navigation methods:
        </p>

        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Touch/Swipe:</strong> Drag to navigate with momentum and
              snap
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Keyboard:</strong> Arrow keys and Escape
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Mouse Wheel:</strong> Enable with{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                :enable-wheel="true"
              </code>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Programmatic:</strong> Use a template ref to access{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                next()
              </code>
              ,{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                prev()
              </code>
              ,{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                goTo()
              </code>
            </span>
          </li>
        </ul>

        <CodeBlock
          code={`<script setup lang="ts">
import { ref } from 'vue';
import { Reel, type ReelExpose } from '@reelkit/vue';

const sliderRef = ref<ReelExpose | null>(null);
</script>

<template>
  <Reel
    ref="sliderRef"
    :count="10"
    :size="[400, 600]"
  >
    <template #item="{ index, size }">
      <div :style="{ width: size[0] + 'px', height: size[1] + 'px' }">
        Slide {{ index + 1 }}
      </div>
    </template>
  </Reel>

  <button @click="sliderRef?.prev()">Prev</button>
  <button @click="sliderRef?.next()">Next</button>
  <button @click="sliderRef?.goTo(5)">Go to 6</button>
</template>`}
          language="vue"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">#item Slot Pattern</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Instead of React's render prop, Vue uses the{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            #item
          </code>{' '}
          scoped slot. This enables virtualization — only visible slides are
          mounted. The slot scope provides three properties:
        </p>
        <CodeBlock
          code={`<template #item="{ index, indexInRange, size }">
  <!--
    index        : number          — absolute slide index (0 to count-1)
    indexInRange  : number          — position in visible window (0, 1, or 2)
    size          : [number, number] — [width, height] of the container
  -->
  <MySlide
    :data="items[index]"
    :style="{ width: size[0] + 'px', height: size[1] + 'px' }"
  />
</template>`}
          language="vue-html"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Composables</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue
          </code>{' '}
          provides composables for common overlay scenarios:
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { ref } from 'vue';
import { useBodyLock, useFullscreen, useReelContext } from '@reelkit/vue';

// Lock body scroll when an overlay is open
const isOpen = ref(true);
useBodyLock(isOpen);

// Fullscreen API with cross-browser support
const containerRef = ref<HTMLElement | null>(null);
const { isFullscreen, toggle } = useFullscreen({ elementRef: containerRef });

// Access parent Reel context (when inside a Reel)
const reelContext = useReelContext();
// reelContext?.index  — active slide index signal
// reelContext?.count  — total slide count signal
// reelContext?.goTo() — navigate programmatically
</script>`}
          language="vue"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Key Points</h2>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Composition API
              </strong>
              <p className="text-sm">
                Import{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  Reel
                </code>
                ,{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ReelIndicator
                </code>
                , and composables directly into your{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  {'<script setup>'}
                </code>{' '}
                — no plugin registration required
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                #item scoped slot
              </strong>
              <p className="text-sm">
                The Vue equivalent of React's{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  itemBuilder
                </code>{' '}
                prop — enables virtualization with familiar template syntax
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Template ref
              </strong>
              <p className="text-sm">
                Use{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  {'ref<ReelExpose>()'}
                </code>{' '}
                for imperative navigation — no event callbacks required
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                @after-change
              </strong>
              <p className="text-sm">
                Emits{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  (index, rangeIndex)
                </code>{' '}
                — track current index for UI updates
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                provide/inject context
              </strong>
              <p className="text-sm">
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ReelIndicator
                </code>{' '}
                auto-connects to the parent{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  Reel
                </code>{' '}
                via Vue's provide/inject — no manual prop drilling
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Performance Tips</h2>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Keep slide templates lightweight
              </strong>
              <p className="text-sm">
                The{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  #item
                </code>{' '}
                slot runs for each visible slide (typically 3 at a time). Avoid
                heavy computation or deeply nested structures inside it.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Load data near the edge
              </strong>
              <p className="text-sm">
                Use{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  @after-change
                </code>{' '}
                to detect when the user approaches the end and fetch the next
                batch before slides run out — enabling infinite scroll feeds.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Use refs for imperative state
              </strong>
              <p className="text-sm">
                Store the{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ReelExpose
                </code>{' '}
                reference and current index in Vue{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ref()
                </code>
                s for fine-grained reactivity without unnecessary re-renders.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Disable wheel in scrollable pages
              </strong>
              <p className="text-sm">
                Set{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  :enable-wheel="false"
                </code>{' '}
                when the slider is embedded in a scrollable layout to avoid
                capturing the page scroll.
              </p>
            </div>
          </li>
        </ul>
      </section>

      <NextSteps
        items={[
          {
            label: 'Vue API Reference',
            path: '/docs/vue/api',
            description: 'all props, events, and composables',
          },
          {
            label: 'Core Guide',
            path: '/docs/core/guide',
            description: 'framework-agnostic engine',
          },
          {
            label: 'Reel Player',
            path: {
              react: '/docs/reel-player',
              angular: '/docs/angular-reel-player',
              vue: '/docs/vue-reel-player',
            },
            description: 'TikTok/Reels-style video player',
          },
          {
            label: 'Lightbox',
            path: {
              react: '/docs/lightbox',
              angular: '/docs/angular-lightbox',
              vue: '/docs/vue-lightbox',
            },
            description: 'image & video gallery',
          },
        ]}
      />
    </div>
  );
}
