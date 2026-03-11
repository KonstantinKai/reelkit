import { CodeBlock } from '../../components/ui/CodeBlock';
import './docs.css';

export default function GettingStarted() {
  return (
    <div className="docs-page">
      <h1 className="docs-title">Getting Started</h1>
      <p className="docs-description">
        reelkit is a <strong>single-item slider</strong> — one item visible at a time,
        like TikTok, Instagram Reels, or Stories. Perfect for vertical video feeds,
        fullscreen galleries, and swipeable content.
      </p>

      <section className="docs-section">
        <h2>Installation</h2>
        <p>
          Install reelkit using your preferred package manager:
        </p>
        <CodeBlock
          lang="bash"
          code={`# React components
npm install @reelkit/react

# React Reel Player (Instagram/TikTok style player)
npm install @reelkit/react-reel-player

# Framework-agnostic core (for custom integrations)
npm install @reelkit/core`}
        />
        <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Vue and Svelte bindings are coming soon.
        </p>
      </section>

      <section className="docs-section">
        <h2>Quick Start</h2>
        <p>
          Here's a minimal example to create a vertical slider with React:
        </p>
        <CodeBlock
          title="App.tsx"
          code={`import { Reel, ReelIndicator } from '@reelkit/react';

const items = [
  { id: 1, title: 'Slide 1', color: '#6366f1' },
  { id: 2, title: 'Slide 2', color: '#8b5cf6' },
  { id: 3, title: 'Slide 3', color: '#ec4899' },
];

function App() {
  return (
    <Reel
      count={items.length}
      size={[400, 600]}
      direction="vertical"
      enableWheel
      itemBuilder={(index) => (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: items[index].color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: 'white',
          }}
        >
          {items[index].title}
        </div>
      )}
    >
      <ReelIndicator count={items.length} />
    </Reel>
  );
}`}
        />
      </section>

      <section className="docs-section">
        <h2>Key Concepts</h2>

        <h3>Reel</h3>
        <p>
          The <code>Reel</code> component is the main container that manages slider state,
          handles touch gestures, keyboard navigation, and animations. It uses a render
          prop pattern via <code>itemBuilder</code> for rendering slides.
        </p>

        <h3>itemBuilder</h3>
        <p>
          The <code>itemBuilder</code> prop is a function that receives the index and
          returns the content for each slide. This pattern enables virtualization -
          only visible items are rendered.
        </p>

        <h3>ReelIndicator</h3>
        <p>
          Optional component that displays Instagram-style progress indicators showing
          the current position in the slider.
        </p>

        <CodeBlock
          code={`import { Reel, ReelIndicator } from '@reelkit/react';

function App() {
  return (
    <Reel
      count={items.length}
      size={[400, 600]}
      itemBuilder={(index) => <Slide data={items[index]} />}
    >
      <ReelIndicator count={items.length} />
    </Reel>
  );
}`}
        />
      </section>

      <section className="docs-section">
        <h2>Navigation</h2>
        <p>
          reelkit supports multiple navigation methods out of the box:
        </p>
        <ul>
          <li><strong>Touch/Swipe:</strong> Drag to navigate with momentum and snap</li>
          <li><strong>Keyboard:</strong> Arrow keys, Home, End, Page Up/Down</li>
          <li><strong>Mouse Wheel:</strong> Enable with <code>enableWheel</code> prop</li>
          <li><strong>Programmatic:</strong> Use <code>apiRef</code> for <code>next()</code>, <code>prev()</code>, <code>goTo()</code></li>
        </ul>

        <CodeBlock
          code={`import { useRef } from 'react';
import { Reel, type ReelApi } from '@reelkit/react';

function App() {
  const apiRef = useRef<ReelApi>(null);

  return (
    <>
      <Reel
        count={10}
        size={[400, 600]}
        apiRef={apiRef}
        itemBuilder={(index) => <Slide index={index} />}
      />
      <button onClick={() => apiRef.current?.prev()}>Prev</button>
      <button onClick={() => apiRef.current?.next()}>Next</button>
      <button onClick={() => apiRef.current?.goTo(5)}>Go to 5</button>
    </>
  );
}`}
        />
      </section>

      <section className="docs-section">
        <h2>Next Steps</h2>
        <p>
          Now that you have the basics, explore these topics:
        </p>
        <ul>
          <li>Check out the <a href="/docs/api/react">API Reference</a> for all available props</li>
          <li>Learn about <a href="/docs/examples/infinite">infinite lists</a> with virtualization</li>
          <li>See the <a href="/docs/examples/reel-player">Reel Player</a> example for a complete implementation</li>
        </ul>
      </section>
    </div>
  );
}
