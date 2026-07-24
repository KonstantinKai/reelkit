import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { NextSteps } from '../../../components/NextSteps';
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
import { Heading } from '../../../components/ui/Heading';

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
        <Heading level={2} className="text-2xl font-bold mb-4">
          rk-reel Component
        </Heading>
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
  selector: 'app-root',
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

      <div style="position:absolute;right:12px;top:50%;transform:translateY(-50%);z-index:10">
        <rk-reel-indicator direction="vertical" />
      </div>
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
          stackblitzDeps={['@reelkit/angular']}
        />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Auto-sizing
        </Heading>
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
        <Heading level={2} className="text-2xl font-bold mb-4">
          rkReelItem Template Pattern
        </Heading>
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
        <Heading level={2} className="text-2xl font-bold mb-4">
          Navigation
        </Heading>
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
  selector: 'app-root',
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
        <Heading level={2} className="text-2xl font-bold mb-4">
          URL State
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            createOverlayUrlState
          </code>{' '}
          builds a URL-state controller for an overlay and returns it whole,
          then you hand it to a{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            *UrlOverlay
          </code>{' '}
          component as its{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            [controller]
          </code>{' '}
          input. Call it in an injection context — a field initialiser; it
          attaches immediately and releases through{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            DestroyRef
          </code>
          . The URL owns the open state, so a bound overlay opens itself and a
          link is the usual open action. The first write of an absent parameter
          pushes one history entry and every write after replaces it, so paging
          never buries the back button. Keep the controller to read{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            value
          </code>
          /
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            index
          </code>{' '}
          and to drive it programmatically:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            set(index)
          </code>{' '}
          opens,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            set(null)
          </code>{' '}
          closes, and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            set
          </code>{' '}
          is the same low-level write the overlay uses internally on slide
          change.
        </p>
        <CodeBlock
          code={`import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RkLightboxUrlOverlayComponent } from '@reelkit/angular-lightbox';
import { createOverlayUrlState, indexKey } from '@reelkit/angular';

@Component({
  imports: [RkLightboxUrlOverlayComponent, RouterLink],
  template: \`
    @for (image of images(); track image.src; let i = $index) {
      <a [routerLink]="[]" [queryParams]="{ photo: i }">
        <img [src]="image.src" alt="" />
      </a>
    }

    <rk-lightbox-url-overlay [controller]="photo" [items]="images()" />
  \`,
})
export class GalleryComponent {
  protected readonly images = signal(photos);

  // Attaches now, releases on destroy.
  protected readonly photo = createOverlayUrlState({
    param: 'photo',
    ...indexKey(() => this.images().length),
  });
}`}
          language="typescript"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          Routed app — pass a Router-backed adapter, otherwise the Router&apos;s
          own location goes stale and its next navigation drops the parameter:
        </p>
        <CodeBlock
          code={`import { createRouterUrlAdapter } from '@reelkit/angular/ng-router-url-adapter';

protected readonly photo = createOverlayUrlState({
  param: 'photo',
  adapter: createRouterUrlAdapter(),
  ...indexKey(() => this.images().length),
});`}
          language="typescript"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          The options object takes{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            param
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            codec
          </code>
          , and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            locator
          </code>{' '}
          (all three required), plus an optional{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            adapter
          </code>
          .{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            codec
          </code>{' '}
          and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            locator
          </code>{' '}
          are a matched pair sharing the same{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            Id
          </code>
          , so a plain{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ?photo=3
          </code>{' '}
          gallery spreads{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ...indexKey(() =&gt; images().length)
          </code>
          , which returns both halves at once.{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            indexKey
          </code>{' '}
          bounds the index against the live count the getter returns, so a stale{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ?photo=99
          </code>{' '}
          is rejected and heals itself out of the URL instead of opening a slide
          that was never named. A paginated feed or an identity-keyed gallery
          supplies its own matched{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            codec
          </code>{' '}
          +{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            locator
          </code>{' '}
          instead. The full options table lives on the{' '}
          <Link
            to="/docs/angular/api#createoverlayurlstate"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Angular API reference
          </Link>
          .
        </p>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          ReelIndicator
        </Heading>
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
        <Heading level={2} className="text-2xl font-bold mb-4">
          apiReady Output — Signal-Based Pattern
        </Heading>
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
  selector: 'app-root',
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
        <Heading level={2} className="text-2xl font-bold mb-4">
          Key Points
        </Heading>
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
        <Heading level={2} className="text-2xl font-bold mb-4">
          Performance Tips
        </Heading>
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

      <NextSteps
        items={[
          {
            label: 'Angular API Reference',
            path: '/docs/angular/api',
            description: 'all available inputs, outputs, and methods',
          },
          {
            label: 'Reel Player',
            path: '/docs/angular-reel-player',
            description: 'TikTok/Reels-style video player',
          },
          {
            label: 'Lightbox',
            path: '/docs/angular-lightbox',
            description: 'image & video gallery',
          },
          {
            label: 'Stories Player',
            path: '/docs/angular-stories-player',
            description: 'Instagram-style stories viewer (coming soon)',
          },
        ]}
      />
    </div>
  );
}
