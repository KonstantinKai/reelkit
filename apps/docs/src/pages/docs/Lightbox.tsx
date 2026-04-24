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
  Volume2,
  Loader,
  AlertTriangle,
} from 'lucide-react';
import { Heading } from '../../components/ui/Heading';

const fullCode = `import { useState } from 'react';
import { LightboxOverlay, type LightboxItem } from '@reelkit/react-lightbox';
import '@reelkit/react-lightbox/styles.css';

const images: LightboxItem[] = [
  {
    src: '/cdn/samples/images/image-01.jpg',
    title: 'Mountain River',
    description: 'A beautiful mountain river flowing through the forest',
    width: 1600,
    height: 1000,
  },
  {
    src: '/cdn/samples/images/image-02.jpg',
    title: 'Snowy Peaks',
    description: 'Majestic snow-capped mountains reaching for the sky',
    width: 1000,
    height: 1600,
  },
  {
    src: '/cdn/samples/images/image-03.jpg',
    title: 'Foggy Forest',
    description: 'Misty morning in the dense forest',
    width: 1600,
    height: 900,
  },
  {
    src: '/cdn/samples/images/image-04.jpg',
    title: 'Ocean Waves',
    description: 'Powerful ocean waves crashing against the rocky shore',
    width: 900,
    height: 1400,
  },
  {
    src: '/cdn/samples/images/image-05.jpg',
    title: 'Autumn Path',
    description: 'A winding path through the autumn forest',
    width: 1600,
    height: 1067,
  },
  {
    src: '/cdn/samples/images/image-06.jpg',
    title: 'Coastal Cliffs',
    description: 'Dramatic coastal cliffs overlooking the deep blue sea',
    width: 1600,
    height: 1067,
  },
];

const transitions = ['slide', 'fade', 'flip', 'zoom-in'] as const;

export default function App() {
  const [index, setIndex] = useState<number | null>(null);
  const [transition, setTransition] = useState<'slide' | 'fade' | 'flip' | 'zoom-in'>('slide');

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
    prop: 'ariaLabel',
    type: 'string',
    default: "'Image gallery'",
    description:
      'Accessible label for the dialog region; announced by screen readers when the lightbox opens',
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
    prop: 'transitionFn',
    type: 'TransitionTransformFn',
    default: '-',
    description:
      'Custom transition function. Takes priority over the transition alias.',
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
    type: '(props: SlideRenderProps) => ReactNode | null',
    default: '-',
    description:
      'Custom slide rendering. Receives { item, index, size, isActive, onReady, onWaiting, onError }. Return null to fall back to default.',
  },
  {
    prop: 'renderLoading',
    type: '(props: { item: LightboxItem; activeIndex: number }) => ReactNode',
    default: '-',
    description: 'Custom loading indicator, replaces default spinner',
  },
  {
    prop: 'renderError',
    type: '(props: { item: LightboxItem; activeIndex: number }) => ReactNode',
    default: '-',
    description: 'Custom error indicator, replaces default error icon',
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
  {
    prop: 'swipeToCloseDirection',
    type: "'up' | 'down'",
    default: "'up'",
    description: 'Direction of the swipe-to-close gesture on mobile',
  },
];

const keyboardShortcuts = [
  { key: 'ArrowLeft', action: 'Previous image' },
  { key: 'ArrowRight', action: 'Next image' },
  { key: 'Escape', action: 'Close lightbox (or exit fullscreen if active)' },
];

const cssClasses = [
  // Overlay
  {
    className: '.rk-lightbox-overlay',
    component: 'Overlay',
    description: 'Root container (full-screen backdrop)',
  },
  {
    className: '.rk-lightbox-spinner',
    component: 'Overlay',
    description: 'Default loading spinner',
  },
  {
    className: '.rk-lightbox-img-error',
    component: 'Overlay',
    description: 'Error state container (broken image/video)',
  },
  {
    className: '.rk-lightbox-img-error-text',
    component: 'Overlay',
    description: 'Error state text label',
  },
  {
    className: '.rk-lightbox-swipe-hint',
    component: 'Overlay',
    description: 'Mobile swipe hint',
  },

  // Controls
  {
    className: '.rk-lightbox-controls-left',
    component: 'Controls',
    description: 'Top-left controls container',
  },
  {
    className: '.rk-lightbox-btn',
    component: 'Controls',
    description: 'Control buttons (fullscreen, etc.)',
  },
  {
    className: '.rk-lightbox-close',
    component: 'Controls',
    description: 'Close button',
  },
  {
    className: '.rk-lightbox-counter',
    component: 'Controls',
    description: 'Image counter chip',
  },

  // Navigation
  {
    className: '.rk-lightbox-nav',
    component: 'Navigation',
    description: 'Navigation arrows (both)',
  },
  {
    className: '.rk-lightbox-nav-prev',
    component: 'Navigation',
    description: 'Previous arrow',
  },
  {
    className: '.rk-lightbox-nav-next',
    component: 'Navigation',
    description: 'Next arrow',
  },

  // Info
  {
    className: '.rk-lightbox-info',
    component: 'Info',
    description: 'Title/description container',
  },
  {
    className: '.rk-lightbox-title',
    component: 'Info',
    description: 'Image title',
  },
  {
    className: '.rk-lightbox-description',
    component: 'Info',
    description: 'Image description',
  },

  // Slide
  {
    className: '.rk-lightbox-slide',
    component: 'Slide',
    description: 'Slide container',
  },
  {
    className: '.rk-lightbox-img',
    component: 'Slide',
    description: 'Image element',
  },

  // VideoSlide
  {
    className: '.rk-lightbox-video-container',
    component: 'VideoSlide',
    description: 'Video slide container (opt-in)',
  },
  {
    className: '.rk-lightbox-video-element',
    component: 'VideoSlide',
    description: 'Video element (opt-in)',
  },
  {
    className: '.rk-lightbox-video-poster',
    component: 'VideoSlide',
    description: 'Video poster image (opt-in)',
  },
];

const themeTokens = [
  // Overlay
  {
    token: '--rk-lightbox-overlay-bg',
    default: '#000',
    controls: 'Full-screen backdrop color',
  },
  {
    token: '--rk-lightbox-overlay-z',
    default: '9999',
    controls: 'Overlay z-index',
  },

  // Top shade
  {
    token: '--rk-lightbox-top-shade-height',
    default: '80px',
    controls: 'Top gradient scrim height',
  },
  {
    token: '--rk-lightbox-top-shade-bg',
    default: 'linear-gradient(rgba(0,0,0,0.6), transparent)',
    controls: 'Top gradient scrim color',
  },

  // Layout
  {
    token: '--rk-lightbox-edge-padding',
    default: '16px',
    controls: 'Edge inset for close / nav / top-left controls',
  },
  {
    token: '--rk-lightbox-controls-gap',
    default: '12px',
    controls: 'Gap between top-left controls',
  },
  {
    token: '--rk-lightbox-transition',
    default: '0.2s',
    controls: 'Button hover transition duration',
  },
  {
    token: '--rk-lightbox-blur',
    default: '8px',
    controls: 'Backdrop blur radius for buttons / chips',
  },

  // Shared button colors
  {
    token: '--rk-lightbox-btn-bg',
    default: 'rgba(0, 0, 0, 0.5)',
    controls: 'Default background for close, nav, small buttons',
  },
  {
    token: '--rk-lightbox-btn-bg-hover',
    default: 'rgba(255, 255, 255, 0.2)',
    controls: 'Hover background for close, nav, small buttons',
  },
  {
    token: '--rk-lightbox-btn-fg',
    default: '#fff',
    controls: 'Icon color for close, nav, small buttons',
  },

  // Button sizes
  {
    token: '--rk-lightbox-btn-size',
    default: '36px',
    controls: 'Small button size (fullscreen toggle, etc.)',
  },
  {
    token: '--rk-lightbox-close-size',
    default: '40px',
    controls: 'Close button size',
  },
  {
    token: '--rk-lightbox-nav-size',
    default: '48px',
    controls: 'Prev/next arrow size',
  },
  {
    token: '--rk-lightbox-nav-opacity',
    default: '0.7',
    controls: 'Idle opacity of prev/next arrows',
  },

  // Counter
  {
    token: '--rk-lightbox-counter-fg',
    default: '#fff',
    controls: 'Counter text color',
  },
  {
    token: '--rk-lightbox-counter-bg',
    default: 'rgba(0, 0, 0, 0.5)',
    controls: 'Counter chip background',
  },
  {
    token: '--rk-lightbox-counter-size',
    default: '14px',
    controls: 'Counter font size',
  },
  {
    token: '--rk-lightbox-counter-padding',
    default: '6px 12px',
    controls: 'Counter chip padding',
  },
  {
    token: '--rk-lightbox-counter-radius',
    default: '20px',
    controls: 'Counter chip border-radius',
  },

  // Spinner
  {
    token: '--rk-lightbox-spinner-size',
    default: '28px',
    controls: 'Default spinner width/height',
  },
  {
    token: '--rk-lightbox-spinner-track',
    default: 'rgba(255, 255, 255, 0.2)',
    controls: 'Spinner track color',
  },
  {
    token: '--rk-lightbox-spinner-fg',
    default: '#fff',
    controls: 'Spinner indicator color',
  },
  {
    token: '--rk-lightbox-spinner-duration',
    default: '0.8s',
    controls: 'Spinner rotation duration',
  },

  // Error
  {
    token: '--rk-lightbox-error-fg',
    default: 'rgba(255, 255, 255, 0.4)',
    controls: 'Error icon + text color',
  },
  {
    token: '--rk-lightbox-error-text-size',
    default: '13px',
    controls: 'Error message font size',
  },

  // Info (bottom caption)
  {
    token: '--rk-lightbox-info-bg',
    default: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
    controls: 'Caption scrim gradient',
  },
  {
    token: '--rk-lightbox-info-padding',
    default: '24px',
    controls: 'Caption inner padding',
  },
  {
    token: '--rk-lightbox-title-size',
    default: '18px',
    controls: 'Title font size',
  },
  {
    token: '--rk-lightbox-description-size',
    default: '14px',
    controls: 'Description font size',
  },
  {
    token: '--rk-lightbox-info-fg',
    default: '#fff',
    controls: 'Caption text color',
  },

  // Swipe hint (mobile)
  {
    token: '--rk-lightbox-hint-fg',
    default: 'rgba(255, 255, 255, 0.5)',
    controls: 'Swipe hint text color',
  },
  {
    token: '--rk-lightbox-hint-bg',
    default: 'rgba(0, 0, 0, 0.3)',
    controls: 'Swipe hint chip background',
  },
  {
    token: '--rk-lightbox-hint-duration',
    default: '3s',
    controls: 'Swipe hint fade-in/out total duration',
  },

  // Video slide (opt-in)
  {
    token: '--rk-lightbox-video-bg',
    default: '#000',
    controls: 'Letterbox background behind <video>',
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
        <a
          href="https://react-demo.reelkit.dev/image-preview?utm_source=docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          View live demo &rarr;
        </a>
      </div>

      {/* Features */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Features
        </Heading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FeatureCardGrid
            items={[
              {
                icon: Image,
                label: 'Images & Video',
                desc: 'Built-in video slide support',
              },
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
                desc: 'Arrow keys + Escape',
              },
              {
                icon: Maximize2,
                label: 'Fullscreen',
                desc: 'Cross-browser API',
              },
              {
                icon: Hash,
                label: 'Transitions',
                desc: 'Slide, fade, flip, zoom-in',
              },
              {
                icon: Zap,
                label: 'Preloading',
                desc: 'Adjacent images prefetched',
              },
              {
                icon: Volume2,
                label: 'Sound Toggle',
                desc: 'Per-slide mute/unmute',
              },
              {
                icon: Loader,
                label: 'Loading States',
                desc: 'Spinner + custom render',
              },
              {
                icon: AlertTriangle,
                label: 'Error Handling',
                desc: 'Error icon + custom render',
              },
              {
                icon: Layers,
                label: 'Render Props',
                desc: '6 customizable render zones',
              },
              {
                icon: Layers,
                label: 'Hooks',
                desc: 'useVideoSlideRenderer + useFullscreen',
              },
            ]}
          />
        </div>
      </section>

      {/* Installation */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Installation
        </Heading>
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
        <Heading level={2} className="text-2xl font-bold mb-4">
          Quick Start
        </Heading>
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
        <Heading level={2} className="text-2xl font-bold mb-4">
          Live Demo
        </Heading>
        <Sandbox
          code={fullCode}
          title="LightboxPage.tsx"
          height={500}
          stackblitzDeps={['@reelkit/react-lightbox']}
          stackblitzExtraDeps={{ 'lucide-react': '^0.562.0' }}
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
        <Heading level={2} className="text-2xl font-bold mb-4">
          Video Slides (Opt-in)
        </Heading>
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
          . The hook handles loading states, sound management, and video
          lifecycle automatically.
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
  const { renderSlide, renderControls, SoundProvider } =
    useVideoSlideRenderer(items, isOpen);

  return (
    <SoundProvider>
      {/* thumbnails… */}
      <LightboxOverlay
        isOpen={isOpen}
        images={items}
        initialIndex={index ?? 0}
        onClose={() => setIndex(null)}
        renderSlide={renderSlide}
        renderControls={renderControls}
      />
    </SoundProvider>
  );
}`}
          language="tsx"
        />

        <Callout type="info" title="How it works" className="mt-4">
          <ul className="list-disc ml-4 space-y-1">
            <li>
              The hook returns{' '}
              <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                SoundProvider
              </code>{' '}
              — wrap your overlay in it for mute/unmute to work
            </li>
            <li>
              Videos autoplay (muted by default) when the slide becomes active
            </li>
            <li>
              A shared video element is reused across slides for iOS sound
              continuity
            </li>
            <li>
              Sound button appears automatically on video slides with a reactive
              mute toggle
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
        <Heading level={2} className="text-2xl font-bold mb-4">
          Customization
        </Heading>

        <Heading level={3} className="text-xl font-semibold mt-4 mb-4">
          Custom Controls
        </Heading>
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
      <Counter currentIndex={activeIndex} count={count} />
      <div>
        <FullscreenButton isFullscreen={isFullscreen} onToggle={onToggleFullscreen} />
        <CloseButton onClick={onClose} />
      </div>
    </div>
  )}
/>`}
          language="tsx"
        />

        <Heading level={3} className="text-xl font-semibold mt-8 mb-4">
          Custom Info Overlay
        </Heading>
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

        <Heading level={3} className="text-xl font-semibold mt-8 mb-4">
          Custom Navigation
        </Heading>
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

        <Heading level={3} className="text-xl font-semibold mt-8 mb-4">
          Custom Slide
        </Heading>
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
  renderSlide={({ item, index, size, isActive, onReady, onError }) => {
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

      {/* Content Loading & Error Handling */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Content Loading & Error Handling
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The lightbox tracks per-slide loading and error states. A spinner
          shows while content loads; a broken-image icon shows for failed media.
          Errored URLs are cached so revisiting shows the error instantly
          without retrying.
        </p>

        <Heading level={3} className="text-xl font-semibold mt-6 mb-4">
          Lifecycle Callbacks
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When using{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderSlide
          </code>
          , call these callbacks to control the loading indicator:
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Callback</th>
                <th className="text-left py-3 px-4 font-semibold">
                  When to call
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onReady
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Image loaded or video started playing. Clears loading and
                  error states.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onWaiting
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Video is buffering mid-playback. Shows the loading indicator.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onError
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Content failed to load. Shows error overlay and caches the URL
                  as broken.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock
          code={`// Inside renderSlide — wire callbacks to your custom media
renderSlide={({ item, index, size, isActive, onReady, onWaiting, onError }) => (
  <div style={{ width: size[0], height: size[1] }}>
    {item.type === 'video' ? (
      <video
        src={item.src}
        poster={item.poster}
        autoPlay={isActive}
        onCanPlay={onReady}
        onWaiting={onWaiting}
        onError={onError}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    ) : (
      <img
        src={item.src}
        onLoad={onReady}
        onError={onError}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    )}
  </div>
)}`}
          language="tsx"
        />

        <Heading level={3} className="text-xl font-semibold mt-8 mb-4">
          Custom Loading & Error UI
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Replace the default spinner and error icon with custom components:
        </p>

        <CodeBlock
          code={`<LightboxOverlay
  isOpen={isOpen}
  images={images}
  onClose={() => setIsOpen(false)}
  renderLoading={({ item, activeIndex }) => (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: 14,
    }}>
      Loading image {activeIndex + 1}...
    </div>
  )}
  renderError={({ item, activeIndex }) => (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 12, color: 'rgba(255,255,255,0.5)',
    }}>
      <span style={{ fontSize: 48 }}>!</span>
      <span>Failed to load content</span>
    </div>
  )}
/>`}
          language="tsx"
        />
      </section>

      {/* API Reference */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          API Reference
        </Heading>

        <Heading level={3} className="text-xl font-semibold mt-6 mb-4">
          Props
        </Heading>
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

        <Heading level={3} className="text-xl font-semibold mt-8 mb-4">
          Callbacks
        </Heading>
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

        <Heading level={3} className="text-xl font-semibold mt-8 mb-4">
          Reel Props (proxied)
        </Heading>
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
        <Heading level={2} className="text-2xl font-bold mb-4">
          Types
        </Heading>

        <Heading level={3} className="text-lg font-semibold mb-2">
          LightboxItem
        </Heading>
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

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          TransitionType
        </Heading>
        <CodeBlock
          code={`type TransitionType = 'slide' | 'fade' | 'flip' | 'zoom-in';`}
          language="typescript"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          ControlsRenderProps
        </Heading>
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

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          NavigationRenderProps
        </Heading>
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

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          SlideRenderProps
        </Heading>
        <CodeBlock
          code={`interface SlideRenderProps {
  item: LightboxItem;
  index: number;
  size: [number, number];
  isActive: boolean;
  onReady: () => void;
  onWaiting: () => void;
  onError: () => void;
}`}
          language="typescript"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          InfoRenderProps
        </Heading>
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
        <Heading level={2} className="text-2xl font-bold mb-4">
          Sub-Components
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Reusable sub-components for composing custom controls via{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderControls
          </code>
          .
        </p>

        <Heading level={3} className="text-lg font-semibold mt-4 mb-2">
          CloseButton
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Default X close button.
        </p>
        <CodeBlock
          code={`import { CloseButton } from '@reelkit/react-lightbox';

<CloseButton onClick={onClose} />`}
          language="tsx"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          Counter
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Image counter pill showing "1 / 3".
        </p>
        <CodeBlock
          code={`import { Counter } from '@reelkit/react-lightbox';

<Counter currentIndex={activeIndex} count={count} />`}
          language="tsx"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          FullscreenButton
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Fullscreen toggle button (Maximize/Minimize icon).
        </p>
        <CodeBlock
          code={`import { FullscreenButton } from '@reelkit/react-lightbox';

<FullscreenButton isFullscreen={isFullscreen} onToggle={onToggleFullscreen} />`}
          language="tsx"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          SoundButton
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Mute/unmute toggle button for video slides (Volume2/VolumeX icon).
          Included automatically in{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderControls
          </code>{' '}
          from{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useVideoSlideRenderer
          </code>
          . For standalone use inside custom controls, access sound state via{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useSoundState
          </code>
          .
        </p>
        <CodeBlock
          code={`import { SoundButton } from '@reelkit/react-lightbox';
import { useSoundState } from '@reelkit/react';

// Inside a component wrapped in SoundProvider:
function CustomControls({ onClose }) {
  const soundState = useSoundState();

  return (
    <div>
      <SoundButton
        muted={soundState.muted.value}
        onToggle={soundState.toggle}
      />
      <button onClick={onClose}>Close</button>
    </div>
  );
}`}
          language="tsx"
        />
      </section>

      {/* Hooks */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Hooks
        </Heading>

        <Heading level={3} className="text-lg font-semibold mb-2">
          useVideoSlideRenderer
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Hook for opt-in video support. Returns{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlide
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderControls
          </code>
          , and{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            SoundProvider
          </code>{' '}
          — wrap the overlay in SoundProvider and pass the render functions.
        </p>
        <CodeBlock
          code={`import { useVideoSlideRenderer } from '@reelkit/react-lightbox';

const { renderSlide, renderControls, SoundProvider, hasVideo } =
  useVideoSlideRenderer(items, isOpen);

// SoundProvider  — wrap LightboxOverlay in this for mute/unmute support
// renderSlide    — pass to LightboxOverlay's renderSlide prop
// renderControls — pass to LightboxOverlay's renderControls prop
//                  (includes Counter, FullscreenButton, SoundButton, CloseButton)
// hasVideo       — true if items contain at least one video
// isOpen param   — resets mute to true on close (enables autoplay on reopen)`}
          language="typescript"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          useFullscreen
        </Heading>
        <Callout type="warning" title="Moved" className="mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            useFullscreen
          </code>{' '}
          was removed from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/react-lightbox
          </code>
          . Import it from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/react
          </code>{' '}
          instead.
        </Callout>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Hook for managing fullscreen state with cross-browser support.
        </p>
        <CodeBlock
          code={`import { useRef } from 'react';
import { useFullscreen } from '@reelkit/react';

function CustomLightbox() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, requestFullscreen, exitFullscreen, toggleFullscreen] =
    useFullscreen({ ref: containerRef });

  return (
    <div ref={containerRef}>
      <button onClick={toggleFullscreen}>
        {isFullscreen.value ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      </button>
    </div>
  );
}`}
          language="tsx"
        />
      </section>

      {/* Transitions */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Transitions
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Choose from four built-in transition aliases via the{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            transition
          </code>{' '}
          prop, or pass any{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            TransitionTransformFn
          </code>{' '}
          via{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            transitionFn
          </code>
          .
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
                  'flip'
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  3D card flip effect
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
  transition="flip"
/>`}
          language="tsx"
        />

        <Heading level={3} className="text-xl font-semibold mt-8 mb-4">
          Custom Transition Function
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            transitionFn
          </code>{' '}
          to pass any{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            TransitionTransformFn
          </code>{' '}
          directly. It takes priority over the{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            transition
          </code>{' '}
          alias. Built-in functions are available from{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react
          </code>{' '}
          and lightbox-specific ones from{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-lightbox
          </code>
          .
        </p>
        <CodeBlock
          code={`import { LightboxOverlay, lightboxFadeTransition } from '@reelkit/react-lightbox';
import { flipTransition, cubeTransition } from '@reelkit/react';

// Use a core transition directly
<LightboxOverlay
  isOpen={isOpen}
  images={images}
  transitionFn={flipTransition}
  onClose={() => setIsOpen(false)}
/>

// Available from @reelkit/react:
//   slideTransition, fadeTransition, flipTransition,
//   cubeTransition, zoomTransition
//
// Available from @reelkit/react-lightbox:
//   lightboxFadeTransition, lightboxZoomTransition`}
          language="tsx"
        />
      </section>

      {/* CSS Classes */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          CSS Classes
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          All UI elements use plain CSS classes (not CSS modules) that can be
          targeted with higher-specificity selectors in a stylesheet loaded
          after{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-lightbox/styles.css
          </code>
          . For color, size, and z-index changes, prefer the CSS custom
          properties documented in the{' '}
          <Link
            to={{ hash: '#theming' }}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Theming
          </Link>{' '}
          section below.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Class</th>
                <th className="text-left py-3 px-4 font-semibold">Component</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {cssClasses.map((c) => (
                <tr
                  key={c.className}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {c.className}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-sm">
                    {c.component}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {c.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Theming */}
      <section id="theming" className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Theming
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Every color, size, z-index, and transition lives in a CSS custom
          property. Override one or many at{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            :root
          </code>{' '}
          (or any ancestor of the lightbox) to retheme without touching
          component source.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Token</th>
                <th className="text-left py-3 px-4 font-semibold">Default</th>
                <th className="text-left py-3 px-4 font-semibold">Controls</th>
              </tr>
            </thead>
            <tbody>
              {themeTokens.map((t) => (
                <tr
                  key={t.token}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {t.token}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {t.default}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {t.controls}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-slate-600 dark:text-slate-400 mb-3">
          Drop the snippet below into a stylesheet loaded after{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-lightbox/styles.css
          </code>
          .
        </p>

        <CodeBlock
          language="css"
          code={`/* Brand the lightbox */
:root {
  --rk-lightbox-overlay-bg: #0f172a;
  --rk-lightbox-btn-bg: rgba(99, 102, 241, 0.65);
  --rk-lightbox-btn-bg-hover: rgba(168, 85, 247, 0.85);
  --rk-lightbox-nav-size: 56px;
  --rk-lightbox-counter-bg: rgba(99, 102, 241, 0.65);
  --rk-lightbox-info-bg: linear-gradient(
    transparent,
    rgba(99, 102, 241, 0.55) 60%,
    rgba(168, 85, 247, 0.85)
  );
}`}
        />
      </section>

      {/* Accessibility */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Accessibility
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The overlay root is a modal dialog (
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="dialog"
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-modal="true"
          </code>
          ). Set{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ariaLabel
          </code>{' '}
          to change the screen-reader announcement; it defaults to "Image
          gallery". Each slide carries{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="group"
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-roledescription="slide"
          </code>
          , and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-label="Image N of M"
          </code>
          .
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The lightbox captures focus on open and returns it to the trigger on
          close. Tab and Shift+Tab cycle through focusable elements inside;
          focus that escapes (click outside, programmatic focus) gets pulled
          back. Implemented with{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            captureFocusForReturn
          </code>{' '}
          and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            createFocusTrap
          </code>{' '}
          from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/core
          </code>
          .
        </p>
      </section>

      {/* Keyboard Shortcuts */}
      <section>
        <Heading level={2} className="text-2xl font-bold mb-4">
          Keyboard Shortcuts
        </Heading>
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
