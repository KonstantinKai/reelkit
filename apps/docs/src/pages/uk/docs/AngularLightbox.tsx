import { Link } from 'react-router-dom';
import { Callout } from '../../../components/ui/Callout';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Sandbox } from '../../../components/ui/Sandbox';
import { FeatureCardGrid } from '../../../components/ui/FeatureCard';
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
  AlertTriangle,
  Loader,
  Link2,
} from 'lucide-react';
import { Heading } from '../../../components/ui/Heading';
import { ukPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/angular-lightbox',
    title: 'Lightbox для Angular · ReelKit',
    description:
      'Повноекранна галерея зображень для Angular: входи та виходи компонента, типи контексту шаблонних слотів, завантаження вмісту й темізація.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

const lightboxInputs = [
  {
    prop: 'isOpen',
    type: 'boolean',
    default: 'required',
    description: 'Керує видимістю; якщо false, оверлей прибирається з DOM',
  },
  {
    prop: 'items',
    type: 'LightboxItem[]',
    default: 'required',
    description: 'Масив елементів Lightbox (зображення або відео)',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: 'Індекс початково видимого елемента, від нуля',
  },
  {
    prop: 'transitionFn',
    type: 'TransitionTransformFn',
    default: 'slideTransition',
    description:
      'Функція переходу між слайдами. Імпортуйте вбудовану (slideTransition, flipTransition, lightboxFadeTransition, lightboxZoomTransition) або передайте власну. Якщо не задано, використовується slideTransition.',
  },
  {
    prop: 'showInfo',
    type: 'boolean',
    default: 'true',
    description: 'Чи показувати інформаційний оверлей із заголовком та описом',
  },
  {
    prop: 'showControls',
    type: 'boolean',
    default: 'true',
    description:
      'Чи показувати верхню смугу керування (закриття, лічильник, повний екран)',
  },
  {
    prop: 'showNavigation',
    type: 'boolean',
    default: 'true',
    description: 'Чи показувати стрілки навігації вперед і назад',
  },
  {
    prop: 'transitionDuration',
    type: 'number',
    default: '300',
    description: 'Тривалість анімації слайда в мілісекундах',
  },
  {
    prop: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: 'Мінімальна частка відстані свайпу (0–1), щоб змінити слайд',
  },
  {
    prop: 'swipeToCloseDirection',
    type: "'up' | 'down'",
    default: "'up'",
    description: 'Напрямок жесту свайпу для закриття на мобільних',
  },
  {
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description: 'Чи переходить слайдер з останнього слайда на перший',
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
    prop: 'wheelDebounceMs',
    type: 'number',
    default: '200',
    description: 'Тривалість дебаунсу подій колеса в мілісекундах',
  },
  {
    prop: 'ariaLabel',
    type: 'string',
    default: "'Image gallery'",
    description: 'Доступна назва області діалогу',
  },
];

const lightboxOutputs = [
  {
    prop: 'closed',
    type: 'EventEmitter<void>',
    description: 'Видається, коли користувач закриває Lightbox',
  },
  {
    prop: 'slideChange',
    type: 'EventEmitter<number>',
    description: 'Видається, коли змінюється індекс активного слайда',
  },
];

const lightboxItemProps = [
  {
    prop: 'src',
    type: 'string',
    required: true,
    description: 'URL зображення або відео',
  },
  {
    prop: 'type',
    type: "'image' | 'video'",
    required: false,
    description: "Тип елемента. Типово 'image'",
  },
  {
    prop: 'poster',
    type: 'string',
    required: false,
    description: 'Мініатюра для елементів-відео',
  },
  {
    prop: 'title',
    type: 'string',
    required: false,
    description: 'Заголовок в інформаційному оверлеї',
  },
  {
    prop: 'description',
    type: 'string',
    required: false,
    description: 'Опис під заголовком',
  },
  {
    prop: 'width',
    type: 'number',
    required: false,
    description: 'Власна ширина зображення в пікселях',
  },
  {
    prop: 'height',
    type: 'number',
    required: false,
    description: 'Власна висота зображення в пікселях',
  },
];

const templateSlots = [
  {
    directive: 'rkLightboxControls',
    context: 'LightboxControlsContext',
    description:
      'Замінює верхню смугу керування (кнопка закриття, лічильник, перемикач повного екрана)',
  },
  {
    directive: 'rkLightboxNavigation',
    context: 'LightboxNavContext',
    description: 'Замінює стрілки навігації вперед і назад',
  },
  {
    directive: 'rkLightboxInfo',
    context: 'LightboxInfoContext',
    description: 'Замінює нижній градієнтний оверлей із заголовком та описом',
  },
  {
    directive: 'rkLightboxSlide',
    context: 'LightboxSlideContext',
    description:
      'Замінює вміст окремого слайда (обов’язково для слайдів-відео)',
  },
  {
    directive: 'rkLightboxLoading',
    context: '{ $implicit: activeIndex, item }',
    description: 'Власний індикатор завантаження',
  },
  {
    directive: 'rkLightboxError',
    context: '{ $implicit: activeIndex, item }',
    description: 'Власний індикатор помилки',
  },
];

const contextTypes = [
  {
    name: 'LightboxControlsContext',
    fields:
      '{ item, onClose, activeIndex, count, isFullscreen, onToggleFullscreen }',
  },
  {
    name: 'LightboxNavContext',
    fields: '{ item, onPrev, onNext, activeIndex, count }',
  },
  {
    name: 'LightboxInfoContext',
    fields: '{ $implicit: LightboxItem, index }',
  },
  {
    name: 'LightboxSlideContext',
    fields:
      '{ $implicit: LightboxItem, index, size: [number, number], isActive, onReady, onWaiting, onError }',
  },
];

const lifecycleCallbacks = [
  {
    callback: 'onReady',
    type: '() => void',
    description:
      'Повідомляє, що вміст слайда успішно завантажився (наприклад, зображення декодовано)',
  },
  {
    callback: 'onWaiting',
    type: '() => void',
    description:
      'Повідомляє, що вміст слайда вантажиться або буферизується (показує індикатор)',
  },
  {
    callback: 'onError',
    type: '() => void',
    description:
      'Повідомляє, що вміст слайда не завантажився (показує значок помилки)',
  },
];

const cssClasses = [
  // Overlay
  {
    className: '.rk-lightbox-overlay',
    component: 'Overlay',
    description: 'Кореневий контейнер (повноекранне тло)',
  },
  {
    className: '.rk-lightbox-top-shade',
    component: 'Overlay',
    description: 'Верхній градієнтний шар за елементами керування',
  },
  {
    className: '.rk-lightbox-spinner',
    component: 'Overlay',
    description: 'Стандартний індикатор завантаження',
  },
  {
    className: '.rk-lightbox-img-error',
    component: 'Overlay',
    description: 'Контейнер стану помилки (зіпсоване зображення)',
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
  {
    className: '.rk-lightbox-empty',
    component: 'Overlay',
    description: 'Текст порожнього стану',
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
    description: 'Кнопка керування (повний екран тощо)',
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
    description: 'Стрілка навігації (і вперед, і назад)',
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
  {
    className: '.rk-lightbox-video-error',
    component: 'VideoSlide',
    description: 'Контейнер стану помилки відео',
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

  // Video slide (opt-in)
  {
    token: '--rk-lightbox-video-bg',
    default: '#000',
    controls: 'Letterbox background behind <video>',
  },
];

const keyboardShortcuts = [
  { key: 'ArrowLeft', action: 'Previous image' },
  { key: 'ArrowRight', action: 'Next image' },
  { key: 'Escape', action: 'Close lightbox (or exit fullscreen if active)' },
];

export default function AngularLightbox() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Lightbox для Angular</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Повноекранний Lightbox-галерея зображень і відео для Angular на основі{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/angular-lightbox
          </code>
          .
        </p>
        <a
          href="https://angular-demo.reelkit.dev/image-preview?utm_source=docs"
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
                desc: 'Індикатор і власний слот',
              },
              {
                icon: AlertTriangle,
                label: 'Обробка помилок',
                desc: 'Значок помилки та власний слот',
              },
              {
                icon: Layers,
                label: 'Шаблонні слоти',
                desc: '6 налаштовних зон-слотів',
              },
              {
                icon: Layers,
                label: 'OnPush',
                desc: 'Сигнали Angular і OnPush',
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

      <section className="mb-12">
        <Heading
          level={2}
          id="installation"
          className="text-2xl font-bold mb-4"
        >
          Встановлення
        </Heading>
        <CodeBlock
          code={`npm install @reelkit/angular-lightbox @reelkit/angular lucide-angular`}
          language="bash"
        />
        <Callout type="info" title="Icons" className="mt-4">
          Стандартні елементи керування використовують{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lucide-angular
          </code>{' '}
          for icons. If you prefer a different icon library, use the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkLightboxControls
          </code>{' '}
          та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkLightboxNavigation
          </code>{' '}
          щоб передати власні.
        </Callout>
      </section>

      <section className="mb-12">
        <Heading level={2} id="basic-usage" className="text-2xl font-bold mb-4">
          Базове використання
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Імпортуйте стилі та автономний компонент{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RkLightboxOverlayComponent
          </code>{' '}
          у{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            imports
          </code>{' '}
          array.
        </p>
        <Sandbox
          code={`import { Component } from '@angular/core';
import {
  RkLightboxOverlayComponent,
  type LightboxItem,
} from '@reelkit/angular-lightbox';
import '@reelkit/angular-lightbox/styles.css';

const images: LightboxItem[] = [
  {
    src: '/cdn/samples/images/image-01.jpg',
    title: 'Mountain River',
    description: 'A beautiful mountain river',
  },
  {
    src: '/cdn/samples/images/image-02.jpg',
    title: 'Snowy Peaks',
  },
  {
    src: '/cdn/samples/images/image-03.jpg',
    title: 'Misty Forest',
    description: 'Morning fog over the forest canopy',
  },
  {
    src: '/cdn/samples/images/image-04.jpg',
    title: 'Autumn Trail',
  },
  {
    src: '/cdn/samples/images/image-05.jpg',
    title: 'Ocean Cliff',
    description: 'Dramatic cliffs above the Pacific',
  },
  {
    src: '/cdn/samples/images/image-06.jpg',
    title: 'Desert Dunes',
  },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RkLightboxOverlayComponent],
  template: \`
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
      @for (img of images; track img.src; let i = $index) {
        <button (click)="openIndex = i" style="aspect-ratio:4/3;cursor:pointer">
          <img [src]="img.src" style="width:100%;height:100%;object-fit:cover" />
        </button>
      }
    </div>

    <rk-lightbox-overlay
      [isOpen]="openIndex !== null"
      [items]="images"
      [initialIndex]="openIndex ?? 0"
      (closed)="openIndex = null"
    />
  \`,
})
export class AppComponent {
  images = images;
  openIndex: number | null = null;
}`}
          language="typescript"
          title="gallery.component.ts"
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
          Чотири директиви шаблонних слотів дають повністю налаштувати інтерфейс
          оверлея, не форкаючи компонент. Кожен слот отримує строго типізований
          об’єкт контексту.
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
  RkLightboxOverlayComponent,
  RkLightboxControlsDirective,
  RkLightboxNavigationDirective,
  RkLightboxInfoDirective,
  RkCloseButtonComponent,
  RkCounterComponent,
  RkFullscreenButtonComponent,
  type LightboxItem,
  type LightboxControlsContext,
  type LightboxNavContext,
} from '@reelkit/angular-lightbox';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RkLightboxOverlayComponent,
    RkLightboxControlsDirective,
    RkLightboxNavigationDirective,
    RkLightboxInfoDirective,
    RkCloseButtonComponent,
    RkCounterComponent,
    RkFullscreenButtonComponent,
  ],
  template: \`
    <rk-lightbox-overlay [isOpen]="isOpen" [items]="images" (closed)="isOpen = false">

      <!-- Custom controls bar -->
      <ng-template rkLightboxControls
                   let-onClose="onClose"
                   let-activeIndex="activeIndex"
                   let-count="count"
                   let-isFullscreen="isFullscreen"
                   let-onToggleFullscreen="onToggleFullscreen">
        <div style="position:absolute;top:0;left:0;right:0;padding:12px;
                    display:flex;align-items:center;justify-content:space-between">
          <rk-close-button (clicked)="onClose()" />
          <rk-counter [currentIndex]="activeIndex + 1" [count]="count" />
          <rk-fullscreen-button
            [isFullscreen]="isFullscreen"
            (toggled)="onToggleFullscreen()" />
        </div>
      </ng-template>

      <!-- Custom navigation -->
      <ng-template rkLightboxNavigation
                   let-onPrev="onPrev"
                   let-onNext="onNext"
                   let-activeIndex="activeIndex"
                   let-count="count">
        <button (click)="onPrev()" [disabled]="activeIndex === 0">&#8592;</button>
        <button (click)="onNext()" [disabled]="activeIndex === count - 1">&#8594;</button>
      </ng-template>

      <!-- Custom info overlay -->
      <ng-template rkLightboxInfo let-item let-index="index">
        <div style="position:absolute;bottom:0;left:0;right:0;padding:16px;
                    background:linear-gradient(transparent,rgba(0,0,0,0.6))">
          <h3 style="color:#fff">{{ item.title }}</h3>
          <p style="color:rgba(255,255,255,0.7)">{{ item.description }}</p>
        </div>
      </ng-template>

    </rk-lightbox-overlay>
  \`,
})
export class AppComponent {
  images: LightboxItem[] = [];
  isOpen = false;
}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="video-support"
          className="text-2xl font-bold mb-4"
        >
          Підтримка відео
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Слайди-відео вмикаються через шаблонний слот{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkLightboxSlide
          </code>{' '}
          та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RkLightboxVideoSlideComponent
          </code>
          . Так відеоплеєр не потрапляє в бандл галерей, яким потрібні лише
          зображення.
        </p>
        <CodeBlock
          code={`import {
  RkLightboxOverlayComponent,
  RkLightboxSlideDirective,
  RkLightboxVideoSlideComponent,
  type LightboxItem,
  type LightboxSlideContext,
} from '@reelkit/angular-lightbox';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RkLightboxOverlayComponent,
    RkLightboxSlideDirective,
    RkLightboxVideoSlideComponent,
  ],
  template: \`
    <rk-lightbox-overlay [isOpen]="isOpen" [items]="items" (closed)="isOpen = false">
      <ng-template rkLightboxSlide
                   let-item
                   let-size="size"
                   let-isActive="isActive">
        @if (item.type === 'video') {
          <rk-lightbox-video-slide
            [item]="item"
            [size]="size"
            [isActive]="isActive"
          />
        } @else {
          <img [src]="item.src"
               [style.width.px]="size[0]"
               [style.height.px]="size[1]"
               style="object-fit:contain" />
        }
      </ng-template>
    </rk-lightbox-overlay>
  \`,
})
export class AppComponent {
  isOpen = false;
  items: LightboxItem[] = [
    { src: '/photo.jpg', title: 'Photo' },
    { src: '/clip.mp4', type: 'video', poster: '/clip-thumb.jpg', title: 'Video' },
  ];
}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="fullscreen" className="text-2xl font-bold mb-4">
          Повний екран
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Використовуйте{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            fullscreenSignal
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            requestFullscreen
          </code>
          , та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            exitFullscreen
          </code>{' '}
          from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/angular
          </code>{' '}
          щоб стежити за станом повного екрана або перемикати його.
        </p>
        <CodeBlock
          code={`import { fullscreenSignal, requestFullscreen, exitFullscreen } from '@reelkit/angular';

@Component({ ... })
export class AppComponent {
  readonly isFullscreen = fullscreenSignal();

  toggle(container: HTMLElement): void {
    if (this.isFullscreen()) {
      exitFullscreen();
    } else {
      requestFullscreen(container);
    }
  }
}`}
          language="typescript"
        />
      </section>

      {/* URL state */}
      <section className="mb-12">
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          Стан в URL
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            RkLightboxUrlOverlayComponent
          </code>{' '}
          — окремий компонент, стан відкриття якого живе в адресному рядку.
          Побудуйте контролер через{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createOverlayUrlState
          </code>{' '}
          і передайте його як{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            [controller]
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
        <CodeBlock
          code={
            `import { RkLightboxUrlOverlayComponent } from '@reelkit/angular-lightbox';
import { createOverlayUrlState, urlIndexKey, urlStableIdKey } from '@reelkit/angular';

@Component({
  imports: [RkLightboxUrlOverlayComponent, RouterLink],
  template: ` +
            '`' +
            `
    @for (image of images(); track image.src; let i = $index) {
      <a [routerLink]="[]" [queryParams]="{ photo: i }">
        <img [src]="image.src" alt="" />
      </a>
    }

    <rk-lightbox-url-overlay [controller]="photo" [items]="images()" />
  ` +
            '`' +
            `,
})
export class GalleryComponent {
  protected readonly images = signal(photos);

  protected readonly photo = createOverlayUrlState({
    param: 'photo',
    ...urlIndexKey(() => this.images().length),
  });
}`
          }
          language="typescript"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          Викликайте його в контексті впровадження — в ініціалізаторі поля або в
          конструкторі. Він під’єднується одразу й звільняється через{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            DestroyRef
          </code>
          , so a component destroyed while the gallery is open leaves no
          listener behind. Full options live in the{' '}
          <Link
            to="/uk/docs/angular/api#createoverlayurlstate"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            довіднику API для Angular
          </Link>
          .
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 mb-4">
          <li>
            Відкриття додає <strong>один</strong> запис в історію. Гортання
            слайдів <strong>замінює</strong> його, тож N кроків не додають
            записів, і один крок назад завжди виводить із галереї.
          </li>
          <li>
            «Назад» закриває лише тоді, коли галерею відкрили всередині
            застосунку — посилання додало запис. За надісланим посиланням у
            новій вкладці історії позаду немає, тож кнопка «назад» виведе із
            сайту; кнопка ✕ або Escape прибирає параметр на місці й лишає вас на
            сторінці.
          </li>
          <li>
            Параметр, який не називає жодного слайда — застаріла закладка,
            змінене вручну значення, — прибирається з URL, а не лишається
            наполягати на слайді, що не відкриється.
          </li>
          <li>
            Шаблонні слоти працюють без змін: url-компонент сам виконує шість
            запитів слотів і передає кожен шаблон у галерею, тож{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              rkLightboxControls
            </code>{' '}
            та сусідні директиви живуть усередині нього точно так само, як
            усередині{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              rk-lightbox-overlay
            </code>
            .
          </li>
          <li>
            У застосунку з роутером передайте адаптер на базі{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              Router
            </code>
            . Запис в історію повз Router лишає його місцеположення застарілим,
            і наступна навігація втрачає параметр.
          </li>
        </ul>
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          <strong>У застосунку з роутером передайте адаптер.</strong> Запис в
          історію повз Router лишає його місцеположення застарілим, і наступна
          навігація втрачає параметр, тож збудуйте адаптер на базі{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            Router
          </code>{' '}
          and pass it as{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            adapter
          </code>
          :
        </p>
        <CodeBlock
          code={`import { createRouterUrlAdapter } from '@reelkit/angular/ng-router-url-adapter';

const adapter = createRouterUrlAdapter();

const photo = createOverlayUrlState({
  param: 'photo',
  adapter,
  ...urlIndexKey(() => this.images().length),
});`}
          language="typescript"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          <strong>Стабільні посилання.</strong> Індекс адресує за позицією —
          збережений у закладках{' '}
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
          code={`const photo = createOverlayUrlState({
  param: 'photo',
  ...urlStableIdKey({ items: () => this.images() }),
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
          </code>{' '}
          (формат передавання) та{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locator
          </code>{' '}
          (пошук) самі:
        </p>
        <CodeBlock
          code={`const photo = createOverlayUrlState({
  param: 'photo',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => this.images().findIndex((x) => x.id === id),
    identify: (index) => this.images()[index].id,
  },
});`}
          language="typescript"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          <strong>Нескінченні та посторінкові галереї.</strong>{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locate
          </code>{' '}
          синхронний, тож відповідає лише за вже завантажені зображення —
          надіслане посилання на зображення 400 у стрічці, де завантажено 20,
          нічого не знайде.{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locateAsync
          </code>{' '}
          — запасний варіант, що викликається лише коли{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locate
          </code>{' '}
          не знаходить: завантажте потрібні сторінки й поверніть індекс, який ця
          ідентичність отримала. Поки він у процесі, галерея лишається закритою,
          а параметр — недоторканим, тож пряме посилання переживає запит;{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            null
          </code>{' '}
          або відмова прибирає параметр.
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
          code={`const photo = createOverlayUrlState({
  param: 'photo',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => this.images().findIndex((x) => x.id === id),
    identify: (index) => this.images()[index].id,
    locateAsync: async (id) => {
      const loaded = await loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!loaded) return null; // exhausted — link names no item
      this.images.set(loaded); // commit; the overlay renders from this
      return loaded.findIndex((x) => x.id === id); // wherever it landed
    },
  },
});`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="rklightboxurloverlaycomponent-inputs"
          className="text-2xl font-bold mb-4"
        >
          Входи RkLightboxUrlOverlayComponent
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Приймає всі входи{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            rk-lightbox-overlay
          </code>{' '}
          except{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            isOpen
          </code>
          , replaced by a controller. Outputs are the same{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            closed
          </code>{' '}
          та{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            slideChange
          </code>
          ; the URL drives closing, so{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            closed
          </code>{' '}
          тут радше сповіщення, ніж механізм.
        </p>
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
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  controller
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-600 dark:text-slate-400">
                  UrlStateController
                </td>
                <td className="py-3 px-4 font-mono text-sm text-slate-500">
                  required
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Контролер із createOverlayUrlState. Його position вирішує, чи
                  галерея відкрита і який слайд показує; компонент записує через
                  нього назад на зміну слайда та на закриття.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="rklightboxoverlaycomponent-inputs"
          className="text-2xl font-bold mb-4"
        >
          Входи RkLightboxOverlayComponent
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
              {lightboxInputs.map((p) => (
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
          id="rklightboxoverlaycomponent-outputs"
          className="text-2xl font-bold mb-4"
        >
          Виходи RkLightboxOverlayComponent
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
              {lightboxOutputs.map((p) => (
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
          id="lightboxitem-interface"
          className="text-2xl font-bold mb-4"
        >
          Інтерфейс LightboxItem
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Field</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Required</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {lightboxItemProps.map((p) => (
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
                    {p.required ? 'yes' : 'no'}
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
        <Heading level={2} id="transitions" className="text-2xl font-bold mb-4">
          Переходи
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Передайте будь-яку{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            TransitionTransformFn
          </code>{' '}
          via the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            transitionFn
          </code>{' '}
          . Якщо імпортувати лише той перехід, який використовуєте, решту збирач
          прибере через tree-shaking. Типово —{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
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
                  @reelkit/angular-lightbox
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
                  @reelkit/angular-lightbox
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
                  @reelkit/angular-lightbox
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
                  @reelkit/angular-lightbox
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
  RkLightboxOverlayComponent,
  lightboxFadeTransition,
} from '@reelkit/angular-lightbox';

@Component({
  imports: [RkLightboxOverlayComponent],
  template: \`
    <rk-lightbox-overlay
      [isOpen]="isOpen"
      [items]="images"
      [transitionFn]="lightboxFadeTransition"
      (closed)="isOpen = false"
    />
  \`,
})
export class GalleryComponent {
  protected readonly lightboxFadeTransition = lightboxFadeTransition;
}`}
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
          Коли використовуєте слот{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkLightboxSlide
          </code>{' '}
          , в контексті доступні три колбеки життєвого циклу, щоб повідомляти
          стан завантаження. Lightbox стежить за станом кожного слайда й показує
          індикатор або значок помилки. Попереднє завантаження кешує зіпсовані
          URL, тож повторний перехід до невдалого слайда обходиться без нової
          спроби.
        </p>

        <Heading
          level={3}
          id="lifecycle-callbacks"
          className="text-xl font-semibold mt-6 mb-4"
        >
          Колбеки життєвого циклу
        </Heading>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Колбек</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {lifecycleCallbacks.map((c) => (
                <tr
                  key={c.callback}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {c.callback}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {c.type}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {c.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="wiring-callbacks-in-rklightboxslide"
          className="text-xl font-semibold mt-6 mb-4"
        >
          Підключення колбеків у rkLightboxSlide
        </Heading>
        <CodeBlock
          code={`<rk-lightbox-overlay [isOpen]="isOpen" [items]="items" (closed)="isOpen = false">
  <ng-template rkLightboxSlide
               let-item
               let-size="size"
               let-isActive="isActive"
               let-onReady="onReady"
               let-onWaiting="onWaiting"
               let-onError="onError">
    @if (item.type === 'video') {
      <rk-lightbox-video-slide
        [item]="item"
        [size]="size"
        [isActive]="isActive"
      />
    } @else {
      <img [src]="item.src"
           [style.width.px]="size[0]"
           [style.height.px]="size[1]"
           style="object-fit:contain"
           (load)="onReady()"
           (error)="onError()" />
    }
  </ng-template>
</rk-lightbox-overlay>`}
          language="html"
        />

        <Heading
          level={3}
          id="custom-loading-template"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Власний шаблон завантаження
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Скористайтеся пропсом{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkLightboxLoading
          </code>{' '}
          щоб замінити стандартний індикатор.
        </p>
        <CodeBlock
          code={`<rk-lightbox-overlay [isOpen]="isOpen" [items]="items" (closed)="isOpen = false">
  <ng-template rkLightboxLoading let-index let-item="item">
    <div style="display:flex;flex-direction:column;align-items:center;color:#fff">
      <span>Loading image {{ index + 1 }}...</span>
      <span style="opacity:0.6">{{ item.title }}</span>
    </div>
  </ng-template>
</rk-lightbox-overlay>`}
          language="html"
        />

        <Heading
          level={3}
          id="custom-error-template"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Власний шаблон помилки
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Скористайтеся пропсом{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkLightboxError
          </code>{' '}
          щоб замінити стандартний значок помилки.
        </p>
        <CodeBlock
          code={`<rk-lightbox-overlay [isOpen]="isOpen" [items]="items" (closed)="isOpen = false">
  <ng-template rkLightboxError let-index let-item="item">
    <div style="display:flex;flex-direction:column;align-items:center;color:#ef4444">
      <span>Failed to load</span>
      <span style="opacity:0.6">{{ item.title ?? item.src }}</span>
    </div>
  </ng-template>
</rk-lightbox-overlay>`}
          language="html"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="css-classes" className="text-2xl font-bold mb-4">
          Класи CSS
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Усі класи CSS звичайні (не scoped), тож їх можна перекрити селекторами
          вищої специфічності в таблиці стилів, підключеній після{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/angular-lightbox/styles.css
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
          компонентів. Токени збігаються з Lightbox для React, тож
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
            @reelkit/angular-lightbox/styles.css
          </code>
          .
        </p>

        <CodeBlock
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
          щоб змінити оголошення для екранного читача; типове значення — «Image
          gallery». Кожен слайд несе{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="group"
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-roledescription="slide"
          </code>
          , and an{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-label
          </code>{' '}
          виведений із заголовка зображення та позиції.
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
