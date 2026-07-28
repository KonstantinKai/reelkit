import { Link } from 'react-router-dom';
import { Callout } from '../../../components/ui/Callout';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Sandbox } from '../../../components/ui/Sandbox';
import { FeatureCardGrid } from '../../../components/ui/FeatureCard';
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
  AlertTriangle,
  Loader,
  Link2,
} from 'lucide-react';
import { Heading } from '../../../components/ui/Heading';
import { zhPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/angular-lightbox',
    title: 'Angular Lightbox · ReelKit',
    description:
      'Angular 全屏图片画廊浮层：组件输入与输出、模板插槽上下文类型、内容加载与主题定制。',
  });

// Headings carry the English slug as an explicit id — the slug generator
// is ascii-only, so a Chinese heading would produce an empty anchor.

const lightboxInputs = [
  {
    prop: 'isOpen',
    type: 'boolean',
    default: '必填',
    description: '控制显示；为 false 时浮层会从 DOM 中移除',
  },
  {
    prop: 'items',
    type: 'LightboxItem[]',
    default: '必填',
    description: 'Lightbox条目数组（图片或视频）',
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
    description: '是否渲染上一张 / 下一张导航箭头',
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

const lightboxOutputs = [
  {
    prop: 'closed',
    type: 'EventEmitter<void>',
    description: '用户关闭Lightbox时发出',
  },
  {
    prop: 'slideChange',
    type: 'EventEmitter<number>',
    description: '当前幻灯片索引变化时发出',
  },
];

const lightboxItemProps = [
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

const templateSlots = [
  {
    directive: 'rkLightboxControls',
    context: 'LightboxControlsContext',
    description: '替换顶部控件栏（关闭按钮、计数、全屏开关）',
  },
  {
    directive: 'rkLightboxNavigation',
    context: 'LightboxNavContext',
    description: '替换上一张 / 下一张导航箭头',
  },
  {
    directive: 'rkLightboxInfo',
    context: 'LightboxInfoContext',
    description: '替换底部的标题 / 描述渐变浮层',
  },
  {
    directive: 'rkLightboxSlide',
    context: 'LightboxSlideContext',
    description: '替换单张幻灯片的内容（视频幻灯片必须提供）',
  },
  {
    directive: 'rkLightboxLoading',
    context: '{ $implicit: activeIndex, item }',
    description: '自定义加载提示',
  },
  {
    directive: 'rkLightboxError',
    context: '{ $implicit: activeIndex, item }',
    description: '自定义错误提示',
  },
];

const contextTypes = [
  {
    name: 'LightboxControlsContext',
    fields:
      '{ item, onClose, activeIndex, count, isFullscreen, onToggleFullscreen }',
  },
  {
    name: 'LightboxNavContext',
    fields: '{ item, onPrev, onNext, activeIndex, count }',
  },
  {
    name: 'LightboxInfoContext',
    fields: '{ $implicit: LightboxItem, index }',
  },
  {
    name: 'LightboxSlideContext',
    fields:
      '{ $implicit: LightboxItem, index, size: [number, number], isActive, onReady, onWaiting, onError }',
  },
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

const cssClasses = [
  // Overlay
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
    className: '.rk-lightbox-img-error',
    component: 'Overlay',
    description: '错误状态容器（图片损坏）',
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
  {
    className: '.rk-lightbox-empty',
    component: 'Overlay',
    description: '空状态文字',
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
  {
    className: '.rk-lightbox-video-error',
    component: 'VideoSlide',
    description: '视频错误状态容器',
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

  // Video slide (opt-in)
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

export default function AngularLightbox() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Angular Lightbox</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          面向 Angular 的全屏图片与视频画廊Lightbox，基于{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/angular-lightbox
          </code>
          .
        </p>
        <a
          href="https://angular-demo.reelkit.dev/image-preview?utm_source=docs"
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
                desc: '转圈动画 + 自定义插槽',
              },
              {
                icon: AlertTriangle,
                label: '错误处理',
                desc: '错误图标 + 自定义插槽',
              },
              {
                icon: Layers,
                label: '模板插槽',
                desc: '6 个可定制的插槽区域',
              },
              {
                icon: Layers,
                label: 'OnPush',
                desc: 'Angular 信号 + OnPush',
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
          code={`npm install @reelkit/angular-lightbox @reelkit/angular lucide-angular`}
          language="bash"
        />
        <Callout type="info" title="图标" className="mt-4">
          默认控件使用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lucide-angular
          </code>{' '}
          作为图标。如果你想换一套图标库，可以用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkLightboxControls
          </code>{' '}
          和{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkLightboxNavigation
          </code>{' '}
          模板插槽提供自己的实现。
        </Callout>
      </section>

      <section className="mb-12">
        <Heading level={2} id="basic-usage" className="text-2xl font-bold mb-4">
          基本用法
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          把样式和独立组件{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RkLightboxOverlayComponent
          </code>{' '}
          引入组件的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            imports
          </code>{' '}
          数组。
        </p>
        <Sandbox
          code={`import { Component } from '@angular/core';
import {
  RkLightboxOverlayComponent,
  type LightboxItem,
} from '@reelkit/angular-lightbox';
import '@reelkit/angular-lightbox/styles.css';

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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RkLightboxOverlayComponent],
  template: \`
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
      @for (img of images; track img.src; let i = $index) {
        <button (click)="openIndex = i" style="aspect-ratio:4/3;cursor:pointer">
          <img [src]="img.src" style="width:100%;height:100%;object-fit:cover" />
        </button>
      }
    </div>

    <rk-lightbox-overlay
      [isOpen]="openIndex !== null"
      [items]="images"
      [initialIndex]="openIndex ?? 0"
      (closed)="openIndex = null"
    />
  \`,
})
export class AppComponent {
  images = images;
  openIndex: number | null = null;
}`}
          language="typescript"
          title="gallery.component.ts"
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
          四个模板插槽指令让你完全定制浮层界面，无需 fork
          组件。每个插槽都会收到带完整类型的上下文对象。
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
  RkLightboxOverlayComponent,
  RkLightboxControlsDirective,
  RkLightboxNavigationDirective,
  RkLightboxInfoDirective,
  RkCloseButtonComponent,
  RkCounterComponent,
  RkFullscreenButtonComponent,
  type LightboxItem,
  type LightboxControlsContext,
  type LightboxNavContext,
} from '@reelkit/angular-lightbox';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RkLightboxOverlayComponent,
    RkLightboxControlsDirective,
    RkLightboxNavigationDirective,
    RkLightboxInfoDirective,
    RkCloseButtonComponent,
    RkCounterComponent,
    RkFullscreenButtonComponent,
  ],
  template: \`
    <rk-lightbox-overlay [isOpen]="isOpen" [items]="images" (closed)="isOpen = false">

      <!-- Custom controls bar -->
      <ng-template rkLightboxControls
                   let-onClose="onClose"
                   let-activeIndex="activeIndex"
                   let-count="count"
                   let-isFullscreen="isFullscreen"
                   let-onToggleFullscreen="onToggleFullscreen">
        <div style="position:absolute;top:0;left:0;right:0;padding:12px;
                    display:flex;align-items:center;justify-content:space-between">
          <rk-close-button (clicked)="onClose()" />
          <rk-counter [currentIndex]="activeIndex + 1" [count]="count" />
          <rk-fullscreen-button
            [isFullscreen]="isFullscreen"
            (toggled)="onToggleFullscreen()" />
        </div>
      </ng-template>

      <!-- Custom navigation -->
      <ng-template rkLightboxNavigation
                   let-onPrev="onPrev"
                   let-onNext="onNext"
                   let-activeIndex="activeIndex"
                   let-count="count">
        <button (click)="onPrev()" [disabled]="activeIndex === 0">&#8592;</button>
        <button (click)="onNext()" [disabled]="activeIndex === count - 1">&#8594;</button>
      </ng-template>

      <!-- Custom info overlay -->
      <ng-template rkLightboxInfo let-item let-index="index">
        <div style="position:absolute;bottom:0;left:0;right:0;padding:16px;
                    background:linear-gradient(transparent,rgba(0,0,0,0.6))">
          <h3 style="color:#fff">{{ item.title }}</h3>
          <p style="color:rgba(255,255,255,0.7)">{{ item.description }}</p>
        </div>
      </ng-template>

    </rk-lightbox-overlay>
  \`,
})
export class AppComponent {
  images: LightboxItem[] = [];
  isOpen = false;
}`}
          language="typescript"
        />
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
          视频幻灯片需要通过{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkLightboxSlide
          </code>{' '}
          模板插槽和{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RkLightboxVideoSlideComponent
          </code>
          显式启用。这样设计是为了让只需要图片的画廊不必打包视频播放器。
        </p>
        <CodeBlock
          code={`import {
  RkLightboxOverlayComponent,
  RkLightboxSlideDirective,
  RkLightboxVideoSlideComponent,
  type LightboxItem,
  type LightboxSlideContext,
} from '@reelkit/angular-lightbox';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RkLightboxOverlayComponent,
    RkLightboxSlideDirective,
    RkLightboxVideoSlideComponent,
  ],
  template: \`
    <rk-lightbox-overlay [isOpen]="isOpen" [items]="items" (closed)="isOpen = false">
      <ng-template rkLightboxSlide
                   let-item
                   let-size="size"
                   let-isActive="isActive">
        @if (item.type === 'video') {
          <rk-lightbox-video-slide
            [item]="item"
            [size]="size"
            [isActive]="isActive"
          />
        } @else {
          <img [src]="item.src"
               [style.width.px]="size[0]"
               [style.height.px]="size[1]"
               style="object-fit:contain" />
        }
      </ng-template>
    </rk-lightbox-overlay>
  \`,
})
export class AppComponent {
  isOpen = false;
  items: LightboxItem[] = [
    { src: '/photo.jpg', title: 'Photo' },
    { src: '/clip.mp4', type: 'video', poster: '/clip-thumb.jpg', title: 'Video' },
  ];
}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="fullscreen" className="text-2xl font-bold mb-4">
          全屏
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          使用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            fullscreenSignal
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            requestFullscreen
          </code>
          、{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            exitFullscreen
          </code>{' '}
          from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/angular
          </code>{' '}
          来观察或切换全屏状态。
        </p>
        <CodeBlock
          code={`import { fullscreenSignal, requestFullscreen, exitFullscreen } from '@reelkit/angular';

@Component({ ... })
export class AppComponent {
  readonly isFullscreen = fullscreenSignal();

  toggle(container: HTMLElement): void {
    if (this.isFullscreen()) {
      exitFullscreen();
    } else {
      requestFullscreen(container);
    }
  }
}`}
          language="typescript"
        />
      </section>

      {/* URL state */}
      <section className="mb-12">
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          URL 状态
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            RkLightboxUrlOverlayComponent
          </code>{' '}
          是一个独立组件，它的打开状态存放在地址栏里。用{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createOverlayUrlState
          </code>{' '}
          构建控制器，再作为{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            [controller]
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
        <CodeBlock
          code={
            `import { RkLightboxUrlOverlayComponent } from '@reelkit/angular-lightbox';
import { createOverlayUrlState, urlIndexKey, urlStableIdKey } from '@reelkit/angular';

@Component({
  imports: [RkLightboxUrlOverlayComponent, RouterLink],
  template: ` +
            '`' +
            `
    @for (image of images(); track image.src; let i = $index) {
      <a [routerLink]="[]" [queryParams]="{ photo: i }">
        <img [src]="image.src" alt="" />
      </a>
    }

    <rk-lightbox-url-overlay [controller]="photo" [items]="images()" />
  ` +
            '`' +
            `,
})
export class GalleryComponent {
  protected readonly images = signal(photos);

  protected readonly photo = createOverlayUrlState({
    param: 'photo',
    ...urlIndexKey(() => this.images().length),
  });
}`
          }
          language="typescript"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          请在注入上下文中调用它 —— 字段初始化器或构造函数。它会立即挂载，并通过{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            DestroyRef
          </code>
          释放，因此画廊打开期间组件被销毁也不会留下监听器。完整选项见{' '}
          <Link
            to="/zh/docs/angular/api#createoverlayurlstate"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            Angular API 参考
          </Link>
          .
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li>
            打开时压入 <strong>一条</strong> 历史记录。翻页则是{' '}
            <strong>替换</strong> 它，因此走 N
            步也不会多出记录，退一步永远就是离开画廊。
          </li>
          <li>
            只有从应用内部打开画廊时返回键才会关闭它 ——
            因为那次链接压入了一条记录。在新标签页里直接打开的分享链接背后没有历史，浏览器返回会离开站点；这时用
            ✕ 按钮或 Escape 就地移除参数并留在页面上。
          </li>
          <li>
            指向不存在幻灯片的参数 —— 过期的书签、手改的值 —— 会从 URL
            中移除，而不是继续声称一张打不开的幻灯片。
          </li>
          <li>
            模板插槽用法不变：url
            组件自己执行六次插槽查询，并把每个模板转发给画廊，因此{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              rkLightboxControls
            </code>{' '}
            以及它的兄弟指令放在它内部，和放在{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              rk-lightbox-overlay
            </code>
            .
          </li>
          <li>
            带路由的应用请传入基于{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              Router
            </code>
            构建的适配器。绕过 Router 直接写历史会让它的 location
            过期，下一次导航就会把参数丢掉。
          </li>
        </ul>
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          <strong>带路由的应用请传入适配器。</strong> 绕过 Router
          直接写历史会让它的 location 过期，下一次导航就会把参数丢掉，所以请基于{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            Router
          </code>{' '}
          构建适配器并作为{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            adapter
          </code>
          :
        </p>
        <CodeBlock
          code={`import { createRouterUrlAdapter } from '@reelkit/angular/ng-router-url-adapter';

const adapter = createRouterUrlAdapter();

const photo = createOverlayUrlState({
  param: 'photo',
  adapter,
  ...urlIndexKey(() => this.images().length),
});`}
          language="typescript"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          <strong>稳定的链接。</strong> 索引是按位置的 —— 收藏下来的{' '}
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
          code={`const photo = createOverlayUrlState({
  param: 'photo',
  ...urlStableIdKey({ items: () => this.images() }),
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
          </code>{' '}
          （传输格式）和{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locator
          </code>{' '}
          （查找）：
        </p>
        <CodeBlock
          code={`const photo = createOverlayUrlState({
  param: 'photo',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => this.images().findIndex((x) => x.id === id),
    identify: (index) => this.images()[index].id,
  },
});`}
          language="typescript"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          <strong>无限或分页画廊。</strong>{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locate
          </code>{' '}
          是同步的，因此只能回答已经加载过的图片 —— 只加载了 20 张时，指向第 400
          张的分享链接就查不到。{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locateAsync
          </code>{' '}
          是兜底，只有在{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locate
          </code>{' '}
          未命中时才调用：把需要的页拉进来，再返回该身份最终对应的索引。在它未完成期间，画廊保持关闭，参数也不动，因此深链能熬过这次请求；{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            null
          </code>{' '}
          或请求被拒绝则会移除参数。
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
          code={`const photo = createOverlayUrlState({
  param: 'photo',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => this.images().findIndex((x) => x.id === id),
    identify: (index) => this.images()[index].id,
    locateAsync: async (id) => {
      const loaded = await loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!loaded) return null; // exhausted — link names no item
      this.images.set(loaded); // commit; the overlay renders from this
      return loaded.findIndex((x) => x.id === id); // wherever it landed
    },
  },
});`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="rklightboxurloverlaycomponent-inputs"
          className="text-2xl font-bold mb-4"
        >
          RkLightboxUrlOverlayComponent 输入
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          接受{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            rk-lightbox-overlay
          </code>{' '}
          的所有输入，除了{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            isOpen
          </code>
          ，它被控制器取代。输出与{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            closed
          </code>{' '}
          和{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            slideChange
          </code>
          相同；关闭由 URL 驱动，因此{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            closed
          </code>{' '}
          只是一个通知，而不是关闭机制本身。
        </p>
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
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  controller
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-600 dark:text-slate-400">
                  UrlStateController
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-500">
                  必填
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  来自 createOverlayUrlState 的控制器。它的 position
                  决定画廊是否打开、显示哪一张；组件会在切换幻灯片和关闭时通过它写回。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="rklightboxoverlaycomponent-inputs"
          className="text-2xl font-bold mb-4"
        >
          RkLightboxOverlayComponent 输入
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
              {lightboxInputs.map((p) => (
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
          id="rklightboxoverlaycomponent-outputs"
          className="text-2xl font-bold mb-4"
        >
          RkLightboxOverlayComponent 输出
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
              {lightboxOutputs.map((p) => (
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
              {lightboxItemProps.map((p) => (
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
                    {p.required ? 'yes' : 'no'}
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
        <Heading level={2} id="transitions" className="text-2xl font-bold mb-4">
          过渡动画
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          把任意{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            TransitionTransformFn
          </code>{' '}
          通过{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            transitionFn
          </code>{' '}
          输入传入。只引入你用到的那个过渡，打包器就能把其余的摇掉。省略时默认为{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
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
                  @reelkit/angular-lightbox
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
                  @reelkit/angular-lightbox
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
                  @reelkit/angular-lightbox
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
                  @reelkit/angular-lightbox
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
  RkLightboxOverlayComponent,
  lightboxFadeTransition,
} from '@reelkit/angular-lightbox';

@Component({
  imports: [RkLightboxOverlayComponent],
  template: \`
    <rk-lightbox-overlay
      [isOpen]="isOpen"
      [items]="images"
      [transitionFn]="lightboxFadeTransition"
      (closed)="isOpen = false"
    />
  \`,
})
export class GalleryComponent {
  protected readonly lightboxFadeTransition = lightboxFadeTransition;
}`}
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
          使用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkLightboxSlide
          </code>{' '}
          模板插槽接管渲染时，上下文里有三个生命周期回调可用于上报加载状态。Lightbox会逐张跟踪状态，并据此显示转圈动画或错误图标。内容预加载器会缓存损坏的
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
          id="wiring-callbacks-in-rklightboxslide"
          className="text-xl font-semibold mt-6 mb-4"
        >
          在 rkLightboxSlide 中接上回调
        </Heading>
        <CodeBlock
          code={`<rk-lightbox-overlay [isOpen]="isOpen" [items]="items" (closed)="isOpen = false">
  <ng-template rkLightboxSlide
               let-item
               let-size="size"
               let-isActive="isActive"
               let-onReady="onReady"
               let-onWaiting="onWaiting"
               let-onError="onError">
    @if (item.type === 'video') {
      <rk-lightbox-video-slide
        [item]="item"
        [size]="size"
        [isActive]="isActive"
      />
    } @else {
      <img [src]="item.src"
           [style.width.px]="size[0]"
           [style.height.px]="size[1]"
           style="object-fit:contain"
           (load)="onReady()"
           (error)="onError()" />
    }
  </ng-template>
</rk-lightbox-overlay>`}
          language="html"
        />

        <Heading
          level={3}
          id="custom-loading-template"
          className="text-xl font-semibold mt-8 mb-4"
        >
          自定义加载模板
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkLightboxLoading
          </code>{' '}
          指令替换默认的转圈动画。
        </p>
        <CodeBlock
          code={`<rk-lightbox-overlay [isOpen]="isOpen" [items]="items" (closed)="isOpen = false">
  <ng-template rkLightboxLoading let-index let-item="item">
    <div style="display:flex;flex-direction:column;align-items:center;color:#fff">
      <span>Loading image {{ index + 1 }}...</span>
      <span style="opacity:0.6">{{ item.title }}</span>
    </div>
  </ng-template>
</rk-lightbox-overlay>`}
          language="html"
        />

        <Heading
          level={3}
          id="custom-error-template"
          className="text-xl font-semibold mt-8 mb-4"
        >
          自定义错误模板
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkLightboxError
          </code>{' '}
          指令替换默认的错误图标。
        </p>
        <CodeBlock
          code={`<rk-lightbox-overlay [isOpen]="isOpen" [items]="items" (closed)="isOpen = false">
  <ng-template rkLightboxError let-index let-item="item">
    <div style="display:flex;flex-direction:column;align-items:center;color:#ef4444">
      <span>Failed to load</span>
      <span style="opacity:0.6">{{ item.title ?? item.src }}</span>
    </div>
  </ng-template>
</rk-lightbox-overlay>`}
          language="html"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="css-classes" className="text-2xl font-bold mb-4">
          CSS 类名
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          所有 CSS 类名都是普通类名（没有 scoped），因此可以在{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/angular-lightbox/styles.css
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
          （或Lightbox的任意祖先元素）上覆盖，即可在不改组件源码的情况下换主题。这些变量与
          React Lightbox保持一致，因此覆盖样式可以在不同框架绑定之间通用。
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
            @reelkit/angular-lightbox/styles.css
          </code>
          .
        </p>

        <CodeBlock
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
          输入可以改变屏幕阅读器的播报内容，默认是 “Image
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
          ，由图片标题加上位置推导而来。
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
