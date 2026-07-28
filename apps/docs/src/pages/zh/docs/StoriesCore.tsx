import { CodeBlock } from '../../../components/ui/CodeBlock';
import { FeatureCardGrid } from '../../../components/ui/FeatureCard';
import {
  Layers,
  Timer,
  Minus,
  MousePointerClick,
  Cog,
  Cpu,
} from 'lucide-react';
import { Heading } from '../../../components/ui/Heading';
import { zhPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/stories-core',
    title: 'Stories Core · ReelKit',
    description:
      '框架无关的 Stories 引擎：Stories 控制器、计时控制器、Canvas 进度渲染器与工具函数。',
  });

// Headings carry the English slug as an explicit id — the slug generator
// is ascii-only, so a Chinese heading would produce an empty anchor.

const features = [
  {
    icon: Cpu,
    label: '与框架无关',
    desc: '纯 TypeScript，不依赖任何 DOM 框架',
  },
  {
    icon: Layers,
    label: '两级导航',
    desc: '分组，以及每个分组内部的 story',
  },
  {
    icon: Timer,
    label: 'RAF 计时器',
    desc: '基于 requestAnimationFrame 的自动播放，支持暂停 / 恢复',
  },
  {
    icon: Minus,
    label: 'Canvas 进度条',
    desc: '适配 Retina 的分段进度条，带滑动窗口',
  },
  {
    icon: MousePointerClick,
    label: '点击区域',
    desc: '可配置的左右点击检测',
  },
  {
    icon: Cog,
    label: '响应式信号',
    desc: '构建在 @reelkit/core 的信号原语之上',
  },
];

const configRows = [
  {
    name: 'groupCount',
    type: 'number',
    default: '必填',
    desc: 'story 分组总数',
  },
  {
    name: 'storyCounts',
    type: 'number[]',
    default: '必填',
    desc: '每个分组内的 story 数量',
  },
  {
    name: 'initialGroupIndex',
    type: 'number',
    default: '0',
    desc: '初始分组索引',
  },
  {
    name: 'initialStoryIndex',
    type: 'number',
    default: '0',
    desc: '分组内的初始 story 索引',
  },
  {
    name: 'defaultImageDuration',
    type: 'number',
    default: '5000',
    desc: '图片类 story 的默认自动播放时长（毫秒）',
  },
];

const eventsRows = [
  {
    name: 'onStoryChange',
    type: '(groupIndex, storyIndex) => void',
    desc: '当前 story 变化时触发',
  },
  {
    name: 'onGroupChange',
    type: '(groupIndex) => void',
    desc: '当前分组变化时触发',
  },
  {
    name: 'onStoryViewed',
    type: '(groupIndex, storyIndex) => void',
    desc: '某个 story 变为可见时触发',
  },
  {
    name: 'onStoryComplete',
    type: '(groupIndex, storyIndex) => void',
    desc: "Fired when a story's timer completes (before advancing)",
  },
  {
    name: 'onComplete',
    type: '() => void',
    desc: '最后一个分组的最后一个 story 播完时触发',
  },
  {
    name: 'onClose',
    type: '() => void',
    desc: '浮层应当关闭时触发',
  },
];

const stateRows = [
  {
    name: 'state.activeGroupIndex',
    type: 'Signal<number>',
    desc: '当前分组索引',
  },
  {
    name: 'state.activeStoryIndex',
    type: 'Signal<number>',
    desc: '分组内当前 story 的索引',
  },
  {
    name: 'state.isPaused',
    type: 'Signal<boolean>',
    desc: '自动播放是否已暂停',
  },
];

const methodsRows = [
  {
    name: 'nextStory()',
    type: '() => void',
    desc: '在分组内前进；越过边界时进入下一个分组',
  },
  {
    name: 'prevStory()',
    type: '() => void',
    desc: '在分组内后退；越过边界时回到上一个分组',
  },
  {
    name: 'nextGroup()',
    type: '() => void',
    desc: '切到下一个分组，并从上次看到的 story 继续',
  },
  {
    name: 'prevGroup()',
    type: '() => void',
    desc: '切到上一个分组，并从上次看到的 story 继续',
  },
  {
    name: 'goToGroup(index)',
    type: '(number) => void',
    desc: '按索引跳到指定分组',
  },
  {
    name: 'pause()',
    type: '() => void',
    desc: '暂停自动播放',
  },
  {
    name: 'resume()',
    type: '() => void',
    desc: '恢复自动播放',
  },
  {
    name: 'onStoryTimerComplete()',
    type: '() => void',
    desc: '计时结束时调用；先触发 onStoryComplete 再前进',
  },
  {
    name: 'getLastStoryIndex(groupIndex)',
    type: '(number) => number',
    desc: '某分组最后看到的 story 索引（从未访问过则为 0）',
  },
];

const timerConfigRows = [
  {
    name: 'duration',
    type: 'number',
    default: '必填',
    desc: '默认时长（毫秒）',
  },
  {
    name: 'onComplete',
    type: '() => void',
    default: 'undefined',
    desc: '计时到达 100% 时调用',
  },
];

const timerStateRows = [
  {
    name: 'progress',
    type: 'Signal<number>',
    desc: '进度信号（0 到 1）',
  },
  {
    name: 'isRunning',
    type: 'Signal<boolean>',
    desc: '计时器当前是否在运行',
  },
];

const timerMethodsRows = [
  {
    name: 'start(duration?)',
    type: '(number?) => void',
    desc: '启动（或重启）计时器，可选地覆盖时长',
  },
  {
    name: 'pause()',
    type: '() => void',
    desc: '把进度冻结在当前位置',
  },
  {
    name: 'resume()',
    type: '() => void',
    desc: '从冻结的位置继续',
  },
  {
    name: 'reset()',
    type: '() => void',
    desc: '把进度重置为 0 并停止',
  },
  {
    name: 'dispose()',
    type: '() => void',
    desc: '清理资源',
  },
];

const canvasConfigRows = [
  {
    name: 'gap',
    type: 'number',
    default: '2',
    desc: '分段之间的间距（像素）',
  },
  {
    name: 'barHeight',
    type: 'number',
    default: '2',
    desc: '进度条高度（像素）',
  },
  {
    name: 'minSegmentWidth',
    type: 'number',
    default: '8',
    desc: '触发滑动窗口之前的最小分段宽度',
  },
  {
    name: 'bgColor',
    type: 'string',
    default: "'rgba(255,255,255,0.3)'",
    desc: '未填充分段的背景色',
  },
  {
    name: 'fillColor',
    type: 'string',
    default: "'#ffffff'",
    desc: '已完成 / 当前分段的填充色',
  },
];

const canvasMethodsRows = [
  {
    name: 'attach(canvas)',
    type: '(HTMLCanvasElement) => void',
    desc: '挂到 canvas 元素上；并在父级启动 ResizeObserver',
  },
  {
    name: 'draw(totalStories, activeIndex, progress)',
    type: '(number, number, number) => void',
    desc: '按给定状态绘制进度条',
  },
  {
    name: 'width',
    type: 'number (readonly)',
    desc: '当前测得的宽度（CSS 像素）',
  },
  {
    name: 'dispose()',
    type: '() => void',
    desc: '清理 ResizeObserver 和内部状态',
  },
];

const utilityRows = [
  {
    name: 'getTapAction(tapX, containerWidth, splitRatio?)',
    type: "(number, number, number?) => 'prev' | 'next'",
    desc: "Determines whether a tap triggers 'prev' or 'next' based on position. Default splitRatio is 0.3.",
  },
  {
    name: 'getSegments(totalStories, activeIndex, progress)',
    type: '(number, number, number) => SegmentState[]',
    desc: '计算进度条中每个分段的状态和填充比例',
  },
  {
    name: 'getVisibleWindow(totalStories, activeIndex, progress, containerWidth, minSegmentWidth?, gap?)',
    type: '(number, number, number, number, number?, number?) => VisibleWindow',
    desc: '当分段总数超出容器容量时，计算可见的滑动窗口',
  },
];

const typesCode = `type MediaType = 'image' | 'video';

interface StoryItem {
  id: string;
  mediaType: MediaType;
  src: string;
  poster?: string;
  duration?: number;
  createdAt?: string | Date;
  aspectRatio?: number;
}

interface AuthorInfo {
  id: string;
  name: string;
  avatar: string;
  verified?: boolean;
}

interface StoriesGroup<T extends StoryItem = StoryItem> {
  author: AuthorInfo;
  stories: T[];
}

type SegmentStatus = 'completed' | 'active' | 'upcoming';

interface SegmentState {
  status: SegmentStatus;
  fillPercentage: number; // 0-100
}

interface VisibleWindow {
  startIndex: number;
  endIndex: number;
  segments: SegmentState[];
}

type TapAction = 'prev' | 'next';`;

const controllerExample = `import {
  createStoriesController,
  createTimerController,
} from '@reelkit/stories-core';
import { reaction } from '@reelkit/core';

const groups = [
  { stories: ['s1', 's2', 's3'] },
  { stories: ['s4', 's5'] },
];

const controller = createStoriesController(
  {
    groupCount: groups.length,
    storyCounts: groups.map((g) => g.stories.length),
    defaultImageDuration: 5000,
  },
  {
    onStoryChange(groupIndex, storyIndex) {
      console.log('Story changed:', groupIndex, storyIndex);
    },
    onComplete() {
      console.log('All stories viewed');
    },
    onClose() {
      console.log('Overlay closed');
    },
  },
);

// Wire up a timer for auto-advance
const timer = createTimerController({
  duration: 5000,
  onComplete: () => controller.onStoryTimerComplete(),
});

// React to story changes and restart the timer
const dispose = reaction(
  () => [
    controller.state.activeGroupIndex,
    controller.state.activeStoryIndex,
  ],
  () => timer.start(),
);

// Start playback
timer.start();

// Navigation
controller.nextStory();
controller.pause();
controller.resume();

// Cleanup
dispose();
timer.dispose();`;

const timerExample = `import { createTimerController } from '@reelkit/stories-core';
import { reaction } from '@reelkit/core';

const timer = createTimerController({
  duration: 5000,
  onComplete: () => console.log('Timer finished!'),
});

// Observe progress (0 to 1)
const dispose = reaction(
  () => [timer.progress],
  () => {
    console.log('Progress:', timer.progress.value);
  },
);

// Start with default duration
timer.start();

// Or override duration for a specific story
timer.start(8000);

// Pause/resume preserves exact position
timer.pause();
timer.resume();

// Reset to 0
timer.reset();

// Cleanup
dispose();
timer.dispose();`;

const canvasExample = `import { createCanvasProgressRenderer } from '@reelkit/stories-core';

const renderer = createCanvasProgressRenderer({
  gap: 2,
  barHeight: 2,
  fillColor: '#ffffff',
  bgColor: 'rgba(255, 255, 255, 0.3)',
});

// Attach to a canvas element
const canvas = document.querySelector('canvas')!;
renderer.attach(canvas);

// Draw on each animation frame
let frameId: number;

function loop() {
  const totalStories = 5;
  const activeIndex = 2;
  const progress = timer.progress.value; // 0-1

  renderer.draw(totalStories, activeIndex, progress);
  frameId = requestAnimationFrame(loop);
}

frameId = requestAnimationFrame(loop);

// Cleanup
cancelAnimationFrame(frameId);
renderer.dispose();`;

function Table3Col({
  headers,
  rows,
}: {
  headers: [string, string, string];
  rows: { name: string; type: string; desc: string }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            {headers.map((h) => (
              <th key={h} className="text-left py-3 px-4 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.name}
              className="border-b border-slate-100 dark:border-slate-800"
            >
              <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                {r.name}
              </td>
              <td className="py-3 px-4 font-mono text-xs text-slate-500">
                {r.type}
              </td>
              <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                {r.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Table4Col({
  rows,
}: {
  rows: { name: string; type: string; default: string; desc: string }[];
}) {
  return (
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
          {rows.map((r) => (
            <tr
              key={r.name}
              className="border-b border-slate-100 dark:border-slate-800"
            >
              <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                {r.name}
              </td>
              <td className="py-3 px-4 font-mono text-xs text-slate-500">
                {r.type}
              </td>
              <td className="py-3 px-4 text-slate-500 text-sm">{r.default}</td>
              <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                {r.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StoriesCorePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Overview */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Stories Core</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          驱动{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-stories-player
          </code>
          的引擎。纯 TypeScript，不依赖任何框架。可以用它为 Angular、Vue 或原生
          JS 构建 Stories Player。
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12">
        <FeatureCardGrid items={features} />
      </div>

      {/* Installation */}
      <section className="mb-12">
        <Heading
          level={2}
          id="installation"
          className="text-2xl font-bold mb-4"
        >
          安装
        </Heading>
        <CodeBlock code="npm i @reelkit/stories-core" language="bash" />
      </section>

      {/* Stories Controller */}
      <section className="mb-12">
        <Heading
          level={2}
          id="stories-controller"
          className="text-2xl font-bold mb-6"
        >
          Stories 控制器
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createStoriesController(config, events?)
          </code>{' '}
          负责在分组和 story 之间导航。它跟踪暂停 /
          恢复状态，记住每个分组最后看到的 story，并在每次切换时触发回调。
        </p>

        <Heading
          level={3}
          id="config-storiescontrollerconfig"
          className="text-lg font-semibold mb-3"
        >
          配置（StoriesControllerConfig）
        </Heading>
        <Table4Col rows={configRows} />

        <Heading
          level={3}
          id="events-storiescontrollerevents"
          className="text-lg font-semibold mt-8 mb-3"
        >
          事件（StoriesControllerEvents）
        </Heading>
        <Table3Col headers={['事件', '类型', '说明']} rows={eventsRows} />

        <Heading
          level={3}
          id="state-reactive-signals"
          className="text-lg font-semibold mt-8 mb-3"
        >
          状态（响应式信号）
        </Heading>
        <Table3Col headers={['Signal', '类型', '说明']} rows={stateRows} />

        <Heading
          level={3}
          id="methods"
          className="text-lg font-semibold mt-8 mb-3"
        >
          方法
        </Heading>
        <Table3Col headers={['方法', '类型', '说明']} rows={methodsRows} />

        <Heading
          level={3}
          id="example"
          className="text-lg font-semibold mt-8 mb-3"
        >
          示例
        </Heading>
        <CodeBlock code={controllerExample} />
      </section>

      {/* Timer Controller */}
      <section className="mb-12">
        <Heading
          level={2}
          id="timer-controller"
          className="text-2xl font-bold mb-6"
        >
          计时控制器
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createTimerController(config)
          </code>{' '}
          用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            requestAnimationFrame
          </code>{' '}
          循环驱动自动播放。进度信号（0 到
          1）供给进度条。暂停和恢复会精确保留位置。
        </p>

        <Heading
          level={3}
          id="config-timercontrollerconfig"
          className="text-lg font-semibold mb-3"
        >
          配置（TimerControllerConfig）
        </Heading>
        <Table4Col rows={timerConfigRows} />

        <Heading
          level={3}
          id="state"
          className="text-lg font-semibold mt-8 mb-3"
        >
          状态
        </Heading>
        <Table3Col headers={['Signal', '类型', '说明']} rows={timerStateRows} />

        <Heading
          level={3}
          id="methods"
          className="text-lg font-semibold mt-8 mb-3"
        >
          方法
        </Heading>
        <Table3Col headers={['方法', '类型', '说明']} rows={timerMethodsRows} />

        <Heading
          level={3}
          id="example"
          className="text-lg font-semibold mt-8 mb-3"
        >
          示例
        </Heading>
        <CodeBlock code={timerExample} />
      </section>

      {/* Canvas Progress Renderer */}
      <section className="mb-12">
        <Heading
          level={2}
          id="canvas-progress-renderer"
          className="text-2xl font-bold mb-6"
        >
          Canvas 进度渲染器
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createCanvasProgressRenderer(config?)
          </code>{' '}
          在 canvas 上绘制分段进度条。它会针对 Retina 屏缩放，通过
          ResizeObserver 测量容器，并在分段放不下时启用滑动窗口。
        </p>

        <Heading
          level={3}
          id="config-canvasprogressrendererconfig"
          className="text-lg font-semibold mb-3"
        >
          配置（CanvasProgressRendererConfig）
        </Heading>
        <Table4Col rows={canvasConfigRows} />

        <Heading
          level={3}
          id="methods"
          className="text-lg font-semibold mt-8 mb-3"
        >
          方法
        </Heading>
        <Table3Col
          headers={['成员', '类型', '说明']}
          rows={canvasMethodsRows}
        />

        <Heading
          level={3}
          id="example"
          className="text-lg font-semibold mt-8 mb-3"
        >
          示例
        </Heading>
        <CodeBlock code={canvasExample} />
      </section>

      {/* Utility Functions */}
      <section className="mb-12">
        <Heading
          level={2}
          id="utility-functions"
          className="text-2xl font-bold mb-6"
        >
          工具函数
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          用于点击区域检测和进度条计算的纯函数。
        </p>
        <Table3Col headers={['函数', '类型', '说明']} rows={utilityRows} />
      </section>

      {/* Types */}
      <section>
        <Heading level={2} id="types" className="text-2xl font-bold mb-6">
          类型
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          全部类型定义均导出自{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/stories-core
          </code>
          .
        </p>
        <CodeBlock code={typesCode} />
      </section>
    </div>
  );
}
