import { createDisposableList } from '../utils/disposable';
import { timeout } from '../utils/timeout';
import { observeDomEvent } from '../utils/observeDomEvent';
import { abs, first, last } from '../utils';
import type {
  Offset,
  EventKind,
  DragAxis,
  GestureEvent,
  GestureCommonEvent,
  GestureAxisDragUpdateEvent,
  GestureDragEndEvent,
  GestureControllerConfig,
  GestureControllerEvents,
  GestureController,
} from './types';

const DEFAULT_LONG_PRESS_DURATION_MS = 800;

const getDominantAxis = (delta: Offset): DragAxis => {
  const [dx, dy] = [abs(first(delta)), abs(last(delta))];
  if (dx > 0 && dx > dy) return 'horizontal';
  if (dy > 0 && dy > dx) return 'vertical';
  return null;
};

const getPrimaryValue = (offset: Offset, axis: DragAxis): number =>
  axis === 'horizontal' ? first(offset) : last(offset);

const isTouchEvent = (event: unknown): event is TouchEvent =>
  event !== null && typeof event === 'object' && 'changedTouches' in event;

/**
 * Creates a touch and mouse gesture detector that tracks drag interactions
 * along horizontal and vertical axes. Returns a {@link GestureController}
 * following the factory-function pattern.
 *
 * The controller determines the dominant drag axis (horizontal vs vertical)
 * from the initial movement delta and routes all subsequent updates to the
 * matching axis-specific callbacks. It computes per-update deltas, cumulative
 * distance from the drag origin, and end-of-drag velocity for swipe detection.
 *
 * Long press detection is also supported: if the pointer stays stationary for
 * the configured duration (default 800 ms), the `onLongPress` callback fires.
 *
 * @param config - Optional configuration (touch-only mode, long press duration).
 * @param events - Optional axis-aware drag callbacks and tap/long-press handlers.
 * @returns A {@link GestureController} with attach/detach and observe/unobserve lifecycle methods.
 */
export const createGestureController = (
  config: GestureControllerConfig = {},
  events: GestureControllerEvents = {},
): GestureController => {
  const {
    useTouchEventsOnly = false,
    longPressDurationMs = DEFAULT_LONG_PRESS_DURATION_MS,
  } = config;
  const disposables = createDisposableList();

  let element: HTMLElement | null = null;
  let currentEvents = { ...events };

  let canceled = false;
  let initialEvent: GestureEvent | null = null;
  let offset: Offset | null = null;
  let elementTopLeft: Offset | null = null;
  let updateEvents: GestureAxisDragUpdateEvent[] = [];
  let lockedAxis: DragAxis = null;
  let longPressDetected = false;

  const longPressTimeout = timeout((event: GestureCommonEvent) => {
    if (
      offset &&
      first(offset) === first(event.globalPosition) &&
      last(offset) === last(event.globalPosition)
    ) {
      longPressDetected = true;
      currentEvents.onLongPress?.(event);
    }
  }, longPressDurationMs);

  const cancelEvent = () => {
    if (initialEvent !== null && !canceled) {
      canceled = true;
    }
  };

  const getCommonEvent = (): GestureEvent => ({
    globalPosition: offset!,
    localPosition: [
      first(offset!) - first(elementTopLeft!),
      last(offset!) - last(elementTopLeft!),
    ],
    sourceTimestamp: Date.now(),
  });

  const onStart = (event: TouchEvent | MouseEvent) => {
    if (!element) return;

    let kind: EventKind;
    const elementRect = element.getBoundingClientRect();
    elementTopLeft = [elementRect.x, elementRect.y];

    if (isTouchEvent(event)) {
      kind = 'touch';
      const touch = event.changedTouches[0];
      offset = [touch.clientX, touch.clientY];
    } else {
      kind = 'mouse';
      offset = [event.clientX, event.clientY];
    }

    initialEvent = getCommonEvent();
    const callbackEvent = { ...initialEvent, kind };

    if (currentEvents.onLongPress) {
      longPressTimeout(callbackEvent);
    }

    currentEvents.onTapDown?.(callbackEvent);
  };

  const onUpdate = (event: TouchEvent | MouseEvent) => {
    if (initialEvent === null) return;

    if (canceled) {
      onEnd(event);
      canceled = false;
      return;
    }

    let kind: EventKind;
    let newOffset: Offset = [0, 0];

    if (isTouchEvent(event)) {
      kind = 'touch';
      const touch = event.changedTouches[0];
      newOffset = [touch.clientX, touch.clientY];
    } else {
      kind = 'mouse';
      newOffset = [event.clientX, event.clientY];
    }

    const initial = initialEvent.globalPosition;
    const distance: Offset = [
      first(newOffset) - first(initial),
      last(newOffset) - last(initial),
    ];
    const delta: Offset = [
      first(newOffset) - first(offset!),
      last(newOffset) - last(offset!),
    ];

    const commonEvent = getCommonEvent();

    // Lock axis on first movement — all subsequent frames use the same axis.
    if (lockedAxis === null) {
      lockedAxis = getDominantAxis(delta);
    }

    if (lockedAxis !== null) {
      const onDragStart =
        lockedAxis === 'horizontal'
          ? currentEvents.onHorizontalDragStart
          : currentEvents.onVerticalDragStart;
      const onDragUpdate =
        lockedAxis === 'horizontal'
          ? currentEvents.onHorizontalDragUpdate
          : currentEvents.onVerticalDragUpdate;

      if (updateEvents.length === 0) {
        onDragStart?.({ ...commonEvent, kind });
      }

      const updateEvent: GestureAxisDragUpdateEvent = {
        ...commonEvent,
        delta,
        primaryDelta: getPrimaryValue(delta, lockedAxis),
        distance,
        primaryDistance: getPrimaryValue(distance, lockedAxis),
        cancel: cancelEvent,
      };

      updateEvents.push(updateEvent);
      onDragUpdate?.(updateEvent);
    }

    offset = newOffset;
  };

  const onEnd = (event: TouchEvent | MouseEvent) => {
    longPressTimeout.cancel();

    const kind: EventKind = isTouchEvent(event) ? 'touch' : 'mouse';
    const savedInitialEvent = initialEvent;
    const lastUpdateEvent = last(updateEvents) ?? null;

    updateEvents = [];
    initialEvent = null;

    const commonEvent = getCommonEvent();

    currentEvents.onTapUp?.({ ...commonEvent, kind });

    if (longPressDetected) {
      longPressDetected = false;
      currentEvents.onLongPressEnd?.(commonEvent);
    }

    if (lastUpdateEvent !== null && savedInitialEvent !== null) {
      const delta = lastUpdateEvent.delta;
      const timeDiffInSeconds =
        (commonEvent.sourceTimestamp - savedInitialEvent.sourceTimestamp) /
        1000;
      const velocity: Offset = [
        abs(first(lastUpdateEvent.distance)) / timeDiffInSeconds,
        abs(last(lastUpdateEvent.distance)) / timeDiffInSeconds,
      ];

      const axisAwareCommonEvent: GestureDragEndEvent = {
        ...commonEvent,
        delta: lastUpdateEvent.delta,
        distance: lastUpdateEvent.distance,
        velocity,
      };

      if (lockedAxis !== null) {
        const onDragEnd =
          lockedAxis === 'horizontal'
            ? currentEvents.onHorizontalDragEnd
            : currentEvents.onVerticalDragEnd;

        onDragEnd?.({
          ...axisAwareCommonEvent,
          primaryDelta: lastUpdateEvent.primaryDelta,
          primaryDistance: lastUpdateEvent.primaryDistance,
          primaryVelocity: getPrimaryValue(velocity, lockedAxis),
        });
      }

      currentEvents.onDragEnd?.(axisAwareCommonEvent);
    }

    lockedAxis = null;
  };

  const observe = () => {
    if (!element) return;

    disposables.push(
      observeDomEvent(element, 'touchstart', onStart, { passive: true }),
      observeDomEvent(element, 'touchmove', onUpdate, { passive: true }),
      observeDomEvent(element, 'touchend', onEnd, { passive: true }),
    );

    if (!useTouchEventsOnly) {
      disposables.push(
        observeDomEvent(element, 'mousedown', onStart),
        observeDomEvent(element, 'mousemove', onUpdate),
        observeDomEvent(element, 'mouseup', onEnd),
      );
    }
  };

  const unobserve = () => {
    disposables.dispose();
  };

  return {
    attach(el: HTMLElement) {
      element = el;
    },
    detach() {
      unobserve();
      element = null;
    },
    observe,
    unobserve,
    updateEvents(newEvents: Partial<GestureControllerEvents>) {
      currentEvents = { ...currentEvents, ...newEvents };
    },
  };
};
