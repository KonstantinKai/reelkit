import { CodeBlock } from '../../../components/ui/CodeBlock';
import '../docs.css';

export default function ReactLightboxApi() {
  return (
    <div className="docs-page">
      <h1 className="docs-title">React Lightbox API</h1>
      <p className="docs-description">
        The <code>@reelkit/react-lightbox</code> package provides a full-screen
        image gallery lightbox component with touch gestures, keyboard navigation,
        and multiple transition effects.
      </p>

      <section className="docs-section">
        <h2>Installation</h2>
        <CodeBlock
          lang="bash"
          code="npm install @reelkit/react-lightbox @reelkit/core @reelkit/react lucide-react"
        />
        <p>
          Don't forget to import the styles:
        </p>
        <CodeBlock
          code={`import '@reelkit/react-lightbox/styles.css';`}
        />
      </section>

      <section className="docs-section">
        <h2>LightboxOverlay</h2>
        <p>
          The main component that renders a full-screen image lightbox with navigation,
          fullscreen support, and swipe-to-close on mobile.
        </p>
        <CodeBlock
          code={`import { useState } from 'react';
import { LightboxOverlay, type LightboxItem } from '@reelkit/react-lightbox';
import '@reelkit/react-lightbox/styles.css';

const images: LightboxItem[] = [
  {
    src: 'https://example.com/image1.jpg',
    title: 'Sunset',
    description: 'Beautiful sunset over the ocean',
  },
  {
    src: 'https://example.com/image2.jpg',
    title: 'Mountains',
  },
];

function App() {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      {images.map((img, i) => (
        <img
          key={i}
          src={img.src}
          onClick={() => setIndex(i)}
        />
      ))}
      <LightboxOverlay
        isOpen={index !== null}
        images={images}
        initialIndex={index ?? 0}
        onClose={() => setIndex(null)}
      />
    </>
  );
}`}
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
              <td><code>isOpen</code></td>
              <td><code>boolean</code></td>
              <td>required</td>
              <td>Controls lightbox visibility</td>
            </tr>
            <tr>
              <td><code>images</code></td>
              <td><code>LightboxItem[]</code></td>
              <td>required</td>
              <td>Array of images to display</td>
            </tr>
            <tr>
              <td><code>initialIndex</code></td>
              <td><code>number</code></td>
              <td><code>0</code></td>
              <td>Starting image index</td>
            </tr>
            <tr>
              <td><code>onClose</code></td>
              <td><code>() =&gt; void</code></td>
              <td>required</td>
              <td>Called when lightbox closes</td>
            </tr>
            <tr>
              <td><code>transition</code></td>
              <td><code>TransitionType</code></td>
              <td><code>'slide'</code></td>
              <td>Transition animation type</td>
            </tr>
            <tr>
              <td><code>onSlideChange</code></td>
              <td><code>(index: number) =&gt; void</code></td>
              <td>-</td>
              <td>Callback after slide change</td>
            </tr>
            <tr>
              <td><code>apiRef</code></td>
              <td><code>MutableRefObject&lt;ReelApi&gt;</code></td>
              <td>-</td>
              <td>Ref to access Reel API</td>
            </tr>
            <tr>
              <td><code>loop</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>Enable infinite loop</td>
            </tr>
            <tr>
              <td><code>useNavKeys</code></td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
              <td>Enable keyboard navigation</td>
            </tr>
            <tr>
              <td><code>enableWheel</code></td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
              <td>Enable mouse wheel navigation</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="docs-section">
        <h2>Types</h2>

        <h3>LightboxItem</h3>
        <CodeBlock
          code={`interface LightboxItem {
  src: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
}`}
        />

        <h3>TransitionType</h3>
        <CodeBlock code={`type TransitionType = 'slide' | 'fade' | 'zoom-in';`} />
      </section>

      <section className="docs-section">
        <h2>Hooks</h2>
        <p>
          For custom implementations, the package exports utility hooks:
        </p>

        <h3>useFullscreen</h3>
        <p>
          Hook for managing fullscreen state with cross-browser support.
        </p>
        <CodeBlock
          code={`import { useRef } from 'react';
import { useFullscreen } from '@reelkit/react-lightbox';

function CustomLightbox() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, requestFullscreen, exitFullscreen] = useFullscreen({
    ref: containerRef,
  });

  return (
    <div ref={containerRef}>
      <button onClick={isFullscreen ? exitFullscreen : requestFullscreen}>
        {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      </button>
    </div>
  );
}`}
        />
      </section>

      <section className="docs-section">
        <h2>Transitions</h2>
        <p>
          Choose from three built-in transition effects:
        </p>
        <table className="api-table">
          <thead>
            <tr>
              <th>Transition</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>'slide'</code></td>
              <td>Standard horizontal slide (default)</td>
            </tr>
            <tr>
              <td><code>'fade'</code></td>
              <td>Crossfade between images</td>
            </tr>
            <tr>
              <td><code>'zoom-in'</code></td>
              <td>Zoom in from smaller to normal size</td>
            </tr>
          </tbody>
        </table>
        <CodeBlock
          code={`<LightboxOverlay
  isOpen={isOpen}
  images={images}
  initialIndex={0}
  onClose={handleClose}
  transition="fade"
/>`}
        />
      </section>

      <section className="docs-section">
        <h2>Features</h2>
        <ul>
          <li><strong>Touch gestures</strong>: Swipe left/right to navigate, swipe up to close (mobile)</li>
          <li><strong>Keyboard navigation</strong>: Arrow keys to navigate, Escape to close</li>
          <li><strong>Mouse wheel</strong>: Scroll to navigate between images</li>
          <li><strong>Fullscreen support</strong>: Enter fullscreen mode with cross-browser support</li>
          <li><strong>Image preloading</strong>: Automatically preloads adjacent images</li>
          <li><strong>Responsive</strong>: Adapts to screen size and orientation</li>
          <li><strong>Body scroll lock</strong>: Prevents background scrolling when open</li>
        </ul>
      </section>

      <section className="docs-section">
        <h2>Keyboard Shortcuts</h2>
        <table className="api-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>ArrowLeft</code></td>
              <td>Previous image</td>
            </tr>
            <tr>
              <td><code>ArrowRight</code></td>
              <td>Next image</td>
            </tr>
            <tr>
              <td><code>Escape</code></td>
              <td>Close lightbox (or exit fullscreen if active)</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="docs-section">
        <h2>CSS Customization</h2>
        <p>
          All UI elements use CSS classes that can be overridden for custom styling.
        </p>
        <table className="api-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>.lightbox-container</code></td>
              <td>Root container</td>
            </tr>
            <tr>
              <td><code>.lightbox-close</code></td>
              <td>Close button</td>
            </tr>
            <tr>
              <td><code>.lightbox-nav</code></td>
              <td>Navigation arrows (both)</td>
            </tr>
            <tr>
              <td><code>.lightbox-nav-prev</code></td>
              <td>Previous arrow</td>
            </tr>
            <tr>
              <td><code>.lightbox-nav-next</code></td>
              <td>Next arrow</td>
            </tr>
            <tr>
              <td><code>.lightbox-counter</code></td>
              <td>Image counter</td>
            </tr>
            <tr>
              <td><code>.lightbox-controls-left</code></td>
              <td>Top-left controls container</td>
            </tr>
            <tr>
              <td><code>.lightbox-btn</code></td>
              <td>Control buttons (fullscreen)</td>
            </tr>
            <tr>
              <td><code>.lightbox-info</code></td>
              <td>Title/description container</td>
            </tr>
            <tr>
              <td><code>.lightbox-title</code></td>
              <td>Image title</td>
            </tr>
            <tr>
              <td><code>.lightbox-description</code></td>
              <td>Image description</td>
            </tr>
            <tr>
              <td><code>.lightbox-swipe-hint</code></td>
              <td>Mobile swipe hint</td>
            </tr>
            <tr>
              <td><code>.lightbox-slide</code></td>
              <td>Slide container</td>
            </tr>
            <tr>
              <td><code>.lightbox-img</code></td>
              <td>Image element</td>
            </tr>
          </tbody>
        </table>
        <h3>Example</h3>
        <CodeBlock
          lang="css"
          code={`/* Custom close button */
.lightbox-close {
  background: rgba(255, 0, 0, 0.5);
  border-radius: 8px;
}

/* Custom navigation arrows */
.lightbox-nav {
  background: rgba(255, 255, 255, 0.3);
  width: 60px;
  height: 60px;
}

/* Custom counter style */
.lightbox-counter {
  font-size: 16px;
  background: transparent;
}`}
        />
      </section>
    </div>
  );
}
