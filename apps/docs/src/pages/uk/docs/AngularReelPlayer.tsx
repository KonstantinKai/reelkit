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
    path: '/docs/angular-reel-player',
    title: 'Reel Player для Angular · ReelKit',
    description:
      'Повноекранний відеоплеєр для Angular: входи та виходи компонента, шаблонні слоти, таймлайн, звук і темізація.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

const playerInputs = [
  {
    prop: 'ariaLabel',
    type: 'string',
    default: "'Video player'",
    description: 'Доступна назва області діалогу',
  },
  {
    prop: 'aspectRatio',
    type: 'number | undefined',
    default: 'undefined',
    description:
      'Співвідношення ширини до висоти контейнера на десктопі. Типово 9/16. На мобільних плеєр займає всю область перегляду.',
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
      "Правило показу вбудованої смуги таймлайну. 'auto' показує її лише для відео, довших за timelineMinDurationSeconds; 'always' — щойно на активному слайді є відео; 'never' вимикає вбудовану смугу (для повної заміни беріть шаблонний слот rkPlayerTimeline).",
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

const playerOutputs = [
  {
    prop: 'apiReady',
    type: 'EventEmitter<ReelApi>',
    description:
      'Видається, коли слайдер готовий, і відкриває імперативний API',
  },
  {
    prop: 'closed',
    type: 'EventEmitter<void>',
    description: 'Видається, коли плеєр закрито',
  },
  {
    prop: 'slideChange',
    type: 'EventEmitter<number>',
    description: 'Видається, коли змінюється індекс активного слайда',
  },
  {
    prop: 'innerSlideChange',
    type: 'EventEmitter<{ outer: number; inner: number }>',
    description:
      'Видається, коли змінюється індекс внутрішнього медіа активного допису — під час внутрішньої навігації та під час активації зовнішнього, повідомляючи поточний внутрішній індекс активованого допису (0 для допису з одним медіа).',
  },
];

const templateSlots = [
  {
    directive: 'rkPlayerControls',
    context: 'PlayerControlsContext<T>',
    description:
      'Власна загальна смуга керування (закриття, перемикач звуку тощо)',
  },
  {
    directive: 'rkPlayerError',
    context: '{ $implicit: activeIndex, item, innerActiveIndex }',
    description: 'Шаблонний слот власного індикатора помилки',
  },
  {
    directive: 'rkPlayerLoading',
    context: '{ $implicit: activeIndex, item, innerActiveIndex }',
    description: 'Шаблонний слот власного індикатора завантаження',
  },
  {
    directive: 'rkPlayerNavigation',
    context: 'PlayerNavigationContext',
    description: 'Власні стрілки навігації вперед і назад',
  },
  {
    directive: 'rkPlayerNestedNavigation',
    context: 'PlayerNestedNavigationContext',
    description:
      'Власні стрілки навігації для внутрішнього горизонтального слайдера',
  },
  {
    directive: 'rkPlayerNestedSlide',
    context: 'PlayerNestedSlideContext',
    description:
      'Власний вміст кожного слайда всередині внутрішнього горизонтального слайдера',
  },
  {
    directive: 'rkPlayerSlide',
    context: 'PlayerSlideContext<T>',
    description:
      'Повністю власний вміст слайда, що замінює стандартний медіаслайд',
  },
  {
    directive: 'rkPlayerSlideOverlay',
    context: 'PlayerSlideOverlayContext<T>',
    description: 'Оверлей для кожного слайда (дані автора, лайки, опис тощо)',
  },
  {
    directive: 'rkPlayerTimeline',
    context: 'PlayerTimelineContext<T>',
    description:
      'Власна смуга таймлайну відтворення. Показується лише тоді, коли за правилом (режим timeline плюс мінімальна тривалість) вивелася б стандартна смуга — логіка auto/always/never та сама.',
  },
];

const mediaItemProps = [
  {
    prop: 'id',
    type: 'string',
    description: 'Унікальний ідентифікатор медіаелемента',
  },
  { prop: 'type', type: "'image' | 'video'", description: 'Тип медіа' },
  { prop: 'src', type: 'string', description: 'URL медіафайлу' },
  {
    prop: 'poster',
    type: 'string?',
    description: 'URL мініатюри-постера для елементів-відео',
  },
  {
    prop: 'aspectRatio',
    type: 'number',
    description:
      'співвідношення ширини до висоти. Значення < 1 означають вертикальне (cover), > 1 — горизонтальне (contain)',
  },
];

const contextTypes = [
  {
    name: 'PlayerControlsContext<T>',
    fields:
      '{ $implicit: onClose, activeIndex, content: T[], soundState: PlayerSoundState }',
  },
  {
    name: 'PlayerNavigationContext',
    fields: '{ $implicit: onPrev, onNext, activeIndex, count }',
  },
  {
    name: 'PlayerNestedNavigationContext',
    fields: '{ $implicit: onPrev, onNext, activeIndex, count }',
  },
  {
    name: 'PlayerNestedSlideContext',
    fields:
      '{ $implicit: MediaItem, index, size, isActive, isInnerActive, slideKey }',
  },
  {
    name: 'PlayerSlideContext<T>',
    fields:
      '{ $implicit: T, index, size: [number,number], isActive, slideKey, onReady, onWaiting, onError }',
  },
  {
    name: 'PlayerSlideOverlayContext<T>',
    fields: '{ $implicit: T, index, isActive }',
  },
  {
    name: 'PlayerTimelineContext<T>',
    fields: '{ $implicit: T, activeIndex, timelineState: PlayerTimelineState }',
  },
  {
    name: 'PlayerTimelineState',
    fields:
      '{ duration(), currentTime(), progress(), bufferedRanges(), isScrubbing(), seek(t), bindInteractions(el) }',
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
    className: '.rk-reel-nav-btn',
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
    className: '.rk-reel-video-loader',
    component: 'VideoSlide',
    description: 'Хвильова анімація завантаження',
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
  {
    className: '.rk-reel-nested-slider-inner',
    component: 'NestedSlider',
    description: 'Корінь вкладеного горизонтального слайдера',
  },

  // Timeline
  {
    className: '.rk-reel-timeline',
    component: 'TimelineBar',
    description:
      'Scrub-bar wrapper. Reuse on custom `rkPlayerTimeline` template roots to inherit flush-bottom positioning, safe-area padding, and touch-device slide-overlay clearance.',
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
  {
    token: '--rk-reel-video-loader-color',
    default: 'rgba(255, 255, 255, 0.15)',
    controls: 'Video buffering shimmer color',
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
  {
    token: '--rk-reel-nested-edge-padding',
    default: '12px',
    controls: 'Nested arrow edge inset',
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

export default function AngularReelPlayer() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Reel Player для Angular</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Повноекранний вертикальний медіаплеєр у стилі Instagram чи TikTok для
          Angular на основі{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/angular-reel-player
          </code>
          .
        </p>
        <a
          href="https://angular-demo.reelkit.dev/reel-player?utm_source=docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          Подивитися демо наживо &rarr;
        </a>
      </div>

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
                label: 'Customizable',
                desc: 'Шаблонні слоти для всього',
              },
              {
                icon: Zap,
                label: 'Обробка помилок',
                desc: 'Виявлення зіпсованого медіа з LRU-кешем',
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

      <section className="mb-12">
        <Heading
          level={2}
          id="installation"
          className="text-2xl font-bold mb-4"
        >
          Встановлення
        </Heading>
        <CodeBlock
          code={`npm install @reelkit/angular-reel-player @reelkit/angular lucide-angular`}
          language="bash"
        />
        <Callout type="info" title="Icons" className="mt-4">
          Стандартні елементи керування використовують{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lucide-angular
          </code>{' '}
          для іконок (закриття, звук, стрілки навігації). Якщо ви віддаєте
          перевагу іншій бібліотеці іконок, скористайтеся слотами{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkPlayerControls
          </code>{' '}
          та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkPlayerNavigation
          </code>{' '}
          щоб передати власні.
        </Callout>
      </section>

      <section className="mb-12">
        <Heading level={2} id="basic-usage" className="text-2xl font-bold mb-4">
          Базове використання
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Імпортуйте таблицю стилів і автономний{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RkReelPlayerOverlayComponent
          </code>{' '}
          у{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            imports
          </code>{' '}
          array.
        </p>
        <Sandbox
          code={`import { Component, signal } from '@angular/core';
import {
  RkReelPlayerOverlayComponent,
  type ContentItem,
} from '@reelkit/angular-reel-player';
import '@reelkit/angular-reel-player/styles.css';

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
    description: 'Amazing content',
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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RkReelPlayerOverlayComponent],
  template: \`
    <!-- Grid thumbnail view -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
      @for (item of content; track item.id; let i = $index) {
        <button
          (click)="openAt(i)"
          style="aspect-ratio:9/16;cursor:pointer;overflow:hidden"
        >
          <img
            [src]="item.media[0].poster || item.media[0].src"
            style="width:100%;height:100%;object-fit:cover"
          />
        </button>
      }
    </div>

    <rk-reel-player-overlay
      [isOpen]="isOpen()"
      [content]="content"
      [initialIndex]="startIndex()"
      (closed)="isOpen.set(false)"
    />
  \`,
})
export class AppComponent {
  readonly content = content;
  readonly isOpen = signal(false);
  readonly startIndex = signal(0);

  openAt(index: number): void {
    this.startIndex.set(index);
    this.isOpen.set(true);
  }
}`}
          language="typescript"
          title="reel-feed.component.ts"
          framework="angular"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="template-slots"
          className="text-2xl font-bold mb-4"
        >
          Шаблонні слоти
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Шість директив шаблонних слотів дають налаштувати будь-яку частину
          інтерфейсу плеєра. Кожна отримує строго типізований об’єкт контексту.
          Задавайте лише ті слоти, які хочете перекрити — для решти лишиться
          стандартний вигляд.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Directive</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Тип контексту
                </th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {templateSlots.map((s) => (
                <tr
                  key={s.directive}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    [{s.directive}]
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {s.context}
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
          code={`import {
  RkReelPlayerOverlayComponent,
  RkPlayerSlideOverlayDirective,
  RkPlayerControlsDirective,
  RkPlayerNavigationDirective,
  RkCloseButtonComponent,
  RkSoundButtonComponent,
  type ContentItem,
  type PlayerSlideOverlayContext,
  type PlayerControlsContext,
  type PlayerNavigationContext,
} from '@reelkit/angular-reel-player';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RkReelPlayerOverlayComponent,
    RkPlayerSlideOverlayDirective,
    RkPlayerControlsDirective,
    RkPlayerNavigationDirective,
    RkCloseButtonComponent,
    RkSoundButtonComponent,
  ],
  template: \`
    <rk-reel-player-overlay
      [isOpen]="isOpen"
      [content]="content"
      (closed)="isOpen = false"
    >
      <!-- Custom per-slide overlay: author + likes -->
      <ng-template rkPlayerSlideOverlay let-item let-isActive="isActive">
        @if (isActive) {
          <div style="position:absolute;bottom:80px;left:16px;color:#fff">
            <div style="display:flex;align-items:center;gap:8px">
              <img [src]="item.author.avatar" style="width:40px;height:40px;border-radius:50%" />
              <span style="font-weight:600">{{ item.author.name }}</span>
            </div>
            <p style="margin-top:8px">{{ item.description }}</p>
          </div>
        }
      </ng-template>

      <!-- Custom global controls -->
      <ng-template rkPlayerControls
                   let-onClose
                   let-soundState="soundState">
        <div style="position:absolute;top:16px;right:16px;display:flex;gap:8px">
          <rk-sound-button [soundState]="soundState" />
          <rk-close-button (click)="onClose()" />
        </div>
      </ng-template>

      <!-- Custom navigation -->
      <ng-template rkPlayerNavigation
                   let-onPrev
                   let-onNext="onNext"
                   let-activeIndex="activeIndex"
                   let-count="count">
        <div style="position:absolute;right:16px;top:50%;transform:translateY(-50%)">
          <button (click)="onPrev()" [disabled]="activeIndex === 0">&#9650;</button>
          <button (click)="onNext()" [disabled]="activeIndex === count - 1">&#9660;</button>
        </div>
      </ng-template>

      <!-- Custom playback timeline -->
      <ng-template rkPlayerTimeline let-state="timelineState">
        <div class="rk-reel-timeline" style="padding:0 16px"
             (pointerdown)="bindTrack(track, state); track.focus()">
          <div #track
               role="slider"
               [attr.aria-valuenow]="state.currentTime()"
               style="height:6px;background:rgba(255,255,255,0.2);border-radius:999px">
            <div [style.width.%]="state.progress() * 100"
                 style="height:100%;background:linear-gradient(90deg,#6366f1,#ec4899);border-radius:999px"></div>
          </div>
        </div>
      </ng-template>
    </rk-reel-player-overlay>
  \`,
})
export class AppComponent {
  isOpen = false;
  content: ContentItem[] = [];

  private _trackDispose: (() => void) | null = null;
  /** Wire pointer + keyboard scrub onto your custom track element. */
  bindTrack(el: HTMLElement, state: PlayerTimelineState) {
    this._trackDispose?.();
    this._trackDispose = state.bindInteractions(el);
  }
}`}
          language="typescript"
        />
      </section>

      {/* Custom Timeline subsection */}
      <section className="mb-12">
        <Heading
          level={3}
          id="custom-timeline"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Власний таймлайн
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkPlayerTimeline
          </code>{' '}
          викликається лише тоді, коли за правилами показу оверлей вивів би
          стандартну смугу (та сама логіка{' '}
          <code className="font-mono text-xs">timeline</code> плюс{' '}
          <code className="font-mono text-xs">timelineMinDurationSeconds</code>
          ), so you don't re-implement it. Reuse the{' '}
          <code className="font-mono text-xs">.rk-reel-timeline</code> на своєму
          корені, щоб успадкувати притиснення до низу, відступи безпечної зони
          та проміжок на дотикових пристроях. Викличте{' '}
          <code className="font-mono text-xs">state.bindInteractions(el)</code>{' '}
          на своїй доріжці перемотування, щоб підключити перемотування
          вказівником і клавіатурою.
        </p>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="nested-slider-multi-media-items"
          className="text-2xl font-bold mb-4"
        >
          Вкладений слайдер (мультимедійні елементи)
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Коли{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ContentItem
          </code>{' '}
          містить кілька записів{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            media
          </code>{' '}
          , плеєр показує їх у вкладеному горизонтальному слайдері (як карусель
          Instagram). Через слот{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkPlayerNestedSlide
          </code>{' '}
          можна налаштувати вміст внутрішнього слайда.
        </p>
        <CodeBlock
          code={`const carouselItem: ContentItem = {
  id: '3',
  media: [
    { id: 'img-a', type: 'image', src: '/photo-a.jpg', aspectRatio: 2 / 3 },
    { id: 'img-b', type: 'image', src: '/photo-b.jpg', aspectRatio: 3 / 4 },
    { id: 'img-c', type: 'image', src: '/photo-c.jpg', aspectRatio: 1 },
  ],
  author: { name: 'Emma Davis', avatar: '/avatar3.jpg' },
  likes: 8901,
  description: 'Travel moments',
};`}
          language="typescript"
        />
      </section>

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
          медіа — значок помилки. URL з помилками кешуються, тож повторний
          перехід одразу показує помилку без нової спроби.
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
            rkPlayerSlide
          </code>{' '}
          , керуйте індикатором завантаження через колбеки контексту:
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
          code={`<!-- Wire lifecycle callbacks in a custom slide template -->
<rk-reel-player-overlay [isOpen]="isOpen" [content]="items" (closed)="isOpen = false">
  <ng-template rkPlayerSlide
    let-item
    let-size="size"
    let-isActive="isActive"
    let-onReady="onReady"
    let-onWaiting="onWaiting"
    let-onError="onError"
  >
    @if (item.media[0].type === 'image') {
      <img
        [src]="item.media[0].src"
        (load)="onReady()"
        (error)="onError()"
        [style.width.px]="size[0]"
        [style.height.px]="size[1]"
        style="object-fit: cover"
      />
    } @else {
      <video
        [src]="item.media[0].src"
        [autoplay]="isActive"
        (canplay)="onReady()"
        (waiting)="onWaiting()"
        (error)="onError()"
        [style.width.px]="size[0]"
        [style.height.px]="size[1]"
        style="object-fit: cover"
      />
    }
  </ng-template>
</rk-reel-player-overlay>`}
          language="html"
        />

        <Heading
          level={3}
          id="custom-loading-error-ui"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Власний інтерфейс завантаження та помилок
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Замініть стандартний хвильовий індикатор і значок помилки власними
          шаблонами:
        </p>

        <CodeBlock
          code={`<rk-reel-player-overlay [isOpen]="isOpen" [content]="items" (closed)="isOpen = false">
  <ng-template rkPlayerLoading let-index let-item="item">
    <div style="
      position: absolute; inset: 0; z-index: 10;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 14px;
    ">
      Loading slide {{ index + 1 }}...
    </div>
  </ng-template>

  <ng-template rkPlayerError let-index let-item="item">
    <div style="
      position: absolute; inset: 0; z-index: 10;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 12px; color: rgba(255,255,255,0.5);
    ">
      <span style="font-size: 48px">!</span>
      <span>Failed to load media</span>
    </div>
  </ng-template>
</rk-reel-player-overlay>`}
          language="html"
        />
      </section>

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
          : <code className="font-mono text-xs">'auto'</code> (типово) показує
          її, коли активне медіа — відео, довше за{' '}
          <code className="font-mono text-xs">timelineMinDurationSeconds</code>{' '}
          (default 30), <code className="font-mono text-xs">'always'</code>{' '}
          щойно активне відео,{' '}
          <code className="font-mono text-xs">'never'</code> вимикає її. Для
          повністю власної смуги перемотування беріть слот{' '}
          <code className="font-mono text-xs">rkPlayerTimeline</code> ; його
          контекст відкриває{' '}
          <code className="font-mono text-xs">timelineState</code> на основі{' '}
          <code className="font-mono text-xs">TimelineController</code>.
        </p>
        <CodeBlock
          code={`<rk-reel-player-overlay
  [isOpen]="isOpen()"
  [content]="items"
  timeline="auto"
  [timelineMinDurationSeconds]="30"
  (closed)="isOpen.set(false)"
/>`}
          language="html"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          Тему задавайте через власні властивості CSS{' '}
          <code className="font-mono text-xs">--rk-reel-timeline-*</code>{' '}
          власними властивостями CSS. Для прямого керування у власних
          компонентах-споживачах впроваджуйте{' '}
          <code className="font-mono text-xs">TimelineStateService</code>.
        </p>

        <Heading
          level={3}
          id="rktimelinebarcomponent"
          className="text-xl font-semibold mt-8 mb-3"
        >
          RkTimelineBarComponent
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Стандартний компонент смуги перемотування. Використовує{' '}
          <code className="font-mono text-xs">TimelineStateService</code> (його
          надає{' '}
          <code className="font-mono text-xs">
            RkReelPlayerOverlayComponent
          </code>
          ) and renders the track, buffered ranges, progress fill, and scrub
          pill. Selector:{' '}
          <code className="font-mono text-xs">rk-timeline-bar</code>. Входи:{' '}
          <code className="font-mono text-xs">class?: string</code>,{' '}
          <code className="font-mono text-xs">
            style?: Record&lt;string, string&gt;
          </code>
          . Використовуйте всередині шаблону{' '}
          <code className="font-mono text-xs">rkPlayerTimeline</code> щоб
          загорнути або доповнити стандартну смугу; окремо — лише всередині
          споживача, який надає цей сервіс.
        </p>
        <CodeBlock
          code={`import { RkTimelineBarComponent } from '@reelkit/angular-reel-player';

@Component({
  standalone: true,
  imports: [RkReelPlayerOverlayComponent, RkTimelineBarComponent],
  template: \`
    <rk-reel-player-overlay [isOpen]="isOpen()" [content]="items">
      <!-- Wrap or augment the default bar: -->
      <ng-template rkPlayerTimeline>
        <my-timecode />
        <rk-timeline-bar />
      </ng-template>
    </rk-reel-player-overlay>
  \`,
})
export class AppComponent {}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="soundstateservice"
          className="text-2xl font-bold mb-4"
        >
          SoundStateService
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Надається на рівні{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RkReelPlayerOverlayComponent
          </code>{' '}
          . Впроваджується стандартною кнопкою звуку й відкривається в контексті
          шаблонного слота елементів керування. Можна впровадити у власні
          елементи керування, що є <em>children</em> оверлея, для прямого
          доступу.
        </p>
        <CodeBlock
          code={`import { inject } from '@angular/core';
import { SoundStateService } from '@reelkit/angular-reel-player';

@Component({ ... })
export class AppComponent {
  readonly soundState = inject(SoundStateService);

  // Use in template:
  // [class.muted]="soundState.muted()"
  // [disabled]="soundState.disabled()"
  // (click)="soundState.toggle()"
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
                  muted()
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  Signal&lt;boolean&gt;
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Чи вимкнено звук просто зараз
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  disabled()
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  Signal&lt;boolean&gt;
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  True, коли на активному слайді немає відео або триває перехід
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  toggle()
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  () =&gt; void
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Перемикає стан звуку
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          Стан в URL
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            RkReelPlayerUrlOverlayComponent
          </code>{' '}
          — окремий компонент, стан відкриття якого живе в адресному рядку.
          Побудуйте контролер через{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createOverlayUrlState
          </code>{' '}
          у контексті впровадження й передайте його як{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            [controller]
          </code>
          : плеєр відкривається, коли параметр називає слайд, і закривається,
          коли параметр зникає. Посиланнями можна ділитися, а кнопка «назад»
          закриває плеєр.{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            RkReelPlayerOverlayComponent
          </code>{' '}
          stays{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            [isOpen]
          </code>
          , тож кожен компонент має рівно один драйвер стану відкриття.
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
            @reelkit/angular
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
          Застосунок із роутером передає адаптер на базі Router, щоб той лишався
          єдиним джерелом правди про навігацію: запис в історію повз нього лишає
          його місцеположення застарілим і втрачає параметр на наступній
          навігації.{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createRouterUrlAdapter
          </code>{' '}
          from{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/angular/ng-router-url-adapter
          </code>{' '}
          — готовий адаптер.
        </p>
        <CodeBlock
          code={`import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RkReelPlayerUrlOverlayComponent,
  type ContentItem,
} from '@reelkit/angular-reel-player';
import { createOverlayUrlState, urlIndexKey, urlStableIdKey } from '@reelkit/angular';
import { createRouterUrlAdapter } from '@reelkit/angular/ng-router-url-adapter';
import '@reelkit/angular-reel-player/styles.css';

@Component({
  standalone: true,
  imports: [RkReelPlayerUrlOverlayComponent, RouterLink],
  template: \`
    @for (post of content; track post.id; let i = $index) {
      <a [routerLink]="[]" [queryParams]="{ reel: i }">{{ post.id }}</a>
    }
    <rk-reel-player-url-overlay [controller]="reel" [content]="content" />
  \`,
})
export class FeedComponent {
  content: ContentItem[] = [/* ... */];
  protected readonly reel = createOverlayUrlState({
    param: 'reel',
    adapter: createRouterUrlAdapter(),
    ...urlIndexKey(() => this.content.length),
  });
}`}
          language="typescript"
        />
        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 my-4">
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
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Full{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createOverlayUrlState
          </code>{' '}
          опції — у{' '}
          <Link
            to="/uk/docs/angular/api#createoverlayurlstate"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            довіднику API для Angular
          </Link>
          .
        </p>
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
            RkReelPlayerUrlOverlayComponent
          </code>{' '}
          працює з обома формами; він розрізняє їх під час виконання за position
          контролера, тож жодного входу режиму немає. Ключ обирайте, коли
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
          code={`import { createOverlayUrlState, urlIndexTwoAxisKey } from '@reelkit/angular';

protected readonly reel = createOverlayUrlState({
  param: 'reel',
  ...urlIndexTwoAxisKey({
    outerCount: () => this.content.length,
    innerCounts: () => this.content.map((post) => post.media.length),
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
          радше правило.{' '}
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
          code={`protected readonly reel = createOverlayUrlState({
  param: 'reel',
  ...urlStableIdKey({ items: () => this.loaded() }),
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
          , and build the <code>codec</code>/<code>locator</code> самі. Дві
          окремі задачі: <code>codec</code> записує ідентичність в URL,{' '}
          <code>locator</code> знаходить, де ця ідентичність лежить.
        </p>
        <CodeBlock
          code={`protected readonly reel = createOverlayUrlState({
  param: 'reel',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => this.loaded().findIndex((x) => x.id === id),
    identify: (index) => this.loaded()[index].id,
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
          не знаходить: завантажте потрібні сторінки й поверніть індекс, який ця
          ідентичність отримала.
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
          code={`protected readonly reel = createOverlayUrlState({
  param: 'reel',
  adapter: createRouterUrlAdapter(),
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => this.loaded().findIndex((x) => x.id === id),
    identify: (index) => this.loaded()[index].id,
    locateAsync: async (id) => {
      const page = await this.loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!page) return null; // exhausted — link names no post
      this.loaded.set(page); // commit — the overlay renders from this state
      return page.findIndex((x) => x.id === id);
    },
  },
});`}
          language="typescript"
        />
        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 mt-4">
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

      <section className="mb-12">
        <Heading
          level={2}
          id="custom-data-types"
          className="text-2xl font-bold mb-4"
        >
          Власні типи даних
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Extend{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            BaseContentItem
          </code>{' '}
          щоб узяти власну доменну модель. Компонент узагальнений:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'RkReelPlayerOverlayComponent<T extends BaseContentItem>'}
          </code>
          .
        </p>
        <CodeBlock
          code={`import type { BaseContentItem } from '@reelkit/angular-reel-player';

interface MyPost extends BaseContentItem {
  // id: string  — from BaseContentItem
  // media: MediaItem[]  — from BaseContentItem
  title: string;
  tags: string[];
  publishedAt: Date;
}

@Component({
  imports: [RkReelPlayerOverlayComponent],
  template: \`
    <rk-reel-player-overlay [isOpen]="isOpen" [content]="posts" (closed)="isOpen = false">
      <ng-template rkPlayerSlideOverlay let-post let-isActive="isActive">
        @if (isActive) {
          <div style="position:absolute;bottom:80px;left:16px;color:#fff">
            <h3>{{ post.title }}</h3>
            @for (tag of post.tags; track tag) {
              <span>#{{ tag }} </span>
            }
          </div>
        }
      </ng-template>
    </rk-reel-player-overlay>
  \`,
})
export class AppComponent {
  isOpen = false;
  posts: MyPost[] = [];
}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="rkreelplayeroverlaycomponent-inputs"
          className="text-2xl font-bold mb-4"
        >
          Входи RkReelPlayerOverlayComponent
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
              {playerInputs.map((p) => (
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
          id="rkreelplayeroverlaycomponent-outputs"
          className="text-2xl font-bold mb-4"
        >
          Виходи RkReelPlayerOverlayComponent
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
              {playerOutputs.map((p) => (
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
          id="rkreelplayerurloverlaycomponent-inputs"
          className="text-2xl font-bold mb-4"
        >
          Входи RkReelPlayerUrlOverlayComponent
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Приймає всі входи вище, крім{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            isOpen
          </code>{' '}
          та{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            initialIndex
          </code>
          , replaced by a{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            controller
          </code>{' '}
          position якого обирає слайд. Виходи{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            closed
          </code>{' '}
          та{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            slideChange
          </code>
          .
        </p>
        <div className="overflow-x-auto mb-6">
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
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  controller
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  UrlStateController
                </td>
                <td className="py-3 px-4 text-slate-500 text-sm">required</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Контролер із <code>createOverlayUrlState</code>. Its{' '}
                  <code>позицією</code> вирішує, чи плеєр відкритий і який слайд
                  показує; оверлей записує через нього назад на зміну слайда та
                  на закриття.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="mediaitem-interface"
          className="text-2xl font-bold mb-4"
        >
          Інтерфейс MediaItem
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Field</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {mediaItemProps.map((p) => (
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
          id="template-slot-context-types"
          className="text-2xl font-bold mb-4"
        >
          Типи контексту шаблонних слотів
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Fields</th>
              </tr>
            </thead>
            <tbody>
              {contextTypes.map((t) => (
                <tr
                  key={t.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {t.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {t.fields}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="css-classes" className="text-2xl font-bold mb-4">
          Класи CSS
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Усі класи CSS звичайні (не scoped), тож їх можна перекрити селекторами
          вищої специфічності в таблиці стилів, підключеній після{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/angular-reel-player/styles.css
          </code>
          . Для змін кольору, розміру та z-index краще беріть власні властивості
          CSS, описані в розділі{' '}
          <Link
            to={{ hash: '#theming' }}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Theming
          </Link>{' '}
          нижче — вони саме для цього й зроблені.
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
          компонентів. Токени збігаються з пакетами для React і Vue, тож
          перевизначення переносяться між прив’язками.
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
            @reelkit/angular-reel-player/styles.css
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
            ariaLabel
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
              {[
                { key: 'ArrowUp', action: 'Previous slide' },
                { key: 'ArrowDown', action: 'Next slide' },
                {
                  key: 'ArrowLeft',
                  action: 'Previous media (in nested slider)',
                },
                { key: 'ArrowRight', action: 'Next media (in nested slider)' },
                { key: 'Escape', action: 'Close player' },
              ].map((s) => (
                <tr
                  key={s.key}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4">
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                      {s.key}
                    </kbd>
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
