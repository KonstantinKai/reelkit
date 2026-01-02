<script lang="ts">
  import { clamp, type SliderDirection } from '@reelkit/core';

  interface Props {
    count: number;
    activeIndex: number;
    direction?: SliderDirection;
    visible?: number;
    radius?: number;
    gap?: number;
    edgeScale?: number;
    activeColor?: string;
    inactiveColor?: string;
    onClick?: (index: number) => void;
  }

  let {
    count,
    activeIndex,
    direction = 'vertical',
    visible = 5,
    radius = 3,
    gap = 4,
    edgeScale = 0.5,
    activeColor = '#fff',
    inactiveColor = 'rgba(255, 255, 255, 0.5)',
    onClick,
  }: Props = $props();

  // Derived values
  const isVertical = $derived(direction === 'vertical');
  const dotSize = $derived(radius * 2);
  const itemSize = $derived(dotSize + gap);

  // Window start - initialized and updated via effect
  let windowStart = $state(0);

  // Update window when activeIndex changes
  $effect(() => {
    if (count <= visible) {
      windowStart = 0;
      return;
    }

    // Initial centering or when active is before the window
    if (activeIndex < windowStart) {
      windowStart = Math.max(0, activeIndex);
      return;
    }

    // If active is after the window
    if (activeIndex >= windowStart + visible) {
      windowStart = Math.min(count - visible, activeIndex - visible + 1);
    }

    // Initial centering when window hasn't been set yet
    if (windowStart === 0 && activeIndex > 0) {
      windowStart = clamp(activeIndex - Math.floor(visible / 2), 0, count - visible);
    }
  });

  // Container size calculation
  const containerSize = $derived.by(() => {
    const normalDotsCount = Math.min(visible, count);
    let size = normalDotsCount * itemSize;
    if (count > visible) {
      // Reserve space for both edge dots
      size += itemSize * 2;
    }
    return size;
  });

  // Dots to render
  const dots = $derived.by(() => {
    const windowEnd = Math.min(windowStart + visible, count);
    const hasLeadingSmall = windowStart > 0;

    // Render from (windowStart - 1) to (windowEnd + 1) for smooth transitions
    const renderStart = Math.max(0, windowStart - 1);
    const renderEnd = Math.min(count, windowEnd + 1);

    const result: Array<{
      i: number;
      isActive: boolean;
      scale: number;
      position: number;
    }> = [];

    for (let i = renderStart; i < renderEnd; i++) {
      const isActive = i === activeIndex;

      // Determine dot scale based on position relative to window
      let scale = 1;
      if (i < windowStart) {
        scale = edgeScale;
      } else if (i >= windowEnd) {
        scale = edgeScale;
      }

      // Calculate slot index for this dot
      let slotIndex: number;
      if (i < windowStart) {
        // Leading edge dot - always slot 0
        slotIndex = 0;
      } else if (i >= windowEnd) {
        // Trailing edge dot - last slot
        slotIndex = visible + 1;
      } else {
        // Visible dot - slots 1 to visible
        slotIndex = i - windowStart + 1;
      }

      // If no leading small, shift all visible and trailing left by 1
      if (!hasLeadingSmall && slotIndex > 0) {
        slotIndex -= 1;
      }

      const position = slotIndex * itemSize;

      result.push({ i, isActive, scale, position });
    }

    return result;
  });

  function handleClick(index: number) {
    onClick?.(index);
  }
</script>

<div
  style:position="relative"
  style:overflow="hidden"
  style:width={isVertical ? `${itemSize}px` : `${containerSize}px`}
  style:height={isVertical ? `${containerSize}px` : `${itemSize}px`}
>
  {#each dots as dot (dot.i)}
    <span
      data-reel-indicator={dot.i}
      role="button"
      tabindex="0"
      style:position="absolute"
      style:display="flex"
      style:justify-content="center"
      style:align-items="center"
      style:width="{itemSize}px"
      style:height="{itemSize}px"
      style:transition="top 0.2s ease, left 0.2s ease"
      style:cursor="pointer"
      style:top={isVertical ? `${dot.position}px` : '0'}
      style:left={isVertical ? '0' : `${dot.position}px`}
      onclick={() => handleClick(dot.i)}
      onkeydown={(e) => e.key === 'Enter' && handleClick(dot.i)}
    >
      <span
        style:width="{dotSize}px"
        style:height="{dotSize}px"
        style:border-radius="50%"
        style:background-color={dot.isActive ? activeColor : inactiveColor}
        style:transition="transform 0.2s ease, background-color 0.2s ease"
        style:transform="scale({dot.scale})"
      ></span>
    </span>
  {/each}
</div>
