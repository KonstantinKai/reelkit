import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Sandbox } from '../../../components/ui/Sandbox';
import { LightboxDemo } from '../../../components/demos/LightboxDemo';
import { Image, Maximize2, Keyboard, Zap, MousePointer } from 'lucide-react';

const fullCode = `import { useState } from 'react';
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
  {
    src: 'https://example.com/image3.jpg',
    title: 'City',
  },
];

function App() {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {images.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt={img.title}
            onClick={() => setIndex(i)}
            style={{ cursor: 'pointer', width: '100%' }}
          />
        ))}
      </div>
      <LightboxOverlay
        isOpen={index !== null}
        images={images}
        initialIndex={index ?? 0}
        onClose={() => setIndex(null)}
      />
    </>
  );
}`;

export default function LightboxExample() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Lightbox</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          A full-screen image gallery lightbox with zoom, transitions, and
          navigation.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The Lightbox component provides a polished image viewing experience
          with:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              icon: MousePointer,
              label: 'Touch Gestures',
              desc: 'Swipe to navigate',
            },
            {
              icon: Keyboard,
              label: 'Keyboard Nav',
              desc: 'Arrow keys, Escape',
            },
            {
              icon: Maximize2,
              label: 'Fullscreen',
              desc: 'Cross-browser support',
            },
            { icon: Image, label: 'Transitions', desc: 'Slide, fade, zoom' },
            { icon: Zap, label: 'Preloading', desc: 'Auto loads adjacent' },
            { icon: Zap, label: 'Responsive', desc: 'Adapts to screen' },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-center"
            >
              <item.icon className="w-6 h-6 mx-auto mb-2 text-primary-500" />
              <div className="font-semibold text-sm">{item.label}</div>
              <div className="text-xs text-slate-500">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
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
          code={`// Control visibility with nullable index
const [index, setIndex] = useState<number | null>(null);

// Open at specific index
<LightboxOverlay
  isOpen={index !== null}
  images={images}
  initialIndex={index ?? 0}
  onClose={() => setIndex(null)}
/>`}
          language="typescript"
        />
      </section>

      {/* Live Sandbox */}
      <section className="mb-12">
        <Sandbox code={fullCode} title="LightboxPage.tsx" height={500}>
          <LightboxDemo />
        </Sandbox>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Click a thumbnail to open the lightbox. Use arrow keys or swipe to
          navigate.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Customization</h2>
        <p className="text-slate-600 dark:text-slate-400">
          The lightbox supports render props for full customization of controls,
          navigation, info overlays, and slide content. See the{' '}
          <Link
            to="/docs/api/react-lightbox"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            API Reference
          </Link>{' '}
          for{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderControls
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderNavigation
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderInfo
          </code>
          , and{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlide
          </code>{' '}
          props, along with reusable sub-components like{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            CloseButton
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            Counter
          </code>
          , and{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            FullscreenButton
          </code>
          .
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">API Reference</h2>
        <p className="text-slate-600 dark:text-slate-400">
          See the{' '}
          <Link
            to="/docs/api/react-lightbox"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            React Lightbox API
          </Link>{' '}
          for all props, types, transitions, CSS classes, and keyboard
          shortcuts.
        </p>
      </section>
    </div>
  );
}
