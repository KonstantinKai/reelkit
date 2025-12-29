import { MutableRefObject, useCallback, useRef } from 'react';
import { useDisposableList } from './useDisposableList';
import { observeDomEvent } from '../utils/observeDomEvent';
import { useEffectiveRef } from './useEffectiveRef';
import { useIsomorphLayoutEffect } from './useIsomorphLayoutEffect';
import useTimeout from './useTimeout';
import { abs, first, last } from '../utils';

const _kLongPressDurationMs = 800;

type Offset = [x: number, y: number];
type EventKind = 'touch' | 'mouse';

interface GestureEvent {
  globalPosition: Offset;
  localPosition: Offset;
  sourceTimestamp: number;
}

export interface GestureCommonEvent extends GestureEvent {
  kind: EventKind;
}

export interface GestureAxisDragUpdateEvent extends GestureEvent {
  delta: Offset;
  distance: Offset;
  primaryDelta: number;
  primaryDistance: number;
  cancel: () => void;
}

export interface GestureAxisDragEndEvent extends Omit<GestureAxisDragUpdateEvent, 'cancel'> {
  velocity: Offset;
  primaryVelocity: number;
}

type CommonDragEndEventOmitedKeys = 'primaryDelta' | 'primaryDistance' | 'primaryVelocity';
export interface GestureDragEndEvent extends Omit<GestureAxisDragEndEvent, CommonDragEndEventOmitedKeys> {}

export interface UseGesturesProps<E extends HTMLElement> {
  ref?: MutableRefObject<E>;
  autoObserve?: boolean;
  useTouchEventsOnly?: boolean;
  onLongPress?: (event: GestureCommonEvent) => void;
  onLongPressEnd?: (event: GestureEvent) => void;
  onTapDown?: (event: GestureCommonEvent) => void;
  onTapUp?: (event: GestureCommonEvent) => void;
  onHorizontalDragStart?: (event: GestureCommonEvent) => void;
  onHorizontalDragUpdate?: (event: GestureAxisDragUpdateEvent) => void;
  onHorizontalDragEnd?: (event: GestureAxisDragEndEvent) => void;
  onVerticalDragStart?: (event: GestureCommonEvent) => void;
  onVerticalDragUpdate?: (event: GestureAxisDragUpdateEvent) => void;
  onVerticalDragEnd?: (event: GestureAxisDragEndEvent) => void;
  onDragEnd?: (event: GestureDragEndEvent) => void;
}

export interface UseGesturesResult<E extends HTMLElement> {
  ref: MutableRefObject<E | null>;
  observe: () => void;
  unobserve: () => void;
}

const resolveTouchEvent = (event: unknown): event is TouchEvent =>
  event !== null && typeof event === 'object' && 'changedTouches' in event;

const useGestures = <E extends HTMLElement>(props: UseGesturesProps<E>): UseGesturesResult<E> => {
  const ref = useEffectiveRef(props);
  const { push, dispose } = useDisposableList();
  const { useTouchEventsOnly = false } = props;
  const autoObserve = props.autoObserve ?? true;
  const canceledRef = useRef(false);
  const initialEventRef = useRef<GestureEvent | null>(null);
  const offsetRef = useRef<Offset | null>(null);
  const elementTopLeft = useRef<Offset | null>(null);
  const updateEventsRef = useRef<GestureAxisDragUpdateEvent[]>([]);
  const longPressDetectedRef = useRef(false);
  const callbacksRefs = useRef<Omit<UseGesturesProps<E>, 'ref' | 'autoObserve'>>({});

  callbacksRefs.current.onHorizontalDragStart = props.onHorizontalDragStart;
  callbacksRefs.current.onHorizontalDragUpdate = props.onHorizontalDragUpdate;
  callbacksRefs.current.onHorizontalDragEnd = props.onHorizontalDragEnd;
  callbacksRefs.current.onVerticalDragStart = props.onVerticalDragStart;
  callbacksRefs.current.onVerticalDragUpdate = props.onVerticalDragUpdate;
  callbacksRefs.current.onVerticalDragEnd = props.onVerticalDragEnd;
  callbacksRefs.current.onLongPress = props.onLongPress;
  callbacksRefs.current.onLongPressEnd = props.onLongPressEnd;
  callbacksRefs.current.onDragEnd = props.onDragEnd;
  callbacksRefs.current.onTapDown = props.onTapDown;
  callbacksRefs.current.onTapUp = props.onTapUp;

  const [onLongPress, cancelOnLongPress] = useTimeout(
    useCallback((event: GestureCommonEvent) => {
      if (
        offsetRef.current &&
        first(offsetRef.current) === first(event.globalPosition) &&
        last(offsetRef.current) === last(event.globalPosition)
      ) {
        longPressDetectedRef.current = true;
        callbacksRefs.current.onLongPress?.(event);
      }
    }, []),
    _kLongPressDurationMs,
  );

  const cancelEvent = useCallback(() => {
    if (initialEventRef.current !== null && !canceledRef.current) {
      canceledRef.current = true;
    }
  }, []);

  const getCommonEvent = useCallback(
    () =>
      ({
        globalPosition: offsetRef.current,
        localPosition: [
          first(offsetRef.current!) - first(elementTopLeft.current!),
          last(offsetRef.current!) - last(elementTopLeft.current!),
        ],
        sourceTimestamp: new Date().getTime(),
      } as GestureEvent),
    [],
  );

  const onStart = useCallback((event: TouchEvent | MouseEvent) => {
    let kind: EventKind;
    const elementRect = ref.current!.getBoundingClientRect();
    elementTopLeft.current = [elementRect.x, elementRect.y];

    if (resolveTouchEvent(event)) {
      kind = 'touch';
      const touch = event.changedTouches[0];
      offsetRef.current = [touch.clientX, touch.clientY];
    } else {
      kind = 'mouse';
      offsetRef.current = [event.clientX, event.clientY];
    }

    initialEventRef.current = getCommonEvent();
    const callbackEvent = { ...initialEventRef.current, kind };

    if (typeof callbacksRefs.current.onLongPress === 'function') {
      onLongPress(callbackEvent);
    }

    if (typeof callbacksRefs.current.onTapDown === 'function') {
      callbacksRefs.current.onTapDown(callbackEvent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onUpdate = useCallback((event: TouchEvent | MouseEvent) => {
    if (initialEventRef.current === null) {
      return;
    }

    if (canceledRef.current) {
      onEnd(event);
      canceledRef.current = false;
      return;
    }

    let kind: EventKind;
    let offset: Offset = [0, 0];
    if (resolveTouchEvent(event)) {
      kind = 'touch';
      const touch = event.changedTouches[0];
      offset = [touch.clientX, touch.clientY];
    } else {
      kind = 'mouse';
      offset = [event.clientX, event.clientY];
    }

    const initial = initialEventRef.current.globalPosition;
    const distance: Offset = [first(offset) - first(initial), last(offset) - last(initial)];
    const delta: Offset = [first(offset) - first(offsetRef.current!), last(offset) - last(offsetRef.current!)];

    const commonEvent = getCommonEvent();

    if (abs(first(delta)) > 0 && abs(first(delta)) > abs(last(delta))) {
      if (updateEventsRef.current.length === 0 && typeof callbacksRefs.current.onHorizontalDragStart === 'function') {
        callbacksRefs.current.onHorizontalDragStart({
          ...commonEvent,
          kind,
        });
      }

      const updateEvent: GestureAxisDragUpdateEvent = {
        ...commonEvent,
        delta,
        primaryDelta: first(delta),
        distance,
        primaryDistance: first(distance),
        cancel: cancelEvent,
      };

      updateEventsRef.current.push(updateEvent);

      if (typeof callbacksRefs.current.onHorizontalDragUpdate === 'function') {
        callbacksRefs.current.onHorizontalDragUpdate(updateEvent);
      }
    }

    if (abs(last(delta)) > 0 && abs(last(delta)) > abs(first(delta))) {
      if (updateEventsRef.current.length === 0 && typeof callbacksRefs.current.onVerticalDragStart === 'function') {
        callbacksRefs.current.onVerticalDragStart({
          ...commonEvent,
          kind,
        });
      }

      const updateEvent: GestureAxisDragUpdateEvent = {
        ...commonEvent,
        delta,
        primaryDelta: last(delta),
        distance,
        primaryDistance: last(distance),
        cancel: cancelEvent,
      };

      updateEventsRef.current.push(updateEvent);

      if (typeof callbacksRefs.current.onVerticalDragUpdate === 'function') {
        callbacksRefs.current.onVerticalDragUpdate(updateEvent);
      }
    }

    offsetRef.current = offset;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEnd = useCallback((event: TouchEvent | MouseEvent) => {
    cancelOnLongPress();

    const kind: EventKind = resolveTouchEvent(event) ? 'touch' : 'mouse';
    const initialEvent = initialEventRef.current;
    const lastUpdateEvent = last(updateEventsRef.current) ?? null;
    updateEventsRef.current = [];
    initialEventRef.current = null;

    const commonEvent = getCommonEvent();

    if (typeof callbacksRefs.current.onTapUp === 'function') {
      callbacksRefs.current.onTapUp({ ...commonEvent, kind });
    }

    if (longPressDetectedRef.current && typeof callbacksRefs.current.onLongPressEnd === 'function') {
      longPressDetectedRef.current = false;
      callbacksRefs.current.onLongPressEnd(commonEvent);
    }

    if (lastUpdateEvent !== null && initialEvent !== null) {
      const delta = lastUpdateEvent.delta;
      const timeDiffInSeconds = (commonEvent.sourceTimestamp - initialEvent.sourceTimestamp) / 1000;
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

      if (abs(first(delta)) > 0 && abs(first(delta)) > abs(last(delta))) {
        if (typeof callbacksRefs.current.onHorizontalDragEnd === 'function') {
          callbacksRefs.current.onHorizontalDragEnd({
            ...axisAwareCommonEvent,
            primaryDelta: lastUpdateEvent.primaryDelta,
            primaryDistance: lastUpdateEvent.primaryDistance,
            primaryVelocity: first(velocity),
          });
        }
      }

      if (abs(last(delta)) > 0 && abs(last(delta)) > abs(first(delta))) {
        if (typeof callbacksRefs.current.onVerticalDragEnd === 'function') {
          callbacksRefs.current.onVerticalDragEnd({
            ...axisAwareCommonEvent,
            primaryDelta: lastUpdateEvent.primaryDelta,
            primaryDistance: lastUpdateEvent.primaryDistance,
            primaryVelocity: last(velocity),
          });
        }
      }

      if (typeof callbacksRefs.current.onDragEnd === 'function') {
        callbacksRefs.current.onDragEnd(axisAwareCommonEvent);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const observe = useCallback(() => {
    if (ref.current === null) {
      return;
    }

    push(
      observeDomEvent(ref.current, 'touchstart', onStart),
      observeDomEvent(ref.current, 'touchmove', onUpdate),
      observeDomEvent(ref.current, 'touchend', onEnd),
    );

    if (!useTouchEventsOnly) {
      push(
        observeDomEvent(ref.current, 'mousedown', onStart),
        observeDomEvent(ref.current, 'mousemove', onUpdate),
        observeDomEvent(ref.current, 'mouseup', onEnd),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useIsomorphLayoutEffect(() => {
    if (autoObserve) {
      observe();
      return dispose;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoObserve]);

  return { ref, observe, unobserve: dispose };
};

export default useGestures;
