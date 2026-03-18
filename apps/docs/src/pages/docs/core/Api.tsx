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
    type: '(index: number, count: number) => number[]',
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
];

const methods = [
  {
    method: 'attach(element)',
    type: '(HTMLElement) => void',
    description: 'Connect controller to DOM element',
  },
  {
    method: 'detach()',
    type: '() => void',
    description: 'Detach from DOM element',
  },
  {
    method: 'observe()',
    type: '() => void',
    description: 'Start keyboard observation',
  },
  {
    method: 'unobserve()',
    type: '() => void',
    description: 'Stop keyboard observation',
  },
  {
    method: 'next()',
    type: '() => void',
    description: 'Go to next slide',
  },
  {
    method: 'prev()',
    type: '() => void',
    description: 'Go to previous slide',
  },
  {
    method: 'goTo(index, animate?)',
    type: '(number, boolean?) => Promise',
    description: 'Go to specific slide',
  },
  {
    method: 'adjust()',
    type: '() => void',
    description: 'Recalculate slide positions',
  },
  {
    method: 'setPrimarySize(size)',
    type: '(number) => void',
    description: 'Update container size',
  },
  {
    method: 'updateConfig(config)',
    type: '(Partial<Config>) => void',
    description: 'Update configuration options',
  },
];

const stateProperties = [
  {
    property: 'index',
    type: 'Signal<number>',
    description: 'Current slide index (subscribable)',
  },
  {
    property: 'axisValue',
    type: 'Signal<number>',
    description: 'Current axis position value',
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
        <h2 className="text-2xl font-bold mb-4">Config Options</h2>
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
        <h2 className="text-2xl font-bold mb-4">Callbacks</h2>
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
        <h2 className="text-2xl font-bold mb-4">Methods</h2>
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
        <h2 className="text-2xl font-bold mb-4">State Properties</h2>
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
        <h2 className="text-2xl font-bold mb-4">Range Extractor</h2>
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
                  (index: number, count: number) =&gt; number[]
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
        <h2 className="text-2xl font-bold mb-4">Signal API</h2>
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
                  {'<T>(fn: () => T) => ComputedSignal<T>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Create a derived computed signal
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  reaction
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(track: () => T, effect: (value: T) => void) => () => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Run side effect when tracked value changes; returns dispose
                  function
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

      <section>
        <h2 className="text-2xl font-bold mb-4">Video Utilities</h2>
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
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
