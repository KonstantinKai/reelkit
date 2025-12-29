import * as React from 'react';
import { flushSync } from 'react-dom';
import createBezierEasing from 'bezier-easing';
import { Listenable } from '../foundation/Listenable';
import { notifiersReaction, ValueNotifier } from '../foundation/ValueNotifier';
import useEffectOnce from '../hooks/useEffectOnce';
import { timeout } from '../hooks/useTimeout';
import useMountedRef from '../hooks/useMountedRef';
import { clamp, lerp } from '../utils/number';

export const ValueNotifierObserver = ({
  deps,
  children,
}: {
  deps: Listenable[];
  children: () => React.ReactElement;
}) => {
  const rerender = React.useReducer(() => ({}), {})[1];

  useEffectOnce(() => notifiersReaction(() => deps, rerender));

  return children();
};

export type AnimatedValue = {
  value: number;
  duration: number;
  done?: () => void;
};

// easeInOut bezier curve
let easingInstance: ReturnType<typeof createBezierEasing> | null = null;
const getEasing = () => {
  if (easingInstance === null) {
    easingInstance = createBezierEasing(0.4, 0, 0.2, 1);
  }
  return easingInstance;
};

export const AnimatedValueNotifierObserver = ({
  valueNotifier,
  children,
}: {
  valueNotifier: ValueNotifier<AnimatedValue>;
  children: (value: number) => React.ReactElement;
}) => {
  const valueRef = React.useRef(valueNotifier.value.value);
  const rerender = React.useReducer(() => ({}), {})[1];
  const mountedRef = useMountedRef();

  useEffectOnce(() =>
    notifiersReaction(
      () => [valueNotifier],
      () => {
        const { value, duration, done } = valueNotifier.value;

        if (duration > 0) {
          let starttime: number | undefined;
          const start = valueRef.current;
          const end = value;
          // NOTE: very important move done to the next task cycle
          const finish = timeout(done ?? (() => {}), 0);
          const anim = (timestamp: number) => {
            starttime ??= timestamp;

            const runtime = timestamp - starttime;
            const relativeProgress = getEasing()(clamp(runtime / duration, 0, 1));

            valueRef.current = lerp(relativeProgress, start, end);

            if (mountedRef.current) {
              flushSync(rerender);
            }

            if (runtime < duration) {
              requestAnimationFrame(anim);
              return;
            }

            if (typeof done === 'function') {
              finish();
            }
          };

          requestAnimationFrame(anim);
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
  );

  return children(valueRef.current);
};
