import { Link } from 'react-router-dom';
import { Callout } from '../../../components/ui/Callout';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { FeatureCardGrid } from '../../../components/ui/FeatureCard';
import { Sandbox } from '../../../components/ui/Sandbox';
import { LightboxDemo } from '../../../components/demos/LightboxDemo';
import {
  Image,
  Maximize2,
  Keyboard,
  Zap,
  MousePointer,
  X,
  Hash,
  Layers,
  Volume2,
  Loader,
  AlertTriangle,
  Link2,
} from 'lucide-react';
import { Heading } from '../../../components/ui/Heading';
import { ukPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/lightbox',
    title: 'Lightbox для React · ReelKit',
    description:
      'Повноекранна галерея зображень: двовісний URL, підкомпоненти, завантаження вмісту й обробка помилок, переходи та класи CSS.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

const fullCode = `import { useState } from 'react';
import {
  LightboxOverlay,
  flipTransition,
  lightboxFadeTransition,
  lightboxZoomTransition,
  slideTransition,
  type LightboxItem,
} from '@reelkit/react-lightbox';
import type { TransitionTransformFn } from '@reelkit/react';
import '@reelkit/react-lightbox/styles.css';

const images: LightboxItem[] = [
  {
    src: '/cdn/samples/images/image-01.jpg',
    title: 'Mountain River',
    description: 'A beautiful mountain river flowing through the forest',
    width: 1600,
    height: 1000,
  },
  {
    src: '/cdn/samples/images/image-02.jpg',
    title: 'Snowy Peaks',
    description: 'Majestic snow-capped mountains reaching for the sky',
    width: 1000,
    height: 1600,
  },
  {
    src: '/cdn/samples/images/image-03.jpg',
    title: 'Foggy Forest',
    description: 'Misty morning in the dense forest',
    width: 1600,
    height: 900,
  },
  {
    src: '/cdn/samples/images/image-04.jpg',
    title: 'Ocean Waves',
    description: 'Powerful ocean waves crashing against the rocky shore',
    width: 900,
    height: 1400,
  },
  {
    src: '/cdn/samples/images/image-05.jpg',
    title: 'Autumn Path',
    description: 'A winding path through the autumn forest',
    width: 1600,
    height: 1067,
  },
  {
    src: '/cdn/samples/images/image-06.jpg',
    title: 'Coastal Cliffs',
    description: 'Dramatic coastal cliffs overlooking the deep blue sea',
    width: 1600,
    height: 1067,
  },
];

const transitions: { label: string; fn: TransitionTransformFn }[] = [
  { label: 'slide', fn: slideTransition },
  { label: 'fade', fn: lightboxFadeTransition },
  { label: 'flip', fn: flipTransition },
  { label: 'zoom-in', fn: lightboxZoomTransition },
];

export default function App() {
  const [index, setIndex] = useState<number | null>(null);
  const [transitionFn, setTransitionFn] = useState<TransitionTransformFn>(
    () => slideTransition,
  );

  return (
    <div style={{ padding: 16, background: '#f8fafc', minHeight: '100vh' }}>
      {/* Transition picker */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {transitions.map((t) => (
          <button
            key={t.label}
            onClick={() => setTransitionFn(() => t.fn)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 500,
              background: transitionFn === t.fn ? '#6366f1' : '#e2e8f0',
              color: transitionFn === t.fn ? '#fff' : '#334155',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            style={{
              position: 'relative', aspectRatio: '4 / 3', borderRadius: 8,
              overflow: 'hidden', border: 'none', padding: 0, cursor: 'pointer',
              background: '#e2e8f0',
            }}
          >
            <img
              src={img.src}
              alt={img.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </button>
        ))}
      </div>
      <LightboxOverlay
        isOpen={index !== null}
        images={images}
        initialIndex={index ?? 0}
        onClose={() => setIndex(null)}
        transitionFn={transitionFn}
      />
    </div>
  );
}`;

const lightboxProps = [
  {
    prop: 'isOpen',
    type: 'boolean',
    default: 'required',
    description:
      'Керує видимістю Lightbox. Для стану відкриття, керованого URL, беріть окремий LightboxUrlOverlay — дивіться розділ про стан в URL нижче.',
  },
  {
    prop: 'images',
    type: 'LightboxItem[]',
    default: 'required',
    description: 'Масив зображень для показу',
  },
  {
    prop: 'ariaLabel',
    type: 'string',
    default: "'Image gallery'",
    description:
      'Доступна назва області діалогу; екранні читачі оголошують її, коли Lightbox відкривається',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: 'Початковий індекс зображення',
  },
  {
    prop: 'transitionFn',
    type: 'TransitionTransformFn',
    default: 'slideTransition',
    description:
      'Функція переходу між слайдами. Імпортуйте вбудовану (slideTransition, flipTransition, lightboxFadeTransition, lightboxZoomTransition) або передайте власну. Якщо не задано, використовується slideTransition.',
  },
  {
    prop: 'apiRef',
    type: 'MutableRefObject<ReelApi>',
    default: '-',
    description: 'Ref для доступу до API Reel',
  },
  {
    prop: 'renderControls',
    type: '(props: ControlsRenderProps) => ReactNode',
    default: '-',
    description:
      'Власні елементи керування, замінюють стандартну кнопку закриття, лічильник і перемикач повного екрана',
  },
  {
    prop: 'renderNavigation',
    type: '(props: NavigationRenderProps) => ReactNode',
    default: '-',
    description: 'Власна навігація, замінює стандартні стрілки вперед і назад',
  },
  {
    prop: 'renderInfo',
    type: '(props: InfoRenderProps) => ReactNode',
    default: '-',
    description:
      'Власний інформаційний оверлей, замінює стандартний градієнт із заголовком та описом. Поверніть null, щоб сховати.',
  },
  {
    prop: 'renderSlide',
    type: '(props: SlideRenderProps) => ReactNode | null',
    default: '-',
    description:
      'Власний рендеринг слайда. Отримує { item, index, size, isActive, onReady, onWaiting, onError }. Поверніть null, щоб лишити стандартний.',
  },
  {
    prop: 'renderLoading',
    type: '(props: { item: LightboxItem; activeIndex: number }) => ReactNode',
    default: '-',
    description: 'Власний індикатор завантаження, замінює стандартний',
  },
  {
    prop: 'renderError',
    type: '(props: { item: LightboxItem; activeIndex: number }) => ReactNode',
    default: '-',
    description: 'Власний індикатор помилки, замінює стандартний значок',
  },
];

const lightboxCallbacks = [
  {
    prop: 'onClose',
    type: '() => void',
    description:
      'Викликається, коли Lightbox закривається. Обов’язковий у LightboxOverlay (стан відкриття ваш, тож закриття обробляєте ви); необов’язковий у LightboxUrlOverlay, де закриттям керує URL — передавайте лише щоб зреагувати після закриття.',
  },
  {
    prop: 'onSlideChange',
    type: '(index: number) => void',
    description: 'Викликається після зміни слайда',
  },
];

const lightboxUrlProps = [
  {
    prop: 'controller',
    type: 'UrlStateController',
    default: 'required',
    description:
      'Контролер із useOverlayUrlState. Його position вирішує, чи оверлей відкритий і який слайд показує; оверлей записує через нього назад на зміну слайда та на закриття.',
  },
];

const reelProps = [
  {
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description: 'Вмикає нескінченний цикл',
  },
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
    prop: 'wheelDebounceMs',
    type: 'number',
    default: '200',
    description: 'Тривалість дебаунсу колеса (мс)',
  },
  {
    prop: 'transitionDuration',
    type: 'number',
    default: '300',
    description: 'Тривалість анімації переходу (мс)',
  },
  {
    prop: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: 'Поріг свайпу (0–1)',
  },
  {
    prop: 'swipeToCloseDirection',
    type: "'up' | 'down'",
    default: "'up'",
    description: 'Напрямок жесту свайпу для закриття на мобільних',
  },
];

const keyboardShortcuts = [
  { key: 'ArrowLeft', action: 'Previous image' },
  { key: 'ArrowRight', action: 'Next image' },
  { key: 'Escape', action: 'Close lightbox (or exit fullscreen if active)' },
];

const cssClasses = [
  // Overlay
  {
    className: '.rk-lightbox-overlay',
    component: 'Overlay',
    description: 'Кореневий контейнер (повноекранне тло)',
  },
  {
    className: '.rk-lightbox-spinner',
    component: 'Overlay',
    description: 'Стандартний індикатор завантаження',
  },
  {
    className: '.rk-lightbox-img-error',
    component: 'Overlay',
    description: 'Контейнер стану помилки (зіпсоване зображення чи відео)',
  },
  {
    className: '.rk-lightbox-img-error-text',
    component: 'Overlay',
    description: 'Текст стану помилки',
  },
  {
    className: '.rk-lightbox-swipe-hint',
    component: 'Overlay',
    description: 'Підказка про свайп на мобільних',
  },

  // Controls
  {
    className: '.rk-lightbox-controls-left',
    component: 'Controls',
    description: 'Контейнер елементів керування вгорі ліворуч',
  },
  {
    className: '.rk-lightbox-btn',
    component: 'Controls',
    description: 'Кнопки керування (повний екран тощо)',
  },
  {
    className: '.rk-lightbox-close',
    component: 'Controls',
    description: 'Кнопка закриття',
  },
  {
    className: '.rk-lightbox-counter',
    component: 'Controls',
    description: 'Значок лічильника зображень',
  },

  // Navigation
  {
    className: '.rk-lightbox-nav',
    component: 'Навігація',
    description: 'Стрілки навігації (обидві)',
  },
  {
    className: '.rk-lightbox-nav-prev',
    component: 'Навігація',
    description: 'Стрілка назад',
  },
  {
    className: '.rk-lightbox-nav-next',
    component: 'Навігація',
    description: 'Стрілка вперед',
  },

  // Info
  {
    className: '.rk-lightbox-info',
    component: 'Info',
    description: 'Контейнер заголовка й опису',
  },
  {
    className: '.rk-lightbox-title',
    component: 'Info',
    description: 'Заголовок зображення',
  },
  {
    className: '.rk-lightbox-description',
    component: 'Info',
    description: 'Опис зображення',
  },

  // Slide
  {
    className: '.rk-lightbox-slide',
    component: 'Slide',
    description: 'Контейнер слайда',
  },
  {
    className: '.rk-lightbox-img',
    component: 'Slide',
    description: 'Елемент зображення',
  },

  // VideoSlide
  {
    className: '.rk-lightbox-video-container',
    component: 'VideoSlide',
    description: 'Контейнер слайда-відео (за бажанням)',
  },
  {
    className: '.rk-lightbox-video-element',
    component: 'VideoSlide',
    description: 'Елемент відео (за бажанням)',
  },
  {
    className: '.rk-lightbox-video-poster',
    component: 'VideoSlide',
    description: 'Постер відео (за бажанням)',
  },
];

const themeTokens = [
  // Overlay
  {
    token: '--rk-lightbox-overlay-bg',
    default: '#000',
    controls: 'Full-screen backdrop color',
  },
  {
    token: '--rk-lightbox-overlay-z',
    default: '9999',
    controls: 'Overlay z-index',
  },

  // Top shade
  {
    token: '--rk-lightbox-top-shade-height',
    default: '80px',
    controls: 'Top gradient scrim height',
  },
  {
    token: '--rk-lightbox-top-shade-bg',
    default: 'linear-gradient(rgba(0,0,0,0.6), transparent)',
    controls: 'Top gradient scrim color',
  },

  // Layout
  {
    token: '--rk-lightbox-edge-padding',
    default: '16px',
    controls: 'Edge inset for close / nav / top-left controls',
  },
  {
    token: '--rk-lightbox-controls-gap',
    default: '12px',
    controls: 'Gap between top-left controls',
  },
  {
    token: '--rk-lightbox-transition',
    default: '0.2s',
    controls: 'Button hover transition duration',
  },
  {
    token: '--rk-lightbox-blur',
    default: '8px',
    controls: 'Backdrop blur radius for buttons / chips',
  },

  // Shared button colors
  {
    token: '--rk-lightbox-btn-bg',
    default: 'rgba(0, 0, 0, 0.5)',
    controls: 'Default background for close, nav, small buttons',
  },
  {
    token: '--rk-lightbox-btn-bg-hover',
    default: 'rgba(255, 255, 255, 0.2)',
    controls: 'Hover background for close, nav, small buttons',
  },
  {
    token: '--rk-lightbox-btn-fg',
    default: '#fff',
    controls: 'Icon color for close, nav, small buttons',
  },

  // Button sizes
  {
    token: '--rk-lightbox-btn-size',
    default: '36px',
    controls: 'Small button size (fullscreen toggle, etc.)',
  },
  {
    token: '--rk-lightbox-close-size',
    default: '40px',
    controls: 'Close button size',
  },
  {
    token: '--rk-lightbox-nav-size',
    default: '48px',
    controls: 'Prev/next arrow size',
  },
  {
    token: '--rk-lightbox-nav-opacity',
    default: '0.7',
    controls: 'Idle opacity of prev/next arrows',
  },

  // Counter
  {
    token: '--rk-lightbox-counter-fg',
    default: '#fff',
    controls: 'Counter text color',
  },
  {
    token: '--rk-lightbox-counter-bg',
    default: 'rgba(0, 0, 0, 0.5)',
    controls: 'Counter chip background',
  },
  {
    token: '--rk-lightbox-counter-size',
    default: '14px',
    controls: 'Counter font size',
  },
  {
    token: '--rk-lightbox-counter-padding',
    default: '6px 12px',
    controls: 'Counter chip padding',
  },
  {
    token: '--rk-lightbox-counter-radius',
    default: '20px',
    controls: 'Counter chip border-radius',
  },

  // Spinner
  {
    token: '--rk-lightbox-spinner-size',
    default: '28px',
    controls: 'Default spinner width/height',
  },
  {
    token: '--rk-lightbox-spinner-track',
    default: 'rgba(255, 255, 255, 0.2)',
    controls: 'Spinner track color',
  },
  {
    token: '--rk-lightbox-spinner-fg',
    default: '#fff',
    controls: 'Spinner indicator color',
  },
  {
    token: '--rk-lightbox-spinner-duration',
    default: '0.8s',
    controls: 'Spinner rotation duration',
  },

  // Error
  {
    token: '--rk-lightbox-error-fg',
    default: 'rgba(255, 255, 255, 0.4)',
    controls: 'Error icon + text color',
  },
  {
    token: '--rk-lightbox-error-text-size',
    default: '13px',
    controls: 'Error message font size',
  },

  // Info (bottom caption)
  {
    token: '--rk-lightbox-info-bg',
    default: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
    controls: 'Caption scrim gradient',
  },
  {
    token: '--rk-lightbox-info-padding',
    default: '24px',
    controls: 'Caption inner padding',
  },
  {
    token: '--rk-lightbox-title-size',
    default: '18px',
    controls: 'Title font size',
  },
  {
    token: '--rk-lightbox-description-size',
    default: '14px',
    controls: 'Description font size',
  },
  {
    token: '--rk-lightbox-info-fg',
    default: '#fff',
    controls: 'Caption text color',
  },

  // Swipe hint (mobile)
  {
    token: '--rk-lightbox-hint-fg',
    default: 'rgba(255, 255, 255, 0.5)',
    controls: 'Swipe hint text color',
  },
  {
    token: '--rk-lightbox-hint-bg',
    default: 'rgba(0, 0, 0, 0.3)',
    controls: 'Swipe hint chip background',
  },
  {
    token: '--rk-lightbox-hint-duration',
    default: '3s',
    controls: 'Swipe hint fade-in/out total duration',
  },

  // Video slide (opt-in)
  {
    token: '--rk-lightbox-video-bg',
    default: '#000',
    controls: 'Letterbox background behind <video>',
  },
];

export default function Lightbox() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Lightbox</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Повноекранний компонент Lightbox-галереї зображень і відео на основі{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-lightbox
          </code>
          .
        </p>
        <a
          href="https://react-demo.reelkit.dev/image-preview?utm_source=docs"
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
                icon: Image,
                label: 'Зображення та відео',
                desc: 'Вбудована підтримка слайдів-відео',
              },
              {
                icon: MousePointer,
                label: 'Дотикові жести',
                desc: 'Свайп для гортання',
              },
              {
                icon: X,
                label: 'Свайп для закриття',
                desc: 'Свайп угору закриває',
              },
              {
                icon: Keyboard,
                label: 'Навігація з клавіатури',
                desc: 'Стрілки + Escape',
              },
              {
                icon: Maximize2,
                label: 'Повний екран',
                desc: 'Кросбраузерний API',
              },
              {
                icon: Hash,
                label: 'Переходи',
                desc: 'Зсув, затухання, переворот, наближення',
              },
              {
                icon: Zap,
                label: 'Preloading',
                desc: 'Сусідні зображення завантажуються заздалегідь',
              },
              {
                icon: Volume2,
                label: 'Перемикач звуку',
                desc: 'Звук вмикається й вимикається для кожного слайда',
              },
              {
                icon: Loader,
                label: 'Стани завантаження',
                desc: 'Індикатор і власний рендеринг',
              },
              {
                icon: AlertTriangle,
                label: 'Обробка помилок',
                desc: 'Значок помилки та власний рендеринг',
              },
              {
                icon: Layers,
                label: 'Render Props',
                desc: '6 налаштовних зон рендерингу',
              },
              {
                icon: Layers,
                label: 'Hooks',
                desc: 'useVideoSlideRenderer + useFullscreen',
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
          code="npm install @reelkit/react-lightbox @reelkit/react lucide-react"
          language="bash"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          Не забудьте імпортувати стилі:
        </p>
        <CodeBlock
          code={`import '@reelkit/react-lightbox/styles.css';`}
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
            LightboxOverlay
          </code>{' '}
          показує зображення на весь екран. Передайте масив об’єктів{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            LightboxItem
          </code>{' '}
          і керуйте видимістю через індекс, який може бути null.
        </p>
        <CodeBlock
          code={`import { useState } from 'react';
import { LightboxOverlay, type LightboxItem } from '@reelkit/react-lightbox';
import '@reelkit/react-lightbox/styles.css';

const images: LightboxItem[] = [
  {
    src: 'https://example.com/image1.jpg',
    title: 'Sunset',
    description: 'Beautiful sunset over the ocean',
  },
  {
    src: 'https://example.com/image2.jpg',
    title: 'Mountains',
  },
];

function App() {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      {images.map((img, i) => (
        <img
          key={i}
          src={img.src}
          onClick={() => setIndex(i)}
        />
      ))}
      <LightboxOverlay
        isOpen={index !== null}
        images={images}
        initialIndex={index ?? 0}
        onClose={() => setIndex(null)}
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
          title="LightboxPage.tsx"
          height={500}
          stackblitzDeps={['@reelkit/react-lightbox']}
          stackblitzExtraDeps={{ 'lucide-react': '^0.562.0' }}
        >
          <LightboxDemo />
        </Sandbox>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Натисніть мініатюру, щоб відкрити Lightbox. Гортайте стрілками або
          свайпом.
        </p>
      </section>

      {/* Video Slides (Opt-in) */}
      <section className="mb-12">
        <Heading
          level={2}
          id="video-slides-opt-in"
          className="text-2xl font-bold mb-4"
        >
          Слайди-відео (за бажанням)
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Підтримка відео вмикається за бажанням і піддається tree-shaking —
          використання лише зображень нічого не додає до бандла. Імпортуйте{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useVideoSlideRenderer
          </code>{' '}
          і передайте повернені значення у{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            LightboxOverlay
          </code>
          . Хук сам дає раду станам завантаження, керуванню звуком і життєвим
          циклом відео.
        </p>

        <CodeBlock
          code={`import {
  LightboxOverlay,
  useVideoSlideRenderer,
  type LightboxItem,
} from '@reelkit/react-lightbox';
import '@reelkit/react-lightbox/styles.css';

const items: LightboxItem[] = [
  { src: '/photo.jpg', title: 'Photo' },
  {
    src: '/clip.mp4',
    type: 'video',
    poster: '/clip-thumb.jpg',
    title: 'Video Clip',
  },
];

function Gallery() {
  const [index, setIndex] = useState<number | null>(null);
  const isOpen = index !== null;
  const { renderSlide, renderControls, SoundProvider } =
    useVideoSlideRenderer(items, isOpen);

  return (
    <SoundProvider>
      {/* thumbnails… */}
      <LightboxOverlay
        isOpen={isOpen}
        images={items}
        initialIndex={index ?? 0}
        onClose={() => setIndex(null)}
        renderSlide={renderSlide}
        renderControls={renderControls}
      />
    </SoundProvider>
  );
}`}
          language="tsx"
        />

        <Callout type="info" title="Як це працює" className="mt-4">
          <ul className="list-disc ml-4 space-y-1">
            <li>
              Хук повертає{' '}
              <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                SoundProvider
              </code>{' '}
              — загорніть у нього оверлей, щоб перемикання звуку працювало
            </li>
            <li>
              Відео відтворюється автоматично (типово без звуку), коли слайд
              стає активним
            </li>
            <li>
              Спільний елемент відео повторно використовується між слайдами
              заради безперервності звуку на iOS
            </li>
            <li>
              Кнопка звуку з’являється на слайдах-відео автоматично, з
              реактивним перемикачем
            </li>
            <li>
              Елементи без{' '}
              <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                type: 'video'
              </code>{' '}
              рендеряться як зображення (зворотна сумісність)
            </li>
          </ul>
        </Callout>
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
          id="custom-controls"
          className="text-xl font-semibold mt-4 mb-4"
        >
          Власні елементи керування
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Використовуйте{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderControls
          </code>{' '}
          щоб замінити стандартну кнопку закриття, лічильник і перемикач повного
          екрана. Складайте з експортованих підкомпонентів:
        </p>
        <CodeBlock
          code={`import {
  LightboxOverlay,
  CloseButton,
  Counter,
  FullscreenButton,
} from '@reelkit/react-lightbox';

<LightboxOverlay
  isOpen={isOpen}
  images={images}
  onClose={handleClose}
  renderControls={({ onClose, activeIndex, count, isFullscreen, onToggleFullscreen }) => (
    <div style={{ position: 'absolute', top: 12, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
      <Counter currentIndex={activeIndex} count={count} />
      <div>
        <FullscreenButton isFullscreen={isFullscreen} onToggle={onToggleFullscreen} />
        <CloseButton onClick={onClose} />
      </div>
    </div>
  )}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="custom-info-overlay"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Власний інформаційний оверлей
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Використовуйте{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderInfo
          </code>{' '}
          щоб замінити стандартний градієнт із заголовком та описом, або
          передайте{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'renderInfo={() => null}'}
          </code>{' '}
          щоб сховати його повністю:
        </p>
        <CodeBlock
          code={`<LightboxOverlay
  isOpen={isOpen}
  images={images}
  onClose={handleClose}
  renderInfo={({ item, index }) => (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: '#fff', zIndex: 10 }}>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
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
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Використовуйте{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderNavigation
          </code>{' '}
          щоб замінити стандартні стрілки вперед і назад:
        </p>
        <CodeBlock
          code={`<LightboxOverlay
  isOpen={isOpen}
  images={images}
  onClose={handleClose}
  renderNavigation={({ onPrev, onNext, activeIndex, count }) => (
    <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 12, zIndex: 10 }}>
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
          id="custom-slide"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Власний слайд
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Використовуйте{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlide
          </code>{' '}
          для повністю власного вмісту слайда. Поверніть{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            null
          </code>{' '}
          щоб лишити стандартний слайд-зображення:
        </p>
        <CodeBlock
          code={`<LightboxOverlay
  isOpen={isOpen}
  images={images}
  onClose={handleClose}
  renderSlide={({ item, index, size, isActive, onReady, onError }) => {
    // Custom CTA on last slide
    if (index === images.length - 1) {
      return (
        <div style={{ width: size[0], height: size[1], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <h2>View all photos</h2>
        </div>
      );
    }
    return null; // default image slide
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
          Lightbox стежить за станом завантаження й помилок кожного слайда. Поки
          вміст вантажиться, показується індикатор; для медіа, що не
          завантажилося, — значок зіпсованого зображення. URL з помилками
          кешуються, тож повторний перехід одразу показує помилку без нової
          спроби.
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
renderSlide={({ item, index, size, isActive, onReady, onWaiting, onError }) => (
  <div style={{ width: size[0], height: size[1] }}>
    {item.type === 'video' ? (
      <video
        src={item.src}
        poster={item.poster}
        autoPlay={isActive}
        onCanPlay={onReady}
        onWaiting={onWaiting}
        onError={onError}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    ) : (
      <img
        src={item.src}
        onLoad={onReady}
        onError={onError}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
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
          Замініть стандартний індикатор і значок помилки власними компонентами:
        </p>

        <CodeBlock
          code={`<LightboxOverlay
  isOpen={isOpen}
  images={images}
  onClose={() => setIsOpen(false)}
  renderLoading={({ item, activeIndex }) => (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: 14,
    }}>
      Loading image {activeIndex + 1}...
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
      <span>Failed to load content</span>
    </div>
  )}
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
            LightboxUrlOverlay
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
          : галерея відкривається сама, коли параметр називає слайд, і
          закривається, коли параметр зникає. Посиланнями можна ділитися, а
          кнопка «назад» закриває галерею, а не виводить зі сторінки.
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
import { LightboxUrlOverlay } from '@reelkit/react-lightbox';
import { Link } from 'react-router-dom';

const photo = useOverlayUrlState({
  param: 'photo',
  ...urlIndexKey(() => images.length),
});

// Opening is a link — the href is the open action. No open flag, no handler:
// the overlay reads the URL and opens itself.
{images.map((image, i) => (
  <Link key={image.src} to={\`?photo=\${i}\`}>
    <img src={image.src} />
  </Link>
))}

<LightboxUrlOverlay controller={photo} images={images} />`}
          language="tsx"
        />

        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          Хук приймає один об’єкт опцій і повертає{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            UrlStateController
          </code>{' '}
          (with{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            set
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            index
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            value
          </code>
          ). Keep it for programmatic control:{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            set
          </code>{' '}
          — низькорівневий запис, який оверлей робить усередині (зміна слайда та{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            set(null)
          </code>{' '}
          для закриття). Ним же можна керувати оверлеєм програмно:{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            set(index)
          </code>{' '}
          відкриває його — так само, як перехід за параметром. Але для відкриття
          краще звичайне посилання: href можна надіслати, відкрити в новій
          вкладці, а кнопка «назад» його закриє — і все це без жодного
          обробника.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Full{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useOverlayUrlState
          </code>{' '}
          options (
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
          </code>
          ): see the{' '}
          <Link
            to="/uk/docs/react/api#useoverlayurlstate"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            довіднику API для React
          </Link>
          .
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            LightboxUrlOverlay
          </code>{' '}
          приймає лише{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            controller
          </code>{' '}
          (обов’язково), необов’язковий{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            onClose
          </code>
          , plus every visual and behavior prop{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            LightboxOverlay
          </code>{' '}
          takes ({''}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            images
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ariaLabel
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            transitionFn
          </code>
          , the render props, and so on) — but no{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            isOpen
          </code>
          .
        </p>
        <ul className="mt-4 mb-4 list-disc pl-6 space-y-1 text-slate-600 dark:text-slate-400">
          <li>
            Відкриття коштує одного запису в історії. Гортання слайдів замінює
            його, тож сто свайпів не додають жодного — один крок назад завжди
            виходить із галереї. «Назад» закриває, а не гортає фотографії.
          </li>
          <li>
            Надіслане посилання на кшталт{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              ?photo=3
            </code>{' '}
            відкриває галерею на цьому слайді. Закриття посилання, що прийшло
            разом зі сторінкою, прибирає параметр на місці, а не виводить із
            сайту.
          </li>
          <li>
            <strong>
              «Назад» закриває лише тоді, коли ви відкрили галерею всередині
              застосунку
            </strong>{' '}
            — посилання додало запис, тож «назад» повертає до галереї. За
            надісланим посиланням у новій вкладці історії позаду немає, тож
            кнопка «назад» виведе із сайту; кнопка закриття або Escape прибирає
            параметр на місці й лишає вас у галереї.
          </li>
          <li>
            Параметр, який не називає жодного слайда — застаріла закладка,
            змінене вручну значення, — прибирається з URL, а не лишає в
            адресному рядку слайд, який не відкриється.
          </li>
        </ul>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          <strong>У застосунку з роутером передайте адаптер.</strong> Прямий
          запис в історію лишає власне місцеположення роутера застарілим, і
          наступна навігація втрачає параметр.
        </p>
        <CodeBlock
          code={`import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';

const adapter = useReactRouterUrlAdapter();
const photo = useOverlayUrlState({
  param: 'photo',
  adapter,
  ...urlIndexKey(() => images.length),
});

<LightboxUrlOverlay controller={photo} images={images} />`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          <strong>Відкриття — це посилання.</strong> Оскільки стан відкриття
          живе в URL, мініатюра — звичайне посилання без обробника кліку, і вся
          поведінка браузера дістається безкоштовно: відкрити в новій вкладці,
          скопіювати адресу, побачити підказку при наведенні. У застосунку з
          роутером беріть посилання роутера, щоб перехід лишався на клієнті.
        </p>
        <CodeBlock
          code={`import { Link } from 'react-router-dom';

// The href is the open action — no onClick, no open flag.
{images.map((image, i) => (
  <Link key={image.src} to={\`?photo=\${i}\`}>
    <img src={image.src} />
  </Link>
))}

<LightboxUrlOverlay controller={photo} images={images} />`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          <strong>
            Для посилань, якими діляться, краще стабільна ідентичність.
          </strong>{' '}
          Індекс адресує за позицією, тож збережений у закладках{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ?photo=3
          </code>{' '}
          відкриє інше зображення, щойно список перевпорядкують.{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlStableIdKey
          </code>{' '}
          адресує за стабільним{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            id
          </code>
          , scanning the live list — one call covers the common case.
        </p>
        <CodeBlock
          code={`const photo = useOverlayUrlState({
  param: 'photo',
  ...urlStableIdKey({ items: () => images }),
});

<LightboxUrlOverlay controller={photo} images={images} />`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          Pass{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            hashCodec: base64UrlCodec
          </code>{' '}
          щоб закодувати id в URL у base64url — оборотне маскування, а не
          криптографічний хеш.
        </p>
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
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
          самі:
        </p>
        <CodeBlock
          code={`const photo = useOverlayUrlState({
  param: 'photo',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => images.findIndex((x) => x.slug === id),
    identify: (index) => images[index].slug,
  },
});

<LightboxUrlOverlay controller={photo} images={images} />`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          <strong>Нескінченні та посторінкові галереї.</strong> Синхронний{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locate
          </code>{' '}
          відповідає лише за вже завантажені зображення — надіслане посилання на
          зображення 400 у стрічці, де завантажено 20, нічого не знайде.{' '}
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
          code={`const photo = useOverlayUrlState({
  param: 'photo',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => images.findIndex((x) => x.id === id),
    identify: (index) => images[index].id,
    locateAsync: async (id) => {
      const loaded = await loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!loaded) return null; // exhausted — link names no image
      setImages(loaded); // commit — the overlay renders from this state
      return loaded.findIndex((x) => x.id === id); // wherever it landed
    },
  },
});

<LightboxUrlOverlay controller={photo} images={images} />`}
          language="tsx"
        />
        <ul className="mt-4 list-disc pl-6 space-y-1 text-slate-600 dark:text-slate-400">
          <li>
            Як саме вантажити — ваша справа: тягніть сторінки поспіль до
            потрібної або лише одне зображення й додайте його. URL адресує за
            ідентичністю, а не за позицією, тож{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              findIndex
            </code>{' '}
            поверне те місце, де елемент опинився.
          </li>
          <li>
            While{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              locateAsync
            </code>{' '}
            у процесі, Lightbox лишається закритим, а параметр — недоторканим,
            тож пряме посилання переживає запит.{' '}
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
            Тайм-ауту немає — Lightbox не може знати, яка галерея завдовжки.
            Завершуйте значенням{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              null
            </code>{' '}
            коли сторінки скінчилися, інакше оверлей лишиться закритим назавжди.
          </li>
          <li>
            Whatever{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              locateAsync
            </code>{' '}
            є остаточним — це індекс щойно завантажених даних, узятий як є, без
            повторного читання{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              images
            </code>
            .
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
          id="lightboxoverlay-props"
          className="text-xl font-semibold mt-6 mb-4"
        >
          Пропси LightboxOverlay
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-mono">
          LightboxOverlayProps
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
              {lightboxProps.map((p) => (
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
          id="lightboxurloverlay-props"
          className="text-xl font-semibold mt-8 mb-2"
        >
          Пропси LightboxUrlOverlay
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-mono">
          LightboxUrlOverlayProps
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Приймає всі візуальні та поведінкові пропси вище, крім{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            isOpen
          </code>
          , and replaces it with a{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            controller
          </code>
          .{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            initialIndex
          </code>{' '}
          тут ігнорується — слайд обирає position контролера, тож передане поруч
          значення перезаписувалося б на кожному відкритті.
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
              {lightboxUrlProps.map((p) => (
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
              {lightboxCallbacks.map((p) => (
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
          id="lightboxitem"
          className="text-lg font-semibold mb-2"
        >
          LightboxItem
        </Heading>
        <CodeBlock
          code={`interface LightboxItem {
  src: string;
  type?: 'image' | 'video';  // defaults to 'image'
  poster?: string;            // thumbnail for video items
  title?: string;
  description?: string;
  width?: number;
  height?: number;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="controlsrenderprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
          ControlsRenderProps
        </Heading>
        <CodeBlock
          code={`interface ControlsRenderProps {
  item: LightboxItem;
  activeIndex: number;
  count: number;
  isFullscreen: boolean;
  onClose: () => void;
  onToggleFullscreen: () => void;
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
  item: LightboxItem;
  activeIndex: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="sliderenderprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
          SlideRenderProps
        </Heading>
        <CodeBlock
          code={`interface SlideRenderProps {
  item: LightboxItem;
  index: number;
  size: [number, number];
  isActive: boolean;
  onReady: () => void;
  onWaiting: () => void;
  onError: () => void;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="inforenderprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
          InfoRenderProps
        </Heading>
        <CodeBlock
          code={`interface InfoRenderProps {
  item: LightboxItem;
  index: number;
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
          Повторно використовувані підкомпоненти для складання власних елементів
          керування через{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderControls
          </code>
          .
        </p>

        <Heading
          level={3}
          id="closebutton"
          className="text-lg font-semibold mt-4 mb-2"
        >
          CloseButton
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Стандартна кнопка закриття у вигляді хрестика.
        </p>
        <CodeBlock
          code={`import { CloseButton } from '@reelkit/react-lightbox';

<CloseButton onClick={onClose} />`}
          language="tsx"
        />

        <Heading
          level={3}
          id="counter"
          className="text-lg font-semibold mt-6 mb-2"
        >
          Counter
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Значок лічильника зображень на кшталт «1 / 3».
        </p>
        <CodeBlock
          code={`import { Counter } from '@reelkit/react-lightbox';

<Counter currentIndex={activeIndex} count={count} />`}
          language="tsx"
        />

        <Heading
          level={3}
          id="fullscreenbutton"
          className="text-lg font-semibold mt-6 mb-2"
        >
          FullscreenButton
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Кнопка перемикання повного екрана (іконка Maximize або Minimize).
        </p>
        <CodeBlock
          code={`import { FullscreenButton } from '@reelkit/react-lightbox';

<FullscreenButton isFullscreen={isFullscreen} onToggle={onToggleFullscreen} />`}
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
          Кнопка перемикання звуку для слайдів-відео (іконка Volume2 або
          VolumeX). Автоматично входить у{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderControls
          </code>{' '}
          from{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useVideoSlideRenderer
          </code>
          . Для окремого використання у власних елементах керування доступ до
          стану звуку — через{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useSoundState
          </code>
          .
        </p>
        <CodeBlock
          code={`import { SoundButton } from '@reelkit/react-lightbox';
import { useSoundState } from '@reelkit/react';

// Inside a component wrapped in SoundProvider:
function CustomControls({ onClose }) {
  const soundState = useSoundState();

  return (
    <div>
      <SoundButton
        muted={soundState.muted.value}
        onToggle={soundState.toggle}
      />
      <button onClick={onClose}>Close</button>
    </div>
  );
}`}
          language="tsx"
        />
      </section>

      {/* Hooks */}
      <section className="mb-12">
        <Heading level={2} id="hooks" className="text-2xl font-bold mb-4">
          Hooks
        </Heading>

        <Heading
          level={3}
          id="usevideosliderenderer"
          className="text-lg font-semibold mb-2"
        >
          useVideoSlideRenderer
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Хук для підтримки відео за бажанням. Повертає{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlide
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderControls
          </code>
          , та{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            SoundProvider
          </code>{' '}
          — загорніть оверлей у SoundProvider і передайте функції рендерингу.
        </p>
        <CodeBlock
          code={`import { useVideoSlideRenderer } from '@reelkit/react-lightbox';

const { renderSlide, renderControls, SoundProvider, hasVideo } =
  useVideoSlideRenderer(items, isOpen);

// SoundProvider  — wrap LightboxOverlay in this for mute/unmute support
// renderSlide    — pass to LightboxOverlay's renderSlide prop
// renderControls — pass to LightboxOverlay's renderControls prop
//                  (includes Counter, FullscreenButton, SoundButton, CloseButton)
// hasVideo       — true if items contain at least one video
// isOpen param   — resets mute to true on close (enables autoplay on reopen)`}
          language="typescript"
        />

        <Heading
          level={3}
          id="usefullscreen"
          className="text-lg font-semibold mt-6 mb-2"
        >
          useFullscreen
        </Heading>
        <Callout type="warning" title="Moved" className="mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            useFullscreen
          </code>{' '}
          прибрано з{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/react-lightbox
          </code>
          . Import it from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/react
          </code>{' '}
          instead.
        </Callout>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Хук для керування станом повного екрана з кросбраузерною підтримкою.
        </p>
        <CodeBlock
          code={`import { useRef } from 'react';
import { useFullscreen } from '@reelkit/react';

function CustomLightbox() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, requestFullscreen, exitFullscreen, toggleFullscreen] =
    useFullscreen({ ref: containerRef });

  return (
    <div ref={containerRef}>
      <button onClick={toggleFullscreen}>
        {isFullscreen.value ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      </button>
    </div>
  );
}`}
          language="tsx"
        />
      </section>

      {/* Transitions */}
      <section className="mb-12">
        <Heading level={2} id="transitions" className="text-2xl font-bold mb-4">
          Переходи
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Передайте будь-яку{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            TransitionTransformFn
          </code>{' '}
          via the{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            transitionFn
          </code>{' '}
          Якщо імпортувати лише той перехід, який використовуєте, решту збирач
          прибере через tree-shaking. Типово —{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            slideTransition
          </code>{' '}
          , коли не задано.
        </p>

        <div className="overflow-x-auto mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Function</th>
                <th className="text-left py-3 px-4 font-semibold">From</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600">
                  slideTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  @reelkit/react-lightbox
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  Звичайний горизонтальний зсув (типово)
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600">
                  lightboxFadeTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  @reelkit/react-lightbox
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  Плавне перетікання між зображеннями
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600">
                  flipTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  @reelkit/react-lightbox
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  Ефект 3D-перевороту картки
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600">
                  lightboxZoomTransition
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  @reelkit/react-lightbox
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  Наближення від меншого до звичайного розміру
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock
          code={`import {
  LightboxOverlay,
  lightboxFadeTransition,
} from '@reelkit/react-lightbox';

<LightboxOverlay
  isOpen={isOpen}
  images={images}
  initialIndex={0}
  onClose={handleClose}
  transitionFn={lightboxFadeTransition}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="custom-transition-function"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Власна функція переходу
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Напишіть власну{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            TransitionTransformFn
          </code>{' '}
          and pass it via{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            transitionFn
          </code>
          . Сигнатура повторює переходи слайдера в ядрі.
        </p>
        <CodeBlock
          code={`import {
  LightboxOverlay,
  type TransitionTransformFn,
} from '@reelkit/react-lightbox';

const customFade: TransitionTransformFn = (offset, size) => ({
  transform: \`translate3d(\${offset * size[0]}px, 0, 0)\`,
  opacity: 1 - Math.min(Math.abs(offset), 1),
});

<LightboxOverlay
  isOpen={isOpen}
  images={images}
  transitionFn={customFade}
  onClose={() => setIsOpen(false)}
/>`}
          language="tsx"
        />
      </section>

      {/* CSS Classes */}
      <section className="mb-12">
        <Heading level={2} id="css-classes" className="text-2xl font-bold mb-4">
          Класи CSS
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Усі елементи інтерфейсу використовують звичайні класи CSS (не
          CSS-модулі), які можна перекрити селекторами вищої специфічності в
          таблиці стилів, підключеній після{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-lightbox/styles.css
          </code>
          . Для змін кольору, розміру та z-index краще беріть власні властивості
          CSS, описані в розділі{' '}
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
          (або на будь-якому предку Lightbox), щоб змінити тему, не чіпаючи код
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
            @reelkit/react-lightbox/styles.css
          </code>
          .
        </p>

        <CodeBlock
          language="css"
          code={`/* Brand the lightbox */
:root {
  --rk-lightbox-overlay-bg: #0f172a;
  --rk-lightbox-btn-bg: rgba(99, 102, 241, 0.65);
  --rk-lightbox-btn-bg-hover: rgba(168, 85, 247, 0.85);
  --rk-lightbox-nav-size: 56px;
  --rk-lightbox-counter-bg: rgba(99, 102, 241, 0.65);
  --rk-lightbox-info-bg: linear-gradient(
    transparent,
    rgba(99, 102, 241, 0.55) 60%,
    rgba(168, 85, 247, 0.85)
  );
}`}
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
          щоб змінити оголошення для екранного читача; типове значення — «Image
          gallery». Кожен слайд несе{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="group"
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-roledescription="slide"
          </code>
          , та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-label="Зображення N з M"
          </code>
          .
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Lightbox захоплює фокус під час відкриття й повертає його на
          елемент-тригер після закриття. Tab і Shift+Tab циклічно проходять
          фокусовані елементи всередині; фокус, що вислизнув (клік поза
          Lightbox, програмна установка), повертається назад. Реалізовано через{' '}
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
