import { Link } from 'react-router-dom';
import { Callout } from '../../../../components/ui/Callout';
import { CodeBlock } from '../../../../components/ui/CodeBlock';
import { NextSteps } from '../../../../components/NextSteps';
import { Heading } from '../../../../components/ui/Heading';
import { ukPageMeta } from '../../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/core/guide',
    title: 'Посібник з ядра · ReelKit',
    description:
      'Архітектура @reelkit/core: контролер слайдера, віртуалізація, система сигналів, контролери жестів і таймлайну.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

export default function CoreGuide() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Посібник з ядра</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/core
          </code>{' '}
          містить логіку слайдера без прив’язки до фреймворку. Беріть його для
          власних інтеграцій або щоб розібратися в архітектурі під капотом.
        </p>
      </div>

      <section className="mb-12">
        <Heading
          level={2}
          id="architecture-overview"
          className="text-2xl font-bold mb-4"
        >
          Огляд архітектури
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Ядро побудоване на <strong>патерні контролерів</strong> із фабричними
          функціями. Жодних класів — лише звичайні об’єкти, повернуті із
          замикань. Нуль залежностей. Ядро узгоджує роботу:
        </p>
        <ul className="space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>SliderController</strong> — центральний стан і навігація
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>GestureController</strong> — обробка перетягування дотиком
              і вказівником
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>KeyboardController</strong> — стрілки та Escape
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>WheelController</strong> — колесо миші з тротлінгом
            </span>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="createslidercontroller"
          className="text-2xl font-bold mb-4"
        >
          createSliderController
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Створює новий екземпляр контролера слайдера, який керує всім станом і
          поведінкою.
        </p>
        <CodeBlock
          code={`import { createSliderController } from '@reelkit/core';

const controller = createSliderController(
  {
    count: 10,
    direction: 'vertical',
    enableWheel: true,
    transitionDuration: 300,
  },
  {
    onAfterChange: (index) => console.log('Changed to:', index),
  }
);

// Attach to DOM element
controller.attach(element);
controller.observe();`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="controller-methods"
          className="text-2xl font-bold mb-4"
        >
          Методи контролера
        </Heading>

        <Heading
          level={3}
          id="navigation"
          className="text-lg font-semibold mb-3"
        >
          Навігація
        </Heading>
        <CodeBlock
          code={`// Go to specific index
controller.goTo(5);           // instant
controller.goTo(5, true);     // animated, returns Promise

// Navigate to next/previous
controller.next();
controller.prev();`}
          language="typescript"
        />

        <Heading
          level={3}
          id="lifecycle"
          className="text-lg font-semibold mt-6 mb-3"
        >
          Життєвий цикл
        </Heading>
        <CodeBlock
          code={`// Connect to DOM element
controller.attach(element);

// Start gesture, keyboard, and wheel observation
controller.observe();

// Stop gesture, keyboard, and wheel observation
controller.unobserve();

// Detach DOM listeners (reversible — use for React effect cleanup)
controller.detach();

// Permanent teardown (use for Angular onDestroy)
controller.dispose();

// Recalculate positions
controller.adjust();

// Update size
controller.setPrimarySize(600);`}
          language="typescript"
        />

        <Heading
          level={3}
          id="state-updates"
          className="text-lg font-semibold mt-6 mb-3"
        >
          Оновлення стану
        </Heading>
        <CodeBlock
          code={`// Update configuration
controller.updateConfig({
  count: 20,
  loop: true,
});`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="virtualization"
          className="text-2xl font-bold mb-4"
        >
          Віртуалізація
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Ядро тримає в DOM лише <strong>3 слайди</strong> у будь-який момент
          (поточний, попередній, наступний). Екстрактор діапазону вирішує, які
          індекси потрапляють у вікно рендерингу:
        </p>
        <CodeBlock
          code={`import { defaultRangeExtractor } from '@reelkit/core';

// Default: renders current ± 1 (3 DOM nodes)
const indexes = defaultRangeExtractor(currentIndex, count);

// Custom: skip hidden slides by shifting to next valid index
const hiddenSlides = new Set([2, 5]);

const skipHiddenExtractor = (current: number, count: number) => {
  const result: number[] = [];
  // Collect prev, current, next — skip hidden, shift forward
  for (let i = current - 1, added = 0; added < 3 && i < count; i++) {
    if (i >= 0 && !hiddenSlides.has(i)) {
      result.push(i);
      added++;
    }
  }
  return result;
};`}
          language="typescript"
        />
        <Callout type="info" className="mt-4">
          Результат завжди обмежується трьома індексами. Якщо ваш екстрактор
          поверне більше, ядро залишить 3 навколо поточного слайда.
        </Callout>
      </section>

      <section className="mb-12">
        <Heading level={2} id="signals" className="text-2xl font-bold mb-4">
          Сигнали
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Для реактивності ядро використовує легку систему сигналів:
        </p>
        <CodeBlock
          code={`import { createSignal, createComputed, reaction } from '@reelkit/core';

// Create a signal
const count = createSignal(0);

// Observe changes (returns a disposer function)
const dispose = count.observe(() => console.log(count.value));

// Update value
count.value = 5;

// Create computed signal (requires a deps factory)
const doubled = createComputed(() => count.value * 2, () => [count]);

// Run side effects on signal changes
const disposeReaction = reaction(
  () => [count],
  () => console.log('Count changed:', count.value)
);

// Cleanup
dispose();
disposeReaction();`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="controller-state"
          className="text-2xl font-bold mb-4"
        >
          Стан контролера
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Доступ до реактивного стану — через{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            controller.state
          </code>
          :
        </p>
        <CodeBlock
          code={`const { index, axisValue, indexes } = controller.state;

// Observe index changes (returns a disposer function)
const disposeIndex = index.observe(() => {
  console.log('Current index:', index.value);
});

// Observe visible indexes for virtualization
const disposeIndexes = indexes.observe(() => {
  console.log('Visible:', indexes.value);
});

// Cleanup when done
disposeIndex();
disposeIndexes();`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="timeline-controller"
          className="text-2xl font-bold mb-4"
        >
          Контролер таймлайну
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Зберіть власну смугу перемотування для будь-якого{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">{`<video>`}</code>{' '}
          елемента. Контролер дає реактивні сигнали тривалості, поточного часу,
          буферизованих діапазонів і стану перемотування, а також одним викликом
          навішує обробку вказівника й клавіатури на будь-який елемент DOM.
        </p>
        <CodeBlock
          code={`import { createTimelineController } from '@reelkit/core';

const timeline = createTimelineController({
  onScrubStart: () => video.pause(),
  onScrubEnd: () => video.play(),
});

timeline.attach(video);
const dispose = timeline.bindInteractions(trackEl);

// Render: read signals and update DOM
timeline.progress.observe(() => {
  fillEl.style.width = \`\${timeline.progress.value * 100}%\`;
});

// Cleanup
dispose();
timeline.detach();`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          Стан в URL
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Винесіть стан відкриття оверлея в адресний рядок: видимий слайд
          отримує посилання, яким можна поділитися, відкрити напряму й закрити
          кнопкою «назад». Модель живе в ядрі; прив’язки загортають її в хук
          (React / Vue{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useOverlayUrlState
          </code>
          , Angular{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createOverlayUrlState
          </code>
          ) і компонент оверлея, керований URL.
        </p>

        <Heading
          level={3}
          id="how-it-works"
          className="text-lg font-semibold mt-6 mb-3"
        >
          Як це працює
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createUrlStateController
          </code>{' '}
          віддзеркалює один параметр запиту в сигнал і записує зміни назад.
          Відкриття додає <strong>один</strong> запис в історію; кожна навігація{' '}
          <strong>замінює</strong> його — сто свайпів не додають жодного, тож
          один крок назад завжди закриває.{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            UrlAdapter
          </code>{' '}
          — це змінний шов читання й запису: типовий керує{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            history.pushState
          </code>
          , а застосунок із роутером передає адаптер на базі роутера, щоб власне
          місцеположення роутера не застаріло.
        </p>
        <CodeBlock
          code={`import { createUrlStateController, urlIndexKey } from '@reelkit/core';

const controller = createUrlStateController({
  param: 'photo',
  ...urlIndexKey(() => items.length),
});

const detach = controller.attach(); // begin mirroring the URL
controller.position.observe(() => {
  // null → closed; a number → open at that slide
  render(controller.position.value);
});

// Write back: opening pushes once, navigating replaces, closing clears
controller.set(3);
controller.set(null);`}
          language="typescript"
        />

        <Heading
          level={3}
          id="codec-and-locator-two-jobs"
          className="text-lg font-semibold mt-6 mb-3"
        >
          Кодек і локатор — дві різні задачі
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Ключ — це узгоджена пара{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'{ codec, locator }'}
          </code>{' '}
          . Записати ідентичність в URL і знайти, де вона зараз, — різні задачі,
          тож і об’єкти різні:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li>
            <strong>кодек — формат передавання.</strong>{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              encode
            </code>{' '}
            записує ідентичність у текст параметра;{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              decode
            </code>{' '}
            розбирає його назад і відхиляє зіпсоване значення, тож параметр сам
            зникає з URL.
          </li>
          <li>
            <strong>локатор — пошук.</strong>{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              locate
            </code>{' '}
            знаходить, де розкодована ідентичність лежить у живій колекції (або{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              null
            </code>{' '}
            якщо її вже немає);{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              identify
            </code>{' '}
            читає позицію назад в ідентичність для запису; необов’язковий{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              locateAsync
            </code>{' '}
            дотягує сторінку вікна чи нескінченної стрічки, якщо не знайшлося.
          </li>
        </ul>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Роздільність дає змогу поєднати будь-який формат із будь-яким пошуком
          — наприклад, кодек зі стабільним id і локатор із підвантаженням.
        </p>

        <Heading
          level={3}
          id="index-vs-stable-id-keys"
          className="text-lg font-semibold mt-6 mb-3"
        >
          Ключі за індексом і за стабільним id
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Два вбудовані ключі будують цю пару за вас; різняться лише тим, що
          саме називає URL:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li>
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              urlIndexKey(() =&gt; count)
            </code>{' '}
            адресує за <strong>позицією</strong> (
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              ?photo=3
            </code>
            ). Найпростіше, але після зміни порядку закладка відкриє інший
            елемент.
          </li>
          <li>
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              urlStableIdKey({'{ items }'})
            </code>{' '}
            адресує за стабільним{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              id
            </code>{' '}
            (
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              ?photo=post_42
            </code>
            ), скануючи живий список — закладка називає той самий елемент і
            після зміни порядку, а якщо його немає, акуратно зникає.{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              hashCodec: base64UrlCodec
            </code>{' '}
            маскує id у base64url (оборотно, це не криптографічний хеш).
          </li>
        </ul>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Гортаєте стрічку вікнами?</strong> Обидва вбудовані ключі
          приймають необов’язковий{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locateAsync
          </code>{' '}
          —{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlIndexKey(() =&gt; count, locateAsync)
          </code>{' '}
          та{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlStableIdKey({'{ items, locateAsync }'})
          </code>
          . Синхронний пошук відповідає за вже завантажене; якщо не знайшлося,
          решта підвантажується, тож надіслане посилання за межі вікна все одно
          відкриється — без власноруч написаних кодека й локатора.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Дві осі?{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlIndexTwoAxisKey
          </code>{' '}
          несе{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ?p=&lt;outer&gt;.&lt;inner&gt;
          </code>{' '}
          для допису разом із індексом внутрішнього медіа. Повний перелік опцій
          — у{' '}
          <Link
            to="/uk/docs/core/api#url-state"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            довіднику API ядра
          </Link>
          .
        </p>
      </section>

      <NextSteps
        items={[
          {
            label: 'Довідник API ядра',
            path: '/docs/core/api',
            description: 'усі доступні пропси',
          },
          {
            label: 'Посібник для фреймворку',
            path: {
              react: '/docs/react/guide',
              angular: '/docs/angular/guide',
              vue: '/docs/vue/guide',
            },
            description: 'компоненти, демо та інтеграція',
          },
          {
            label: 'Reel Player',
            path: {
              react: '/docs/reel-player',
              angular: '/docs/angular-reel-player',
              vue: '/docs/vue-reel-player',
            },
            description: 'відеоплеєр у стилі TikTok / Reels',
          },
          {
            label: 'Lightbox',
            path: {
              react: '/docs/lightbox',
              angular: '/docs/angular-lightbox',
              vue: '/docs/vue-lightbox',
            },
            description: 'галерея зображень і відео',
          },
          {
            label: 'Stories Player',
            path: {
              react: '/docs/stories-player',
              angular: '/docs/angular-stories-player',
              vue: '/docs/vue-stories-player',
            },
            description: 'переглядач історій у стилі Instagram',
          },
        ]}
      />
    </div>
  );
}
