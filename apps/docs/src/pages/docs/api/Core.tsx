import { CodeBlock } from '../../../components/ui/CodeBlock';
import '../docs.css';

export default function CoreApi() {
  return (
    <div className="docs-page">
      <h1 className="docs-title">Core API</h1>
      <p className="docs-description">
        The <code>@reelkit/core</code> package provides the framework-agnostic slider logic.
        Use it to build custom integrations or understand the underlying architecture.
      </p>

      <section className="docs-section">
        <h2>createSliderController</h2>
        <p>
          Creates a new slider controller instance that manages all slider state and behavior.
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
        />

        <h3>Config Options</h3>
        <table className="api-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>count</code></td>
              <td><code>number</code></td>
              <td>required</td>
              <td>Total number of items</td>
            </tr>
            <tr>
              <td><code>initialIndex</code></td>
              <td><code>number</code></td>
              <td><code>0</code></td>
              <td>Starting index</td>
            </tr>
            <tr>
              <td><code>direction</code></td>
              <td><code>'vertical' | 'horizontal'</code></td>
              <td><code>'vertical'</code></td>
              <td>Scroll direction</td>
            </tr>
            <tr>
              <td><code>enableWheel</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>Enable mouse wheel</td>
            </tr>
            <tr>
              <td><code>wheelDebounceMs</code></td>
              <td><code>number</code></td>
              <td><code>200</code></td>
              <td>Wheel debounce time</td>
            </tr>
            <tr>
              <td><code>loop</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>Loop navigation</td>
            </tr>
            <tr>
              <td><code>transitionDuration</code></td>
              <td><code>number</code></td>
              <td><code>300</code></td>
              <td>Animation duration in ms</td>
            </tr>
            <tr>
              <td><code>swipeDistanceFactor</code></td>
              <td><code>number</code></td>
              <td><code>0.12</code></td>
              <td>Swipe threshold (0-1)</td>
            </tr>
          </tbody>
        </table>

        <h3>Callbacks</h3>
        <table className="api-table">
          <thead>
            <tr>
              <th>Callback</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>onBeforeChange</code></td>
              <td><code>(index, nextIndex, rangeIndex) =&gt; void</code></td>
              <td>Before slide change</td>
            </tr>
            <tr>
              <td><code>onAfterChange</code></td>
              <td><code>(index, rangeIndex) =&gt; void</code></td>
              <td>After slide change</td>
            </tr>
            <tr>
              <td><code>onDragStart</code></td>
              <td><code>(index) =&gt; void</code></td>
              <td>Drag started</td>
            </tr>
            <tr>
              <td><code>onDragEnd</code></td>
              <td><code>() =&gt; void</code></td>
              <td>Drag ended</td>
            </tr>
            <tr>
              <td><code>onDragCanceled</code></td>
              <td><code>(index) =&gt; void</code></td>
              <td>Drag canceled</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="docs-section">
        <h2>Controller Methods</h2>

        <h3>Navigation</h3>
        <CodeBlock
          code={`// Go to specific index
controller.goTo(5);           // instant
controller.goTo(5, true);     // animated, returns Promise

// Navigate to next/previous
controller.next();
controller.prev();`}
        />

        <h3>Lifecycle</h3>
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
        />

        <h3>State Updates</h3>
        <CodeBlock
          code={`// Update configuration
controller.updateConfig({
  count: 20,
  loop: true,
});`}
        />
      </section>

      <section className="docs-section">
        <h2>Controller State</h2>
        <p>
          Access reactive state through <code>controller.state</code>:
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
        />
      </section>

      <section className="docs-section">
        <h2>Range Extractors</h2>
        <p>
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
        />
      </section>

      <section className="docs-section">
        <h2>Signals</h2>
        <p>
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
        />
      </section>
    </div>
  );
}
