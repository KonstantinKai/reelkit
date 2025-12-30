import {
  createSignal,
  createComputed,
  createDeferred,
  clamp,
  extractRange,
  abs,
  isNegative,
  first,
  last,
  safeCall,
} from '../utils';
import { createGestureController } from '../gestures';
import { createKeyboardController } from '../keyboard';
import type { GestureAxisDragUpdateEvent, GestureDragEndEvent } from '../gestures';
import type { NavKey } from '../keyboard';
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
const KEYBOARD_THROTTLE_MS = 1000;

const defaultRangeExtractor: RangeExtractor = (current, count, loop) =>
  extractRange(count, current, current, 1, loop);

export const createSliderController = (
  initialConfig: SliderConfig,
  initialEvents: SliderEvents = {}
): SliderController => {
  // Merge with defaults
  let config: Required<SliderConfig> = {
    count: initialConfig.count,
    initialIndex: initialConfig.initialIndex ?? 0,
    direction: initialConfig.direction ?? 'vertical',
    loop: initialConfig.loop ?? false,
    transitionDuration: initialConfig.transitionDuration ?? DEFAULT_TRANSITION_DURATION,
    swipeDistanceFactor: initialConfig.swipeDistanceFactor ?? DEFAULT_SWIPE_DISTANCE_FACTOR,
    rangeExtractor: initialConfig.rangeExtractor ?? defaultRangeExtractor,
  };

  let events = { ...initialEvents };
  let primarySize = 0;
  let cancelTransition = true;
  let primarySizeDidChange = false;

  // Create state signals
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
      return config.rangeExtractor(index.value, config.count, config.loop);
    },
    () => [index, goToOverride]
  );

  const state: SliderState = { index, axisValue, indexes };

  // Local helpers
  const getRangeIndex = () => indexes.value.indexOf(index.value);

  const setAxisValueForCurrentRangeIndex = (duration = 0, done?: () => void) => {
    axisValue.value = {
      value: getRangeIndex() * primarySize * -1,
      duration,
      done,
    };
  };

  const runTransition = async (before: () => { promise: Promise<void>; resolve: (value?: void) => void }) => {
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
    gestureController.unobserve();

    const inds = indexes.value;
    const nextRangeIndex = clamp(getRangeIndex() + increment, 0, inds.length - 1);
    const nextIndex = inds[nextRangeIndex];

    safeCall(events.onBeforeChange, index.value, nextIndex, getRangeIndex());

    await runTransition(() => {
      const deferred = createDeferred<void>();
      axisValue.value = {
        value: nextRangeIndex * primarySize * -1,
        duration: config.transitionDuration,
        done: () => deferred.resolve(),
      };
      return deferred;
    });

    // Update state
    [
      index.changeWithManualNotifier(nextIndex),
      axisValue.changeWithManualNotifier({
        value: getRangeIndex() * primarySize * -1,
        duration: 0,
      }),
    ].forEach((notify) => notify());

    gestureController.observe();
  };

  // Gesture handlers
  const onDragUpdate = (event: GestureAxisDragUpdateEvent) => {
    axisValue.value = {
      value: axisValue.value.value + event.primaryDelta,
      duration: 0,
    };
  };

  const onMainAxisDragStart = () => {
    safeCall(events.onDragStart, index.value);
  };

  const onAxisAwareDragEnd = async (event: GestureDragEndEvent) => {
    const isHorizontal = config.direction === 'horizontal';
    const key = isHorizontal ? 0 : 1;
    const necessaryDistance = primarySize * config.swipeDistanceFactor;
    const distanceValue = key === 0 ? first(event.distance) : last(event.distance);
    const velocityValue = key === 0 ? first(event.velocity) : last(event.velocity);
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

    safeCall(events.onDragEnd);

    if (cancelTransition) {
      await runTransition(() => {
        const deferred = createDeferred<void>();
        setAxisValueForCurrentRangeIndex(config.transitionDuration, () => deferred.resolve());
        return deferred;
      });

      if (primarySizeDidChange) {
        setAxisValueForCurrentRangeIndex();
      }

      safeCall(events.onDragCanceled, index.value);
    }

    cancelTransition = true;
  };

  // Create gesture controller
  const isHorizontal = () => config.direction === 'horizontal';

  const gestureController = createGestureController(
    { useTouchEventsOnly: true },
    {
      onHorizontalDragStart: isHorizontal() ? onMainAxisDragStart : undefined,
      onHorizontalDragUpdate: isHorizontal() ? onDragUpdate : undefined,
      onVerticalDragStart: !isHorizontal() ? onMainAxisDragStart : undefined,
      onVerticalDragUpdate: !isHorizontal() ? onDragUpdate : undefined,
      onDragEnd: onAxisAwareDragEnd,
    }
  );

  // Create keyboard controller
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
    }
  );

  // After change observer
  let afterChangeDispose: (() => void) | null = null;
  if (events.onAfterChange) {
    afterChangeDispose = index.observe(() => {
      safeCall(events.onAfterChange, index.value, getRangeIndex());
    });
  }

  return {
    state,
    config,

    getRangeIndex,

    async next() {
      if (!getIsFirstOrLast(indexes.value, 1)) {
        await changeIndex(1);
      }
    },

    async prev() {
      if (!getIsFirstOrLast(indexes.value, -1)) {
        await changeIndex(-1);
      }
    },

    async goTo(targetIndex: number, animate = false) {
      const clampedIndex = clamp(targetIndex, 0, config.count - 1);
      if (clampedIndex === index.value) return;

      gestureController.unobserve();

      if (!animate) {
        // Instant jump
        safeCall(events.onBeforeChange, index.value, clampedIndex, getRangeIndex());
        index.value = clampedIndex;
        setAxisValueForCurrentRangeIndex(0);
        safeCall(events.onAfterChange, index.value, getRangeIndex());
        gestureController.observe();
        return;
      }

      // Animated jump: replace adjacent slide with target and animate one step
      const goingForward = clampedIndex > index.value;

      safeCall(events.onBeforeChange, index.value, clampedIndex, getRangeIndex());

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
      await runTransition(() => {
        const deferred = createDeferred<void>();
        axisValue.value = {
          value: targetRangeIdx * primarySize * -1,
          duration: config.transitionDuration,
          done: () => deferred.resolve(),
        };
        return deferred;
      });

      // Clear override and set final state
      goToOverride.value = null;
      index.value = clampedIndex;
      setAxisValueForCurrentRangeIndex(0);

      safeCall(events.onAfterChange, index.value, getRangeIndex());

      gestureController.observe();
    },

    adjust(duration = 0) {
      setAxisValueForCurrentRangeIndex(duration);
    },

    setPrimarySize(size: number) {
      if (size !== primarySize) {
        primarySizeDidChange = true;
        primarySize = size;
        setAxisValueForCurrentRangeIndex();
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
          safeCall(events.onAfterChange, index.value, getRangeIndex());
        });
      }
    },

    observe() {
      gestureController.observe();
      keyboardController.attach();
    },

    unobserve() {
      gestureController.unobserve();
      keyboardController.detach();
    },

    attach(element: HTMLElement) {
      gestureController.attach(element);
    },

    detach() {
      gestureController.detach();
      keyboardController.detach();
    },

    dispose() {
      gestureController.detach();
      keyboardController.detach();
      if (afterChangeDispose) {
        afterChangeDispose();
      }
    },
  };
};

export { defaultRangeExtractor };
