import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../../components/ui/CodeBlock';
import { Heading } from '../../../../components/ui/Heading';
import { zhPageMeta } from '../../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/angular/api',
    title: 'Angular API 参考 · ReelKit',
    description:
      '@reelkit/angular 完整 API：ReelComponent、ReelApi 接口、指令、服务与信号桥接工具。',
  });

// Headings carry the English slug as an explicit id — the slug generator
// is ascii-only, so a Chinese heading would produce an empty anchor.

const reelInputs = [
  {
    prop: 'count',
    type: 'number',
    default: '必填',
    description: '幻灯片总数',
  },
  {
    prop: 'direction',
    type: "'竖向' | 'horizontal'",
    default: "'竖向'",
    description: '滚动方向',
  },
  {
    prop: 'size',
    type: '[number, number] | undefined',
    default: 'undefined',
    description: '以 [宽, 高] 表示的尺寸。省略时通过 ResizeObserver 自动测量',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: '起始幻灯片索引',
  },
  {
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description: '启用无限循环',
  },
  {
    prop: 'transition',
    type: 'TransitionTransformFn',
    default: 'slideTransition',
    description:
      '过渡效果函数。内置有 slideTransition、fadeTransition、flipTransition、cubeTransition、zoomTransition',
  },
  {
    prop: 'transitionDuration',
    type: 'number',
    default: '300',
    description: '动画时长（毫秒）',
  },
  {
    prop: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: '滑动阈值（0-1）',
  },
  {
    prop: 'enableGestures',
    type: 'boolean',
    default: 'true',
    description: '启用触摸 / 鼠标拖拽导航',
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
    default: 'false',
    description: '启用鼠标滚轮导航',
  },
  {
    prop: 'wheelDebounceMs',
    type: 'number',
    default: '200',
    description: '滚轮事件防抖时长（毫秒）',
  },
  {
    prop: 'rangeExtractor',
    type: '(index: number, count: number) => number[]',
    default: 'defaultRangeExtractor',
    description: '自定义函数，决定渲染哪些索引',
  },
  {
    prop: 'keyExtractor',
    type: '(index: number, indexInRange: number) => string | number',
    default: 'index => index',
    description: '@for track 表达式的自定义 key 函数（配合 loop 时很有用）',
  },
  {
    prop: 'className',
    type: 'string',
    default: "''",
    description: '施加在根容器元素上的 CSS 类名',
  },
  {
    prop: 'ariaLabel',
    type: 'string',
    default: "'Carousel'",
    description: '轮播区域的无障碍标签',
  },
];

const reelOutputs = [
  {
    prop: 'afterChange',
    type: 'EventEmitter<{ index: number; indexInRange: number }>',
    description: '幻灯片过渡完成后发出',
  },
  {
    prop: 'beforeChange',
    type: 'EventEmitter<{ index: number; nextIndex: number; indexInRange: number }>',
    description: '幻灯片过渡开始前发出',
  },
  {
    prop: 'slideDragStart',
    type: 'EventEmitter<number>',
    description: '拖拽手势开始时发出',
  },
  {
    prop: 'slideDragEnd',
    type: 'EventEmitter<number>',
    description: '拖拽手势结束（松手）时发出',
  },
  {
    prop: 'slideDragCanceled',
    type: 'EventEmitter<number>',
    description: '拖拽手势被取消（回弹）时发出',
  },
  {
    prop: 'apiReady',
    type: 'EventEmitter<ReelApi>',
    description: '视图初始化后发出一次，暴露命令式 API',
  },
];

const apiMethods = [
  { method: 'next()', type: '() => void', description: '切到下一张幻灯片' },
  { method: 'prev()', type: '() => void', description: '切到上一张幻灯片' },
  {
    method: 'goTo(index, animate?)',
    type: '(number, boolean?) => Promise<void>',
    description: '跳到指定的幻灯片索引',
  },
  {
    method: 'adjust()',
    type: '() => void',
    description: '重新计算幻灯片位置（布局变化后很有用）',
  },
  {
    method: 'observe()',
    type: '() => void',
    description: '开始监听键盘事件',
  },
  {
    method: 'unobserve()',
    type: '() => void',
    description: '停止监听键盘事件',
  },
];

const indicatorInputs = [
  {
    prop: 'count',
    type: 'number | undefined',
    default: 'auto',
    description:
      '条目总数。嵌套在 rk-reel 内部时会自动从父级上下文连接；单独使用时请显式传入',
  },
  {
    prop: 'active',
    type: 'number | undefined',
    default: 'auto',
    description:
      '当前活动索引。嵌套在 rk-reel 内部时会自动从父级上下文连接；单独使用时请显式传入',
  },
  {
    prop: 'direction',
    type: "'竖向' | 'horizontal'",
    default: "'竖向'",
    description: '指示器方向',
  },
  {
    prop: 'radius',
    type: 'number',
    default: '3',
    description: '圆点半径（像素）',
  },
  {
    prop: 'visible',
    type: 'number',
    default: '5',
    description: '同时可见的正常尺寸圆点上限',
  },
  {
    prop: 'gap',
    type: 'number',
    default: '4',
    description: '圆点之间的间距（像素）',
  },
  {
    prop: 'activeColor',
    type: 'string',
    default: "'#fff'",
    description: '活动圆点颜色',
  },
  {
    prop: 'inactiveColor',
    type: 'string',
    default: "'rgba(255,255,255,0.5)'",
    description: '非活动圆点颜色',
  },
  {
    prop: 'edgeScale',
    type: 'number',
    default: '0.5',
    description: '边缘溢出圆点的缩放系数',
  },
  {
    prop: 'className',
    type: 'string',
    default: "''",
    description: '施加在指示器容器上的自定义 CSS 类名',
  },
  {
    prop: 'tablistLabel',
    type: 'string',
    default: "'Slide navigation'",
    description: 'tablist 地标的无障碍标签',
  },
];

const indicatorOutputs = [
  {
    prop: 'dotClick',
    type: 'EventEmitter<number>',
    description: '点击圆点时发出，带上圆点索引',
  },
];

const contextShape = [
  {
    property: 'index',
    type: 'Signal<number>',
    description: '响应式的当前幻灯片索引',
  },
  {
    property: 'count',
    type: 'Signal<number>',
    description: '响应式的条目总数',
  },
  {
    property: 'goTo',
    type: '(index: number, animate?: boolean) => Promise<void>',
    description: '以编程方式跳到某张幻灯片',
  },
];

const signalBridgeRows = [
  {
    name: 'toAngularSignal',
    signature: '(source: Subscribable<T>, destroyRef: DestroyRef) => Signal<T>',
    description: '把核心的 Subscribable 桥接成只读的 Angular Signal',
  },
  {
    name: 'animatedSignalBridge',
    signature:
      '(source: AnimatedValue, zone: NgZone, cdRef: ChangeDetectorRef, destroyRef: DestroyRef) => Signal<number>',
    description:
      '把核心的动画值桥接成 Angular Signal，在 zone 之外通过 requestAnimationFrame 更新',
  },
];

export default function AngularApi() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Angular API 参考</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          完整参考：{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/angular
          </code>{' '}
          的组件、指令、服务与工具。
        </p>
      </div>

      <section className="mb-12">
        <Heading
          level={2}
          id="reelcomponent"
          className="text-2xl font-bold mb-2"
        >
          ReelComponent
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          选择器：{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rk-reel
          </code>
        </p>
        <Heading level={3} id="inputs" className="text-lg font-semibold mb-3">
          输入
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
              {reelInputs.map((p) => (
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
        <Heading level={3} id="outputs" className="text-lg font-semibold mb-3">
          输出
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
              {reelOutputs.map((p) => (
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
          id="reelapi-interface"
          className="text-2xl font-bold mb-4"
        >
          ReelApi 接口
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          通过{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            (apiReady)
          </code>{' '}
          输出获取：
        </p>
        <CodeBlock
          code={`import { type ReelApi } from '@reelkit/angular';

@Component({ ... })
export class AppComponent {
  api: ReelApi | undefined;

  // In template: (apiReady)="api = $event"

  prev()  { this.api?.prev(); }
  next()  { this.api?.next(); }
  jump(i: number) { this.api?.goTo(i, true); }  // animated
}`}
          language="typescript"
        />
        <div className="overflow-x-auto mt-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">方法</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {apiMethods.map((p) => (
                <tr
                  key={p.method}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.method}
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
          id="rkreelitemdirective"
          className="text-2xl font-bold mb-2"
        >
          RkReelItemDirective
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          选择器：{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            [rkReelItem]
          </code>{' '}
          —— 用在{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ng-template
          </code>{' '}
          内部的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rk-reel
          </code>
          .
        </p>
        <Heading
          level={3}
          id="template-context"
          className="text-lg font-semibold mb-3"
        >
          模板上下文
        </Heading>
        <CodeBlock
          code={`<ng-template rkReelItem let-i let-indexInRange="indexInRange" let-size="size">
  <!-- $implicit (let-i)  : number         — absolute slide index -->
  <!-- indexInRange        : number         — position in the visible window (0, 1, or 2) -->
  <!-- size                : [number,number] — [width, height] of the container -->
</ng-template>`}
          language="html"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">变量</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  $implicit (let-i)
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  number
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  绝对幻灯片索引（0 到 count-1）
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  indexInRange
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  number
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  在可见窗口中的位置（0、1 或 2）
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  size
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  [number, number]
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  滑动器当前尺寸，形如 [宽, 高]（像素）
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="reelindicatorcomponent"
          className="text-2xl font-bold mb-2"
        >
          ReelIndicatorComponent
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          选择器：{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rk-reel-indicator
          </code>
        </p>
        <Heading level={3} id="inputs" className="text-lg font-semibold mb-3">
          输入
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
              {indicatorInputs.map((p) => (
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
          id="outputs"
          className="text-lg font-semibold mt-6 mb-3"
        >
          输出
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
              {indicatorOutputs.map((p) => (
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
          id="rk-reel-context"
          className="text-2xl font-bold mb-4"
        >
          RK_REEL_CONTEXT
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          An{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            InjectionToken{'<ReelContextValue>'}
          </code>{' '}
          由{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rk-reel
          </code>{' '}
          提供给后代组件。内部被{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rk-reel-indicator
          </code>{' '}
          用于自动连接。在需要滑动器上下文的自定义组件里注入它。
        </p>
        <CodeBlock
          code={`import { inject } from '@angular/core';
import { RK_REEL_CONTEXT } from '@reelkit/angular';

@Component({ ... })
export class MyCustomControl {
  private readonly ctx = inject(RK_REEL_CONTEXT, { optional: true });

  jump(index: number) {
    this.ctx?.goTo(index, true);
  }
}`}
          language="typescript"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">属性</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {contextShape.map((p) => (
                <tr
                  key={p.property}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.property}
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
          id="bodylockservice"
          className="text-2xl font-bold mb-4"
        >
          BodyLockService
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          带引用计数的 body
          滚动锁。多个并发调用方（例如Lightbox和弹窗同时打开）可以各自独立调用
          lock/unlock —— 只有最后一个调用方释放后 body 才恢复。在 root 级提供 ——
          任意位置都能注入。
        </p>
        <CodeBlock
          code={`import { inject } from '@angular/core';
import { BodyLockService } from '@reelkit/angular';

@Component({ ... })
export class OverlayComponent {
  private readonly bodyLock = inject(BodyLockService);

  open() { this.bodyLock.lock(); }
  close() { this.bodyLock.unlock(); }
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
                  locked
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  boolean（getter）
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  body 当前是否被锁住
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  lock()
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  () =&gt; void
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  锁住 body 滚动并补偿滚动条宽度
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  unlock()
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  () =&gt; void
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  恢复 body 原本的滚动样式
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="signal-bridge-utilities"
          className="text-2xl font-bold mb-4"
        >
          Signal 桥接工具
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          把核心信号系统（
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/core
          </code>
          ）桥接到 Angular 原生信号 API 的工具函数。内部被{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelComponent
          </code>
          使用，也可用于自定义框架集成。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">函数</th>
                <th className="text-left py-3 px-4 font-semibold">签名</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {signalBridgeRows.map((r) => (
                <tr
                  key={r.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {r.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {r.signature}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {r.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CodeBlock
          code={`import { DestroyRef, inject } from '@angular/core';
import { toAngularSignal } from '@reelkit/angular';
import { createSliderController } from '@reelkit/core';

// Custom component using low-level signal bridge
const destroyRef = inject(DestroyRef);
const controller = createSliderController({ count: 10 }, {});
const index = toAngularSignal(controller.state.index, destroyRef);`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="createoverlayurlstate"
          className="text-2xl font-bold mb-4"
        >
          createOverlayUrlState
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-mono">
          OverlayUrlStateOptions
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          为浮层构建一个 URL 状态控制器，你再把它交给{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            &lt;rk-lightbox-url-overlay&gt;
          </code>{' '}
          的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            [controller]
          </code>{' '}
          输入。请在注入上下文中调用它 ——
          字段初始化器或构造函数；它会立即挂载，并通过{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            DestroyRef
          </code>
          释放。完整讲解：{' '}
          <Link
            to="/zh/docs/angular-lightbox#url-state"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            Angular Lightbox页面的 URL 状态
          </Link>
          .
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">选项</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">默认值</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  param
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-600 dark:text-slate-400">
                  string
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-500">
                  必填
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  承载当前幻灯片的查询参数，例如 photo。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  adapter
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-600 dark:text-slate-400">
                  UrlAdapter
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-500">
                  History API
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  读写导航状态所走的系统。带路由的应用请传入基于 Router
                  的适配器，避免 Router 的 location 过期。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  codec
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-600 dark:text-slate-400">
                  UrlCodec&lt;Id&gt;
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-500">
                  必填
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  传输格式：参数文本 ↔ 稳定身份。它与 locator 成对出现 ——
                  默认的 ?photo=3 画廊展开 ...urlIndexKey(() =&gt;
                  images().length)
                  即可；也可以提供你自己的实现，让重新排序后书签依然有效。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  locator
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-600 dark:text-slate-400">
                  UrlLocator&lt;Id&gt;
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-500">
                  必填
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  把身份映射成位置，并自己判断有效性：locate（同步）、locateAsync（分页画廊的异步兜底）、identify（写回）。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="createrouterurladapter"
          className="text-2xl font-bold mb-4"
        >
          createRouterUrlAdapter
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-mono">
          @reelkit/angular/ng-router-url-adapter
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A <code>UrlAdapter</code> ，底层用 Angular
          Router。在带路由的应用里把它作为 <code>adapter</code> 的{' '}
          <code>createOverlayUrlState</code> 选项传入，让 Router
          始终是导航的唯一真相来源 —— 绕过 Router 直接写{' '}
          <code>history.pushState</code> 会让它的 location
          过期，下一次导航就会把参数丢掉。请在注入上下文中调用它；{' '}
          <code>NavigationEnd</code> 订阅会通过 <code>DestroyRef</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          它从独立的子路径导出，因此没有路由的应用永远不会把{' '}
          <code>@angular/router</code> 打进产物。 <code>@angular/router</code>{' '}
          是可选的同级依赖。
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
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            &lt;rk-reel&gt;
          </code>{' '}
          渲染为{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="region"
          </code>{' '}
          ，并带{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-roledescription="carousel"
          </code>
          。把{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ariaLabel
          </code>{' '}
          输入即可给这个区域一个屏幕阅读器能读的名字。一个 polite
          的实时区域会在每次切换时播报“第 N 张，共 M 张”。非活动幻灯片会带上{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            inert
          </code>{' '}
          属性，于是焦点和辅助技术导航会跳过它们。
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            &lt;rk-reel-indicator&gt;
          </code>{' '}
          渲染为{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="tablist"
          </code>{' '}
          ，圆点上使用漫游 tabindex；方向键移动焦点，Enter
          或空格激活对应幻灯片。
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          如果你要围绕{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            &lt;rk-reel&gt;
          </code>
          ?{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            captureFocusForReturn
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            createFocusTrap
          </code>
          、{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            getFocusableElements
          </code>{' '}
          都从{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/angular
          </code>{' '}
          重新导出，用于焦点归还和焦点陷阱。
        </p>
      </section>

      <section>
        <Heading
          level={2}
          id="package-exports"
          className="text-2xl font-bold mb-4"
        >
          包导出
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          全部公开导出自{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/angular
          </code>
          :
        </p>
        <CodeBlock
          code={`// Components & directives
import {
  ReelComponent,
  ReelIndicatorComponent,
  RkReelItemDirective,
  RkSwipeToCloseDirective,
} from '@reelkit/angular';

// Types
import type {
  ReelApi,
  ReelContextValue,
  RkReelItemContext,
  CoreSignal,
  Subscribable,
  AnimatedValue,
  RangeExtractor,
  SliderDirection,
  Disposer,
  DisposableList,
  GestureController,
  SliderController,
  ContentLoadingController,
  ContentPreloader,
  ContentPreloaderConfig,
  SoundController,
  BodyLock,
  TransitionTransformFn,
  SlideTransformStyle,
  SwipeToCloseDirection,
} from '@reelkit/angular';

// Context
import { RK_REEL_CONTEXT } from '@reelkit/angular';

// Services
import { BodyLockService } from '@reelkit/angular';

// Signal bridges
import { toAngularSignal, animatedSignalBridge } from '@reelkit/angular';

// Core re-exports
import {
  // Signals & reactivity
  createSignal, createComputed, reaction, batch,

  // Transitions
  slideTransition, fadeTransition, flipTransition,
  cubeTransition, zoomTransition, getSlideProgress,

  // Content loading & preloading
  createContentLoadingController, createContentPreloader,

  // Sound
  createSoundController, syncMutedToVideo,

  // Fullscreen
  fullscreenSignal, requestFullscreen, exitFullscreen,

  // DOM & cleanup
  observeDomEvent, createDisposableList, createBodyLock, sharedBodyLock,

  // Focus management
  captureFocusForReturn, createFocusTrap, getFocusableElements,

  // Slider & gestures
  createSliderController, createGestureController,
  defaultRangeExtractor, createDefaultKeyExtractorForLoop,

  // Video
  captureFrame, createSharedVideo,

  // Utilities
  animate, noop, clamp, abs, first, last, extractRange,
} from '@reelkit/angular';`}
          language="typescript"
        />
      </section>
    </div>
  );
}
