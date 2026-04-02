import { Link } from 'react-router-dom';
import { Callout } from '../../components/ui/Callout';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { FeatureCardGrid } from '../../components/ui/FeatureCard';
import { Sandbox } from '../../components/ui/Sandbox';
import { LightboxDemo } from '../../components/demos/LightboxDemo';
import {
  Image,
  Maximize2,
  Keyboard,
  Zap,
  MousePointer,
  X,
  Hash,
  Layers,
} from 'lucide-react';

const fullCode = `import { useState } from 'react';
import { LightboxOverlay, type LightboxItem } from '@reelkit/react-lightbox';
import '@reelkit/react-lightbox/styles.css';

const images: LightboxItem[] = [
  {
    src: 'https://picsum.photos/id/1015/1600/1000',
    title: 'Mountain River',
    description: 'A beautiful mountain river flowing through the forest',
    width: 1600,
    height: 1000,
  },
  {
    src: 'https://picsum.photos/id/1016/1000/1600',
    title: 'Snowy Peaks',
    description: 'Majestic snow-capped mountains reaching for the sky',
    width: 1000,
    height: 1600,
  },
  {
    src: 'https://picsum.photos/id/1018/1600/900',
    title: 'Foggy Forest',
    description: 'Misty morning in the dense forest',
    width: 1600,
    height: 900,
  },
  {
    src: 'https://picsum.photos/id/1019/900/1400',
    title: 'Ocean Waves',
    description: 'Powerful ocean waves crashing against the rocky shore',
    width: 900,
    height: 1400,
  },
  {
    src: 'https://picsum.photos/id/1020/1600/1067',
    title: 'Autumn Path',
    description: 'A winding path through the autumn forest',
    width: 1600,
    height: 1067,
  },
  {
    src: 'https://picsum.photos/id/1022/1600/1067',
    title: 'Coastal Cliffs',
    description: 'Dramatic coastal cliffs overlooking the deep blue sea',
    width: 1600,
    height: 1067,
  },
];

const transitions = ['slide', 'fade', 'zoom-in'] as const;

export default function App() {
  const [index, setIndex] = useState<number | null>(null);
  const [transition, setTransition] = useState<'slide' | 'fade' | 'zoom-in'>('slide');

  return (
    <div style={{ padding: 16, background: '#f8fafc', minHeight: '100vh' }}>
      {/* Transition picker */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {transitions.map((t) => (
          <button
            key={t}
            onClick={() => setTransition(t)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 500,
              background: transition === t ? '#6366f1' : '#e2e8f0',
              color: transition === t ? '#fff' : '#334155',
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            style={{
              position: 'relative', aspectRatio: '4 / 3', borderRadius: 8,
              overflow: 'hidden', border: 'none', padding: 0, cursor: 'pointer',
              background: '#e2e8f0',
            }}
          >
            <img
              src={img.src}
              alt={img.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </button>
        ))}
      </div>
      <LightboxOverlay
        isOpen={index !== null}
        images={images}
        initialIndex={index ?? 0}
        onClose={() => setIndex(null)}
        transition={transition}
      />
    </div>
  );
}`;

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
    type: '(props: ControlsRenderProps) => ReactNode',
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
    description: 'Custom slide rendering. Return null to fall back to default.',
  },
  {
    prop: 'renderLoading',
    type: '(props: { item: LightboxItem; activeIndex: number }) => ReactNode',
    default: '-',
    description:
      'Custom loading indicator, replaces default spinner',
  },
  {
    prop: 'renderError',
    type: '(props: { item: LightboxItem; activeIndex: number }) => ReactNode',
    default: '-',
    description:
      'Custom error indicator, replaces default error icon',
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
    prop: 'enableNavKeys',
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
  {
    prop: 'wheelDebounceMs',
    type: 'number',
    default: '200',
    description: 'Wheel debounce duration (ms)',
  },
  {
    prop: 'transitionDuration',
    type: 'number',
    default: '300',
    description: 'Transition animation duration (ms)',
  },
  {
    prop: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: 'Swipe threshold (0-1)',
  },
];

const keyboardShortcuts = [
  { key: 'ArrowLeft', action: 'Previous image' },
  { key: 'ArrowRight', action: 'Next image' },
  { key: 'Escape', action: 'Close lightbox (or exit fullscreen if active)' },
];

const cssClasses = [
  { class: '.rk-lightbox-container', description: 'Root container' },
  { class: '.rk-lightbox-close', description: 'Close button' },
  { class: '.rk-lightbox-nav', description: 'Navigation arrows (both)' },
  { class: '.rk-lightbox-nav-prev', description: 'Previous arrow' },
  { class: '.rk-lightbox-nav-next', description: 'Next arrow' },
  { class: '.rk-lightbox-counter', description: 'Image counter' },
  {
    class: '.rk-lightbox-controls-left',
    description: 'Top-left controls container',
  },
  { class: '.rk-lightbox-btn', description: 'Control buttons (fullscreen)' },
  { class: '.rk-lightbox-info', description: 'Title/description container' },
  { class: '.rk-lightbox-title', description: 'Image title' },
  { class: '.rk-lightbox-description', description: 'Image description' },
  { class: '.rk-lightbox-swipe-hint', description: 'Mobile swipe hint' },
  { class: '.rk-lightbox-slide', description: 'Slide container' },
  { class: '.rk-lightbox-img', description: 'Image element' },
  {
    class: '.rk-lightbox-video-container',
    description: 'Video slide container (opt-in)',
  },
  {
    class: '.rk-lightbox-video-element',
    description: 'Video element (opt-in)',
  },
  {
    class: '.rk-lightbox-video-poster',
    description: 'Video poster image (opt-in)',
  },
  {
    class: '.rk-lightbox-video-loader',
    description: 'Video loading shimmer (opt-in)',
  },
];

export default function Lightbox() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Lightbox</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          A full-screen image and video gallery lightbox component using{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-lightbox
          </code>
          .
        </p>
      </div>

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FeatureCardGrid
            items={[
              {
                icon: MousePointer,
                label: 'Touch Gestures',
                desc: 'Swipe to navigate',
              },
              {
                icon: X,
                label: 'Swipe to Close',
                desc: 'Swipe up to dismiss',
              },
              {
                icon: Keyboard,
                label: 'Keyboard Nav',
                desc: 'Arrow keys, Escape',
              },
              {
                icon: Maximize2,
                label: 'Fullscreen',
                desc: 'Cross-browser API',
              },
              {
                icon: Image,
                label: 'Transitions',
                desc: 'Slide, fade, zoom-in',
              },
              {
                icon: Zap,
                label: 'Preloading',
                desc: 'Adjacent images prefetched',
              },
              { icon: Hash, label: 'Counter', desc: '"1 / 10" indicator' },
              {
                icon: Layers,
                label: 'Info Overlay',
                desc: 'Title + description',
              },
              {
                icon: Zap,
                label: 'Customizable',
                desc: 'Render props for everything',
              },
            ]}
          />
        </div>
      </section>

      {/* Installation */}
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
        <Callout type="info" title="Icons" className="mt-4">
          The default controls use{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lucide-react
          </code>{' '}
          for icons. If you prefer a different icon library, use{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderControls
          </code>{' '}
          and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderNavigation
          </code>{' '}
          to provide your own.
        </Callout>
      </section>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            LightboxOverlay
          </code>{' '}
          component displays images in fullscreen. Pass an array of{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            LightboxItem
          </code>{' '}
          objects and control visibility with a nullable index.
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
      </section>

      {/* Live Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Live Demo</h2>
        <Sandbox
          code={fullCode}
          title="LightboxPage.tsx"
          height={500}
          stackblitzDeps={{
            '@reelkit/react-lightbox': '0.2.0',
            'lucide-react': '^0.562.0',
          }}
        >
          <LightboxDemo />
        </Sandbox>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Click a thumbnail to open the lightbox. Use arrow keys or swipe to
          navigate.
        </p>
      </section>

      {/* Video Slides (Opt-in) */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Video Slides (Opt-in)</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Video support is fully opt-in and tree-shakeable — image-only usage
          pays zero extra bundle cost. Import{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useVideoSlideRenderer
          </code>{' '}
          and wire its return values into{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            LightboxOverlay
          </code>
          .
        </p>

        <CodeBlock
          code={`import {
  LightboxOverlay,
  useVideoSlideRenderer,
  type LightboxItem,
} from '@reelkit/react-lightbox';
import '@reelkit/react-lightbox/styles.css';

const items: LightboxItem[] = [
  { src: '/photo.jpg', title: 'Photo' },
  {
    src: '/clip.mp4',
    type: 'video',
    poster: '/clip-thumb.jpg',
    title: 'Video Clip',
  },
];

function Gallery() {
  const [index, setIndex] = useState<number | null>(null);
  const isOpen = index !== null;
  const { renderSlide, renderControls } =
    useVideoSlideRenderer(items, isOpen);

  return (
    <>
      {/* thumbnails… */}
      <LightboxOverlay
        isOpen={isOpen}
        images={items}
        initialIndex={index ?? 0}
        onClose={() => setIndex(null)}
        renderSlide={renderSlide}
        renderControls={renderControls}
      />
    </>
  );
}`}
          language="tsx"
        />

        <Callout type="info" title="How it works" className="mt-4">
          <ul className="list-disc ml-4 space-y-1">
            <li>
              Videos autoplay (muted by default) when the slide becomes active
            </li>
            <li>
              A shared video element is reused across slides for iOS sound
              continuity
            </li>
            <li>
              Playback position is persisted when navigating away and restored
              on return
            </li>
            <li>
              Items without{' '}
              <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                type: 'video'
              </code>{' '}
              render as images (backward compatible)
            </li>
          </ul>
        </Callout>
      </section>

      {/* Customization */}
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
  renderControls={({ onClose, activeIndex, count, isFullscreen, onToggleFullscreen }) => (
    <div style={{ position: 'absolute', top: 12, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
      <Counter activeIndex={activeIndex} count={count} />
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

      {/* API Reference */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">API Reference</h2>

        <h3 className="text-xl font-semibold mt-6 mb-4">Props</h3>
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
            to="/docs/react/api"
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

      {/* Types */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Types</h2>

        <h3 className="text-lg font-semibold mb-2">LightboxItem</h3>
        <CodeBlock
          code={`interface LightboxItem {
  src: string;
  type?: 'image' | 'video';  // defaults to 'image'
  poster?: string;            // thumbnail for video items
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

        <h3 className="text-lg font-semibold mt-6 mb-2">ControlsRenderProps</h3>
        <CodeBlock
          code={`interface ControlsRenderProps {
  item: LightboxItem;
  activeIndex: number;
  count: number;
  isFullscreen: boolean;
  onClose: () => void;
  onToggleFullscreen: () => void;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">
          NavigationRenderProps
        </h3>
        <CodeBlock
          code={`interface NavigationRenderProps {
  item: LightboxItem;
  activeIndex: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
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

      {/* Sub-Components */}
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

<Counter activeIndex={activeIndex} count={count} />`}
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

        <h3 className="text-lg font-semibold mt-6 mb-2">SoundButton</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Mute/unmute toggle button for video slides (Volume2/VolumeX icon). Use
          with{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useVideoSlideRenderer
          </code>
          .
        </p>
        <CodeBlock
          code={`import { SoundButton, useVideoSlideRenderer } from '@reelkit/react-lightbox';

// SoundButton is included in renderControls automatically,
// but you can also use it standalone:
const { isMuted, onToggleMute } = useVideoSlideRenderer(items, isOpen);

<SoundButton isMuted={isMuted} onToggle={onToggleMute} />`}
          language="tsx"
        />
      </section>

      {/* Hooks */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Hooks</h2>

        <h3 className="text-lg font-semibold mb-2">useVideoSlideRenderer</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Hook for opt-in video support. Returns{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlide
          </code>{' '}
          and{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderControls
          </code>{' '}
          — pass both directly to LightboxOverlay.
        </p>
        <CodeBlock
          code={`import { useVideoSlideRenderer } from '@reelkit/react-lightbox';

const { renderSlide, renderControls, isMuted, onToggleMute, hasVideo } =
  useVideoSlideRenderer(items, isOpen);

// renderSlide    — pass to LightboxOverlay's renderSlide prop
// renderControls — pass to LightboxOverlay's renderControls prop
//                  (includes Counter, FullscreenButton, SoundButton, CloseButton)
// isMuted        — current mute state (default: true)
// onToggleMute   — toggle mute
// hasVideo       — true if items contain at least one video
// isOpen param   — resets mute to true on close (enables autoplay on reopen)`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">useFullscreen</h3>
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

      {/* Transitions */}
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

      {/* CSS Classes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">CSS Classes</h2>
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
.rk-lightbox-close {
  background: rgba(255, 0, 0, 0.5);
  border-radius: 8px;
}

/* Custom navigation arrows */
.rk-lightbox-nav {
  background: rgba(255, 255, 255, 0.3);
  width: 60px;
  height: 60px;
}

/* Custom counter style */
.rk-lightbox-counter {
  font-size: 16px;
  background: transparent;
}`}
        />
      </section>

      {/* Keyboard Shortcuts */}
      <section>
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
    </div>
  );
}
