/* eslint-disable @typescript-eslint/no-empty-function */
import * as React from 'react';
import { flushSync } from 'react-dom';
import {
  reaction,
  animate,
  type Signal,
  type Subscribable,
  type AnimatedValue,
} from '@reelkit/core';
import useEffectOnce from '../hooks/useEffectOnce';
import useMountedRef from '../hooks/useMountedRef';

export const ValueNotifierObserver = ({
  deps,
  children,
}: {
  deps: Subscribable[];
  children: () => React.ReactElement;
}) => {
  const rerender = React.useReducer(() => ({}), {})[1];

  useEffectOnce(() => reaction(() => deps, rerender));

  return children();
};

export const AnimatedValueNotifierObserver = ({
  valueNotifier,
  children,
}: {
  valueNotifier: Signal<AnimatedValue>;
  children: (value: number) => React.ReactElement;
}) => {
  const valueRef = React.useRef(valueNotifier.value.value);
  const rerender = React.useReducer(() => ({}), {})[1];
  const mountedRef = useMountedRef();
  const cancelRef = React.useRef<(() => void) | null>(null);

  useEffectOnce(() =>
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
      }
    )
  );

  return children(valueRef.current);
};

export type { AnimatedValue };
