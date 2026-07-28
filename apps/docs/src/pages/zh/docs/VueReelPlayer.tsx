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
    path: '/docs/vue-reel-player',
    title: 'Vue Reel Player · ReelKit',
    description:
      'Vue 全屏视频播放浮层：属性与事件、作用域插槽、时间轴、声音上下文与主题定制。',
  });

// Headings carry the English slug as an explicit id — the slug generator
// is ascii-only, so a Chinese heading would produce an empty anchor.

const playerProps = [
  {
    prop: 'ariaLabel',
    type: 'string',
    default: "'Video player'",
    description: '对话框区域的无障碍标签；浮层打开时由屏幕阅读器播报',
  },
  {
    prop: 'aspectRatio',
    type: 'number',
    default: '9 / 16',
    description: '桌面端容器的宽高比。移动端占满视口。',
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
      "Gating strategy for the built-in playback timeline bar. 'auto' renders only for videos longer than timelineMinDurationSeconds; 'always' renders whenever the active slide has a video; 'never' disables the built-in bar (use the #timeline slot for a fully custom replacement).",
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

const playerEvents = [
  {
    name: 'api-ready',
    payload: 'ReelPlayerApi',
    description: '滑动器就绪时发出一次，同时暴露命令式 API',
  },
  {
    name: 'close',
    payload: 'void',
    description: '播放器关闭时发出',
  },
  {
    name: 'slide-change',
    payload: 'number',
    description: '切换后发出，带上新的活动幻灯片索引',
  },
  {
    name: 'inner-slide-change',
    payload: 'outer: number, inner: number',
    description:
      "Emitted when the active post's inner media index changes — on inner navigation and on outer activation (the activated post's current inner index, 0 for single-media).",
  },
  {
    name: 'update:is-open',
    payload: 'boolean',
    description: '关闭时发出；用于支持  `v-model:is-open`',
  },
];

const scopedSlots = [
  {
    slot: 'controls',
    scope: '{ item, soundState, activeIndex, content, onClose }',
    description: '自定义全局控件栏（关闭、声音、分享等）',
  },
  {
    slot: 'error',
    scope: '{ item, activeIndex, innerActiveIndex }',
    description: '自定义错误提示（替换默认图标）',
  },
  {
    slot: 'loading',
    scope: '{ item, activeIndex, innerActiveIndex }',
    description: '自定义加载提示（替换默认的波浪加载动画）',
  },
  {
    slot: 'navigation',
    scope: '{ item, activeIndex, count, onPrev, onNext }',
    description: '自定义上一张 / 下一张导航箭头（桌面端）',
  },
  {
    slot: 'nestedNavigation',
    scope: '{ media, activeIndex, count, onPrev, onNext }',
    description: '内层横向滑动器的自定义箭头',
  },
  {
    slot: 'nestedSlide',
    scope:
      '{ item, media, index, size, isActive, isInnerActive, slideKey, defaultContent, onReady, onWaiting, onError }',
    description: '内层横向滑动器里的自定义幻灯片内容',
  },
  {
    slot: 'slide',
    scope:
      '{ item, index, size, isActive, slideKey, defaultContent, onReady, onWaiting, onError }',
    description: '完全自定义的幻灯片内容（省略则回退到默认）',
  },
  {
    slot: 'slideOverlay',
    scope: '{ item, index, isActive }',
    description: '逐张幻灯片的浮层（作者信息、点赞、描述等）',
  },
  {
    slot: 'timeline',
    scope: '{ item, activeIndex, timelineState, defaultContent }',
    description:
      '自定义播放时间轴条。只有在内置门控（timeline 模式 + 最小时长）会渲染默认条时才会调用，复用同样的 auto/always/never 逻辑。用 defaultContent() 包裹内置的 <TimelineBar />。',
  },
];

const contentItemFields = [
  { field: 'id', type: 'string', description: '唯一标识' },
  {
    field: 'media',
    type: 'MediaItem[]',
    description: '一个或多个媒体资源（图片或视频）',
  },
  {
    field: 'author',
    type: '{ name: string; avatar?: string }',
    description: '默认幻灯片浮层中显示的作者',
  },
  { field: 'description', type: 'string?', description: '说明文字' },
  { field: 'likes', type: 'number?', description: '点赞数' },
];

const mediaItemFields = [
  { field: 'id', type: 'string', description: '唯一标识' },
  { field: 'type', type: "'image' | 'video'", description: '媒体类型' },
  { field: 'src', type: 'string', description: '媒体资源的 URL' },
  {
    field: 'poster',
    type: 'string?',
    description: '视频条目的封面缩略图 URL',
  },
  {
    field: 'aspectRatio',
    type: 'number',
    description:
      '宽高比。小于 1 表示竖向（cover），大于等于 1 表示横向（contain）。',
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
      '拖动条包装层。在自定义的  `#timeline`  插槽根元素上复用它，即可继承贴底定位、安全区内边距，以及触摸设备上为幻灯片浮层预留的空间。',
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

const keyboardShortcuts = [
  { key: 'ArrowUp', action: 'Previous slide' },
  { key: 'ArrowDown', action: 'Next slide' },
  { key: 'ArrowLeft', action: 'Previous media (nested carousel)' },
  { key: 'ArrowRight', action: 'Next media (nested carousel)' },
  { key: 'Escape', action: 'Close player' },
];

export default function VueReelPlayer() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Vue Reel Player</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          面向 Vue 3 的全屏 Instagram / TikTok 风格竖向媒体播放器，基于{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue-reel-player
          </code>
          .
        </p>
        <a
          href="https://vue-demo.reelkit.dev/reel-player?utm_source=docs"
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
                label: '作用域插槽',
                desc: '每个界面元素都可定制',
              },
              {
                icon: Zap,
                label: 'v-model:is-open',
                desc: '显示状态的双向绑定',
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
          code="npm install @reelkit/vue-reel-player @reelkit/vue lucide-vue-next"
          language="bash"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          在应用入口（或任意组件）里引入一次样式表：
        </p>
        <CodeBlock
          code={`import '@reelkit/vue-reel-player/styles.css';`}
          language="typescript"
        />
        <Callout type="info" title="图标" className="mt-4">
          默认控件使用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lucide-vue-next
          </code>{' '}
          作为图标（关闭、声音、导航箭头）。如果你想换一套图标库，可以用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #controls
          </code>{' '}
          和{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #navigation
          </code>{' '}
          作用域插槽提供自己的实现。
        </Callout>
      </section>

      {/* Basic Usage */}
      <section className="mb-12">
        <Heading level={2} id="basic-usage" className="text-2xl font-bold mb-4">
          基本用法
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          渲染一个缩略图网格，点击后在对应索引打开浮层。绑定{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            v-model:is-open
          </code>{' '}
          意味着当用户通过按钮、手势或 Escape 关闭播放器时，父级的{' '}
          <code>ref</code> 会保持同步。
        </p>
        <Sandbox
          code={`<script setup lang="ts">
import { ref } from 'vue';
import { ReelPlayerOverlay, type ContentItem } from '@reelkit/vue-reel-player';
import '@reelkit/vue-reel-player/styles.css';

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
      src: '/cdn/samples/videos/video-02.mp4',
      poster: '/cdn/samples/videos/video-poster-02.jpg',
      aspectRatio: 16 / 9,
    }],
    author: { name: 'Mike Chen', avatar: '/cdn/samples/avatars/avatar-03.jpg' },
    likes: 3456,
    description: 'Adventure awaits',
  },
];

const isOpen = ref(false);
const startIndex = ref(0);

function openAt(i: number) {
  startIndex.value = i;
  isOpen.value = true;
}
</script>

<template>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
    <button
      v-for="(item, i) in content"
      :key="item.id"
      @click="openAt(i)"
      style="aspect-ratio:9/16;cursor:pointer;overflow:hidden;padding:0;border:0"
    >
      <img
        :src="item.media[0].poster || item.media[0].src"
        style="width:100%;height:100%;object-fit:cover"
      />
    </button>
  </div>

  <ReelPlayerOverlay
    v-model:is-open="isOpen"
    :content="content"
    :initial-index="startIndex"
  />
</template>`}
          language="vue"
          title="App.vue"
          framework="vue"
          stackblitzDeps={['@reelkit/vue-reel-player']}
          stackblitzExtraDeps={{ 'lucide-vue-next': '>=0.460.0' }}
        />
      </section>

      {/* Scoped Slots */}
      <section className="mb-12">
        <Heading
          level={2}
          id="scoped-slots"
          className="text-2xl font-bold mb-4"
        >
          作用域插槽
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          八个作用域插槽让你替换播放器界面的任意部分。每个插槽都会收到带完整类型的作用域对象。没传的插槽会回退到默认实现。
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">插槽</th>
                <th className="text-left py-3 px-4 font-semibold">作用域</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {scopedSlots.map((s) => (
                <tr
                  key={s.slot}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    #{s.slot}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {s.scope}
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
          code={`<script setup lang="ts">
import { ref } from 'vue';
import {
  ReelPlayerOverlay,
  CloseButton,
  SoundButton,
  type ContentItem,
  type SlideOverlaySlotScope,
  type ControlsSlotScope,
} from '@reelkit/vue-reel-player';

const isOpen = ref(false);
const content = ref<ContentItem[]>([/* ... */]);
</script>

<template>
  <ReelPlayerOverlay v-model:is-open="isOpen" :content="content">
    <!-- Custom per-slide overlay: branded caption -->
    <template #slideOverlay="{ item, isActive }: SlideOverlaySlotScope">
      <div v-if="isActive" style="position:absolute;bottom:80px;left:16px;color:#fff">
        <div style="display:flex;align-items:center;gap:8px">
          <img :src="item.author.avatar" style="width:40px;height:40px;border-radius:50%" />
          <span style="font-weight:600">{{ item.author.name }}</span>
        </div>
        <p style="margin-top:8px">{{ item.description }}</p>
      </div>
    </template>

    <!-- Custom global controls -->
    <template #controls="{ onClose }: ControlsSlotScope">
      <div style="position:absolute;top:16px;right:16px;display:flex;gap:8px">
        <SoundButton />
        <CloseButton :on-click="onClose" />
      </div>
    </template>

    <!-- Custom playback timeline -->
    <template #timeline="{ timelineState }: TimelineSlotScope">
      <CustomTimelineBar :state="timelineState" />
    </template>
  </ReelPlayerOverlay>
</template>`}
          language="vue"
        />
      </section>

      {/* Custom Timeline slot */}
      <section className="mb-12">
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
            #timeline
          </code>{' '}
          插槽。只有在浮层的门控规则会渲染默认条时插槽才会触发（同样是{' '}
          <code className="font-mono text-xs">timeline</code> 模式 +{' '}
          <code className="font-mono text-xs">timelineMinDurationSeconds</code>
          ），所以不必自己重写一遍。在你的根元素上复用{' '}
          <code className="font-mono text-xs">.rk-reel-timeline</code>{' '}
          类，即可继承贴底定位、安全区内边距和触摸设备上的留白。
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { shallowRef, onMounted, onBeforeUnmount } from 'vue';
import {
  ReelPlayerOverlay,
  type TimelineSlotScope,
} from '@reelkit/vue-reel-player';
import { toVueRef, type TimelineController } from '@reelkit/vue';

const trackRef = shallowRef<HTMLDivElement | null>(null);
let dispose: (() => void) | null = null;
const bind = (state: TimelineController) => {
  if (trackRef.value) dispose = state.bindInteractions(trackRef.value);
};
onBeforeUnmount(() => dispose?.());
</script>

<template>
  <ReelPlayerOverlay :is-open="open" :content="items" timeline="always">
    <template #timeline="{ timelineState }: TimelineSlotScope">
      <div class="rk-reel-timeline" style="padding: 0 16px" @vue:mounted="bind(timelineState)">
        <div ref="trackRef" role="slider" style="height:6px;background:rgba(255,255,255,0.2)">
          <div :style="{
            width: (timelineState.progress.value * 100) + '%',
            height: '100%',
            background: 'linear-gradient(90deg, #6366f1, #ec4899)',
          }" />
        </div>
      </div>
    </template>
  </ReelPlayerOverlay>
</template>`}
          language="vue"
        />
      </section>

      {/* Custom Content Types */}
      <section className="mb-12">
        <Heading
          level={2}
          id="custom-content-types"
          className="text-2xl font-bold mb-4"
        >
          自定义内容类型
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelPlayerOverlay
          </code>{' '}
          对内容条目的形状是泛型的。扩展{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            BaseContentItem
          </code>{' '}
          即可使用任意数据模型；再引入对应的插槽作用域类型，插槽绑定就能保持强类型：
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { ref } from 'vue';
import {
  ReelPlayerOverlay,
  type BaseContentItem,
  type SlideOverlaySlotScope,
} from '@reelkit/vue-reel-player';

interface MyItem extends BaseContentItem {
  title: string;
  category: 'video' | 'photo';
}

const open = ref(false);
const items: MyItem[] = [/* ... */];
</script>

<template>
  <ReelPlayerOverlay v-model:is-open="open" :content="items">
    <template #slideOverlay="{ item }: SlideOverlaySlotScope<MyItem>">
      <div class="my-overlay">
        <h2>{{ item.title }}</h2>
        <span>{{ item.category }}</span>
      </div>
    </template>
  </ReelPlayerOverlay>
</template>`}
          language="vue"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          其余每个插槽都是同样的写法。引入对应的作用域类型（
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SlideSlotScope
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ControlsSlotScope
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            NavigationSlotScope
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            NestedSlideSlotScope
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            LoadingSlotScope
          </code>
          ）并给解构加上类型标注即可。
        </p>
      </section>

      {/* URL State */}
      <section className="mb-12">
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          URL 状态
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          用{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useOverlayUrlState
          </code>{' '}
          from{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue
          </code>{' '}
          构建控制器，再把它交给{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ReelPlayerUrlOverlay
          </code>{' '}
          作为{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            controller
          </code>
          ：地址栏拥有播放器，参数指向某张幻灯片时它就打开，参数消失时就关闭。打开会压入一条历史记录，之后每次切换都是替换，因此翻信息流不会多出记录，退一步永远就是离开。URL
          的深度取决于控制器用的 key：单轴的{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlIndexKey
          </code>{' '}
          只寻址帖子本身（
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ?reel=3
          </code>
          ），双轴的{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlIndexTwoAxisKey
          </code>{' '}
          还会携带多媒体帖子的内层媒体索引（
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ?reel=3.2
          </code>
          ）；每个应用只选一种 key，两种形态不会互相解码。它是一个独立于{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ReelPlayerOverlay
          </code>
          的组件，因此每个组件都只有一个打开状态的驱动源 —— 要么是{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            is-open
          </code>{' '}
          模型，要么是 URL{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            controller
          </code>
          ，绝不会同时用两个。
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
            @reelkit/vue
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
          带路由的应用应当传入基于路由器的适配器，让路由器始终是导航的唯一真相来源
          —— 绕过它直接写历史会让 location 过期，下一次导航就会把参数丢掉。{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useVueRouterUrlAdapter
          </code>{' '}
          from{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue/vue-router-url-adapter
          </code>{' '}
          就是为 Vue Router 准备的现成适配器。
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { ReelPlayerUrlOverlay, type ContentItem } from '@reelkit/vue-reel-player';
import { useOverlayUrlState, urlIndexKey, urlStableIdKey } from '@reelkit/vue';
import { useVueRouterUrlAdapter } from '@reelkit/vue/vue-router-url-adapter';
import '@reelkit/vue-reel-player/styles.css';

const props = defineProps<{ content: ContentItem[] }>();

const reel = useOverlayUrlState({
  param: 'reel',
  adapter: useVueRouterUrlAdapter(),
  ...urlIndexKey(() => props.content.length),
});
</script>

<template>
  <!-- Opening is a link — the overlay reads the URL and opens itself. -->
  <RouterLink v-for="(post, i) in props.content" :key="post.id" :to="\`?reel=\${i}\`">
    <img :src="post.media[0].src" />
  </RouterLink>

  <ReelPlayerUrlOverlay :controller="reel" :content="props.content" />
</template>`}
          language="vue"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          完整的{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useOverlayUrlState
          </code>{' '}
          选项见{' '}
          <Link
            to="/zh/docs/vue/api#useoverlayurlstate"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Vue API 参考
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
            URL 的深度取决于控制器用的 key：单轴只表示帖子，双轴（
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              urlIndexTwoAxisKey
            </code>
            ）还会携带多媒体帖子的内层图片索引。每个应用只选一种；两种形态不会互相解码。
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
          同一个{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ReelPlayerOverlay
          </code>{' '}
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
          code={`import { useOverlayUrlState, urlIndexTwoAxisKey } from '@reelkit/vue';

const reel = useOverlayUrlState({
  param: 'reel',
  ...urlIndexTwoAxisKey({
    outerCount: () => content.value.length,
    innerCounts: () => content.value.map((post) => post.media.length),
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
  ...urlStableIdKey({ items: () => content.value }),
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
    locate: (id) => content.value.findIndex((x) => x.id === id),
    identify: (index) => content.value[index].id,
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
    locate: (id) => content.value.findIndex((x) => x.id === id),
    identify: (index) => content.value[index].id,
    locateAsync: async (id) => {
      const loaded = await loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!loaded) return null; // exhausted — link names no post
      content.value = loaded; // commit — the overlay renders from this state
      return loaded.findIndex((x) => x.id === id); // wherever it landed
    },
  },
});`}
          language="typescript"
        />
        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 mt-4 mb-4">
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
          id="reelplayeroverlay-props"
          className="text-xl font-semibold mb-3"
        >
          ReelPlayerOverlay 属性
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-mono">
          ReelPlayerOverlayProps
        </p>
        <div className="overflow-x-auto mb-6">
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
              {playerProps.map((p) => (
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
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
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
          className="text-xl font-semibold mb-3"
        >
          ReelPlayerUrlOverlay 属性
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-mono">
          ReelPlayerUrlOverlayProps
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-3">
          接受上面所有属性，除了{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            is-open
          </code>
          ，它被{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            controller
          </code>
          .{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            initial-index
          </code>{' '}
          会被忽略 —— 由控制器的 position
          决定打开哪一张，所以同时传入的值每次打开都会被覆盖。
        </p>
        <div className="overflow-x-auto mb-6">
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
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  controller
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  UrlStateController
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  必填
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  来自 <code>useOverlayUrlState</code>的控制器。它的{' '}
                  <code>position</code>{' '}
                  决定浮层是否打开、显示哪一张；浮层会在切换幻灯片和关闭时通过它写回。
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading level={3} id="events" className="text-xl font-semibold mb-3">
          事件
        </Heading>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">事件</th>
                <th className="text-left py-3 px-4 font-semibold">负载</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {playerEvents.map((e) => (
                <tr
                  key={e.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    @{e.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {e.payload}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {e.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="v-model-is-open"
          className="text-xl font-semibold mb-3"
        >
          v-model:is-open
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          使用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            v-model:is-open
          </code>{' '}
          即可用一个绑定驱动浮层。旧的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            :is-open
          </code>{' '}
          +{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @close
          </code>{' '}
          写法依然可用，如果你需要显式的事件的话。
        </p>
        <CodeBlock
          code={`<template>
  <button @click="open = true">Open</button>
  <ReelPlayerOverlay v-model:is-open="open" :content="content" />
</template>`}
          language="vue"
        />
      </section>

      {/* Types */}
      <section className="mb-12">
        <Heading level={2} id="types" className="text-2xl font-bold mb-4">
          类型
        </Heading>

        <Heading
          level={3}
          id="contentitem"
          className="text-xl font-semibold mb-3"
        >
          ContentItem
        </Heading>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">字段</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {contentItemFields.map((f) => (
                <tr
                  key={f.field}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {f.field}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {f.type}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {f.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="timelinebarprops"
          className="text-xl font-semibold mb-3"
        >
          TimelineBarProps
        </Heading>
        <CodeBlock
          code={`interface TimelineBarProps {
  class?: string;
  style?: CSSProperties;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="timelineslotscope-lt-t-gt"
          className="text-xl font-semibold mt-6 mb-3"
        >
          TimelineSlotScope&lt;T&gt;
        </Heading>
        <CodeBlock
          code={`interface TimelineSlotScope<T extends BaseContentItem> {
  item: T;
  activeIndex: number;
  timelineState: TimelineController;
  defaultContent: () => VNode | VNode[];
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="mediaitem"
          className="text-xl font-semibold mt-6 mb-3"
        >
          MediaItem
        </Heading>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">字段</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {mediaItemFields.map((f) => (
                <tr
                  key={f.field}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {f.field}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {f.type}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {f.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          把它们放进你自定义的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #controls
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slide
          </code>
          , or{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slideOverlay
          </code>{' '}
          模板里。请把插槽作用域里的尺寸和回调透传下去，这样自动播放、封面抽帧和声音同步才能继续工作。
        </p>

        <Heading
          level={3}
          id="closebutton"
          className="text-lg font-semibold mt-6 mb-2"
        >
          CloseButton
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          带默认播放器样式的独立圆形关闭按钮。在{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #controls
          </code>
          .
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { CloseButton } from '@reelkit/vue-reel-player';
</script>

<template>
  <CloseButton :on-click="onClose" />
  <CloseButton :on-click="onClose" class-name="my-close-btn" :style="{ top: '24px', right: '24px' }" />
</template>`}
          language="vue"
        />

        <Heading
          level={3}
          id="soundbutton"
          className="text-lg font-semibold mt-6 mb-2"
        >
          SoundButton
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          静音开关。请把它渲染在{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SoundProvider
          </code>{' '}
          (
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelPlayerOverlay
          </code>{' '}
          会自动提供一个）。当前幻灯片没有视频时会隐藏。
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { SoundButton } from '@reelkit/vue-reel-player';
</script>

<template>
  <SoundButton />
  <SoundButton disabled class-name="my-sound-btn" />
</template>`}
          language="vue"
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
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            TimelineProvider
          </code>{' '}
          (automatically mounted inside{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelPlayerOverlay
          </code>
          内部自动挂载），并渲染轨道、缓冲区间、进度填充和拖动手柄。通过{' '}
          <code className="font-mono text-xs">--rk-reel-timeline-*</code>{' '}
          自定义属性做主题定制，或者用{' '}
          <code className="font-mono text-xs">#timeline</code> 插槽替换。
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import type { TimelineSlotScope } from '@reelkit/vue-reel-player';
</script>

<template>
  <!-- Wrap or augment the default bar from #timeline: -->
  <ReelPlayerOverlay>
    <template #timeline="{ defaultContent }: TimelineSlotScope">
      <MyTimecode />
      <component :is="defaultContent" />
    </template>
  </ReelPlayerOverlay>
</template>`}
          language="vue"
        />

        <Heading
          level={3}
          id="slideoverlay"
          className="text-lg font-semibold mt-6 mb-2"
        >
          SlideOverlay
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          默认的渐变浮层，显示作者、描述和点赞。内容带有这些字段时才渲染。可通过{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slideOverlay
          </code>{' '}
          插槽替换。
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { SlideOverlay } from '@reelkit/vue-reel-player';
</script>

<template>
  <SlideOverlay
    :author="{ name: 'John', avatar: '/avatar.jpg' }"
    description="Amazing content"
    :likes="12500"
  />
</template>`}
          language="vue"
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
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            object-fit: cover
          </code>{' '}
          。把它组合进{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slide
          </code>{' '}
          插槽，即可在保留内置行为的前提下自定义图片渲染。
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { ImageSlide } from '@reelkit/vue-reel-player';
</script>

<template>
  <ImageSlide :src="media.src" :size="size" />

  <ImageSlide
    :src="media.src"
    :size="size"
    class-name="my-image-slide"
    :style="{ backgroundColor: '#1a1a1a', borderRadius: '12px' }"
    :img-style="{ objectFit: 'contain' }"
  />
</template>`}
          language="vue"
        />

        <Heading
          level={3}
          id="videoslide"
          className="text-lg font-semibold mt-6 mb-2"
        >
          VideoSlide
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          由共享的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<video>'}
          </code>{' '}
          元素驱动的视频幻灯片。它负责 iOS
          上的声音连续、封面帧和位置记忆。请把它渲染在{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SoundProvider
          </code>{' '}
          (
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelPlayerOverlay
          </code>{' '}
          会自动提供一个）。
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { VideoSlide } from '@reelkit/vue-reel-player';
</script>

<template>
  <VideoSlide
    :src="media.src"
    :poster="media.poster"
    :aspect-ratio="9 / 16"
    :size="size"
    :is-active="isActive"
    :slide-key="slideKey"
    :style="{ borderRadius: '12px' }"
  />
</template>`}
          language="vue"
        />

        <Callout type="info" title="组合自定义幻灯片" className="mt-4 mb-4">
          使用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slide
          </code>{' '}
          ，并带{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ImageSlide
          </code>{' '}
          /{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            VideoSlide
          </code>{' '}
          即可在保留全部内置行为（自动播放、封面抽帧、声音同步）的前提下自定义媒体渲染。
        </Callout>
        <CodeBlock
          code={`<script setup lang="ts">
import {
  ReelPlayerOverlay,
  ImageSlide,
  VideoSlide,
} from '@reelkit/vue-reel-player';
</script>

<template>
  <ReelPlayerOverlay v-model:is-open="isOpen" :content="content">
    <template #slide="{ item, size, isActive, slideKey }">
      <ImageSlide
        v-if="item.media[0].type === 'image'"
        :src="item.media[0].src"
        :size="size"
        :style="{ backgroundColor: '#111' }"
        :img-style="{ objectFit: 'contain' }"
      />
      <VideoSlide
        v-else
        :src="item.media[0].src"
        :poster="item.media[0].poster"
        :aspect-ratio="item.media[0].aspectRatio"
        :size="size"
        :is-active="isActive"
        :slide-key="slideKey"
        :style="{ borderRadius: '16px' }"
      />
    </template>
  </ReelPlayerOverlay>
</template>`}
          language="vue"
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
          播放器会逐张跟踪加载和错误状态。内容加载时显示波浪加载动画；媒体损坏时显示错误图标。失败的
          URL 会被缓存，因此再次打开损坏的幻灯片不会重试。
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
            #slide
          </code>{' '}
          插槽时，请从插槽作用域调用这些回调来驱动加载提示：
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
          code={`<!-- Inside #slide — wire callbacks to your custom media -->
<template #slide="{ item, size, isActive, onReady, onWaiting, onError }">
  <div :style="{ width: size[0] + 'px', height: size[1] + 'px' }">
    <img
      v-if="item.media[0].type === 'image'"
      :src="item.media[0].src"
      @load="onReady"
      @error="onError"
      style="width:100%;height:100%;object-fit:cover"
    />
    <video
      v-else
      :src="item.media[0].src"
      :autoplay="isActive"
      @canplay="onReady"
      @waiting="onWaiting"
      @error="onError"
      style="width:100%;height:100%;object-fit:cover"
    />
  </div>
</template>`}
          language="vue"
        />

        <Heading
          level={3}
          id="custom-loading-error-ui"
          className="text-xl font-semibold mt-8 mb-4"
        >
          自定义加载与错误界面
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          通过{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #loading
          </code>{' '}
          和{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #error
          </code>{' '}
          插槽替换默认的波浪加载动画和错误图标：
        </p>
        <CodeBlock
          code={`<ReelPlayerOverlay v-model:is-open="isOpen" :content="content">
  <template #loading="{ activeIndex }">
    <div
      style="position:absolute;inset:0;z-index:10;display:flex;
             align-items:center;justify-content:center;color:#fff;font-size:14px"
    >
      Loading slide {{ activeIndex + 1 }}...
    </div>
  </template>

  <template #error="{ activeIndex }">
    <div
      style="position:absolute;inset:0;z-index:10;display:flex;
             flex-direction:column;align-items:center;justify-content:center;
             gap:12px;color:rgba(255,255,255,0.5)"
    >
      <span style="font-size:48px">!</span>
      <span>Slide {{ activeIndex + 1 }} failed to load</span>
    </div>
  </template>
</ReelPlayerOverlay>`}
          language="vue"
        />
      </section>

      {/* Timeline */}
      <section className="mb-12">
        <Heading level={2} id="timeline" className="text-2xl font-bold mb-4">
          时间轴
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          浮层会在当前视频上方渲染一个内置的播放时间轴条。用{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            timeline
          </code>{' '}
          属性控制它： <code className="font-mono text-xs">'auto'</code>{' '}
          （默认）只要当前媒体是时长超过{' '}
          <code className="font-mono text-xs">timelineMinDurationSeconds</code>{' '}
          （默认 30）的视频就渲染，{' '}
          <code className="font-mono text-xs">'always'</code>{' '}
          则只要有视频在播就渲染，{' '}
          <code className="font-mono text-xs">'never'</code>{' '}
          则关闭。若要完全自定义拖动条，请用{' '}
          <code className="font-mono text-xs">#timeline</code>{' '}
          插槽；它的作用域会暴露一个{' '}
          <code className="font-mono text-xs">timelineState</code>{' '}
          ，其数据来自底层的{' '}
          <code className="font-mono text-xs">TimelineController</code>.
        </p>
        <CodeBlock
          code={`<ReelPlayerOverlay
  :is-open="isOpen"
  :content="items"
  timeline="auto"
  :timeline-min-duration-seconds="30"
  @close="isOpen = false"
/>`}
          language="vue"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          通过 <code className="font-mono text-xs">--rk-reel-timeline-*</code>{' '}
          CSS 自定义属性。
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
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelPlayerOverlay
          </code>{' '}
          会在根节点挂载一个{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SoundProvider
          </code>{' '}
          ，因此渲染在内部的任何组件都能通过{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            useSoundState
          </code>
          读取或切换静音状态。这个组合式函数从{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/vue-reel-player
          </code>{' '}
          重新导出，所以你不需要额外的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/vue
          </code>{' '}
          引入。
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { useSoundState, toVueRef } from '@reelkit/vue';

// Inside a custom control rendered from the #controls slot:
const soundState = useSoundState();
const muted = toVueRef(soundState.muted);
</script>

<template>
  <button @click="soundState.toggle()">
    {{ muted ? 'Unmute' : 'Mute' }}
  </button>
</template>`}
          language="vue"
        />
        <Callout type="info" className="mt-4">
          在播放器内部，{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #controls
          </code>{' '}
          插槽的作用域上还暴露了{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            soundState
          </code>{' '}
          。只在控件模板里用得到时，优先用它。
        </Callout>
      </section>

      {/* CSS Classes */}
      <section className="mb-12">
        <Heading level={2} id="css-classes" className="text-2xl font-bold mb-4">
          CSS 类名
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          CSS 类名都是普通类名（没有 scoped）。在{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue-reel-player/styles.css
          </code>{' '}
          之后加载的样式表可以用更高优先级的选择器覆盖它们。若只是改颜色、尺寸和
          z-index，请使用{' '}
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
          （或浮层的任意祖先元素）上覆盖，即可在不改组件源码的情况下换主题。这些变量与{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-reel-player
          </code>
          保持一致，因此覆盖样式可以在不同框架绑定之间通用。
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
            @reelkit/vue-reel-player/styles.css
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
            aria-label
          </code>{' '}
          属性可以改变屏幕阅读器的播报内容，默认是 “Video
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
