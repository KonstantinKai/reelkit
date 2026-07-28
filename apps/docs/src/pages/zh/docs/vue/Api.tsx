import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../../components/ui/CodeBlock';
import { Heading } from '../../../../components/ui/Heading';
import { zhPageMeta } from '../../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/vue/api',
    title: 'Vue API 参考 · ReelKit',
    description:
      '@reelkit/vue 完整 API：Reel 属性与事件、ReelExpose、组合式函数、SwipeToClose 与包导出。',
  });

// Headings carry the English slug as an explicit id — the slug generator
// is ascii-only, so a Chinese heading would produce an empty anchor.

const reelProps = [
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
    type: '(index: number, indexInRange: number) => string',
    default: 'index => index.toString()',
    description: '幻灯片渲染的自定义 key 函数（配合 loop 时很有用）',
  },
  {
    prop: 'ariaLabel',
    type: 'string',
    default: 'undefined',
    description: '轮播区域的无障碍标签',
  },
  {
    prop: 'reelStyle',
    type: 'Record<string, string | number>',
    default: 'undefined',
    description: '施加在根容器元素上的内联样式',
  },
  {
    prop: 'reelClass',
    type: 'string | Array | Object',
    default: 'undefined',
    description: '施加在根容器元素上的 CSS 类名',
  },
  {
    prop: 'onNavKeyPress',
    type: '(increment: -1 | 1) => void',
    default: 'undefined',
    description:
      '替换默认上下方向键导航的回调属性。提供之后就由你自己实现导航（例如调用 reelRef.value.next()）。省略则保持默认行为。',
  },
];

const reelEmits = [
  {
    event: 'beforeChange',
    payload: '(index: number, nextIndex: number, indexInRange: number)',
    description: '幻灯片过渡开始前发出',
  },
  {
    event: 'afterChange',
    payload: '(index: number, indexInRange: number)',
    description: '幻灯片过渡完成后发出',
  },
  {
    event: 'slideDragStart',
    payload: '(index: number)',
    description: '拖拽手势开始时发出',
  },
  {
    event: 'slideDragEnd',
    payload: '(index: number)',
    description: '拖拽手势结束（松手）时发出',
  },
  {
    event: 'slideDragCanceled',
    payload: '(index: number)',
    description: '拖拽手势被取消（回弹）时发出',
  },
  {
    event: 'tap',
    payload: '(event: GestureCommonEvent)',
    description: '单击手势时发出',
  },
  {
    event: 'doubleTap',
    payload: '(event: GestureCommonEvent)',
    description: '双击手势时发出',
  },
  {
    event: 'longPress',
    payload: '(event: GestureCommonEvent)',
    description: '长按手势开始时发出',
  },
  {
    event: 'longPressEnd',
    payload: '(event: GestureEvent)',
    description: '长按手势结束时发出',
  },
];

const exposeMethods = [
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
    description: '开始监听手势、键盘和滚轮事件',
  },
  {
    method: 'unobserve()',
    type: '() => void',
    description: '停止监听手势、键盘和滚轮事件',
  },
];

const indicatorProps = [
  {
    prop: 'count',
    type: 'number | undefined',
    default: 'auto',
    description:
      '条目总数。嵌套在 Reel 内部时会自动从父级上下文连接；单独使用时请显式传入',
  },
  {
    prop: 'active',
    type: 'number | undefined',
    default: 'auto',
    description:
      '当前活动索引。嵌套在 Reel 内部时会自动从父级上下文连接；单独使用时请显式传入',
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
    default: "'rgba(255, 255, 255, 0.5)'",
    description: '非活动圆点颜色',
  },
  {
    prop: 'edgeScale',
    type: 'number',
    default: '0.5',
    description: '边缘溢出圆点的缩放系数',
  },
  {
    prop: 'onDotClick',
    type: '(index: number) => void',
    default: 'undefined',
    description:
      '自定义点击处理器。在 Reel 内部省略时，默认跳到所点圆点对应的索引',
  },
  {
    prop: 'indicatorClass',
    type: 'string | Array | Object',
    default: 'undefined',
    description: '施加在 tablist 根元素上的 CSS 类名',
  },
  {
    prop: 'indicatorStyle',
    type: 'CSSProperties',
    default: 'undefined',
    description: '合并到 tablist 根元素上的内联样式',
  },
];

const indicatorEmits = [
  {
    event: 'dotClick',
    payload: '(index: number)',
    description: '点击圆点时发出，带上圆点索引',
  },
];

const swipeToCloseProps = [
  {
    prop: 'direction',
    type: "'up' | 'down'",
    default: '必填',
    description: '触发关闭的滑动方向。Lightbox用 "up"，Stories 用 "down"',
  },
  {
    prop: 'enabled',
    type: 'boolean',
    default: 'true',
    description: '滑动关闭手势是否启用',
  },
  {
    prop: 'threshold',
    type: 'number',
    default: '0.2',
    description: '触发关闭所需的视口高度占比（0-1）',
  },
];

const swipeToCloseEmits = [
  {
    event: 'close',
    payload: '()',
    description: '滑动超过阈值且关闭动画播完后发出',
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

const overlayUrlStateOptions = [
  {
    prop: 'param',
    type: 'string',
    default: '必填',
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
    default: '必填',
    description:
      '传输格式：参数文本 ↔ 稳定身份，与集合无关。它与 locator 组成共用同一个 Id 的配套组合 —— 默认的 ?photo=3 索引画廊展开 ...urlIndexKey(() => props.images.length) 即可；也可以提供你自己的实现（base64、slug），让画廊重新排序后书签依然有效。',
  },
  {
    prop: 'locator',
    type: '{ locate(id) => number | null; locateAsync?(id) => Promise<number | null>; identify(index) => id }',
    default: '必填',
    description:
      '把身份映射成位置，并自己判断有效性：locate（同步）、locateAsync（分页画廊的异步兜底）、identify（写回）。普通的索引画廊展开 ...urlIndexKey(() => props.images.length) 即可 —— 它同时提供这个定位器和配套的编解码器，并以实时数量为上界约束 ?photo=3，于是过期的 ?photo=99 会自动从 URL 中消失，而不是打开一张从未指定的幻灯片。请传 getter 而不是数字，因为 Vue 的 setup 只执行一次，捕获下来的长度会随分页信息流增长而过期。分页信息流或按身份寻址的画廊则自行提供配套的编解码器 + 定位器。',
  },
];

export default function VueApi() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Vue API 参考</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          完整参考：{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue
          </code>{' '}
          的组件、组合式函数与工具。
        </p>
      </div>

      <section className="mb-12">
        <Heading level={2} id="reel" className="text-2xl font-bold mb-2">
          Reel
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          标签：{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<Reel>'}
          </code>
        </p>
        <Heading level={3} id="props" className="text-lg font-semibold mb-3">
          属性
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
        <Heading level={3} id="events" className="text-lg font-semibold mb-3">
          事件
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
              {reelEmits.map((p) => (
                <tr
                  key={p.event}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.event}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.payload}
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
        <Heading level={3} id="slots" className="text-lg font-semibold mb-3">
          插槽
        </Heading>
        <CodeBlock
          code={`<Reel :count="items.length">
  <template #item="{ index, indexInRange, size }">
    <!-- index       : number         — absolute slide index (0 to count-1) -->
    <!-- indexInRange : number         — position in the visible window (0, 1, or 2) -->
    <!-- size         : [number,number] — [width, height] of the container -->
    <MySlide :index="index" :size="size" />
  </template>

  <!-- default slot: overlay content rendered on top of the slides -->
  <ReelIndicator />
</Reel>`}
          language="vue-html"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">插槽</th>
                <th className="text-left py-3 px-4 font-semibold">
                  作用域属性
                </th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  #item
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '{ index: number, indexInRange: number, size: [number, number] }'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  渲染每张可见幻灯片。虚拟化范围内的每个索引都会调用一次
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  default
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  none
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  渲染在所有幻灯片之上的浮层内容（指示器、控件等）
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="reelexpose" className="text-2xl font-bold mb-4">
          ReelExpose
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          通过模板 ref 暴露的命令式 API：
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { ref } from 'vue';
import { Reel, type ReelExpose } from '@reelkit/vue';

const reelRef = ref<ReelExpose | null>(null);

function prev()  { reelRef.value?.prev(); }
function next()  { reelRef.value?.next(); }
function jump(i: number) { reelRef.value?.goTo(i, true); }
</script>

<template>
  <Reel ref="reelRef" :count="100">
    <template #item="{ index }">
      <div>Slide {{ index }}</div>
    </template>
  </Reel>
</template>`}
          language="vue"
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
              {exposeMethods.map((p) => (
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
          id="reelindicator"
          className="text-2xl font-bold mb-2"
        >
          ReelIndicator
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          标签：{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<ReelIndicator>'}
          </code>
        </p>
        <Heading level={3} id="props" className="text-lg font-semibold mb-3">
          属性
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
        <Heading
          level={3}
          id="events"
          className="text-lg font-semibold mt-6 mb-3"
        >
          事件
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
              {indicatorEmits.map((p) => (
                <tr
                  key={p.event}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.event}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.payload}
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
          id="swipetoclose"
          className="text-2xl font-bold mb-2"
        >
          SwipeToClose
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          标签：{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<SwipeToClose>'}
          </code>{' '}
          —— 把默认插槽包进一个支持触摸的容器，可以滑动关闭。
        </p>
        <Heading level={3} id="props" className="text-lg font-semibold mb-3">
          属性
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SwipeToCloseProps
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
              {swipeToCloseProps.map((p) => (
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
          id="events"
          className="text-lg font-semibold mt-6 mb-3"
        >
          事件
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
              {swipeToCloseEmits.map((p) => (
                <tr
                  key={p.event}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.event}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.payload}
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
          id="slots"
          className="text-lg font-semibold mt-6 mb-3"
        >
          插槽
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">插槽</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  default
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  需要套上滑动关闭手势的内容
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="rk-reel-key-amp-usereelcontext"
          className="text-2xl font-bold mb-4"
        >
          RK_REEL_KEY &amp; useReelContext
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          An{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'InjectionKey<ReelContextValue>'}
          </code>{' '}
          由{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<Reel>'}
          </code>{' '}
          提供给后代组件。内部被{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<ReelIndicator>'}
          </code>{' '}
          用于自动连接。在需要滑动器上下文的自定义组件里用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            useReelContext()
          </code>{' '}
          。
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { useReelContext } from '@reelkit/vue';

const ctx = useReelContext();

function jump(index: number) {
  ctx?.goTo(index, true);
}
</script>`}
          language="vue"
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
        <Heading level={2} id="composables" className="text-2xl font-bold mb-4">
          组合式函数
        </Heading>

        <Heading
          level={3}
          id="usebodylock"
          className="text-xl font-semibold mb-3"
        >
          useBodyLock
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          当传入的值为{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            true
          </code>
          时锁住文档 body 的滚动。采用引用计数，多个并发调用方可以各自独立上锁 /
          解锁。卸载时自动解锁。
        </p>
        <CodeBlock
          code={`import { ref } from 'vue';
import { useBodyLock } from '@reelkit/vue';

const isOpen = ref(false);
useBodyLock(isOpen);

// Also accepts a static boolean
useBodyLock(true);`}
          language="typescript"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">参数</th>
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
                  {'Ref<boolean> | boolean'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  是否应当锁住 body 滚动。接受响应式 ref 或静态布尔值
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="usefullscreen"
          className="text-xl font-semibold mt-8 mb-3"
        >
          useFullscreen
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            UseFullscreenOptions
          </code>{' '}
          →{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            UseFullscreenReturn
          </code>
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          管理 Fullscreen API 的组合式函数，跨浏览器可用。卸载时自动退出全屏。
        </p>
        <CodeBlock
          code={`import { ref } from 'vue';
import { useFullscreen } from '@reelkit/vue';

const containerRef = ref<HTMLElement | null>(null);
const { isFullscreen, request, exit, toggle } = useFullscreen({
  elementRef: containerRef,
});`}
          language="typescript"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">返回值</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  isFullscreen
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'Signal<boolean>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  反映当前全屏状态的核心信号（读{' '}
                  <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                    .value
                  </code>
                  )
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  request
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => Promise<void>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  让引用的元素进入全屏。若已有别的元素处于全屏，会先退出（并等待完成）。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  exit
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => Promise<void>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  退出全屏
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  toggle
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => Promise<void>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  切换全屏状态
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="usesoundstate"
          className="text-xl font-semibold mt-8 mb-3"
        >
          useSoundState
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          获取上下文中当前的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SoundController
          </code>{' '}
          。必须在{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<SoundProvider>'}
          </code>
          . Throws if called outside.
        </p>
        <CodeBlock
          code={`import { useSoundState } from '@reelkit/vue';

// Inside a SoundProvider descendant
const sound = useSoundState();

sound.muted;    // Signal<boolean>
sound.toggle(); // Toggle muted state`}
          language="typescript"
        />

        <Heading
          level={3}
          id="useoverlayurlstate"
          className="text-xl font-semibold mt-8 mb-3"
        >
          useOverlayUrlState
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            OverlayUrlStateOptions
          </code>
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          为浮层构建一个 URL 状态控制器，你再把它交给{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<LightboxUrlOverlay>'}
          </code>{' '}
          的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            :controller
          </code>{' '}
          属性。
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          参见{' '}
          <Link
            to="/zh/docs/vue/guide#url-state"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Vue 指南中的 URL 状态
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
          id="usevuerouterurladapter"
          className="text-xl font-semibold mt-8 mb-3"
        >
          useVueRouterUrlAdapter
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A <code>UrlAdapter</code> ，底层用 Vue
          Router。在带路由的应用里把它作为 <code>adapter</code> 的{' '}
          <code>useOverlayUrlState</code>{' '}
          选项传入，让路由器始终是导航的唯一真相来源 —— 绕过路由器直接写{' '}
          <code>history.pushState</code> 会让它的 location
          过期，下一次导航就会把参数丢掉。
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          它从独立的子路径导出，因此没有路由器的应用永远不会把{' '}
          <code>vue-router</code> 打进产物。 <code>vue-router</code>{' '}
          是可选的同级依赖。
        </p>
        <CodeBlock
          code={`import { useVueRouterUrlAdapter } from '@reelkit/vue/vue-router-url-adapter';

const adapter = useVueRouterUrlAdapter();
const photo = useOverlayUrlState({
  param: 'photo',
  adapter,
  ...urlIndexKey(() => props.images.length),
});`}
          language="typescript"
        />

        <Heading
          level={3}
          id="tovueref"
          className="text-xl font-semibold mt-8 mb-3"
        >
          toVueRef
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          把核心的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            Subscribable
          </code>{' '}
          （任意来自{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            Signal
          </code>{' '}
          from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/core
          </code>
          的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            Ref
          </code>
          ）桥接成只读的 Vue Ref。只要你需要用核心信号的值驱动 Vue
          重渲染，就用它 —— 在渲染函数或模板里直接读{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            signal.value
          </code>{' '}
          并 <strong>并不是</strong> 具备响应性。
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          订阅会通过{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            onScopeDispose
          </code>
          自动销毁，因此必须在 Vue 的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            setup()
          </code>{' '}
          或其他能感知 effect 作用域的上下文中调用。
        </p>
        <CodeBlock
          code={`import { defineComponent, h } from 'vue';
import { toVueRef, useSoundState } from '@reelkit/vue';

export const MuteIcon = defineComponent({
  setup() {
    const sound = useSoundState();
    const muted = toVueRef(sound.muted); // Readonly<Ref<boolean>>

    return () => h('span', muted.value ? '🔇' : '🔊');
  },
});`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="soundprovider"
          className="text-2xl font-bold mb-4"
        >
          SoundProvider
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          标签：{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<SoundProvider>'}
          </code>{' '}
          —— 上下文提供者，它会创建一个{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SoundController
          </code>{' '}
          实例并通过{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RK_SOUND_KEY
          </code>
          提供给后代。默认插槽会被透明渲染。
        </p>
        <CodeBlock
          code={`<template>
  <SoundProvider>
    <Reel :count="items.length">
      <template #item="{ index }">
        <VideoSlide :index="index" />
      </template>
      <MuteButton />
    </Reel>
  </SoundProvider>
</template>`}
          language="vue"
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
          。传{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-label
          </code>{' '}
          （在 TS 里属性名是{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ariaLabel
          </code>{' '}
          ）即可给这个区域一个屏幕阅读器能读的名字。一个 polite
          的实时区域会在每次切换时播报“第 N 张，共 M 张”。非活动幻灯片会带上{' '}
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
            @reelkit/vue
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
            @reelkit/vue
          </code>
          :
        </p>
        <CodeBlock
          code={`// Components
import {
  Reel,
  ReelIndicator,
  SwipeToClose,
  SoundProvider,
} from '@reelkit/vue';

// Types
import type {
  ReelExpose,
  ReelContextValue,
  SwipeToCloseDirection,
  SwipeToCloseProps,
  UseFullscreenOptions,
  UseFullscreenReturn,
} from '@reelkit/vue';

// Context & composables
import {
  RK_REEL_KEY,
  useReelContext,
  RK_SOUND_KEY,
  useBodyLock,
  useFullscreen,
  useSoundState,
  toVueRef,
} from '@reelkit/vue';

// Utilities (re-exported from @reelkit/core)
import {
  createDefaultKeyExtractorForLoop,
  defaultRangeExtractor,
} from '@reelkit/vue';

// Core re-exports
import {
  // Signals & reactivity
  createSignal, createComputed, reaction, batch, createDeferred,

  // Transitions
  slideTransition, fadeTransition, flipTransition,
  cubeTransition, zoomTransition, getSlideProgress,

  // Content loading & preloading
  createContentLoadingController, createContentPreloader,
  observeMediaLoading,

  // Sound
  createSoundController, syncMutedToVideo,

  // Fullscreen
  fullscreenSignal, requestFullscreen, exitFullscreen,

  // DOM & cleanup
  observeDomEvent, createDisposableList, createBodyLock, sharedBodyLock,

  // Focus management
  captureFocusForReturn, createFocusTrap, getFocusableElements,

  // Gestures
  createGestureController,

  // Video
  captureFrame, createSharedVideo,

  // Animation
  animate,

  // Utilities
  noop, clamp, abs, first, last, extractRange,
  lerp, isNegative, generate,
} from '@reelkit/vue';`}
          language="typescript"
        />
      </section>
    </div>
  );
}
