import {
  createSignal,
  createComputed,
  createDeferred,
  batch,
  clamp,
  extractRange,
  abs,
  isNegative,
  first,
  last,
} from '../utils';
import { createGestureController } from '../gestures';
import { createKeyboardController } from '../keyboard';
import { createWheelController } from '../wheel';
import type {
  GestureAxisDragUpdateEvent,
  GestureDragEndEvent,
} from '../gestures';
import type { NavKey } from '../keyboard';
import type { WheelDirection } from '../wheel';
import type {
  AnimatedValue,
  RangeExtractor,
  SliderConfig,
  SliderEvents,
  SliderState,
  SliderController,
} from './types';

const DEFAULT_TRANSITION_DURATION = 300;
const DEFAULT_SWIPE_DISTANCE_FACTOR = 0.12;
const MAX_VISIBLE_SLIDES = 3;
const KEYBOARD_THROTTLE_MS = DEFAULT_TRANSITION_DURATION + 100;
const DEFAULT_WHEEL_DEBOUNCE_MS = 200;

/**
 * Default range extractor that computes the visible slide indices with an
 * overscan of 1. This means up to 3 indices are returned: the current slide,
 * plus one before and one after (when they exist), enabling smooth transitions
 * without rendering the entire list.
 *
 * @param current - The current slide index.
 * @param count - Total number of slides.
 * @param loop - Whether the slider wraps around at boundaries.
 * @returns An array of visible slide indices.
 */
export const defaultRangeExtractor: RangeExtractor = (current, count, loop) =>
  extractRange(count, current, current, 1, loop);

/**
 * Creates a centralized slider controller that manages slide navigation,
 * animated transitions, and input coordination. Returns a {@link SliderController}
 * object following the factory-function pattern (closure-based, no classes).
 *
 * The controller orchestrates three sub-controllers:
 * - **GestureController** — handles touch/mouse drag interactions.
 * - **KeyboardController** — maps arrow keys to prev/next navigation (throttled).
 * - **WheelController** — translates mouse wheel scrolls into navigation (optional, debounced).
 *
 * An internal animation guard prevents concurrent transitions: calls to
 * `next()`, `prev()`, and `goTo()` are silently ignored while an animation
 * is already in progress, ensuring only one slide change runs at a time.
 *
 * @param initialConfig - Slider configuration (count, direction, loop, durations, etc.).
 * @param initialEvents - Optional event callbacks (onBeforeChange, onAfterChange, onDragStart, etc.).
 * @returns A {@link SliderController} with methods for navigation, lifecycle, and config updates.
 */
export const createSliderController = (
  initialConfig: SliderConfig,
  initialEvents: SliderEvents = {},
): SliderController => {
  let config: Required<SliderConfig> = {
    count: initialConfig.count,
    initialIndex: initialConfig.initialIndex ?? 0,
    direction: initialConfig.direction ?? 'vertical',
    loop: initialConfig.loop ?? false,
    transitionDuration:
      initialConfig.transitionDuration ?? DEFAULT_TRANSITION_DURATION,
    swipeDistanceFactor:
      initialConfig.swipeDistanceFactor ?? DEFAULT_SWIPE_DISTANCE_FACTOR,
    rangeExtractor: initialConfig.rangeExtractor ?? defaultRangeExtractor,
    enableWheel: initialConfig.enableWheel ?? false,
    wheelDebounceMs: initialConfig.wheelDebounceMs ?? DEFAULT_WHEEL_DEBOUNCE_MS,
  };

  let events = { ...initialEvents };
  let primarySize = 0;
  let cancelTransition = true;
  let primarySizeDidChange = false;
  let animating = false;

  const index = createSignal(config.initialIndex);
  const axisValue = createSignal<AnimatedValue>({ value: 0, duration: 0 });

  // Override for animated goTo - temporarily replaces adjacent slide with target
  const goToOverride = createSignal<number | null>(null);

  const indexes = createComputed(
    () => {
      const override = goToOverride.value;
      if (override !== null) {
        const current = index.value;
        // Show [current, target] for forward, [target, current] for backward
        return override > current ? [current, override] : [override, current];
      }
      const range = config.rangeExtractor(
        index.value,
        config.count,
        config.loop,
      );
      if (range.length <= MAX_VISIBLE_SLIDES) return range;

      const pos = range.indexOf(index.value);
      const start = clamp(pos - 1, 0, range.length - MAX_VISIBLE_SLIDES);
      return range.slice(start, start + MAX_VISIBLE_SLIDES);
    },
    () => [index, goToOverride],
  );

  const state: SliderState = { index, axisValue, indexes };

  const getRangeIndex = () => indexes.value.indexOf(index.value);

  const setAxisValueForCurrentRangeIndex = (
    duration = 0,
    done?: () => void,
  ) => {
    axisValue.value = {
      value: getRangeIndex() * primarySize * -1,
      duration,
      done,
    };
  };

  const runTransition = async (
    before: () => { promise: Promise<void>; resolve: (value?: void) => void },
  ) => {
    const { promise } = before();
    await promise;
  };

  const getIsFirstOrLast = (inds: number[], increment: -1 | 1): boolean => {
    if (inds.length === 1) return true;
    return (
      inds.length === 2 &&
      ((getRangeIndex() === 0 && increment === -1) ||
        (getRangeIndex() === 1 && increment === 1))
    );
  };

  const changeIndex = async (increment: -1 | 1): Promise<void> => {
    animating = true;
    gestureController.unobserve();

    const inds = indexes.value;
    const nextRangeIndex = clamp(
      getRangeIndex() + increment,
      0,
      inds.length - 1,
    );
    const nextIndex = inds[nextRangeIndex];

    events.onBeforeChange?.(index.value, nextIndex, getRangeIndex());

    try {
      await runTransition(() => {
        const deferred = createDeferred<void>();
        axisValue.value = {
          value: nextRangeIndex * primarySize * -1,
          duration: config.transitionDuration,
          done: () => deferred.resolve(),
        };
        return deferred;
      });
    } finally {
      // Update state atomically — observers see both changes at once
      batch(() => {
        index.value = nextIndex;
        axisValue.value = {
          value: getRangeIndex() * primarySize * -1,
          duration: 0,
        };
      });

      gestureController.observe();
      animating = false;
    }
  };

  // Gesture handlers
  const onDragUpdate = (event: GestureAxisDragUpdateEvent) => {
    axisValue.value = {
      value: axisValue.value.value + event.primaryDelta,
      duration: 0,
    };
  };

  let mainAxisDragActive = false;

  const onMainAxisDragStart = () => {
    mainAxisDragActive = true;
    events.onDragStart?.(index.value);
  };

  const onAxisAwareDragEnd = async (event: GestureDragEndEvent) => {
    if (!mainAxisDragActive) return;
    mainAxisDragActive = false;
    const isHorizontal = config.direction === 'horizontal';
    const key = isHorizontal ? 0 : 1;
    const necessaryDistance = primarySize * config.swipeDistanceFactor;
    const distanceValue =
      key === 0 ? first(event.distance) : last(event.distance);
    const velocityValue =
      key === 0 ? first(event.velocity) : last(event.velocity);
    const increment = isNegative(distanceValue) ? 1 : -1;
    const isFirstOrLast = getIsFirstOrLast(indexes.value, increment);

    if (
      !isFirstOrLast &&
      (abs(distanceValue) > necessaryDistance ||
        (velocityValue > 1400 && abs(distanceValue) > necessaryDistance / 2))
    ) {
      changeIndex(increment).then(() => {
        if (primarySizeDidChange) {
          setAxisValueForCurrentRangeIndex();
        }
      });

      cancelTransition = false;
    }

    events.onDragEnd?.(index.value);

    if (cancelTransition) {
      await runTransition(() => {
        const deferred = createDeferred<void>();
        setAxisValueForCurrentRangeIndex(config.transitionDuration, () =>
          deferred.resolve(),
        );
        return deferred;
      });

      if (primarySizeDidChange) {
        setAxisValueForCurrentRangeIndex();
      }

      events.onDragCanceled?.(index.value);
    }

    cancelTransition = true;
  };

  const isHorizontal = () => config.direction === 'horizontal';

  const gestureController = createGestureController(
    { useTouchEventsOnly: true },
    {
      onHorizontalDragStart: isHorizontal() ? onMainAxisDragStart : undefined,
      onHorizontalDragUpdate: isHorizontal() ? onDragUpdate : undefined,
      onVerticalDragStart: !isHorizontal() ? onMainAxisDragStart : undefined,
      onVerticalDragUpdate: !isHorizontal() ? onDragUpdate : undefined,
      onDragEnd: onAxisAwareDragEnd,
    },
  );

  const keyboardController = createKeyboardController(
    { throttleMs: KEYBOARD_THROTTLE_MS },
    {
      onKeyPress: (key: NavKey) => {
        let increment: -1 | 1 | null = null;

        if (isHorizontal()) {
          if (key === 'left') increment = -1;
          if (key === 'right') increment = 1;
        } else {
          if (key === 'up') increment = -1;
          if (key === 'down') increment = 1;
        }

        if (increment !== null) {
          const isFirstOrLast = getIsFirstOrLast(indexes.value, increment);
          if (!isFirstOrLast) {
            changeIndex(increment);
          }
        }
      },
    },
  );

  const wheelController = config.enableWheel
    ? createWheelController(
        { debounceMs: config.wheelDebounceMs },
        {
          onWheel: (direction: WheelDirection) => {
            let increment: -1 | 1 | null = null;

            if (isHorizontal()) {
              if (direction === 'left') increment = -1;
              if (direction === 'right') increment = 1;
            } else {
              if (direction === 'up') increment = -1;
              if (direction === 'down') increment = 1;
            }

            if (increment !== null) {
              const isFirstOrLast = getIsFirstOrLast(indexes.value, increment);
              if (!isFirstOrLast) {
                changeIndex(increment);
              }
            }
          },
        },
      )
    : null;

  let afterChangeDispose: (() => void) | null = null;
  if (events.onAfterChange) {
    afterChangeDispose = index.observe(() => {
      events.onAfterChange?.(index.value, getRangeIndex());
    });
  }

  return {
    state,
    config,

    getRangeIndex,

    async next() {
      if (animating) return;
      if (!getIsFirstOrLast(indexes.value, 1)) {
        await changeIndex(1);
      }
    },

    async prev() {
      if (animating) return;
      if (!getIsFirstOrLast(indexes.value, -1)) {
        await changeIndex(-1);
      }
    },

    async goTo(targetIndex: number, animate = false) {
      if (animating) return;
      const clampedIndex = clamp(targetIndex, 0, config.count - 1);
      if (clampedIndex === index.value) return;

      gestureController.unobserve();

      if (!animate) {
        // Instant jump
        events.onBeforeChange?.(index.value, clampedIndex, getRangeIndex());
        index.value = clampedIndex;
        setAxisValueForCurrentRangeIndex(0);
        events.onAfterChange?.(index.value, getRangeIndex());
        gestureController.observe();
        return;
      }

      // Animated jump: replace adjacent slide with target and animate one step
      animating = true;
      const goingForward = clampedIndex > index.value;

      events.onBeforeChange?.(index.value, clampedIndex, getRangeIndex());

      // Set override - indexes will become [current, target] or [target, current]
      goToOverride.value = clampedIndex;

      // Position at current slide in the new 2-element range
      // Forward: current is at index 0, backward: current is at index 1
      const currentRangeIdx = goingForward ? 0 : 1;
      axisValue.value = {
        value: currentRangeIdx * primarySize * -1,
        duration: 0,
      };

      // Animate to target position
      const targetRangeIdx = goingForward ? 1 : 0;
      try {
        await runTransition(() => {
          const deferred = createDeferred<void>();
          axisValue.value = {
            value: targetRangeIdx * primarySize * -1,
            duration: config.transitionDuration,
            done: () => deferred.resolve(),
          };
          return deferred;
        });
      } finally {
        // Clear override and set final state atomically — observers see
        // both changes at once, preventing an intermediate indexes flash
        batch(() => {
          goToOverride.value = null;
          index.value = clampedIndex;
          setAxisValueForCurrentRangeIndex(0);
        });

        events.onAfterChange?.(index.value, getRangeIndex());

        gestureController.observe();
        animating = false;
      }
    },

    adjust(duration = 0) {
      if (!animating) {
        setAxisValueForCurrentRangeIndex(duration);
      }
    },

    setPrimarySize(size: number) {
      if (size !== primarySize) {
        primarySizeDidChange = true;
        primarySize = size;
        if (!animating) {
          setAxisValueForCurrentRangeIndex();
        }
      }
    },

    updateConfig(newConfig: Partial<SliderConfig>) {
      config = { ...config, ...newConfig };

      // Update gesture controller direction
      const horizontal = config.direction === 'horizontal';
      gestureController.updateEvents({
        onHorizontalDragStart: horizontal ? onMainAxisDragStart : undefined,
        onHorizontalDragUpdate: horizontal ? onDragUpdate : undefined,
        onVerticalDragStart: !horizontal ? onMainAxisDragStart : undefined,
        onVerticalDragUpdate: !horizontal ? onDragUpdate : undefined,
      });
    },

    updateEvents(newEvents: Partial<SliderEvents>) {
      events = { ...events, ...newEvents };

      // Update afterChange observer
      if (afterChangeDispose) {
        afterChangeDispose();
        afterChangeDispose = null;
      }
      if (events.onAfterChange) {
        afterChangeDispose = index.observe(() => {
          events.onAfterChange?.(index.value, getRangeIndex());
        });
      }
    },

    observe() {
      gestureController.observe();
      keyboardController.attach();
      wheelController?.attach();
    },

    unobserve() {
      gestureController.unobserve();
      keyboardController.detach();
      wheelController?.detach();
    },

    attach(element: HTMLElement) {
      gestureController.attach(element);
    },

    detach() {
      gestureController.detach();
      keyboardController.detach();
      wheelController?.detach();
    },

    dispose() {
      gestureController.detach();
      keyboardController.detach();
      wheelController?.detach();
      if (afterChangeDispose) {
        afterChangeDispose();
      }
    },
  };
};
