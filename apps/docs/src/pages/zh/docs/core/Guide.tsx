import { Link } from 'react-router-dom';
import { Callout } from '../../../../components/ui/Callout';
import { CodeBlock } from '../../../../components/ui/CodeBlock';
import { NextSteps } from '../../../../components/NextSteps';
import { Heading } from '../../../../components/ui/Heading';
import { zhPageMeta } from '../../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/core/guide',
    title: '核心指南 · ReelKit',
    description:
      '@reelkit/core 的架构：滑动控制器、虚拟化、信号系统、手势与时间轴控制器。',
  });

// Headings carry the English slug as an explicit id — the slug generator is
// ascii-only, so a Chinese heading would produce an empty anchor.
export default function CoreGuide() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">核心指南</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/core
          </code>{' '}
          包提供与框架无关的滑动逻辑。用它来做自定义集成，或者理解底层架构。
        </p>
      </div>

      <section className="mb-12">
        <Heading
          level={2}
          id="architecture-overview"
          className="text-2xl font-bold mb-4"
        >
          架构概览
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          核心采用工厂函数式的<strong>控制器模式</strong>。没有类 ——
          全是闭包返回的普通对象，零依赖。核心负责协调这几个部分：
        </p>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>SliderController</strong> —— 中央状态管理与导航
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>GestureController</strong> —— 触摸 / 指针拖拽处理
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>KeyboardController</strong> —— 方向键与 Escape
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>WheelController</strong> —— 带防抖的鼠标滚轮
            </span>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="createslidercontroller"
          className="text-2xl font-bold mb-4"
        >
          createSliderController
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          创建一个新的滑动控制器实例，管理滑动器的全部状态和行为。
        </p>
        <CodeBlock
          code={`import { createSliderController } from '@reelkit/core';

const controller = createSliderController(
  {
    count: 10,
    direction: 'vertical',
    enableWheel: true,
    transitionDuration: 300,
  },
  {
    onAfterChange: (index) => console.log('Changed to:', index),
  }
);

// Attach to DOM element
controller.attach(element);
controller.observe();`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="controller-methods"
          className="text-2xl font-bold mb-4"
        >
          控制器方法
        </Heading>

        <Heading
          level={3}
          id="navigation"
          className="text-lg font-semibold mb-3"
        >
          导航
        </Heading>
        <CodeBlock
          code={`// Go to specific index
controller.goTo(5);           // instant
controller.goTo(5, true);     // animated, returns Promise

// Navigate to next/previous
controller.next();
controller.prev();`}
          language="typescript"
        />

        <Heading
          level={3}
          id="lifecycle"
          className="text-lg font-semibold mt-6 mb-3"
        >
          生命周期
        </Heading>
        <CodeBlock
          code={`// Connect to DOM element
controller.attach(element);

// Start gesture, keyboard, and wheel observation
controller.observe();

// Stop gesture, keyboard, and wheel observation
controller.unobserve();

// Detach DOM listeners (reversible — use for React effect cleanup)
controller.detach();

// Permanent teardown (use for Angular onDestroy)
controller.dispose();

// Recalculate positions
controller.adjust();

// Update size
controller.setPrimarySize(600);`}
          language="typescript"
        />

        <Heading
          level={3}
          id="state-updates"
          className="text-lg font-semibold mt-6 mb-3"
        >
          状态更新
        </Heading>
        <CodeBlock
          code={`// Update configuration
controller.updateConfig({
  count: 20,
  loop: true,
});`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="virtualization"
          className="text-2xl font-bold mb-4"
        >
          虚拟化
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          核心在任何时刻只往 DOM 里渲染 <strong>3 张幻灯片</strong>
          （当前、上一张、下一张）。由范围提取器决定渲染窗口里包含哪些索引：
        </p>
        <CodeBlock
          code={`import { defaultRangeExtractor } from '@reelkit/core';

// Default: renders current ± 1 (3 DOM nodes)
const indexes = defaultRangeExtractor(currentIndex, count);

// Custom: skip hidden slides by shifting to next valid index
const hiddenSlides = new Set([2, 5]);

const skipHiddenExtractor = (current: number, count: number) => {
  const result: number[] = [];
  // Collect prev, current, next — skip hidden, shift forward
  for (let i = current - 1, added = 0; added < 3 && i < count; i++) {
    if (i >= 0 && !hiddenSlides.has(i)) {
      result.push(i);
      added++;
    }
  }
  return result;
};`}
          language="typescript"
        />
        <Callout type="info" className="mt-4">
          结果始终被限制在最多 3 个索引。如果你的提取器返回更多，
          核心会保留围绕当前幻灯片居中的那 3 个。
        </Callout>
      </section>

      <section className="mb-12">
        <Heading level={2} id="signals" className="text-2xl font-bold mb-4">
          Signals
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          核心使用一套轻量的信号系统来做响应式：
        </p>
        <CodeBlock
          code={`import { createSignal, createComputed, reaction } from '@reelkit/core';

// Create a signal
const count = createSignal(0);

// Observe changes (returns a disposer function)
const dispose = count.observe(() => console.log(count.value));

// Update value
count.value = 5;

// Create computed signal (requires a deps factory)
const doubled = createComputed(() => count.value * 2, () => [count]);

// Run side effects on signal changes
const disposeReaction = reaction(
  () => [count],
  () => console.log('Count changed:', count.value)
);

// Cleanup
dispose();
disposeReaction();`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="controller-state"
          className="text-2xl font-bold mb-4"
        >
          控制器状态
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          通过{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            controller.state
          </code>{' '}
          访问响应式状态：
        </p>
        <CodeBlock
          code={`const { index, axisValue, indexes } = controller.state;

// Observe index changes (returns a disposer function)
const disposeIndex = index.observe(() => {
  console.log('Current index:', index.value);
});

// Observe visible indexes for virtualization
const disposeIndexes = indexes.observe(() => {
  console.log('Visible:', indexes.value);
});

// Cleanup when done
disposeIndex();
disposeIndexes();`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="timeline" className="text-2xl font-bold mb-4">
          时间轴控制器
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          为任意{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">{`<video>`}</code>{' '}
          元素做一个自定义拖动条。控制器把时长、当前时间、缓冲区间和拖动状态
          都暴露成响应式信号，并且一次调用就能把指针和键盘交互接到任意 DOM
          元素上。
        </p>
        <CodeBlock
          code={`import { createTimelineController } from '@reelkit/core';

const timeline = createTimelineController({
  onScrubStart: () => video.pause(),
  onScrubEnd: () => video.play(),
});

timeline.attach(video);
const dispose = timeline.bindInteractions(trackEl);

// Render: read signals and update DOM
timeline.progress.observe(() => {
  fillEl.style.width = \`\${timeline.progress.value * 100}%\`;
});

// Cleanup
dispose();
timeline.detach();`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          URL 状态
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          把浮层的打开状态放进地址栏：当前这张幻灯片就有了可分享、可直达的链接，
          按返回键即可关闭。模型由核心持有；各框架绑定把它包成一个钩子（React /
          Vue 的{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useOverlayUrlState
          </code>
          ，Angular 的{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createOverlayUrlState
          </code>
          ）以及一个由 URL 驱动的浮层组件。
        </p>

        <Heading
          level={3}
          id="how-it-works"
          className="text-lg font-semibold mt-6 mb-3"
        >
          工作原理
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createUrlStateController
          </code>{' '}
          把一个查询参数映射成信号，并把变化写回去。打开时压入
          <strong>一条</strong>
          历史记录，之后每次导航都是<strong>替换</strong> ——
          滑一百次也不会多出一条，所以退一步永远就是关闭。{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            UrlAdapter
          </code>{' '}
          是可插拔的读写接缝：默认实现走{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            history.pushState
          </code>
          ；带路由的应用则传入一个基于路由器的适配器，这样路由器自己的 location
          永远不会过期。
        </p>
        <CodeBlock
          code={`import { createUrlStateController, urlIndexKey } from '@reelkit/core';

const controller = createUrlStateController({
  param: 'photo',
  ...urlIndexKey(() => items.length),
});

const detach = controller.attach(); // begin mirroring the URL
controller.position.observe(() => {
  // null → closed; a number → open at that slide
  render(controller.position.value);
});

// Write back: opening pushes once, navigating replaces, closing clears
controller.set(3);
controller.set(null);`}
          language="typescript"
        />

        <Heading
          level={3}
          id="codec-and-locator-two-jobs"
          className="text-lg font-semibold mt-6 mb-3"
        >
          编解码器与定位器 —— 两件事
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          一个 key 是配套的{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'{ codec, locator }'}
          </code>{' '}
          组合。把身份写进 URL 和在当前集合里找到它的位置，是两件不同的事，
          所以它们是两个对象：
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li>
            <strong>codec —— 传输格式。</strong>{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              encode
            </code>{' '}
            把身份写成参数文本；{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              decode
            </code>{' '}
            再解析回来，遇到非法值直接拒绝，参数就会自动从 URL 里消失。
          </li>
          <li>
            <strong>locator —— 查找。</strong>{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              locate
            </code>{' '}
            在当前集合里找到解码后的身份所在的位置（找不到就返回{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              null
            </code>
            ）；{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              identify
            </code>{' '}
            则把位置反查回身份，用于写入；可选的{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              locateAsync
            </code>{' '}
            会在未命中时继续翻页加载窗口式或无限式的信息流。
          </li>
        </ul>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          把两者分开，你就能任意搭配 —— 比如稳定 id
          的编解码器配上一个会翻页的定位器。
        </p>

        <Heading
          level={3}
          id="index-vs-stable-id-keys"
          className="text-lg font-semibold mt-6 mb-3"
        >
          索引 key 与稳定 id key
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          有两个内置 key 会帮你搭好这一对，区别只在于 URL 里写的是什么：
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li>
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              urlIndexKey(() =&gt; count)
            </code>{' '}
            按<strong>位置</strong>寻址（
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              ?photo=3
            </code>
            ）。最简单，但列表一旦重新排序，书签打开的就是另一条了。
          </li>
          <li>
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              urlStableIdKey({'{ items }'})
            </code>{' '}
            按每个条目稳定的{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              id
            </code>{' '}
            寻址（
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              ?photo=post_42
            </code>
            ），扫描当前列表 ——
            重新排序后书签指向的仍是那条内容，条目没了就干净地失效。{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              hashCodec: base64UrlCodec
            </code>{' '}
            会把 id 做 base64url 混淆（可逆，不是加密哈希）。
          </li>
        </ul>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>要给窗口式信息流翻页？</strong>两个内置 key 都接受可选的{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locateAsync
          </code>
          ——{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlIndexKey(() =&gt; count, locateAsync)
          </code>{' '}
          和{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlStableIdKey({'{ items, locateAsync }'})
          </code>
          。同步查找负责已加载的部分；未命中时继续把剩下的翻进来，
          于是指向窗口之外的分享链接照样能打开 ——
          不需要你自己手写编解码器或定位器。
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          需要两个维度？{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlIndexTwoAxisKey
          </code>{' '}
          会携带{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ?p=&lt;outer&gt;.&lt;inner&gt;
          </code>
          ，同时表示一条帖子和它内部的媒体索引。完整选项见{' '}
          <Link
            to="/zh/docs/core/api#url-state"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            核心 API 参考
          </Link>
          。
        </p>
      </section>

      <NextSteps
        items={[
          {
            label: '核心 API 参考',
            path: '/docs/core/api',
            description: '全部可用配置项',
          },
          {
            label: '框架指南',
            path: {
              react: '/docs/react/guide',
              angular: '/docs/angular/guide',
              vue: '/docs/vue/guide',
            },
            description: '组件、演示与集成方式',
          },
          {
            label: 'Reel Player',
            path: {
              react: '/docs/reel-player',
              angular: '/docs/angular-reel-player',
              vue: '/docs/vue-reel-player',
            },
            description: 'TikTok / Reels 风格的视频播放器',
          },
          {
            label: 'Lightbox',
            path: {
              react: '/docs/lightbox',
              angular: '/docs/angular-lightbox',
              vue: '/docs/vue-lightbox',
            },
            description: '图片与视频画廊',
          },
          {
            label: 'Stories Player',
            path: {
              react: '/docs/stories-player',
              angular: '/docs/angular-stories-player',
              vue: '/docs/vue-stories-player',
            },
            description: 'Instagram 风格的 Stories 浏览器',
          },
        ]}
      />
    </div>
  );
}
