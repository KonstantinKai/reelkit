import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../components/ui/CodeBlock';

const lightboxProps = [
  {
    prop: 'isOpen',
    type: 'boolean',
    default: 'required',
    description: 'Controls lightbox visibility',
  },
  {
    prop: 'images',
    type: 'LightboxItem[]',
    default: 'required',
    description: 'Array of images to display',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: 'Starting image index',
  },
  {
    prop: 'transition',
    type: 'TransitionType',
    default: "'slide'",
    description: 'Transition animation type',
  },
  {
    prop: 'apiRef',
    type: 'MutableRefObject<ReelApi>',
    default: '-',
    description: 'Ref to access Reel API',
  },
  {
    prop: 'renderControls',
    type: '(props: LightboxControlsRenderProps) => ReactNode',
    default: '-',
    description:
      'Custom controls, replaces default close button, counter, and fullscreen toggle',
  },
  {
    prop: 'renderNavigation',
    type: '(props: NavigationRenderProps) => ReactNode',
    default: '-',
    description: 'Custom navigation, replaces default prev/next arrows',
  },
  {
    prop: 'renderInfo',
    type: '(props: InfoRenderProps) => ReactNode',
    default: '-',
    description:
      'Custom info overlay, replaces default title + description gradient. Return null to hide.',
  },
  {
    prop: 'renderSlide',
    type: '(item, index, size, isActive) => ReactNode | null',
    default: '-',
    description: 'Custom slide rendering. Return null to fall back to default',
  },
];

const lightboxCallbacks = [
  {
    prop: 'onClose',
    type: '() => void',
    description: 'Called when lightbox closes',
  },
  {
    prop: 'onSlideChange',
    type: '(index: number) => void',
    description: 'Called after slide change',
  },
];

const reelProps = [
  {
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description: 'Enable infinite loop',
  },
  {
    prop: 'useNavKeys',
    type: 'boolean',
    default: 'true',
    description: 'Enable keyboard navigation',
  },
  {
    prop: 'enableWheel',
    type: 'boolean',
    default: 'true',
    description: 'Enable mouse wheel navigation',
  },
];

const keyboardShortcuts = [
  { key: 'ArrowLeft', action: 'Previous image' },
  { key: 'ArrowRight', action: 'Next image' },
  { key: 'Escape', action: 'Close lightbox (or exit fullscreen if active)' },
];

const cssClasses = [
  { class: '.lightbox-container', description: 'Root container' },
  { class: '.lightbox-close', description: 'Close button' },
  { class: '.lightbox-nav', description: 'Navigation arrows (both)' },
  { class: '.lightbox-nav-prev', description: 'Previous arrow' },
  { class: '.lightbox-nav-next', description: 'Next arrow' },
  { class: '.lightbox-counter', description: 'Image counter' },
  {
    class: '.lightbox-controls-left',
    description: 'Top-left controls container',
  },
  { class: '.lightbox-btn', description: 'Control buttons (fullscreen)' },
  { class: '.lightbox-info', description: 'Title/description container' },
  { class: '.lightbox-title', description: 'Image title' },
  { class: '.lightbox-description', description: 'Image description' },
  { class: '.lightbox-swipe-hint', description: 'Mobile swipe hint' },
  { class: '.lightbox-slide', description: 'Slide container' },
  { class: '.lightbox-img', description: 'Image element' },
];

export default function ReactLightboxApi() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">React Lightbox API</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-lightbox
          </code>{' '}
          package provides a full-screen image gallery lightbox component with
          touch gestures, keyboard navigation, and multiple transition effects.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          code="npm install @reelkit/react-lightbox @reelkit/react lucide-react"
          language="bash"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          Don't forget to import the styles:
        </p>
        <CodeBlock
          code={`import '@reelkit/react-lightbox/styles.css';`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">LightboxOverlay</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The main component that renders a full-screen image lightbox with
          navigation, fullscreen support, and swipe-to-close on mobile.
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
              {lightboxProps.map((p) => (
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
              {lightboxCallbacks.map((p) => (
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

        <h3 className="text-xl font-semibold mt-8 mb-4">
          Reel Props (proxied)
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          These props are forwarded to the underlying{' '}
          <Link
            to="/docs/api/react"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            Reel
          </Link>{' '}
          component.
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
        <h2 className="text-2xl font-bold mb-4">Types</h2>

        <h3 className="text-lg font-semibold mb-2">LightboxItem</h3>
        <CodeBlock
          code={`interface LightboxItem {
  src: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">TransitionType</h3>
        <CodeBlock
          code={`type TransitionType = 'slide' | 'fade' | 'zoom-in';`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">
          LightboxControlsRenderProps
        </h3>
        <CodeBlock
          code={`interface LightboxControlsRenderProps {
  onClose: () => void;
  currentIndex: number;
  count: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">
          NavigationRenderProps
        </h3>
        <CodeBlock
          code={`interface NavigationRenderProps {
  onPrev: () => void;
  onNext: () => void;
  activeIndex: number;
  count: number;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">InfoRenderProps</h3>
        <CodeBlock
          code={`interface InfoRenderProps {
  item: LightboxItem;
  index: number;
}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Sub-Components</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Reusable sub-components for composing custom controls via{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderControls
          </code>
          .
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-2">CloseButton</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Default X close button.
        </p>
        <CodeBlock
          code={`import { CloseButton } from '@reelkit/react-lightbox';

<CloseButton onClick={onClose} />`}
          language="tsx"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">Counter</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Image counter pill showing "1 / 3".
        </p>
        <CodeBlock
          code={`import { Counter } from '@reelkit/react-lightbox';

<Counter currentIndex={currentIndex} count={count} />`}
          language="tsx"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">FullscreenButton</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Fullscreen toggle button (Maximize/Minimize icon).
        </p>
        <CodeBlock
          code={`import { FullscreenButton } from '@reelkit/react-lightbox';

<FullscreenButton isFullscreen={isFullscreen} onToggle={onToggleFullscreen} />`}
          language="tsx"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Customization</h2>

        <h3 className="text-xl font-semibold mt-4 mb-4">Custom Controls</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderControls
          </code>{' '}
          to replace the default close button, counter, and fullscreen toggle.
          Compose with the exported sub-components:
        </p>
        <CodeBlock
          code={`import {
  LightboxOverlay,
  CloseButton,
  Counter,
  FullscreenButton,
} from '@reelkit/react-lightbox';

<LightboxOverlay
  isOpen={isOpen}
  images={images}
  onClose={handleClose}
  renderControls={({ onClose, currentIndex, count, isFullscreen, onToggleFullscreen }) => (
    <div style={{ position: 'absolute', top: 12, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
      <Counter currentIndex={currentIndex} count={count} />
      <div>
        <FullscreenButton isFullscreen={isFullscreen} onToggle={onToggleFullscreen} />
        <CloseButton onClick={onClose} />
      </div>
    </div>
  )}
/>`}
          language="tsx"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">Custom Info Overlay</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderInfo
          </code>{' '}
          to replace the default title/description gradient, or pass{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'renderInfo={() => null}'}
          </code>{' '}
          to hide it entirely:
        </p>
        <CodeBlock
          code={`<LightboxOverlay
  isOpen={isOpen}
  images={images}
  onClose={handleClose}
  renderInfo={({ item, index }) => (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: '#fff', zIndex: 10 }}>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  )}
/>`}
          language="tsx"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">Custom Navigation</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderNavigation
          </code>{' '}
          to replace the default prev/next arrows:
        </p>
        <CodeBlock
          code={`<LightboxOverlay
  isOpen={isOpen}
  images={images}
  onClose={handleClose}
  renderNavigation={({ onPrev, onNext, activeIndex, count }) => (
    <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 12, zIndex: 10 }}>
      <button onClick={onPrev} disabled={activeIndex === 0}>Prev</button>
      <span>{activeIndex + 1} / {count}</span>
      <button onClick={onNext} disabled={activeIndex === count - 1}>Next</button>
    </div>
  )}
/>`}
          language="tsx"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">Custom Slide</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlide
          </code>{' '}
          for fully custom slide content. Return{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            null
          </code>{' '}
          to fall back to the default image slide:
        </p>
        <CodeBlock
          code={`<LightboxOverlay
  isOpen={isOpen}
  images={images}
  onClose={handleClose}
  renderSlide={(item, index, size, isActive) => {
    // Custom CTA on last slide
    if (index === images.length - 1) {
      return (
        <div style={{ width: size[0], height: size[1], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <h2>View all photos</h2>
        </div>
      );
    }
    return null; // default image slide
  }}
/>`}
          language="tsx"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Hooks</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For custom implementations, the package exports utility hooks:
        </p>

        <h3 className="text-lg font-semibold mb-2">useFullscreen</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
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
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Transitions</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Choose from three built-in transition effects:
        </p>

        <div className="overflow-x-auto mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">
                  Transition
                </th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600">
                  'slide'
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  Standard horizontal slide (default)
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600">
                  'fade'
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  Crossfade between images
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600">
                  'zoom-in'
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  Zoom in from smaller to normal size
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock
          code={`<LightboxOverlay
  isOpen={isOpen}
  images={images}
  initialIndex={0}
  onClose={handleClose}
  transition="fade"
/>`}
          language="tsx"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">CSS Customization</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          All UI elements use CSS classes that can be overridden for custom
          styling.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Class</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {cssClasses.map((c) => (
                <tr
                  key={c.class}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {c.class}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {c.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <CodeBlock
          language="css"
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

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Keyboard Shortcuts</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Key</th>
                <th className="text-left py-3 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {keyboardShortcuts.map((s) => (
                <tr
                  key={s.key}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {s.key}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {s.action}
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
              to="/docs/examples/lightbox"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Lightbox
            </Link>
            <span className="text-slate-500">
              {' '}
              — live demo with transition effects
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
