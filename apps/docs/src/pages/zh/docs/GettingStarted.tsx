import { Callout } from '../../../components/ui/Callout';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { NextSteps } from '../../../components/NextSteps';
import { setFramework } from '../../../data/frameworkSignal';
import {
  ReactIcon,
  AngularIcon,
  VueIcon,
} from '../../../components/FrameworkSwitcher';
import { Heading } from '../../../components/ui/Heading';
import { FrameworkBlocks } from '../../../components/ui/FrameworkVariant';
import { zhPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/getting-started',
    title: '快速开始 · ReelKit',
    description:
      '几分钟内跑通第一个 ReelKit 滑动器：安装、渲染 3 个虚拟化幻灯片、接上手势与键盘导航。',
  });

const _kFwButtonBase =
  'flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600';

// Headings carry the English slug as an explicit id — the slug generator is
// ascii-only, so a Chinese heading would produce an empty anchor.
export default function GettingStarted() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">快速开始</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          reelkit 是一个<strong>单条目滑动器</strong> ——
          同一时间只显示一个条目，就像 TikTok、Instagram Reels 或
          Stories。非常适合竖向视频流、全屏画廊和可滑动的内容。
        </p>
      </div>

      <Callout type="warning" title="0.x.x —— API 尚未稳定" className="mb-12">
        <p>
          ReelKit 正在活跃开发中。在 0.x.x 期间，API
          可能在次版本之间发生变化，且不保证有废弃过渡期。
          请锁定版本号，避免意外的破坏性变更。
        </p>
      </Callout>

      <section className="mb-12">
        <Heading
          level={2}
          id="select-your-framework"
          className="text-2xl font-bold mb-4"
        >
          选择你的框架
        </Heading>
        <div className="flex gap-3">
          <button
            data-fw-btn="react"
            onClick={() => setFramework('react')}
            className={_kFwButtonBase}
          >
            <ReactIcon className="w-5 h-5 text-sky-500" />
            React
          </button>
          <button
            data-fw-btn="angular"
            onClick={() => setFramework('angular')}
            className={_kFwButtonBase}
          >
            <AngularIcon className="w-5 h-5 text-rose-500" />
            Angular
          </button>
          <button
            data-fw-btn="vue"
            onClick={() => setFramework('vue')}
            className={_kFwButtonBase}
          >
            <VueIcon className="w-5 h-5 text-emerald-500" />
            Vue
          </button>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="try-it-online"
          className="text-2xl font-bold mb-4"
        >
          在线试用
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          直接在浏览器里试，无需安装：
        </p>
        <FrameworkBlocks
          react={
            <div className="flex flex-wrap gap-3">
              <a
                href="https://react-demo.reelkit.dev/?utm_source=docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
              >
                React 演示
              </a>
              <a
                href="https://stackblitz.com/github/KonstantinKai/reelkit-react-starter"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 28 28"
                  fill="currentColor"
                >
                  <path d="M12.747 16.273h-7.46L18.925 1.5l-3.671 10.227h7.46L9.075 26.5l3.672-10.227z" />
                </svg>
                React 脚手架
              </a>
            </div>
          }
          angular={
            <div className="flex flex-wrap gap-3">
              <a
                href="https://angular-demo.reelkit.dev/?utm_source=docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
              >
                Angular 演示
              </a>
              <a
                href="https://stackblitz.com/github/KonstantinKai/reelkit-angular-starter"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 28 28"
                  fill="currentColor"
                >
                  <path d="M12.747 16.273h-7.46L18.925 1.5l-3.671 10.227h7.46L9.075 26.5l3.672-10.227z" />
                </svg>
                Angular 脚手架
              </a>
            </div>
          }
          vue={
            <div className="flex flex-wrap gap-3">
              <a
                href="https://vue-demo.reelkit.dev/?utm_source=docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
              >
                Vue 演示
              </a>
              <a
                href="https://stackblitz.com/github/KonstantinKai/reelkit-vue-starter"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 28 28"
                  fill="currentColor"
                >
                  <path d="M12.747 16.273h-7.46L18.925 1.5l-3.671 10.227h7.46L9.075 26.5l3.672-10.227z" />
                </svg>
                Vue 脚手架
              </a>
            </div>
          }
        />
      </section>

      <FrameworkBlocks
        react={
          <section className="mb-12">
            <Heading
              level={2}
              id="quick-start"
              className="text-2xl font-bold mb-4"
            >
              快速上手
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              用 React 写一个最小的竖向滑动器：
            </p>
            <CodeBlock
              code={`import { Reel, ReelIndicator } from '@reelkit/react';

const items = [
  { id: 1, title: 'Slide 1', color: '#6366f1' },
  { id: 2, title: 'Slide 2', color: '#8b5cf6' },
  { id: 3, title: 'Slide 3', color: '#ec4899' },
];

function App() {
  return (
    <Reel
      count={items.length}
      size={[400, 600]}
      direction="vertical"
      enableWheel
      itemBuilder={(index) => (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: items[index].color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: 'white',
          }}
        >
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
          </section>
        }
        angular={
          <section className="mb-12">
            <Heading
              level={2}
              id="quick-start"
              className="text-2xl font-bold mb-4"
            >
              快速上手
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              用 Angular 写一个最小的竖向滑动器：
            </p>
            <CodeBlock
              code={`import { Component } from '@angular/core';
import {
  ReelComponent,
  ReelIndicatorComponent,
  RkReelItemDirective,
} from '@reelkit/angular';

const items = [
  { id: 1, title: 'Slide 1', color: '#6366f1' },
  { id: 2, title: 'Slide 2', color: '#8b5cf6' },
  { id: 3, title: 'Slide 3', color: '#ec4899' },
];

@Component({
  standalone: true,
  imports: [ReelComponent, ReelIndicatorComponent, RkReelItemDirective],
  template: \`
    <rk-reel [count]="items.length" [size]="[400, 600]"
             direction="vertical" [enableWheel]="true">
      <ng-template rkReelItem let-i let-size="size">
        <div [style.width.px]="size[0]" [style.height.px]="size[1]"
             [style.background]="items[i].color"
             style="display:flex;align-items:center;justify-content:center;
                    font-size:2rem;color:#fff">
          {{ items[i].title }}
        </div>
      </ng-template>
      <rk-reel-indicator />
    </rk-reel>
  \`,
})
export class AppComponent {
  readonly items = items;
}`}
              language="typescript"
            />
          </section>
        }
        vue={
          <section className="mb-12">
            <Heading
              level={2}
              id="quick-start"
              className="text-2xl font-bold mb-4"
            >
              快速上手
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              用 Vue 写一个最小的竖向滑动器：
            </p>
            <CodeBlock
              code={`<script setup lang="ts">
import { Reel, ReelIndicator } from '@reelkit/vue';

const items = [
  { id: 1, title: 'Slide 1', color: '#6366f1' },
  { id: 2, title: 'Slide 2', color: '#8b5cf6' },
  { id: 3, title: 'Slide 3', color: '#ec4899' },
];
</script>

<template>
  <Reel
    :count="items.length"
    :size="[400, 600]"
    direction="vertical"
    enable-wheel
  >
    <template #item="{ index, size }">
      <div
        :style="{
          width: size[0] + 'px',
          height: size[1] + 'px',
          background: items[index].color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          color: '#fff',
        }"
      >
        {{ items[index].title }}
      </div>
    </template>

    <ReelIndicator />
  </Reel>
</template>`}
              language="vue"
            />
          </section>
        }
      />

      <section className="mb-12">
        <Heading
          level={2}
          id="key-concepts"
          className="text-2xl font-bold mb-4"
        >
          核心概念
        </Heading>

        <div className="space-y-6">
          <div>
            <Heading level={3} id="reel" className="text-lg font-semibold mb-2">
              Reel
            </Heading>
            <p className="text-slate-600 dark:text-slate-400">
              <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                Reel
              </code>{' '}
              组件是主容器，负责管理滑动器状态、处理触摸手势、键盘导航和动画。
              它通过{' '}
              <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                itemBuilder
              </code>{' '}
              这一 render prop 模式来渲染幻灯片。
            </p>
          </div>

          <div>
            <Heading
              level={3}
              id="itembuilder"
              className="text-lg font-semibold mb-2"
            >
              itemBuilder
            </Heading>
            <p className="text-slate-600 dark:text-slate-400">
              <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                itemBuilder
              </code>{' '}
              属性是一个函数，接收索引并返回该幻灯片的内容。
              正是这个模式让虚拟化成为可能 —— 只有可见的条目会被渲染。
            </p>
          </div>

          <div>
            <Heading
              level={3}
              id="reelindicator"
              className="text-lg font-semibold mb-2"
            >
              ReelIndicator
            </Heading>
            <p className="text-slate-600 dark:text-slate-400">
              可选组件，显示 Instagram
              风格的进度指示器，标出当前在滑动器中的位置。
            </p>
          </div>

          <FrameworkBlocks
            react={
              <CodeBlock
                code={`import { Reel, ReelIndicator } from '@reelkit/react';

function App() {
  return (
    <Reel
      count={items.length}
      size={[400, 600]}
      itemBuilder={(index) => <Slide data={items[index]} />}
    >
      <ReelIndicator />
    </Reel>
  );
}`}
                language="tsx"
              />
            }
            angular={
              <CodeBlock
                code={`<rk-reel [count]="items.length" [size]="[400, 600]">
  <ng-template rkReelItem let-index>
    <app-slide [data]="items[index]" />
  </ng-template>
  <rk-reel-indicator />
</rk-reel>`}
                language="html"
              />
            }
            vue={
              <CodeBlock
                code={`<Reel :count="items.length" :size="[400, 600]">
  <template #item="{ index }">
    <Slide :data="items[index]" />
  </template>
  <ReelIndicator />
</Reel>`}
                language="vue-html"
              />
            }
          />
        </div>
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
              <strong>触摸 / 滑动：</strong>拖动即可翻页，带惯性和吸附
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>键盘：</strong>方向键（浮层组件还会处理 Escape 关闭）
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>鼠标滚轮：</strong>用{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                enableWheel
              </code>{' '}
              属性开启
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>编程式：</strong>通过{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                apiRef
              </code>{' '}
              调用{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                next()
              </code>
              、{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                prev()
              </code>
              、{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                goTo()
              </code>
            </span>
          </li>
        </ul>

        <FrameworkBlocks
          react={
            <CodeBlock
              code={`import { useRef } from 'react';
import { Reel, type ReelApi } from '@reelkit/react';

function App() {
  const apiRef = useRef<ReelApi>(null);

  return (
    <>
      <Reel
        count={10}
        size={[400, 600]}
        apiRef={apiRef}
        itemBuilder={(index) => <Slide index={index} />}
      />
      <button onClick={() => apiRef.current?.prev()}>Prev</button>
      <button onClick={() => apiRef.current?.next()}>Next</button>
      <button onClick={() => apiRef.current?.goTo(5)}>Go to 5</button>
    </>
  );
}`}
              language="tsx"
            />
          }
          angular={
            <CodeBlock
              code={`<rk-reel
  [count]="10"
  [size]="[400, 600]"
  (apiReady)="reelApi = $event"
>
  <ng-template rkReelItem let-index>
    <app-slide [index]="index" />
  </ng-template>
</rk-reel>

<button (click)="reelApi?.prev()">Prev</button>
<button (click)="reelApi?.next()">Next</button>
<button (click)="reelApi?.goTo(5)">Go to 5</button>`}
              language="html"
            />
          }
          vue={
            <CodeBlock
              code={`<script setup lang="ts">
import { ref } from 'vue';
import { Reel, type ReelExpose } from '@reelkit/vue';

const reelRef = ref<InstanceType<typeof Reel> & ReelExpose>();
</script>

<template>
  <Reel ref="reelRef" :count="10" :size="[400, 600]">
    <template #item="{ index }">
      <Slide :index="index" />
    </template>
  </Reel>

  <button @click="reelRef?.prev()">Prev</button>
  <button @click="reelRef?.next()">Next</button>
  <button @click="reelRef?.goTo(5)">Go to 5</button>
</template>`}
              language="vue"
            />
          }
        />
      </section>

      <NextSteps
        items={[
          {
            label: '安装',
            path: '/docs/installation',
            description: '所有包与安装选项',
          },
          {
            label: '核心指南',
            path: '/docs/core/guide',
            description: '与框架无关的引擎',
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
