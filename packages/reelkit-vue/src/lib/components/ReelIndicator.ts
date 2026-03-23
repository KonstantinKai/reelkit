import {
  defineComponent,
  h,
  ref,
  computed,
  watch,
  inject,
  onUnmounted,
  type PropType,
  type CSSProperties,
} from 'vue';
import { clamp, type SliderDirection } from '@reelkit/core';
import { RK_REEL_KEY } from '../context/ReelContext';

export const ReelIndicator = defineComponent({
  name: 'ReelIndicator',
  props: {
    count: { type: Number, default: undefined },
    active: { type: Number, default: undefined },
    direction: {
      type: String as PropType<SliderDirection>,
      default: 'vertical',
    },
    visible: { type: Number, default: 5 },
    radius: { type: Number, default: 3 },
    gap: { type: Number, default: 4 },
    edgeScale: { type: Number, default: 0.5 },
    activeColor: { type: String, default: '#fff' },
    inactiveColor: { type: String, default: 'rgba(255, 255, 255, 0.5)' },
    onDotClick: {
      type: Function as PropType<(index: number) => void>,
      default: undefined,
    },
  },
  emits: ['dotClick'],
  setup(props, { emit }) {
    const reelContext = inject(RK_REEL_KEY, null);

    if (props.active === undefined && !reelContext) {
      throw new Error(
        'ReelIndicator: "active" prop is required when rendered outside a <Reel> component.',
      );
    }
    if (props.count === undefined && !reelContext) {
      throw new Error(
        'ReelIndicator: "count" prop is required when rendered outside a <Reel> component.',
      );
    }

    const resolvedActive = ref(props.active ?? reelContext?.index.value ?? 0);
    const resolvedCount = ref(props.count ?? reelContext?.count.value ?? 0);

    const disposers: (() => void)[] = [];

    if (props.active === undefined && reelContext) {
      resolvedActive.value = reelContext.index.value;
      disposers.push(
        reelContext.index.observe(() => {
          resolvedActive.value = reelContext.index.value;
        }),
      );
    }
    if (props.count === undefined && reelContext) {
      resolvedCount.value = reelContext.count.value;
      disposers.push(
        reelContext.count.observe(() => {
          resolvedCount.value = reelContext.count.value;
        }),
      );
    }

    watch(
      () => props.active,
      (val) => {
        if (val !== undefined) resolvedActive.value = val;
      },
    );
    watch(
      () => props.count,
      (val) => {
        if (val !== undefined) resolvedCount.value = val;
      },
    );

    onUnmounted(() => {
      disposers.forEach((d) => d());
    });

    const handleDotClick = (index: number) => {
      if (props.onDotClick) {
        props.onDotClick(index);
      } else if (reelContext) {
        reelContext.goTo(index, true);
      }
      emit('dotClick', index);
    };

    const isVertical = computed(() => props.direction === 'vertical');
    const dotSize = computed(() => props.radius * 2);
    const itemSize = computed(() => dotSize.value + props.gap);

    const windowStart = ref(
      resolvedCount.value <= props.visible
        ? 0
        : clamp(
            resolvedActive.value - Math.floor(props.visible / 2),
            0,
            resolvedCount.value - props.visible,
          ),
    );

    watch(
      () => resolvedActive.value,
      (active) => {
        if (resolvedCount.value <= props.visible) {
          windowStart.value = 0;
          return;
        }
        if (active < windowStart.value) {
          windowStart.value = Math.max(0, active);
          return;
        }
        if (active >= windowStart.value + props.visible) {
          windowStart.value = Math.min(
            resolvedCount.value - props.visible,
            active - props.visible + 1,
          );
        }
      },
    );

    watch([() => resolvedCount.value, () => props.visible], () => {
      if (resolvedCount.value <= props.visible) {
        windowStart.value = 0;
      }
    });

    const containerStyle = computed<CSSProperties>(() => {
      const normalDotsCount = Math.min(props.visible, resolvedCount.value);
      let containerSize = normalDotsCount * itemSize.value;
      if (resolvedCount.value > props.visible) {
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
      const count = resolvedCount.value;
      const active = resolvedActive.value;
      const windowEnd = Math.min(windowStart.value + props.visible, count);
      const hasLeadingSmall = windowStart.value > 0;

      const renderStart = Math.max(0, windowStart.value - 1);
      const renderEnd = Math.min(count, windowEnd + 1);

      const dots = [];

      for (let i = renderStart; i < renderEnd; i++) {
        const isActive = i === active;

        let scale = 1;
        if (i < windowStart.value || i >= windowEnd) {
          scale = props.edgeScale;
        }

        let slotIndex: number;
        if (i < windowStart.value) {
          slotIndex = 0;
        } else if (i >= windowEnd) {
          slotIndex = props.visible + 1;
        } else {
          slotIndex = i - windowStart.value + 1;
        }

        if (!hasLeadingSmall && slotIndex > 0) {
          slotIndex -= 1;
        }

        const position = slotIndex * itemSize.value;
        const hasDotClick = !!(props.onDotClick || reelContext);

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
          cursor: hasDotClick ? 'pointer' : 'default',
        };

        dots.push(
          h(
            'span',
            {
              key: i,
              'data-reel-indicator': i,
              style: wrapperStyle,
              onClick: () => handleDotClick(i),
            },
            [h('span', { style: dotStyle })],
          ),
        );
      }

      return h('div', { style: containerStyle.value }, dots);
    };
  },
});
