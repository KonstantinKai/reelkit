import { MutableRefObject, useCallback, useRef } from 'react';
import {
  createGestureController,
  type GestureControllerEvents,
  type GestureController,
} from '@reelkit/core';
import { useEffectiveRef } from './useEffectiveRef';
import { useIsomorphLayoutEffect } from './useIsomorphLayoutEffect';

export interface UseGesturesProps<E extends HTMLElement> extends GestureControllerEvents {
  ref?: MutableRefObject<E | null>;
  autoObserve?: boolean;
  useTouchEventsOnly?: boolean;
}

export interface UseGesturesResult<E extends HTMLElement> {
  ref: MutableRefObject<E | null>;
  observe: () => void;
  unobserve: () => void;
}

const useGestures = <E extends HTMLElement>(
  props: UseGesturesProps<E>
): UseGesturesResult<E> => {
  const ref = useEffectiveRef(props.ref);
  const { useTouchEventsOnly = false, autoObserve = true } = props;

  const controllerRef = useRef<GestureController | null>(null);

  // Create controller on first render
  if (controllerRef.current === null) {
    controllerRef.current = createGestureController(
      { useTouchEventsOnly },
      {
        onLongPress: props.onLongPress,
        onLongPressEnd: props.onLongPressEnd,
        onTapDown: props.onTapDown,
        onTapUp: props.onTapUp,
        onHorizontalDragStart: props.onHorizontalDragStart,
        onHorizontalDragUpdate: props.onHorizontalDragUpdate,
        onHorizontalDragEnd: props.onHorizontalDragEnd,
        onVerticalDragStart: props.onVerticalDragStart,
        onVerticalDragUpdate: props.onVerticalDragUpdate,
        onVerticalDragEnd: props.onVerticalDragEnd,
        onDragEnd: props.onDragEnd,
      }
    );
  }

  // Update events on each render
  controllerRef.current.updateEvents({
    onLongPress: props.onLongPress,
    onLongPressEnd: props.onLongPressEnd,
    onTapDown: props.onTapDown,
    onTapUp: props.onTapUp,
    onHorizontalDragStart: props.onHorizontalDragStart,
    onHorizontalDragUpdate: props.onHorizontalDragUpdate,
    onHorizontalDragEnd: props.onHorizontalDragEnd,
    onVerticalDragStart: props.onVerticalDragStart,
    onVerticalDragUpdate: props.onVerticalDragUpdate,
    onVerticalDragEnd: props.onVerticalDragEnd,
    onDragEnd: props.onDragEnd,
  });

  const observe = useCallback(() => {
    if (ref.current && controllerRef.current) {
      controllerRef.current.attach(ref.current);
      controllerRef.current.observe();
    }
  }, []);

  const unobserve = useCallback(() => {
    controllerRef.current?.unobserve();
  }, []);

  useIsomorphLayoutEffect(() => {
    if (autoObserve) {
      observe();
      return () => {
        controllerRef.current?.detach();
      };
    }
    return;
  }, [autoObserve]);

  return { ref, observe, unobserve };
};

export default useGestures;
