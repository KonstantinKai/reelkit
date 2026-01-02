<script lang="ts">
  import { onMount, onDestroy, type Snippet } from 'svelte';
  import {
    createSliderController,
    animate,
    type SliderController,
    type SliderDirection,
    type RangeExtractor,
  } from '@reelkit/core';

  interface Props {
    count: number;
    size: [number, number];
    direction?: SliderDirection;
    initialIndex?: number;
    loop?: boolean;
    transitionDuration?: number;
    swipeDistanceFactor?: number;
    enableGestures?: boolean;
    enableKeyboard?: boolean;
    rangeExtractor?: RangeExtractor;
    onIndexChange?: (index: number) => void;
    children: Snippet<[{ index: number; axisValue: number; indexes: number[] }]>;
  }

  let {
    count,
    size,
    direction = 'vertical',
    initialIndex = 0,
    loop = false,
    transitionDuration = 300,
    swipeDistanceFactor = 0.15,
    enableGestures = true,
    enableKeyboard = true,
    rangeExtractor,
    onIndexChange,
    children,
  }: Props = $props();

  let containerEl: HTMLDivElement | undefined = $state();
  let controller: SliderController | null = null;
  const disposers: (() => void)[] = [];
  let cancelAnimation: (() => void) | null = null;

  // Reactive state for rendering - initialized in onMount from controller
  let index = $state(0);
  let axisValue = $state(0);
  let indexes = $state<number[]>([]);

  // Exposed API
  export function next(): Promise<void> {
    return controller?.next() ?? Promise.resolve();
  }

  export function prev(): Promise<void> {
    return controller?.prev() ?? Promise.resolve();
  }

  export function goTo(targetIndex: number, shouldAnimate = false): Promise<void> {
    return controller?.goTo(targetIndex, shouldAnimate) ?? Promise.resolve();
  }

  export function adjust(): void {
    controller?.adjust();
  }

  onMount(() => {
    if (!containerEl) return;

    const primarySize = direction === 'vertical' ? size[1] : size[0];

    controller = createSliderController(
      {
        count,
        initialIndex,
        direction,
        loop,
        transitionDuration,
        swipeDistanceFactor,
        rangeExtractor,
      },
      {
        onAfterChange: (newIndex: number) => {
          onIndexChange?.(newIndex);
        },
      }
    );

    controller.setPrimarySize(primarySize);
    controller.attach(containerEl);

    if (enableGestures || enableKeyboard) {
      controller.observe();
    }

    // Initialize state from signals
    index = controller.state.index.value;
    axisValue = controller.state.axisValue.value.value;
    indexes = controller.state.indexes.value;

    // Subscribe to state changes
    disposers.push(
      controller.state.index.observe(() => {
        index = controller!.state.index.value;
      })
    );

    disposers.push(
      controller.state.axisValue.observe(() => {
        const { value, duration, done } = controller!.state.axisValue.value;

        // Cancel any in-progress animation
        if (cancelAnimation) {
          cancelAnimation();
          cancelAnimation = null;
        }

        if (duration > 0) {
          // Run animation
          cancelAnimation = animate({
            from: axisValue,
            to: value,
            duration,
            onUpdate: (v) => {
              axisValue = v;
            },
            onComplete: () => {
              cancelAnimation = null;
              // Move done to next task cycle
              setTimeout(() => done?.(), 0);
            },
          });
          return;
        }

        // No animation, just set value immediately
        axisValue = value;
        // Still need to call done if provided
        if (done) {
          setTimeout(() => done(), 0);
        }
      })
    );

    disposers.push(
      controller.state.indexes.observe(() => {
        indexes = controller!.state.indexes.value;
      })
    );

    // Cleanup animation on unmount
    disposers.push(() => {
      if (cancelAnimation) {
        cancelAnimation();
        cancelAnimation = null;
      }
    });
  });

  onDestroy(() => {
    disposers.forEach((d) => d());
    controller?.dispose();
    controller = null;
  });

  // Watch size changes
  $effect(() => {
    const primarySize = direction === 'vertical' ? size[1] : size[0];
    controller?.setPrimarySize(primarySize);
  });
</script>

<div
  bind:this={containerEl}
  style:position="relative"
  style:overflow="hidden"
  style:width="{size[0]}px"
  style:height="{size[1]}px"
  style:touch-action="none"
  style:user-select="none"
>
  {@render children({ index, axisValue, indexes })}
</div>
