import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../../components/ui/CodeBlock';
import { NextSteps } from '../../../../components/NextSteps';
import { Sandbox } from '../../../../components/ui/Sandbox';
import { FeatureCardGrid } from '../../../../components/ui/FeatureCard';
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
    path: '/docs/angular/guide',
    title: 'Angular 指南 · ReelKit',
    description:
      '在 Angular 中使用 ReelKit：rk-reel 组件、rkReelItem 模板模式与基于信号的 apiReady 输出。',
  });

// Headings carry the English slug as an explicit id — the slug generator
// is ascii-only, so a Chinese heading would produce an empty anchor.

export default function AngularGuide() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Angular 指南</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          学习如何用{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/angular
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
                desc: '通过 apiReady 调用 next()、prev()、goTo()',
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
                label: '基于信号',
                desc: 'OnPush 搭配 Angular 信号',
              },
            ]}
          />
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="rk-reel-component"
          className="text-2xl font-bold mb-4"
        >
          rk-reel 组件
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            rk-reel
          </code>{' '}
          组件包装了核心的滑动控制器。它是独立组件，使用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ChangeDetectionStrategy.OnPush
          </code>
          .
        </p>
        <Sandbox
          code={`import { Component } from '@angular/core';
import { ReelComponent, ReelIndicatorComponent, RkReelItemDirective } from '@reelkit/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReelComponent, ReelIndicatorComponent, RkReelItemDirective],
  template: \`
    <rk-reel
      [count]="items.length"
      style="width: 100%; height: 100dvh"
      direction="vertical"
      [enableWheel]="true"
      (afterChange)="onAfterChange($event)"
    >
      <ng-template rkReelItem let-i let-size="size">
        <div [style.width.px]="size[0]" [style.height.px]="size[1]"
             [style.background]="items[i].color"
             style="display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff">
          <div style="font-size:1.5rem;font-weight:bold">{{ items[i].title }}</div>
          <div style="font-size:0.875rem;opacity:0.8">{{ items[i].subtitle }}</div>
        </div>
      </ng-template>

      <div style="position:absolute;right:12px;top:50%;transform:translateY(-50%);z-index:10">
        <rk-reel-indicator direction="vertical" />
      </div>
    </rk-reel>
  \`,
})
export class AppComponent {
  items = [
    { title: 'Virtualized', subtitle: 'Only 3 slides in DOM', color: '#6366f1' },
    { title: 'Touch First', subtitle: 'Native swipe gestures', color: '#8b5cf6' },
    { title: 'Zero Deps', subtitle: 'Tiny bundle size', color: '#7c3aed' },
    { title: 'Keyboard Nav', subtitle: 'Full a11y support', color: '#ec4899' },
    { title: 'SSR Ready', subtitle: 'Works everywhere', color: '#14b8a6' },
    { title: '60fps', subtitle: 'Smooth animations', color: '#f59e0b' },
  ];

  onAfterChange(event: { index: number; indexInRange: number }) {
    console.log('Current index:', event.index);
  }
}`}
          language="typescript"
          title="app.component.ts"
          framework="angular"
          stackblitzDeps={['@reelkit/angular']}
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
          输入是可选的。省略时，{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rk-reel
          </code>{' '}
          会通过{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ResizeObserver
          </code>{' '}
          自动测量容器，并适配由 CSS 决定的布局。容器的尺寸必须由父级决定（例如
          flex、grid 或显式的 CSS 尺寸）。
        </p>
        <CodeBlock
          code={`<!-- Explicit size (fixed) -->
<rk-reel [count]="items.length" [size]="[400, 600]">
  <ng-template rkReelItem let-i let-size="size"> ... </ng-template>
</rk-reel>

<!-- Auto-size (responsive — sized by CSS) -->
<rk-reel [count]="items.length" style="width: 100%; height: 100dvh">
  <ng-template rkReelItem let-i let-size="size"> ... </ng-template>
</rk-reel>`}
          language="html"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="rkreelitem-template-pattern"
          className="text-2xl font-bold mb-4"
        >
          rkReelItem 模板模式
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Angular 不用 React 的 render prop，而是在{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            rkReelItem
          </code>{' '}
          上使用结构指令{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ng-template
          </code>
          。它让虚拟化成为可能 ——
          只有可见的幻灯片会被实例化。模板上下文提供三个变量：
        </p>
        <CodeBlock
          code={`<ng-template rkReelItem let-i let-indexInRange="indexInRange" let-size="size">
  <!--
    $implicit (let-i)   : number  — absolute slide index (0 to count-1)
    indexInRange        : number  — position in visible window (0, 1, or 2)
    size                : [number, number] — [width, height] of the container
  -->
  <app-slide [data]="items[i]"
             [style.width.px]="size[0]"
             [style.height.px]="size[1]" />
</ng-template>`}
          language="html"
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
                [enableWheel]="true"
              </code>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>编程式：</strong> Use the{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                (apiReady)
              </code>{' '}
              输出来获取{' '}
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
          code={`import { Component } from '@angular/core';
import { ReelComponent, RkReelItemDirective, type ReelApi } from '@reelkit/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReelComponent, RkReelItemDirective],
  template: \`
    <rk-reel
      [count]="10"
      [size]="[400, 600]"
      (apiReady)="api = $event"
    >
      <ng-template rkReelItem let-i let-size="size">
        <app-slide [index]="i" [size]="size" />
      </ng-template>
    </rk-reel>

    <button (click)="api?.prev()">Prev</button>
    <button (click)="api?.next()">Next</button>
    <button (click)="api?.goTo(5)">Go to 5</button>
  \`,
})
export class AppComponent {
  api: ReelApi | undefined;
}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          URL 状态
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            createOverlayUrlState
          </code>{' '}
          为浮层构建一个 URL 状态控制器并整个返回，你再把它作为{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            *UrlOverlay
          </code>{' '}
          组件的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            [controller]
          </code>{' '}
          输入。请在注入上下文中调用它 —— 例如字段初始化器；它会立即挂载，并通过{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            DestroyRef
          </code>
          释放。打开状态归 URL
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
          code={`import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RkLightboxUrlOverlayComponent } from '@reelkit/angular-lightbox';
import { createOverlayUrlState, urlIndexKey } from '@reelkit/angular';

@Component({
  imports: [RkLightboxUrlOverlayComponent, RouterLink],
  template: \`
    @for (image of images(); track image.src; let i = $index) {
      <a [routerLink]="[]" [queryParams]="{ photo: i }">
        <img [src]="image.src" alt="" />
      </a>
    }

    <rk-lightbox-url-overlay [controller]="photo" [items]="images()" />
  \`,
})
export class GalleryComponent {
  protected readonly images = signal(photos);

  // Attaches now, releases on destroy.
  protected readonly photo = createOverlayUrlState({
    param: 'photo',
    ...urlIndexKey(() => this.images().length),
  });
}`}
          language="typescript"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          带路由的应用 —— 请传入基于 Router 的适配器，否则 Router 自己的
          location 会过期，下一次导航就会把参数丢掉：
        </p>
        <CodeBlock
          code={`import { createRouterUrlAdapter } from '@reelkit/angular/ng-router-url-adapter';

protected readonly photo = createOverlayUrlState({
  param: 'photo',
  adapter: createRouterUrlAdapter(),
  ...urlIndexKey(() => this.images().length),
});`}
          language="typescript"
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
          .{' '}
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
          ，因此对于普通的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ?photo=3
          </code>{' '}
          画廊，展开{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ...urlIndexKey(() =&gt; images().length)
          </code>
          即可，它会一次性返回两半。{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            urlIndexKey
          </code>{' '}
          会以 getter 返回的实时数量为上界约束索引，因此过期的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ?photo=99
          </code>{' '}
          会被拒绝并自动从 URL
          中消失，而不是打开一张从未指定的幻灯片。分页信息流或按身份寻址的画廊则自行提供配套的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            codec
          </code>{' '}
          +{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            locator
          </code>{' '}
          。完整的选项表见{' '}
          <Link
            to="/zh/docs/angular/api#createoverlayurlstate"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Angular API 参考
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
            rk-reel
          </code>
          内部时，它会通过上下文自动连接到父级的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            count
          </code>{' '}
          和{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            active
          </code>{' '}
          值，走的是{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RK_REEL_CONTEXT
          </code>{' '}
          注入令牌 —— 不需要手动接线。
        </p>
        <CodeBlock
          code={`<!-- Auto-connect: count and active are inherited from parent rk-reel -->
<rk-reel [count]="10" [size]="[400, 600]">
  <ng-template rkReelItem let-i let-size="size"> ... </ng-template>
  <rk-reel-indicator direction="vertical" />
</rk-reel>

<!-- Manual usage: pass count and active explicitly (e.g. outside a rk-reel) -->
<rk-reel-indicator [count]="10" [active]="currentIndex" />`}
          language="html"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="apiready-output-signal-based-pattern"
          className="text-2xl font-bold mb-4"
        >
          apiReady 输出 —— 基于信号的模式
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            (apiReady)
          </code>{' '}
          输出会在组件挂载并测量完成后触发一次。它发出一个{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelApi
          </code>{' '}
          对象，你可以存下来做命令式导航。用 Angular 信号保存这个引用，与{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            OnPush
          </code>{' '}
          变更检测配合得很好。
        </p>
        <CodeBlock
          code={`import { Component, signal } from '@angular/core';
import { ReelComponent, RkReelItemDirective, type ReelApi } from '@reelkit/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReelComponent, RkReelItemDirective],
  template: \`
    <rk-reel
      [count]="items.length"
      style="width: 100%; height: 100dvh"
      direction="vertical"
      [enableWheel]="true"
      (apiReady)="reelApi.set($event)"
      (afterChange)="currentIndex.set($event.index)"
    >
      <ng-template rkReelItem let-i let-size="size">
        <div [style.width.px]="size[0]" [style.height.px]="size[1]">
          {{ items[i].title }}
        </div>
      </ng-template>
    </rk-reel>

    <div style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%)">
      <button (click)="reelApi()?.prev()"
              [disabled]="currentIndex() === 0">Prev</button>
      <button (click)="reelApi()?.next()"
              [disabled]="currentIndex() === items.length - 1">Next</button>
    </div>
  \`,
})
export class AppComponent {
  readonly items = [
    { title: 'Slide 1', color: '#6366f1' },
    { title: 'Slide 2', color: '#8b5cf6' },
    { title: 'Slide 3', color: '#ec4899' },
  ];

  readonly reelApi = signal<ReelApi | undefined>(undefined);
  readonly currentIndex = signal(0);
}`}
          language="typescript"
        />
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
                独立组件
              </strong>
              <p className="text-sm">
                把{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ReelComponent
                </code>
                ,{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  RkReelItemDirective
                </code>
                , and optionally{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ReelIndicatorComponent
                </code>{' '}
                直接放进组件的{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  imports
                </code>{' '}
                数组
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                ng-template + rkReelItem
              </strong>
              <p className="text-sm">
                Angular 里对应 React{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  itemBuilder
                </code>{' '}
                属性的写法 —— 实现虚拟化
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                apiReady
              </strong>
              <p className="text-sm">
                只触发一次的输出，带上命令式导航 API —— 不需要 ViewChild 查询
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                afterChange
              </strong>
              <p className="text-sm">
                发出{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  {'{ index, indexInRange }'}
                </code>{' '}
                —— 跟踪当前索引以更新界面
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                默认 OnPush
              </strong>
              <p className="text-sm">
                所有组件都使用{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ChangeDetectionStrategy.OnPush
                </code>{' '}
                和 Angular 信号以获得最佳性能
              </p>
            </div>
          </li>
        </ul>
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
                让幻灯片模板保持轻量
              </strong>
              <p className="text-sm">
                {' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  rkReelItem
                </code>{' '}
                模板会为每张可见幻灯片执行（通常同时 3
                张）。不要在里面做重计算或写太深的嵌套结构。
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
                  (afterChange)
                </code>{' '}
                来检测用户是否接近末尾，并在幻灯片用完之前取下一批 ——
                这样就能做无限滚动的信息流。
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                命令式状态用信号
              </strong>
              <p className="text-sm">
                把{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ReelApi
                </code>{' '}
                引用和当前索引存在 Angular
                信号里，既能细粒度响应，又不会触发整个组件重渲染。
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
                  [enableWheel]="false"
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
            label: 'Angular API 参考',
            path: '/docs/angular/api',
            description: '全部可用的输入、输出与方法',
          },
          {
            label: 'Reel Player',
            path: '/docs/angular-reel-player',
            description: 'TikTok / Reels 风格的视频播放器',
          },
          {
            label: 'Lightbox',
            path: '/docs/angular-lightbox',
            description: '图片与视频画廊',
          },
          {
            label: 'Stories Player',
            path: '/docs/angular-stories-player',
            description: 'Instagram 风格的 Stories 浏览器（即将推出）',
          },
        ]}
      />
    </div>
  );
}
