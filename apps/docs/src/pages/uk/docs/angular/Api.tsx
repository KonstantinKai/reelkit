import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../../components/ui/CodeBlock';
import { Heading } from '../../../../components/ui/Heading';
import { ukPageMeta } from '../../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/angular/api',
    title: 'Довідник API для Angular · ReelKit',
    description:
      'Повний API @reelkit/angular: ReelComponent, інтерфейс ReelApi, директиви, сервіси та утиліти мосту сигналів.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

const reelInputs = [
  {
    prop: 'count',
    type: 'number',
    default: 'required',
    description: 'Загальна кількість слайдів',
  },
  {
    prop: 'direction',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: 'Напрямок прокручування',
  },
  {
    prop: 'size',
    type: '[number, number] | undefined',
    default: 'undefined',
    description:
      'Ширина й висота у вигляді [width, height]. Якщо не задано, вимірюється автоматично через ResizeObserver',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: 'Початковий індекс слайда',
  },
  {
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description: 'Вмикає нескінченний цикл',
  },
  {
    prop: 'transition',
    type: 'TransitionTransformFn',
    default: 'slideTransition',
    description:
      'Функція ефекту переходу. Вбудовані: slideTransition, fadeTransition, flipTransition, cubeTransition, zoomTransition',
  },
  {
    prop: 'transitionDuration',
    type: 'number',
    default: '300',
    description: 'Тривалість анімації в мілісекундах',
  },
  {
    prop: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: 'Поріг свайпу (0–1)',
  },
  {
    prop: 'enableGestures',
    type: 'boolean',
    default: 'true',
    description: 'Вмикає навігацію перетягуванням дотиком або мишею',
  },
  {
    prop: 'enableNavKeys',
    type: 'boolean',
    default: 'true',
    description: 'Вмикає навігацію стрілками клавіатури',
  },
  {
    prop: 'enableWheel',
    type: 'boolean',
    default: 'false',
    description: 'Вмикає навігацію колесом миші',
  },
  {
    prop: 'wheelDebounceMs',
    type: 'number',
    default: '200',
    description: 'Дебаунс події колеса в мілісекундах',
  },
  {
    prop: 'rangeExtractor',
    type: '(index: number, count: number) => number[]',
    default: 'defaultRangeExtractor',
    description: 'Власна функція, що визначає, які індекси рендеряться',
  },
  {
    prop: 'keyExtractor',
    type: '(index: number, indexInRange: number) => string | number',
    default: 'index => index',
    description:
      'Власна функція ключів для виразів track у @for (корисно з циклом)',
  },
  {
    prop: 'className',
    type: 'string',
    default: "''",
    description: 'Клас CSS для кореневого контейнера',
  },
  {
    prop: 'ariaLabel',
    type: 'string',
    default: "'Carousel'",
    description: 'Доступна назва області каруселі',
  },
];

const reelOutputs = [
  {
    prop: 'afterChange',
    type: 'EventEmitter<{ index: number; indexInRange: number }>',
    description: 'Видається після завершення переходу між слайдами',
  },
  {
    prop: 'beforeChange',
    type: 'EventEmitter<{ index: number; nextIndex: number; indexInRange: number }>',
    description: 'Видається перед початком переходу між слайдами',
  },
  {
    prop: 'slideDragStart',
    type: 'EventEmitter<number>',
    description: 'Видається на початку перетягування',
  },
  {
    prop: 'slideDragEnd',
    type: 'EventEmitter<number>',
    description:
      'Видається, коли перетягування завершується (палець або кнопку відпустили)',
  },
  {
    prop: 'slideDragCanceled',
    type: 'EventEmitter<number>',
    description:
      'Видається, коли перетягування скасовано (слайд повертається назад)',
  },
  {
    prop: 'apiReady',
    type: 'EventEmitter<ReelApi>',
    description:
      'Видається один раз після ініціалізації подання й відкриває імперативний API',
  },
];

const apiMethods = [
  {
    method: 'next()',
    type: '() => void',
    description: 'Перейти до наступного слайда',
  },
  {
    method: 'prev()',
    type: '() => void',
    description: 'Перейти до попереднього слайда',
  },
  {
    method: 'goTo(index, animate?)',
    type: '(number, boolean?) => Promise<void>',
    description: 'Перехід до слайда за індексом',
  },
  {
    method: 'adjust()',
    type: '() => void',
    description: 'Перерахувати позиції слайдів (корисно після зміни макета)',
  },
  {
    method: 'observe()',
    type: '() => void',
    description: 'Почати слухати події клавіатури',
  },
  {
    method: 'unobserve()',
    type: '() => void',
    description: 'Припинити слухати події клавіатури',
  },
];

const indicatorInputs = [
  {
    prop: 'count',
    type: 'number | undefined',
    default: 'auto',
    description:
      'Загальна кількість елементів. Береться з контексту батьківського rk-reel, якщо компонент вкладений у нього; передавайте явно за окремого використання',
  },
  {
    prop: 'active',
    type: 'number | undefined',
    default: 'auto',
    description:
      'Поточний активний індекс. Береться з контексту батьківського rk-reel, якщо компонент вкладений у нього; передавайте явно за окремого використання',
  },
  {
    prop: 'direction',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: 'Орієнтація індикатора',
  },
  {
    prop: 'radius',
    type: 'number',
    default: '3',
    description: 'Радіус точки в пікселях',
  },
  {
    prop: 'visible',
    type: 'number',
    default: '5',
    description: 'Максимум одночасно видимих точок звичайного розміру',
  },
  {
    prop: 'gap',
    type: 'number',
    default: '4',
    description: 'Відстань між точками в пікселях',
  },
  {
    prop: 'activeColor',
    type: 'string',
    default: "'#fff'",
    description: 'Колір активної точки',
  },
  {
    prop: 'inactiveColor',
    type: 'string',
    default: "'rgba(255,255,255,0.5)'",
    description: 'Колір неактивної точки',
  },
  {
    prop: 'edgeScale',
    type: 'number',
    default: '0.5',
    description: 'Коефіцієнт масштабу крайніх точок за межами видимого',
  },
  {
    prop: 'className',
    type: 'string',
    default: "''",
    description: 'Власний клас CSS для контейнера індикатора',
  },
  {
    prop: 'tablistLabel',
    type: 'string',
    default: "'Slide navigation'",
    description: 'Доступна назва орієнтира tablist',
  },
];

const indicatorOutputs = [
  {
    prop: 'dotClick',
    type: 'EventEmitter<number>',
    description: 'Видається на клік по точці; передає індекс точки',
  },
];

const contextShape = [
  {
    property: 'index',
    type: 'Signal<number>',
    description: 'Реактивний індекс поточного слайда',
  },
  {
    property: 'count',
    type: 'Signal<number>',
    description: 'Реактивна загальна кількість елементів',
  },
  {
    property: 'goTo',
    type: '(index: number, animate?: boolean) => Promise<void>',
    description: 'Програмний перехід до слайда',
  },
];

const signalBridgeRows = [
  {
    name: 'toAngularSignal',
    signature: '(source: Subscribable<T>, destroyRef: DestroyRef) => Signal<T>',
    description:
      'Місток від Subscribable з ядра до сигналу Angular лише для читання',
  },
  {
    name: 'animatedSignalBridge',
    signature:
      '(source: AnimatedValue, zone: NgZone, cdRef: ChangeDetectorRef, destroyRef: DestroyRef) => Signal<number>',
    description:
      'Місток від анімованого значення ядра до сигналу Angular, що оновлюється через requestAnimationFrame поза зоною',
  },
];

export default function AngularApi() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Довідник API для Angular</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Повний довідник{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/angular
          </code>{' '}
          : компоненти, директиви, сервіси та утиліти.
        </p>
      </div>

      <section className="mb-12">
        <Heading
          level={2}
          id="reelcomponent"
          className="text-2xl font-bold mb-2"
        >
          ReelComponent
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Селектор:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rk-reel
          </code>
        </p>
        <Heading level={3} id="inputs" className="text-lg font-semibold mb-3">
          Inputs
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Input</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Типове значення
                </th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {reelInputs.map((p) => (
                <tr
                  key={p.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.type}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-sm">
                    {p.default}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {p.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={3} id="outputs" className="text-lg font-semibold mb-3">
          Outputs
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Output</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {reelOutputs.map((p) => (
                <tr
                  key={p.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.type}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {p.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="reelapi-interface"
          className="text-2xl font-bold mb-4"
        >
          Інтерфейс ReelApi
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Отримується через вихід{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            (apiReady)
          </code>{' '}
          :
        </p>
        <CodeBlock
          code={`import { type ReelApi } from '@reelkit/angular';

@Component({ ... })
export class AppComponent {
  api: ReelApi | undefined;

  // In template: (apiReady)="api = $event"

  prev()  { this.api?.prev(); }
  next()  { this.api?.next(); }
  jump(i: number) { this.api?.goTo(i, true); }  // animated
}`}
          language="typescript"
        />
        <div className="overflow-x-auto mt-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Метод</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {apiMethods.map((p) => (
                <tr
                  key={p.method}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.method}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.type}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {p.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="rkreelitemdirective"
          className="text-2xl font-bold mb-2"
        >
          RkReelItemDirective
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Селектор:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            [rkReelItem]
          </code>{' '}
          — застосовується до{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ng-template
          </code>{' '}
          inside{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rk-reel
          </code>
          .
        </p>
        <Heading
          level={3}
          id="template-context"
          className="text-lg font-semibold mb-3"
        >
          Контекст шаблону
        </Heading>
        <CodeBlock
          code={`<ng-template rkReelItem let-i let-indexInRange="indexInRange" let-size="size">
  <!-- $implicit (let-i)  : number         — absolute slide index -->
  <!-- indexInRange        : number         — position in the visible window (0, 1, or 2) -->
  <!-- size                : [number,number] — [width, height] of the container -->
</ng-template>`}
          language="html"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Variable</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  $implicit (let-i)
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  number
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Абсолютний індекс слайда (від 0 до count-1)
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  indexInRange
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  number
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Позиція у видимому вікні (0, 1 або 2)
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  size
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  [number, number]
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Поточні розміри слайдера як [width, height] у пікселях
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="reelindicatorcomponent"
          className="text-2xl font-bold mb-2"
        >
          ReelIndicatorComponent
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Селектор:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rk-reel-indicator
          </code>
        </p>
        <Heading level={3} id="inputs" className="text-lg font-semibold mb-3">
          Inputs
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Input</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Типове значення
                </th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {indicatorInputs.map((p) => (
                <tr
                  key={p.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.type}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-sm">
                    {p.default}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {p.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Heading
          level={3}
          id="outputs"
          className="text-lg font-semibold mt-6 mb-3"
        >
          Outputs
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Output</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {indicatorOutputs.map((p) => (
                <tr
                  key={p.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.type}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {p.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="rk-reel-context"
          className="text-2xl font-bold mb-4"
        >
          RK_REEL_CONTEXT
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          An{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            InjectionToken{'<ReelContextValue>'}
          </code>{' '}
          який надає{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rk-reel
          </code>{' '}
          своїм нащадкам. Використовується всередині{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rk-reel-indicator
          </code>{' '}
          для автоматичного під’єднання. Впроваджуйте його у власні компоненти,
          яким потрібен контекст слайдера.
        </p>
        <CodeBlock
          code={`import { inject } from '@angular/core';
import { RK_REEL_CONTEXT } from '@reelkit/angular';

@Component({ ... })
export class MyCustomControl {
  private readonly ctx = inject(RK_REEL_CONTEXT, { optional: true });

  jump(index: number) {
    this.ctx?.goTo(index, true);
  }
}`}
          language="typescript"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">
                  Властивість
                </th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {contextShape.map((p) => (
                <tr
                  key={p.property}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.property}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.type}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {p.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="bodylockservice"
          className="text-2xl font-bold mb-4"
        >
          BodyLockService
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Блокування прокручування body з підрахунком посилань. Кілька
          одночасних викликачів (наприклад, відкриті водночас Lightbox і
          модальне вікно) блокують і розблоковують незалежно — body повертається
          до норми лише коли останній із них звільнить. Надається на рівні
          кореня — впроваджуйте будь-де.
        </p>
        <CodeBlock
          code={`import { inject } from '@angular/core';
import { BodyLockService } from '@reelkit/angular';

@Component({ ... })
export class OverlayComponent {
  private readonly bodyLock = inject(BodyLockService);

  open() { this.bodyLock.lock(); }
  close() { this.bodyLock.unlock(); }
}`}
          language="typescript"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Член</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  locked
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  boolean (getter)
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Чи заблоковано body просто зараз
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  lock()
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  () =&gt; void
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Заблокувати прокручування body й компенсувати ширину смуги
                  прокручування
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  unlock()
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  () =&gt; void
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Повернути початкові стилі прокручування body
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="signal-bridge-utilities"
          className="text-2xl font-bold mb-4"
        >
          Утиліти мосту сигналів
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Допоміжні функції, що з’єднують систему сигналів ядра (
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/core
          </code>
          ) with Angular's native signal API. Used internally by{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelComponent
          </code>
          ; also available for custom framework integrations.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Function</th>
                <th className="text-left py-3 px-4 font-semibold">Signature</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {signalBridgeRows.map((r) => (
                <tr
                  key={r.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {r.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {r.signature}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {r.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CodeBlock
          code={`import { DestroyRef, inject } from '@angular/core';
import { toAngularSignal } from '@reelkit/angular';
import { createSliderController } from '@reelkit/core';

// Custom component using low-level signal bridge
const destroyRef = inject(DestroyRef);
const controller = createSliderController({ count: 10 }, {});
const index = toAngularSignal(controller.state.index, destroyRef);`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="createoverlayurlstate"
          className="text-2xl font-bold mb-4"
        >
          createOverlayUrlState
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-mono">
          OverlayUrlStateOptions
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Будує контролер стану в URL для оверлея, який ви передаєте в{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            &lt;rk-lightbox-url-overlay&gt;
          </code>{' '}
          як його{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            [controller]
          </code>{' '}
          . Викликайте його в контексті впровадження — в ініціалізаторі поля або
          в конструкторі; він під’єднується одразу й звільняється через{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            DestroyRef
          </code>
          . Покроковий розбір:{' '}
          <Link
            to="/uk/docs/angular-lightbox#url-state"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            Стан в URL на сторінці Lightbox для Angular
          </Link>
          .
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Option</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Типове значення
                </th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  param
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-600 dark:text-slate-400">
                  string
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-500">
                  required
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Параметр запиту, що несе активний слайд, наприклад photo.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  adapter
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-600 dark:text-slate-400">
                  UrlAdapter
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-500">
                  History API
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Система навігації, через яку читати й писати. У застосунку з
                  роутером передайте адаптер на базі Router, щоб місцеположення
                  роутера не застаріло.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  codec
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-600 dark:text-slate-400">
                  UrlCodec&lt;Id&gt;
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-500">
                  required
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Формат передавання: текст параметра в стабільну ідентичність.
                  Іде разом із локатором як узгоджена пара — розгорніть
                  ...urlIndexKey(() =&gt; images().length) для типової галереї з
                  ?photo=3 або передайте власний, щоб закладка пережила зміну
                  порядку.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  locator
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-600 dark:text-slate-400">
                  UrlLocator&lt;Id&gt;
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-500">
                  required
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Зіставляє ідентичність із позицією і сам відповідає за свою
                  чинність: locate (синхронно), locateAsync (запасний варіант
                  для посторінкової галереї), identify (для запису).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="createrouterurladapter"
          className="text-2xl font-bold mb-4"
        >
          createRouterUrlAdapter
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-mono">
          @reelkit/angular/ng-router-url-adapter
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A <code>UrlAdapter</code> на базі Angular Router. Передайте його як{' '}
          <code>adapter</code> у <code>createOverlayUrlState</code> у застосунку
          з роутером, щоб Router лишався єдиним джерелом правди про навігацію:
          запис <code>history.pushState</code> повз Router лишає його
          місцеположення застарілим, і наступна навігація втрачає параметр.
          Викликайте його в контексті впровадження; підписка{' '}
          <code>NavigationEnd</code> звільняється через <code>DestroyRef</code>.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Постачається з окремого підшляху, тож застосунок без роутингу ніколи
          не тягне <code>@angular/router</code> у свій бандл.{' '}
          <code>@angular/router</code> — необов’язкова peer-залежність.
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
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="accessibility"
          className="text-2xl font-bold mb-4"
        >
          Accessibility
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            &lt;rk-reel&gt;
          </code>{' '}
          рендериться як{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="region"
          </code>{' '}
          з{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-roledescription="carousel"
          </code>
          . Задайте пропс{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ariaLabel
          </code>{' '}
          щоб дати області назву для екранного читача. Ввічлива жива область
          оголошує «Слайд N з M» на кожну зміну слайда. Неактивні слайди
          отримують атрибут{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            inert
          </code>{' '}
          , тож фокус і навігація допоміжних технологій їх пропускають.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            &lt;rk-reel-indicator&gt;
          </code>{' '}
          рендериться як{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="tablist"
          </code>{' '}
          з рухомим tabindex на точках; стрілки переміщують фокус, а Enter або
          Space активує слайд.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Будуєте власне модальне вікно навколо{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            &lt;rk-reel&gt;
          </code>
          ?{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            captureFocusForReturn
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            createFocusTrap
          </code>
          , та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            getFocusableElements
          </code>{' '}
          — вони реекспортовані з{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/angular
          </code>{' '}
          для повернення й утримання фокуса.
        </p>
      </section>

      <section>
        <Heading
          level={2}
          id="package-exports"
          className="text-2xl font-bold mb-4"
        >
          Експорти пакета
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Усі публічні експорти з{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/angular
          </code>
          :
        </p>
        <CodeBlock
          code={`// Components & directives
import {
  ReelComponent,
  ReelIndicatorComponent,
  RkReelItemDirective,
  RkSwipeToCloseDirective,
} from '@reelkit/angular';

// Types
import type {
  ReelApi,
  ReelContextValue,
  RkReelItemContext,
  CoreSignal,
  Subscribable,
  AnimatedValue,
  RangeExtractor,
  SliderDirection,
  Disposer,
  DisposableList,
  GestureController,
  SliderController,
  ContentLoadingController,
  ContentPreloader,
  ContentPreloaderConfig,
  SoundController,
  BodyLock,
  TransitionTransformFn,
  SlideTransformStyle,
  SwipeToCloseDirection,
} from '@reelkit/angular';

// Context
import { RK_REEL_CONTEXT } from '@reelkit/angular';

// Services
import { BodyLockService } from '@reelkit/angular';

// Signal bridges
import { toAngularSignal, animatedSignalBridge } from '@reelkit/angular';

// Core re-exports
import {
  // Signals & reactivity
  createSignal, createComputed, reaction, batch,

  // Transitions
  slideTransition, fadeTransition, flipTransition,
  cubeTransition, zoomTransition, getSlideProgress,

  // Content loading & preloading
  createContentLoadingController, createContentPreloader,

  // Sound
  createSoundController, syncMutedToVideo,

  // Fullscreen
  fullscreenSignal, requestFullscreen, exitFullscreen,

  // DOM & cleanup
  observeDomEvent, createDisposableList, createBodyLock, sharedBodyLock,

  // Focus management
  captureFocusForReturn, createFocusTrap, getFocusableElements,

  // Slider & gestures
  createSliderController, createGestureController,
  defaultRangeExtractor, createDefaultKeyExtractorForLoop,

  // Video
  captureFrame, createSharedVideo,

  // Utilities
  animate, noop, clamp, abs, first, last, extractRange,
} from '@reelkit/angular';`}
          language="typescript"
        />
      </section>
    </div>
  );
}
