import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../../components/ui/CodeBlock';
import { NextSteps } from '../../../../components/NextSteps';
import { FeatureCardGrid } from '../../../../components/ui/FeatureCard';
import { Sandbox } from '../../../../components/ui/Sandbox';
import { BasicSliderDemo } from '../../../../components/demos/BasicSliderDemo';
import { InfiniteListDemo } from '../../../../components/demos/InfiniteListDemo';
import { GrowableListDemo } from '../../../../components/demos/GrowableListDemo';
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
import { Heading } from '../../../../components/ui/Heading';
import { zhPageMeta } from '../../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/react/guide',
    title: 'React 指南 · ReelKit',
    description:
      '在 React 中使用 ReelKit：Reel 组件、itemBuilder 模式、自动尺寸、ReelIndicator 与性能建议。',
  });

// Headings carry the English slug as an explicit id — the slug generator
// is ascii-only, so a Chinese heading would produce an empty anchor.

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
        <h1 className="text-4xl font-bold mb-4">React 指南</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          学习如何用{' '}
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
                label: '触摸优先',
                desc: '带惯性和吸附的滑动',
              },
              {
                icon: Keyboard,
                label: '键盘导航',
                desc: '方向键 + Escape',
              },
              {
                icon: MousePointer,
                label: '滚轮滚动',
                desc: '可选，带防抖',
              },
              {
                icon: InfinityIcon,
                label: '虚拟化',
                desc: '10,000+ 条目，DOM 里只有 3 个',
              },
              {
                icon: Radio,
                label: '指示器',
                desc: 'Instagram 风格的圆点滚动',
              },
              {
                icon: Navigation,
                label: '编程式 API',
                desc: '通过 ref 调用 next()、prev()、goTo()',
              },
              {
                icon: Zap,
                label: '循环模式',
                desc: '无限循环导航',
              },
              {
                icon: Layers,
                label: '方向可选',
                desc: '竖向或横向',
              },
              {
                icon: Code,
                label: '零重渲染',
                desc: '基于信号的状态更新',
              },
            ]}
          />
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="reel-component"
          className="text-2xl font-bold mb-4"
        >
          Reel 组件
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            Reel
          </code>{' '}
          组件是主容器，负责管理滑动器状态、处理触摸手势、键盘导航和动画。
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
        <Heading level={2} id="auto-sizing" className="text-2xl font-bold mb-4">
          自动尺寸
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            size
          </code>{' '}
          属性是可选的。省略时，Reel 会通过{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ResizeObserver
          </code>{' '}
          自动测量容器，并适配由 CSS 决定的布局。容器的尺寸必须由父级决定（例如
          flex、grid 或显式的 CSS 尺寸）。
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
        <Heading
          level={2}
          id="itembuilder-pattern"
          className="text-2xl font-bold mb-4"
        >
          itemBuilder 模式
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            itemBuilder
          </code>{' '}
          属性是一个函数，接收索引并返回该幻灯片的内容。正是这个模式让虚拟化成为可能
          —— 只有可见的条目会被渲染。
        </p>
        <CodeBlock
          code={`itemBuilder={(index, indexInRange, size) => {
  // index: actual item index (0 to count-1)
  // indexInRange: position in visible window (0, 1, or 2)
  // size: [width, height] of the container
  return <Slide index={index} />;
}}`}
          language="tsx"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="navigation" className="text-2xl font-bold mb-4">
          导航
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          内置的导航方式：
        </p>

        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>触摸 / 滑动：</strong> 拖动即可翻页，带惯性和吸附
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>键盘：</strong> 方向键和 Escape
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>鼠标滚轮：</strong> 用{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                enableWheel
              </code>{' '}
              属性开启
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>编程式：</strong> 使用{' '}
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
          language="tsx"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          URL 状态
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            useOverlayUrlState
          </code>{' '}
          为浮层构建一个 URL 状态控制器并整个返回，你再把它作为{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            *UrlOverlay
          </code>{' '}
          的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            controller
          </code>{' '}
          属性传进去。打开状态归 URL
          所有，因此绑定后的浮层会自己打开，链接就是通常的打开方式。参数原本不存在时第一次写入压入一条历史记录，之后每次写入都是替换，所以翻页永远不会把返回键埋掉。留着控制器就能读取{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            value
          </code>
          /
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            position
          </code>{' '}
          ，也能编程式地驱动它：{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            set(position)
          </code>{' '}
          打开，{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            set(null)
          </code>{' '}
          关闭，而{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            set
          </code>{' '}
          正是浮层内部在切换幻灯片时使用的底层写入。
        </p>
        <CodeBlock
          code={`import { useOverlayUrlState, urlIndexKey } from '@reelkit/react';
import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';
import { LightboxUrlOverlay } from '@reelkit/react-lightbox';
import { Link } from 'react-router-dom';

const photo = useOverlayUrlState({
  param: 'photo',
  ...urlIndexKey(() => images.length),
});

// Opening is a link — the overlay reads the URL and opens itself.
<Link to="?photo=3"><img src={images[3].src} /></Link>
<LightboxUrlOverlay controller={photo} images={images} />

// Read the url-derived state, or close programmatically (a low-level write).
photo.position.value; // 3 for ?photo=3, null when nothing is open
photo.set(null); // close

// Routed app: pass a router-backed adapter, otherwise the router's
// own location goes stale and its next navigation drops the param.
const adapter = useReactRouterUrlAdapter();
const routed = useOverlayUrlState({
  param: 'photo',
  adapter,
  ...urlIndexKey(() => images.length),
});`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          选项对象接受{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            param
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            codec
          </code>
          、{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            locator
          </code>{' '}
          （这三个都是必填的），外加可选的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            adapter
          </code>
          。{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            codec
          </code>{' '}
          和{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            locator
          </code>{' '}
          是共用同一个{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            Id
          </code>
          的配套组合，因此总是一起出现 —— 对于普通的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ?photo=3
          </code>{' '}
          画廊，展开{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ...urlIndexKey(() =&gt; images.length)
          </code>
          即可，它会一次性返回两半。{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            urlIndexKey
          </code>{' '}
          把参数映射成幻灯片索引，并以 getter
          返回的实时数量为上界，因此过期或越界的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ?photo=99
          </code>{' '}
          会被拒绝并自动从 URL 中消失，而不是打开一张 URL 从未指定的幻灯片。请传
          getter 而不是数字，这样分页信息流增长时上界依然正确。它包装了{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            createIndexLocator
          </code>{' '}
          (the locator half) and pairs it with{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            indexCodec
          </code>
          。分页信息流或按身份寻址的画廊则自行提供配套的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            codec
          </code>{' '}
          +{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            locator
          </code>{' '}
          。完整的选项表见{' '}
          <Link
            to="/zh/docs/react/api#useoverlayurlstate"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            React API 参考
          </Link>
          .
        </p>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="reelindicator"
          className="text-2xl font-bold mb-4"
        >
          ReelIndicator
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          可选组件，显示 Instagram
          风格的进度指示器，标出当前在滑动器中的位置。放在{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            Reel
          </code>
          内部时，它会通过上下文自动连接到父级的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            count
          </code>{' '}
          和{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            active
          </code>{' '}
          值 —— 不需要手动接状态。
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
        <Heading
          level={2}
          id="live-demo-basic-slider"
          className="text-2xl font-bold mb-4"
        >
          在线演示：基础滑动器
        </Heading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <FeatureCardGrid
            items={[
              { icon: Hand, label: '触摸 / 滑动', desc: '带惯性' },
              {
                icon: Keyboard,
                label: '键盘',
                desc: '方向键 + Escape',
              },
              { icon: Layers, label: '指示器', desc: 'Instagram 风格' },
              { icon: Navigation, label: '导航', desc: '通过 apiRef' },
            ]}
          />
        </div>
        <Sandbox
          code={basicFullCode}
          title="BasicSlider.tsx"
          height={500}
          stackblitzDeps={['@reelkit/react']}
          stackblitzExtraDeps={{ 'lucide-react': '^0.562.0' }}
        >
          <BasicSliderDemo />
        </Sandbox>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          试试看 —— 点按钮在幻灯片之间切换。
        </p>
      </section>

      <section className="mb-12">
        <Heading level={2} id="key-points" className="text-2xl font-bold mb-4">
          要点
        </Heading>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                size 属性
              </strong>
              <p className="text-sm">
                可选的 [宽, 高] 元组；省略则由 CSS 自动决定尺寸
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                itemBuilder
              </strong>
              <p className="text-sm">接收索引并返回幻灯片内容</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">apiRef</strong>
              <p className="text-sm">访问控制器方法以进行导航</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                afterChange
              </strong>
              <p className="text-sm">跟踪当前索引以更新界面</p>
            </div>
          </li>
        </ul>
      </section>

      {/* Live Demo: Infinite List */}
      <section className="mb-12">
        <Heading
          level={2}
          id="live-demo-infinite-list"
          className="text-2xl font-bold mb-4"
        >
          在线演示：无限列表
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          reelkit 在任何时刻只渲染 <strong>DOM 里的 3 张幻灯片</strong>{' '}
          （当前、上一张、下一张）。因此即便列表有 10,000+ 条目也能顺畅滚动。
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <FeatureCardGrid
            items={[
              {
                icon: Zap,
                label: 'DOM 里 3 个条目',
                desc: '只渲染可见的幻灯片',
              },
              {
                icon: Zap,
                label: '10,000+ 条目',
                desc: '任何规模都不卡顿',
              },
              {
                icon: Zap,
                label: '内存恒定',
                desc: '无论多少条目，都是同样 3 个 DOM 节点',
              },
              {
                icon: Zap,
                label: 'goTo(n)',
                desc: '瞬间跳到任意索引',
              },
            ]}
          />
        </div>
        <Sandbox
          code={infiniteFullCode}
          title="InfiniteList.tsx"
          height={500}
          stackblitzDeps={['@reelkit/react']}
          stackblitzExtraDeps={{ 'lucide-react': '^0.562.0' }}
        >
          <InfiniteListDemo />
        </Sandbox>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          10,000 个条目 —— DOM 里只有 3 个。用按钮或输入数字跳转。
        </p>
      </section>

      {/* Live Demo: Growable List */}
      <section className="mb-12">
        <Heading
          level={2}
          id="live-demo-growable-list"
          className="text-2xl font-bold mb-4"
        >
          在线演示：可增长列表
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          模拟按需加载的无限信息流 —— 就像 TikTok 或 Instagram。先加载 20
          条，滚到接近末尾时，新的一批会自动到达。
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <FeatureCardGrid
            items={[
              {
                icon: Zap,
                label: '动态数量',
                desc: '条目随滚动加载',
              },
              {
                icon: Zap,
                label: '批量加载',
                desc: '每批 20 条',
              },
              {
                icon: Layers,
                label: '虚拟化',
                desc: 'DOM 里依然只有 3 个',
              },
              {
                icon: Radio,
                label: '自动指示器',
                desc: '圆点随内容增长',
              },
            ]}
          />
        </div>
        <Sandbox
          code={growableFullCode}
          title="GrowableList.tsx"
          height={500}
          stackblitzDeps={['@reelkit/react']}
          stackblitzExtraDeps={{ 'lucide-react': '^0.562.0' }}
        >
          <GrowableListDemo />
        </Sandbox>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          滚到末尾 —— 新条目会自动加载。计数和指示器会随着批次到达而增长。
        </p>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="performance-tips"
          className="text-2xl font-bold mb-4"
        >
          性能建议
        </Heading>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                缓存数据数组
              </strong>
              <p className="text-sm">
                把条目数组用{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  useMemo
                </code>
                包起来。每次渲染都产生新的数组引用会触发一次{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  count
                </code>{' '}
                更新并重新计算可见范围。
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                让 itemBuilder 保持轻量
              </strong>
              <p className="text-sm">
                它在每次可见范围变化时都会运行（通常是 3
                张幻灯片）。不要在里面做重计算或副作用。
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                临近边缘时加载数据
              </strong>
              <p className="text-sm">
                使用{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  afterChange
                </code>{' '}
                来检测用户是否接近末尾，并在幻灯片用完之前取下一批（见上面的可增长列表演示）。
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                在可滚动页面里关掉滚轮
              </strong>
              <p className="text-sm">
                把{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  enableWheel={'{false}'}
                </code>{' '}
                ，当滑动器嵌在可滚动布局里时，避免抢走页面滚动。
              </p>
            </div>
          </li>
        </ul>
      </section>

      <NextSteps
        items={[
          {
            label: 'API 参考',
            path: '/docs/react/api',
            description: '全部可用属性',
          },
          {
            label: 'Reel Player',
            path: '/docs/reel-player',
            description: 'TikTok / Reels 风格的视频播放器',
          },
          {
            label: 'Lightbox',
            path: '/docs/lightbox',
            description: '图片与视频画廊',
          },
          {
            label: 'Stories Player',
            path: '/docs/stories-player',
            description: 'Instagram 风格的 Stories 浏览器',
          },
        ]}
      />
    </div>
  );
}
