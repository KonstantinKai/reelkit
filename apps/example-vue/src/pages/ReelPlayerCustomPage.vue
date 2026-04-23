<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watch,
  type PropType,
} from 'vue';
import {
  ReelPlayerOverlay,
  CloseButton,
  SoundButton,
  type ContentItem,
} from '@reelkit/vue-reel-player';
import '@reelkit/vue-reel-player/styles.css';
import { cdnUrl, generateContent, getContentItem } from '@reelkit/example-data';
import { toVueRef, type Disposer, type TimelineController } from '@reelkit/vue';

type DemoId =
  | 'custom-overlay'
  | 'custom-controls'
  | 'custom-slide'
  | 'custom-nested-nav'
  | 'custom-timeline'
  | 'infinity'
  | 'custom-loading-error'
  | 'theming';

const _kContentCount = 10;
const _kInfinityBatch = 20;
const _kInfinityMax = 1000;
const _kInfinityThreshold = 5;

const DEMOS: { id: DemoId; title: string; description: string }[] = [
  {
    id: 'custom-overlay',
    title: 'Custom Slide Overlay',
    description:
      'Uses the #slideOverlay slot to replace the default overlay with a custom branded UI.',
  },
  {
    id: 'custom-controls',
    title: 'Custom Controls',
    description:
      'Uses #controls with CloseButton + SoundButton sub-components and a custom Share button. Slide overlay is hidden via empty #slideOverlay.',
  },
  {
    id: 'custom-slide',
    title: 'Custom Slide (#slide)',
    description:
      'Uses #slide to inject a CTA card on the last slide. Other slides fall back to default via <component :is="defaultContent" />.',
  },
  {
    id: 'custom-nested-nav',
    title: 'Custom Nested Navigation',
    description:
      'Uses #nestedNavigation to replace the default left/right arrows inside multi-media slides with custom pill-shaped buttons.',
  },
  {
    id: 'custom-timeline',
    title: 'Custom Timeline (#timeline)',
    description:
      'Replaces the built-in playback bar with a custom scrub + timecode via the dedicated #timeline slot. Gating (auto/always/never + min duration) still applies. Reuses the built-in .rk-reel-timeline slot class for safe-area handling and scopes a CSS override to reserve room for the taller bar.',
  },
  {
    id: 'infinity',
    title: 'Infinity (Lazy Load)',
    description:
      'Loads content in batches of 20 as you scroll. Uses @slide-change to detect proximity to the end and appends more items, up to 1,000 total.',
  },
  {
    id: 'custom-loading-error',
    title: 'Custom Loading / Error',
    description:
      'Uses #loading and #error slots to replace the default wave loader and error icon. Includes a broken image slide.',
  },
  {
    id: 'theming',
    title: 'Themed via CSS Tokens',
    description:
      'Rebrands the overlay by overriding --rk-reel-* CSS custom properties in a stylesheet. No component code changes.',
  },
];

const activeDemo = ref<DemoId | null>(null);

const content = computed<ContentItem[]>(() => generateContent(_kContentCount));

function getMultiMediaFirstContent(count: number): ContentItem[] {
  const all = generateContent(count + 20);
  const multi = all.filter((c) => c.media.length > 1);
  const single = all.filter((c) => c.media.length === 1);
  return [...multi, ...single].slice(0, count);
}

const nestedNavContent = computed<ContentItem[]>(() =>
  getMultiMediaFirstContent(_kContentCount),
);

function generateInfinityBatch(start: number, count: number): ContentItem[] {
  const batch: ContentItem[] = [];
  for (let i = start; i < start + count && i < _kInfinityMax; i++) {
    const item = getContentItem(i);
    batch.push({
      ...item,
      id: `infinity-${i}`,
      media: item.media.map((m, mi) => ({ ...m, id: `infinity-${i}-${mi}` })),
    });
  }
  return batch;
}

const infinityContent = shallowRef<ContentItem[]>(
  generateInfinityBatch(0, _kInfinityBatch),
);
const infinityLoaded = ref(_kInfinityBatch);
const infinityIndex = ref(0);
const infinityLoading = ref(false);

const handleInfinitySlideChange = (index: number) => {
  infinityIndex.value = index;
  const loaded = infinityLoaded.value;
  if (loaded >= _kInfinityMax) return;
  if (index < loaded - _kInfinityThreshold) return;

  infinityLoaded.value = loaded + _kInfinityBatch;
  infinityLoading.value = true;

  setTimeout(() => {
    const batch = generateInfinityBatch(loaded, _kInfinityBatch);
    infinityContent.value = [...infinityContent.value, ...batch];
    infinityLoading.value = false;
  }, 2000);
};

const lossErrorContent = computed<ContentItem[]>(() => {
  const items = content.value;
  return [
    ...items.slice(0, 2),
    {
      id: 'broken-content',
      media: [
        {
          id: 'broken-img',
          type: 'image' as const,
          src: 'https://broken.invalid/does-not-exist.jpg',
          aspectRatio: 9 / 16,
        },
      ],
      author: {
        name: 'Error Demo',
        avatar: cdnUrl('samples/avatars/avatar-01.jpg'),
      },
      likes: 0,
      description: 'Broken image: shows custom error UI.',
    },
    ...items.slice(2, 5),
  ];
});

const _kThemingCss = `
  .rk-reel-overlay {
    --rk-reel-overlay-bg: #0f172a;
    --rk-reel-button-bg: rgba(99, 102, 241, 0.55);
    --rk-reel-button-bg-hover-strong: rgba(168, 85, 247, 0.85);
    --rk-reel-button-size: 52px;
    --rk-reel-edge-padding: 24px;
    --rk-reel-slide-overlay-bg: linear-gradient(
      transparent,
      rgba(99, 102, 241, 0.55) 60%,
      rgba(168, 85, 247, 0.85)
    );
    --rk-reel-slide-overlay-name-color: #fef3c7;

    /* Timeline bar: warm orange sits outside the purple/indigo gradient
       so the fill + cursor stay readable. Dark-slate track grounds it. */
    --rk-reel-timeline-track: rgba(15, 23, 42, 0.55);
    --rk-reel-timeline-buffered: rgba(251, 146, 60, 0.4);
    --rk-reel-timeline-fill: #fb923c;
    --rk-reel-timeline-cursor: #fb923c;
    --rk-reel-timeline-height: 4px;
    --rk-reel-timeline-height-active: 8px;
    --rk-reel-timeline-cursor-width-active: 18px;
    --rk-reel-timeline-transition: 0.2s ease-out;
  }
`;

const _kCustomTimelineCss = `
  /* The custom timeline is taller than the built-in track, so reserve
     extra bottom space in the slide caption and lift the multi-media
     indicator above it. Scoped to this overlay demo. */
  .rk-reel-overlay {
    --rk-reel-slide-overlay-padding: 48px 16px 64px;
  }
  .rk-reel-overlay .rk-reel-nested-indicator {
    bottom: 56px;
  }
  /* Desktop gets 8px of breathing room below the track. Touch devices
     stack that onto the built-in safe-area + 12px floor. */
  .rk-custom-timeline {
    padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 8px);
  }
  @media (hover: none) and (pointer: coarse) {
    .rk-custom-timeline {
      padding-bottom: calc(max(env(safe-area-inset-bottom, 0px), 12px) + 8px);
    }
  }
`;

let themingStyleEl: HTMLStyleElement | null = null;
let customTimelineStyleEl: HTMLStyleElement | null = null;
const mountStyle = (css: string): HTMLStyleElement => {
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
  return el;
};
watch(activeDemo, (next) => {
  if (next === 'theming' && !themingStyleEl) {
    themingStyleEl = mountStyle(_kThemingCss);
  } else if (next !== 'theming' && themingStyleEl) {
    themingStyleEl.remove();
    themingStyleEl = null;
  }
  if (next === 'custom-timeline' && !customTimelineStyleEl) {
    customTimelineStyleEl = mountStyle(_kCustomTimelineCss);
  } else if (next !== 'custom-timeline' && customTimelineStyleEl) {
    customTimelineStyleEl.remove();
    customTimelineStyleEl = null;
  }
});
onUnmounted(() => {
  themingStyleEl?.remove();
  themingStyleEl = null;
  customTimelineStyleEl?.remove();
  customTimelineStyleEl = null;
});

const fmtTime = (s: number): string => {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${sec}`;
};

/**
 * Inline demo component: a custom scrub bar driven by the `timelineState`
 * signals exposed through the overlay's `#timeline` slot.
 */
const CustomTimelineBar = defineComponent({
  name: 'CustomTimelineBar',
  props: {
    timelineState: {
      type: Object as PropType<TimelineController>,
      required: true as const,
    },
  },
  setup(props) {
    const trackRef = shallowRef<HTMLDivElement | null>(null);
    let disposeInteractions: Disposer | null = null;

    const duration = toVueRef(props.timelineState.duration);
    const currentTime = toVueRef(props.timelineState.currentTime);
    const progress = toVueRef(props.timelineState.progress);
    const scrubbing = toVueRef(props.timelineState.isScrubbing);

    onMounted(() => {
      if (trackRef.value) {
        disposeInteractions = props.timelineState.bindInteractions(
          trackRef.value,
        );
      }
    });
    onBeforeUnmount(() => {
      disposeInteractions?.();
      disposeInteractions = null;
    });

    return () =>
      h(
        'div',
        {
          class: 'rk-reel-timeline rk-custom-timeline',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            paddingLeft: '16px',
            paddingRight: '16px',
            color: '#fff',
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
          },
        },
        [
          h(
            'div',
            {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              },
            },
            [
              h('span', {}, fmtTime(currentTime.value)),
              h('span', { style: { opacity: 0.7 } }, fmtTime(duration.value)),
            ],
          ),
          h(
            'div',
            {
              ref: (el: unknown) => {
                trackRef.value = (el as HTMLDivElement | null) ?? null;
              },
              role: 'slider',
              'aria-label': 'Seek',
              'aria-valuemin': 0,
              'aria-valuemax': Number.isFinite(duration.value)
                ? duration.value
                : 0,
              'aria-valuenow': currentTime.value,
              tabindex: 0,
              style: {
                position: 'relative',
                height: scrubbing.value ? '10px' : '6px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'height 0.15s ease-out',
              },
            },
            [
              h('div', {
                style: {
                  position: 'absolute',
                  inset: 0,
                  width: `${progress.value * 100}%`,
                  borderRadius: '999px',
                  background:
                    'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)',
                  pointerEvents: 'none',
                },
              }),
            ],
          ),
        ],
      );
  },
});

const closePlayer = () => {
  activeDemo.value = null;
  if (infinityLoaded.value !== _kInfinityBatch) {
    infinityContent.value = generateInfinityBatch(0, _kInfinityBatch);
    infinityLoaded.value = _kInfinityBatch;
    infinityIndex.value = 0;
    infinityLoading.value = false;
  }
};
</script>

<template>
  <div class="page">
    <div class="container">
      <h1>Custom Reel Player</h1>
      <p class="subtitle">
        Demonstrates scoped-slot customization: overlays, controls, and custom
        slides.
      </p>

      <div class="grid">
        <div v-for="demo in DEMOS" :key="demo.id" class="card">
          <h2>{{ demo.title }}</h2>
          <p>{{ demo.description }}</p>
          <button
            :data-testid="`demo-${demo.id}-open`"
            @click="activeDemo = demo.id"
          >
            Open Demo
          </button>
        </div>
      </div>
    </div>

    <!-- Demo 1: Custom Slide Overlay -->
    <ReelPlayerOverlay
      v-if="activeDemo === 'custom-overlay'"
      :is-open="true"
      :content="content"
      :initial-index="0"
      @close="closePlayer"
    >
      <template #slideOverlay="{ item }">
        <div class="custom-overlay" data-testid="custom-overlay">
          <div class="custom-overlay-name">
            {{ item.author.name }}
          </div>
          <div class="custom-overlay-desc">
            {{ item.description }}
          </div>
        </div>
      </template>
    </ReelPlayerOverlay>

    <!-- Demo 2: Custom Controls -->
    <ReelPlayerOverlay
      v-if="activeDemo === 'custom-controls'"
      :is-open="true"
      :content="content"
      :initial-index="0"
      @close="closePlayer"
    >
      <template #slideOverlay>
        <span />
      </template>
      <template #controls="{ onClose }">
        <CloseButton :on-click="onClose" />
        <SoundButton />
        <button
          class="custom-share-btn"
          data-testid="custom-share-btn"
          aria-label="Share"
        >
          ↗
        </button>
      </template>
    </ReelPlayerOverlay>

    <!-- Demo 3: Custom Slide (CTA on last) -->
    <ReelPlayerOverlay
      v-if="activeDemo === 'custom-slide'"
      :is-open="true"
      :content="content"
      :initial-index="0"
      @close="closePlayer"
    >
      <template #slide="{ index, size, onReady }">
        <div
          v-if="index === content.length - 1"
          :ref="() => onReady()"
          class="cta-slide"
          data-testid="cta-slide"
          :style="{ width: `${size[0]}px`, height: `${size[1]}px` }"
        >
          <div class="cta-inner">
            <h2>Follow for more!</h2>
            <button class="cta-btn">Subscribe</button>
          </div>
        </div>
      </template>
    </ReelPlayerOverlay>

    <!-- Demo 4: Custom Nested Navigation -->
    <ReelPlayerOverlay
      v-if="activeDemo === 'custom-nested-nav'"
      :is-open="true"
      :content="nestedNavContent"
      :initial-index="0"
      @close="closePlayer"
    >
      <template #nestedNavigation="{ activeIndex, count, onPrev, onNext }">
        <div class="nested-nav-bar" data-testid="custom-nested-nav">
          <button
            data-testid="custom-nested-prev"
            :disabled="activeIndex === 0"
            aria-label="Previous"
            @click="onPrev"
          >
            Prev
          </button>
          <span data-testid="custom-nested-counter" class="nested-nav-counter">
            {{ activeIndex + 1 }} / {{ count }}
          </span>
          <button
            data-testid="custom-nested-next"
            :disabled="activeIndex === count - 1"
            aria-label="Next"
            @click="onNext"
          >
            Next
          </button>
        </div>
      </template>
    </ReelPlayerOverlay>

    <!-- Demo 5: Infinity (Lazy Load) -->
    <template v-if="activeDemo === 'infinity'">
      <ReelPlayerOverlay
        :is-open="true"
        :content="infinityContent"
        :initial-index="0"
        @close="closePlayer"
        @slide-change="handleInfinitySlideChange"
      >
        <template #slideOverlay>
          <span />
        </template>
      </ReelPlayerOverlay>
      <div class="infinity-counter">
        {{ infinityIndex + 1 }} / {{ infinityContent.length }}
      </div>
      <div v-if="infinityLoading" class="infinity-loader">
        <div class="spinner" />
        Loading more…
      </div>
    </template>

    <!-- Demo: Custom Timeline via #timeline slot -->
    <ReelPlayerOverlay
      v-if="activeDemo === 'custom-timeline'"
      :is-open="true"
      :content="content"
      :initial-index="0"
      timeline="always"
      @close="closePlayer"
    >
      <template #timeline="{ timelineState }">
        <CustomTimelineBar :timeline-state="timelineState" />
      </template>
    </ReelPlayerOverlay>

    <!-- Demo 7: Themed via CSS Tokens -->
    <ReelPlayerOverlay
      v-if="activeDemo === 'theming'"
      :is-open="true"
      :content="content"
      :initial-index="0"
      timeline="always"
      @close="closePlayer"
    />

    <!-- Demo 6: Custom Loading / Error -->
    <ReelPlayerOverlay
      v-if="activeDemo === 'custom-loading-error'"
      :is-open="true"
      :content="lossErrorContent"
      :initial-index="0"
      @close="closePlayer"
    >
      <template #loading="{ activeIndex }">
        <div class="custom-loading">
          <div class="spinner" />
          Loading slide {{ activeIndex + 1 }}...
        </div>
      </template>
      <template #error="{ activeIndex }">
        <div class="custom-error">
          <div class="custom-error-icon">⚠️</div>
          <div>Slide {{ activeIndex + 1 }} failed to load</div>
        </div>
      </template>
    </ReelPlayerOverlay>
  </div>
</template>

<style scoped>
.page {
  min-height: 100dvh;
  background-color: #111;
  padding: 56px 16px 16px;
  color: #fff;
}
.container {
  max-width: 900px;
  margin: 0 auto;
}
h1 {
  font-size: 1.5rem;
  margin-bottom: 8px;
  font-weight: 500;
}
.subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 32px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.card {
  background-color: #1a1a1a;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card h2 {
  font-size: 1.1rem;
  font-weight: 500;
}
.card p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  line-height: 1.5;
  flex: 1;
}
.card button {
  padding: 10px 20px;
  background-color: #fff;
  color: #000;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
}

/* Demo 1: Custom Overlay */
.custom-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 48px 16px 16px;
  background: linear-gradient(transparent, rgba(100, 50, 200, 0.8));
  color: #fff;
  pointer-events: none;
  z-index: 5;
}
.custom-overlay-name {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}
.custom-overlay-desc {
  font-size: 13px;
  opacity: 0.9;
}

/* Demo 2: Custom Share Button */
.custom-share-btn {
  position: absolute;
  bottom: 64px;
  right: 16px;
  z-index: 10;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

/* Demo 3: CTA Slide */
.cta-slide {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  text-align: center;
}
.cta-inner h2 {
  font-size: 24px;
  margin-bottom: 12px;
}
.cta-btn {
  padding: 12px 32px;
  border-radius: 24px;
  border: 2px solid #fff;
  background-color: transparent;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}

/* Demo 4: Custom Nested Nav */
.nested-nav-bar {
  position: absolute;
  bottom: 48px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 10;
  pointer-events: none;
}
.nested-nav-bar button {
  pointer-events: auto;
  padding: 6px 16px;
  border-radius: 16px;
  border: none;
  background-color: rgba(255, 255, 255, 0.8);
  color: #000;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.nested-nav-bar button:disabled {
  background-color: rgba(255, 255, 255, 0.2);
  color: #999;
  cursor: default;
}
.nested-nav-counter {
  pointer-events: auto;
  padding: 6px 12px;
  border-radius: 16px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
}

/* Demo 5: Infinity overlays */
.infinity-counter {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 9999;
  padding: 4px 10px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
}
.infinity-loader {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-radius: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
}

/* Spinner shared between demos 5 and 6 */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Demo 6: Custom Loading / Error */
.custom-loading {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  gap: 8px;
}
.custom-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  color: #ff6b6b;
  text-align: center;
}
.custom-error-icon {
  font-size: 48px;
  margin-bottom: 8px;
}
</style>
