import { Link } from 'react-router-dom';
import { Callout } from '../../../components/ui/Callout';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { FeatureCardGrid } from '../../../components/ui/FeatureCard';
import { Sandbox } from '../../../components/ui/Sandbox';
import { LightboxDemo } from '../../../components/demos/LightboxDemo';
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
  Link2,
} from 'lucide-react';
import { Heading } from '../../../components/ui/Heading';
import { zhPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/lightbox',
    title: 'React Lightbox · ReelKit',
    description:
      '全屏图片画廊浮层：双轴 URL、子组件、内容加载与错误处理、过渡动画与 CSS 类名。',
  });

// Headings carry the English slug as an explicit id — the slug generator
// is ascii-only, so a Chinese heading would produce an empty anchor.

const fullCode = `import { useState } from 'react';
import {
  LightboxOverlay,
  flipTransition,
  lightboxFadeTransition,
  lightboxZoomTransition,
  slideTransition,
  type LightboxItem,
} from '@reelkit/react-lightbox';
import type { TransitionTransformFn } from '@reelkit/react';
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

const transitions: { label: string; fn: TransitionTransformFn }[] = [
  { label: 'slide', fn: slideTransition },
  { label: 'fade', fn: lightboxFadeTransition },
  { label: 'flip', fn: flipTransition },
  { label: 'zoom-in', fn: lightboxZoomTransition },
];

export default function App() {
  const [index, setIndex] = useState<number | null>(null);
  const [transitionFn, setTransitionFn] = useState<TransitionTransformFn>(
    () => slideTransition,
  );

  return (
    <div style={{ padding: 16, background: '#f8fafc', minHeight: '100vh' }}>
      {/* Transition picker */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {transitions.map((t) => (
          <button
            key={t.label}
            onClick={() => setTransitionFn(() => t.fn)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 500,
              background: transitionFn === t.fn ? '#6366f1' : '#e2e8f0',
              color: transitionFn === t.fn ? '#fff' : '#334155',
            }}
          >
            {t.label}
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
        transitionFn={transitionFn}
      />
    </div>
  );
}`;

const lightboxProps = [
  {
    prop: 'isOpen',
    type: 'boolean',
    default: '必填',
    description:
      '控制Lightbox的显示。如果希望由 URL 驱动打开状态，请改用独立的 LightboxUrlOverlay —— 见下面的 URL 状态。',
  },
  {
    prop: 'images',
    type: 'LightboxItem[]',
    default: '必填',
    description: '要显示的图片数组',
  },
  {
    prop: 'ariaLabel',
    type: 'string',
    default: "'Image gallery'",
    description: '对话框区域的无障碍标签；Lightbox打开时由屏幕阅读器播报',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: '起始图片索引',
  },
  {
    prop: 'transitionFn',
    type: 'TransitionTransformFn',
    default: 'slideTransition',
    description:
      '幻灯片过渡函数。可以引入内置的（slideTransition、flipTransition、lightboxFadeTransition、lightboxZoomTransition），也可以传自定义的。省略时默认为 slideTransition。',
  },
  {
    prop: 'apiRef',
    type: 'MutableRefObject<ReelApi>',
    default: '-',
    description: '用于访问 Reel API 的 ref',
  },
  {
    prop: 'renderControls',
    type: '(props: ControlsRenderProps) => ReactNode',
    default: '-',
    description: '自定义控件，替换默认的关闭按钮、计数器和全屏开关',
  },
  {
    prop: 'renderNavigation',
    type: '(props: NavigationRenderProps) => ReactNode',
    default: '-',
    description: '自定义导航，替换默认的上一张 / 下一张箭头',
  },
  {
    prop: 'renderInfo',
    type: '(props: InfoRenderProps) => ReactNode',
    default: '-',
    description:
      '自定义信息浮层，替换默认的标题 + 描述渐变层。返回 null 则隐藏。',
  },
  {
    prop: 'renderSlide',
    type: '(props: SlideRenderProps) => ReactNode | null',
    default: '-',
    description:
      '自定义幻灯片渲染。接收 { item, index, size, isActive, onReady, onWaiting, onError }。返回 null 则回退到默认实现。',
  },
  {
    prop: 'renderLoading',
    type: '(props: { item: LightboxItem; activeIndex: number }) => ReactNode',
    default: '-',
    description: '自定义加载提示，替换默认的转圈动画',
  },
  {
    prop: 'renderError',
    type: '(props: { item: LightboxItem; activeIndex: number }) => ReactNode',
    default: '-',
    description: '自定义错误提示，替换默认的错误图标',
  },
];

const lightboxCallbacks = [
  {
    prop: 'onClose',
    type: '() => void',
    description:
      'Lightbox关闭时调用。在 LightboxOverlay 上是必填的（打开状态归你管，所以关闭也得你处理）；在 LightboxUrlOverlay 上是可选的，那里由 URL 驱动关闭 —— 只在你需要关闭后做点什么时才传。',
  },
  {
    prop: 'onSlideChange',
    type: '(index: number) => void',
    description: '幻灯片切换后调用',
  },
];

const lightboxUrlProps = [
  {
    prop: 'controller',
    type: 'UrlStateController',
    default: '必填',
    description:
      '来自 useOverlayUrlState 的控制器。它的 position 决定浮层是否打开、显示哪一张；浮层会在切换幻灯片和关闭时通过它写回。',
  },
];

const reelProps = [
  {
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description: '启用无限循环',
  },
  {
    prop: 'enableNavKeys',
    type: 'boolean',
    default: 'true',
    description: '启用键盘导航',
  },
  {
    prop: 'enableWheel',
    type: 'boolean',
    default: 'true',
    description: '启用鼠标滚轮导航',
  },
  {
    prop: 'wheelDebounceMs',
    type: 'number',
    default: '200',
    description: '滚轮防抖时长（毫秒）',
  },
  {
    prop: 'transitionDuration',
    type: 'number',
    default: '300',
    description: '过渡动画时长（毫秒）',
  },
  {
    prop: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: '滑动阈值（0-1）',
  },
  {
    prop: 'swipeToCloseDirection',
    type: "'up' | 'down'",
    default: "'up'",
    description: '移动端滑动关闭手势的方向',
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
    description: '根容器（全屏背景层）',
  },
  {
    className: '.rk-lightbox-spinner',
    component: 'Overlay',
    description: '默认的加载转圈动画',
  },
  {
    className: '.rk-lightbox-img-error',
    component: 'Overlay',
    description: '错误状态容器（图片 / 视频损坏）',
  },
  {
    className: '.rk-lightbox-img-error-text',
    component: 'Overlay',
    description: '错误状态文字标签',
  },
  {
    className: '.rk-lightbox-swipe-hint',
    component: 'Overlay',
    description: '移动端滑动提示',
  },

  // Controls
  {
    className: '.rk-lightbox-controls-left',
    component: '控制内容',
    description: '左上角控件容器',
  },
  {
    className: '.rk-lightbox-btn',
    component: '控制内容',
    description: '控制按钮（全屏等）',
  },
  {
    className: '.rk-lightbox-close',
    component: '控制内容',
    description: '关闭按钮',
  },
  {
    className: '.rk-lightbox-counter',
    component: '控制内容',
    description: '图片计数标签',
  },

  // Navigation
  {
    className: '.rk-lightbox-nav',
    component: '导航',
    description: '导航箭头（两侧）',
  },
  {
    className: '.rk-lightbox-nav-prev',
    component: '导航',
    description: '上一张箭头',
  },
  {
    className: '.rk-lightbox-nav-next',
    component: '导航',
    description: '下一张箭头',
  },

  // Info
  {
    className: '.rk-lightbox-info',
    component: 'Info',
    description: '标题 / 描述容器',
  },
  {
    className: '.rk-lightbox-title',
    component: 'Info',
    description: '图片标题',
  },
  {
    className: '.rk-lightbox-description',
    component: 'Info',
    description: '图片描述',
  },

  // Slide
  {
    className: '.rk-lightbox-slide',
    component: 'Slide',
    description: '幻灯片容器',
  },
  {
    className: '.rk-lightbox-img',
    component: 'Slide',
    description: '图片元素',
  },

  // VideoSlide
  {
    className: '.rk-lightbox-video-container',
    component: 'VideoSlide',
    description: '视频幻灯片容器（按需开启）',
  },
  {
    className: '.rk-lightbox-video-element',
    component: 'VideoSlide',
    description: '视频元素（按需开启）',
  },
  {
    className: '.rk-lightbox-video-poster',
    component: 'VideoSlide',
    description: '视频封面图（按需开启）',
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
          一个全屏的图片与视频画廊Lightbox组件，基于{' '}
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
          查看在线演示 &rarr;
        </a>
      </div>

      {/* Features */}
      <section className="mb-12">
        <Heading level={2} id="features" className="text-2xl font-bold mb-4">
          特性
        </Heading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FeatureCardGrid
            items={[
              {
                icon: Image,
                label: '图片与视频',
                desc: '内置视频幻灯片支持',
              },
              {
                icon: MousePointer,
                label: '触摸手势',
                desc: '滑动翻页',
              },
              {
                icon: X,
                label: '滑动关闭',
                desc: '上滑关闭',
              },
              {
                icon: Keyboard,
                label: '键盘导航',
                desc: '方向键 + Escape',
              },
              {
                icon: Maximize2,
                label: '全屏',
                desc: '跨浏览器 API',
              },
              {
                icon: Hash,
                label: '过渡动画',
                desc: '滑动、淡入、翻转、放大',
              },
              {
                icon: Zap,
                label: '预加载',
                desc: '相邻图片预取',
              },
              {
                icon: Volume2,
                label: '声音开关',
                desc: '逐张静音 / 取消静音',
              },
              {
                icon: Loader,
                label: '加载状态',
                desc: '转圈动画 + 自定义渲染',
              },
              {
                icon: AlertTriangle,
                label: '错误处理',
                desc: '错误图标 + 自定义渲染',
              },
              {
                icon: Layers,
                label: 'Render Props',
                desc: '6 个可定制的渲染区域',
              },
              {
                icon: Layers,
                label: 'Hooks',
                desc: 'useVideoSlideRenderer + useFullscreen',
              },
              {
                icon: Link2,
                label: 'URL 状态',
                desc: '可分享、可收藏的链接',
              },
            ]}
          />
        </div>
      </section>

      {/* Installation */}
      <section className="mb-12">
        <Heading
          level={2}
          id="installation"
          className="text-2xl font-bold mb-4"
        >
          安装
        </Heading>
        <CodeBlock
          code="npm install @reelkit/react-lightbox @reelkit/react lucide-react"
          language="bash"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          别忘了引入样式：
        </p>
        <CodeBlock
          code={`import '@reelkit/react-lightbox/styles.css';`}
          language="typescript"
        />
        <Callout type="info" title="图标" className="mt-4">
          默认控件使用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lucide-react
          </code>{' '}
          作为图标。如果你想换一套图标库，可以用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderControls
          </code>{' '}
          和{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderNavigation
          </code>{' '}
          提供自己的实现。
        </Callout>
      </section>

      {/* Quick Start */}
      <section className="mb-12">
        <Heading level={2} id="quick-start" className="text-2xl font-bold mb-4">
          快速上手
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            LightboxOverlay
          </code>{' '}
          组件以全屏方式展示图片。传入一组{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            LightboxItem
          </code>{' '}
          对象，并用一个可为 null 的索引控制显示。
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
        <Heading level={2} id="live-demo" className="text-2xl font-bold mb-4">
          在线演示
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
          点缩略图打开Lightbox。用方向键或滑动翻页。
        </p>
      </section>

      {/* Video Slides (Opt-in) */}
      <section className="mb-12">
        <Heading
          level={2}
          id="video-slides-opt-in"
          className="text-2xl font-bold mb-4"
        >
          视频幻灯片（按需开启）
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          视频支持完全按需开启且可被 tree-shaking ——
          只用图片时不会增加任何体积。引入{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useVideoSlideRenderer
          </code>{' '}
          并把它的返回值接到{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            LightboxOverlay
          </code>
          。这个 Hook 会自动处理加载状态、声音管理和视频生命周期。
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

        <Callout type="info" title="工作原理" className="mt-4">
          <ul className="list-disc ml-4 space-y-1">
            <li>
              这个 Hook 返回{' '}
              <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                SoundProvider
              </code>{' '}
              —— 把浮层包在它里面，静音开关才能生效
            </li>
            <li>幻灯片变为活动时视频会自动播放（默认静音）</li>
            <li>各幻灯片复用同一个 video 元素，以保证 iOS 上声音连续</li>
            <li>视频幻灯片上会自动出现声音按钮，带响应式的静音开关</li>
            <li>
              没有{' '}
              <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                type: 'video'
              </code>{' '}
              的条目按图片渲染（向后兼容）
            </li>
          </ul>
        </Callout>
      </section>

      {/* Customization */}
      <section className="mb-12">
        <Heading
          level={2}
          id="customization"
          className="text-2xl font-bold mb-4"
        >
          自定义
        </Heading>

        <Heading
          level={3}
          id="custom-controls"
          className="text-xl font-semibold mt-4 mb-4"
        >
          自定义控件
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          使用{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderControls
          </code>{' '}
          替换默认的关闭按钮、计数器和全屏开关。可以和导出的子组件组合使用：
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

        <Heading
          level={3}
          id="custom-info-overlay"
          className="text-xl font-semibold mt-8 mb-4"
        >
          自定义信息浮层
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          使用{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderInfo
          </code>{' '}
          替换默认的标题 / 描述渐变层，或者传{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'renderInfo={() => null}'}
          </code>{' '}
          把它整个隐藏：
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

        <Heading
          level={3}
          id="custom-navigation"
          className="text-xl font-semibold mt-8 mb-4"
        >
          自定义导航
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          使用{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderNavigation
          </code>{' '}
          替换默认的上一张 / 下一张箭头：
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

        <Heading
          level={3}
          id="custom-slide"
          className="text-xl font-semibold mt-8 mb-4"
        >
          自定义幻灯片
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          使用{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlide
          </code>{' '}
          可以完全自定义幻灯片内容。返回{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            null
          </code>{' '}
          则回退到默认的图片幻灯片：
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
        <Heading
          level={2}
          id="content-loading-error-handling"
          className="text-2xl font-bold mb-4"
        >
          内容加载与错误处理
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Lightbox会逐张跟踪加载和错误状态。内容加载时显示转圈动画；媒体失败时显示图片损坏图标。出错的
          URL 会被缓存，再次访问时立刻显示错误而不重试。
        </p>

        <Heading
          level={3}
          id="lifecycle-callbacks"
          className="text-xl font-semibold mt-6 mb-4"
        >
          生命周期回调
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          使用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderSlide
          </code>
          时，请调用这些回调来控制加载提示：
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">回调</th>
                <th className="text-left py-3 px-4 font-semibold">何时调用</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onReady
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  图片已加载，或视频已开始播放。会清除加载和错误状态。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onWaiting
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  视频在播放途中正在缓冲。显示加载提示。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onError
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  内容加载失败。显示错误浮层，并把该 URL 标记为损坏缓存起来。
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

        <Heading
          level={3}
          id="custom-loading-error-ui"
          className="text-xl font-semibold mt-8 mb-4"
        >
          自定义加载与错误界面
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          用自定义组件替换默认的转圈动画和错误图标：
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

      {/* URL state */}
      <section className="mb-12">
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          URL 状态
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            LightboxUrlOverlay
          </code>{' '}
          是一个独立组件，它的打开状态存放在地址栏里。用{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useOverlayUrlState
          </code>{' '}
          from{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react
          </code>{' '}
          构建控制器，再作为{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            controller
          </code>
          传进去：参数指向某张幻灯片时画廊自己打开，参数消失时关闭。链接可以分享，返回键关闭的是画廊而不是离开页面。
        </p>
        <Callout type="info" title="内置的 key" className="mb-4">
          可以用内置的 key 来寻址幻灯片 —— 把{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlIndexKey
          </code>{' '}
          （按位置）或{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlStableIdKey
          </code>{' '}
          （按稳定的{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            id
          </code>
          ）展开进控制器 —— 两者都从{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react
          </code>
          . See the{' '}
          <Link
            to="/zh/docs/core/guide#url-state"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            URL 状态指南
          </Link>{' '}
          和{' '}
          <Link
            to="/zh/docs/core/api#url-state"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            核心 API
          </Link>
          .
        </Callout>
        <CodeBlock
          code={`import { useOverlayUrlState, urlIndexKey, urlStableIdKey } from '@reelkit/react';
import { LightboxUrlOverlay } from '@reelkit/react-lightbox';
import { Link } from 'react-router-dom';

const photo = useOverlayUrlState({
  param: 'photo',
  ...urlIndexKey(() => images.length),
});

// Opening is a link — the href is the open action. No open flag, no handler:
// the overlay reads the URL and opens itself.
{images.map((image, i) => (
  <Link key={image.src} to={\`?photo=\${i}\`}>
    <img src={image.src} />
  </Link>
))}

<LightboxUrlOverlay controller={photo} images={images} />`}
          language="tsx"
        />

        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          这个 Hook 接受一个选项对象，返回一个{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            UrlStateController
          </code>{' '}
          （带{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            set
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            index
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            value
          </code>
          ）。留着它就能编程式地控制：{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            set
          </code>{' '}
          是浮层内部使用的底层写入（切换幻灯片，以及用{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            set(null)
          </code>{' '}
          关闭）。它同样可以编程式驱动浮层 ——{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            set(index)
          </code>{' '}
          会打开它，效果和导航到该参数一样。不过打开时更推荐用链接：href
          可以分享、能在新标签页打开、返回键会关闭它 —— 全都不用写处理函数。
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          完整的{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useOverlayUrlState
          </code>{' '}
          选项（
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            param
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            adapter
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            codec
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locator
          </code>
          ）：见{' '}
          <Link
            to="/zh/docs/react/api#useoverlayurlstate"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            React API 参考
          </Link>
          .
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            LightboxUrlOverlay
          </code>{' '}
          本身只接受{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            controller
          </code>{' '}
          （必填）、可选的{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            onClose
          </code>
          ，外加所有视觉和行为属性{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            LightboxOverlay
          </code>{' '}
          所接受的（{''}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            images
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ariaLabel
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            transitionFn
          </code>
          、各种 render props 等等）—— 但没有{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            isOpen
          </code>
          .
        </p>
        <ul className="mt-4 mb-4 list-disc pl-6 space-y-1 text-slate-600 dark:text-slate-400">
          <li>
            打开会花掉一条历史记录。翻页则是替换它，所以滑一百次也不会多出记录
            —— 退一步永远就是离开画廊。返回键关闭画廊，不会逐张后退。
          </li>
          <li>
            像{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              ?photo=3
            </code>{' '}
            这样的分享链接会把画廊直接打开到那一张。关闭随页面一起到达的链接时，会就地移除参数，而不是导航离开你的站点。
          </li>
          <li>
            <strong>只有从应用内部打开时返回键才会关闭</strong> ——
            因为那次链接压入了一条记录，返回就会弹回画廊。在新标签页里直接打开的分享链接背后没有历史，浏览器返回会离开站点；这时关闭按钮或
            Escape 会就地移除参数，把你留在画廊上。
          </li>
          <li>
            指向不存在幻灯片的参数 —— 过期的书签、手改的值 —— 会从 URL
            中移除，而不是让地址栏继续声称一张打不开的幻灯片。
          </li>
        </ul>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          <strong>带路由的应用请传入适配器。</strong> 直接写历史会让路由器自己的
          location 过期，下一次导航就会把参数丢掉。
        </p>
        <CodeBlock
          code={`import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';

const adapter = useReactRouterUrlAdapter();
const photo = useOverlayUrlState({
  param: 'photo',
  adapter,
  ...urlIndexKey(() => images.length),
});

<LightboxUrlOverlay controller={photo} images={images} />`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          <strong>打开就是一个链接。</strong> 因为打开状态存放在 URL
          里，缩略图就是一个普通链接 —— 不需要点击处理函数 ——
          浏览器自带的行为也就免费到手：新标签页打开、复制地址、悬停预览。带路由的应用请用路由器的链接组件，让导航保持在客户端。
        </p>
        <CodeBlock
          code={`import { Link } from 'react-router-dom';

// The href is the open action — no onClick, no open flag.
{images.map((image, i) => (
  <Link key={image.src} to={\`?photo=\${i}\`}>
    <img src={image.src} />
  </Link>
))}

<LightboxUrlOverlay controller={photo} images={images} />`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          <strong>分享链接请优先使用稳定身份。</strong>{' '}
          索引是按位置的，所以收藏下来的{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ?photo=3
          </code>{' '}
          在列表重新排序后就会打开另一张图片。{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlStableIdKey
          </code>{' '}
          按每个条目稳定的{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            id
          </code>
          来寻址，扫描当前列表 —— 一次调用就覆盖了常见场景。
        </p>
        <CodeBlock
          code={`const photo = useOverlayUrlState({
  param: 'photo',
  ...urlStableIdKey({ items: () => images }),
});

<LightboxUrlOverlay controller={photo} images={images} />`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          传入{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            hashCodec: base64UrlCodec
          </code>{' '}
          即可把 URL 中的 id 做 base64url 编码 —— 这是可逆的混淆，不是加密哈希。
        </p>
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          想按别的字段（比如{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            slug
          </code>
          ）来寻址，或者用{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locateAsync
          </code>
          给无限信息流翻页，就自己构建{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            codec
          </code>
          /
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locator
          </code>{' '}
          ：
        </p>
        <CodeBlock
          code={`const photo = useOverlayUrlState({
  param: 'photo',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => images.findIndex((x) => x.slug === id),
    identify: (index) => images[index].slug,
  },
});

<LightboxUrlOverlay controller={photo} images={images} />`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          <strong>无限或分页画廊。</strong> 同步的{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locate
          </code>{' '}
          只能回答已经加载过的图片 —— 只加载了 20 张时，指向第 400
          张的分享链接就查不到。{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locateAsync
          </code>{' '}
          是兜底，只有在{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locate
          </code>{' '}
          未命中时才调用。
        </p>
        <Callout type="info" title="快捷键" className="mb-4">
          只想按条目的{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            id
          </code>
          来寻址？那就不必手写编解码器和定位器 —— 直接把{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locateAsync
          </code>{' '}
          传给{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlStableIdKey({'{ items, locateAsync }'})
          </code>{' '}
          （未命中时它会去拉取，然后返回索引）。下面更完整的写法是给按别的字段寻址、或者需要完全掌控的场景准备的。
        </Callout>
        <CodeBlock
          code={`const photo = useOverlayUrlState({
  param: 'photo',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => images.findIndex((x) => x.id === id),
    identify: (index) => images[index].id,
    locateAsync: async (id) => {
      const loaded = await loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!loaded) return null; // exhausted — link names no image
      setImages(loaded); // commit — the overlay renders from this state
      return loaded.findIndex((x) => x.id === id); // wherever it landed
    },
  },
});

<LightboxUrlOverlay controller={photo} images={images} />`}
          language="tsx"
        />
        <ul className="mt-4 list-disc pl-6 space-y-1 text-slate-600 dark:text-slate-400">
          <li>
            怎么加载由你决定 ——
            可以一页页拉到目标处，也可以只拉那一张图片再追加进去。URL
            是按身份而不是按位置寻址的，所以{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              findIndex
            </code>{' '}
            返回它最终落在哪里都行。
          </li>
          <li>
            在{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              locateAsync
            </code>{' '}
            未完成期间，Lightbox保持关闭，参数也不动，因此深链能熬过这次请求。{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              null
            </code>{' '}
            或请求被拒绝则会移除参数。
          </li>
          <li>
            如果结果在 URL
            已经变化、播放器已关闭或组件已卸载之后才到达，就会被丢弃 ——
            慢请求不能打开一张没人要的幻灯片。
          </li>
          <li>
            等待期间什么都不渲染；加载状态本来就归页面自己管，所以请渲染你自己的骨架屏。
          </li>
          <li>
            没有超时机制 —— Lightbox无从得知画廊有多长。分页用尽时请以{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              null
            </code>{' '}
            结束，否则浮层会一直关着。
          </li>
          <li>
            无论{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              locateAsync
            </code>{' '}
            返回什么都以它为准 ——
            就是它刚取到的数据的索引，直接采用，不会再去读一遍{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              images
            </code>
            .
          </li>
        </ul>
      </section>

      {/* API Reference */}
      <section className="mb-12">
        <Heading
          level={2}
          id="api-reference"
          className="text-2xl font-bold mb-4"
        >
          API 参考
        </Heading>

        <Heading
          level={3}
          id="lightboxoverlay-props"
          className="text-xl font-semibold mt-6 mb-4"
        >
          LightboxOverlay 属性
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-mono">
          LightboxOverlayProps
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">属性</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">默认值</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
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

        <Heading
          level={3}
          id="lightboxurloverlay-props"
          className="text-xl font-semibold mt-8 mb-2"
        >
          LightboxUrlOverlay 属性
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-mono">
          LightboxUrlOverlayProps
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          接受上面所有视觉和行为属性，除了{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            isOpen
          </code>
          ，并把它换成{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            controller
          </code>
          .{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            initialIndex
          </code>{' '}
          在这里会被忽略 —— 由控制器的 position
          决定打开哪一张，所以同时传入的值每次打开都会被覆盖。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">属性</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">默认值</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {lightboxUrlProps.map((p) => (
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

        <Heading
          level={3}
          id="callbacks"
          className="text-xl font-semibold mt-8 mb-4"
        >
          回调
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">属性</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
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

        <Heading
          level={3}
          id="reel-props-proxied"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Reel 属性（透传）
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          这些属性会转发给底层的{' '}
          <Link
            to="/zh/docs/react/api#reel-props"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            Reel
          </Link>{' '}
          组件。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">属性</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">默认值</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
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
        <Heading level={2} id="types" className="text-2xl font-bold mb-4">
          类型
        </Heading>

        <Heading
          level={3}
          id="lightboxitem"
          className="text-lg font-semibold mb-2"
        >
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

        <Heading
          level={3}
          id="controlsrenderprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
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

        <Heading
          level={3}
          id="navigationrenderprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
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

        <Heading
          level={3}
          id="sliderenderprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
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

        <Heading
          level={3}
          id="inforenderprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
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
        <Heading
          level={2}
          id="sub-components"
          className="text-2xl font-bold mb-4"
        >
          子组件
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          可复用的子组件，用于通过{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderControls
          </code>
          .
        </p>

        <Heading
          level={3}
          id="closebutton"
          className="text-lg font-semibold mt-4 mb-2"
        >
          CloseButton
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          默认的 ✕ 关闭按钮。
        </p>
        <CodeBlock
          code={`import { CloseButton } from '@reelkit/react-lightbox';

<CloseButton onClick={onClose} />`}
          language="tsx"
        />

        <Heading
          level={3}
          id="counter"
          className="text-lg font-semibold mt-6 mb-2"
        >
          计数器
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          显示 “1 / 3” 的图片计数标签。
        </p>
        <CodeBlock
          code={`import { Counter } from '@reelkit/react-lightbox';

<Counter currentIndex={activeIndex} count={count} />`}
          language="tsx"
        />

        <Heading
          level={3}
          id="fullscreenbutton"
          className="text-lg font-semibold mt-6 mb-2"
        >
          FullscreenButton
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          全屏开关按钮（Maximize/Minimize 图标）。
        </p>
        <CodeBlock
          code={`import { FullscreenButton } from '@reelkit/react-lightbox';

<FullscreenButton isFullscreen={isFullscreen} onToggle={onToggleFullscreen} />`}
          language="tsx"
        />

        <Heading
          level={3}
          id="soundbutton"
          className="text-lg font-semibold mt-6 mb-2"
        >
          SoundButton
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          视频幻灯片的静音开关按钮（Volume2/VolumeX 图标）。已自动包含在{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderControls
          </code>{' '}
          from{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useVideoSlideRenderer
          </code>
          中。若要在自定义控件里单独使用，请通过{' '}
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
        <Heading level={2} id="hooks" className="text-2xl font-bold mb-4">
          Hooks
        </Heading>

        <Heading
          level={3}
          id="usevideosliderenderer"
          className="text-lg font-semibold mb-2"
        >
          useVideoSlideRenderer
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          按需启用视频支持的 Hook。返回{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlide
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderControls
          </code>
          、{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            SoundProvider
          </code>{' '}
          —— 把浮层包在 SoundProvider 里，并把这些渲染函数传进去。
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

        <Heading
          level={3}
          id="usefullscreen"
          className="text-lg font-semibold mt-6 mb-2"
        >
          useFullscreen
        </Heading>
        <Callout type="warning" title="已迁移" className="mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            useFullscreen
          </code>{' '}
          已从{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/react-lightbox
          </code>
          中移除。请改从{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/react
          </code>{' '}
          引入。
        </Callout>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          管理全屏状态的 Hook，跨浏览器可用。
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
        <Heading level={2} id="transitions" className="text-2xl font-bold mb-4">
          过渡动画
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          把任意{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            TransitionTransformFn
          </code>{' '}
          通过{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            transitionFn
          </code>{' '}
          属性传入。只引入你用到的那个过渡，打包器就能把其余的摇掉。省略时默认为{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            slideTransition
          </code>{' '}
          。
        </p>

        <div className="overflow-x-auto mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">函数</th>
                <th className="text-left py-3 px-4 font-semibold">来源</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600">
                  slideTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  @reelkit/react-lightbox
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  标准横向滑动（默认）
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600">
                  lightboxFadeTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  @reelkit/react-lightbox
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  图片之间交叉淡入淡出
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600">
                  flipTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  @reelkit/react-lightbox
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  3D 翻卡效果
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600">
                  lightboxZoomTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  @reelkit/react-lightbox
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  从缩小状态放大到正常尺寸
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock
          code={`import {
  LightboxOverlay,
  lightboxFadeTransition,
} from '@reelkit/react-lightbox';

<LightboxOverlay
  isOpen={isOpen}
  images={images}
  initialIndex={0}
  onClose={handleClose}
  transitionFn={lightboxFadeTransition}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="custom-transition-function"
          className="text-xl font-semibold mt-8 mb-4"
        >
          自定义过渡函数
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          自己写一个{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            TransitionTransformFn
          </code>{' '}
          ，通过{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            transitionFn
          </code>
          属性传入。签名与核心滑动器的过渡函数一致。
        </p>
        <CodeBlock
          code={`import {
  LightboxOverlay,
  type TransitionTransformFn,
} from '@reelkit/react-lightbox';

const customFade: TransitionTransformFn = (offset, size) => ({
  transform: \`translate3d(\${offset * size[0]}px, 0, 0)\`,
  opacity: 1 - Math.min(Math.abs(offset), 1),
});

<LightboxOverlay
  isOpen={isOpen}
  images={images}
  transitionFn={customFade}
  onClose={() => setIsOpen(false)}
/>`}
          language="tsx"
        />
      </section>

      {/* CSS Classes */}
      <section className="mb-12">
        <Heading level={2} id="css-classes" className="text-2xl font-bold mb-4">
          CSS 类名
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          所有界面元素都使用普通 CSS 类名（不是 CSS Modules），可以在{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-lightbox/styles.css
          </code>
          之后加载的样式表里用更高优先级的选择器覆盖它们。若只是改颜色、尺寸和
          z-index，请优先使用下面{' '}
          <Link
            to={{ hash: '#theming' }}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            主题定制
          </Link>{' '}
          一节。
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">类名</th>
                <th className="text-left py-3 px-4 font-semibold">组件</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
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
        <Heading level={2} id="theming" className="text-2xl font-bold mb-4">
          主题定制
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          每一个颜色、尺寸、z-index 和过渡都放在 CSS 自定义属性里。在{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            :root
          </code>{' '}
          （或Lightbox的任意祖先元素）上覆盖，即可在不改组件源码的情况下换主题。
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">变量</th>
                <th className="text-left py-3 px-4 font-semibold">默认值</th>
                <th className="text-left py-3 px-4 font-semibold">控制内容</th>
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
          把下面这段放进在{' '}
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
        <Heading
          level={2}
          id="accessibility"
          className="text-2xl font-bold mb-4"
        >
          无障碍
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          浮层根节点是一个模态对话框（
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="dialog"
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-modal="true"
          </code>
          ）。设置{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ariaLabel
          </code>{' '}
          可以改变屏幕阅读器的播报内容，默认是 “Image gallery”。每张幻灯片都带有{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="group"
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-roledescription="slide"
          </code>
          、{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-label="第 N 张，共 M 张"
          </code>
          .
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Lightbox打开时捕获焦点，关闭时把焦点还给触发元素。Tab 和 Shift+Tab
          在内部的可聚焦元素之间循环；跑出去的焦点（点击外部、程序化聚焦）会被拉回来。实现基于{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            captureFocusForReturn
          </code>{' '}
          和{' '}
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
        <Heading
          level={2}
          id="keyboard-shortcuts"
          className="text-2xl font-bold mb-4"
        >
          键盘快捷键
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Key</th>
                <th className="text-left py-3 px-4 font-semibold">作用</th>
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
