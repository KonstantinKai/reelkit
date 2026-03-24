import { Link } from 'react-router-dom';
import { Callout } from '../../../components/ui/Callout';
import { CodeBlock } from '../../../components/ui/CodeBlock';

export default function CoreGuide() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Core Guide</h1>
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
        <h2 className="text-2xl font-bold mb-4">Architecture Overview</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The core uses a <strong>controller pattern</strong> with factory
          functions. No classes — all plain objects returned from closures. Zero
          dependencies. The core coordinates:
        </p>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>SliderController</strong> — central state management and
              navigation
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>GestureController</strong> — touch/pointer drag handling
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>KeyboardController</strong> — arrow keys and Escape
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>WheelController</strong> — mouse wheel with debounce
            </span>
          </li>
        </ul>
      </section>

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
        <h2 className="text-2xl font-bold mb-4">Virtualization</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The core renders only <strong>3 slides to DOM</strong> at any time
          (current, previous, next). The range extractor determines which
          indices are included in the rendered window:
        </p>
        <CodeBlock
          code={`import { defaultRangeExtractor } from '@reelkit/core';

// Default: renders current ± 1 (3 DOM nodes)
const indexes = defaultRangeExtractor(currentIndex, count);

// Custom: skip hidden slides by shifting to next valid index
const hiddenSlides = new Set([2, 5]);

const skipHiddenExtractor = (current: number, count: number) => {
  const result: number[] = [];
  // Collect prev, current, next — skip hidden, shift forward
  for (let i = current - 1, added = 0; added < 3 && i < count; i++) {
    if (i >= 0 && !hiddenSlides.has(i)) {
      result.push(i);
      added++;
    }
  }
  return result;
};`}
          language="typescript"
        />
        <Callout type="info" className="mt-4">
          The result is always clamped to a maximum of 3 indices. If your
          extractor returns more, the core keeps 3 centered around the current
          slide.
        </Callout>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Signals</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The core uses a lightweight signal system for reactivity:
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

      <section>
        <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
        <ul className="space-y-3">
          <li>
            <Link
              to="/docs/core/api"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Core API Reference
            </Link>
            <span className="text-slate-500"> - all available props</span>
          </li>
          <li>
            <Link
              to="/docs/react/guide"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              React Guide
            </Link>
            <span className="text-slate-500">
              {' '}
              - live demos and virtualization
            </span>
          </li>
          <li>
            <Link
              to="/docs/angular/guide"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Angular Guide
            </Link>
            <span className="text-slate-500">
              {' '}
              - standalone components and signals
            </span>
          </li>
          <li>
            <Link
              to="/docs/reel-player"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              React Reel Player
            </Link>
            <span className="text-slate-500">
              {' '}
              - TikTok/Reels-style video player
            </span>
          </li>
          <li>
            <Link
              to="/docs/lightbox"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              React Lightbox
            </Link>
            <span className="text-slate-500"> - image & video gallery</span>
          </li>
          <li>
            <Link
              to="/docs/angular-reel-player"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Angular Reel Player
            </Link>
            <span className="text-slate-500">
              {' '}
              - TikTok/Reels-style video player
            </span>
          </li>
          <li>
            <Link
              to="/docs/angular-lightbox"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Angular Lightbox
            </Link>
            <span className="text-slate-500"> - image & video gallery</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
