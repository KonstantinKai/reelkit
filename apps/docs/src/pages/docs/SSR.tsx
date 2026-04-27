import { CodeBlock } from '../../components/ui/CodeBlock';
import { Callout } from '../../components/ui/Callout';
import { FrameworkBlocks } from '../../components/ui/FrameworkVariant';
import { Heading } from '../../components/ui/Heading';

const _kCellMuted = 'px-4 py-3 text-slate-600 dark:text-slate-400';
const _kCellOk = 'px-4 py-3 text-green-600 dark:text-green-400';
const _kCellMono = 'px-4 py-3 font-mono text-sm';

function OverlayClosedNote() {
  return (
    <>
      Renders nothing when closed (
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
        <h1 className="text-4xl font-bold mb-4">Server-Side Rendering</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          All reelkit packages work on the server. Import and render them with
          Next.js, Remix, Angular Universal, or any SSR setup.
        </p>
      </div>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          How It Works
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The core slider controller is pure logic with no DOM access at
          construction. Gesture listeners, keyboard events, and animations
          attach only in client-side lifecycle hooks.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          During SSR, the{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            Reel
          </code>{' '}
          component renders a static container with the initial visible slides
          (typically 3: previous, current, next). On hydration, it attaches
          gesture, keyboard, and wheel controllers to make everything
          interactive.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Package</th>
                <th className="px-4 py-3 font-semibold">SSR Safe</th>
                <th className="px-4 py-3 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className={_kCellMono}>@reelkit/core</td>
                <td className={_kCellOk}>Yes</td>
                <td className={_kCellMuted}>
                  Pure logic, no browser APIs at import or construction
                </td>
              </tr>
              <tr data-rk-fw="react">
                <td className={_kCellMono}>@reelkit/react</td>
                <td className={_kCellOk}>Yes</td>
                <td className={_kCellMuted}>
                  Reel and ReelIndicator render valid HTML on the server
                </td>
              </tr>
              <tr data-rk-fw="angular">
                <td className={_kCellMono}>@reelkit/angular</td>
                <td className={_kCellOk}>Yes</td>
                <td className={_kCellMuted}>
                  Standalone components, SSR compatible with Angular Universal
                </td>
              </tr>
              <tr data-rk-fw="vue">
                <td className={_kCellMono}>@reelkit/vue</td>
                <td className={_kCellOk}>Yes</td>
                <td className={_kCellMuted}>
                  Components and composables, SSR compatible with Nuxt 3
                </td>
              </tr>
              <tr data-rk-fw="react">
                <td className={_kCellMono}>@reelkit/react-reel-player</td>
                <td className={_kCellOk}>Yes</td>
                <td className={_kCellMuted}>
                  <OverlayClosedNote />
                </td>
              </tr>
              <tr data-rk-fw="react">
                <td className={_kCellMono}>@reelkit/react-lightbox</td>
                <td className={_kCellOk}>Yes</td>
                <td className={_kCellMuted}>
                  <OverlayClosedNote />
                </td>
              </tr>
              <tr data-rk-fw="angular">
                <td className={_kCellMono}>@reelkit/angular-reel-player</td>
                <td className={_kCellOk}>Yes</td>
                <td className={_kCellMuted}>
                  <OverlayClosedNote />
                </td>
              </tr>
              <tr data-rk-fw="angular">
                <td className={_kCellMono}>@reelkit/angular-lightbox</td>
                <td className={_kCellOk}>Yes</td>
                <td className={_kCellMuted}>
                  <OverlayClosedNote />
                </td>
              </tr>
              <tr>
                <td className={_kCellMono}>@reelkit/stories-core</td>
                <td className={_kCellOk}>Yes</td>
                <td className={_kCellMuted}>
                  Framework-agnostic, no DOM access
                </td>
              </tr>
              <tr data-rk-fw="react">
                <td className={_kCellMono}>@reelkit/react-stories-player</td>
                <td className={_kCellOk}>Yes</td>
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
              <Heading level={2} className="text-2xl font-bold mb-4">
                Next.js App Router
              </Heading>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Reel uses browser events and refs, so it runs as a Client
                Component. Add the{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  "use client"
                </code>{' '}
                directive at the top of the file that uses{' '}
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
                You can fetch data in a Server Component and pass it down:
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
              <Heading level={2} className="text-2xl font-bold mb-4">
                Next.js Pages Router
              </Heading>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Pages Router works without extra configuration. The component
                renders during SSR and hydrates on the client:
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
              <Heading level={2} className="text-2xl font-bold mb-4">
                Responsive Size with SSR
              </Heading>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Omit the{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  size
                </code>{' '}
                prop entirely. When{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  size
                </code>{' '}
                is not provided, Reel auto-measures its container via{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  ResizeObserver
                </code>{' '}
                on the client. During SSR the slider renders an empty container;
                on hydration it measures and renders slides immediately:
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
                    When{' '}
                    <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs font-mono">
                      size
                    </code>{' '}
                    is omitted, the container must be sized by CSS (parent
                    flex/grid, explicit width/height, or percentages). The
                    slider renders nothing until the first measurement
                    completes, then fills the measured dimensions and responds
                    to subsequent resizes automatically.
                  </p>
                </Callout>
              </div>

              <Heading level={3} className="text-xl font-bold mt-8 mb-4">
                Explicit size (manual approach)
              </Heading>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                For pixel-level control, pass an explicit{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  size
                </code>{' '}
                prop. Since{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  window.innerWidth
                </code>{' '}
                is not available during SSR, provide a default and update on
                mount:
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
                    Choose a default size that matches your most common viewport
                    (e.g. mobile-first). The slider will re-adjust instantly on
                    hydration if the actual viewport differs.
                  </p>
                </Callout>
              </div>
            </section>

            <section className="mb-12">
              <Heading level={2} className="text-2xl font-bold mb-4">
                Overlay Components
              </Heading>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  ReelPlayerOverlay
                </code>{' '}
                and{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  LightboxOverlay
                </code>{' '}
                render nothing when{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  isOpen={'{false}'}
                </code>
                , so they are SSR-safe by default. They only mount their portal
                when opened (typically from a user interaction on the client):
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
            <Heading level={2} className="text-2xl font-bold mb-4">
              Angular Universal / SSR
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              All Angular components are SSR-safe. The slider controller defers
              browser API access to{' '}
              <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                afterRenderEffect
              </code>
              . Overlay components render nothing when{' '}
              <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                isOpen=false
              </code>
              , so they produce no markup during server rendering.
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
              <Heading level={2} className="text-2xl font-bold mb-4">
                Nuxt 3
              </Heading>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                ReelKit Vue components work with Nuxt 3 out of the box. Since
                Reel uses browser APIs (touch events, ResizeObserver), wrap it
                in a{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  {'<ClientOnly>'}
                </code>{' '}
                component or use{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  .client.vue
                </code>{' '}
                suffix:
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
                The Feed component uses Reel normally:
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
              <Heading level={2} className="text-2xl font-bold mb-4">
                Responsive Size with SSR
              </Heading>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Omit the{' '}
                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  size
                </code>{' '}
                prop to use auto-measurement. The Reel auto-sizes to 100% of its
                parent. During SSR it renders an empty container; on hydration
                it measures and renders slides:
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
        <Heading level={2} className="text-2xl font-bold mb-4">
          Using Core Directly
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When using{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/core
          </code>{' '}
          directly for a custom framework integration, you can create the
          controller on the server. Call{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            attach()
          </code>{' '}
          and{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            observe()
          </code>{' '}
          on the client:
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
        <Heading level={2} className="text-2xl font-bold mb-4">
          Summary
        </Heading>
        <div className="space-y-4">
          <Callout type="success" title="What works out of the box">
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Importing any reelkit package on the server</li>
              <li>
                Rendering slider components during SSR (produces valid static
                HTML)
              </li>
              <li>Creating controllers on the server</li>
              <li>
                Overlay components when{' '}
                <code className="px-1 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs font-mono">
                  isOpen=false
                </code>
              </li>
            </ul>
          </Callout>
          <Callout type="warning" title="What to keep in mind">
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>
                Omit{' '}
                <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded text-xs font-mono">
                  size
                </code>{' '}
                for auto-measurement, or provide a default when using
                viewport-based dimensions
              </li>
              <li>
                Don't call{' '}
                <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded text-xs font-mono">
                  attach()
                </code>
                /
                <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded text-xs font-mono">
                  observe()
                </code>{' '}
                on the server when using core directly
              </li>
            </ul>
          </Callout>
        </div>
      </section>
    </div>
  );
}
