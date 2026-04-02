import { CodeBlock } from '../../../components/ui/CodeBlock';

const reelInputs = [
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
    type: '(index: number, indexInRange: number) => string | number',
    default: 'index => index',
    description:
      'Custom key function for @for track expressions (useful with loop)',
  },
  {
    prop: 'className',
    type: 'string',
    default: "''",
    description: 'CSS class applied to the root container element',
  },
  {
    prop: 'ariaLabel',
    type: 'string',
    default: "'Carousel'",
    description: 'Accessible label for the carousel region',
  },
];

const reelOutputs = [
  {
    prop: 'afterChange',
    type: 'EventEmitter<{ index: number; indexInRange: number }>',
    description: 'Emitted after slide transition completes',
  },
  {
    prop: 'beforeChange',
    type: 'EventEmitter<{ index: number; nextIndex: number; indexInRange: number }>',
    description: 'Emitted before slide transition begins',
  },
  {
    prop: 'slideDragStart',
    type: 'EventEmitter<number>',
    description: 'Emitted when a drag gesture starts',
  },
  {
    prop: 'slideDragEnd',
    type: 'EventEmitter<number>',
    description: 'Emitted when a drag gesture ends (released)',
  },
  {
    prop: 'slideDragCanceled',
    type: 'EventEmitter<number>',
    description: 'Emitted when a drag gesture is canceled (snap-back)',
  },
  {
    prop: 'apiReady',
    type: 'EventEmitter<ReelApi>',
    description: 'Emitted once after view init, exposing the imperative API',
  },
];

const apiMethods = [
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
    description: 'Start listening to keyboard events',
  },
  {
    method: 'unobserve()',
    type: '() => void',
    description: 'Stop listening to keyboard events',
  },
];

const indicatorInputs = [
  {
    prop: 'count',
    type: 'number | undefined',
    default: 'auto',
    description:
      'Total number of items. Auto-connected from parent rk-reel context when nested inside one; pass explicitly when used standalone',
  },
  {
    prop: 'active',
    type: 'number | undefined',
    default: 'auto',
    description:
      'Current active index. Auto-connected from parent rk-reel context when nested inside one; pass explicitly when used standalone',
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
    default: "'rgba(255,255,255,0.5)'",
    description: 'Inactive dot color',
  },
  {
    prop: 'edgeScale',
    type: 'number',
    default: '0.5',
    description: 'Scale factor for edge overflow dots',
  },
  {
    prop: 'className',
    type: 'string',
    default: "''",
    description: 'Custom CSS class applied to the indicator container',
  },
  {
    prop: 'tablistLabel',
    type: 'string',
    default: "'Slide navigation'",
    description: 'Accessible label for the tablist landmark',
  },
];

const indicatorOutputs = [
  {
    prop: 'dotClick',
    type: 'EventEmitter<number>',
    description: 'Emitted when a dot is clicked; provides the dot index',
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

const signalBridgeRows = [
  {
    name: 'toAngularSignal',
    signature: '(source: Subscribable<T>, destroyRef: DestroyRef) => Signal<T>',
    description: 'Bridges a core Subscribable into a read-only Angular Signal',
  },
  {
    name: 'animatedSignalBridge',
    signature:
      '(source: AnimatedValue, zone: NgZone, cdRef: ChangeDetectorRef, destroyRef: DestroyRef) => Signal<number>',
    description:
      'Bridges a core animated value into an Angular Signal, updating via requestAnimationFrame outside the zone',
  },
];

export default function AngularApi() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Angular API Reference</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Complete reference for{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/angular
          </code>{' '}
          components, directives, services, and utilities.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-2">ReelComponent</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Selector:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rk-reel
          </code>
        </p>
        <h3 className="text-lg font-semibold mb-3">Inputs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Input</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Default</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {reelInputs.map((p) => (
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
        <h3 className="text-lg font-semibold mb-3">Outputs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Output</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {reelOutputs.map((p) => (
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
        <h2 className="text-2xl font-bold mb-4">ReelApi Interface</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Obtained via the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            (apiReady)
          </code>{' '}
          output:
        </p>
        <CodeBlock
          code={`import { type ReelApi } from '@reelkit/angular';

@Component({ ... })
export class AppComponent {
  api: ReelApi | undefined;

  // In template: (apiReady)="api = $event"

  prev()  { this.api?.prev(); }
  next()  { this.api?.next(); }
  jump(i: number) { this.api?.goTo(i, true); }  // animated
}`}
          language="typescript"
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
              {apiMethods.map((p) => (
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
        <h2 className="text-2xl font-bold mb-2">RkReelItemDirective</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Selector:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            [rkReelItem]
          </code>{' '}
          — Applied to an{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ng-template
          </code>{' '}
          inside{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rk-reel
          </code>
          .
        </p>
        <h3 className="text-lg font-semibold mb-3">Template Context</h3>
        <CodeBlock
          code={`<ng-template rkReelItem let-i let-indexInRange="indexInRange" let-size="size">
  <!-- $implicit (let-i)  : number         — absolute slide index -->
  <!-- indexInRange        : number         — position in the visible window (0, 1, or 2) -->
  <!-- size                : [number,number] — [width, height] of the container -->
</ng-template>`}
          language="html"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Variable</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  $implicit (let-i)
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  number
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Absolute slide index (0 to count-1)
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  indexInRange
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  number
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Position in the visible window (0, 1, or 2)
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  size
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  [number, number]
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Current slider dimensions as [width, height] in pixels
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-2">ReelIndicatorComponent</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Selector:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rk-reel-indicator
          </code>
        </p>
        <h3 className="text-lg font-semibold mb-3">Inputs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Input</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Default</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {indicatorInputs.map((p) => (
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
        <h3 className="text-lg font-semibold mt-6 mb-3">Outputs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Output</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {indicatorOutputs.map((p) => (
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
        <h2 className="text-2xl font-bold mb-4">RK_REEL_CONTEXT</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          An{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            InjectionToken{'<ReelContextValue>'}
          </code>{' '}
          provided by{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rk-reel
          </code>{' '}
          to its descendants. Used internally by{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rk-reel-indicator
          </code>{' '}
          for auto-connect behavior. Inject it in custom components that need
          slider context.
        </p>
        <CodeBlock
          code={`import { inject } from '@angular/core';
import { RK_REEL_CONTEXT } from '@reelkit/angular';

@Component({ ... })
export class MyCustomControl {
  private readonly ctx = inject(RK_REEL_CONTEXT, { optional: true });

  jump(index: number) {
    this.ctx?.goTo(index, true);
  }
}`}
          language="typescript"
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
        <h2 className="text-2xl font-bold mb-4">BodyLockService</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Reference-counted body scroll lock. Multiple concurrent callers
          (e.g. a lightbox and a modal both open) can each call lock/unlock
          independently — the body is only restored once the last caller
          releases it. Provided at root — inject anywhere.
        </p>
        <CodeBlock
          code={`import { inject } from '@angular/core';
import { BodyLockService } from '@reelkit/angular';

@Component({ ... })
export class OverlayComponent {
  private readonly bodyLock = inject(BodyLockService);

  open() { this.bodyLock.lock(); }
  close() { this.bodyLock.unlock(); }
}`}
          language="typescript"
        />
        <div className="overflow-x-auto mt-4">
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
                  locked
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  boolean (getter)
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Whether the body is currently locked
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  lock()
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  () =&gt; void
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Lock body scroll and apply scrollbar width compensation
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  unlock()
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  () =&gt; void
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Restore original body scroll styles
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Signal Bridge Utilities</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Utility functions that bridge the core signal system (
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/core
          </code>
          ) with Angular's native signal API. Used internally by{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelComponent
          </code>
          ; also available for custom framework integrations.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Function</th>
                <th className="text-left py-3 px-4 font-semibold">Signature</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {signalBridgeRows.map((r) => (
                <tr
                  key={r.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {r.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {r.signature}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {r.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CodeBlock
          code={`import { DestroyRef, inject } from '@angular/core';
import { toAngularSignal } from '@reelkit/angular';
import { createSliderController } from '@reelkit/core';

// Custom component using low-level signal bridge
const destroyRef = inject(DestroyRef);
const controller = createSliderController({ count: 10 }, {});
const index = toAngularSignal(controller.state.index, destroyRef);`}
          language="typescript"
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Package Exports</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          All public exports from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/angular
          </code>
          :
        </p>
        <CodeBlock
          code={`// Components & directives
import {
  ReelComponent,
  ReelIndicatorComponent,
  RkReelItemDirective,
  RkSwipeToCloseDirective,
} from '@reelkit/angular';

// Types
import type {
  ReelApi,
  ReelContextValue,
  RkReelItemContext,
  CoreSignal,
  Subscribable,
  AnimatedValue,
  RangeExtractor,
  SliderDirection,
  Disposer,
  DisposableList,
  GestureController,
  SliderController,
  ContentLoadingController,
  ContentPreloader,
  ContentPreloaderConfig,
  SoundController,
  BodyLock,
  TransitionTransformFn,
  SlideTransformStyle,
  SwipeToCloseDirection,
} from '@reelkit/angular';

// Context
import { RK_REEL_CONTEXT } from '@reelkit/angular';

// Services
import { BodyLockService } from '@reelkit/angular';

// Signal bridges
import { toAngularSignal, animatedSignalBridge } from '@reelkit/angular';

// Core re-exports
import {
  // Signals & reactivity
  createSignal, createComputed, reaction, batch,

  // Transitions
  slideTransition, fadeTransition, flipTransition,
  cubeTransition, zoomTransition, getSlideProgress,

  // Content loading & preloading
  createContentLoadingController, createContentPreloader,

  // Sound
  createSoundController, syncMutedToVideo,

  // Fullscreen
  fullscreenSignal, requestFullscreen, exitFullscreen,

  // DOM & cleanup
  observeDomEvent, createDisposableList, createBodyLock,

  // Slider & gestures
  createSliderController, createGestureController,
  defaultRangeExtractor, createDefaultKeyExtractorForLoop,

  // Video
  captureFrame, createSharedVideo,

  // Utilities
  animate, noop, clamp, abs, first, last, extractRange,
} from '@reelkit/angular';`}
          language="typescript"
        />
      </section>
    </div>
  );
}
