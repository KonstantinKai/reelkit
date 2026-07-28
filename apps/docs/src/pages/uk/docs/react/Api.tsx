import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../../components/ui/CodeBlock';
import { Heading } from '../../../../components/ui/Heading';
import { ukPageMeta } from '../../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/react/api',
    title: 'Довідник API для React · ReelKit',
    description:
      'Повний API @reelkit/react: властивості Reel, методи ReelApi, ReelIndicator, компоненти-спостерігачі та утиліти.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

const reelProps = [
  {
    prop: 'count',
    type: 'number',
    default: 'required',
    description: 'Загальна кількість елементів',
  },
  {
    prop: 'size',
    type: '[number, number]',
    default: '-',
    description:
      'Ширина й висота у вигляді [width, height]. Якщо не задано, вимірюється автоматично через ResizeObserver',
  },
  {
    prop: 'itemBuilder',
    type: '(index, indexInRange, size) => ReactElement',
    default: 'required',
    description: 'Функція, що рендерить кожен слайд',
  },
  {
    prop: 'direction',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: 'Напрямок прокручування',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: 'Початковий індекс',
  },
  {
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description: 'Вмикає нескінченний цикл',
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
    prop: 'enableNavKeys',
    type: 'boolean',
    default: 'true',
    description: 'Вмикає навігацію з клавіатури',
  },
  {
    prop: 'onNavKeyPress',
    type: '(increment: -1 | 1) => void',
    default: '-',
    description:
      'Власний обробник навігації стрілками. Замінює стандартну поведінку prev/next.',
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
    prop: 'enableGestures',
    type: 'boolean',
    default: 'true',
    description: 'Вмикає навігацію перетягуванням дотиком або мишею',
  },
  {
    prop: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: 'Поріг свайпу (0–1)',
  },
  {
    prop: 'rangeExtractor',
    type: '(index: number, count: number) => number[]',
    default: 'defaultRangeExtractor',
    description: 'Власна функція, що визначає, які індекси рендеряться',
  },
  {
    prop: 'keyExtractor',
    type: '(index: number) => string',
    default: '-',
    description:
      'Власна функція ключів для звіряння в React (корисно з циклом)',
  },
  {
    prop: 'apiRef',
    type: 'RefObject<ReelApi>',
    default: '-',
    description: 'Ref для доступу до методів API',
  },
  {
    prop: 'className',
    type: 'string',
    default: '-',
    description: 'Клас CSS для елемента-контейнера',
  },
  {
    prop: 'style',
    type: 'CSSProperties',
    default: '-',
    description: 'Вбудовані стилі для елемента-контейнера',
  },
  {
    prop: 'ariaLabel',
    type: 'string',
    default: '-',
    description: 'Доступна назва області каруселі, яку читають екранні читачі',
  },
];

const callbacks = [
  {
    prop: 'afterChange',
    type: '(index, indexInRange) => void',
    description: 'Викликається після завершення зміни слайда',
  },
  {
    prop: 'beforeChange',
    type: '(index, nextIndex, indexInRange) => void',
    description: 'Викликається перед початком зміни слайда',
  },
  {
    prop: 'onSlideDragStart',
    type: '(index) => void',
    description: 'Викликається на початку перетягування',
  },
  {
    prop: 'onSlideDragEnd',
    type: '(index) => void',
    description: 'Викликається після завершення перетягування',
  },
  {
    prop: 'onSlideDragCanceled',
    type: '(index) => void',
    description: 'Викликається, коли перетягування скасовано',
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
    type: '(number, boolean?) => Promise',
    description: 'Перейти до конкретного слайда',
  },
  {
    method: 'adjust()',
    type: '() => void',
    description: 'Перерахувати позиції слайдів',
  },
  {
    method: 'observe()',
    type: '() => void',
    description: 'Починає стежити за клавіатурою',
  },
  {
    method: 'unobserve()',
    type: '() => void',
    description: 'Припиняє стежити за клавіатурою',
  },
];

const indicatorProps = [
  {
    prop: 'count',
    type: 'number',
    default: 'auto',
    description:
      'Загальна кількість елементів. Береться від батьківського Reel, якщо компонент вкладений у нього; передавайте явно за окремого використання',
  },
  {
    prop: 'active',
    type: 'number',
    default: 'auto',
    description:
      'Поточний активний індекс. Береться від батьківського Reel, якщо компонент вкладений у нього; передавайте явно за окремого використання',
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
    description: 'Розмір точки в пікселях',
  },
  {
    prop: 'visible',
    type: 'number',
    default: '5',
    description: 'Максимум видимих точок звичайного розміру',
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
    description: 'Масштаб крайніх точок за межами видимого',
  },
  {
    prop: 'onDotClick',
    type: '(index: number) => void',
    default: '-',
    description: 'Колбек на клік по точці',
  },
  {
    prop: 'className',
    type: 'string',
    default: '-',
    description: 'Власний клас CSS',
  },
  {
    prop: 'style',
    type: 'CSSProperties',
    default: '-',
    description: 'Власні вбудовані стилі',
  },
];

const observeProps = [
  {
    prop: 'signals',
    type: 'Subscribable[]',
    default: 'required',
    description:
      'Сигнали для підписки. Сповіщення від будь-якого з них перезапускає функцію children — і лише її, ніколи батьківський компонент.',
  },
  {
    prop: 'children',
    type: '() => ReactElement | null',
    default: 'required',
    description:
      'Функція рендерингу, що виконується заново на кожну зміну. Читайте значення сигналів усередині неї; прочитане ззовні захоплюється один раз і застаріває.',
  },
];

const animatedObserveProps = [
  {
    prop: 'signal',
    type: 'Signal<AnimatedValue>',
    default: 'required',
    description:
      'Сигнал, що видає { value, duration, done? }. Тривалість більша за 0 інтерполює від поточного значення до нового; 0 переходить одразу.',
  },
  {
    prop: 'children',
    type: '(value: number) => ReactElement',
    default: 'required',
    description:
      'Функція рендерингу отримує інтерпольоване значення для поточного кадру, застосоване синхронно, щоб DOM встигав за анімацією.',
  },
];

const overlayUrlStateOptions = [
  {
    prop: 'param',
    type: 'string',
    default: 'required',
    description: 'Параметр запиту, що несе активний слайд, наприклад "photo".',
  },
  {
    prop: 'adapter',
    type: 'UrlAdapter',
    default: 'History API',
    description:
      'Система навігації, через яку читати й писати. У застосунку з роутером передайте адаптер на його базі, щоб власне місцеположення роутера не застаріло.',
  },
  {
    prop: 'codec',
    type: '{ decode(raw) => Id | null; encode(id) => string }',
    default: 'required',
    description:
      'Формат передавання: текст параметра ↔ стабільна ідентичність, незалежно від колекції. Іде разом із локатором як узгоджена пара з однаковим Id — розгорніть ...urlIndexKey(() => images.length) для типової галереї з ?photo=3 або передайте власний (base64, slug), щоб закладка пережила зміну порядку галереї.',
  },
  {
    prop: 'locator',
    type: '{ locate(id) => number | null; locateAsync?(id) => Promise<number | null>; identify(index) => id }',
    default: 'required',
    description:
      'Зіставляє ідентичність із позицією і сам відповідає за свою чинність: locate (синхронно), locateAsync (запасний варіант для посторінкової галереї), identify (для запису). Для звичайної галереї за індексом розгорніть ...urlIndexKey(() => images.length) — він дає цей локатор разом із відповідним кодеком і обмежує ?photo=3 живою кількістю, тож застарілий ?photo=99 сам зникає з URL замість того, щоб відкрити слайд, якого ніхто не називав. Посторінкова стрічка або галерея з адресацією за ідентичністю передає власну узгоджену пару кодек + локатор.',
  },
];

export default function ReactApi() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Довідник API для React</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Повний довідник{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react
          </code>{' '}
          : компоненти, пропси та методи.
        </p>
      </div>

      <section className="mb-12">
        <Heading level={2} id="reel-props" className="text-2xl font-bold mb-4">
          Пропси Reel
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelProps
          </code>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Prop</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Типове значення
                </th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {reelProps.map((p) => (
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
        <Heading level={2} id="callbacks" className="text-2xl font-bold mb-4">
          Колбеки
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Prop</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {callbacks.map((p) => (
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
          id="reelapi-methods"
          className="text-2xl font-bold mb-4"
        >
          Методи ReelApi
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Доступ до методів слайдера через{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            apiRef
          </code>
          :
        </p>
        <CodeBlock
          code={`const apiRef = useRef<ReelApi>(null);

// Navigation
apiRef.current?.next();
apiRef.current?.prev();
apiRef.current?.goTo(5);           // instant
apiRef.current?.goTo(5, true);     // animated

// Lifecycle
apiRef.current?.adjust();          // recalculate positions
apiRef.current?.observe();         // start observing keyboard
apiRef.current?.unobserve();       // stop observing keyboard`}
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
          id="reelindicator-props"
          className="text-2xl font-bold mb-4"
        >
          Пропси ReelIndicator
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelIndicatorProps
          </code>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Prop</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Типове значення
                </th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {indicatorProps.map((p) => (
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
        <Heading
          level={2}
          id="observer-components"
          className="text-2xl font-bold mb-4"
        >
          Компоненти-спостерігачі
        </Heading>

        <Heading level={3} id="observe" className="text-lg font-semibold mb-2">
          Observe
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Містить між сигналами ядра й рендерингом React без зайвих рендерів
          батька. Коли підписані сигнали змінюються, виконується заново лише
          функція children.
        </p>
        <CodeBlock
          code={`import { Observe } from '@reelkit/react';

<Observe signals={[controller.state.index]}>
  {() => <span>Current: {controller.state.index.value}</span>}
</Observe>`}
          language="tsx"
        />
        <div className="overflow-x-auto mt-4 mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Prop</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Типове значення
                </th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {observeProps.map((row) => (
                <tr
                  key={row.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {row.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {row.type}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {row.default}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="animatedobserve"
          className="text-lg font-semibold mt-6 mb-2"
        >
          AnimatedObserve
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Підписується на сигнали анімованих значень і плавно інтерполює через{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            requestAnimationFrame
          </code>
          .
        </p>
        <CodeBlock
          code={`import { AnimatedObserve } from '@reelkit/react';

<AnimatedObserve signal={controller.state.axisValue}>
  {(value) => (
    <div style={{ transform: \`translateY(\${value}px)\` }} />
  )}
</AnimatedObserve>`}
          language="tsx"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Prop</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Типове значення
                </th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {animatedObserveProps.map((row) => (
                <tr
                  key={row.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {row.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {row.type}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {row.default}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="hooks" className="text-2xl font-bold mb-4">
          Hooks
        </Heading>

        <Heading
          level={3}
          id="usebodylock"
          className="text-lg font-semibold mb-2"
        >
          useBodyLock
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Блокує прокручування body й компенсує зсув на ширину смуги
          прокручування.
        </p>
        <CodeBlock
          code={`import { useBodyLock } from '@reelkit/react';

// Lock body scroll when overlay is open
useBodyLock(isOpen);`}
          language="typescript"
        />

        <Heading
          level={3}
          id="useoverlayurlstate"
          className="text-lg font-semibold mt-6 mb-2"
        >
          useOverlayUrlState
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            OverlayUrlStateOptions
          </code>
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Будує контролер стану в URL для оверлея, який ви передаєте в{' '}
          <code>*UrlOverlay</code> як його <code>controller</code> prop.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          See{' '}
          <Link
            to="/uk/docs/react/guide#url-state"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Стан в URL у посібнику для React
          </Link>{' '}
          — там покроковий розбір і приклади.
        </p>
        <div className="overflow-x-auto mt-4">
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
              {overlayUrlStateOptions.map((p) => (
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
          id="usereactrouterurladapter"
          className="text-lg font-semibold mt-6 mb-2"
        >
          useReactRouterUrlAdapter
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          A <code>UrlAdapter</code> на базі React Router. Передайте його як
          опцію <code>adapter</code> у <code>useOverlayUrlState</code> у
          застосунку з роутером, щоб роутер лишався єдиним джерелом правди про
          навігацію: запис <code>history.pushState</code> повз роутер лишає його
          місцеположення застарілим, і наступна навігація втрачає параметр.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Постачається з окремого підшляху, тож застосунок без роутера ніколи не
          тягне <code>react-router-dom</code> у свій бандл.{' '}
          <code>react-router-dom</code> — необов’язкова peer-залежність.
        </p>
        <CodeBlock
          code={`import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';

const adapter = useReactRouterUrlAdapter();
const photo = useOverlayUrlState({
  param: 'photo',
  adapter,
  ...urlIndexKey(() => images.length),
});`}
          language="tsx"
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
            &lt;Reel&gt;
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
          , щоб дати області назву для екранного читача. Ввічлива жива область
          оголошує «Слайд N з M» на кожну зміну слайда, не перерендерюючи
          карусель. Неактивні слайди отримують атрибут{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            inert
          </code>{' '}
          , тож фокус і навігація допоміжних технологій їх пропускають.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            &lt;ReelIndicator&gt;
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
            &lt;Reel&gt;
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
            @reelkit/react
          </code>{' '}
          для повернення й утримання фокуса.
        </p>
      </section>

      <section>
        <Heading level={2} id="utilities" className="text-2xl font-bold mb-4">
          Utilities
        </Heading>

        <Heading
          level={3}
          id="createdefaultkeyextractorforloop"
          className="text-lg font-semibold mb-2"
        >
          createDefaultKeyExtractorForLoop
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Створює екстрактор ключів, який дає раду однаковим індексам, коли{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            loop
          </code>{' '}
          увімкнено.
        </p>
        <CodeBlock
          code={`import { createDefaultKeyExtractorForLoop } from '@reelkit/react';

<Reel
  count={items.length}
  size={size}
  loop
  keyExtractor={createDefaultKeyExtractorForLoop(items.length)}
  itemBuilder={...}
/>`}
          language="tsx"
        />
      </section>
    </div>
  );
}
