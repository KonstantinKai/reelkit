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
import { ukPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/getting-started',
    title: 'Початок роботи · ReelKit',
    description:
      'Запустіть перший слайдер ReelKit за кілька хвилин: встановлення, три віртуалізовані слайди, жести та навігація з клавіатури.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

const _kFwButtonBase =
  'flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600';

export default function GettingStarted() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Початок роботи</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          reelkit — це <strong>слайдер по одному елементу</strong> — на екрані
          видно один елемент, як у TikTok, Instagram Reels чи Stories. Ідеально
          для вертикальних відеострічок, повноекранних галерей і вмісту, який
          гортають свайпом.
        </p>
      </div>

      <Callout type="warning" title="0.x.x — Unstable API" className="mb-12">
        <p>
          ReelKit активно розробляється. Поки версія 0.x.x, API може змінюватися
          між мінорними випусками без періоду застарівання. Фіксуйте версію, щоб
          нічого не зламалося несподівано.
        </p>
      </Callout>

      <section className="mb-12">
        <Heading
          level={2}
          id="select-your-framework"
          className="text-2xl font-bold mb-4"
        >
          Оберіть свій фреймворк
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
          Спробувати онлайн
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Спробуйте просто в браузері, без встановлення:
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
                Демо для React
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
                Стартовий проєкт для React
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
                Демо для Angular
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
                Стартовий проєкт для Angular
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
                Демо для Vue
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
                Стартовий проєкт для Vue
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
              Швидкий старт
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              Мінімальний вертикальний слайдер на React:
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
              Швидкий старт
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              Мінімальний вертикальний слайдер на Angular:
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
              Швидкий старт
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              Мінімальний вертикальний слайдер на Vue:
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
          Ключові поняття
        </Heading>

        <div className="space-y-6">
          <div>
            <Heading level={3} id="reel" className="text-lg font-semibold mb-2">
              Reel
            </Heading>
            <p className="text-slate-600 dark:text-slate-400">
              Компонент{' '}
              <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                Reel
              </code>{' '}
              — головний контейнер: він тримає стан слайдера, обробляє дотикові
              жести, навігацію з клавіатури та анімації. Для рендерингу слайдів
              використовує патерн render prop через{' '}
              <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                itemBuilder
              </code>{' '}
              .
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
              Пропс{' '}
              <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                itemBuilder
              </code>{' '}
              — функція, яка отримує індекс і повертає вміст слайда. Саме цей
              патерн дає віртуалізацію: рендеряться лише видимі елементи.
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
              Необов’язковий компонент, що показує індикатори прогресу в стилі
              Instagram із поточною позицією в слайдері.
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
          Навігація
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Вбудовані способи навігації:
        </p>

        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Дотик / свайп:</strong> Тягніть, щоб гортати — з інерцією
              та прилипанням
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Клавіатура:</strong> Стрілки (оверлейні компоненти ще
              обробляють Escape для закриття)
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Колесо миші:</strong> Увімкніть{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                enableWheel
              </code>{' '}
              у пропсах
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Програмно:</strong> Використовуйте{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                apiRef
              </code>{' '}
              для{' '}
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
            label: 'Встановлення',
            path: '/docs/installation',
            description: 'усі пакети та варіанти налаштування',
          },
          {
            label: 'Посібник з ядра',
            path: '/docs/core/guide',
            description: 'рушій без прив’язки до фреймворку',
          },
          {
            label: 'Посібник для фреймворку',
            path: {
              react: '/docs/react/guide',
              angular: '/docs/angular/guide',
              vue: '/docs/vue/guide',
            },
            description: 'компоненти, демо та інтеграція',
          },
          {
            label: 'Reel Player',
            path: {
              react: '/docs/reel-player',
              angular: '/docs/angular-reel-player',
              vue: '/docs/vue-reel-player',
            },
            description: 'відеоплеєр у стилі TikTok / Reels',
          },
          {
            label: 'Lightbox',
            path: {
              react: '/docs/lightbox',
              angular: '/docs/angular-lightbox',
              vue: '/docs/vue-lightbox',
            },
            description: 'галерея зображень і відео',
          },
          {
            label: 'Stories Player',
            path: {
              react: '/docs/stories-player',
              angular: '/docs/angular-stories-player',
              vue: '/docs/vue-stories-player',
            },
            description: 'переглядач історій у стилі Instagram',
          },
        ]}
      />
    </div>
  );
}
