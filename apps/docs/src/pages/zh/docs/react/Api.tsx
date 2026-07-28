import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../../components/ui/CodeBlock';
import { Heading } from '../../../../components/ui/Heading';
import { zhPageMeta } from '../../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/react/api',
    title: 'React API 参考 · ReelKit',
    description:
      '@reelkit/react 完整 API：Reel 属性、ReelApi 方法、ReelIndicator、观察者组件与工具函数。',
  });

// Headings carry the English slug as an explicit id — the slug generator
// is ascii-only, so a Chinese heading would produce an empty anchor.

const reelProps = [
  {
    prop: 'count',
    type: 'number',
    default: 'required',
    description: '条目总数',
  },
  {
    prop: 'size',
    type: '[number, number]',
    default: '-',
    description: '以 [宽, 高] 表示的尺寸。省略时通过 ResizeObserver 自动测量',
  },
  {
    prop: 'itemBuilder',
    type: '(index, indexInRange, size) => ReactElement',
    default: 'required',
    description: '渲染每张幻灯片的函数',
  },
  {
    prop: 'direction',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: '滚动方向',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: '起始索引',
  },
  {
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description: '启用无限循环',
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
    prop: 'enableNavKeys',
    type: 'boolean',
    default: 'true',
    description: '启用键盘导航',
  },
  {
    prop: 'onNavKeyPress',
    type: '(increment: -1 | 1) => void',
    default: '-',
    description: '方向键导航的自定义处理器。会替换默认的上一张 / 下一张行为。',
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
    prop: 'enableGestures',
    type: 'boolean',
    default: 'true',
    description: '启用触摸 / 鼠标拖拽导航',
  },
  {
    prop: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: '滑动阈值（0-1）',
  },
  {
    prop: 'rangeExtractor',
    type: '(index: number, count: number) => number[]',
    default: 'defaultRangeExtractor',
    description: '自定义函数，决定渲染哪些索引',
  },
  {
    prop: 'keyExtractor',
    type: '(index: number) => string',
    default: '-',
    description: '供 React 协调使用的自定义 key 函数（配合 loop 时很有用）',
  },
  {
    prop: 'apiRef',
    type: 'RefObject<ReelApi>',
    default: '-',
    description: '用于访问 API 方法的 ref',
  },
  {
    prop: 'className',
    type: 'string',
    default: '-',
    description: '容器元素的 CSS 类名',
  },
  {
    prop: 'style',
    type: 'CSSProperties',
    default: '-',
    description: '容器元素的内联样式',
  },
  {
    prop: 'ariaLabel',
    type: 'string',
    default: '-',
    description: '轮播区域的无障碍标签，供屏幕阅读器朗读',
  },
];

const callbacks = [
  {
    prop: 'afterChange',
    type: '(index, indexInRange) => void',
    description: '幻灯片切换完成后调用',
  },
  {
    prop: 'beforeChange',
    type: '(index, nextIndex, indexInRange) => void',
    description: '幻灯片切换开始前调用',
  },
  {
    prop: 'onSlideDragStart',
    type: '(index) => void',
    description: '拖拽手势开始时调用',
  },
  {
    prop: 'onSlideDragEnd',
    type: '(index) => void',
    description: '拖拽手势结束时调用',
  },
  {
    prop: 'onSlideDragCanceled',
    type: '(index) => void',
    description: '拖拽被取消时调用',
  },
];

const apiMethods = [
  { method: 'next()', type: '() => void', description: '切到下一张幻灯片' },
  { method: 'prev()', type: '() => void', description: '切到上一张幻灯片' },
  {
    method: 'goTo(index, animate?)',
    type: '(number, boolean?) => Promise',
    description: '切到指定幻灯片',
  },
  {
    method: 'adjust()',
    type: '() => void',
    description: '重新计算幻灯片位置',
  },
  {
    method: 'observe()',
    type: '() => void',
    description: '开始监听键盘',
  },
  {
    method: 'unobserve()',
    type: '() => void',
    description: '停止监听键盘',
  },
];

const indicatorProps = [
  {
    prop: 'count',
    type: 'number',
    default: 'auto',
    description:
      '条目总数。嵌套在 Reel 内部时会自动从父级连接；单独使用时请显式传入',
  },
  {
    prop: 'active',
    type: 'number',
    default: 'auto',
    description:
      '当前活动索引。嵌套在 Reel 内部时会自动从父级连接；单独使用时请显式传入',
  },
  {
    prop: 'direction',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: '指示器方向',
  },
  {
    prop: 'radius',
    type: 'number',
    default: '3',
    description: '圆点尺寸（像素）',
  },
  {
    prop: 'visible',
    type: 'number',
    default: '5',
    description: '正常尺寸圆点的最大可见数量',
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
    description: '溢出边缘圆点的缩放比例',
  },
  {
    prop: 'onDotClick',
    type: '(index: number) => void',
    default: '-',
    description: '点击圆点时的回调',
  },
  {
    prop: 'className',
    type: 'string',
    default: '-',
    description: '自定义 CSS 类名',
  },
  {
    prop: 'style',
    type: 'CSSProperties',
    default: '-',
    description: '自定义内联样式',
  },
];

const observeProps = [
  {
    prop: 'signals',
    type: 'Subscribable[]',
    default: 'required',
    description:
      '要订阅的信号。其中任意一个发出通知都会重新执行 children 函数 —— 且只有这个函数，父组件不受影响。',
  },
  {
    prop: 'children',
    type: '() => ReactElement | null',
    default: 'required',
    description:
      '渲染函数，每次变化都会重新执行。请在它内部读取信号的值；在外部读取的值只会被捕获一次，然后就过期了。',
  },
];

const animatedObserveProps = [
  {
    prop: 'signal',
    type: 'Signal<AnimatedValue>',
    default: 'required',
    description:
      '发出 { value, duration, done? } 的信号。duration 大于 0 时会从当前值插值过渡到新值；为 0 则直接跳过去。',
  },
  {
    prop: 'children',
    type: '(value: number) => ReactElement',
    default: 'required',
    description:
      '渲染函数，接收当前帧的插值结果，并同步提交，让 DOM 跟得上动画。',
  },
];

const overlayUrlStateOptions = [
  {
    prop: 'param',
    type: 'string',
    default: 'required',
    description: '承载当前幻灯片的查询参数，例如 "photo"。',
  },
  {
    prop: 'adapter',
    type: 'UrlAdapter',
    default: 'History API',
    description:
      "Navigation system to read and write through. Pass a router-backed adapter in a routed app so the router's own location does not go stale.",
  },
  {
    prop: 'codec',
    type: '{ decode(raw) => Id | null; encode(id) => string }',
    default: 'required',
    description:
      '传输格式：参数文本 ↔ 稳定身份，与集合无关。它与 locator 组成共用同一个 Id 的配套组合 —— 默认的 ?photo=3 索引画廊展开 ...urlIndexKey(() => images.length) 即可；也可以提供你自己的实现（base64、slug），让画廊重新排序后书签依然有效。',
  },
  {
    prop: 'locator',
    type: '{ locate(id) => number | null; locateAsync?(id) => Promise<number | null>; identify(index) => id }',
    default: 'required',
    description:
      '把身份映射成位置，并自己判断有效性：locate（同步）、locateAsync（分页画廊的异步兜底）、identify（写回）。普通的索引画廊展开 ...urlIndexKey(() => images.length) 即可 —— 它同时提供这个定位器和配套的编解码器，并以实时数量为上界约束 ?photo=3，于是过期的 ?photo=99 会自动从 URL 中消失，而不是打开一张从未指定的幻灯片。分页信息流或按身份寻址的画廊则自行提供配套的编解码器 + 定位器。',
  },
];

export default function ReactApi() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">React API 参考</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          完整参考：{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react
          </code>{' '}
          的组件、属性与方法。
        </p>
      </div>

      <section className="mb-12">
        <Heading level={2} id="reel-props" className="text-2xl font-bold mb-4">
          Reel 属性
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelProps
          </code>
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

      <section className="mb-12">
        <Heading level={2} id="callbacks" className="text-2xl font-bold mb-4">
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
              {callbacks.map((p) => (
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
          id="reelapi-methods"
          className="text-2xl font-bold mb-4"
        >
          ReelApi 方法
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          通过{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            apiRef
          </code>
          :
        </p>
        <CodeBlock
          code={`const apiRef = useRef<ReelApi>(null);

// Navigation
apiRef.current?.next();
apiRef.current?.prev();
apiRef.current?.goTo(5);           // instant
apiRef.current?.goTo(5, true);     // animated

// Lifecycle
apiRef.current?.adjust();          // recalculate positions
apiRef.current?.observe();         // start observing keyboard
apiRef.current?.unobserve();       // stop observing keyboard`}
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
          id="reelindicator-props"
          className="text-2xl font-bold mb-4"
        >
          ReelIndicator 属性
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelIndicatorProps
          </code>
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
              {indicatorProps.map((p) => (
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
          id="observer-components"
          className="text-2xl font-bold mb-4"
        >
          观察者组件
        </Heading>

        <Heading level={3} id="observe" className="text-lg font-semibold mb-2">
          Observe
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          把核心信号桥接到 React
          渲染，且不会引起父组件重渲染。订阅的信号变化时，只有 children
          函数会重新执行。
        </p>
        <CodeBlock
          code={`import { Observe } from '@reelkit/react';

<Observe signals={[controller.state.index]}>
  {() => <span>Current: {controller.state.index.value}</span>}
</Observe>`}
          language="tsx"
        />
        <div className="overflow-x-auto mt-4 mb-6">
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
              {observeProps.map((row) => (
                <tr
                  key={row.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {row.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {row.type}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {row.default}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="animatedobserve"
          className="text-lg font-semibold mt-6 mb-2"
        >
          AnimatedObserve
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          订阅动画值信号，并用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            requestAnimationFrame
          </code>
          .
        </p>
        <CodeBlock
          code={`import { AnimatedObserve } from '@reelkit/react';

<AnimatedObserve signal={controller.state.axisValue}>
  {(value) => (
    <div style={{ transform: \`translateY(\${value}px)\` }} />
  )}
</AnimatedObserve>`}
          language="tsx"
        />
        <div className="overflow-x-auto mt-4">
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
              {animatedObserveProps.map((row) => (
                <tr
                  key={row.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {row.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {row.type}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {row.default}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="hooks" className="text-2xl font-bold mb-4">
          Hooks
        </Heading>

        <Heading
          level={3}
          id="usebodylock"
          className="text-lg font-semibold mb-2"
        >
          useBodyLock
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          锁住 body 滚动，并补偿滚动条宽度带来的位移。
        </p>
        <CodeBlock
          code={`import { useBodyLock } from '@reelkit/react';

// Lock body scroll when overlay is open
useBodyLock(isOpen);`}
          language="typescript"
        />

        <Heading
          level={3}
          id="useoverlayurlstate"
          className="text-lg font-semibold mt-6 mb-2"
        >
          useOverlayUrlState
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            OverlayUrlStateOptions
          </code>
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          为浮层构建一个 URL 状态控制器，你再把它交给 <code>*UrlOverlay</code>{' '}
          的 <code>controller</code> 属性。
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          参见{' '}
          <Link
            to="/zh/docs/react/guide#url-state"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            React 指南中的 URL 状态
          </Link>{' '}
          ，那里有完整讲解和示例。
        </p>
        <div className="overflow-x-auto mt-4">
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
              {overlayUrlStateOptions.map((p) => (
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
          id="usereactrouterurladapter"
          className="text-lg font-semibold mt-6 mb-2"
        >
          useReactRouterUrlAdapter
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          A <code>UrlAdapter</code> ，底层用 React
          Router。在带路由的应用里把它作为 <code>adapter</code> 的{' '}
          <code>useOverlayUrlState</code>{' '}
          选项传入，让路由器始终是导航的唯一真相来源 —— 绕过路由器直接写{' '}
          <code>history.pushState</code> 会让它的 location
          过期，下一次导航就会把参数丢掉。
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          它从独立的子路径导出，因此没有路由器的应用永远不会把{' '}
          <code>react-router-dom</code> 打进产物。 <code>react-router-dom</code>{' '}
          是可选的同级依赖。
        </p>
        <CodeBlock
          code={`import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';

const adapter = useReactRouterUrlAdapter();
const photo = useOverlayUrlState({
  param: 'photo',
  adapter,
  ...urlIndexKey(() => images.length),
});`}
          language="tsx"
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
            &lt;Reel&gt;
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
          属性设好，可以给这个区域一个屏幕阅读器能读的名字。一个 polite
          的实时区域会在每次切换时播报“第 N 张，共 M
          张”，且不会重渲染轮播。非活动幻灯片会带上{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            inert
          </code>{' '}
          属性，于是焦点和辅助技术导航会跳过它们。
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            &lt;ReelIndicator&gt;
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
            &lt;Reel&gt;
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
            @reelkit/react
          </code>{' '}
          重新导出，用于焦点归还和焦点陷阱。
        </p>
      </section>

      <section>
        <Heading level={2} id="utilities" className="text-2xl font-bold mb-4">
          工具
        </Heading>

        <Heading
          level={3}
          id="createdefaultkeyextractorforloop"
          className="text-lg font-semibold mb-2"
        >
          createDefaultKeyExtractorForLoop
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          创建一个 key 提取器，处理开启{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            loop
          </code>{' '}
          时出现的重复索引。
        </p>
        <CodeBlock
          code={`import { createDefaultKeyExtractorForLoop } from '@reelkit/react';

<Reel
  count={items.length}
  size={size}
  loop
  keyExtractor={createDefaultKeyExtractorForLoop(items.length)}
  itemBuilder={...}
/>`}
          language="tsx"
        />
      </section>
    </div>
  );
}
