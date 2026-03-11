import { CodeBlock } from '../../../components/ui/CodeBlock';
import '../docs.css';

export default function InfiniteExample() {
  return (
    <div className="docs-page">
      <h1 className="docs-title">Infinite List</h1>
      <p className="docs-description">
        Handle thousands of items efficiently with built-in virtualization.
      </p>

      <section className="docs-section">
        <h2>Overview</h2>
        <p>
          reelkit renders only <strong>3 slides to DOM</strong> at any time (current, previous, next).
          This allows smooth scrolling for lists with 10,000+ items.
        </p>
        <ul>
          <li>Only 3 items rendered at any time</li>
          <li>Smooth performance with large datasets</li>
          <li>Memory efficient</li>
          <li>Maintains snap behavior</li>
        </ul>
      </section>

      <section className="docs-section">
        <h2>How It Works</h2>
        <p>
          The <code>itemBuilder</code> function is called only for the slides that need to be rendered.
          The <code>indexInRange</code> parameter tells you the item's position in the visible window (0, 1, or 2).
        </p>
        <CodeBlock
          code={`itemBuilder={(index, indexInRange, size) => {
  // index: actual item index (0 to count-1)
  // indexInRange: position in visible window (0, 1, or 2)
  // size: [width, height] of the container
  return <Slide index={index} />;
}}`}
        />
      </section>

      <section className="docs-section">
        <h2>Code</h2>
        <CodeBlock
          title="InfiniteList.tsx"
          code={`import { useMemo } from 'react';
import { Reel, ReelIndicator } from '@reelkit/react';

// Generate 10,000 items
const generateItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    title: \`Item \${i + 1}\`,
    color: \`hsl(\${(i * 137.5) % 360}, 70%, 50%)\`,
  }));

export default function InfiniteList() {
  const items = useMemo(() => generateItems(10000), []);

  return (
    <div style={{ height: '100vh' }}>
      <Reel
        count={items.length}
        size={[window.innerWidth, window.innerHeight]}
        direction="vertical"
        enableWheel
        itemBuilder={(index, indexInRange) => {
          const item = items[index];
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: item.color,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>
                {item.title}
              </h2>
              <p style={{ opacity: 0.8 }}>
                Index: {index} | Range position: {indexInRange}
              </p>
            </div>
          );
        }}
      >
        <ReelIndicator count={items.length} />
      </Reel>
    </div>
  );
}`}
        />
      </section>

      <section className="docs-section">
        <h2>Performance Tips</h2>
        <ul>
          <li>
            <strong>Memoize items array</strong> - Use <code>useMemo</code> to prevent
            regenerating on every render
          </li>
          <li>
            <strong>Memoize itemBuilder</strong> - Wrap with <code>useCallback</code> if it
            has dependencies
          </li>
          <li>
            <strong>Lazy load content</strong> - Fetch data for items only when they
            enter the visible range
          </li>
          <li>
            <strong>Use placeholder content</strong> - Show skeleton loaders for
            items still loading
          </li>
        </ul>
      </section>
    </div>
  );
}
