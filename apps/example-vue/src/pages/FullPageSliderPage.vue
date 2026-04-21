<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  Reel,
  ReelIndicator,
  useBodyLock,
  type ReelExpose,
} from '@reelkit/vue';

const TOTAL_SLIDES = 10000;
const NESTED_ITEM_COUNT = 10;
const SIZE_MODE_KEY = 'reelkit-fullpage-size-mode';
const INDICATOR_MODE_KEY = 'reelkit-fullpage-indicator-mode';
const NAV_KEYS_KEY = 'reelkit-fullpage-nav-keys';
const WHEEL_KEY = 'reelkit-fullpage-wheel';

type SizeMode = 'explicit' | 'auto';
type IndicatorMode = 'auto' | 'controlled';

const getSlideColor = (index: number): string => {
  const hue = (index * 37) % 360;
  return `hsl(${hue}, 70%, 65%)`;
};

const getSlideContent = (index: number) => ({
  title: `Slide ${index + 1}`,
  description:
    index === 0
      ? 'Swipe up or down to navigate'
      : `Item #${index + 1} of ${TOTAL_SLIDES.toLocaleString()}`,
});

const activeIndex = ref(0);
const sliderRef = ref<ReelExpose | null>(null);
const sizeMode = ref<SizeMode>(
  (localStorage.getItem(SIZE_MODE_KEY) as SizeMode) || 'explicit',
);
const indicatorMode = ref<IndicatorMode>(
  (localStorage.getItem(INDICATOR_MODE_KEY) as IndicatorMode) || 'auto',
);
const navKeys = ref(localStorage.getItem(NAV_KEYS_KEY) !== 'false');
const wheel = ref(localStorage.getItem(WHEEL_KEY) !== 'false');
const size = ref<[number, number]>([window.innerWidth, window.innerHeight]);
const goToValue = ref('');

useBodyLock(true);

const toggleSizeMode = () => {
  const next = sizeMode.value === 'explicit' ? 'auto' : 'explicit';
  localStorage.setItem(SIZE_MODE_KEY, next);
  sizeMode.value = next as SizeMode;
};

const toggleIndicatorMode = () => {
  const next = indicatorMode.value === 'auto' ? 'controlled' : 'auto';
  localStorage.setItem(INDICATOR_MODE_KEY, next);
  indicatorMode.value = next as IndicatorMode;
};

const toggleNavKeys = () => {
  navKeys.value = !navKeys.value;
  localStorage.setItem(NAV_KEYS_KEY, String(navKeys.value));
};

const toggleWheel = () => {
  wheel.value = !wheel.value;
  localStorage.setItem(WHEEL_KEY, String(wheel.value));
};

const sizeLabel = computed(() =>
  sizeMode.value === 'explicit'
    ? `[${size.value[0]}, ${size.value[1]}]`
    : 'auto',
);

const handleResize = () => {
  size.value = [window.innerWidth, window.innerHeight];
  sliderRef.value?.adjust();
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const handleAfterChange = (index: number) => {
  activeIndex.value = index;
};

const handleGoTo = () => {
  const index = parseInt(goToValue.value, 10) - 1;
  if (index >= 0 && index < TOTAL_SLIDES) {
    sliderRef.value?.goTo(index, true);
  }
};

const handleGoToBlur = () => {
  window.scrollTo(0, 0);
  sliderRef.value?.adjust();
};

const pillStyle = {
  padding: '6px 12px',
  backgroundColor: 'rgba(0,0,0,0.5)',
  color: '#fff',
  border: 'none',
  borderRadius: '20px',
  fontSize: '0.75rem',
  cursor: 'pointer',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
};

const pillStyleOff = {
  ...pillStyle,
  backgroundColor: 'rgba(255,0,0,0.4)',
};
</script>

<template>
  <div
    :style="{
      width: '100%',
      height: '100dvh',
      overflow: 'hidden',
      overscrollBehavior: 'none',
    }"
  >
    <Reel
      ref="sliderRef"
      :count="TOTAL_SLIDES"
      v-bind="sizeMode === 'explicit' ? { size } : {}"
      direction="vertical"
      :loop="false"
      :enable-nav-keys="navKeys"
      :enable-wheel="wheel"
      @after-change="handleAfterChange"
    >
      <template #item="{ index, size: slideSize }">
        <!-- Nested horizontal Reel every 3rd slide -->
        <template v-if="index % 3 === 2">
          <Reel
            :count="NESTED_ITEM_COUNT"
            :size="[slideSize[0], slideSize[1]]"
            direction="horizontal"
            :loop="true"
            :enable-nav-keys="navKeys"
            :enable-wheel="wheel"
          >
            <template #item="{ index: nestedIndex, size: nestedSize }">
              <div
                :style="{
                  width: `${nestedSize[0]}px`,
                  height: `${nestedSize[1]}px`,
                  backgroundColor: getSlideColor(
                    index * NESTED_ITEM_COUNT + nestedIndex,
                  ),
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#000',
                }"
              >
                <h1 :style="{ fontSize: '2.5rem', marginBottom: '8px' }">
                  Slide {{ index + 1 }}.{{ nestedIndex + 1 }}
                </h1>
                <p :style="{ fontSize: '1.2rem', opacity: 0.7 }">
                  Swipe left or right
                </p>
              </div>
            </template>

            <!-- Nested horizontal indicator -->
            <div
              :style="{
                position: 'absolute',
                bottom: '160px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
              }"
            >
              <ReelIndicator
                direction="horizontal"
                :visible="4"
                :radius="3"
                :gap="5"
              />
            </div>
          </Reel>
        </template>

        <!-- Regular slide -->
        <template v-else>
          <div
            :style="{
              width: `${slideSize[0]}px`,
              height: `${slideSize[1]}px`,
              backgroundColor: getSlideColor(index),
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#000',
            }"
          >
            <h1 :style="{ fontSize: '3rem', marginBottom: '1rem' }">
              {{ getSlideContent(index).title }}
            </h1>
            <p :style="{ fontSize: '1.5rem', opacity: 0.7 }">
              {{ getSlideContent(index).description }}
            </p>
          </div>
        </template>
      </template>

      <!-- Position counter -->
      <div
        :style="{
          position: 'absolute',
          top: '48px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '6px 14px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: '#fff',
          borderRadius: '20px',
          fontSize: '0.8rem',
          zIndex: 10,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }"
      >
        {{ (activeIndex + 1).toLocaleString() }} /
        {{ TOTAL_SLIDES.toLocaleString() }}
      </div>

      <!-- Right-side toggles -->
      <div
        :style="{
          position: 'absolute',
          top: '48px',
          right: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          zIndex: 10,
        }"
      >
        <button :style="pillStyle" @click="toggleSizeMode">
          size: {{ sizeLabel }}
        </button>
        <button
          :style="pillStyle"
          data-testid="indicator-mode-toggle"
          @click="toggleIndicatorMode"
        >
          indicator: {{ indicatorMode }}
        </button>
        <button
          :style="navKeys ? pillStyle : pillStyleOff"
          @click="toggleNavKeys"
        >
          navKeys: {{ navKeys ? 'on' : 'off' }}
        </button>
        <button :style="wheel ? pillStyle : pillStyleOff" @click="toggleWheel">
          wheel: {{ wheel ? 'on' : 'off' }}
        </button>
      </div>

      <!-- Bottom controls -->
      <div
        :style="{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          zIndex: 10,
        }"
      >
        <!-- Go to control -->
        <div :style="{ display: 'flex', gap: '8px' }">
          <input
            v-model="goToValue"
            type="number"
            :min="1"
            :max="TOTAL_SLIDES"
            placeholder="Slide #"
            :style="{
              padding: '10px 14px',
              fontSize: '0.9rem',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              width: '90px',
              outline: 'none',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }"
            @keydown.enter="handleGoTo"
            @blur="handleGoToBlur"
          />
          <button
            :style="{
              padding: '10px 20px',
              fontSize: '0.9rem',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }"
            @click="handleGoTo"
          >
            Go
          </button>
        </div>

        <!-- Navigation buttons -->
        <div :style="{ display: 'flex', gap: '10px' }">
          <button
            :style="{
              padding: '10px 20px',
              fontSize: '0.9rem',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }"
            @click="sliderRef?.prev()"
          >
            &#8593; Previous
          </button>
          <button
            :style="{
              padding: '10px 20px',
              fontSize: '0.9rem',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }"
            @click="sliderRef?.next()"
          >
            Next &#8595;
          </button>
        </div>
      </div>

      <!-- Indicator -->
      <div
        :style="{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
        }"
      >
        <ReelIndicator
          direction="vertical"
          :visible="4"
          :radius="4"
          :gap="6"
          v-bind="
            indicatorMode === 'controlled'
              ? { count: TOTAL_SLIDES, active: activeIndex }
              : {}
          "
          :on-dot-click="(index: number) => sliderRef?.goTo(index, true)"
        />
      </div>
    </Reel>
  </div>
</template>
