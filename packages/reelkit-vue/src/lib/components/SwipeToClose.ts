import {
  defineComponent,
  h,
  shallowRef,
  ref,
  onMounted,
  onUnmounted,
  watch,
  type PropType,
} from 'vue';
import {
  createSignal,
  createGestureController,
  createDisposableList,
  abs,
} from '@reelkit/core';

/** Swipe direction for the SwipeToClose gesture. */
export type SwipeToCloseDirection = 'up' | 'down';

export interface SwipeToCloseProps {
  direction: SwipeToCloseDirection;
  enabled?: boolean;
  threshold?: number;
}

/**
 * Wraps its default slot in a touch-aware container that can be swiped
 * to dismiss. Supports both upward (lightbox) and downward (stories)
 * swipe directions.
 */
export const SwipeToClose = defineComponent({
  name: 'SwipeToClose',
  props: {
    direction: {
      type: String as PropType<SwipeToCloseDirection>,
      required: true,
    },
    enabled: { type: Boolean, default: true },
    threshold: { type: Number, default: 0.2 },
  },
  emits: ['close'],
  setup(props, { slots, emit }) {
    const containerRef = ref<HTMLElement | null>(null);
    const isDown = props.direction === 'down';
    const sign = isDown ? 1 : -1;

    const dragOffset = createSignal(0);
    const opacity = createSignal(1);
    const isTransitioning = createSignal(false);

    const dragRef = shallowRef(0);
    const opacityRef = shallowRef(1);
    const transitioningRef = shallowRef(false);

    const verticalDragEndHandled = { current: false };

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
          verticalDragEndHandled.current = false;
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
          verticalDragEndHandled.current = true;
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
          if (!verticalDragEndHandled.current && dragOffset.value !== 0) {
            resetToOriginalPosition();
          }
        },
      },
    );

    const disposables = createDisposableList();

    disposables.push(
      dragOffset.observe(() => {
        dragRef.value = dragOffset.value;
      }),
      opacity.observe(() => {
        opacityRef.value = opacity.value;
      }),
      isTransitioning.observe(() => {
        transitioningRef.value = isTransitioning.value;
      }),
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

    onUnmounted(() => {
      detachController();
      disposables.dispose();
    });

    return () =>
      h(
        'div',
        {
          ref: containerRef,
          style: {
            transform: `translateY(${dragRef.value}px)`,
            opacity: opacityRef.value,
            transition: transitioningRef.value
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
