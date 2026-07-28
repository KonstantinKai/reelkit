import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Callout } from '../../../components/ui/Callout';
import { FrameworkBlocks } from '../../../components/ui/FrameworkVariant';
import { Heading } from '../../../components/ui/Heading';
import { ukPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/ssr',
    title: 'Рендеринг на сервері · ReelKit',
    description:
      'ReelKit у Next.js, Nuxt 3 та Angular Universal: гідратація, реактивні розміри й нюанси оверлейних компонентів.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

const _kCellMuted = 'px-4 py-3 text-slate-600 dark:text-slate-400';
const _kCellOk = 'px-4 py-3 text-green-600 dark:text-green-400';
const _kCellMono = 'px-4 py-3 font-mono text-sm';

function OverlayClosedNote() {
  return (
    <>
      Нічого не рендерить, поки закритий (
      <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
        isOpen=false
      </code>
      )
    </>
  );
}

export default function SSR() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Рендеринг на сервері</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Усі пакети reelkit працюють на сервері. Імпортуйте й рендерте їх у
          Next.js, Remix, Angular Universal чи будь-якій іншій конфігурації із
          SSR.
        </p>
      </div>

      <section className="mb-12">
        <Heading
          level={2}
          id="how-it-works"
          className="text-2xl font-bold mb-4"
        >
          Як це працює
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Контролер слайдера в ядрі — чиста логіка, яка під час створення не
          звертається до DOM. Обробники жестів, події клавіатури та анімації
          підключаються лише в клієнтських етапах життєвого циклу.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Під час SSR компонент{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            Reel
          </code>{' '}
          рендерить статичний контейнер із початково видимими слайдами (зазвичай
          3: попередній, поточний, наступний). Під час гідратації він підключає
          контролери жестів, клавіатури та колеса миші, і все стає
          інтерактивним.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Пакет</th>
                <th className="px-4 py-3 font-semibold">Безпечний для SSR</th>
                <th className="px-4 py-3 font-semibold">Примітки</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className={_kCellMono}>@reelkit/core</td>
                <td className={_kCellOk}>Так</td>
                <td className={_kCellMuted}>
                  Чиста логіка, жодних браузерних API під час імпорту чи
                  створення
                </td>
              </tr>
              <tr data-rk-fw="react">
                <td className={_kCellMono}>@reelkit/react</td>
                <td className={_kCellOk}>Так</td>
                <td className={_kCellMuted}>
                  Reel і ReelIndicator рендерять коректний HTML на сервері
                </td>
              </tr>
              <tr data-rk-fw="angular">
                <td className={_kCellMono}>@reelkit/angular</td>
                <td className={_kCellOk}>Так</td>
                <td className={_kCellMuted}>
                  Автономні компоненти, сумісні з SSR в Angular Universal
                </td>
              </tr>
              <tr data-rk-fw="vue">
                <td className={_kCellMono}>@reelkit/vue</td>
                <td className={_kCellOk}>Так</td>
                <td className={_kCellMuted}>
                  Компоненти та композабли, сумісні з SSR у Nuxt 3
                </td>
              </tr>
              <tr data-rk-fw="react">
                <td className={_kCellMono}>@reelkit/react-reel-player</td>
                <td className={_kCellOk}>Так</td>
                <td className={_kCellMuted}>
                  <OverlayClosedNote />
                </td>
              </tr>
              <tr data-rk-fw="react">
                <td className={_kCellMono}>@reelkit/react-lightbox</td>
                <td className={_kCellOk}>Так</td>
                <td className={_kCellMuted}>
                  <OverlayClosedNote />
                </td>
              </tr>
              <tr data-rk-fw="angular">
                <td className={_kCellMono}>@reelkit/angular-reel-player</td>
                <td className={_kCellOk}>Так</td>
                <td className={_kCellMuted}>
                  <OverlayClosedNote />
                </td>
              </tr>
              <tr data-rk-fw="angular">
                <td className={_kCellMono}>@reelkit/angular-lightbox</td>
                <td className={_kCellOk}>Так</td>
                <td className={_kCellMuted}>
                  <OverlayClosedNote />
                </td>
              </tr>
              <tr>
                <td className={_kCellMono}>@reelkit/stories-core</td>
                <td className={_kCellOk}>Так</td>
                <td className={_kCellMuted}>
                  Без прив’язки до фреймворку, не звертається до DOM
                </td>
              </tr>
              <tr data-rk-fw="react">
                <td className={_kCellMono}>@reelkit/react-stories-player</td>
                <td className={_kCellOk}>Так</td>
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
                Reel використовує браузерні події та рефи, тож працює як Client
                Component. Додайте директиву{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  "use client"
                </code>{' '}
                на початку файлу, який використовує{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  Reel
                </code>
                :
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
                Дані можна завантажити в Server Component і передати вниз:
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
                Pages Router працює без додаткових налаштувань. Компонент
                рендериться під час SSR і гідратується на клієнті:
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
                Реактивний розмір із SSR
              </Heading>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Не передавайте пропс{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  size
                </code>{' '}
                взагалі. Якщо{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  size
                </code>{' '}
                не задано, Reel сам вимірює свій контейнер через{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  ResizeObserver
                </code>{' '}
                на клієнті. Під час SSR слайдер рендерить порожній контейнер; на
                гідратації він вимірює його й одразу рендерить слайди:
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
                <Callout type="info" title="How auto-size works">
                  <p>
                    Якщо{' '}
                    <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs font-mono">
                      size
                    </code>{' '}
                    не задано, розмір контейнера має задавати CSS (батьківський
                    flex або grid, явні width і height чи відсотки). Слайдер
                    нічого не рендерить до першого вимірювання, а потім заповнює
                    виміряні розміри й далі сам реагує на зміни.
                  </p>
                </Callout>
              </div>

              <Heading
                level={3}
                id="explicit-size-manual-approach"
                className="text-xl font-bold mt-8 mb-4"
              >
                Явний розмір (ручний спосіб)
              </Heading>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Для контролю до пікселя передайте явний{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  size
                </code>{' '}
                . Оскільки{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  window.innerWidth
                </code>{' '}
                недоступний під час SSR, задайте значення за замовчуванням і
                оновіть його після монтування:
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
                <Callout type="info" title="Tip">
                  <p>
                    Оберіть розмір за замовчуванням під найпоширенішу область
                    перегляду (наприклад, спершу мобільну). Якщо реальна область
                    перегляду інша, слайдер миттєво підлаштується на гідратації.
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
                Оверлейні компоненти
              </Heading>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  ReelPlayerOverlay
                </code>{' '}
                та{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  LightboxOverlay
                </code>{' '}
                нічого не рендерять, поки{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  isOpen={'{false}'}
                </code>
                , тож за замовчуванням безпечні для SSR. Свій портал вони
                монтують лише коли відкриваються — зазвичай після дії
                користувача на клієнті:
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
              Angular Universal / SSR
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Усі компоненти Angular безпечні для SSR. Контролер слайдера
              відкладає звернення до браузерних API до{' '}
              <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                afterRenderEffect
              </code>
              . Оверлейні компоненти нічого не рендерять, поки{' '}
              <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                isOpen=false
              </code>
              , тож під час рендерингу на сервері не дають жодної розмітки.
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
                Компоненти ReelKit для Vue працюють у Nuxt 3 без додаткових
                налаштувань. Оскільки Reel використовує браузерні API (події
                дотику, ResizeObserver), загорніть його в{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  {'<ClientOnly>'}
                </code>{' '}
                або дайте файлу суфікс{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  .client.vue
                </code>{' '}
                :
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
                Компонент Feed використовує Reel як завжди:
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
                Реактивний розмір із SSR
              </Heading>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Не передавайте пропс{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  size
                </code>{' '}
                , щоб увімкнути автоматичне вимірювання. Reel займає 100%
                розміру батька. Під час SSR він рендерить порожній контейнер; на
                гідратації вимірює його й рендерить слайди:
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
          Пряме використання ядра
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Якщо ви використовуєте{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/core
          </code>{' '}
          напряму для власної інтеграції з фреймворком, контролер можна створити
          на сервері. Викликайте{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            attach()
          </code>{' '}
          та{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            observe()
          </code>{' '}
          на клієнті:
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
          Підсумок
        </Heading>
        <div className="space-y-4">
          <Callout type="success" title="What works out of the box">
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Імпорт будь-якого пакета reelkit на сервері</li>
              <li>
                Рендеринг компонентів слайдера під час SSR (дає коректний
                статичний HTML)
              </li>
              <li>Створення контролерів на сервері</li>
              <li>
                Оверлейні компоненти, поки{' '}
                <code className="px-1 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs font-mono">
                  isOpen=false
                </code>
              </li>
            </ul>
          </Callout>
          <Callout type="warning" title="What to keep in mind">
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>
                Не передавайте{' '}
                <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded text-xs font-mono">
                  size
                </code>{' '}
                для автоматичного вимірювання або задайте значення за
                замовчуванням, якщо розміри залежать від області перегляду
              </li>
              <li>
                Не викликайте{' '}
                <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded text-xs font-mono">
                  attach()
                </code>
                /
                <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded text-xs font-mono">
                  observe()
                </code>{' '}
                на сервері, коли працюєте з ядром напряму
              </li>
            </ul>
          </Callout>
        </div>
      </section>
    </div>
  );
}
