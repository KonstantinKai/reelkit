import { CodeBlock } from '../../../../components/ui/CodeBlock';
import { Heading } from '../../../../components/ui/Heading';
import { zhPageMeta } from '../../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/core/api',
    title: '核心 API 参考 · ReelKit',
    description:
      '@reelkit/core 完整 API：配置项、回调、方法、状态属性、信号、URL 状态与视频工具。',
  });

// Headings carry the English slug as an explicit id — the slug generator
// is ascii-only, so a Chinese heading would produce an empty anchor.

const configOptions = [
  {
    property: 'count',
    type: 'number',
    default: 'required',
    description: '条目总数',
  },
  {
    property: 'initialIndex',
    type: 'number',
    default: '0',
    description: '起始索引',
  },
  {
    property: 'direction',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: '滚动方向',
  },
  {
    property: 'enableGestures',
    type: 'boolean',
    default: 'true',
    description: '启用触摸 / 鼠标拖拽导航。为 false 时不挂载手势控制器。',
  },
  {
    property: 'enableNavKeys',
    type: 'boolean',
    default: 'true',
    description: '启用键盘方向键导航',
  },
  {
    property: 'enableWheel',
    type: 'boolean',
    default: 'false',
    description: '启用鼠标滚轮',
  },
  {
    property: 'wheelDebounceMs',
    type: 'number',
    default: '200',
    description: '滚轮防抖时间',
  },
  {
    property: 'loop',
    type: 'boolean',
    default: 'false',
    description: '循环导航',
  },
  {
    property: 'transitionDuration',
    type: 'number',
    default: '300',
    description: '动画时长（毫秒）',
  },
  {
    property: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: '滑动阈值（0-1）',
  },
  {
    property: 'rangeExtractor',
    type: '(index: number, count: number, loop: boolean) => number[]',
    default: 'defaultRangeExtractor',
    description: '自定义函数，决定渲染哪些索引',
  },
];

const callbacks = [
  {
    callback: 'onBeforeChange',
    type: '(index, nextIndex, rangeIndex) => void',
    description: '幻灯片切换前',
  },
  {
    callback: 'onAfterChange',
    type: '(index, rangeIndex) => void',
    description: '幻灯片切换后',
  },
  {
    callback: 'onDragStart',
    type: '(index) => void',
    description: '拖拽开始',
  },
  { callback: 'onDragEnd', type: '(index) => void', description: '拖拽结束' },
  {
    callback: 'onDragCanceled',
    type: '(index) => void',
    description: '拖拽取消',
  },
  {
    callback: 'onTap',
    type: '(event: GestureCommonEvent) => void',
    description: '单击（会等待双击判定窗口）',
  },
  {
    callback: 'onDoubleTap',
    type: '(event: GestureCommonEvent) => void',
    description: '检测到双击',
  },
  {
    callback: 'onLongPress',
    type: '(event: GestureCommonEvent) => void',
    description: '检测到长按',
  },
  {
    callback: 'onLongPressEnd',
    type: '(event: GestureEvent) => void',
    description: '长按后指针抬起',
  },
  {
    callback: 'onNavKeyPress',
    type: '(increment: -1 | 1) => void',
    description: '方向键导航的自定义处理器。会替换默认的上一张 / 下一张行为。',
  },
];

const methods = [
  {
    method: 'attach(element)',
    type: '(HTMLElement) => void',
    description: '把控制器接到 DOM 元素上以检测手势',
  },
  {
    method: 'detach()',
    type: '() => void',
    description:
      '移除 DOM 监听（手势、键盘、滚轮）。之后可以通过 observe() 重新挂上。用于 React 的 effect 清理。',
  },
  {
    method: 'dispose()',
    type: '() => void',
    description:
      '彻底销毁：移除所有控制器并清理信号观察者。用于 Angular 的 onDestroy。',
  },
  {
    method: 'observe()',
    type: '() => void',
    description:
      '开始监听手势、键盘和滚轮。会遵循 enableGestures、enableNavKeys 和 enableWheel 这几个配置开关。',
  },
  {
    method: 'unobserve()',
    type: '() => void',
    description: '停止监听手势、键盘和滚轮',
  },
  {
    method: 'next()',
    type: '() => Promise<void>',
    description: '切到下一张幻灯片',
  },
  {
    method: 'prev()',
    type: '() => Promise<void>',
    description: '切到上一张幻灯片',
  },
  {
    method: 'goTo(index, animate?)',
    type: '(number, boolean?) => Promise<void>',
    description: '切到指定幻灯片',
  },
  {
    method: 'adjust(duration?)',
    type: '(number?) => void',
    description: '重新计算幻灯片位置',
  },
  {
    method: 'setPrimarySize(size)',
    type: '(number) => void',
    description: '更新容器尺寸',
  },
  {
    method: 'updateConfig(config)',
    type: '(Partial<SliderConfig>) => void',
    description: '更新配置项',
  },
  {
    method: 'updateEvents(events)',
    type: '(Partial<SliderEvents>) => void',
    description: '替换事件处理器（未包含在内的既有处理器会保留）',
  },
  {
    method: 'getRangeIndex()',
    type: '() => number',
    description: '返回当前索引在可见范围数组中的位置',
  },
];

const stateProperties = [
  {
    property: 'index',
    type: 'Signal<number>',
    description: '当前幻灯片索引',
  },
  {
    property: 'axisValue',
    type: 'Signal<AnimatedValue>',
    description: '当前轴向位置值（带动画）',
  },
  {
    property: 'indexes',
    type: 'ComputedSignal<number[]>',
    description: '用于虚拟化的可见索引',
  },
];

export default function CoreApi() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">核心 API 参考</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          完整参考：{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/core
          </code>{' '}
          的配置、回调、方法与状态。
        </p>
      </div>

      <section className="mb-12">
        <Heading
          level={2}
          id="slidercontroller-api"
          className="text-2xl font-bold mb-4"
        >
          SliderController API
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          与框架无关的核心。一个工厂函数从配置和可选事件构建出控制器：{' '}
          <strong>配置项</strong> 就是配置， <strong>回调</strong> 就是事件，{' '}
          <strong>方法</strong> 则是返回的控制器所暴露的能力。
        </p>

        <Heading
          level={3}
          id="factory-function"
          className="text-lg font-semibold mb-3"
        >
          工厂函数
        </Heading>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">导出</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createSliderController
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '(config: SliderConfig, events?: SliderEvents) => SliderController'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  构建一个滑动控制器。 <code>config</code>{' '}
                  是必填的（选项见下）； <code>events</code>{' '}
                  是可选的（回调见下）。返回的控制器就是驱动它的入口。
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="config-options"
          className="text-lg font-semibold mb-3"
        >
          配置项
        </Heading>
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
              {configOptions.map((p) => (
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
          level={3}
          id="callbacks"
          className="text-lg font-semibold mb-3"
        >
          回调
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">回调</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {callbacks.map((p) => (
                <tr
                  key={p.callback}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.callback}
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
        <Heading level={3} id="methods" className="text-lg font-semibold mb-3">
          方法
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">方法</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((p) => (
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
          id="state-properties"
          className="text-2xl font-bold mb-4"
        >
          状态属性
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
              {stateProperties.map((p) => (
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
          id="range-extractor"
          className="text-2xl font-bold mb-4"
        >
          范围提取器
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">导出</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  defaultRangeExtractor
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  (index: number, count: number, loop: boolean) =&gt; number[]
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  默认提取器，渲染当前索引周围的 3 个条目
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="signal-api" className="text-2xl font-bold mb-4">
          Signal API
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          核心内部通用的轻量响应式原语。
        </p>

        <Heading
          level={3}
          id="signal-interface"
          className="text-lg font-semibold mb-3"
        >
          Signal 接口
        </Heading>
        <div className="overflow-x-auto mb-6">
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
                  value
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  T
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  读取或写入当前值。写入时若值发生变化会通知观察者。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  observe(callback)
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(callback: () => void) => () => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  注册一个在每次值变化时调用的监听器。返回用于移除它的销毁函数。
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="factory-functions"
          className="text-lg font-semibold mb-3"
        >
          工厂函数
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">导出</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createSignal
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'<T>(initial: T) => Signal<T>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  创建一个可变的响应式信号
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createComputed
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '<T>(fn: () => T, deps: () => Subscribable[]) => ComputedSignal<T>'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  创建派生的计算信号。第二个参数是依赖工厂，返回需要追踪的信号。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  reaction
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '(deps: () => Subscribable[], effect: () => void) => () => void'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  任一依赖信号变化时执行副作用，返回销毁函数。信号的值请在副作用回调里读取。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  batch
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(fn: () => void) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  把多次信号更新合并成一次通知，支持嵌套
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="transitions" className="text-2xl font-bold mb-4">
          过渡动画
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          内置的过渡函数，在动画导航期间计算每张幻灯片的 CSS
          变换。把其中一个作为{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            transitionTransformFn
          </code>{' '}
          属性传给框架组件。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">导出</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  TransitionTransformFn
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  type
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  自定义过渡函数的签名
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  getSlideProgress
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '(axisValue: number, slideIndex: number, primarySize: number) => number'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  返回某张幻灯片相对视口的归一化偏移量（-1 到
                  1）。在自定义过渡函数里使用。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  slideTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  TransitionTransformFn
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  默认的滑动过渡（translateX/Y）
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  fadeTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  TransitionTransformFn
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  交叉淡入淡出过渡
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  flipTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  TransitionTransformFn
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  3D 翻卡过渡
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  cubeTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  TransitionTransformFn
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  3D 立方体旋转过渡
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  zoomTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  TransitionTransformFn
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  缩放过渡
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="content-loading"
          className="text-2xl font-bold mb-4"
        >
          内容加载
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          用于跟踪每张幻灯片的加载 /
          错误状态并预加载媒体的工具。加载控制器带索引守卫，会拒绝来自旧的活动幻灯片的过期回调。预加载器使用
          LRU 缓存（默认成功 200 条、失败 100 条），因此再次访问一个坏掉的 URL
          会立刻显示错误而不重试。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">导出</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createContentLoadingController
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => ContentLoadingController'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  逐张幻灯片的加载 / 错误状态跟踪
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createContentPreloader
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(config: ContentPreloaderConfig) => ContentPreloader'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  带错误缓存的 LRU 媒体预加载器
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  observeMediaLoading
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '(video: HTMLVideoElement, callbacks: MediaLoadingCallbacks) => () => void'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  监听视频加载状态（playing、canplaythrough、waiting）。返回销毁函数。
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="contentloadingcontroller"
          className="text-lg font-semibold mt-6 mb-3"
        >
          ContentLoadingController
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">导出</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  isLoading
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'Signal<boolean>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  当前幻灯片是否正在加载
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  isError
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'Signal<boolean>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  当前幻灯片是否出错
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  setActiveIndex
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(index: number) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  更新当前索引，并重置加载 / 错误状态
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onReady
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(index: number) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  把幻灯片标记为就绪（索引与当前不符时忽略）
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onWaiting
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(index: number) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  把幻灯片标记为加载中（索引与当前不符时忽略）
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onError
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(index: number) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  把幻灯片标记为出错（索引与当前不符时忽略）
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="contentpreloader"
          className="text-lg font-semibold mt-6 mb-3"
        >
          ContentPreloader
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">导出</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  preload
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(src: string, type?: "image" | "video") => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  开始预加载一个媒体 URL
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  isLoaded
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(src: string) => boolean'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  检查 URL 是否在成功的 LRU 缓存里（上限 200）
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  isErrored
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(src: string) => boolean'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  检查 URL 是否在错误的 LRU 缓存里（上限 100）
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  markLoaded
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(src: string) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  手动把某个 URL 标记为已加载
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  markErrored
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(src: string) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  手动把某个 URL 标记为出错
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onLoaded
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(src: string, cb: () => void) => () => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  订阅加载完成事件，返回销毁函数
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="sound" className="text-2xl font-bold mb-4">
          声音
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          媒体播放共享的静音状态。声音控制器提供一个响应式的 muted
          信号，可以同步到 video 元素，也可以由自定义控件切换。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">导出</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createSoundController
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => SoundController'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  共享静音状态的控制器
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  syncMutedToVideo
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '(video: HTMLVideoElement, sound: SoundController) => () => void'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  把 muted 信号同步到 video 元素。返回销毁函数。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="timeline" className="text-2xl font-bold mb-4">
          时间轴
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          用于视频拖动的播放时间轴控制器。把时长、当前时间、缓冲区间和用户拖动状态都作为响应式信号来跟踪。一次调用即可把指针和键盘交互接到任意
          DOM
          元素上，让它表现得像原生拖动条：带指针捕获、实时跳转，以及完整的键盘支持（方向键、Home/End、PageUp/PageDown）。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">导出</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createTimelineController
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(config?: TimelineControllerConfig) => TimelineController'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  工厂函数，返回一个带有{' '}
                  <span className="font-mono text-xs">duration</span>,{' '}
                  <span className="font-mono text-xs">currentTime</span>,{' '}
                  <span className="font-mono text-xs">progress</span>,{' '}
                  <span className="font-mono text-xs">bufferedRanges</span>、{' '}
                  <span className="font-mono text-xs">isScrubbing</span>{' '}
                  等信号，以及 <span className="font-mono text-xs">attach</span>
                  , <span className="font-mono text-xs">detach</span>,{' '}
                  <span className="font-mono text-xs">bindInteractions</span>、{' '}
                  <span className="font-mono text-xs">seek</span> 等方法。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  TimelineControllerConfig
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  接口
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  <span className="font-mono text-xs">keyboardStepSeconds</span>{' '}
                  （默认 5）、{' '}
                  <span className="font-mono text-xs">
                    keyboardPageFraction
                  </span>{' '}
                  （默认 0.1）以及{' '}
                  <span className="font-mono text-xs">onSeek</span>,{' '}
                  <span className="font-mono text-xs">onScrubStart</span>,{' '}
                  <span className="font-mono text-xs">onScrubEnd</span> 等回调。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  BufferedRange
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'{ start: number; end: number }'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  一段连续的缓冲区间，用相对总时长的 0–1
                  比例表示。输出时已排序且互不重叠。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="fullscreen" className="text-2xl font-bold mb-4">
          全屏
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          跨浏览器的全屏工具，带 Safari 厂商前缀兼容处理。fullscreen
          信号是一个惰性单例，用响应式的方式跟踪全屏状态。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">导出</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  fullscreenSignal
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'Signal<boolean>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  跟踪文档是否处于全屏模式的响应式信号
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  requestFullscreen
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(element: HTMLElement) => Promise<void>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  让指定元素进入全屏
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  exitFullscreen
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => Promise<void>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  退出全屏模式
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="dom-cleanup-utilities"
          className="text-2xl font-bold mb-4"
        >
          DOM 与清理工具
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          用于 DOM
          事件管理和确定性清理的底层工具。所有控制器内部都在用，也可以用在自定义集成里。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">导出</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  observeDomEvent
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(target, event, handler, options?) => () => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  添加一个 DOM 事件监听器，并返回用于移除它的销毁函数
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createDisposableList
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => DisposableList'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  用来收集销毁函数的可组合列表。调用 dispose() 一次性全部执行。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createBodyLock
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => BodyLock'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  带引用计数的 body
                  滚动锁。多个使用方可以同时上锁，全部解锁后才恢复滚动。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  sharedBodyLock
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  BodyLock
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  模块级的单例实例。当应用里多个组件需要共用同一个引用计数、让嵌套的弹窗
                  / 浮层正确叠加时使用。各框架绑定（
                  <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                    @reelkit/react
                  </code>
                  ,{' '}
                  <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                    @reelkit/vue
                  </code>
                  ,{' '}
                  <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                    @reelkit/angular
                  </code>
                  ）内部用的就是它。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="focus-management"
          className="text-2xl font-bold mb-4"
        >
          焦点管理
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          与框架无关的对话框无障碍原语。浮层包用它们在关闭时把焦点还给触发元素，并在打开期间把
          Tab / Shift+Tab
          锁在浮层内部。服务端安全：在非浏览器环境下每个工具都返回空操作的销毁函数。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">导出</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  captureFocusForReturn
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => Disposer'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  记录当前获得焦点的元素，并返回一个把焦点还回去的销毁函数。尽力而为：如果该元素已经从
                  DOM 中移除，销毁函数就是空操作。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createFocusTrap
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(container: HTMLElement) => Disposer'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  把 Tab / Shift+Tab 锁在 <code>container</code>{' '}
                  内部。在最后一个可聚焦元素上按 Tab 会回到第一个；在第一个上按
                  Shift+Tab
                  会回到最后一个；焦点若跑出容器（点击外部、程序化聚焦）会被拉回来。激活时不会主动把焦点移进容器
                  —— 那由调用方决定。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  getFocusableElements
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(container: HTMLElement) => HTMLElement[]'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  按 DOM
                  顺序返回所有可用键盘聚焦的后代元素，跳过禁用的、隐藏的以及带{' '}
                  <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                    tabindex="-1"
                  </code>{' '}
                  的元素。
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="usage"
          className="text-lg font-semibold mt-6 mb-2"
        >
          用法
        </Heading>
        <CodeBlock
          language="typescript"
          code={`import { captureFocusForReturn, createFocusTrap } from '@reelkit/core';

// When your modal opens:
const restoreFocus = captureFocusForReturn();
container.focus({ preventScroll: true });
const releaseTrap = createFocusTrap(container);

// When the modal closes:
releaseTrap();
restoreFocus();`}
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="video-utilities"
          className="text-2xl font-bold mb-4"
        >
          视频工具
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          与框架无关的跨幻灯片共享视频播放工具。内部被{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-reel-player
          </code>{' '}
          and{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-lightbox
          </code>
          在用，也可用于自定义框架绑定。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">导出</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  captureFrame
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(video: HTMLVideoElement) => string | null'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  把当前视频帧截成 JPEG 的 data URL。遇到跨域错误时返回 null。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createSharedVideo
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(config: SharedVideoConfig) => SharedVideoInstance'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  创建一个作用域内共享的 video
                  单例，附带播放位置和抽帧映射表。每个使用方拿到独立实例，以保证
                  iOS 上声音的连续性。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  syncVideoObjectFit
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '(video: HTMLVideoElement, fallbackIsVertical: boolean) => Disposer'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  让{' '}
                  <span className="font-mono text-xs">
                    video.style.objectFit
                  </span>{' '}
                  与视频真实方向保持同步。先立即套用回退值（来自声明的宽高比），随后在{' '}
                  <span className="font-mono text-xs">loadedmetadata</span>{' '}
                  时读取真实的{' '}
                  <span className="font-mono text-xs">videoWidth</span> /{' '}
                  <span className="font-mono text-xs">videoHeight</span>{' '}
                  ，竖屏时切到{' '}
                  <span className="font-mono text-xs">'cover'</span>{' '}
                  ，横屏时切到{' '}
                  <span className="font-mono text-xs">'contain'</span>{' '}
                  。即使声明的元数据有误也能正确处理。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          URL 状态
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          把一个查询参数与信号双向映射。两条轴，各司其职：{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            codec
          </code>{' '}
          负责传输格式（参数文本 ↔ 稳定身份），{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locator
          </code>{' '}
          负责查找（该身份在集合中的位置）。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">导出</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createUrlStateController
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '({ param, adapter?, codec?, locator? }) => UrlStateController'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  把一个查询参数映射成信号，并把变化写回
                  URL。参数原本不存在时，第一次写入压入一条历史记录，之后每次写入都是替换。给定一个{' '}
                  <code className="font-mono text-xs">codec</code> or{' '}
                  <code className="font-mono text-xs">locator</code>{' '}
                  后，它还会推导出{' '}
                  <code className="font-mono text-xs">
                    position: Signal&lt;Pos | null&gt;
                  </code>
                  ，负责处理开关闩锁，并让指向不存在幻灯片的参数自动失效 ——
                  于是各框架绑定只需订阅，不必各自重新推导。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createHistoryAdapter
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => UrlAdapter'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  基于 History API
                  的默认适配器。带路由的应用应当注入自己的实现，否则路由器的
                  location 会过期，下一次导航就会把参数丢掉。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  indexCodec
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'UrlCodec<number>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  把 <code className="font-mono text-xs">?photo=3</code> 读成第
                  3
                  张幻灯片。传入它即可直接使用索引推导，不必自己写编解码器。对于无限或分页列表，请改传{' '}
                  <code className="font-mono text-xs">locator</code> —— 参数会在
                  promise
                  未完成期间保留，因此指向尚未加载页的深链不会在请求过程中被清掉。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createIndexLocator
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(countGetter: () => number) => UrlLocator<number>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  默认的索引定位器：幻灯片位置映射到它自己，上界由 getter
                  返回的实时数量决定。越界的索引解析为{' '}
                  <code className="font-mono text-xs">null</code>，于是过期的{' '}
                  <code className="font-mono text-xs">?photo=99</code> 会自动从
                  URL 中消失 —— 它选择拒绝，而不是就近取一张，否则打开的就不是
                  URL 指定的那一张了。这里用 getter
                  而不是数字，是为了在分页画廊变大时，每次查找都读取当前的数量。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  urlIndexKey
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(countGetter, locateAsync?) => UrlKey<number>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  按索引寻址的画廊所需的配套组合 ——{' '}
                  <code className="font-mono text-xs">indexCodec</code> 加上一个{' '}
                  <code className="font-mono text-xs">createIndexLocator</code>{' '}
                  以画廊尺寸为上界的定位器。展开它（
                  <code className="font-mono text-xs">
                    {'{ param, ...urlIndexKey(() => count) }'}
                  </code>
                  ），编解码器就不会和定位器脱节。传入第二个参数{' '}
                  <code className="font-mono text-xs">locateAsync</code>{' '}
                  即可支持分页信息流 —— 未命中时一直翻页到目标索引，再返回它。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  urlIndexTwoAxisKey
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(opts) => UrlKey<TwoAxisIdentity, TwoAxisPosition>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  类似 <code className="font-mono text-xs">urlIndexKey</code>{' '}
                  ，但面向双轴播放器：一个严格以点分隔的{' '}
                  <code className="font-mono text-xs">
                    ?p=&lt;outer&gt;.&lt;inner&gt;
                  </code>{' '}
                  参数，解析成{' '}
                  <code className="font-mono text-xs">TwoAxisPosition</code>{' '}
                  <code className="font-mono text-xs">
                    {'{ outer, inner }'}
                  </code>
                  。选项（
                  <code className="font-mono text-xs">
                    UrlIndexTwoAxisKeyOptions
                  </code>
                  ): <code className="font-mono text-xs">outerCount</code>,{' '}
                  <code className="font-mono text-xs">innerCounts</code>，可选的{' '}
                  <code className="font-mono text-xs">outerCodec</code>/
                  <code className="font-mono text-xs">outerLocator</code>{' '}
                  用于外层维度，而{' '}
                  <code className="font-mono text-xs">innerCodec</code>/
                  <code className="font-mono text-xs">innerLocate</code>/
                  <code className="font-mono text-xs">innerIdentify</code>{' '}
                  则让内层维度也能按 id 寻址。每个维度默认按普通索引处理。URL
                  驱动的 Stories Player就基于它。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createStableIdCodec
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(hashCodec?: UrlCodec<string>) => UrlCodec<string>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  稳定 id 的 <strong>传输格式</strong>，单独导出以便组合 ——
                  参数文本就是条目的{' '}
                  <code className="font-mono text-xs">id</code>
                  ，可以原样写入，也可以由{' '}
                  <code className="font-mono text-xs">
                    hashCodec
                  </code> （传入{' '}
                  <code className="font-mono text-xs">base64UrlCodec</code>{' '}
                  即可得到可逆的 base64url）。它是{' '}
                  <code className="font-mono text-xs">indexCodec</code>在稳定 id
                  场景下的对应物：可以把它和你自己的定位器配对，而不必整包使用{' '}
                  <code className="font-mono text-xs">urlStableIdKey</code>.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  base64UrlCodec
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'UrlCodec<string>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  稳定 id key 的现成混淆机制：可逆的 base64url（URL
                  安全字母表、无填充、UTF-8）—— <strong>并不是</strong>{' '}
                  加密哈希。把它作为{' '}
                  <code className="font-mono text-xs">hashCodec</code>{' '}
                  传入即可在 URL 中隐藏 id；也可以自己实现{' '}
                  <code className="font-mono text-xs">
                    UrlCodec&lt;string&gt;
                  </code>{' '}
                  来接入别的方案。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createStableIdLocator
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(items, locateAsync?) => UrlLocator<string, number>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  稳定 id 的 <strong>lookup</strong>，单独导出以便组合 ——
                  它会扫描 <code className="font-mono text-xs">items()</code>{' '}
                  ，寻找匹配的 <code className="font-mono text-xs">id</code>
                  ；已消失的 id 解析为{' '}
                  <code className="font-mono text-xs">null</code>{' '}
                  并自动失效。可选的{' '}
                  <code className="font-mono text-xs">locateAsync</code>{' '}
                  支持分页信息流。它是索引定位器在稳定 id 场景下的对应物：{' '}
                  <code className="font-mono text-xs">createIndexLocator</code>.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  urlStableIdKey
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(opts) => UrlKey<string, number>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  按每个条目稳定的 <code className="font-mono text-xs">id</code>{' '}
                  — <code className="font-mono text-xs">?photo=&lt;id&gt;</code>{' '}
                  来寻址画廊 ——
                  而不是按位置，因此列表重新排序后书签依然有效。选项（
                  <code className="font-mono text-xs">
                    UrlStableIdKeyOptions
                  </code>
                  ): <code className="font-mono text-xs">items</code> （一个实时
                  getter）、可选的{' '}
                  <code className="font-mono text-xs">hashCodec</code> （传入{' '}
                  <code className="font-mono text-xs">base64UrlCodec</code>
                  用于在传输时变换 id，以及可选的{' '}
                  <code className="font-mono text-xs">locateAsync</code>{' '}
                  用于支持分页信息流（未命中时一直拉取到该 id
                  出现，再返回它的索引）。只要列表可能在分享链接之后发生变化，就优先用它而不是{' '}
                  <code className="font-mono text-xs">urlIndexKey</code> 。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  urlStableIdTwoAxisKey
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(opts) => UrlKey<TwoAxisIdentity<string>, TwoAxisPosition>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  双轴版本：外层按稳定 id，内层按局部索引 ——{' '}
                  <code className="font-mono text-xs">?story=user_42.3</code>
                  。提供 <code className="font-mono text-xs">
                    innerItems
                  </code>{' '}
                  ，而不是{' '}
                  <code className="font-mono text-xs">innerCounts</code>{' '}
                  即可让内层也按 id 寻址（
                  <code className="font-mono text-xs">
                    ?story=user_42.photo_7
                  </code>
                  ); <code className="font-mono text-xs">hashCodec</code> (e.g.{' '}
                  <code className="font-mono text-xs">base64UrlCodec</code>
                  ）会同时变换两个 id。选项为{' '}
                  <code className="font-mono text-xs">
                    UrlStableIdTwoAxisKeyOptions
                  </code>{' '}
                  （内层用索引）或{' '}
                  <code className="font-mono text-xs">
                    UrlStableIdTwoAxisIdInnerOptions
                  </code>{' '}
                  （内层用 id）；条目类型需满足{' '}
                  <code className="font-mono text-xs">Identified</code> (
                  <code className="font-mono text-xs">{'{ id: string }'}</code>
                  ).
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  {'UrlCodec<Id>'}
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'{ decode(raw) => Id | null; encode(id) => string }'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  传输格式：参数文本 ↔ 稳定身份，与集合无关。{' '}
                  <code className="font-mono text-xs">decode</code> 返回{' '}
                  <code className="font-mono text-xs">null</code>{' '}
                  表示文本格式非法。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  {'UrlLocator<Id>'}
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '{ locate(id) => number | null; locateAsync?(id) => Promise<number | null>; identify(index) => id }'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  查找：该身份在集合中的位置。{' '}
                  <code className="font-mono text-xs">locate</code> 是同步的，{' '}
                  <code className="font-mono text-xs">locateAsync</code>{' '}
                  是分页列表下的兜底，{' '}
                  <code className="font-mono text-xs">identify</code>{' '}
                  则把索引反查成身份，用于写回。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  {'UrlKey<Id>'}
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'{ codec: UrlCodec<Id>; locator: UrlLocator<Id> }'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  一个参数所对应的编解码器与定位器组合。它们共用同一个{' '}
                  <code className="font-mono text-xs">Id</code>{' '}
                  ，并且总是成对出现 —— 编解码器把身份写进
                  URL，定位器负责找到它在哪 ——
                  成对构建正是它们不会互相矛盾的原因。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  UrlAdapter
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'{ read, subscribe, push, replace, getState, goBack }'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  路由器的注入点。带路由的应用必须提供一个，否则路由器自己的
                  location 会过期。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  {'UrlStateOptions<Id>'}
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '{ param: string; adapter?: UrlAdapter; codec?: UrlCodec<Id>; locator?: UrlLocator<Id> }'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  选项类型：{' '}
                  <code className="font-mono text-xs">
                    createUrlStateController
                  </code>{' '}
                  所接受的选项 —— 单独导出，方便使用方先组装好配置再传进去。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
