import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../components/ui/CodeBlock';

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
    default: 'required',
    description: 'Width and height as [width, height]',
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
    prop: 'useNavKeys',
    type: 'boolean',
    default: 'true',
    description: 'Enable keyboard navigation',
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
    prop: 'apiRef',
    type: 'RefObject<ReelApi>',
    default: '-',
    description: 'Ref to access API methods',
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
  { prop: 'count', type: 'number', description: 'Total number of items' },
  { prop: 'className', type: 'string', description: 'Custom CSS class' },
  { prop: 'style', type: 'CSSProperties', description: 'Custom inline styles' },
];

export default function ReactApi() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">React API</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react
          </code>{' '}
          package provides React components for building sliders.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Reel</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The main container component that handles all slider logic, gestures,
          and animations.
        </p>
        <CodeBlock
          code={`import { Reel } from '@reelkit/react';

<Reel
  count={items.length}
  size={[width, height]}
  direction="vertical"
  enableWheel
  afterChange={(index) => console.log('Current:', index)}
  itemBuilder={(index, indexInRange, size) => (
    <div style={{ width: size[0], height: size[1] }}>
      Slide {index}
    </div>
  )}
>
  {/* Optional children like ReelIndicator */}
</Reel>`}
          language="tsx"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">Props</h3>
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

        <h3 className="text-xl font-semibold mt-8 mb-4">Callbacks</h3>
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
        <h2 className="text-2xl font-bold mb-4">ReelApi</h2>
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
        <h2 className="text-2xl font-bold mb-4">ReelIndicator</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Instagram-style progress indicators:
        </p>
        <CodeBlock
          code={`import { Reel, ReelIndicator } from '@reelkit/react';

<Reel count={10} size={[400, 600]} itemBuilder={...}>
  <ReelIndicator count={10} />
</Reel>`}
          language="tsx"
        />

        <div className="overflow-x-auto mt-6">
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
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {p.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Examples</h2>
        <ul className="space-y-3">
          <li>
            <Link
              to="/docs/examples/basic"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Basic Slider
            </Link>
            <span className="text-slate-500">
              {' '}
              — full working example with navigation
            </span>
          </li>
          <li>
            <Link
              to="/docs/examples/infinite"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Infinite List
            </Link>
            <span className="text-slate-500">
              {' '}
              — virtualization with 10,000+ items
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
