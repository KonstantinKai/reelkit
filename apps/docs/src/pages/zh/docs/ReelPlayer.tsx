import { Link } from 'react-router-dom';
import { Callout } from '../../../components/ui/Callout';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { FeatureCardGrid } from '../../../components/ui/FeatureCard';
import { Sandbox } from '../../../components/ui/Sandbox';
import { ReelPlayerDemo } from '../../../components/demos/ReelPlayerDemo';
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
  Link2,
} from 'lucide-react';
import { Heading } from '../../../components/ui/Heading';
import { zhPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/reel-player',
    title: 'React Reel Player · ReelKit',
    description:
      '全屏 Instagram / TikTok 风格的视频播放浮层：URL 状态、时间轴、声音上下文、主题与无障碍。',
  });

// Headings carry the English slug as an explicit id — the slug generator
// is ascii-only, so a Chinese heading would produce an empty anchor.

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
    prop: 'apiRef',
    type: 'MutableRefObject<ReelApi>',
    default: '-',
    description: '用于访问 Reel API 的 ref',
  },
  {
    prop: 'ariaLabel',
    type: 'string',
    default: "'Video player'",
    description: '对话框区域的无障碍标签；浮层打开时由屏幕阅读器播报',
  },
  {
    prop: 'aspectRatio',
    type: 'number',
    default: '9/16 (0.5625)',
    description: '桌面端播放器容器的宽高比。移动端播放器始终占满视口。',
  },
  {
    prop: 'content',
    type: 'T[]',
    default: '必填',
    description: '内容条目数组（泛型，默认为 ContentItem）',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: '起始幻灯片索引',
  },
  {
    prop: 'initialInnerIndex',
    type: 'number',
    default: '0',
    description:
      '打开时定位的内层媒体索引，只对最初可见的那条帖子生效 —— 让双轴 URL 能直达多媒体帖子里的某一张图。播放器打开后用户一开始导航就会忽略它。',
  },
  {
    prop: 'isOpen',
    type: 'boolean',
    default: '必填',
    description:
      '控制浮层的显示。如果希望由 URL 驱动打开状态，请改用独立的 ReelPlayerUrlOverlay —— 见下面的 URL 状态。',
  },
  {
    prop: 'timeline',
    type: "'auto' | 'always' | 'never'",
    default: "'auto'",
    description:
      "Gating strategy for the built-in playback timeline bar. 'auto' renders only for videos longer than timelineMinDurationSeconds; 'always' renders whenever the active slide has a video; 'never' disables the built-in bar (use renderTimeline for a fully custom replacement).",
  },
  {
    prop: 'timelineMinDurationSeconds',
    type: 'number',
    default: '30',
    description:
      "Minimum video duration (seconds) for timeline='auto' to render the built-in bar. Short looping clips below this threshold are suppressed.",
  },
  {
    prop: 'renderControls',
    type: '(props: ControlsRenderProps) => ReactNode',
    default: '-',
    description: '自定义控件，替换默认的关闭 + 声音按钮',
  },
  {
    prop: 'renderError',
    type: '(props: { item: T; activeIndex: number }) => ReactNode',
    default: '-',
    description: '自定义错误提示，替换默认的错误图标',
  },
  {
    prop: 'renderLoading',
    type: '(props: { item: T; activeIndex: number }) => ReactNode',
    default: '-',
    description: '自定义加载提示，替换默认的波浪加载动画',
  },
  {
    prop: 'renderNavigation',
    type: '(props: NavigationRenderProps) => ReactNode',
    default: '-',
    description: '自定义导航，替换默认的竖向箭头',
  },
  {
    prop: 'renderNestedNavigation',
    type: '(props: NavigationRenderProps) => ReactNode',
    default: '-',
    description: '嵌套横向滑动器（多媒体帖子）的自定义导航，替换默认的左右箭头',
  },
  {
    prop: 'renderNestedSlide',
    type: '(props: NestedSlideRenderProps) => ReactNode',
    default: '-',
    description:
      '嵌套横向滑动器条目的自定义渲染器。用 props.defaultContent 包裹或嵌入默认的 ImageSlide/VideoSlide。与 renderSlide 不同，这里返回 null 不会回退到默认实现。',
  },
  {
    prop: 'renderSlide',
    type: '(props: SlideRenderProps) => ReactNode | null',
    default: '-',
    description:
      '自定义幻灯片渲染。返回 null 则回退到默认实现。用 props.defaultContent 包裹或嵌入默认幻灯片。',
  },
  {
    prop: 'renderSlideOverlay',
    type: '(item, index, isActive) => ReactNode',
    default: '-',
    description:
      '每张幻灯片的自定义浮层，替换默认的 SlideOverlay。返回 null 则隐藏。',
  },
  {
    prop: 'renderTimeline',
    type: '(props: TimelineRenderProps) => ReactNode',
    default: '-',
    description:
      '自定义播放时间轴条。只有在门控规则会渲染默认条时才会调用（同样是 auto/always/never + timelineMinDurationSeconds 的逻辑）。用 props.defaultContent 包裹内置的 <TimelineBar />；返回 null 则隐藏。',
  },
];

const reelPlayerUrlProps = [
  {
    prop: 'controller',
    type: 'UrlStateController',
    default: '必填',
    description:
      '来自 useOverlayUrlState 的控制器。它的 position 决定浮层是否打开、显示哪一张；浮层会在切换幻灯片和关闭时通过它写回。',
  },
];

const reelPlayerCallbacks = [
  {
    prop: 'onClose',
    type: '() => void',
    description:
      '播放器关闭时调用。在 ReelPlayerOverlay 上是必填的（打开状态归你管，所以关闭也得你处理）；在 ReelPlayerUrlOverlay 上是可选的，那里由 URL 驱动关闭 —— 只在你需要关闭后做点什么时才传。',
  },
  {
    prop: 'onSlideChange',
    type: '(index: number) => void',
    description: '幻灯片切换后调用',
  },
  {
    prop: 'onInnerSlideChange',
    type: '(outerIndex: number, innerIndex: number) => void',
    description:
      "Called when the active post's inner media index changes — on inner navigation within a multi-media post, and on outer activation, reporting the activated post's current inner index (0 for a single-media post).",
  },
];

const reelProps = [
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
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description: '启用无限循环',
  },
  {
    prop: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: '滑动阈值（0-1）',
  },
  {
    prop: 'transitionDuration',
    type: 'number',
    default: '300',
    description: '过渡动画时长（毫秒）',
  },
  {
    prop: 'wheelDebounceMs',
    type: 'number',
    default: '200',
    description: '滚轮防抖时长（毫秒）',
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

  // Playback timeline bar
  {
    token: '--rk-reel-timeline-track',
    default: 'rgba(255, 255, 255, 0.22)',
    controls: 'Track background (unplayed region)',
  },
  {
    token: '--rk-reel-timeline-buffered',
    default: 'rgba(255, 255, 255, 0.4)',
    controls: 'Buffered segments color',
  },
  {
    token: '--rk-reel-timeline-fill',
    default: '#fff',
    controls: 'Played-progress fill color',
  },
  {
    token: '--rk-reel-timeline-cursor',
    default: '#fff',
    controls: 'Scrub-handle pill color',
  },
  {
    token: '--rk-reel-timeline-height',
    default: '3px',
    controls: 'Track height at rest',
  },
  {
    token: '--rk-reel-timeline-height-active',
    default: '6px',
    controls: 'Track height on hover / focus / scrub',
  },
  {
    token: '--rk-reel-timeline-cursor-width',
    default: '10px',
    controls: 'Scrub-pill width at rest',
  },
  {
    token: '--rk-reel-timeline-cursor-width-active',
    default: '14px',
    controls: 'Scrub-pill width while scrubbing',
  },
  {
    token: '--rk-reel-timeline-cursor-height',
    default: '24px',
    controls: 'Scrub-pill height at rest',
  },
  {
    token: '--rk-reel-timeline-cursor-height-active',
    default: '32px',
    controls: 'Scrub-pill height while scrubbing',
  },
  {
    token: '--rk-reel-timeline-hitbox',
    default: '16px',
    controls: 'Extra pointer hit-area above the track',
  },
  {
    token: '--rk-reel-timeline-transition',
    default: '0.15s ease-out',
    controls: 'Track + pill grow/shrink animation',
  },
  {
    token: '--rk-reel-timeline-z',
    default: '11',
    controls: 'Timeline z-index (above the default UI layer)',
  },
];

const cssClasses = [
  // Overlay
  {
    className: '.rk-reel-overlay',
    component: 'Overlay',
    description: '固定的全屏背景层（背景、z-index）',
  },
  {
    className: '.rk-reel-container',
    component: 'Overlay',
    description: '播放器容器（定位、溢出）',
  },
  {
    className: '.rk-reel-loader',
    component: 'Overlay',
    description: '波浪加载动画浮层',
  },
  {
    className: '.rk-reel-media-error',
    component: 'Overlay',
    description: '错误状态浮层（居中图标 + 文字）',
  },
  {
    className: '.rk-reel-media-error-text',
    component: 'Overlay',
    description: '错误信息文字',
  },

  // Controls
  {
    className: '.rk-reel-button',
    component: '控制内容',
    description: '共用的圆形图标按钮（关闭、声音、导航箭头）',
  },
  {
    className: '.rk-reel-close-btn',
    component: '控制内容',
    description: '关闭按钮',
  },
  {
    className: '.rk-reel-sound-btn',
    component: '控制内容',
    description: '声音开关按钮',
  },

  // Navigation
  {
    className: '.rk-reel-nav-arrows',
    component: '导航',
    description: '仅桌面端的箭头容器（小于 768px 时隐藏）',
  },
  {
    className: '.rk-reel-nav-button',
    component: '导航',
    description: '单个上一张 / 下一张导航箭头',
  },

  // Slide
  {
    className: '.rk-reel-slide-wrapper',
    component: 'Slide',
    description: '媒体 + 浮层的包装层',
  },

  // SlideOverlay
  {
    className: '.rk-reel-slide-overlay',
    component: 'SlideOverlay',
    description: '渐变浮层容器',
  },
  {
    className: '.rk-reel-slide-overlay-author',
    component: 'SlideOverlay',
    description: '作者行（头像 + 名称）',
  },
  {
    className: '.rk-reel-slide-overlay-avatar',
    component: 'SlideOverlay',
    description: '作者头像图片',
  },
  {
    className: '.rk-reel-slide-overlay-name',
    component: 'SlideOverlay',
    description: '作者名称文字',
  },
  {
    className: '.rk-reel-slide-overlay-description',
    component: 'SlideOverlay',
    description: '描述文字',
  },
  {
    className: '.rk-reel-slide-overlay-likes',
    component: 'SlideOverlay',
    description: '点赞行（爱心 + 数量）',
  },

  // VideoSlide
  {
    className: '.rk-reel-video-container',
    component: 'VideoSlide',
    description: '视频包装层（背景、溢出）',
  },
  {
    className: '.rk-reel-video-element',
    component: 'VideoSlide',
    description: '<video> 元素',
  },
  {
    className: '.rk-reel-video-poster',
    component: 'VideoSlide',
    description: '封面图（播放时淡出）',
  },

  {
    className: '.rk-reel-video-poster.rk-visible',
    component: 'VideoSlide',
    description: '视频暂停 / 加载时施加在封面图上的状态修饰类',
  },

  // NestedSlider
  {
    className: '.rk-reel-nested-indicator',
    component: 'NestedSlider',
    description: '多媒体幻灯片下方的圆点分页（桌面端与触摸端位置不同）',
  },
  {
    className: '.rk-reel-nested-nav',
    component: 'NestedSlider',
    description: '横向轮播箭头（小于 768px 时隐藏）',
  },
  {
    className: '.rk-reel-nested-nav-next',
    component: 'NestedSlider',
    description: '嵌套的下一张箭头位置',
  },
  {
    className: '.rk-reel-nested-nav-prev',
    component: 'NestedSlider',
    description: '嵌套的上一张箭头位置',
  },

  // Timeline
  {
    className: '.rk-reel-timeline',
    component: 'TimelineBar',
    description:
      '拖动条包装层。在自定义的  `renderTimeline`  根元素上复用它，即可继承贴底定位、安全区内边距，以及触摸设备上为幻灯片浮层预留的空间。',
  },
  {
    className: '.rk-reel-timeline-track',
    component: 'TimelineBar',
    description: '轨道（未播放区域）',
  },
  {
    className: '.rk-reel-timeline-buffered',
    component: 'TimelineBar',
    description: '缓冲分段层',
  },
  {
    className: '.rk-reel-timeline-fill',
    component: 'TimelineBar',
    description: '已播放进度填充',
  },
  {
    className: '.rk-reel-timeline-cursor',
    component: 'TimelineBar',
    description: '拖动手柄（浮在轨道上方）',
  },
];

export default function ReelPlayer() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Reel Player</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          一个全屏的 Instagram Reels / TikTok 风格视频播放器组件，基于{' '}
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
                icon: Zap,
                label: '竖向滑动',
                desc: '触摸、拖拽、键盘、滚轮',
              },
              {
                icon: Play,
                label: '视频自动播放',
                desc: '可见时播放',
              },
              { icon: Volume2, label: '声音开关', desc: 'iOS 上声音连续' },
              {
                icon: Layout,
                label: '多媒体',
                desc: '嵌套的横向轮播',
              },
              {
                icon: Clock,
                label: '位置记忆',
                desc: '从上次的位置继续',
              },
              {
                icon: Image,
                label: '抽帧',
                desc: '封面图到视频的交叉淡入',
              },
              {
                icon: Layers,
                label: '虚拟化',
                desc: 'DOM 里只有 3 张幻灯片',
              },
              {
                icon: Ratio,
                label: '宽高比',
                desc: '桌面端 9:16，移动端全屏',
              },
              { icon: Monitor, label: '桌面端导航', desc: '箭头按钮' },
              {
                icon: Code,
                label: '泛型类型',
                desc: '自定义内容数据模型',
              },
              {
                icon: Settings,
                label: '可定制',
                desc: '所有部分都可通过 render props 替换',
              },
              {
                icon: Zap,
                label: '幻灯片浮层',
                desc: '作者、点赞、描述',
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
          code="npm install @reelkit/react-reel-player @reelkit/react lucide-react"
          language="bash"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          别忘了引入样式：
        </p>
        <CodeBlock
          code={`import '@reelkit/react-reel-player/styles.css';`}
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
            ReelPlayerOverlay
          </code>{' '}
          组件渲染一个全屏播放器浮层。传入一组{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ContentItem
          </code>{' '}
          对象，并用{' '}
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
        <Heading level={2} id="live-demo" className="text-2xl font-bold mb-4">
          在线演示
        </Heading>
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
          点缩略图打开全屏播放器。按 Escape 或点关闭按钮返回。
        </p>
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
          id="generic-content-type"
          className="text-xl font-semibold mt-6 mb-4"
        >
          泛型内容类型
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          通过扩展{' '}
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

        <Heading
          level={3}
          id="custom-slide-overlay"
          className="text-xl font-semibold mt-8 mb-4"
        >
          自定义幻灯片浮层
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          用每张幻灯片自己的内容替换内置的幻灯片浮层：
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

        <Heading
          level={3}
          id="non-media-slides"
          className="text-xl font-semibold mt-8 mb-4"
        >
          非媒体幻灯片
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          使用{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlide
          </code>{' '}
          注入自定义内容（例如行动号召卡片）。返回{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            null
          </code>{' '}
          则回退到默认实现：
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

        <Heading
          level={3}
          id="custom-controls"
          className="text-xl font-semibold mt-8 mb-4"
        >
          自定义控件
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          把可复用的子组件和你自己的东西组合起来：
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

        <Heading
          level={3}
          id="custom-timeline"
          className="text-xl font-semibold mt-8 mb-4"
        >
          自定义时间轴
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          用你自己的拖动界面替换内置的播放条，方式是{' '}
          <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderTimeline
          </code>
          . The callback only fires when the overlay's gating rules would render
          the default bar (same{' '}
          <code className="font-mono text-xs">timeline</code> 模式 +{' '}
          <code className="font-mono text-xs">timelineMinDurationSeconds</code>{' '}
          的逻辑），所以不必自己重写一遍。在你的根元素上复用{' '}
          <code className="font-mono text-xs">.rk-reel-timeline</code>{' '}
          类，即可继承贴底定位、安全区内边距，以及触摸设备上为幻灯片浮层预留的空间。
        </p>
        <CodeBlock
          code={`import { useRef, useEffect } from 'react';
import { ReelPlayerOverlay } from '@reelkit/react-reel-player';
import { Observe } from '@reelkit/react';

function CustomTimelineBar({ timelineState }) {
  const trackRef = useRef(null);
  useEffect(() => {
    if (!trackRef.current) return;
    // Pointer + keyboard scrub wiring, same as the built-in bar.
    return timelineState.bindInteractions(trackRef.current);
  }, [timelineState]);

  return (
    <div className="rk-reel-timeline" style={{ padding: '0 16px' }}>
      <Observe signals={[timelineState.progress, timelineState.currentTime]}>
        {() => (
          <div
            ref={trackRef}
            role="slider"
            aria-valuenow={timelineState.currentTime.value}
            style={{ height: 6, background: 'rgba(255,255,255,0.2)' }}
          >
            <div style={{
              width: \`\${timelineState.progress.value * 100}%\`,
              height: '100%',
              background: 'linear-gradient(90deg, #6366f1, #ec4899)',
            }} />
          </div>
        )}
      </Observe>
    </div>
  );
}

<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  timeline="always"
  renderTimeline={({ timelineState }) => (
    <CustomTimelineBar timelineState={timelineState} />
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

        <Heading
          level={3}
          id="custom-nested-navigation"
          className="text-xl font-semibold mt-8 mb-4"
        >
          自定义嵌套导航
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          用自定义导航替换多媒体幻灯片（横向轮播）内部的左右箭头：
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

        <Heading
          level={3}
          id="custom-nested-slides"
          className="text-xl font-semibold mt-8 mb-4"
        >
          自定义嵌套幻灯片
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          用{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderNestedSlide
          </code>
          定制多媒体轮播内部的单张幻灯片。用{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            props.defaultContent
          </code>{' '}
          包裹默认的 ImageSlide/VideoSlide，或者完全替换它：
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

      {/* URL state */}
      <section className="mb-12">
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          URL 状态
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ReelPlayerUrlOverlay
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
          传进去：参数指向某张幻灯片时播放器自己打开，参数消失时关闭。链接可以分享，返回键关闭的是播放器而不是离开页面。
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
import { ReelPlayerUrlOverlay } from '@reelkit/react-reel-player';
import { Link } from 'react-router-dom';

const reel = useOverlayUrlState({
  param: 'reel',
  ...urlIndexKey(() => content.length),
});

// Opening is a link — the overlay reads the URL and opens itself.
{content.map((item, i) => (
  <Link key={item.id} to={\`?reel=\${i}\`}>
    <img src={getThumbnail(item)} />
  </Link>
))}

<ReelPlayerUrlOverlay controller={reel} content={content} />`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          完整的{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useOverlayUrlState
          </code>{' '}
          选项 ——{' '}
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
          </code>{' '}
          —— 见{' '}
          <Link
            to="/zh/docs/react/api#useoverlayurlstate"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            React API 参考
          </Link>
          。完整讲解见{' '}
          <Link
            to="/zh/docs/react/guide#url-state"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            React 指南
          </Link>
          .
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li>
            打开时压入 <strong>一条</strong> 历史记录。滑动信息流则是{' '}
            <strong>替换</strong> 它，因此滑 N
            次也不会多出记录，退一步永远就是离开播放器。返回键关闭播放器，不会逐张后退。
          </li>
          <li>
            只有在应用内部打开播放器时返回键才会关闭它 ——
            因为那次链接压入了一条记录。在新标签页里直接打开的分享链接背后没有历史，浏览器返回会离开站点；这时用
            ✕ 按钮或 Escape 就地移除参数并留在页面上。
          </li>
          <li>
            深链{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              ?reel=3
            </code>{' '}
            会在加载时直接把播放器打开到那一张。
          </li>
          <li>
            指向不存在幻灯片的参数 —— 过期的书签、手改的值 —— 会从 URL
            中移除，而不是让地址栏继续声称一张打不开的幻灯片。
          </li>
          <li>
            默认情况下参数寻址的是 <strong>竖向</strong> 的帖子（
            <code>?reel=3</code>）。改用双轴 key
            还能同时携带多媒体轮播的内层媒体索引 —— 见下文。
          </li>
        </ul>

        <Heading
          level={3}
          id="one-key-or-two-pick-your-url-depth"
          className="text-xl font-semibold mt-8 mb-3"
        >
          一条轴还是两条 —— 自己决定 URL 的深度
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          同一个 <code>ReelPlayerUrlOverlay</code>{' '}
          两种形态都能驱动；它在运行时根据控制器的 position 自行判别，所以没有
          mode 属性。在构建控制器时选好 key 即可：
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 px-3 font-semibold">Key</th>
                <th className="text-left py-2 px-3 font-semibold">URL 形态</th>
                <th className="text-left py-2 px-3 font-semibold">携带内容</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2 px-3 font-mono text-xs">urlIndexKey(…)</td>
                <td className="py-2 px-3 font-mono text-xs">?reel=3</td>
                <td className="py-2 px-3">只有竖向的帖子。</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2 px-3 font-mono text-xs">
                  urlIndexTwoAxisKey(…)
                </td>
                <td className="py-2 px-3 font-mono text-xs">?reel=3.2</td>
                <td className="py-2 px-3">
                  帖子 <em>和</em> 轮播内层媒体索引。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          两种形态是刻意区分开的 —— 双轴 key 严格使用点分隔（<code>3.0</code>
          ，绝不会是裸的 <code>3</code>
          ），因此单轴链接不会被错误解码。也正因如此，应用在两种 key
          之间切换会让此前分享出去的链接全部失效。选定一种形态就别再改。
        </p>
        <CodeBlock
          code={`import { useOverlayUrlState, urlIndexTwoAxisKey } from '@reelkit/react';

const reel = useOverlayUrlState({
  param: 'reel',
  ...urlIndexTwoAxisKey({
    outerCount: () => content.length,
    innerCounts: () => content.map((post) => post.media.length),
  }),
});

// A link now names both axes: post 3, inner media 2.
<Link to="?reel=3.2">…</Link>
<ReelPlayerUrlOverlay controller={reel} content={content} />`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          <strong>带路由的应用 —— 请传入适配器。</strong> 绕过路由器直接写{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            history.pushState
          </code>{' '}
          会让它的 location 过期，下一次导航就会把参数丢掉：
        </p>
        <CodeBlock
          code={`import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';

const adapter = useReactRouterUrlAdapter();
const reel = useOverlayUrlState({
  param: 'reel',
  adapter,
  ...urlIndexKey(() => content.length),
});

<ReelPlayerUrlOverlay controller={reel} content={content} />`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          <strong>稳定的链接。</strong> 索引是按位置的，所以收藏下来的{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ?reel=3
          </code>{' '}
          在信息流重新排序后就会打开另一条帖子 ——
          对信息流来说这是常态，而不是例外。{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlStableIdKey
          </code>{' '}
          按每条帖子稳定的{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            id
          </code>
          来寻址，扫描当前的信息流 —— 一次调用就覆盖了常见场景。
        </p>
        <CodeBlock
          code={`const reel = useOverlayUrlState({
  param: 'reel',
  ...urlStableIdKey({ items: () => content }),
});`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          传入{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            hashCodec: base64UrlCodec
          </code>{' '}
          即可把 URL 中的 id 做 base64url 编码 —— 这是可逆的混淆，不是加密哈希。
        </p>
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
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
          。这是两件事：{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            codec
          </code>{' '}
          把身份写进 URL，{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locator
          </code>{' '}
          则负责找到这个身份在哪。
        </p>
        <CodeBlock
          code={`const reel = useOverlayUrlState({
  param: 'reel',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => content.findIndex((x) => x.id === id),
    identify: (index) => content[index].id,
  },
});`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          <strong>无限信息流。</strong>{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locate
          </code>{' '}
          是同步的，因此只能回答已经加载过的帖子 —— 只加载了 20 条时，指向第 400
          条的分享链接就查不到。{' '}
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
          code={`const reel = useOverlayUrlState({
  param: 'reel',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => content.findIndex((x) => x.id === id),
    identify: (index) => content[index].id,
    locateAsync: async (id) => {
      const loaded = await loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!loaded) return null; // exhausted — link names no post
      setContent(loaded); // commit — the overlay renders from this state
      return loaded.findIndex((x) => x.id === id); // wherever it landed
    },
  },
});`}
          language="tsx"
        />
        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 mt-4">
          <li>
            在{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              locateAsync
            </code>{' '}
            未完成期间，播放器保持关闭，参数也不动，因此深链能熬过这次请求。{' '}
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
            没有超时机制 —— 播放器无从得知信息流有多长。分页用尽时请以{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              null
            </code>{' '}
            结束，否则浮层会一直关着。
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
          id="reelplayeroverlayprops-props"
          className="text-xl font-semibold mt-6 mb-4"
        >
          ReelPlayerOverlayProps Props
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-mono">
          ReelPlayerOverlayProps&lt;T&gt;
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

        <Heading
          level={3}
          id="reelplayerurloverlay-props"
          className="text-xl font-semibold mt-8 mb-4"
        >
          ReelPlayerUrlOverlay 属性
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-mono">
          ReelPlayerUrlOverlayProps&lt;T&gt;
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          接受上面所有视觉和行为属性，除了{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            isOpen
          </code>
          ，它被{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            controller
          </code>
          .{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            initialIndex
          </code>{' '}
          会被忽略 —— 由控制器的 position
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
              {reelPlayerUrlProps.map((p) => (
                <tr
                  key={p.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-sm text-slate-600 dark:text-slate-400">
                    {p.type}
                  </td>
                  <td className="py-3 px-4 font-mono text-sm text-slate-500">
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
          id="basecontentitem"
          className="text-lg font-semibold mb-2"
        >
          BaseContentItem
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          泛型约束类型。扩展它即可在 ReelPlayerOverlay 中使用自定义数据模型。
        </p>
        <CodeBlock
          code={`interface BaseContentItem {
  id: string;
  media: MediaItem[];
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="contentitem"
          className="text-lg font-semibold mt-6 mb-2"
        >
          ContentItem
        </Heading>
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

        <Heading
          level={3}
          id="mediaitem"
          className="text-lg font-semibold mt-6 mb-2"
        >
          MediaItem
        </Heading>
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

        <Heading
          level={3}
          id="mediatype"
          className="text-lg font-semibold mt-6 mb-2"
        >
          MediaType
        </Heading>
        <CodeBlock
          code={`type MediaType = 'image' | 'video';`}
          language="typescript"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          ControlsRenderProps{'<T>'}
        </Heading>
        <CodeBlock
          code={`interface ControlsRenderProps<T extends BaseContentItem> {
  onClose: () => void;
  soundState: SoundState;
  activeIndex: number;
  content: T[];
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
  onPrev: () => void;
  onNext: () => void;
  activeIndex: number;
  count: number;
}`}
          language="typescript"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          SlideRenderProps{'<T>'}
        </Heading>
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

        <Heading
          level={3}
          id="nestedsliderenderprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
          NestedSlideRenderProps
        </Heading>
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

        <Heading
          level={3}
          id="slideoverlayprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
          SlideOverlayProps
        </Heading>
        <CodeBlock
          code={`interface SlideOverlayProps {
  author?: { name: string; avatar: string };
  description?: string;
  likes?: number;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="imageslideprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
          ImageSlideProps
        </Heading>
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

        <Heading
          level={3}
          id="videoslideprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
          VideoSlideProps
        </Heading>
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

        <Heading
          level={3}
          id="closebuttonprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
          CloseButtonProps
        </Heading>
        <CodeBlock
          code={`interface CloseButtonProps {
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="soundbuttonprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
          SoundButtonProps
        </Heading>
        <CodeBlock
          code={`interface SoundButtonProps {
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="timelinebarprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
          TimelineBarProps
        </Heading>
        <CodeBlock
          code={`interface TimelineBarProps {
  className?: string;
  style?: React.CSSProperties;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="timelinerenderprops-lt-t-gt"
          className="text-lg font-semibold mt-6 mb-2"
        >
          TimelineRenderProps&lt;T&gt;
        </Heading>
        <CodeBlock
          code={`interface TimelineRenderProps<T extends BaseContentItem> {
  item: T;
  activeIndex: number;
  timelineState: TimelineController;
  defaultContent: ReactNode;
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
          对外导出的可复用积木，用于在自定义 render props 中组合：
        </p>

        <Heading
          level={3}
          id="closebutton"
          className="text-lg font-semibold mt-6 mb-2"
        >
          CloseButton
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          带默认播放器样式的独立关闭按钮。在{' '}
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

        <Heading
          level={3}
          id="soundbutton"
          className="text-lg font-semibold mt-6 mb-2"
        >
          SoundButton
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          独立的声音开关。必须位于{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            SoundProvider
          </code>{' '}
          内部（ReelPlayerOverlay 会自动提供）。
        </p>
        <CodeBlock
          code={`import { SoundButton } from '@reelkit/react-reel-player';

<SoundButton />
<SoundButton disabled className="my-sound-btn" />`}
          language="tsx"
        />

        <Heading
          level={3}
          id="timelinebar"
          className="text-lg font-semibold mt-6 mb-2"
        >
          TimelineBar
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          默认的播放拖动条。它读取最近的{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            TimelineProvider
          </code>{' '}
          (automatically mounted inside{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ReelPlayerOverlay
          </code>
          内部自动挂载），并渲染轨道、缓冲区间、进度填充和拖动手柄。通过{' '}
          <code className="font-mono text-xs">--rk-reel-timeline-*</code>{' '}
          自定义属性做主题定制，或者用{' '}
          <code className="font-mono text-xs">renderTimeline</code>.
        </p>
        <CodeBlock
          code={`import { TimelineBar } from '@reelkit/react-reel-player';

// Inside renderTimeline — wrap or augment the default bar:
<ReelPlayerOverlay
  renderTimeline={({ defaultContent }) => (
    <>
      <MyTimecode />
      {defaultContent}
    </>
  )}
/>

// Or render standalone inside a custom TimelineProvider tree:
<TimelineBar className="my-timeline" />`}
          language="tsx"
        />

        <Heading
          level={3}
          id="slideoverlay"
          className="text-lg font-semibold mt-6 mb-2"
        >
          SlideOverlay
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          默认的渐变浮层，显示作者、描述和点赞。当内容具备所需字段时自动渲染。用{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlideOverlay
          </code>{' '}
          可以替换或隐藏它。
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

        <Heading
          level={3}
          id="imageslide"
          className="text-lg font-semibold mt-6 mb-2"
        >
          ImageSlide
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          带懒加载的图片幻灯片，默认使用{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            object-fit: cover
          </code>{' '}
          。在{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlide
          </code>{' '}
          内部使用它，即可用你自己的样式组合出自定义图片幻灯片。
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

        <Heading
          level={3}
          id="videoslide"
          className="text-lg font-semibold mt-6 mb-2"
        >
          VideoSlide
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          视频幻灯片，使用共享的{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'<video>'}
          </code>{' '}
          元素以保证 iOS 上声音连续，并支持封面帧、位置记忆和加载提示。必须位于{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            SoundProvider
          </code>{' '}
          内部（ReelPlayerOverlay 会自动提供）。
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

        <Callout type="info" title="组合自定义幻灯片" className="mt-4 mb-4">
          使用{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlide
          </code>{' '}
          ，并带{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ImageSlide
          </code>{' '}
          /{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            VideoSlide
          </code>{' '}
          即可在保留全部内置行为（自动播放、封面抽帧、声音同步）的前提下自定义媒体渲染。
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
        <Heading
          level={2}
          id="content-loading-error-handling"
          className="text-2xl font-bold mb-4"
        >
          内容加载与错误处理
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          播放器会逐张跟踪加载和错误状态。内容加载时显示波浪加载动画；媒体损坏时显示错误图标。出错的
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

        <Heading
          level={3}
          id="custom-loading-error-ui"
          className="text-xl font-semibold mt-8 mb-4"
        >
          自定义加载与错误界面
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          用自定义组件替换默认的波浪加载动画和错误图标：
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

      {/* Timeline */}
      <section className="mb-12">
        <Heading level={2} id="timeline" className="text-2xl font-bold mb-4">
          时间轴
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          浮层会在当前视频上方渲染一个内置的播放时间轴条。{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            timeline
          </code>{' '}
          属性控制它是否渲染：
        </p>
        <ul className="list-disc pl-6 mb-4 text-slate-600 dark:text-slate-400 space-y-1">
          <li>
            <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
              'auto'
            </code>{' '}
            （默认）：当前媒体是时长超过{' '}
            <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
              timelineMinDurationSeconds
            </code>{' '}
            （默认
            30）的视频时渲染。单视频幻灯片和多媒体轮播都适用；进度条会跟随当前的内层条目，遇到图片则隐藏。
          </li>
          <li>
            <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
              'always'
            </code>
            ：只要当前幻灯片有视频就渲染。
          </li>
          <li>
            <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
              'never'
            </code>
            ：永不渲染。请通过{' '}
            <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
              renderTimeline
            </code>
            .
          </li>
        </ul>
        <CodeBlock
          code={`<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={close}
  content={items}
  timeline="auto"
  timelineMinDurationSeconds={30}
/>`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          通过 <code className="font-mono text-xs">--rk-reel-timeline-*</code>{' '}
          CSS
          自定义属性做主题定制（高度、颜色、光标大小）。若要完全自定义拖动条、时间码或进度指示，请用{' '}
          <code className="font-mono text-xs">renderTimeline</code>
          ；回调会收到一个{' '}
          <code className="font-mono text-xs">timelineState</code>{' '}
          ，其数据来自底层的{' '}
          <code className="font-mono text-xs">TimelineController</code>.
        </p>
      </section>

      {/* Sound Context */}
      <section className="mb-12">
        <Heading
          level={2}
          id="sound-context"
          className="text-2xl font-bold mb-4"
        >
          声音上下文
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          自定义实现时，你可以访问声音状态：
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
        <Heading level={2} id="css-classes" className="text-2xl font-bold mb-4">
          CSS 类名
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          所有 CSS 类名都是普通类名（不是 CSS Modules），因此可以在{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-reel-player/styles.css
          </code>
          之后加载的样式表里用更高优先级的选择器覆盖它们。若只是改颜色、尺寸和
          z-index，请优先使用下面{' '}
          <Link
            to={{ hash: '#theming' }}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            主题定制
          </Link>{' '}
          一节记录的 CSS 自定义属性 —— 它们正是为此设计的。
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
          （或浮层的任意祖先元素）上覆盖其中一个或多个，即可在不改组件源码的情况下换主题。
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

  /* Timeline bar: brand-matched, beefier on desktop */
  --rk-reel-timeline-track: rgba(99, 102, 241, 0.25);
  --rk-reel-timeline-buffered: rgba(168, 85, 247, 0.45);
  --rk-reel-timeline-fill: #a855f7;
  --rk-reel-timeline-cursor: #a855f7;
  --rk-reel-timeline-height: 4px;
  --rk-reel-timeline-height-active: 8px;
  --rk-reel-timeline-cursor-width-active: 18px;
  --rk-reel-timeline-transition: 0.2s ease-out;
}`}
          language="css"
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
          可以改变屏幕阅读器的播报内容，默认是 “Video player”。每张幻灯片都带有{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="group"
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-roledescription="slide"
          </code>
          ，以及{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-label="第 N 张，共 M 张"
          </code>
          ，因此滑动时会播报当前在序列中的位置。
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          浮层打开时捕获焦点，关闭时把焦点还给触发元素。Tab 和 Shift+Tab
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
