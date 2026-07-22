import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Heading } from '../../../components/ui/Heading';

const reelProps = [
  {
    prop: 'count',
    type: 'number',
    default: 'required',
    description: 'Total number of items',
  },
  {
    prop: 'size',
    type: '[number, number]',
    default: '-',
    description:
      'Width and height as [width, height]. When omitted, auto-measures via ResizeObserver',
  },
  {
    prop: 'itemBuilder',
    type: '(index, indexInRange, size) => ReactElement',
    default: 'required',
    description: 'Function to render each slide',
  },
  {
    prop: 'direction',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: 'Scroll direction',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: 'Starting index',
  },
  {
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description: 'Enable infinite loop',
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
    prop: 'enableNavKeys',
    type: 'boolean',
    default: 'true',
    description: 'Enable keyboard navigation',
  },
  {
    prop: 'onNavKeyPress',
    type: '(increment: -1 | 1) => void',
    default: '-',
    description:
      'Custom handler for arrow key navigation. Replaces default prev/next behavior.',
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
    prop: 'enableGestures',
    type: 'boolean',
    default: 'true',
    description: 'Enable touch/mouse drag navigation',
  },
  {
    prop: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: 'Swipe threshold (0-1)',
  },
  {
    prop: 'rangeExtractor',
    type: '(index: number, count: number) => number[]',
    default: 'defaultRangeExtractor',
    description: 'Custom function to determine which indexes are rendered',
  },
  {
    prop: 'keyExtractor',
    type: '(index: number) => string',
    default: '-',
    description:
      'Custom key function for React reconciliation (useful with loop)',
  },
  {
    prop: 'apiRef',
    type: 'RefObject<ReelApi>',
    default: '-',
    description: 'Ref to access API methods',
  },
  {
    prop: 'className',
    type: 'string',
    default: '-',
    description: 'CSS class for the container element',
  },
  {
    prop: 'style',
    type: 'CSSProperties',
    default: '-',
    description: 'Inline styles for the container element',
  },
  {
    prop: 'ariaLabel',
    type: 'string',
    default: '-',
    description:
      'Accessible label for the carousel region, read by screen readers',
  },
];

const callbacks = [
  {
    prop: 'afterChange',
    type: '(index, indexInRange) => void',
    description: 'Called after slide change completes',
  },
  {
    prop: 'beforeChange',
    type: '(index, nextIndex, indexInRange) => void',
    description: 'Called before slide change starts',
  },
  {
    prop: 'onSlideDragStart',
    type: '(index) => void',
    description: 'Called when drag gesture starts',
  },
  {
    prop: 'onSlideDragEnd',
    type: '(index) => void',
    description: 'Called when drag gesture ends',
  },
  {
    prop: 'onSlideDragCanceled',
    type: '(index) => void',
    description: 'Called when drag is canceled',
  },
];

const apiMethods = [
  { method: 'next()', type: '() => void', description: 'Go to next slide' },
  { method: 'prev()', type: '() => void', description: 'Go to previous slide' },
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
    method: 'observe()',
    type: '() => void',
    description: 'Start keyboard observation',
  },
  {
    method: 'unobserve()',
    type: '() => void',
    description: 'Stop keyboard observation',
  },
];

const indicatorProps = [
  {
    prop: 'count',
    type: 'number',
    default: 'auto',
    description:
      'Total number of items. Auto-connected from parent Reel when nested inside one; pass explicitly when used standalone',
  },
  {
    prop: 'active',
    type: 'number',
    default: 'auto',
    description:
      'Current active index. Auto-connected from parent Reel when nested inside one; pass explicitly when used standalone',
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
    description: 'Dot size in pixels',
  },
  {
    prop: 'visible',
    type: 'number',
    default: '5',
    description: 'Max normal-sized dots visible',
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
    description: 'Scale for overflow edge dots',
  },
  {
    prop: 'onDotClick',
    type: '(index: number) => void',
    default: '-',
    description: 'Callback when a dot is clicked',
  },
  {
    prop: 'className',
    type: 'string',
    default: '-',
    description: 'Custom CSS class',
  },
  {
    prop: 'style',
    type: 'CSSProperties',
    default: '-',
    description: 'Custom inline styles',
  },
];

const observeProps = [
  {
    prop: 'signals',
    type: 'Subscribable[]',
    default: 'required',
    description:
      'Signals to subscribe to. Any of them notifying re-runs the children function — and only that function, never the parent.',
  },
  {
    prop: 'children',
    type: '() => ReactElement | null',
    default: 'required',
    description:
      'Render function, re-executed on each change. Read the signal values inside it; a value read outside is captured once and goes stale.',
  },
];

const animatedObserveProps = [
  {
    prop: 'signal',
    type: 'Signal<AnimatedValue>',
    default: 'required',
    description:
      'Signal emitting { value, duration, done? }. A duration above 0 interpolates from the current value to the new one; 0 jumps straight there.',
  },
  {
    prop: 'children',
    type: '(value: number) => ReactElement',
    default: 'required',
    description:
      'Render function receiving the interpolated value for the current frame, committed synchronously so the DOM keeps up with the animation.',
  },
];

const overlayUrlStateOptions = [
  {
    prop: 'param',
    type: 'string',
    default: 'required',
    description: 'Query parameter carrying the active slide, e.g. "photo".',
  },
  {
    prop: 'adapter',
    type: 'UrlAdapter',
    default: 'History API',
    description:
      "Navigation system to read and write through. Pass a router-backed adapter in a routed app so the router's own location does not go stale.",
  },
  {
    prop: 'codec',
    type: '{ decode(raw) => Id | null; encode(id) => string }',
    default: 'required',
    description:
      'Wire format: parameter text ↔ a stable identity, collection-blind. Travels with locator as a matched pair sharing the same Id — spread ...indexKey(() => images.length) for the default ?photo=3 index gallery, or supply your own (base64, slug) so a bookmark survives the gallery being reordered.',
  },
  {
    prop: 'locator',
    type: '{ locate(id) => number | null; locateAsync?(id) => Promise<number | null>; identify(index) => id }',
    default: 'required',
    description:
      'Maps the identity to a position and owns its own validity: locate (sync), locateAsync (async fallback for a paginated gallery), identify (writes). For a plain index gallery spread ...indexKey(() => images.length) — it supplies this locator plus the matching codec and bounds ?photo=3 against the live count, so a stale ?photo=99 heals out of the URL instead of opening a slide that was never named. A paginated feed or an identity-keyed gallery supplies its own matched codec + locator instead.',
  },
];

export default function ReactApi() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">React API Reference</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Complete reference for{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react
          </code>{' '}
          components, props, and methods.
        </p>
      </div>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Reel Props
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelProps
          </code>
        </p>
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
        <Heading level={2} className="text-2xl font-bold mb-4">
          Callbacks
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Prop</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {callbacks.map((p) => (
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
        <Heading level={2} className="text-2xl font-bold mb-4">
          ReelApi Methods
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Access slider methods via{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            apiRef
          </code>
          :
        </p>
        <CodeBlock
          code={`const apiRef = useRef<ReelApi>(null);

// Navigation
apiRef.current?.next();
apiRef.current?.prev();
apiRef.current?.goTo(5);           // instant
apiRef.current?.goTo(5, true);     // animated

// Lifecycle
apiRef.current?.adjust();          // recalculate positions
apiRef.current?.observe();         // start observing keyboard
apiRef.current?.unobserve();       // stop observing keyboard`}
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
        <Heading level={2} className="text-2xl font-bold mb-4">
          ReelIndicator Props
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelIndicatorProps
          </code>
        </p>
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
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Observer Components
        </Heading>

        <Heading level={3} className="text-lg font-semibold mb-2">
          Observe
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Bridges core signals to React rendering without causing parent
          re-renders. Only the children function re-executes when subscribed
          signals change.
        </p>
        <CodeBlock
          code={`import { Observe } from '@reelkit/react';

<Observe signals={[controller.state.index]}>
  {() => <span>Current: {controller.state.index.value}</span>}
</Observe>`}
          language="tsx"
        />
        <div className="overflow-x-auto mt-4 mb-6">
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
              {observeProps.map((row) => (
                <tr
                  key={row.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {row.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {row.type}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {row.default}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          AnimatedObserve
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Subscribes to animated value signals and smoothly interpolates using{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            requestAnimationFrame
          </code>
          .
        </p>
        <CodeBlock
          code={`import { AnimatedObserve } from '@reelkit/react';

<AnimatedObserve signal={controller.state.axisValue}>
  {(value) => (
    <div style={{ transform: \`translateY(\${value}px)\` }} />
  )}
</AnimatedObserve>`}
          language="tsx"
        />
        <div className="overflow-x-auto mt-4">
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
              {animatedObserveProps.map((row) => (
                <tr
                  key={row.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {row.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {row.type}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {row.default}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Hooks
        </Heading>

        <Heading level={3} className="text-lg font-semibold mb-2">
          useBodyLock
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Locks body scroll and compensates for scrollbar width shift.
        </p>
        <CodeBlock
          code={`import { useBodyLock } from '@reelkit/react';

// Lock body scroll when overlay is open
useBodyLock(isOpen);`}
          language="typescript"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          useOverlayUrlState
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            OverlayUrlStateOptions
          </code>
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Builds a URL-state controller for an overlay, which you hand to a{' '}
          <code>*UrlOverlay</code> as its <code>controller</code> prop.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          See{' '}
          <Link
            to="/docs/react/guide#url-state"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            URL State in the React guide
          </Link>{' '}
          for the walkthrough and examples.
        </p>
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Option</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Default</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {overlayUrlStateOptions.map((p) => (
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
          . Set the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ariaLabel
          </code>{' '}
          prop to give the region a screen-reader name. A polite live region
          announces "Slide N of M" on every slide change without re-rendering
          the carousel. Inactive slides receive the{' '}
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
            @reelkit/react
          </code>{' '}
          for focus return and trap.
        </p>
      </section>

      <section>
        <Heading level={2} className="text-2xl font-bold mb-4">
          Utilities
        </Heading>

        <Heading level={3} className="text-lg font-semibold mb-2">
          createDefaultKeyExtractorForLoop
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Creates a key extractor that handles duplicate indexes when{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            loop
          </code>{' '}
          is enabled.
        </p>
        <CodeBlock
          code={`import { createDefaultKeyExtractorForLoop } from '@reelkit/react';

<Reel
  count={items.length}
  size={size}
  loop
  keyExtractor={createDefaultKeyExtractorForLoop(items.length)}
  itemBuilder={...}
/>`}
          language="tsx"
        />
      </section>
    </div>
  );
}
