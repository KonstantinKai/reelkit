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
    path: '/docs/vue/guide',
    title: 'Vue 指南 · ReelKit',
    description:
      '在 Vue 3 中使用 ReelKit：Reel 组件、#item 插槽模式、命令式 API、循环模式与事件回调。',
  });

// Headings carry the English slug as an explicit id — the slug generator
// is ascii-only, so a Chinese heading would produce an empty anchor.

export default function VueGuide() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Vue 指南</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          学习如何用{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue
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
                desc: '通过模板 ref 调用 next()、prev()、goTo()',
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
                label: '组合式 API',
                desc: '<script setup> 搭配组合式函数',
              },
            ]}
          />
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="basic-slider"
          className="text-2xl font-bold mb-4"
        >
          基础滑动器
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'<Reel>'}
          </code>{' '}
          组件包装了核心的滑动控制器。用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #item
          </code>{' '}
          插槽渲染每张幻灯片，并自动虚拟化 —— 只有可见的幻灯片会被挂载。
        </p>
        <Sandbox
          code={`<script setup lang="ts">
import { Reel, ReelIndicator } from '@reelkit/vue';

const items = [
  { title: 'Virtualized', subtitle: 'Only 3 slides in DOM', color: '#6366f1' },
  { title: 'Touch First', subtitle: 'Native swipe gestures', color: '#8b5cf6' },
  { title: 'Zero Deps', subtitle: 'Tiny bundle size', color: '#7c3aed' },
  { title: 'Keyboard Nav', subtitle: 'Full a11y support', color: '#ec4899' },
  { title: 'SSR Ready', subtitle: 'Works everywhere', color: '#14b8a6' },
  { title: '60fps', subtitle: 'Smooth animations', color: '#f59e0b' },
];

const onAfterChange = (index: number) => {
  console.log('Current index:', index);
};
</script>

<template>
  <Reel
    :count="items.length"
    style="width: 100%; height: 100dvh"
    direction="vertical"
    :enable-wheel="true"
    @after-change="onAfterChange"
  >
    <template #item="{ index, size }">
      <div
        :style="{
          width: size[0] + 'px',
          height: size[1] + 'px',
          background: items[index].color,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }"
      >
        <div style="font-size: 1.5rem; font-weight: bold">
          {{ items[index].title }}
        </div>
        <div style="font-size: 0.875rem; opacity: 0.8">
          {{ items[index].subtitle }}
        </div>
      </div>
    </template>

    <div style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); z-index: 10">
      <ReelIndicator direction="vertical" />
    </div>
  </Reel>
</template>`}
          language="vue"
          title="App.vue"
          framework="vue"
          stackblitzDeps={['@reelkit/vue']}
        />
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
            {'<Reel>'}
          </code>
          内部时，它会通过上下文自动连接到父级的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            count
          </code>{' '}
          和{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            active
          </code>{' '}
          值，走的是 Vue 的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            provide/inject
          </code>{' '}
          —— 不需要手动接线。
        </p>
        <CodeBlock
          code={`<!-- Auto-connect: count and active are inherited from parent Reel -->
<Reel :count="10" :size="[400, 600]">
  <template #item="{ index, size }"> ... </template>
  <ReelIndicator direction="vertical" />
</Reel>

<!-- Manual usage: pass count and active explicitly (e.g. outside a Reel) -->
<ReelIndicator :count="10" :active="currentIndex" />`}
          language="vue-html"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="imperative-api-template-ref"
          className="text-2xl font-bold mb-4"
        >
          命令式 API —— 模板引用
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'<Reel>'}
          </code>{' '}
          组件通过模板 ref 暴露{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelExpose
          </code>{' '}
          接口。用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ref()
          </code>{' '}
          保存引用，即可调用命令式方法，比如{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            next()
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            prev()
          </code>
          、{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            goTo()
          </code>
          .
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { ref } from 'vue';
import { Reel, type ReelExpose } from '@reelkit/vue';

const items = [
  { title: 'Slide 1', color: '#6366f1' },
  { title: 'Slide 2', color: '#8b5cf6' },
  { title: 'Slide 3', color: '#ec4899' },
];

const sliderRef = ref<ReelExpose | null>(null);
const currentIndex = ref(0);

const onAfterChange = (index: number) => {
  currentIndex.value = index;
};
</script>

<template>
  <Reel
    ref="sliderRef"
    :count="items.length"
    style="width: 100%; height: 100dvh"
    direction="vertical"
    :enable-wheel="true"
    @after-change="onAfterChange"
  >
    <template #item="{ index, size }">
      <div
        :style="{
          width: size[0] + 'px',
          height: size[1] + 'px',
        }"
      >
        {{ items[index].title }}
      </div>
    </template>
  </Reel>

  <div style="position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%)">
    <button
      :disabled="currentIndex === 0"
      @click="sliderRef?.prev()"
    >
      Prev
    </button>
    <button
      :disabled="currentIndex === items.length - 1"
      @click="sliderRef?.next()"
    >
      Next
    </button>
    <button @click="sliderRef?.goTo(2)">Go to 3</button>
  </div>
</template>`}
          language="vue"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="horizontal-direction"
          className="text-2xl font-bold mb-4"
        >
          横向方向
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          把{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            direction="horizontal"
          </code>{' '}
          即可做成左右滑动的滑动器。指示器的方向也要一致。
        </p>
        <CodeBlock
          code={`<Reel
  :count="items.length"
  :size="[400, 300]"
  direction="horizontal"
>
  <template #item="{ index, size }">
    <div :style="{ width: size[0] + 'px', height: size[1] + 'px' }">
      {{ items[index].title }}
    </div>
  </template>

  <ReelIndicator direction="horizontal" />
</Reel>`}
          language="vue-html"
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
          属性是可选的。省略时，{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<Reel>'}
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
<Reel :count="items.length" :size="[400, 600]">
  <template #item="{ index, size }"> ... </template>
</Reel>

<!-- Auto-size (responsive — sized by CSS) -->
<Reel :count="items.length" style="width: 100%; height: 100dvh">
  <template #item="{ index, size }"> ... </template>
</Reel>`}
          language="vue-html"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="transitions" className="text-2xl font-bold mb-4">
          过渡动画
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          传入{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            transition
          </code>{' '}
          属性即可自定义幻灯片动画。ReelKit 提供五种可被 tree-shaking 的过渡：{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            slideTransition
          </code>{' '}
          （默认）、{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            fadeTransition
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            flipTransition
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            cubeTransition
          </code>
          、{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            zoomTransition
          </code>
          .
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { Reel, cubeTransition } from '@reelkit/vue';
</script>

<template>
  <Reel
    :count="items.length"
    :size="[400, 600]"
    :transition="cubeTransition"
  >
    <template #item="{ index, size }"> ... </template>
  </Reel>
</template>`}
          language="vue"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="loop-mode" className="text-2xl font-bold mb-4">
          循环模式
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          用{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            loop
          </code>{' '}
          属性开启无限循环导航。滑动器会从最后一张无缝回到第一张（反之亦然）。
        </p>
        <CodeBlock
          code={`<Reel
  :count="items.length"
  :size="[400, 600]"
  :loop="true"
>
  <template #item="{ index, size }"> ... </template>
</Reel>`}
          language="vue-html"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="event-callbacks"
          className="text-2xl font-bold mb-4"
        >
          事件回调
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'<Reel>'}
          </code>{' '}
          组件会发出若干事件，用于跟踪滑动器状态：
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { Reel } from '@reelkit/vue';

const onBeforeChange = (index: number, nextIndex: number, rangeIndex: number) => {
  console.log('Transitioning from', index, 'to', nextIndex);
};

const onAfterChange = (index: number, rangeIndex: number) => {
  console.log('Arrived at slide', index);
};

const onSlideDragStart = (index: number) => {
  console.log('Started dragging slide', index);
};

const onSlideDragEnd = (index: number) => {
  console.log('Stopped dragging slide', index);
};
</script>

<template>
  <Reel
    :count="20"
    style="width: 100%; height: 100dvh"
    @before-change="onBeforeChange"
    @after-change="onAfterChange"
    @slide-drag-start="onSlideDragStart"
    @slide-drag-end="onSlideDragEnd"
  >
    <template #item="{ index, size }"> ... </template>
  </Reel>
</template>`}
          language="vue"
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
                :enable-wheel="true"
              </code>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>编程式：</strong> 用模板 ref 访问{' '}
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
          code={`<script setup lang="ts">
import { ref } from 'vue';
import { Reel, type ReelExpose } from '@reelkit/vue';

const sliderRef = ref<ReelExpose | null>(null);
</script>

<template>
  <Reel
    ref="sliderRef"
    :count="10"
    :size="[400, 600]"
  >
    <template #item="{ index, size }">
      <div :style="{ width: size[0] + 'px', height: size[1] + 'px' }">
        Slide {{ index + 1 }}
      </div>
    </template>
  </Reel>

  <button @click="sliderRef?.prev()">Prev</button>
  <button @click="sliderRef?.next()">Next</button>
  <button @click="sliderRef?.goTo(5)">Go to 6</button>
</template>`}
          language="vue"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          URL 状态
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            useOverlayUrlState
          </code>{' '}
          为浮层构建一个 URL 状态控制器并整个返回，你再把它作为{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<LightboxUrlOverlay>'}
          </code>{' '}
          的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            :controller
          </code>{' '}
          属性。打开状态归地址栏所有，因此绑定后的浮层会自己打开，链接就是通常的打开方式。参数原本不存在时第一次写入压入一条历史记录，之后每次写入都是替换，所以翻页永远不会把返回键埋掉。留着控制器就能读取{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            value
          </code>
          /
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            position
          </code>{' '}
          ，也能用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            set(null)
          </code>
          编程式关闭 —— 这正是浮层内部在切换幻灯片时使用的底层写入。
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { LightboxUrlOverlay, type LightboxItem } from '@reelkit/vue-lightbox';
import { useOverlayUrlState, urlIndexKey } from '@reelkit/vue';

const props = defineProps<{ images: LightboxItem[] }>();

const photo = useOverlayUrlState({
  param: 'photo',
  ...urlIndexKey(() => props.images.length),
});
</script>

<template>
  <!-- Opening is a link — the overlay reads the URL and opens itself. -->
  <RouterLink v-for="(img, i) in props.images" :key="img.src" :to="\`?photo=\${i}\`">
    <img :src="img.src" />
  </RouterLink>

  <LightboxUrlOverlay :controller="photo" :items="props.images" />
</template>`}
          language="vue"
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
          。{' '}
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
            ...urlIndexKey(() =&gt; props.images.length)
          </code>
          即可，它会一次性返回两半。{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            urlIndexKey
          </code>{' '}
          把参数映射成幻灯片索引，并以 getter
          返回的实时数量为上界，因此过期或越界的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ?photo=99
          </code>{' '}
          会被拒绝并自动从 URL 中消失，而不是打开一张从未指定的幻灯片。请传
          getter 而不是数字：Vue 的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            setup
          </code>{' '}
          只会执行一次，捕获下来的长度会随着分页信息流增长而过期。它包装了{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            createIndexLocator
          </code>{' '}
          (the locator half) and pairs it with{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            indexCodec
          </code>
          。分页信息流或按身份寻址的画廊则自行提供配套的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            codec
          </code>{' '}
          +{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            locator
          </code>{' '}
          。完整的选项表见{' '}
          <Link
            to="/zh/docs/vue/api#useoverlayurlstate"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Vue API 参考
          </Link>
          .
        </p>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="item-slot-pattern"
          className="text-2xl font-bold mb-4"
        >
          #item 插槽模式
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Vue 不用 React 的 render prop，而是用{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            #item
          </code>{' '}
          作用域插槽。它让虚拟化成为可能 ——
          只有可见的幻灯片会被挂载。插槽作用域提供三个属性：
        </p>
        <CodeBlock
          code={`<template #item="{ index, indexInRange, size }">
  <!--
    index        : number          — absolute slide index (0 to count-1)
    indexInRange  : number          — position in visible window (0, 1, or 2)
    size          : [number, number] — [width, height] of the container
  -->
  <MySlide
    :data="items[index]"
    :style="{ width: size[0] + 'px', height: size[1] + 'px' }"
  />
</template>`}
          language="vue-html"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="composables" className="text-2xl font-bold mb-4">
          组合式函数
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue
          </code>{' '}
          为常见的浮层场景提供了组合式函数：
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { ref } from 'vue';
import { useBodyLock, useFullscreen, useReelContext } from '@reelkit/vue';

// Lock body scroll when an overlay is open
const isOpen = ref(true);
useBodyLock(isOpen);

// Fullscreen API with cross-browser support
const containerRef = ref<HTMLElement | null>(null);
const { isFullscreen, toggle } = useFullscreen({ elementRef: containerRef });

// Access parent Reel context (when inside a Reel)
const reelContext = useReelContext();
// reelContext?.index  — active slide index signal
// reelContext?.count  — total slide count signal
// reelContext?.goTo() — navigate programmatically

// Bridge a core Subscribable into a reactive Vue ref
import { toVueRef } from '@reelkit/vue';
const index = toVueRef(reelContext!.index); // Ref<number> — re-renders on change
</script>`}
          language="vue"
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
                组合式 API
              </strong>
              <p className="text-sm">
                把{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  Reel
                </code>
                ,{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ReelIndicator
                </code>
                以及各种组合式函数直接引入你的{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  {'<script setup>'}
                </code>{' '}
                —— 不需要注册插件
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                #item 作用域插槽
              </strong>
              <p className="text-sm">
                Vue 里对应 React{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  itemBuilder
                </code>{' '}
                属性的写法 —— 用熟悉的模板语法实现虚拟化
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                模板 ref
              </strong>
              <p className="text-sm">
                使用{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  {'ref<ReelExpose>()'}
                </code>{' '}
                用于命令式导航 —— 不需要事件回调
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                @after-change
              </strong>
              <p className="text-sm">
                发出{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  (index, rangeIndex)
                </code>{' '}
                —— 跟踪当前索引以更新界面
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                provide/inject 上下文
              </strong>
              <p className="text-sm">
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ReelIndicator
                </code>{' '}
                会自动连接到父级{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  Reel
                </code>{' '}
                ，走 Vue 的 provide/inject —— 不必层层传属性
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
                  #item
                </code>{' '}
                插槽会为每张可见幻灯片执行（通常同时 3
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
                  @after-change
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
                命令式状态用 ref
              </strong>
              <p className="text-sm">
                把{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ReelExpose
                </code>{' '}
                引用和当前索引存在 Vue 的{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ref()
                </code>
                里，既能细粒度响应又不会产生多余的重渲染。
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
                  :enable-wheel="false"
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
            label: 'Vue API 参考',
            path: '/docs/vue/api',
            description: '全部属性、事件与组合式函数',
          },
          {
            label: '核心指南',
            path: '/docs/core/guide',
            description: '与框架无关的引擎',
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
        ]}
      />
    </div>
  );
}
