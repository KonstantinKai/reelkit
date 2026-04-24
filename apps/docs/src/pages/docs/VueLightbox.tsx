import { Link } from 'react-router-dom';
import { Callout } from '../../components/ui/Callout';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { Sandbox } from '../../components/ui/Sandbox';
import { FeatureCardGrid } from '../../components/ui/FeatureCard';
import {
  Image,
  Zap,
  Keyboard,
  Maximize2,
  Layers,
  X,
  Hash,
  Volume2,
  MousePointer,
  Loader,
  AlertTriangle,
} from 'lucide-react';
import { Heading } from '../../components/ui/Heading';

const lightboxProps = [
  {
    prop: 'isOpen',
    type: 'boolean',
    default: 'required',
    description:
      'Controls visibility; when false the overlay is removed from the DOM. Bindable via v-model:is-open.',
  },
  {
    prop: 'items',
    type: 'LightboxItem[]',
    default: 'required',
    description: 'Array of items (images or videos)',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: 'Zero-based index of the initially visible item',
  },
  {
    prop: 'transition',
    type: "'slide' | 'fade' | 'flip' | 'zoom-in'",
    default: "'slide'",
    description:
      'Built-in transition alias. Maps to a TransitionTransformFn internally.',
  },
  {
    prop: 'transitionFn',
    type: 'TransitionTransformFn',
    default: 'undefined',
    description: 'Custom transition function. Overrides the transition alias.',
  },
  {
    prop: 'showInfo',
    type: 'boolean',
    default: 'true',
    description: 'Whether to render the title/description info overlay',
  },
  {
    prop: 'showControls',
    type: 'boolean',
    default: 'true',
    description:
      'Whether to render the top controls bar (close, counter, fullscreen)',
  },
  {
    prop: 'showNavigation',
    type: 'boolean',
    default: 'true',
    description:
      'Whether to render the prev/next navigation arrows (desktop only)',
  },
  {
    prop: 'transitionDuration',
    type: 'number',
    default: '300',
    description: 'Slide animation duration in ms',
  },
  {
    prop: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description:
      'Minimum swipe distance fraction (0–1) to trigger slide change',
  },
  {
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description:
      'Whether the slider wraps from the last slide back to the first',
  },
  {
    prop: 'enableNavKeys',
    type: 'boolean',
    default: 'true',
    description: 'Enable keyboard arrow-key navigation',
  },
  {
    prop: 'enableWheel',
    type: 'boolean',
    default: 'true',
    description: 'Enable mouse-wheel navigation',
  },
  {
    prop: 'wheelDebounceMs',
    type: 'number',
    default: '200',
    description: 'Debounce duration for wheel events in ms',
  },
  {
    prop: 'ariaLabel',
    type: 'string',
    default: "'Image gallery'",
    description: 'Accessible label for the dialog region',
  },
];

const lightboxEvents = [
  {
    name: 'close',
    payload: 'void',
    description: 'Emitted when the user closes the lightbox',
  },
  {
    name: 'slide-change',
    payload: 'number',
    description: 'Emitted with the new active slide index after a change',
  },
  {
    name: 'api-ready',
    payload: 'LightboxApi',
    description:
      'Emitted once the slider is ready, exposing the imperative API',
  },
  {
    name: 'update:is-open',
    payload: 'boolean',
    description: 'Emitted on close; enables v-model:is-open',
  },
];

const lightboxItemFields = [
  {
    prop: 'src',
    type: 'string',
    required: true,
    description: 'URL of the image or video',
  },
  {
    prop: 'type',
    type: "'image' | 'video'",
    required: false,
    description: "Item type. Defaults to 'image'",
  },
  {
    prop: 'poster',
    type: 'string',
    required: false,
    description: 'Thumbnail image for video items',
  },
  {
    prop: 'title',
    type: 'string',
    required: false,
    description: 'Title shown in the info overlay',
  },
  {
    prop: 'description',
    type: 'string',
    required: false,
    description: 'Description shown below the title',
  },
  {
    prop: 'width',
    type: 'number',
    required: false,
    description: 'Intrinsic image width in pixels',
  },
  {
    prop: 'height',
    type: 'number',
    required: false,
    description: 'Intrinsic image height in pixels',
  },
];

const scopedSlots = [
  {
    slot: 'slide',
    scope: 'SlideSlotScope',
    description: 'Replace individual slide content (required for video slides)',
  },
  {
    slot: 'controls',
    scope: 'ControlsSlotScope',
    description: 'Replace the top controls bar (close, counter, fullscreen)',
  },
  {
    slot: 'navigation',
    scope: 'NavigationSlotScope',
    description: 'Replace the prev/next navigation arrows',
  },
  {
    slot: 'info',
    scope: 'InfoSlotScope',
    description: 'Replace the bottom title/description gradient overlay',
  },
  {
    slot: 'loading',
    scope: 'LoadingSlotScope',
    description: 'Custom loading indicator',
  },
  {
    slot: 'error',
    scope: 'ErrorSlotScope',
    description: 'Custom error indicator',
  },
];

const scopeTypes = [
  {
    name: 'SlideSlotScope',
    fields:
      '{ item, index, size: [number, number], isActive, onReady, onWaiting, onError }',
  },
  {
    name: 'ControlsSlotScope',
    fields:
      '{ item, activeIndex, count, isFullscreen, onClose, onToggleFullscreen }',
  },
  {
    name: 'NavigationSlotScope',
    fields: '{ item, activeIndex, count, onPrev, onNext }',
  },
  { name: 'InfoSlotScope', fields: '{ item, index }' },
  { name: 'LoadingSlotScope', fields: '{ item, activeIndex }' },
  { name: 'ErrorSlotScope', fields: '{ item, activeIndex }' },
];

const lifecycleCallbacks = [
  {
    callback: 'onReady',
    type: '() => void',
    description:
      'Notify that the slide content has loaded successfully (e.g. image decoded)',
  },
  {
    callback: 'onWaiting',
    type: '() => void',
    description:
      'Notify that the slide content is loading/buffering (shows spinner)',
  },
  {
    callback: 'onError',
    type: '() => void',
    description:
      'Notify that the slide content failed to load (shows error icon)',
  },
];

const transitions = [
  {
    name: "'slide'",
    description:
      'Default. Horizontal translate between slides; reuses slideTransition from core.',
  },
  {
    name: "'fade'",
    description:
      'Crossfade with a subtle horizontal nudge. Ships as lightboxFadeTransition.',
  },
  {
    name: "'flip'",
    description: '3D flip around the Y-axis; reuses flipTransition from core.',
  },
  {
    name: "'zoom-in'",
    description:
      'Incoming slide scales 70% → 100% with fade. Ships as lightboxZoomTransition.',
  },
];

const cssClasses = [
  {
    className: '.rk-lightbox-overlay',
    component: 'Overlay',
    description: 'Root container (full-screen backdrop)',
  },
  {
    className: '.rk-lightbox-top-shade',
    component: 'Overlay',
    description: 'Top gradient scrim behind controls',
  },
  {
    className: '.rk-lightbox-spinner',
    component: 'Overlay',
    description: 'Default loading spinner',
  },
  {
    className: '.rk-lightbox-error',
    component: 'Overlay',
    description: 'Error state container (broken image)',
  },
  {
    className: '.rk-lightbox-error-text',
    component: 'Overlay',
    description: 'Error state text label',
  },
  {
    className: '.rk-lightbox-controls-left',
    component: 'Controls',
    description: 'Top-left controls container',
  },
  {
    className: '.rk-lightbox-btn',
    component: 'Controls',
    description: 'Control button (fullscreen, sound, etc.)',
  },
  {
    className: '.rk-lightbox-close',
    component: 'Controls',
    description: 'Close button',
  },
  {
    className: '.rk-lightbox-counter',
    component: 'Controls',
    description: 'Image counter chip',
  },
  {
    className: '.rk-lightbox-nav',
    component: 'Navigation',
    description: 'Navigation arrow (both prev and next)',
  },
  {
    className: '.rk-lightbox-nav-prev',
    component: 'Navigation',
    description: 'Previous arrow',
  },
  {
    className: '.rk-lightbox-nav-next',
    component: 'Navigation',
    description: 'Next arrow',
  },
  {
    className: '.rk-lightbox-info',
    component: 'Info',
    description: 'Title / description container',
  },
  {
    className: '.rk-lightbox-info-title',
    component: 'Info',
    description: 'Image title',
  },
  {
    className: '.rk-lightbox-info-description',
    component: 'Info',
    description: 'Image description',
  },
  {
    className: '.rk-lightbox-slide',
    component: 'Slide',
    description: 'Slide container',
  },
  {
    className: '.rk-lightbox-img',
    component: 'Slide',
    description: 'Image element',
  },
  {
    className: '.rk-lightbox-video-container',
    component: 'VideoSlide',
    description: 'Video slide container (opt-in)',
  },
  {
    className: '.rk-lightbox-video-element',
    component: 'VideoSlide',
    description: 'Video element (opt-in)',
  },
  {
    className: '.rk-lightbox-video-poster',
    component: 'VideoSlide',
    description: 'Video poster image (opt-in)',
  },
];

const themeTokens = [
  {
    token: '--rk-lightbox-overlay-bg',
    default: '#000',
    controls: 'Backdrop color',
  },
  {
    token: '--rk-lightbox-overlay-z',
    default: '9999',
    controls: 'Overlay z-index',
  },
  {
    token: '--rk-lightbox-top-shade-height',
    default: '80px',
    controls: 'Top scrim height',
  },
  {
    token: '--rk-lightbox-top-shade-bg',
    default: 'linear-gradient(rgba(0,0,0,0.6), transparent)',
    controls: 'Top scrim gradient',
  },
  {
    token: '--rk-lightbox-edge-padding',
    default: '16px',
    controls: 'Edge inset for close / nav / controls',
  },
  {
    token: '--rk-lightbox-btn-bg',
    default: 'rgba(0, 0, 0, 0.5)',
    controls: 'Default background for close / nav / small buttons',
  },
  {
    token: '--rk-lightbox-btn-bg-hover',
    default: 'rgba(255, 255, 255, 0.2)',
    controls: 'Hover background for close / nav / small buttons',
  },
  {
    token: '--rk-lightbox-btn-fg',
    default: '#fff',
    controls: 'Icon color for close / nav / small buttons',
  },
  {
    token: '--rk-lightbox-btn-size',
    default: '36px',
    controls: 'Small button size (fullscreen toggle, etc.)',
  },
  {
    token: '--rk-lightbox-close-size',
    default: '40px',
    controls: 'Close button size',
  },
  {
    token: '--rk-lightbox-nav-size',
    default: '48px',
    controls: 'Prev / next arrow size',
  },
  {
    token: '--rk-lightbox-nav-opacity',
    default: '0.7',
    controls: 'Idle opacity of prev / next arrows',
  },
  {
    token: '--rk-lightbox-counter-bg',
    default: 'rgba(0, 0, 0, 0.5)',
    controls: 'Counter chip background',
  },
  {
    token: '--rk-lightbox-counter-fg',
    default: '#fff',
    controls: 'Counter text color',
  },
  {
    token: '--rk-lightbox-info-bg',
    default: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
    controls: 'Caption scrim gradient',
  },
  {
    token: '--rk-lightbox-title-size',
    default: '18px',
    controls: 'Title font size',
  },
  {
    token: '--rk-lightbox-description-size',
    default: '14px',
    controls: 'Description font size',
  },
  {
    token: '--rk-lightbox-video-bg',
    default: '#000',
    controls: 'Letterbox background behind <video>',
  },
];

const keyboardShortcuts = [
  { key: 'ArrowLeft', action: 'Previous image' },
  { key: 'ArrowRight', action: 'Next image' },
  { key: 'Escape', action: 'Close lightbox (or exit fullscreen if active)' },
];

const basicUsageCode = `<script setup lang="ts">
import { ref } from 'vue';
import { LightboxOverlay, type LightboxItem } from '@reelkit/vue-lightbox';
import '@reelkit/vue-lightbox/styles.css';

const images: LightboxItem[] = [
  {
    src: '/cdn/samples/images/image-01.jpg',
    title: 'Mountain River',
    description: 'A beautiful mountain river',
  },
  {
    src: '/cdn/samples/images/image-02.jpg',
    title: 'Snowy Peaks',
  },
  {
    src: '/cdn/samples/images/image-03.jpg',
    title: 'Misty Forest',
    description: 'Morning fog over the forest canopy',
  },
  {
    src: '/cdn/samples/images/image-04.jpg',
    title: 'Autumn Trail',
  },
  {
    src: '/cdn/samples/images/image-05.jpg',
    title: 'Ocean Cliff',
    description: 'Dramatic cliffs above the Pacific',
  },
  {
    src: '/cdn/samples/images/image-06.jpg',
    title: 'Desert Dunes',
  },
];

const open = ref(false);
const startIndex = ref(0);

function openAt(i: number) {
  startIndex.value = i;
  open.value = true;
}
</script>

<template>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
    <button
      v-for="(img, i) in images"
      :key="img.src"
      style="aspect-ratio:4/3;cursor:pointer"
      @click="openAt(i)"
    >
      <img :src="img.src" style="width:100%;height:100%;object-fit:cover" />
    </button>
  </div>

  <LightboxOverlay
    v-model:is-open="open"
    :items="images"
    :initial-index="startIndex"
  />
</template>`;

const slotsExampleCode = `<template>
  <LightboxOverlay v-model:is-open="open" :items="items">
    <!-- Custom info overlay -->
    <template #info="{ item }">
      <div class="my-caption">
        <h2>{{ item.title }}</h2>
        <p>{{ item.description }}</p>
      </div>
    </template>

    <!-- Custom navigation -->
    <template #navigation="{ onPrev, onNext, activeIndex, count }">
      <div class="my-nav">
        <button :disabled="activeIndex === 0" @click="onPrev">Prev</button>
        <span>{{ activeIndex + 1 }} / {{ count }}</span>
        <button :disabled="activeIndex === count - 1" @click="onNext">Next</button>
      </div>
    </template>

    <!-- Custom controls -->
    <template #controls="{ onClose, isFullscreen, onToggleFullscreen }">
      <div class="my-controls">
        <button @click="onToggleFullscreen">
          {{ isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen' }}
        </button>
        <button @click="onClose">Close</button>
      </div>
    </template>
  </LightboxOverlay>
</template>`;

const videoOptInCode = `<script setup lang="ts">
import { ref } from 'vue';
import {
  LightboxOverlay,
  useVideoSlideRenderer,
  type LightboxItem,
} from '@reelkit/vue-lightbox';
import '@reelkit/vue-lightbox/styles.css';

const open = ref(false);
const items: LightboxItem[] = [
  { src: '/image-01.jpg', title: 'Image' },
  {
    type: 'video',
    src: '/clip.mp4',
    poster: '/clip.jpg',
    title: 'Clip',
  },
];

const { VideoSlideRenderer, VideoControlsRenderer, SoundProvider } =
  useVideoSlideRenderer(items);
</script>

<template>
  <SoundProvider>
    <LightboxOverlay v-model:is-open="open" :items="items">
      <template #slide="scope">
        <VideoSlideRenderer v-bind="scope" />
      </template>
      <template #controls="scope">
        <VideoControlsRenderer v-bind="scope" />
      </template>
    </LightboxOverlay>
  </SoundProvider>
</template>`;

const fullscreenCode = `<script setup lang="ts">
import { shallowRef } from 'vue';
import { useFullscreen } from '@reelkit/vue';

const containerRef = shallowRef<HTMLDivElement | null>(null);
const { isFullscreen, toggle } = useFullscreen({ elementRef: containerRef });
</script>

<template>
  <div ref="containerRef">
    <button @click="toggle">
      {{ isFullscreen.value ? 'Exit fullscreen' : 'Enter fullscreen' }}
    </button>
  </div>
</template>`;

const customTransitionCode = `<script setup lang="ts">
import { LightboxOverlay, lightboxZoomTransition } from '@reelkit/vue-lightbox';
</script>

<template>
  <!-- Built-in alias -->
  <LightboxOverlay v-model:is-open="open" :items="items" transition="fade" />

  <!-- Imported transition function -->
  <LightboxOverlay
    v-model:is-open="open"
    :items="items"
    :transition-fn="lightboxZoomTransition"
  />
</template>`;

const lifecycleSlideCode = `<template>
  <LightboxOverlay v-model:is-open="open" :items="items">
    <template
      #slide="{ item, size, isActive, onReady, onWaiting, onError }"
    >
      <template v-if="item.type === 'video'">
        <video
          :src="item.src"
          :poster="item.poster"
          :autoplay="isActive"
          :style="{ width: \`\${size[0]}px\`, height: \`\${size[1]}px\`, objectFit: 'contain' }"
          @canplay="onReady"
          @waiting="onWaiting"
          @error="onError"
        />
      </template>
      <template v-else>
        <img
          :src="item.src"
          :style="{ width: \`\${size[0]}px\`, height: \`\${size[1]}px\`, objectFit: 'contain' }"
          @load="onReady"
          @error="onError"
        />
      </template>
    </template>
  </LightboxOverlay>
</template>`;

const customLoadingCode = `<template>
  <LightboxOverlay v-model:is-open="open" :items="items">
    <template #loading="{ item, activeIndex }">
      <div class="my-loading">
        <span>Loading image {{ activeIndex + 1 }}…</span>
        <span class="muted">{{ item.title }}</span>
      </div>
    </template>
  </LightboxOverlay>
</template>`;

const customErrorCode = `<template>
  <LightboxOverlay v-model:is-open="open" :items="items">
    <template #error="{ item, activeIndex }">
      <div class="my-error">
        <span>Failed to load</span>
        <span class="muted">{{ item.title ?? item.src }}</span>
      </div>
    </template>
  </LightboxOverlay>
</template>`;

const themingCode = `<style>
:root {
  --rk-lightbox-overlay-bg: #0f172a;
  --rk-lightbox-btn-bg: rgba(99, 102, 241, 0.65);
  --rk-lightbox-btn-bg-hover: rgba(168, 85, 247, 0.85);
  --rk-lightbox-info-bg: linear-gradient(
    transparent,
    rgba(99, 102, 241, 0.55) 60%,
    rgba(168, 85, 247, 0.85)
  );
}
</style>`;

export default function VueLightbox() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Vue Lightbox</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Full-screen image &amp; video gallery lightbox for Vue 3, built on{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue-lightbox
          </code>
          .
        </p>
        <a
          href="https://vue-demo.reelkit.dev/image-preview?utm_source=docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          View live demo →
        </a>
      </div>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Features
        </Heading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FeatureCardGrid
            items={[
              {
                icon: Image,
                label: 'Images & Video',
                desc: 'Built-in video slide support',
              },
              {
                icon: MousePointer,
                label: 'Touch Gestures',
                desc: 'Swipe to navigate',
              },
              {
                icon: X,
                label: 'Swipe to Close',
                desc: 'Swipe up to dismiss',
              },
              {
                icon: Keyboard,
                label: 'Keyboard Nav',
                desc: 'Arrow keys + Escape',
              },
              {
                icon: Maximize2,
                label: 'Fullscreen',
                desc: 'Cross-browser API',
              },
              {
                icon: Hash,
                label: 'Transitions',
                desc: 'Slide, fade, flip, zoom-in',
              },
              {
                icon: Zap,
                label: 'Preloading',
                desc: '±2 neighbours prefetched',
              },
              {
                icon: Volume2,
                label: 'Sound Toggle',
                desc: 'Per-slide mute/unmute',
              },
              {
                icon: Loader,
                label: 'Loading States',
                desc: 'Spinner + custom slot',
              },
              {
                icon: AlertTriangle,
                label: 'Error Handling',
                desc: 'Error icon + custom slot',
              },
              {
                icon: Layers,
                label: 'Scoped Slots',
                desc: '6 customisable slot zones',
              },
              {
                icon: Layers,
                label: 'v-model',
                desc: 'v-model:is-open two-way binding',
              },
            ]}
          />
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Installation
        </Heading>
        <CodeBlock
          code={`npm install @reelkit/vue-lightbox @reelkit/vue lucide-vue-next`}
          language="bash"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          Don't forget to import the styles:
        </p>
        <CodeBlock
          code={`import '@reelkit/vue-lightbox/styles.css';`}
          language="typescript"
        />
        <Callout type="info" title="Icons" className="mt-4">
          The default controls use{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lucide-vue-next
          </code>{' '}
          for icons. If you prefer a different icon library, use the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #controls
          </code>{' '}
          and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #navigation
          </code>{' '}
          scoped slots to provide your own.
        </Callout>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Basic Usage
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Import the stylesheet and the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            LightboxOverlay
          </code>{' '}
          component, then drive open/close with{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            v-model:is-open
          </code>
          .
        </p>
        <Sandbox
          code={basicUsageCode}
          language="vue"
          title="App.vue"
          framework="vue"
          stackblitzDeps={['@reelkit/vue-lightbox']}
          stackblitzExtraDeps={{ 'lucide-vue-next': '>=0.460.0' }}
        />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Scoped Slots
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Six named scoped slots allow full customisation of the overlay
          surfaces. Omit the slot to keep the built-in default; provide nothing
          inside the slot (e.g. via{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            v-if="false"
          </code>
          ) to hide that section entirely.
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Slot</th>
                <th className="text-left py-3 px-4 font-semibold">Scope</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {scopedSlots.map((s) => (
                <tr
                  key={s.slot}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    #{s.slot}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {s.scope}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {s.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CodeBlock code={slotsExampleCode} language="vue" />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Video Support
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Video slides are opt-in so the default bundle stays free of
          audio/video wiring. Call{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            useVideoSlideRenderer(items)
          </code>{' '}
          and forward the returned <code>VideoSlideRenderer</code> /{' '}
          <code>VideoControlsRenderer</code> into the overlay's{' '}
          <code>#slide</code> and <code>#controls</code> slots. Wrap the overlay
          in the returned <code>SoundProvider</code> so the built-in sound
          toggle has a context.
        </p>
        <CodeBlock code={videoOptInCode} language="vue" />
        <Callout type="info" className="mt-4">
          The shared <code>&lt;video&gt;</code> element powering video slides
          uses the same pattern as the vue reel-player — playback continues
          across slide changes on iOS without requiring a per-slide user
          gesture.
        </Callout>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Fullscreen
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            useFullscreen
          </code>{' '}
          from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/vue
          </code>{' '}
          to observe or toggle fullscreen state on a referenced element. The
          lightbox drives its built-in fullscreen button through the same
          composable.
        </p>
        <CodeBlock code={fullscreenCode} language="vue" />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          LightboxOverlay Props
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Prop</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Default</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {lightboxProps.map((p) => (
                <tr
                  key={p.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.type}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-sm">
                    {p.default}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {p.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          LightboxOverlay Events
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Event</th>
                <th className="text-left py-3 px-4 font-semibold">Payload</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {lightboxEvents.map((e) => (
                <tr
                  key={e.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {e.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {e.payload}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {e.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          LightboxItem Interface
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Field</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Required</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {lightboxItemFields.map((f) => (
                <tr
                  key={f.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {f.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {f.type}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-sm">
                    {f.required ? 'yes' : 'no'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {f.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Slot Scope Types
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Fields</th>
              </tr>
            </thead>
            <tbody>
              {scopeTypes.map((s) => (
                <tr
                  key={s.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {s.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {s.fields}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Transitions
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Four built-in aliases are selectable via the{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            transition
          </code>{' '}
          prop. Pass a custom{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            TransitionTransformFn
          </code>{' '}
          via the{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            transition-fn
          </code>{' '}
          prop to fully override the animation.
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Alias</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {transitions.map((t) => (
                <tr
                  key={t.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {t.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {t.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CodeBlock code={customTransitionCode} language="vue" />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Content Loading &amp; Error Handling
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When you take over rendering via the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slide
          </code>{' '}
          slot, three lifecycle callbacks are available on the slot scope to
          report loading state. The lightbox tracks per-slide state and shows a
          spinner or error icon accordingly. A content preloader caches broken
          URLs so revisiting a failed slide skips the retry.
        </p>

        <Heading level={3} className="text-xl font-semibold mt-6 mb-4">
          Lifecycle callbacks
        </Heading>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Callback</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {lifecycleCallbacks.map((c) => (
                <tr
                  key={c.callback}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {c.callback}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {c.type}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {c.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Heading level={3} className="text-xl font-semibold mt-6 mb-4">
          Wiring callbacks in #slide
        </Heading>
        <CodeBlock code={lifecycleSlideCode} language="vue" />

        <Heading level={3} className="text-xl font-semibold mt-8 mb-4">
          Custom loading slot
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use the <code>#loading</code> slot to replace the default spinner.
        </p>
        <CodeBlock code={customLoadingCode} language="vue" />

        <Heading level={3} className="text-xl font-semibold mt-8 mb-4">
          Custom error slot
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use the <code>#error</code> slot to replace the default broken-image
          icon.
        </p>
        <CodeBlock code={customErrorCode} language="vue" />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          CSS Classes
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          All CSS classes are plain (not scoped), so they can be targeted with
          higher-specificity selectors in a stylesheet loaded after{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue-lightbox/styles.css
          </code>
          . For color, size, and z-index changes, prefer the CSS custom
          properties documented in the{' '}
          <Link
            to={{ hash: '#theming' }}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Theming
          </Link>{' '}
          section below.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Class</th>
                <th className="text-left py-3 px-4 font-semibold">Component</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {cssClasses.map((c) => (
                <tr
                  key={c.className}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {c.className}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-sm">
                    {c.component}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {c.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Theming
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Override any <code>--rk-lightbox-*</code> CSS custom property on{' '}
          <code>:root</code> (or any ancestor of{' '}
          <code>.rk-lightbox-overlay</code>) to retheme. Direct declarations on{' '}
          <code>.rk-lightbox-overlay</code> would shadow inherited values, so
          keep overrides on an ancestor selector.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Token</th>
                <th className="text-left py-3 px-4 font-semibold">Default</th>
                <th className="text-left py-3 px-4 font-semibold">Controls</th>
              </tr>
            </thead>
            <tbody>
              {themeTokens.map((t) => (
                <tr
                  key={t.token}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {t.token}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {t.default}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {t.controls}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CodeBlock code={themingCode} language="css" />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Accessibility
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The overlay root is a modal dialog (
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="dialog"
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-modal="true"
          </code>
          ). Set the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-label
          </code>{' '}
          prop to change the screen-reader announcement; it defaults to "Image
          gallery". Each slide carries{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="group"
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-roledescription="slide"
          </code>
          , and an{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-label
          </code>{' '}
          derived from the position (e.g. "Image 2 of 5").
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The lightbox captures focus on open and returns it to the trigger on
          close. Tab and Shift+Tab cycle through focusable elements inside;
          focus that escapes (click outside, programmatic focus) gets pulled
          back. Implemented with{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            captureFocusForReturn
          </code>{' '}
          and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            createFocusTrap
          </code>{' '}
          from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/vue
          </code>
          .
        </p>
      </section>

      <section>
        <Heading level={2} className="text-2xl font-bold mb-4">
          Keyboard Shortcuts
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Key</th>
                <th className="text-left py-3 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {keyboardShortcuts.map((s) => (
                <tr
                  key={s.key}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {s.key}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {s.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
