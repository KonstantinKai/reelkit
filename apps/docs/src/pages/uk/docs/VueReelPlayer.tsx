import { Link } from 'react-router-dom';
import { Callout } from '../../../components/ui/Callout';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Sandbox } from '../../../components/ui/Sandbox';
import { FeatureCardGrid } from '../../../components/ui/FeatureCard';
import {
  Zap,
  Play,
  Volume2,
  Layout,
  Clock,
  Image,
  Monitor,
  Settings,
  Ratio,
  Layers,
  Link2,
  Code,
} from 'lucide-react';
import { Heading } from '../../../components/ui/Heading';
import { ukPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/vue-reel-player',
    title: 'Reel Player для Vue · ReelKit',
    description:
      'Повноекранний відеоплеєр для Vue: властивості та події, слоти з областю видимості, таймлайн, контекст звуку й темізація.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

const playerProps = [
  {
    prop: 'ariaLabel',
    type: 'string',
    default: "'Video player'",
    description:
      'Доступна назва області діалогу; екранні читачі оголошують її, коли оверлей відкривається',
  },
  {
    prop: 'aspectRatio',
    type: 'number',
    default: '9 / 16',
    description:
      'Співвідношення ширини до висоти контейнера на десктопі. На мобільних використовується вся область перегляду.',
  },
  {
    prop: 'content',
    type: 'T[] (extends BaseContentItem)',
    default: 'required',
    description: 'Масив елементів вмісту для показу в плеєрі',
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
    default: 'true',
    description: 'Вмикає навігацію колесом миші',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: 'Індекс початково видимого елемента, від нуля',
  },
  {
    prop: 'initialInnerIndex',
    type: 'number',
    default: '0',
    description:
      'Індекс внутрішнього медіа, з якого відкриватися, лише для початково видимого допису — дає змогу двовісному URL вести просто до потрібного зображення мультимедійного допису. Ігнорується, щойно користувач починає гортати.',
  },
  {
    prop: 'isOpen',
    type: 'boolean',
    default: 'required',
    description:
      'Керує видимістю оверлея; якщо false, оверлей прибирається з DOM',
  },
  {
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description: 'Вмикає нескінченний цикл між слайдами',
  },
  {
    prop: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: 'Мінімальна частка відстані свайпу, щоб змінити слайд',
  },
  {
    prop: 'timeline',
    type: "'auto' | 'always' | 'never'",
    default: "'auto'",
    description:
      "Правило показу вбудованої смуги таймлайну. 'auto' показує її лише для відео, довших за timelineMinDurationSeconds; 'always' — щойно на активному слайді є відео; 'never' вимикає вбудовану смугу (для повної заміни беріть слот #timeline).",
  },
  {
    prop: 'timelineMinDurationSeconds',
    type: 'number',
    default: '30',
    description:
      "Мінімальна тривалість відео (у секундах), за якої timeline='auto' показує вбудовану смугу. Короткі зациклені кліпи нижче цього порогу не показують її.",
  },
  {
    prop: 'transitionDuration',
    type: 'number',
    default: '300',
    description: 'Тривалість анімації слайда в мілісекундах',
  },
  {
    prop: 'wheelDebounceMs',
    type: 'number',
    default: '200',
    description: 'Тривалість дебаунсу подій колеса в мілісекундах',
  },
];

const playerEvents = [
  {
    name: 'api-ready',
    payload: 'ReelPlayerApi',
    description:
      'Видається, коли слайдер готовий, і відкриває імперативний API',
  },
  {
    name: 'close',
    payload: 'void',
    description: 'Видається, коли плеєр закривається',
  },
  {
    name: 'slide-change',
    payload: 'number',
    description: 'Видається з новим індексом активного слайда після зміни',
  },
  {
    name: 'inner-slide-change',
    payload: 'outer: number, inner: number',
    description:
      'Видається, коли змінюється індекс внутрішнього медіа активного допису — під час внутрішньої навігації та під час активації зовнішнього (поточний внутрішній індекс активованого допису, 0 для допису з одним медіа).',
  },
  {
    name: 'update:is-open',
    payload: 'boolean',
    description: 'Видається на закриття; забезпечує роботу `v-model:is-open`',
  },
];

const scopedSlots = [
  {
    slot: 'controls',
    scope: '{ item, soundState, activeIndex, content, onClose }',
    description:
      'Власна загальна смуга керування (закриття, звук, поділитися тощо)',
  },
  {
    slot: 'error',
    scope: '{ item, activeIndex, innerActiveIndex }',
    description: 'Власний індикатор помилки (замінює стандартний значок)',
  },
  {
    slot: 'loading',
    scope: '{ item, activeIndex, innerActiveIndex }',
    description: 'Власний індикатор завантаження (замінює стандартну хвилю)',
  },
  {
    slot: 'navigation',
    scope: '{ item, activeIndex, count, onPrev, onNext }',
    description: 'Власні стрілки навігації вперед і назад (десктоп)',
  },
  {
    slot: 'nestedNavigation',
    scope: '{ media, activeIndex, count, onPrev, onNext }',
    description: 'Власні стрілки для внутрішнього горизонтального слайдера',
  },
  {
    slot: 'nestedSlide',
    scope:
      '{ item, media, index, size, isActive, isInnerActive, slideKey, defaultContent, onReady, onWaiting, onError }',
    description:
      'Власний вміст слайда всередині внутрішнього горизонтального слайдера',
  },
  {
    slot: 'slide',
    scope:
      '{ item, index, size, isActive, slideKey, defaultContent, onReady, onWaiting, onError }',
    description:
      'Повністю власний вміст слайда (якщо не задано, лишається стандартний)',
  },
  {
    slot: 'slideOverlay',
    scope: '{ item, index, isActive }',
    description: 'Оверлей для кожного слайда (дані автора, лайки, опис тощо)',
  },
  {
    slot: 'timeline',
    scope: '{ item, activeIndex, timelineState, defaultContent }',
    description:
      'Власна смуга таймлайну відтворення. Викликається лише тоді, коли за вбудованим правилом (режим timeline плюс мінімальна тривалість) вивелася б стандартна смуга; логіка auto/always/never та сама. Через defaultContent() можна загорнути вбудований <TimelineBar />.',
  },
];

const contentItemFields = [
  { field: 'id', type: 'string', description: 'Унікальний ідентифікатор' },
  {
    field: 'media',
    type: 'MediaItem[]',
    description: 'Один або кілька медіафайлів (зображення чи відео)',
  },
  {
    field: 'author',
    type: '{ name: string; avatar?: string }',
    description: 'Автор, показаний у стандартному оверлеї слайда',
  },
  { field: 'description', type: 'string?', description: 'Текст підпису' },
  { field: 'likes', type: 'number?', description: 'Кількість лайків' },
];

const mediaItemFields = [
  { field: 'id', type: 'string', description: 'Унікальний ідентифікатор' },
  { field: 'type', type: "'image' | 'video'", description: 'Тип медіа' },
  { field: 'src', type: 'string', description: 'URL медіафайлу' },
  {
    field: 'poster',
    type: 'string?',
    description: 'URL мініатюри-постера для елементів-відео',
  },
  {
    field: 'aspectRatio',
    type: 'number',
    description:
      'співвідношення ширини до висоти. Значення < 1 — вертикальне (cover), ≥ 1 — горизонтальне (contain).',
  },
];

const cssClasses = [
  // Overlay
  {
    className: '.rk-reel-overlay',
    component: 'Overlay',
    description: 'Фіксоване повноекранне тло (фон, z-index)',
  },
  {
    className: '.rk-reel-container',
    component: 'Overlay',
    description: 'Контейнер плеєра (позиція, переповнення)',
  },
  {
    className: '.rk-reel-loader',
    component: 'Overlay',
    description: 'Оверлей хвильової анімації завантаження',
  },
  {
    className: '.rk-reel-media-error',
    component: 'Overlay',
    description: 'Оверлей стану помилки (значок і текст по центру)',
  },
  {
    className: '.rk-reel-media-error-text',
    component: 'Overlay',
    description: 'Текст повідомлення про помилку',
  },

  // Controls
  {
    className: '.rk-reel-button',
    component: 'Controls',
    description: 'Спільна кругла кнопка з іконкою (закриття, звук, стрілки)',
  },
  {
    className: '.rk-reel-close-btn',
    component: 'Controls',
    description: 'Кнопка закриття',
  },
  {
    className: '.rk-reel-sound-btn',
    component: 'Controls',
    description: 'Кнопка перемикання звуку',
  },

  // Navigation
  {
    className: '.rk-reel-nav-arrows',
    component: 'Навігація',
    description: 'Контейнер стрілок лише для десктопа (прихований до 768px)',
  },
  {
    className: '.rk-reel-nav-button',
    component: 'Навігація',
    description: 'Окрема стрілка вперед або назад',
  },

  // Slide
  {
    className: '.rk-reel-slide-wrapper',
    component: 'Slide',
    description: 'Обгортка навколо медіа та оверлея',
  },

  // SlideOverlay
  {
    className: '.rk-reel-slide-overlay',
    component: 'SlideOverlay',
    description: 'Контейнер градієнтного оверлея',
  },
  {
    className: '.rk-reel-slide-overlay-author',
    component: 'SlideOverlay',
    description: 'Рядок автора (аватар та ім’я)',
  },
  {
    className: '.rk-reel-slide-overlay-avatar',
    component: 'SlideOverlay',
    description: 'Зображення аватара автора',
  },
  {
    className: '.rk-reel-slide-overlay-name',
    component: 'SlideOverlay',
    description: 'Текст імені автора',
  },
  {
    className: '.rk-reel-slide-overlay-description',
    component: 'SlideOverlay',
    description: 'Текст опису',
  },
  {
    className: '.rk-reel-slide-overlay-likes',
    component: 'SlideOverlay',
    description: 'Рядок лайків (сердечко й лічильник)',
  },

  // VideoSlide
  {
    className: '.rk-reel-video-container',
    component: 'VideoSlide',
    description: 'Обгортка відео (фон, переповнення)',
  },
  {
    className: '.rk-reel-video-element',
    component: 'VideoSlide',
    description: 'The <video> element',
  },
  {
    className: '.rk-reel-video-poster',
    component: 'VideoSlide',
    description: 'Постер (зникає з початком відтворення)',
  },

  {
    className: '.rk-reel-video-poster.rk-visible',
    component: 'VideoSlide',
    description:
      'Модифікатор стану постера, поки відео на паузі або вантажиться',
  },

  // NestedSlider
  {
    className: '.rk-reel-nested-indicator',
    component: 'NestedSlider',
    description:
      'Пагінація точками під мультимедійними слайдами (позиція різна на десктопі й на дотикових пристроях)',
  },
  {
    className: '.rk-reel-nested-nav',
    component: 'NestedSlider',
    description: 'Стрілки горизонтальної каруселі (приховані до 768px)',
  },
  {
    className: '.rk-reel-nested-nav-next',
    component: 'NestedSlider',
    description: 'Позиція вкладеної стрілки вперед',
  },
  {
    className: '.rk-reel-nested-nav-prev',
    component: 'NestedSlider',
    description: 'Позиція вкладеної стрілки назад',
  },

  // Timeline
  {
    className: '.rk-reel-timeline',
    component: 'TimelineBar',
    description:
      'Обгортка смуги перемотування. Використовуйте на власних коренях слота `#timeline`, щоб успадкувати притиснення до низу, відступи безпечної зони та проміжок для оверлея слайда на дотикових пристроях.',
  },
  {
    className: '.rk-reel-timeline-track',
    component: 'TimelineBar',
    description: 'Доріжка (невідтворена частина)',
  },
  {
    className: '.rk-reel-timeline-buffered',
    component: 'TimelineBar',
    description: 'Шар буферизованих сегментів',
  },
  {
    className: '.rk-reel-timeline-fill',
    component: 'TimelineBar',
    description: 'Заповнення відтвореного прогресу',
  },
  {
    className: '.rk-reel-timeline-cursor',
    component: 'TimelineBar',
    description: 'Повзунок перемотування (плаває над доріжкою)',
  },
];

const themeTokens = [
  // Overlay
  {
    token: '--rk-reel-overlay-bg',
    default: '#000',
    controls: 'Full-screen backdrop color',
  },
  {
    token: '--rk-reel-overlay-z',
    default: '1000',
    controls: 'Overlay z-index',
  },

  // Shared button
  {
    token: '--rk-reel-button-bg',
    default: 'rgba(0, 0, 0, 0.5)',
    controls: 'Default circular button background',
  },
  {
    token: '--rk-reel-button-bg-hover',
    default: 'rgba(255, 255, 255, 0.1)',
    controls: 'Nav arrow background (and base hover state)',
  },
  {
    token: '--rk-reel-button-bg-hover-strong',
    default: 'rgba(255, 255, 255, 0.2)',
    controls: 'Nav arrow hover background',
  },
  {
    token: '--rk-reel-button-fg',
    default: '#fff',
    controls: 'Button icon color',
  },
  {
    token: '--rk-reel-button-size',
    default: '44px',
    controls: 'Button width / height',
  },
  {
    token: '--rk-reel-button-radius',
    default: '50%',
    controls: 'Button border-radius',
  },

  // UI layout
  {
    token: '--rk-reel-ui-z',
    default: '10',
    controls: 'Close / sound / nav z-index',
  },
  {
    token: '--rk-reel-edge-padding',
    default: '16px',
    controls: 'Edge inset for close / sound / nav arrows',
  },
  {
    token: '--rk-reel-nav-gap',
    default: '8px',
    controls: 'Spacing between stacked nav arrows',
  },
  {
    token: '--rk-reel-transition',
    default: '0.2s',
    controls: 'Hover transition duration',
  },

  // Loader
  {
    token: '--rk-reel-loader-color',
    default: 'rgba(255, 255, 255, 0.12)',
    controls: 'Wave loader gradient color',
  },
  {
    token: '--rk-reel-loader-duration',
    default: '1.8s',
    controls: 'Wave loader animation duration',
  },

  // Error state
  {
    token: '--rk-reel-error-fg',
    default: 'rgba(255, 255, 255, 0.4)',
    controls: 'Error icon and text color',
  },

  // Slide caption overlay
  {
    token: '--rk-reel-slide-overlay-bg',
    default: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
    controls: 'Caption scrim gradient',
  },
  {
    token: '--rk-reel-slide-overlay-padding',
    default: '48px 16px 16px',
    controls: 'Caption inner padding',
  },
  {
    token: '--rk-reel-slide-overlay-name-color',
    default: '#fff',
    controls: 'Author name color',
  },

  // Video slide
  {
    token: '--rk-reel-video-bg',
    default: '#000',
    controls: 'Letterbox background behind <video>',
  },

  // Nested horizontal slider
  {
    token: '--rk-reel-nested-button-bg',
    default: 'rgba(0, 0, 0, 0.5)',
    controls: 'Nested arrow background',
  },
  {
    token: '--rk-reel-nested-button-size',
    default: '36px',
    controls: 'Nested arrow size',
  },

  // Playback timeline bar
  {
    token: '--rk-reel-timeline-track',
    default: 'rgba(255, 255, 255, 0.22)',
    controls: 'Track background (unplayed region)',
  },
  {
    token: '--rk-reel-timeline-buffered',
    default: 'rgba(255, 255, 255, 0.4)',
    controls: 'Buffered segments color',
  },
  {
    token: '--rk-reel-timeline-fill',
    default: '#fff',
    controls: 'Played-progress fill color',
  },
  {
    token: '--rk-reel-timeline-cursor',
    default: '#fff',
    controls: 'Scrub-handle pill color',
  },
  {
    token: '--rk-reel-timeline-height',
    default: '3px',
    controls: 'Track height at rest',
  },
  {
    token: '--rk-reel-timeline-height-active',
    default: '6px',
    controls: 'Track height on hover / focus / scrub',
  },
  {
    token: '--rk-reel-timeline-cursor-width',
    default: '10px',
    controls: 'Scrub-pill width at rest',
  },
  {
    token: '--rk-reel-timeline-cursor-width-active',
    default: '14px',
    controls: 'Scrub-pill width while scrubbing',
  },
  {
    token: '--rk-reel-timeline-cursor-height',
    default: '24px',
    controls: 'Scrub-pill height at rest',
  },
  {
    token: '--rk-reel-timeline-cursor-height-active',
    default: '32px',
    controls: 'Scrub-pill height while scrubbing',
  },
  {
    token: '--rk-reel-timeline-transition',
    default: '0.15s ease-out',
    controls: 'Track + pill grow/shrink animation',
  },
];

const keyboardShortcuts = [
  { key: 'ArrowUp', action: 'Previous slide' },
  { key: 'ArrowDown', action: 'Next slide' },
  { key: 'ArrowLeft', action: 'Previous media (nested carousel)' },
  { key: 'ArrowRight', action: 'Next media (nested carousel)' },
  { key: 'Escape', action: 'Close player' },
];

export default function VueReelPlayer() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Reel Player для Vue</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Повноекранний вертикальний медіаплеєр у стилі Instagram чи TikTok для
          Vue 3 на основі{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue-reel-player
          </code>
          .
        </p>
        <a
          href="https://vue-demo.reelkit.dev/reel-player?utm_source=docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          Подивитися демо наживо &rarr;
        </a>
      </div>

      {/* Features */}
      <section className="mb-12">
        <Heading level={2} id="features" className="text-2xl font-bold mb-4">
          Features
        </Heading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FeatureCardGrid
            items={[
              {
                icon: Zap,
                label: 'Вертикальний свайп',
                desc: 'Дотик, перетягування, клавіатура, колесо',
              },
              {
                icon: Play,
                label: 'Автовідтворення відео',
                desc: 'Грає, коли слайд видимий',
              },
              {
                icon: Volume2,
                label: 'Перемикач звуку',
                desc: 'Безперервність на iOS',
              },
              {
                icon: Layout,
                label: 'Multi-Media',
                desc: 'Вкладені горизонтальні каруселі',
              },
              {
                icon: Clock,
                label: 'Пам’ять позиції',
                desc: 'Продовжує з місця, де зупинилися',
              },
              {
                icon: Image,
                label: 'Знімок кадру',
                desc: 'Плавний перехід від постера до відео',
              },
              {
                icon: Layers,
                label: 'Віртуалізований',
                desc: 'Лише 3 слайди в DOM',
              },
              {
                icon: Ratio,
                label: 'Співвідношення сторін',
                desc: '9:16 на десктопі, на весь екран на мобільних',
              },
              {
                icon: Monitor,
                label: 'Навігація на десктопі',
                desc: 'Кнопки-стрілки',
              },
              {
                icon: Code,
                label: 'Узагальнені типи',
                desc: 'Власні моделі даних вмісту',
              },
              {
                icon: Settings,
                label: 'Слоти з областю видимості',
                desc: 'Налаштовуйте кожен елемент інтерфейсу',
              },
              {
                icon: Zap,
                label: 'v-model:is-open',
                desc: 'Двостороння прив’язка видимості',
              },
              {
                icon: Link2,
                label: 'Стан в URL',
                desc: 'Посилання, якими можна ділитися, і закриття кнопкою «назад»',
              },
            ]}
          />
        </div>
      </section>

      {/* Installation */}
      <section className="mb-12">
        <Heading
          level={2}
          id="installation"
          className="text-2xl font-bold mb-4"
        >
          Встановлення
        </Heading>
        <CodeBlock
          code="npm install @reelkit/vue-reel-player @reelkit/vue lucide-vue-next"
          language="bash"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          Імпортуйте таблицю стилів один раз у точці входу застосунку (або в
          будь-якому компоненті):
        </p>
        <CodeBlock
          code={`import '@reelkit/vue-reel-player/styles.css';`}
          language="typescript"
        />
        <Callout type="info" title="Icons" className="mt-4">
          Стандартні елементи керування використовують{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lucide-vue-next
          </code>{' '}
          для іконок (закриття, звук, стрілки навігації). Якщо ви віддаєте
          перевагу іншій бібліотеці іконок, скористайтеся слотами{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #controls
          </code>{' '}
          та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #navigation
          </code>{' '}
          з областю видимості, щоб передати власні.
        </Callout>
      </section>

      {/* Basic Usage */}
      <section className="mb-12">
        <Heading level={2} id="basic-usage" className="text-2xl font-bold mb-4">
          Базове використання
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Покажіть сітку мініатюр і відкривайте оверлей на натиснутому індексі.
          Прив’язка{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            v-model:is-open
          </code>{' '}
          означає, що батьківський <code>ref</code> лишається синхронним, коли
          користувач закриває плеєр кнопкою, жестом або клавішею Escape.
        </p>
        <Sandbox
          code={`<script setup lang="ts">
import { ref } from 'vue';
import { ReelPlayerOverlay, type ContentItem } from '@reelkit/vue-reel-player';
import '@reelkit/vue-reel-player/styles.css';

const content: ContentItem[] = [
  {
    id: '1',
    media: [{
      id: 'v1',
      type: 'video',
      src: '/cdn/samples/videos/video-01.mp4',
      poster: '/cdn/samples/videos/video-poster-01.jpg',
      aspectRatio: 16 / 9,
    }],
    author: { name: 'Alex Johnson', avatar: '/cdn/samples/avatars/avatar-01.jpg' },
    likes: 1234,
    description: 'Amazing sunset vibes',
  },
  {
    id: '2',
    media: [{
      id: 'img1',
      type: 'image',
      src: '/cdn/samples/images/image-01.jpg',
      aspectRatio: 2 / 3,
    }],
    author: { name: 'Sarah Miller', avatar: '/cdn/samples/avatars/avatar-02.jpg' },
    likes: 5678,
    description: 'Nature at its finest',
  },
  {
    id: '3',
    media: [{
      id: 'v2',
      type: 'video',
      src: '/cdn/samples/videos/video-02.mp4',
      poster: '/cdn/samples/videos/video-poster-02.jpg',
      aspectRatio: 16 / 9,
    }],
    author: { name: 'Mike Chen', avatar: '/cdn/samples/avatars/avatar-03.jpg' },
    likes: 3456,
    description: 'Adventure awaits',
  },
];

const isOpen = ref(false);
const startIndex = ref(0);

function openAt(i: number) {
  startIndex.value = i;
  isOpen.value = true;
}
</script>

<template>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
    <button
      v-for="(item, i) in content"
      :key="item.id"
      @click="openAt(i)"
      style="aspect-ratio:9/16;cursor:pointer;overflow:hidden;padding:0;border:0"
    >
      <img
        :src="item.media[0].poster || item.media[0].src"
        style="width:100%;height:100%;object-fit:cover"
      />
    </button>
  </div>

  <ReelPlayerOverlay
    v-model:is-open="isOpen"
    :content="content"
    :initial-index="startIndex"
  />
</template>`}
          language="vue"
          title="App.vue"
          framework="vue"
          stackblitzDeps={['@reelkit/vue-reel-player']}
          stackblitzExtraDeps={{ 'lucide-vue-next': '>=0.460.0' }}
        />
      </section>

      {/* Scoped Slots */}
      <section className="mb-12">
        <Heading
          level={2}
          id="scoped-slots"
          className="text-2xl font-bold mb-4"
        >
          Слоти з областю видимості
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Вісім слотів з областю видимості дають замінити будь-яку частину
          інтерфейсу плеєра. Кожен отримує строго типізований об’єкт області.
          Слоти, які ви не передали, лишаються стандартними.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Slot</th>
                <th className="text-left py-3 px-4 font-semibold">Scope</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {scopedSlots.map((s) => (
                <tr
                  key={s.slot}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    #{s.slot}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {s.scope}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {s.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <CodeBlock
          code={`<script setup lang="ts">
import { ref } from 'vue';
import {
  ReelPlayerOverlay,
  CloseButton,
  SoundButton,
  type ContentItem,
  type SlideOverlaySlotScope,
  type ControlsSlotScope,
} from '@reelkit/vue-reel-player';

const isOpen = ref(false);
const content = ref<ContentItem[]>([/* ... */]);
</script>

<template>
  <ReelPlayerOverlay v-model:is-open="isOpen" :content="content">
    <!-- Custom per-slide overlay: branded caption -->
    <template #slideOverlay="{ item, isActive }: SlideOverlaySlotScope">
      <div v-if="isActive" style="position:absolute;bottom:80px;left:16px;color:#fff">
        <div style="display:flex;align-items:center;gap:8px">
          <img :src="item.author.avatar" style="width:40px;height:40px;border-radius:50%" />
          <span style="font-weight:600">{{ item.author.name }}</span>
        </div>
        <p style="margin-top:8px">{{ item.description }}</p>
      </div>
    </template>

    <!-- Custom global controls -->
    <template #controls="{ onClose }: ControlsSlotScope">
      <div style="position:absolute;top:16px;right:16px;display:flex;gap:8px">
        <SoundButton />
        <CloseButton :on-click="onClose" />
      </div>
    </template>

    <!-- Custom playback timeline -->
    <template #timeline="{ timelineState }: TimelineSlotScope">
      <CustomTimelineBar :state="timelineState" />
    </template>
  </ReelPlayerOverlay>
</template>`}
          language="vue"
        />
      </section>

      {/* Custom Timeline slot */}
      <section className="mb-12">
        <Heading
          level={3}
          id="custom-timeline"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Власний таймлайн
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Замініть вбудовану смугу відтворення власним інтерфейсом перемотування
          через слот{' '}
          <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #timeline
          </code>{' '}
          . Слот спрацьовує лише тоді, коли за правилами показу оверлей вивів би
          стандартну смугу (та сама логіка{' '}
          <code className="font-mono text-xs">timeline</code> плюс{' '}
          <code className="font-mono text-xs">timelineMinDurationSeconds</code>
          ), so you don't re-implement it. Reuse the{' '}
          <code className="font-mono text-xs">.rk-reel-timeline</code> на своєму
          корені, щоб успадкувати притиснення до низу, відступи безпечної зони
          та проміжок на дотикових пристроях.
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { shallowRef, onMounted, onBeforeUnmount } from 'vue';
import {
  ReelPlayerOverlay,
  type TimelineSlotScope,
} from '@reelkit/vue-reel-player';
import { toVueRef, type TimelineController } from '@reelkit/vue';

const trackRef = shallowRef<HTMLDivElement | null>(null);
let dispose: (() => void) | null = null;
const bind = (state: TimelineController) => {
  if (trackRef.value) dispose = state.bindInteractions(trackRef.value);
};
onBeforeUnmount(() => dispose?.());
</script>

<template>
  <ReelPlayerOverlay :is-open="open" :content="items" timeline="always">
    <template #timeline="{ timelineState }: TimelineSlotScope">
      <div class="rk-reel-timeline" style="padding: 0 16px" @vue:mounted="bind(timelineState)">
        <div ref="trackRef" role="slider" style="height:6px;background:rgba(255,255,255,0.2)">
          <div :style="{
            width: (timelineState.progress.value * 100) + '%',
            height: '100%',
            background: 'linear-gradient(90deg, #6366f1, #ec4899)',
          }" />
        </div>
      </div>
    </template>
  </ReelPlayerOverlay>
</template>`}
          language="vue"
        />
      </section>

      {/* Custom Content Types */}
      <section className="mb-12">
        <Heading
          level={2}
          id="custom-content-types"
          className="text-2xl font-bold mb-4"
        >
          Власні типи вмісту
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelPlayerOverlay
          </code>{' '}
          узагальнений за формою вашого елемента вмісту. Розширте{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            BaseContentItem
          </code>{' '}
          щоб узяти будь-яку модель даних, і імпортуйте відповідний тип області
          слота, щоб прив’язки лишалися строго типізованими:
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { ref } from 'vue';
import {
  ReelPlayerOverlay,
  type BaseContentItem,
  type SlideOverlaySlotScope,
} from '@reelkit/vue-reel-player';

interface MyItem extends BaseContentItem {
  title: string;
  category: 'video' | 'photo';
}

const open = ref(false);
const items: MyItem[] = [/* ... */];
</script>

<template>
  <ReelPlayerOverlay v-model:is-open="open" :content="items">
    <template #slideOverlay="{ item }: SlideOverlaySlotScope<MyItem>">
      <div class="my-overlay">
        <h2>{{ item.title }}</h2>
        <span>{{ item.category }}</span>
      </div>
    </template>
  </ReelPlayerOverlay>
</template>`}
          language="vue"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          Той самий патерн працює для будь-якого іншого слота. Імпортуйте
          відповідний тип області (
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SlideSlotScope
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ControlsSlotScope
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            NavigationSlotScope
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            NestedSlideSlotScope
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            LoadingSlotScope
          </code>
          ) and annotate the destructure.
        </p>
      </section>

      {/* URL State */}
      <section className="mb-12">
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          Стан в URL
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Build a controller with{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useOverlayUrlState
          </code>{' '}
          from{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue
          </code>{' '}
          і передайте його в{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ReelPlayerUrlOverlay
          </code>{' '}
          as{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            controller
          </code>
          : плеєр належить адресному рядку, тож він відкривається, коли параметр
          називає слайд, і закривається, коли параметр зникає. Відкриття додає
          один запис в історію, а кожна зміна слайда його замінює, тож гортання
          стрічки не додає записів і один крок назад завжди виводить. Глибина
          URL залежить від ключа контролера: одновісний{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlIndexKey
          </code>{' '}
          адресує лише допис (
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ?reel=3
          </code>
          ), a two-axis{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlIndexTwoAxisKey
          </code>{' '}
          несе ще й індекс внутрішнього медіа мультимедійного допису (
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ?reel=3.2
          </code>
          ); pick one key per app, the two wire shapes do not cross-decode. It
          is a separate component from{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ReelPlayerOverlay
          </code>
          , so each carries exactly one open-state driver — the{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            is-open
          </code>{' '}
          модель або url{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            controller
          </code>
          , never both.
        </p>
        <Callout type="info" title="Вбудовані клавіші" className="mb-4">
          Слайди можна адресувати вбудованим ключем — розгорніть{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlIndexKey
          </code>{' '}
          (за позицією) або{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlStableIdKey
          </code>{' '}
          (за стабільним{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            id
          </code>
          ) into the controller — both re-exported from{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue
          </code>
          . See the{' '}
          <Link
            to="/uk/docs/core/guide#url-state"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            посібник зі стану в URL
          </Link>{' '}
          та{' '}
          <Link
            to="/uk/docs/core/api#url-state"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            API ядра
          </Link>
          .
        </Callout>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Застосунок із роутером має передати адаптер на базі роутера, щоб той
          лишався єдиним джерелом правди про навігацію: запис в історію повз
          нього лишає його місцеположення застарілим і втрачає параметр на
          наступній навігації.{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useVueRouterUrlAdapter
          </code>{' '}
          from{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue/vue-router-url-adapter
          </code>{' '}
          — готовий адаптер для Vue Router.
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { ReelPlayerUrlOverlay, type ContentItem } from '@reelkit/vue-reel-player';
import { useOverlayUrlState, urlIndexKey, urlStableIdKey } from '@reelkit/vue';
import { useVueRouterUrlAdapter } from '@reelkit/vue/vue-router-url-adapter';
import '@reelkit/vue-reel-player/styles.css';

const props = defineProps<{ content: ContentItem[] }>();

const reel = useOverlayUrlState({
  param: 'reel',
  adapter: useVueRouterUrlAdapter(),
  ...urlIndexKey(() => props.content.length),
});
</script>

<template>
  <!-- Opening is a link — the overlay reads the URL and opens itself. -->
  <RouterLink v-for="(post, i) in props.content" :key="post.id" :to="\`?reel=\${i}\`">
    <img :src="post.media[0].src" />
  </RouterLink>

  <ReelPlayerUrlOverlay :controller="reel" :content="props.content" />
</template>`}
          language="vue"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          Full{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useOverlayUrlState
          </code>{' '}
          опції — у{' '}
          <Link
            to="/uk/docs/vue/api#useoverlayurlstate"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            довіднику API для Vue
          </Link>
          .
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li>
            Відкриття додає <strong>один</strong> запис в історію. Свайп стрічки{' '}
            <strong>замінює</strong> його, тож N свайпів не додають записів, і
            один крок назад завжди виходить із плеєра. «Назад» закриває, а не
            гортає слайди.
          </li>
          <li>
            «Назад» закриває лише тоді, коли плеєр відкрили всередині застосунку
            — посилання додало запис. За надісланим посиланням у новій вкладці
            історії позаду немає, тож кнопка «назад» виведе із сайту; кнопка ✕
            або Escape прибирає параметр на місці й лишає вас на сторінці.
          </li>
          <li>
            Пряме посилання{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              ?reel=3
            </code>{' '}
            відкриває плеєр одразу на цьому слайді.
          </li>
          <li>
            Параметр, який не називає жодного слайда — застаріла закладка,
            змінене вручну значення, — прибирається з URL, а не лишає в
            адресному рядку слайд, який не відкриється.
          </li>
          <li>
            Глибина URL залежить від ключа контролера: одна вісь для самого
            допису або дві (
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              urlIndexTwoAxisKey
            </code>
            ) to also carry a multi-media post&rsquo;s inner image index. Pick
            one key per app; the shapes do not cross-decode.
          </li>
        </ul>

        <Heading
          level={3}
          id="one-key-or-two-pick-your-url-depth"
          className="text-xl font-semibold mt-8 mb-3"
        >
          Один ключ чи два — оберіть глибину URL
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Той самий{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ReelPlayerOverlay
          </code>{' '}
          працює з обома формами; він розрізняє їх під час виконання за position
          контролера, тож жодного пропса режиму немає. Ключ обирайте, коли
          будуєте контролер:
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 px-3 font-semibold">Key</th>
                <th className="text-left py-2 px-3 font-semibold">Wire</th>
                <th className="text-left py-2 px-3 font-semibold">Carries</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2 px-3 font-mono text-xs">urlIndexKey(…)</td>
                <td className="py-2 px-3 font-mono text-xs">?reel=3</td>
                <td className="py-2 px-3">Лише вертикальний допис.</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2 px-3 font-mono text-xs">
                  urlIndexTwoAxisKey(…)
                </td>
                <td className="py-2 px-3 font-mono text-xs">?reel=3.2</td>
                <td className="py-2 px-3">
                  Допис <em>та</em> та індекс внутрішнього медіа каруселі.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Дві форми запису навмисно різні — двовісний ключ строго з крапкою (
          <code>3.0</code>, never a bare <code>3</code>), so a bare one-axis
          link does not cross-decode. Switching an app between keys therefore
          invalidates any previously shared links. Pick one shape and keep it.
        </p>
        <CodeBlock
          code={`import { useOverlayUrlState, urlIndexTwoAxisKey } from '@reelkit/vue';

const reel = useOverlayUrlState({
  param: 'reel',
  ...urlIndexTwoAxisKey({
    outerCount: () => content.value.length,
    innerCounts: () => content.value.map((post) => post.media.length),
  }),
});

// A link now names both axes: post 3, inner media 2 — ?reel=3.2`}
          language="typescript"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          <strong>Стабільні посилання.</strong> Індекс адресує за позицією, тож
          збережений у закладках{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ?reel=3
          </code>{' '}
          відкриє інший допис, щойно стрічку перевпорядкують — а для стрічки це
          радше правило, ніж виняток.{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlStableIdKey
          </code>{' '}
          адресує за стабільним{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            id
          </code>
          , scanning the live feed — one call covers the common case.
        </p>
        <CodeBlock
          code={`const reel = useOverlayUrlState({
  param: 'reel',
  ...urlStableIdKey({ items: () => content.value }),
});`}
          language="typescript"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          Pass{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            hashCodec: base64UrlCodec
          </code>{' '}
          щоб закодувати id в URL у base64url — оборотне маскування, а не
          криптографічний хеш.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          Адресуєте за іншим полем ({' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            slug
          </code>
          ), or page an infinite feed with{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locateAsync
          </code>
          , and build the{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            codec
          </code>
          /
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locator
          </code>{' '}
          самі. Дві окремі задачі:{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            codec
          </code>{' '}
          записує ідентичність в URL,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locator
          </code>{' '}
          знаходить, де ця ідентичність лежить.
        </p>
        <CodeBlock
          code={`const reel = useOverlayUrlState({
  param: 'reel',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => content.value.findIndex((x) => x.id === id),
    identify: (index) => content.value[index].id,
  },
});`}
          language="typescript"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          <strong>Нескінченні стрічки.</strong>{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locate
          </code>{' '}
          синхронний, тож відповідає лише за вже завантажені дописи — надіслане
          посилання на допис 400 у стрічці, де завантажено 20, нічого не знайде.{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locateAsync
          </code>{' '}
          — запасний варіант, що викликається лише коли{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locate
          </code>{' '}
          misses.
        </p>
        <Callout type="info" title="Shortcut" className="mb-4">
          Keying by the item&rsquo;s{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            id
          </code>
          ? Не пишіть кодек і локатор вручну — передайте{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locateAsync
          </code>{' '}
          просто в{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlStableIdKey({'{ items, locateAsync }'})
          </code>{' '}
          (він вантажить дані, якщо не знайшов, і повертає індекс). Розгорнутий
          варіант нижче — для адресації за іншим полем або для повного контролю.
        </Callout>
        <CodeBlock
          code={`const reel = useOverlayUrlState({
  param: 'reel',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => content.value.findIndex((x) => x.id === id),
    identify: (index) => content.value[index].id,
    locateAsync: async (id) => {
      const loaded = await loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!loaded) return null; // exhausted — link names no post
      content.value = loaded; // commit — the overlay renders from this state
      return loaded.findIndex((x) => x.id === id); // wherever it landed
    },
  },
});`}
          language="typescript"
        />
        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 mt-4 mb-4">
          <li>
            While{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              locateAsync
            </code>{' '}
            у процесі, плеєр лишається закритим, а параметр — недоторканим, тож
            пряме посилання переживає запит.{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              null
            </code>{' '}
            або відмова прибирає параметр.
          </li>
          <li>
            Відповідь, що приходить після зміни URL, після закриття або після
            демонтажу, відкидається — повільний запит не відкриє слайд, якого
            ніхто не просив.
          </li>
          <li>
            Поки триває очікування, нічого не рендериться: цей стан завантаження
            вже належить сторінці, тож малюйте власний скелетон.
          </li>
          <li>
            Тайм-ауту немає — плеєр не може знати, яка стрічка завдовжки.
            Завершуйте значенням{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              null
            </code>{' '}
            коли сторінки скінчилися, інакше оверлей лишиться закритим назавжди.
          </li>
        </ul>
      </section>

      {/* API Reference */}
      <section className="mb-12">
        <Heading
          level={2}
          id="api-reference"
          className="text-2xl font-bold mb-4"
        >
          Довідник API
        </Heading>

        <Heading
          level={3}
          id="reelplayeroverlay-props"
          className="text-xl font-semibold mb-3"
        >
          Пропси ReelPlayerOverlay
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-mono">
          ReelPlayerOverlayProps
        </p>
        <div className="overflow-x-auto mb-6">
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
              {playerProps.map((p) => (
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
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
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
          id="reelplayerurloverlay-props"
          className="text-xl font-semibold mb-3"
        >
          Пропси ReelPlayerUrlOverlay
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-mono">
          ReelPlayerUrlOverlayProps
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-3">
          Приймає всі пропси вище, крім{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            is-open
          </code>
          , replaced by a{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            controller
          </code>
          .{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            initial-index
          </code>{' '}
          ігнорується — слайд обирає position контролера, тож передане поруч
          значення перезаписується на кожному відкритті.
        </p>
        <div className="overflow-x-auto mb-6">
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
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  controller
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  UrlStateController
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  required
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Контролер із <code>useOverlayUrlState</code>. Its{' '}
                  <code>позицією</code> вирішує, чи оверлей відкритий і який
                  слайд показує; оверлей записує через нього назад на зміну
                  слайда та на закриття.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading level={3} id="events" className="text-xl font-semibold mb-3">
          Events
        </Heading>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Event</th>
                <th className="text-left py-3 px-4 font-semibold">Payload</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {playerEvents.map((e) => (
                <tr
                  key={e.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    @{e.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {e.payload}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {e.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="v-model-is-open"
          className="text-xl font-semibold mb-3"
        >
          v-model:is-open
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Використовуйте{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            v-model:is-open
          </code>{' '}
          щоб керувати оверлеєм однією прив’язкою. Давніший патерн{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            :is-open
          </code>{' '}
          +{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @close
          </code>{' '}
          теж працює, якщо вам потрібна явна подія.
        </p>
        <CodeBlock
          code={`<template>
  <button @click="open = true">Open</button>
  <ReelPlayerOverlay v-model:is-open="open" :content="content" />
</template>`}
          language="vue"
        />
      </section>

      {/* Types */}
      <section className="mb-12">
        <Heading level={2} id="types" className="text-2xl font-bold mb-4">
          Types
        </Heading>

        <Heading
          level={3}
          id="contentitem"
          className="text-xl font-semibold mb-3"
        >
          ContentItem
        </Heading>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Field</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {contentItemFields.map((f) => (
                <tr
                  key={f.field}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {f.field}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {f.type}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {f.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="timelinebarprops"
          className="text-xl font-semibold mb-3"
        >
          TimelineBarProps
        </Heading>
        <CodeBlock
          code={`interface TimelineBarProps {
  class?: string;
  style?: CSSProperties;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="timelineslotscope-lt-t-gt"
          className="text-xl font-semibold mt-6 mb-3"
        >
          TimelineSlotScope&lt;T&gt;
        </Heading>
        <CodeBlock
          code={`interface TimelineSlotScope<T extends BaseContentItem> {
  item: T;
  activeIndex: number;
  timelineState: TimelineController;
  defaultContent: () => VNode | VNode[];
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="mediaitem"
          className="text-xl font-semibold mt-6 mb-3"
        >
          MediaItem
        </Heading>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Field</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {mediaItemFields.map((f) => (
                <tr
                  key={f.field}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {f.field}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {f.type}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {f.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sub-Components */}
      <section className="mb-12">
        <Heading
          level={2}
          id="sub-components"
          className="text-2xl font-bold mb-4"
        >
          Sub-Components
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Вставляйте їх у власні шаблони{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #controls
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slide
          </code>
          , or{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slideOverlay
          </code>{' '}
          . Передавайте розміри й колбеки з області слота, щоб автовідтворення,
          знімок постера й синхронізація звуку далі працювали.
        </p>

        <Heading
          level={3}
          id="closebutton"
          className="text-lg font-semibold mt-6 mb-2"
        >
          CloseButton
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Окрема кругла кнопка закриття зі стандартними стилями плеєра.
          Використовуйте всередині{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #controls
          </code>
          .
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { CloseButton } from '@reelkit/vue-reel-player';
</script>

<template>
  <CloseButton :on-click="onClose" />
  <CloseButton :on-click="onClose" class-name="my-close-btn" :style="{ top: '24px', right: '24px' }" />
</template>`}
          language="vue"
        />

        <Heading
          level={3}
          id="soundbutton"
          className="text-lg font-semibold mt-6 mb-2"
        >
          SoundButton
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Перемикач звуку. Рендерте його всередині{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SoundProvider
          </code>{' '}
          (
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelPlayerOverlay
          </code>{' '}
          надає його). Ховається, коли на активному слайді немає відео.
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { SoundButton } from '@reelkit/vue-reel-player';
</script>

<template>
  <SoundButton />
  <SoundButton disabled class-name="my-sound-btn" />
</template>`}
          language="vue"
        />

        <Heading
          level={3}
          id="timelinebar"
          className="text-lg font-semibold mt-6 mb-2"
        >
          TimelineBar
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Стандартна смуга перемотування. Читає з найближчого{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            TimelineProvider
          </code>{' '}
          (автоматично монтується всередині{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelPlayerOverlay
          </code>
          ) and renders the track, buffered ranges, progress fill, and scrub
          pill. Theme via the{' '}
          <code className="font-mono text-xs">--rk-reel-timeline-*</code>{' '}
          власними властивостями або замініть через слот{' '}
          <code className="font-mono text-xs">#timeline</code> slot.
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import type { TimelineSlotScope } from '@reelkit/vue-reel-player';
</script>

<template>
  <!-- Wrap or augment the default bar from #timeline: -->
  <ReelPlayerOverlay>
    <template #timeline="{ defaultContent }: TimelineSlotScope">
      <MyTimecode />
      <component :is="defaultContent" />
    </template>
  </ReelPlayerOverlay>
</template>`}
          language="vue"
        />

        <Heading
          level={3}
          id="slideoverlay"
          className="text-lg font-semibold mt-6 mb-2"
        >
          SlideOverlay
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Стандартний градієнтний оверлей з автором, описом і лайками.
          Показується, коли у вмісті є ці поля. Замінити або сховати його можна
          через слот{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slideOverlay
          </code>{' '}
          slot.
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { SlideOverlay } from '@reelkit/vue-reel-player';
</script>

<template>
  <SlideOverlay
    :author="{ name: 'John', avatar: '/avatar.jpg' }"
    description="Amazing content"
    :likes="12500"
  />
</template>`}
          language="vue"
        />

        <Heading
          level={3}
          id="imageslide"
          className="text-lg font-semibold mt-6 mb-2"
        >
          ImageSlide
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Слайд-зображення з лінивим завантаженням і{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            object-fit: cover
          </code>{' '}
          за замовчуванням. Складайте його всередині слота{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slide
          </code>{' '}
          щоб змінити рендеринг зображення, зберігши вбудовану поведінку.
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { ImageSlide } from '@reelkit/vue-reel-player';
</script>

<template>
  <ImageSlide :src="media.src" :size="size" />

  <ImageSlide
    :src="media.src"
    :size="size"
    class-name="my-image-slide"
    :style="{ backgroundColor: '#1a1a1a', borderRadius: '12px' }"
    :img-style="{ objectFit: 'contain' }"
  />
</template>`}
          language="vue"
        />

        <Heading
          level={3}
          id="videoslide"
          className="text-lg font-semibold mt-6 mb-2"
        >
          VideoSlide
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Слайд-відео на основі спільного елемента{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<video>'}
          </code>{' '}
          . Дає раду безперервності звуку на iOS, постерам і пам’яті позиції.
          Рендерте його всередині{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SoundProvider
          </code>{' '}
          (
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelPlayerOverlay
          </code>{' '}
          надає його).
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { VideoSlide } from '@reelkit/vue-reel-player';
</script>

<template>
  <VideoSlide
    :src="media.src"
    :poster="media.poster"
    :aspect-ratio="9 / 16"
    :size="size"
    :is-active="isActive"
    :slide-key="slideKey"
    :style="{ borderRadius: '12px' }"
  />
</template>`}
          language="vue"
        />

        <Callout
          type="info"
          title="Складання власних слайдів"
          className="mt-4 mb-4"
        >
          Використовуйте{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slide
          </code>{' '}
          з{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ImageSlide
          </code>{' '}
          /{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            VideoSlide
          </code>{' '}
          щоб змінити рендеринг медіа, зберігши всю вбудовану поведінку
          (автовідтворення, знімок постера, синхронізацію звуку).
        </Callout>
        <CodeBlock
          code={`<script setup lang="ts">
import {
  ReelPlayerOverlay,
  ImageSlide,
  VideoSlide,
} from '@reelkit/vue-reel-player';
</script>

<template>
  <ReelPlayerOverlay v-model:is-open="isOpen" :content="content">
    <template #slide="{ item, size, isActive, slideKey }">
      <ImageSlide
        v-if="item.media[0].type === 'image'"
        :src="item.media[0].src"
        :size="size"
        :style="{ backgroundColor: '#111' }"
        :img-style="{ objectFit: 'contain' }"
      />
      <VideoSlide
        v-else
        :src="item.media[0].src"
        :poster="item.media[0].poster"
        :aspect-ratio="item.media[0].aspectRatio"
        :size="size"
        :is-active="isActive"
        :slide-key="slideKey"
        :style="{ borderRadius: '16px' }"
      />
    </template>
  </ReelPlayerOverlay>
</template>`}
          language="vue"
        />
      </section>

      {/* Content Loading & Error Handling */}
      <section className="mb-12">
        <Heading
          level={2}
          id="content-loading-error-handling"
          className="text-2xl font-bold mb-4"
        >
          Завантаження вмісту та обробка помилок
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Плеєр стежить за станом завантаження й помилок кожного слайда. Поки
          вміст вантажиться, показується хвильовий індикатор; для зіпсованого
          медіа — значок помилки. Плеєр кешує невдалі URL, тож повторне
          відкриття зіпсованого слайда обходиться без нової спроби.
        </p>

        <Heading
          level={3}
          id="lifecycle-callbacks"
          className="text-xl font-semibold mt-6 mb-4"
        >
          Колбеки життєвого циклу
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Коли використовуєте слот{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slide
          </code>{' '}
          , викликайте ці колбеки з області слота, щоб керувати індикатором
          завантаження:
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Колбек</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Коли викликати
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onReady
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Зображення завантажилося або відео почало грати. Скидає стани
                  завантаження й помилки.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onWaiting
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Відео буферизується посеред відтворення. Показує індикатор
                  завантаження.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onError
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Вміст не завантажився. Показує оверлей помилки й кешує URL як
                  зіпсований.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock
          code={`<!-- Inside #slide — wire callbacks to your custom media -->
<template #slide="{ item, size, isActive, onReady, onWaiting, onError }">
  <div :style="{ width: size[0] + 'px', height: size[1] + 'px' }">
    <img
      v-if="item.media[0].type === 'image'"
      :src="item.media[0].src"
      @load="onReady"
      @error="onError"
      style="width:100%;height:100%;object-fit:cover"
    />
    <video
      v-else
      :src="item.media[0].src"
      :autoplay="isActive"
      @canplay="onReady"
      @waiting="onWaiting"
      @error="onError"
      style="width:100%;height:100%;object-fit:cover"
    />
  </div>
</template>`}
          language="vue"
        />

        <Heading
          level={3}
          id="custom-loading-error-ui"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Власний інтерфейс завантаження та помилок
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Замініть стандартний хвильовий індикатор і значок помилки через слоти{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #loading
          </code>{' '}
          та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #error
          </code>{' '}
          slots:
        </p>
        <CodeBlock
          code={`<ReelPlayerOverlay v-model:is-open="isOpen" :content="content">
  <template #loading="{ activeIndex }">
    <div
      style="position:absolute;inset:0;z-index:10;display:flex;
             align-items:center;justify-content:center;color:#fff;font-size:14px"
    >
      Loading slide {{ activeIndex + 1 }}...
    </div>
  </template>

  <template #error="{ activeIndex }">
    <div
      style="position:absolute;inset:0;z-index:10;display:flex;
             flex-direction:column;align-items:center;justify-content:center;
             gap:12px;color:rgba(255,255,255,0.5)"
    >
      <span style="font-size:48px">!</span>
      <span>Slide {{ activeIndex + 1 }} failed to load</span>
    </div>
  </template>
</ReelPlayerOverlay>`}
          language="vue"
        />
      </section>

      {/* Timeline */}
      <section className="mb-12">
        <Heading level={2} id="timeline" className="text-2xl font-bold mb-4">
          Таймлайн
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Оверлей показує вбудовану смугу таймлайну відтворення над активним
          відео. Керуйте показом через пропс{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            timeline
          </code>{' '}
          prop: <code className="font-mono text-xs">'auto'</code> (типово)
          показує її, коли активне медіа — відео, довше за{' '}
          <code className="font-mono text-xs">timelineMinDurationSeconds</code>{' '}
          (default 30), <code className="font-mono text-xs">'always'</code>{' '}
          щойно активне відео,{' '}
          <code className="font-mono text-xs">'never'</code> вимикає її. Для
          повністю власної смуги перемотування беріть слот{' '}
          <code className="font-mono text-xs">#timeline</code> ; його область
          відкриває <code className="font-mono text-xs">timelineState</code> на
          основі <code className="font-mono text-xs">TimelineController</code>.
        </p>
        <CodeBlock
          code={`<ReelPlayerOverlay
  :is-open="isOpen"
  :content="items"
  timeline="auto"
  :timeline-min-duration-seconds="30"
  @close="isOpen = false"
/>`}
          language="vue"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          Тему задавайте через власні властивості CSS{' '}
          <code className="font-mono text-xs">--rk-reel-timeline-*</code>{' '}
          власними властивостями CSS.
        </p>
      </section>

      {/* Sound Context */}
      <section className="mb-12">
        <Heading
          level={2}
          id="sound-context"
          className="text-2xl font-bold mb-4"
        >
          Контекст звуку
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelPlayerOverlay
          </code>{' '}
          монтує{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SoundProvider
          </code>{' '}
          у своєму корені, тож будь-який компонент усередині може читати або
          перемикати стан звуку через{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            useSoundState
          </code>
          . Композабл реекспортовано з{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/vue-reel-player
          </code>{' '}
          тож окремий{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/vue
          </code>{' '}
          import.
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { useSoundState, toVueRef } from '@reelkit/vue';

// Inside a custom control rendered from the #controls slot:
const soundState = useSoundState();
const muted = toVueRef(soundState.muted);
</script>

<template>
  <button @click="soundState.toggle()">
    {{ muted ? 'Unmute' : 'Mute' }}
  </button>
</template>`}
          language="vue"
        />
        <Callout type="info" className="mt-4">
          Усередині плеєра слот{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #controls
          </code>{' '}
          також відкриває{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            soundState
          </code>{' '}
          у своїй області. Беріть саме його, якщо він потрібен лише в шаблоні
          елементів керування.
        </Callout>
      </section>

      {/* CSS Classes */}
      <section className="mb-12">
        <Heading level={2} id="css-classes" className="text-2xl font-bold mb-4">
          Класи CSS
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Класи CSS звичайні (не scoped). Таблиця стилів, підключена після{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue-reel-player/styles.css
          </code>{' '}
          може перекрити будь-який із них селектором вищої специфічності. Для
          змін кольору, розміру та z-index беріть власні властивості CSS із
          розділу{' '}
          <Link
            to={{ hash: '#theming' }}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Theming
          </Link>{' '}
          нижче.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Class</th>
                <th className="text-left py-3 px-4 font-semibold">Component</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {cssClasses.map((c) => (
                <tr
                  key={c.className}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {c.className}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-sm">
                    {c.component}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {c.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Theming */}
      <section id="theming" className="mb-12">
        <Heading level={2} id="theming" className="text-2xl font-bold mb-4">
          Theming
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Кожен колір, розмір, z-index і перехід живе у власній властивості CSS.
          Перевизначайте одну чи кілька на{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            :root
          </code>{' '}
          (або на будь-якому предку оверлея), щоб змінити тему, не чіпаючи код
          компонентів. Токени збігаються з{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-reel-player
          </code>
          , so overrides port between bindings.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Token</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Типове значення
                </th>
                <th className="text-left py-3 px-4 font-semibold">Controls</th>
              </tr>
            </thead>
            <tbody>
              {themeTokens.map((t) => (
                <tr
                  key={t.token}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {t.token}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {t.default}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {t.controls}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-slate-600 dark:text-slate-400 mb-3">
          Вставте фрагмент нижче в таблицю стилів, підключену після{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue-reel-player/styles.css
          </code>
          .
        </p>

        <CodeBlock
          code={`/* Brand the reel-player overlay */
:root {
  --rk-reel-overlay-bg: #0f172a;
  --rk-reel-button-bg: rgba(99, 102, 241, 0.65);
  --rk-reel-button-bg-hover-strong: rgba(168, 85, 247, 0.85);
  --rk-reel-edge-padding: 24px;
  --rk-reel-button-size: 52px;

  /* Timeline bar: brand-matched, beefier on desktop */
  --rk-reel-timeline-track: rgba(99, 102, 241, 0.25);
  --rk-reel-timeline-buffered: rgba(168, 85, 247, 0.45);
  --rk-reel-timeline-fill: #a855f7;
  --rk-reel-timeline-cursor: #a855f7;
  --rk-reel-timeline-height: 4px;
  --rk-reel-timeline-height-active: 8px;
  --rk-reel-timeline-cursor-width-active: 18px;
  --rk-reel-timeline-transition: 0.2s ease-out;
}`}
          language="css"
        />
      </section>

      {/* Accessibility */}
      <section className="mb-12">
        <Heading
          level={2}
          id="accessibility"
          className="text-2xl font-bold mb-4"
        >
          Accessibility
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Корінь оверлея — модальний діалог (
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="dialog"
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-modal="true"
          </code>
          ). Set the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-label
          </code>{' '}
          щоб змінити оголошення для екранного читача; типове значення — «Video
          player». Кожен слайд несе{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="group"
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-roledescription="slide"
          </code>
          , та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-label="Слайд N з M"
          </code>
          .
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Оверлей захоплює фокус під час відкриття й повертає його на
          елемент-тригер після закриття. Tab і Shift+Tab циклічно проходять
          фокусовані елементи всередині; фокус, що вислизнув (клік поза
          оверлеєм, програмна установка), повертається назад. Реалізовано через{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            captureFocusForReturn
          </code>{' '}
          та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            createFocusTrap
          </code>{' '}
          from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/core
          </code>
          .
        </p>
      </section>

      {/* Keyboard Shortcuts */}
      <section>
        <Heading
          level={2}
          id="keyboard-shortcuts"
          className="text-2xl font-bold mb-4"
        >
          Клавіатурні скорочення
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Key</th>
                <th className="text-left py-3 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {keyboardShortcuts.map((s) => (
                <tr
                  key={s.key}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {s.key}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {s.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
