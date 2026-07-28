import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../../components/ui/CodeBlock';
import { Heading } from '../../../../components/ui/Heading';
import { ukPageMeta } from '../../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/vue/api',
    title: 'Довідник API для Vue · ReelKit',
    description:
      'Повний API @reelkit/vue: властивості та події Reel, ReelExpose, композабли, SwipeToClose і експорти пакета.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

const reelProps = [
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
    type: '(index: number, indexInRange: number) => string',
    default: 'index => index.toString()',
    description:
      'Власна функція ключів для рендерингу слайдів (корисно з циклом)',
  },
  {
    prop: 'ariaLabel',
    type: 'string',
    default: 'undefined',
    description: 'Доступна назва області каруселі',
  },
  {
    prop: 'reelStyle',
    type: 'Record<string, string | number>',
    default: 'undefined',
    description: 'Вбудовані стилі для кореневого контейнера',
  },
  {
    prop: 'reelClass',
    type: 'string | Array | Object',
    default: 'undefined',
    description: 'Класи CSS для кореневого контейнера',
  },
  {
    prop: 'onNavKeyPress',
    type: '(increment: -1 | 1) => void',
    default: 'undefined',
    description:
      'Пропс-колбек, що замінює стандартну навігацію стрілками вгору й вниз. Якщо його передати, навігацію реалізуєте ви самі (наприклад, викликаєте reelRef.value.next()). Не передавайте, щоб лишити стандартну поведінку.',
  },
];

const reelEmits = [
  {
    event: 'beforeChange',
    payload: '(index: number, nextIndex: number, indexInRange: number)',
    description: 'Видається перед початком переходу між слайдами',
  },
  {
    event: 'afterChange',
    payload: '(index: number, indexInRange: number)',
    description: 'Видається після завершення переходу між слайдами',
  },
  {
    event: 'slideDragStart',
    payload: '(index: number)',
    description: 'Видається на початку перетягування',
  },
  {
    event: 'slideDragEnd',
    payload: '(index: number)',
    description:
      'Видається, коли перетягування завершується (палець або кнопку відпустили)',
  },
  {
    event: 'slideDragCanceled',
    payload: '(index: number)',
    description:
      'Видається, коли перетягування скасовано (слайд повертається назад)',
  },
  {
    event: 'tap',
    payload: '(event: GestureCommonEvent)',
    description: 'Видається на одиночний дотик',
  },
  {
    event: 'doubleTap',
    payload: '(event: GestureCommonEvent)',
    description: 'Видається на подвійний дотик',
  },
  {
    event: 'longPress',
    payload: '(event: GestureCommonEvent)',
    description: 'Видається на початку довгого натискання',
  },
  {
    event: 'longPressEnd',
    payload: '(event: GestureEvent)',
    description: 'Видається після завершення довгого натискання',
  },
];

const exposeMethods = [
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
    description: 'Почати слухати події жестів, клавіатури та колеса',
  },
  {
    method: 'unobserve()',
    type: '() => void',
    description: 'Припинити слухати події жестів, клавіатури та колеса',
  },
];

const indicatorProps = [
  {
    prop: 'count',
    type: 'number | undefined',
    default: 'auto',
    description:
      'Загальна кількість елементів. Береться з контексту батьківського Reel, якщо компонент вкладений у нього; передавайте явно за окремого використання',
  },
  {
    prop: 'active',
    type: 'number | undefined',
    default: 'auto',
    description:
      'Поточний активний індекс. Береться з контексту батьківського Reel, якщо компонент вкладений у нього; передавайте явно за окремого використання',
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
    default: "'rgba(255, 255, 255, 0.5)'",
    description: 'Колір неактивної точки',
  },
  {
    prop: 'edgeScale',
    type: 'number',
    default: '0.5',
    description: 'Коефіцієнт масштабу крайніх точок за межами видимого',
  },
  {
    prop: 'onDotClick',
    type: '(index: number) => void',
    default: 'undefined',
    description:
      'Власний обробник кліку. Якщо не задано всередині Reel, типово відбувається перехід до індексу натиснутої точки',
  },
  {
    prop: 'indicatorClass',
    type: 'string | Array | Object',
    default: 'undefined',
    description: 'Класи CSS для кореневого елемента tablist',
  },
  {
    prop: 'indicatorStyle',
    type: 'CSSProperties',
    default: 'undefined',
    description: 'Вбудовані стилі, додані до кореневого елемента tablist',
  },
];

const indicatorEmits = [
  {
    event: 'dotClick',
    payload: '(index: number)',
    description: 'Видається на клік по точці; передає індекс точки',
  },
];

const swipeToCloseProps = [
  {
    prop: 'direction',
    type: "'up' | 'down'",
    default: 'required',
    description:
      'Напрямок свайпу, що закриває. Беріть "up" для Lightbox й "down" для історій',
  },
  {
    prop: 'enabled',
    type: 'boolean',
    default: 'true',
    description: 'Чи активний жест свайпу для закриття',
  },
  {
    prop: 'threshold',
    type: 'number',
    default: '0.2',
    description: 'Частка висоти області перегляду, потрібна для закриття (0–1)',
  },
];

const swipeToCloseEmits = [
  {
    event: 'close',
    payload: '()',
    description:
      'Видається, коли свайп перевищує поріг і анімація закриття завершилася',
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
      'Формат передавання: текст параметра ↔ стабільна ідентичність, незалежно від колекції. Іде разом із локатором як узгоджена пара з однаковим Id — розгорніть ...urlIndexKey(() => props.images.length) для типової галереї з ?photo=3 або передайте власний (base64, slug), щоб закладка пережила зміну порядку галереї.',
  },
  {
    prop: 'locator',
    type: '{ locate(id) => number | null; locateAsync?(id) => Promise<number | null>; identify(index) => id }',
    default: 'required',
    description:
      'Зіставляє ідентичність із позицією і сам відповідає за свою чинність: locate (синхронно), locateAsync (запасний варіант для посторінкової галереї), identify (для запису). Для звичайної галереї за індексом розгорніть ...urlIndexKey(() => props.images.length) — він дає цей локатор разом із відповідним кодеком і обмежує ?photo=3 живою кількістю, тож застарілий ?photo=99 сам зникає з URL замість того, щоб відкрити слайд, якого ніхто не називав. Передавайте геттер, а не число: setup у Vue виконується один раз, і захоплена довжина застаріла б, поки посторінкова стрічка росте. Посторінкова стрічка або галерея з адресацією за ідентичністю передає власну узгоджену пару кодек + локатор.',
  },
];

export default function VueApi() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Довідник API для Vue</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Повний довідник{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue
          </code>{' '}
          : компоненти, композабли та утиліти.
        </p>
      </div>

      <section className="mb-12">
        <Heading level={2} id="reel" className="text-2xl font-bold mb-2">
          Reel
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Тег:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<Reel>'}
          </code>
        </p>
        <Heading level={3} id="props" className="text-lg font-semibold mb-3">
          Props
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
        <Heading level={3} id="events" className="text-lg font-semibold mb-3">
          Events
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Event</th>
                <th className="text-left py-3 px-4 font-semibold">Payload</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {reelEmits.map((p) => (
                <tr
                  key={p.event}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.event}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.payload}
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
        <Heading level={3} id="slots" className="text-lg font-semibold mb-3">
          Slots
        </Heading>
        <CodeBlock
          code={`<Reel :count="items.length">
  <template #item="{ index, indexInRange, size }">
    <!-- index       : number         — absolute slide index (0 to count-1) -->
    <!-- indexInRange : number         — position in the visible window (0, 1, or 2) -->
    <!-- size         : [number,number] — [width, height] of the container -->
    <MySlide :index="index" :size="size" />
  </template>

  <!-- default slot: overlay content rendered on top of the slides -->
  <ReelIndicator />
</Reel>`}
          language="vue-html"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Slot</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Властивості області слота
                </th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  #item
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {
                    '{ index: number, indexInRange: number, size: [number, number] }'
                  }
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Рендерить кожен видимий слайд. Викликається для кожного
                  індексу у віртуалізованому діапазоні
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  default
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  none
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Вміст оверлея поверх усіх слайдів (індикатори, елементи
                  керування тощо)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="reelexpose" className="text-2xl font-bold mb-4">
          ReelExpose
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Імперативний API, доступний через шаблонний ref:
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { ref } from 'vue';
import { Reel, type ReelExpose } from '@reelkit/vue';

const reelRef = ref<ReelExpose | null>(null);

function prev()  { reelRef.value?.prev(); }
function next()  { reelRef.value?.next(); }
function jump(i: number) { reelRef.value?.goTo(i, true); }
</script>

<template>
  <Reel ref="reelRef" :count="100">
    <template #item="{ index }">
      <div>Slide {{ index }}</div>
    </template>
  </Reel>
</template>`}
          language="vue"
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
              {exposeMethods.map((p) => (
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
          id="reelindicator"
          className="text-2xl font-bold mb-2"
        >
          ReelIndicator
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Тег:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<ReelIndicator>'}
          </code>
        </p>
        <Heading level={3} id="props" className="text-lg font-semibold mb-3">
          Props
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
        <Heading
          level={3}
          id="events"
          className="text-lg font-semibold mt-6 mb-3"
        >
          Events
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Event</th>
                <th className="text-left py-3 px-4 font-semibold">Payload</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {indicatorEmits.map((p) => (
                <tr
                  key={p.event}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.event}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.payload}
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
          id="swipetoclose"
          className="text-2xl font-bold mb-2"
        >
          SwipeToClose
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Тег:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<SwipeToClose>'}
          </code>{' '}
          — загортає свій типовий слот у контейнер, чутливий до дотику, який
          можна закрити свайпом.
        </p>
        <Heading level={3} id="props" className="text-lg font-semibold mb-3">
          Props
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SwipeToCloseProps
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
              {swipeToCloseProps.map((p) => (
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
          id="events"
          className="text-lg font-semibold mt-6 mb-3"
        >
          Events
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Event</th>
                <th className="text-left py-3 px-4 font-semibold">Payload</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {swipeToCloseEmits.map((p) => (
                <tr
                  key={p.event}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.event}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.payload}
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
          id="slots"
          className="text-lg font-semibold mt-6 mb-3"
        >
          Slots
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Slot</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  default
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Вміст, який треба загорнути в обробку свайпу для закриття
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="rk-reel-key-amp-usereelcontext"
          className="text-2xl font-bold mb-4"
        >
          RK_REEL_KEY &amp; useReelContext
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          An{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'InjectionKey<ReelContextValue>'}
          </code>{' '}
          який надає{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<Reel>'}
          </code>{' '}
          своїм нащадкам. Використовується всередині{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<ReelIndicator>'}
          </code>{' '}
          для автоматичного під’єднання. Викликайте{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            useReelContext()
          </code>{' '}
          у власних компонентах, яким потрібен контекст слайдера.
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { useReelContext } from '@reelkit/vue';

const ctx = useReelContext();

function jump(index: number) {
  ctx?.goTo(index, true);
}
</script>`}
          language="vue"
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
        <Heading level={2} id="composables" className="text-2xl font-bold mb-4">
          Composables
        </Heading>

        <Heading
          level={3}
          id="usebodylock"
          className="text-xl font-semibold mb-3"
        >
          useBodyLock
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Блокує прокручування body документа, коли передане значення —{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            true
          </code>
          . Використовує підрахунок посилань, тож кілька одночасних викликачів
          блокують і розблоковують незалежно. Автоматично розблоковує при
          демонтажі.
        </p>
        <CodeBlock
          code={`import { ref } from 'vue';
import { useBodyLock } from '@reelkit/vue';

const isOpen = ref(false);
useBodyLock(isOpen);

// Also accepts a static boolean
useBodyLock(true);`}
          language="typescript"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Parameter</th>
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
                  {'Ref<boolean> | boolean'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Чи блокувати прокручування body. Приймає реактивний ref або
                  звичайне булеве значення
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="usefullscreen"
          className="text-xl font-semibold mt-8 mb-3"
        >
          useFullscreen
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            UseFullscreenOptions
          </code>{' '}
          →{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            UseFullscreenReturn
          </code>
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Композабл для роботи з Fullscreen API з кросбраузерною підтримкою.
          Автоматично виходить із повного екрана при демонтажі.
        </p>
        <CodeBlock
          code={`import { ref } from 'vue';
import { useFullscreen } from '@reelkit/vue';

const containerRef = ref<HTMLElement | null>(null);
const { isFullscreen, request, exit, toggle } = useFullscreen({
  elementRef: containerRef,
});`}
          language="typescript"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Return</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  isFullscreen
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'Signal<boolean>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Сигнал ядра, що відображає поточний стан повного екрана
                  (читайте{' '}
                  <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                    .value
                  </code>
                  )
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  request
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => Promise<void>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Запитує повний екран для елемента за посиланням. Якщо в
                  повному екрані вже інший елемент, спершу відбувається вихід із
                  нього (з очікуванням).
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  exit
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => Promise<void>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Вийти з повного екрана
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  toggle
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  {'() => Promise<void>'}
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Перемкнути стан повного екрана
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="usesoundstate"
          className="text-xl font-semibold mt-8 mb-3"
        >
          useSoundState
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Дає доступ до поточного{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SoundController
          </code>{' '}
          з контексту. Викликати треба всередині{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<SoundProvider>'}
          </code>
          . Поза ним кидає помилку.
        </p>
        <CodeBlock
          code={`import { useSoundState } from '@reelkit/vue';

// Inside a SoundProvider descendant
const sound = useSoundState();

sound.muted;    // Signal<boolean>
sound.toggle(); // Toggle muted state`}
          language="typescript"
        />

        <Heading
          level={3}
          id="useoverlayurlstate"
          className="text-xl font-semibold mt-8 mb-3"
        >
          useOverlayUrlState
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            OverlayUrlStateOptions
          </code>
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Будує контролер стану в URL для оверлея, який ви передаєте в{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<LightboxUrlOverlay>'}
          </code>{' '}
          як його{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            :controller
          </code>{' '}
          prop.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          See{' '}
          <Link
            to="/uk/docs/vue/guide#url-state"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Стан в URL у посібнику для Vue
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
          id="usevuerouterurladapter"
          className="text-xl font-semibold mt-8 mb-3"
        >
          useVueRouterUrlAdapter
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A <code>UrlAdapter</code> на базі Vue Router. Передайте його як опцію{' '}
          <code>adapter</code> у <code>useOverlayUrlState</code> у застосунку з
          роутером, щоб роутер лишався єдиним джерелом правди про навігацію:
          запис <code>history.pushState</code> повз роутер лишає його
          місцеположення застарілим, і наступна навігація втрачає параметр.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Постачається з окремого підшляху, тож застосунок без роутера ніколи не
          тягне <code>vue-router</code> у свій бандл. <code>vue-router</code> —
          необов’язкова peer-залежність.
        </p>
        <CodeBlock
          code={`import { useVueRouterUrlAdapter } from '@reelkit/vue/vue-router-url-adapter';

const adapter = useVueRouterUrlAdapter();
const photo = useOverlayUrlState({
  param: 'photo',
  adapter,
  ...urlIndexKey(() => props.images.length),
});`}
          language="typescript"
        />

        <Heading
          level={3}
          id="tovueref"
          className="text-xl font-semibold mt-8 mb-3"
        >
          toVueRef
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Місток від сигналу ядра{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            Subscribable
          </code>{' '}
          (будь-який{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            Signal
          </code>{' '}
          from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/core
          </code>
          ) into a read-only Vue{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            Ref
          </code>
          . Беріть його щоразу, коли значення сигналу ядра має спричиняти
          перерендер у Vue — прямі читання{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            signal.value
          </code>{' '}
          у функціях рендерингу чи шаблонах <strong>не</strong> реактивні самі
          собою.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Підписка звільняється автоматично через{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            onScopeDispose
          </code>
          , so this must be called inside a Vue{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            setup()
          </code>{' '}
          чи інший контекст, обізнаний про область ефектів.
        </p>
        <CodeBlock
          code={`import { defineComponent, h } from 'vue';
import { toVueRef, useSoundState } from '@reelkit/vue';

export const MuteIcon = defineComponent({
  setup() {
    const sound = useSoundState();
    const muted = toVueRef(sound.muted); // Readonly<Ref<boolean>>

    return () => h('span', muted.value ? '🔇' : '🔊');
  },
});`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="soundprovider"
          className="text-2xl font-bold mb-4"
        >
          SoundProvider
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Тег:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<SoundProvider>'}
          </code>{' '}
          — постачальник контексту, що створює екземпляр{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SoundController
          </code>{' '}
          і надає його нащадкам через{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RK_SOUND_KEY
          </code>
          . Свій типовий слот рендерить прозоро.
        </p>
        <CodeBlock
          code={`<template>
  <SoundProvider>
    <Reel :count="items.length">
      <template #item="{ index }">
        <VideoSlide :index="index" />
      </template>
      <MuteButton />
    </Reel>
  </SoundProvider>
</template>`}
          language="vue"
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
          . Передайте{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-label
          </code>{' '}
          (пропс має назву{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ariaLabel
          </code>{' '}
          у TypeScript), щоб дати області назву для екранного читача. Ввічлива
          жива область оголошує «Слайд N з M» на кожну зміну слайда. Неактивні
          слайди отримують атрибут{' '}
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
            @reelkit/vue
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
            @reelkit/vue
          </code>
          :
        </p>
        <CodeBlock
          code={`// Components
import {
  Reel,
  ReelIndicator,
  SwipeToClose,
  SoundProvider,
} from '@reelkit/vue';

// Types
import type {
  ReelExpose,
  ReelContextValue,
  SwipeToCloseDirection,
  SwipeToCloseProps,
  UseFullscreenOptions,
  UseFullscreenReturn,
} from '@reelkit/vue';

// Context & composables
import {
  RK_REEL_KEY,
  useReelContext,
  RK_SOUND_KEY,
  useBodyLock,
  useFullscreen,
  useSoundState,
  toVueRef,
} from '@reelkit/vue';

// Utilities (re-exported from @reelkit/core)
import {
  createDefaultKeyExtractorForLoop,
  defaultRangeExtractor,
} from '@reelkit/vue';

// Core re-exports
import {
  // Signals & reactivity
  createSignal, createComputed, reaction, batch, createDeferred,

  // Transitions
  slideTransition, fadeTransition, flipTransition,
  cubeTransition, zoomTransition, getSlideProgress,

  // Content loading & preloading
  createContentLoadingController, createContentPreloader,
  observeMediaLoading,

  // Sound
  createSoundController, syncMutedToVideo,

  // Fullscreen
  fullscreenSignal, requestFullscreen, exitFullscreen,

  // DOM & cleanup
  observeDomEvent, createDisposableList, createBodyLock, sharedBodyLock,

  // Focus management
  captureFocusForReturn, createFocusTrap, getFocusableElements,

  // Gestures
  createGestureController,

  // Video
  captureFrame, createSharedVideo,

  // Animation
  animate,

  // Utilities
  noop, clamp, abs, first, last, extractRange,
  lerp, isNegative, generate,
} from '@reelkit/vue';`}
          language="typescript"
        />
      </section>
    </div>
  );
}
