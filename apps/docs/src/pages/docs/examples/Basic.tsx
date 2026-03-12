import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Sandbox } from '../../../components/ui/Sandbox';
import { BasicSliderDemo } from '../../../components/demos/BasicSliderDemo';
import { ArrowRight, Hand, Keyboard, Layers, Navigation } from 'lucide-react';

const fullCode = `import { useRef, useState, useCallback, useEffect } from 'react';
import { Reel, ReelIndicator, type ReelApi } from '@reelkit/react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const slides = [
  { title: 'Welcome', subtitle: 'Swipe or use controls', color: '#6366f1' },
  { title: 'Features', subtitle: 'Touch, keyboard & wheel', color: '#8b5cf6' },
  { title: 'Pricing', subtitle: 'Flexible plans', color: '#ec4899' },
  { title: 'Contact', subtitle: 'Get in touch', color: '#14b8a6' },
];

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

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100vh' }}>
      <Reel
        count={slides.length}
        size={size}
        direction="vertical"
        enableWheel
        useNavKeys
        apiRef={apiRef}
        afterChange={(index) => setCurrentIndex(index)}
        itemBuilder={(index, _indexInRange, itemSize) => (
          <div
            style={{
              width: itemSize[0],
              height: itemSize[1],
              background: slides[index].color,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700 }}>
              {slides[index].title}
            </h2>
            <p style={{ fontSize: '1.1rem', opacity: 0.7 }}>
              {slides[index].subtitle}
            </p>
          </div>
        )}
      >
        <ReelIndicator
          count={slides.length}
          active={currentIndex}
          direction="vertical"
          radius={3}
          gap={4}
        />
      </Reel>

      {/* Navigation buttons */}
      <div style={{ position: 'absolute', bottom: 16, left: '50%',
        transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
        <button onClick={() => apiRef.current?.prev()}
          disabled={currentIndex === 0}>
          <ChevronUp />
        </button>
        <button onClick={() => apiRef.current?.next()}
          disabled={currentIndex === slides.length - 1}>
          <ChevronDown />
        </button>
      </div>
    </div>
  );
}`;

export default function BasicExample() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Basic Slider</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          A simple vertical slider with navigation controls and indicators.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          This example demonstrates the fundamental usage of reelkit components
          to create a basic vertical slider with touch, keyboard, and button
          navigation.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Hand, label: 'Touch/Swipe', desc: 'With momentum' },
            {
              icon: Keyboard,
              label: 'Keyboard',
              desc: 'Arrow keys, Home, End',
            },
            { icon: Layers, label: 'Indicators', desc: 'Instagram-style' },
            { icon: Navigation, label: 'Navigation', desc: 'Via apiRef' },
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
            Reel
          </code>{' '}
          component manages slider state, handles gestures, keyboard navigation,
          and animations. Use{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            itemBuilder
          </code>{' '}
          to render each slide and{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            apiRef
          </code>{' '}
          for programmatic control.
        </p>
        <CodeBlock
          code={`// Get API methods
const apiRef = useRef<ReelApi>(null);

// Navigate programmatically
apiRef.current?.next();
apiRef.current?.prev();
apiRef.current?.goTo(5);`}
          language="typescript"
        />
      </section>

      {/* Live Sandbox */}
      <section className="mb-12">
        <Sandbox code={fullCode} title="BasicSlider.tsx" height={500}>
          <BasicSliderDemo />
        </Sandbox>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Try it — click the buttons to navigate between slides.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Key Points</h2>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                size prop
              </strong>
              <p className="text-sm">
                Must specify [width, height] for the slider container
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
    </div>
  );
}
