import { Observe } from '@reelkit/react';
import { Callout } from '../../components/ui/Callout';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { NextSteps } from '../../components/NextSteps';
import {
  frameworkSignal,
  setFramework,
  renderFramework,
} from '../../data/frameworkSignal';
import {
  ReactIcon,
  AngularIcon,
  VueIcon,
} from '../../components/FrameworkSwitcher';

export default function GettingStarted() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Getting Started</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          reelkit is a <strong>single-item slider</strong> — one item visible at
          a time, like TikTok, Instagram Reels, or Stories. Perfect for vertical
          video feeds, fullscreen galleries, and swipeable content.
        </p>
      </div>

      <Callout type="warning" title="0.x.x — Unstable API" className="mb-12">
        <p>
          ReelKit is under active development. While in 0.x.x, APIs may change
          between minor versions without a deprecation period. Pin your version
          to avoid unexpected breakage.
        </p>
      </Callout>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Select Your Framework</h2>
        <Observe signals={[frameworkSignal]}>
          {() => (
            <div className="flex gap-3">
              <button
                onClick={() => setFramework('react')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  frameworkSignal.value === 'react'
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <ReactIcon className="w-5 h-5 text-sky-500" />
                React
              </button>
              <button
                onClick={() => setFramework('angular')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  frameworkSignal.value === 'angular'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <AngularIcon className="w-5 h-5 text-rose-500" />
                Angular
              </button>
              <button
                onClick={() => setFramework('vue')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  frameworkSignal.value === 'vue'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <VueIcon className="w-5 h-5 text-emerald-500" />
                Vue
              </button>
            </div>
          )}
        </Observe>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Try It Online</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Try it in the browser, no install required:
        </p>
        <Observe signals={[frameworkSignal]}>
          {() =>
            renderFramework({
              react: () => (
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://react-demo.reelkit.dev/?utm_source=docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
                  >
                    React Demo
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
                    React Starter
                  </a>
                </div>
              ),
              angular: () => (
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://angular-demo.reelkit.dev/?utm_source=docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
                  >
                    Angular Demo
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
                    Angular Starter
                  </a>
                </div>
              ),
              vue: () => (
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://vue-demo.reelkit.dev/?utm_source=docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
                  >
                    Vue Demo
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
                    Vue Starter
                  </a>
                </div>
              ),
            })
          }
        </Observe>
      </section>

      <Observe signals={[frameworkSignal]}>
        {() =>
          renderFramework({
            react: () => (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  Minimal vertical slider with React:
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
            ),
            angular: () => (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  Minimal vertical slider with Angular:
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
            ),
            vue: () => (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  Minimal vertical slider with Vue:
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
            ),
          })
        }
      </Observe>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Key Concepts</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Reel</h3>
            <p className="text-slate-600 dark:text-slate-400">
              The{' '}
              <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                Reel
              </code>{' '}
              component is the main container that manages slider state, handles
              touch gestures, keyboard navigation, and animations. It uses a
              render prop pattern via{' '}
              <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                itemBuilder
              </code>{' '}
              for rendering slides.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">itemBuilder</h3>
            <p className="text-slate-600 dark:text-slate-400">
              The{' '}
              <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                itemBuilder
              </code>{' '}
              prop is a function that receives the index and returns the content
              for each slide. This pattern enables virtualization — only visible
              items are rendered.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">ReelIndicator</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Optional component that displays Instagram-style progress
              indicators showing the current position in the slider.
            </p>
          </div>

          <Observe signals={[frameworkSignal]}>
            {() =>
              renderFramework({
                react: () => (
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
                ),
                angular: () => (
                  <CodeBlock
                    code={`<rk-reel [count]="items.length" [size]="[400, 600]">
  <ng-template rkReelItem let-index>
    <app-slide [data]="items[index]" />
  </ng-template>
  <rk-reel-indicator />
</rk-reel>`}
                    language="html"
                  />
                ),
                vue: () => (
                  <CodeBlock
                    code={`<Reel :count="items.length" :size="[400, 600]">
  <template #item="{ index }">
    <Slide :data="items[index]" />
  </template>
  <ReelIndicator />
</Reel>`}
                    language="vue-html"
                  />
                ),
              })
            }
          </Observe>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Navigation</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Built-in navigation methods:
        </p>

        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Touch/Swipe:</strong> Drag to navigate with momentum and
              snap
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Keyboard:</strong> Arrow keys (overlay components also
              handle Escape to close)
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Mouse Wheel:</strong> Enable with{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                enableWheel
              </code>{' '}
              prop
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Programmatic:</strong> Use{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                apiRef
              </code>{' '}
              for{' '}
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

        <Observe signals={[frameworkSignal]}>
          {() =>
            renderFramework({
              react: () => (
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
              ),
              angular: () => (
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
              ),
              vue: () => (
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
              ),
            })
          }
        </Observe>
      </section>

      <NextSteps
        items={[
          {
            label: 'Installation',
            path: '/docs/installation',
            description: 'all packages and setup options',
          },
          {
            label: 'Core Guide',
            path: '/docs/core/guide',
            description: 'framework-agnostic engine',
          },
          {
            label: 'Framework Guide',
            path: {
              react: '/docs/react/guide',
              angular: '/docs/angular/guide',
              vue: '/docs/vue/guide',
            },
            description: 'components, demos, and integration',
          },
          {
            label: 'Reel Player',
            path: {
              react: '/docs/reel-player',
              angular: '/docs/angular-reel-player',
              vue: '/docs/vue-reel-player',
            },
            description: 'TikTok/Reels-style video player',
          },
          {
            label: 'Lightbox',
            path: {
              react: '/docs/lightbox',
              angular: '/docs/angular-lightbox',
              vue: '/docs/vue-lightbox',
            },
            description: 'image & video gallery',
          },
          {
            label: 'Stories Player',
            path: {
              react: '/docs/stories-player',
              angular: '/docs/angular-stories-player',
              vue: '/docs/vue-stories-player',
            },
            description: 'Instagram-style stories viewer',
          },
        ]}
      />
    </div>
  );
}
