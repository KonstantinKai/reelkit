import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Sandbox } from '../../../components/ui/Sandbox';
import { FeatureCardGrid } from '../../../components/ui/FeatureCard';
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

export default function AngularGuide() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Angular Guide</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Learn how to build sliders with{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/angular
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
                label: 'Touch First',
                desc: 'Swipe with momentum and snap',
              },
              {
                icon: Keyboard,
                label: 'Keyboard Nav',
                desc: 'Arrow keys + Escape',
              },
              {
                icon: MousePointer,
                label: 'Wheel Scroll',
                desc: 'Optional with debounce',
              },
              {
                icon: InfinityIcon,
                label: 'Virtualized',
                desc: '10,000+ items, 3 in DOM',
              },
              {
                icon: Radio,
                label: 'Indicators',
                desc: 'Instagram-style dot scrolling',
              },
              {
                icon: Navigation,
                label: 'Programmatic API',
                desc: 'next(), prev(), goTo() via apiReady',
              },
              {
                icon: Zap,
                label: 'Loop Mode',
                desc: 'Infinite circular navigation',
              },
              {
                icon: Layers,
                label: 'Directional',
                desc: 'Vertical or horizontal',
              },
              {
                icon: Code,
                label: 'Signals-Based',
                desc: 'OnPush with Angular signals',
              },
            ]}
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock code={`npm install @reelkit/angular`} language="bash" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">rk-reel Component</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            rk-reel
          </code>{' '}
          component wraps the core slider controller. Standalone, with{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ChangeDetectionStrategy.OnPush
          </code>
          .
        </p>
        <Sandbox
          code={`import { Component } from '@angular/core';
import { ReelComponent, ReelIndicatorComponent, RkReelItemDirective } from '@reelkit/angular';

@Component({
  standalone: true,
  imports: [ReelComponent, ReelIndicatorComponent, RkReelItemDirective],
  template: \`
    <rk-reel
      [count]="items.length"
      style="width: 100%; height: 100dvh"
      direction="vertical"
      [enableWheel]="true"
      (afterChange)="onAfterChange($event)"
    >
      <ng-template rkReelItem let-i let-size="size">
        <div [style.width.px]="size[0]" [style.height.px]="size[1]"
             [style.background]="items[i].color"
             style="display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff">
          <div style="font-size:1.5rem;font-weight:bold">{{ items[i].title }}</div>
          <div style="font-size:0.875rem;opacity:0.8">{{ items[i].subtitle }}</div>
        </div>
      </ng-template>

      <rk-reel-indicator direction="vertical" />
    </rk-reel>
  \`,
})
export class AppComponent {
  items = [
    { title: 'Virtualized', subtitle: 'Only 3 slides in DOM', color: '#6366f1' },
    { title: 'Touch First', subtitle: 'Native swipe gestures', color: '#8b5cf6' },
    { title: 'Zero Deps', subtitle: 'Tiny bundle size', color: '#7c3aed' },
    { title: 'Keyboard Nav', subtitle: 'Full a11y support', color: '#ec4899' },
    { title: 'SSR Ready', subtitle: 'Works everywhere', color: '#14b8a6' },
    { title: '60fps', subtitle: 'Smooth animations', color: '#f59e0b' },
  ];

  onAfterChange(event: { index: number; indexInRange: number }) {
    console.log('Current index:', event.index);
  }
}`}
          language="typescript"
          title="app.component.ts"
          framework="angular"
          stackblitzDeps={{ '@reelkit/angular': '0.1.0' }}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Auto-sizing</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            size
          </code>{' '}
          input is optional. When omitted,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rk-reel
          </code>{' '}
          auto-measures its container via{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ResizeObserver
          </code>{' '}
          and adapts to CSS-driven layout. The container must be sized by its
          parent (e.g. flex, grid, or explicit CSS dimensions).
        </p>
        <CodeBlock
          code={`<!-- Explicit size (fixed) -->
<rk-reel [count]="items.length" [size]="[400, 600]">
  <ng-template rkReelItem let-i let-size="size"> ... </ng-template>
</rk-reel>

<!-- Auto-size (responsive — sized by CSS) -->
<rk-reel [count]="items.length" style="width: 100%; height: 100dvh">
  <ng-template rkReelItem let-i let-size="size"> ... </ng-template>
</rk-reel>`}
          language="html"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">rkReelItem Template Pattern</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Instead of React's render prop, Angular uses a structural directive{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            rkReelItem
          </code>{' '}
          on an{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ng-template
          </code>
          . This enables virtualization — only visible slides are instantiated.
          The template context provides three variables:
        </p>
        <CodeBlock
          code={`<ng-template rkReelItem let-i let-indexInRange="indexInRange" let-size="size">
  <!--
    $implicit (let-i)   : number  — absolute slide index (0 to count-1)
    indexInRange        : number  — position in visible window (0, 1, or 2)
    size                : [number, number] — [width, height] of the container
  -->
  <app-slide [data]="items[i]"
             [style.width.px]="size[0]"
             [style.height.px]="size[1]" />
</ng-template>`}
          language="html"
        />
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
              <strong>Keyboard:</strong> Arrow keys and Escape
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Mouse Wheel:</strong> Enable with{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                [enableWheel]="true"
              </code>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Programmatic:</strong> Use the{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                (apiReady)
              </code>{' '}
              output to obtain{' '}
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
          code={`import { Component } from '@angular/core';
import { ReelComponent, RkReelItemDirective, type ReelApi } from '@reelkit/angular';

@Component({
  standalone: true,
  imports: [ReelComponent, RkReelItemDirective],
  template: \`
    <rk-reel
      [count]="10"
      [size]="[400, 600]"
      (apiReady)="api = $event"
    >
      <ng-template rkReelItem let-i let-size="size">
        <app-slide [index]="i" [size]="size" />
      </ng-template>
    </rk-reel>

    <button (click)="api?.prev()">Prev</button>
    <button (click)="api?.next()">Next</button>
    <button (click)="api?.goTo(5)">Go to 5</button>
  \`,
})
export class AppComponent {
  api: ReelApi | undefined;
}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">ReelIndicator</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Optional component that displays Instagram-style progress indicators
          showing the current position in the slider. When placed inside a{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            rk-reel
          </code>
          , it auto-connects to the parent's{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            count
          </code>{' '}
          and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            active
          </code>{' '}
          values via the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RK_REEL_CONTEXT
          </code>{' '}
          injection token — no manual wiring needed.
        </p>
        <CodeBlock
          code={`<!-- Auto-connect: count and active are inherited from parent rk-reel -->
<rk-reel [count]="10" [size]="[400, 600]">
  <ng-template rkReelItem let-i let-size="size"> ... </ng-template>
  <rk-reel-indicator direction="vertical" />
</rk-reel>

<!-- Manual usage: pass count and active explicitly (e.g. outside a rk-reel) -->
<rk-reel-indicator [count]="10" [active]="currentIndex" />`}
          language="html"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          apiReady Output — Signal-Based Pattern
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            (apiReady)
          </code>{' '}
          output fires once after the component is mounted and measured. It
          emits a{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelApi
          </code>{' '}
          object you can store and use for imperative navigation. Using Angular
          signals for this reference works cleanly with{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            OnPush
          </code>{' '}
          change detection.
        </p>
        <CodeBlock
          code={`import { Component, signal } from '@angular/core';
import { ReelComponent, RkReelItemDirective, type ReelApi } from '@reelkit/angular';

@Component({
  standalone: true,
  imports: [ReelComponent, RkReelItemDirective],
  template: \`
    <rk-reel
      [count]="items.length"
      style="width: 100%; height: 100dvh"
      direction="vertical"
      [enableWheel]="true"
      (apiReady)="reelApi.set($event)"
      (afterChange)="currentIndex.set($event.index)"
    >
      <ng-template rkReelItem let-i let-size="size">
        <div [style.width.px]="size[0]" [style.height.px]="size[1]">
          {{ items[i].title }}
        </div>
      </ng-template>
    </rk-reel>

    <div style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%)">
      <button (click)="reelApi()?.prev()"
              [disabled]="currentIndex() === 0">Prev</button>
      <button (click)="reelApi()?.next()"
              [disabled]="currentIndex() === items.length - 1">Next</button>
    </div>
  \`,
})
export class AppComponent {
  readonly items = [
    { title: 'Slide 1', color: '#6366f1' },
    { title: 'Slide 2', color: '#8b5cf6' },
    { title: 'Slide 3', color: '#ec4899' },
  ];

  readonly reelApi = signal<ReelApi | undefined>(undefined);
  readonly currentIndex = signal(0);
}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Key Points</h2>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Standalone component
              </strong>
              <p className="text-sm">
                Import{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ReelComponent
                </code>
                ,{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  RkReelItemDirective
                </code>
                , and optionally{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ReelIndicatorComponent
                </code>{' '}
                directly into your component's{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  imports
                </code>{' '}
                array
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                ng-template + rkReelItem
              </strong>
              <p className="text-sm">
                The Angular equivalent of React's{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  itemBuilder
                </code>{' '}
                prop — enables virtualization
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                apiReady
              </strong>
              <p className="text-sm">
                Output that fires once with the imperative navigation API — no
                ViewChild querying required
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                afterChange
              </strong>
              <p className="text-sm">
                Emits{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  {'{ index, indexInRange }'}
                </code>{' '}
                — track current index for UI updates
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                OnPush by default
              </strong>
              <p className="text-sm">
                All components use{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ChangeDetectionStrategy.OnPush
                </code>{' '}
                and Angular signals for maximum performance
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Performance Tips</h2>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Keep slide templates lightweight
              </strong>
              <p className="text-sm">
                The{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  rkReelItem
                </code>{' '}
                template runs for each visible slide (typically 3 at a time).
                Avoid heavy computation or deeply nested structures inside it.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Load data near the edge
              </strong>
              <p className="text-sm">
                Use{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  (afterChange)
                </code>{' '}
                to detect when the user approaches the end and fetch the next
                batch before slides run out — enabling infinite scroll feeds.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Use signals for imperative state
              </strong>
              <p className="text-sm">
                Store the{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ReelApi
                </code>{' '}
                reference and current index in Angular signals to get
                fine-grained reactivity without triggering full component
                re-renders.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Disable wheel in scrollable pages
              </strong>
              <p className="text-sm">
                Set{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  [enableWheel]="false"
                </code>{' '}
                when the slider is embedded in a scrollable layout to avoid
                capturing the page scroll.
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
        <ul className="space-y-3">
          <li>
            <Link
              to="/docs/angular/api"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Angular API Reference
            </Link>
            <span className="text-slate-500">
              {' '}
              - all available inputs, outputs, and methods
            </span>
          </li>
          <li>
            <Link
              to="/docs/angular-reel-player"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Angular Reel Player
            </Link>
            <span className="text-slate-500">
              {' '}
              - TikTok/Reels-style video player
            </span>
          </li>
          <li>
            <Link
              to="/docs/angular-lightbox"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Angular Lightbox
            </Link>
            <span className="text-slate-500"> - image &amp; video gallery</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
