import { Link } from 'react-router-dom';
import { Callout } from '../../components/ui/Callout';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { FeatureCardGrid } from '../../components/ui/FeatureCard';
import { Sandbox } from '../../components/ui/Sandbox';
import { ReelPlayerDemo } from '../../components/demos/ReelPlayerDemo';
import {
  Zap,
  Play,
  Volume2,
  Layout,
  Clock,
  Image,
  Monitor,
  Settings,
  Ratio,
  Code,
  Layers,
} from 'lucide-react';

const fullCode = `import { useState } from 'react';
import { ReelPlayerOverlay, type ContentItem } from '@reelkit/react-reel-player';
import '@reelkit/react-reel-player/styles.css';

const content: ContentItem[] = [
  {
    id: '1',
    media: [{
      id: 'v1',
      type: 'video',
      src: '/cdn/samples/videos/video-01.mp4',
      poster: '/cdn/samples/videos/video-poster-01.jpg',
      aspectRatio: 16 / 9,
    }],
    author: { name: 'Alex Johnson', avatar: '/cdn/samples/avatars/avatar-01.jpg' },
    likes: 1234,
    description: 'Amazing sunset vibes',
  },
  {
    id: '2',
    media: [{
      id: 'img1',
      type: 'image',
      src: '/cdn/samples/images/image-01.jpg',
      aspectRatio: 2 / 3,
    }],
    author: { name: 'Sarah Miller', avatar: '/cdn/samples/avatars/avatar-02.jpg' },
    likes: 5678,
    description: 'Nature at its finest',
  },
  {
    id: '3',
    media: [{
      id: 'v2',
      type: 'video',
      src: '/cdn/samples/videos/video-04.mp4',
      poster: '/cdn/samples/videos/video-poster-04.jpg',
      aspectRatio: 16 / 9,
    }],
    author: { name: 'James Wilson', avatar: '/cdn/samples/avatars/avatar-03.jpg' },
    likes: 3456,
    description: 'City life adventures',
  },
  {
    id: '4',
    media: [
      { id: 'img2', type: 'image', src: '/cdn/samples/images/image-02.jpg', aspectRatio: 2 / 3 },
      { id: 'img3', type: 'image', src: '/cdn/samples/images/image-03.jpg', aspectRatio: 3 / 4 },
    ],
    author: { name: 'Emma Davis', avatar: '/cdn/samples/avatars/avatar-04.jpg' },
    likes: 8901,
    description: 'Travel moments',
  },
  {
    id: '5',
    media: [{
      id: 'img4',
      type: 'image',
      src: '/cdn/samples/images/image-04.jpg',
      aspectRatio: 2 / 3,
    }],
    author: { name: 'Michael Brown', avatar: '/cdn/samples/avatars/avatar-05.jpg' },
    likes: 2345,
    description: 'Golden hour magic',
  },
  {
    id: '6',
    media: [{
      id: 'v3',
      type: 'video',
      src: '/cdn/samples/videos/video-05.mp4',
      poster: '/cdn/samples/videos/video-poster-05.jpg',
      aspectRatio: 16 / 9,
    }],
    author: { name: 'Alex Johnson', avatar: '/cdn/samples/avatars/avatar-01.jpg' },
    likes: 7890,
    description: 'Living the moment',
  },
];

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  return (
    <div style={{ padding: 16, background: '#0f172a', minHeight: '100vh' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {content.map((item, i) => (
          <button
            key={item.id}
            onClick={() => { setInitialIndex(i); setIsOpen(true); }}
            style={{
              position: 'relative', aspectRatio: '9 / 16', borderRadius: 8,
              overflow: 'hidden', border: 'none', padding: 0, cursor: 'pointer',
              background: '#1e293b',
            }}
          >
            <img
              src={item.media[0].poster || item.media[0].src}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </button>
        ))}
      </div>

      <ReelPlayerOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={content}
        initialIndex={initialIndex}
      />
    </div>
  );
}`;

const reelPlayerProps = [
  {
    prop: 'isOpen',
    type: 'boolean',
    default: 'required',
    description: 'Controls overlay visibility',
  },
  {
    prop: 'content',
    type: 'T[]',
    default: 'required',
    description: 'Array of content items (generic, defaults to ContentItem)',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: 'Starting slide index',
  },
  {
    prop: 'apiRef',
    type: 'MutableRefObject<ReelApi>',
    default: '-',
    description: 'Ref to access Reel API',
  },
  {
    prop: 'renderSlideOverlay',
    type: '(item, index, isActive) => ReactNode',
    default: '-',
    description:
      'Custom overlay per slide, replaces default SlideOverlay. Return null to hide.',
  },
  {
    prop: 'renderSlide',
    type: '(props: SlideRenderProps) => ReactNode | null',
    default: '-',
    description:
      'Custom slide rendering. Return null to fall back to default. Use props.defaultContent to wrap or embed the default slide.',
  },
  {
    prop: 'renderControls',
    type: '(props: ControlsRenderProps) => ReactNode',
    default: '-',
    description: 'Custom controls, replaces default close + sound buttons',
  },
  {
    prop: 'renderNavigation',
    type: '(props: NavigationRenderProps) => ReactNode',
    default: '-',
    description: 'Custom navigation, replaces default vertical arrows',
  },
  {
    prop: 'renderNestedNavigation',
    type: '(props: NavigationRenderProps) => ReactNode',
    default: '-',
    description:
      'Custom navigation for nested horizontal slider (multi-media posts), replaces default left/right arrows',
  },
  {
    prop: 'renderNestedSlide',
    type: '(props: NestedSlideRenderProps) => ReactNode',
    default: '-',
    description:
      'Custom slide renderer for nested horizontal slider items. Use props.defaultContent to wrap or embed the default ImageSlide/VideoSlide. Unlike renderSlide, null is not treated as a fallback.',
  },
  {
    prop: 'renderLoading',
    type: '(props: { item: T; activeIndex: number }) => ReactNode',
    default: '-',
    description: 'Custom loading indicator, replaces default wave loader',
  },
  {
    prop: 'renderError',
    type: '(props: { item: T; activeIndex: number }) => ReactNode',
    default: '-',
    description: 'Custom error indicator, replaces default error icon',
  },
  {
    prop: 'aspectRatio',
    type: 'number',
    default: '9/16 (0.5625)',
    description:
      'Width/height ratio for the player container on desktop. On mobile the player always uses full viewport.',
  },
];

const reelPlayerCallbacks = [
  {
    prop: 'onClose',
    type: '() => void',
    description: 'Called when player closes',
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
  { key: 'ArrowUp', action: 'Previous slide' },
  { key: 'ArrowDown', action: 'Next slide' },
  { key: 'ArrowLeft', action: 'Previous media (in nested slider)' },
  { key: 'ArrowRight', action: 'Next media (in nested slider)' },
  { key: 'Escape', action: 'Close player' },
];

const themeTokens = [
  // Overlay
  {
    token: '--rk-reel-overlay-bg',
    default: '#000',
    controls: 'Full-screen backdrop color',
  },
  {
    token: '--rk-reel-overlay-z',
    default: '1000',
    controls: 'Overlay z-index',
  },

  // Shared button (close, sound, nav arrows)
  {
    token: '--rk-reel-button-bg',
    default: 'rgba(0, 0, 0, 0.5)',
    controls: 'Default circular button background',
  },
  {
    token: '--rk-reel-button-bg-hover',
    default: 'rgba(255, 255, 255, 0.1)',
    controls: 'Nav arrow background (and base hover state)',
  },
  {
    token: '--rk-reel-button-bg-hover-strong',
    default: 'rgba(255, 255, 255, 0.2)',
    controls: 'Nav arrow hover background',
  },
  {
    token: '--rk-reel-button-fg',
    default: '#fff',
    controls: 'Button icon color',
  },
  {
    token: '--rk-reel-button-size',
    default: '44px',
    controls: 'Button width / height',
  },
  {
    token: '--rk-reel-button-radius',
    default: '50%',
    controls: 'Button border-radius',
  },

  // UI layout
  {
    token: '--rk-reel-ui-z',
    default: '10',
    controls: 'Close / sound / nav z-index',
  },
  {
    token: '--rk-reel-edge-padding',
    default: '16px',
    controls: 'Edge inset for close / sound / nav arrows',
  },
  {
    token: '--rk-reel-nav-gap',
    default: '8px',
    controls: 'Spacing between stacked nav arrows',
  },
  {
    token: '--rk-reel-transition',
    default: '0.2s',
    controls: 'Hover transition duration',
  },

  // Loader
  {
    token: '--rk-reel-loader-color',
    default: 'rgba(255, 255, 255, 0.12)',
    controls: 'Wave loader gradient color',
  },
  {
    token: '--rk-reel-loader-duration',
    default: '1.8s',
    controls: 'Wave loader animation duration',
  },

  // Error state
  {
    token: '--rk-reel-error-fg',
    default: 'rgba(255, 255, 255, 0.4)',
    controls: 'Error icon and text color',
  },
  {
    token: '--rk-reel-error-text-size',
    default: '13px',
    controls: 'Error message font size',
  },

  // Slide caption overlay
  {
    token: '--rk-reel-slide-overlay-bg',
    default: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
    controls: 'Caption scrim gradient',
  },
  {
    token: '--rk-reel-slide-overlay-padding',
    default: '48px 16px 16px',
    controls: 'Caption inner padding',
  },
  {
    token: '--rk-reel-slide-overlay-name-color',
    default: '#fff',
    controls: 'Author name color',
  },
  {
    token: '--rk-reel-slide-overlay-description-color',
    default: 'rgba(255, 255, 255, 0.9)',
    controls: 'Description text color',
  },
  {
    token: '--rk-reel-slide-overlay-likes-color',
    default: 'rgba(255, 255, 255, 0.8)',
    controls: 'Likes row text color',
  },

  // Video slide
  {
    token: '--rk-reel-video-bg',
    default: '#000',
    controls: 'Letterbox background behind <video>',
  },

  // Nested horizontal slider
  {
    token: '--rk-reel-nested-button-bg',
    default: 'rgba(0, 0, 0, 0.5)',
    controls: 'Nested arrow background',
  },
  {
    token: '--rk-reel-nested-button-bg-hover',
    default: 'rgba(255, 255, 255, 0.2)',
    controls: 'Nested arrow hover background',
  },
  {
    token: '--rk-reel-nested-button-size',
    default: '36px',
    controls: 'Nested arrow size',
  },
  {
    token: '--rk-reel-nested-edge-padding',
    default: '12px',
    controls: 'Nested arrow edge inset',
  },
];

const cssClasses = [
  // Overlay
  {
    className: '.rk-reel-overlay',
    component: 'Overlay',
    description: 'Fixed full-screen backdrop (background, z-index)',
  },
  {
    className: '.rk-reel-container',
    component: 'Overlay',
    description: 'Player container (position, overflow)',
  },
  {
    className: '.rk-reel-loader',
    component: 'Overlay',
    description: 'Wave loading animation overlay',
  },
  {
    className: '.rk-reel-media-error',
    component: 'Overlay',
    description: 'Error state overlay (centered icon + text)',
  },
  {
    className: '.rk-reel-media-error-text',
    component: 'Overlay',
    description: 'Error message text',
  },

  // Controls
  {
    className: '.rk-reel-button',
    component: 'Controls',
    description: 'Shared circular icon button (close, sound, nav arrows)',
  },
  {
    className: '.rk-reel-close-btn',
    component: 'Controls',
    description: 'Close button',
  },
  {
    className: '.rk-reel-sound-btn',
    component: 'Controls',
    description: 'Sound toggle button',
  },

  // Navigation
  {
    className: '.rk-reel-nav-arrows',
    component: 'Navigation',
    description: 'Desktop-only arrow container (hidden below 768px)',
  },
  {
    className: '.rk-reel-nav-button',
    component: 'Navigation',
    description: 'Individual prev/next nav arrow',
  },

  // Slide
  {
    className: '.rk-reel-slide-wrapper',
    component: 'Slide',
    description: 'Wrapper around media + overlay',
  },

  // SlideOverlay
  {
    className: '.rk-reel-slide-overlay',
    component: 'SlideOverlay',
    description: 'Gradient overlay container',
  },
  {
    className: '.rk-reel-slide-overlay-author',
    component: 'SlideOverlay',
    description: 'Author row (avatar + name)',
  },
  {
    className: '.rk-reel-slide-overlay-avatar',
    component: 'SlideOverlay',
    description: 'Author avatar image',
  },
  {
    className: '.rk-reel-slide-overlay-name',
    component: 'SlideOverlay',
    description: 'Author name text',
  },
  {
    className: '.rk-reel-slide-overlay-description',
    component: 'SlideOverlay',
    description: 'Description text',
  },
  {
    className: '.rk-reel-slide-overlay-likes',
    component: 'SlideOverlay',
    description: 'Likes row (heart + count)',
  },

  // VideoSlide
  {
    className: '.rk-reel-video-container',
    component: 'VideoSlide',
    description: 'Video wrapper (background, overflow)',
  },
  {
    className: '.rk-reel-video-element',
    component: 'VideoSlide',
    description: 'The <video> element',
  },
  {
    className: '.rk-reel-video-poster',
    component: 'VideoSlide',
    description: 'Poster image (fades out on play)',
  },

  // NestedSlider
  {
    className: '.rk-reel-nested-nav',
    component: 'NestedSlider',
    description: 'Horizontal carousel arrows (hidden below 768px)',
  },
  {
    className: '.rk-reel-nested-nav-prev',
    component: 'NestedSlider',
    description: 'Nested prev arrow position',
  },
  {
    className: '.rk-reel-nested-nav-next',
    component: 'NestedSlider',
    description: 'Nested next arrow position',
  },
];

export default function ReelPlayer() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Reel Player</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          A full-screen Instagram-Reel/TikTok-style video player component using{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-reel-player
          </code>
          .
        </p>
        <a
          href="https://react-demo.reelkit.dev/reel-player?utm_source=docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          View live demo &rarr;
        </a>
      </div>

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FeatureCardGrid
            items={[
              {
                icon: Zap,
                label: 'Vertical Swipe',
                desc: 'Touch, drag, keyboard, wheel',
              },
              {
                icon: Play,
                label: 'Video Autoplay',
                desc: 'Plays when visible',
              },
              { icon: Volume2, label: 'Sound Toggle', desc: 'iOS continuity' },
              {
                icon: Layout,
                label: 'Multi-Media',
                desc: 'Horizontal nested carousels',
              },
              {
                icon: Clock,
                label: 'Position Memory',
                desc: 'Resumes where left off',
              },
              {
                icon: Image,
                label: 'Frame Capture',
                desc: 'Poster-to-video crossfade',
              },
              {
                icon: Layers,
                label: 'Virtualized',
                desc: 'Only 3 slides in DOM',
              },
              {
                icon: Ratio,
                label: 'Aspect Ratio',
                desc: '9:16 desktop, full mobile',
              },
              { icon: Monitor, label: 'Desktop Nav', desc: 'Arrow buttons' },
              {
                icon: Code,
                label: 'Generic Types',
                desc: 'Custom content data models',
              },
              {
                icon: Settings,
                label: 'Customizable',
                desc: 'Render props for everything',
              },
              {
                icon: Zap,
                label: 'Slide Overlay',
                desc: 'Author, likes, description',
              },
            ]}
          />
        </div>
      </section>

      {/* Installation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          code="npm install @reelkit/react-reel-player @reelkit/react lucide-react"
          language="bash"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          Don't forget to import the styles:
        </p>
        <CodeBlock
          code={`import '@reelkit/react-reel-player/styles.css';`}
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
            ReelPlayerOverlay
          </code>{' '}
          component renders a full-screen player overlay. Pass an array of{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ContentItem
          </code>{' '}
          objects and control visibility with{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            isOpen
          </code>
          .
        </p>
        <CodeBlock
          code={`import { useState } from 'react';
import { ReelPlayerOverlay, type ContentItem } from '@reelkit/react-reel-player';
import '@reelkit/react-reel-player/styles.css';

const content: ContentItem[] = [
  {
    id: '1',
    media: [{
      id: 'v1',
      type: 'video',
      src: 'https://example.com/video.mp4',
      poster: 'https://example.com/poster.jpg',
      aspectRatio: 9 / 16,
    }],
    author: { name: 'John Doe', avatar: 'https://example.com/avatar.jpg' },
    likes: 1234,
    description: 'Amazing video!',
  },
];

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Player</button>
      <ReelPlayerOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={content}
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
          title="ReelPlayerPage.tsx"
          height={500}
          stackblitzDeps={['@reelkit/react-reel-player']}
          stackblitzExtraDeps={{ 'lucide-react': '^0.562.0' }}
        >
          <ReelPlayerDemo />
        </Sandbox>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Click a thumbnail to open the full-screen player. Press Escape or the
          close button to return.
        </p>
      </section>

      {/* Customization */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Customization</h2>

        <h3 className="text-xl font-semibold mt-6 mb-4">
          Generic Content Type
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use custom data types by extending{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            BaseContentItem
          </code>
          :
        </p>
        <CodeBlock
          code={`import { ReelPlayerOverlay, type BaseContentItem } from '@reelkit/react-reel-player';

interface MyItem extends BaseContentItem {
  title: string;
  username: string;
}

const items: MyItem[] = [
  {
    id: '1',
    media: [{ id: 'v1', type: 'video', src: '/video.mp4', aspectRatio: 9/16 }],
    title: 'My Video',
    username: '@user',
  },
];

<ReelPlayerOverlay<MyItem>
  isOpen={isOpen}
  onClose={handleClose}
  content={items}
  renderSlideOverlay={(item) => (
    <div style={{ position: 'absolute', bottom: 16, left: 16, color: '#fff' }}>
      <strong>{item.username}</strong>
      <p>{item.title}</p>
    </div>
  )}
/>`}
          language="tsx"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">
          Custom Slide Overlay
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Replace the built-in slide overlay with custom content per slide:
        </p>
        <CodeBlock
          code={`<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderSlideOverlay={(item, index, isActive) => (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
      color: '#fff',
    }}>
      <h3>{item.author.name}</h3>
      <p>{item.description}</p>
      <span>Slide {index + 1} {isActive ? '(active)' : ''}</span>
    </div>
  )}
/>`}
          language="tsx"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">Non-Media Slides</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlide
          </code>{' '}
          to inject custom content (e.g., CTA cards). Return{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            null
          </code>{' '}
          to fall back to default:
        </p>
        <CodeBlock
          code={`<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderSlide={({ index, size }) => {
    // CTA card on last slide
    if (index === content.length - 1) {
      return (
        <div style={{
          width: size[0],
          height: size[1],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: '#fff',
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Follow for more!</h2>
            <button>Subscribe</button>
          </div>
        </div>
      );
    }
    // Fall back to default MediaSlide + overlay
    return null;
  }}
/>`}
          language="tsx"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">Custom Controls</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Compose reusable sub-components with your own additions:
        </p>
        <CodeBlock
          code={`import {
  ReelPlayerOverlay,
  CloseButton,
  SoundButton,
} from '@reelkit/react-reel-player';

<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderControls={({ onClose, content, activeIndex }) => (
    <>
      <CloseButton onClick={onClose} />
      <SoundButton />
      <button
        onClick={() => share(content[activeIndex])}
        style={{
          position: 'absolute',
          bottom: 60,
          right: 16,
          zIndex: 10,
        }}
      >
        Share
      </button>
    </>
  )}
/>`}
          language="tsx"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">Custom Navigation</h3>
        <CodeBlock
          code={`<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderNavigation={({ onPrev, onNext, activeIndex, count }) => (
    <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }}>
      <button onClick={onPrev} disabled={activeIndex === 0}>Up</button>
      <span>{activeIndex + 1}/{count}</span>
      <button onClick={onNext} disabled={activeIndex === count - 1}>Down</button>
    </div>
  )}
/>`}
          language="tsx"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">
          Custom Nested Navigation
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Replace the left/right arrows inside multi-media slides (horizontal
          carousel) with custom navigation:
        </p>
        <CodeBlock
          code={`<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderNestedNavigation={({ onPrev, onNext, activeIndex, count }) => (
    <div style={{
      position: 'absolute',
      bottom: 48,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      gap: 8,
      zIndex: 10,
    }}>
      <button onClick={onPrev} disabled={activeIndex === 0}>Prev</button>
      <span>{activeIndex + 1} / {count}</span>
      <button onClick={onNext} disabled={activeIndex === count - 1}>Next</button>
    </div>
  )}
/>`}
          language="tsx"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">
          Custom Nested Slides
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Customise individual slides inside multi-media carousels with{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderNestedSlide
          </code>
          . Use{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            props.defaultContent
          </code>{' '}
          to wrap the default ImageSlide/VideoSlide, or replace it entirely:
        </p>
        <CodeBlock
          code={`// Wrap default slides with rounded corners
<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderNestedSlide={({ defaultContent }) => (
    <div style={{ borderRadius: 16, overflow: 'hidden' }}>
      {defaultContent}
    </div>
  )}
/>

// Fully custom nested slide for images
<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderNestedSlide={({ item, size, isActive, slideKey, onVideoRef, defaultContent }) => {
    if (item.type === 'video') return defaultContent; // keep default video
    return (
      <ImageSlide
        src={item.src}
        size={size}
        imgStyle={{ objectFit: 'contain' }}
        style={{ backgroundColor: '#111' }}
      />
    );
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
              {reelPlayerProps.map((p) => (
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
              {reelPlayerCallbacks.map((p) => (
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

        <h3 className="text-lg font-semibold mb-2">BaseContentItem</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          The generic constraint type. Extend this to use custom data types with
          ReelPlayerOverlay.
        </p>
        <CodeBlock
          code={`interface BaseContentItem {
  id: string;
  media: MediaItem[];
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">ContentItem</h3>
        <CodeBlock
          code={`interface ContentItem extends BaseContentItem {
  author: {
    name: string;
    avatar: string;
  };
  likes: number;
  description: string;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">MediaItem</h3>
        <CodeBlock
          code={`interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  poster?: string;
  aspectRatio: number;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">MediaType</h3>
        <CodeBlock
          code={`type MediaType = 'image' | 'video';`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">
          ControlsRenderProps{'<T>'}
        </h3>
        <CodeBlock
          code={`interface ControlsRenderProps<T extends BaseContentItem> {
  onClose: () => void;
  soundState: SoundState;
  activeIndex: number;
  content: T[];
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

        <h3 className="text-lg font-semibold mt-6 mb-2">
          SlideRenderProps{'<T>'}
        </h3>
        <CodeBlock
          code={`interface SlideRenderProps<T extends BaseContentItem> {
  item: T;
  index: number;
  size: [number, number];
  isActive: boolean;
  slideKey: string;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  innerSliderRef: MutableRefObject<ReelApi | null>;
  onActiveMediaTypeChange?: (type: 'image' | 'video') => void;
  renderNestedNavigation?: (props: NavigationRenderProps) => ReactNode;
  enableWheel?: boolean;
  defaultContent: ReactNode;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">
          NestedSlideRenderProps
        </h3>
        <CodeBlock
          code={`interface NestedSlideRenderProps {
  item: MediaItem;
  index: number;
  size: [number, number];
  isActive: boolean;
  isInnerActive: boolean;
  slideKey: string;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  defaultContent: ReactNode;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">SlideOverlayProps</h3>
        <CodeBlock
          code={`interface SlideOverlayProps {
  author?: { name: string; avatar: string };
  description?: string;
  likes?: number;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">ImageSlideProps</h3>
        <CodeBlock
          code={`interface ImageSlideProps {
  src: string;
  size: [number, number];
  className?: string;
  style?: CSSProperties;
  imgClassName?: string;
  imgStyle?: CSSProperties;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">VideoSlideProps</h3>
        <CodeBlock
          code={`interface VideoSlideProps {
  src: string;
  poster?: string;
  aspectRatio: number;
  size: [number, number];
  isActive: boolean;
  isInnerActive?: boolean;   // default: true
  slideKey: string;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  className?: string;
  style?: CSSProperties;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">CloseButtonProps</h3>
        <CodeBlock
          code={`interface CloseButtonProps {
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">SoundButtonProps</h3>
        <CodeBlock
          code={`interface SoundButtonProps {
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}`}
          language="typescript"
        />
      </section>

      {/* Sub-Components */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Sub-Components</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Reusable building blocks exported for composition in custom render
          props:
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-2">CloseButton</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Standalone close button with default reel-player styling. Use inside{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderControls
          </code>
          .
        </p>
        <CodeBlock
          code={`import { CloseButton } from '@reelkit/react-reel-player';

<CloseButton onClick={onClose} />
<CloseButton onClick={onClose} className="my-close-btn" style={{ top: 24, right: 24 }} />`}
          language="tsx"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">SoundButton</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Standalone sound toggle. Must be inside a{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            SoundProvider
          </code>{' '}
          (automatically provided by ReelPlayerOverlay).
        </p>
        <CodeBlock
          code={`import { SoundButton } from '@reelkit/react-reel-player';

<SoundButton />
<SoundButton disabled className="my-sound-btn" />`}
          language="tsx"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">SlideOverlay</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          The default gradient overlay showing author, description, and likes.
          Rendered automatically when content has the required fields. Use{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlideOverlay
          </code>{' '}
          to replace or hide it.
        </p>
        <CodeBlock
          code={`import { SlideOverlay } from '@reelkit/react-reel-player';

<SlideOverlay
  author={{ name: 'John', avatar: '/avatar.jpg' }}
  description="Amazing content"
  likes={12500}
/>`}
          language="tsx"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">ImageSlide</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Image slide with lazy loading and{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            object-fit: cover
          </code>{' '}
          by default. Use inside{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlide
          </code>{' '}
          to compose custom image slides with your own styles.
        </p>
        <CodeBlock
          code={`import { ImageSlide } from '@reelkit/react-reel-player';

// Default usage
<ImageSlide src="/photo.jpg" size={[400, 700]} />

// Custom styles
<ImageSlide
  src="/photo.jpg"
  size={[400, 700]}
  className="my-image-slide"
  style={{ backgroundColor: '#1a1a1a', borderRadius: 12 }}
  imgStyle={{ objectFit: 'contain' }}
/>`}
          language="tsx"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">VideoSlide</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Video slide with shared{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'<video>'}
          </code>{' '}
          element for iOS sound continuity, poster frames, position memory, and
          loading indicator. Must be inside a{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            SoundProvider
          </code>{' '}
          (automatically provided by ReelPlayerOverlay).
        </p>
        <CodeBlock
          code={`import { VideoSlide } from '@reelkit/react-reel-player';

<VideoSlide
  src="/video.mp4"
  poster="/thumb.jpg"
  aspectRatio={9 / 16}
  size={[400, 700]}
  isActive={true}
  slideKey="slide-1"
  style={{ borderRadius: 12 }}
/>`}
          language="tsx"
        />

        <Callout
          type="info"
          title="Composing custom slides"
          className="mt-4 mb-4"
        >
          Use{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlide
          </code>{' '}
          with{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ImageSlide
          </code>{' '}
          /{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            VideoSlide
          </code>{' '}
          to customize media rendering while keeping all built-in behavior
          (autoplay, poster capture, sound sync).
        </Callout>
        <CodeBlock
          code={`import {
  ReelPlayerOverlay,
  ImageSlide,
  VideoSlide,
} from '@reelkit/react-reel-player';

<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderSlide={({ item, size, isActive, slideKey, onVideoRef }) => {
    const media = item.media[0];
    if (media.type === 'image') {
      return (
        <ImageSlide
          src={media.src}
          size={size}
          imgStyle={{ objectFit: 'contain' }}
          style={{ backgroundColor: '#111' }}
        />
      );
    }
    if (media.type === 'video') {
      return (
        <VideoSlide
          src={media.src}
          poster={media.poster}
          aspectRatio={media.aspectRatio}
          size={size}
          isActive={isActive}
          slideKey={slideKey}
          onVideoRef={onVideoRef}
          style={{ borderRadius: 16 }}
        />
      );
    }
    return null; // fallback to default
  }}
/>`}
          language="tsx"
        />
      </section>

      {/* Content Loading & Error Handling */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          Content Loading & Error Handling
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The player tracks per-slide loading and error states. A wave loader
          shows while content loads; an error icon shows for broken media.
          Errored URLs are cached so revisiting shows the error instantly
          without retrying.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-4">Lifecycle Callbacks</h3>
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
renderSlide={({ item, size, isActive, onReady, onWaiting, onError }) => (
  <div style={{ width: size[0], height: size[1] }}>
    {item.media[0].type === 'image' ? (
      <img
        src={item.media[0].src}
        onLoad={onReady}
        onError={onError}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    ) : (
      <video
        src={item.media[0].src}
        autoPlay={isActive}
        onCanPlay={onReady}
        onWaiting={onWaiting}
        onError={onError}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    )}
  </div>
)}`}
          language="tsx"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">
          Custom Loading & Error UI
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Replace the default wave loader and error icon with custom components:
        </p>

        <CodeBlock
          code={`<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  content={content}
  renderLoading={({ item, activeIndex }) => (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: 14,
    }}>
      Loading slide {activeIndex + 1}...
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
      <span>Failed to load media</span>
    </div>
  )}
/>`}
          language="tsx"
        />
      </section>

      {/* Sound Context */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Sound Context</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          For custom implementations, you can access the sound state:
        </p>
        <CodeBlock
          code={`import { SoundProvider, useSoundState } from '@reelkit/react';

// ReelPlayerOverlay wraps itself in a SoundProvider.
// Access sound state inside custom controls:
function CustomControls() {
  const soundState = useSoundState();

  return (
    <button onClick={soundState.toggle}>
      {soundState.muted.value ? 'Unmute' : 'Mute'}
    </button>
  );
}`}
          language="tsx"
        />
      </section>

      {/* CSS Customization */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">CSS Classes</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          All CSS classes are plain (not CSS modules), so they can be targeted
          with higher-specificity selectors in a stylesheet loaded after{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-reel-player/styles.css
          </code>
          . For color, size, and z-index changes, prefer the CSS custom
          properties documented in the{' '}
          <Link
            to={{ hash: '#theming' }}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Theming
          </Link>{' '}
          section below — they're designed for exactly that.
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
        <h2 className="text-2xl font-bold mb-4">Theming</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Every color, size, z-index, and transition lives in a CSS custom
          property. Override one or many at{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            :root
          </code>{' '}
          (or any ancestor of the overlay) to retheme without touching component
          source.
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
            @reelkit/react-reel-player/styles.css
          </code>
          .
        </p>

        <CodeBlock
          code={`/* Brand the reel-player overlay */
:root {
  --rk-reel-overlay-bg: #0f172a;
  --rk-reel-button-bg: rgba(99, 102, 241, 0.65);
  --rk-reel-button-bg-hover-strong: rgba(168, 85, 247, 0.85);
  --rk-reel-edge-padding: 24px;
  --rk-reel-button-size: 52px;
}`}
          language="css"
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
