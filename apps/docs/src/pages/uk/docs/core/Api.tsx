import { CodeBlock } from '../../../../components/ui/CodeBlock';
import { Heading } from '../../../../components/ui/Heading';
import { ukPageMeta } from '../../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/core/api',
    title: 'Довідник API ядра · ReelKit',
    description:
      'Повний API @reelkit/core: опції конфігурації, колбеки, методи, властивості стану, сигнали, стан в URL та відеоутиліти.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

const configOptions = [
  {
    property: 'count',
    type: 'number',
    default: 'required',
    description: 'Загальна кількість елементів',
  },
  {
    property: 'initialIndex',
    type: 'number',
    default: '0',
    description: 'Початковий індекс',
  },
  {
    property: 'direction',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: 'Напрямок прокручування',
  },
  {
    property: 'enableGestures',
    type: 'boolean',
    default: 'true',
    description:
      'Вмикає навігацію перетягуванням дотиком або мишею. Якщо false, контролер жестів не підключається.',
  },
  {
    property: 'enableNavKeys',
    type: 'boolean',
    default: 'true',
    description: 'Вмикає навігацію стрілками клавіатури',
  },
  {
    property: 'enableWheel',
    type: 'boolean',
    default: 'false',
    description: 'Вмикає колесо миші',
  },
  {
    property: 'wheelDebounceMs',
    type: 'number',
    default: '200',
    description: 'Час дебаунсу колеса',
  },
  {
    property: 'loop',
    type: 'boolean',
    default: 'false',
    description: 'Циклічна навігація',
  },
  {
    property: 'transitionDuration',
    type: 'number',
    default: '300',
    description: 'Тривалість анімації в мілісекундах',
  },
  {
    property: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: 'Поріг свайпу (0–1)',
  },
  {
    property: 'rangeExtractor',
    type: '(index: number, count: number, loop: boolean) => number[]',
    default: 'defaultRangeExtractor',
    description: 'Власна функція, що визначає, які індекси рендеряться',
  },
];

const callbacks = [
  {
    callback: 'onBeforeChange',
    type: '(index, nextIndex, rangeIndex) => void',
    description: 'Перед зміною слайда',
  },
  {
    callback: 'onAfterChange',
    type: '(index, rangeIndex) => void',
    description: 'Після зміни слайда',
  },
  {
    callback: 'onDragStart',
    type: '(index) => void',
    description: 'Перетягування почалося',
  },
  {
    callback: 'onDragEnd',
    type: '(index) => void',
    description: 'Перетягування завершилося',
  },
  {
    callback: 'onDragCanceled',
    type: '(index) => void',
    description: 'Перетягування скасовано',
  },
  {
    callback: 'onTap',
    type: '(event: GestureCommonEvent) => void',
    description: 'Одиночний дотик (із затримкою на вікно подвійного дотику)',
  },
  {
    callback: 'onDoubleTap',
    type: '(event: GestureCommonEvent) => void',
    description: 'Виявлено подвійний дотик',
  },
  {
    callback: 'onLongPress',
    type: '(event: GestureCommonEvent) => void',
    description: 'Виявлено довге натискання',
  },
  {
    callback: 'onLongPressEnd',
    type: '(event: GestureEvent) => void',
    description: 'Вказівник відпущено після довгого натискання',
  },
  {
    callback: 'onNavKeyPress',
    type: '(increment: -1 | 1) => void',
    description:
      'Власний обробник навігації стрілками. Замінює стандартну поведінку prev/next.',
  },
];

const methods = [
  {
    method: 'attach(element)',
    type: '(HTMLElement) => void',
    description: 'Підключає контролер до елемента DOM для розпізнавання жестів',
  },
  {
    method: 'detach()',
    type: '() => void',
    description:
      'Знімає обробники DOM (жести, клавіатура, колесо). Безпечно для повторного підключення через observe(). Використовуйте для очищення ефекту в React.',
  },
  {
    method: 'dispose()',
    type: '() => void',
    description:
      'Остаточне згортання: від’єднує всі контролери й прибирає спостерігачів сигналів. Використовуйте в Angular onDestroy.',
  },
  {
    method: 'observe()',
    type: '() => void',
    description:
      'Починає стежити за жестами, клавіатурою та колесом миші. Враховує прапорці конфігурації enableGestures, enableNavKeys та enableWheel.',
  },
  {
    method: 'unobserve()',
    type: '() => void',
    description: 'Припиняє стежити за жестами, клавіатурою та колесом миші',
  },
  {
    method: 'next()',
    type: '() => Promise<void>',
    description: 'Перейти до наступного слайда',
  },
  {
    method: 'prev()',
    type: '() => Promise<void>',
    description: 'Перейти до попереднього слайда',
  },
  {
    method: 'goTo(index, animate?)',
    type: '(number, boolean?) => Promise<void>',
    description: 'Перейти до конкретного слайда',
  },
  {
    method: 'adjust(duration?)',
    type: '(number?) => void',
    description: 'Перерахувати позиції слайдів',
  },
  {
    method: 'setPrimarySize(size)',
    type: '(number) => void',
    description: 'Оновити розмір контейнера',
  },
  {
    method: 'updateConfig(config)',
    type: '(Partial<SliderConfig>) => void',
    description: 'Оновити опції конфігурації',
  },
  {
    method: 'updateEvents(events)',
    type: '(Partial<SliderEvents>) => void',
    description:
      'Замінити обробники подій (наявні обробники, яких немає в переданих, зберігаються)',
  },
  {
    method: 'getRangeIndex()',
    type: '() => number',
    description:
      'Повертає позицію активного індексу в масиві видимого діапазону',
  },
];

const stateProperties = [
  {
    property: 'index',
    type: 'Signal<number>',
    description: 'Поточний індекс слайда',
  },
  {
    property: 'axisValue',
    type: 'Signal<AnimatedValue>',
    description: 'Поточне значення позиції по осі (анімоване)',
  },
  {
    property: 'indexes',
    type: 'ComputedSignal<number[]>',
    description: 'Видимі індекси для віртуалізації',
  },
];

export default function CoreApi() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Довідник API ядра</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Повний довідник{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/core
          </code>{' '}
          : конфігурація, колбеки, методи та стан.
        </p>
      </div>

      <section className="mb-12">
        <Heading
          level={2}
          id="slidercontroller-api"
          className="text-2xl font-bold mb-4"
        >
          API SliderController
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Ядро без прив’язки до фреймворку. Одна фабрика будує контролер із
          конфігурації та необов’язкових подій:{' '}
          <strong>Опції конфігурації</strong> — це конфігурація,{' '}
          <strong>Колбеки</strong> — події, а <strong>Методи</strong> — те, що
          надає повернений контролер.
        </p>

        <Heading
          level={3}
          id="factory-function"
          className="text-lg font-semibold mb-3"
        >
          Фабрична функція
        </Heading>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Експорт</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createSliderController
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '(config: SliderConfig, events?: SliderEvents) => SliderController'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Створює контролер слайдера. <code>config</code> обов’язковий
                  (опції нижче); <code>events</code> необов’язковий (колбеки
                  нижче). Повертає контролер, методи якого ним керують.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="config-options"
          className="text-lg font-semibold mb-3"
        >
          Опції конфігурації
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">
                  Властивість
                </th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Типове значення
                </th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {configOptions.map((p) => (
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
          level={3}
          id="callbacks"
          className="text-lg font-semibold mb-3"
        >
          Колбеки
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Колбек</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {callbacks.map((p) => (
                <tr
                  key={p.callback}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.callback}
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
        <Heading level={3} id="methods" className="text-lg font-semibold mb-3">
          Методи
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Метод</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((p) => (
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
          id="state-properties"
          className="text-2xl font-bold mb-4"
        >
          Властивості стану
        </Heading>
        <div className="overflow-x-auto">
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
              {stateProperties.map((p) => (
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
          id="range-extractor"
          className="text-2xl font-bold mb-4"
        >
          Екстрактор діапазону
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Експорт</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  defaultRangeExtractor
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  (index: number, count: number, loop: boolean) =&gt; number[]
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Стандартний екстрактор, який рендерить 3 елементи навколо
                  поточного індексу
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="signal-api" className="text-2xl font-bold mb-4">
          Signal API
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Легкі реактивні примітиви, які використовуються по всьому ядру.
        </p>

        <Heading
          level={3}
          id="signal-interface"
          className="text-lg font-semibold mb-3"
        >
          Інтерфейс Signal
        </Heading>
        <div className="overflow-x-auto mb-6">
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
                  value
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  T
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Читає або задає поточне значення. Запис сповіщає
                  спостерігачів, якщо значення змінилося.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  observe(callback)
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(callback: () => void) => () => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Реєструє слухача, що викликається на кожну зміну значення.
                  Повертає функцію звільнення, яка його знімає.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="factory-functions"
          className="text-lg font-semibold mb-3"
        >
          Фабричні функції
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Експорт</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createSignal
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'<T>(initial: T) => Signal<T>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Створює змінюваний реактивний сигнал
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createComputed
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '<T>(fn: () => T, deps: () => Subscribable[]) => ComputedSignal<T>'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Створює похідний обчислюваний сигнал. Другий аргумент —
                  фабрика залежностей, що повертає сигнали для стеження.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  reaction
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '(deps: () => Subscribable[], effect: () => void) => () => void'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Виконує побічний ефект, коли змінюється будь-який залежний
                  сигнал; повертає функцію звільнення. Значення сигналів читайте
                  всередині колбека ефекту.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  batch
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(fn: () => void) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Групує кілька оновлень сигналів в одне сповіщення; підтримує
                  вкладеність
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="transitions" className="text-2xl font-bold mb-4">
          Переходи
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Вбудовані функції переходів, які обчислюють CSS-перетворення для
          кожного слайда під час анімованої навігації. Передайте одну з них у
          пропс{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            transitionTransformFn
          </code>{' '}
          компонента фреймворку.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Експорт</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  TransitionTransformFn
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  type
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Сигнатура для власних функцій переходу
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  getSlideProgress
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '(axisValue: number, slideIndex: number, primarySize: number) => number'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Повертає нормалізоване зміщення (від -1 до 1) слайда відносно
                  області перегляду. Використовуйте у власних функціях переходу.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  slideTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  TransitionTransformFn
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Стандартний перехід зсувом (translateX/Y)
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  fadeTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  TransitionTransformFn
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Перехід плавним затуханням
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  flipTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  TransitionTransformFn
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  3D-перехід перевертанням картки
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  cubeTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  TransitionTransformFn
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  3D-перехід обертанням куба
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  zoomTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  TransitionTransformFn
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Перехід масштабуванням
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="content-loading"
          className="text-2xl font-bold mb-4"
        >
          Завантаження вмісту
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Утиліти для відстеження стану завантаження й помилок кожного слайда та
          попереднього завантаження медіа. Контролер завантаження звіряє індекс
          і відкидає застарілі колбеки від раніше активних слайдів. Попереднє
          завантаження використовує LRU-кеш (типово 200 завантажених, 100 з
          помилкою), тож повторний перехід до зіпсованого URL одразу показує
          помилку без нової спроби.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Експорт</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createContentLoadingController
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => ContentLoadingController'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Відстеження стану завантаження й помилок для кожного слайда
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createContentPreloader
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(config: ContentPreloaderConfig) => ContentPreloader'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Попереднє завантаження медіа з LRU-кешем і кешуванням помилок
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  observeMediaLoading
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '(video: HTMLVideoElement, callbacks: MediaLoadingCallbacks) => () => void'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Стежить за станом завантаження відео (playing, canplaythrough,
                  waiting). Повертає функцію звільнення.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="contentloadingcontroller"
          className="text-lg font-semibold mt-6 mb-3"
        >
          ContentLoadingController
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Експорт</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  isLoading
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'Signal<boolean>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Чи завантажується активний слайд
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  isError
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'Signal<boolean>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Чи сталася помилка на активному слайді
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  setActiveIndex
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(index: number) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Оновлює активний індекс і скидає стан завантаження та помилки
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onReady
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(index: number) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Позначає слайд готовим (ігнорується, якщо індекс не збігається
                  з активним)
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onWaiting
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(index: number) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Позначає слайд таким, що завантажується (ігнорується, якщо
                  індекс не збігається з активним)
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onError
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(index: number) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Позначає слайд помилковим (ігнорується, якщо індекс не
                  збігається з активним)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="contentpreloader"
          className="text-lg font-semibold mt-6 mb-3"
        >
          ContentPreloader
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Експорт</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  preload
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(src: string, type?: "image" | "video") => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Починає попереднє завантаження URL медіа
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  isLoaded
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(src: string) => boolean'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Перевіряє, чи URL є в LRU-кеші завантажених (максимум 200)
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  isErrored
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(src: string) => boolean'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Перевіряє, чи URL є в LRU-кеші помилок (максимум 100)
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  markLoaded
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(src: string) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Вручну позначає URL завантаженим
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  markErrored
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(src: string) => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Вручну позначає URL помилковим
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onLoaded
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(src: string, cb: () => void) => () => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Підписка на завершення завантаження; повертає функцію
                  звільнення
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="sound" className="text-2xl font-bold mb-4">
          Звук
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Спільний стан звуку для відтворення медіа. Контролер звуку дає
          реактивний сигнал muted, який можна синхронізувати з відеоелементами й
          перемикати з власних елементів керування.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Експорт</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createSoundController
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => SoundController'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Контролер спільного стану звуку
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  syncMutedToVideo
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '(video: HTMLVideoElement, sound: SoundController) => () => void'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Синхронізує сигнал muted із відеоелементом. Повертає функцію
                  звільнення.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="timeline" className="text-2xl font-bold mb-4">
          Таймлайн
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Контролер таймлайну відтворення для перемотування відео. Відстежує
          тривалість, поточний час, буферизовані діапазони та стан перемотування
          як реактивні сигнали. Один виклик навішує обробку вказівника й
          клавіатури на будь-який елемент DOM, і той поводиться як рідна смуга
          перемотування: із захопленням вказівника, живою перемоткою та повною
          підтримкою клавіатури (стрілки, Home/End, PageUp/PageDown).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Експорт</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createTimelineController
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(config?: TimelineControllerConfig) => TimelineController'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Фабрика, що повертає контролер із сигналами{' '}
                  <span className="font-mono text-xs">duration</span>,{' '}
                  <span className="font-mono text-xs">currentTime</span>,{' '}
                  <span className="font-mono text-xs">progress</span>,{' '}
                  <span className="font-mono text-xs">bufferedRanges</span>, та{' '}
                  <span className="font-mono text-xs">isScrubbing</span> та
                  методами <span className="font-mono text-xs">attach</span>,{' '}
                  <span className="font-mono text-xs">detach</span>,{' '}
                  <span className="font-mono text-xs">bindInteractions</span>,
                  та <span className="font-mono text-xs">seek</span> methods.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  TimelineControllerConfig
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  інтерфейс
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  <span className="font-mono text-xs">keyboardStepSeconds</span>{' '}
                  (default 5),{' '}
                  <span className="font-mono text-xs">
                    keyboardPageFraction
                  </span>{' '}
                  (типово 0.1) і{' '}
                  <span className="font-mono text-xs">onSeek</span>,{' '}
                  <span className="font-mono text-xs">onScrubStart</span>,{' '}
                  <span className="font-mono text-xs">onScrubEnd</span>{' '}
                  callbacks.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  BufferedRange
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'{ start: number; end: number }'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Одна суцільна буферизована ділянка у частках від 0 до 1
                  загальної тривалості. Видається відсортованою й без
                  перекриттів.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="fullscreen" className="text-2xl font-bold mb-4">
          Повний екран
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Кросбраузерні утиліти повного екрана із запобіжниками для вендорних
          префіксів Safari. Сигнал повного екрана — лінивий синглтон, що
          реактивно відстежує стан.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Експорт</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  fullscreenSignal
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'Signal<boolean>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Реактивний сигнал, що показує, чи документ у повноекранному
                  режимі
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  requestFullscreen
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(element: HTMLElement) => Promise<void>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Переводить заданий елемент у повний екран
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  exitFullscreen
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => Promise<void>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Виходить із повноекранного режиму
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="dom-cleanup-utilities"
          className="text-2xl font-bold mb-4"
        >
          Утиліти DOM та очищення
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Низькорівневі помічники для роботи з подіями DOM і передбачуваного
          очищення. Використовуються всередині всіх контролерів і доступні для
          власних інтеграцій.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Експорт</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  observeDomEvent
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(target, event, handler, options?) => () => void'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Додає обробник події DOM і повертає функцію звільнення, яка
                  його знімає
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createDisposableList
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => DisposableList'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Список для збирання функцій звільнення. Викличте dispose(),
                  щоб виконати їх усі одразу.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createBodyLock
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => BodyLock'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Блокування прокручування body з підрахунком посилань. Кілька
                  споживачів можуть блокувати одночасно; прокручування
                  повертається, коли всі розблокують.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  sharedBodyLock
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  BodyLock
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Синглтон на рівні модуля. Беріть його, коли кілька компонентів
                  застосунку мають ділити один лічильник посилань, щоб вкладені
                  модальні вікна й оверлеї коректно чергувалися. Прив’язки до
                  фреймворків (
                  <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                    @reelkit/react
                  </code>
                  ,{' '}
                  <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                    @reelkit/vue
                  </code>
                  ,{' '}
                  <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                    @reelkit/angular
                  </code>
                  ) використовують саме його під капотом.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="focus-management"
          className="text-2xl font-bold mb-4"
        >
          Керування фокусом
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Примітиви доступності діалогів без прив’язки до фреймворку. Пакети
          оверлеїв використовують їх, щоб повернути фокус на елемент-тригер
          після закриття й утримати Tab / Shift+Tab усередині відкритого
          оверлея. Безпечні для SSR: поза браузером кожен помічник повертає
          порожню функцію звільнення.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Експорт</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  captureFocusForReturn
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => Disposer'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Запам’ятовує елемент, який зараз у фокусі, і повертає функцію
                  звільнення, що знову його фокусує. За можливості: якщо елемент
                  уже видалено з DOM, функція нічого не робить.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createFocusTrap
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(container: HTMLElement) => Disposer'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Утримує Tab / Shift+Tab усередині <code>container</code>. Tab
                  на останньому фокусованому елементі переходить на перший;
                  Shift+Tab на першому — на останній; фокус, що вислизнув із
                  контейнера (клік поза ним, програмна установка), повертається
                  назад. Під час активації фокус у контейнер не переводиться —
                  це вирішує викликач.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  getFocusableElements
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(container: HTMLElement) => HTMLElement[]'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Повертає всіх нащадків, доступних із клавіатури, у порядку
                  DOM, пропускаючи вимкнені, приховані та{' '}
                  <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                    tabindex="-1"
                  </code>{' '}
                  елементи.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="usage"
          className="text-lg font-semibold mt-6 mb-2"
        >
          Використання
        </Heading>
        <CodeBlock
          language="typescript"
          code={`import { captureFocusForReturn, createFocusTrap } from '@reelkit/core';

// When your modal opens:
const restoreFocus = captureFocusForReturn();
container.focus({ preventScroll: true });
const releaseTrap = createFocusTrap(container);

// When the modal closes:
releaseTrap();
restoreFocus();`}
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="video-utilities"
          className="text-2xl font-bold mb-4"
        >
          Відеоутиліти
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Утиліти спільного відтворення відео між слайдами без прив’язки до
          фреймворку. Використовуються всередині{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-reel-player
          </code>{' '}
          та{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-lightbox
          </code>
          , доступні для власних прив’язок до фреймворків.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Експорт</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  captureFrame
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(video: HTMLVideoElement) => string | null'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Знімає поточний кадр відео як data URL у форматі JPEG.
                  Повертає null у разі помилок міждоменного доступу.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createSharedVideo
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(config: SharedVideoConfig) => SharedVideoInstance'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Створює обмежений областю синглтон спільного відео з мапами
                  позицій відтворення та знятих кадрів. Кожен споживач отримує
                  ізольований екземпляр — заради безперервності звуку на iOS.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  syncVideoObjectFit
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '(video: HTMLVideoElement, fallbackIsVertical: boolean) => Disposer'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Тримає{' '}
                  <span className="font-mono text-xs">
                    video.style.objectFit
                  </span>{' '}
                  синхронно з реальною орієнтацією відео. Одразу застосовує
                  запасне значення (із заявленого співвідношення сторін), а
                  потім на{' '}
                  <span className="font-mono text-xs">loadedmetadata</span>{' '}
                  читає справжні{' '}
                  <span className="font-mono text-xs">videoWidth</span> /{' '}
                  <span className="font-mono text-xs">videoHeight</span> і
                  перемикається на{' '}
                  <span className="font-mono text-xs">'cover'</span> для
                  портретного,{' '}
                  <span className="font-mono text-xs">'contain'</span> для
                  альбомного. Стійке до неправильно заявлених метаданих.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          Стан в URL
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Віддзеркалює один параметр запиту в сигнал і назад. Дві осі, кожна зі
          своєю задачею:{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            codec
          </code>{' '}
          — формат передавання (текст параметра ↔ стабільна ідентичність), а{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locator
          </code>{' '}
          — пошук (де ця ідентичність лежить у колекції).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Експорт</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createUrlStateController
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '({ param, adapter?, codec?, locator? }) => UrlStateController'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Віддзеркалює один параметр запиту в сигнал і записує зміни
                  назад в URL. Перший запис відсутнього параметра додає один
                  запис в історію; кожен наступний його замінює. Якщо передано{' '}
                  <code className="font-mono text-xs">codec</code> or{' '}
                  <code className="font-mono text-xs">locator</code> він також
                  виводить{' '}
                  <code className="font-mono text-xs">
                    position: Signal&lt;Pos | null&gt;
                  </code>
                  , застосовуючи засувку відкриття й закриття та самовідновлення
                  параметра, який не називає жодного слайда — тож кожна
                  прив’язка підписується, а не виводить це заново.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createHistoryAdapter
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => UrlAdapter'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Типовий адаптер над History API. Застосунок із роутером має
                  передати власний, інакше місцеположення роутера застаріє і
                  наступна навігація втратить параметр.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  indexCodec
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'UrlCodec<number>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Читає <code className="font-mono text-xs">?photo=3</code> як
                  слайд 3. Передайте його, щоб отримати виведення індексу без
                  власного кодека. Для нескінченного або посторінкового списку
                  передайте <code className="font-mono text-xs">locator</code> —
                  параметр переживає очікування проміса, тож пряме посилання на
                  незавантажену сторінку не зникає посеред запиту.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createIndexLocator
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(countGetter: () => number) => UrlLocator<number>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Типовий локатор за індексом: позиція слайда відповідає сама
                  собі, обмежена живою кількістю, яку повертає геттер. Індекс
                  поза межами дає{' '}
                  <code className="font-mono text-xs">null</code>, тож
                  застарілий{' '}
                  <code className="font-mono text-xs">?photo=99</code> сам
                  зникає з URL — він відхиляється, а не підганяється до
                  найближчого слайда, бо той відкрив би не те, що називав URL.
                  Геттер, а не число, тож межа читає поточний розмір під час
                  пошуку, поки посторінкова галерея росте.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  urlIndexKey
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(countGetter, locateAsync?) => UrlKey<number>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Узгоджена пара для галереї з адресацією за індексом:{' '}
                  <code className="font-mono text-xs">indexCodec</code> плюс{' '}
                  <code className="font-mono text-xs">createIndexLocator</code>{' '}
                  , прив’язаний до розміру галереї. Розгортайте його (
                  <code className="font-mono text-xs">
                    {'{ param, ...urlIndexKey(() => count) }'}
                  </code>
                  ), щоб кодек не розійшовся з локатором. Передайте другий
                  аргумент{' '}
                  <code className="font-mono text-xs">locateAsync</code> , щоб
                  гортати посторінкову стрічку вікнами — якщо не знайшлося,
                  дотягнути сторінки до потрібного індексу й повернути його.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  urlIndexTwoAxisKey
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(opts) => UrlKey<TwoAxisIdentity, TwoAxisPosition>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Як <code className="font-mono text-xs">urlIndexKey</code> але
                  для двовісного плеєра: один суворо крапковий параметр{' '}
                  <code className="font-mono text-xs">
                    ?p=&lt;outer&gt;.&lt;inner&gt;
                  </code>{' '}
                  , який дає{' '}
                  <code className="font-mono text-xs">TwoAxisPosition</code>{' '}
                  <code className="font-mono text-xs">
                    {'{ outer, inner }'}
                  </code>
                  . Опції (
                  <code className="font-mono text-xs">
                    UrlIndexTwoAxisKeyOptions
                  </code>
                  ): <code className="font-mono text-xs">outerCount</code>,{' '}
                  <code className="font-mono text-xs">innerCounts</code>,
                  необов’язковий{' '}
                  <code className="font-mono text-xs">outerCodec</code>/
                  <code className="font-mono text-xs">outerLocator</code> для
                  зовнішньої осі, а{' '}
                  <code className="font-mono text-xs">innerCodec</code>/
                  <code className="font-mono text-xs">innerLocate</code>/
                  <code className="font-mono text-xs">innerIdentify</code> — щоб
                  адресувати внутрішню вісь теж за id. Кожна вісь типово
                  обмежена простим індексом. На цьому працює плеєр історій,
                  керований URL.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createStableIdCodec
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(hashCodec?: UrlCodec<string>) => UrlCodec<string>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Кодек зі стабільним <strong>формат передавання</strong>,
                  експортований для складання — текстом параметра є{' '}
                  <code className="font-mono text-xs">id</code>елемента,
                  записаний як є або перетворений через{' '}
                  <code className="font-mono text-xs">hashCodec</code>{' '}
                  (передайте{' '}
                  <code className="font-mono text-xs">base64UrlCodec</code> для
                  оборотного base64url). Аналог{' '}
                  <code className="font-mono text-xs">indexCodec</code>зі
                  стабільним id: поєднайте його з власним локатором замість
                  того, щоб брати цілий{' '}
                  <code className="font-mono text-xs">urlStableIdKey</code>.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  base64UrlCodec
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'UrlCodec<string>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Готовий механізм хешування для ключа зі стабільним id:
                  оборотний base64url (безпечний для URL алфавіт, без
                  доповнення, UTF-8) — <strong>не</strong> криптографічний хеш.
                  Передайте його як{' '}
                  <code className="font-mono text-xs">hashCodec</code> , щоб
                  замаскувати id в URL, або реалізуйте власний{' '}
                  <code className="font-mono text-xs">
                    UrlCodec&lt;string&gt;
                  </code>{' '}
                  , щоб підключити іншу схему.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  createStableIdLocator
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(items, locateAsync?) => UrlLocator<string, number>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Кодек зі стабільним <strong>пошук</strong>, експортований для
                  складання — сканує{' '}
                  <code className="font-mono text-xs">items()</code> у пошуках
                  відповідного <code className="font-mono text-xs">id</code>;
                  зниклий id дає <code className="font-mono text-xs">null</code>{' '}
                  і самовідновлюється. Необов’язковий{' '}
                  <code className="font-mono text-xs">locateAsync</code> гортає
                  посторінкову стрічку вікнами. Аналог зі стабільним id для{' '}
                  <code className="font-mono text-xs">createIndexLocator</code>.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  urlStableIdKey
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(opts) => UrlKey<string, number>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Адресує галерею за стабільним{' '}
                  <code className="font-mono text-xs">id</code> —{' '}
                  <code className="font-mono text-xs">?photo=&lt;id&gt;</code>{' '}
                  кожного елемента — замість позиції, тож закладка переживає
                  зміну порядку списку. Опції (
                  <code className="font-mono text-xs">
                    UrlStableIdKeyOptions
                  </code>
                  ): <code className="font-mono text-xs">items</code> (живий
                  геттер), необов’язковий{' '}
                  <code className="font-mono text-xs">hashCodec</code>{' '}
                  (передайте{' '}
                  <code className="font-mono text-xs">base64UrlCodec</code>, щоб
                  перетворити id у параметрі, необов’язковий{' '}
                  <code className="font-mono text-xs">locateAsync</code> , щоб
                  гортати посторінкову стрічку вікнами (якщо не знайшлося —
                  вантажити, доки id не з’явиться, і повернути його індекс).
                  Обирайте замість{' '}
                  <code className="font-mono text-xs">urlIndexKey</code> , коли
                  список може змінитися під надісланим посиланням.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  urlStableIdTwoAxisKey
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'(opts) => UrlKey<TwoAxisIdentity<string>, TwoAxisPosition>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Двовісний аналог: зовнішня вісь за стабільним id, внутрішня —
                  за локальним індексом:{' '}
                  <code className="font-mono text-xs">?story=user_42.3</code>.
                  Передайте{' '}
                  <code className="font-mono text-xs">innerItems</code> замість{' '}
                  <code className="font-mono text-xs">innerCounts</code> щоб
                  адресувати внутрішню теж за id (
                  <code className="font-mono text-xs">
                    ?story=user_42.photo_7
                  </code>
                  ); <code className="font-mono text-xs">hashCodec</code> (e.g.{' '}
                  <code className="font-mono text-xs">base64UrlCodec</code>)
                  перетворює обидва id. Опції{' '}
                  <code className="font-mono text-xs">
                    UrlStableIdTwoAxisKeyOptions
                  </code>{' '}
                  (внутрішня за індексом) або{' '}
                  <code className="font-mono text-xs">
                    UrlStableIdTwoAxisIdInnerOptions
                  </code>{' '}
                  (внутрішня за id); типи елементів задовольняють{' '}
                  <code className="font-mono text-xs">Identified</code> (
                  <code className="font-mono text-xs">{'{ id: string }'}</code>
                  ).
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  {'UrlCodec<Id>'}
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'{ decode(raw) => Id | null; encode(id) => string }'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Формат передавання: текст параметра ↔ стабільна ідентичність,
                  незалежно від колекції.{' '}
                  <code className="font-mono text-xs">decode</code> що повертає{' '}
                  <code className="font-mono text-xs">null</code> означає
                  зіпсований текст.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  {'UrlLocator<Id>'}
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '{ locate(id) => number | null; locateAsync?(id) => Promise<number | null>; identify(index) => id }'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Пошук: де ідентичність лежить у колекції.{' '}
                  <code className="font-mono text-xs">locate</code> синхронний,{' '}
                  <code className="font-mono text-xs">locateAsync</code> —
                  запасний варіант для посторінкового списку, а{' '}
                  <code className="font-mono text-xs">identify</code> перетворює
                  індекс назад в ідентичність для запису.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  {'UrlKey<Id>'}
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'{ codec: UrlCodec<Id>; locator: UrlLocator<Id> }'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Узгоджена пара кодек + локатор для одного параметра. Вони
                  мають однаковий <code className="font-mono text-xs">Id</code>{' '}
                  і завжди йдуть разом — кодек записує ідентичність в URL,
                  локатор знаходить, де вона лежить, — тож саме побудова парою
                  не дає їм розійтися.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  UrlAdapter
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'{ read, subscribe, push, replace, getState, goBack }'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Точка підключення роутера. Застосунок із роутером має надати
                  свій, інакше власне місцеположення роутера застаріє.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  {'UrlStateOptions<Id>'}
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '{ param: string; adapter?: UrlAdapter; codec?: UrlCodec<Id>; locator?: UrlLocator<Id> }'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Опції, які приймає{' '}
                  <code className="font-mono text-xs">
                    createUrlStateController
                  </code>{' '}
                  , — експортовані, щоб споживач міг типізувати конфігурацію,
                  зібрану окремо, перед передаванням.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
