import { CodeBlock } from '../../components/ui/CodeBlock';
import { Callout } from '../../components/ui/Callout';

export default function SSR() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Server-Side Rendering</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          reelkit is SSR-compatible out of the box. All components can be safely
          imported and rendered on the server with frameworks like Next.js,
          Remix, or any React SSR setup.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The core slider controller is pure logic — no DOM access at
          construction time. All browser APIs (gesture listeners, keyboard
          events, animations) are deferred to{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useEffect
          </code>
          , which only runs on the client.
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
                <td className="px-4 py-3 font-mono text-sm">@reelkit/core</td>
                <td className="px-4 py-3 text-green-600 dark:text-green-400">
                  Yes
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  Pure logic, no browser APIs at import or construction
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">@reelkit/react</td>
                <td className="px-4 py-3 text-green-600 dark:text-green-400">
                  Yes
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  Reel and ReelIndicator render valid HTML on the server
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">
                  @reelkit/react-reel-player
                </td>
                <td className="px-4 py-3 text-green-600 dark:text-green-400">
                  Yes
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  Renders nothing when closed (
                  <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                    isOpen=false
                  </code>
                  )
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-sm">
                  @reelkit/react-lightbox
                </td>
                <td className="px-4 py-3 text-green-600 dark:text-green-400">
                  Yes
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  Renders nothing when closed (
                  <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                    isOpen=false
                  </code>
                  )
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Next.js App Router</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Since reelkit relies on browser events and refs, it needs to run as a
          Client Component. Add the{' '}
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
      <ReelIndicator count={items.length} />
    </Reel>
  );
}`}
          language="typescript"
        />

        <p className="text-slate-600 dark:text-slate-400 mt-6 mb-4">
          Server Components can still compose with Reel — fetch data on the
          server and pass it down to the Client Component:
        </p>
        <CodeBlock
          code={`// app/feed/page.tsx (Server Component)
import { Feed } from './Feed';

export default async function FeedPage() {
  const items = await fetchFeedItems();

  return <Feed items={items} />;
}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Next.js Pages Router</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          With the Pages Router, reelkit works without any additional
          configuration. The component renders during SSR and hydrates on the
          client:
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
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Responsive Size with SSR</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The simplest approach is to omit the{' '}
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
          on the client. During SSR the slider renders an empty container; on
          hydration it measures and renders slides immediately:
        </p>
        <CodeBlock
          code={`'use client';

import { Reel } from '@reelkit/react';

export function FullScreenFeed({ items }: { items: FeedItem[] }) {
  return (
    <Reel
      count={items.length}
      style={{ width: '100%', height: '100vh' }}
      itemBuilder={(index) => <Slide data={items[index]} />}
    />
  );
}`}
          language="typescript"
        />
        <div className="mt-4">
          <Callout type="info" title="How auto-size works">
            <p>
              When{' '}
              <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs font-mono">
                size
              </code>{' '}
              is omitted, the container must be sized by CSS (parent flex/grid,
              explicit width/height, or percentages). The slider renders nothing
              until the first measurement completes, then fills the measured
              dimensions and responds to subsequent resizes automatically.
            </p>
          </Callout>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">
          Explicit size (manual approach)
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          If you need pixel-level control, pass an explicit{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            size
          </code>{' '}
          prop. Since{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            window.innerWidth
          </code>{' '}
          is not available during SSR, provide a default and update on mount:
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
          language="typescript"
        />
        <div className="mt-4">
          <Callout type="info" title="Tip">
            <p>
              Choose a default size that matches your most common viewport (e.g.
              mobile-first). The slider will re-adjust instantly on hydration if
              the actual viewport differs.
            </p>
          </Callout>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Overlay Components</h2>
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
          , so they are SSR-safe by default. They only mount their portal when
          opened (typically from a user interaction on the client):
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
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Using Core Directly</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          If you use{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/core
          </code>{' '}
          directly (e.g., for a custom framework integration), the controller
          can be safely created on the server. Just make sure to only call{' '}
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
        <h2 className="text-2xl font-bold mb-4">Summary</h2>
        <div className="space-y-4">
          <Callout type="success" title="What works out of the box">
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Importing any reelkit package on the server</li>
              <li>
                Rendering{' '}
                <code className="px-1 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs font-mono">
                  Reel
                </code>{' '}
                and{' '}
                <code className="px-1 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs font-mono">
                  ReelIndicator
                </code>{' '}
                during SSR (produces valid static HTML)
              </li>
              <li>Creating controllers on the server</li>
              <li>
                Overlay components (
                <code className="px-1 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs font-mono">
                  LightboxOverlay
                </code>
                ,{' '}
                <code className="px-1 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs font-mono">
                  ReelPlayerOverlay
                </code>
                ) when{' '}
                <code className="px-1 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs font-mono">
                  isOpen=false
                </code>
              </li>
            </ul>
          </Callout>
          <Callout type="warning" title="What to keep in mind">
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>
                Use{' '}
                <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded text-xs font-mono">
                  "use client"
                </code>{' '}
                directive in Next.js App Router
              </li>
              <li>
                Omit{' '}
                <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded text-xs font-mono">
                  size
                </code>{' '}
                for auto-measurement, or provide a default{' '}
                <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded text-xs font-mono">
                  size
                </code>{' '}
                when using viewport-based dimensions
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
