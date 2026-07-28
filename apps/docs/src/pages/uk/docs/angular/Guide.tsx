import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../../components/ui/CodeBlock';
import { NextSteps } from '../../../../components/NextSteps';
import { Sandbox } from '../../../../components/ui/Sandbox';
import { FeatureCardGrid } from '../../../../components/ui/FeatureCard';
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
import { Heading } from '../../../../components/ui/Heading';
import { ukPageMeta } from '../../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/angular/guide',
    title: 'Посібник для Angular · ReelKit',
    description:
      'ReelKit в Angular: компонент rk-reel, шаблонний патерн rkReelItem та вихід apiReady на сигналах.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

export default function AngularGuide() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Посібник для Angular</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Дізнайтеся, як будувати слайдери з{' '}
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
                label: 'Спершу дотик',
                desc: 'Свайп з інерцією та прилипанням',
              },
              {
                icon: Keyboard,
                label: 'Навігація з клавіатури',
                desc: 'Стрілки + Escape',
              },
              {
                icon: MousePointer,
                label: 'Прокручування колесом',
                desc: 'Необов’язково, з дебаунсом',
              },
              {
                icon: InfinityIcon,
                label: 'Віртуалізований',
                desc: '10 000+ елементів, 3 у DOM',
              },
              {
                icon: Radio,
                label: 'Indicators',
                desc: 'Прокручування точок у стилі Instagram',
              },
              {
                icon: Navigation,
                label: 'Програмний API',
                desc: 'next(), prev(), goTo() через apiReady',
              },
              {
                icon: Zap,
                label: 'Режим циклу',
                desc: 'Нескінченна кругова навігація',
              },
              {
                icon: Layers,
                label: 'Directional',
                desc: 'Вертикально або горизонтально',
              },
              {
                icon: Code,
                label: 'Signals-Based',
                desc: 'OnPush із сигналами Angular',
              },
            ]}
          />
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="rk-reel-component"
          className="text-2xl font-bold mb-4"
        >
          Компонент rk-reel
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            rk-reel
          </code>{' '}
          загортає контролер слайдера з ядра. Автономний, із{' '}
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
        <Heading level={2} id="auto-sizing" className="text-2xl font-bold mb-4">
          Auto-sizing
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            size
          </code>{' '}
          необов’язковий. Якщо його не передати,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rk-reel
          </code>{' '}
          сам вимірює свій контейнер через{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ResizeObserver
          </code>{' '}
          і підлаштовується під макет, заданий CSS. Розмір контейнера має
          задавати батьківський елемент — наприклад, flex, grid або явні розміри
          в CSS.
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
        <Heading
          level={2}
          id="rkreelitem-template-pattern"
          className="text-2xl font-bold mb-4"
        >
          Шаблонний патерн rkReelItem
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Замість render prop із React в Angular використовується структурна
          директива{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            rkReelItem
          </code>{' '}
          на{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ng-template
          </code>
          . Саме це дає віртуалізацію: створюються лише видимі слайди. Контекст
          шаблону надає три змінні:
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
              <strong>Клавіатура:</strong> Стрілки та Escape
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Колесо миші:</strong> Увімкніть{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                [enableWheel]="true"
              </code>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Програмно:</strong> Скористайтеся пропсом{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                (apiReady)
              </code>{' '}
              щоб отримати{' '}
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
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          Стан в URL
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            createOverlayUrlState
          </code>{' '}
          будує контролер стану в URL для оверлея й повертає його цілком, а ви
          передаєте його в{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            *UrlOverlay
          </code>{' '}
          компонента як його вхід{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            [controller]
          </code>{' '}
          . Викликайте його в контексті впровадження — в ініціалізаторі поля;
          він під’єднується одразу й звільняється через{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            DestroyRef
          </code>
          . Стан відкриття належить URL, тож прив’язаний оверлей відкривається
          сам, а посилання — звичайний спосіб його відкрити. Перший запис
          відсутнього параметра додає один запис в історію, кожен наступний його
          замінює, тож гортання ніколи не ховає кнопку «назад». Тримайте
          контролер, щоб читати{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            value
          </code>
          /
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            позицією
          </code>{' '}
          і керувати ним програмно:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            set(position)
          </code>{' '}
          відкриває,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            set(null)
          </code>{' '}
          закриває, а{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            set
          </code>{' '}
          — той самий низькорівневий запис, який оверлей робить усередині під
          час зміни слайда.
        </p>
        <CodeBlock
          code={`import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RkLightboxUrlOverlayComponent } from '@reelkit/angular-lightbox';
import { createOverlayUrlState, urlIndexKey } from '@reelkit/angular';

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
    ...urlIndexKey(() => this.images().length),
  });
}`}
          language="typescript"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          Застосунок із роутером — передайте адаптер на базі Router, інакше
          власне місцеположення роутера застаріє і наступна навігація втратить
          параметр:
        </p>
        <CodeBlock
          code={`import { createRouterUrlAdapter } from '@reelkit/angular/ng-router-url-adapter';

protected readonly photo = createOverlayUrlState({
  param: 'photo',
  adapter: createRouterUrlAdapter(),
  ...urlIndexKey(() => this.images().length),
});`}
          language="typescript"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          Об’єкт опцій приймає{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            param
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            codec
          </code>
          , та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            locator
          </code>{' '}
          (усі три обов’язкові) плюс необов’язковий{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            adapter
          </code>
          .{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            codec
          </code>{' '}
          та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            locator
          </code>{' '}
          — узгоджена пара з однаковим{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            Id
          </code>
          , so a plain{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ?photo=3
          </code>{' '}
          галерея розгортає{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ...urlIndexKey(() =&gt; images().length)
          </code>
          , який повертає обидві половини одразу.{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            urlIndexKey
          </code>{' '}
          обмежує індекс живою кількістю, яку повертає геттер, тож застарілий{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ?photo=99
          </code>{' '}
          відхиляється й сам зникає з URL замість того, щоб відкрити слайд,
          якого ніхто не називав. Посторінкова стрічка або галерея з адресацією
          за ідентичністю передає власну узгоджену пару{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            codec
          </code>{' '}
          +{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            locator
          </code>{' '}
          . Повна таблиця опцій — у{' '}
          <Link
            to="/uk/docs/angular/api#createoverlayurlstate"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            довіднику API для Angular
          </Link>
          .
        </p>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="reelindicator"
          className="text-2xl font-bold mb-4"
        >
          ReelIndicator
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Необов’язковий компонент, що показує індикатори прогресу в стилі
          Instagram із поточною позицією в слайдері. Якщо він усередині{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            rk-reel
          </code>
          , він сам під’єднується до{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            count
          </code>{' '}
          та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            active
          </code>{' '}
          значення через токен впровадження{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RK_REEL_CONTEXT
          </code>{' '}
          — нічого зв’язувати вручну не треба.
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
        <Heading
          level={2}
          id="apiready-output-signal-based-pattern"
          className="text-2xl font-bold mb-4"
        >
          Вихід apiReady — патерн на сигналах
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            (apiReady)
          </code>{' '}
          спрацьовує один раз після того, як компонент змонтовано й виміряно.
          Він видає об’єкт{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelApi
          </code>{' '}
          який можна зберегти й використовувати для імперативної навігації.
          Тримати це посилання в сигналах Angular добре поєднується з виявленням
          змін{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            OnPush
          </code>{' '}
          .
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
        <Heading level={2} id="key-points" className="text-2xl font-bold mb-4">
          Головне
        </Heading>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Автономний компонент
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
                просто в{' '}
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
                ng-template і rkReelItem
              </strong>
              <p className="text-sm">
                Відповідник в Angular для пропса{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  itemBuilder
                </code>{' '}
                із React — дає віртуалізацію
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
                Вихід, що спрацьовує один раз із імперативним API навігації —
                жодних запитів через ViewChild
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
                — стежить за поточним індексом для оновлення інтерфейсу
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                OnPush за замовчуванням
              </strong>
              <p className="text-sm">
                Усі компоненти використовують{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ChangeDetectionStrategy.OnPush
                </code>{' '}
                і сигнали Angular заради максимальної продуктивності
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="performance-tips"
          className="text-2xl font-bold mb-4"
        >
          Поради щодо продуктивності
        </Heading>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Тримайте шаблони слайдів легкими
              </strong>
              <p className="text-sm">
                The{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  rkReelItem
                </code>{' '}
                виконується для кожного видимого слайда (зазвичай трьох
                одночасно). Уникайте важких обчислень і глибоко вкладених
                структур усередині.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Вантажте дані ближче до краю
              </strong>
              <p className="text-sm">
                Використовуйте{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  (afterChange)
                </code>{' '}
                щоб помітити наближення до кінця й підвантажити наступний пакет,
                доки слайди не скінчилися — так виходить нескінченна стрічка.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Тримайте імперативний стан у сигналах
              </strong>
              <p className="text-sm">
                Зберігайте посилання{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ReelApi
                </code>{' '}
                та поточний індекс у сигналах Angular — це дає точкову
                реактивність без повного перерендеру компонента.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Вимикайте колесо на сторінках із прокручуванням
              </strong>
              <p className="text-sm">
                Set{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  [enableWheel]="false"
                </code>{' '}
                коли слайдер вбудований у макет із прокручуванням, щоб не
                перехоплювати прокручування сторінки.
              </p>
            </div>
          </li>
        </ul>
      </section>

      <NextSteps
        items={[
          {
            label: 'Довідник API для Angular',
            path: '/docs/angular/api',
            description: 'усі доступні входи, виходи та методи',
          },
          {
            label: 'Reel Player',
            path: '/docs/angular-reel-player',
            description: 'відеоплеєр у стилі TikTok / Reels',
          },
          {
            label: 'Lightbox',
            path: '/docs/angular-lightbox',
            description: 'галерея зображень і відео',
          },
          {
            label: 'Stories Player',
            path: '/docs/angular-stories-player',
            description: 'переглядач історій у стилі Instagram (скоро)',
          },
        ]}
      />
    </div>
  );
}
