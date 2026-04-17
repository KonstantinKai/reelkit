import {
  defineComponent,
  h,
  ref,
  computed,
  watch,
  inject,
  onUnmounted,
  type ExtractPropTypes,
  type PropType,
  type CSSProperties,
} from 'vue';
import {
  clamp,
  createDisposableList,
  type SliderDirection,
} from '@reelkit/core';
import { RK_REEL_KEY } from '../context/ReelContext';

/** Props accepted by the {@link ReelIndicator} component. */
const reelIndicatorProps = {
  /**
   * Total number of slides. Auto-connected from the parent {@link Reel}
   * context when omitted inside a `<Reel>`; required otherwise.
   */
  count: { type: Number, default: undefined },

  /**
   * Currently active slide index. Auto-connected from the parent
   * {@link Reel} context when omitted inside a `<Reel>`; required otherwise.
   */
  active: { type: Number, default: undefined },

  /**
   * Indicator axis.
   *
   * @default 'vertical'
   */
  direction: {
    type: String as PropType<SliderDirection>,
    default: 'vertical',
  },

  /**
   * Maximum number of full-sized dots visible at once. Excess slides are
   * represented by smaller edge dots on either side of the sliding window.
   *
   * @default 5
   */
  visible: { type: Number, default: 5 },

  /**
   * Dot radius in pixels (full-size dot is `radius * 2`).
   *
   * @default 3
   */
  radius: { type: Number, default: 3 },

  /**
   * Gap between dots in pixels.
   *
   * @default 4
   */
  gap: { type: Number, default: 4 },

  /**
   * Scale factor for the small edge dots that represent overflow on the
   * leading/trailing side of the sliding window.
   *
   * @default 0.5
   */
  edgeScale: { type: Number, default: 0.5 },

  /**
   * Color of the active dot.
   *
   * @default '#fff'
   */
  activeColor: { type: String, default: '#fff' },

  /**
   * Color of inactive dots.
   *
   * @default 'rgba(255, 255, 255, 0.5)'
   */
  inactiveColor: { type: String, default: 'rgba(255, 255, 255, 0.5)' },

  /**
   * Custom click handler. When omitted inside a {@link Reel}, defaults to
   * navigating the parent slider to the clicked dot's index via context.
   */
  onDotClick: {
    type: Function as PropType<(index: number) => void>,
    default: undefined,
  },

  /** CSS class(es) applied to the tablist root element. */
  indicatorClass: { type: [String, Array, Object], default: undefined },

  /** Inline styles merged into the tablist root element. */
  indicatorStyle: {
    type: Object as PropType<CSSProperties>,
    default: undefined,
  },
};

/** Public props interface for the {@link ReelIndicator} component. */
export type ReelIndicatorProps = ExtractPropTypes<typeof reelIndicatorProps>;

/**
 * Instagram-style scrolling dot indicator. Shows a sliding window of
 * normal-sized dots with smaller edge dots indicating overflow.
 *
 * When rendered inside a {@link Reel}, `active` and `count` are
 * auto-connected from the parent slider's context. Explicit props
 * take precedence when provided.
 */
export const ReelIndicator = defineComponent({
  name: 'ReelIndicator',
  props: reelIndicatorProps,
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

    const resolvedActive = ref(props.active ?? reelContext!.index.value);
    const resolvedCount = ref(props.count ?? reelContext!.count.value);

    const disposables = createDisposableList();

    if (props.active === undefined && reelContext) {
      disposables.push(
        reelContext.index.observe(() => {
          resolvedActive.value = reelContext.index.value;
        }),
      );
    }
    if (props.count === undefined && reelContext) {
      disposables.push(
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
      disposables.dispose();
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

    watch(
      [
        () => resolvedCount.value,
        () => props.visible,
        () => resolvedActive.value,
      ],
      () => {
        if (resolvedCount.value <= props.visible) {
          windowStart.value = 0;
          return;
        }
        const max = resolvedCount.value - props.visible;
        const lo = Math.max(0, resolvedActive.value - props.visible + 1);
        const hi = Math.min(max, resolvedActive.value);
        windowStart.value = clamp(windowStart.value, lo, hi);
      },
    );

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
        ...(props.indicatorStyle ?? {}),
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
              role: 'tab',
              'aria-selected': isActive ? 'true' : 'false',
              'aria-label': `Slide ${i + 1}`,
              tabindex: isActive ? 0 : -1,
              style: wrapperStyle,
              onClick: () => handleDotClick(i),
              onKeydown: (e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDotClick(i);
                }
              },
            },
            [h('span', { style: dotStyle })],
          ),
        );
      }

      return h(
        'div',
        {
          role: 'tablist',
          'aria-label': 'Slide navigation',
          class: props.indicatorClass,
          style: containerStyle.value,
          onKeydown: (e: KeyboardEvent) => {
            const isVert = isVertical.value;
            const prevKey = isVert ? 'ArrowUp' : 'ArrowLeft';
            const nextKey = isVert ? 'ArrowDown' : 'ArrowRight';
            let targetIndex: number | null = null;

            if (e.key === prevKey) {
              targetIndex = Math.max(0, active - 1);
            } else if (e.key === nextKey) {
              targetIndex = Math.min(count - 1, active + 1);
            } else if (e.key === 'Home') {
              targetIndex = 0;
            } else if (e.key === 'End') {
              targetIndex = count - 1;
            }

            if (targetIndex !== null) {
              e.preventDefault();
              handleDotClick(targetIndex);
              const target = (e.currentTarget as HTMLElement)?.querySelector(
                `[data-reel-indicator="${targetIndex}"]`,
              ) as HTMLElement | null;
              target?.focus();
            }
          },
        },
        dots,
      );
    };
  },
});
