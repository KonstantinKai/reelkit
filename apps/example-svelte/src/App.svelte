<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Reel, ReelIndicator } from '@reelkit/svelte';

  const TOTAL_SLIDES = 10000;

  // Generate color from index using HSL for nice variety
  function getSlideColor(index: number): string {
    const hue = (index * 37) % 360; // Golden angle for good distribution
    return `hsl(${hue}, 70%, 65%)`;
  }

  // Generate slide content from index
  function getSlideContent(index: number) {
    return {
      title: `Slide ${index + 1}`,
      description: index === 0
        ? 'Swipe up or down to navigate'
        : `Item #${index + 1} of ${TOTAL_SLIDES.toLocaleString()}`,
    };
  }

  let activeIndex = $state(0);
  let size = $state<[number, number]>([
    typeof window !== 'undefined' ? window.innerWidth : 800,
    typeof window !== 'undefined' ? window.innerHeight : 600,
  ]);
  let goToValue = $state('');

  // Reference to slider for calling methods
  let sliderRef: {
    next: () => Promise<void>;
    prev: () => Promise<void>;
    goTo: (index: number, animate?: boolean) => Promise<void>;
    adjust: () => void;
  } | undefined = $state();

  function handleResize() {
    size = [window.innerWidth, window.innerHeight];
    sliderRef?.adjust();
  }

  function handleIndexChange(index: number) {
    activeIndex = index;
  }

  function handlePrev() {
    sliderRef?.prev();
  }

  function handleNext() {
    sliderRef?.next();
  }

  function handleGoTo() {
    const index = parseInt(goToValue, 10) - 1;
    if (index >= 0 && index < TOTAL_SLIDES) {
      sliderRef?.goTo(index, true);
    }
  }

  function handleGoToKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleGoTo();
    }
  }

  function handleIndicatorClick(index: number) {
    sliderRef?.goTo(index, true);
  }

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
    }
  });
</script>

<div style="width: 100vw; height: 100vh; overflow: hidden;">
  <Reel
    bind:this={sliderRef}
    count={TOTAL_SLIDES}
    {size}
    direction="vertical"
    enableWheel={true}
    onIndexChange={handleIndexChange}
  >
    {#snippet children({ indexes, axisValue })}
      <!-- Container that moves -->
      <div
        style="
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          flex-direction: column;
          transform: translateY({axisValue}px);
          width: 100%;
          height: {indexes.length * size[1]}px;
        "
      >
        <!-- Each slide in the visible range -->
        {#each indexes as dataIndex (dataIndex)}
          <div
            style="
              width: {size[0]}px;
              height: {size[1]}px;
              background-color: {getSlideColor(dataIndex)};
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              flex-shrink: 0;
            "
          >
            <h1 style="font-size: 3rem; font-weight: bold; margin-bottom: 1rem; color: #000;">
              {getSlideContent(dataIndex).title}
            </h1>
            <p style="font-size: 1.25rem; opacity: 0.7; color: #000;">
              {getSlideContent(dataIndex).description}
            </p>
          </div>
        {/each}
      </div>
    {/snippet}
  </Reel>

  <!-- Current position indicator -->
  <div
    style="
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      padding: 8px 16px;
      background-color: rgba(0, 0, 0, 0.5);
      color: white;
      border-radius: 20px;
      font-size: 0.9rem;
      z-index: 10;
    "
  >
    {(activeIndex + 1).toLocaleString()} / {TOTAL_SLIDES.toLocaleString()}
  </div>

  <!-- Go to index control -->
  <div
    style="
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      z-index: 10;
    "
  >
    <input
      type="number"
      min="1"
      max={TOTAL_SLIDES}
      bind:value={goToValue}
      onkeydown={handleGoToKeydown}
      placeholder="Slide #"
      style="
        padding: 12px 16px;
        font-size: 1rem;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        border: none;
        border-radius: 8px;
        width: 100px;
        outline: none;
      "
    />
    <button
      onclick={handleGoTo}
      style="
        padding: 12px 24px;
        font-size: 1rem;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
      "
    >
      Go
    </button>
  </div>

  <!-- Navigation buttons -->
  <div
    style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      z-index: 10;
    "
  >
    <button
      onclick={handlePrev}
      style="
        padding: 10px 20px;
        border-radius: 8px;
        border: none;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        cursor: pointer;
      "
    >
      ↑ Previous
    </button>
    <button
      onclick={handleNext}
      style="
        padding: 10px 20px;
        border-radius: 8px;
        border: none;
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        cursor: pointer;
      "
    >
      Next ↓
    </button>
  </div>

  <!-- Indicator -->
  <div
    style="
      position: fixed;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
    "
  >
    <ReelIndicator
      count={TOTAL_SLIDES}
      {activeIndex}
      direction="vertical"
      visible={4}
      radius={4}
      gap={6}
      onClick={handleIndicatorClick}
    />
  </div>
</div>
