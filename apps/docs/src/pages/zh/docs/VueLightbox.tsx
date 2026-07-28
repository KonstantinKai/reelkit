import { Link } from 'react-router-dom';
import { Callout } from '../../../components/ui/Callout';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Sandbox } from '../../../components/ui/Sandbox';
import { FeatureCardGrid } from '../../../components/ui/FeatureCard';
import {
  Image,
  Zap,
  Keyboard,
  Maximize2,
  Layers,
  X,
  Hash,
  Volume2,
  MousePointer,
  Loader,
  AlertTriangle,
  Link2,
} from 'lucide-react';
import { Heading } from '../../../components/ui/Heading';
import { zhPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/vue-lightbox',
    title: 'Vue Lightbox · ReelKit',
    description:
      'Vue 全屏图片画廊浮层：LightboxOverlay 属性与事件、插槽作用域类型、内容加载与主题定制。',
  });

// Headings carry the English slug as an explicit id — the slug generator
// is ascii-only, so a Chinese heading would produce an empty anchor.

const lightboxUrlProps = [
  {
    prop: 'controller',
    type: 'UrlStateController',
    default: '必填',
    description:
      '来自 useOverlayUrlState 的控制器。它的 position 决定浮层是否打开、显示哪一张；浮层会在切换幻灯片和关闭时通过它写回。',
  },
];

const lightboxProps = [
  {
    prop: 'isOpen',
    type: 'boolean',
    default: '必填',
    description:
      '控制显示；为 false 时浮层会从 DOM 中移除。可用 v-model:is-open 双向绑定。',
  },
  {
    prop: 'items',
    type: 'LightboxItem[]',
    default: '必填',
    description: '条目数组（图片或视频）',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: '初始可见条目的索引（从 0 开始）',
  },
  {
    prop: 'transitionFn',
    type: 'TransitionTransformFn',
    default: 'slideTransition',
    description:
      '幻灯片过渡函数。可以引入内置的（slideTransition、flipTransition、lightboxFadeTransition、lightboxZoomTransition），也可以传自定义的。省略时默认为 slideTransition。',
  },
  {
    prop: 'showInfo',
    type: 'boolean',
    default: 'true',
    description: '是否渲染标题 / 描述信息浮层',
  },
  {
    prop: 'showControls',
    type: 'boolean',
    default: 'true',
    description: '是否渲染顶部控件栏（关闭、计数、全屏）',
  },
  {
    prop: 'showNavigation',
    type: 'boolean',
    default: 'true',
    description: '是否渲染上一张 / 下一张导航箭头（仅桌面端）',
  },
  {
    prop: 'transitionDuration',
    type: 'number',
    default: '300',
    description: '幻灯片动画时长（毫秒）',
  },
  {
    prop: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: '触发切换所需的最小滑动距离占比（0–1）',
  },
  {
    prop: 'swipeToCloseDirection',
    type: "'up' | 'down'",
    default: "'up'",
    description: '移动端滑动关闭手势的方向',
  },
  {
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description: '滑动器是否从最后一张绕回第一张',
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
    prop: 'wheelDebounceMs',
    type: 'number',
    default: '200',
    description: '滚轮事件的防抖时长（毫秒）',
  },
  {
    prop: 'ariaLabel',
    type: 'string',
    default: "'Image gallery'",
    description: '对话框区域的无障碍标签',
  },
];

const lightboxEvents = [
  {
    name: 'close',
    payload: 'void',
    description: '用户关闭Lightbox时发出',
  },
  {
    name: 'slide-change',
    payload: 'number',
    description: '切换后发出，带上新的活动幻灯片索引',
  },
  {
    name: 'api-ready',
    payload: 'LightboxApi',
    description: '滑动器就绪时发出一次，同时暴露命令式 API',
  },
  {
    name: 'update:is-open',
    payload: 'boolean',
    description: '关闭时发出；用于支持 v-model:is-open',
  },
];

const lightboxItemFields = [
  {
    prop: 'src',
    type: 'string',
    required: true,
    description: '图片或视频的 URL',
  },
  {
    prop: 'type',
    type: "'image' | 'video'",
    required: false,
    description: "Item type. Defaults to 'image'",
  },
  {
    prop: 'poster',
    type: 'string',
    required: false,
    description: '视频条目的缩略图',
  },
  {
    prop: 'title',
    type: 'string',
    required: false,
    description: '信息浮层中显示的标题',
  },
  {
    prop: 'description',
    type: 'string',
    required: false,
    description: '标题下方显示的描述',
  },
  {
    prop: 'width',
    type: 'number',
    required: false,
    description: '图片固有宽度（像素）',
  },
  {
    prop: 'height',
    type: 'number',
    required: false,
    description: '图片固有高度（像素）',
  },
];

const scopedSlots = [
  {
    slot: 'slide',
    scope: 'SlideSlotScope',
    description: '替换单张幻灯片的内容（视频幻灯片必须提供）',
  },
  {
    slot: 'controls',
    scope: 'ControlsSlotScope',
    description: '替换顶部控件栏（关闭、计数、全屏）',
  },
  {
    slot: 'navigation',
    scope: 'NavigationSlotScope',
    description: '替换上一张 / 下一张导航箭头',
  },
  {
    slot: 'info',
    scope: 'InfoSlotScope',
    description: '替换底部的标题 / 描述渐变浮层',
  },
  {
    slot: 'loading',
    scope: 'LoadingSlotScope',
    description: '自定义加载提示',
  },
  {
    slot: 'error',
    scope: 'ErrorSlotScope',
    description: '自定义错误提示',
  },
];

const scopeTypes = [
  {
    name: 'SlideSlotScope',
    fields:
      '{ item, index, size: [number, number], isActive, onReady, onWaiting, onError }',
  },
  {
    name: 'ControlsSlotScope',
    fields:
      '{ item, activeIndex, count, isFullscreen, onClose, onToggleFullscreen }',
  },
  {
    name: 'NavigationSlotScope',
    fields: '{ item, activeIndex, count, onPrev, onNext }',
  },
  { name: 'InfoSlotScope', fields: '{ item, index }' },
  { name: 'LoadingSlotScope', fields: '{ item, activeIndex }' },
  { name: 'ErrorSlotScope', fields: '{ item, activeIndex }' },
];

const lifecycleCallbacks = [
  {
    callback: 'onReady',
    type: '() => void',
    description: '通知幻灯片内容已成功加载（例如图片解码完成）',
  },
  {
    callback: 'onWaiting',
    type: '() => void',
    description: '通知幻灯片内容正在加载 / 缓冲（显示转圈动画）',
  },
  {
    callback: 'onError',
    type: '() => void',
    description: '通知幻灯片内容加载失败（显示错误图标）',
  },
];

const transitions = [
  {
    name: 'slideTransition',
    description: '默认。幻灯片之间横向平移；从 @reelkit/vue 重新导出。',
  },
  {
    name: 'lightboxFadeTransition',
    description:
      '交叉淡入淡出，带轻微的横向位移。仅存在于 @reelkit/vue-lightbox。',
  },
  {
    name: 'flipTransition',
    description: '绕 Y 轴的 3D 翻转；从 @reelkit/vue 重新导出。',
  },
  {
    name: 'lightboxZoomTransition',
    description:
      '进入的幻灯片从 70% 放大到 100% 并淡入。仅存在于 @reelkit/vue-lightbox。',
  },
];

const cssClasses = [
  {
    className: '.rk-lightbox-overlay',
    component: 'Overlay',
    description: '根容器（全屏背景层）',
  },
  {
    className: '.rk-lightbox-top-shade',
    component: 'Overlay',
    description: '控件背后的顶部渐变遮罩',
  },
  {
    className: '.rk-lightbox-spinner',
    component: 'Overlay',
    description: '默认的加载转圈动画',
  },
  {
    className: '.rk-lightbox-error',
    component: 'Overlay',
    description: '错误状态容器（图片损坏）',
  },
  {
    className: '.rk-lightbox-error-text',
    component: 'Overlay',
    description: '错误状态文字标签',
  },
  {
    className: '.rk-lightbox-controls-left',
    component: '控制内容',
    description: '左上角控件容器',
  },
  {
    className: '.rk-lightbox-btn',
    component: '控制内容',
    description: '控制按钮（全屏、声音等）',
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
  {
    className: '.rk-lightbox-nav',
    component: '导航',
    description: '导航箭头（上一张和下一张）',
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
  {
    className: '.rk-lightbox-info',
    component: 'Info',
    description: '标题 / 描述容器',
  },
  {
    className: '.rk-lightbox-info-title',
    component: 'Info',
    description: '图片标题',
  },
  {
    className: '.rk-lightbox-info-description',
    component: 'Info',
    description: '图片描述',
  },
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
  {
    token: '--rk-lightbox-overlay-bg',
    default: '#000',
    controls: 'Backdrop color',
  },
  {
    token: '--rk-lightbox-overlay-z',
    default: '9999',
    controls: 'Overlay z-index',
  },
  {
    token: '--rk-lightbox-top-shade-height',
    default: '80px',
    controls: 'Top scrim height',
  },
  {
    token: '--rk-lightbox-top-shade-bg',
    default: 'linear-gradient(rgba(0,0,0,0.6), transparent)',
    controls: 'Top scrim gradient',
  },
  {
    token: '--rk-lightbox-edge-padding',
    default: '16px',
    controls: 'Edge inset for close / nav / controls',
  },
  {
    token: '--rk-lightbox-btn-bg',
    default: 'rgba(0, 0, 0, 0.5)',
    controls: 'Default background for close / nav / small buttons',
  },
  {
    token: '--rk-lightbox-btn-bg-hover',
    default: 'rgba(255, 255, 255, 0.2)',
    controls: 'Hover background for close / nav / small buttons',
  },
  {
    token: '--rk-lightbox-btn-fg',
    default: '#fff',
    controls: 'Icon color for close / nav / small buttons',
  },
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
    controls: 'Prev / next arrow size',
  },
  {
    token: '--rk-lightbox-nav-opacity',
    default: '0.7',
    controls: 'Idle opacity of prev / next arrows',
  },
  {
    token: '--rk-lightbox-counter-bg',
    default: 'rgba(0, 0, 0, 0.5)',
    controls: 'Counter chip background',
  },
  {
    token: '--rk-lightbox-counter-fg',
    default: '#fff',
    controls: 'Counter text color',
  },
  {
    token: '--rk-lightbox-info-bg',
    default: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
    controls: 'Caption scrim gradient',
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
    token: '--rk-lightbox-video-bg',
    default: '#000',
    controls: 'Letterbox background behind <video>',
  },
];

const keyboardShortcuts = [
  { key: 'ArrowLeft', action: 'Previous image' },
  { key: 'ArrowRight', action: 'Next image' },
  { key: 'Escape', action: 'Close lightbox (or exit fullscreen if active)' },
];

const basicUsageCode = `<script setup lang="ts">
import { ref } from 'vue';
import { LightboxOverlay, type LightboxItem } from '@reelkit/vue-lightbox';
import '@reelkit/vue-lightbox/styles.css';

const images: LightboxItem[] = [
  {
    src: '/cdn/samples/images/image-01.jpg',
    title: 'Mountain River',
    description: 'A beautiful mountain river',
  },
  {
    src: '/cdn/samples/images/image-02.jpg',
    title: 'Snowy Peaks',
  },
  {
    src: '/cdn/samples/images/image-03.jpg',
    title: 'Misty Forest',
    description: 'Morning fog over the forest canopy',
  },
  {
    src: '/cdn/samples/images/image-04.jpg',
    title: 'Autumn Trail',
  },
  {
    src: '/cdn/samples/images/image-05.jpg',
    title: 'Ocean Cliff',
    description: 'Dramatic cliffs above the Pacific',
  },
  {
    src: '/cdn/samples/images/image-06.jpg',
    title: 'Desert Dunes',
  },
];

const open = ref(false);
const startIndex = ref(0);

function openAt(i: number) {
  startIndex.value = i;
  open.value = true;
}
</script>

<template>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
    <button
      v-for="(img, i) in images"
      :key="img.src"
      style="aspect-ratio:4/3;cursor:pointer"
      @click="openAt(i)"
    >
      <img :src="img.src" style="width:100%;height:100%;object-fit:cover" />
    </button>
  </div>

  <LightboxOverlay
    v-model:is-open="open"
    :items="images"
    :initial-index="startIndex"
  />
</template>`;

const slotsExampleCode = `<template>
  <LightboxOverlay v-model:is-open="open" :items="items">
    <!-- Custom info overlay -->
    <template #info="{ item }">
      <div class="my-caption">
        <h2>{{ item.title }}</h2>
        <p>{{ item.description }}</p>
      </div>
    </template>

    <!-- Custom navigation -->
    <template #navigation="{ onPrev, onNext, activeIndex, count }">
      <div class="my-nav">
        <button :disabled="activeIndex === 0" @click="onPrev">Prev</button>
        <span>{{ activeIndex + 1 }} / {{ count }}</span>
        <button :disabled="activeIndex === count - 1" @click="onNext">Next</button>
      </div>
    </template>

    <!-- Custom controls -->
    <template #controls="{ onClose, isFullscreen, onToggleFullscreen }">
      <div class="my-controls">
        <button @click="onToggleFullscreen">
          {{ isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen' }}
        </button>
        <button @click="onClose">Close</button>
      </div>
    </template>
  </LightboxOverlay>
</template>`;

const videoOptInCode = `<script setup lang="ts">
import { ref } from 'vue';
import {
  LightboxOverlay,
  useVideoSlideRenderer,
  type LightboxItem,
} from '@reelkit/vue-lightbox';
import '@reelkit/vue-lightbox/styles.css';

const open = ref(false);
const items: LightboxItem[] = [
  { src: '/image-01.jpg', title: 'Image' },
  {
    type: 'video',
    src: '/clip.mp4',
    poster: '/clip.jpg',
    title: 'Clip',
  },
];

const { VideoSlideRenderer, VideoControlsRenderer, SoundProvider } =
  useVideoSlideRenderer(items);
</script>

<template>
  <SoundProvider>
    <LightboxOverlay v-model:is-open="open" :items="items">
      <template #slide="scope">
        <VideoSlideRenderer v-bind="scope" />
      </template>
      <template #controls="scope">
        <VideoControlsRenderer v-bind="scope" />
      </template>
    </LightboxOverlay>
  </SoundProvider>
</template>`;

const fullscreenCode = `<script setup lang="ts">
import { shallowRef } from 'vue';
import { useFullscreen } from '@reelkit/vue';

const containerRef = shallowRef<HTMLDivElement | null>(null);
const { isFullscreen, toggle } = useFullscreen({ elementRef: containerRef });
</script>

<template>
  <div ref="containerRef">
    <button @click="toggle">
      {{ isFullscreen.value ? 'Exit fullscreen' : 'Enter fullscreen' }}
    </button>
  </div>
</template>`;

const customTransitionCode = `<script setup lang="ts">
import {
  LightboxOverlay,
  lightboxFadeTransition,
  lightboxZoomTransition,
} from '@reelkit/vue-lightbox';
</script>

<template>
  <!-- Built-in transition -->
  <LightboxOverlay
    v-model:is-open="open"
    :items="items"
    :transition-fn="lightboxFadeTransition"
  />

  <!-- Different built-in -->
  <LightboxOverlay
    v-model:is-open="open"
    :items="items"
    :transition-fn="lightboxZoomTransition"
  />
</template>`;

const lifecycleSlideCode = `<template>
  <LightboxOverlay v-model:is-open="open" :items="items">
    <template
      #slide="{ item, size, isActive, onReady, onWaiting, onError }"
    >
      <template v-if="item.type === 'video'">
        <video
          :src="item.src"
          :poster="item.poster"
          :autoplay="isActive"
          :style="{ width: \`\${size[0]}px\`, height: \`\${size[1]}px\`, objectFit: 'contain' }"
          @canplay="onReady"
          @waiting="onWaiting"
          @error="onError"
        />
      </template>
      <template v-else>
        <img
          :src="item.src"
          :style="{ width: \`\${size[0]}px\`, height: \`\${size[1]}px\`, objectFit: 'contain' }"
          @load="onReady"
          @error="onError"
        />
      </template>
    </template>
  </LightboxOverlay>
</template>`;

const customLoadingCode = `<template>
  <LightboxOverlay v-model:is-open="open" :items="items">
    <template #loading="{ item, activeIndex }">
      <div class="my-loading">
        <span>Loading image {{ activeIndex + 1 }}…</span>
        <span class="muted">{{ item.title }}</span>
      </div>
    </template>
  </LightboxOverlay>
</template>`;

const customErrorCode = `<template>
  <LightboxOverlay v-model:is-open="open" :items="items">
    <template #error="{ item, activeIndex }">
      <div class="my-error">
        <span>Failed to load</span>
        <span class="muted">{{ item.title ?? item.src }}</span>
      </div>
    </template>
  </LightboxOverlay>
</template>`;

const themingCode = `<style>
:root {
  --rk-lightbox-overlay-bg: #0f172a;
  --rk-lightbox-btn-bg: rgba(99, 102, 241, 0.65);
  --rk-lightbox-btn-bg-hover: rgba(168, 85, 247, 0.85);
  --rk-lightbox-info-bg: linear-gradient(
    transparent,
    rgba(99, 102, 241, 0.55) 60%,
    rgba(168, 85, 247, 0.85)
  );
}
</style>`;

export default function VueLightbox() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Vue Lightbox</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          面向 Vue 3 的全屏图片与视频画廊Lightbox，基于{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue-lightbox
          </code>
          .
        </p>
        <a
          href="https://vue-demo.reelkit.dev/image-preview?utm_source=docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          查看在线演示 →
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
                desc: '预取前后各 2 张',
              },
              {
                icon: Volume2,
                label: '声音开关',
                desc: '逐张静音 / 取消静音',
              },
              {
                icon: Loader,
                label: '加载状态',
                desc: '转圈动画 + 自定义插槽',
              },
              {
                icon: AlertTriangle,
                label: '错误处理',
                desc: '错误图标 + 自定义插槽',
              },
              {
                icon: Layers,
                label: '作用域插槽',
                desc: '6 个可定制的插槽区域',
              },
              {
                icon: Layers,
                label: 'v-model',
                desc: 'v-model:is-open 双向绑定',
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

      <section className="mb-12">
        <Heading
          level={2}
          id="installation"
          className="text-2xl font-bold mb-4"
        >
          安装
        </Heading>
        <CodeBlock
          code={`npm install @reelkit/vue-lightbox @reelkit/vue lucide-vue-next`}
          language="bash"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          别忘了引入样式：
        </p>
        <CodeBlock
          code={`import '@reelkit/vue-lightbox/styles.css';`}
          language="typescript"
        />
        <Callout type="info" title="图标" className="mt-4">
          默认控件使用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lucide-vue-next
          </code>{' '}
          作为图标。如果你想换一套图标库，可以用{' '}
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

      <section className="mb-12">
        <Heading level={2} id="basic-usage" className="text-2xl font-bold mb-4">
          基本用法
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          引入样式表和{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            LightboxOverlay
          </code>{' '}
          组件，然后用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            v-model:is-open
          </code>
          .
        </p>
        <Sandbox
          code={basicUsageCode}
          language="vue"
          title="App.vue"
          framework="vue"
          stackblitzDeps={['@reelkit/vue-lightbox']}
          stackblitzExtraDeps={{ 'lucide-vue-next': '>=0.460.0' }}
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="scoped-slots"
          className="text-2xl font-bold mb-4"
        >
          作用域插槽
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          六个具名作用域插槽让你完全定制浮层的各个界面。省略插槽即保留内置默认实现；插槽内部什么都不放（例如用{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            v-if="false"
          </code>
          ）就能把该部分整个隐藏。
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
        <CodeBlock code={slotsExampleCode} language="vue" />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="video-support"
          className="text-2xl font-bold mb-4"
        >
          视频支持
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          视频幻灯片是按需开启的，默认产物里不会掺进音视频相关代码。调用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            useVideoSlideRenderer(items)
          </code>{' '}
          并把返回的 <code>VideoSlideRenderer</code> /{' '}
          <code>VideoControlsRenderer</code> 接到浮层的 <code>#slide</code> 和{' '}
          <code>#controls</code> 插槽上。再把浮层包进返回的{' '}
          <code>SoundProvider</code> 里，内置的声音开关才有上下文。
        </p>
        <CodeBlock code={videoOptInCode} language="vue" />
        <Callout type="info" className="mt-4">
          驱动视频幻灯片的共享 <code>&lt;video&gt;</code> 元素与 vue reel-player
          用的是同一套模式 —— 在 iOS
          上切换幻灯片时播放不会中断，也不需要每张都由用户手势触发。
        </Callout>
      </section>

      <section className="mb-12">
        <Heading level={2} id="fullscreen" className="text-2xl font-bold mb-4">
          全屏
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          使用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            useFullscreen
          </code>{' '}
          from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/vue
          </code>{' '}
          来观察或切换某个引用元素的全屏状态。Lightbox内置的全屏按钮用的就是同一个组合式函数。
        </p>
        <CodeBlock code={fullscreenCode} language="vue" />
      </section>

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
            LightboxUrlOverlay
          </code>{' '}
          作为{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            controller
          </code>
          ，地址栏就拥有了这个画廊：参数指向某张幻灯片时它自己打开，参数消失时关闭。链接可以分享，返回键会关闭画廊。它是一个独立于{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            LightboxOverlay
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
          只有从应用内部打开时返回键才会关闭 ——
          因为那次链接压入了一条记录，返回就会弹回画廊。在新标签页里直接打开的分享链接背后没有历史，浏览器返回会离开站点；这时关闭按钮或
          Escape 会就地移除参数，把你留在画廊上。
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { LightboxUrlOverlay, type LightboxItem } from '@reelkit/vue-lightbox';
import { useOverlayUrlState, urlIndexKey, urlStableIdKey } from '@reelkit/vue';
import '@reelkit/vue-lightbox/styles.css';

const props = defineProps<{ images: LightboxItem[] }>();

const photo = useOverlayUrlState({
  param: 'photo',
  ...urlIndexKey(() => props.images.length),
});
</script>

<template>
  <!-- Opening is a link — the href is the open action. No open flag, no
       handler: the overlay reads the URL and opens itself. -->
  <RouterLink v-for="(img, i) in props.images" :key="img.src" :to="\`?photo=\${i}\`">
    <img :src="img.src" />
  </RouterLink>

  <LightboxUrlOverlay :controller="photo" :items="props.images" />
</template>`}
          language="vue"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          这个组合式函数接受一个选项对象，返回一个{' '}
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
            to="/zh/docs/vue/api#useoverlayurlstate"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Vue API 参考
          </Link>
          .
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            LightboxUrlOverlay
          </code>{' '}
          本身只接受{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            :controller
          </code>{' '}
          （必填）、一个{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @close
          </code>{' '}
          事件，外加所有视觉和行为属性{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            LightboxOverlay
          </code>{' '}
          所转发的（{''}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            items
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            transition-fn
          </code>
          、各种作用域插槽等等）—— 但没有{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            is-open
          </code>
          .
        </p>
        <ul className="mt-4 mb-4 list-disc pl-6 space-y-1 text-slate-600 dark:text-slate-400">
          <li>
            打开会花掉一条历史记录；翻页则是替换它，所以滑一百次也不会多出记录
            —— 退一步永远就是离开画廊。
          </li>
          <li>
            像{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              ?photo=3
            </code>{' '}
            会把画廊直接打开到那一张。指向不存在幻灯片的参数会从 URL
            中移除，而不是继续声称一张打不开的幻灯片。
          </li>
        </ul>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          <strong>带路由的应用请传入适配器。</strong> 直接写历史会让路由器自己的
          location 过期，下一次导航就会把参数丢掉。
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { useVueRouterUrlAdapter } from '@reelkit/vue/vue-router-url-adapter';

const adapter = useVueRouterUrlAdapter();
const photo = useOverlayUrlState({
  param: 'photo',
  adapter,
  ...urlIndexKey(() => images.length),
});
</script>

<template>
  <LightboxUrlOverlay :controller="photo" :items="images" />
</template>`}
          language="vue"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          <strong>稳定的链接。</strong>{' '}
          索引是按位置的，所以列表重新排序后书签会打开另一张图片。{' '}
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
          code={`<script setup lang="ts">
const photo = useOverlayUrlState({
  param: 'photo',
  ...urlStableIdKey({ items: () => images }),
});
</script>

<template>
  <LightboxUrlOverlay :controller="photo" :items="images" />
</template>`}
          language="vue"
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
          ：{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            codec
          </code>{' '}
          把身份写进 URL，{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locator
          </code>{' '}
          负责找到它现在在哪。
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
const photo = useOverlayUrlState({
  param: 'photo',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => images.findIndex((x) => x.slug === id),
    identify: (index) => images[index].slug,
  },
});
</script>

<template>
  <LightboxUrlOverlay :controller="photo" :items="images" />
</template>`}
          language="vue"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          <strong>无限 / 分页画廊。</strong>{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locate
          </code>{' '}
          是同步的，因此只能回答已经加载过的条目 —— 只加载了 20 张时，指向第 400
          张的分享链接就查不到。{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locateAsync
          </code>{' '}
          是兜底，只有在未命中时才调用：把需要的页拉进来，再返回该身份最终对应的索引。
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
          code={`<script setup lang="ts">
const photo = useOverlayUrlState({
  param: 'photo',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => items.value.findIndex((x) => x.id === id),
    identify: (index) => items.value[index].id,
    locateAsync: async (id) => {
      const loaded = await loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!loaded) return null; // exhausted — link names no item
      items.value = loaded; // commit; the overlay renders from this
      return loaded.findIndex((x) => x.id === id); // wherever it landed
    },
  },
});
</script>

<template>
  <LightboxUrlOverlay :controller="photo" :items="items" />
</template>`}
          language="vue"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          在它未完成期间，Lightbox保持关闭，参数也不动，因此深链能熬过这次请求。{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            null
          </code>{' '}
          或请求被拒绝则会移除参数。如果结果在 URL
          已经变化、Lightbox已关闭或组件已卸载之后才到达，就会被丢弃，因此慢请求不能打开一张没人要的幻灯片。它返回什么都以它为准
          ——
          它报告的是自己刚取到的数据的索引，Lightbox会直接采用，而不是再去读一遍{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            items
          </code>
          ，那里 Vue 还没有重新渲染。
        </p>
      </section>

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
          className="text-xl font-semibold mb-3"
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
            is-open
          </code>
          ，并把它换成{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            controller
          </code>
          。它会发出{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            close
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            slide-change
          </code>{' '}
          和{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            api-ready
          </code>
          ，但没有{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            update:is-open
          </code>
          .{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            initial-index
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
          id="lightboxoverlay-events"
          className="text-xl font-semibold mt-8 mb-3"
        >
          LightboxOverlay 事件
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">事件</th>
                <th className="text-left py-3 px-4 font-semibold">负载</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {lightboxEvents.map((e) => (
                <tr
                  key={e.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {e.name}
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
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="lightboxitem-interface"
          className="text-2xl font-bold mb-4"
        >
          LightboxItem 接口
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">字段</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">必填</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {lightboxItemFields.map((f) => (
                <tr
                  key={f.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {f.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {f.type}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-sm">
                    {f.required ? 'yes' : 'no'}
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

      <section className="mb-12">
        <Heading
          level={2}
          id="slot-scope-types"
          className="text-2xl font-bold mb-4"
        >
          插槽作用域类型
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
              {scopeTypes.map((s) => (
                <tr
                  key={s.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {s.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {s.fields}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="transitions" className="text-2xl font-bold mb-4">
          过渡动画
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          把任意{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            TransitionTransformFn
          </code>{' '}
          通过{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            transition-fn
          </code>{' '}
          属性传入。只引入你用到的那个过渡，打包器就能把其余的摇掉。省略时默认为{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            slideTransition
          </code>{' '}
          。
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">函数</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {transitions.map((t) => (
                <tr
                  key={t.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {t.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {t.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CodeBlock code={customTransitionCode} language="vue" />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="content-loading-amp-error-handling"
          className="text-2xl font-bold mb-4"
        >
          内容加载与错误处理
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          当你通过{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slide
          </code>{' '}
          插槽接管渲染时，插槽作用域上有三个生命周期回调可用于上报加载状态。Lightbox会逐张跟踪状态，并据此显示转圈动画或错误图标。内容预加载器会缓存损坏的
          URL，因此再次访问失败的幻灯片不会重试。
        </p>

        <Heading
          level={3}
          id="lifecycle-callbacks"
          className="text-xl font-semibold mt-6 mb-4"
        >
          生命周期回调
        </Heading>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">回调</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {lifecycleCallbacks.map((c) => (
                <tr
                  key={c.callback}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {c.callback}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {c.type}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {c.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="wiring-callbacks-in-slide"
          className="text-xl font-semibold mt-6 mb-4"
        >
          在 #slide 中接上回调
        </Heading>
        <CodeBlock code={lifecycleSlideCode} language="vue" />

        <Heading
          level={3}
          id="custom-loading-slot"
          className="text-xl font-semibold mt-8 mb-4"
        >
          自定义加载插槽
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use the <code>#loading</code> 插槽替换默认的转圈动画。
        </p>
        <CodeBlock code={customLoadingCode} language="vue" />

        <Heading
          level={3}
          id="custom-error-slot"
          className="text-xl font-semibold mt-8 mb-4"
        >
          自定义错误插槽
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use the <code>#error</code> 插槽替换默认的图片损坏图标。
        </p>
        <CodeBlock code={customErrorCode} language="vue" />
      </section>

      <section className="mb-12">
        <Heading level={2} id="css-classes" className="text-2xl font-bold mb-4">
          CSS 类名
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          所有 CSS 类名都是普通类名（没有 scoped），因此可以在{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue-lightbox/styles.css
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
        <div className="overflow-x-auto">
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

      <section className="mb-12">
        <Heading level={2} id="theming" className="text-2xl font-bold mb-4">
          主题定制
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          在 <code>--rk-lightbox-*</code> 上覆盖任意 <code>:root</code> （或{' '}
          <code>.rk-lightbox-overlay</code>的任意祖先元素）即可换主题。直接写在{' '}
          <code>.rk-lightbox-overlay</code>{' '}
          上的声明会遮蔽继承下来的值，所以请把覆盖写在祖先选择器上。
        </p>
        <div className="overflow-x-auto mb-4">
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
        <CodeBlock code={themingCode} language="css" />
      </section>

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
          属性可以改变屏幕阅读器的播报内容，默认是 “Image
          gallery”。每张幻灯片都带有{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="group"
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-roledescription="slide"
          </code>
          ，以及{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-label
          </code>{' '}
          ，由位置推导而来（例如 “Image 2 of 5”）。
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
            @reelkit/vue
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
