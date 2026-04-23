import { Callout } from '../../../components/ui/Callout';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { NextSteps } from '../../../components/NextSteps';
import { Heading } from '../../../components/ui/Heading';

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
        <Heading level={2} className="text-2xl font-bold mb-4">Architecture Overview</Heading>
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
        <Heading level={2} className="text-2xl font-bold mb-4">createSliderController</Heading>
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
        <Heading level={2} className="text-2xl font-bold mb-4">Controller Methods</Heading>

        <Heading level={3} className="text-lg font-semibold mb-3">Navigation</Heading>
        <CodeBlock
          code={`// Go to specific index
controller.goTo(5);           // instant
controller.goTo(5, true);     // animated, returns Promise

// Navigate to next/previous
controller.next();
controller.prev();`}
          language="typescript"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-3">Lifecycle</Heading>
        <CodeBlock
          code={`// Connect to DOM element
controller.attach(element);

// Start gesture, keyboard, and wheel observation
controller.observe();

// Stop gesture, keyboard, and wheel observation
controller.unobserve();

// Detach DOM listeners (reversible — use for React effect cleanup)
controller.detach();

// Permanent teardown (use for Angular onDestroy)
controller.dispose();

// Recalculate positions
controller.adjust();

// Update size
controller.setPrimarySize(600);`}
          language="typescript"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-3">State Updates</Heading>
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
        <Heading level={2} className="text-2xl font-bold mb-4">Virtualization</Heading>
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
        <Heading level={2} className="text-2xl font-bold mb-4">Signals</Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The core uses a lightweight signal system for reactivity:
        </p>
        <CodeBlock
          code={`import { createSignal, createComputed, reaction } from '@reelkit/core';

// Create a signal
const count = createSignal(0);

// Observe changes (returns a disposer function)
const dispose = count.observe(() => console.log(count.value));

// Update value
count.value = 5;

// Create computed signal (requires a deps factory)
const doubled = createComputed(() => count.value * 2, () => [count]);

// Run side effects on signal changes
const disposeReaction = reaction(
  () => [count],
  () => console.log('Count changed:', count.value)
);

// Cleanup
dispose();
disposeReaction();`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">Controller State</Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Access reactive state through{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            controller.state
          </code>
          :
        </p>
        <CodeBlock
          code={`const { index, axisValue, indexes } = controller.state;

// Observe index changes (returns a disposer function)
const disposeIndex = index.observe(() => {
  console.log('Current index:', index.value);
});

// Observe visible indexes for virtualization
const disposeIndexes = indexes.observe(() => {
  console.log('Visible:', indexes.value);
});

// Cleanup when done
disposeIndex();
disposeIndexes();`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">Timeline Controller</Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Build a custom scrub bar for any{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">{`<video>`}</code>{' '}
          element. The controller exposes reactive signals for duration, current
          time, buffered ranges, and scrubbing state, and wires pointer plus
          keyboard interactions onto any DOM element in one call.
        </p>
        <CodeBlock
          code={`import { createTimelineController } from '@reelkit/core';

const timeline = createTimelineController({
  onScrubStart: () => video.pause(),
  onScrubEnd: () => video.play(),
});

timeline.attach(video);
const dispose = timeline.bindInteractions(trackEl);

// Render: read signals and update DOM
timeline.progress.observe(() => {
  fillEl.style.width = \`\${timeline.progress.value * 100}%\`;
});

// Cleanup
dispose();
timeline.detach();`}
          language="typescript"
        />
      </section>

      <NextSteps
        items={[
          {
            label: 'Core API Reference',
            path: '/docs/core/api',
            description: 'all available props',
          },
          {
            label: 'Framework Guide',
            path: {
              react: '/docs/react/guide',
              angular: '/docs/angular/guide',
              vue: '/docs/vue/guide',
            },
            description: 'components, demos, and integration',
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
          {
            label: 'Stories Player',
            path: {
              react: '/docs/stories-player',
              angular: '/docs/angular-stories-player',
              vue: '/docs/vue-stories-player',
            },
            description: 'Instagram-style stories viewer',
          },
        ]}
      />
    </div>
  );
}
