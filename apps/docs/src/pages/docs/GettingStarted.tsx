import { Link } from 'react-router-dom';
import { CodeBlock } from '../../components/ui/CodeBlock';

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

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Try It Online</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Jump straight into a working example — no local setup needed:
        </p>
        <a
          href="https://stackblitz.com/github/KonstantinKai/reelkit-react-starter"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 28 28" fill="currentColor">
            <path d="M12.747 16.273h-7.46L18.925 1.5l-3.671 10.227h7.46L9.075 26.5l3.672-10.227z" />
          </svg>
          Open in StackBlitz
        </a>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Here's a minimal example to create a vertical slider with React:
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
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Quick Start — Angular</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          The same slider in Angular using{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/angular
          </code>
          :
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
            language="typescript"
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Navigation</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          reelkit supports multiple navigation methods out of the box:
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
              <strong>Keyboard:</strong> Arrow keys and Escape
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
          language="typescript"
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Now that you have the basics, explore these topics:
        </p>
        <ul className="space-y-3">
          <li>
            <Link
              to="/docs/installation"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Installation
            </Link>
            <span className="text-slate-500">
              {' '}
              - all packages and setup options
            </span>
          </li>
          <li>
            <Link
              to="/docs/core/guide"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Core Guide
            </Link>
            <span className="text-slate-500"> - framework-agnostic engine</span>
          </li>
          <li>
            <Link
              to="/docs/react/guide"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              React Guide
            </Link>
            <span className="text-slate-500">
              {' '}
              - live demos and virtualization
            </span>
          </li>
          <li>
            <Link
              to="/docs/angular/guide"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Angular Guide
            </Link>
            <span className="text-slate-500">
              {' '}
              - signals-based Angular integration
            </span>
          </li>
          <li>
            <Link
              to="/docs/reel-player"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Reel Player
            </Link>
            <span className="text-slate-500">
              {' '}
              - TikTok/Reels-style video player
            </span>
          </li>
          <li>
            <Link
              to="/docs/lightbox"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Lightbox
            </Link>
            <span className="text-slate-500"> - image &amp; video gallery</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
