import * as React from 'react';
import useGestures, {
  GestureAxisDragUpdateEvent,
  GestureDragEndEvent,
} from './hooks/useGestures';
import useNavKeyboardKeys from './hooks/useNavKeyboardKeys';
import { Completer } from './foundation/Completer';
import { FnExtender } from './foundation/FnExtender';
import useMountedRef from './hooks/useMountedRef';
import useEffectOnce from './hooks/useEffectOnce';
import {
  ComputedValueNotifier,
  makeComputedValueNotifier,
  makeValueNotifier,
  ValueNotifier,
} from './foundation/ValueNotifier';
import { AnimatedValueNotifierObserver, AnimatedValue, ValueNotifierObserver } from './components/ValueNotifierObserver';
import useDepsDidChangeEffect from './hooks/useDepsDidChangeEffect';
import { clamp, extractRange, isNegative, abs } from './utils/number';
import { first, last, isEmpty } from './utils/array';

const _kDefaultTransitionDuration = 300;

export interface OneItemSliderProps {
  count: number;
  itemBuilder: (index: number, indexInRange: number, size: [number, number]) => React.ReactElement;
  apiRef?: React.MutableRefObject<OneItemSliderPublicApi | null> | ((api: OneItemSliderPublicApi) => void);

  /**
   * @default 0
   */
  initialIndex?: number;
  size: [number, number];
  direction?: 'horizontal' | 'vertical';

  /**
   * Transition duration in milliseconds
   * @default 300
   */
  transitionDuration?: number;

  /**
   * A value between 0 and 1, a distance which finger should be slides
   *
   * @default 0.12
   */
  swipeDistanceFactor?: number;

  loop?: boolean;

  useNavKeys?: boolean;

  afterChange?: (index: number, indexInRange: number) => void;
  beforeChange?: (index: number, nextIndex: number, indexInRange: number) => void;
  keyExtractor?: (index: number, indexInRange: number) => string;
  onSlideDragStart?: (index: number) => void;
  onSlideDragCanceled?: (index: number) => void;
  onSlideDragEnd?: () => void;
  rangeExtractor?: (current: number, count: number, loop: boolean) => number[];

  /**
   * Optional className for the root element
   */
  className?: string;

  /**
   * Optional style for the root element
   */
  style?: React.CSSProperties;

  /**
   * Optional children to render after the slider content
   */
  children?: React.ReactNode;
}

const defaultKeyExtractor: NonNullable<OneItemSliderProps['keyExtractor']> = (index) => index.toString();

export const defaultRangeExtractor: NonNullable<OneItemSliderProps['rangeExtractor']> = (current, count, loop) =>
  extractRange(count, current, current, 1, loop);

export const createDefaultKeyExtractorForLoop =
  (count: number, keyPrefix?: string): NonNullable<OneItemSliderProps['keyExtractor']> =>
  (index: number, indexInRange: number) => {
    const key = `${keyPrefix ?? ''}${index}`;

    /**
     * Handles case with duplicating keys
     */
    if (count === 2 && [0, 1].includes(index) && indexInRange === 0) {
      return `${key}_cloned`;
    }

    return key;
  };

export interface OneItemSliderPublicApi {
  next: () => void;
  prev: () => void;
  adjust: () => void;
  observe: () => void;
  unobserve: () => void;
}

const Element = ({
  rangeExtractor = defaultRangeExtractor,
  initialIndex = 0,
  direction = 'vertical',
  swipeDistanceFactor = 0.12,
  loop = false,
  keyExtractor = defaultKeyExtractor,
  useNavKeys = true,
  transitionDuration = _kDefaultTransitionDuration,
  ...props
}: OneItemSliderProps) => {
  const propsRef = React.useRef<OneItemSliderProps>(null as unknown as OneItemSliderProps);
  propsRef.current = { ...props, rangeExtractor, initialIndex, direction, swipeDistanceFactor, loop, keyExtractor, useNavKeys, transitionDuration };

  const { size, apiRef: forwardedRef } = props;

  const [axisValue, index, indexes, local] = React.useState(() => [
    makeValueNotifier({ value: 0, duration: 0 } as AnimatedValue),
    makeValueNotifier(initialIndex),
    makeComputedValueNotifier(
      () => rangeExtractor(index.value, propsRef.current.count, propsRef.current.loop ?? false),
      () => [index],
    ),
    {
      rangeIndex: () => indexes.value.indexOf(index.value),
      setAxisValueForCurrentRangeIndex: (duration = 0, done?: () => void) => {
        axisValue.value = { value: local.rangeIndex() * primarySizeRef.current * -1, duration, done };
      },
      runTransition: (before: () => Completer<void>) => before().promise,
      changeIndex: async (increment: -1 | 1, primarySize: number) => {
        unobserve();

        const inds = indexes.value;

        const nextRangeIndex = clamp(local.rangeIndex() + increment, 0, inds.length - 1);
        const nextIndex = inds[nextRangeIndex];

        if (typeof propsRef.current.beforeChange === 'function') {
          new FnExtender(propsRef.current.beforeChange).runWrapped(index.value, nextIndex, local.rangeIndex());
        }

        await local.runTransition(() => {
          const completer = new Completer<void>();
          axisValue.value = {
            value: nextRangeIndex * primarySize * -1,
            duration: propsRef.current.transitionDuration ?? _kDefaultTransitionDuration,
            done: () => completer.complete(),
          };
          return completer;
        });

        if (!mountedRef.current) {
          return;
        }

        [
          index.changeWithManualNotifier(nextIndex),
          axisValue.changeWithManualNotifier({ value: local.rangeIndex() * primarySize * -1, duration: 0 }),
        ].forEach((notify) => notify());

        observe();
      },
    },
  ])[0] as [
    ValueNotifier<AnimatedValue>,
    ValueNotifier<number>,
    ComputedValueNotifier<number[]>,
    {
      rangeIndex: () => number;
      setAxisValueForCurrentRangeIndex: (duration?: number, done?: () => void) => void;
      runTransition: (before: () => Completer<void>) => Promise<void>;
      changeIndex: (value: -1 | 1, primarySize: number) => Promise<void>;
    },
  ];

  const primarySizeRef = React.useRef<number>(null as unknown as number);
  const isHorizontal = direction === 'horizontal';
  const primarySize = isHorizontal ? first(size) : last(size);
  primarySizeRef.current = primarySize;

  const mountedRef = useMountedRef();
  const cancelTransitionRef = React.useRef(true);
  const primarySizeDidChangeRef = React.useRef(false);

  const getIsFirstOrLast = React.useCallback((inds: number[], increment: -1 | 1): boolean => {
    if (inds.length === 1) return true;

    return (
      inds.length === 2 &&
      ((local.rangeIndex() === 0 && increment === -1) || (local.rangeIndex() === 1 && increment === 1))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAxisAwareDragEnd = React.useCallback(
    async (event: GestureDragEndEvent) => {
      const key = isHorizontal ? 0 : 1;
      const necessaryDistance = primarySizeRef.current * swipeDistanceFactor;
      const distanceValue = key === 0 ? first(event.distance) : last(event.distance);
      const velocityValue = key === 0 ? first(event.velocity) : last(event.velocity);
      const increment = isNegative(distanceValue) ? 1 : -1;
      const isFirstOrLast = getIsFirstOrLast(indexes.value, increment);

      if (
        !isFirstOrLast &&
        (abs(distanceValue) > necessaryDistance ||
          (velocityValue > 1400 && abs(distanceValue) > necessaryDistance / 2))
      ) {
        local.changeIndex(increment, primarySizeRef.current).then(() => {
          if (primarySizeDidChangeRef.current) {
            local.setAxisValueForCurrentRangeIndex();
          }
        });

        cancelTransitionRef.current = false;
      }

      if (typeof propsRef.current.onSlideDragEnd === 'function') {
        new FnExtender(propsRef.current.onSlideDragEnd).runWrapped();
      }

      if (cancelTransitionRef.current) {
        await local.runTransition(() => {
          const completer = new Completer<void>();
          local.setAxisValueForCurrentRangeIndex(transitionDuration, () => completer.complete());
          return completer;
        });

        if (primarySizeDidChangeRef.current) {
          local.setAxisValueForCurrentRangeIndex();
        }

        if (typeof propsRef.current.onSlideDragCanceled === 'function') {
          new FnExtender(propsRef.current.onSlideDragCanceled).runWrapped(index.value);
        }
      }

      cancelTransitionRef.current = true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [swipeDistanceFactor, isHorizontal, transitionDuration],
  );

  const onDragUpdate = React.useCallback(
    (event: GestureAxisDragUpdateEvent) => {
      axisValue.value = { value: axisValue.value.value + event.primaryDelta, duration: 0 };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [swipeDistanceFactor],
  );

  const onMainAxisDragStart = React.useCallback(() => {
    if (typeof propsRef.current.onSlideDragStart === 'function') {
      new FnExtender(propsRef.current.onSlideDragStart).runWrapped(index.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { ref, observe, unobserve } = useGestures<HTMLDivElement>({
    autoObserve: true,
    onHorizontalDragStart: isHorizontal ? onMainAxisDragStart : undefined,
    onHorizontalDragUpdate: isHorizontal ? onDragUpdate : undefined,
    onVerticalDragStart: !isHorizontal ? onMainAxisDragStart : undefined,
    onVerticalDragUpdate: !isHorizontal ? onDragUpdate : undefined,
    onDragEnd: onAxisAwareDragEnd,
    useTouchEventsOnly: true,
  });

  const throttleRef = React.useRef<number | null>(null);
  const onKeyDown = useNavKeyboardKeys(
    React.useCallback(
      (key) => {
        // Simple throttle
        const now = Date.now();
        if (throttleRef.current && now - throttleRef.current < 1000) {
          return;
        }
        throttleRef.current = now;

        let increment: -1 | 1 | null = null;
        if (isHorizontal) {
          if (key === 'left') increment = -1;
          if (key === 'right') increment = 1;
        } else {
          if (key === 'up') increment = -1;
          if (key === 'down') increment = 1;
        }

        if (increment === null) return;

        const isFirstOrLast = getIsFirstOrLast(indexes.value, increment);
        if (!isFirstOrLast) {
          local.changeIndex(increment, primarySize);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [isHorizontal, primarySize],
    ),
  );

  const itemBuilder = React.useCallback(
    (i: number, indexInRange: number) => (
      <div
        key={keyExtractor(i, indexInRange)}
        data-index={i}
      >
        {props.itemBuilder(i, indexInRange, size)}
      </div>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [keyExtractor, props.itemBuilder, size],
  );

  const observeKeyDown = React.useCallback(() => window.addEventListener('keydown', onKeyDown), [onKeyDown]);
  const unObserveKeyDown = React.useCallback(() => window.removeEventListener('keydown', onKeyDown), [onKeyDown]);

  useEffectOnce(() => {
    if (typeof propsRef.current.afterChange === 'function') {
      return index.observe(() => {
        new FnExtender(propsRef.current.afterChange!).runWrapped(index.value, local.rangeIndex());
      });
    }
  });

  useEffectOnce(local.setAxisValueForCurrentRangeIndex);

  useDepsDidChangeEffect(() => {
    primarySizeDidChangeRef.current = true;
  }, [primarySize]);

  React.useEffect(() => {
    if (forwardedRef !== undefined && forwardedRef !== null) {
      const publicApi: OneItemSliderPublicApi = {
        next: () => {
          if (!getIsFirstOrLast(indexes.value, 1)) local.changeIndex(1, primarySizeRef.current);
        },
        prev: () => {
          if (!getIsFirstOrLast(indexes.value, -1)) local.changeIndex(-1, primarySizeRef.current);
        },
        adjust: local.setAxisValueForCurrentRangeIndex,
        observe: () => {
          if (useNavKeys) {
            observeKeyDown();
          }

          observe();
        },
        unobserve: () => {
          if (useNavKeys) {
            unObserveKeyDown();
          }

          unobserve();
        },
      };

      if (typeof forwardedRef === 'function') {
        new FnExtender(forwardedRef).runWrapped(publicApi);
      } else {
        forwardedRef.current = publicApi;
      }
    }

    if (useNavKeys) {
      observeKeyDown();
      return unObserveKeyDown;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useNavKeys, onKeyDown]);

  const rootStyle: React.CSSProperties = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    position: 'relative',
    overflow: 'hidden',
    width: first(size),
    height: last(size),
    ...props.style,
  };

  return (
    <div
      ref={ref}
      className={props.className}
      style={rootStyle}
    >
      <ValueNotifierObserver deps={[indexes]}>
        {() => (
          <Content
            primarySize={primarySize}
            isHorizontal={isHorizontal}
            axisValue={axisValue}
            length={indexes.value.length}
          >
            {indexes.value.map(itemBuilder)}
          </Content>
        )}
      </ValueNotifierObserver>
      {props.children}
    </div>
  );
};

export const OneItemSlider = React.memo(
  Element,
  (prev, next) =>
    prev.count === next.count &&
    prev.itemBuilder === next.itemBuilder &&
    prev.keyExtractor === next.keyExtractor &&
    first(prev.size) === first(next.size) &&
    last(prev.size) === last(next.size) &&
    prev.beforeChange === next.beforeChange &&
    prev.afterChange === next.afterChange &&
    prev.onSlideDragStart === next.onSlideDragStart &&
    prev.onSlideDragCanceled === next.onSlideDragCanceled &&
    prev.useNavKeys === next.useNavKeys,
);

const Content = React.memo(
  ({
    children,
    isHorizontal,
    primarySize,
    axisValue,
    length,
  }: {
    children: React.ReactNode;
    isHorizontal: boolean;
    primarySize: number;
    axisValue: ValueNotifier<AnimatedValue>;
    length: number;
  }) => (
    <AnimatedValueNotifierObserver valueNotifier={axisValue}>
      {(value) => (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            transform: `translate${isHorizontal ? 'X' : 'Y'}(${value}px)`,
            flexDirection: isHorizontal ? 'row' : 'column',
            [isHorizontal ? 'width' : 'height']: length * primarySize,
            [isHorizontal ? 'height' : 'width']: '100%',
          }}
        >
          {children}
        </div>
      )}
    </AnimatedValueNotifierObserver>
  ),
);

export default OneItemSlider;
