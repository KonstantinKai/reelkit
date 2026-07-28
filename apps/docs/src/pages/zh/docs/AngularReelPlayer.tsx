import { Link } from 'react-router-dom';
import { Callout } from '../../../components/ui/Callout';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Sandbox } from '../../../components/ui/Sandbox';
import { FeatureCardGrid } from '../../../components/ui/FeatureCard';
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
  Layers,
  Link2,
  Code,
} from 'lucide-react';
import { Heading } from '../../../components/ui/Heading';
import { zhPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/angular-reel-player',
    title: 'Angular Reel Player · ReelKit',
    description:
      'Angular 全屏视频播放浮层：组件输入与输出、模板插槽、时间轴、声音与主题定制。',
  });

// Headings carry the English slug as an explicit id — the slug generator
// is ascii-only, so a Chinese heading would produce an empty anchor.

const playerInputs = [
  {
    prop: 'ariaLabel',
    type: 'string',
    default: "'Video player'",
    description: '对话框区域的无障碍标签',
  },
  {
    prop: 'aspectRatio',
    type: 'number | undefined',
    default: 'undefined',
    description: '桌面端容器的宽高比。默认 9/16。移动端播放器占满视口。',
  },
  {
    prop: 'content',
    type: 'T[] (extends BaseContentItem)',
    default: '必填',
    description: '播放器中要展示的内容条目数组',
  },
  {
    prop: 'enableNavKeys',
    type: 'boolean',
    default: 'true',
    description: '启用键盘方向键导航',
  },
  {
    prop: 'enableWheel',
    type: 'boolean',
    default: 'true',
    description: '启用鼠标滚轮导航',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: '初始可见条目的索引（从 0 开始）',
  },
  {
    prop: 'initialInnerIndex',
    type: 'number',
    default: '0',
    description:
      '打开时定位的内层媒体索引，只对最初可见的那条帖子生效 —— 让双轴 URL 能直达多媒体帖子里的某一张图。用户一开始导航就会忽略它。',
  },
  {
    prop: 'isOpen',
    type: 'boolean',
    default: '必填',
    description: '控制浮层显示；为 false 时浮层会从 DOM 中移除',
  },
  {
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description: '在幻灯片之间启用无限循环',
  },
  {
    prop: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: '触发切换所需的最小滑动距离占比',
  },
  {
    prop: 'timeline',
    type: "'auto' | 'always' | 'never'",
    default: "'auto'",
    description:
      "Gating strategy for the built-in playback timeline bar. 'auto' renders only for videos longer than timelineMinDurationSeconds; 'always' renders whenever the active slide has a video; 'never' disables the built-in bar (use rkPlayerTimeline template slot for a fully custom replacement).",
  },
  {
    prop: 'timelineMinDurationSeconds',
    type: 'number',
    default: '30',
    description:
      "Minimum video duration (seconds) for timeline='auto' to render the built-in bar. Short looping clips below this threshold are suppressed.",
  },
  {
    prop: 'transitionDuration',
    type: 'number',
    default: '300',
    description: '幻灯片动画时长（毫秒）',
  },
  {
    prop: 'wheelDebounceMs',
    type: 'number',
    default: '200',
    description: '滚轮事件的防抖时长（毫秒）',
  },
];

const playerOutputs = [
  {
    prop: 'apiReady',
    type: 'EventEmitter<ReelApi>',
    description: '滑动器就绪时发出一次，同时暴露命令式 API',
  },
  {
    prop: 'closed',
    type: 'EventEmitter<void>',
    description: '播放器关闭时发出',
  },
  {
    prop: 'slideChange',
    type: 'EventEmitter<number>',
    description: '当前幻灯片索引变化时发出',
  },
  {
    prop: 'innerSlideChange',
    type: 'EventEmitter<{ outer: number; inner: number }>',
    description:
      "Emitted when the active post's inner media index changes — on inner navigation and on outer activation, reporting the activated post's current inner index (0 for a single-media post).",
  },
];

const templateSlots = [
  {
    directive: 'rkPlayerControls',
    context: 'PlayerControlsContext<T>',
    description: '自定义全局控件栏（关闭、声音开关等）',
  },
  {
    directive: 'rkPlayerError',
    context: '{ $implicit: activeIndex, item, innerActiveIndex }',
    description: '自定义错误提示模板插槽',
  },
  {
    directive: 'rkPlayerLoading',
    context: '{ $implicit: activeIndex, item, innerActiveIndex }',
    description: '自定义加载提示模板插槽',
  },
  {
    directive: 'rkPlayerNavigation',
    context: 'PlayerNavigationContext',
    description: '自定义上一张 / 下一张导航箭头',
  },
  {
    directive: 'rkPlayerNestedNavigation',
    context: 'PlayerNestedNavigationContext',
    description: '内层横向滑动器的自定义导航箭头',
  },
  {
    directive: 'rkPlayerNestedSlide',
    context: 'PlayerNestedSlideContext',
    description: '内层横向滑动器中每张幻灯片的自定义内容',
  },
  {
    directive: 'rkPlayerSlide',
    context: 'PlayerSlideContext<T>',
    description: '完全自定义的幻灯片内容，替换默认的媒体幻灯片',
  },
  {
    directive: 'rkPlayerSlideOverlay',
    context: 'PlayerSlideOverlayContext<T>',
    description: '逐张幻灯片的浮层（作者信息、点赞、描述等）',
  },
  {
    directive: 'rkPlayerTimeline',
    context: 'PlayerTimelineContext<T>',
    description:
      '自定义播放时间轴条。只有在门控（timeline 模式 + 最小时长）会渲染默认条时才渲染（同样是 auto/always/never 的逻辑）。',
  },
];

const mediaItemProps = [
  {
    prop: 'id',
    type: 'string',
    description: '媒体条目的唯一标识',
  },
  { prop: 'type', type: "'image' | 'video'", description: '媒体类型' },
  { prop: 'src', type: 'string', description: '媒体资源的 URL' },
  {
    prop: 'poster',
    type: 'string?',
    description: '视频条目的封面缩略图 URL',
  },
  {
    prop: 'aspectRatio',
    type: 'number',
    description: '宽高比。小于 1 表示竖向（cover），大于 1 表示横向（contain）',
  },
];

const contextTypes = [
  {
    name: 'PlayerControlsContext<T>',
    fields:
      '{ $implicit: onClose, activeIndex, content: T[], soundState: PlayerSoundState }',
  },
  {
    name: 'PlayerNavigationContext',
    fields: '{ $implicit: onPrev, onNext, activeIndex, count }',
  },
  {
    name: 'PlayerNestedNavigationContext',
    fields: '{ $implicit: onPrev, onNext, activeIndex, count }',
  },
  {
    name: 'PlayerNestedSlideContext',
    fields:
      '{ $implicit: MediaItem, index, size, isActive, isInnerActive, slideKey }',
  },
  {
    name: 'PlayerSlideContext<T>',
    fields:
      '{ $implicit: T, index, size: [number,number], isActive, slideKey, onReady, onWaiting, onError }',
  },
  {
    name: 'PlayerSlideOverlayContext<T>',
    fields: '{ $implicit: T, index, isActive }',
  },
  {
    name: 'PlayerTimelineContext<T>',
    fields: '{ $implicit: T, activeIndex, timelineState: PlayerTimelineState }',
  },
  {
    name: 'PlayerTimelineState',
    fields:
      '{ duration(), currentTime(), progress(), bufferedRanges(), isScrubbing(), seek(t), bindInteractions(el) }',
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
    className: '.rk-reel-nav-btn',
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
    className: '.rk-reel-video-loader',
    component: 'VideoSlide',
    description: '波浪加载动画',
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
  {
    className: '.rk-reel-nested-slider-inner',
    component: 'NestedSlider',
    description: '嵌套横向滑动器的根节点',
  },

  // Timeline
  {
    className: '.rk-reel-timeline',
    component: 'TimelineBar',
    description:
      '拖动条包装层。在自定义的  `rkPlayerTimeline`  模板根元素上复用它，即可继承贴底定位、安全区内边距，以及触摸设备上为幻灯片浮层预留的空间。',
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

  // Shared button
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

  // Video slide
  {
    token: '--rk-reel-video-bg',
    default: '#000',
    controls: 'Letterbox background behind <video>',
  },
  {
    token: '--rk-reel-video-loader-color',
    default: 'rgba(255, 255, 255, 0.15)',
    controls: 'Video buffering shimmer color',
  },

  // Nested horizontal slider
  {
    token: '--rk-reel-nested-button-bg',
    default: 'rgba(0, 0, 0, 0.5)',
    controls: 'Nested arrow background',
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
    token: '--rk-reel-timeline-transition',
    default: '0.15s ease-out',
    controls: 'Track + pill grow/shrink animation',
  },
];

export default function AngularReelPlayer() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Angular Reel Player</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          面向 Angular 的全屏 Instagram / TikTok 风格竖向媒体播放器，基于{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/angular-reel-player
          </code>
          .
        </p>
        <a
          href="https://angular-demo.reelkit.dev/reel-player?utm_source=docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          查看在线演示 &rarr;
        </a>
      </div>

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
                desc: '所有部分都可用模板插槽替换',
              },
              {
                icon: Zap,
                label: '错误处理',
                desc: '带 LRU 缓存的损坏媒体检测',
              },
              {
                icon: Link2,
                label: 'URL 状态',
                desc: '可分享的链接，返回键关闭',
              },
            ]}
          />
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="installation"
          className="text-2xl font-bold mb-4"
        >
          安装
        </Heading>
        <CodeBlock
          code={`npm install @reelkit/angular-reel-player @reelkit/angular lucide-angular`}
          language="bash"
        />
        <Callout type="info" title="图标" className="mt-4">
          默认控件使用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lucide-angular
          </code>{' '}
          作为图标（关闭、声音、导航箭头）。如果你想换一套图标库，可以用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkPlayerControls
          </code>{' '}
          和{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkPlayerNavigation
          </code>{' '}
          模板插槽提供自己的实现。
        </Callout>
      </section>

      <section className="mb-12">
        <Heading level={2} id="basic-usage" className="text-2xl font-bold mb-4">
          基本用法
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          把样式表和独立组件{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RkReelPlayerOverlayComponent
          </code>{' '}
          引入组件的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            imports
          </code>{' '}
          数组。
        </p>
        <Sandbox
          code={`import { Component, signal } from '@angular/core';
import {
  RkReelPlayerOverlayComponent,
  type ContentItem,
} from '@reelkit/angular-reel-player';
import '@reelkit/angular-reel-player/styles.css';

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
    description: 'Amazing content',
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
      src: '/cdn/samples/videos/video-02.mp4',
      poster: '/cdn/samples/videos/video-poster-02.jpg',
      aspectRatio: 16 / 9,
    }],
    author: { name: 'Mike Chen', avatar: '/cdn/samples/avatars/avatar-03.jpg' },
    likes: 3456,
    description: 'Adventure awaits',
  },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RkReelPlayerOverlayComponent],
  template: \`
    <!-- Grid thumbnail view -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
      @for (item of content; track item.id; let i = $index) {
        <button
          (click)="openAt(i)"
          style="aspect-ratio:9/16;cursor:pointer;overflow:hidden"
        >
          <img
            [src]="item.media[0].poster || item.media[0].src"
            style="width:100%;height:100%;object-fit:cover"
          />
        </button>
      }
    </div>

    <rk-reel-player-overlay
      [isOpen]="isOpen()"
      [content]="content"
      [initialIndex]="startIndex()"
      (closed)="isOpen.set(false)"
    />
  \`,
})
export class AppComponent {
  readonly content = content;
  readonly isOpen = signal(false);
  readonly startIndex = signal(0);

  openAt(index: number): void {
    this.startIndex.set(index);
    this.isOpen.set(true);
  }
}`}
          language="typescript"
          title="reel-feed.component.ts"
          framework="angular"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="template-slots"
          className="text-2xl font-bold mb-4"
        >
          模板插槽
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          六个模板插槽指令让你定制播放器界面的每个部分。每个都会收到带完整类型的上下文对象。只需提供你想覆盖的插槽
          —— 其余的沿用默认实现。
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">指令</th>
                <th className="text-left py-3 px-4 font-semibold">
                  上下文类型
                </th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {templateSlots.map((s) => (
                <tr
                  key={s.directive}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    [{s.directive}]
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {s.context}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {s.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <CodeBlock
          code={`import {
  RkReelPlayerOverlayComponent,
  RkPlayerSlideOverlayDirective,
  RkPlayerControlsDirective,
  RkPlayerNavigationDirective,
  RkCloseButtonComponent,
  RkSoundButtonComponent,
  type ContentItem,
  type PlayerSlideOverlayContext,
  type PlayerControlsContext,
  type PlayerNavigationContext,
} from '@reelkit/angular-reel-player';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RkReelPlayerOverlayComponent,
    RkPlayerSlideOverlayDirective,
    RkPlayerControlsDirective,
    RkPlayerNavigationDirective,
    RkCloseButtonComponent,
    RkSoundButtonComponent,
  ],
  template: \`
    <rk-reel-player-overlay
      [isOpen]="isOpen"
      [content]="content"
      (closed)="isOpen = false"
    >
      <!-- Custom per-slide overlay: author + likes -->
      <ng-template rkPlayerSlideOverlay let-item let-isActive="isActive">
        @if (isActive) {
          <div style="position:absolute;bottom:80px;left:16px;color:#fff">
            <div style="display:flex;align-items:center;gap:8px">
              <img [src]="item.author.avatar" style="width:40px;height:40px;border-radius:50%" />
              <span style="font-weight:600">{{ item.author.name }}</span>
            </div>
            <p style="margin-top:8px">{{ item.description }}</p>
          </div>
        }
      </ng-template>

      <!-- Custom global controls -->
      <ng-template rkPlayerControls
                   let-onClose
                   let-soundState="soundState">
        <div style="position:absolute;top:16px;right:16px;display:flex;gap:8px">
          <rk-sound-button [soundState]="soundState" />
          <rk-close-button (click)="onClose()" />
        </div>
      </ng-template>

      <!-- Custom navigation -->
      <ng-template rkPlayerNavigation
                   let-onPrev
                   let-onNext="onNext"
                   let-activeIndex="activeIndex"
                   let-count="count">
        <div style="position:absolute;right:16px;top:50%;transform:translateY(-50%)">
          <button (click)="onPrev()" [disabled]="activeIndex === 0">&#9650;</button>
          <button (click)="onNext()" [disabled]="activeIndex === count - 1">&#9660;</button>
        </div>
      </ng-template>

      <!-- Custom playback timeline -->
      <ng-template rkPlayerTimeline let-state="timelineState">
        <div class="rk-reel-timeline" style="padding:0 16px"
             (pointerdown)="bindTrack(track, state); track.focus()">
          <div #track
               role="slider"
               [attr.aria-valuenow]="state.currentTime()"
               style="height:6px;background:rgba(255,255,255,0.2);border-radius:999px">
            <div [style.width.%]="state.progress() * 100"
                 style="height:100%;background:linear-gradient(90deg,#6366f1,#ec4899);border-radius:999px"></div>
          </div>
        </div>
      </ng-template>
    </rk-reel-player-overlay>
  \`,
})
export class AppComponent {
  isOpen = false;
  content: ContentItem[] = [];

  private _trackDispose: (() => void) | null = null;
  /** Wire pointer + keyboard scrub onto your custom track element. */
  bindTrack(el: HTMLElement, state: PlayerTimelineState) {
    this._trackDispose?.();
    this._trackDispose = state.bindInteractions(el);
  }
}`}
          language="typescript"
        />
      </section>

      {/* Custom Timeline subsection */}
      <section className="mb-12">
        <Heading
          level={3}
          id="custom-timeline"
          className="text-xl font-semibold mt-8 mb-4"
        >
          自定义时间轴
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {' '}
          <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkPlayerTimeline
          </code>{' '}
          模板插槽只有在浮层的门控规则会渲染默认条时才会调用（同样是{' '}
          <code className="font-mono text-xs">timeline</code> 模式 +{' '}
          <code className="font-mono text-xs">timelineMinDurationSeconds</code>
          ），所以不必自己重写一遍。在你的根元素上复用{' '}
          <code className="font-mono text-xs">.rk-reel-timeline</code>{' '}
          类，即可继承贴底定位、安全区内边距和触摸设备上的留白。在你的拖动轨道上调用{' '}
          <code className="font-mono text-xs">state.bindInteractions(el)</code>{' '}
          即可接上指针 + 键盘拖动。
        </p>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="nested-slider-multi-media-items"
          className="text-2xl font-bold mb-4"
        >
          嵌套滑动器（多媒体条目）
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When a{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ContentItem
          </code>{' '}
          包含多个{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            media
          </code>{' '}
          条目时，播放器会把它们渲染成一个横向的嵌套滑动器（Instagram
          轮播风格）。用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkPlayerNestedSlide
          </code>{' '}
          插槽即可自定义内层幻灯片的内容。
        </p>
        <CodeBlock
          code={`const carouselItem: ContentItem = {
  id: '3',
  media: [
    { id: 'img-a', type: 'image', src: '/photo-a.jpg', aspectRatio: 2 / 3 },
    { id: 'img-b', type: 'image', src: '/photo-b.jpg', aspectRatio: 3 / 4 },
    { id: 'img-c', type: 'image', src: '/photo-c.jpg', aspectRatio: 1 },
  ],
  author: { name: 'Emma Davis', avatar: '/avatar3.jpg' },
  likes: 8901,
  description: 'Travel moments',
};`}
          language="typescript"
        />
      </section>

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
            rkPlayerSlide
          </code>{' '}
          模板插槽时，请用上下文里的回调来控制加载提示：
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
          code={`<!-- Wire lifecycle callbacks in a custom slide template -->
<rk-reel-player-overlay [isOpen]="isOpen" [content]="items" (closed)="isOpen = false">
  <ng-template rkPlayerSlide
    let-item
    let-size="size"
    let-isActive="isActive"
    let-onReady="onReady"
    let-onWaiting="onWaiting"
    let-onError="onError"
  >
    @if (item.media[0].type === 'image') {
      <img
        [src]="item.media[0].src"
        (load)="onReady()"
        (error)="onError()"
        [style.width.px]="size[0]"
        [style.height.px]="size[1]"
        style="object-fit: cover"
      />
    } @else {
      <video
        [src]="item.media[0].src"
        [autoplay]="isActive"
        (canplay)="onReady()"
        (waiting)="onWaiting()"
        (error)="onError()"
        [style.width.px]="size[0]"
        [style.height.px]="size[1]"
        style="object-fit: cover"
      />
    }
  </ng-template>
</rk-reel-player-overlay>`}
          language="html"
        />

        <Heading
          level={3}
          id="custom-loading-error-ui"
          className="text-xl font-semibold mt-8 mb-4"
        >
          自定义加载与错误界面
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          用自定义模板替换默认的波浪加载动画和错误图标：
        </p>

        <CodeBlock
          code={`<rk-reel-player-overlay [isOpen]="isOpen" [content]="items" (closed)="isOpen = false">
  <ng-template rkPlayerLoading let-index let-item="item">
    <div style="
      position: absolute; inset: 0; z-index: 10;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 14px;
    ">
      Loading slide {{ index + 1 }}...
    </div>
  </ng-template>

  <ng-template rkPlayerError let-index let-item="item">
    <div style="
      position: absolute; inset: 0; z-index: 10;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 12px; color: rgba(255,255,255,0.5);
    ">
      <span style="font-size: 48px">!</span>
      <span>Failed to load media</span>
    </div>
  </ng-template>
</rk-reel-player-overlay>`}
          language="html"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="timeline" className="text-2xl font-bold mb-4">
          时间轴
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          浮层会在当前视频上方渲染一个内置的播放时间轴条。用{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            timeline
          </code>{' '}
          输入控制： <code className="font-mono text-xs">'auto'</code>{' '}
          （默认）只要当前媒体是时长超过{' '}
          <code className="font-mono text-xs">timelineMinDurationSeconds</code>{' '}
          （默认 30）的视频就渲染，{' '}
          <code className="font-mono text-xs">'always'</code>{' '}
          则只要有视频在播就渲染，{' '}
          <code className="font-mono text-xs">'never'</code>{' '}
          则关闭。若要完全自定义拖动条，请用{' '}
          <code className="font-mono text-xs">rkPlayerTimeline</code>{' '}
          模板指令；它的上下文会暴露一个{' '}
          <code className="font-mono text-xs">timelineState</code>{' '}
          ，其数据来自底层的{' '}
          <code className="font-mono text-xs">TimelineController</code>.
        </p>
        <CodeBlock
          code={`<rk-reel-player-overlay
  [isOpen]="isOpen()"
  [content]="items"
  timeline="auto"
  [timelineMinDurationSeconds]="30"
  (closed)="isOpen.set(false)"
/>`}
          language="html"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          通过 <code className="font-mono text-xs">--rk-reel-timeline-*</code>{' '}
          CSS 自定义属性。若要在自定义的使用方组件里直接控制，请注入{' '}
          <code className="font-mono text-xs">TimelineStateService</code>.
        </p>

        <Heading
          level={3}
          id="rktimelinebarcomponent"
          className="text-xl font-semibold mt-8 mb-3"
        >
          RkTimelineBarComponent
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          默认的播放拖动条组件。它消费{' '}
          <code className="font-mono text-xs">TimelineStateService</code> （由{' '}
          <code className="font-mono text-xs">
            RkReelPlayerOverlayComponent
          </code>
          提供），并渲染轨道、缓冲区间、进度填充和拖动手柄。选择器：{' '}
          <code className="font-mono text-xs">rk-timeline-bar</code>。输入：{' '}
          <code className="font-mono text-xs">class?: string</code>,{' '}
          <code className="font-mono text-xs">
            style?: Record&lt;string, string&gt;
          </code>
          。在 <code className="font-mono text-xs">rkPlayerTimeline</code>{' '}
          模板内部使用它来包裹或增强默认条；只有在提供了该服务的使用方内部才可以单独使用。
        </p>
        <CodeBlock
          code={`import { RkTimelineBarComponent } from '@reelkit/angular-reel-player';

@Component({
  standalone: true,
  imports: [RkReelPlayerOverlayComponent, RkTimelineBarComponent],
  template: \`
    <rk-reel-player-overlay [isOpen]="isOpen()" [content]="items">
      <!-- Wrap or augment the default bar: -->
      <ng-template rkPlayerTimeline>
        <my-timecode />
        <rk-timeline-bar />
      </ng-template>
    </rk-reel-player-overlay>
  \`,
})
export class AppComponent {}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="soundstateservice"
          className="text-2xl font-bold mb-4"
        >
          SoundStateService
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          在{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RkReelPlayerOverlayComponent
          </code>{' '}
          级提供。默认的声音按钮会注入它，控件模板插槽的上下文里也会暴露它。作为浮层{' '}
          <em>children</em> 的自定义控件也可以注入它来直接访问。
        </p>
        <CodeBlock
          code={`import { inject } from '@angular/core';
import { SoundStateService } from '@reelkit/angular-reel-player';

@Component({ ... })
export class AppComponent {
  readonly soundState = inject(SoundStateService);

  // Use in template:
  // [class.muted]="soundState.muted()"
  // [disabled]="soundState.disabled()"
  // (click)="soundState.toggle()"
}`}
          language="typescript"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">成员</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  muted()
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  Signal&lt;boolean&gt;
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  播放器当前是否静音
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  disabled()
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  Signal&lt;boolean&gt;
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  当前幻灯片没有视频或正在过渡时为 true
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  toggle()
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  () =&gt; void
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  切换静音状态
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          URL 状态
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            RkReelPlayerUrlOverlayComponent
          </code>{' '}
          是一个独立组件，它的打开状态存放在地址栏里。用{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createOverlayUrlState
          </code>{' '}
          ，并把它作为{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            [controller]
          </code>
          传入：参数指向某张幻灯片时播放器打开，参数消失时关闭。链接可以分享，返回键会关闭播放器。{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            RkReelPlayerOverlayComponent
          </code>{' '}
          仍然由{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            [isOpen]
          </code>
          控制，因此每个组件都只有一个打开状态的驱动源。
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
            @reelkit/angular
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
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          带路由的应用会传入基于 Router 的适配器，让 Router
          始终是导航的唯一真相来源 —— 绕过它直接写历史会让 location
          过期，下一次导航就会把参数丢掉。{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createRouterUrlAdapter
          </code>{' '}
          from{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/angular/ng-router-url-adapter
          </code>{' '}
          就是现成的适配器。
        </p>
        <CodeBlock
          code={`import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RkReelPlayerUrlOverlayComponent,
  type ContentItem,
} from '@reelkit/angular-reel-player';
import { createOverlayUrlState, urlIndexKey, urlStableIdKey } from '@reelkit/angular';
import { createRouterUrlAdapter } from '@reelkit/angular/ng-router-url-adapter';
import '@reelkit/angular-reel-player/styles.css';

@Component({
  standalone: true,
  imports: [RkReelPlayerUrlOverlayComponent, RouterLink],
  template: \`
    @for (post of content; track post.id; let i = $index) {
      <a [routerLink]="[]" [queryParams]="{ reel: i }">{{ post.id }}</a>
    }
    <rk-reel-player-url-overlay [controller]="reel" [content]="content" />
  \`,
})
export class FeedComponent {
  content: ContentItem[] = [/* ... */];
  protected readonly reel = createOverlayUrlState({
    param: 'reel',
    adapter: createRouterUrlAdapter(),
    ...urlIndexKey(() => this.content.length),
  });
}`}
          language="typescript"
        />
        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 my-4">
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
            URL 的深度取决于控制器用的 key：单轴只表示帖子，双轴（
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              urlIndexTwoAxisKey
            </code>
            ）还会携带多媒体帖子的内层图片索引。每个应用只选一种；两种形态不会互相解码。
          </li>
        </ul>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          完整的{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createOverlayUrlState
          </code>{' '}
          选项见{' '}
          <Link
            to="/zh/docs/angular/api#createoverlayurlstate"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            Angular API 参考
          </Link>
          .
        </p>
        <Heading
          level={3}
          id="one-key-or-two-pick-your-url-depth"
          className="text-xl font-semibold mt-8 mb-3"
        >
          一条轴还是两条 —— 自己决定 URL 的深度
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          同一个{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            RkReelPlayerUrlOverlayComponent
          </code>{' '}
          两种形态都能驱动；它在运行时根据控制器的 position 自行判别，所以没有
          mode 输入。在构建控制器时选好 key 即可：
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
          code={`import { createOverlayUrlState, urlIndexTwoAxisKey } from '@reelkit/angular';

protected readonly reel = createOverlayUrlState({
  param: 'reel',
  ...urlIndexTwoAxisKey({
    outerCount: () => this.content.length,
    innerCounts: () => this.content.map((post) => post.media.length),
  }),
});

// A link now names both axes: post 3, inner media 2 — ?reel=3.2`}
          language="typescript"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          <strong>稳定的链接。</strong> 索引是按位置的，所以收藏下来的{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ?reel=3
          </code>{' '}
          在信息流重新排序后就会打开另一条帖子 —— 对信息流来说这是常态。{' '}
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
          code={`protected readonly reel = createOverlayUrlState({
  param: 'reel',
  ...urlStableIdKey({ items: () => this.loaded() }),
});`}
          language="typescript"
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
          给无限信息流翻页，就自己构建 <code>codec</code>/<code>locator</code>{' '}
          。这是两件事： <code>codec</code> 把身份写进 URL，{' '}
          <code>locator</code> 则负责找到这个身份在哪。
        </p>
        <CodeBlock
          code={`protected readonly reel = createOverlayUrlState({
  param: 'reel',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => this.loaded().findIndex((x) => x.id === id),
    identify: (index) => this.loaded()[index].id,
  },
});`}
          language="typescript"
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
          未命中时才调用：把需要的页拉进来，再返回该身份最终对应的索引。
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
          code={`protected readonly reel = createOverlayUrlState({
  param: 'reel',
  adapter: createRouterUrlAdapter(),
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => this.loaded().findIndex((x) => x.id === id),
    identify: (index) => this.loaded()[index].id,
    locateAsync: async (id) => {
      const page = await this.loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!page) return null; // exhausted — link names no post
      this.loaded.set(page); // commit — the overlay renders from this state
      return page.findIndex((x) => x.id === id);
    },
  },
});`}
          language="typescript"
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

      <section className="mb-12">
        <Heading
          level={2}
          id="custom-data-types"
          className="text-2xl font-bold mb-4"
        >
          自定义数据类型
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          扩展{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            BaseContentItem
          </code>{' '}
          即可使用你自己的领域模型。这个组件是泛型的：{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'RkReelPlayerOverlayComponent<T extends BaseContentItem>'}
          </code>
          .
        </p>
        <CodeBlock
          code={`import type { BaseContentItem } from '@reelkit/angular-reel-player';

interface MyPost extends BaseContentItem {
  // id: string  — from BaseContentItem
  // media: MediaItem[]  — from BaseContentItem
  title: string;
  tags: string[];
  publishedAt: Date;
}

@Component({
  imports: [RkReelPlayerOverlayComponent],
  template: \`
    <rk-reel-player-overlay [isOpen]="isOpen" [content]="posts" (closed)="isOpen = false">
      <ng-template rkPlayerSlideOverlay let-post let-isActive="isActive">
        @if (isActive) {
          <div style="position:absolute;bottom:80px;left:16px;color:#fff">
            <h3>{{ post.title }}</h3>
            @for (tag of post.tags; track tag) {
              <span>#{{ tag }} </span>
            }
          </div>
        }
      </ng-template>
    </rk-reel-player-overlay>
  \`,
})
export class AppComponent {
  isOpen = false;
  posts: MyPost[] = [];
}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="rkreelplayeroverlaycomponent-inputs"
          className="text-2xl font-bold mb-4"
        >
          RkReelPlayerOverlayComponent 输入
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">输入</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">默认值</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {playerInputs.map((p) => (
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

      <section className="mb-12">
        <Heading
          level={2}
          id="rkreelplayeroverlaycomponent-outputs"
          className="text-2xl font-bold mb-4"
        >
          RkReelPlayerOverlayComponent 输出
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">输出</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {playerOutputs.map((p) => (
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
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="rkreelplayerurloverlaycomponent-inputs"
          className="text-2xl font-bold mb-4"
        >
          RkReelPlayerUrlOverlayComponent 输入
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          接受上面所有输入，除了{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            isOpen
          </code>{' '}
          和{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            initialIndex
          </code>
          ，它被{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            controller
          </code>{' '}
          ，由它的 position 决定打开哪一张。输出{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            closed
          </code>{' '}
          和{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            slideChange
          </code>
          .
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">输入</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">默认值</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  controller
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  UrlStateController
                </td>
                <td className="py-3 px-4 text-slate-500 text-sm">必填</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  来自 <code>createOverlayUrlState</code>的控制器。它的{' '}
                  <code>position</code>{' '}
                  决定播放器是否打开、显示哪一张；浮层会在切换幻灯片和关闭时通过它写回。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="mediaitem-interface"
          className="text-2xl font-bold mb-4"
        >
          MediaItem 接口
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">字段</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {mediaItemProps.map((p) => (
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
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="template-slot-context-types"
          className="text-2xl font-bold mb-4"
        >
          模板插槽上下文类型
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">字段</th>
              </tr>
            </thead>
            <tbody>
              {contextTypes.map((t) => (
                <tr
                  key={t.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {t.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {t.fields}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="css-classes" className="text-2xl font-bold mb-4">
          CSS 类名
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          所有 CSS 类名都是普通类名（没有 scoped），因此可以在{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/angular-reel-player/styles.css
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
          （或浮层的任意祖先元素）上覆盖，即可在不改组件源码的情况下换主题。这些变量与
          React 和 Vue 包保持一致，因此覆盖样式可以在不同框架绑定之间通用。
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
            @reelkit/angular-reel-player/styles.css
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
          ). Set the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ariaLabel
          </code>{' '}
          输入可以改变屏幕阅读器的播报内容，默认是 “Video
          player”。每张幻灯片都带有{' '}
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
              {[
                { key: 'ArrowUp', action: 'Previous slide' },
                { key: 'ArrowDown', action: 'Next slide' },
                {
                  key: 'ArrowLeft',
                  action: 'Previous media (in nested slider)',
                },
                { key: 'ArrowRight', action: 'Next media (in nested slider)' },
                { key: 'Escape', action: 'Close player' },
              ].map((s) => (
                <tr
                  key={s.key}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4">
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                      {s.key}
                    </kbd>
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
