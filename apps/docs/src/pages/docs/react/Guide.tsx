import { CodeBlock } from '../../../components/ui/CodeBlock';
import { NextSteps } from '../../../components/NextSteps';
import { FeatureCardGrid } from '../../../components/ui/FeatureCard';
import { Sandbox } from '../../../components/ui/Sandbox';
import { BasicSliderDemo } from '../../../components/demos/BasicSliderDemo';
import { InfiniteListDemo } from '../../../components/demos/InfiniteListDemo';
import { GrowableListDemo } from '../../../components/demos/GrowableListDemo';
import {
  ArrowRight,
  Hand,
  Keyboard,
  Layers,
  Navigation,
  Zap,
  MousePointer,
  Infinity as InfinityIcon,
  Radio,
  Code,
} from 'lucide-react';

const basicFullCode = `import { useRef, useState, useCallback, useEffect } from 'react';
import { Reel, ReelIndicator, type ReelApi } from '@reelkit/react';
import {
  ChevronUp, ChevronDown, Zap, Hand, Layers, Keyboard, Monitor, Gauge,
} from 'lucide-react';

const slides = [
  { icon: Zap, title: 'Virtualized', subtitle: 'Only 3 slides in DOM', color: '#6366f1' },
  { icon: Hand, title: 'Touch First', subtitle: 'Native swipe gestures', color: '#8b5cf6' },
  { icon: Layers, title: 'Zero Deps', subtitle: 'Tiny bundle size', color: '#7c3aed' },
  { icon: Keyboard, title: 'Keyboard Nav', subtitle: 'Full a11y support', color: '#ec4899' },
  { icon: Monitor, title: 'SSR Ready', subtitle: 'Works everywhere', color: '#14b8a6' },
  { icon: Gauge, title: '60fps', subtitle: 'Smooth animations', color: '#f59e0b' },
];

const AUTO_ADVANCE_MS = 3000;

export default function BasicSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ReelApi>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [size, setSize] = useState<[number, number]>([0, 0]);

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setSize([rect.width, rect.height]);
      apiRef.current?.adjust();
    }
  }, []);

  useEffect(() => {
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateSize]);

  useEffect(() => {
    if (size[0] === 0 || size[1] === 0) return;
    const id = setInterval(() => apiRef.current?.next(), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [size]);

  if (size[0] === 0 || size[1] === 0) {
    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Reel
        count={slides.length}
        size={size}
        direction="vertical"
        loop
        apiRef={apiRef}
        afterChange={(index) => setCurrentIndex(index)}
        itemBuilder={(index, _indexInRange, itemSize) => {
          const slide = slides[index];
          const Icon = slide.icon;
          return (
            <div
              style={{
                width: itemSize[0],
                height: itemSize[1],
                background: \`linear-gradient(160deg, \${slide.color}, \${slide.color}aa)\`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                gap: 6,
              }}
            >
              <Icon size={32} strokeWidth={1.5} style={{ opacity: 0.9 }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{slide.title}</h2>
              <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>{slide.subtitle}</p>
            </div>
          );
        }}
      >
        <div style={{ position: 'absolute', top: 28, left: '50%',
          transform: 'translateX(-50%)', padding: '4px 12px',
          background: 'rgba(0,0,0,0.4)', color: '#fff',
          borderRadius: 12, fontSize: '0.75rem', zIndex: 10 }}>
          {currentIndex + 1} / {slides.length}
        </div>

        <div style={{ position: 'absolute', right: 12, top: '50%',
          transform: 'translateY(-50%)', zIndex: 10 }}>
          <ReelIndicator direction="vertical" radius={3} gap={4} />
        </div>
      </Reel>

      <div style={{ position: 'absolute', bottom: 28, left: '50%',
        transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
        <button onClick={() => apiRef.current?.prev()}
          style={{ width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', border: 'none',
            color: 'white', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center' }}>
          <ChevronUp size={18} />
        </button>
        <button onClick={() => apiRef.current?.next()}
          style={{ width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', border: 'none',
            color: 'white', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center' }}>
          <ChevronDown size={18} />
        </button>
      </div>
    </div>
  );
}`;

const infiniteFullCode = `import { useRef, useMemo, useState } from 'react';
import { Reel, ReelIndicator, type ReelApi } from '@reelkit/react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const TOTAL_ITEMS = 10000;

const generateItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    title: \`Item \${i + 1}\`,
    color: \`hsl(\${(i * 137.5) % 360}, 70%, 50%)\`,
  }));

export default function InfiniteList() {
  const apiRef = useRef<ReelApi>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [goToValue, setGoToValue] = useState('');

  const items = useMemo(() => generateItems(TOTAL_ITEMS), []);

  const handleGoTo = () => {
    const index = parseInt(goToValue, 10) - 1;
    if (index >= 0 && index < TOTAL_ITEMS) {
      apiRef.current?.goTo(index, true);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100dvh' }}>
      <Reel
        count={items.length}
        style={{ width: '100%', height: '100%' }}
        direction="vertical"
        enableWheel
        apiRef={apiRef}
        afterChange={(index) => setCurrentIndex(index)}
        itemBuilder={(index, indexInRange, itemSize) => (
          <div
            style={{
              width: itemSize[0],
              height: itemSize[1],
              background: items[index].color,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <h2>{items[index].title}</h2>
            <p>index: {index} | range: {indexInRange}</p>
          </div>
        )}
      >
        {/* Counter */}
        <div style={{ position: 'absolute', top: 12, left: '50%',
          transform: 'translateX(-50%)', padding: '4px 12px',
          background: 'rgba(0,0,0,0.4)', color: '#fff',
          borderRadius: 12, fontSize: '0.75rem', zIndex: 10 }}>
          {(currentIndex + 1).toLocaleString()} / {TOTAL_ITEMS.toLocaleString()}
        </div>

        {/* Indicator */}
        <div style={{ position: 'absolute', right: 12, top: '50%',
          transform: 'translateY(-50%)', zIndex: 10 }}>
          <ReelIndicator
            direction="vertical"
            visible={4}
          />
        </div>
      </Reel>

      {/* Controls */}
      <div style={{ position: 'absolute', bottom: 12, left: '50%',
        transform: 'translateX(-50%)', display: 'flex', gap: 6,
        alignItems: 'center', zIndex: 10 }}>
        <button onClick={() => apiRef.current?.prev()}
          disabled={currentIndex === 0}>
          <ChevronUp size={16} />
        </button>
        <button onClick={() => apiRef.current?.next()}
          disabled={currentIndex === items.length - 1}>
          <ChevronDown size={16} />
        </button>
        <input
          type="number"
          min={1}
          max={TOTAL_ITEMS}
          value={goToValue}
          onChange={(e) => setGoToValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleGoTo(); }}
          placeholder="Go to #"
          style={{ width: 72, padding: '4px 8px', fontSize: '0.75rem',
            background: 'rgba(0,0,0,0.4)', color: '#fff',
            border: 'none', borderRadius: 6, outline: 'none' }}
        />
        <button onClick={handleGoTo}>Go</button>
      </div>
    </div>
  );
}`;

const growableFullCode = `import { useRef, useState } from 'react';
import { Reel, ReelIndicator, type ReelApi } from '@reelkit/react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const BATCH_SIZE = 20;
const MAX_ITEMS = 200;
const LOAD_THRESHOLD = 3;

const generateItems = (startIndex: number, count: number) =>
  Array.from({ length: count }, (_, i) => {
    const index = startIndex + i;
    return {
      title: \`Item \${index + 1}\`,
      color: \`hsl(\${(index * 137.5) % 360}, 70%, 50%)\`,
    };
  });

export default function GrowableList() {
  const apiRef = useRef<ReelApi>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState(() => generateItems(0, BATCH_SIZE));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingRef = useRef(false);

  const handleAfterChange = (index: number) => {
    setCurrentIndex(index);
    if (
      index >= items.length - LOAD_THRESHOLD &&
      items.length < MAX_ITEMS &&
      !loadingRef.current
    ) {
      loadingRef.current = true;
      setIsLoadingMore(true);
      setTimeout(() => {
        setItems((prev) => [...prev, ...generateItems(prev.length, BATCH_SIZE)]);
        setIsLoadingMore(false);
        loadingRef.current = false;
      }, 1000);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100dvh' }}>
      <Reel
        count={items.length}
        style={{ width: '100%', height: '100%' }}
        direction="vertical"
        enableWheel
        apiRef={apiRef}
        afterChange={handleAfterChange}
        itemBuilder={(index, _indexInRange, itemSize) => (
          <div
            style={{
              width: itemSize[0],
              height: itemSize[1],
              background: items[index].color,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <h2>{items[index].title}</h2>
            <p>batch: {Math.floor(index / BATCH_SIZE) + 1}</p>
          </div>
        )}
      >
        {/* Counter */}
        <div style={{ position: 'absolute', top: 12, left: '50%',
          transform: 'translateX(-50%)', padding: '4px 12px',
          background: 'rgba(0,0,0,0.4)', color: '#fff',
          borderRadius: 12, fontSize: '0.75rem', zIndex: 10 }}>
          {currentIndex + 1} / {items.length}
          {items.length < MAX_ITEMS && ' (growing)'}
        </div>

        {/* Indicator */}
        <div style={{ position: 'absolute', right: 12, top: '50%',
          transform: 'translateY(-50%)', zIndex: 10 }}>
          <ReelIndicator direction="vertical" visible={4} />
        </div>
      </Reel>

      {/* Controls */}
      <div style={{ position: 'absolute', bottom: 12, left: '50%',
        transform: 'translateX(-50%)', display: 'flex', gap: 6,
        alignItems: 'center', zIndex: 10 }}>
        <button onClick={() => apiRef.current?.prev()}
          disabled={currentIndex === 0}>
          <ChevronUp size={16} />
        </button>
        <button onClick={() => apiRef.current?.next()}
          disabled={currentIndex === items.length - 1 && !isLoadingMore}>
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Loading overlay */}
      {isLoadingMore && (
        <div style={{ position: 'absolute', bottom: 52, left: '50%',
          transform: 'translateX(-50%)', padding: '6px 16px',
          background: 'rgba(0,0,0,0.6)', color: '#fff',
          borderRadius: 12, fontSize: '0.75rem', zIndex: 20 }}>
          Loading more...
        </div>
      )}
    </div>
  );
}`;

export default function ReactGuide() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">React Guide</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Learn how to build sliders with{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react
          </code>
          .
        </p>
      </div>

      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FeatureCardGrid
            items={[
              {
                icon: Hand,
                label: 'Touch First',
                desc: 'Swipe with momentum and snap',
              },
              {
                icon: Keyboard,
                label: 'Keyboard Nav',
                desc: 'Arrow keys + Escape',
              },
              {
                icon: MousePointer,
                label: 'Wheel Scroll',
                desc: 'Optional with debounce',
              },
              {
                icon: InfinityIcon,
                label: 'Virtualized',
                desc: '10,000+ items, 3 in DOM',
              },
              {
                icon: Radio,
                label: 'Indicators',
                desc: 'Instagram-style dot scrolling',
              },
              {
                icon: Navigation,
                label: 'Programmatic API',
                desc: 'next(), prev(), goTo() via ref',
              },
              {
                icon: Zap,
                label: 'Loop Mode',
                desc: 'Infinite circular navigation',
              },
              {
                icon: Layers,
                label: 'Directional',
                desc: 'Vertical or horizontal',
              },
              {
                icon: Code,
                label: 'Zero Re-renders',
                desc: 'Signal-based state updates',
              },
            ]}
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Reel Component</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            Reel
          </code>{' '}
          component is the main container that manages slider state, handles
          touch gestures, keyboard navigation, and animations.
        </p>
        <CodeBlock
          code={`import { Reel, ReelIndicator } from '@reelkit/react';

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
          language="tsx"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Auto-sizing</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            size
          </code>{' '}
          prop is optional. When omitted, Reel auto-measures its container via{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ResizeObserver
          </code>{' '}
          and adapts to CSS-driven layout. The container must be sized by its
          parent (e.g. flex, grid, or explicit CSS dimensions).
        </p>
        <CodeBlock
          code={`// Explicit size (fixed)
<Reel count={items.length} size={[400, 600]} itemBuilder={...} />

// Auto-size (responsive — sized by CSS)
<Reel count={items.length} style={{ width: '100%', height: '100dvh' }} itemBuilder={...} />`}
          language="tsx"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">itemBuilder Pattern</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            itemBuilder
          </code>{' '}
          prop is a function that receives the index and returns the content for
          each slide. This pattern enables virtualization — only visible items
          are rendered.
        </p>
        <CodeBlock
          code={`itemBuilder={(index, indexInRange, size) => {
  // index: actual item index (0 to count-1)
  // indexInRange: position in visible window (0, 1, or 2)
  // size: [width, height] of the container
  return <Slide index={index} />;
}}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Navigation</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Built-in navigation methods:
        </p>

        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Touch/Swipe:</strong> Drag to navigate with momentum and
              snap
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Keyboard:</strong> Arrow keys and Escape
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Mouse Wheel:</strong> Enable with{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                enableWheel
              </code>{' '}
              prop
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Programmatic:</strong> Use{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                apiRef
              </code>{' '}
              for{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                next()
              </code>
              ,{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                prev()
              </code>
              ,{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                goTo()
              </code>
            </span>
          </li>
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
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">ReelIndicator</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Optional component that displays Instagram-style progress indicators
          showing the current position in the slider. When placed inside a{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            Reel
          </code>
          , it auto-connects to the parent's{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            count
          </code>{' '}
          and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            active
          </code>{' '}
          values via context — no manual state wiring needed.
        </p>
        <CodeBlock
          code={`import { Reel, ReelIndicator } from '@reelkit/react';

{/* Auto-connect: count and active are inherited from parent Reel */}
<Reel count={10} size={[400, 600]} itemBuilder={...}>
  <ReelIndicator />
</Reel>

{/* Manual usage: pass count and active explicitly (e.g. outside a Reel) */}
<ReelIndicator count={10} active={currentIndex} />`}
          language="tsx"
        />
      </section>

      {/* Live Demo: Basic Slider */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Live Demo: Basic Slider</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <FeatureCardGrid
            items={[
              { icon: Hand, label: 'Touch/Swipe', desc: 'With momentum' },
              {
                icon: Keyboard,
                label: 'Keyboard',
                desc: 'Arrow keys + Escape',
              },
              { icon: Layers, label: 'Indicators', desc: 'Instagram-style' },
              { icon: Navigation, label: 'Navigation', desc: 'Via apiRef' },
            ]}
          />
        </div>
        <Sandbox
          code={basicFullCode}
          title="BasicSlider.tsx"
          height={500}
          stackblitzDeps={{
            '@reelkit/react': '0.2.0',
            'lucide-react': '^0.562.0',
          }}
        >
          <BasicSliderDemo />
        </Sandbox>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Try it — click the buttons to navigate between slides.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Key Points</h2>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                size prop
              </strong>
              <p className="text-sm">
                Optional [width, height] tuple, or omit for auto-sizing via CSS
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                itemBuilder
              </strong>
              <p className="text-sm">
                Receives index and returns the slide content
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">apiRef</strong>
              <p className="text-sm">
                Access controller methods for navigation
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                afterChange
              </strong>
              <p className="text-sm">Track current index for UI updates</p>
            </div>
          </li>
        </ul>
      </section>

      {/* Live Demo: Infinite List */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Live Demo: Infinite List</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          reelkit renders only <strong>3 slides in the DOM</strong> at any time
          (current, previous, next). This allows smooth scrolling for lists with
          10,000+ items.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <FeatureCardGrid
            items={[
              {
                icon: Zap,
                label: '3 Items in DOM',
                desc: 'Only visible slides rendered',
              },
              {
                icon: Zap,
                label: '10,000+ Items',
                desc: 'No jank at any scale',
              },
              {
                icon: Zap,
                label: 'Constant Memory',
                desc: 'Same 3 DOM nodes regardless of count',
              },
              {
                icon: Zap,
                label: 'goTo(n)',
                desc: 'Jump to any index instantly',
              },
            ]}
          />
        </div>
        <Sandbox
          code={infiniteFullCode}
          title="InfiniteList.tsx"
          height={500}
          stackblitzDeps={{
            '@reelkit/react': '0.2.0',
            'lucide-react': '^0.562.0',
          }}
        >
          <InfiniteListDemo />
        </Sandbox>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          10,000 items — only 3 in the DOM. Use buttons or type a number to
          jump.
        </p>
      </section>

      {/* Live Demo: Growable List */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Live Demo: Growable List</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Simulates an infinite feed where items load on demand — just like
          TikTok or Instagram. Start with 20 items, scroll near the end, and
          watch new batches arrive automatically.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <FeatureCardGrid
            items={[
              {
                icon: Zap,
                label: 'Dynamic Count',
                desc: 'Items load as you scroll',
              },
              {
                icon: Zap,
                label: 'Batch Loading',
                desc: '20 items per batch',
              },
              {
                icon: Layers,
                label: 'Virtualized',
                desc: 'Still only 3 in DOM',
              },
              {
                icon: Radio,
                label: 'Auto Indicator',
                desc: 'Dots grow with content',
              },
            ]}
          />
        </div>
        <Sandbox
          code={growableFullCode}
          title="GrowableList.tsx"
          height={500}
          stackblitzDeps={{
            '@reelkit/react': '0.2.0',
            'lucide-react': '^0.562.0',
          }}
        >
          <GrowableListDemo />
        </Sandbox>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Scroll to the end — new items load automatically. The counter and
          indicator grow as batches arrive.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Performance Tips</h2>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Memoize data arrays
              </strong>
              <p className="text-sm">
                Wrap your items array with{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  useMemo
                </code>
                . A new array reference on every render triggers a{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  count
                </code>{' '}
                update and re-computation of visible ranges.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Keep itemBuilder lightweight
              </strong>
              <p className="text-sm">
                It runs on every visible range change (typically 3 slides).
                Avoid heavy computation or side effects inside it.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Load data near the edge
              </strong>
              <p className="text-sm">
                Use{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  afterChange
                </code>{' '}
                to detect when the user approaches the end and fetch the next
                batch before they run out of slides (see Growable List demo
                above).
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Disable wheel in scrollable pages
              </strong>
              <p className="text-sm">
                Set{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  enableWheel={'{false}'}
                </code>{' '}
                when the slider is embedded in a scrollable layout to avoid
                capturing the page scroll.
              </p>
            </div>
          </li>
        </ul>
      </section>

      <NextSteps
        items={[
          {
            label: 'API Reference',
            path: '/docs/react/api',
            description: 'all available props',
          },
          {
            label: 'Reel Player',
            path: '/docs/reel-player',
            description: 'TikTok/Reels-style video player',
          },
          {
            label: 'Lightbox',
            path: '/docs/lightbox',
            description: 'image & video gallery',
          },
          {
            label: 'Stories Player',
            path: '/docs/stories-player',
            description: 'Instagram-style stories viewer',
          },
        ]}
      />
    </div>
  );
}
