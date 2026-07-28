import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Callout } from '../../../components/ui/Callout';
import { FrameworkBlocks } from '../../../components/ui/FrameworkVariant';
import { Heading } from '../../../components/ui/Heading';
import { zhPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/ssr',
    title: '服务端渲染 · ReelKit',
    description:
      '在 Next.js、Nuxt 3 与 Angular Universal 中使用 ReelKit：水合、响应式尺寸与浮层组件的注意事项。',
  });

const _kCellMuted = 'px-4 py-3 text-slate-600 dark:text-slate-400';
const _kCellOk = 'px-4 py-3 text-green-600 dark:text-green-400';
const _kCellMono = 'px-4 py-3 font-mono text-sm';

function OverlayClosedNote() {
  return (
    <>
      关闭时（
      <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
        isOpen=false
      </code>
      ）什么都不渲染
    </>
  );
}

// Headings carry the English slug as an explicit id — the slug generator is
// ascii-only, so a Chinese heading would produce an empty anchor.
export default function SSR() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">服务端渲染</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          所有 reelkit 包都能在服务端运行。可以在 Next.js、Remix、Angular
          Universal 或任何服务端渲染方案里直接引入和渲染。
        </p>
      </div>

      <section className="mb-12">
        <Heading
          level={2}
          id="how-it-works"
          className="text-2xl font-bold mb-4"
        >
          工作原理
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          核心的滑动控制器是纯逻辑，构造时不碰 DOM。
          手势监听、键盘事件和动画只会在客户端的生命周期钩子里挂载。
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          服务端渲染时，{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            Reel
          </code>{' '}
          组件会渲染一个静态容器，里面是初始可见的幻灯片（通常是 3
          张：上一张、当前、下一张）。水合之后，它会挂上手势、键盘和滚轮控制器，
          让一切变得可交互。
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">包名</th>
                <th className="px-4 py-3 font-semibold">服务端安全</th>
                <th className="px-4 py-3 font-semibold">备注</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className={_kCellMono}>@reelkit/core</td>
                <td className={_kCellOk}>是</td>
                <td className={_kCellMuted}>
                  纯逻辑，导入和构造时都不使用浏览器 API
                </td>
              </tr>
              <tr data-rk-fw="react">
                <td className={_kCellMono}>@reelkit/react</td>
                <td className={_kCellOk}>是</td>
                <td className={_kCellMuted}>
                  Reel 和 ReelIndicator 在服务端渲染出合法的 HTML
                </td>
              </tr>
              <tr data-rk-fw="angular">
                <td className={_kCellMono}>@reelkit/angular</td>
                <td className={_kCellOk}>是</td>
                <td className={_kCellMuted}>
                  独立组件，兼容 Angular Universal 的服务端渲染
                </td>
              </tr>
              <tr data-rk-fw="vue">
                <td className={_kCellMono}>@reelkit/vue</td>
                <td className={_kCellOk}>是</td>
                <td className={_kCellMuted}>
                  组件与组合式函数，兼容 Nuxt 3 的服务端渲染
                </td>
              </tr>
              <tr data-rk-fw="react">
                <td className={_kCellMono}>@reelkit/react-reel-player</td>
                <td className={_kCellOk}>是</td>
                <td className={_kCellMuted}>
                  <OverlayClosedNote />
                </td>
              </tr>
              <tr data-rk-fw="react">
                <td className={_kCellMono}>@reelkit/react-lightbox</td>
                <td className={_kCellOk}>是</td>
                <td className={_kCellMuted}>
                  <OverlayClosedNote />
                </td>
              </tr>
              <tr data-rk-fw="angular">
                <td className={_kCellMono}>@reelkit/angular-reel-player</td>
                <td className={_kCellOk}>是</td>
                <td className={_kCellMuted}>
                  <OverlayClosedNote />
                </td>
              </tr>
              <tr data-rk-fw="angular">
                <td className={_kCellMono}>@reelkit/angular-lightbox</td>
                <td className={_kCellOk}>是</td>
                <td className={_kCellMuted}>
                  <OverlayClosedNote />
                </td>
              </tr>
              <tr>
                <td className={_kCellMono}>@reelkit/stories-core</td>
                <td className={_kCellOk}>是</td>
                <td className={_kCellMuted}>与框架无关，不访问 DOM</td>
              </tr>
              <tr data-rk-fw="react">
                <td className={_kCellMono}>@reelkit/react-stories-player</td>
                <td className={_kCellOk}>是</td>
                <td className={_kCellMuted}>
                  <OverlayClosedNote />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <FrameworkBlocks
        react={
          <>
            <section className="mb-12">
              <Heading
                level={2}
                id="next-js-app-router"
                className="text-2xl font-bold mb-4"
              >
                Next.js App Router
              </Heading>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Reel 会用到浏览器事件和 ref，所以它是客户端组件。请在使用{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  Reel
                </code>{' '}
                的文件顶部加上{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  "use client"
                </code>{' '}
                指令：
              </p>
              <CodeBlock
                code={`'use client';

import { Reel, ReelIndicator } from '@reelkit/react';

export function Feed({ items }: { items: FeedItem[] }) {
  return (
    <Reel
      count={items.length}
      size={[400, 700]}
      direction="vertical"
      enableWheel
      itemBuilder={(index) => (
        <div className="w-full h-full flex items-center justify-center">
          {items[index].title}
        </div>
      )}
    >
      <ReelIndicator />
    </Reel>
  );
}`}
                language="tsx"
              />

              <p className="text-slate-600 dark:text-slate-400 mt-6 mb-4">
                数据可以在服务端组件里取好，再传下去：
              </p>
              <CodeBlock
                code={`// app/feed/page.tsx (Server Component)
import { Feed } from './Feed';

export default async function FeedPage() {
  const items = await fetchFeedItems();

  return <Feed items={items} />;
}`}
                language="tsx"
              />
            </section>

            <section className="mb-12">
              <Heading
                level={2}
                id="next-js-pages-router"
                className="text-2xl font-bold mb-4"
              >
                Next.js Pages Router
              </Heading>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Pages Router
                不需要额外配置。组件会在服务端渲染，然后在客户端水合：
              </p>
              <CodeBlock
                code={`// pages/feed.tsx
import { Reel } from '@reelkit/react';
import type { GetServerSideProps } from 'next';

interface Props {
  items: FeedItem[];
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const items = await fetchFeedItems();
  return { props: { items } };
};

export default function FeedPage({ items }: Props) {
  return (
    <Reel
      count={items.length}
      size={[400, 700]}
      itemBuilder={(index) => <Slide data={items[index]} />}
    />
  );
}`}
                language="tsx"
              />
            </section>

            <section className="mb-12">
              <Heading
                level={2}
                id="responsive-size-with-ssr"
                className="text-2xl font-bold mb-4"
              >
                服务端渲染下的响应式尺寸
              </Heading>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                干脆不要传{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  size
                </code>{' '}
                属性。没有{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  size
                </code>{' '}
                时，Reel 会在客户端用{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  ResizeObserver
                </code>{' '}
                自动测量容器。服务端渲染阶段滑动器渲染成一个空容器；
                水合之后马上测量并渲染幻灯片：
              </p>
              <CodeBlock
                code={`'use client';

import { Reel } from '@reelkit/react';

export function FullScreenFeed({ items }: { items: FeedItem[] }) {
  return (
    <Reel
      count={items.length}
      style={{ width: '100%', height: '100dvh' }}
      itemBuilder={(index) => <Slide data={items[index]} />}
    />
  );
}`}
                language="tsx"
              />
              <div className="mt-4">
                <Callout type="info" title="自动测量是怎么工作的">
                  <p>
                    省略{' '}
                    <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs font-mono">
                      size
                    </code>{' '}
                    时，容器的尺寸必须由 CSS 决定（父级的 flex /
                    grid、显式的宽高，或者百分比）。
                    在第一次测量完成之前滑动器什么都不渲染，
                    之后会填满测到的尺寸，并自动响应后续的尺寸变化。
                  </p>
                </Callout>
              </div>

              <Heading
                level={3}
                id="explicit-size-manual-approach"
                className="text-xl font-bold mt-8 mb-4"
              >
                显式尺寸（手动方案）
              </Heading>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                想要像素级的控制，就显式传{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  size
                </code>{' '}
                属性。由于服务端渲染时拿不到{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  window.innerWidth
                </code>
                ，请给一个默认值，并在挂载后更新：
              </p>
              <CodeBlock
                code={`'use client';

import { useState, useEffect } from 'react';
import { Reel } from '@reelkit/react';

// Default size for SSR — matches common mobile viewport
const DEFAULT_SIZE: [number, number] = [390, 844];

export function FullScreenFeed({ items }: { items: FeedItem[] }) {
  const [size, setSize] = useState<[number, number]>(DEFAULT_SIZE);

  useEffect(() => {
    const update = () =>
      setSize([window.innerWidth, window.innerHeight]);

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <Reel
      count={items.length}
      size={size}
      itemBuilder={(index) => <Slide data={items[index]} />}
    />
  );
}`}
                language="tsx"
              />
              <div className="mt-4">
                <Callout type="info" title="小提示">
                  <p>
                    默认尺寸尽量选你最常见的视口（比如移动端优先）。
                    如果实际视口不一样，滑动器会在水合时立刻重新调整。
                  </p>
                </Callout>
              </div>
            </section>

            <section className="mb-12">
              <Heading
                level={2}
                id="overlay-components"
                className="text-2xl font-bold mb-4"
              >
                浮层组件
              </Heading>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  ReelPlayerOverlay
                </code>{' '}
                和{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  LightboxOverlay
                </code>{' '}
                在{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  isOpen={'{false}'}
                </code>{' '}
                时什么都不渲染，所以默认就是服务端安全的。
                只有被打开时（通常来自客户端的用户交互）才会挂载它们的 portal：
              </p>
              <CodeBlock
                code={`'use client';

import { useState } from 'react';
import { ReelPlayerOverlay } from '@reelkit/react-reel-player';

export function VideoFeed({ content }: { content: ContentItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {content.map((item, i) => (
          <button
            key={i}
            onClick={() => { setStartIndex(i); setIsOpen(true); }}
          >
            <img src={item.thumbnail} alt="" />
          </button>
        ))}
      </div>

      <ReelPlayerOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={content}
        initialIndex={startIndex}
      />
    </>
  );
}`}
                language="tsx"
              />
            </section>
          </>
        }
        angular={
          <section className="mb-12">
            <Heading
              level={2}
              id="angular-universal-ssr"
              className="text-2xl font-bold mb-4"
            >
              Angular Universal / 服务端渲染
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              所有 Angular 组件都是服务端安全的。滑动控制器把浏览器 API
              的访问推迟到{' '}
              <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                afterRenderEffect
              </code>{' '}
              里。浮层组件在{' '}
              <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                isOpen=false
              </code>{' '}
              时什么都不渲染，因此服务端渲染阶段不会产出任何标记。
            </p>
            <CodeBlock
              code={`import { Component, signal } from '@angular/core';
import {
  RkReelPlayerOverlayComponent,
} from '@reelkit/angular-reel-player';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [RkReelPlayerOverlayComponent],
  template: \`
    <rk-reel-player-overlay
      [isOpen]="isOpen()"
      [content]="content"
      (closed)="isOpen.set(false)"
    />
  \`,
})
export class FeedComponent {
  isOpen = signal(false);
  content = [/* ... */];
}`}
              language="typescript"
            />
          </section>
        }
        vue={
          <>
            <section className="mb-12">
              <Heading
                level={2}
                id="nuxt-3"
                className="text-2xl font-bold mb-4"
              >
                Nuxt 3
              </Heading>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                ReelKit 的 Vue 组件在 Nuxt 3 里开箱即用。由于 Reel 会用到浏览器
                API（触摸事件、ResizeObserver），请把它包在{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  {'<ClientOnly>'}
                </code>{' '}
                组件里，或者用{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  .client.vue
                </code>{' '}
                后缀：
              </p>
              <CodeBlock
                code={`<!-- pages/feed.vue -->
<script setup lang="ts">
const items = await useFetch('/api/feed');
</script>

<template>
  <ClientOnly>
    <Feed :items="items.data.value" />
  </ClientOnly>
</template>`}
                language="vue"
              />

              <p className="text-slate-600 dark:text-slate-400 mt-6 mb-4">
                Feed 组件里照常使用 Reel：
              </p>
              <CodeBlock
                code={`<!-- components/Feed.vue -->
<script setup lang="ts">
import { Reel, ReelIndicator } from '@reelkit/vue';

defineProps<{ items: FeedItem[] }>();
</script>

<template>
  <Reel :count="items.length" direction="vertical" enable-wheel>
    <template #item="{ index, size }">
      <div :style="{ width: size[0] + 'px', height: size[1] + 'px' }">
        {{ items[index].title }}
      </div>
    </template>
    <ReelIndicator />
  </Reel>
</template>`}
                language="vue"
              />
            </section>

            <section className="mb-12">
              <Heading
                level={2}
                id="responsive-size-with-ssr"
                className="text-2xl font-bold mb-4"
              >
                服务端渲染下的响应式尺寸
              </Heading>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                省略{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  size
                </code>{' '}
                属性即可启用自动测量。Reel 会自动撑满父级的
                100%。服务端渲染阶段它渲染一个空容器；水合之后测量并渲染幻灯片：
              </p>
              <CodeBlock
                code={`<template>
  <ClientOnly>
    <div style="width: 100%; height: 100dvh">
      <Reel :count="items.length">
        <template #item="{ index, size }">
          <Slide :data="items[index]" :size="size" />
        </template>
      </Reel>
    </div>
  </ClientOnly>
</template>`}
                language="vue"
              />
            </section>
          </>
        }
      />

      <section className="mb-12">
        <Heading
          level={2}
          id="using-core-directly"
          className="text-2xl font-bold mb-4"
        >
          直接使用核心包
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          如果你直接用{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/core
          </code>{' '}
          做自定义框架集成，控制器可以在服务端创建。{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            attach()
          </code>{' '}
          和{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            observe()
          </code>{' '}
          则只在客户端调用：
        </p>
        <CodeBlock
          code={`import { createSliderController } from '@reelkit/core';

// Safe to call on the server — no DOM access
const controller = createSliderController({
  count: 10,
  direction: 'vertical',
});

// Only call on the client — attaches DOM event listeners
if (typeof window !== 'undefined') {
  controller.attach(element);
  controller.observe();
}`}
          language="typescript"
        />
      </section>

      <section>
        <Heading level={2} id="summary" className="text-2xl font-bold mb-4">
          小结
        </Heading>
        <div className="space-y-4">
          <Callout type="success" title="开箱即用的部分">
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>在服务端导入任意 reelkit 包</li>
              <li>服务端渲染阶段渲染滑动器组件（产出合法的静态 HTML）</li>
              <li>在服务端创建控制器</li>
              <li>
                浮层组件在{' '}
                <code className="px-1 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs font-mono">
                  isOpen=false
                </code>{' '}
                时的表现
              </li>
            </ul>
          </Callout>
          <Callout type="warning" title="需要留意的地方">
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>
                省略{' '}
                <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded text-xs font-mono">
                  size
                </code>{' '}
                以启用自动测量；如果要用基于视口的尺寸，请给一个默认值
              </li>
              <li>
                直接使用核心包时，不要在服务端调用{' '}
                <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded text-xs font-mono">
                  attach()
                </code>
                /
                <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded text-xs font-mono">
                  observe()
                </code>
              </li>
            </ul>
          </Callout>
        </div>
      </section>
    </div>
  );
}
