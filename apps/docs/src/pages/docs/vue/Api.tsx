import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Heading } from '../../../components/ui/Heading';

const reelProps = [
  {
    prop: 'count',
    type: 'number',
    default: 'required',
    description: 'Total number of slides',
  },
  {
    prop: 'direction',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: 'Scroll direction',
  },
  {
    prop: 'size',
    type: '[number, number] | undefined',
    default: 'undefined',
    description:
      'Width and height as [width, height]. When omitted, auto-measures via ResizeObserver',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: 'Starting slide index',
  },
  {
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description: 'Enable infinite loop',
  },
  {
    prop: 'transition',
    type: 'TransitionTransformFn',
    default: 'slideTransition',
    description:
      'Transition effect function. Built-in: slideTransition, fadeTransition, flipTransition, cubeTransition, zoomTransition',
  },
  {
    prop: 'transitionDuration',
    type: 'number',
    default: '300',
    description: 'Animation duration in ms',
  },
  {
    prop: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: 'Swipe threshold (0-1)',
  },
  {
    prop: 'enableGestures',
    type: 'boolean',
    default: 'true',
    description: 'Enable touch/mouse drag navigation',
  },
  {
    prop: 'enableNavKeys',
    type: 'boolean',
    default: 'true',
    description: 'Enable keyboard arrow key navigation',
  },
  {
    prop: 'enableWheel',
    type: 'boolean',
    default: 'false',
    description: 'Enable mouse wheel navigation',
  },
  {
    prop: 'wheelDebounceMs',
    type: 'number',
    default: '200',
    description: 'Wheel event debounce in ms',
  },
  {
    prop: 'rangeExtractor',
    type: '(index: number, count: number) => number[]',
    default: 'defaultRangeExtractor',
    description: 'Custom function to determine which indexes are rendered',
  },
  {
    prop: 'keyExtractor',
    type: '(index: number, indexInRange: number) => string',
    default: 'index => index.toString()',
    description: 'Custom key function for slide rendering (useful with loop)',
  },
  {
    prop: 'ariaLabel',
    type: 'string',
    default: 'undefined',
    description: 'Accessible label for the carousel region',
  },
  {
    prop: 'reelStyle',
    type: 'Record<string, string | number>',
    default: 'undefined',
    description: 'Inline styles applied to the root container element',
  },
  {
    prop: 'reelClass',
    type: 'string | Array | Object',
    default: 'undefined',
    description: 'CSS class(es) applied to the root container element',
  },
  {
    prop: 'onNavKeyPress',
    type: '(increment: -1 | 1) => void',
    default: 'undefined',
    description:
      'Callback prop that replaces the default ArrowUp/ArrowDown navigation. When provided, you implement your own navigation (e.g. call reelRef.value.next()). Omit for default behavior.',
  },
];

const reelEmits = [
  {
    event: 'beforeChange',
    payload: '(index: number, nextIndex: number, indexInRange: number)',
    description: 'Emitted before slide transition begins',
  },
  {
    event: 'afterChange',
    payload: '(index: number, indexInRange: number)',
    description: 'Emitted after slide transition completes',
  },
  {
    event: 'slideDragStart',
    payload: '(index: number)',
    description: 'Emitted when a drag gesture starts',
  },
  {
    event: 'slideDragEnd',
    payload: '(index: number)',
    description: 'Emitted when a drag gesture ends (released)',
  },
  {
    event: 'slideDragCanceled',
    payload: '(index: number)',
    description: 'Emitted when a drag gesture is canceled (snap-back)',
  },
  {
    event: 'tap',
    payload: '(event: GestureCommonEvent)',
    description: 'Emitted on a single tap gesture',
  },
  {
    event: 'doubleTap',
    payload: '(event: GestureCommonEvent)',
    description: 'Emitted on a double tap gesture',
  },
  {
    event: 'longPress',
    payload: '(event: GestureCommonEvent)',
    description: 'Emitted when a long press gesture starts',
  },
  {
    event: 'longPressEnd',
    payload: '(event: GestureEvent)',
    description: 'Emitted when a long press gesture ends',
  },
];

const exposeMethods = [
  { method: 'next()', type: '() => void', description: 'Go to next slide' },
  { method: 'prev()', type: '() => void', description: 'Go to previous slide' },
  {
    method: 'goTo(index, animate?)',
    type: '(number, boolean?) => Promise<void>',
    description: 'Navigate to a specific slide index',
  },
  {
    method: 'adjust()',
    type: '() => void',
    description: 'Recalculate slide positions (useful after layout change)',
  },
  {
    method: 'observe()',
    type: '() => void',
    description: 'Start listening to gesture, keyboard, and wheel events',
  },
  {
    method: 'unobserve()',
    type: '() => void',
    description: 'Stop listening to gesture, keyboard, and wheel events',
  },
];

const indicatorProps = [
  {
    prop: 'count',
    type: 'number | undefined',
    default: 'auto',
    description:
      'Total number of items. Auto-connected from parent Reel context when nested inside one; pass explicitly when used standalone',
  },
  {
    prop: 'active',
    type: 'number | undefined',
    default: 'auto',
    description:
      'Current active index. Auto-connected from parent Reel context when nested inside one; pass explicitly when used standalone',
  },
  {
    prop: 'direction',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: 'Indicator orientation',
  },
  {
    prop: 'radius',
    type: 'number',
    default: '3',
    description: 'Dot radius in pixels',
  },
  {
    prop: 'visible',
    type: 'number',
    default: '5',
    description: 'Max normal-sized dots visible at once',
  },
  {
    prop: 'gap',
    type: 'number',
    default: '4',
    description: 'Space between dots in pixels',
  },
  {
    prop: 'activeColor',
    type: 'string',
    default: "'#fff'",
    description: 'Active dot color',
  },
  {
    prop: 'inactiveColor',
    type: 'string',
    default: "'rgba(255, 255, 255, 0.5)'",
    description: 'Inactive dot color',
  },
  {
    prop: 'edgeScale',
    type: 'number',
    default: '0.5',
    description: 'Scale factor for edge overflow dots',
  },
  {
    prop: 'onDotClick',
    type: '(index: number) => void',
    default: 'undefined',
    description:
      'Custom click handler. When omitted inside a Reel, defaults to navigating to the clicked dot index',
  },
  {
    prop: 'indicatorClass',
    type: 'string | Array | Object',
    default: 'undefined',
    description: 'CSS class(es) applied to the tablist root element',
  },
  {
    prop: 'indicatorStyle',
    type: 'CSSProperties',
    default: 'undefined',
    description: 'Inline styles merged into the tablist root element',
  },
];

const indicatorEmits = [
  {
    event: 'dotClick',
    payload: '(index: number)',
    description: 'Emitted when a dot is clicked; provides the dot index',
  },
];

const swipeToCloseProps = [
  {
    prop: 'direction',
    type: "'up' | 'down'",
    default: 'required',
    description:
      'Swipe direction to trigger close. Use "up" for lightbox dismiss, "down" for stories dismiss',
  },
  {
    prop: 'enabled',
    type: 'boolean',
    default: 'true',
    description: 'Whether the swipe-to-close gesture is active',
  },
  {
    prop: 'threshold',
    type: 'number',
    default: '0.2',
    description: 'Fraction of viewport height required to trigger close (0-1)',
  },
];

const swipeToCloseEmits = [
  {
    event: 'close',
    payload: '()',
    description:
      'Emitted when the swipe gesture exceeds the threshold and the close animation completes',
  },
];

const contextShape = [
  {
    property: 'index',
    type: 'Signal<number>',
    description: 'Reactive current slide index',
  },
  {
    property: 'count',
    type: 'Signal<number>',
    description: 'Reactive total item count',
  },
  {
    property: 'goTo',
    type: '(index: number, animate?: boolean) => Promise<void>',
    description: 'Programmatically navigate to a slide',
  },
];

export default function VueApi() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Vue API Reference</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Complete reference for{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue
          </code>{' '}
          components, composables, and utilities.
        </p>
      </div>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-2">
          Reel
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Tag:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<Reel>'}
          </code>
        </p>
        <Heading level={3} className="text-lg font-semibold mb-3">
          Props
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
              {reelProps.map((p) => (
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
        <Heading level={3} className="text-lg font-semibold mb-3">
          Events
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
              {reelEmits.map((p) => (
                <tr
                  key={p.event}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.event}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.payload}
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
        <Heading level={3} className="text-lg font-semibold mb-3">
          Slots
        </Heading>
        <CodeBlock
          code={`<Reel :count="items.length">
  <template #item="{ index, indexInRange, size }">
    <!-- index       : number         — absolute slide index (0 to count-1) -->
    <!-- indexInRange : number         — position in the visible window (0, 1, or 2) -->
    <!-- size         : [number,number] — [width, height] of the container -->
    <MySlide :index="index" :size="size" />
  </template>

  <!-- default slot: overlay content rendered on top of the slides -->
  <ReelIndicator />
</Reel>`}
          language="vue-html"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Slot</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Scoped Props
                </th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  #item
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '{ index: number, indexInRange: number, size: [number, number] }'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Renders each visible slide. Called for each index in the
                  virtualized range
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  default
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  none
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Overlay content rendered on top of all slides (indicators,
                  controls, etc.)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          ReelExpose
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Imperative API exposed via template ref:
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { ref } from 'vue';
import { Reel, type ReelExpose } from '@reelkit/vue';

const reelRef = ref<ReelExpose | null>(null);

function prev()  { reelRef.value?.prev(); }
function next()  { reelRef.value?.next(); }
function jump(i: number) { reelRef.value?.goTo(i, true); }
</script>

<template>
  <Reel ref="reelRef" :count="100">
    <template #item="{ index }">
      <div>Slide {{ index }}</div>
    </template>
  </Reel>
</template>`}
          language="vue"
        />
        <div className="overflow-x-auto mt-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Method</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {exposeMethods.map((p) => (
                <tr
                  key={p.method}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.method}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.type}
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
        <Heading level={2} className="text-2xl font-bold mb-2">
          ReelIndicator
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Tag:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<ReelIndicator>'}
          </code>
        </p>
        <Heading level={3} className="text-lg font-semibold mb-3">
          Props
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
              {indicatorProps.map((p) => (
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
        <Heading level={3} className="text-lg font-semibold mt-6 mb-3">
          Events
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
              {indicatorEmits.map((p) => (
                <tr
                  key={p.event}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.event}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.payload}
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
        <Heading level={2} className="text-2xl font-bold mb-2">
          SwipeToClose
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Tag:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<SwipeToClose>'}
          </code>{' '}
          — Wraps its default slot in a touch-aware container that can be swiped
          to dismiss.
        </p>
        <Heading level={3} className="text-lg font-semibold mb-3">
          Props
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
              {swipeToCloseProps.map((p) => (
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
        <Heading level={3} className="text-lg font-semibold mt-6 mb-3">
          Events
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
              {swipeToCloseEmits.map((p) => (
                <tr
                  key={p.event}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.event}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.payload}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {p.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Heading level={3} className="text-lg font-semibold mt-6 mb-3">
          Slots
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Slot</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  default
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Content to wrap with swipe-to-close gesture handling
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          RK_REEL_KEY &amp; useReelContext
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          An{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'InjectionKey<ReelContextValue>'}
          </code>{' '}
          provided by{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<Reel>'}
          </code>{' '}
          to its descendants. Used internally by{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<ReelIndicator>'}
          </code>{' '}
          for auto-connect behavior. Use{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            useReelContext()
          </code>{' '}
          in custom components that need slider context.
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { useReelContext } from '@reelkit/vue';

const ctx = useReelContext();

function jump(index: number) {
  ctx?.goTo(index, true);
}
</script>`}
          language="vue"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Property</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {contextShape.map((p) => (
                <tr
                  key={p.property}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.property}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.type}
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
          Composables
        </Heading>

        <Heading level={3} className="text-xl font-semibold mb-3">
          useBodyLock
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Locks the document body scroll when the provided value is{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            true
          </code>
          . Uses reference counting so multiple concurrent callers can each
          lock/unlock independently. Automatically unlocks on unmount.
        </p>
        <CodeBlock
          code={`import { ref } from 'vue';
import { useBodyLock } from '@reelkit/vue';

const isOpen = ref(false);
useBodyLock(isOpen);

// Also accepts a static boolean
useBodyLock(true);`}
          language="typescript"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Parameter</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  locked
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'Ref<boolean> | boolean'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Whether body scroll should be locked. Accepts a reactive ref
                  or a static boolean
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading level={3} className="text-xl font-semibold mt-8 mb-3">
          useFullscreen
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Composable for managing the Fullscreen API with cross-browser support.
          Exits fullscreen automatically on unmount.
        </p>
        <CodeBlock
          code={`import { ref } from 'vue';
import { useFullscreen } from '@reelkit/vue';

const containerRef = ref<HTMLElement | null>(null);
const { isFullscreen, request, exit, toggle } = useFullscreen({
  elementRef: containerRef,
});`}
          language="typescript"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Return</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  isFullscreen
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'Signal<boolean>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Core signal reflecting current fullscreen state (read{' '}
                  <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                    .value
                  </code>
                  )
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  request
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => Promise<void>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Request fullscreen on the referenced element. If another
                  element is already fullscreen, it is exited first (awaited).
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  exit
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => Promise<void>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Exit fullscreen
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  toggle
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => Promise<void>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Toggle fullscreen state
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading level={3} className="text-xl font-semibold mt-8 mb-3">
          useSoundState
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Access the current{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SoundController
          </code>{' '}
          from context. Must be called inside a{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<SoundProvider>'}
          </code>
          . Throws if called outside.
        </p>
        <CodeBlock
          code={`import { useSoundState } from '@reelkit/vue';

// Inside a SoundProvider descendant
const sound = useSoundState();

sound.muted;    // Signal<boolean>
sound.toggle(); // Toggle muted state`}
          language="typescript"
        />

        <Heading level={3} className="text-xl font-semibold mt-8 mb-3">
          toVueRef
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Bridges a core{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            Subscribable
          </code>{' '}
          (any{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            Signal
          </code>{' '}
          from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/core
          </code>
          ) into a read-only Vue{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            Ref
          </code>
          . Use it whenever you need a core signal value to drive a Vue
          re-render — direct{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            signal.value
          </code>{' '}
          reads in render functions or templates are <strong>not</strong>{' '}
          reactive on their own.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The subscription is auto-disposed via{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            onScopeDispose
          </code>
          , so this must be called inside a Vue{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            setup()
          </code>{' '}
          or other effect-scope-aware context.
        </p>
        <CodeBlock
          code={`import { defineComponent, h } from 'vue';
import { toVueRef, useSoundState } from '@reelkit/vue';

export const MuteIcon = defineComponent({
  setup() {
    const sound = useSoundState();
    const muted = toVueRef(sound.muted); // Readonly<Ref<boolean>>

    return () => h('span', muted.value ? '🔇' : '🔊');
  },
});`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          SoundProvider
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Tag:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<SoundProvider>'}
          </code>{' '}
          — Context provider that creates a{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SoundController
          </code>{' '}
          instance and provides it to descendants via{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RK_SOUND_KEY
          </code>
          . Renders its default slot transparently.
        </p>
        <CodeBlock
          code={`<template>
  <SoundProvider>
    <Reel :count="items.length">
      <template #item="{ index }">
        <VideoSlide :index="index" />
      </template>
      <MuteButton />
    </Reel>
  </SoundProvider>
</template>`}
          language="vue"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Accessibility
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            &lt;Reel&gt;
          </code>{' '}
          renders as{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="region"
          </code>{' '}
          with{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-roledescription="carousel"
          </code>
          . Pass{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-label
          </code>{' '}
          (the prop is{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ariaLabel
          </code>{' '}
          in TS) to give the region a screen-reader name. A polite live region
          announces "Slide N of M" on every slide change. Inactive slides
          receive the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            inert
          </code>{' '}
          attribute so focus and AT navigation skip them.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            &lt;ReelIndicator&gt;
          </code>{' '}
          renders as{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="tablist"
          </code>{' '}
          with roving tabindex on the dots; arrow keys move focus and Enter or
          Space activates the slide.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Building a custom modal around{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            &lt;Reel&gt;
          </code>
          ?{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            captureFocusForReturn
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            createFocusTrap
          </code>
          , and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            getFocusableElements
          </code>{' '}
          are re-exported from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/vue
          </code>{' '}
          for focus return and trap.
        </p>
      </section>

      <section>
        <Heading level={2} className="text-2xl font-bold mb-4">
          Package Exports
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          All public exports from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/vue
          </code>
          :
        </p>
        <CodeBlock
          code={`// Components
import {
  Reel,
  ReelIndicator,
  SwipeToClose,
  SoundProvider,
} from '@reelkit/vue';

// Types
import type {
  ReelExpose,
  ReelContextValue,
  SwipeToCloseDirection,
  SwipeToCloseProps,
  UseFullscreenOptions,
  UseFullscreenReturn,
} from '@reelkit/vue';

// Context & composables
import {
  RK_REEL_KEY,
  useReelContext,
  RK_SOUND_KEY,
  useBodyLock,
  useFullscreen,
  useSoundState,
  toVueRef,
} from '@reelkit/vue';

// Utilities (re-exported from @reelkit/core)
import {
  createDefaultKeyExtractorForLoop,
  defaultRangeExtractor,
} from '@reelkit/vue';

// Core re-exports
import {
  // Signals & reactivity
  createSignal, createComputed, reaction, batch, createDeferred,

  // Transitions
  slideTransition, fadeTransition, flipTransition,
  cubeTransition, zoomTransition, getSlideProgress,

  // Content loading & preloading
  createContentLoadingController, createContentPreloader,
  observeMediaLoading,

  // Sound
  createSoundController, syncMutedToVideo,

  // Fullscreen
  fullscreenSignal, requestFullscreen, exitFullscreen,

  // DOM & cleanup
  observeDomEvent, createDisposableList, createBodyLock, sharedBodyLock,

  // Focus management
  captureFocusForReturn, createFocusTrap, getFocusableElements,

  // Gestures
  createGestureController,

  // Video
  captureFrame, createSharedVideo,

  // Animation
  animate,

  // Utilities
  noop, clamp, abs, first, last, extractRange,
  lerp, isNegative, generate,
} from '@reelkit/vue';`}
          language="typescript"
        />
      </section>
    </div>
  );
}
