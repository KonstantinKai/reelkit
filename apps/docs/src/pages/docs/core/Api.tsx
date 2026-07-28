import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Heading } from '../../../components/ui/Heading';

const configOptions = [
  {
    property: 'count',
    type: 'number',
    default: 'required',
    description: 'Total number of items',
  },
  {
    property: 'initialIndex',
    type: 'number',
    default: '0',
    description: 'Starting index',
  },
  {
    property: 'direction',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: 'Scroll direction',
  },
  {
    property: 'enableGestures',
    type: 'boolean',
    default: 'true',
    description:
      'Enable touch/mouse drag navigation. When false, the gesture controller is not attached.',
  },
  {
    property: 'enableNavKeys',
    type: 'boolean',
    default: 'true',
    description: 'Enable keyboard arrow key navigation',
  },
  {
    property: 'enableWheel',
    type: 'boolean',
    default: 'false',
    description: 'Enable mouse wheel',
  },
  {
    property: 'wheelDebounceMs',
    type: 'number',
    default: '200',
    description: 'Wheel debounce time',
  },
  {
    property: 'loop',
    type: 'boolean',
    default: 'false',
    description: 'Loop navigation',
  },
  {
    property: 'transitionDuration',
    type: 'number',
    default: '300',
    description: 'Animation duration in ms',
  },
  {
    property: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: 'Swipe threshold (0-1)',
  },
  {
    property: 'rangeExtractor',
    type: '(index: number, count: number, loop: boolean) => number[]',
    default: 'defaultRangeExtractor',
    description: 'Custom function to determine which indexes are rendered',
  },
];

const callbacks = [
  {
    callback: 'onBeforeChange',
    type: '(index, nextIndex, rangeIndex) => void',
    description: 'Before slide change',
  },
  {
    callback: 'onAfterChange',
    type: '(index, rangeIndex) => void',
    description: 'After slide change',
  },
  {
    callback: 'onDragStart',
    type: '(index) => void',
    description: 'Drag started',
  },
  { callback: 'onDragEnd', type: '(index) => void', description: 'Drag ended' },
  {
    callback: 'onDragCanceled',
    type: '(index) => void',
    description: 'Drag canceled',
  },
  {
    callback: 'onTap',
    type: '(event: GestureCommonEvent) => void',
    description: 'Single tap (delayed by double-tap window)',
  },
  {
    callback: 'onDoubleTap',
    type: '(event: GestureCommonEvent) => void',
    description: 'Double tap detected',
  },
  {
    callback: 'onLongPress',
    type: '(event: GestureCommonEvent) => void',
    description: 'Long press detected',
  },
  {
    callback: 'onLongPressEnd',
    type: '(event: GestureEvent) => void',
    description: 'Pointer released after long press',
  },
  {
    callback: 'onNavKeyPress',
    type: '(increment: -1 | 1) => void',
    description:
      'Custom handler for arrow key navigation. Replaces default prev/next behavior.',
  },
];

const methods = [
  {
    method: 'attach(element)',
    type: '(HTMLElement) => void',
    description: 'Connect controller to DOM element for gesture detection',
  },
  {
    method: 'detach()',
    type: '() => void',
    description:
      'Detach DOM listeners (gestures, keyboard, wheel). Safe for re-attach via observe(). Use for React effect cleanup.',
  },
  {
    method: 'dispose()',
    type: '() => void',
    description:
      'Permanent teardown: detaches all controllers and cleans up signal observers. Use for Angular onDestroy.',
  },
  {
    method: 'observe()',
    type: '() => void',
    description:
      'Start gesture, keyboard, and wheel observation. Respects enableGestures, enableNavKeys, and enableWheel config flags.',
  },
  {
    method: 'unobserve()',
    type: '() => void',
    description: 'Stop gesture, keyboard, and wheel observation',
  },
  {
    method: 'next()',
    type: '() => Promise<void>',
    description: 'Go to next slide',
  },
  {
    method: 'prev()',
    type: '() => Promise<void>',
    description: 'Go to previous slide',
  },
  {
    method: 'goTo(index, animate?)',
    type: '(number, boolean?) => Promise<void>',
    description: 'Go to specific slide',
  },
  {
    method: 'adjust(duration?)',
    type: '(number?) => void',
    description: 'Recalculate slide positions',
  },
  {
    method: 'setPrimarySize(size)',
    type: '(number) => void',
    description: 'Update container size',
  },
  {
    method: 'updateConfig(config)',
    type: '(Partial<SliderConfig>) => void',
    description: 'Update configuration options',
  },
  {
    method: 'updateEvents(events)',
    type: '(Partial<SliderEvents>) => void',
    description:
      'Replace event handlers (existing handlers not included are preserved)',
  },
  {
    method: 'getRangeIndex()',
    type: '() => number',
    description:
      'Returns the position of the active index within the visible range array',
  },
];

const stateProperties = [
  {
    property: 'index',
    type: 'Signal<number>',
    description: 'Current slide index',
  },
  {
    property: 'axisValue',
    type: 'Signal<AnimatedValue>',
    description: 'Current axis position value (animated)',
  },
  {
    property: 'indexes',
    type: 'ComputedSignal<number[]>',
    description: 'Visible indexes for virtualization',
  },
];

export default function CoreApi() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Core API Reference</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Complete reference for{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/core
          </code>{' '}
          configuration, callbacks, methods, and state.
        </p>
      </div>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          SliderController API
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The framework-agnostic core. One factory builds a controller from a
          config and optional events: <strong>Config Options</strong> are the
          config, <strong>Callbacks</strong> the events, and{' '}
          <strong>Methods</strong> are what the returned controller exposes.
        </p>

        <Heading level={3} className="text-lg font-semibold mb-3">
          Factory Function
        </Heading>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Export</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createSliderController
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '(config: SliderConfig, events?: SliderEvents) => SliderController'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Build a slider controller. <code>config</code> is required
                  (options below); <code>events</code> is optional (callbacks
                  below). Returns the controller whose methods drive it.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading level={3} className="text-lg font-semibold mb-3">
          Config Options
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Property</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Default</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {configOptions.map((p) => (
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
          Callbacks
        </Heading>
        <div className="overflow-x-auto">
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
              {callbacks.map((p) => (
                <tr
                  key={p.callback}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.callback}
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
        <Heading level={3} className="text-lg font-semibold mb-3">
          Methods
        </Heading>
        <div className="overflow-x-auto">
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
              {methods.map((p) => (
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
        <Heading level={2} className="text-2xl font-bold mb-4">
          State Properties
        </Heading>
        <div className="overflow-x-auto">
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
              {stateProperties.map((p) => (
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
          Range Extractor
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Export</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  defaultRangeExtractor
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  (index: number, count: number, loop: boolean) =&gt; number[]
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Default extractor that renders 3 items around current index
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Signal API
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Lightweight reactive primitives used throughout the core.
        </p>

        <Heading level={3} className="text-lg font-semibold mb-3">
          Signal Interface
        </Heading>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Member</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  value
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  T
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Get or set the current value. Setting notifies observers if
                  the value changed.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  observe(callback)
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(callback: () => void) => () => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Register a listener called on each value change. Returns a
                  dispose function that removes the listener.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading level={3} className="text-lg font-semibold mb-3">
          Factory Functions
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Export</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createSignal
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'<T>(initial: T) => Signal<T>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Create a mutable reactive signal
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createComputed
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '<T>(fn: () => T, deps: () => Subscribable[]) => ComputedSignal<T>'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Create a derived computed signal. The second argument is a
                  deps factory that returns the signals to track.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  reaction
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '(deps: () => Subscribable[], effect: () => void) => () => void'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Run side effect when any dependency signal changes; returns
                  dispose function. Read signal values inside the effect
                  callback.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  batch
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(fn: () => void) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Group multiple signal updates into a single notification pass;
                  supports nesting
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Transitions
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Built-in transition functions that compute per-slide CSS transforms
          during animated navigation. Pass one as the{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            transitionTransformFn
          </code>{' '}
          prop to the framework component.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Export</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  TransitionTransformFn
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  type
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Signature for custom transition functions
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  getSlideProgress
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '(axisValue: number, slideIndex: number, primarySize: number) => number'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Returns a normalized offset (-1 to 1) for a slide relative to
                  the viewport. Use inside custom transition functions.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  slideTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  TransitionTransformFn
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Default slide transition (translateX/Y)
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  fadeTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  TransitionTransformFn
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Crossfade opacity transition
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  flipTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  TransitionTransformFn
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  3D card-flip transition
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  cubeTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  TransitionTransformFn
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  3D cube rotation transition
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  zoomTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  TransitionTransformFn
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Scale/zoom transition
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Content Loading
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Utilities for tracking per-slide loading/error states and preloading
          media. The loading controller uses an index guard to reject stale
          callbacks from previously active slides. The preloader uses an LRU
          cache (default 200 loaded, 100 errored) so revisiting a broken URL
          shows the error instantly without retry.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Export</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createContentLoadingController
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => ContentLoadingController'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Per-slide loading/error state tracking
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createContentPreloader
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(config: ContentPreloaderConfig) => ContentPreloader'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  LRU-cached media preloader with error caching
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  observeMediaLoading
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '(video: HTMLVideoElement, callbacks: MediaLoadingCallbacks) => () => void'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Observes video loading state (playing, canplaythrough,
                  waiting). Returns a disposer.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading level={3} className="text-lg font-semibold mt-6 mb-3">
          ContentLoadingController
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Export</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  isLoading
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'Signal<boolean>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Whether the active slide is loading
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  isError
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'Signal<boolean>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Whether the active slide has errored
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  setActiveIndex
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(index: number) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Update active index, resets loading/error state
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onReady
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(index: number) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Mark slide as ready (ignored if index doesn't match active)
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onWaiting
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(index: number) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Mark slide as loading (ignored if index doesn't match active)
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onError
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(index: number) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Mark slide as errored (ignored if index doesn't match active)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading level={3} className="text-lg font-semibold mt-6 mb-3">
          ContentPreloader
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Export</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  preload
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(src: string, type?: "image" | "video") => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Start preloading a media URL
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  isLoaded
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(src: string) => boolean'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Check if URL is in the loaded LRU cache (max 200)
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  isErrored
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(src: string) => boolean'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Check if URL is in the error LRU cache (max 100)
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  markLoaded
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(src: string) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Manually mark a URL as loaded
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  markErrored
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(src: string) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Manually mark a URL as errored
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onLoaded
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(src: string, cb: () => void) => () => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Subscribe to load completion; returns disposer
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Sound
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Shared mute/unmute state for media playback. The sound controller
          provides a reactive muted signal that can be synced to video elements
          and toggled from custom controls.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Export</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createSoundController
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => SoundController'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Shared mute state controller
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  syncMutedToVideo
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '(video: HTMLVideoElement, sound: SoundController) => () => void'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Syncs the muted signal to a video element. Returns a disposer.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Timeline
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Playback timeline controller for video scrubbing. Tracks duration,
          current time, buffered ranges, and user scrubbing state as reactive
          signals. A single call wires pointer and keyboard interactions onto
          any DOM element so it behaves as a native-feeling scrub bar, with
          pointer capture, live seeking, and full keyboard support (arrows,
          Home/End, PageUp/PageDown).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Export</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createTimelineController
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(config?: TimelineControllerConfig) => TimelineController'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Factory returning a controller with{' '}
                  <span className="font-mono text-xs">duration</span>,{' '}
                  <span className="font-mono text-xs">currentTime</span>,{' '}
                  <span className="font-mono text-xs">progress</span>,{' '}
                  <span className="font-mono text-xs">bufferedRanges</span>, and{' '}
                  <span className="font-mono text-xs">isScrubbing</span> signals
                  plus <span className="font-mono text-xs">attach</span>,{' '}
                  <span className="font-mono text-xs">detach</span>,{' '}
                  <span className="font-mono text-xs">bindInteractions</span>,
                  and <span className="font-mono text-xs">seek</span> methods.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  TimelineControllerConfig
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  interface
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  <span className="font-mono text-xs">keyboardStepSeconds</span>{' '}
                  (default 5),{' '}
                  <span className="font-mono text-xs">
                    keyboardPageFraction
                  </span>{' '}
                  (default 0.1), and{' '}
                  <span className="font-mono text-xs">onSeek</span>,{' '}
                  <span className="font-mono text-xs">onScrubStart</span>,{' '}
                  <span className="font-mono text-xs">onScrubEnd</span>{' '}
                  callbacks.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  BufferedRange
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'{ start: number; end: number }'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  A single contiguous buffered region expressed as 0–1 fractions
                  of total duration. Emitted sorted and non-overlapping.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Fullscreen
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Cross-browser fullscreen utilities with Safari vendor-prefix guards.
          The fullscreen signal is a lazy singleton that tracks fullscreen state
          reactively.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Export</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  fullscreenSignal
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'Signal<boolean>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Reactive signal tracking whether the document is in fullscreen
                  mode
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  requestFullscreen
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(element: HTMLElement) => Promise<void>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Enter fullscreen on the given element
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  exitFullscreen
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => Promise<void>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Exit fullscreen mode
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          DOM & Cleanup Utilities
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Low-level helpers for DOM event management and deterministic cleanup.
          Used internally by all controllers and available for custom
          integrations.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Export</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  observeDomEvent
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(target, event, handler, options?) => () => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Adds a DOM event listener and returns a disposer that removes
                  it
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createDisposableList
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => DisposableList'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Composable list for collecting disposer functions. Call
                  dispose() to run all at once.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createBodyLock
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => BodyLock'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Reference-counted body scroll lock. Multiple consumers can
                  lock simultaneously; scroll is restored when all unlock.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  sharedBodyLock
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  BodyLock
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Module-level singleton instance. Use when multiple components
                  across your app should share a single reference counter so
                  nested modals/overlays interleave correctly. Framework
                  bindings (
                  <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                    @reelkit/react
                  </code>
                  ,{' '}
                  <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                    @reelkit/vue
                  </code>
                  ,{' '}
                  <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                    @reelkit/angular
                  </code>
                  ) use this under the hood.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Focus Management
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Framework-agnostic dialog a11y primitives. The overlay packages use
          them to return focus to the trigger on close and trap Tab / Shift+Tab
          inside the overlay while it's open. SSR-safe: each helper returns a
          no-op disposer in non-browser environments.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Export</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  captureFocusForReturn
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => Disposer'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Captures the currently focused element and returns a disposer
                  that focuses it again. Best-effort: the disposer is a no-op if
                  the captured element has since been removed from the DOM.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createFocusTrap
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(container: HTMLElement) => Disposer'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Traps Tab/Shift+Tab inside <code>container</code>. Tab at the
                  last focusable wraps to the first; Shift+Tab at the first
                  wraps to the last; focus that escapes the container (click
                  outside, programmatic focus) is pulled back. Does not move
                  focus into the container on activation — the caller decides.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  getFocusableElements
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(container: HTMLElement) => HTMLElement[]'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Returns every keyboard-focusable descendant in DOM order,
                  skipping disabled, hidden, and{' '}
                  <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                    tabindex="-1"
                  </code>{' '}
                  elements.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          Usage
        </Heading>
        <CodeBlock
          language="typescript"
          code={`import { captureFocusForReturn, createFocusTrap } from '@reelkit/core';

// When your modal opens:
const restoreFocus = captureFocusForReturn();
container.focus({ preventScroll: true });
const releaseTrap = createFocusTrap(container);

// When the modal closes:
releaseTrap();
restoreFocus();`}
        />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Video Utilities
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Framework-agnostic utilities for shared video playback across slides.
          Used internally by{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-reel-player
          </code>{' '}
          and{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-lightbox
          </code>
          , available for custom framework bindings.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Export</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  captureFrame
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(video: HTMLVideoElement) => string | null'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Captures the current video frame as a JPEG data URL. Returns
                  null on cross-origin errors.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createSharedVideo
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(config: SharedVideoConfig) => SharedVideoInstance'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Creates a scoped shared video singleton with playback position
                  and frame capture maps. Each consumer gets an isolated
                  instance for iOS sound continuity.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  syncVideoObjectFit
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '(video: HTMLVideoElement, fallbackIsVertical: boolean) => Disposer'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Keeps{' '}
                  <span className="font-mono text-xs">
                    video.style.objectFit
                  </span>{' '}
                  in sync with the video's real orientation. Applies the
                  fallback (from the declared aspect ratio) immediately, then on{' '}
                  <span className="font-mono text-xs">loadedmetadata</span>{' '}
                  reads actual{' '}
                  <span className="font-mono text-xs">videoWidth</span> /{' '}
                  <span className="font-mono text-xs">videoHeight</span> and
                  switches to <span className="font-mono text-xs">'cover'</span>{' '}
                  for portrait,{' '}
                  <span className="font-mono text-xs">'contain'</span> for
                  landscape. Resilient to wrong declared metadata.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <Heading level={2} className="text-2xl font-bold mb-4">
          URL State
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Mirror one query parameter into a signal and back. Two axes, each one
          job: a{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            codec
          </code>{' '}
          is the wire (param text ↔ a stable identity), a{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locator
          </code>{' '}
          is the lookup (where that identity sits in the collection).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Export</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createUrlStateController
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '({ param, adapter?, codec?, locator? }) => UrlStateController'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Mirrors one query parameter into a signal and writes changes
                  back to the URL. The first write of an absent parameter pushes
                  one history entry; every write after that replaces it. Given a{' '}
                  <code className="font-mono text-xs">codec</code> or{' '}
                  <code className="font-mono text-xs">locator</code> it also
                  derives{' '}
                  <code className="font-mono text-xs">
                    position: Signal&lt;Pos | null&gt;
                  </code>
                  , applying the open/close latch and self-healing a parameter
                  that names no slide — so every binding subscribes rather than
                  re-deriving.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createHistoryAdapter
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => UrlAdapter'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Default adapter over the History API. A routed application
                  should inject its own instead, otherwise the router's location
                  goes stale and its next navigation drops the parameter.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  indexCodec
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'UrlCodec<number>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Reads <code className="font-mono text-xs">?photo=3</code> as
                  slide 3. Pass it to opt into index derivation without writing
                  a codec of your own. For an infinite or paginated list, pass{' '}
                  <code className="font-mono text-xs">locator</code> instead —
                  the parameter survives while the promise is pending, so a deep
                  link into an unloaded page is not cleared mid-fetch.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createIndexLocator
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(countGetter: () => number) => UrlLocator<number>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  The default index locator: a slide position maps to itself,
                  bounded by the live count the getter returns. An out-of-range
                  index resolves to{' '}
                  <code className="font-mono text-xs">null</code>, so a stale{' '}
                  <code className="font-mono text-xs">?photo=99</code>{' '}
                  self-heals out of the URL — it rejects rather than coercing to
                  the nearest slide, which would open one the URL never named. A
                  getter, not a number, so the bound reads the current size at
                  lookup time as a paginated gallery grows.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  urlIndexKey
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(countGetter, locateAsync?) => UrlKey<number>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  The matched pair for an index-addressed gallery —{' '}
                  <code className="font-mono text-xs">indexCodec</code> plus a{' '}
                  <code className="font-mono text-xs">createIndexLocator</code>{' '}
                  bound to the gallery&apos;s size. Spread it (
                  <code className="font-mono text-xs">
                    {'{ param, ...urlIndexKey(() => count) }'}
                  </code>
                  ) so the codec cannot drift from the locator. Pass a second{' '}
                  <code className="font-mono text-xs">locateAsync</code>{' '}
                  argument to window a paginated feed — page up to the wanted
                  index on a miss, then return it.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  urlIndexTwoAxisKey
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(opts) => UrlKey<TwoAxisIdentity, TwoAxisPosition>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Like <code className="font-mono text-xs">urlIndexKey</code>{' '}
                  but for a two-axis player: one strictly-dotted{' '}
                  <code className="font-mono text-xs">
                    ?p=&lt;outer&gt;.&lt;inner&gt;
                  </code>{' '}
                  parameter resolving to a{' '}
                  <code className="font-mono text-xs">TwoAxisPosition</code>{' '}
                  <code className="font-mono text-xs">
                    {'{ outer, inner }'}
                  </code>
                  . Options (
                  <code className="font-mono text-xs">
                    UrlIndexTwoAxisKeyOptions
                  </code>
                  ): <code className="font-mono text-xs">outerCount</code>,{' '}
                  <code className="font-mono text-xs">innerCounts</code>,
                  optional <code className="font-mono text-xs">outerCodec</code>
                  /<code className="font-mono text-xs">outerLocator</code> for
                  the outer axis, and{' '}
                  <code className="font-mono text-xs">innerCodec</code>/
                  <code className="font-mono text-xs">innerLocate</code>/
                  <code className="font-mono text-xs">innerIdentify</code> to
                  address the inner axis by id too. Each axis defaults to a
                  plain index bound. Powers the URL-driven stories player.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createStableIdCodec
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(hashCodec?: UrlCodec<string>) => UrlCodec<string>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  The stable-id <strong>wire</strong>, exported for composing —
                  the param text is the item&apos;s{' '}
                  <code className="font-mono text-xs">id</code>, written raw or
                  transformed by{' '}
                  <code className="font-mono text-xs">hashCodec</code> (pass{' '}
                  <code className="font-mono text-xs">base64UrlCodec</code> for
                  reversible base64url). The stable-id analog of{' '}
                  <code className="font-mono text-xs">indexCodec</code>: pair it
                  with a locator of your own instead of taking the whole{' '}
                  <code className="font-mono text-xs">urlStableIdKey</code>.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  base64UrlCodec
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'UrlCodec<string>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  The ready-made hash mechanism for a stable-id key: reversible
                  base64url (URL-safe alphabet, no padding, UTF-8) —{' '}
                  <strong>not</strong> a cryptographic hash. Pass it as{' '}
                  <code className="font-mono text-xs">hashCodec</code> to
                  obscure the id in the URL, or implement your own{' '}
                  <code className="font-mono text-xs">
                    UrlCodec&lt;string&gt;
                  </code>{' '}
                  to plug in a different scheme.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createStableIdLocator
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(items, locateAsync?) => UrlLocator<string, number>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  The stable-id <strong>lookup</strong>, exported for composing
                  — scans <code className="font-mono text-xs">items()</code> for
                  a matching <code className="font-mono text-xs">id</code>; a
                  gone id resolves to{' '}
                  <code className="font-mono text-xs">null</code> and
                  self-heals. Optional{' '}
                  <code className="font-mono text-xs">locateAsync</code> windows
                  a paginated feed. The stable-id analog of{' '}
                  <code className="font-mono text-xs">createIndexLocator</code>.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  urlStableIdKey
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(opts) => UrlKey<string, number>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Addresses a gallery by each item&apos;s stable{' '}
                  <code className="font-mono text-xs">id</code> —{' '}
                  <code className="font-mono text-xs">?photo=&lt;id&gt;</code> —
                  instead of its position, so a bookmark survives the list being
                  reordered. Options (
                  <code className="font-mono text-xs">
                    UrlStableIdKeyOptions
                  </code>
                  ): <code className="font-mono text-xs">items</code> (a live
                  getter), optional{' '}
                  <code className="font-mono text-xs">hashCodec</code> (pass{' '}
                  <code className="font-mono text-xs">base64UrlCodec</code>) to
                  transform the id on the wire, optional{' '}
                  <code className="font-mono text-xs">locateAsync</code> to
                  window a paginated feed (fetch until the id is present on a
                  miss, then return its index). Prefer over{' '}
                  <code className="font-mono text-xs">urlIndexKey</code>{' '}
                  whenever the list can change under a shared link.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  urlStableIdTwoAxisKey
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(opts) => UrlKey<TwoAxisIdentity<string>, TwoAxisPosition>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  The two-axis analog: the outer axis by stable id, the inner by
                  a local index —{' '}
                  <code className="font-mono text-xs">?story=user_42.3</code>.
                  Supply <code className="font-mono text-xs">innerItems</code>{' '}
                  instead of{' '}
                  <code className="font-mono text-xs">innerCounts</code> to
                  address the inner by id too (
                  <code className="font-mono text-xs">
                    ?story=user_42.photo_7
                  </code>
                  ); <code className="font-mono text-xs">hashCodec</code> (e.g.{' '}
                  <code className="font-mono text-xs">base64UrlCodec</code>)
                  transforms both ids. Options{' '}
                  <code className="font-mono text-xs">
                    UrlStableIdTwoAxisKeyOptions
                  </code>{' '}
                  (index inner) or{' '}
                  <code className="font-mono text-xs">
                    UrlStableIdTwoAxisIdInnerOptions
                  </code>{' '}
                  (id inner); item types satisfy{' '}
                  <code className="font-mono text-xs">Identified</code> (
                  <code className="font-mono text-xs">{'{ id: string }'}</code>
                  ).
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  {'UrlCodec<Id>'}
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'{ decode(raw) => Id | null; encode(id) => string }'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  The wire format: parameter text ↔ a stable identity,
                  collection-blind.{' '}
                  <code className="font-mono text-xs">decode</code> returning{' '}
                  <code className="font-mono text-xs">null</code> means
                  malformed text.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  {'UrlLocator<Id>'}
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '{ locate(id) => number | null; locateAsync?(id) => Promise<number | null>; identify(index) => id }'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  The lookup: where the identity sits in the collection.{' '}
                  <code className="font-mono text-xs">locate</code> is
                  synchronous,{' '}
                  <code className="font-mono text-xs">locateAsync</code> its
                  fallback for a paginated list, and{' '}
                  <code className="font-mono text-xs">identify</code> turns an
                  index back into an identity for writes.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  {'UrlKey<Id>'}
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'{ codec: UrlCodec<Id>; locator: UrlLocator<Id> }'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  The matched codec + locator pair for one parameter. They share
                  the same <code className="font-mono text-xs">Id</code> and
                  always travel together — the codec spells the identity into
                  the URL, the locator finds where it sits — so building them as
                  a pair is what keeps them from disagreeing.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  UrlAdapter
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'{ read, subscribe, push, replace, getState, goBack }'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  The injection point for a router. A routed application must
                  supply one, or the router's own location goes stale.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  {'UrlStateOptions<Id>'}
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '{ param: string; adapter?: UrlAdapter; codec?: UrlCodec<Id>; locator?: UrlLocator<Id> }'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  The options{' '}
                  <code className="font-mono text-xs">
                    createUrlStateController
                  </code>{' '}
                  takes — exported so a consumer can type a config assembled
                  separately before handing it over.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
