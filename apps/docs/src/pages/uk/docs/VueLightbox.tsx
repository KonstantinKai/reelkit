import { Link } from 'react-router-dom';
import { Callout } from '../../../components/ui/Callout';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Sandbox } from '../../../components/ui/Sandbox';
import { FeatureCardGrid } from '../../../components/ui/FeatureCard';
import {
  Image,
  Zap,
  Keyboard,
  Maximize2,
  Layers,
  X,
  Hash,
  Volume2,
  MousePointer,
  Loader,
  AlertTriangle,
  Link2,
} from 'lucide-react';
import { Heading } from '../../../components/ui/Heading';
import { ukPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/vue-lightbox',
    title: 'Lightbox для Vue · ReelKit',
    description:
      'Повноекранна галерея зображень для Vue: властивості та події LightboxOverlay, типи слотів, завантаження вмісту й темізація.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

const lightboxUrlProps = [
  {
    prop: 'controller',
    type: 'UrlStateController',
    default: 'required',
    description:
      'Контролер із useOverlayUrlState. Його position вирішує, чи оверлей відкритий і який слайд показує; оверлей записує через нього назад на зміну слайда та на закриття.',
  },
];

const lightboxProps = [
  {
    prop: 'isOpen',
    type: 'boolean',
    default: 'required',
    description:
      'Керує видимістю; якщо false, оверлей прибирається з DOM. Прив’язується через v-model:is-open.',
  },
  {
    prop: 'items',
    type: 'LightboxItem[]',
    default: 'required',
    description: 'Масив елементів (зображення або відео)',
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
    description:
      'Чи показувати стрілки навігації вперед і назад (лише на десктопі)',
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

const lightboxEvents = [
  {
    name: 'close',
    payload: 'void',
    description: 'Видається, коли користувач закриває Lightbox',
  },
  {
    name: 'slide-change',
    payload: 'number',
    description: 'Видається з новим індексом активного слайда після зміни',
  },
  {
    name: 'api-ready',
    payload: 'LightboxApi',
    description:
      'Видається, коли слайдер готовий, і відкриває імперативний API',
  },
  {
    name: 'update:is-open',
    payload: 'boolean',
    description: 'Видається на закриття; забезпечує роботу v-model:is-open',
  },
];

const lightboxItemFields = [
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

const scopedSlots = [
  {
    slot: 'slide',
    scope: 'SlideSlotScope',
    description:
      'Замінює вміст окремого слайда (обов’язково для слайдів-відео)',
  },
  {
    slot: 'controls',
    scope: 'ControlsSlotScope',
    description:
      'Замінює верхню смугу керування (закриття, лічильник, повний екран)',
  },
  {
    slot: 'navigation',
    scope: 'NavigationSlotScope',
    description: 'Замінює стрілки навігації вперед і назад',
  },
  {
    slot: 'info',
    scope: 'InfoSlotScope',
    description: 'Замінює нижній градієнтний оверлей із заголовком та описом',
  },
  {
    slot: 'loading',
    scope: 'LoadingSlotScope',
    description: 'Власний індикатор завантаження',
  },
  {
    slot: 'error',
    scope: 'ErrorSlotScope',
    description: 'Власний індикатор помилки',
  },
];

const scopeTypes = [
  {
    name: 'SlideSlotScope',
    fields:
      '{ item, index, size: [number, number], isActive, onReady, onWaiting, onError }',
  },
  {
    name: 'ControlsSlotScope',
    fields:
      '{ item, activeIndex, count, isFullscreen, onClose, onToggleFullscreen }',
  },
  {
    name: 'NavigationSlotScope',
    fields: '{ item, activeIndex, count, onPrev, onNext }',
  },
  { name: 'InfoSlotScope', fields: '{ item, index }' },
  { name: 'LoadingSlotScope', fields: '{ item, activeIndex }' },
  { name: 'ErrorSlotScope', fields: '{ item, activeIndex }' },
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

const transitions = [
  {
    name: 'slideTransition',
    description:
      'Типовий. Горизонтальний зсув між слайдами; реекспортовано з @reelkit/vue.',
  },
  {
    name: 'lightboxFadeTransition',
    description:
      'Плавне перетікання з легким горизонтальним зсувом. Власний для @reelkit/vue-lightbox.',
  },
  {
    name: 'flipTransition',
    description: '3D-переворот навколо осі Y; реекспортовано з @reelkit/vue.',
  },
  {
    name: 'lightboxZoomTransition',
    description:
      'Новий слайд масштабується з 70% до 100% із затуханням. Власний для @reelkit/vue-lightbox.',
  },
];

const cssClasses = [
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
    className: '.rk-lightbox-error',
    component: 'Overlay',
    description: 'Контейнер стану помилки (зіпсоване зображення)',
  },
  {
    className: '.rk-lightbox-error-text',
    component: 'Overlay',
    description: 'Текст стану помилки',
  },
  {
    className: '.rk-lightbox-controls-left',
    component: 'Controls',
    description: 'Контейнер елементів керування вгорі ліворуч',
  },
  {
    className: '.rk-lightbox-btn',
    component: 'Controls',
    description: 'Кнопка керування (повний екран, звук тощо)',
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
  {
    className: '.rk-lightbox-info',
    component: 'Info',
    description: 'Контейнер заголовка й опису',
  },
  {
    className: '.rk-lightbox-info-title',
    component: 'Info',
    description: 'Заголовок зображення',
  },
  {
    className: '.rk-lightbox-info-description',
    component: 'Info',
    description: 'Опис зображення',
  },
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
  {
    token: '--rk-lightbox-overlay-bg',
    default: '#000',
    controls: 'Backdrop color',
  },
  {
    token: '--rk-lightbox-overlay-z',
    default: '9999',
    controls: 'Overlay z-index',
  },
  {
    token: '--rk-lightbox-top-shade-height',
    default: '80px',
    controls: 'Top scrim height',
  },
  {
    token: '--rk-lightbox-top-shade-bg',
    default: 'linear-gradient(rgba(0,0,0,0.6), transparent)',
    controls: 'Top scrim gradient',
  },
  {
    token: '--rk-lightbox-edge-padding',
    default: '16px',
    controls: 'Edge inset for close / nav / controls',
  },
  {
    token: '--rk-lightbox-btn-bg',
    default: 'rgba(0, 0, 0, 0.5)',
    controls: 'Default background for close / nav / small buttons',
  },
  {
    token: '--rk-lightbox-btn-bg-hover',
    default: 'rgba(255, 255, 255, 0.2)',
    controls: 'Hover background for close / nav / small buttons',
  },
  {
    token: '--rk-lightbox-btn-fg',
    default: '#fff',
    controls: 'Icon color for close / nav / small buttons',
  },
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
    controls: 'Prev / next arrow size',
  },
  {
    token: '--rk-lightbox-nav-opacity',
    default: '0.7',
    controls: 'Idle opacity of prev / next arrows',
  },
  {
    token: '--rk-lightbox-counter-bg',
    default: 'rgba(0, 0, 0, 0.5)',
    controls: 'Counter chip background',
  },
  {
    token: '--rk-lightbox-counter-fg',
    default: '#fff',
    controls: 'Counter text color',
  },
  {
    token: '--rk-lightbox-info-bg',
    default: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
    controls: 'Caption scrim gradient',
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

const basicUsageCode = `<script setup lang="ts">
import { ref } from 'vue';
import { LightboxOverlay, type LightboxItem } from '@reelkit/vue-lightbox';
import '@reelkit/vue-lightbox/styles.css';

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

const open = ref(false);
const startIndex = ref(0);

function openAt(i: number) {
  startIndex.value = i;
  open.value = true;
}
</script>

<template>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
    <button
      v-for="(img, i) in images"
      :key="img.src"
      style="aspect-ratio:4/3;cursor:pointer"
      @click="openAt(i)"
    >
      <img :src="img.src" style="width:100%;height:100%;object-fit:cover" />
    </button>
  </div>

  <LightboxOverlay
    v-model:is-open="open"
    :items="images"
    :initial-index="startIndex"
  />
</template>`;

const slotsExampleCode = `<template>
  <LightboxOverlay v-model:is-open="open" :items="items">
    <!-- Custom info overlay -->
    <template #info="{ item }">
      <div class="my-caption">
        <h2>{{ item.title }}</h2>
        <p>{{ item.description }}</p>
      </div>
    </template>

    <!-- Custom navigation -->
    <template #navigation="{ onPrev, onNext, activeIndex, count }">
      <div class="my-nav">
        <button :disabled="activeIndex === 0" @click="onPrev">Prev</button>
        <span>{{ activeIndex + 1 }} / {{ count }}</span>
        <button :disabled="activeIndex === count - 1" @click="onNext">Next</button>
      </div>
    </template>

    <!-- Custom controls -->
    <template #controls="{ onClose, isFullscreen, onToggleFullscreen }">
      <div class="my-controls">
        <button @click="onToggleFullscreen">
          {{ isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen' }}
        </button>
        <button @click="onClose">Close</button>
      </div>
    </template>
  </LightboxOverlay>
</template>`;

const videoOptInCode = `<script setup lang="ts">
import { ref } from 'vue';
import {
  LightboxOverlay,
  useVideoSlideRenderer,
  type LightboxItem,
} from '@reelkit/vue-lightbox';
import '@reelkit/vue-lightbox/styles.css';

const open = ref(false);
const items: LightboxItem[] = [
  { src: '/image-01.jpg', title: 'Image' },
  {
    type: 'video',
    src: '/clip.mp4',
    poster: '/clip.jpg',
    title: 'Clip',
  },
];

const { VideoSlideRenderer, VideoControlsRenderer, SoundProvider } =
  useVideoSlideRenderer(items);
</script>

<template>
  <SoundProvider>
    <LightboxOverlay v-model:is-open="open" :items="items">
      <template #slide="scope">
        <VideoSlideRenderer v-bind="scope" />
      </template>
      <template #controls="scope">
        <VideoControlsRenderer v-bind="scope" />
      </template>
    </LightboxOverlay>
  </SoundProvider>
</template>`;

const fullscreenCode = `<script setup lang="ts">
import { shallowRef } from 'vue';
import { useFullscreen } from '@reelkit/vue';

const containerRef = shallowRef<HTMLDivElement | null>(null);
const { isFullscreen, toggle } = useFullscreen({ elementRef: containerRef });
</script>

<template>
  <div ref="containerRef">
    <button @click="toggle">
      {{ isFullscreen.value ? 'Exit fullscreen' : 'Enter fullscreen' }}
    </button>
  </div>
</template>`;

const customTransitionCode = `<script setup lang="ts">
import {
  LightboxOverlay,
  lightboxFadeTransition,
  lightboxZoomTransition,
} from '@reelkit/vue-lightbox';
</script>

<template>
  <!-- Built-in transition -->
  <LightboxOverlay
    v-model:is-open="open"
    :items="items"
    :transition-fn="lightboxFadeTransition"
  />

  <!-- Different built-in -->
  <LightboxOverlay
    v-model:is-open="open"
    :items="items"
    :transition-fn="lightboxZoomTransition"
  />
</template>`;

const lifecycleSlideCode = `<template>
  <LightboxOverlay v-model:is-open="open" :items="items">
    <template
      #slide="{ item, size, isActive, onReady, onWaiting, onError }"
    >
      <template v-if="item.type === 'video'">
        <video
          :src="item.src"
          :poster="item.poster"
          :autoplay="isActive"
          :style="{ width: \`\${size[0]}px\`, height: \`\${size[1]}px\`, objectFit: 'contain' }"
          @canplay="onReady"
          @waiting="onWaiting"
          @error="onError"
        />
      </template>
      <template v-else>
        <img
          :src="item.src"
          :style="{ width: \`\${size[0]}px\`, height: \`\${size[1]}px\`, objectFit: 'contain' }"
          @load="onReady"
          @error="onError"
        />
      </template>
    </template>
  </LightboxOverlay>
</template>`;

const customLoadingCode = `<template>
  <LightboxOverlay v-model:is-open="open" :items="items">
    <template #loading="{ item, activeIndex }">
      <div class="my-loading">
        <span>Loading image {{ activeIndex + 1 }}…</span>
        <span class="muted">{{ item.title }}</span>
      </div>
    </template>
  </LightboxOverlay>
</template>`;

const customErrorCode = `<template>
  <LightboxOverlay v-model:is-open="open" :items="items">
    <template #error="{ item, activeIndex }">
      <div class="my-error">
        <span>Failed to load</span>
        <span class="muted">{{ item.title ?? item.src }}</span>
      </div>
    </template>
  </LightboxOverlay>
</template>`;

const themingCode = `<style>
:root {
  --rk-lightbox-overlay-bg: #0f172a;
  --rk-lightbox-btn-bg: rgba(99, 102, 241, 0.65);
  --rk-lightbox-btn-bg-hover: rgba(168, 85, 247, 0.85);
  --rk-lightbox-info-bg: linear-gradient(
    transparent,
    rgba(99, 102, 241, 0.55) 60%,
    rgba(168, 85, 247, 0.85)
  );
}
</style>`;

export default function VueLightbox() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Lightbox для Vue</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Повноекранний Lightbox-галерея зображень і відео для Vue 3 на основі{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue-lightbox
          </code>
          .
        </p>
        <a
          href="https://vue-demo.reelkit.dev/image-preview?utm_source=docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          Подивитися демо наживо →
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
                desc: '±2 сусідні слайди завантажуються заздалегідь',
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
                label: 'Слоти з областю видимості',
                desc: '6 налаштовних зон-слотів',
              },
              {
                icon: Layers,
                label: 'v-model',
                desc: 'Двостороння прив’язка v-model:is-open',
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
          code={`npm install @reelkit/vue-lightbox @reelkit/vue lucide-vue-next`}
          language="bash"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          Не забудьте імпортувати стилі:
        </p>
        <CodeBlock
          code={`import '@reelkit/vue-lightbox/styles.css';`}
          language="typescript"
        />
        <Callout type="info" title="Icons" className="mt-4">
          Стандартні елементи керування використовують{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lucide-vue-next
          </code>{' '}
          for icons. If you prefer a different icon library, use the{' '}
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

      <section className="mb-12">
        <Heading level={2} id="basic-usage" className="text-2xl font-bold mb-4">
          Базове використання
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Імпортуйте таблицю стилів і компонент{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            LightboxOverlay
          </code>{' '}
          , а відкриттям і закриттям керуйте через{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            v-model:is-open
          </code>
          .
        </p>
        <Sandbox
          code={basicUsageCode}
          language="vue"
          title="App.vue"
          framework="vue"
          stackblitzDeps={['@reelkit/vue-lightbox']}
          stackblitzExtraDeps={{ 'lucide-vue-next': '>=0.460.0' }}
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="scoped-slots"
          className="text-2xl font-bold mb-4"
        >
          Слоти з областю видимості
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Шість іменованих слотів з областю видимості дають повністю налаштувати
          поверхні оверлея. Не задавайте слот, щоб лишити вбудований типовий
          вигляд; залиште слот порожнім (наприклад, через{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            v-if="false"
          </code>
          ) to hide that section entirely.
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
        <CodeBlock code={slotsExampleCode} language="vue" />
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
          Слайди-відео вмикаються за бажанням, тож типовий бандл лишається без
          обв’язки для аудіо та відео. Викличте{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            useVideoSlideRenderer(items)
          </code>{' '}
          і передайте повернені <code>VideoSlideRenderer</code> /{' '}
          <code>VideoControlsRenderer</code> в слоти оверлея <code>#slide</code>{' '}
          та <code>#controls</code> . Загорніть оверлей у повернений{' '}
          <code>SoundProvider</code> щоб вбудований перемикач звуку мав
          контекст.
        </p>
        <CodeBlock code={videoOptInCode} language="vue" />
        <Callout type="info" className="mt-4">
          Спільний елемент <code>&lt;video&gt;</code> що живить слайди-відео,
          працює за тим самим патерном, що й reel-плеєр для Vue: на iOS
          відтворення триває між змінами слайдів і не потребує окремого жесту
          користувача на кожному.
        </Callout>
      </section>

      <section className="mb-12">
        <Heading level={2} id="fullscreen" className="text-2xl font-bold mb-4">
          Повний екран
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Використовуйте{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            useFullscreen
          </code>{' '}
          from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/vue
          </code>{' '}
          щоб стежити за станом повного екрана для елемента за посиланням або
          перемикати його. Вбудована кнопка повного екрана в Lightbox працює
          через той самий композабл.
        </p>
        <CodeBlock code={fullscreenCode} language="vue" />
      </section>

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
            LightboxUrlOverlay
          </code>{' '}
          as{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            controller
          </code>
          , and the address bar owns the gallery: it opens itself when the
          parameter names a slide and closes when the parameter goes away. Links
          are shareable, and the back button closes the gallery. It is a
          separate component from{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            LightboxOverlay
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
          «Назад» закриває лише тоді, коли ви відкрили галерею всередині
          застосунку — посилання додало запис, тож «назад» повертає до галереї.
          За надісланим посиланням у новій вкладці історії позаду немає, тож
          кнопка «назад» виведе із сайту; кнопка закриття або Escape прибирає
          параметр на місці й лишає вас у галереї.
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { LightboxUrlOverlay, type LightboxItem } from '@reelkit/vue-lightbox';
import { useOverlayUrlState, urlIndexKey, urlStableIdKey } from '@reelkit/vue';
import '@reelkit/vue-lightbox/styles.css';

const props = defineProps<{ images: LightboxItem[] }>();

const photo = useOverlayUrlState({
  param: 'photo',
  ...urlIndexKey(() => props.images.length),
});
</script>

<template>
  <!-- Opening is a link — the href is the open action. No open flag, no
       handler: the overlay reads the URL and opens itself. -->
  <RouterLink v-for="(img, i) in props.images" :key="img.src" :to="\`?photo=\${i}\`">
    <img :src="img.src" />
  </RouterLink>

  <LightboxUrlOverlay :controller="photo" :items="props.images" />
</template>`}
          language="vue"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          Композабл приймає один об’єкт опцій і повертає{' '}
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
            to="/uk/docs/vue/api#useoverlayurlstate"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            довіднику API для Vue
          </Link>
          .
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            LightboxUrlOverlay
          </code>{' '}
          приймає лише{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            :controller
          </code>{' '}
          (обов’язково),{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @close
          </code>{' '}
          emit, а також усі візуальні та поведінкові пропси, які передає далі{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            LightboxOverlay
          </code>{' '}
          forwards ({''}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            items
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            transition-fn
          </code>
          , the scoped slots, and so on) — but no{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            is-open
          </code>
          .
        </p>
        <ul className="mt-4 mb-4 list-disc pl-6 space-y-1 text-slate-600 dark:text-slate-400">
          <li>
            Відкриття коштує одного запису в історії; гортання слайдів замінює
            його, тож сто свайпів не додають жодного — один крок назад завжди
            виходить із галереї.
          </li>
          <li>
            Надіслане посилання на кшталт{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              ?photo=3
            </code>{' '}
            відкриває галерею на цьому слайді. Параметр, який не називає жодного
            слайда, прибирається з URL, а не наполягає на слайді, що не
            відкриється.
          </li>
        </ul>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          <strong>У застосунку з роутером передайте адаптер.</strong> Прямий
          запис в історію лишає власне місцеположення роутера застарілим, і
          наступна навігація втрачає параметр.
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { useVueRouterUrlAdapter } from '@reelkit/vue/vue-router-url-adapter';

const adapter = useVueRouterUrlAdapter();
const photo = useOverlayUrlState({
  param: 'photo',
  adapter,
  ...urlIndexKey(() => images.length),
});
</script>

<template>
  <LightboxUrlOverlay :controller="photo" :items="images" />
</template>`}
          language="vue"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          <strong>Стабільні посилання.</strong> Індекс адресує за позицією, тож
          закладка відкриє інше зображення, щойно список перевпорядкують.{' '}
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
          code={`<script setup lang="ts">
const photo = useOverlayUrlState({
  param: 'photo',
  ...urlStableIdKey({ items: () => images }),
});
</script>

<template>
  <LightboxUrlOverlay :controller="photo" :items="images" />
</template>`}
          language="vue"
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
          самі:{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            codec
          </code>{' '}
          записує ідентичність в URL,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locator
          </code>{' '}
          знаходить, де воно тепер лежить.
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
const photo = useOverlayUrlState({
  param: 'photo',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => images.findIndex((x) => x.slug === id),
    identify: (index) => images[index].slug,
  },
});
</script>

<template>
  <LightboxUrlOverlay :controller="photo" :items="images" />
</template>`}
          language="vue"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          <strong>Нескінченні та посторінкові галереї.</strong>{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locate
          </code>{' '}
          синхронний, тож відповідає лише за вже завантажені елементи —
          надіслане посилання на зображення 400 у стрічці, де завантажено 20,
          нічого не знайде.{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locateAsync
          </code>{' '}
          — запасний варіант, що викликається лише коли не знайшлося: завантажте
          потрібні сторінки й поверніть індекс, який ця ідентичність отримала.
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
          code={`<script setup lang="ts">
const photo = useOverlayUrlState({
  param: 'photo',
  codec: { decode: (raw) => raw, encode: (id) => id },
  locator: {
    locate: (id) => items.value.findIndex((x) => x.id === id),
    identify: (index) => items.value[index].id,
    locateAsync: async (id) => {
      const loaded = await loadById(id); // or loadUntil(id) — fetch just that one, or page up to it
      if (!loaded) return null; // exhausted — link names no item
      items.value = loaded; // commit; the overlay renders from this
      return loaded.findIndex((x) => x.id === id); // wherever it landed
    },
  },
});
</script>

<template>
  <LightboxUrlOverlay :controller="photo" :items="items" />
</template>`}
          language="vue"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          Поки він у процесі, Lightbox лишається закритим, а параметр —
          недоторканим, тож пряме посилання переживає запит.{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            null
          </code>{' '}
          або відмова прибирає параметр. Відповідь, що приходить після зміни
          URL, після закриття або після демонтажу, відкидається, тож повільний
          запит не відкриє слайд, якого ніхто не просив. Те, що він повертає, є
          остаточним: це індекс щойно завантажених даних, і Lightbox бере його
          як є, не перечитуючи{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            items
          </code>
          , which Vue has not re-rendered yet.
        </p>
      </section>

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
          className="text-xl font-semibold mb-3"
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
            is-open
          </code>
          , and replaces it with a{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            controller
          </code>
          . Він видає{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            close
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            slide-change
          </code>{' '}
          та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            api-ready
          </code>
          , but no{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            update:is-open
          </code>
          .{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            initial-index
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
          id="lightboxoverlay-events"
          className="text-xl font-semibold mt-8 mb-3"
        >
          Події LightboxOverlay
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
              {lightboxEvents.map((e) => (
                <tr
                  key={e.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {e.name}
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
              {lightboxItemFields.map((f) => (
                <tr
                  key={f.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {f.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {f.type}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-sm">
                    {f.required ? 'yes' : 'no'}
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

      <section className="mb-12">
        <Heading
          level={2}
          id="slot-scope-types"
          className="text-2xl font-bold mb-4"
        >
          Типи області видимості слотів
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
              {scopeTypes.map((s) => (
                <tr
                  key={s.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {s.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {s.fields}
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
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            TransitionTransformFn
          </code>{' '}
          via the{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            transition-fn
          </code>{' '}
          Якщо імпортувати лише той перехід, який використовуєте, решту збирач
          прибере через tree-shaking. Типово —{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            slideTransition
          </code>{' '}
          , коли не задано.
        </p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Function</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
              </tr>
            </thead>
            <tbody>
              {transitions.map((t) => (
                <tr
                  key={t.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {t.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {t.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CodeBlock code={customTransitionCode} language="vue" />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="content-loading-amp-error-handling"
          className="text-2xl font-bold mb-4"
        >
          Завантаження вмісту та обробка помилок
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Коли ви берете рендеринг на себе через слот{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slide
          </code>{' '}
          , в області слота доступні три колбеки життєвого циклу, щоб
          повідомляти стан завантаження. Lightbox стежить за станом кожного
          слайда й показує індикатор або значок помилки. Попереднє завантаження
          кешує зіпсовані URL, тож повторний перехід до невдалого слайда
          обходиться без нової спроби.
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
          id="wiring-callbacks-in-slide"
          className="text-xl font-semibold mt-6 mb-4"
        >
          Підключення колбеків у #slide
        </Heading>
        <CodeBlock code={lifecycleSlideCode} language="vue" />

        <Heading
          level={3}
          id="custom-loading-slot"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Власний слот завантаження
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Скористайтеся пропсом <code>#loading</code> щоб замінити стандартний
          індикатор.
        </p>
        <CodeBlock code={customLoadingCode} language="vue" />

        <Heading
          level={3}
          id="custom-error-slot"
          className="text-xl font-semibold mt-8 mb-4"
        >
          Власний слот помилки
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Скористайтеся пропсом <code>#error</code> щоб замінити стандартний
          значок зіпсованого зображення.
        </p>
        <CodeBlock code={customErrorCode} language="vue" />
      </section>

      <section className="mb-12">
        <Heading level={2} id="css-classes" className="text-2xl font-bold mb-4">
          Класи CSS
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Усі класи CSS звичайні (не scoped), тож їх можна перекрити селекторами
          вищої специфічності в таблиці стилів, підключеній після{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue-lightbox/styles.css
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
        <div className="overflow-x-auto">
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

      <section className="mb-12">
        <Heading level={2} id="theming" className="text-2xl font-bold mb-4">
          Theming
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Перевизначайте будь-яку власну властивість CSS{' '}
          <code>--rk-lightbox-*</code> на <code>:root</code> (або на будь-якому
          предку <code>.rk-lightbox-overlay</code>) to retheme. Direct
          declarations on <code>.rk-lightbox-overlay</code> перекрив би
          успадковані значення, тож тримайте перевизначення на селекторі предка.
        </p>
        <div className="overflow-x-auto mb-4">
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
        <CodeBlock code={themingCode} language="css" />
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
          виведений із позиції (наприклад, «Зображення 2 з 5»).
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
            @reelkit/vue
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
