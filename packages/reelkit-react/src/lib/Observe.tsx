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
 * @param props.signals - Array of subscribable signals to observe.
 * @param props.children - Render function called on each signal change.
 */
export const Observe = ({
  signals,
  children,
}: {
  signals: Subscribable[];

  children: () => ReactElement | null;
}) => {
  const rerender = useReducer(() => ({}), {})[1];

  useEffect(() => reaction(() => signals, rerender), []);

  return children();
};

/**
 * Observes an {@link AnimatedValue} signal and drives smooth transitions
 * between values using `requestAnimationFrame`. When the signal emits a
 * value with `duration > 0`, the component interpolates from the current
 * value to the target using the core `animate` utility, calling
 * `flushSync` on each frame for immediate DOM updates.
 *
 * @param props.signal - Signal emitting animated value descriptors.
 * @param props.children - Render function receiving the current interpolated numeric value.
 */
export const AnimatedObserve = ({
  signal,
  children,
}: {
  signal: Signal<AnimatedValue>;

  children: (value: number) => ReactElement;
}) => {
  const valueRef = useRef(signal.value.value);
  const rerender = useReducer(() => ({}), {})[1];
  const mountedRef = useRef(false);
  const cancelRef = useRef<(() => void) | null>(null);
  const pendingDoneRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(
    () =>
      reaction(
        () => [signal],
        () => {
          const { value, duration, done } = signal.value;

          // Cancel any in-progress animation
          if (cancelRef.current) {
            cancelRef.current();
            cancelRef.current = null;

            // Resolve the canceled animation's done callback so any
            // awaiting promise (e.g. goTo deferred) doesn't hang forever
            const prevDone = pendingDoneRef.current;
            if (prevDone) {
              pendingDoneRef.current = undefined;
              setTimeout(() => prevDone(), 0);
            }
          }

          if (duration > 0) {
            pendingDoneRef.current = done;
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
                pendingDoneRef.current = undefined;
                // Move done to next task cycle
                setTimeout(() => done?.(), 0);
              },
            });
            return;
          }

          pendingDoneRef.current = undefined;
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
