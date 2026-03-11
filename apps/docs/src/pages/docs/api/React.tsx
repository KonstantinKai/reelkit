import { CodeBlock } from '../../../components/ui/CodeBlock';
import '../docs.css';

export default function ReactApi() {
  return (
    <div className="docs-page">
      <h1 className="docs-title">React API</h1>
      <p className="docs-description">
        The <code>@reelkit/react</code> package provides React components
        for building sliders.
      </p>

      <section className="docs-section">
        <h2>Reel</h2>
        <p>
          The main container component that handles all slider logic, gestures, and animations.
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
        />

        <h3>Props</h3>
        <table className="api-table">
          <thead>
            <tr>
              <th>Prop</th>
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
              <td><code>size</code></td>
              <td><code>[number, number]</code></td>
              <td>required</td>
              <td>Width and height as [width, height]</td>
            </tr>
            <tr>
              <td><code>itemBuilder</code></td>
              <td><code>(index, indexInRange, size) =&gt; ReactElement</code></td>
              <td>required</td>
              <td>Function to render each slide</td>
            </tr>
            <tr>
              <td><code>direction</code></td>
              <td><code>'vertical' | 'horizontal'</code></td>
              <td><code>'vertical'</code></td>
              <td>Scroll direction</td>
            </tr>
            <tr>
              <td><code>initialIndex</code></td>
              <td><code>number</code></td>
              <td><code>0</code></td>
              <td>Starting index</td>
            </tr>
            <tr>
              <td><code>loop</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>Enable infinite loop</td>
            </tr>
            <tr>
              <td><code>enableWheel</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>Enable mouse wheel navigation</td>
            </tr>
            <tr>
              <td><code>wheelDebounceMs</code></td>
              <td><code>number</code></td>
              <td><code>200</code></td>
              <td>Wheel event debounce in ms</td>
            </tr>
            <tr>
              <td><code>useNavKeys</code></td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
              <td>Enable keyboard navigation</td>
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
            <tr>
              <td><code>apiRef</code></td>
              <td><code>RefObject&lt;ReelApi&gt;</code></td>
              <td>-</td>
              <td>Ref to access API methods</td>
            </tr>
          </tbody>
        </table>

        <h3>Callbacks</h3>
        <table className="api-table">
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>afterChange</code></td>
              <td><code>(index, indexInRange) =&gt; void</code></td>
              <td>Called after slide change completes</td>
            </tr>
            <tr>
              <td><code>beforeChange</code></td>
              <td><code>(index, nextIndex, indexInRange) =&gt; void</code></td>
              <td>Called before slide change starts</td>
            </tr>
            <tr>
              <td><code>onSlideDragStart</code></td>
              <td><code>(index) =&gt; void</code></td>
              <td>Called when drag gesture starts</td>
            </tr>
            <tr>
              <td><code>onSlideDragEnd</code></td>
              <td><code>() =&gt; void</code></td>
              <td>Called when drag gesture ends</td>
            </tr>
            <tr>
              <td><code>onSlideDragCanceled</code></td>
              <td><code>(index) =&gt; void</code></td>
              <td>Called when drag is canceled</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="docs-section">
        <h2>ReelApi</h2>
        <p>
          Access slider methods via <code>apiRef</code>:
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
        />

        <table className="api-table">
          <thead>
            <tr>
              <th>Method</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>next()</code></td>
              <td><code>() =&gt; void</code></td>
              <td>Go to next slide</td>
            </tr>
            <tr>
              <td><code>prev()</code></td>
              <td><code>() =&gt; void</code></td>
              <td>Go to previous slide</td>
            </tr>
            <tr>
              <td><code>goTo(index, animate?)</code></td>
              <td><code>(number, boolean?) =&gt; Promise</code></td>
              <td>Go to specific slide</td>
            </tr>
            <tr>
              <td><code>adjust()</code></td>
              <td><code>() =&gt; void</code></td>
              <td>Recalculate slide positions</td>
            </tr>
            <tr>
              <td><code>observe()</code></td>
              <td><code>() =&gt; void</code></td>
              <td>Start keyboard observation</td>
            </tr>
            <tr>
              <td><code>unobserve()</code></td>
              <td><code>() =&gt; void</code></td>
              <td>Stop keyboard observation</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="docs-section">
        <h2>ReelIndicator</h2>
        <p>
          Instagram-style progress indicators:
        </p>
        <CodeBlock
          code={`import { Reel, ReelIndicator } from '@reelkit/react';

<Reel count={10} size={[400, 600]} itemBuilder={...}>
  <ReelIndicator count={10} />
</Reel>`}
        />

        <table className="api-table">
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>count</code></td>
              <td><code>number</code></td>
              <td>Total number of items</td>
            </tr>
            <tr>
              <td><code>className</code></td>
              <td><code>string</code></td>
              <td>Custom CSS class</td>
            </tr>
            <tr>
              <td><code>style</code></td>
              <td><code>CSSProperties</code></td>
              <td>Custom inline styles</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="docs-section">
        <h2>Full Example</h2>
        <CodeBlock
          code={`import { useRef, useState } from 'react';
import { Reel, ReelIndicator, type ReelApi } from '@reelkit/react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const slides = [
  { id: 1, title: 'Welcome', color: '#6366f1' },
  { id: 2, title: 'Features', color: '#8b5cf6' },
  { id: 3, title: 'Pricing', color: '#ec4899' },
];

export function Slider() {
  const apiRef = useRef<ReelApi>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div style={{ position: 'relative' }}>
      <Reel
        count={slides.length}
        size={[400, 600]}
        direction="vertical"
        enableWheel
        apiRef={apiRef}
        afterChange={(index) => setCurrentIndex(index)}
        itemBuilder={(index) => (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: slides[index].color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2rem',
            }}
          >
            {slides[index].title}
          </div>
        )}
      >
        <ReelIndicator count={slides.length} />
      </Reel>

      {/* Navigation buttons */}
      <div style={{ position: 'absolute', right: 20, top: '50%' }}>
        <button
          onClick={() => apiRef.current?.prev()}
          disabled={currentIndex === 0}
        >
          <ChevronUp />
        </button>
        <button
          onClick={() => apiRef.current?.next()}
          disabled={currentIndex === slides.length - 1}
        >
          <ChevronDown />
        </button>
      </div>
    </div>
  );
}`}
        />
      </section>
    </div>
  );
}
