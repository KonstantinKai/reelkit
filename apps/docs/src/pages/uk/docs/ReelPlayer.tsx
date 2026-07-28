import { Link } from 'react-router-dom';
import { Callout } from '../../../components/ui/Callout';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { FeatureCardGrid } from '../../../components/ui/FeatureCard';
import { Sandbox } from '../../../components/ui/Sandbox';
import { ReelPlayerDemo } from '../../../components/demos/ReelPlayerDemo';
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
  Code,
  Layers,
  Link2,
} from 'lucide-react';
import { Heading } from '../../../components/ui/Heading';
import { ukPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/reel-player',
    title: 'Reel Player для React · ReelKit',
    description:
      'Повноекранний відеоплеєр у стилі Instagram / TikTok: стан в URL, таймлайн, контекст звуку, темізація та доступність.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

const fullCode = `import { useState } from 'react';
import { ReelPlayerOverlay, type ContentItem } from '@reelkit/react-reel-player';
import '@reelkit/react-reel-player/styles.css';

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
      src: '/cdn/samples/videos/video-04.mp4',
      poster: '/cdn/samples/videos/video-poster-04.jpg',
      aspectRatio: 16 / 9,
    }],
    author: { name: 'James Wilson', avatar: '/cdn/samples/avatars/avatar-03.jpg' },
    likes: 3456,
    description: 'City life adventures',
  },
  {
    id: '4',
    media: [
      { id: 'img2', type: 'image', src: '/cdn/samples/images/image-02.jpg', aspectRatio: 2 / 3 },
      { id: 'img3', type: 'image', src: '/cdn/samples/images/image-03.jpg', aspectRatio: 3 / 4 },
    ],
    author: { name: 'Emma Davis', avatar: '/cdn/samples/avatars/avatar-04.jpg' },
    likes: 8901,
    description: 'Travel moments',
  },
  {
    id: '5',
    media: [{
      id: 'img4',
      type: 'image',
      src: '/cdn/samples/images/image-04.jpg',
      aspectRatio: 2 / 3,
    }],
    author: { name: 'Michael Brown', avatar: '/cdn/samples/avatars/avatar-05.jpg' },
    likes: 2345,
    description: 'Golden hour magic',
  },
  {
    id: '6',
    media: [{
      id: 'v3',
      type: 'video',
      src: '/cdn/samples/videos/video-05.mp4',
      poster: '/cdn/samples/videos/video-poster-05.jpg',
      aspectRatio: 16 / 9,
    }],
    author: { name: 'Alex Johnson', avatar: '/cdn/samples/avatars/avatar-01.jpg' },
    likes: 7890,
    description: 'Living the moment',
  },
];

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  return (
    <div style={{ padding: 16, background: '#0f172a', minHeight: '100vh' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {content.map((item, i) => (
          <button
            key={item.id}
            onClick={() => { setInitialIndex(i); setIsOpen(true); }}
            style={{
              position: 'relative', aspectRatio: '9 / 16', borderRadius: 8,
              overflow: 'hidden', border: 'none', padding: 0, cursor: 'pointer',
              background: '#1e293b',
            }}
          >
            <img
              src={item.media[0].poster || item.media[0].src}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </button>
        ))}
      </div>

      <ReelPlayerOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={content}
        initialIndex={initialIndex}
      />
    </div>
  );
}`;

const reelPlayerProps = [
  {
    prop: 'apiRef',
    type: 'MutableRefObject<ReelApi>',
    default: '-',
    description: 'Ref для доступу до API Reel',
  },
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
    default: '9/16 (0.5625)',
    description:
      'Співвідношення ширини до висоти контейнера плеєра на десктопі. На мобільних плеєр завжди займає всю область перегляду.',
  },
  {
    prop: 'content',
    type: 'T[]',
    default: 'required',
    description:
      'Масив елементів вмісту (узагальнений тип, типово ContentItem)',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: 'Початковий індекс слайда',
  },
  {
    prop: 'initialInnerIndex',
    type: 'number',
    default: '0',
    description:
      'Індекс внутрішнього медіа, з якого відкриватися, лише для початково видимого допису — дає змогу двовісному URL вести просто до потрібного зображення мультимедійного допису. Ігнорується, щойно плеєр відкрито й користувач починає гортати.',
  },
  {
    prop: 'isOpen',
    type: 'boolean',
    default: 'required',
    description:
      'Керує видимістю оверлея. Для стану відкриття, керованого URL, беріть окремий ReelPlayerUrlOverlay — дивіться розділ про стан в URL нижче.',
  },
  {
    prop: 'timeline',
    type: "'auto' | 'always' | 'never'",
    default: "'auto'",
    description:
      "Правило показу вбудованої смуги таймлайну. 'auto' показує її лише для відео, довших за timelineMinDurationSeconds; 'always' — щойно на активному слайді є відео; 'never' вимикає вбудовану смугу (для повної заміни беріть renderTimeline).",
  },
  {
    prop: 'timelineMinDurationSeconds',
    type: 'number',
    default: '30',
    description:
      "Мінімальна тривалість відео (у секундах), за якої timeline='auto' показує вбудовану смугу. Короткі зациклені кліпи нижче цього порогу не показують її.",
  },
  {
    prop: 'renderControls',
    type: '(props: ControlsRenderProps) => ReactNode',
    default: '-',
    description:
      'Власні елементи керування, замінюють стандартні кнопки закриття та звуку',
  },
  {
    prop: 'renderError',
    type: '(props: { item: T; activeIndex: number }) => ReactNode',
    default: '-',
    description: 'Власний індикатор помилки, замінює стандартний значок',
  },
  {
    prop: 'renderLoading',
    type: '(props: { item: T; activeIndex: number }) => ReactNode',
    default: '-',
    description: 'Власний індикатор завантаження, замінює стандартну хвилю',
  },
  {
    prop: 'renderNavigation',
    type: '(props: NavigationRenderProps) => ReactNode',
    default: '-',
    description: 'Власна навігація, замінює стандартні вертикальні стрілки',
  },
  {
    prop: 'renderNestedNavigation',
    type: '(props: NavigationRenderProps) => ReactNode',
    default: '-',
    description:
      'Власна навігація для вкладеного горизонтального слайдера (мультимедійні дописи), замінює стандартні стрілки ліворуч і праворуч',
  },
  {
    prop: 'renderNestedSlide',
    type: '(props: NestedSlideRenderProps) => ReactNode',
    default: '-',
    description:
      'Власний рендерер слайдів вкладеного горизонтального слайдера. Через props.defaultContent можна загорнути або вбудувати стандартний ImageSlide чи VideoSlide. На відміну від renderSlide, null тут не означає повернення до стандартного.',
  },
  {
    prop: 'renderSlide',
    type: '(props: SlideRenderProps) => ReactNode | null',
    default: '-',
    description:
      'Власний рендеринг слайда. Поверніть null, щоб лишити стандартний. Через props.defaultContent можна загорнути або вбудувати стандартний слайд.',
  },
  {
    prop: 'renderSlideOverlay',
    type: '(item, index, isActive) => ReactNode',
    default: '-',
    description:
      'Власний оверлей для кожного слайда, замінює стандартний SlideOverlay. Поверніть null, щоб сховати.',
  },
  {
    prop: 'renderTimeline',
    type: '(props: TimelineRenderProps) => ReactNode',
    default: '-',
    description:
      'Власна смуга таймлайну відтворення. Викликається лише тоді, коли за правилами показу вивелася б стандартна смуга (та сама логіка auto/always/never плюс timelineMinDurationSeconds). Через props.defaultContent можна загорнути вбудований <TimelineBar />; поверніть null, щоб сховати.',
  },
];

const reelPlayerUrlProps = [
  {
    prop: 'controller',
    type: 'UrlStateController',
    default: 'required',
    description:
      'Контролер із useOverlayUrlState. Його position вирішує, чи оверлей відкритий і який слайд показує; оверлей записує через нього назад на зміну слайда та на закриття.',
  },
];

const reelPlayerCallbacks = [
  {
    prop: 'onClose',
    type: '() => void',
    description:
      'Викликається, коли плеєр закривається. Обов’язковий у ReelPlayerOverlay (стан відкриття ваш, тож закриття обробляєте ви); необов’язковий у ReelPlayerUrlOverlay, де закриттям керує URL — передавайте лише щоб зреагувати після закриття.',
  },
  {
    prop: 'onSlideChange',
    type: '(index: number) => void',
    description: 'Викликається після зміни слайда',
  },
  {
    prop: 'onInnerSlideChange',
    type: '(outerIndex: number, innerIndex: number) => void',
    description:
      'Викликається, коли змінюється індекс внутрішнього медіа активного допису — під час навігації всередині мультимедійного допису й під час активації зовнішнього, повідомляючи поточний внутрішній індекс активованого допису (0 для допису з одним медіа).',
  },
];

const reelProps = [
  {
    prop: 'enableNavKeys',
    type: 'boolean',
    default: 'true',
    description: 'Вмикає навігацію з клавіатури',
  },
  {
    prop: 'enableWheel',
    type: 'boolean',
    default: 'true',
    description: 'Вмикає навігацію колесом миші',
  },
  {
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description: 'Вмикає нескінченний цикл',
  },
  {
    prop: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: 'Поріг свайпу (0–1)',
  },
  {
    prop: 'transitionDuration',
    type: 'number',
    default: '300',
    description: 'Тривалість анімації переходу (мс)',
  },
  {
    prop: 'wheelDebounceMs',
    type: 'number',
    default: '200',
    description: 'Тривалість дебаунсу колеса (мс)',
  },
];

const keyboardShortcuts = [
  { key: 'ArrowUp', action: 'Previous slide' },
  { key: 'ArrowDown', action: 'Next slide' },
  { key: 'ArrowLeft', action: 'Previous media (in nested slider)' },
  { key: 'ArrowRight', action: 'Next media (in nested slider)' },
  { key: 'Escape', action: 'Close player' },
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

  // Shared button (close, sound, nav arrows)
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
  {
    token: '--rk-reel-error-text-size',
    default: '13px',
    controls: 'Error message font size',
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
  {
    token: '--rk-reel-slide-overlay-description-color',
    default: 'rgba(255, 255, 255, 0.9)',
    controls: 'Description text color',
  },
  {
    token: '--rk-reel-slide-overlay-likes-color',
    default: 'rgba(255, 255, 255, 0.8)',
    controls: 'Likes row text color',
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
    token: '--rk-reel-nested-button-bg-hover',
    default: 'rgba(255, 255, 255, 0.2)',
    controls: 'Nested arrow hover background',
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
    token: '--rk-reel-timeline-hitbox',
    default: '16px',
    controls: 'Extra pointer hit-area above the track',
  },
  {
    token: '--rk-reel-timeline-transition',
    default: '0.15s ease-out',
    controls: 'Track + pill grow/shrink animation',
  },
  {
    token: '--rk-reel-timeline-z',
    default: '11',
    controls: 'Timeline z-index (above the default UI layer)',
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
      'Обгортка смуги перемотування. Використовуйте на власних коренях `renderTimeline`, щоб успадкувати притиснення до низу, відступи безпечної зони та проміжок для оверлея слайда на дотикових пристроях.',
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

export default function ReelPlayer() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Reel Player</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Повноекранний компонент відеоплеєра у стилі Instagram Reels чи TikTok
          на основі{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-reel-player
          </code>
          .
        </p>
        <a
          href="https://react-demo.reelkit.dev/reel-player?utm_source=docs"
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
                label: 'Customizable',
                desc: 'Render props для всього',
              },
              {
                icon: Zap,
                label: 'Оверлей слайда',
                desc: 'Автор, лайки, опис',
              },
              {
                icon: Link2,
                label: 'Стан в URL',
                desc: 'Посилання, якими можна ділитися й зберігати в закладки',
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
          code="npm install @reelkit/react-reel-player @reelkit/react lucide-react"
          language="bash"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          Не забудьте імпортувати стилі:
        </p>
        <CodeBlock
          code={`import '@reelkit/react-reel-player/styles.css';`}
          language="typescript"
        />
        <Callout type="info" title="Icons" className="mt-4">
          Стандартні елементи керування використовують{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lucide-react
          </code>{' '}
          для іконок. Якщо ви віддаєте перевагу іншій бібліотеці іконок,
          скористайтеся{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderControls
          </code>{' '}
          та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderNavigation
          </code>{' '}
          , щоб передати власні.
        </Callout>
      </section>

      {/* Quick Start */}
      <section className="mb-12">
        <Heading level={2} id="quick-start" className="text-2xl font-bold mb-4">
          Швидкий старт
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ReelPlayerOverlay
          </code>{' '}
          рендерить повноекранний оверлей плеєра. Передайте масив{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ContentItem
          </code>{' '}
          і керуйте видимістю через{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            isOpen
          </code>
          .
        </p>
        <CodeBlock
          code={`import { useState } from 'react';
import { ReelPlayerOverlay, type ContentItem } from '@reelkit/react-reel-player';
import '@reelkit/react-reel-player/styles.css';

const content: ContentItem[] = [
  {
    id: '1',
    media: [{
      id: 'v1',
      type: 'video',
      src: 'https://example.com/video.mp4',
      poster: 'https://example.com/poster.jpg',
      aspectRatio: 9 / 16,
    }],
    author: { name: 'John Doe', avatar: 'https://example.com/avatar.jpg' },
    likes: 1234,
    description: 'Amazing video!',
  },
];

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Player</button>
      <ReelPlayerOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={content}
      />
    </>
  );
}`}
          language="tsx"
        />
      </section>

      {/* Live Demo */}
      <section className="mb-12">
        <Heading level={2} id="live-demo" className="text-2xl font-bold mb-4">
          Демо наживо
        </Heading>
        <Sandbox
          code={fullCode}
          title="ReelPlayerPage.tsx"
          height={500}
          stackblitzDeps={['@reelkit/react-reel-player']}
          stackblitzExtraDeps={{ 'lucide-react': '^0.562.0' }}
        >
          <ReelPlayerDemo />
        </Sandbox>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Натисніть мініатюру, щоб відкрити повноекранний плеєр. Escape або
          кнопка закриття повертають назад.
        </p>
      </section>

      {/* Customization */}
      <section className="mb-12">
        <Heading
          level={2}
          id="customization"
          className="text-2xl font-bold mb-4"
        >
          Customization
        </Heading>

        <Heading
          level={3}
          id="generic-content-type"
          className="text-xl font-semibold mt-6 mb-4"
        >
          Узагальнений тип вмісту
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Використовуйте власні типи даних, розширивши{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            BaseContentItem
          </code>
          :
        </p>
        <CodeBlock
          code={`import { ReelPlayerOverlay, type BaseContentItem } from '@reelkit/react-reel-player';

interface MyItem extends BaseContentItem {
  title: string;
  username: string;
}

const items: MyItem[] = [
  {
    id: '1',
    media: [{ id: 'v1', type: 'video', src: '/video.mp4', aspectRatio: 9/16 }],
    title: 'My Video',
    username: '@user',
  },
];

<ReelPlayerOverlay<MyItem>
  isOpen={isOpen}
  onClose={handleClose}
  content={items}
  renderSlideOverlay={(item) => (
    <div style={{ position: 'absolute', bottom: 16, left: 16, color: '#fff' }}>
      <strong>{item.username}</strong>
      <p>{item.title}</p>
    </div>
  )}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="custom-slide-overlay"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Власний оверлей слайда
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Замініть вбудований оверлей слайда власним вмістом для кожного слайда:
        </p>
        <CodeBlock
          code={`<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderSlideOverlay={(item, index, isActive) => (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
      color: '#fff',
    }}>
      <h3>{item.author.name}</h3>
      <p>{item.description}</p>
      <span>Slide {index + 1} {isActive ? '(active)' : ''}</span>
    </div>
  )}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="non-media-slides"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Слайди без медіа
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Використовуйте{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlide
          </code>{' '}
          щоб вставити власний вміст (наприклад, картки із закликом до дії).
          Поверніть{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            null
          </code>{' '}
          щоб лишити стандартний:
        </p>
        <CodeBlock
          code={`<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderSlide={({ index, size }) => {
    // CTA card on last slide
    if (index === content.length - 1) {
      return (
        <div style={{
          width: size[0],
          height: size[1],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: '#fff',
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Follow for more!</h2>
            <button>Subscribe</button>
          </div>
        </div>
      );
    }
    // Fall back to default MediaSlide + overlay
    return null;
  }}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="custom-controls"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Власні елементи керування
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Складайте готові підкомпоненти разом із власними доповненнями:
        </p>
        <CodeBlock
          code={`import {
  ReelPlayerOverlay,
  CloseButton,
  SoundButton,
} from '@reelkit/react-reel-player';

<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderControls={({ onClose, content, activeIndex }) => (
    <>
      <CloseButton onClick={onClose} />
      <SoundButton />
      <button
        onClick={() => share(content[activeIndex])}
        style={{
          position: 'absolute',
          bottom: 60,
          right: 16,
          zIndex: 10,
        }}
      >
        Share
      </button>
    </>
  )}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="custom-timeline"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Власний таймлайн
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Замініть вбудовану смугу відтворення власним інтерфейсом перемотування
          через{' '}
          <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderTimeline
          </code>
          . Колбек спрацьовує лише тоді, коли за правилами показу оверлей вивів
          би стандартну смугу (та сама логіка{' '}
          <code className="font-mono text-xs">timeline</code> плюс{' '}
          <code className="font-mono text-xs">timelineMinDurationSeconds</code>{' '}
          ), тож переписувати її не доведеться. Використайте клас{' '}
          <code className="font-mono text-xs">.rk-reel-timeline</code> на своєму
          корені, щоб успадкувати притиснення до низу, відступи безпечної зони
          та проміжок для оверлея слайда на дотикових пристроях.
        </p>
        <CodeBlock
          code={`import { useRef, useEffect } from 'react';
import { ReelPlayerOverlay } from '@reelkit/react-reel-player';
import { Observe } from '@reelkit/react';

function CustomTimelineBar({ timelineState }) {
  const trackRef = useRef(null);
  useEffect(() => {
    if (!trackRef.current) return;
    // Pointer + keyboard scrub wiring, same as the built-in bar.
    return timelineState.bindInteractions(trackRef.current);
  }, [timelineState]);

  return (
    <div className="rk-reel-timeline" style={{ padding: '0 16px' }}>
      <Observe signals={[timelineState.progress, timelineState.currentTime]}>
        {() => (
          <div
            ref={trackRef}
            role="slider"
            aria-valuenow={timelineState.currentTime.value}
            style={{ height: 6, background: 'rgba(255,255,255,0.2)' }}
          >
            <div style={{
              width: \`\${timelineState.progress.value * 100}%\`,
              height: '100%',
              background: 'linear-gradient(90deg, #6366f1, #ec4899)',
            }} />
          </div>
        )}
      </Observe>
    </div>
  );
}

<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  timeline="always"
  renderTimeline={({ timelineState }) => (
    <CustomTimelineBar timelineState={timelineState} />
  )}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="custom-navigation"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Власна навігація
        </Heading>
        <CodeBlock
          code={`<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderNavigation={({ onPrev, onNext, activeIndex, count }) => (
    <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }}>
      <button onClick={onPrev} disabled={activeIndex === 0}>Up</button>
      <span>{activeIndex + 1}/{count}</span>
      <button onClick={onNext} disabled={activeIndex === count - 1}>Down</button>
    </div>
  )}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="custom-nested-navigation"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Власна вкладена навігація
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Замініть стрілки ліворуч і праворуч усередині мультимедійних слайдів
          (горизонтальна карусель) власною навігацією:
        </p>
        <CodeBlock
          code={`<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderNestedNavigation={({ onPrev, onNext, activeIndex, count }) => (
    <div style={{
      position: 'absolute',
      bottom: 48,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      gap: 8,
      zIndex: 10,
    }}>
      <button onClick={onPrev} disabled={activeIndex === 0}>Prev</button>
      <span>{activeIndex + 1} / {count}</span>
      <button onClick={onNext} disabled={activeIndex === count - 1}>Next</button>
    </div>
  )}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="custom-nested-slides"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Власні вкладені слайди
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Налаштуйте окремі слайди всередині мультимедійних каруселей через{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderNestedSlide
          </code>
          . Use{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            props.defaultContent
          </code>{' '}
          щоб загорнути стандартний ImageSlide чи VideoSlide або замінити його
          повністю:
        </p>
        <CodeBlock
          code={`// Wrap default slides with rounded corners
<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderNestedSlide={({ defaultContent }) => (
    <div style={{ borderRadius: 16, overflow: 'hidden' }}>
      {defaultContent}
    </div>
  )}
/>

// Fully custom nested slide for images
<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderNestedSlide={({ item, size, isActive, slideKey, onVideoRef, defaultContent }) => {
    if (item.type === 'video') return defaultContent; // keep default video
    return (
      <ImageSlide
        src={item.src}
        size={size}
        imgStyle={{ objectFit: 'contain' }}
        style={{ backgroundColor: '#111' }}
      />
    );
  }}
/>`}
          language="tsx"
        />
      </section>

      {/* URL state */}
      <section className="mb-12">
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          Стан в URL
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ReelPlayerUrlOverlay
          </code>{' '}
          — окремий компонент, стан відкриття якого живе в адресному рядку.
          Побудуйте контролер через{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useOverlayUrlState
          </code>{' '}
          from{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react
          </code>{' '}
          і передайте його як{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            controller
          </code>
          : плеєр відкривається сам, коли параметр називає слайд, і
          закривається, коли параметр зникає. Посиланнями можна ділитися, а
          кнопка «назад» закриває плеєр, а не виводить зі сторінки.
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
            @reelkit/react
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
        <CodeBlock
          code={`import { useOverlayUrlState, urlIndexKey, urlStableIdKey } from '@reelkit/react';
import { ReelPlayerUrlOverlay } from '@reelkit/react-reel-player';
import { Link } from 'react-router-dom';

const reel = useOverlayUrlState({
  param: 'reel',
  ...urlIndexKey(() => content.length),
});

// Opening is a link — the overlay reads the URL and opens itself.
{content.map((item, i) => (
  <Link key={item.id} to={\`?reel=\${i}\`}>
    <img src={getThumbnail(item)} />
  </Link>
))}

<ReelPlayerUrlOverlay controller={reel} content={content} />`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          Full{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useOverlayUrlState
          </code>{' '}
          опції —{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            param
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            adapter
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            codec
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locator
          </code>{' '}
          — у{' '}
          <Link
            to="/uk/docs/react/api#useoverlayurlstate"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            довіднику API для React
          </Link>
          . Покроковий розбір — у{' '}
          <Link
            to="/uk/docs/react/guide#url-state"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            посібнику для React
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
            Типово параметр адресує лише <strong>vertical</strong> допис (
            <code>?reel=3</code>). Opt into a two-axis key to also carry the
            inner media index of a multi-media carousel — see below.
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
          Той самий <code>ReelPlayerUrlOverlay</code> працює з обома формами;
          він розрізняє їх під час виконання за position контролера, тож жодного
          пропса режиму немає. Ключ обирайте, коли будуєте контролер:
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
          code={`import { useOverlayUrlState, urlIndexTwoAxisKey } from '@reelkit/react';

const reel = useOverlayUrlState({
  param: 'reel',
  ...urlIndexTwoAxisKey({
    outerCount: () => content.length,
    innerCounts: () => content.map((post) => post.media.length),
  }),
});

// A link now names both axes: post 3, inner media 2.
<Link to="?reel=3.2">…</Link>
<ReelPlayerUrlOverlay controller={reel} content={content} />`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          <strong>Застосунок із роутером — передайте адаптер.</strong> Writing{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            history.pushState
          </code>{' '}
          повз роутер лишає його місцеположення застарілим, і наступна навігація
          втрачає параметр:
        </p>
        <CodeBlock
          code={`import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';

const adapter = useReactRouterUrlAdapter();
const reel = useOverlayUrlState({
  param: 'reel',
  adapter,
  ...urlIndexKey(() => content.length),
});

<ReelPlayerUrlOverlay controller={reel} content={content} />`}
          language="tsx"
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
  ...urlStableIdKey({ items: () => content }),
});`}
          language="tsx"
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
    locate: (id) => content.findIndex((x) => x.id === id),
    identify: (index) => content[index].id,
  },
});`}
          language="tsx"
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
    locate: (id) => content.findIndex((x) => x.id === id),
    identify: (index) => content[index].id,
    locateAsync: async (id) => {
      const loaded = await loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!loaded) return null; // exhausted — link names no post
      setContent(loaded); // commit — the overlay renders from this state
      return loaded.findIndex((x) => x.id === id); // wherever it landed
    },
  },
});`}
          language="tsx"
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
          id="reelplayeroverlayprops-props"
          className="text-xl font-semibold mt-6 mb-4"
        >
          Пропси ReelPlayerOverlayProps
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-mono">
          ReelPlayerOverlayProps&lt;T&gt;
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
              {reelPlayerProps.map((p) => (
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
          id="reelplayerurloverlay-props"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Пропси ReelPlayerUrlOverlay
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-mono">
          ReelPlayerUrlOverlayProps&lt;T&gt;
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Приймає всі візуальні та поведінкові пропси вище, крім{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            isOpen
          </code>
          , replaced by a{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            controller
          </code>
          .{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            initialIndex
          </code>{' '}
          ігнорується — слайд обирає position контролера, тож передане поруч
          значення перезаписується на кожному відкритті.
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
              {reelPlayerUrlProps.map((p) => (
                <tr
                  key={p.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-sm text-slate-600 dark:text-slate-400">
                    {p.type}
                  </td>
                  <td className="py-3 px-4 font-mono text-sm text-slate-500">
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
          id="callbacks"
          className="text-xl font-semibold mt-8 mb-4"
        >
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
              {reelPlayerCallbacks.map((p) => (
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

        <Heading
          level={3}
          id="reel-props-proxied"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Пропси Reel (передані далі)
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Ці пропси передаються далі в{' '}
          <Link
            to="/uk/docs/react/api#reel-props"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            Reel
          </Link>{' '}
          component.
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

      {/* Types */}
      <section className="mb-12">
        <Heading level={2} id="types" className="text-2xl font-bold mb-4">
          Types
        </Heading>

        <Heading
          level={3}
          id="basecontentitem"
          className="text-lg font-semibold mb-2"
        >
          BaseContentItem
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Тип-обмеження для узагальнення. Розширюйте його, щоб використовувати
          власні типи даних із ReelPlayerOverlay.
        </p>
        <CodeBlock
          code={`interface BaseContentItem {
  id: string;
  media: MediaItem[];
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="contentitem"
          className="text-lg font-semibold mt-6 mb-2"
        >
          ContentItem
        </Heading>
        <CodeBlock
          code={`interface ContentItem extends BaseContentItem {
  author: {
    name: string;
    avatar: string;
  };
  likes: number;
  description: string;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="mediaitem"
          className="text-lg font-semibold mt-6 mb-2"
        >
          MediaItem
        </Heading>
        <CodeBlock
          code={`interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  poster?: string;
  aspectRatio: number;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="mediatype"
          className="text-lg font-semibold mt-6 mb-2"
        >
          MediaType
        </Heading>
        <CodeBlock
          code={`type MediaType = 'image' | 'video';`}
          language="typescript"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          ControlsRenderProps{'<T>'}
        </Heading>
        <CodeBlock
          code={`interface ControlsRenderProps<T extends BaseContentItem> {
  onClose: () => void;
  soundState: SoundState;
  activeIndex: number;
  content: T[];
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="navigationrenderprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
          NavigationRenderProps
        </Heading>
        <CodeBlock
          code={`interface NavigationRenderProps {
  onPrev: () => void;
  onNext: () => void;
  activeIndex: number;
  count: number;
}`}
          language="typescript"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          SlideRenderProps{'<T>'}
        </Heading>
        <CodeBlock
          code={`interface SlideRenderProps<T extends BaseContentItem> {
  item: T;
  index: number;
  size: [number, number];
  isActive: boolean;
  slideKey: string;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  innerSliderRef: MutableRefObject<ReelApi | null>;
  onActiveMediaTypeChange?: (type: 'image' | 'video') => void;
  renderNestedNavigation?: (props: NavigationRenderProps) => ReactNode;
  enableWheel?: boolean;
  defaultContent: ReactNode;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="nestedsliderenderprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
          NestedSlideRenderProps
        </Heading>
        <CodeBlock
          code={`interface NestedSlideRenderProps {
  item: MediaItem;
  index: number;
  size: [number, number];
  isActive: boolean;
  isInnerActive: boolean;
  slideKey: string;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  defaultContent: ReactNode;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="slideoverlayprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
          SlideOverlayProps
        </Heading>
        <CodeBlock
          code={`interface SlideOverlayProps {
  author?: { name: string; avatar: string };
  description?: string;
  likes?: number;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="imageslideprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
          ImageSlideProps
        </Heading>
        <CodeBlock
          code={`interface ImageSlideProps {
  src: string;
  size: [number, number];
  className?: string;
  style?: CSSProperties;
  imgClassName?: string;
  imgStyle?: CSSProperties;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="videoslideprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
          VideoSlideProps
        </Heading>
        <CodeBlock
          code={`interface VideoSlideProps {
  src: string;
  poster?: string;
  aspectRatio: number;
  size: [number, number];
  isActive: boolean;
  isInnerActive?: boolean;   // default: true
  slideKey: string;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
  className?: string;
  style?: CSSProperties;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="closebuttonprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
          CloseButtonProps
        </Heading>
        <CodeBlock
          code={`interface CloseButtonProps {
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="soundbuttonprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
          SoundButtonProps
        </Heading>
        <CodeBlock
          code={`interface SoundButtonProps {
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="timelinebarprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
          TimelineBarProps
        </Heading>
        <CodeBlock
          code={`interface TimelineBarProps {
  className?: string;
  style?: React.CSSProperties;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="timelinerenderprops-lt-t-gt"
          className="text-lg font-semibold mt-6 mb-2"
        >
          TimelineRenderProps&lt;T&gt;
        </Heading>
        <CodeBlock
          code={`interface TimelineRenderProps<T extends BaseContentItem> {
  item: T;
  activeIndex: number;
  timelineState: TimelineController;
  defaultContent: ReactNode;
}`}
          language="typescript"
        />
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
          Повторно використовувані блоки, експортовані для складання власних
          render props:
        </p>

        <Heading
          level={3}
          id="closebutton"
          className="text-lg font-semibold mt-6 mb-2"
        >
          CloseButton
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Окрема кнопка закриття зі стандартними стилями плеєра. Використовуйте
          всередині{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderControls
          </code>
          .
        </p>
        <CodeBlock
          code={`import { CloseButton } from '@reelkit/react-reel-player';

<CloseButton onClick={onClose} />
<CloseButton onClick={onClose} className="my-close-btn" style={{ top: 24, right: 24 }} />`}
          language="tsx"
        />

        <Heading
          level={3}
          id="soundbutton"
          className="text-lg font-semibold mt-6 mb-2"
        >
          SoundButton
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Окремий перемикач звуку. Має бути всередині{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            SoundProvider
          </code>{' '}
          (ReelPlayerOverlay додає його автоматично).
        </p>
        <CodeBlock
          code={`import { SoundButton } from '@reelkit/react-reel-player';

<SoundButton />
<SoundButton disabled className="my-sound-btn" />`}
          language="tsx"
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
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            TimelineProvider
          </code>{' '}
          (автоматично монтується всередині{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ReelPlayerOverlay
          </code>
          ) and renders the track, buffered ranges, progress fill, and scrub
          pill. Theme via the{' '}
          <code className="font-mono text-xs">--rk-reel-timeline-*</code>{' '}
          власними властивостями або замініть через{' '}
          <code className="font-mono text-xs">renderTimeline</code>.
        </p>
        <CodeBlock
          code={`import { TimelineBar } from '@reelkit/react-reel-player';

// Inside renderTimeline — wrap or augment the default bar:
<ReelPlayerOverlay
  renderTimeline={({ defaultContent }) => (
    <>
      <MyTimecode />
      {defaultContent}
    </>
  )}
/>

// Or render standalone inside a custom TimelineProvider tree:
<TimelineBar className="my-timeline" />`}
          language="tsx"
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
          Показується автоматично, коли у вмісті є потрібні поля. Через{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlideOverlay
          </code>{' '}
          його можна замінити або сховати.
        </p>
        <CodeBlock
          code={`import { SlideOverlay } from '@reelkit/react-reel-player';

<SlideOverlay
  author={{ name: 'John', avatar: '/avatar.jpg' }}
  description="Amazing content"
  likes={12500}
/>`}
          language="tsx"
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
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            object-fit: cover
          </code>{' '}
          за замовчуванням. Використовуйте всередині{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlide
          </code>{' '}
          щоб складати власні слайди-зображення зі своїми стилями.
        </p>
        <CodeBlock
          code={`import { ImageSlide } from '@reelkit/react-reel-player';

// Default usage
<ImageSlide src="/photo.jpg" size={[400, 700]} />

// Custom styles
<ImageSlide
  src="/photo.jpg"
  size={[400, 700]}
  className="my-image-slide"
  style={{ backgroundColor: '#1a1a1a', borderRadius: 12 }}
  imgStyle={{ objectFit: 'contain' }}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="videoslide"
          className="text-lg font-semibold mt-6 mb-2"
        >
          VideoSlide
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Слайд-відео зі спільним елементом{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'<video>'}
          </code>{' '}
          заради безперервності звуку на iOS, з постерами, пам’яттю позиції та
          індикатором завантаження. Має бути всередині{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            SoundProvider
          </code>{' '}
          (ReelPlayerOverlay додає його автоматично).
        </p>
        <CodeBlock
          code={`import { VideoSlide } from '@reelkit/react-reel-player';

<VideoSlide
  src="/video.mp4"
  poster="/thumb.jpg"
  aspectRatio={9 / 16}
  size={[400, 700]}
  isActive={true}
  slideKey="slide-1"
  style={{ borderRadius: 12 }}
/>`}
          language="tsx"
        />

        <Callout
          type="info"
          title="Складання власних слайдів"
          className="mt-4 mb-4"
        >
          Використовуйте{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlide
          </code>{' '}
          з{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ImageSlide
          </code>{' '}
          /{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            VideoSlide
          </code>{' '}
          щоб змінити рендеринг медіа, зберігши всю вбудовану поведінку
          (автовідтворення, знімок постера, синхронізацію звуку).
        </Callout>
        <CodeBlock
          code={`import {
  ReelPlayerOverlay,
  ImageSlide,
  VideoSlide,
} from '@reelkit/react-reel-player';

<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderSlide={({ item, size, isActive, slideKey, onVideoRef }) => {
    const media = item.media[0];
    if (media.type === 'image') {
      return (
        <ImageSlide
          src={media.src}
          size={size}
          imgStyle={{ objectFit: 'contain' }}
          style={{ backgroundColor: '#111' }}
        />
      );
    }
    if (media.type === 'video') {
      return (
        <VideoSlide
          src={media.src}
          poster={media.poster}
          aspectRatio={media.aspectRatio}
          size={size}
          isActive={isActive}
          slideKey={slideKey}
          onVideoRef={onVideoRef}
          style={{ borderRadius: 16 }}
        />
      );
    }
    return null; // fallback to default
  }}
/>`}
          language="tsx"
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
          Якщо ви використовуєте{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderSlide
          </code>
          , call these callbacks to control the loading indicator:
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
          code={`// Inside renderSlide — wire callbacks to your custom media
renderSlide={({ item, size, isActive, onReady, onWaiting, onError }) => (
  <div style={{ width: size[0], height: size[1] }}>
    {item.media[0].type === 'image' ? (
      <img
        src={item.media[0].src}
        onLoad={onReady}
        onError={onError}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    ) : (
      <video
        src={item.media[0].src}
        autoPlay={isActive}
        onCanPlay={onReady}
        onWaiting={onWaiting}
        onError={onError}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    )}
  </div>
)}`}
          language="tsx"
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
          компонентами:
        </p>

        <CodeBlock
          code={`<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  content={content}
  renderLoading={({ item, activeIndex }) => (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: 14,
    }}>
      Loading slide {activeIndex + 1}...
    </div>
  )}
  renderError={({ item, activeIndex }) => (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 12, color: 'rgba(255,255,255,0.5)',
    }}>
      <span style={{ fontSize: 48 }}>!</span>
      <span>Failed to load media</span>
    </div>
  )}
/>`}
          language="tsx"
        />
      </section>

      {/* Timeline */}
      <section className="mb-12">
        <Heading level={2} id="timeline" className="text-2xl font-bold mb-4">
          Таймлайн
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Оверлей показує вбудовану смугу таймлайну відтворення над активним
          відео. Пропс{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            timeline
          </code>{' '}
          визначає, коли її показувати:
        </p>
        <ul className="list-disc pl-6 mb-4 text-slate-600 dark:text-slate-400 space-y-1">
          <li>
            <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
              'auto'
            </code>{' '}
            (типово): показується, коли активне медіа — відео, тривалість якого
            перевищує{' '}
            <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
              timelineMinDurationSeconds
            </code>{' '}
            (типово 30). Працює і для слайдів з одним відео, і для
            мультимедійних каруселей; смуга слідує за активним вкладеним
            елементом і ховається на зображеннях.
          </li>
          <li>
            <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
              'always'
            </code>
            : показується, щойно на активному слайді є відео.
          </li>
          <li>
            <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
              'never'
            </code>
            : не показується ніколи. Власну смугу будуйте через{' '}
            <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
              renderTimeline
            </code>
            .
          </li>
        </ul>
        <CodeBlock
          code={`<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={close}
  content={items}
  timeline="auto"
  timelineMinDurationSeconds={30}
/>`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          Тему задавайте через власні властивості CSS{' '}
          <code className="font-mono text-xs">--rk-reel-timeline-*</code>{' '}
          (висота, кольори, розмір повзунка). Для повністю власної смуги
          перемотування, таймкоду чи індикатора прогресу беріть{' '}
          <code className="font-mono text-xs">renderTimeline</code>; the
          callback receives a{' '}
          <code className="font-mono text-xs">timelineState</code> на основі{' '}
          <code className="font-mono text-xs">TimelineController</code>.
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
          Для власних реалізацій доступ до стану звуку відкритий:
        </p>
        <CodeBlock
          code={`import { SoundProvider, useSoundState } from '@reelkit/react';

// ReelPlayerOverlay wraps itself in a SoundProvider.
// Access sound state inside custom controls:
function CustomControls() {
  const soundState = useSoundState();

  return (
    <button onClick={soundState.toggle}>
      {soundState.muted.value ? 'Unmute' : 'Mute'}
    </button>
  );
}`}
          language="tsx"
        />
      </section>

      {/* CSS Customization */}
      <section className="mb-12">
        <Heading level={2} id="css-classes" className="text-2xl font-bold mb-4">
          Класи CSS
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Усі класи CSS звичайні (не CSS-модулі), тож їх можна перекрити
          селекторами вищої специфічності в таблиці стилів, підключеній після{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-reel-player/styles.css
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
          компонентів.
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
            @reelkit/react-reel-player/styles.css
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
          ). Set{' '}
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
          , and an{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-label="Слайд N з M"
          </code>
          , so swiping announces position in the sequence.
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
