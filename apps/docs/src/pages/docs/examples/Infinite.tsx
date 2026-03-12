import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Sandbox } from '../../../components/ui/Sandbox';
import { InfiniteListDemo } from '../../../components/demos/InfiniteListDemo';
import { ArrowRight, Zap } from 'lucide-react';

const fullCode = `import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Reel, ReelIndicator, type ReelApi } from '@reelkit/react';

const TOTAL_ITEMS = 10000;

const generateItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    title: \`Item \${i + 1}\`,
    color: \`hsl(\${(i * 137.5) % 360}, 70%, 50%)\`,
  }));

export default function InfiniteList() {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ReelApi>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [size, setSize] = useState<[number, number]>([0, 0]);

  const items = useMemo(() => generateItems(TOTAL_ITEMS), []);

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
        count={items.length}
        size={size}
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
        <ReelIndicator
          count={items.length}
          active={currentIndex}
          direction="vertical"
          visible={4}
        />
      </Reel>
    </div>
  );
}`;

export default function InfiniteExample() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Infinite List</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Handle thousands of items efficiently with built-in virtualization.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          reelkit renders only <strong>3 slides to DOM</strong> at any time
          (current, previous, next). This allows smooth scrolling for lists with
          10,000+ items.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            {
              icon: Zap,
              label: '3 Items in DOM',
              desc: 'Only visible slides rendered',
            },
            { icon: Zap, label: '10,000+ Items', desc: 'Smooth performance' },
            {
              icon: Zap,
              label: 'Memory Efficient',
              desc: 'Low memory footprint',
            },
            {
              icon: Zap,
              label: 'Snap Behavior',
              desc: 'Maintains smooth snapping',
            },
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
            itemBuilder
          </code>{' '}
          function is called only for the slides that need to be rendered. The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            indexInRange
          </code>{' '}
          parameter tells you the item's position in the visible window (0, 1,
          or 2).
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

      {/* Live Sandbox */}
      <section className="mb-12">
        <Sandbox code={fullCode} title="InfiniteList.tsx" height={500}>
          <InfiniteListDemo />
        </Sandbox>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          10,000 items — only 3 in the DOM. Use buttons or type a number to
          jump.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Performance Tips</h2>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Memoize items array
              </strong>
              <p className="text-sm">
                Use{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  useMemo
                </code>{' '}
                to prevent regenerating on every render
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Memoize itemBuilder
              </strong>
              <p className="text-sm">
                Wrap with{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  useCallback
                </code>{' '}
                if it has dependencies
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Lazy load content
              </strong>
              <p className="text-sm">
                Fetch data for items only when they enter the visible range
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Use placeholder content
              </strong>
              <p className="text-sm">
                Show skeleton loaders for items still loading
              </p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
