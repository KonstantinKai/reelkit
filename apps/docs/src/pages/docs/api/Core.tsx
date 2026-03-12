import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../components/ui/CodeBlock';

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

export default function CoreApi() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Core API</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/core
          </code>{' '}
          package provides the framework-agnostic slider logic. Use it to build
          custom integrations or understand the underlying architecture.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">createSliderController</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Creates a new slider controller instance that manages all slider state
          and behavior.
        </p>
        <CodeBlock
          code={`import { createSliderController } from '@reelkit/core';

const controller = createSliderController(
  {
    count: 10,
    direction: 'vertical',
    enableWheel: true,
    transitionDuration: 300,
  },
  {
    onAfterChange: (index) => console.log('Changed to:', index),
  }
);

// Attach to DOM element
controller.attach(element);
controller.observe();`}
          language="typescript"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">Config Options</h3>
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

        <h3 className="text-xl font-semibold mt-8 mb-4">Callbacks</h3>
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
        <h2 className="text-2xl font-bold mb-4">Controller Methods</h2>

        <h3 className="text-lg font-semibold mb-3">Navigation</h3>
        <CodeBlock
          code={`// Go to specific index
controller.goTo(5);           // instant
controller.goTo(5, true);     // animated, returns Promise

// Navigate to next/previous
controller.next();
controller.prev();`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-3">Lifecycle</h3>
        <CodeBlock
          code={`// Connect to DOM element
controller.attach(element);

// Start keyboard observation
controller.observe();

// Stop keyboard observation
controller.unobserve();

// Detach from DOM
controller.detach();

// Recalculate positions
controller.adjust();

// Update size
controller.setPrimarySize(600);`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-3">State Updates</h3>
        <CodeBlock
          code={`// Update configuration
controller.updateConfig({
  count: 20,
  loop: true,
});`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Controller State</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Access reactive state through{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            controller.state
          </code>
          :
        </p>
        <CodeBlock
          code={`const { index, axisValue, indexes } = controller.state;

// Subscribe to index changes
index.subscribe((currentIndex) => {
  console.log('Current index:', currentIndex);
});

// Get visible indexes for virtualization
indexes.subscribe((visibleIndexes) => {
  console.log('Visible:', visibleIndexes);
});`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Range Extractors</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Control which items are rendered for virtualization:
        </p>
        <CodeBlock
          code={`import { defaultRangeExtractor } from '@reelkit/core';

// Default: renders 3 items around current
const indexes = defaultRangeExtractor(currentIndex, count);

// Custom: render 5 items around current
const customExtractor = (currentIndex: number, count: number) => {
  const range = 5;
  const start = Math.max(0, currentIndex - range);
  const end = Math.min(count - 1, currentIndex + range);

  const result: number[] = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
};`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Signals</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The core uses a simple signal system for reactivity:
        </p>
        <CodeBlock
          code={`import { createSignal, createComputed, reaction } from '@reelkit/core';

// Create a signal
const count = createSignal(0);

// Subscribe to changes
count.subscribe((value) => console.log(value));

// Update value
count.value = 5;

// Create computed signal
const doubled = createComputed(() => count.value * 2);

// Run side effects
const dispose = reaction(
  () => count.value,
  (value) => console.log('Count changed:', value)
);

// Cleanup
dispose();`}
          language="typescript"
        />
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
              — full working example using React bindings
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
