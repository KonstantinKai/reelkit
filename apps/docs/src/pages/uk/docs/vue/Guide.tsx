import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../../components/ui/CodeBlock';
import { NextSteps } from '../../../../components/NextSteps';
import { Sandbox } from '../../../../components/ui/Sandbox';
import { FeatureCardGrid } from '../../../../components/ui/FeatureCard';
import {
  ArrowRight,
  Hand,
  Keyboard,
  Layers,
  Navigation,
  Zap,
  MousePointer,
  Infinity as InfinityIcon,
  Radio,
  Code,
} from 'lucide-react';
import { Heading } from '../../../../components/ui/Heading';
import { ukPageMeta } from '../../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/vue/guide',
    title: 'Посібник для Vue · ReelKit',
    description:
      'ReelKit у Vue 3: компонент Reel, патерн слота #item, імперативний API, режим циклу та колбеки подій.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

export default function VueGuide() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Посібник для Vue</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Дізнайтеся, як будувати слайдери з{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue
          </code>
          .
        </p>
      </div>

      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FeatureCardGrid
            items={[
              {
                icon: Hand,
                label: 'Спершу дотик',
                desc: 'Свайп з інерцією та прилипанням',
              },
              {
                icon: Keyboard,
                label: 'Навігація з клавіатури',
                desc: 'Стрілки + Escape',
              },
              {
                icon: MousePointer,
                label: 'Прокручування колесом',
                desc: 'Необов’язково, з дебаунсом',
              },
              {
                icon: InfinityIcon,
                label: 'Віртуалізований',
                desc: '10 000+ елементів, 3 у DOM',
              },
              {
                icon: Radio,
                label: 'Indicators',
                desc: 'Прокручування точок у стилі Instagram',
              },
              {
                icon: Navigation,
                label: 'Програмний API',
                desc: 'next(), prev(), goTo() через шаблонний ref',
              },
              {
                icon: Zap,
                label: 'Режим циклу',
                desc: 'Нескінченна кругова навігація',
              },
              {
                icon: Layers,
                label: 'Directional',
                desc: 'Вертикально або горизонтально',
              },
              {
                icon: Code,
                label: 'Composition API',
                desc: '<script setup> із композаблами',
              },
            ]}
          />
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="basic-slider"
          className="text-2xl font-bold mb-4"
        >
          Базовий слайдер
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'<Reel>'}
          </code>{' '}
          загортає контролер слайдера з ядра. Використовуйте слот{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #item
          </code>{' '}
          щоб рендерити кожен слайд із віртуалізацією — монтуються лише видимі
          слайди.
        </p>
        <Sandbox
          code={`<script setup lang="ts">
import { Reel, ReelIndicator } from '@reelkit/vue';

const items = [
  { title: 'Virtualized', subtitle: 'Only 3 slides in DOM', color: '#6366f1' },
  { title: 'Touch First', subtitle: 'Native swipe gestures', color: '#8b5cf6' },
  { title: 'Zero Deps', subtitle: 'Tiny bundle size', color: '#7c3aed' },
  { title: 'Keyboard Nav', subtitle: 'Full a11y support', color: '#ec4899' },
  { title: 'SSR Ready', subtitle: 'Works everywhere', color: '#14b8a6' },
  { title: '60fps', subtitle: 'Smooth animations', color: '#f59e0b' },
];

const onAfterChange = (index: number) => {
  console.log('Current index:', index);
};
</script>

<template>
  <Reel
    :count="items.length"
    style="width: 100%; height: 100dvh"
    direction="vertical"
    :enable-wheel="true"
    @after-change="onAfterChange"
  >
    <template #item="{ index, size }">
      <div
        :style="{
          width: size[0] + 'px',
          height: size[1] + 'px',
          background: items[index].color,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }"
      >
        <div style="font-size: 1.5rem; font-weight: bold">
          {{ items[index].title }}
        </div>
        <div style="font-size: 0.875rem; opacity: 0.8">
          {{ items[index].subtitle }}
        </div>
      </div>
    </template>

    <div style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); z-index: 10">
      <ReelIndicator direction="vertical" />
    </div>
  </Reel>
</template>`}
          language="vue"
          title="App.vue"
          framework="vue"
          stackblitzDeps={['@reelkit/vue']}
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="reelindicator"
          className="text-2xl font-bold mb-4"
        >
          ReelIndicator
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Необов’язковий компонент, що показує індикатори прогресу в стилі
          Instagram із поточною позицією в слайдері. Якщо він усередині{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'<Reel>'}
          </code>
          , він сам під’єднується до{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            count
          </code>{' '}
          та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            active
          </code>{' '}
          значення через{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            provide/inject
          </code>{' '}
          у Vue — нічого зв’язувати вручну не треба.
        </p>
        <CodeBlock
          code={`<!-- Auto-connect: count and active are inherited from parent Reel -->
<Reel :count="10" :size="[400, 600]">
  <template #item="{ index, size }"> ... </template>
  <ReelIndicator direction="vertical" />
</Reel>

<!-- Manual usage: pass count and active explicitly (e.g. outside a Reel) -->
<ReelIndicator :count="10" :active="currentIndex" />`}
          language="vue-html"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="imperative-api-template-ref"
          className="text-2xl font-bold mb-4"
        >
          Імперативний API — шаблонний ref
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'<Reel>'}
          </code>{' '}
          надає інтерфейс{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelExpose
          </code>{' '}
          через шаблонний ref. Скористайтеся{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ref()
          </code>{' '}
          щоб зберегти посилання й викликати імперативні методи на кшталт{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            next()
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            prev()
          </code>
          , та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            goTo()
          </code>
          .
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { ref } from 'vue';
import { Reel, type ReelExpose } from '@reelkit/vue';

const items = [
  { title: 'Slide 1', color: '#6366f1' },
  { title: 'Slide 2', color: '#8b5cf6' },
  { title: 'Slide 3', color: '#ec4899' },
];

const sliderRef = ref<ReelExpose | null>(null);
const currentIndex = ref(0);

const onAfterChange = (index: number) => {
  currentIndex.value = index;
};
</script>

<template>
  <Reel
    ref="sliderRef"
    :count="items.length"
    style="width: 100%; height: 100dvh"
    direction="vertical"
    :enable-wheel="true"
    @after-change="onAfterChange"
  >
    <template #item="{ index, size }">
      <div
        :style="{
          width: size[0] + 'px',
          height: size[1] + 'px',
        }"
      >
        {{ items[index].title }}
      </div>
    </template>
  </Reel>

  <div style="position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%)">
    <button
      :disabled="currentIndex === 0"
      @click="sliderRef?.prev()"
    >
      Prev
    </button>
    <button
      :disabled="currentIndex === items.length - 1"
      @click="sliderRef?.next()"
    >
      Next
    </button>
    <button @click="sliderRef?.goTo(2)">Go to 3</button>
  </div>
</template>`}
          language="vue"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="horizontal-direction"
          className="text-2xl font-bold mb-4"
        >
          Горизонтальний напрямок
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Set{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            direction="horizontal"
          </code>{' '}
          для слайдера зі свайпом ліворуч і праворуч. Напрямок індикатора має
          збігатися.
        </p>
        <CodeBlock
          code={`<Reel
  :count="items.length"
  :size="[400, 300]"
  direction="horizontal"
>
  <template #item="{ index, size }">
    <div :style="{ width: size[0] + 'px', height: size[1] + 'px' }">
      {{ items[index].title }}
    </div>
  </template>

  <ReelIndicator direction="horizontal" />
</Reel>`}
          language="vue-html"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="auto-sizing" className="text-2xl font-bold mb-4">
          Auto-sizing
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            size
          </code>{' '}
          необов’язковий. Якщо його не передати,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<Reel>'}
          </code>{' '}
          сам вимірює свій контейнер через{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ResizeObserver
          </code>{' '}
          і підлаштовується під макет, заданий CSS. Розмір контейнера має
          задавати батьківський елемент — наприклад, flex, grid або явні розміри
          в CSS.
        </p>
        <CodeBlock
          code={`<!-- Explicit size (fixed) -->
<Reel :count="items.length" :size="[400, 600]">
  <template #item="{ index, size }"> ... </template>
</Reel>

<!-- Auto-size (responsive — sized by CSS) -->
<Reel :count="items.length" style="width: 100%; height: 100dvh">
  <template #item="{ index, size }"> ... </template>
</Reel>`}
          language="vue-html"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="transitions" className="text-2xl font-bold mb-4">
          Переходи
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Передайте пропс{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            transition
          </code>{' '}
          щоб змінити анімацію слайдів. ReelKit має п’ять переходів, які
          піддаються tree-shaking:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            slideTransition
          </code>{' '}
          (типово),{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            fadeTransition
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            flipTransition
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            cubeTransition
          </code>
          , та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            zoomTransition
          </code>
          .
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { Reel, cubeTransition } from '@reelkit/vue';
</script>

<template>
  <Reel
    :count="items.length"
    :size="[400, 600]"
    :transition="cubeTransition"
  >
    <template #item="{ index, size }"> ... </template>
  </Reel>
</template>`}
          language="vue"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="loop-mode" className="text-2xl font-bold mb-4">
          Режим циклу
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Увімкніть нескінченну кругову навігацію пропсом{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            loop
          </code>{' '}
          . Слайдер безшовно переходить з останнього слайда на перший і навпаки.
        </p>
        <CodeBlock
          code={`<Reel
  :count="items.length"
  :size="[400, 600]"
  :loop="true"
>
  <template #item="{ index, size }"> ... </template>
</Reel>`}
          language="vue-html"
        />
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="event-callbacks"
          className="text-2xl font-bold mb-4"
        >
          Колбеки подій
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'<Reel>'}
          </code>{' '}
          видає кілька подій для відстеження стану слайдера:
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { Reel } from '@reelkit/vue';

const onBeforeChange = (index: number, nextIndex: number, rangeIndex: number) => {
  console.log('Transitioning from', index, 'to', nextIndex);
};

const onAfterChange = (index: number, rangeIndex: number) => {
  console.log('Arrived at slide', index);
};

const onSlideDragStart = (index: number) => {
  console.log('Started dragging slide', index);
};

const onSlideDragEnd = (index: number) => {
  console.log('Stopped dragging slide', index);
};
</script>

<template>
  <Reel
    :count="20"
    style="width: 100%; height: 100dvh"
    @before-change="onBeforeChange"
    @after-change="onAfterChange"
    @slide-drag-start="onSlideDragStart"
    @slide-drag-end="onSlideDragEnd"
  >
    <template #item="{ index, size }"> ... </template>
  </Reel>
</template>`}
          language="vue"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="navigation" className="text-2xl font-bold mb-4">
          Навігація
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Вбудовані способи навігації:
        </p>

        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Дотик / свайп:</strong> Тягніть, щоб гортати — з інерцією
              та прилипанням
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Клавіатура:</strong> Стрілки та Escape
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Колесо миші:</strong> Увімкніть{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                :enable-wheel="true"
              </code>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            <span>
              <strong>Програмно:</strong> Використовуйте шаблонний ref, щоб
              дістатися{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                next()
              </code>
              ,{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                prev()
              </code>
              ,{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                goTo()
              </code>
            </span>
          </li>
        </ul>

        <CodeBlock
          code={`<script setup lang="ts">
import { ref } from 'vue';
import { Reel, type ReelExpose } from '@reelkit/vue';

const sliderRef = ref<ReelExpose | null>(null);
</script>

<template>
  <Reel
    ref="sliderRef"
    :count="10"
    :size="[400, 600]"
  >
    <template #item="{ index, size }">
      <div :style="{ width: size[0] + 'px', height: size[1] + 'px' }">
        Slide {{ index + 1 }}
      </div>
    </template>
  </Reel>

  <button @click="sliderRef?.prev()">Prev</button>
  <button @click="sliderRef?.next()">Next</button>
  <button @click="sliderRef?.goTo(5)">Go to 6</button>
</template>`}
          language="vue"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          Стан в URL
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            useOverlayUrlState
          </code>{' '}
          будує контролер стану в URL для оверлея й повертає його цілком, а ви
          передаєте його в{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<LightboxUrlOverlay>'}
          </code>{' '}
          як його{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            :controller
          </code>{' '}
          . Стан відкриття належить адресному рядку, тож прив’язаний оверлей
          відкривається сам, а посилання — звичайний спосіб його відкрити.
          Перший запис відсутнього параметра додає один запис в історію, кожен
          наступний його замінює, тож гортання ніколи не ховає кнопку «назад».
          Тримайте контролер, щоб читати{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            value
          </code>
          /
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            позицією
          </code>{' '}
          і закривати програмно через{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            set(null)
          </code>
          , the same low-level write the overlay uses internally on slide
          change.
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { LightboxUrlOverlay, type LightboxItem } from '@reelkit/vue-lightbox';
import { useOverlayUrlState, urlIndexKey } from '@reelkit/vue';

const props = defineProps<{ images: LightboxItem[] }>();

const photo = useOverlayUrlState({
  param: 'photo',
  ...urlIndexKey(() => props.images.length),
});
</script>

<template>
  <!-- Opening is a link — the overlay reads the URL and opens itself. -->
  <RouterLink v-for="(img, i) in props.images" :key="img.src" :to="\`?photo=\${i}\`">
    <img :src="img.src" />
  </RouterLink>

  <LightboxUrlOverlay :controller="photo" :items="props.images" />
</template>`}
          language="vue"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          Об’єкт опцій приймає{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            param
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            codec
          </code>
          , та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            locator
          </code>{' '}
          (усі три обов’язкові) плюс необов’язковий{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            adapter
          </code>
          . The{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            codec
          </code>{' '}
          та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            locator
          </code>{' '}
          — узгоджена пара з однаковим{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            Id
          </code>
          , so for a plain{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ?photo=3
          </code>{' '}
          галереї розгортайте{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ...urlIndexKey(() =&gt; props.images.length)
          </code>
          , який повертає обидві половини одразу.{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            urlIndexKey
          </code>{' '}
          зіставляє параметр з індексом слайда й обмежує його живою кількістю,
          яку повертає геттер, тож застарілий або позамежний{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ?photo=99
          </code>{' '}
          відхиляється й сам зникає з URL замість того, щоб відкрити слайд,
          якого ніхто не називав. Передавайте геттер, а не число: у Vue{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            setup
          </code>{' '}
          виконується один раз, тож захоплена довжина застаріла б, поки
          посторінкова стрічка росте. Він загортає{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            createIndexLocator
          </code>{' '}
          (половину-локатор) і поєднує його з{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            indexCodec
          </code>
          . Посторінкова стрічка або галерея з адресацією за ідентичністю
          передає власну узгоджену пару{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            codec
          </code>{' '}
          +{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            locator
          </code>{' '}
          . Повна таблиця опцій — у{' '}
          <Link
            to="/uk/docs/vue/api#useoverlayurlstate"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            довіднику API для Vue
          </Link>
          .
        </p>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="item-slot-pattern"
          className="text-2xl font-bold mb-4"
        >
          Патерн слота #item
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Замість render prop із React у Vue використовується слот{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            #item
          </code>{' '}
          з областю видимості. Саме він дає віртуалізацію: монтуються лише
          видимі слайди. Область слота надає три властивості:
        </p>
        <CodeBlock
          code={`<template #item="{ index, indexInRange, size }">
  <!--
    index        : number          — absolute slide index (0 to count-1)
    indexInRange  : number          — position in visible window (0, 1, or 2)
    size          : [number, number] — [width, height] of the container
  -->
  <MySlide
    :data="items[index]"
    :style="{ width: size[0] + 'px', height: size[1] + 'px' }"
  />
</template>`}
          language="vue-html"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="composables" className="text-2xl font-bold mb-4">
          Composables
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue
          </code>{' '}
          дає композабли для типових сценаріїв з оверлеями:
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { ref } from 'vue';
import { useBodyLock, useFullscreen, useReelContext } from '@reelkit/vue';

// Lock body scroll when an overlay is open
const isOpen = ref(true);
useBodyLock(isOpen);

// Fullscreen API with cross-browser support
const containerRef = ref<HTMLElement | null>(null);
const { isFullscreen, toggle } = useFullscreen({ elementRef: containerRef });

// Access parent Reel context (when inside a Reel)
const reelContext = useReelContext();
// reelContext?.index  — active slide index signal
// reelContext?.count  — total slide count signal
// reelContext?.goTo() — navigate programmatically

// Bridge a core Subscribable into a reactive Vue ref
import { toVueRef } from '@reelkit/vue';
const index = toVueRef(reelContext!.index); // Ref<number> — re-renders on change
</script>`}
          language="vue"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="key-points" className="text-2xl font-bold mb-4">
          Головне
        </Heading>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Composition API
              </strong>
              <p className="text-sm">
                Import{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  Reel
                </code>
                ,{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ReelIndicator
                </code>
                , and composables directly into your{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  {'<script setup>'}
                </code>{' '}
                — реєструвати плагін не потрібно
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                слот #item з областю видимості
              </strong>
              <p className="text-sm">
                Відповідник у Vue для пропса{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  itemBuilder
                </code>{' '}
                із React — дає віртуалізацію звичним синтаксисом шаблонів
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Шаблонний ref
              </strong>
              <p className="text-sm">
                Використовуйте{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  {'ref<ReelExpose>()'}
                </code>{' '}
                для імперативної навігації — колбеки подій не потрібні
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                @after-change
              </strong>
              <p className="text-sm">
                Emits{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  (index, rangeIndex)
                </code>{' '}
                — стежить за поточним індексом для оновлення інтерфейсу
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                контекст provide/inject
              </strong>
              <p className="text-sm">
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ReelIndicator
                </code>{' '}
                сам під’єднується до батьківського{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  Reel
                </code>{' '}
                через provide/inject у Vue — жодного протягування пропсів вручну
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="performance-tips"
          className="text-2xl font-bold mb-4"
        >
          Поради щодо продуктивності
        </Heading>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Тримайте шаблони слайдів легкими
              </strong>
              <p className="text-sm">
                The{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  #item
                </code>{' '}
                виконується для кожного видимого слайда (зазвичай трьох
                одночасно). Уникайте важких обчислень і глибоко вкладених
                структур усередині.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Вантажте дані ближче до краю
              </strong>
              <p className="text-sm">
                Використовуйте{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  @after-change
                </code>{' '}
                щоб помітити наближення до кінця й підвантажити наступний пакет,
                доки слайди не скінчилися — так виходить нескінченна стрічка.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Тримайте імперативний стан у ref
              </strong>
              <p className="text-sm">
                Зберігайте посилання{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ReelExpose
                </code>{' '}
                та поточний індекс у{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  ref()
                </code>
                Vue — це дає точкову реактивність без зайвих перерендерів.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">
                Вимикайте колесо на сторінках із прокручуванням
              </strong>
              <p className="text-sm">
                Set{' '}
                <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                  :enable-wheel="false"
                </code>{' '}
                коли слайдер вбудований у макет із прокручуванням, щоб не
                перехоплювати прокручування сторінки.
              </p>
            </div>
          </li>
        </ul>
      </section>

      <NextSteps
        items={[
          {
            label: 'Довідник API для Vue',
            path: '/docs/vue/api',
            description: 'усі пропси, події та композабли',
          },
          {
            label: 'Посібник з ядра',
            path: '/docs/core/guide',
            description: 'рушій без прив’язки до фреймворку',
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
        ]}
      />
    </div>
  );
}
