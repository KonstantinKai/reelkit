/* eslint-disable react-hooks/exhaustive-deps */
import { type ReactElement, useReducer, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import {
  reaction,
  animate,
  type Signal,
  type Subscribable,
  type AnimatedValue,
} from '@reelkit/core';

/**
 * Subscribes to one or more reactive signals and re-renders its children
 * whenever any dependency notifies. This bridges the core signal system
 * with React's rendering cycle without causing unnecessary re-renders
 * of parent components.
 *
 * @param props.deps - Array of subscribable signals to observe.
 * @param props.children - Render function called on each signal change.
 */
export const ValueNotifierObserver = ({
  deps,
  children,
}: {
  deps: Subscribable[];
  children: () => ReactElement;
}) => {
  const rerender = useReducer(() => ({}), {})[1];

  useEffect(() => reaction(() => deps, rerender), []);

  return children();
};

/**
 * Observes an {@link AnimatedValue} signal and drives smooth transitions
 * between values using `requestAnimationFrame`. When the signal emits a
 * value with `duration > 0`, the component interpolates from the current
 * value to the target using the core `animate` utility, calling
 * `flushSync` on each frame for immediate DOM updates.
 *
 * @param props.valueNotifier - Signal emitting animated value descriptors.
 * @param props.children - Render function receiving the current interpolated numeric value.
 */
export const AnimatedValueNotifierObserver = ({
  valueNotifier,
  children,
}: {
  valueNotifier: Signal<AnimatedValue>;
  children: (value: number) => ReactElement;
}) => {
  const valueRef = useRef(valueNotifier.value.value);
  const rerender = useReducer(() => ({}), {})[1];
  const mountedRef = useRef(false);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(
    () =>
      reaction(
        () => [valueNotifier],
        () => {
          const { value, duration, done } = valueNotifier.value;

          // Cancel any in-progress animation
          if (cancelRef.current) {
            cancelRef.current();
            cancelRef.current = null;
          }

          if (duration > 0) {
            cancelRef.current = animate({
              from: valueRef.current,
              to: value,
              duration,
              onUpdate: (v) => {
                valueRef.current = v;
                if (mountedRef.current) {
                  flushSync(rerender);
                }
              },
              onComplete: () => {
                cancelRef.current = null;
                // Move done to next task cycle
                setTimeout(() => done?.(), 0);
              },
            });
            return;
          }

          valueRef.current = value;
          requestAnimationFrame(() => {
            if (mountedRef.current) {
              flushSync(rerender);
            }
          });
        },
      ),
    [],
  );

  return children(valueRef.current);
};

export type { AnimatedValue };
