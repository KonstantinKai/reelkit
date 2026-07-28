import { CodeBlock } from '../../../components/ui/CodeBlock';
import { FeatureCardGrid } from '../../../components/ui/FeatureCard';
import {
  Layers,
  Timer,
  Minus,
  MousePointerClick,
  Cog,
  Cpu,
} from 'lucide-react';
import { Heading } from '../../../components/ui/Heading';
import { ukPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/stories-core',
    title: 'Stories Core · ReelKit',
    description:
      'Рушій Stories без прив’язки до фреймворку: контролер Stories, контролер таймера, рендерер прогресу на Canvas та утиліти.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

const features = [
  {
    icon: Cpu,
    label: 'Framework-Agnostic',
    desc: 'Чистий TypeScript, жодних залежностей від DOM-фреймворків',
  },
  {
    icon: Layers,
    label: 'Дворівнева навігація',
    desc: 'Групи та історії всередині кожної групи',
  },
  {
    icon: Timer,
    label: 'Таймер на requestAnimationFrame',
    desc: 'Автоперехід на requestAnimationFrame із паузою та відновленням',
  },
  {
    icon: Minus,
    label: 'Прогрес на Canvas',
    desc: 'Сегментована смуга прогресу з рухомим вікном, готова до Retina',
  },
  {
    icon: MousePointerClick,
    label: 'Зони дотику',
    desc: 'Налаштовне розпізнавання дотиків ліворуч і праворуч',
  },
  {
    icon: Cog,
    label: 'Реактивні сигнали',
    desc: 'Побудовано на примітивах сигналів @reelkit/core',
  },
];

const configRows = [
  {
    name: 'groupCount',
    type: 'number',
    default: 'required',
    desc: 'Загальна кількість груп історій',
  },
  {
    name: 'storyCounts',
    type: 'number[]',
    default: 'required',
    desc: 'Кількість історій у кожній групі',
  },
  {
    name: 'initialGroupIndex',
    type: 'number',
    default: '0',
    desc: 'Початковий індекс групи',
  },
  {
    name: 'initialStoryIndex',
    type: 'number',
    default: '0',
    desc: 'Початковий індекс історії всередині групи',
  },
  {
    name: 'defaultImageDuration',
    type: 'number',
    default: '5000',
    desc: 'Типова тривалість автопереходу для історій-зображень у мілісекундах',
  },
];

const eventsRows = [
  {
    name: 'onStoryChange',
    type: '(groupIndex, storyIndex) => void',
    desc: 'Спрацьовує, коли змінюється активна історія',
  },
  {
    name: 'onGroupChange',
    type: '(groupIndex) => void',
    desc: 'Спрацьовує, коли змінюється активна група',
  },
  {
    name: 'onStoryViewed',
    type: '(groupIndex, storyIndex) => void',
    desc: 'Спрацьовує, коли історія стає видимою',
  },
  {
    name: 'onStoryComplete',
    type: '(groupIndex, storyIndex) => void',
    desc: 'Спрацьовує, коли завершується таймер історії (перед переходом)',
  },
  {
    name: 'onComplete',
    type: '() => void',
    desc: 'Спрацьовує, коли завершується остання історія останньої групи',
  },
  {
    name: 'onClose',
    type: '() => void',
    desc: 'Спрацьовує, коли оверлей має закритися',
  },
];

const stateRows = [
  {
    name: 'state.activeGroupIndex',
    type: 'Signal<number>',
    desc: 'Індекс поточної активної групи',
  },
  {
    name: 'state.activeStoryIndex',
    type: 'Signal<number>',
    desc: 'Індекс поточної активної історії всередині групи',
  },
  {
    name: 'state.isPaused',
    type: 'Signal<boolean>',
    desc: 'Чи призупинено автоперехід',
  },
];

const methodsRows = [
  {
    name: 'nextStory()',
    type: '() => void',
    desc: 'Перехід уперед у межах групи; на межі переходить у наступну групу',
  },
  {
    name: 'prevStory()',
    type: '() => void',
    desc: 'Перехід назад у межах групи; на межі переходить у попередню групу',
  },
  {
    name: 'nextGroup()',
    type: '() => void',
    desc: 'Перемикає на наступну групу, продовжуючи з останньої переглянутої історії',
  },
  {
    name: 'prevGroup()',
    type: '() => void',
    desc: 'Перемикає на попередню групу, продовжуючи з останньої переглянутої історії',
  },
  {
    name: 'goToGroup(index)',
    type: '(number) => void',
    desc: 'Перехід до конкретної групи за індексом',
  },
  {
    name: 'pause()',
    type: '() => void',
    desc: 'Призупиняє автоперехід',
  },
  {
    name: 'resume()',
    type: '() => void',
    desc: 'Відновлює автоперехід',
  },
  {
    name: 'onStoryTimerComplete()',
    type: '() => void',
    desc: 'Викликається, коли таймер завершується; спрацьовує onStoryComplete, а потім відбувається перехід',
  },
  {
    name: 'getLastStoryIndex(groupIndex)',
    type: '(number) => number',
    desc: 'Індекс останньої переглянутої історії групи (0, якщо група ще не відкривалася)',
  },
];

const timerConfigRows = [
  {
    name: 'duration',
    type: 'number',
    default: 'required',
    desc: 'Типова тривалість у мілісекундах',
  },
  {
    name: 'onComplete',
    type: '() => void',
    default: 'undefined',
    desc: 'Викликається, коли таймер доходить до 100%',
  },
];

const timerStateRows = [
  {
    name: 'progress',
    type: 'Signal<number>',
    desc: 'Сигнал прогресу (від 0 до 1)',
  },
  {
    name: 'isRunning',
    type: 'Signal<boolean>',
    desc: 'Чи таймер зараз працює',
  },
];

const timerMethodsRows = [
  {
    name: 'start(duration?)',
    type: '(number?) => void',
    desc: 'Запускає (або перезапускає) таймер із необов’язковою заміною тривалості',
  },
  {
    name: 'pause()',
    type: '() => void',
    desc: 'Заморожує прогрес на поточній позиції',
  },
  {
    name: 'resume()',
    type: '() => void',
    desc: 'Продовжує із замороженої позиції',
  },
  {
    name: 'reset()',
    type: '() => void',
    desc: 'Скидає прогрес до 0 і зупиняє',
  },
  {
    name: 'dispose()',
    type: '() => void',
    desc: 'Звільняє ресурси',
  },
];

const canvasConfigRows = [
  {
    name: 'gap',
    type: 'number',
    default: '2',
    desc: 'Проміжок між сегментами в пікселях',
  },
  {
    name: 'barHeight',
    type: 'number',
    default: '2',
    desc: 'Висота смуги в пікселях',
  },
  {
    name: 'minSegmentWidth',
    type: 'number',
    default: '8',
    desc: 'Мінімальна ширина сегмента, після якої вмикається рухоме вікно',
  },
  {
    name: 'bgColor',
    type: 'string',
    default: "'rgba(255,255,255,0.3)'",
    desc: 'Колір тла незаповнених сегментів',
  },
  {
    name: 'fillColor',
    type: 'string',
    default: "'#ffffff'",
    desc: 'Колір заповнення завершених та активних сегментів',
  },
];

const canvasMethodsRows = [
  {
    name: 'attach(canvas)',
    type: '(HTMLCanvasElement) => void',
    desc: 'Підключає до елемента canvas; запускає ResizeObserver на батьківському елементі',
  },
  {
    name: 'draw(totalStories, activeIndex, progress)',
    type: '(number, number, number) => void',
    desc: 'Малює смугу прогресу для заданого стану',
  },
  {
    name: 'width',
    type: 'number (readonly)',
    desc: 'Поточна виміряна ширина в пікселях CSS',
  },
  {
    name: 'dispose()',
    type: '() => void',
    desc: 'Прибирає ResizeObserver і внутрішній стан',
  },
];

const utilityRows = [
  {
    name: 'getTapAction(tapX, containerWidth, splitRatio?)',
    type: "(number, number, number?) => 'prev' | 'next'",
    desc: "Визначає за позицією, що спричиняє дотик — 'prev' чи 'next'. Типове значення splitRatio — 0.3.",
  },
  {
    name: 'getSegments(totalStories, activeIndex, progress)',
    type: '(number, number, number) => SegmentState[]',
    desc: 'Обчислює стан і відсоток заповнення кожного сегмента смуги прогресу',
  },
  {
    name: 'getVisibleWindow(totalStories, activeIndex, progress, containerWidth, minSegmentWidth?, gap?)',
    type: '(number, number, number, number, number?, number?) => VisibleWindow',
    desc: 'Обчислює видиме рухоме вікно сегментів, коли їх більше, ніж уміщає контейнер',
  },
];

const typesCode = `type MediaType = 'image' | 'video';

interface StoryItem {
  id: string;
  mediaType: MediaType;
  src: string;
  poster?: string;
  duration?: number;
  createdAt?: string | Date;
  aspectRatio?: number;
}

interface AuthorInfo {
  id: string;
  name: string;
  avatar: string;
  verified?: boolean;
}

interface StoriesGroup<T extends StoryItem = StoryItem> {
  author: AuthorInfo;
  stories: T[];
}

type SegmentStatus = 'completed' | 'active' | 'upcoming';

interface SegmentState {
  status: SegmentStatus;
  fillPercentage: number; // 0-100
}

interface VisibleWindow {
  startIndex: number;
  endIndex: number;
  segments: SegmentState[];
}

type TapAction = 'prev' | 'next';`;

const controllerExample = `import {
  createStoriesController,
  createTimerController,
} from '@reelkit/stories-core';
import { reaction } from '@reelkit/core';

const groups = [
  { stories: ['s1', 's2', 's3'] },
  { stories: ['s4', 's5'] },
];

const controller = createStoriesController(
  {
    groupCount: groups.length,
    storyCounts: groups.map((g) => g.stories.length),
    defaultImageDuration: 5000,
  },
  {
    onStoryChange(groupIndex, storyIndex) {
      console.log('Story changed:', groupIndex, storyIndex);
    },
    onComplete() {
      console.log('All stories viewed');
    },
    onClose() {
      console.log('Overlay closed');
    },
  },
);

// Wire up a timer for auto-advance
const timer = createTimerController({
  duration: 5000,
  onComplete: () => controller.onStoryTimerComplete(),
});

// React to story changes and restart the timer
const dispose = reaction(
  () => [
    controller.state.activeGroupIndex,
    controller.state.activeStoryIndex,
  ],
  () => timer.start(),
);

// Start playback
timer.start();

// Navigation
controller.nextStory();
controller.pause();
controller.resume();

// Cleanup
dispose();
timer.dispose();`;

const timerExample = `import { createTimerController } from '@reelkit/stories-core';
import { reaction } from '@reelkit/core';

const timer = createTimerController({
  duration: 5000,
  onComplete: () => console.log('Timer finished!'),
});

// Observe progress (0 to 1)
const dispose = reaction(
  () => [timer.progress],
  () => {
    console.log('Progress:', timer.progress.value);
  },
);

// Start with default duration
timer.start();

// Or override duration for a specific story
timer.start(8000);

// Pause/resume preserves exact position
timer.pause();
timer.resume();

// Reset to 0
timer.reset();

// Cleanup
dispose();
timer.dispose();`;

const canvasExample = `import { createCanvasProgressRenderer } from '@reelkit/stories-core';

const renderer = createCanvasProgressRenderer({
  gap: 2,
  barHeight: 2,
  fillColor: '#ffffff',
  bgColor: 'rgba(255, 255, 255, 0.3)',
});

// Attach to a canvas element
const canvas = document.querySelector('canvas')!;
renderer.attach(canvas);

// Draw on each animation frame
let frameId: number;

function loop() {
  const totalStories = 5;
  const activeIndex = 2;
  const progress = timer.progress.value; // 0-1

  renderer.draw(totalStories, activeIndex, progress);
  frameId = requestAnimationFrame(loop);
}

frameId = requestAnimationFrame(loop);

// Cleanup
cancelAnimationFrame(frameId);
renderer.dispose();`;

function Table3Col({
  headers,
  rows,
}: {
  headers: [string, string, string];
  rows: { name: string; type: string; desc: string }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            {headers.map((h) => (
              <th key={h} className="text-left py-3 px-4 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.name}
              className="border-b border-slate-100 dark:border-slate-800"
            >
              <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                {r.name}
              </td>
              <td className="py-3 px-4 font-mono text-xs text-slate-500">
                {r.type}
              </td>
              <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                {r.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Table4Col({
  rows,
}: {
  rows: { name: string; type: string; default: string; desc: string }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 font-semibold">Властивість</th>
            <th className="text-left py-3 px-4 font-semibold">Тип</th>
            <th className="text-left py-3 px-4 font-semibold">
              Типове значення
            </th>
            <th className="text-left py-3 px-4 font-semibold">Опис</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.name}
              className="border-b border-slate-100 dark:border-slate-800"
            >
              <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                {r.name}
              </td>
              <td className="py-3 px-4 font-mono text-xs text-slate-500">
                {r.type}
              </td>
              <td className="py-3 px-4 text-slate-500 text-sm">{r.default}</td>
              <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                {r.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StoriesCorePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Overview */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Stories Core</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Рушій, на якому працює{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-stories-player
          </code>
          . Чистий TypeScript, без залежностей від фреймворків. Беріть його, щоб
          будувати плеєри історій для Angular, Vue чи звичайного JavaScript.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12">
        <FeatureCardGrid items={features} />
      </div>

      {/* Installation */}
      <section className="mb-12">
        <Heading
          level={2}
          id="installation"
          className="text-2xl font-bold mb-4"
        >
          Встановлення
        </Heading>
        <CodeBlock code="npm i @reelkit/stories-core" language="bash" />
      </section>

      {/* Stories Controller */}
      <section className="mb-12">
        <Heading
          level={2}
          id="stories-controller"
          className="text-2xl font-bold mb-6"
        >
          Контролер Stories
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createStoriesController(config, events?)
          </code>{' '}
          керує навігацією між групами та історіями. Стежить за станом паузи,
          запам’ятовує останню переглянуту історію в кожній групі й викликає
          колбеки на кожному переході.
        </p>

        <Heading
          level={3}
          id="config-storiescontrollerconfig"
          className="text-lg font-semibold mb-3"
        >
          Конфігурація (StoriesControllerConfig)
        </Heading>
        <Table4Col rows={configRows} />

        <Heading
          level={3}
          id="events-storiescontrollerevents"
          className="text-lg font-semibold mt-8 mb-3"
        >
          Події (StoriesControllerEvents)
        </Heading>
        <Table3Col headers={['Event', 'Тип', 'Опис']} rows={eventsRows} />

        <Heading
          level={3}
          id="state-reactive-signals"
          className="text-lg font-semibold mt-8 mb-3"
        >
          Стан (реактивні сигнали)
        </Heading>
        <Table3Col headers={['Signal', 'Тип', 'Опис']} rows={stateRows} />

        <Heading
          level={3}
          id="methods"
          className="text-lg font-semibold mt-8 mb-3"
        >
          Методи
        </Heading>
        <Table3Col headers={['Метод', 'Тип', 'Опис']} rows={methodsRows} />

        <Heading
          level={3}
          id="example"
          className="text-lg font-semibold mt-8 mb-3"
        >
          Example
        </Heading>
        <CodeBlock code={controllerExample} />
      </section>

      {/* Timer Controller */}
      <section className="mb-12">
        <Heading
          level={2}
          id="timer-controller"
          className="text-2xl font-bold mb-6"
        >
          Контролер таймера
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createTimerController(config)
          </code>{' '}
          керує автопереходом через цикл{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            requestAnimationFrame
          </code>{' '}
          . Сигнал прогресу (від 0 до 1) живить смугу прогресу. Пауза й
          відновлення зберігають точну позицію.
        </p>

        <Heading
          level={3}
          id="config-timercontrollerconfig"
          className="text-lg font-semibold mb-3"
        >
          Конфігурація (TimerControllerConfig)
        </Heading>
        <Table4Col rows={timerConfigRows} />

        <Heading
          level={3}
          id="state"
          className="text-lg font-semibold mt-8 mb-3"
        >
          State
        </Heading>
        <Table3Col headers={['Signal', 'Тип', 'Опис']} rows={timerStateRows} />

        <Heading
          level={3}
          id="methods"
          className="text-lg font-semibold mt-8 mb-3"
        >
          Методи
        </Heading>
        <Table3Col headers={['Метод', 'Тип', 'Опис']} rows={timerMethodsRows} />

        <Heading
          level={3}
          id="example"
          className="text-lg font-semibold mt-8 mb-3"
        >
          Example
        </Heading>
        <CodeBlock code={timerExample} />
      </section>

      {/* Canvas Progress Renderer */}
      <section className="mb-12">
        <Heading
          level={2}
          id="canvas-progress-renderer"
          className="text-2xl font-bold mb-6"
        >
          Рендерер прогресу на Canvas
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createCanvasProgressRenderer(config?)
          </code>{' '}
          малює сегментовані смуги прогресу на canvas. Масштабується під дисплеї
          Retina, вимірює свій контейнер через ResizeObserver і вмикає рухоме
          вікно, коли сегменти не вміщаються.
        </p>

        <Heading
          level={3}
          id="config-canvasprogressrendererconfig"
          className="text-lg font-semibold mb-3"
        >
          Config (CanvasProgressRendererConfig)
        </Heading>
        <Table4Col rows={canvasConfigRows} />

        <Heading
          level={3}
          id="methods"
          className="text-lg font-semibold mt-8 mb-3"
        >
          Методи
        </Heading>
        <Table3Col headers={['Член', 'Тип', 'Опис']} rows={canvasMethodsRows} />

        <Heading
          level={3}
          id="example"
          className="text-lg font-semibold mt-8 mb-3"
        >
          Example
        </Heading>
        <CodeBlock code={canvasExample} />
      </section>

      {/* Utility Functions */}
      <section className="mb-12">
        <Heading
          level={2}
          id="utility-functions"
          className="text-2xl font-bold mb-6"
        >
          Utility Functions
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Чисті функції для розпізнавання зон дотику та обчислень смуги
          прогресу.
        </p>
        <Table3Col headers={['Function', 'Тип', 'Опис']} rows={utilityRows} />
      </section>

      {/* Types */}
      <section>
        <Heading level={2} id="types" className="text-2xl font-bold mb-6">
          Types
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Усі визначення типів, експортовані з{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/stories-core
          </code>
          .
        </p>
        <CodeBlock code={typesCode} />
      </section>
    </div>
  );
}
