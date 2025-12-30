import {
  defineComponent,
  h,
  ref,
  computed,
  watch,
  type PropType,
  type CSSProperties,
} from 'vue';
import { clamp, type SliderDirection } from '@reelkit/core';

/**
 * Instagram-style indicator with scrolling dots.
 * - Shows `visible` normal-sized dots
 * - Adds 1 small dot at start if there are more items before
 * - Adds 1 small dot at end if there are more items after
 * - Slides when navigating to edge dots with smooth animation
 */
export const ReelIndicator = defineComponent({
  name: 'ReelIndicator',
  props: {
    count: {
      type: Number,
      required: true,
    },
    activeIndex: {
      type: Number,
      required: true,
    },
    direction: {
      type: String as PropType<SliderDirection>,
      default: 'vertical',
    },
    visible: {
      type: Number,
      default: 5,
    },
    radius: {
      type: Number,
      default: 3,
    },
    gap: {
      type: Number,
      default: 4,
    },
    edgeScale: {
      type: Number,
      default: 0.5,
    },
    activeColor: {
      type: String,
      default: '#fff',
    },
    inactiveColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.5)',
    },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const isVertical = computed(() => props.direction === 'vertical');
    const dotSize = computed(() => props.radius * 2);
    const itemSize = computed(() => dotSize.value + props.gap);

    // Window start index - the first normal-sized dot
    const windowStart = ref(
      props.count <= props.visible
        ? 0
        : clamp(
            props.activeIndex - Math.floor(props.visible / 2),
            0,
            props.count - props.visible
          )
    );

    // Update window when activeIndex changes
    watch(
      () => props.activeIndex,
      (active) => {
        if (props.count <= props.visible) {
          windowStart.value = 0;
          return;
        }

        // If active is before the window
        if (active < windowStart.value) {
          windowStart.value = Math.max(0, active);
          return;
        }

        // If active is after the window
        if (active >= windowStart.value + props.visible) {
          windowStart.value = Math.min(
            props.count - props.visible,
            active - props.visible + 1
          );
        }
      }
    );

    // Also watch count and visible changes
    watch(
      [() => props.count, () => props.visible],
      () => {
        if (props.count <= props.visible) {
          windowStart.value = 0;
        }
      }
    );

    const containerStyle = computed<CSSProperties>(() => {
      const normalDotsCount = Math.min(props.visible, props.count);
      let containerSize = normalDotsCount * itemSize.value;
      if (props.count > props.visible) {
        // Reserve space for both edge dots
        containerSize += itemSize.value * 2;
      }

      return {
        position: 'relative',
        overflow: 'hidden',
        [isVertical.value ? 'height' : 'width']: `${containerSize}px`,
        [isVertical.value ? 'width' : 'height']: `${itemSize.value}px`,
      };
    });

    return () => {
      const windowEnd = Math.min(windowStart.value + props.visible, props.count);
      const hasLeadingSmall = windowStart.value > 0;

      // Render from (windowStart - 1) to (windowEnd + 1) for smooth transitions
      const renderStart = Math.max(0, windowStart.value - 1);
      const renderEnd = Math.min(props.count, windowEnd + 1);

      const dots = [];

      for (let i = renderStart; i < renderEnd; i++) {
        const isActive = i === props.activeIndex;

        // Determine dot scale based on position relative to window
        let scale = 1;
        if (i < windowStart.value) {
          scale = props.edgeScale;
        } else if (i >= windowEnd) {
          scale = props.edgeScale;
        }

        // Calculate slot index for this dot
        let slotIndex: number;
        if (i < windowStart.value) {
          // Leading edge dot - always slot 0
          slotIndex = 0;
        } else if (i >= windowEnd) {
          // Trailing edge dot - last slot
          slotIndex = props.visible + 1;
        } else {
          // Visible dot - slots 1 to visible
          slotIndex = i - windowStart.value + 1;
        }

        // If no leading small, shift all visible and trailing left by 1
        if (!hasLeadingSmall && slotIndex > 0) {
          slotIndex -= 1;
        }

        const position = slotIndex * itemSize.value;

        const wrapperStyle: CSSProperties = {
          position: 'absolute',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: `${itemSize.value}px`,
          height: `${itemSize.value}px`,
          transition: 'top 0.2s ease, left 0.2s ease',
          [isVertical.value ? 'top' : 'left']: `${position}px`,
          [isVertical.value ? 'left' : 'top']: '0',
        };

        const dotStyle: CSSProperties = {
          width: `${dotSize.value}px`,
          height: `${dotSize.value}px`,
          borderRadius: '50%',
          backgroundColor: isActive ? props.activeColor : props.inactiveColor,
          transition: 'transform 0.2s ease, background-color 0.2s ease',
          transform: `scale(${scale})`,
          cursor: 'pointer',
        };

        dots.push(
          h(
            'span',
            {
              key: i,
              'data-reel-indicator': i,
              style: wrapperStyle,
              onClick: () => emit('click', i),
            },
            [h('span', { style: dotStyle })]
          )
        );
      }

      return h('div', { style: containerStyle.value }, dots);
    };
  },
});
