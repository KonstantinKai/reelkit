import {
  defineComponent,
  h,
  ref,
  onMounted,
  onUnmounted,
  watch,
  type ExtractPropTypes,
  type PropType,
} from 'vue';
import { createGestureController, abs } from '@reelkit/core';

/** Swipe direction for the {@link SwipeToClose} gesture. */
export type SwipeToCloseDirection = 'up' | 'down';

/** Props accepted by the {@link SwipeToClose} component. */
const swipeToCloseProps = {
  /**
   * Swipe direction that triggers dismiss. `'down'` for stories-style
   * overlays (pull down to close), `'up'` for lightbox-style (push up).
   */
  direction: {
    type: String as PropType<SwipeToCloseDirection>,
    required: true as const,
  },

  /**
   * Toggle gesture handling on/off without unmounting the component.
   *
   * @default true
   */
  enabled: { type: Boolean, default: true },

  /**
   * Fraction of viewport height a swipe must exceed to dismiss. `0.2`
   * means drag > 20 % of window height → emit `close`.
   *
   * @default 0.2
   */
  threshold: { type: Number, default: 0.2 },
};

/** Public props interface for the {@link SwipeToClose} component. */
export type SwipeToCloseProps = ExtractPropTypes<typeof swipeToCloseProps>;

/**
 * Wraps its default slot in a touch-aware container that can be swiped
 * to dismiss. Supports both upward (lightbox) and downward (stories)
 * swipe directions.
 */
export const SwipeToClose = defineComponent({
  name: 'SwipeToClose',
  props: swipeToCloseProps,
  emits: ['close'],
  setup(props, { slots, emit }) {
    const containerRef = ref<HTMLElement | null>(null);
    const isDown = props.direction === 'down';
    const sign = isDown ? 1 : -1;

    const dragOffset = ref(0);
    const opacity = ref(1);
    const isTransitioning = ref(false);

    let verticalDragEndHandled = false;

    const resetToOriginalPosition = () => {
      isTransitioning.value = true;
      dragOffset.value = 0;
      opacity.value = 1;
      setTimeout(() => {
        isTransitioning.value = false;
      }, 300);
    };

    const controller = createGestureController(
      { useTouchEventsOnly: true },
      {
        onVerticalDragStart: () => {
          verticalDragEndHandled = false;
        },
        onVerticalDragUpdate: (event) => {
          const matchesDirection = isDown
            ? event.primaryDistance > 0
            : event.primaryDistance < 0;

          if (matchesDirection) {
            dragOffset.value = event.primaryDistance;
            const height = window.innerHeight;
            const progress = Math.min(
              abs(event.primaryDistance) / (height * 0.3),
              1,
            );
            opacity.value = 1 - progress * 0.8;
          }
        },
        onVerticalDragEnd: (event) => {
          verticalDragEndHandled = true;
          const height = window.innerHeight;
          const dismissThreshold = height * props.threshold;
          const matchesDirection = isDown
            ? event.primaryDistance > 0
            : event.primaryDistance < 0;

          if (
            matchesDirection &&
            abs(event.primaryDistance) > dismissThreshold
          ) {
            isTransitioning.value = true;
            dragOffset.value = height * sign;
            opacity.value = 0;
            setTimeout(() => emit('close'), 300);
          } else {
            resetToOriginalPosition();
          }
        },
        onDragEnd: () => {
          if (!verticalDragEndHandled && dragOffset.value !== 0) {
            resetToOriginalPosition();
          }
        },
      },
    );

    const attachController = () => {
      const el = containerRef.value;
      if (!props.enabled || !el) return;
      controller.attach(el);
      controller.observe();
    };

    const detachController = () => {
      controller.unobserve();
      controller.detach();
    };

    onMounted(attachController);

    watch(
      () => props.enabled,
      (enabled) => {
        if (enabled) attachController();
        else detachController();
      },
    );

    onUnmounted(detachController);

    return () =>
      h(
        'div',
        {
          ref: containerRef,
          style: {
            transform: `translateY(${dragOffset.value}px)`,
            opacity: opacity.value,
            transition: isTransitioning.value
              ? 'transform 300ms ease-out, opacity 300ms ease-out'
              : 'none',
            width: '100%',
            height: '100%',
          },
        },
        slots['default']?.(),
      );
  },
});
